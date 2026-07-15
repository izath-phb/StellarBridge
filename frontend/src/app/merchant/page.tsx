"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Store, Plus, QrCode, Star, TrendingUp, Package, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_MERCHANTS } from "@/lib/constants";

export default function MerchantPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [form, setForm] = useState({ name: "", desc: "", category: "" });

  const handleCreate = async () => {
    setCreating(true);
    await new Promise((r) => setTimeout(r, 1800));
    setCreating(false);
    setCreated(true);
    setShowCreate(false);
    setTimeout(() => setCreated(false), 4000);
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
          {MOCK_MERCHANTS.map((m, i) => (
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
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs">
                      <Package className="w-3.5 h-3.5 mr-1.5" /> Products
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs">
                      <QrCode className="w-3.5 h-3.5 mr-1.5" /> Payment QR
                    </Button>
                    <Button size="sm" className="flex-1 rounded-xl text-xs bg-gradient-to-r from-primary to-blue-500 text-white">
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
                      <Button size="sm" className="h-8 rounded-full px-4 text-xs bg-gradient-to-r from-primary to-blue-500 text-white">Buy</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
