import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

type SideDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  widthClassName?: string; // allow override of width if needed
};

export default function SideDrawer({ open, onClose, title, subtitle, actions, children, widthClassName }: SideDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true">
      <div className="drawer-overlay absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`drawer-panel absolute right-0 top-0 h-full ${widthClassName || "w-full sm:w-[480px] md:w-[560px]"} glass-strong border-l border-zinc-800/60 shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-4">
          <div className="min-w-0">
            {subtitle ? <div className="text-xs text-zinc-400">{subtitle}</div> : null}
            <h3 className="mt-1 text-base font-semibold text-white break-words">{title}</h3>
          </div>
          <div className="ml-3 flex items-center gap-2">
            {actions}
            <button type="button" onClick={onClose} className="btn-ghost" aria-label="Close">Close</button>
          </div>
        </div>
        <div className="h-[calc(100%-65px)] overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}


