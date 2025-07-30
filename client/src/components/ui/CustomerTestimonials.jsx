import { Star, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function CustomerTestimonials() {
  const { t } = useTranslation();
  const testimonials = t("testimonials.items", { returnObjects: true });

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">
          {t("testimonials.heading")}
        </h2>
        <p className="text-gray-500 mb-8 text-sm sm:text-base">
          {t("testimonials.subheading")}
        </p>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-5 sm:p-6 rounded-2xl shadow hover:shadow-md transition"
            >
              <div className="flex flex-col items-center mb-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mb-2"
                />
                <h3 className="font-bold text-sm sm:text-base">
                  {testimonial.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {testimonial.product}
                </p>
              </div>
              <div className="flex justify-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                "{testimonial.feedback}"
              </p>
            </div>
          ))}
        </div>

        {/* Trusted Badge */}
        <div className="inline-flex items-center gap-3 bg-white rounded-full px-5 py-2 sm:px-6 sm:py-3 shadow-md text-xs sm:text-sm">
          <ShieldCheck className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-gray-700 font-semibold">
            {t("testimonials.trusted")}
          </span>
        </div>
      </div>
    </section>
  );
}
