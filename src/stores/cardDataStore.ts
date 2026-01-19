import { create } from "zustand";

export type CardAward = {
  award_id: string;
  award_name: string;
};

export type CardStatEntry = {
  game_id?: string;
  date?: string;
  home_team_name?: string;
  away_team_name?: string;
  position_played?: string | null;
  stat_value?: number;
  awards?: CardAward[];
};

type CardDataMap = Record<string, CardStatEntry[]>;

interface CardDataState {
  cardData: CardDataMap;
  setCardData: (label: string, data: CardStatEntry[]) => void;
  getCardData: (label: string) => CardStatEntry[] | undefined;
}

export const useCardDataStore = create<CardDataState>((set, get) => ({
  cardData: {},
  setCardData: (label, data) =>
    set((state) => ({
      cardData: {
        ...state.cardData,
        [label]: data,
      },
    })),
  getCardData: (label) => get().cardData[label],
}));
