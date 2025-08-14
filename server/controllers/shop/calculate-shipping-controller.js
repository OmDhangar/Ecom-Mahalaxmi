const axios = require('axios');
const Product = require('../../models/Product');

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
let shiprocketToken = null;
let tokenExpiry = null;

// Fixed authentication function for Shiprocket
const authenticateShiprocket = async () => {
  if (shiprocketToken && tokenExpiry && new Date() < tokenExpiry) {
    return shiprocketToken;
  }
  
  try {
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    if (response.data && response.data.token) {
      shiprocketToken = response.data.token;
      // Token expires in 10 days, but we'll refresh after 9 days for safety
      tokenExpiry = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
      return shiprocketToken;
    } else {
      throw new Error('Invalid response from Shiprocket authentication');
    }
  } catch (error) {
    console.error('Shiprocket Authentication Error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Shiprocket API');
  }
};

// POST /api/shipping/calculate
const calculateShippingCharge = async (req, res) => {
  try {
    const { cartItems, deliveryPincode } = req.body;

    if (!cartItems || !deliveryPincode) {
      return res.status(400).json({ 
        success: false, 
        message: "cartItems and deliveryPincode are required" 
      });
    }

    console.log('Cart Items:', cartItems);
    console.log('Delivery Pincode:', deliveryPincode);

    // Check if Shiprocket credentials are available
    if (!process.env.SHIPROCKET_EMAIL || !process.env.SHIPROCKET_PASSWORD) {
      console.warn('Shiprocket credentials not found, using fallback shipping charge');
      return res.status(200).json({
        success: true,
        shippingCharge: 50,
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
        return res.status(404).json({ 
          success: false, 
          message: `Product not found: ${item.productId}` 
        });
      }

      const quantity = item.quantity || 1;
      totalWeight += (product.weight || 0.5) * quantity;
      maxLength = Math.max(maxLength, product.length || 10);
      maxBreadth = Math.max(maxBreadth, product.breadth || 10);
      totalHeight += (product.height || 5) * quantity;
      totalValue += (item.price || product.price || 100) * quantity;
    }

    // Ensure minimum values as per Shiprocket requirements
    totalWeight = Math.max(totalWeight, 0.5); // Minimum 0.5kg
    totalValue = Math.max(totalValue, 100); // Minimum value for insurance
    maxLength = Math.max(maxLength, 10);
    maxBreadth = Math.max(maxBreadth, 10);
    totalHeight = Math.max(totalHeight, 5);

    try {
      // Authenticate with Shiprocket
      const token = await authenticateShiprocket();

      // Fixed Shiprocket serviceability API request
      const requestParams = {
        pickup_postcode: process.env.SHIPROCKET_PICKUP_PINCODE || "110001",
        delivery_postcode: deliveryPincode,
        cod: 0, // Use 0 for false, 1 for true
        weight: totalWeight,
        declared_value: totalValue
      };

      console.log('Shiprocket Request Params:', requestParams);

      // Use GET request with query parameters for serviceability check
      const response = await axios.get(
        `${SHIPROCKET_BASE_URL}/courier/serviceability/`,
        {
          params: requestParams,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000 // 15 second timeout
        }
      );

      console.log('Shiprocket Response:', response.data);

      // Handle Shiprocket response structure
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response structure from Shiprocket API');
      }

      const responseData = response.data.data;
      const availableCouriers = responseData.available_courier_companies || [];
      
      if (availableCouriers.length === 0) {
        return res.status(200).json({
          success: true,
          shippingCharge: 75,
          courierName: "Standard Delivery",
          courierService: "Surface",
          note: "No courier services available for this pincode, using standard rate"
        });
      }

      // Sort by rate (ascending) to get cheapest option
      const sortedOptions = availableCouriers
        .filter(courier => courier.rate && courier.rate > 0)
        .sort((a, b) => (a.rate || 999) - (b.rate || 999));
      
      if (sortedOptions.length === 0) {
        throw new Error('No valid courier options with pricing available');
      }

      const cheapestOption = sortedOptions[0];

      res.status(200).json({
        success: true,
        shippingCharge: Math.round(cheapestOption.rate || 60),
        courierName: cheapestOption.courier_name || "Standard Delivery",
        courierService: cheapestOption.courier_type || "Surface",
        etd: cheapestOption.etd || "5-7 days",
        cod_charges: cheapestOption.cod_charges || 0,
        freight_charge: cheapestOption.freight_charge || cheapestOption.rate,
        other_charges: cheapestOption.other_charges || 0,
        allOptions: sortedOptions.slice(0, 3).map(option => ({
          courier_name: option.courier_name,
          rate: Math.round(option.rate || 0),
          etd: option.etd,
          cod_charges: option.cod_charges || 0
        }))
      });

    } catch (shiprocketError) {
      console.error('Shiprocket API Error:', {
        message: shiprocketError.message,
        response: shiprocketError.response?.data,
        status: shiprocketError.response?.status,
        config: {
          url: shiprocketError.config?.url,
          method: shiprocketError.config?.method,
          params: shiprocketError.config?.params
        }
      });
      
      // More specific error handling
      if (shiprocketError.response?.status === 401) {
        // Reset token on authentication error
        shiprocketToken = null;
        tokenExpiry = null;
        
        return res.status(200).json({
          success: true,
          shippingCharge: 70,
          courierName: "Standard Delivery",
          courierService: "Surface",
          note: "Authentication failed with Shiprocket, using standard rate. Please check API credentials."
        });
      }
      
      if (shiprocketError.response?.status === 422) {
        return res.status(200).json({
          success: true,
          shippingCharge: 80,
          courierName: "Standard Delivery",
          courierService: "Surface",
          note: "Invalid pincode or service not available, using standard rate"
        });
      }
      
      // Fallback to standard shipping charge if Shiprocket fails
      return res.status(200).json({
        success: true,
        shippingCharge: 60,
        courierName: "Standard Delivery",
        courierService: "Surface",
        note: "Shiprocket API temporarily unavailable, using standard shipping rate"
      });
    }

  } catch (error) {
    console.error('Shipping calculation error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to calculate shipping charges",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Additional helper function to validate pincode
const validatePincode = (pincode) => {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
};

// Function to create Shiprocket order (for reference)
const createShiprocketOrder = async (orderData) => {
  try {
    const token = await authenticateShiprocket();
    
    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/orders/create/adhoc`,
      orderData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Create Shiprocket Order Error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  calculateShippingCharge,
  createShiprocketOrder,
  validatePincode
};