import {
  Instagram,
  Youtube,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-800 text-white" role="contentinfo">
      {/* ✅ LocalBusiness Structured Data for SEO */}
      <Helmet>
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "MobilePhoneStore",
              "name": "Shri Mahalaxmi Mobile",
              "image": "https://shrimahalaxmimobile.in/assets/shop-banner.jpg",
              "url": "https://shrimahalaxmimobile.in",
              "telephone": "+91-9876543210",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Gujarathi Complex, Near Kanaiya Hotel, Main Road, Bhoi Lane",
                "addressLocality": "Shirpur",
                "addressRegion": "Maharashtra",
                "postalCode": "425405",
                "addressCountry": "IN"
              },
              "openingHours": "Mo-Su 09:00-21:00",
              "priceRange": "₹₹"
            }
          `}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">

          {/* Brand Section */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
              Shri Mahalaxmi Mobile
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3 sm:mb-4">
              Best Mobile Store in Shirpur — Mobiles, Accessories & Fast Delivery.
            </p>

            {/* Social Links with SEO-friendly anchor text */}
            <nav aria-label="Social Media">
              <ul className="flex justify-center sm:justify-start space-x-3">
                <li>
                  <a
                    href="https://instagram.com/mahalaxmi_mobile"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow us on Instagram"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-gray-300 hover:text-white"
                    >
                      <Instagram className="w-4 h-4" /> 
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with us on WhatsApp"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-gray-300 hover:text-white"
                    >
                      <MessageCircle className="w-4 h-4" /> 
                      <span className="sr-only">WhatsApp</span>
                    </Button>
                  </a>
                </li>
                <li>
                  <a
                    href="https://youtube.com/@mahalaxmimobile"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Subscribe on YouTube"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2 text-gray-300 hover:text-white"
                    >
                      <Youtube className="w-4 h-4" /> 
                      <span className="sr-only">YouTube</span>
                    </Button>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Quick Links */}
          <nav
            className="text-center sm:text-left"
            aria-label="Footer Navigation"
          >
            <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
              Quick Links
            </h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
              <li><a href="/about" className="hover:text-white">About Us</a></li>
              <li><a href="/privacy-policy" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="/return-policy" className="hover:text-white">Return Policy</a></li>
              <li><a href="/terms" className="hover:text-white">Terms & Conditions</a></li>
              <li><a href="/contact" className="hover:text-white">Contact</a></li>
            </ul>
          </nav>

          {/* Contact Info with <address> for SEO */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
              Contact Info
            </h4>
            <address className="not-italic text-xs sm:text-sm text-gray-300 space-y-2">
              <div className="flex items-start justify-center sm:justify-start gap-2">
                <MapPin className="w-4 h-4 text-pink-400 mt-1" />
                Gujarathi Complex, Near Kanaiya Hotel, Main Road, Bhoi Lane, Shirpur – 425405
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Phone className="w-4 h-4 text-pink-400" />
                <a href="tel:+919876543210" className="hover:text-white">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-pink-400" />
                <a href="mailto:shrimahalaxmimobile307@gmail.com" className="hover:text-white">
                  shrimahalaxmimobile307@gmail.com
                </a>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Clock className="w-4 h-4 text-pink-400" />
                Mon - Sat: 10 AM - 8 PM, Sunday: 11 AM - 7 PM
              </div>
            </address>
          </div>

          {/* Business Hours */}
          <div className="hidden lg:block text-center lg:text-left">
            <h4 className="font-semibold mb-3 text-base">Business Hours</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Mon - Sat: 10 AM - 8 PM</p>
              <p>Sunday: 11 AM - 7 PM</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-xs sm:text-sm text-gray-400">
          © {new Date().getFullYear()} Shri Mahalaxmi Mobile, Shirpur. All Rights Reserved.
          <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs">
            <span>Secure Payments</span> •{" "}
            <span>100% Genuine Products</span> •{" "}
            <span>Fast Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
