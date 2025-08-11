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

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-800 text-white">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">

          {/* Brand Section */}
          <div className="text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">
              {t("footer.company.name")}
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3 sm:mb-4">
              {t("footer.company.description")}
            </p>

            {/* Social Links */}
            <div className="flex justify-center sm:justify-start space-x-3">
              <a
                href="https://instagram.com/mahalaxmi_mobile"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:text-white">
                  <Instagram className="w-4 h-4" />
                </Button>
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:text-white">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </a>
              <a
                href="https://youtube.com/@mahalaxmimobile"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" className="p-2 text-gray-300 hover:text-white">
                  <Youtube className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
              {t("footer.quickLinks.title")}
            </h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
              <li><a href="/about" className="hover:text-white">{t("footer.quickLinks.about")}</a></li>
              <li><a href="/privacy-policy" className="hover:text-white">{t("footer.quickLinks.privacy")}</a></li>
              <li><a href="/return-policy" className="hover:text-white">{t("footer.quickLinks.return")}</a></li>
              <li><a href="/terms" className="hover:text-white">{t("footer.quickLinks.terms")}</a></li>
              <li><a href="/contact" className="hover:text-white">{t("footer.quickLinks.contact")}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
              {t("footer.contact.title")}
            </h4>
            <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
              <li className="flex items-start justify-center sm:justify-start gap-2">
                <MapPin className="w-4 h-4 text-pink-400 mt-1" />
                {t("footer.contact.address")}
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <Phone className="w-4 h-4 text-pink-400" />
                {t("footer.contact.phone")}
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-pink-400" />
                {t("footer.contact.email")}
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2">
                <Clock className="w-4 h-4 text-pink-400" />
                {t("footer.contact.hours")}
              </li>
            </ul>
          </div>

          {/* Business Hours (only on lg+) */}
          <div className="hidden lg:block text-center lg:text-left">
            <h4 className="font-semibold mb-3 text-base">Business Hours</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Mon - Sat: 10 AM - 8 PM</p>
              <p>Sunday: 11 AM - 7 PM</p>
              <p className="text-xs text-yellow-400 mt-2">Same day delivery available</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-6 pt-4 text-center text-xs sm:text-sm text-gray-400">
          {t("footer.bottom.text")}
          <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs">
            <span>{t("footer.bottom.securePayments")}</span> •{" "}
            <span>{t("footer.bottom.genuineProducts")}</span> •{" "}
            <span>{t("footer.bottom.fastDelivery")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
