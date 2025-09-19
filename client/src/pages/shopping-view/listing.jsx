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
import { sortOptions, filterOptions } from "../../config/index"; // Import filterOptions from config
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import { ArrowUpDownIcon, FilterIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useBackNavigation, useBrowserBackButton } from "@/hooks/useBackNavigation";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }

  return queryParams.join("&");
}

function ShoppingListing() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  console.log(productList);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { toast } = useToast();
  
  // Add back navigation functionality
  const { handleBackNavigation, getPreviousPage } = useBackNavigation('/');
  
  // Handle browser/phone back button
  useBrowserBackButton('/');

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


    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // or 10/15 as you prefer
    const [pagination, setPagination] = useState(null);
  
  // Fetch products with pagination
  useEffect(() => {
    if (filters !== null && sort !== null) {
       dispatch(
        fetchAllFilteredProducts({
          filterParams: { ...filters, page: currentPage, limit: itemsPerPage },
          sortParams: sort
        })
      );

    }
  }, [dispatch, sort, filters, currentPage]);
  
  // Listen for pagination info from backend
  useEffect(() => {
    if (productList && productList.pagination) {
      setPagination(productList.pagination);
    }
  }, [productList]);
  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  // Get active filters for display
 const getActiveFilters = () => {
  const activeFilters = [];
  Object.keys(filters).forEach(filterKey => {
    filters[filterKey].forEach(filterValue => {
      let filterOption;
      
      if (filterKey === 'brand') {
        // Find brand with matching ID in any category
        filterOption = Object.values(filterOptions.brand)
          .flat()
          .find(option => option.id === filterValue);
      } else {
        filterOption = filterOptions[filterKey]?.find(option => option.id === filterValue);
      }

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


  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Shop Mobiles - Shri Mahalaxmi Mobile</title>
        <meta name="description" content="Browse our wide range of mobiles and accessories. Find the perfect device for you at the best price." />
        <meta name="keywords" content="mobile listing, smartphones, shop, Mahalaxmi Mobile" />
      </Helmet>
      {/* Header with Sort */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Clear filters and use proper back navigation
                sessionStorage.removeItem("filters");
                handleBackNavigation();
              }}
              className="flex items-center gap-1 hover:bg-gray-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              All Products
            </h1>
          </div>
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
  {/* Category Filter */}
      <div className="flex-shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 text-sm whitespace-nowrap ${
                filters['category']?.length > 0 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white'
              }`}
            >
              <FilterIcon className="h-3 w-3" />
              <span>Category</span>
              {filters['category']?.length > 0 && (
                <span className="bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 text-xs">
                  {filters['category'].length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px] max-h-[300px] overflow-y-auto">
            {filterOptions.category.map((option) => (
              <div
                key={option.id}
                className={`flex items-center space-x-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                  filters['category']?.includes(option.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleFilter('category', option.id)}
              >
                <input
                  type="checkbox"
                  checked={filters['category']?.includes(option.id) || false}
                  onChange={() => {}}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{option.label}</span>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

  {/* Brand Filter - Dynamic based on selected category */}
  {filters['category']?.length > 0 && (
    <div className="flex-shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`flex items-center gap-1 text-sm whitespace-nowrap ${
              filters['brand']?.length > 0 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white'
            }`}
          >
            <FilterIcon className="h-3 w-3" />
            <span>Brand</span>
            {filters['brand']?.length > 0 && (
              <span className="bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 text-xs">
                {filters['brand'].length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px] max-h-[300px] overflow-y-auto">
          {filters['category']?.map(categoryId => {
            const brandsForCategory = filterOptions.brand[categoryId] || [];
            return brandsForCategory.map((option) => (
              <div
                key={option.id}
                className={`flex items-center space-x-2 px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                  filters['brand']?.includes(option.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleFilter('brand', option.id)}
              >
                <input
                  type="checkbox"
                  checked={filters['brand']?.includes(option.id) || false}
                  onChange={() => {}}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{option.label}</span>
              </div>
            ));
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )}
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

      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {productList && productList.data && productList.data.length > 0 ? (
            productList.data.map((productItem) => {
              const discount =
                productItem?.salePrice > 0
                  ? Math.round(((productItem.price - productItem.salePrice) / productItem.price) * 100)
                  : 0;

              return (
                <div key={productItem._id} className="w-full">
                  <div className="bg-white rounded-lg border hover:shadow-md transition-all duration-300">
                    {/* Image */}
                    <div
                      className="relative w-full aspect-square overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => handleGetProductDetails(productItem?._id)}
                    >
                      <img
                        src={productItem?.image}
                        alt={productItem?.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />

                      {/* Sale / Bestseller Badge */}
                      {productItem?.salePrice > 0 && (
                        <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                          Sale
                        </div>
                      )}
                      {productItem?.isBestseller && (
                        <div className="absolute top-1.5 right-1.5 bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded">
                          BESTSELLER
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-2 sm:p-3">
                      {/* Rating */}
                      {productItem?.rating && (
                        <div className="flex items-center gap-1 mb-1">
                          <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                            {productItem?.rating} ★
                          </span>
                          <span className="text-gray-500 text-xs">
                            | {productItem?.reviews} Reviews
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h3
                        className="font-semibold text-xs sm:text-sm text-gray-900 leading-snug cursor-pointer hover:text-blue-600 line-clamp-2"
                        onClick={() => handleGetProductDetails(productItem?._id)}
                      >
                        {productItem?.brand} - {productItem?.title}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center gap-1 mt-1">
                        {productItem?.salePrice > 0 && (
                          <span className="text-sm sm:text-base font-bold text-gray-900">
                            ₹{productItem?.salePrice}
                          </span>
                        )}
                        <span
                          className={`text-xs sm:text-sm ${
                            productItem?.salePrice > 0 ? "line-through text-gray-500" : "font-bold text-gray-900"
                          }`}
                        >
                          ₹{productItem?.price}
                        </span>
                        {discount > 0 && (
                          <span className="text-green-600 text-xs font-medium">
                            ({discount}% off)
                          </span>
                        )}
                      </div>

                      {/* Offer Price */}
                      {productItem?.offerPrice && (
                        <div className="text-green-600 text-xs sm:text-sm font-semibold mt-0.5">
                          Offer Price: ₹{productItem?.offerPrice}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
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