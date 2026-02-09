"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="bg-foreground rounded-2xl overflow-hidden flex flex-col md:flex-row relative shadow-2xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Content */}
          <div className="p-10 md:p-16 md:w-1/2 flex flex-col justify-center z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">
              List your property with confidence.
            </h2>
            <p className="text-background/70 text-lg mb-8">
              Join the network of top-tier agents and sellers using PropSpace X
              for faster, verified sales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="font-bold" asChild>
                <Link href="/auth/register">Start Listing</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-background/30 text-background hover:bg-background/10 font-bold"
                asChild
              >
                <Link href="/buyer/search">Learn More</Link>
              </Button>
            </div>
          </div>

          {/* Abstract Design Element */}
          <div className="md:w-1/2 min-h-[300px] bg-gradient-to-br from-primary to-blue-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            {/* Mock UI element floating */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  className="size-10 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="h-3 w-1/2 bg-white/50 rounded" />
              </div>
              <div className="h-2 w-full bg-white/20 rounded mb-2" />
              <div className="h-2 w-3/4 bg-white/20 rounded" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
