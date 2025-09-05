import { Helmet } from "react-helmet-async";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <Helmet>
        <title>Privacy Policy - Shri Mahalaxmi Mobile</title>
        <meta name="description" content="Our privacy policy explains how we collect, use, and protect your personal information when you shop with us." />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <div className="prose max-w-none mx-auto">
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <ul className="list-disc pl-6 inline-block text-left">
            <li>Name and contact information</li>
            <li>Delivery address</li>
            <li>Payment information</li>
            <li>Device information</li>
            <li>Shopping preferences</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 inline-block text-left">
            <li>Process your orders</li>
            <li>Communicate about your orders</li>
            <li>Send important updates</li>
            <li>Improve our services</li>
            <li>Prevent fraud</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="max-w-2xl mx-auto">
            We implement appropriate security measures to protect your personal information.
          </p>
        </section>
      </div>
    </div>
  );
}