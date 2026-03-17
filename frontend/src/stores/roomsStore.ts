import { create } from "zustand";

export interface Room {
  id: number;
  name: string;
  capacity?: number;
  // ajoute les autres champs selon ton API
}

type RoomsState = {
  rooms: Room[];
  loading: boolean;
  error?: string;
  setRooms: (rooms: Room[]) => void;
  loadRooms: () => Promise<void>;
  clearError: () => void;
};

const useRoomsStore = create<RoomsState>((set) => ({
  rooms: [],
  loading: false,
  error: undefined,

  setRooms: (rooms) => set({ rooms }),

  clearError: () => set({ error: undefined }),

  loadRooms: async () => {
    set({ loading: true, error: undefined });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ressources`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Erreur fetch: ${res.status} ${res.statusText} ${text}`);
      }

      const data: Room[] = await res.json();
      set({ rooms: data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("loadRooms error:", message);
      set({ error: message, loading: false });
    }
  },
}));

export default useRoomsStore;
