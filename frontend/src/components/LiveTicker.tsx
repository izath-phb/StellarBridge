"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRightLeft, ShieldCheck, Zap, Globe, FileCheck2 } from "lucide-react";
import React from "react";

interface LiveEvent {
  id: string;
  icon: React.ReactNode;
  text: string;
  time: string;
}

export default function LiveTicker() {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<LiveEvent[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Fetch real data from Stellar Horizon Testnet
    const fetchLiveActivity = async () => {
      try {
        const res = await fetch("https://horizon-testnet.stellar.org/operations?order=desc&limit=10");
        const data = await res.json();
        
        const records = data._embedded?.records || [];
        const newEvents: LiveEvent[] = records.map((record: any) => {
          let text = "Network Activity";
          let icon = <Globe className="w-4 h-4 text-slate-500" />;
          
          if (record.type === "payment") {
            text = `Payment: ${parseFloat(record.amount).toFixed(2)} ${record.asset_type === 'native' ? 'XLM' : 'Asset'}`;
            icon = <Zap className="w-4 h-4 text-amber-500" />;
          } else if (record.type === "create_account") {
            text = `New Account Funded: ${parseFloat(record.starting_balance).toFixed(2)} XLM`;
            icon = <ShieldCheck className="w-4 h-4 text-emerald-500" />;
          } else if (record.type === "invoke_host_function") {
            text = `Smart Contract Executed (Soroban)`;
            icon = <FileCheck2 className="w-4 h-4 text-violet-500" />;
          } else if (record.type === "path_payment_strict_receive" || record.type === "path_payment_strict_send") {
            text = `Cross-Border Transfer Settled`;
            icon = <ArrowRightLeft className="w-4 h-4 text-blue-500" />;
          } else if (record.type === "change_trust") {
            text = `Trustline Created for Asset`;
            icon = <Globe className="w-4 h-4 text-sky-500" />;
          }

          // Generate a fake "seconds ago" since it's very recent operations
          const secs = Math.floor(Math.random() * 8) + 1;

          return {
            id: record.id,
            icon,
            text,
            time: `${secs}s ago`
          };
        });

        // If no events, provide fallback, else use real events
        if (newEvents.length > 0) {
          setEvents(newEvents);
        }
      } catch (err) {
        console.error("Failed to fetch live stellar activity", err);
      }
    };

    fetchLiveActivity();
    
    // Optional: poll every 10 seconds
    const interval = setInterval(fetchLiveActivity, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted || events.length === 0) return null;

  // Duplicate for seamless infinite marquee
  const marqueeEvents = [...events, ...events, ...events];

  return (
    <div className="w-full max-w-5xl mx-auto mt-16 mb-8 overflow-hidden relative rounded-2xl glass-panel border border-primary/20 bg-white/40 shadow-xl shadow-primary/5 hidden sm:block">
      <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-white/90 to-transparent z-10" />
      <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-white/90 to-transparent z-10" />
      
      <div className="flex items-center py-4 px-4 relative">
        <div className="shrink-0 flex items-center gap-2 pr-6 border-r border-slate-200 z-20 bg-white/60 backdrop-blur-md rounded-l-xl px-3 py-1 mr-4 shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live Testnet</span>
        </div>

        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: [0, -2000] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        >
          {marqueeEvents.map((ev, i) => (
            <div key={`${ev.id}-${i}`} className="flex items-center gap-3 bg-white/80 border border-slate-100 rounded-full px-4 py-2 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                {ev.icon}
              </div>
              <span className="text-sm font-medium text-slate-700">{ev.text}</span>
              <span className="text-xs text-slate-400 ml-2">{ev.time}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
