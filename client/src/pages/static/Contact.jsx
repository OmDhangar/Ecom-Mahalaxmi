import { Helmet } from "react-helmet-async";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Helmet>
        <title>Contact Us - Shri Mahalaxmi Mobile</title>
        <meta
          name="description"
          content="Contact Shri Mahalaxmi Mobile in Shirpur. Visit our store or reach us through phone, email, or WhatsApp."
        />
      </Helmet>

      <div className="max-w-4xl w-full text-center">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-auto max-w-2xl">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-pink-600 mt-1" />
              <div>
                <h2 className="font-semibold mb-2">Store Address</h2>
                <p className="text-gray-600">
                  Gujarathi Complex, Near Kanaiya Hotel,<br />
                  Main Road, Bhoi Lane,<br />
                  Shirpur – 425405<br />
                  Maharashtra, India
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-pink-600 mt-1" />
              <div>
                <h2 className="font-semibold mb-2">Phone</h2>
                <p className="text-gray-600">
                  <a href="tel:+919876543210" className="hover:text-pink-600">
                    +91 9699 455525
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-pink-600 mt-1" />
              <div>
                <h2 className="font-semibold mb-2">Email</h2>
                <p className="text-gray-600">
                  <a
                    href="mailto:shrimahalaxmimobile307@gmail.com"
                    className="hover:text-pink-600"
                  >
                    shrimahalaxmimobile307@gmail.com
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-pink-600 mt-1" />
              <div>
                <h2 className="font-semibold mb-2">Business Hours</h2>
                <p className="text-gray-600">
                  Monday - Saturday: 10 AM - 8 PM<br />
                  Sunday: 11 AM - 7 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}