# Product Proposal

## What is the product, and who uses it?
Vogue is a privacy-first natural-language trading agent built on Midnight. Traders describe trading strategies in plain English (e.g. "Only buy ADA, max 20% position size, 8% stop-loss, run for 30 days"), and Vogue uses Midnight Compact smart contracts and zero-knowledge proofs to cryptographically verify that every trade strictly adheres to the stated strategy without revealing strategy parameters, portfolio value, or order sizes to the public or competitors.

Target Users:
- DeFi & Algo Traders seeking privacy against front-running and MEV copy-trading.
- Crypto Funds requiring verifiable compliance without exposing alpha/proprietary trading rules.
- Retail Investors wanting natural-language strategy creation with automated ZK risk enforcement.

## Why Midnight specifically?
Transparent blockchains (Ethereum, Cardano public ledgers) force trading bots to publish strategy rules, account balances, and order sizes on-chain, exposing traders to copy-traders and sandwich/MEV attacks. Off-chain custodial AI bots force users to blindly trust third-party operators.

Midnight is uniquely suited for Vogue because:
1. Shielded State & Private Witnesses: Strategy parameters (assets, position %, stop loss %, timelines) and portfolio values remain client-side as private witnesses.
2. Compact Smart Contract Circuits: `commitStrategy` hashes bounded strategy rules on-chain once, and `executeTrade` proves each trade complies with the committed hash without revealing any private inputs.
3. Selective Disclosure: Vogue discloses only a boolean execution status (`executed`/`rejected`) to the public ledger while keeping the trading logic 100% private.

## Data Model
| Data Point | Type | Disclosed To |
|------------|------|--------------|
| Strategy Commitment Hash (`agentCommitment`) | Public ledger | Everyone |
| Trade Execution Status (`tradeStatus`) | Public ledger | Everyone |
| Total Proven Trade Counter (`tradeCount`) | Public ledger | Everyone |
| Target Token Asset (e.g. ADA, BTC, ETH) | Private witness | No one (client-side only) |
| Max Position Allocation % | Private witness | No one (client-side only) |
| Stop Loss Drawdown % | Private witness | No one (client-side only) |
| Strategy Timeline Expiry Timestamp | Private witness | No one (client-side only) |
| Portfolio Total Balance USD | Private witness | No one (client-side only) |
| Trade Execution Size USD | Private witness | No one (client-side only) |
| Secret Key (`localSecretKey`) | Private witness | No one (client-side only) |

## Mainnet Feasibility
Yes, reaching Mainnet by Level 6 is highly realistic. 
- Compact Contract (`vogue.compact`) is lightweight, modular, and compiles directly with the official `midnightnetwork/compactc` toolchain.
- Standard Midnight cryptographic primitives (`persistentHash`, `disclose`, `assert`, `Map`, `Counter`) are fully supported by Midnight SDK and Preprod testnet.
- Client-side ZK proof generation and 1AM Wallet / Lace wallet integration ensure seamless deployment from Preprod to Mainnet.
