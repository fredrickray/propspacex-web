"use client";

import { Search, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion } from "framer-motion";

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState<"buy" | "rent" | "sold">("buy");
  const router = useRouter();

  const handleSearch = () => {
    router.push("/buyer/search");
  };

  return (
    <section className="relative min-h-[600px] flex items-center justify-center pt-8 pb-16">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/10 z-10" />
        <Image
          alt="Modern luxury home interior with large windows"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPFRmClmUzXI-wlmGlkCcO0_-1vVO4JLUoZLpERXXaNoLIGdUrNb2BHg-IXu8aWKIS_HaTqjCLZVT6zmTw_scVnl-4Eh7q6hxGGwpKzlsF4VTRdcOiy5BEmjnF1xOn1VbfFyWk5P5mhKg-zwc9FpwRPGT0sSt7nP-2u-GoUX5K2yOPHz7i-wjGOJ1JD-qON2yRQin7Vvfic6K-lK0VTI9raITGP1JU83aai8H3cW8pLVgT-V8l3ofwRjqTyl86HmAbrZbsXZIC2Q"
          fill
          sizes="100vw"
          priority
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center">
        <motion.div
          className="text-center mb-10 max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 drop-shadow-md">
            Find Your Future in Real Estate
          </h1>
          <p className="text-lg text-white/90 font-medium md:text-xl drop-shadow-sm">
            The enterprise platform connecting buyers and agents with verified,
            transparent listings.
          </p>
        </motion.div>

        {/* Search Widget */}
        <motion.div
          className="w-full max-w-4xl bg-surface rounded-xl shadow-2xl p-4 md:p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Tabs */}
          <div className="flex gap-6 border-b border-border px-2 mb-6">
            {(["buy", "rent", "sold"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 border-b-[3px] font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary font-bold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Location Input */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                Location
              </label>
              <div className="flex items-center bg-background rounded-lg border border-transparent focus-within:border-primary focus-within:ring-1 focus-within:ring-primary h-12 px-3 transition-all">
                <Search className="size-5 text-muted-foreground mr-2" />
                <Input
                  className="w-full bg-transparent border-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/70 text-base p-0 h-auto"
                  placeholder="City, Zip, Address"
                  type="text"
                />
              </div>
            </div>

            {/* Type Dropdown */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                Type
              </label>
              <div className="relative">
                <select
                  aria-label="Property type"
                  className="w-full bg-background rounded-lg border-none focus:ring-1 focus:ring-primary h-12 pl-3 pr-10 text-foreground text-base appearance-none cursor-pointer"
                >
                  <option>All Types</option>
                  <option>House</option>
                  <option>Condo</option>
                  <option>Townhome</option>
                  <option>Land</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none size-5" />
              </div>
            </div>

            {/* Price Range */}
            <div className="md:col-span-4 flex items-end">
              <div className="w-full">
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Price Range
                </label>
                <div className="flex items-center gap-2 bg-background rounded-lg px-3 h-12">
                  <span className="text-sm font-medium text-foreground">
                    $100k
                  </span>
                  <div className="flex-1 h-1 bg-muted rounded-full relative mx-2">
                    <div className="absolute left-[20%] right-[30%] top-0 bottom-0 bg-primary rounded-full" />
                    <div className="absolute left-[20%] top-1/2 -translate-y-1/2 size-3 bg-primary rounded-full shadow cursor-pointer" />
                    <div className="absolute right-[30%] top-1/2 -translate-y-1/2 size-3 bg-primary rounded-full shadow cursor-pointer" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    $5M
                  </span>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="md:col-span-12 mt-2">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  className="w-full h-12 text-base font-bold flex items-center justify-center gap-2"
                  onClick={handleSearch}
                >
                  <Search className="size-5" />
                  Search Properties
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
