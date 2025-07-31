import { filterOptions } from "@/config";
import { Fragment } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

function ProductFilter({ filters, handleFilter }) {
  const selectedCategories = filters.category || [];

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

  return (
    <div className="bg-background rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-extrabold">Filters</h2>
      </div>
      <div className="p-4 space-y-4">
        {/* Category Filter */}
        <Fragment key="category">
          <div>
            <h3 className="text-base font-bold">Category</h3>
            <div className="grid gap-2 mt-2">
              {filterOptions.category.map((option) => (
                <Label key={option.id} className="flex font-medium items-center gap-2">
                  <Checkbox
                    checked={
                      filters?.category?.includes(option.id) || false
                    }
                    onCheckedChange={() => handleFilter("category", option.id)}
                  />
                  {option.label}
                </Label>
              ))}
            </div>
          </div>
          <Separator />
        </Fragment>

        {/* Brand Filter */}
        {brandsToShow.length > 0 && (
          <Fragment key="brand">
            <div>
              <h3 className="text-base font-bold">Brand</h3>
              <div className="grid gap-2 mt-2">
                {brandsToShow.map((option) => (
                  <Label key={option.id} className="flex font-medium items-center gap-2">
                    <Checkbox
                      checked={
                        filters?.brand?.includes(option.id) || false
                      }
                      onCheckedChange={() => handleFilter("brand", option.id)}
                    />
                    {option.label}
                  </Label>
                ))}
              </div>
            </div>
            <Separator />
          </Fragment>
        )}
      </div>
    </div>
  );
}

export default ProductFilter;
