import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Cloud,
  Zap,
  Users,
  FileText,
  Lock,
} from "lucide-react";

const securityFeatures = [
  {
    id: 1,
    title: "Built-in security and SSL",
    description:
      "Have peace of mind while using Athena's seamless built-in SSL certificates. Rest assured your content is automatically served securely, and that your sensitive data is protected.",
    icon: FileText,
    iconBg: "bg-orange-500",
    badge: Shield,
  },
  {
    id: 2,
    title: "Secure cloud hosting and daily backups",
    description:
      "Trust that your business is protected against data loss and that your content is safe with reliable cloud-hosting.",
    icon: Cloud,
    iconBg: "bg-blue-500",
    badge: Shield,
  },
  {
    id: 3,
    title: "Instant access to updates",
    description:
      "Never worry about missing a new feature or version of Athena. All platform updates are automatic, so you always have access to the latest features.",
    icon: Users,
    iconBg: "bg-teal-500",
    badge: Zap,
  },
  {
    id: 4,
    title: "Single Sign On (SSO) OpenID Connect",
    description:
      "Integrate your learning environment into your existing website with single sign-on (SSO) for an integrated brand experience.",
    icon: Users,
    iconBg: "bg-blue-600",
    badge: Lock,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function CompanyEnterprise() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-50 py-20 sm:py-24 lg:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal text-gray-800 mb-6 leading-tight">
            Enterprise-grade security
          </h2>
        </motion.div>

        {/* Security Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {securityFeatures.map((feature) => {
            const Icon = feature.icon;
            const Badge = feature.badge;
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                className="group"
              >
                <div className="relative h-full bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-blue-200">
                  {/* Icon Section */}
                  <div className="relative mb-6">
                    <div className={`${feature.iconBg} w-16 h-16 rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>
                    
                    {/* Badge Icon */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <Badge className="w-3 h-3 text-white" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-gray-800">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 leading-tight">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
