import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllFilteredProducts, markAsFeatured } from "@/store/shop/products-slice";
import { categoryOptionsMap } from "@/config";
import { Helmet } from "react-helmet";

const Dashboard = () => {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [featuredDetails, setFeaturedDetails] = useState({});

  const { isLoading, productList, error } = useSelector((state) => state.shopProducts);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Admin dashboard can show 10 items per page
  const [pagination, setPagination] = useState(null);

  const fetchProducts = () => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {
          ...(selectedCategory ? { category: selectedCategory } : {}),
          page: currentPage, // Pass current page
          limit: itemsPerPage, // Pass items per page
        },
        sortParams: "price-lowtohigh",
      })
    );
  };

  useEffect(() => {
    fetchProducts();
  }, [dispatch, selectedCategory, currentPage]); // Add currentPage to dependencies

  // Listen for pagination info from backend
  useEffect(() => {
    if (productList && productList.pagination) {
      setPagination(productList.pagination);
    }
  }, [productList]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to first page when category changes
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handleMarkAsFeaturedClick = (productId) => {
    setFeaturedDetails((prev) => ({
      ...prev,
      [productId]: {
        description: "",
        showForm: true,
      },
    }));
  };

  const handleDescChange = (productId, value) => {
    setFeaturedDetails((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        description: value,
      },
    }));
  };

  const handleFeatureSubmit = async (productId) => {
    const data = featuredDetails[productId];
    if (!data || !data.description.trim()) {
      return console.error(`Description is required for product: ${productId}`);
    }

    try {
      await dispatch(
        markAsFeatured({
          id: productId,
          isFeatured: true,
          featuredDescription: data.description,
        })
      );

      // Clear local state after successful submission
      setFeaturedDetails((prev) => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });

      fetchProducts(); // Refresh to get updated data from backend
    } catch (error) {
      console.error("Error marking product as featured:", error);
    }
  };

  const handleCancelFeature = (productId) => {
    setFeaturedDetails((prev) => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  const handleStartEdit = (product) => {
    setFeaturedDetails((prev) => ({
      ...prev,
      [product._id]: {
        description: product.featuredDescription || "",
        showForm: true,
        editing: true,
      },
    }));
  };

  const handleEditSubmit = async (productId) => {
    const data = featuredDetails[productId];
    if (!data || !data.description.trim()) {
      return console.error(`Description is required for product: ${productId}`);
    }

    try {
      await dispatch(
        markAsFeatured({
          id: productId,
          isFeatured: true,
          featuredDescription: data.description,
        })
      );

      // Clear local state after successful submission
      setFeaturedDetails((prev) => {
        const newState = { ...prev };
        delete newState[productId];
        return newState;
      });

      fetchProducts(); // Refresh to get updated data from backend
    } catch (error) {
      console.error("Error updating featured product:", error);
    }
  };

  const handleDeleteFeatured = async (productId) => {
    try {
      await dispatch(
        markAsFeatured({
          id: productId,
          isFeatured: false,
          featuredDescription: "",
        })
      );
      fetchProducts();
    } catch (error) {
      console.error("Error removing featured status:", error);
    }
  };

  return (
    <div className="p-4">
      <Helmet>
        <title>Admin Dashboard - Shri Mahalaxmi Mobile</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <h1 className="text-2xl font-bold mb-4">Shop Dashboard</h1>

      {/* Category Filter */}
      <select
        value={selectedCategory}
        onChange={handleCategoryChange}
        className="border p-2 mb-4"
      >
        <option value="">All Categories</option>
        {Object.entries(categoryOptionsMap).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

      {isLoading && <p>Loading products...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {productList?.data && Array.isArray(productList.data) &&
          productList.data.map((product) => {
            const localState = featuredDetails[product._id] || {};
            const showForm = localState.showForm || false;
            const isEditing = localState.editing || false;
            const desc = localState.description ?? "";

            return (
              <div key={product._id} className="border p-4 rounded shadow">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-40 object-cover mb-2"
                />
                <h2 className="text-lg font-semibold">{product.title}</h2>
                <p className="text-gray-600">{product.brand}</p>
                <p className="text-green-600 font-bold">₹{product.price}</p>

                <div className="mt-2">
                  {/* Show Edit/Delete buttons only for products that are actually featured (from backend) */}
                  {product.isFeatured && !showForm ? (
                    <div className="space-y-2">
                      <p className="text-sm text-blue-600 font-medium">
                        ⭐ Featured: {product.featuredDescription}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartEdit(product)}
                          className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFeatured(product._id)}
                          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                        >
                          Remove Featured
                        </button>
                      </div>
                    </div>
                  ) : showForm ? (
                    /* Show form for marking as featured or editing */
                    <div className="space-y-2">
                      <textarea
                        placeholder="Why is this product featured?"
                        className="w-full border p-2 rounded"
                        value={desc}
                        onChange={(e) => handleDescChange(product._id, e.target.value)}
                        rows="3"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            isEditing
                              ? handleEditSubmit(product._id)
                              : handleFeatureSubmit(product._id)
                          }
                          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                          disabled={!desc.trim()}
                        >
                          {isEditing ? "Update Featured" : "Mark as Featured"}
                        </button>
                        <button
                          onClick={() => handleCancelFeature(product._id)}
                          className="bg-gray-500 text-white px-4 py-1 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Show "Mark as Featured" button only for non-featured products */
                    !product.isFeatured && (
                      <button
                        onClick={() => handleMarkAsFeaturedClick(product._id)}
                        className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                      >
                        Mark as Featured
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === pagination.totalPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;