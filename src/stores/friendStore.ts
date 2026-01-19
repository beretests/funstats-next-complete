import { create } from "zustand";
import api from "../services/api";
import { createJSONStorage, persist } from "zustand/middleware";
import { useLoadingStore } from "./loadingStore";

interface Season {
  id: string;
  name: string;
}

interface SeasonStore {
  seasons: Season[];
  selectedSeason: Season | null;
  fetchSeasons: () => Promise<void>;
  setSelectedSeason: (season: Season) => void;
}

const useSeasonStore = create<SeasonStore>()(
  persist(
    (set) => ({
      seasons: [],
      selectedSeason: null,
      fetchSeasons: async () => {
        const { setLoading } = useLoadingStore.getState();

        try {
          setLoading(true);
          const response = await api.get("/api/seasons");
          set({ seasons: response.data });
        } catch (error) {
          console.error("Failed to fetch seasons", error);
        } finally {
          setLoading(false);
        }
      },
      setSelectedSeason: (season) => set({ selectedSeason: season }),
    }),
    {
      name: "selected-season-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedSeason: state.selectedSeason }),
    }
  )
);

export default useSeasonStore;
