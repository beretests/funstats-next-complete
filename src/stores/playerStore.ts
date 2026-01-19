// // src/store/userStore.ts
// import { create } from "zustand";
// import { createJSONStorage, persist } from "zustand/middleware";
// import { Player } from "../interfaces/Player";
// import { Session } from "../interfaces/Session";

// interface PlayerState {
//   player: Player | null;
//   session: Session | null;
//   isAuthenticated: boolean;
//   setPlayer: (player: Player, session: Session) => void;
//   updatePlayer: (partialPlayer: Partial<Player>) => void;
//   removePlayer: () => void;
// }

// export const usePlayerStore = create<PlayerState>()(
//   persist(
//     (set) => ({
//       player: null,
//       session: null,
//       isAuthenticated: false,
//       setPlayer: (session) =>
//         set({ player: session.user, session, isAuthenticated: true }),
//       updatePlayer: (partialPlayer) =>
//         set((state) => ({
//           player: state.player ? { ...state.player, ...partialPlayer } : null,
//         })),
//       removePlayer: () =>
//         set({ player: null, session: null, isAuthenticated: false }),
//     }),
//     // {
//     //   name: "player-storage",
//     //   storage: {
//     //     getItem: (name) => {
//     //       const item = localStorage.getItem(name);
//     //       return item ? JSON.parse(item) : null;
//     //     },
//     //     setItem: (name, value) => {
//     //       localStorage.setItem(name, JSON.stringify(value));
//     //     },
//     //     removeItem: (name) => {
//     //       localStorage.removeItem(name);
//     //     },
//     //   },
//     // }
//     {
//       name: "player-storage", // Key for localStorage
//       storage: createJSONStorage(() => localStorage), // Use localStorage
//     }
//   )
// );
