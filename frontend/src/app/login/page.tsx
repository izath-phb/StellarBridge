"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet2, ArrowRight, Mail, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/lib/wallet-context";

export default function LoginPage() {
  const { connect, isLoading, isConnected } = useWallet();
  const router = useRouter();
  const [mode, setMode] = useState<"wallet" | "email">("wallet");

  if (isConnected) {
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[60%] rounded-full bg-indigo-300/20 blur-[100px] -z-10" />
      <div className="absolute bottom-[5%] right-[-5%] w-[30%] h-[50%] rounded-full bg-blue-300/20 blur-[100px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-primary/30">
              S
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-foreground">Welcome Back</h1>
          <p className="text-slate-500 mt-2 text-sm">Connect your wallet or sign in to StellarBridge</p>
        </div>

        <Card className="glass-panel border-0 shadow-2xl shadow-slate-200">
          <CardContent className="p-8">
            {/* Mode Toggle */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6">
              <button
                onClick={() => setMode("wallet")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "wallet" ? "bg-white shadow-sm text-primary" : "text-slate-500"}`}
              >
                <Wallet2 className="w-4 h-4" /> Wallet
              </button>
              <button
                onClick={() => setMode("email")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${mode === "email" ? "bg-white shadow-sm text-primary" : "text-slate-500"}`}
              >
                <Mail className="w-4 h-4" /> Email
              </button>
            </div>

            {mode === "wallet" ? (
              <div className="space-y-4">
                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl text-center">
                  <Wallet2 className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 mb-1">
                    Connect your <strong>Freighter</strong> or any Stellar-compatible wallet to access StellarBridge.
                  </p>
                  <p className="text-xs text-slate-400">Secure · Non-custodial · Testnet Ready</p>
                </div>

                <Button
                  onClick={async () => { await connect(); router.push("/dashboard"); }}
                  className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/20 hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Connecting...
                    </span>
                  ) : (
                    <><Wallet2 className="w-4 h-4 mr-2" /> Connect Freighter Wallet</>
                  )}
                </Button>

                <div className="text-center text-xs text-slate-400">
                  Don't have Freighter?{" "}
                  <a href="https://freighter.app" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    Install it free
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-600 mb-2 block">Email</Label>
                  <Input type="email" placeholder="you@example.com" className="bg-white/70 border-slate-200 rounded-xl h-11" />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-slate-600 mb-2 block">Password</Label>
                  <Input type="password" placeholder="••••••••" className="bg-white/70 border-slate-200 rounded-xl h-11" />
                </div>
                <Button className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/20">
                  Sign In <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <div className="text-center text-sm text-slate-500">
                  Don't have an account?{" "}
                  <span className="text-primary cursor-pointer hover:underline font-medium">Sign up</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
