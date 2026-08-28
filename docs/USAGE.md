# Vogue — Usage Guide

## Prerequisites

- **Browser**: Chrome (fully supported). Brave requires shields disabled for local proof server.
- **Wallet**: Install [1AM Wallet](https://1am.xyz) Chrome extension (recommended) or Lace.
- **Docker**: Docker Desktop running for the local proof server.
- **Node.js**: v22+ for local development.

## Step 1: Start the Proof Server

```bash
docker run -d -p 6300:6300 --name midnight-proof-server midnightnetwork/proof-server:latest
```

> **Lace wallet users**: Go to Settings → Midnight → Local proof server and set it to `http://localhost:6300`.

## Step 2: Connect Your Wallet

1. Open the Vogue app at `http://localhost:5173`.
2. Click **Connect 1AM Wallet** in the top-right.
3. The 1AM browser extension popup will open — click **Approve**.
4. Your wallet address, balances (tNIGHT, tDUST), and network will appear.

### Multiple wallets installed?

If you have both 1AM and Lace installed, the app will show a wallet selection UI.
Vogue enumerates all installed wallets via the DApp Connector API — it never
hardcodes a single wallet key.

## Step 3: Fund Your Wallet (if needed)

- **1AM wallet**: Uses ProofStation fee sponsorship — **no tDUST needed** for basic transactions.
- **Lace wallet**: Requires tDUST for transaction fees. Get tDUST from the [Midnight Faucet](https://faucet.preview.midnight.network).

If you see "Insufficient tDUST balance", wait for DUST delegation to complete or
use the faucet link in the wallet modal.

## Step 4: Create a Strategy

1. Navigate to the **Strategy Builder** tab.
2. Type your strategy in plain language, e.g.:
   > "Only buy ADA, max 20% position size, 8% stop-loss, run for 30 days"
3. The AI parser extracts bounded parameters and shows a **confirm-before-commit** screen.
4. Review the parsed parameters (asset, max position %, stop-loss %, timeline).
5. Click **Commit Strategy** — the 1AM extension popup opens for signing.
6. Approve in the popup — your strategy commitment hash is recorded on-chain.

## Step 5: Execute Trades

Once a strategy is committed, click **Simulate Proven Trade** on the Overview page.
Each trade is verified against your committed strategy bounds via a ZK proof.

## What Gets Proved vs. What Stays Private

| | Public (on-chain) | Private (never leaves your device) |
|---|---|---|
| **Strategy** | Commitment hash only | Asset, position %, stop-loss %, expiry |
| **Trade** | Executed/rejected status | Trade size, portfolio value, execution price |
| **Identity** | Shielded key commitment | Wallet secret key |

## Troubleshooting

| Problem | Solution |
|---|---|
| "Proof server not running" | Start Docker: `docker run -d -p 6300:6300 midnightnetwork/proof-server:latest` |
| "1AM wallet not detected" | Install from [1am.xyz](https://1am.xyz), unlock the extension, refresh the page |
| "Insufficient tDUST" | Use the [Midnight Faucet](https://faucet.preview.midnight.network) or switch to 1AM wallet (ProofStation sponsored) |
| "Wallet UI disconnected" | Refresh the page and reconnect. Ensure only one Vogue tab is open |
| "GOOGLE_API_KEY missing" | Add `VITE_GOOGLE_API_KEY=your_key` to `.env` for AI strategy parsing |
| Brave browser issues | Disable Brave shields for localhost |
