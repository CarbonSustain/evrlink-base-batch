import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import BackgroundDetailsModal from "./BackgroundDetailsModal";
import { ArtNFT } from "@/services/api";
import { useArtNftsStore } from "@/services/store";

// Marketplace component
const Marketplace: React.FC = () => {
  const [selectedArtNft, setSelectedArtNft] = useState<ArtNFT | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Use Zustand store for ArtNFTs
  const { artNftsByCategory, fetchAllArtNfts, isLoading, error } =
    useArtNftsStore();

  // Flatten all NFTs for display
  const allArtNfts: ArtNFT[] = Object.values(artNftsByCategory).flat();

  useEffect(() => {
    fetchAllArtNfts();
  }, [fetchAllArtNfts]);

  const handleArtNftClick = (artNft: ArtNFT) => {
    setSelectedArtNft(artNft);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedArtNft(null);
  };

  // Transform ArtNFT to BackgroundModalProps (legacy modal)
  const transformArtNft = (nft: ArtNFT) => ({
    id: nft.id.toString(),
    artistAddress: nft.artistAddress,
    imageURI: nft.imageUri,
    category: nft.giftCardCategoryId.toString(),
    price: nft.price,
    usageCount: 0,
    createdAt: nft.createdAt,
    updatedAt: nft.updatedAt,
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        NFT Background Marketplace
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
        }}
      >
        {allArtNfts.map((artNft) => (
          <Box key={artNft.id}>
            <Card
              sx={{
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                },
              }}
              onClick={() => handleArtNftClick(artNft)}
            >
              <CardMedia
                component="img"
                height="200"
                image={artNft.imageUri}
                alt={`ArtNFT #${artNft.id}`}
                sx={{ objectFit: "cover" }}
              />
              <CardContent>
                <Typography variant="h6" noWrap>
                  ArtNFT #{artNft.id}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  Category: {artNft.giftCardCategoryId}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  {artNft.price} ETH
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {selectedArtNft && (
        <BackgroundDetailsModal
          open={modalOpen}
          onClose={handleCloseModal}
          background={transformArtNft(selectedArtNft)}
        />
      )}
    </Box>
  );
};

export default Marketplace;
