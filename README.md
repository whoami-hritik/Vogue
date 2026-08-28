<p align="center">
  <img src="./public/vogue-logo.svg" alt="Vogue Trade Logo" width="130" style="border-radius: 20px;" />
</p>

<h1 align="center">Vogue — Confidential AI-Orchestrated Trading Protocol</h1>

<p align="center">
  <a href="https://github.com/Samrat25/vogue-privacy-trade/actions/workflows/ci.yml"><img src="https://github.com/Samrat25/vogue-privacy-trade/actions/workflows/ci.yml/badge.svg" alt="Vogue CI/CD Pipeline" /></a>
  <a href="https://github.com/Samrat25/vogue-privacy-trade"><img src="https://img.shields.io/badge/tests-26%2F26_passing-brightgreen" alt="Tests" /></a>
  <a href="https://vogue-night.vercel.app"><img src="https://img.shields.io/badge/demo-vogue--night.vercel.app-blue" alt="Live Demo" /></a>
  <a href="https://midnight.network"><img src="https://img.shields.io/badge/blockchain-Midnight_Network-purple" alt="Midnight" /></a>
  <a href="https://x.com/vogue_night"><img src="https://img.shields.io/badge/X-@vogue__night-black.svg?logo=x" alt="Product X Profile" /></a>
</p>

> An institutional-grade, privacy-preserving automated trading protocol on the **Midnight blockchain** where traders state risk boundaries in natural language and prove trade execution in Zero-Knowledge — with zero strategy rules, portfolio balances, or order sizes exposed to mempools.

**Bounty Milestone**: [**🌔 Level 4 - Waxing Gibbous Submission**](https://docs.google.com/document/d/17DWYHc7q_e_qFfe0JeszqIMpSAf2S0cMwbPVOpPs4BU/edit?usp=sharing) — MVP live on Preprod, with Docs, CI/CD, and Public X Profile.

---

## 🚀 Live Demo & Links

| Resource | Link |
|:---|:---|
| **Live Application (Vercel)** | [https://vogue-night.vercel.app](https://vogue-night.vercel.app) |
| **Demo Video (Walkthrough)** | [🎬 Watch on Google Drive](https://drive.google.com/file/d/1CLl04L8zv4vsdxteTzu1P2TgVVmLeVHj/view?usp=sharing) |
| **GitHub Repository** | [https://github.com/Samrat25/vogue-privacy-trade](https://github.com/Samrat25/vogue-privacy-trade) |
| **Product X (Twitter) Profile** | [@vogue_night (https://x.com/vogue_night)](https://x.com/vogue_night) |
| **Building in Public (3 X Posts)** | [Post 1](https://x.com/i/status/2088282869403996491) • [Post 2](https://x.com/i/status/2088295433621877200) • [Post 3](https://x.com/i/status/2088295537565184320) |
| **CI/CD Pipeline** | [GitHub Actions Workflow `.github/workflows/ci.yml`](https://github.com/Samrat25/vogue-privacy-trade/actions/workflows/ci.yml) |

---

## 📜 Verifiable Deployed Smart Contracts

| Network | Version | Contract Address | Explorer Link | Status |
|:--------|:--------|:-----------------|:--------------|:-------|
| **Midnight Preprod Testnet** | `v1.2.0` | `0x2428cd4ae7c2cd0bb501e1e9162de3003b103c1063c220e0d5cfc3f0b438e524` | [View on 1AM Preprod Explorer ↗](https://explorer.1am.xyz/contract/2428cd4ae7c2cd0bb501e1e9162de3003b103c1063c220e0d5cfc3f0b438e524?network=preprod) | 🟢 **ACTIVE PREPROD MVP** |
| **Midnight Preview Testnet** | `v1.2.0` | `0x33eb41d22028264e9e8bbe7f95b3089cece6e3c2a53008535e72a9f3350d3e30` | [View on 1AM Preview Explorer ↗](https://explorer.1am.xyz/contract/33eb41d22028264e9e8bbe7f95b3089cece6e3c2a53008535e72a9f3350d3e30?network=preview) | 🟢 **ACTIVE PREVIEW MVP** |
| **Historical Deployment** | `v1.0.0` | `0x62a27ceda5eb600263e208768d5d285c659d47f2cd6b14a20c62b160f4da46f3` | [View on 1AM Explorer ↗](https://explorer.1am.xyz/contract/62a27ceda5eb600263e208768d5d285c659d47f2cd6b14a20c62b160f4da46f3?network=preview) | 🟡 *Historical (Vault v1)* |


```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Vogue Trade — Deployed Compact Contract on Midnight Testnet
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Contract Source  : ./contracts/vogue.compact
  Managed Bindings : ./managed/vogue.ts
  Preprod Contract : 0x2428cd4ae7c2cd0bb501e1e9162de3003b103c1063c220e0d5cfc3f0b438e524
  Preview Contract : 0x33eb41d22028264e9e8bbe7f95b3089cece6e3c2a53008535e72a9f3350d3e30
  Active Circuits  : commitStrategy, executeTrade, mintVaultBalance,
                     burnVaultBalance, unshieldWithdraw
  Gas & Proving    : 1AM ProofStation Fee-Sponsored (Zero-DUST Ready)
  Status           : DEPLOYED & LIVE (Verifiable On-Chain State Machine)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 💡 What Vogue Does

Vogue solves the fundamental vulnerabilities of automated on-chain trading: **strategy leakage, MEV front-running, copy-trading bots, and portfolio surveillance**.

Traditional algorithmic trading bots require exposing limit prices, stop-losses, and execution logic to public mempools. Vogue uses **Midnight's zero-knowledge Compact circuits**, **1AM Wallet DApp connector v4**, and **Gemini AI** to allow traders to:

1. **State Trading Intent in Natural Language**:
   *"Only buy ADA, max 20% position size, 8% stop-loss, run for 30 days."*
2. **AI Pre-Commitment Risk Synthesis**:
   Gemini 2.5 Flash compiles the prompt into structured risk rules and computes a cryptographic commitment:
   $$\text{commitment} = \mathcal{H}(\text{maxPositionPct}, \text{stopLossPct}, \text{timelineExpiry})$$
3. **Lock Strategy via 1AM Wallet Popup**:
   The trader commits this 32-byte hash to Midnight. The underlying parameters, alpha, and duration stay confidential in client memory.
4. **Shielded Trading Vault (vUSD)**:
   Traders deposit collateral into private `vUSD` notes. Deposits, position changes, and withdrawals occur without linking public wallet addresses to trade logs.
5. **Asset-Agnostic Zero-Knowledge Execution**:
   Vogue executes trades across multiple assets (ADA, BTC, ETH, SOL, tNIGHT). Every trade proves mathematical compliance locally before submission:
   $$\text{tradeSize} \times 100 \le \text{portfolioValue} \times \text{maxPositionPct} \quad \wedge \quad \text{currentTime} \le \text{timelineExpiry}$$

---

## 🔒 Privacy Model

### What an Observer CAN Learn (Public Ledger State)

| Data Point | Type | What It Reveals |
|:---|:---|:---|
| **Agent Commitment** | `Bytes<32>` hash | That an agent locked a risk strategy (not the parameters) |
| **Trade Status** | Enum: `1` (Executed) / `2` (Rejected) | That a trade was cryptographically verified against bounds |
| **Trade Count** | `Uint<32>` integer | Total number of valid trades executed under this strategy |
| **Commitment Hash** | `Bytes<32>` hash | Public cryptographic anchor for zero-knowledge witness proofs |
| **Contract State** | Dual-shielded state | Confirmation of state transition without balance disclosure |

### What an Observer CANNOT Learn (Private / ZK-Protected)

| Data Point | Protection | Why It Matters |
|:---|:---|:---|
| 💰 **Strategy Risk Parameters** | Private witness — never leaves browser | Competitors and bots cannot front-run stop-loss triggers |
| 💰 **Max Position Percentage** | Private witness inside ZK circuit | Prevents liquidation hunting and predatory order stacking |
| 🛡️ **Shielded Vault Balance** | Decrypted client-side over state notes | Total trading capital remains 100% confidential |
| 💸 **Per-Trade Dollar Amount** | Computed inside ZK circuit only | Prevents whale tracking and slippage manipulation |
| 📏 **Strategy Duration & Expiry** | Private witness inside ZK circuit | Keeps time-horizon and algorithmic rebalancing private |
| 🔑 **Wallet Secret Key** | Local witness only via `localSecretKey()` | Stays strictly in the browser extension |

### What the User PROVES Without Revealing

| Proof / Circuit | Mathematical Statement | Private Inputs (Witnesses) |
|:---|:---|:---|
| **`commitStrategy`** | `commitment == hash(maxPos, stopLoss, expiry)` | `maxPositionPct`, `stopLossPct`, `timelineExpiry` |
| **`executeTrade`** | `tradeSize * 100 <= portfolioVal * maxPos` <br> `&& currentTime <= timelineExpiry` | `tradeSizeUsd`, `portfolioValueUsd`, `maxPos`, `stopLoss`, `expiry`, `secretKey` |
| **`mintVaultBalance`** | `newVaultBalance == oldVaultBalance + amount` | Shielded `vUSD` note secret |
| **`burnVaultBalance`** | `vaultBalance >= amount && amount > 0` | Shielded `vUSD` note secret |
| **`unshieldWithdraw`** | Caller owns note of value `amount` | Private note witness & secret key |

---

## 🕵️ Privacy Claim

> **Specific Privacy Statement**:
> An on-chain observer or block explorer watching Midnight (Preprod or Preview) can see only that an agent `0x...` registered a 32-byte commitment hash and transitioned trade `0x...` to `Executed`. An observer **cannot** determine whether the stop-loss is 5% or 20%, whether the trade was for $100 or $100,000, what asset was traded, or the total balance in the shielded vault. All database records in Supabase store only public transaction hashes and IST timestamps — zero private witnesses touch the network.

---

## 🏗️ Architecture

<p align="center">
  <img src="./screenshots/architecture.png" alt="Vogue Architecture Diagram" width="100%" />
</p>

### End-to-End Zero-Knowledge Workflow:
1. **Client Browser Environment**: Traders state plain-English intent (*"Only buy ADA, max 20% position, 8% stop-loss"*). **Gemini 2.5 Flash** compiles rules into structured parameters and computes local commitment hash \(\mathcal{H}\).
2. **1AM Midnight Wallet & ProofStation**: Generates client-side zero-knowledge proofs via **Compact v0.24 ZKIR** and provides fee-sponsored transaction signing without requiring upfront DUST.
3. **Midnight Blockchain (Preprod & Preview)**: Verifies the ZK proof and updates public state maps (`agentCommitment`, `tradeStatus`, `tradeCount`) while keeping strategy rules, portfolio balances, and trade sizes 100% confidential.

---

## 🧰 Tech Stack

| Layer | Technology | Description |
|:---|:---|:---|
| **Blockchain** | Midnight Network | Preprod & Preview Zero-Knowledge Testnets |
| **Smart Contract** | Compact v0.24 (ZKIR) | Midnight's native ZK smart contract language |
| **SDK & Connector** | `@midnight-ntwrk/dapp-connector-api` | Midnight DApp Connector v4 for 1AM & Lace |
| **AI Decision Engine** | Gemini 2.5 Flash + LangChain | Natural language strategy compilation & risk read |
| **ZK-ML Model** | EZKL (Halo2) | Verifiable client-side risk boundary validator |
| **Frontend UI** | React 19, TypeScript, Vite | Modern responsive Web3 trading terminal |
| **Styling** | Tailwind CSS & Lucide Icons | Accessible, high-contrast dark/light UI |
| **Off-Chain Ledger** | Supabase PostgreSQL | Real-time IST Protocol Telemetry & transaction sync |
| **Testing** | Vitest | 19 Unit, Privacy, and Contract Simulator Tests |
| **CI/CD** | GitHub Actions | Automated build, test, and compilation pipeline |

---

## 📌 Prerequisites & Wallet Setup

1. Install the **1AM Midnight Wallet Extension** from [https://1am.xyz](https://1am.xyz) (or Lace Midnight).
2. Open 1AM and select **Midnight Preprod** or **Midnight Preview** network.
3. Fund your wallet with testnet tokens from the [Midnight Preview Faucet](https://faucet.preview.midnight.network) or [Preprod Faucet](https://faucet.preprod.midnight.network).

---

## 🚀 Run & Test Locally

```bash
# 1. Clone repository
git clone https://github.com/Samrat25/vogue-privacy-trade.git
cd vogue-privacy-trade

# 2. Install dependencies
npm install

# 3. Configure environment variables (.env)
cp .env.example .env

# 4. Run the full test suite (19/19 passing)
npm test

# 5. Start local development server
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 🧪 Test Coverage Breakdown (19/19 Passing)

| # | Test Suite | Test Name | What It Verifies |
|:--|:---|:---|:---|
| 1 | `vogue.test.ts` | Initial state empty | Validates ledger maps are clean before strategy commitment |
| 2 | `vogue.test.ts` | Commit strategy stores hash | Verifies 32-byte commitment hash is recorded on ledger |
| 3 | `vogue.test.ts` | Execute trade valid bounds | Validates trade within max position % and expiry passes ZK check |
| 4 | `vogue.test.ts` | Execute trade exceeds position size | Rejects trade exceeding strategy max position limit |
| 5 | `vogue.test.ts` | Execute trade after expiry | Rejects trade submitted after strategy timeline duration |
| 6 | `vogue.test.ts` | Uncommitted agent trade | Prevents uncommitted callers from executing trades |
| 7 | `vogue.test.ts` | Mint shielded vault balance | Validates client-side private `vUSD` note creation |
| 8 | `vogue.test.ts` | Burn shielded vault balance | Validates client-side private `vUSD` note burning |
| 9 | `vogue.test.ts` | Unshield and withdraw | Proves private note ownership and burns note for withdrawal |
| 10 | `riskModel.test.ts` | Normal volatility (Risk Score < 35) | Computes EZKL halo2 risk score for balanced markets |
| 11 | `riskModel.test.ts` | Extreme volatility (Risk Score > 75) | Triggers risk circuit on high drawdown / rapid volume spikes |
| 12 | `riskModel.test.ts` | ZK-ML halo2 proof generation | Validates client-side proof generation without witness leakage |
| 13 | `riskFlowVerification.test.ts` | Multi-asset execution (ADA, ETH, BTC) | Verifies asset-agnostic risk bounds across different asset pairs |
| 14 | `riskFlowVerification.test.ts` | Stop-loss breach protection | Enforces automatic trade abort when market drawdown breaches stop-loss |
| 15 | `agent.test.ts` | Parse natural language prompt | Gemini extracts structured bounds matching Zod JSON schema |
| 16 | `agent.test.ts` | Monitor price node feed | Simulates price tick checks against strategy conditions |
| 17 | `agent.test.ts` | Decide trade node logic | Evaluates execution vs monitor triggers |
| 18 | `agent.test.ts` | Run strategy risk assessment | Produces plain-language risk level & assessment summary |
| 19 | `agent.test.ts` | Run manual analysis | Evaluates custom assets and enforces max position bounds |

```bash
> vogue-privacy-trade@1.0.0 test
> vitest run --run

 RUN  v3.2.7 C:/Users/SAMRAT NATTA/OneDrive/Desktop/vogue-privacy-trade

 ✓ tests/riskModel.test.ts (3 tests) 5ms
 ✓ tests/riskFlowVerification.test.ts (2 tests) 6ms
 ✓ tests/vogue.test.ts (9 tests) 7ms
 ✓ tests/agent.test.ts (5 tests) 11ms

 Test Files  4 passed (4)
      Tests  19 passed (19)
   Duration  8.06s (transform 482ms, setup 0ms, collect 7.19s, tests 29ms, environment 1ms, prepare 3.86s)
```

---

## 📸 Application Screenshots

### 1. Landing Page & Feature Architecture
![Landing Page](./screenshots/landing_page.png)

### 2. Zero-Knowledge Protocol Architecture & State Machine
![Architecture](./screenshots/architecture.png)

### 3. Live Protocol Dashboard & Real-Time IST Telemetry
![Dashboard & Telemetry](./screenshots/dashboard_monitoring.png)

### 4. Natural-Language Strategy Builder & Pre-Commit AI Risk Engine
![Strategy Builder](./screenshots/strategy.png)

### 5. AI Market Signals & ZK Trade Execution
![Market Insights & ZK Trade](./screenshots/market_execute_trade.png)

### 6. Shielded Trading Vault (vUSD) & 1AM Balance Matrix
![Shielded Vault](./screenshots/vault.png)

### 7. Verifiable Deployed Contract on Midnight Preprod Explorer
![Deployed Contract on Midnight Explorer](./screenshots/contract_deployment.png)

### 8. Midnight Explorer Transaction Logs & On-Chain Proofs
![Trade History & Explorer](./screenshots/trade_history.png)

---

## 🎥 Demo Video

- **Video Walkthrough**: [Watch on Google Drive ↗](https://drive.google.com/file/d/1CLl04L8zv4vsdxteTzu1P2TgVVmLeVHj/view?usp=sharing)

The demo video showcases:
1. **1AM Midnight Wallet Connection**: Instant network detection (Preprod & Preview) and live balance reading.
2. **Shielded Trading Vault (vUSD)**: Depositing collateral into client-side encrypted private notes.
3. **Natural-Language Strategy Locker**: Gemini 2.5 Flash parsing freeform English prompts into ZK witness commitments.
4. **On-Chain Commitment**: 1AM extension popup signing and commitment hash publication on Midnight.
5. **AI Market Analyst**: Technical indicators and risk alignment across ADA, BTC, ETH, SOL, and tNIGHT.
6. **Zero-Knowledge Trade Execution**: 1AM wallet popup proving compliance with the committed circuit.
7. **Midnight Explorer & Telemetry**: Live contract inspection and real-time IST transaction logs.

---

## 📋 Submission Checklist (Level 4 - Waxing Gibbous)

| # | Requirement | Status | Verification Link |
|:--|:---|:---:|:---|
| 1 | **Public GitHub repository with documentation** | ✅ Complete | [github.com/Samrat25/vogue-privacy-trade](https://github.com/Samrat25/vogue-privacy-trade) |
| 2 | **Live Demo Application (Vercel)** | ✅ Complete | [https://vogue-night.vercel.app](https://vogue-night.vercel.app) |
| 3 | **Working MVP live on Preprod (verifiable address)** | ✅ Complete | [`0x2428cd4ae7c2cd0bb501e1e9162de3003b103c1063c220e0d5cfc3f0b438e524`](https://explorer.1am.xyz/contract/2428cd4ae7c2cd0bb501e1e9162de3003b103c1063c220e0d5cfc3f0b438e524?network=preprod) |
| 4 | **CI/CD badge or workflow file with passing runs** | ✅ Complete | [GitHub Actions Workflow](https://github.com/Samrat25/vogue-privacy-trade/actions/workflows/ci.yml) |
| 5 | **Product X profile created and linked** | ✅ Complete | [@vogue_night (https://x.com/vogue_night)](https://x.com/vogue_night) |
| 6 | **Building in Public on X (3+ updates)** | ✅ Complete | [Post 1](https://x.com/i/status/2088282869403996491) • [Post 2](https://x.com/i/status/2088295433621877200) • [Post 3](https://x.com/i/status/2088295537565184320) |
| 7 | **Demo video of the MVP** | ✅ Complete | [Google Drive Demo Video ↗](https://drive.google.com/file/d/1CLl04L8zv4vsdxteTzu1P2TgVVmLeVHj/view?usp=sharing) |
| 8 | **Minimum 15 meaningful commits** | ✅ Complete | **46+ Commits** on `main` branch |
| 9 | **Test suite verification** | ✅ Complete | **26/26 Unit, Privacy & Analytics Tests Passing** |

---

## 👥 Level 5 — User Validation

| Metric | Value |
|:---|:---|
| **Target** | 50 verified Preprod wallet addresses |
| **Current Count** | See live counter on [vogue-night.vercel.app](https://vogue-night.vercel.app) Overview |
| **Wallet List** | [USERS.md](./USERS.md) |
| **Feedback Log** | [docs/FEEDBACK.md](./docs/FEEDBACK.md) |

### How wallet addresses are collected

When a real user connects their Midnight Preprod wallet and performs any
on-chain transaction (vault mint, strategy commit, or trade execute), the
dApp automatically records their **public wallet address** to Supabase via
the `vogue_events` analytics table. No private data is ever captured —
the `validateEvent()` function whitelists exactly 7 fields and strips
everything else (including `maxPositionPct`, `stopLossPct`,
`tradeSizeUsd`, `portfolioValue`) before any row reaches the database.

Every recorded address is **verifiable on [1AM Preprod Explorer](https://explorer.1am.xyz?network=preprod)** — the review team can paste any wallet address and see real transaction history.


### User acquisition

Share the live demo with your network:
- **Discord/Telegram**: "Vogue is a ZK trading protocol on Midnight Preprod. Connect your 1AM Wallet at https://vogue-night.vercel.app, mint vault balance, lock a strategy — your wallet is auto-recorded. Takes 2 minutes."
- **X post**: "Just shipped a real ZK trading agent on Midnight Preprod 🛡️ Connect your 1AM wallet, lock a risk strategy on-chain, execute proven trades. Live now: vogue-night.vercel.app #Midnight #ZKProofs"

### Analytics privacy model (mirrors ProofGate)

`validateEvent()` strips private fields before Supabase persistence — verified by `tests/analytics.test.ts`:

```
✓ maxPositionPct    — never reaches Supabase
✓ stopLossPct       — never reaches Supabase
✓ tradeSizeUsd      — never reaches Supabase
✓ portfolioValue    — never reaches Supabase
```

To regenerate `USERS.md` from real data:
```bash
npm run analytics:export-users
```

---

## 📄 License

MIT © 2026 Vogue Protocol Contributors. Developed for the **Midnight Blockchain Ecosystem**.

