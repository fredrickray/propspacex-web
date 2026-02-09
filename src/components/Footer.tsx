"use client";

import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";
import PropSpaceLogo from "@/components/icons/PropSpaceLogo";
import { motion } from "framer-motion";

const Footer = () => {
  const footerLinks = {
    Platform: [
      { label: "Browse Properties", href: "/buyer/search" },
      { label: "Agents", href: "/auth/login" },
      { label: "Dashboard", href: "/buyer" },
      { label: "Admin", href: "/admin" },
    ],
    Company: [
      { label: "About Us", href: "/" },
      { label: "Careers", href: "/" },
      { label: "Press", href: "/" },
      { label: "Contact", href: "/" },
    ],
    Legal: [
      { label: "Terms of Service", href: "/" },
      { label: "Privacy Policy", href: "/" },
      { label: "Cookie Policy", href: "/" },
      { label: "Accessibility", href: "/" },
    ],
  };

  return (
    <footer className="bg-surface pt-16 pb-8 border-t border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="size-6 text-primary">
                <PropSpaceLogo />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                PropSpace X
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              The future of real estate is here. Buy, sell, and rent properties
              with the security and transparency of blockchain technology.
            </p>
            <div className="flex gap-4">
              {[ThumbsUp, MessageCircle, Share2].map((Icon, index) => (
                <motion.a
                  key={index}
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="size-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-bold text-foreground mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PropSpace X. All rights reserved.
          </p>
          <div className="flex gap-6">
            <p className="text-xs text-muted-foreground">
              Equal Housing Opportunity
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
