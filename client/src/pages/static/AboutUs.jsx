import { Helmet } from "react-helmet-async";

export default function AboutUs() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <Helmet>
        <title>About Us - Shri Mahalaxmi Mobile</title>
        <meta name="description" content="Learn about Shri Mahalaxmi Mobile, Shirpur's leading mobile phone and accessories store. Trusted by thousands of customers since our establishment." />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">About Shri Mahalaxmi Mobile</h1>
      
      <div className="prose max-w-none mx-auto">
        <p className="mb-4 max-w-2xl mx-auto">
          Established in Shirpur, Maharashtra, Shri Mahalaxmi Mobile has been serving our community with premium mobile phones and accessories since our inception. Our commitment to quality, authenticity, and customer satisfaction has made us the most trusted mobile store in the region.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Our Mission</h2>
        <p className="mb-4 max-w-2xl mx-auto">
          To provide our customers with genuine mobile products, exceptional service, and the latest technology at competitive prices.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">Why Choose Us?</h2>
        <ul className="list-disc pl-6 mb-4 inline-block text-left">
          <li>100% Genuine Products</li>
          <li>Competitive Prices</li>
          <li>Expert Technical Support</li>
          <li>Wide Range of Products</li>
          <li>Fast Delivery</li>
          <li>Professional After-Sales Service</li>
        </ul>
      </div>
    </div>
  );
}