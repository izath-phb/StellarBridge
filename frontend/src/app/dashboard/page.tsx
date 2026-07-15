"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Clock, TrendingUp, Wallet2, Send, ReceiptText, ShieldCheck, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/wallet-context";
import { ASSETS, MOCK_TRANSACTIONS } from "@/lib/constants";
import Link from "next/link";

const quickActions = [
  { icon: <Send className="w-5 h-5" />, label: "Send", href: "/payment", color: "bg-indigo-100 text-indigo-600" },
  { icon: <ArrowDownLeft className="w-5 h-5" />, label: "Receive", href: "/wallet", color: "bg-green-100 text-green-600" },
  { icon: <ShieldCheck className="w-5 h-5" />, label: "Escrow", href: "/escrow", color: "bg-violet-100 text-violet-600" },
  { icon: <ReceiptText className="w-5 h-5" />, label: "Invoice", href: "/invoice", color: "bg-amber-100 text-amber-600" },
  { icon: <Users className="w-5 h-5" />, label: "DAO", href: "/community", color: "bg-sky-100 text-sky-600" },
];

const assetColors: Record<string, { bg: string; text: string; border: string; grad: string }> = {
  XLM: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", grad: "from-indigo-500 to-violet-500" },
  USDC: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", grad: "from-green-500 to-emerald-500" },
  EURC: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", grad: "from-blue-500 to-sky-500" },
};

export default function DashboardPage() {
  const { isConnected, publicKey, balances, connect } = useWallet();

  const shortKey = publicKey ? `${publicKey.slice(0, 12)}...${publicKey.slice(-6)}` : "";

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">
              {isConnected ? `Wallet: ${shortKey}` : "Connect your wallet to get started"}
            </p>
          </div>
          {!isConnected && (
            <Button onClick={connect} className="rounded-full bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/20">
              <Wallet2 className="w-4 h-4 mr-2" /> Connect Wallet
            </Button>
          )}
          {isConnected && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Connected · Testnet
            </div>
          )}
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {(["XLM", "USDC", "EURC"] as const).map((asset, i) => (
            <motion.div
              key={asset}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`border ${assetColors[asset].border} bg-gradient-to-br ${assetColors[asset].grad} text-white shadow-lg overflow-hidden relative`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-2xl" />
                <CardContent className="pt-6 pb-5 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/80 text-sm font-medium">{ASSETS[asset].name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white/90 text-xs font-bold">{asset}</span>
                  </div>
                  <div className="text-3xl font-extrabold">
                    {isConnected ? balances[asset] : "—"}
                  </div>
                  <div className="text-white/60 text-xs mt-1">
                    {isConnected ? "Available Balance" : "Connect to view"}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="glass-panel border-0 shadow-sm mb-8">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="text-base font-bold text-slate-700">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${action.color} cursor-pointer font-medium text-sm transition-all`}
                  >
                    {action.icon}
                    {action.label}
                  </motion.div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions */}
          <div className="lg:col-span-2">
            <Card className="glass-panel border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-6">
                <CardTitle className="text-base font-bold text-slate-700">Recent Transactions</CardTitle>
                <Link href="/wallet" className="text-xs text-primary hover:underline font-medium">View all</Link>
              </CardHeader>
              <CardContent className="px-6 pb-5">
                <div className="space-y-3">
                  {MOCK_TRANSACTIONS.map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === "received" ? "bg-green-100" : tx.type === "escrow" ? "bg-violet-100" : "bg-red-100"
                      }`}>
                        {tx.type === "received" ? (
                          <ArrowDownLeft className="w-5 h-5 text-green-600" />
                        ) : tx.type === "escrow" ? (
                          <ShieldCheck className="w-5 h-5 text-violet-600" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 capitalize">{tx.type}</div>
                        <div className="text-xs text-slate-400 truncate">{tx.type === "received" ? `From: ${tx.from}` : `To: ${tx.to}`}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-sm font-bold ${tx.type === "received" ? "text-green-600" : "text-slate-800"}`}>
                          {tx.type === "received" ? "+" : "-"}{tx.amount} {tx.asset}
                        </div>
                        <div className="text-xs text-slate-400">{tx.date}</div>
                      </div>
                      <div className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        tx.status === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {tx.status}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* AI Insight Card */}
            <Card className="glass-panel border-0 shadow-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary to-blue-400" />
              <CardContent className="pt-5 pb-5 px-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-slate-700">AI Insight</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "Your international transaction fees decreased <strong className="text-green-600">40%</strong> after switching to StellarBridge compared to traditional payment rails."
                </p>
              </CardContent>
            </Card>

            {/* Network Status */}
            <Card className="glass-panel border-0 shadow-sm">
              <CardContent className="pt-5 pb-5 px-5">
                <div className="text-sm font-bold text-slate-700 mb-4">Network Status</div>
                <div className="space-y-3 text-sm">
                  {[
                    { label: "Stellar Testnet", status: "Operational", ok: true },
                    { label: "Soroban RPC", status: "Operational", ok: true },
                    { label: "Horizon API", status: "Operational", ok: true },
                  ].map((n) => (
                    <div key={n.label} className="flex justify-between items-center">
                      <span className="text-slate-500">{n.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${n.ok ? "bg-green-500" : "bg-red-500"}`}></span>
                        <span className={`text-xs font-medium ${n.ok ? "text-green-600" : "text-red-600"}`}>{n.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reputation */}
            <Card className="glass-panel border-0 shadow-sm">
              <CardContent className="pt-5 pb-5 px-5">
                <div className="text-sm font-bold text-slate-700 mb-1">StellarBridge Score</div>
                <div className="text-xs text-slate-400 mb-4">Based on 300 on-chain transactions</div>
                <div className="flex items-end gap-2 mb-3">
                  <div className="text-4xl font-extrabold text-primary">98</div>
                  <div className="text-sm text-slate-500 mb-1">/ 100</div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "98%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400"
                  />
                </div>
                <div className="text-xs text-green-600 font-semibold mt-2">Excellent — Top 2% of users</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
