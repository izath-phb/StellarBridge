"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ReceiptText, Plus, CheckCircle2, Clock, XCircle, Loader2, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_INVOICES } from "@/lib/constants";
import { useWallet } from "@/lib/wallet-context";
import { submitSorobanTransaction, INVOICE_CONTRACT_ID, XLM_CONTRACT_ID } from "@/lib/soroban";
import * as StellarSdk from "@stellar/stellar-sdk";

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  PENDING:   { color: "bg-amber-100 text-amber-700",   icon: <Clock className="w-3.5 h-3.5" /> },
  PAID:      { color: "bg-blue-100 text-blue-700",     icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  COMPLETED: { color: "bg-green-100 text-green-700",   icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  OVERDUE:   { color: "bg-red-100 text-red-600",       icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function InvoicePage() {
  const { isConnected, connect, publicKey } = useWallet();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [invoices, setInvoices] = useState(MOCK_INVOICES);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("invoices");
    if (saved) {
      // Filter out dummy invoices (which use USDC) to show only real ones
      const parsed = JSON.parse(saved).filter((i: any) => i.asset === "XLM");
      setInvoices(parsed);
      localStorage.setItem("invoices", JSON.stringify(parsed));
    } else {
      setInvoices([]);
    }
  }, []);

  const [form, setForm] = useState({ clientName: "", dueDate: "", amount: "", clientAddress: "", description: "" });

  const handleCreate = async () => {
    if (!publicKey) return;
    setCreating(true);
    try {
      const invoiceIdStr = "INV-" + Math.floor(Math.random() * 10000);
      const args = [
        StellarSdk.nativeToScVal(invoiceIdStr, { type: 'string' }),
        new StellarSdk.Address(publicKey).toScVal(),
        new StellarSdk.Address(form.clientAddress).toScVal(),
        new StellarSdk.Address(XLM_CONTRACT_ID).toScVal(),
        StellarSdk.nativeToScVal(Math.floor(Number(form.amount) * 10000000), { type: 'i128' })
      ];
      await submitSorobanTransaction(publicKey, INVOICE_CONTRACT_ID, "create_invoice", args);

      const newInvoice = {
        id: invoiceIdStr,
        client: form.clientName,
        clientAddress: form.clientAddress,
        amount: form.amount,
        asset: "XLM",
        status: "PENDING",
        createdAt: new Date().toISOString().split("T")[0],
        dueDate: form.dueDate
      };
      
      const newInvoices = [newInvoice, ...invoices];
      setInvoices(newInvoices);
      localStorage.setItem("invoices", JSON.stringify(newInvoices));
      
      setCreated(true);
      setShowCreate(false);
      setTimeout(() => setCreated(false), 4000);
    } catch (err: any) {
      console.error(err);
      alert("Failed to create invoice: " + (err.message || err.toString()));
    } finally {
      setCreating(false);
    }
  };

  const handlePay = async (invoiceId: string) => {
    if (!publicKey) return;
    setProcessingId(invoiceId);
    try {
      const inv = invoices.find(i => i.id === invoiceId);
      if (inv?.asset === "XLM") {
        const args = [StellarSdk.nativeToScVal(invoiceId, { type: 'string' })];
        await submitSorobanTransaction(publicKey, INVOICE_CONTRACT_ID, "pay_invoice", args);
      } else {
        await new Promise(r => setTimeout(r, 1500));
      }
      
      const newInvoices = invoices.map(i => i.id === invoiceId ? { ...i, status: "PAID" } : i);
      setInvoices(newInvoices);
      localStorage.setItem("invoices", JSON.stringify(newInvoices));
    } catch (err: any) {
      console.error(err);
      alert("Failed to pay invoice: " + (err.message || err.toString()));
    } finally {
      setProcessingId(null);
    }
  };

  const totalPending = invoices.filter((i) => i.status === "PENDING").reduce((s, i) => s + Number(i.amount), 0);
  const totalPaid = invoices.filter((i) => i.status !== "PENDING").reduce((s, i) => s + Number(i.amount), 0);

  return (
    <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-extrabold">Tokenized Invoices</h1>
          <Button onClick={() => setShowCreate(!showCreate)} className="rounded-full bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> New Invoice
          </Button>
        </div>
        <p className="text-slate-500 mb-8 text-sm">Create blockchain-verified invoices using Soroban's create_invoice() contract</p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Invoices", value: invoices.length.toString() },
            { label: "Pending Amount", value: `${totalPending} XLM` },
            { label: "Collected", value: `${totalPaid} XLM` },
            { label: "Blockchain Verified", value: `${invoices.length}` },
          ].map((s, i) => (
            <Card key={i} className="glass-panel border-0 shadow-sm text-center">
              <CardContent className="pt-4 pb-4">
                <div className="text-xl font-extrabold text-foreground">{s.value}</div>
                <div className="text-xs text-slate-400 mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {created && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Invoice Created on Soroban!</div>
              <div className="text-xs">Invoice is now a blockchain-verified digital asset on Stellar Testnet.</div>
            </div>
          </motion.div>
        )}

        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6">
            <Card className="glass-panel border-0 shadow-md">
              <CardHeader className="px-6 py-4">
                <CardTitle className="text-base font-bold">Create New Invoice</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-600 mb-2 block">Client Name</Label>
                    <Input placeholder="e.g., Acme Corp" value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} className="bg-white/70 border-slate-200 rounded-xl h-11" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-600 mb-2 block">Due Date</Label>
                    <Input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="bg-white/70 border-slate-200 rounded-xl h-11" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-600 mb-2 block">Amount</Label>
                    <div className="relative">
                      <Input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="bg-white/70 border-slate-200 rounded-xl h-11 pr-16" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">XLM</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-600 mb-2 block">Client Wallet Address</Label>
                    <Input placeholder="G... Stellar address" value={form.clientAddress} onChange={e => setForm({...form, clientAddress: e.target.value})} className="bg-white/70 border-slate-200 font-mono rounded-xl h-11 text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-semibold text-slate-600 mb-2 block">Description</Label>
                    <Input placeholder="Services rendered..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-white/70 border-slate-200 rounded-xl h-11" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                  <div className="text-xs font-bold text-violet-700 mb-1.5">Soroban Invoice Contract</div>
                  <div className="flex flex-wrap gap-2 text-xs text-violet-600">
                    <span className="px-2 py-1 bg-white rounded-full border border-violet-200">create_invoice()</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-white rounded-full border border-violet-200">pay_invoice()</span>
                    <span>→</span>
                    <span className="px-2 py-1 bg-white rounded-full border border-violet-200">verify_invoice()</span>
                  </div>
                </div>

                <Button onClick={!isConnected ? connect : handleCreate} disabled={creating || (isConnected && (!form.clientName || !form.amount || !form.clientAddress))} className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/20">
                  {creating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating on-chain...</> : <><ReceiptText className="w-4 h-4 mr-2" /> {isConnected ? "Create Tokenized Invoice" : "Connect Wallet"}</>}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Invoice List */}
        <div className="space-y-3">
          {invoices.map((inv, i) => {
            const sc = statusConfig[inv.status] || { color: "bg-slate-100", icon: <Clock className="w-3.5 h-3.5" /> };
            return (
              <motion.div key={inv.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass-panel border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-400/10 flex items-center justify-center">
                          <ReceiptText className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 font-mono">{inv.id}</div>
                          <div className="text-sm text-slate-600 mt-0.5">Client: <strong>{inv.client}</strong></div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Created: {inv.createdAt} · Due: {inv.dueDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-2xl font-extrabold text-foreground">
                          {Number(inv.amount).toLocaleString("en-US")} <span className="text-sm text-slate-400">{inv.asset}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sc.color}`}>
                          {sc.icon} {inv.status}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                      {inv.status === "PENDING" && (
                        <Button onClick={() => !isConnected ? connect() : handlePay(inv.id)} disabled={processingId === inv.id} size="sm" className="rounded-full text-xs bg-gradient-to-r from-primary to-blue-500 text-white">
                          {processingId === inv.id ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : null} Pay Invoice
                        </Button>
                      )}
                      <Button onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${inv.clientAddress || publicKey}`, "_blank")} variant="outline" size="sm" className="rounded-full text-xs">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" /> View on Testnet
                      </Button>
                      <Button onClick={() => alert("PDF download feature coming soon!")} variant="outline" size="sm" className="rounded-full text-xs">
                        Download PDF
                      </Button>
                    </div>
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
