"use client";
import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShoppingCart, CreditCard, Layers, BarChart3, Brain, Puzzle } from 'lucide-react';

const FeatureCard = ({ title, desc, icon: Icon, className = "" }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      onMouseMove={onMouseMove}
      whileHover={{ y: -5 }}
      className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/50 p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-sky-500/10 ${className}`}
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition group-hover:opacity-100"
        style={{
          background: useMotionValue(`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(14, 165, 233, 0.1), transparent 80%)`),
        }}
      />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-600 group-hover:text-white">
          <Icon size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
      </div>
    </motion.div>
  );
};

export default function AthenaOffers() {
  return (
    <section className="bg-slate-50 py-24 px-6">
      <div className="mx-auto max-w-7xl">
        
        {/* Simplified Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              One Platform. <span className="text-sky-600">Limitless Learning.</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              The unified engine for creation, commerce, and enterprise-grade delivery.
            </p>
          </div>
          {/* <button className="h-fit rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition">
            View All Features
          </button> */}
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          
          <FeatureCard 
            className="md:col-span-3"
            icon={ShoppingCart}
            title="Smart Marketplace"
            desc="Amazon-style discovery for L&D tools. Compare, demo, and deploy with one click."
          />

          <FeatureCard 
            className="md:col-span-3"
            icon={Brain}
            title="AI Automation"
            desc="Remove the friction. Automate authoring, design, and delivery across your entire stack."
          />

          <FeatureCard 
            className="md:col-span-2"
            icon={CreditCard}
            title="Fluid Billing"
            desc="Freemium, credits, or subscriptions. One unified checkout."
          />

          <FeatureCard 
            className="md:col-span-2"
            icon={Layers}
            title="Modular Flagships"
            desc="8 flagship tools that work better together, but scale independently."
          />

          <FeatureCard 
            className="md:col-span-2"
            icon={BarChart3}
            title="ROI Dashboard"
            desc="Centralized analytics to track every learner and every dollar spent."
          />

          <FeatureCard 
            className="md:col-span-6 border-sky-100 bg-sky-50/50"
            icon={Puzzle}
            title="Enterprise Scalability"
            desc="Full SCORM compliance and seamless LMS exports for organizations of any size."
          />
        </div>

      </div>
    </section>
  );
}