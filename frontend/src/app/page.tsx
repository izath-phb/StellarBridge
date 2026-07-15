"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Globe, Shield, Zap, TrendingUp, Users, FileText, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWallet } from "@/lib/wallet-context";
import LiveTicker from "@/components/LiveTicker";

const features = [
  {
    icon: <Zap className="w-6 h-6 text-indigo-600" />,
    iconBg: "bg-indigo-100",
    title: "Instant Settlement",
    desc: "Cross-border transactions settle in 3-5 seconds with fractions of a cent in fees using the Stellar Network.",
  },
  {
    icon: <Shield className="w-6 h-6 text-violet-600" />,
    iconBg: "bg-violet-100",
    title: "Soroban Escrow",
    desc: "Trustless, programmable smart contract escrows for freelancers & clients built in Rust on Soroban.",
  },
  {
    icon: <Globe className="w-6 h-6 text-sky-600" />,
    iconBg: "bg-sky-100",
    title: "Multi-Asset Support",
    desc: "Seamlessly transact in XLM, USDC, and EURC — bridging traditional finance with Web3.",
  },
  {
    icon: <FileText className="w-6 h-6 text-emerald-600" />,
    iconBg: "bg-emerald-100",
    title: "Tokenized Invoices",
    desc: "Turn invoices into blockchain-verified digital assets. Create, pay, and verify on-chain.",
  },
  {
    icon: <Users className="w-6 h-6 text-amber-600" />,
    iconBg: "bg-amber-100",
    title: "Community DAO",
    desc: "Transparent treasury management and collective voting for global communities & organizations.",
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-rose-600" />,
    iconBg: "bg-rose-100",
    title: "AI Finance Assistant",
    desc: "Personal spending analysis, revenue insights, and smart financial recommendations powered by AI.",
  },
];

const stats = [
  { label: "Avg. Transaction Time", value: "< 5s" },
  { label: "Transaction Fee", value: "< $0.01" },
  { label: "Supported Assets", value: "3+" },
  { label: "Smart Contracts", value: "5" },
];

const problems = [
  "International payment fees averaging 6–10%",
  "Cross-border transfers taking 3–5 business days",
  "Freelancers locked out of global payment rails",
  "No transparent financial tools for communities",
];

export default function Home() {
  const { connect, isConnected } = useWallet();

  return (
    <div className="flex flex-col items-center overflow-hidden">
      {/* Hero */}
      <section className="w-full min-h-screen flex flex-col items-center justify-center pt-24 px-4 relative">
        {/* Orbs */}
        <div className="absolute top-20 left-[-5%] w-[35%] h-[50%] rounded-full bg-indigo-300/25 blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute bottom-10 right-[-5%] w-[30%] h-[45%] rounded-full bg-blue-300/20 blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-40 right-[15%] w-[20%] h-[30%] rounded-full bg-violet-300/15 blur-[80px] -z-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-5xl z-10"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
            The Future of
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-500 to-blue-500">
              Global Finance
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            StellarBridge connects individuals, freelancers, merchants, and communities worldwide with instant, near-zero-cost Web3 payments, smart escrows, tokenized invoices, and DAO governance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button size="lg" className="h-13 px-8 text-base rounded-full shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 transition-all hover:scale-105 duration-200 cursor-pointer">
                Launch App <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            {!isConnected && (
              <Button
                size="lg"
                variant="outline"
                className="h-13 px-8 text-base rounded-full bg-white/60 backdrop-blur-sm border-slate-200 hover:bg-white transition-all hover:scale-105 duration-200 cursor-pointer"
                onClick={connect}
              >
                Connect Freighter Wallet
              </Button>
            )}
          </div>
        </motion.div>

        <LiveTicker />

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 max-w-3xl w-full"
        >
          {stats.map((stat, i) => (
            <div key={i} className="glass-panel rounded-2xl p-4 text-center">
              <div className="text-2xl font-extrabold text-primary">{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="w-full max-w-6xl px-4 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-16 items-center"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-foreground">
              Global Finance is <span className="text-red-500">Broken</span>
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Billions of people are excluded from efficient financial services. Traditional systems are slow, expensive, and opaque.
            </p>
            <div className="space-y-3">
              {problems.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100"
                >
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-red-500 text-xs font-bold">✕</span>
                  </div>
                  <span className="text-sm text-slate-700 font-medium">{p}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-foreground">
              StellarBridge is the <span className="text-primary">Solution</span>
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Built on Stellar's battle-tested protocol and Soroban smart contracts, we deliver a complete financial operating system for the world.
            </p>
            <div className="space-y-3">
              {[
                "Payments in seconds, fees under $0.01",
                "Soroban-powered trustless escrow for freelancers",
                "Merchant tools for borderless digital commerce",
                "DAO treasury with on-chain governance & voting",
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100"
                >
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-sm text-slate-700 font-medium">{s}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="w-full max-w-6xl px-4 pb-24" id="features">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            Everything You Need to Transact Globally
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            A complete Web3 financial ecosystem in one platform.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="glass-panel border-0 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className={`w-12 h-12 rounded-2xl ${f.iconBg} flex items-center justify-center mb-5`}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-4xl px-4 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-br from-primary via-violet-600 to-blue-500 p-12 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Ready to Bridge the World?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Connect your Freighter wallet and start transacting globally with sub-second settlements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8 rounded-full bg-white text-primary hover:bg-white/90 font-bold transition-all hover:scale-105 duration-200 cursor-pointer">
                  Get Started Now <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
