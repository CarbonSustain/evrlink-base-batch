import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Button from "@/components/Button";
import { ArtNFT } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/config";
import { getSignedS3Url, extractFilenameFromUrl } from "@/utils/s3Helpers";

// Updated props to use ArtNFT
interface BackgroundGalleryProps {
  backgrounds: ArtNFT[];
  isLoading: boolean;
  error: string | null;
  onSelectBackground: (background: ArtNFT) => void;
  emptyStateMessage?: string;
}

interface ImageUrlCache {
  [key: string]: {
    url: string;
    expiresAt: number;
  };
}

// URL cache to avoid generating new signed URLs unnecessarily
const urlCache: ImageUrlCache = {};

const getImageUrl = async (imageUri: string): Promise<string> => {
  if (!imageUri) return "";

  if (urlCache[imageUri] && urlCache[imageUri].expiresAt > Date.now()) {
    return urlCache[imageUri].url;
  }

  try {
    let filename = "";

    if (imageUri.startsWith("http")) {
      filename = extractFilenameFromUrl(imageUri);
      if (!filename) return imageUri;
    } else {
      filename = imageUri.split("/").pop() || "";
      if (!filename) return "";
      filename = filename.includes(".") ? filename : `${filename}.jpeg`;
    }

    const signedUrl = await getSignedS3Url(filename);

    urlCache[imageUri] = {
      url: signedUrl,
      expiresAt: Date.now() + 50 * 60 * 1000,
    };

    return signedUrl;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    const filename = extractFilenameFromUrl(imageUri);
    if (filename) {
      return `${API_BASE_URL}/uploads/${filename}`;
    }
    return "";
  }
};

const BackgroundGallery: React.FC<BackgroundGalleryProps> = ({
  backgrounds,
  isLoading,
  error,
  onSelectBackground,
  emptyStateMessage = "No backgrounds found in this category",
}) => {
  const navigate = useNavigate();
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const [loadingImages, setLoadingImages] = useState(true);

  // Load signed URLs for all backgrounds when component mounts or backgrounds change
  useEffect(() => {
    const loadImageUrls = async () => {
      if (!backgrounds.length) {
        setLoadingImages(false);
        return;
      }

      setLoadingImages(true);

      try {
        const urlPromises = backgrounds.map(async (background) => {
          if (!background.imageUri) return [background.id, ""];
          const url = await getImageUrl(background.imageUri);
          return [background.id, url];
        });

        const urlResults = await Promise.all(urlPromises);
        const urlMap = Object.fromEntries(urlResults);

        setImageUrls(urlMap);
      } catch (error) {
        console.error("Error loading image URLs:", error);
      } finally {
        setLoadingImages(false);
      }
    };

    loadImageUrls();
  }, [backgrounds]);

  if (isLoading || loadingImages) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <span className="ml-3 text-white">Loading backgrounds...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-400 mb-3">{error}</div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (backgrounds.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-300 text-lg mb-6">{emptyStateMessage}</p>
        <Button
          onClick={() => navigate("/create-background")}
          className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-3"
        >
          Create the First One
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {backgrounds.map((background, index) => {
        const imageUrl = imageUrls[background.id] || "/placeholder-loading.jpg";

        return (
          <motion.div
            key={background.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={() => onSelectBackground(background)}
          >
            <div className="relative rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
              <div className="relative h-48">
                <img
                  src={imageUrl}
                  alt={background.giftCardCategoryId?.toString() || ""}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const currentSrc = target.src;
                    target.onerror = null;
                    target.src = "/placeholder.jpg";
                    console.error(`Failed to load image: ${currentSrc}`);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium">
                  {background.price} ETH
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-medium text-white mb-2 group-hover:text-primary transition-colors">
                  Category #{background.giftCardCategoryId}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                  Beautiful background for creating unique gift cards.
                </p>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">
                    By{" "}
                    {background.artistAddress &&
                    background.artistAddress.length >= 10
                      ? `${background.artistAddress.slice(
                          0,
                          6
                        )}...${background.artistAddress.slice(-4)}`
                      : background.artistAddress || ""}
                  </span>
                  {/* Usage count is not in ArtNFT, so omit or add if you extend ArtNFT */}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BackgroundGallery;
