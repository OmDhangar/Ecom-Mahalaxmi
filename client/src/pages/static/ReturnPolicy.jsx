import { Helmet } from "react-helmet-async";

export default function ReturnPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <Helmet>
        <title>Return Policy - Shri Mahalaxmi Mobile</title>
        <meta name="description" content="Our return policy for mobile phones and accessories. Learn about our warranty, returns, and refund process." />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">Return Policy</h1>

      <div className="prose max-w-none mx-auto">
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">New Products</h2>
          <ul className="list-disc pl-6 inline-block text-left">
            <li>7-day return policy for unopened items</li>
            <li>Manufacturer warranty applies as per brand policy</li>
            <li>Dead on arrival (DOA) items eligible for immediate replacement</li>
            <li>Original packaging and accessories must be intact</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Used/Refurbished Products</h2>
          <ul className="list-disc pl-6 inline-block text-left">
            <li>3-day inspection period</li>
            <li>15-day warranty on refurbished items</li>
            <li>Condition as described guarantee</li>
            <li>Technical inspection before return approval</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Non-Returnable Items</h2>
          <ul className="list-disc pl-6 inline-block text-left">
            <li>Opened software or digital products</li>
            <li>Personalized/custom items</li>
            <li>Personal accessories (earphones, cases)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}