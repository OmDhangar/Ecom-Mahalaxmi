const axios = require('axios');
const Product = require('../../models/Product');

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
let shiprocketToken = null;
let tokenExpiry = null;

// Reuse your existing auth function for Shiprocket
const authenticateShiprocket = async () => {
  if (shiprocketToken && tokenExpiry && new Date() < tokenExpiry) {
    return shiprocketToken;
  }
  const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD
  });
  shiprocketToken = response.data.token;
  tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000); // 9 days expiry
  return shiprocketToken;
};

// POST /api/shipping/calculate
const calculateShippingCharge = async (req, res) => {
  try {
    const { cartItems, deliveryPincode } = req.body;

    if (!cartItems || !deliveryPincode) {
      return res.status(400).json({ success: false, message: "cartItems and deliveryPincode are required" });
    }

    console.log('Cart Items:', cartItems);
    console.log('Delivery Pincode:', deliveryPincode);

    // Check if Shiprocket credentials are available
    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      console.warn('Shiprocket credentials not found, using fallback shipping charge');
      return res.status(200).json({
        success: true,
        shippingCharge: 50, // Fallback shipping charge
        courierName: "Standard Delivery",
        courierService: "Surface",
        note: "Using fallback rate - Shiprocket integration not configured"
      });
    }

    // Aggregate total weight and max dimensions from products in cart
    let totalWeight = 0;
    let maxLength = 0, maxBreadth = 0, totalHeight = 0;
    let totalValue = 0;

    // Fetch product details and calculate totals
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }

      const quantity = item.quantity || 1;
      totalWeight += (product.weight || 0.5) * quantity;
      maxLength = Math.max(maxLength, product.length || 10);
      maxBreadth = Math.max(maxBreadth, product.breadth || 10);
      totalHeight += (product.height || 5) * quantity;
      totalValue += (item.price || product.price || 100) * quantity;
    }

    try {
      // Authenticate with Shiprocket
      const token = await authenticateShiprocket();

      // Prepare Shiprocket serviceability API request according to their docs
      const requestData = {
        pickup_postcode: process.env.SHIPROCKET_PICKUP_PINCODE || "110001", // Default Delhi pincode
        delivery_postcode: deliveryPincode,
        cod: false, // Set to true if COD is required
        weight: Math.max(totalWeight, 0.5), // Minimum 0.5kg
        declared_value: Math.max(totalValue, 100) // Minimum value for insurance
      };

      console.log('Shiprocket Request:', requestData);

      const response = await axios.get(
        `${SHIPROCKET_BASE_URL}/courier/serviceability/`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('Shiprocket Response:', response.data);

      // Handle Shiprocket response structure
      if (!response.data || response.data.status !== 200) {
        throw new Error('Invalid response from Shiprocket API');
      }

      const availableCouriers = response.data.data?.available_courier_companies || [];
      
      if (availableCouriers.length === 0) {
        return res.status(200).json({
          success: true,
          shippingCharge: 75, // Fallback for unavailable locations
          courierName: "Standard Delivery",
          courierService: "Surface",
          note: "No courier services available for this pincode, using standard rate"
        });
      }

      // Sort by rate (ascending) to get cheapest option
      const sortedOptions = availableCouriers.sort((a, b) => a.rate - b.rate);
      const cheapestOption = sortedOptions[0];

      res.status(200).json({
        success: true,
        shippingCharge: cheapestOption.rate,
        courierName: cheapestOption.courier_name,
        courierService: cheapestOption.courier_name,
        etd: cheapestOption.etd,
        allOptions: sortedOptions.slice(0, 3) // Return top 3 options
      });

    } catch (shiprocketError) {
      console.error('Shiprocket API Error:', shiprocketError.response?.data || shiprocketError.message);
      
      // Fallback to standard shipping charge if Shiprocket fails
      return res.status(200).json({
        success: true,
        shippingCharge: 60, // Standard fallback rate
        courierName: "Standard Delivery",
        courierService: "Surface",
        note: "Shiprocket API unavailable, using standard shipping rate"
      });
    }

  } catch (error) {
    console.error('Shipping calculation error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to calculate shipping charges",
      error: error.message 
    });
  }
};

module.exports = {
  calculateShippingCharge,
};
