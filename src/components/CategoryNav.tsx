import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CategoryNavProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {

const categoryNameMap: { [key: string]: string } = {
    "1": "Birthday Cards",
    "2": "Wedding Cards",
    "3": "New Year Cards",
    "4": "Love & Romance Cards",
    "5": "Appreciation Cards",
    "6": "Trading Sentiment Cards",
  };
  
  return (
    <div className="w-full overflow-x-auto pb-2 mb-6">
      <motion.div 
        className="flex gap-2 min-w-max"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full transition-all text-sm font-medium",
            selectedCategory === null
              ? "bg-[#6fd4df] text-black shadow-md shadow-[#6fd4df]/20"
              : "bg-[#6fd4df] text-black hover:opacity-90"
          )}
        >
          All Categories
        </button>

        {categories
  .filter((category) => category)
  .map((category) => (
    <button
      key={category}
      onClick={() => onSelectCategory(category)}
      className={cn(
        "px-4 py-2 rounded-full transition-all text-sm font-medium",
        selectedCategory === category
          ? "bg-[#6fd4df] text-black shadow-md shadow-[#6fd4df]/20"
          : "bg-[#6fd4df] text-black hover:opacity-90"
      )}
    >
      {categoryNameMap[category] || `Category #${category}`}
    </button>
))}

      </motion.div>
    </div>
  );
};

export default CategoryNav; 