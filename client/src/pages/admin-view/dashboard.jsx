import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllFilteredProducts, markAsFeatured } from "@/store/shop/products-slice";
import { categoryOptionsMap } from "@/config";

const Dashboard = () => {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [featuredDetails, setFeaturedDetails] = useState({});

  const { isLoading, productList, error } = useSelector((state) => state.shopProducts);

  useEffect(() => {
    dispatch(fetchAllFilteredProducts({
      filterParams: selectedCategory ? { category: selectedCategory } : {},
      sortParams: "price-lowtohigh",
    }));
  }, [dispatch, selectedCategory]);


  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const toggleFeatured = (productId) => {
    setFeaturedDetails((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        featured: !prev[productId]?.featured,
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
    if (!data) return console.error(`Data not Found:${data}`);

    await dispatch(
      markAsFeatured({
        id: productId,
        featured: data.featured,
        featuredDescription: data.description,
      })
    );

    setFeaturedDetails((prev) => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });

    dispatch(fetchAllFilteredProducts({ category: selectedCategory }));
  };

  const handleStartEdit = (product) => {
    setFeaturedDetails((prev) => ({
      ...prev,
      [product._id]: {
        featured: true,
        description: product.featuredDescription || "",
        editing: true,
      },
    }));
  };

  const handleDeleteFeatured = async (productId) => {
    await dispatch(
      markAsFeatured({
        id: productId,
        featured: false,
        featuredDescription: "",
      })
    );
    dispatch(fetchAllFilteredProducts({ category: selectedCategory }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Shop Dashboard</h1>

      {/* Category Filter Dropdown */}
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
        {productList?.map((product) => {
          const localState = featuredDetails[product._id] || {};
          const isEditing = localState.editing || false;
          const isFeatured = product.featured || localState.featured;
          const desc = localState.description ?? product.featuredDescription ?? "";

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
                {isFeatured && !isEditing ? (
                  // ✅ Already featured: show Edit & Delete
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStartEdit(product)}
                      className="bg-yellow-500 text-white px-4 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteFeatured(product._id)}
                      className="bg-red-500 text-white px-4 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  // 🆕 New or Editing
                  <>
                    <label className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        checked={localState.featured || false}
                        onChange={() => toggleFeatured(product._id)}
                      />
                      <span>Mark as Featured</span>
                    </label>

                    {localState.featured && (
                      <div className="mt-2">
                        <textarea
                          placeholder="Why is it featured?"
                          className="w-full border p-2"
                          value={desc}
                          onChange={(e) =>
                            handleDescChange(product._id, e.target.value)
                          }
                        />
                        <button
                          onClick={() => handleFeatureSubmit(product._id)}
                          className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
                        >
                          Save Feature Info
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
