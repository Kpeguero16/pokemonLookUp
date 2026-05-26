import { create } from 'zustand';

interface ToastAction {
  label: string;
  fn: () => void;
}

interface Toast {
  id: string;
  text: string;
  action?: ToastAction;
}

interface ToastStore {
  toasts: Toast[];
  showToast: (text: string, action?: ToastAction) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  showToast: (text, action) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, text, action }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
