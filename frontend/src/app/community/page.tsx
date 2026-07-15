"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Vote, Wallet2, Plus, CheckCircle2, Loader2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_COMMUNITIES } from "@/lib/constants";

const proposals = [
  { id: "PROP-001", title: "Fund APAC Devs Scholarship", community: "APAC Developer Fund", amount: "5000 USDC", votes: { for: 780, against: 120 }, status: "ACTIVE", daysLeft: 3 },
  { id: "PROP-002", title: "Sponsor Stellar Hackathon", community: "APAC Developer Fund", amount: "2000 USDC", votes: { for: 650, against: 200 }, status: "ACTIVE", daysLeft: 5 },
  { id: "PROP-003", title: "Deploy Marketing Campaign", community: "Freelancer Guild ASEAN", amount: "1500 USDC", votes: { for: 320, against: 80 }, status: "PASSED", daysLeft: 0 },
];

export default function CommunityPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);
  const [voted, setVoted] = useState<Set<string>>(new Set());

  const handleCreate = async () => {
    setCreating(true);
    await new Promise((r) => setTimeout(r, 1800));
    setCreating(false);
    setCreated(true);
    setShowCreate(false);
    setTimeout(() => setCreated(false), 4000);
  };

  const handleVote = async (id: string, side: "for" | "against") => {
    setVotingId(id + side);
    await new Promise((r) => setTimeout(r, 1200));
    setVotingId(null);
    setVoted((prev) => new Set(prev).add(id));
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-extrabold">Community Finance DAO</h1>
          <Button onClick={() => setShowCreate(!showCreate)} className="rounded-full bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> Create DAO
          </Button>
        </div>
        <p className="text-slate-500 mb-8 text-sm">Transparent community treasury management and governance powered by Soroban</p>

        {created && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 mb-6 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-semibold text-sm">Community DAO Created!</div>
              <div className="text-xs">Your DAO is now deployed on Soroban with transparent treasury management.</div>
            </div>
          </motion.div>
        )}

        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6">
            <Card className="glass-panel border-0 shadow-md">
              <CardHeader className="px-6 py-4">
                <CardTitle className="text-base font-bold">Create Community DAO</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-slate-600 mb-2 block">Community Name</Label>
                    <Input placeholder="e.g., APAC Builder Fund" className="bg-white/70 border-slate-200 rounded-xl h-11" />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-slate-600 mb-2 block">Initial Treasury (USDC)</Label>
                    <Input type="number" placeholder="e.g., 10000" className="bg-white/70 border-slate-200 rounded-xl h-11" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-semibold text-slate-600 mb-2 block">Mission Statement</Label>
                    <Input placeholder="Our community's goal is to..." className="bg-white/70 border-slate-200 rounded-xl h-11" />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
                  <div className="text-xs font-bold text-sky-700 mb-1.5">Soroban Community Contract</div>
                  <div className="flex flex-wrap gap-2 text-xs text-sky-600">
                    {["create_fund()", "deposit()", "vote()", "withdraw()"].map((fn) => (
                      <span key={fn} className="px-2 py-1 bg-white rounded-full border border-sky-200">{fn}</span>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full h-12 rounded-xl font-bold bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg shadow-primary/20">
                  {creating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Deploying DAO...</> : <><Users className="w-4 h-4 mr-2" /> Create DAO Community</>}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Community Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {MOCK_COMMUNITIES.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-panel border-0 shadow-md hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-200">
                      {c.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{c.name}</div>
                      <div className="text-xs text-slate-400">{c.members.toLocaleString()} members</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-3 bg-slate-50 rounded-xl text-center">
                      <div className="text-lg font-extrabold text-foreground">{c.members.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">Members</div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl text-center">
                      <div className="text-lg font-extrabold text-emerald-700">${Number(c.treasury).toLocaleString()}</div>
                      <div className="text-xs text-slate-400">Treasury</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-center">
                      <div className="text-lg font-extrabold text-foreground">{c.proposals}</div>
                      <div className="text-xs text-slate-400">Proposals</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs border-blue-200 text-blue-600 hover:bg-blue-50">
                      <Users className="w-3.5 h-3.5 mr-1.5" /> Join
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs">
                      <Wallet2 className="w-3.5 h-3.5 mr-1.5" /> Deposit
                    </Button>
                    <Button size="sm" className="flex-1 rounded-xl text-xs bg-gradient-to-r from-primary to-blue-500 text-white">
                      <Vote className="w-3.5 h-3.5 mr-1.5" /> Govern
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Active Proposals */}
        <div>
          <h2 className="text-xl font-extrabold mb-4 text-slate-800">Active Governance Proposals</h2>
          <div className="space-y-4">
            {proposals.map((p, i) => {
              const total = p.votes.for + p.votes.against;
              const forPct = Math.round((p.votes.for / total) * 100);
              const hasVoted = voted.has(p.id);

              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="glass-panel border-0 shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <div className="font-bold text-slate-800">{p.title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{p.community} · {p.id}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                            {p.status}
                          </span>
                          <span className="text-sm font-bold text-foreground">{p.amount}</span>
                        </div>
                      </div>

                      {/* Vote Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-green-600 font-semibold">For: {p.votes.for} ({forPct}%)</span>
                          <span className="text-red-500 font-semibold">Against: {p.votes.against} ({100 - forPct}%)</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                          <div className="bg-green-400 rounded-l-full transition-all duration-500" style={{ width: `${forPct}%` }} />
                          <div className="bg-red-300 rounded-r-full transition-all duration-500" style={{ width: `${100 - forPct}%` }} />
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{total} total votes · {p.daysLeft > 0 ? `${p.daysLeft} days left` : "Voting ended"}</div>
                      </div>

                      {p.status === "ACTIVE" && !hasVoted && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleVote(p.id, "for")}
                            disabled={votingId === p.id + "for"}
                            className="rounded-full text-xs bg-green-500 hover:bg-green-600 text-white"
                          >
                            {votingId === p.id + "for" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Vote For"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVote(p.id, "against")}
                            disabled={votingId === p.id + "against"}
                            className="rounded-full text-xs border-red-200 text-red-600 hover:bg-red-50"
                          >
                            {votingId === p.id + "against" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Vote Against"}
                          </Button>
                        </div>
                      )}
                      {hasVoted && (
                        <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Your vote recorded on-chain
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
