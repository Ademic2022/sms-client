"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { IconAlert, IconCheck, IconChevronDown, IconChevronLeft, IconChevronRight, IconClose, IconInfo, IconSearch } from "./icons";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ Buttons */

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

const buttonBase =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-[background-color,border-color,color,box-shadow,filter] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 disabled:pointer-events-none disabled:opacity-50";

const buttonVariants: Record<Variant, string> = {
  primary: "bg-brand text-white shadow-sm hover:brightness-110 active:brightness-95",
  secondary: "border border-line-strong bg-surface text-ink shadow-sm hover:bg-subtle",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  ghost: "text-brand-ink hover:bg-subtle",
};

const buttonSizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cx(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  busy,
  icon,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; busy?: boolean; icon?: ReactNode }) {
  return (
    <button className={buttonClass(variant, size, className)} disabled={busy || props.disabled} {...props}>
      {busy ? <Spinner small /> : icon}
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  icon,
  download,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  icon?: ReactNode;
  download?: boolean;
  children: ReactNode;
}) {
  // File downloads and API paths are plain links; app routes use client navigation.
  if (download || href.startsWith("/files/") || href.startsWith("http")) {
    return (
      <a href={href} className={buttonClass(variant, size, className)} {...(download ? { download: "" } : {})}>
        {icon}
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {icon}
      {children}
    </Link>
  );
}

export function IconButton({ label, children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx("inline-grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25", className)}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------- Forms */

export function Field({ label, hint, error, optional, children }: { label: string; hint?: ReactNode; error?: string; optional?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px] font-medium text-ink">
        {label}
        {optional && <span className="text-xs font-normal text-muted">Optional</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs leading-relaxed text-muted">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

const control =
  "block w-full rounded-lg border border-line-strong bg-surface px-3 text-[15px] text-ink shadow-sm outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-[3px] focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-subtle disabled:text-muted sm:text-sm";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(control, "h-10", props.className)} />;
}

export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cx("relative", props.className)}>
      <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input type="search" {...props} className={cx(control, "h-10 pl-9")} />
    </div>
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cx("relative", className?.includes("w-auto") ? "inline-block" : "block", className)}>
      <select {...props} className={cx(control, "h-10 appearance-none pr-9")} />
      <IconChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(control, "py-2.5 leading-relaxed", props.className)} />;
}

export function Checkbox({ label, description, checked, onChange, disabled }: { label: ReactNode; description?: ReactNode; checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <label className={cx("flex cursor-pointer items-start gap-3", disabled && "cursor-not-allowed opacity-60")}>
      <span className="relative mt-0.5 flex-none">
        <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span className="grid h-[18px] w-[18px] place-items-center rounded-[5px] border border-line-strong bg-surface text-white shadow-sm transition peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:ring-[3px] peer-focus-visible:ring-brand/25">
          {checked && <IconCheck size={13} strokeWidth={2.4} />}
        </span>
      </span>
      <span className="text-sm leading-snug">
        <span className="text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
      </span>
    </label>
  );
}

/* ---------------------------------------------------------------- Surfaces */

export function Card({
  title,
  description,
  actions,
  children,
  className,
  flush,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Content runs edge to edge (tables, lists). */
  flush?: boolean;
}) {
  const hasHeader = Boolean(title || actions);
  return (
    <section className={cx("overflow-hidden rounded-xl border border-line bg-surface shadow-sm", className)}>
      {hasHeader && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={flush ? "" : "p-5"}>{children}</div>
    </section>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
  back,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-2 flex flex-wrap items-end justify-between gap-4 pb-2">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-[13px] font-medium text-muted hover:text-ink">
            <IconChevronLeft size={14} /> {back.label}
          </Link>
        )}
        {eyebrow && <div className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted">{eyebrow}</div>}
        <h1 className="font-display text-[26px] font-medium leading-tight tracking-[-0.01em] text-ink sm:text-[30px]">{title}</h1>
        {subtitle && <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">{subtitle}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
      <div className="text-[13px] font-medium text-muted">{label}</div>
      <div className="mt-2 truncate font-display text-[21px] font-medium leading-none tracking-[-0.01em] text-ink tabular-nums sm:text-[28px]">{value}</div>
      {hint && <div className="mt-2 text-xs text-muted">{hint}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ Tables */

const alignClass = { left: "text-left", right: "text-right", center: "text-center" } as const;

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function TH({ children, className, align = "left" }: { children?: ReactNode; className?: string; align?: "left" | "right" | "center" }) {
  return (
    <th className={cx("whitespace-nowrap border-b border-line bg-subtle/60 px-4 py-2.5 text-xs font-medium text-muted", alignClass[align], className)}>
      {children}
    </th>
  );
}

export function TD({ children, className, align = "left" }: { children?: ReactNode; className?: string; align?: "left" | "right" | "center" }) {
  return <td className={cx("border-b border-line px-4 py-3 align-middle text-ink", alignClass[align], className)}>{children}</td>;
}

/** A tappable row inside a flush Card. */
export function RowLink({ href, title, meta, right }: { href: string; title: ReactNode; meta?: ReactNode; right?: ReactNode }) {
  return (
    <Link href={href} className="group flex min-h-14 items-center justify-between gap-4 border-b border-line px-5 py-3 transition last:border-b-0 hover:bg-subtle/70">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-ink">{title}</div>
        {meta && <div className="mt-0.5 truncate text-[13px] text-muted">{meta}</div>}
      </div>
      <div className="flex flex-none items-center gap-3 text-sm">
        {right}
        <IconChevronRight size={16} className="text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />
      </div>
    </Link>
  );
}

/* -------------------------------------------------------------------- Tabs */

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { key: T; label: string; count?: number }[]; value: T; onChange: (key: T) => void }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={value === t.key}
          onClick={() => onChange(t.key)}
          className={cx(
            "-mb-px inline-flex h-10 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-sm font-medium transition",
            value === t.key ? "border-brand text-ink" : "border-transparent text-muted hover:text-ink",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="rounded-full bg-subtle px-1.5 text-xs text-muted">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Feedback */

export function Spinner({ small }: { small?: boolean }) {
  return <span className={cx("inline-block animate-spin rounded-full border-2 border-current border-r-transparent opacity-80", small ? "h-4 w-4" : "h-5 w-5")} aria-label="Loading" />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("ui-skeleton rounded-md", className)} />;
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="space-y-3 py-2" role="status" aria-label={label}>
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
    </div>
  );
}

type Tone = "info" | "success" | "warning" | "error";

const noticeTones: Record<Tone, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-100",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100",
  warning: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100",
  error: "border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100",
};

export function Notice({ tone = "info", title, children }: { tone?: Tone; title?: ReactNode; children?: ReactNode }) {
  const Icon = tone === "success" ? IconCheck : tone === "info" ? IconInfo : IconAlert;
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cx("flex gap-3 rounded-lg border px-4 py-3 text-sm leading-relaxed", noticeTones[tone])}>
      <Icon size={18} className="mt-px flex-none opacity-80" />
      <div className="min-w-0">
        {title && <div className="font-semibold">{title}</div>}
        {children && <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>}
      </div>
    </div>
  );
}

export function ErrorNote({ error }: { error?: { message: string } | string | null }) {
  if (!error) return null;
  return <Notice tone="error">{typeof error === "string" ? error : error.message}</Notice>;
}

type BadgeTone = "neutral" | "good" | "warn" | "bad" | "brand";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-subtle text-muted ring-line",
  good: "bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-900",
  warn: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-900",
  bad: "bg-red-50 text-red-800 ring-red-200 dark:bg-red-950/50 dark:text-red-200 dark:ring-red-900",
  brand: "bg-brand/10 text-brand-ink ring-brand/20",
};

const dotTones: Record<BadgeTone, string> = {
  neutral: "bg-muted",
  good: "bg-emerald-500",
  warn: "bg-amber-500",
  bad: "bg-red-500",
  brand: "bg-brand",
};

export function Badge({ tone = "neutral", dot, children }: { tone?: BadgeTone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset", badgeTones[tone])}>
      {dot && <span className={cx("h-1.5 w-1.5 rounded-full", dotTones[tone])} />}
      {children}
    </span>
  );
}

export const statusTone: Record<string, BadgeTone> = {
  draft: "neutral",
  approved: "warn",
  published: "good",
  active: "good",
  withdrawn: "bad",
  transferred: "warn",
  graduated: "brand",
  success: "good",
  reversed: "bad",
  failed: "bad",
  pending: "warn",
  suspended: "bad",
  read_only: "warn",
};

const statusLabel: Record<string, string> = {
  draft: "Draft",
  approved: "Approved, locked",
  published: "Published",
  active: "Active",
  withdrawn: "Withdrawn",
  transferred: "Transferred",
  graduated: "Graduated",
  success: "Paid",
  reversed: "Reversed",
  failed: "Failed",
  pending: "Pending",
  suspended: "Suspended",
  read_only: "Read-only",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={statusTone[status] ?? "neutral"} dot>
      {statusLabel[status] ?? status}
    </Badge>
  );
}

export function Empty({ title, children, action, icon }: { title?: string; children?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-surface/50 px-6 py-12 text-center">
      {icon && <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-subtle text-muted">{icon}</div>}
      {title && <div className="text-[15px] font-semibold text-ink">{title}</div>}
      {children && <div className="mt-1 max-w-sm text-sm text-muted">{children}</div>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ Dialog */

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("input, textarea, select, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="ui-fade-in absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} className="ui-pop-in relative w-full max-w-md rounded-t-2xl border border-line bg-surface shadow-lg sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 px-6 pt-5">
          <div>
            <h2 id={titleId} className="text-[17px] font-semibold text-ink">{title}</h2>
            {description && <div className="mt-1 text-sm leading-relaxed text-muted">{description}</div>}
          </div>
          <IconButton label="Close" onClick={onClose} className="-mr-2 -mt-1"><IconClose size={16} /></IconButton>
        </div>
        {children && <div className="px-6 pt-4">{children}</div>}
        {footer && <div className="mt-6 flex flex-col-reverse gap-2 border-t border-line bg-subtle/50 px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
}

/**
 * A confirmation dialog that can require a typed reason (for reversals, suspensions and
 * other actions that go into the audit log). Replaces window.prompt and window.confirm.
 */
export function ActionDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  tone = "primary",
  input,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel: string;
  tone?: "primary" | "danger";
  input?: { label: string; placeholder?: string; hint?: string; type?: "text" | "number"; required?: boolean };
  onConfirm: (value: string) => Promise<unknown> | void;
}) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const close = () => {
    if (busy) return;
    setValue("");
    setError(null);
    onClose();
  };
  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm(value.trim());
      setValue("");
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const blocked = Boolean(input && input.required !== false && !value.trim());
  return (
    <Dialog
      open={open}
      onClose={close}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={busy}>Cancel</Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} busy={busy} disabled={blocked} onClick={confirm}>{confirmLabel}</Button>
        </>
      }
    >
      {(input || error) && (
        <div className="space-y-3">
          {error && <ErrorNote error={error} />}
          {input && (
            <Field label={input.label} hint={input.hint}>
              <Input
                type={input.type ?? "text"}
                inputMode={input.type === "number" ? "numeric" : undefined}
                value={value}
                placeholder={input.placeholder}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !blocked && void confirm()}
              />
            </Field>
          )}
        </div>
      )}
    </Dialog>
  );
}

/* ------------------------------------------------------------- Form layout */

/** A titled block of a long form: explanation on the left, fields on the right. */
export function FormSection({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section className="grid gap-x-10 gap-y-4 border-b border-line py-8 first:pt-0 last:border-b-0 lg:grid-cols-[260px_1fr]">
      <div>
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/** Sticky footer for long forms, so the save button is always in reach. */
export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-background/90 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
      {children}
    </div>
  );
}
