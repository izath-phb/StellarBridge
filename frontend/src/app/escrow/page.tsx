"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Plus, Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_ESCROWS } from "@/lib/constants";
import { useWallet } from "@/lib/wallet-context";
import { submitSorobanTransaction, readSorobanContract, ESCROW_CONTRACT_ID, XLM_CONTRACT_ID } from "@/lib/soroban";
import * as StellarSdk from "@stellar/stellar-sdk";
import { useEffect, useCallback } from "react";

const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  CREATED:  { color: "bg-slate-100 text-slate-600",   icon: <Clock className="w-3.5 h-3.5" />,        label: "Created" },
  FUNDED:   { color: "bg-amber-100 text-amber-700",   icon: <Clock className="w-3.5 h-3.5" />,        label: "Funded" },
  APPROVED: { color: "bg-blue-100 text-blue-700",     icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Approved" },
  RELEASED: { color: "bg-green-100 text-green-700",   icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: "Released" },
  REFUNDED: { color: "bg-red-100 text-red-600",       icon: <AlertCircle className="w-3.5 h-3.5" />,  label: "Refunded" },
};

export default function EscrowPage() {
  const { isConnected, connect, publicKey } = useWallet();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [form, setForm] = useState({ title: "", freelancer: "", amount: "", asset: "USDC" });
  const [escrows, setEscrows] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("sb_escrows");
    if (saved) {
      try {
        setEscrows(JSON.parse(saved));
      } catch(e) {}
    } else {
      setEscrows(MOCK_ESCROWS); // Initial placeholder
    }
  }, []);

  // Save to local storage whenever it changes (only if it has data beyond the mock)
  useEffect(() => {
    if (escrows !== MOCK_ESCROWS) {
      localStorage.setItem("sb_escrows", JSON.stringify(escrows));
    }
  }, [escrows]);

  // Fetch live on-chain status
  const fetchLiveStatus = useCallback(async () => {
    if (!publicKey || escrows.length === 0) return;
    
    let updated = false;
    const newEscrows = await Promise.all(escrows.map(async (e) => {
      if (e.asset === "XLM" && !e.id.startsWith("ESC-")) { // ESC- is mock format, ours is ESC_
        try {
          const args = [StellarSdk.nativeToScVal(e.id, { type: 'symbol' })];
          const res = await readSorobanContract(publicKey, ESCROW_CONTRACT_ID, "get_escrow_status", args);
          if (!res) return e;
          const statusNative = StellarSdk.scValToNative(res);
          let realStatus = "CREATED";
          
          if (Array.isArray(statusNative)) {
            realStatus = statusNative[0]?.toString().toUpperCase() || "CREATED";
          } else if (typeof statusNative === 'string') {
            realStatus = statusNative.toUpperCase();
          } else if (statusNative?.toString) {
            realStatus = statusNative.toString().toUpperCase();
          }

          if (e.status !== realStatus) {
            updated = true;
            return { ...e, status: realStatus };
          }
        } catch(err) {
          console.error(`Failed to fetch status for ${e.id}`, err);
        }
      }
      return e;
    }));

    if (updated) {
      setEscrows(newEscrows);
    }
  }, [publicKey, escrows]);

  useEffect(() => {
    fetchLiveStatus();
    const interval = setInterval(fetchLiveStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchLiveStatus]);

  const handleCreate = async () => {
    if (!publicKey) return;
    setCreating(true);
    try {
      const uniqueId = "ESC_" + Math.random().toString(36).substring(2, 9).toUpperCase();
      
      if (form.asset !== "XLM") {
        alert("For this demo, only XLM is supported for on-chain Escrow. Other assets will be simulated.");
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        const args = [
          StellarSdk.nativeToScVal(uniqueId, { type: 'symbol' }),
          new StellarSdk.Address(publicKey).toScVal(),
          new StellarSdk.Address(form.freelancer).toScVal(),
          new StellarSdk.Address(XLM_CONTRACT_ID).toScVal(),
          StellarSdk.nativeToScVal(Math.floor(Number(form.amount) * 10000000), { type: 'i128' }),
        ];
        await submitSorobanTransaction(publicKey, ESCROW_CONTRACT_ID, "create_escrow", args);
      }
      
      const newEscrow = {
        id: uniqueId,
        title: form.title,
        client: publicKey.substring(0,4)+"..."+publicKey.substring(publicKey.length-4),
        freelancer: form.freelancer.substring(0,4)+"..."+form.freelancer.substring(form.freelancer.length-4),
        amount: form.amount,
        asset: form.asset,
        status: "CREATED",
        createdAt: new Date().toISOString().split("T")[0]
      };
      
      setEscrows(prev => [newEscrow, ...prev]);
      
      setCreated(true);
      setShowCreate(false);
      setTimeout(() => setCreated(false), 4000);
    } catch (err: any) {
      console.error(err);
      alert("Failed to create escrow: " + (err.message || err.toString()));
    } finally {
      setCreating(false);
    }
  };

  const handleAction = async (escrowId: string, action: string, newStatus: string) => {
    if (!publicKey) return;
    setProcessingId(escrowId);
    try {
      const escrow = escrows.find(e => e.id === escrowId);
      if (escrow?.asset === "XLM" && !escrow.id.startsWith("ESC-")) {
         const args = [StellarSdk.nativeToScVal(escrow.id, { type: 'symbol' })];
         await submitSorobanTransaction(publicKey, ESCROW_CONTRACT_ID, action, args);
      } else {
         await new Promise(r => setTimeout(r, 1500));
      }
      
      setEscrows(prev => prev.map(e => e.id === escrowId ? { ...e, status: newStatus } : e));
    } catch (err: any) {
      console.error(err);
      alert("Action failed: " + (err.message || err.toString()));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-extrabold">Soroban Escrow</h1>
          <Button
            onClick={() => setShowCreate(!showCreate)}
            className="rounded-full bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/20 hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" /> New Escrow
          </Button>
        </div>
        <p className="text-slate-500 mb-8 text-sm">Trustless smart contract escrows powered by Rust on Soroban</p>

        {/* Success Banner */}
        {created && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-xl text-green-700"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Escrow Created on Soroban!</div>
              <div className="text-xs">Your escrow smart contract has been deployed to Stellar Testnet.</div>
            </div>
          </motion.div>
        )}

        {/* Create Escrow Form */}
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6">
            <Card className="glass-panel border-0 shadow-md">
              <CardHeader className="px-6 py-4">
                <CardTitle className="text-base font-bold">Create New Escrow Contract</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-600 mb-2 block">Project Title</Label>
                    <Input
                      placeholder="e.g., Website Development"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="bg-white/70 border-slate-200 rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-600 mb-2 block">Freelancer Address</Label>
                    <Input
                      placeholder="G... Stellar address"
                      value={form.freelancer}
                      onChange={(e) => setForm({ ...form, freelancer: e.target.value })}
                      className="bg-white/70 border-slate-200 font-mono rounded-xl h-11 text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-600 mb-2 block">Amount</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        className="bg-white/70 border-slate-200 rounded-xl h-11 pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">USDC</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-600 mb-2 block">Asset</Label>
                    <div className="flex gap-2">
                      {["XLM", "USDC", "EURC"].map((a) => (
                        <button
                          key={a}
                          onClick={() => setForm({ ...form, asset: a })}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                            form.asset === a ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-500"
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Soroban Flow Explanation */}
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div className="text-xs font-bold text-indigo-700 mb-2">Soroban Contract Flow</div>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-indigo-600">
                    <span className="px-2 py-1 bg-white rounded-full border border-indigo-200">create_escrow()</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-white rounded-full border border-indigo-200">deposit_payment()</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-white rounded-full border border-indigo-200">approve_release()</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-white rounded-full border border-indigo-200">release_payment()</span>
                  </div>
                </div>

                <Button
                  onClick={!isConnected ? connect : handleCreate}
                  disabled={creating || (isConnected && (!form.title || !form.freelancer || !form.amount))}
                  className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/20"
                >
                  {creating ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Deploying to Soroban...</>
                  ) : (
                    <><ShieldCheck className="w-4 h-4 mr-2" /> {isConnected ? "Create Escrow Contract" : "Connect Wallet"}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Escrow List */}
        <div className="space-y-4">
          {escrows.map((escrow, i) => {
            const sc = statusConfig[escrow.status] || { color: "bg-slate-100", icon: <Clock className="w-3.5 h-3.5" />, label: escrow.status };
            return (
              <motion.div key={escrow.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass-panel border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center">
                          <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{escrow.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Client: <span className="font-medium">{escrow.client}</span> · Freelancer: <span className="font-medium">{escrow.freelancer}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">ID: {escrow.id} · Created: {escrow.createdAt}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xl font-extrabold text-foreground">{escrow.amount} <span className="text-sm text-slate-400">{escrow.asset}</span></div>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
                          {sc.icon} {sc.label}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {escrow.status === "CREATED" && (
                      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                        <Button onClick={() => handleAction(escrow.id, "deposit_payment", "FUNDED")} disabled={processingId === escrow.id} size="sm" className="rounded-full text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
                          {processingId === escrow.id ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null} Deposit Payment
                        </Button>
                      </div>
                    )}
                    {escrow.status === "FUNDED" && (
                      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                        <Button onClick={() => handleAction(escrow.id, "approve_release", "APPROVED")} disabled={processingId === escrow.id} variant="outline" size="sm" className="rounded-full text-xs border-green-200 text-green-700 hover:bg-green-50">
                          {processingId === escrow.id ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1" />} Approve Release
                        </Button>
                        <Button onClick={() => handleAction(escrow.id, "refund_payment", "REFUNDED")} disabled={processingId === escrow.id} variant="outline" size="sm" className="rounded-full text-xs border-red-200 text-red-600 hover:bg-red-50">
                          Refund
                        </Button>
                      </div>
                    )}
                    {escrow.status === "APPROVED" && (
                      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                        <Button onClick={() => handleAction(escrow.id, "release_payment", "RELEASED")} disabled={processingId === escrow.id} size="sm" className="rounded-full text-xs bg-gradient-to-r from-primary to-blue-500 text-white shadow-sm">
                          {processingId === escrow.id ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null} Release Payment
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
