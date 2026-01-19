import { create } from "zustand";
import type { SchoolConfig } from "../services/config";

interface ConfigState {
  config?: SchoolConfig;
  set: (config: SchoolConfig) => void;
  clear: () => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: undefined,
  set: (config) => set({ config }),
  clear: () => set({ config: undefined }),
}));
