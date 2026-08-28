import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Wallet state container.
 *
 * Everything here is a placeholder for a real Lace / Midnight wallet session.
 * Swap `mockConnect` for `window.midnight.mnLace.enable()` and keep the same
 * shape — no consumer of this context needs to change.
 */

export type WalletStatus = "disconnected" | "connecting" | "connected" | "error";

export interface WalletState {
  status: WalletStatus;
  address: string | null;
  balance: number;
  network: string;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

const MOCK_ADDRESS =
  "addr_mn1qxk93lz7wq0pv4t2ug8j3d5n6r0yc9hs2fa7bxe4mq8u3vd7k2p9lt6zn1cw";

const STORAGE_KEY = "vogue.wallet.connected";

function mockConnect(): Promise<{ address: string; balance: number }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // ~1 in 6 simulated failures so the error path is always exercisable.
      if (Math.random() < 0.16) {
        reject(new Error("Lace wallet did not respond. Unlock it and try again."));
        return;
      }
      resolve({ address: MOCK_ADDRESS, balance: 8421.55 });
    }, 1400);
  });
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>("disconnected");
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setStatus("connecting");
    setError(null);
    try {
      const session = await mockConnect();
      setAddress(session.address);
      setBalance(session.balance);
      setStatus("connected");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to connect wallet.");
      setStatus("error");
    }
  }, []);

  const disconnect = useCallback(() => {
    setStatus("disconnected");
    setAddress(null);
    setBalance(0);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ status, address, balance, network: "Midnight Testnet-02", error, connect, disconnect }),
    [status, address, balance, error, connect, disconnect],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}

export function truncate(value: string, head = 8, tail = 6) {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}
