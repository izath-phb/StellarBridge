"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Wallet, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/wallet-context";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wallet", label: "Wallet" },
  { href: "/payment", label: "Payments" },
  { href: "/escrow", label: "Escrow" },
  { href: "/merchant", label: "Merchant" },
  { href: "/invoice", label: "Invoices" },
  { href: "/community", label: "Community" },
];

export default function NavBar() {
  const pathname = usePathname();
  const { isConnected, publicKey, connect, disconnect, isLoading } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);

  const shortKey = publicKey ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}` : "";

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm px-6 py-3 flex justify-between items-center">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <img
          src="/logo.png"
          alt="StellarBridge"
          className="w-10 h-10 rounded-xl shadow-lg shadow-primary/30 object-cover"
        />
        <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-primary">
          StellarBridge
        </span>
      </Link>

      {/* Desktop Nav */}
      <div className="hidden md:flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              pathname === link.href
                ? "bg-primary/10 text-primary"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Wallet Button */}
      <div className="flex items-center gap-3">
        {isConnected ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {shortKey}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs border-red-200 text-red-600 hover:bg-red-50 bg-white/60 cursor-pointer"
              onClick={disconnect}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="rounded-full shadow-md shadow-primary/20 bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 transition-opacity text-white px-4 cursor-pointer"
            onClick={connect}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"></span>
            ) : (
              <Wallet className="w-3.5 h-3.5 mr-2" />
            )}
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 glass-panel border-t border-slate-100 p-4 flex flex-col gap-1 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
