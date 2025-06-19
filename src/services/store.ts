import { create } from "zustand";
import { ArtNFT } from "./api";
import { fetchArtNFTs } from "./api";

// Use ArtNFT and giftCardCategoryId instead of Background/category
interface ArtNFTsState {
  artNftsByCategory: Record<number, ArtNFT[]>;
  loadedCategories: Set<number>;
  isLoading: boolean;
  error: string | null;

  fetchCategoryArtNfts: (giftCardCategoryId: number) => Promise<void>;
  addArtNft: (artNft: ArtNFT) => void;
  updateArtNft: (artNft: ArtNFT) => void;
  fetchAllArtNfts: () => Promise<void>;
  clearCache: () => void;
}

export const useArtNftsStore = create<ArtNFTsState>((set, get) => ({
  artNftsByCategory: {},
  loadedCategories: new Set<number>(),
  isLoading: false,
  error: null,

  fetchCategoryArtNfts: async (giftCardCategoryId: number) => {
    if (get().loadedCategories.has(giftCardCategoryId)) {
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const artNfts = await fetchArtNFTs(String(giftCardCategoryId));
      set((state) => ({
        artNftsByCategory: {
          ...state.artNftsByCategory,
          [giftCardCategoryId]: artNfts,
        },
        loadedCategories: new Set([
          ...state.loadedCategories,
          giftCardCategoryId,
        ]),
        isLoading: false,
      }));
      console.log(
        `Loaded ${artNfts.length} art NFTs for category: ${giftCardCategoryId}`
      );
    } catch (error) {
      console.error(
        `Failed to load art NFTs for category: ${giftCardCategoryId}`,
        error
      );
      set({
        error: `Failed to load art NFTs for category: ${giftCardCategoryId}`,
        isLoading: false,
      });
    }
  },

  fetchAllArtNfts: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all art NFTs (no category filter)
      const artNftsRaw = await fetchArtNFTs();
      // Normalize the result to always be an array of ArtNFT
      let nftArray: ArtNFT[] = [];
      if (Array.isArray(artNftsRaw)) {
        nftArray = artNftsRaw;
      } else if (artNftsRaw && Array.isArray((artNftsRaw as any).artNfts)) {
        nftArray = (artNftsRaw as any).artNfts;
      } else if (artNftsRaw && Array.isArray((artNftsRaw as any).backgrounds)) {
        nftArray = (artNftsRaw as any).backgrounds;
      } else if (artNftsRaw && typeof artNftsRaw === "object") {
        // Try to extract from any array property
        const arr = Object.values(artNftsRaw).find((v) => Array.isArray(v));
        if (Array.isArray(arr)) {
          nftArray = arr as ArtNFT[];
        }
      }
      // Filter out invalid/empty records
      nftArray = nftArray.filter(
        (nft) =>
          nft &&
          typeof nft.id === "number" &&
          typeof nft.giftCardCategoryId !== "undefined"
      );
      // Group by giftCardCategoryId
      const byCategory: Record<number, ArtNFT[]> = {};
      nftArray.forEach((nft) => {
        const catId = Number(nft.giftCardCategoryId);
        if (!isNaN(catId) && catId !== 0) {
          if (!byCategory[catId]) byCategory[catId] = [];
          byCategory[catId].push(nft);
        }
      });
      set({
        artNftsByCategory: byCategory,
        loadedCategories: new Set(Object.keys(byCategory).map(Number)),
        isLoading: false,
      });
      console.log(
        `Loaded art NFTs for ${Object.keys(byCategory).length} categories`
      );
    } catch (error) {
      console.error("Failed to load all art NFTs", error);
      set({
        error: "Failed to load art NFTs",
        isLoading: false,
      });
    }
  },

  addArtNft: (artNft: ArtNFT) => {
    set((state) => {
      const catId = artNft.giftCardCategoryId;
      const existing = state.artNftsByCategory[catId] || [];
      return {
        artNftsByCategory: {
          ...state.artNftsByCategory,
          [catId]: [...existing, artNft],
        },
        loadedCategories: new Set([...state.loadedCategories, catId]),
      };
    });
  },

  updateArtNft: (artNft: ArtNFT) => {
    set((state) => {
      const catId = artNft.giftCardCategoryId;
      const existing = state.artNftsByCategory[catId] || [];
      return {
        artNftsByCategory: {
          ...state.artNftsByCategory,
          [catId]: existing.map((nft) => (nft.id === artNft.id ? artNft : nft)),
        },
      };
    });
  },

  clearCache: () => {
    set({
      artNftsByCategory: {},
      loadedCategories: new Set<number>(),
      isLoading: false,
      error: null,
    });
  },
}));
