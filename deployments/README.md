# Vogue — Midnight Deployment Registry

This directory contains versioned deployment records for Vogue's Compact ZK circuits on Midnight testnets.

> [!IMPORTANT]
> **Contract Immutability**: Midnight contracts are immutable once deployed. Upgrades are achieved by deploying a new contract version, updating `deployments/registry.json`, and appending the deployment record below. Old versions are preserved indefinitely.

---

## Deployer / Funding Wallet

| Field | Value |
|:------|:------|
| **Deployer Wallet** | `@vogue_night` — [x.com/vogue_night](https://x.com/vogue_night) |
| **Preprod Deployment TX** | [`0x27ffe1f7a2db3a071c5f2070c9ae6de476f839d7870a6f3c4da78d326cd28645`](https://explorer.1am.xyz/tx/27ffe1f7a2db3a071c5f2070c9ae6de476f839d7870a6f3c4da78d326cd28645?network=preprod) |
| **Preprod Contract Address** | [`0x2428cd4ae7c2cd0bb501e1e9162de3003b103c1063c220e0d5cfc3f0b438e524`](https://explorer.1am.xyz/contract/2428cd4ae7c2cd0bb501e1e9162de3003b103c1063c220e0d5cfc3f0b438e524?network=preprod) |

| **Block** | `2098826` |
| **Deployed At** | `2026-08-14T11:03:00Z` |
| **Funded With** | tDUST (Midnight Preprod gas token) via the Preprod faucet |
| **Faucet Used** | [https://midnight-tmnight-preprod.nethermind.dev](https://midnight-tmnight-preprod.nethermind.dev) |

The deployer wallet is the wallet address that:
1. Received tNIGHT and tDUST from the Midnight Preprod faucet
2. Signed and funded the `deployContract` transaction for `contracts/vogue.compact`
3. Has the deployment TX `0x27ffe1...cd28645` in its 1AM wallet transaction history

All subsequent user interactions (strategy commits, vault mints, trade executions) via [vogue-night.vercel.app](https://vogue-night.vercel.app) appear as separate transactions in each user's own 1AM wallet history, linked to the same contract.

---

## Deployment Records

### Midnight Preview Testnet

| Version | Contract Address | Deployed At | Circuits | Status |
| :--- | :--- | :--- | :--- | :--- |
| `1.2.0` | `0x33eb41d22028264e9e8bbe7f95b3089cece6e3c2a53008535e72a9f3350d3e30` | 2026-08-14 | `commitStrategy`, `executeTrade`, `mintVaultBalance`, `burnVaultBalance`, `unshieldWithdraw` | **Active** |
| `1.0.0` | `0x62a27ceda5eb600263e208768d5d285c659d47f2cd6b14a20c62b160f4da46f3` | 2026-08-12 | `commitStrategy`, `executeTrade`, `unshieldWithdraw` | Historical |

### Midnight Preprod Testnet

| Version | Contract Address | Deployment TX | Block | Deployed At | Circuits | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `1.2.0` | `0x2428cd4ae7c2cd0bb501e1e9162de3003b103c1063c220e0d5cfc3f0b438e524` | `0x27ffe1f7...cd28645` | `2098826` | 2026-08-14 | `commitStrategy`, `executeTrade`, `mintVaultBalance`, `burnVaultBalance`, `unshieldWithdraw` | **Active (Verified)** |
| `1.0.0` | `0x62a27ceda5eb600263e208768d5d285c659d47f2cd6b14a20c62b160f4da46f3` | — | — | 2026-08-12 | `commitStrategy`, `executeTrade`, `unshieldWithdraw` | Historical |

---

## Deployment Commands

### Deploy to Preview
```bash
npx @midnight-ntwrk/compact-cli deploy --network preview --contract contracts/vogue.compact
```

### Deploy to Preprod
```bash
npx @midnight-ntwrk/compact-cli deploy --network preprod --contract contracts/vogue.compact
```
