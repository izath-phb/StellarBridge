"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Copy, QrCode, ShieldCheck, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/wallet-context";
import { MOCK_TRANSACTIONS, ASSETS } from "@/lib/constants";

const tabList = ["All", "Received", "Sent", "Escrow"];

export default function WalletPage() {
  const { isConnected, publicKey, balances, connect } = useWallet();
  const [activeTab, setActiveTab] = useState("All");
  const [copied, setCopied] = useState(false);

  const shortKey = publicKey ?? "Not Connected";

  const filtered = MOCK_TRANSACTIONS.filter((tx) => {
    if (activeTab === "All") return true;
    return tx.type === activeTab.toLowerCase();
  });

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-extrabold mb-2">My Wallet</h1>
        <p className="text-slate-500 mb-8 text-sm">Manage your multi-asset Stellar wallet on Testnet</p>

        {/* Wallet Address Card */}
        <Card className="glass-panel border-0 shadow-sm mb-6">
          <CardContent className="px-6 py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-400 mb-1 font-medium">WALLET ADDRESS · STELLAR TESTNET</div>
                <div className="font-mono text-sm text-slate-700 break-all">{shortKey}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAddress}
                  className="rounded-full text-xs"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" className="rounded-full text-xs">
                  <QrCode className="w-3.5 h-3.5 mr-1.5" /> QR Code
                </Button>
                {!isConnected && (
                  <Button size="sm" className="rounded-full bg-gradient-to-r from-primary to-blue-500 text-white text-xs" onClick={connect}>
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balances */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {(["XLM", "USDC", "EURC"] as const).map((asset, i) => (
            <motion.div key={asset} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-panel border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                        {asset[0]}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{ASSETS[asset].name}</span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-full">{asset}</span>
                  </div>
                  <div className="text-2xl font-extrabold text-foreground">
                    {isConnected ? balances[asset] : "—"}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {isConnected ? "Available balance" : "Not connected"}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Transaction History */}
        <Card className="glass-panel border-0 shadow-sm">
          <CardHeader className="px-6 py-5 pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-700">Transaction History</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-slate-500">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </CardHeader>

          {/* Tabs */}
          <div className="px-6 border-b border-slate-100 flex gap-1 mb-4">
            {tabList.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <CardContent className="px-6 pb-6">
            <div className="space-y-2">
              {filtered.map((tx, i) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    tx.type === "received" ? "bg-green-100" : tx.type === "escrow" ? "bg-violet-100" : "bg-red-50"
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
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold capitalize text-slate-800">{tx.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        tx.status === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>{tx.status}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono truncate mt-0.5">
                      Hash: {tx.hash}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-sm font-bold ${tx.type === "received" ? "text-green-600" : "text-slate-800"}`}>
                      {tx.type === "received" ? "+" : "-"}{tx.amount} {tx.asset}
                    </div>
                    <div className="text-xs text-slate-400">{tx.date}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
