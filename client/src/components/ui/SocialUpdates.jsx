import { Button } from "@/components/ui/button";
import { Instagram, Youtube } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SocialConnect() {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-center mb-12">
          {t("socialConnect.heading")}
        </h2>

        {/* Social Cards */}
        <div className="flex flex-col md:flex-row justify-center gap-8">
          {/* Instagram Card */}
          <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 shadow-md hover:shadow-xl transition-transform transform hover:scale-105 w-full md:w-80">
            <Instagram className="w-12 h-12 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {t("socialConnect.instagram.title")}
            </h3>
            <p className="text-white text-sm mb-4">
              {t("socialConnect.instagram.description")}
            </p>
            <a
              href="https://www.instagram.com/bhushan_rajput_307"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="bg-white text-pink-600 font-semibold w-full hover:bg-gray-100">
                {t("socialConnect.instagram.button")}
              </Button>
            </a>
          </div>

          {/* YouTube Card */}
          <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-gradient-to-br from-red-600 to-red-400 shadow-md hover:shadow-xl transition-transform transform hover:scale-105 w-full md:w-80">
            <Youtube className="w-12 h-12 text-white mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {t("socialConnect.youtube.title")}
            </h3>
            <p className="text-white text-sm mb-4">
              {t("socialConnect.youtube.description")}
            </p>
            <a
              href="https://www.youtube.com/@bhushan_rajput_307-l2r"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="bg-white text-red-600 font-semibold w-full hover:bg-gray-100">
                {t("socialConnect.youtube.button")}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
