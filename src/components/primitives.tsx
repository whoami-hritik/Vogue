import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("panel p-5", className)} {...rest}>
      {children}
    </div>
  );
}

export function SectionLabel({ index, children }: { index: string; children: ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="text-num flex h-7 w-7 items-center justify-center rounded-full border border-border-strong text-[11px] font-semibold text-primary">
        {index}
      </span>
      <span className="rounded-full border border-border px-3 py-1 text-[12px] font-medium text-muted-foreground">
        {children}
      </span>
    </div>
  );
}

export function StatusPill({ status }: { status: "executed" | "rejected" }) {
  const executed = status === "executed";
  return (
    <span
      className={cn(
        "text-num inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wider",
        executed
          ? "border-success/30 bg-success/10 text-success"
          : "border-destructive/30 bg-destructive/10 text-destructive",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", executed ? "bg-success" : "bg-destructive")} />
      {status}
    </span>
  );
}

export function CopyHash({
  value,
  head = 10,
  tail = 8,
  className,
}: {
  value: string;
  head?: number;
  tail?: number;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
      className={cn(
        "text-num group inline-flex items-center gap-2 rounded-md border border-border bg-background/60 px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground",
        className,
      )}
      aria-label="Copy hash"
    >
      <span>
        {value.slice(0, head)}…{value.slice(-tail)}
      </span>
      {copied ? (
        <Check size={13} className="text-primary" />
      ) : (
        <Copy size={13} className="opacity-60 group-hover:opacity-100" />
      )}
    </button>
  );
}

export function RollButton({
  label,
  onClick,
  icon,
  variant = "accent",
  disabled,
  type = "button",
  className,
}: {
  label: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "accent" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full py-2 pl-5 pr-2 text-[13px] font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "accent"
          ? "bg-primary text-primary-foreground hover:accent-glow"
          : "border border-border-strong text-foreground hover:bg-muted",
        className,
      )}
    >
      <span className="text-roll">
        <span className="group-hover:-translate-y-full">{label}</span>
        <span className="group-hover:-translate-y-full">{label}</span>
      </span>
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45",
          variant === "accent" ? "bg-primary-foreground/15" : "bg-muted",
        )}
      >
        {icon}
      </span>
    </button>
  );
}

export function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive"
    >
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 underline underline-offset-4 hover:no-underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
