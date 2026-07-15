import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-100 text-slate-600 py-12 px-6 border-t border-slate-200">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 shrink-0 mb-4">
            <Image
              src="/logo.png"
              alt="StellarBridge Logo"
              width={36}
              height={36}
              className="rounded-xl shadow-lg shadow-primary/30 object-cover"
            />
            <span className="text-xl font-extrabold text-slate-900">
              StellarBridge
            </span>
          </Link>
          <p className="text-sm text-slate-500 mb-6 max-w-sm">
            A Global Decentralized Payment and Financial Access Network Powered by Stellar Soroban. Instant settlements, trustless escrows, and borderless commerce.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/izath-phb/StellarBridge" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
            <a href="https://x.com/izath_bsl" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="https://discord.gg/stellarbridge" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-slate-900 font-bold mb-4">Ecosystem</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
            <li><Link href="/escrow" className="hover:text-primary transition-colors">Smart Escrow</Link></li>
            <li><Link href="/merchant" className="hover:text-primary transition-colors">Merchant Portal</Link></li>
            <li><Link href="/community" className="hover:text-primary transition-colors">DAO Community</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-900 font-bold mb-4">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://stellar.org" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Stellar Network</a></li>
            <li><a href="https://soroban.stellar.org" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Soroban Docs</a></li>
            <li><a href="https://freighter.app" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Freighter Wallet</a></li>
            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} StellarBridge. Built for APAC Stellar Hackathon.
        </p>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Operational on Stellar Testnet
        </div>
      </div>
    </footer>
  );
}
