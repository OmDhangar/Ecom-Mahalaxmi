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

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-gray-200 py-10">
      <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center sm:text-left">
        {/* Company Info */}
        <div>
          <h3 className="text-xl font-bold mb-3 text-white">
            {t("footer.company.name")}
          </h3>
          <p className="text-gray-400 mb-4 text-sm sm:text-base">
            {t("footer.company.description")}
          </p>

          {/* Social Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
            <a
              href="https://instagram.com/mahalaxmi_mobile"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md transition text-sm"
            >
              <Instagram className="w-4 h-4" /> Instagram
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md transition text-sm"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a
              href="https://youtube.com/@mahalaxmimobile"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-md transition text-sm"
            >
              <Youtube className="w-4 h-4" /> YouTube
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">
            {t("footer.quickLinks.title")}
          </h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li>
              <a href="/about" className="hover:text-white">
                {t("footer.quickLinks.about")}
              </a>
            </li>
            <li>
              <a href="/privacy-policy" className="hover:text-white">
                {t("footer.quickLinks.privacy")}
              </a>
            </li>
            <li>
              <a href="/return-policy" className="hover:text-white">
                {t("footer.quickLinks.return")}
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-white">
                {t("footer.quickLinks.terms")}
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-white">
                {t("footer.quickLinks.contact")}
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">
            {t("footer.contact.title")}
          </h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-start justify-center sm:justify-start gap-2">
              <MapPin className="w-4 h-4 mt-1 text-pink-400" />
              {t("footer.contact.address")}
            </li>
            <li className="flex items-center justify-center sm:justify-start gap-2">
              <Phone className="w-4 h-4 text-pink-400" /> {t("footer.contact.phone")}
            </li>
            <li className="flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4 text-pink-400" /> {t("footer.contact.email")}
            </li>
            <li className="flex items-center justify-center sm:justify-start gap-2">
              <Clock className="w-4 h-4 text-pink-400" /> {t("footer.contact.hours")}
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400 text-xs sm:text-sm">
        {t("footer.bottom.text")}
        <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs">
          <span>{t("footer.bottom.securePayments")}</span> •{" "}
          <span>{t("footer.bottom.genuineProducts")}</span> •{" "}
          <span>{t("footer.bottom.fastDelivery")}</span>
        </div>
      </div>
    </footer>
  );
}
