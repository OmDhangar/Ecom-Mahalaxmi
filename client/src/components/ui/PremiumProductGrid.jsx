import React from 'react';
import { useSelector } from 'react-redux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PremiumProductGrid = () => {
  const { featuredList } = useSelector((state) => state.shopProducts);

  return (
    <section className="py-6 sm:py-8 lg:py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6">
          Featured Products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredList.length > 0 ? (
            featuredList.map((productItem) => (
              <Card key={productItem._id} className="hover:shadow-lg transition-shadow duration-300">
                <div className="relative w-full aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                  <img
                    src={productItem.image}
                    alt={productItem.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm sm:text-base text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors">
                    {productItem.title}
                  </h3>
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    ₹{productItem.salePrice ? productItem.salePrice : productItem.price}
                  </p>
                  <Button
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs py-2 rounded-md transition-colors duration-300"
                    onClick={() => handleAddtoCart(productItem._id)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-gray-500">No featured products available.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default PremiumProductGrid;