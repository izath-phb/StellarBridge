"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Store, Plus, QrCode, Star, TrendingUp, Package, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_MERCHANTS, MOCK_ISSUER_PUBKEY } from "@/lib/constants";
import { useWallet } from "@/lib/wallet-context";
import { submitSorobanTransaction, PAYMENT_CONTRACT_ID, XLM_CONTRACT_ID } from "@/lib/soroban";
import * as StellarSdk from "@stellar/stellar-sdk";

export default function MerchantPage() {
  const { isConnected, publicKey, connect } = useWallet();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [form, setForm] = useState({ name: "", desc: "", category: "" });
  const [merchants, setMerchants] = useState<any[]>(MOCK_MERCHANTS);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [modalView, setModalView] = useState<{type: string, merchant: any} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("merchants");
    if (saved) {
      setMerchants(JSON.parse(saved));
    } else {
      setMerchants(MOCK_MERCHANTS);
      localStorage.setItem("merchants", JSON.stringify(MOCK_MERCHANTS));
    }
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    await new Promise((r) => setTimeout(r, 1200));
    
    const newMerchant = {
      id: "MERCH-" + Math.floor(Math.random() * 1000),
      name: form.name,
      category: form.category,
      rating: 5.0,
      revenue: "0",
      customers: 0,
      receiverAddress: publicKey // Store the creator's address as the receiver
    };
    const newMerchants = [newMerchant, ...merchants];
    setMerchants(newMerchants);
    localStorage.setItem("merchants", JSON.stringify(newMerchants));
    
    setCreating(false);
    setCreated(true);
    setShowCreate(false);
    setTimeout(() => setCreated(false), 4000);
  };

  const handleBuy = async (index: number, priceStr: string) => {
    if (!isConnected || !publicKey) {
      connect();
      return;
    }
    
    // Extract number and convert to i128 (scaled by 1e7)
    const amountNum = Number(priceStr.replace(/[^0-9]/g, "")) || 10;
    const scaledAmount = Math.floor(amountNum * 10000000);
    
    const merchant = merchants[index];
    const receiverAddress = merchant?.receiverAddress || MOCK_ISSUER_PUBKEY; // Fallback for mocks
    
    setBuyingId(index);
    try {
      const args = [
        new StellarSdk.Address(publicKey).toScVal(),
        new StellarSdk.Address(receiverAddress).toScVal(),
        new StellarSdk.Address(XLM_CONTRACT_ID).toScVal(),
        StellarSdk.nativeToScVal(scaledAmount, { type: 'i128' }),
        StellarSdk.nativeToScVal("Merchant Purchase", { type: 'string' })
      ];
      
      await submitSorobanTransaction(publicKey, PAYMENT_CONTRACT_ID, "send_payment", args);
      
      alert("Purchase successful! Paid " + amountNum + " XLM via smart contract.");
    } catch (err: any) {
      console.error(err);
      alert("Purchase failed: " + (err.message || err.toString()));
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-extrabold">Merchant Platform</h1>
          <Button
            onClick={() => setShowCreate(!showCreate)}
            className="rounded-full bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Create Store
          </Button>
        </div>
        <p className="text-slate-500 mb-8 text-sm">Create your store, list products, and accept Stellar payments globally</p>

        {created && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Store Created!</div>
              <div className="text-xs">Your merchant profile is now live on StellarBridge.</div>
            </div>
          </motion.div>
        )}

        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6">
            <Card className="glass-panel border-0 shadow-md">
              <CardHeader className="px-6 py-4">
                <CardTitle className="text-base font-bold">New Merchant Store</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-600 mb-2 block">Store Name</Label>
                    <Input placeholder="e.g., Digital Studio Japan" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/70 border-slate-200 rounded-xl h-11" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-600 mb-2 block">Category</Label>
                    <Input placeholder="e.g., Design, Development" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-white/70 border-slate-200 rounded-xl h-11" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-semibold text-slate-600 mb-2 block">Description</Label>
                    <Input placeholder="Describe your store..." value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} className="bg-white/70 border-slate-200 rounded-xl h-11" />
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={creating || !form.name} className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-blue-500 text-white">
                  {creating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating...</> : <><Store className="w-4 h-4 mr-2" /> Create Merchant Store</>}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Merchant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {merchants.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-panel border-0 shadow-md hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-primary/30">
                        {m.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{m.name}</div>
                        <div className="text-xs text-slate-400">{m.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
                      <Star className="w-4 h-4 fill-amber-400" /> {m.rating}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-slate-50 rounded-xl text-center">
                      <div className="text-lg font-extrabold text-foreground">${m.revenue}</div>
                      <div className="text-xs text-slate-400">Total Revenue</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-center">
                      <div className="text-lg font-extrabold text-foreground">{m.customers}</div>
                      <div className="text-xs text-slate-400">Customers</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setModalView({ type: "products", merchant: m })} variant="outline" size="sm" className="flex-1 rounded-xl text-xs">
                      <Package className="w-3.5 h-3.5 mr-1.5" /> Products
                    </Button>
                    <Button onClick={() => setModalView({ type: "qr", merchant: m })} variant="outline" size="sm" className="flex-1 rounded-xl text-xs">
                      <QrCode className="w-3.5 h-3.5 mr-1.5" /> Payment QR
                    </Button>
                    <Button onClick={() => setModalView({ type: "analytics", merchant: m })} size="sm" className="flex-1 rounded-xl text-xs bg-gradient-to-r from-primary to-blue-500 text-white">
                      <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Featured Product Example */}
        <div>
          <h2 className="text-xl font-extrabold mb-4 text-slate-800">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Website Development", price: "500 USDC", merchant: "Digital Studio Japan", category: "Development" },
              { name: "Logo Design Package", price: "150 USDC", merchant: "Digital Studio Japan", category: "Design" },
              { name: "Mobile App UI Kit", price: "250 USDC", merchant: "GlobalDev Solutions", category: "Design" },
              { name: "SEO Optimization", price: "300 USDC", merchant: "GlobalDev Solutions", category: "Marketing" },
              { name: "API Integration", price: "400 USDC", merchant: "GlobalDev Solutions", category: "Development" },
              { name: "Brand Identity", price: "800 USDC", merchant: "Digital Studio Japan", category: "Branding" },
            ].map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card className="glass-panel border-0 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="w-full h-28 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl mb-3 flex items-center justify-center">
                      <Package className="w-10 h-10 text-primary/40" />
                    </div>
                    <div className="text-xs text-primary font-semibold mb-1">{p.category}</div>
                    <div className="font-bold text-slate-800 mb-1">{p.name}</div>
                    <div className="text-xs text-slate-400 mb-3">{p.merchant}</div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-foreground">{p.price}</span>
                      <Button onClick={() => handleBuy(i, p.price)} disabled={buyingId === i} size="sm" className="h-8 rounded-full px-4 text-xs bg-gradient-to-r from-primary to-blue-500 text-white">
                         {buyingId === i ? <Loader2 className="w-3 h-3 animate-spin" /> : "Buy"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Modal Overlay */}
      {modalView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setModalView(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-4 right-4 cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => setModalView(null)}>✕</div>
            
            {modalView.type === "products" && (
              <div className="text-center">
                <Package className="w-12 h-12 text-primary mx-auto mb-4 opacity-80" />
                <h3 className="text-lg font-extrabold text-slate-800 mb-2">{modalView.merchant.name} Products</h3>
                <p className="text-sm text-slate-500 mb-6">Manage your inventory, set prices in USDC/XLM, and view stock levels directly on-chain.</p>
                <div className="bg-slate-50 rounded-xl p-4 text-xs font-mono text-slate-400">List is empty. Add a product to begin!</div>
              </div>
            )}
            
            {modalView.type === "qr" && (
              <div className="text-center">
                <QrCode className="w-12 h-12 text-blue-500 mx-auto mb-4 opacity-80" />
                <h3 className="text-lg font-extrabold text-slate-800 mb-2">Receive Payments</h3>
                <p className="text-sm text-slate-500 mb-6">Scan this code with a Stellar-compatible wallet (like Lobstr or Freighter) to pay {modalView.merchant.name}.</p>
                <div className="w-48 h-48 bg-white border-4 border-slate-100 rounded-xl mx-auto flex items-center justify-center shadow-inner">
                   <QrCode className="w-24 h-24 text-slate-800" />
                </div>
                <div className="mt-4 text-[10px] text-slate-400 break-all">{modalView.merchant.receiverAddress || "GBTC2UQK6L3M342W2X5WDKB33FZZF3JQKXOK62G3K3QZ6K63K6K6K6K6"}</div>
              </div>
            )}
            
            {modalView.type === "analytics" && (
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-80" />
                <h3 className="text-lg font-extrabold text-slate-800 mb-2">Store Analytics</h3>
                <p className="text-sm text-slate-500 mb-6">Real-time on-chain revenue data and customer demographics.</p>
                <div className="grid grid-cols-2 gap-3 text-left">
                   <div className="p-3 bg-emerald-50 rounded-xl">
                      <div className="text-xs text-emerald-600 font-bold mb-1">Weekly Volume</div>
                      <div className="text-lg font-extrabold text-slate-800">+12.5%</div>
                   </div>
                   <div className="p-3 bg-blue-50 rounded-xl">
                      <div className="text-xs text-blue-600 font-bold mb-1">Unique Buyers</div>
                      <div className="text-lg font-extrabold text-slate-800">{modalView.merchant.customers + 4}</div>
                   </div>
                </div>
              </div>
            )}
            
            <Button className="w-full mt-6 rounded-xl bg-slate-900 text-white" onClick={() => setModalView(null)}>Close</Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
