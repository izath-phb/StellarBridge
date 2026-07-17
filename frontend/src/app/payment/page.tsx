"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, ArrowDownLeft, QrCode, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/lib/wallet-context";
import { MOCK_ISSUER_PUBKEY } from "@/lib/constants";
import type * as StellarSdk from "@stellar/stellar-sdk";
import { QRCodeSVG } from "qrcode.react";
import { useEffect } from "react";

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
  const [requestGenerated, setRequestGenerated] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected && publicKey) {
      const fetchTxs = async () => {
        try {
          const StellarSdk = await import("@stellar/stellar-sdk");
          const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
          const payments = await server.payments().forAccount(publicKey).order("desc").limit(10).call();
          
          const formatted = payments.records.map((r: any) => {
            const isReceived = r.to === publicKey;
            let assetStr = "XLM";
            if (r.asset_type !== "native") {
               assetStr = r.asset_code || "TOKEN";
            }
            return {
              id: r.id,
              type: isReceived ? "received" : "sent",
              amount: r.amount || "0",
              asset: assetStr,
              from: r.from ? `${r.from.slice(0, 4)}...${r.from.slice(-4)}` : "Unknown",
              to: r.to ? `${r.to.slice(0, 4)}...${r.to.slice(-4)}` : "Unknown",
              date: new Date(r.created_at).toISOString().split('T')[0],
              status: "SUCCESS"
            };
          });
          setTransactions(formatted);
        } catch(e) {
          console.error(e);
        }
      };
      fetchTxs();
    } else {
      setTransactions([]);
    }
  }, [isConnected, publicKey]);

  const handleSend = async () => {
    if (!recipient || !amount) return;
    if (!isConnected || !publicKey) {
      alert("Please connect your wallet first.");
      return;
    }
    
    setSending(true);

    try {
      const StellarSdk = await import("@stellar/stellar-sdk");
      const { signTransaction } = await import("@stellar/freighter-api");
      
      const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
      const sourceAccount = await server.loadAccount(publicKey);
      
      const stellarAsset = asset === "XLM" 
        ? StellarSdk.Asset.native() 
        : new StellarSdk.Asset(asset, MOCK_ISSUER_PUBKEY);
      
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(StellarSdk.Operation.payment({
          destination: recipient,
          asset: stellarAsset,
          amount: amount,
        }))
        .setTimeout(180)
          .build();
          
        const xdr = transaction.toXDR();
        const signedResponse = await signTransaction(xdr, { networkPassphrase: StellarSdk.Networks.TESTNET });
        
        if (signedResponse.error) {
          throw new Error(signedResponse.error.toString());
        }
        
        const txToSubmit = StellarSdk.TransactionBuilder.fromXDR(
          signedResponse.signedTxXdr,
          StellarSdk.Networks.TESTNET
        ) as StellarSdk.Transaction;
        
        await server.submitTransaction(txToSubmit);
        
        setSending(false);
        setSent(true);
        setTimeout(() => {
          setSent(false);
          setAmount("");
          setRecipient("");
          setMemo("");
        }, 3000);
    } catch (err: any) {
      console.error(err);
      alert("Transaction failed: " + (err.message || err.toString()));
      setSending(false);
    }
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
                    <div className="inline-flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-sm mx-auto">
                      {publicKey ? (
                        <QRCodeSVG value={publicKey} size={180} />
                      ) : (
                        <QrCode className="w-20 h-20 text-slate-300 mb-2" />
                      )}
                      <span className="text-xs text-slate-400 mt-3">Account Address QR</span>
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
                    {requestGenerated ? (
                      <div className="text-center space-y-4">
                        <div className="inline-flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200 shadow-sm mx-auto">
                          <QRCodeSVG
                            value={`web+stellar:pay?destination=${publicKey || ""}&amount=${amount}&assetCode=${asset}&memo=${encodeURIComponent(memo)}`}
                            size={200}
                          />
                          <div className="text-xl font-extrabold text-slate-800 mt-4">Scan to Pay</div>
                          <div className="text-sm text-slate-500 mt-1">Requesting {amount} {asset}</div>
                        </div>
                        <Button variant="outline" onClick={() => setRequestGenerated(false)} className="rounded-xl w-full">
                          Create New Request
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label className="text-sm font-semibold text-slate-600 mb-2 block">Asset</Label>
                          <div className="flex gap-2 mb-4">
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
                          <Label className="text-sm font-semibold text-slate-600 mb-2 block">Request Amount</Label>
                          <div className="relative">
                            <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="bg-white/70 border-slate-200 rounded-xl h-11 pr-16 text-lg font-bold" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{asset}</span>
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-slate-600 mb-2 block">Note (Memo)</Label>
                          <Input placeholder="Invoice #001 - Design Services" value={memo} onChange={e => setMemo(e.target.value)} className="bg-white/70 border-slate-200 rounded-xl h-11" />
                        </div>
                        <Button onClick={() => {
                          if (!publicKey) {
                            alert("Please connect wallet first!");
                            return;
                          }
                          setRequestGenerated(true);
                        }} className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-blue-500 text-white">
                          <QrCode className="w-4 h-4 mr-2" /> Generate Payment Request
                        </Button>
                      </>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions Sidebar */}
          <div>
            <Card className="bg-white/50 backdrop-blur-md border-white/50 shadow-xl shadow-slate-200/50 hidden md:block">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-700">Recent Payments</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {transactions.length > 0 ? transactions.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex justify-between items-center p-3 rounded-xl hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.type === "sent" ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"
                      }`}>
                        {tx.type === "sent" ? <Send className="w-4 h-4" /> : <ArrowDownLeft className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 capitalize">{tx.type}</div>
                        <div className="text-xs text-slate-400">{tx.date}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${tx.type === "sent" ? "text-slate-800" : "text-green-600"}`}>
                      {tx.type === "sent" ? "-" : "+"}{tx.amount} {tx.asset}
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-8 text-sm text-slate-400">
                    No recent payments found.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
