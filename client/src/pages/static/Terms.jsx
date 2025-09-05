import { Helmet } from "react-helmet-async";

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <Helmet>
        <title>Terms & Conditions - Shri Mahalaxmi Mobile</title>
        <meta name="description" content="Terms and conditions for shopping at Shri Mahalaxmi Mobile. Learn about our policies, warranties, and customer agreements." />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>

      <div className="prose max-w-none mx-auto">
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">General Terms</h2>
          <p className="max-w-2xl mx-auto">These terms govern your use of our website and services.</p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Purchase Terms</h2>
          <ul className="list-disc pl-6 inline-block text-left">
            <li>All prices are in Indian Rupees (INR)</li>
            <li>Prices may change without notice</li>
            <li>Stock availability is subject to change</li>
            <li>Order confirmation subject to verification</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Warranty Terms</h2>
          <ul className="list-disc pl-6 inline-block text-left">
            <li>Manufacturer warranty as applicable</li>
            <li>Store warranty as specified per product</li>
            <li>Warranty void if seal broken/tampered</li>
          </ul>
        </section>
      </div>
    </div>
  );
}