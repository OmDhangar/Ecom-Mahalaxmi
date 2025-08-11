import ProductFilter from "@/components/shopping-view/filter";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { sortOptions } from "@/config";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { ArrowUpDownIcon, FilterIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }

  console.log(queryParams, "queryParams");
  return queryParams.join("&");
}

// Mock filter options (replace with your actual filter config)
const filterOptions = {
  category: [
    { id: "electronics", label: "Electronics" },
    { id: "fashion", label: "Fashion" },
    { id: "toys", label: "Toys" },
    { id: "farming", label: "Farming" },
    { id: "home", label: "Home & Garden" },
  ],
  brand: [
    { id: "apple", label: "Apple" },
    { id: "samsung", label: "Samsung" },
    { id: "oneplus", label: "OnePlus" },
    { id: "xiaomi", label: "Xiaomi" },
    { id: "realme", label: "Realme" },
  ],
  price: [
    { id: "0-10000", label: "Under ₹10,000" },
    { id: "10000-25000", label: "₹10,000 - ₹25,000" },
    { id: "25000-50000", label: "₹25,000 - ₹50,000" },
    { id: "50000-above", label: "Above ₹50,000" },
  ]
};

function ShoppingListing() {
  const dispatch = useDispatch();
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { toast } = useToast();

  const categorySearchParam = searchParams.get("category");

  function handleSort(value) {
    setSort(value);
  }

  function handleFilter(getSectionId, getCurrentOption) {
    let cpyFilters = { ...filters };
    const indexOfCurrentSection = Object.keys(cpyFilters).indexOf(getSectionId);

    if (indexOfCurrentSection === -1) {
      cpyFilters = {
        ...cpyFilters,
        [getSectionId]: [getCurrentOption],
      };
    } else {
      const indexOfCurrentOption =
        cpyFilters[getSectionId].indexOf(getCurrentOption);

      if (indexOfCurrentOption === -1)
        cpyFilters[getSectionId].push(getCurrentOption);
      else cpyFilters[getSectionId].splice(indexOfCurrentOption, 1);
    }

    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  function handleRemoveFilter(getSectionId, getCurrentOption) {
    let cpyFilters = { ...filters };
    const indexOfCurrentOption = cpyFilters[getSectionId]?.indexOf(getCurrentOption);
    
    if (indexOfCurrentOption > -1) {
      cpyFilters[getSectionId].splice(indexOfCurrentOption, 1);
      if (cpyFilters[getSectionId].length === 0) {
        delete cpyFilters[getSectionId];
      }
    }
    
    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  function handleGetProductDetails(getCurrentProductId) {
    console.log(getCurrentProductId);
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    console.log(cartItems);
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, [categorySearchParam]);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(createQueryString));
    }
  }, [filters]);

  useEffect(() => {
    if (filters !== null && sort !== null)
      dispatch(
        fetchAllFilteredProducts({ filterParams: filters, sortParams: sort })
      );
  }, [dispatch, sort, filters]);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  // Get active filters for display
  const getActiveFilters = () => {
    const activeFilters = [];
    Object.keys(filters).forEach(filterKey => {
      filters[filterKey].forEach(filterValue => {
        const filterSection = filterOptions[filterKey];
        const filterOption = filterSection?.find(option => option.id === filterValue);
        if (filterOption) {
          activeFilters.push({
            sectionId: filterKey,
            optionId: filterValue,
            label: filterOption.label
          });
        }
      });
    });
    return activeFilters;
  };

  console.log(productList, "productListproductListproductList");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Sort */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            All Products
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {productList?.length || 0} items
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 text-sm"
                >
                  <ArrowUpDownIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuRadioGroup value={sort} onValueChange={handleSort}>
                  {sortOptions.map((sortItem) => (
                    <DropdownMenuRadioItem
                      value={sortItem.id}
                      key={sortItem.id}
                    >
                      {sortItem.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Filters */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
          {/* Filter Sections */}
          {Object.keys(filterOptions).map((filterKey) => (
            <div key={filterKey} className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-1 text-sm whitespace-nowrap ${
                      filters[filterKey]?.length > 0 
                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                        : 'bg-white'
                    }`}
                  >
                    <FilterIcon className="h-3 w-3" />
                    <span className="capitalize">{filterKey}</span>
                    {filters[filterKey]?.length > 0 && (
                      <span className="bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 text-xs">
                        {filters[filterKey].length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px] max-h-[300px] overflow-y-auto">
                  {filterOptions[filterKey].map((option) => (
                    <div
                      key={option.id}
                      className={`flex items-center space-x-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                        filters[filterKey]?.includes(option.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleFilter(filterKey, option.id)}
                    >
                      <input
                        type="checkbox"
                        checked={filters[filterKey]?.includes(option.id) || false}
                        onChange={() => {}}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{option.label}</span>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {getActiveFilters().length > 0 && (
        <div className="bg-gray-50 px-4 py-2 border-b">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <span className="text-sm text-gray-600 flex-shrink-0">Filters:</span>
            {getActiveFilters().map((filter, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex-shrink-0"
              >
                <span>{filter.label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-blue-200"
                  onClick={() => handleRemoveFilter(filter.sectionId, filter.optionId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid - Square Cards */}
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {productList && productList.length > 0
            ? productList.map((productItem) => (
                <div key={productItem._id} className="w-full">
                  {/* Custom Square Product Card */}
                  <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-300">
                    {/* Square Image Container */}
                    <div className="relative w-full aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                      <img
                        src={productItem?.image}
                        alt={productItem?.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => handleGetProductDetails(productItem?._id)}
                      />
                      {/* Sale Badge */}
                      {productItem?.salePrice && (
                        <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                          Sale
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-2 sm:p-3">
                      <h3 
                        className="font-medium text-xs sm:text-sm text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors leading-tight"
                        onClick={() => handleGetProductDetails(productItem?._id)}
                      >
                        {productItem?.title}
                      </h3>
                      
                      <p className="text-xs text-gray-500 mb-2 capitalize">
                        {productItem?.category}
                      </p>
                      
                      {/* Price */}
                      <div className="flex items-center gap-1 mb-2">
                        {productItem?.salePrice ? (
                          <>
                            <span className="text-sm sm:text-base font-bold text-gray-900">
                              ₹{productItem?.salePrice}
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                              ₹{productItem?.price}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm sm:text-base font-bold text-gray-900">
                            ₹{productItem?.price}
                          </span>
                        )}
                      </div>
                      
                      {/* Add to Cart Button */}
                      <Button
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs py-1.5 sm:py-2 rounded-md transition-colors duration-300"
                        onClick={() => handleAddtoCart(productItem?._id, productItem?.totalStock)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No products found matching your filters.</p>
                </div>
              )}
        </div>
      </div>

      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingListing;