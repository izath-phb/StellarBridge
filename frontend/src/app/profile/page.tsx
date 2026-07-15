"use client";

import { motion } from "framer-motion";
import { User, Star, TrendingUp, ShieldCheck, MessageSquare, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/wallet-context";
import { MOCK_TRANSACTIONS } from "@/lib/constants";

const aiInsights = [
  { text: "Your international transaction fees decreased 40% after switching to StellarBridge.", icon: "📉", type: "savings" },
  { text: "You have completed 295 out of 300 payments successfully — a 98.3% success rate!", icon: "🏆", type: "achievement" },
  { text: "Recommended: Diversify holdings — consider converting 10% XLM to USDC for stability.", icon: "💡", type: "tip" },
  { text: "Your USDC inflow increased 23% this month — you're trending positively.", icon: "📈", type: "trend" },
];

const badges = [
  { name: "Early Adopter", color: "bg-purple-100 text-purple-700", icon: "🚀" },
  { name: "Top Transactor", color: "bg-blue-100 text-blue-700", icon: "⚡" },
  { name: "Escrow Master", color: "bg-green-100 text-green-700", icon: "🛡" },
  { name: "DAO Member", color: "bg-sky-100 text-sky-700", icon: "🗳" },
];

export default function ProfilePage() {
  const { isConnected, publicKey, balances, connect } = useWallet();
  const shortKey = publicKey ? `${publicKey.slice(0, 12)}...${publicKey.slice(-6)}` : "Not Connected";

  const stats = [
    { label: "Total Transactions", value: "300" },
    { label: "Successful Payments", value: "295" },
    { label: "Escrows Completed", value: "12" },
    { label: "Countries Reached", value: "18" },
  ];

  return (
    <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-extrabold mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-5">
            <Card className="glass-panel border-0 shadow-md text-center">
              <CardContent className="pt-8 pb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/30">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="font-extrabold text-xl text-foreground mb-1">Alex Builder</div>
                <div className="text-xs text-slate-400 font-mono mb-4 break-all px-4">{shortKey}</div>
                
                {!isConnected && (
                  <Button onClick={connect} size="sm" className="rounded-full bg-gradient-to-r from-primary to-blue-500 text-white">
                    Connect Wallet
                  </Button>
                )}
                {isConnected && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-green-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Connected · Stellar Testnet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trust Score */}
            <Card className="glass-panel border-0 shadow-md overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary to-blue-400" />
              <CardContent className="pt-5 pb-5 px-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-primary" /> StellarBridge Score
                  </div>
                </div>
                <div className="flex items-end gap-2 my-3">
                  <div className="text-5xl font-extrabold text-primary">98</div>
                  <div className="text-slate-400 mb-1 text-sm">/ 100</div>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "98%" }}
                    transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400"
                  />
                </div>
                <div className="text-xs text-green-600 font-semibold">Excellent — Top 2% Globally</div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="glass-panel border-0 shadow-sm">
              <CardHeader className="px-5 py-4 pb-2">
                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" /> Badges
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="flex flex-wrap gap-2">
                  {badges.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${b.color}`}
                    >
                      <span>{b.icon}</span> {b.name}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="glass-panel border-0 shadow-sm">
                    <CardContent className="pt-5 pb-5 px-5">
                      <div className="text-2xl font-extrabold text-foreground">{s.value}</div>
                      <div className="text-xs text-slate-400 mt-1">{s.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* AI Financial Assistant */}
            <Card className="glass-panel border-0 shadow-md">
              <CardHeader className="px-6 py-4 pb-2 flex flex-row items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-base font-bold text-slate-700">AI Financial Assistant</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-5">
                <div className="space-y-3">
                  {aiInsights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.12 }}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <span className="text-xl shrink-0 mt-0.5">{insight.icon}</span>
                      <div className="text-sm text-slate-700 leading-relaxed">{insight.text}</div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="glass-panel border-0 shadow-sm">
              <CardHeader className="px-6 py-4 pb-2">
                <CardTitle className="text-sm font-bold text-slate-700">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-5">
                <div className="space-y-2">
                  {MOCK_TRANSACTIONS.slice(0, 3).map((tx, i) => (
                    <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          tx.type === "received" ? "bg-green-100 text-green-700" : "bg-red-50 text-red-500"
                        }`}>
                          {tx.type === "received" ? "↓" : "↑"}
                        </div>
                        <div>
                          <div className="text-xs font-semibold capitalize text-slate-700">{tx.type}</div>
                          <div className="text-xs text-slate-400">{tx.date}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-bold ${tx.type === "received" ? "text-green-600" : "text-slate-700"}`}>
                        {tx.type === "received" ? "+" : "-"}{tx.amount} {tx.asset}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
