import React from "react";
import { motion } from "framer-motion";

const questions = [
  {
    id: 1,
    question: "Revenue growth",
    answer:
      "Earn more—up to 31% more—and spend less time doing it with Athena's built-in payment processor, TCommerce. Get an all-in-one solution for advanced sales tools, payment processing, and easy tax management.",
    imagePosition: "right",
    imageBg: "bg-gradient-to-br from-orange-400 to-orange-500",
    placeholder: "Payment Method Selection",
  },
  {
    id: 2,
    question: "Product diversification",
    answer:
      "Expand how you offer and sell education. Deliver comprehensive courses, live coaching sessions, exclusive memberships and subscriptions, private communities, and more. Build new revenue streams and expand your business by offering more ways to learn with Athena.",
    imagePosition: "left",
    imageBg: "bg-gradient-to-br from-gray-300 to-gray-400",
    placeholder: "Membership Cards",
  },
  {
    id: 3,
    question: "Workforce training",
    answer:
      "Invest in your team's growth. Improve job satisfaction while boosting productivity, retention, and results for your organization. Athena Plus supports onboarding, upskilling, sales enablement, and talent development. Businesses have seen 75% reduction in onboarding time with Athena Plus.",
    imagePosition: "right",
    imageBg: "bg-gradient-to-br from-blue-300 to-blue-400",
    placeholder: "Course Creation",
  },
  {
    id: 4,
    question: "Demonstrate business ROI",
    answer:
      "Make smarter business decisions. Build custom dashboards for internal stakeholders or B2B partners that focus on the metrics they want to see, and have reports automatically emailed at your desired cadence. Use reporting tools that show visitor and student behaviour, engagement data, business revenue, and program performance.",
    imagePosition: "left",
    imageBg: "bg-gradient-to-br from-green-300 to-green-400",
    placeholder: "Analytics Dashboard",
  },
];

export default function CompanyAnswer() {
  return (
    <section className="relative bg-gradient-to-b from-blue-50 via-blue-50/50 to-white py-20 sm:py-24 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-24"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-gray-900 mb-6 leading-tight">
            The solution to your biggest{" "}
            <span className="text-blue-600">business needs</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Education might be only one part of your broader business model—but we'll make sure it's running smoothly as the rest of your operation. You want recurring revenue and impact, and here are some ways Athena can help.
          </p>
        </motion.div>

        {/* Q&A Sections */}
        <div className="space-y-20 lg:space-y-32">
          {questions.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                item.imagePosition === "left" ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Content Side */}
              <div
                className={`${
                  item.imagePosition === "left" ? "lg:order-2" : "lg:order-1"
                } flex flex-col justify-center`}
              >
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal text-gray-900 mb-6 leading-tight">
                  {item.question}
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6">
                  {item.answer}
                </p>
                {/* Decorative underline */}
                <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-blue-200 rounded-full" />
              </div>

              {/* Image Side */}
              <div
                className={`${
                  item.imagePosition === "left" ? "lg:order-1" : "lg:order-2"
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className={`relative ${item.imageBg} rounded-3xl shadow-2xl overflow-hidden h-[400px] lg:h-[450px] flex items-center justify-center group`}
                >
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/10" />
                  
                  {/* White card placeholder */}
                  <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 m-8 w-4/5 h-3/4 flex items-center justify-center transition-all duration-300 group-hover:shadow-3xl">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                        <svg
                          className="w-12 h-12 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">
                        {item.placeholder}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
