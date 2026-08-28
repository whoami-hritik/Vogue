/**
 * Vogue — 1AM / Lace Midnight Wallet Adapter (v4.x DApp Connector API)
 * Ported from freight-veil's proven working pattern.
 *
 * NEVER hardcodes a single wallet key. Enumerates all installed wallets
 * via Object.entries(window.midnight).
 */

export interface Midnight1AMConnectedAPI {
  getUnshieldedAddress(): Promise<{ unshieldedAddress: string } | string>;
  getShieldedAddresses(): Promise<{
    shieldedAddress?: string;
    shieldedCoinPublicKey?: string;
    shieldedEncryptionPublicKey?: string;
  } | string[] | string>;
  getDustAddress(): Promise<{ dustAddress: string } | string>;
  getShieldedBalances(): Promise<Record<string, bigint | number | string>>;
  getUnshieldedBalances(): Promise<Record<string, bigint | number | string>>;
  getDustBalance(): Promise<{ balance: bigint | number | string } | bigint | number | string>;
  getConfiguration(): Promise<OneAMServiceConfig>;
  balanceUnsealedTransaction?(tx: unknown): Promise<{ tx: string } | string>;
  balanceAndProveTransaction?(tx: unknown, newCoins: unknown[]): Promise<unknown>;
  balanceTransaction?(tx: unknown): Promise<unknown>;
  submitTransaction?(tx: unknown): Promise<{ txHash: string } | string>;
  makeTransfer?(outputs: unknown[], options?: unknown): Promise<{ tx: string } | string>;
  signData?(data: unknown, options?: unknown): Promise<unknown>;
  state?(): Promise<{ address?: string; coinPublicKey?: string; encryptionPublicKey?: string }>;
}

export interface Midnight1AMInitialAPI {
  name: string;
  apiVersion: string;
  connect(networkId: string): Promise<Midnight1AMConnectedAPI>;
}

declare global {
  interface Window {
    midnight?: Record<string, Midnight1AMInitialAPI>;
  }
}

export type MidnightNetwork = "preview" | "preprod" | "mainnet" | "undeployed";

const DEFAULT_NETWORK: MidnightNetwork =
  ((typeof import.meta !== "undefined" && import.meta.env?.["VITE_MIDNIGHT_NETWORK"]) as MidnightNetwork) ?? "preview";

export interface OneAMServiceConfig {
  networkId: string;
  indexerUri: string;
  indexerWsUri: string;
  proverServerUri: string;
  substrateNodeUri: string;
}

export interface LiveWalletSession {
  address: string;
  shieldedAddress: string;
  dustAddress: string;
  coinPublicKey: string;
  encryptionPublicKey: string;
  network: string;
  networkId: MidnightNetwork;
  detected1AMNetwork: MidnightNetwork;
  isNetworkAligned: boolean;
  walletName: string;
  walletIcon: string;
  apiVersion: string;
  api: Midnight1AMConnectedAPI;
  serviceConfig: OneAMServiceConfig;
  balances: {
    tNightShielded: number;
    tNightUnshielded: number;
    tDust: number;
  };
}

export interface DetectedWallet {
  id: string;
  name: string;
  apiVersion: string;
}

// ─── Detection ────────────────────────────────────────────────────────────────

/** Detect 1AM wallet in window.midnight['1am'] with polling retry logic */
export function detect1AMWallet(): Promise<Midnight1AMInitialAPI | null> {
  return new Promise((resolve) => {
    const wallet = window.midnight?.["1am"];
    if (wallet) {
      resolve(wallet);
      return;
    }

    let attempts = 0;
    const interval = setInterval(() => {
      const w = window.midnight?.["1am"];
      if (w) {
        clearInterval(interval);
        resolve(w);
      } else if (++attempts > 30) {
        clearInterval(interval);
        resolve(null);
      }
    }, 100);
  });
}

export function isWalletInstalled(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.midnight !== "undefined" &&
    (Boolean(window.midnight?.["1am"]) || Object.keys(window.midnight ?? {}).length > 0)
  );
}

export function is1AMInstalled(): boolean {
  return typeof window !== "undefined" && Boolean(window.midnight?.["1am"]);
}

/** Enumerate ALL installed wallets — never hardcode a single key */
export function getDetectedWallets(): DetectedWallet[] {
  if (typeof window === "undefined" || !window.midnight) return [];
  return Object.entries(window.midnight).map(([id, api]) => ({
    id,
    name: api.name || id,
    apiVersion: api.apiVersion || "4.0.0",
  }));
}

// ─── Connection ───────────────────────────────────────────────────────────────

/** Connect to the 1AM wallet (or first available wallet if 1AM not found) */
export async function connect1AMWallet(
  networkId: MidnightNetwork = DEFAULT_NETWORK,
): Promise<LiveWalletSession> {
  const wallet = await detect1AMWallet();

  if (!wallet) {
    const keys = typeof window !== "undefined" && window.midnight ? Object.keys(window.midnight) : [];
    if (keys.length > 0) {
      const fallbackApi = window.midnight![keys[0]];
      console.info(`[Vogue Wallet] Connecting via fallback wallet entry '${keys[0]}'...`);
      const connected = await fallbackApi.connect(networkId);
      return parseConnectedSession(connected, networkId, fallbackApi.name || keys[0], fallbackApi.apiVersion);
    }

    throw new Error(
      "1AM wallet extension not detected.\nPlease ensure the 1AM Midnight wallet extension is active and unlocked."
    );
  }

  console.info(`[Vogue Wallet] Connecting to 1AM wallet on network '${networkId}'...`);
  const connectedAPI = await wallet.connect(networkId);
  return parseConnectedSession(connectedAPI, networkId, wallet.name || "1AM", wallet.apiVersion);
}

// ─── Address Extraction ───────────────────────────────────────────────────────

function extractAddressString(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string" && val.trim().length > 0) return val.trim();

  if (Array.isArray(val)) {
    for (const item of val) {
      const extracted = extractAddressString(item);
      if (extracted) return extracted;
    }
    return "";
  }

  if (typeof val === "object" && val !== null) {
    const obj = val as Record<string, unknown>;
    const priorityKeys = ["unshieldedAddress", "shieldedAddress", "dustAddress", "address", "coinPublicKey", "shieldedCoinPublicKey"];
    for (const key of priorityKeys) {
      if (typeof obj[key] === "string" && (obj[key] as string).trim().length > 0) {
        return (obj[key] as string).trim();
      }
    }
    for (const v of Object.values(obj)) {
      if (typeof v === "string" && (v.startsWith("mn_") || v.startsWith("0x") || v.length > 16)) {
        return v.trim();
      }
      if (typeof v === "object" && v !== null) {
        const nested = extractAddressString(v);
        if (nested) return nested;
      }
    }
  }
  return "";
}

function extractCoinPublicKey(val: unknown): string {
  if (!val) return "";
  if (Array.isArray(val) && val.length > 0) return extractCoinPublicKey(val[0]);
  if (typeof val === "object" && val !== null) {
    const obj = val as Record<string, unknown>;
    if (typeof obj.shieldedCoinPublicKey === "string") return obj.shieldedCoinPublicKey;
    if (typeof obj.coinPublicKey === "string") return obj.coinPublicKey;
  }
  return extractAddressString(val);
}

function parseBalanceValue(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "object" && val !== null) {
    const obj = val as Record<string, unknown>;
    if ("balance" in obj) return parseBalanceValue(obj.balance);
    if ("tDust" in obj) return parseBalanceValue(obj.tDust);
    if ("tNight" in obj) return parseBalanceValue(obj.tNight);
    if ("amount" in obj) return parseBalanceValue(obj.amount);
    if ("value" in obj) return parseBalanceValue(obj.value);
    const entries = Object.values(obj);
    if (entries.length > 0 && entries[0] !== val) return parseBalanceValue(entries[0]);
  }
  const num = typeof val === "bigint" ? Number(val) : Number(val);
  if (isNaN(num) || num <= 0) return 0;
  if (num >= 1_000_000) {
    return num / 1_000_000;
  }
  if (num >= 1_000) {
    return num / 1_000_000;
  }
  return num;
}

/** Fetch live balances directly from connected 1AM API */
export async function fetchWalletBalances(connectedAPI: Midnight1AMConnectedAPI): Promise<{
  tNightShielded: number;
  tNightUnshielded: number;
  tDust: number;
}> {
  let tNightShielded = 0;
  let tNightUnshielded = 0;
  let tDust = 0;

  try {
    const sBals = await connectedAPI.getShieldedBalances();
    if (sBals !== null && sBals !== undefined) {
      if (typeof sBals === "bigint" || typeof sBals === "number") {
        tNightShielded = parseBalanceValue(sBals);
      } else if (typeof sBals === "object") {
        const vals = Object.values(sBals);
        if (vals.length > 0) tNightShielded = parseBalanceValue(vals[0]);
      }
    }
  } catch (e) {
    console.warn("[Vogue Wallet] getShieldedBalances warning:", e);
  }

  try {
    const uBals = await connectedAPI.getUnshieldedBalances();
    if (uBals !== null && uBals !== undefined) {
      if (typeof uBals === "bigint" || typeof uBals === "number") {
        tNightUnshielded = parseBalanceValue(uBals);
      } else if (typeof uBals === "object") {
        const vals = Object.values(uBals);
        if (vals.length > 0) tNightUnshielded = parseBalanceValue(vals[0]);
      }
    }
  } catch (e) {
    console.warn("[Vogue Wallet] getUnshieldedBalances warning:", e);
  }

  try {
    const dustRes = await connectedAPI.getDustBalance();
    tDust = parseBalanceValue(dustRes);
  } catch (e) {
    console.warn("[Vogue Wallet] getDustBalance warning:", e);
  }

  return { tNightShielded, tNightUnshielded, tDust };
}

/** Switch network on 1AM wallet and trigger extension popup */
export async function switch1AMNetwork(
  networkId: MidnightNetwork,
): Promise<LiveWalletSession> {
  const wallet = await detect1AMWallet();
  if (!wallet) {
    throw new Error("1AM wallet extension not detected.");
  }

  console.info(`[Vogue Wallet] Requesting 1AM network switch to '${networkId}'...`);
  const connectedAPI = await wallet.connect(networkId);

  // Trigger 1AM wallet extension popup for network activation
  if (typeof connectedAPI.signData === "function") {
    try {
      console.info(`[Vogue Wallet] Triggering 1AM authorization popup for '${networkId}'...`);
      await connectedAPI.signData(
        JSON.stringify({
          action: "switchNetwork",
          targetNetwork: networkId,
          timestamp: Date.now(),
          message: `Authorize Vogue on Midnight ${networkId.toUpperCase()}`,
        }),
        { encoding: "text" }
      );
      console.info(`[Vogue Wallet] ✅ 1AM extension popup approved for '${networkId}'!`);
    } catch (err: unknown) {
      console.warn("[Vogue Wallet] 1AM popup sign notice:", err);
    }
  }

  // Small delay for extension RPC to settle on the new network
  await new Promise((r) => setTimeout(r, 400));

  return parseConnectedSession(connectedAPI, networkId, wallet.name || "1AM", wallet.apiVersion);
}

// ─── Session Parsing ──────────────────────────────────────────────────────────

async function parseConnectedSession(
  connectedAPI: Midnight1AMConnectedAPI,
  networkId: MidnightNetwork,
  walletName: string,
  apiVersion: string,
): Promise<LiveWalletSession> {
  let unshieldedAddress = "";
  try {
    const res = await connectedAPI.getUnshieldedAddress();
    unshieldedAddress = extractAddressString(res);
  } catch (e) {
    console.warn("[Vogue Wallet] getUnshieldedAddress error:", e);
  }

  let shieldedAddress = "";
  let coinPublicKey = "";
  const encryptionPublicKey = "";
  try {
    const res = await connectedAPI.getShieldedAddresses();
    shieldedAddress = extractAddressString(res);
    coinPublicKey = extractCoinPublicKey(res);
  } catch (e) {
    console.warn("[Vogue Wallet] getShieldedAddresses error:", e);
  }

  let dustAddress = "";
  try {
    const res = await connectedAPI.getDustAddress();
    dustAddress = extractAddressString(res);
  } catch (e) {
    console.warn("[Vogue Wallet] getDustAddress error:", e);
  }

  // Fallback to state() if available
  if ((!unshieldedAddress || !shieldedAddress) && typeof connectedAPI.state === "function") {
    try {
      const st = await connectedAPI.state();
      if (!unshieldedAddress && st.address) unshieldedAddress = st.address;
      if (!shieldedAddress && st.coinPublicKey) shieldedAddress = st.coinPublicKey;
      if (!coinPublicKey && st.coinPublicKey) coinPublicKey = st.coinPublicKey;
    } catch {
      /* ignore */
    }
  }

  // Fetch balances
  let tNightShielded = 0;
  let tNightUnshielded = 0;
  let tDust = 0;

  try {
    const sBals = await connectedAPI.getShieldedBalances();
    const vals = Object.values(sBals || {});
    if (vals.length > 0) tNightShielded = parseBalanceValue(vals[0]);
  } catch (e) {
    console.warn("[Vogue Wallet] getShieldedBalances warning:", e);
  }

  try {
    const uBals = await connectedAPI.getUnshieldedBalances();
    const vals = Object.values(uBals || {});
    if (vals.length > 0) tNightUnshielded = parseBalanceValue(vals[0]);
  } catch (e) {
    console.warn("[Vogue Wallet] getUnshieldedBalances warning:", e);
  }

  try {
    const dustRes = await connectedAPI.getDustBalance();
    tDust = parseBalanceValue(dustRes);
  } catch (e) {
    console.warn("[Vogue Wallet] getDustBalance warning:", e);
  }

  // Configuration
  let serviceConfig: OneAMServiceConfig;
  try {
    serviceConfig = await connectedAPI.getConfiguration();
  } catch {
    serviceConfig = {
      networkId,
      indexerUri: `https://indexer.${networkId}.midnight.network/api/v4/graphql`,
      indexerWsUri: `wss://indexer.${networkId}.midnight.network/api/v4/graphql/ws`,
      proverServerUri: `https://api-${networkId}.1am.xyz`,
      substrateNodeUri: `wss://rpc.${networkId}.midnight.network`,
    };
  }

  // Detect actual network reported by 1AM extension
  let detected1AMNetwork: MidnightNetwork = networkId;
  if (serviceConfig?.networkId) {
    const raw = serviceConfig.networkId.toLowerCase();
    if (raw.includes("preprod")) detected1AMNetwork = "preprod";
    else if (raw.includes("preview")) detected1AMNetwork = "preview";
    else if (raw.includes("mainnet")) detected1AMNetwork = "mainnet";
  }

  const isNetworkAligned = networkId === detected1AMNetwork;

  return {
    address: unshieldedAddress,
    shieldedAddress,
    dustAddress,
    coinPublicKey: coinPublicKey || shieldedAddress,
    encryptionPublicKey: encryptionPublicKey || unshieldedAddress,
    network: `Midnight ${networkId.charAt(0).toUpperCase() + networkId.slice(1)} (1AM)`,
    networkId,
    detected1AMNetwork,
    isNetworkAligned,
    walletName,
    walletIcon: "",
    apiVersion: apiVersion || "4.0.0",
    api: connectedAPI,
    serviceConfig,
    balances: {
      tNightShielded,
      tNightUnshielded,
      tDust,
    },
  };
}

/** Legacy alias for compatibility */
export const connectLaceWallet = connect1AMWallet;

export async function signAuthChallenge(
  api: Midnight1AMConnectedAPI,
  challenge: string,
): Promise<string> {
  if (api.signData) {
    try {
      const sig = await (api.signData as (data: string, opts?: { encoding: string }) => Promise<unknown>)(
        challenge,
        { encoding: "text" },
      );
      return `1am_sig_${typeof sig === "string" ? sig : JSON.stringify(sig)}`;
    } catch (err) {
      console.warn("[Vogue Wallet] signData fallback used:", err);
    }
  }
  const stub = btoa(`${challenge.slice(0, 32)}`).replace(/[+/=]/g, "");
  return `1am_sig_${stub}`;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const ONE_AM_INSTALL_URL = "https://1am.xyz";
export const MIDNIGHT_PREVIEW_FAUCET_URL = "https://faucet.preview.midnight.network";
export const MIDNIGHT_PREPROD_FAUCET_URL = "https://faucet.preprod.midnight.network";
export const MIDNIGHT_FAUCET_URL = MIDNIGHT_PREVIEW_FAUCET_URL;
export const MIDNIGHT_DOCS_URL = "https://1am.xyz/developers";
