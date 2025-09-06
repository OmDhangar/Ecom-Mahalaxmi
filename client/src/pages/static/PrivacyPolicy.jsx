import { Helmet } from "react-helmet-async";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <Helmet>
        <title>Privacy Policy - Shri Mahalaxmi Mobile</title>
        <meta
          name="description"
          content="Our privacy policy explains how we collect, use, and protect your personal information when you shop with us."
        />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <div className="prose max-w-none mx-auto">
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <ul className="list-disc pl-6 inline-block text-left">
            <li>Name and contact information</li>
            <li>Delivery address</li>
            <li>Payment information (processed securely by Razorpay)</li>
            <li>Device information</li>
            <li>Shopping preferences</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 inline-block text-left">
            <li>Process and deliver your orders</li>
            <li>Communicate about your orders and support requests</li>
            <li>Send important service updates</li>
            <li>Improve our products and services</li>
            <li>Prevent fraudulent transactions</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Payment Information</h2>
          <p className="max-w-2xl mx-auto">
            We do not store your card or UPI details on our servers. All payment
            transactions are securely processed through trusted payment gateway
            providers such as Razorpay, in compliance with applicable industry
            standards.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
          <p className="max-w-2xl mx-auto">
            We do not sell or trade your personal information. We may share your
            details only with trusted third parties such as payment processors,
            shipping providers, or legal authorities (if required).
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">User Rights</h2>
          <p className="max-w-2xl mx-auto">
            You have the right to access, update, or request deletion of your
            personal information by contacting us at{" "}
            <strong>[your support email]</strong>.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="max-w-2xl mx-auto">
            We implement appropriate security measures to safeguard your
            personal data and maintain confidentiality. However, no method of
            electronic storage or transmission is 100% secure, and we cannot
            guarantee absolute security.
          </p>
        </section>
      </div>
    </div>
  );
}
