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

        {/* Mobile: horizontal scroll | Desktop: grid */}
        <div
          role="list"
          aria-label="Customer testimonials"
          className="
            flex sm:grid sm:grid-cols-2 lg:grid-cols-4
            gap-4 sm:gap-6
            overflow-x-auto sm:overflow-visible
            scroll-smooth pb-3
            -mx-4 px-4
            snap-x snap-mandatory
          "
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {testimonials.map((testimonial, index) => (
            <div
              role="listitem"
              key={index}
              className="flex-shrink-0 w-72 sm:w-auto sm:flex-shrink snap-center"
            >
              <div className="bg-white p-5 sm:p-6 rounded-2xl shadow hover:shadow-md transition h-full">
                <div className="flex flex-col items-center mb-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mb-2"
                    loading="lazy"
                    width="48"
                    height="48"
                  />
                  <h3 className="font-bold text-sm sm:text-base">
                    {testimonial.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {testimonial.product}
                  </p>
                </div>

                <div className="flex justify-center mb-3" aria-label="5 star rating">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400"
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-gray-600">
                  “{testimonial.feedback}”
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile scroll hint */}
        <div className="flex justify-center mt-4 sm:hidden">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <span>👈</span> Swipe to read more <span>👉</span>
          </p>
        </div>

        {/* Trusted Badge */}
        <div className="inline-flex items-center gap-3 bg-white rounded-full px-5 py-2 sm:px-6 sm:py-3 shadow-md text-xs sm:text-sm mt-8">
          <ShieldCheck className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-gray-700 font-semibold">
            {t("testimonials.trusted")}
          </span>
        </div>
      </div>
    </section>
  );
}
