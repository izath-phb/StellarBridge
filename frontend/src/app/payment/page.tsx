"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, ArrowDownLeft, QrCode, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/lib/wallet-context";
import { MOCK_TRANSACTIONS } from "@/lib/constants";

type Tab = "send" | "receive" | "request";
type Asset = "XLM" | "USDC" | "EURC";

export default function PaymentPage() {
  const { isConnected, publicKey, balances, connect } = useWallet();
  const [tab, setTab] = useState<Tab>("send");
  const [asset, setAsset] = useState<Asset>("USDC");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!recipient || !amount) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 2000));
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setRecipient("");
    setAmount("");
    setMemo("");
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "send", label: "Send", icon: <Send className="w-4 h-4" /> },
    { id: "receive", label: "Receive", icon: <ArrowDownLeft className="w-4 h-4" /> },
    { id: "request", label: "Request", icon: <QrCode className="w-4 h-4" /> },
  ];

  const assetOptions: Asset[] = ["XLM", "USDC", "EURC"];

  return (
    <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-extrabold mb-2">Global Payments</h1>
        <p className="text-slate-500 mb-8 text-sm">Send and receive payments globally via the Stellar Network</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Panel */}
          <div className="lg:col-span-2">
            <Card className="glass-panel border-0 shadow-md">
              {/* Tabs */}
              <div className="flex gap-1 p-2 m-4 bg-slate-100 rounded-xl">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      tab === t.id ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              <CardContent className="px-6 pb-6">
                {/* SEND TAB */}
                {tab === "send" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    {sent && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
                      >
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <div>
                          <div className="font-semibold text-sm">Payment Sent!</div>
                          <div className="text-xs">Transaction submitted to Stellar Testnet successfully.</div>
                        </div>
                      </motion.div>
                    )}

                    {/* Asset Selector */}
                    <div>
                      <Label className="text-sm font-semibold text-slate-600 mb-2 block">Asset</Label>
                      <div className="flex gap-2">
                        {assetOptions.map((a) => (
                          <button
                            key={a}
                            onClick={() => setAsset(a)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                              asset === a
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-slate-200 text-slate-500 hover:border-primary/40"
                            }`}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-slate-600 mb-2 block">Recipient Address</Label>
                      <Input
                        placeholder="G... Stellar address"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="font-mono text-sm bg-white/70 border-slate-200 rounded-xl h-11"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm font-semibold text-slate-600">Amount</Label>
                        <span className="text-xs text-slate-400">
                          Balance: <strong className="text-slate-700">{isConnected ? balances[asset] : "—"} {asset}</strong>
                        </span>
                      </div>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="bg-white/70 border-slate-200 rounded-xl h-11 pr-16 text-lg font-bold"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{asset}</span>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-slate-600 mb-2 block">Memo (optional)</Label>
                      <Input
                        placeholder="Payment for... "
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        className="bg-white/70 border-slate-200 rounded-xl h-11"
                      />
                    </div>

                    {/* Fee Estimate */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Estimated Network Fee</span>
                      <span className="font-bold text-green-600">~0.00001 XLM (&lt;$0.001)</span>
                    </div>

                    <Button
                      onClick={handleSend}
                      disabled={!isConnected || sending || !recipient || !amount}
                      className="w-full h-12 rounded-xl text-base font-bold bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity"
                    >
                      {!isConnected ? (
                        <span onClick={(e) => { e.stopPropagation(); connect(); }}>Connect Wallet First</span>
                      ) : sending ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" /> Send Payment</>
                      )}
                    </Button>
                  </motion.div>
                )}

                {/* RECEIVE TAB */}
                {tab === "receive" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-5">
                    <div className="inline-flex flex-col items-center justify-center w-48 h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 mx-auto">
                      <QrCode className="w-20 h-20 text-slate-300 mb-2" />
                      <span className="text-xs text-slate-400">QR Code</span>
                    </div>
                    <p className="text-sm text-slate-500">Share your address to receive payments</p>
                    <div className="p-3 rounded-xl bg-slate-50 font-mono text-xs text-slate-600 break-all border border-slate-200">
                      {publicKey ?? "Connect your wallet to see address"}
                    </div>
                    <Button variant="outline" className="rounded-xl">
                      Copy Address
                    </Button>
                  </motion.div>
                )}

                {/* REQUEST TAB */}
                {tab === "request" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                    <div>
                      <Label className="text-sm font-semibold text-slate-600 mb-2 block">Request Amount</Label>
                      <div className="relative">
                        <Input type="number" placeholder="0.00" className="bg-white/70 border-slate-200 rounded-xl h-11 pr-16 text-lg font-bold" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">USDC</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-600 mb-2 block">Note</Label>
                      <Input placeholder="Invoice #001 - Design Services" className="bg-white/70 border-slate-200 rounded-xl h-11" />
                    </div>
                    <Button className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-blue-500 text-white">
                      <QrCode className="w-4 h-4 mr-2" /> Generate Payment Request
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions Sidebar */}
          <div>
            <Card className="glass-panel border-0 shadow-sm">
              <CardHeader className="px-5 py-4 pb-2">
                <CardTitle className="text-sm font-bold text-slate-700">Recent Payments</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="space-y-2">
                  {MOCK_TRANSACTIONS.slice(0, 4).map((tx, i) => (
                    <div key={tx.id} className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === "received" ? "bg-green-100" : "bg-red-50"
                      }`}>
                        {tx.type === "received"
                          ? <ArrowDownLeft className="w-4 h-4 text-green-600" />
                          : <Send className="w-4 h-4 text-red-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold capitalize text-slate-700">{tx.type}</div>
                        <div className="text-xs text-slate-400">{tx.date}</div>
                      </div>
                      <div className={`text-xs font-bold ${tx.type === "received" ? "text-green-600" : "text-slate-700"}`}>
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
