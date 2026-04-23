import { filterOptions } from "@/config";
import { Fragment, useState, useEffect } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import Swatch from "../ui/Swatch";
import { FilterIcon } from "lucide-react";

// Color options for fashion products
const colorOptions = [
  { id: "green", label: "Green", color: "#22C55E" },
  { id: "red", label: "Red", color: "#EF4444" },
  { id: "yellow", label: "Yellow", color: "#EAB308" },
  { id: "orange", label: "Orange", color: "#F97316" },
  { id: "blue", label: "Blue", color: "#3B82F6" },
  { id: "navy", label: "Navy", color: "#1E3A8A" },
  { id: "purple", label: "Purple", color: "#A855F7" },
  { id: "pink", label: "Pink", color: "#EC4899" },
  { id: "white", label: "White", color: "#FFFFFF" },
  { id: "black", label: "Black", color: "#000000" },
];

// Size options
const sizeOptions = [
  "XX-Small", "X-Small", "Small", "Medium", "Large", 
  "X-Large", "XX-Large", "3X-Large", "4X-Large"
];

// Dress style options
const dressStyleOptions = [
  { id: "casual", label: "Casual" },
  { id: "formal", label: "Formal" },
  { id: "party", label: "Party" },
  { id: "gym", label: "Gym" },
];

function ProductFilter({ filters, handleFilter }) {
  const selectedCategories = filters.category || [];
  const [priceRange, setPriceRange] = useState({
    min: filters.priceMin || 50,
    max: filters.priceMax || 200,
  });

  const getBrandsForSelectedCategories = () => {
    let brands = [];
    selectedCategories.forEach((cat) => {
      if (filterOptions.brand[cat]) {
        brands = [...brands, ...filterOptions.brand[cat]];
      }
    });
    return brands;
  };

  const brandsToShow = getBrandsForSelectedCategories();

  // Handle price range change
  const handlePriceRangeChange = (type, value) => {
    const newRange = {
      ...priceRange,
      [type]: parseInt(value),
    };
    setPriceRange(newRange);
    // Update filters with price range
    if (handleFilter) {
      // This would need to be handled by the parent component
      // For now, we'll just update local state
    }
  };

  // Handle color selection
  const handleColorSelect = (colorId) => {
    handleFilter("color", colorId);
  };

  // Handle size selection
  const handleSizeSelect = (size) => {
    handleFilter("size", size);
  };

  // Handle dress style selection
  const handleDressStyleSelect = (styleId) => {
    handleFilter("dressStyle", styleId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b flex items-center gap-2">
        <FilterIcon className="w-5 h-5" />
        <h2 className="text-lg font-extrabold uppercase">Filters</h2>
      </div>
      <div className="p-4 space-y-6">
        {/* Product Type / Category Filter */}
        <Fragment key="category">
          <div>
            <h3 className="text-sm font-bold uppercase mb-3">Product Type</h3>
            <div className="grid gap-2">
              {filterOptions.category.map((option) => (
                <Label key={option.id} className="flex font-medium items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={
                      filters?.category?.includes(option.id) || false
                    }
                    onCheckedChange={() => handleFilter("category", option.id)}
                  />
                  <span className="text-sm">{option.label}</span>
                </Label>
              ))}
            </div>
          </div>
          <Separator />
        </Fragment>

        {/* Price Range Slider */}
        <div>
          <h3 className="text-sm font-bold uppercase mb-3">Price</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">${priceRange.min}</span>
              <span className="font-medium">${priceRange.max}</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="500"
                value={priceRange.min}
                onChange={(e) => handlePriceRangeChange("min", e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #000 0%, #000 ${(priceRange.min / 500) * 100}%, #E5E7EB ${(priceRange.min / 500) * 100}%, #E5E7EB ${(priceRange.max / 500) * 100}%, #000 ${(priceRange.max / 500) * 100}%, #000 100%)`
                }}
              />
              <input
                type="range"
                min="0"
                max="500"
                value={priceRange.max}
                onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                className="absolute top-0 w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
        <Separator />

        {/* Colors Filter */}
        <div>
          <h3 className="text-sm font-bold uppercase mb-3">Colors</h3>
          <div className="flex flex-wrap gap-3">
            {colorOptions.map((colorOption) => (
              <Swatch
                key={colorOption.id}
                type="color"
                value={colorOption.id}
                color={colorOption.color}
                label={colorOption.label}
                selected={filters?.color?.includes(colorOption.id) || false}
                onSelect={handleColorSelect}
              />
            ))}
          </div>
        </div>
        <Separator />

        {/* Size Filter */}
        <div>
          <h3 className="text-sm font-bold uppercase mb-3">Size</h3>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => (
              <Swatch
                key={size}
                type="size"
                value={size}
                label={size}
                selected={filters?.size?.includes(size) || false}
                onSelect={handleSizeSelect}
              />
            ))}
          </div>
        </div>
        <Separator />

        {/* Dress Style Filter */}
        <div>
          <h3 className="text-sm font-bold uppercase mb-3">Dress Style</h3>
          <div className="grid gap-2">
            {dressStyleOptions.map((option) => (
              <Label key={option.id} className="flex font-medium items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={
                    filters?.dressStyle?.includes(option.id) || false
                  }
                  onCheckedChange={() => handleDressStyleSelect(option.id)}
                />
                <span className="text-sm">{option.label}</span>
              </Label>
            ))}
          </div>
        </div>
        <Separator />

        {/* Brand Filter */}
        {brandsToShow.length > 0 && (
          <Fragment key="brand">
            <div>
              <h3 className="text-sm font-bold uppercase mb-3">Brand</h3>
              <div className="grid gap-2">
                {brandsToShow.map((option) => (
                  <Label key={option.id} className="flex font-medium items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={
                        filters?.brand?.includes(option.id) || false
                      }
                      onCheckedChange={() => handleFilter("brand", option.id)}
                    />
                    <span className="text-sm">{option.label}</span>
                  </Label>
                ))}
              </div>
            </div>
          </Fragment>
        )}

        {/* Apply Filter Button */}
        <Button
          className="w-full bg-black text-white rounded-full font-semibold hover:bg-gray-800"
          onClick={() => {
            // Trigger filter application
            if (handleFilter) {
              // This would apply all filters
            }
          }}
        >
          Apply Filter
        </Button>
      </div>
    </div>
  );
}

export default ProductFilter;
