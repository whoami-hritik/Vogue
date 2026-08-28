# Vogue — Full Product & Technical Documentation

*(formerly VibeTrade)*

A natural-language trading agent on Midnight: you state a strategy once,
every trade after that is cryptographically proven to still follow it —
without your strategy, portfolio, or trade sizes ever becoming public.

---

## 1. What it is

A trader describes a strategy in plain language — "only buy ADA, max 20%
position size, 8% stop-loss, run for 30 days." An AI agent parses that
into structured, bounded parameters and executes trades on the user's
behalf. Every trade is provable, via a Midnight Compact circuit, to be
consistent with the strategy the user originally committed to — without
revealing the strategy's thresholds, the portfolio size, or the exact
trade size to anyone, including the chain itself.

## 2. The problem this solves

- **Fully on-chain trading bots** — transparent, but leak the whole
  strategy and position size; competitors copy it, MEV bots front-run it.
- **Fully off-chain/custodial AI trading** (e.g. exchange-native NL
  trading bots) — private from the public, but you're trusting an
  operator's word that the agent follows the stated strategy. No
  cryptographic backing at all.
- **ZK dark pools** (Renegade, Panther, Railgun) — hide individual trade
  details well, but have no concept of an ongoing agent. Privacy is
  per-trade, not proof of behavioral consistency over time.

Vogue proves the agent followed its committed strategy across its
*entire* trading history — a cryptographic guarantee, not an operator's
promise — while keeping the strategy and portfolio completely private.

## 3. Who it's for

Retail and semi-professional traders who want algorithmic execution
without either exposing their strategy to copy-traders and
front-runners, or blindly trusting a black-box bot operator.

---

## 4. User flow & dashboard structure

### 4.1 Landing page (pre-wallet)
Public, unshielded — no ZK involved. Value prop, how-it-works explainer,
"Connect Wallet" CTA.

### 4.2 Wallet connect
Standard DApp Connector flow: enumerate `Object.values(window.midnight)`
(Lace / 1AM), never a hardcoded key. Once connected, route into the
dashboard shell.

### 4.3 Dashboard shell (persistent nav, everything lives under one roof)

- **Home / Overview** — top-line summary: active strategies, aggregate
  P&L, recent trade status feed (executed/rejected), quick market
  snapshot. This is the "one dashboard for everything" landing spot
  post-connect.
- **Market Insights** — off-chain price feed + AI-generated stock/asset
  insights. Not privacy-relevant — no ZK circuit touches this page, it's
  pure data/UI.
- **Strategy Builder** — the natural-language entry point. Trader types
  a sentence, the NLP layer parses it into bounded params, shows a
  **confirm-before-commit** screen (asset, max position %, stop-loss %,
  timeline/expiry — editable before locking in), then fires
  `commitStrategy`. This screen matters more here than in a normal app:
  a parsing error becomes an *immutable* wrong commitment once hashed.
- **Portfolio (live tracking)** — profit/loss, SIP-style running
  insights ("you're up X% over Y days"), current positions. Computed
  **entirely client-side** from the trader's own decrypted shielded
  state combined with the public price feed — this data never touches
  the chain, because portfolio value + price = a number that would leak
  position size if computed on-chain.
- **Trade History / Audit Log** — reads the public `tradeStatus` stream
  via the indexer: timestamps, executed/rejected status, running
  execution-rate stat. No strategy details, no trade sizes — just the
  provable track record.
- **Withdraw / Settings** — manual withdraw = the `unshield` operation,
  moving value from private balance back to the public wallet balance.
  Strategy management (view/update/expire) also lives here.

### 4.4 What the Midnight NLP layer specifically needs, per page

- **Strategy Builder** needs the NLP layer to output a small, *fixed*
  schema — `{ asset, maxPositionPct, stopLossPct, timelineExpiry }` —
  because the Compact circuit can only check fixed-size, bounded values.
  The parsing layer's real job is constraining freeform language into
  values the circuit can verify, not creativity.
- **Home/Overview and Market Insights** don't need the NLP layer to
  touch anything privacy-sensitive — it's just summarizing public price
  data and generating readable insights, no witness data involved.
- **Portfolio** doesn't call the NLP layer at all — it's a local
  computation over decrypted state, not a language task.

---

## 5. Architecture (shielded vs. unshielded)

```
[Natural language input] → Strategy Builder page
        ↓
[LLM parsing layer] — bounded structured params
        ↓
[Confirm-before-commit UI]
        ↓
[Strategy commitment] — params hashed LOCALLY, hash committed on-chain once (commitStrategy)
        ↓
[Trade execution] — agent re-supplies SAME strategy params (private) +
                     new trade params (private) per trade (executeTrade)
        ↓
[Compact circuit] — proves: hash(strategy params) == committed hash
                     AND trade satisfies strategy bounds
                     → discloses ONLY executed/rejected status
        ↓
[Public/unshielded ledger] — commitment hash, per-trade status, timestamps
[Private/shielded state]   — thresholds, portfolio value, trade sizes,
                              position entries — decrypted only client-side,
                              powers the Portfolio dashboard
        ↓
[Withdraw] — unshield operation: private balance note → public wallet balance
```

**Public (unshielded)**: strategy commitment hash, per-trade execution
status, timestamps, trade count.

**Private (shielded, never leaves the user's device unencrypted)**: the
actual strategy thresholds, portfolio value, individual trade sizes,
execution prices, position entries.

**What gets proven without being revealed**: that every trade, across
the agent's entire history, is consistent with the *same*
originally-committed strategy.

---

## 6. Compact contract sketch

```
pragma language_version >= 0.16 && <= 0.25;
import CompactStandardLibrary;

// ---------- PUBLIC LEDGER STATE ----------
export ledger agentCommitment: Map<Bytes<32>, Bytes<32>>;   // agentId -> strategy hash
export ledger tradeStatus: Map<Bytes<32>, Uint<8>>;         // tradeId -> 0=pending,1=executed,2=rejected
export ledger tradeCount: Counter;

// ---------- PRIVATE WITNESSES ----------
witness getStrategyAsset(): Bytes<32>;
witness getMaxPositionPct(): Uint<8>;
witness getStopLossPct(): Uint<8>;
witness getStrategyExpiry(): Uint<64>;
witness getPortfolioValue(): Uint<64>;
witness getTradeAsset(): Bytes<32>;
witness getTradeSizeUsd(): Uint<64>;
witness localSecretKey(): Bytes<32>;

// ---------- CIRCUITS ----------

// Run once per strategy: commit the parsed strategy without revealing its values
export circuit commitStrategy(agentId: Bytes<32>): [] {
  let callerId = disclose(publicKey(localSecretKey(), agentId));
  let strategyHash = disclose(
    transientHash([getStrategyAsset(), getMaxPositionPct() as Field as Bytes<32>,
                   getStopLossPct() as Field as Bytes<32>,
                   getStrategyExpiry() as Field as Bytes<32>])
  );
  agentCommitment.insert(agentId, strategyHash);
}
// NOTE: confirm transientHash (or current standard hash primitive name)
// against your installed CompactStandardLibrary version before compiling.

// Run per trade: proves the trade honors the ALREADY-committed strategy
export circuit executeTrade(agentId: Bytes<32>, tradeId: Bytes<32>, currentTime: Uint<64>): [] {
  let recomputedHash = disclose(
    transientHash([getStrategyAsset(), getMaxPositionPct() as Field as Bytes<32>,
                   getStopLossPct() as Field as Bytes<32>,
                   getStrategyExpiry() as Field as Bytes<32>])
  );
  assert(agentCommitment.lookup(agentId) == recomputedHash,
         "trade does not match committed strategy");
  assert(currentTime <= getStrategyExpiry(), "strategy timeline expired");
  assert(getTradeAsset() == getStrategyAsset(), "asset not in strategy");

  let positionPct = (getTradeSizeUsd() * (100 as Uint<64>)) / getPortfolioValue();
  assert(positionPct <= (getMaxPositionPct() as Uint<64>), "exceeds max position size");

  tradeStatus.insert(tradeId, disclose(1 as Uint<8>));
  tradeCount.increment(1);
}

// Withdraw: unshield private balance back to public wallet balance
export circuit unshieldWithdraw(agentId: Bytes<32>, amountUsd: Uint<64>): [] {
  // consumes a private balance note, emits a public transfer
  // (standard Midnight shield/unshield pattern)
}
```

---

## 7. Resources & tooling

**Compact language**
- Language overview: https://docs.midnight.network/compact
- Language reference: https://docs.midnight.network/develop/reference/compact/lang-ref
- Standard library reference: https://docs.midnight.network/develop/reference/compact/compact-std-library/
- Writing a contract (tutorial): https://docs.midnight.network/compact/writing
- Compiler & toolchain: https://docs.midnight.network/relnotes/compact
- Compact CLI dev tools: https://docs.midnight.network/relnotes/compact-tools

**Wallet & DApp connection**
- API reference hub: https://docs.midnight.network/api-reference
- DApp Connector API reference: https://docs.midnight.network/develop/reference/midnight-api/dapp-connector
- React wallet connector guide: https://docs.midnight.network/guides/react-wallet-connect
  — confirms wallets inject under a UUID key, not a fixed name; use
  `Object.values(window.midnight)` enumeration.

**Dev tooling**
- Midnight MCP server — lets an AI coding agent validate Compact code
  against the real compiler and pull live syntax references:
  https://docs.midnight.network/blog/tags/mcp
- Compatibility matrix: https://docs.midnight.network/relnotes/overview
- Preprod faucet (verify still current): https://midnight-tmnight-preprod.nethermind.dev/
- Developer hub: https://midnight.network/developer-hub

**Suggested stack**: React + Tailwind frontend, Lace/1AM wallet via
DApp Connector API, Supabase for off-chain non-sensitive data only
(never portfolio values or strategy params), Node 22 CI/CD with real
`compact compile` and vitest.

---

## 8. Staged build plan

**Level 1-3 (MVP)**: single-asset strategy, `commitStrategy` +
`executeTrade` circuits, structured-output NLP parsing with
confirm-before-commit UI, simulated/paper trade execution against a
price feed, Home/Strategy Builder/Portfolio pages.

**Level 4-6 (advanced)**: multi-asset strategies, real DEX integration,
autonomous monitoring agent (decides *when* to trade), `updateStrategy`
circuit (change a strategy without losing the provable track record),
selective-disclosure circuit for auditors/regulators, public
non-identifying reputation score (executed/rejected ratio only), full
Trade History + Withdraw pages.

---

## 9. Competitive positioning

No live Midnight dApp currently combines natural-language strategy
input, autonomous AI execution, and commit-then-prove-consistency.
What exists on Midnight today: a private stablecoin (ShieldUSD),
lending with private collateral, an automated CDP liquidation bot, and
prediction markets — adjacent, not overlapping. Off-chain, ZK dark
pools (Renegade, Panther, Railgun) solve trade privacy but have no
concept of an ongoing agent; NL trading bots (e.g. exchange-native
ones) solve natural-language input but are fully custodial with no
cryptographic backing. Vogue sits in the gap between the two.

---

## 10. Naming

**Vogue** — a foundational statement accepted as true without needing
to expose the reasoning behind it. Fits the mechanism directly: you
state a rule once (`commitStrategy`), and everything after that is
measured against it, provably, without the rule itself ever being
visible.

---

## 11. Rise In Midnight Builder Challenge — Level 4 & 5 requirements

Submission requirements from Rise In's Midnight Builder Challenge,
mapped to Vogue specifically. Only start Level 4 after the Level 3
product proposal has been approved at The Turn.

### 11.1 Midnight docs MCP (do this first, every level)

```
claude mcp add --transport http midnight-docs https://midnight.mcp.kapa.ai
```
Or browse directly: https://midnight.mcp.kapa.ai — gives live Midnight
docs inside every AI response, in addition to the Midnight MCP server
already noted in Section 7.

### 11.2 Level 4 — MVP goes live

**Required file structure:**
```
vogue/
├── contracts/
│   └── vogue.compact              # commitStrategy, executeTrade, unshieldWithdraw
├── managed/                        # auto-generated by compact compile
├── src/
│   ├── components/
│   │   ├── WalletConnect.tsx
│   │   ├── StrategyBuilder.tsx     # core privacy feature UI — the CoreFeature slot
│   │   └── Layout.tsx
│   ├── hooks/
│   │   └── useMidnight.ts
│   ├── utils/
│   │   └── contract.ts
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   └── vogue.test.ts
├── .github/workflows/ci.yml
├── docs/
│   └── USAGE.md
├── README.md
├── PROPOSAL.md                     # copied from the approved Level 3 idea
└── package.json
```

**Build order — contract before UI:**
1. Write `contracts/vogue.compact` with public ledger state
   (`agentCommitment`, `tradeStatus`, `tradeCount`), private witnesses
   for every sensitive input, `disclose()` used only where deliberately
   needed, and a top-of-file comment block explaining the privacy model
   (mirrors Section 5 above).
2. `compact compile`, then write and pass at least 3 tests.
3. Build the frontend wired to the contract — privacy behavior
   (commit → prove → status-only disclosure) must be the visible
   centerpiece, not a footnote. Needs wallet connect, circuit calls,
   loading states, error states.
4. `npm run build` — zero errors required.
5. CI: `.github/workflows/ci.yml` running install → `compact compile` →
   tests on every push to main; add the CI badge to README.
6. Deploy `vogue.compact` to Preprod (manual step — get the exact
   deploy command, run it, paste the contract address back into
   README's mandatory Contract Address table immediately).
7. `docs/USAGE.md`: what you need, step-by-step (non-technical), what
   gets proved vs. what stays private, troubleshooting.
8. `README.md` in the mandated order: tagline, live demo link,
   **Contract Address table (mandatory)**, what it does, Privacy Model
   (public / private / proved-without-revealing — reuse Section 5's
   breakdown), tech stack, prerequisites (Lace wallet, Node v22,
   Docker), setup & run locally, run tests, CI/CD, usage guide link, X
   profile placeholder.
9. 3 launch tweets: what Vogue is and why it needs Midnight; a
   technical insight about the commit-then-prove privacy model; a call
   to try the Preprod demo.

**Manual steps you still have to do**: run the Preprod deploy and paste
the address back; add the address to README; deploy the frontend
(Vercel/Netlify) and add the live URL; create the X account, post the 3
tweets, add the profile link to README; record the MVP demo video;
make 15+ meaningful commits; submit the repo on Rise In.

### 11.3 Level 5 — Users & feedback

**Adds to the file structure:**
```
vogue/
├── docs/
│   ├── USAGE.md
│   └── FEEDBACK.md
├── USERS.md
```

- `docs/FEEDBACK.md`: collection method, raw feedback log table, themes
  observed, and a "what we changed" table (change / reason / commit) —
  filled in as real feedback comes in.
- `USERS.md`: target 50 verified Preprod wallet addresses, table of
  address + date added, running count out of 50.
- User acquisition materials to prep: a sub-100-word Discord/Telegram
  message (what Vogue does, connect Lace, try Strategy Builder, demo
  link, how to send their wallet address), a sub-280-char X post, and a
  direct-message template for developer/college contacts.
- Once real feedback comes in: implement the top 2-3 improvements,
  update `docs/FEEDBACK.md`'s "What We Changed" section, update README
  if product behavior changed.
- README gets a new **Level 5 — User Validation** section: target 50,
  current count, links to `USERS.md` and `docs/FEEDBACK.md`. The
  Contract Address table from Level 4 must stay present.

**Manual steps**: share the Preprod link everywhere (Discord, X,
Telegram, college groups); collect 50 verifiable wallet addresses into
`USERS.md`; collect and log feedback; paste feedback back for
implementation help; keep the contract address current in README;
make 20+ meaningful commits; submit on Rise In.
