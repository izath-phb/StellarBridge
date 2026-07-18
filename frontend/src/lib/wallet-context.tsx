"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type * as StellarSdk from "@stellar/stellar-sdk";
import { MOCK_ISSUER_PUBKEY, MOCK_ISSUER_SECRET } from "./constants";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet } from "lucide-react";
import { isConnected as checkFreighter, getAddress as getFreighterKey, requestAccess } from "@stellar/freighter-api";

import albedo from "@albedo-link/intent";

export interface Transaction {
  id: string;
  type: string;
  amount: string;
  asset: string;
  from: string;
  to: string;
  date: string;
  status: string;
  hash: string;
}

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
  setupTrustlines: () => Promise<void>;
  needsTrustline: boolean;
  isLoading: boolean;
  error: string | null;
  transactions: Transaction[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("sb_wallet_pubkey");
    if (savedKey) {
      setPublicKey(savedKey);
      setIsConnected(true);
    }
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balances, setBalances] = useState({ XLM: "0.00", USDC: "0.00", EURC: "0.00" });
  const [needsTrustline, setNeedsTrustline] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (isConnected && publicKey) {
      const fetchBalances = async () => {
        try {
          const StellarSdk = await import("@stellar/stellar-sdk");
          const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
          const account = await server.loadAccount(publicKey);
          
          let xlmBalance = "0.00";
          let usdcBalance = "0.00";
          let eurcBalance = "0.00";
          
          let hasUsdc = false;
          let hasEurc = false;
          
          account.balances.forEach((b: any) => {
            if (b.asset_type === "native") {
              xlmBalance = parseFloat(b.balance).toFixed(2);
            } else if (b.asset_code === "USDC" && b.asset_issuer === MOCK_ISSUER_PUBKEY) {
              hasUsdc = true;
              usdcBalance = parseFloat(b.balance).toFixed(2);
            } else if (b.asset_code === "EURC" && b.asset_issuer === MOCK_ISSUER_PUBKEY) {
              hasEurc = true;
              eurcBalance = parseFloat(b.balance).toFixed(2);
            }
          });
          
          setNeedsTrustline(!hasUsdc || !hasEurc);
          setBalances({ XLM: xlmBalance, USDC: usdcBalance, EURC: eurcBalance });

          // Fetch transactions (payments)
          const payments = await server.payments().forAccount(publicKey).order("desc").limit(50).call();
          const parsedTxs: Transaction[] = payments.records
            .filter((p: any) => p.type === "payment" || p.type === "create_account")
            .map((p: any) => {
              const isReceived = p.type === "payment" ? p.to === publicKey : p.account === publicKey;
              const fromAcc = p.type === "payment" ? p.from : p.funder;
              const toAcc = p.type === "payment" ? p.to : p.account;
              const amount = p.type === "payment" ? p.amount : p.starting_balance;
              const asset = p.type === "payment" ? (p.asset_type === "native" ? "XLM" : p.asset_code) : "XLM";

              return {
                id: p.id,
                type: isReceived ? "received" : "sent",
                amount: amount || "0",
                asset: asset || "Unknown",
                from: fromAcc === publicKey ? "You" : `${fromAcc.slice(0, 4)}...${fromAcc.slice(-4)}`,
                to: toAcc === publicKey ? "You" : `${toAcc.slice(0, 4)}...${toAcc.slice(-4)}`,
                date: new Date(p.created_at).toISOString().split("T")[0],
                status: p.transaction_successful ? "SUCCESS" : "FAILED",
                hash: p.transaction_hash.slice(0, 9),
              };
            });

          // Load local escrows for demo purposes so they appear in history
          let localTxs: any[] = [];
          try {
            const savedEscrows = localStorage.getItem("sb_escrows");
            if (savedEscrows) {
              JSON.parse(savedEscrows).forEach((e: any) => {
                localTxs.push({
                  id: e.id,
                  type: "escrow",
                  amount: e.amount || "0",
                  asset: e.asset || "USDC",
                  from: e.client === "You" ? "You" : (e.client || "Client").slice(0, 8),
                  to: e.freelancer === "You" ? "You" : (e.freelancer || "Freelancer").slice(0, 8),
                  date: e.createdAt || new Date().toISOString().split("T")[0],
                  status: e.status || "PENDING",
                  hash: "contract_call",
                });
              });
            }
          } catch(e) {}

          const allTxs = [...parsedTxs, ...localTxs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setTransactions(allTxs);
        } catch (e) {
          console.error("Error fetching balance/txs:", e);
          setBalances({ XLM: "0.00", USDC: "0.00", EURC: "0.00" });
          setTransactions([]);
        }
      };
      fetchBalances();
      
      const interval = setInterval(fetchBalances, 10000);
      return () => clearInterval(interval);
    } else {
      setBalances({ XLM: "0.00", USDC: "0.00", EURC: "0.00" });
      setNeedsTrustline(false);
      setTransactions([]);
    }
  }, [isConnected, publicKey]);

  const setupTrustlines = async () => {
    if (!publicKey) return;
    setIsLoading(true);
    try {
      const StellarSdk = await import("@stellar/stellar-sdk");
      const { signTransaction } = await import("@stellar/freighter-api");
      const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
      
      const account = await server.loadAccount(publicKey);
      const usdcAsset = new StellarSdk.Asset("USDC", MOCK_ISSUER_PUBKEY);
      const eurcAsset = new StellarSdk.Asset("EURC", MOCK_ISSUER_PUBKEY);
      
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(StellarSdk.Operation.changeTrust({ asset: usdcAsset }))
        .addOperation(StellarSdk.Operation.changeTrust({ asset: eurcAsset }))
        .setTimeout(180)
        .build();
        
      const signedRes = await signTransaction(tx.toXDR(), { networkPassphrase: StellarSdk.Networks.TESTNET });
      if (signedRes.error) throw new Error(signedRes.error);
      
      const txToSubmit = StellarSdk.TransactionBuilder.fromXDR(signedRes.signedTxXdr, StellarSdk.Networks.TESTNET) as StellarSdk.Transaction;
      await server.submitTransaction(txToSubmit);
      
      // Auto faucet for demo
      const issuerKeypair = StellarSdk.Keypair.fromSecret(MOCK_ISSUER_SECRET);
      const issuerAccount = await server.loadAccount(MOCK_ISSUER_PUBKEY);
      const faucetTx = new StellarSdk.TransactionBuilder(issuerAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(StellarSdk.Operation.payment({
          destination: publicKey,
          asset: usdcAsset,
          amount: "1500"
        }))
        .addOperation(StellarSdk.Operation.payment({
          destination: publicKey,
          asset: eurcAsset,
          amount: "500"
        }))
        .setTimeout(180)
        .build();
        
      faucetTx.sign(issuerKeypair);
      await server.submitTransaction(faucetTx);
      
      alert("Trustlines created and faucet funds received!");
      setNeedsTrustline(false);
    } catch (e: any) {
      alert("Error setting up trustlines: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          
          // In some Freighter versions, setAllowed() might be needed or requestAccess returns error if not allowed
          if (pkRes.error || !pkRes.address) {
            const { setAllowed } = await import("@stellar/freighter-api");
            const allowRes = await setAllowed();
            if (allowRes.isAllowed) {
              pkRes = await getFreighterKey();
            }
          }

          if (pkRes.address) {
            setPublicKey(pkRes.address);
            setIsConnected(true);
            localStorage.setItem("sb_wallet_pubkey", pkRes.address);
            setIsModalOpen(false);
            return;
          }
          
          // If we reach here, Freighter IS installed but we couldn't get the address
          setError(pkRes.error?.toString() || "Failed to get account from Freighter. Please unlock your wallet and approve the connection.");
          return;
        }
        
        // Seamless fallback ONLY if Freighter is not installed
        const demoKey = "GDEMO...FREIGHTER" + Math.random().toString(36).substring(7).toUpperCase();
        setPublicKey(demoKey);
        setIsConnected(true);
        localStorage.setItem("sb_wallet_pubkey", demoKey);
        setIsModalOpen(false);
        return;
      } else if (walletId === "albedo") {
        const res = await albedo.publicKey({});
        if (res.pubkey) {
          setPublicKey(res.pubkey);
          setIsConnected(true);
          localStorage.setItem("sb_wallet_pubkey", res.pubkey);
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
            localStorage.setItem("sb_wallet_pubkey", pk);
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
    localStorage.removeItem("sb_wallet_pubkey");
  };

  const wallets = [
    { id: "freighter", name: "Freighter", icon: "🚢", color: "bg-blue-50 text-blue-600" },
    { id: "albedo", name: "Albedo", icon: "☀️", color: "bg-amber-50 text-amber-600" },
    { id: "xbull", name: "xBull", icon: "🐂", color: "bg-red-50 text-red-600" },
  ];

  return (
    <WalletContext.Provider value={{ isConnected, publicKey, balances, needsTrustline, setupTrustlines, connect, disconnect, isLoading, error, transactions }}>
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
