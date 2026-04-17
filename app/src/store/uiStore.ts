import { create } from 'zustand';

type Page = 'continent' | 'expedition' | 'camp' | 'bestiary' | 'chronicles';

interface UIStore {
  currentPage: Page;
  selectedCharacter: string;
  sidebarCollapsed: boolean;
  notifications: Notification[];

  setPage: (page: Page) => void;
  setCharacter: (characterId: string) => void;
  toggleSidebar: () => void;
  addNotification: (message: string, type: 'info' | 'success' | 'danger' | 'lore') => void;
  dismissNotification: (id: string) => void;
}

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'danger' | 'lore';
  timestamp: number;
}

let notifId = 0;

export const useUIStore = create<UIStore>((set) => ({
  currentPage: 'continent',
  selectedCharacter: 'gustave',
  sidebarCollapsed: false,
  notifications: [],

  setPage: (page) => set({ currentPage: page }),
  setCharacter: (characterId) => set({ selectedCharacter: characterId }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  addNotification: (message, type) => {
    const id = `notif_${++notifId}`;
    set((s) => ({
      notifications: [
        { id, message, type, timestamp: Date.now() },
        ...s.notifications,
      ].slice(0, 5),
    }));

    // Auto-dismiss after 5s
    setTimeout(() => {
      set((s) => ({
        notifications: s.notifications.filter(n => n.id !== id),
      }));
    }, 5000);
  },

  dismissNotification: (id) => {
    set((s) => ({
      notifications: s.notifications.filter(n => n.id !== id),
    }));
  },
}));
