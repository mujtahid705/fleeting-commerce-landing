"use client";

import { motion } from "framer-motion";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";

const partners = [
  { name: "Stripe", logo: "stripe" },
  { name: "PayPal", logo: "paypal" },
  { name: "Shopify", logo: "shopify" },
  { name: "Amazon", logo: "amazon" },
  { name: "Google", logo: "google" },
  { name: "Meta", logo: "meta" },
  { name: "Mailchimp", logo: "mailchimp" },
  { name: "Zapier", logo: "zapier" },
];

export default function Partners() {
  return (
    <section className="section-padding bg-white">
      <Container>
        <SectionHeading
          title="Trusted Integrations"
          subtitle="Seamlessly connect with the tools you already use and love"
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group flex items-center justify-center p-8 bg-secondary/50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-100"
            >
              <div className="text-center">
                {/* Placeholder Logo */}
                <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-muted">
                    {partner.name.charAt(0)}
                  </span>
                </div>
                <p className="font-medium text-foreground">{partner.name}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Integration Count */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-muted">
            And{" "}
            <span className="font-semibold text-primary">
              100+ more integrations
            </span>{" "}
            to power your business
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
