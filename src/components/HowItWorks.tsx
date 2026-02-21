"use client";

import { Search, Gavel, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "1. Find Property",
      description:
        "Browse verified listings. Filter by crypto-acceptance or traditional payment methods.",
    },
    {
      icon: Gavel,
      title: "2. Make Offer",
      description:
        "Submit offers directly to agents. Smart contracts ensure terms are immutable.",
    },
    {
      icon: BadgeCheck,
      title: "3. Verify & Close",
      description:
        "Instant verification of ownership transfer upon closing. Secure and fast.",
    },
  ];

  return (
    <section className="bg-surface py-20 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.h2
          className="text-3xl font-bold text-foreground mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          How PropSpace X Works
        </motion.h2>
        <motion.p
          className="text-muted-foreground mb-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Seamlessly bridging traditional real estate with the security of Web3
          technology.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <motion.div
                className="size-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <step.icon className="size-10" />
              </motion.div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
