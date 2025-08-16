import { useLocation, Link } from "react-router-dom";

function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
      <h1 className="text-3xl font-bold text-green-700">🎉 Order Successful!</h1>
      <p className="mt-2 text-lg">Thank you for your purchase.</p>

      {order && (
        <div className="mt-4 p-4 bg-white shadow rounded w-80 text-center">
          <p><strong>Order ID:</strong> {order._id}</p>
          <p><strong>Total:</strong> ₹{order.totalAmount}</p>
          <p><strong>Status:</strong> {order.orderStatus}</p>
        </div>
      )}

      <Link to="/home" className="mt-6 bg-green-600 text-white px-6 py-2 rounded">
        Continue Shopping
      </Link>
    </div>
  );
}

export default OrderSuccess;
