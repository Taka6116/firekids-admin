import { create } from "zustand";

type PurchaseChannel = "auction" | "dealer" | "individual";

export type MatrixChannelFilter = "all" | PurchaseChannel;

type FilterStore = {
  purchaseBrand: string | undefined;
  purchaseChannel: PurchaseChannel | undefined;
  purchasePriceBand: string | undefined;
  matrixChannelFilter: MatrixChannelFilter;
  setPurchaseBrand: (value: string | undefined) => void;
  setPurchaseChannel: (value: PurchaseChannel | undefined) => void;
  setPurchasePriceBand: (value: string | undefined) => void;
  setMatrixChannelFilter: (value: MatrixChannelFilter) => void;
};

export const useFilterStore = create<FilterStore>((set) => ({
  purchaseBrand: undefined,
  purchaseChannel: undefined,
  purchasePriceBand: undefined,
  matrixChannelFilter: "all",
  setPurchaseBrand: (purchaseBrand) => set({ purchaseBrand }),
  setPurchaseChannel: (purchaseChannel) => set({ purchaseChannel }),
  setPurchasePriceBand: (purchasePriceBand) => set({ purchasePriceBand }),
  setMatrixChannelFilter: (matrixChannelFilter) => set({ matrixChannelFilter }),
}));
