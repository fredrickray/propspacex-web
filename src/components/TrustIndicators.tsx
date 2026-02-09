"use client";

import { ShieldCheck, Link as LinkIcon, Building2 } from "lucide-react";
import { motion } from "framer-motion";

const TrustIndicators = () => {
  const indicators = [
    {
      icon: ShieldCheck,
      title: "Verified Listings",
      description: "Identity checked agents",
    },
    {
      icon: LinkIcon,
      title: "Blockchain Backed",
      description: "Transparent history",
    },
    {
      icon: Building2,
      title: "Enterprise Grade",
      description: "For serious investors",
    },
  ];

  return (
    <section className="bg-surface py-8 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center md:justify-around gap-8 text-center md:text-left">
        {indicators.map((indicator, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <motion.div
              className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"
              whileHover={{
                scale: 1.1,
                backgroundColor: "hsl(var(--primary) / 0.2)",
              }}
              transition={{ duration: 0.2 }}
            >
              <indicator.icon className="size-5" />
            </motion.div>
            <div>
              <h4 className="font-bold text-foreground text-sm">
                {indicator.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {indicator.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TrustIndicators;
