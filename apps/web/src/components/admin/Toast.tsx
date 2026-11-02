'use client';

import { createContext, useCallback, useContext, useState } from 'react';

type Tone = 'success' | 'error' | 'info';
const Ctx = createContext<(message: string, tone?: Tone) => void>(() => {});

/** Success and error notifications of the admin, announced to screen readers */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<{ id: number; message: string; tone: Tone }[]>([]);
  const push = useCallback((message: string, tone: Tone = 'info') => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev.slice(-2), { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), tone === 'error' ? 9000 : 5000);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite" role="status">
        {items.map((i) => (
          <div
            key={i.id}
            className={`pointer-events-auto flex max-w-lg items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${i.tone === 'error' ? 'bg-wydad-red' : i.tone === 'success' ? 'bg-emerald-700' : 'bg-wydad-charcoal'}`}
          >
            <span aria-hidden>{i.tone === 'error' ? '✕' : i.tone === 'success' ? '✓' : 'i'}</span>
            <span className="flex-1">{i.message}</span>
            <button type="button" onClick={() => setItems((prev) => prev.filter((x) => x.id !== i.id))} className="opacity-80 hover:opacity-100" aria-label="Fermer">
              ×
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
