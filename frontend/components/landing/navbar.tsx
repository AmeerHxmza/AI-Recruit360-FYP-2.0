"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";

export function PublicNavbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "Platform", href: "#platform" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "AI Intelligence", href: "#intelligence" },
    { label: "Features", href: "#features" },
    { label: "Technology", href: "#technology" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#08090B]/90 backdrop-blur-md border-b border-[#242932]/80 py-3.5 shadow-xl"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none"
          >
            <div className="h-8 w-8 rounded-lg bg-[#12151A] border border-[#242932] group-hover:border-[#39D9FF]/50 flex items-center justify-center transition-colors">
              <Sparkles className="h-4 w-4 text-[#39D9FF]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-[#F5F7FA] font-display flex items-center gap-1.5">
                AI-Recruit<span className="text-[#39D9FF]">360</span>
              </span>
              <span className="text-[10px] text-[#68717E] tracking-wider uppercase font-mono font-medium -mt-1">
                Recruitment Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Center Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-1.5 text-xs font-medium text-[#A7AFBC] hover:text-[#F5F7FA] hover:bg-[#12151A] rounded-md transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Right Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-medium text-[#A7AFBC] hover:text-[#F5F7FA] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-xs font-semibold text-[#08090B] bg-[#39D9FF] hover:bg-[#63E3FF] rounded-md transition-all flex items-center gap-1.5 shadow-sm shadow-[#39D9FF]/20 active:scale-95"
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#A7AFBC] hover:text-[#F5F7FA] rounded-md hover:bg-[#12151A] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#242932] bg-[#0D0F12] px-4 pt-4 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-[#A7AFBC] hover:text-[#F5F7FA] hover:bg-[#12151A] rounded-md"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-4 border-t border-[#242932]/60 flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 text-sm font-medium text-[#F5F7FA] bg-[#12151A] border border-[#242932] rounded-md"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 text-sm font-semibold text-[#08090B] bg-[#39D9FF] hover:bg-[#63E3FF] rounded-md flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
