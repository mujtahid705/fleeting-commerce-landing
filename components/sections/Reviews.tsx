"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";

const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Founder, Bloom Boutique",
    image: "SJ",
    rating: 5,
    review:
      "Fleeting Commerce transformed my small idea into a thriving online business. I had zero technical skills, but within an hour, my store was live and making sales. The templates are gorgeous!",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "CEO, TechGear Pro",
    image: "MC",
    rating: 5,
    review:
      "We migrated from Shopify and couldn't be happier. The analytics are incredible, and the checkout conversion rate improved by 40%. Customer support is phenomenal.",
  },
  {
    id: 3,
    name: "Emma Williams",
    role: "Artist & Creator",
    image: "EW",
    rating: 5,
    review:
      "As a solo creator selling digital art, I needed something simple yet powerful. Fleeting Commerce is exactly that. The payment integration was seamless, and I love the customization options.",
  },
  {
    id: 4,
    name: "David Rodriguez",
    role: "Founder, FreshFoods Co",
    image: "DR",
    rating: 5,
    review:
      "The inventory management alone saved us 20 hours per week. Plus, the mobile experience for our customers is flawless. Best decision we made for our business.",
  },
  {
    id: 5,
    name: "Lisa Park",
    role: "Owner, StyleHaven",
    image: "LP",
    rating: 5,
    review:
      "I've tried 4 different e-commerce platforms before finding Fleeting Commerce. None came close to this level of ease and professionalism. My sales doubled in 3 months!",
  },
];

export default function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextReview = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <section
      id="reviews"
      className="section-padding bg-gradient-to-b from-secondary/30 to-white"
    >
      <Container>
        <SectionHeading
          title="Loved by Entrepreneurs Worldwide"
          subtitle="Don't just take our word for it. Here's what our customers have to say."
        />

        {/* Main Review Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100"
            >
              <Quote className="w-12 h-12 text-primary/20 mb-6" />

              <p className="text-xl md:text-2xl text-foreground leading-relaxed mb-8">
                &quot;{reviews[currentIndex].review}&quot;
              </p>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                    {reviews[currentIndex].image}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {reviews[currentIndex].name}
                    </p>
                    <p className="text-muted text-sm">
                      {reviews[currentIndex].role}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1">
                  {Array.from({ length: reviews[currentIndex].rating }).map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={prevReview}
              className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-muted hover:text-primary hover:shadow-lg transition-all duration-300"
              aria-label="Previous review"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextReview}
              className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-muted hover:text-primary hover:shadow-lg transition-all duration-300"
              aria-label="Next review"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 flex flex-wrap justify-center gap-8"
        >
          <div className="flex items-center gap-2 text-muted">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">4.9/5 on G2</span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">4.8/5 on Capterra</span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">4.9/5 on Trustpilot</span>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
