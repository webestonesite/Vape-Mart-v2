"use client";

import React, { createContext, useContext, useState, useTransition, useCallback } from "react";
import { Loader2, CheckCircle2, AlertCircle, Info, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  1. ActionButton: Instant Click Feedback & Micro-Transitions       */
/* ------------------------------------------------------------------ */

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onAction?: () => Promise<void> | void;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function ActionButton({
  onAction,
  isLoading = false,
  variant = "primary",
  size = "md",
  disabled,
  children,
  className = "",
  onClick,
  ...props
}: ActionButtonProps) {
  const [isPending, startTransition] = useTransition();
  const busy = isLoading || isPending;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (busy || disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) onClick(e);
    if (onAction) {
      startTransition(async () => {
        await onAction();
      });
    }
  };

  const baseCls =
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-wide transition-all duration-150 select-none outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer";

  const sizeCls = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base",
  }[size];

  const variantCls = {
    primary:
      "bg-neutral-900 text-white hover:bg-neutral-800 focus:ring-neutral-900 shadow-sm hover:shadow",
    secondary:
      "bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400 focus:ring-neutral-400 shadow-sm",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm",
    ghost:
      "bg-transparent text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-300",
  }[variant];

  return (
    <button
      {...props}
      disabled={disabled || busy}
      onClick={handleClick}
      className={`${baseCls} ${sizeCls} ${variantCls} ${className}`}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin text-current" />}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  2. ToastProvider: Non-blocking stacked notification system        */
/* ------------------------------------------------------------------ */

interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContextType {
  toast: (msg: string, type?: "success" | "error" | "info") => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      remove(id);
    }, 4000);
  }, [remove]);

  const apiValue = React.useMemo<ToastContextType>(() => ({
    toast: add,
    success: (msg: string) => add(msg, "success"),
    error: (msg: string) => add(msg, "error"),
    info: (msg: string) => add(msg, "info"),
  }), [add]);

  return (
    <ToastContext.Provider value={apiValue}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-xl border text-sm font-medium transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              t.type === "success"
                ? "bg-emerald-950/90 text-white border-emerald-800"
                : t.type === "error"
                ? "bg-rose-950/90 text-white border-rose-800"
                : "bg-neutral-900/90 text-white border-neutral-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {t.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
              {t.type === "error" && <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />}
              {t.type === "info" && <Info className="h-4 w-4 text-neutral-400 shrink-0" />}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => remove(t.id)}
              className="text-white/60 hover:text-white p-0.5 rounded transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: (msg) => console.log(msg),
      success: (msg) => console.log(msg),
      error: (msg) => console.error(msg),
      info: (msg) => console.log(msg),
    };
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  3. ConfirmModal: Non-blocking accessible replacement for alert()  */
/* ------------------------------------------------------------------ */

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200">
        <h3 className="text-lg font-bold text-neutral-900 mb-1.5">{title}</h3>
        <p className="text-sm text-neutral-600 mb-6 leading-relaxed">{description}</p>
        <div className="flex items-center justify-end gap-2.5">
          <button
            disabled={isPending}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition"
          >
            {cancelLabel}
          </button>
          <ActionButton
            isLoading={isPending}
            variant={isDestructive ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

