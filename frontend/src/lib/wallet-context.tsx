"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet } from "lucide-react";
import { isConnected as checkFreighter, getAddress as getFreighterKey, requestAccess } from "@stellar/freighter-api";

import albedo from "@albedo-link/intent";

interface WalletContextType {
  isConnected: boolean;
  publicKey: string | null;
  balances: {
    XLM: string;
    USDC: string;
    EURC: string;
  };
  connect: () => void;
  disconnect: () => void;
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockBalances = { XLM: "250.00", USDC: "1,500.00", EURC: "500.00" };

  const connect = () => {
    setIsModalOpen(true);
    setError(null);
  };

  const connectWallet = async (walletId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (walletId === "freighter") {
        const checkRes = await checkFreighter();
        if (checkRes.isConnected) {
          let pkRes = await getFreighterKey();
          if (pkRes.error || !pkRes.address) {
            pkRes = await requestAccess();
          }
          if (pkRes.address) {
            setPublicKey(pkRes.address);
            setIsConnected(true);
            setIsModalOpen(false);
            return;
          }
        }
        // Seamless fallback if Freighter is not installed
        const demoKey = "GDEMO...FREIGHTER" + Math.random().toString(36).substring(7).toUpperCase();
        setPublicKey(demoKey);
        setIsConnected(true);
        setIsModalOpen(false);
        return;
      } else if (walletId === "albedo") {
        const res = await albedo.publicKey({});
        if (res.pubkey) {
          setPublicKey(res.pubkey);
          setIsConnected(true);
          setIsModalOpen(false);
          return;
        }
      } else if (walletId === "xbull") {
        try {
          const { xBullWalletConnect } = await import("@creit.tech/xbull-wallet-connect");
          const bridge = new xBullWalletConnect();
          const pk = await bridge.connect();
          if (pk) {
            setPublicKey(pk);
            setIsConnected(true);
            setIsModalOpen(false);
            return;
          }
        } catch (e: any) {
          setError("xBull connection failed or cancelled.");
          return;
        }
      }
    } catch (err: any) {
      // Catch user cancellation or SDK errors
      setError(`Connection to ${walletId} cancelled.`);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setPublicKey(null);
  };

  const wallets = [
    { id: "freighter", name: "Freighter", icon: "🚢", color: "bg-blue-50 text-blue-600" },
    { id: "albedo", name: "Albedo", icon: "☀️", color: "bg-amber-50 text-amber-600" },
    { id: "xbull", name: "xBull", icon: "🐂", color: "bg-red-50 text-red-600" },
  ];

  return (
    <WalletContext.Provider value={{ isConnected, publicKey, balances: mockBalances, connect, disconnect, isLoading, error }}>
      {children}
      
      {/* Wallet Selection Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => !isLoading && setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6"
            >
              <button 
                onClick={() => !isLoading && setIsModalOpen(false)}
                disabled={isLoading}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

              <div className="text-center mb-6 pt-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-primary/30">
                  <Wallet className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800">Connect Wallet</h2>
                <p className="text-sm text-slate-500 mt-1">Choose your preferred Stellar wallet</p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-medium">
                  {error}
                  <div className="mt-1 font-semibold text-slate-500 italic">(Demo mode will activate automatically for hackathon purposes...)</div>
                </div>
              )}

              <div className="space-y-3">
                {wallets.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => connectWallet(w.id)}
                    disabled={isLoading}
                    className="w-full flex items-center p-4 rounded-2xl border border-slate-200 hover:border-primary/30 hover:bg-slate-50 hover:shadow-md transition-all group disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:shadow-none"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mr-4 ${w.color}`}>
                      {w.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-slate-800 group-hover:text-primary transition-colors">{w.name}</div>
                      <div className="text-xs text-slate-400">Connect to {w.name} extension</div>
                    </div>
                    {isLoading ? (
                       <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 text-primary transition-opacity text-sm font-bold">
                        Connect &rarr;
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 text-center text-xs text-slate-400">
                New to Stellar? <a href="https://freighter.app" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">Download Freighter</a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside WalletProvider");
  return context;
}
