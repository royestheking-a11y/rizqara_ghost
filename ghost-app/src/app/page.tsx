"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { BehaviorProvider } from "@/components/BehaviorProvider";
import { GhostLayer } from "@/components/GhostLayer";
import { Eye, Terminal, Zap, Search, ShieldAlert, Rocket, XCircle, Archive, Mail, Trash2, Ghost } from "lucide-react";

export default function Home() {
  return (
    <BehaviorProvider>
      <GhostScannerExperience />
    </BehaviorProvider>
  );
}

function GhostScannerExperience() {
  const [phase, setPhase] = useState<"arrival" | "scanner">("arrival");
  const [showEnter, setShowEnter] = useState(false);
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState("");
  
  const [savedLeads, setSavedLeads] = useState<any[]>([]);
  const [showPitch, setShowPitch] = useState(false);

  // Load Archive on mount
  useEffect(() => {
    const timer = setTimeout(() => setShowEnter(true), 2000);
    const stored = localStorage.getItem("ghostArchive");
    if (stored) {
      setSavedLeads(JSON.parse(stored));
    }
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setPhase("scanner");
  };

  const clearArchive = () => {
    setSavedLeads([]);
    localStorage.removeItem("ghostArchive");
  };

  const deleteLead = (targetUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedLeads = savedLeads.filter(l => l.url !== targetUrl);
    setSavedLeads(updatedLeads);
    localStorage.setItem("ghostArchive", JSON.stringify(updatedLeads));
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    let targetUrl = url;
    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

    setIsScanning(true);
    setError("");
    setScanResult(null);
    setShowPitch(false);

    try {
      // Point to the dedicated backend server instead of Next.js API route
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to scan website.');
      
      setScanResult(data);
      
      // Save to Archive
      const newLead = {
        url: targetUrl,
        email: data.analysis.extractedEmail || "Unknown",
        score: data.analysis.vulnerabilityScore,
        date: new Date().toISOString()
      };
      
      const updatedLeads = [newLead, ...savedLeads.filter((l: any) => l.url !== targetUrl)].slice(0, 50); // Keep last 50
      setSavedLeads(updatedLeads);
      localStorage.setItem("ghostArchive", JSON.stringify(updatedLeads));
      
      setIsScanning(false);
    } catch (err: any) {
        setError(err.message);
        setIsScanning(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-black text-white selection:bg-white/20 font-sans pb-32">
      <AnimatePresence mode="wait">
        {phase === "arrival" ? (
          <motion.div
            key="arrival"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)" }}
            className="flex flex-col items-center justify-center min-h-screen p-8 text-center"
            onClick={handleEnter}
          >
            <div className="space-y-8 max-w-2xl cursor-pointer">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <motion.div 
                     animate={{ y: [0, -10, 0] }} 
                     transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Ghost size={64} className="text-white/80 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2 }}
                className="text-white/40 font-mono text-sm tracking-[0.3em] uppercase"
              >
                Ghost Internet Intelligence
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="text-5xl md:text-7xl font-bold tracking-tighter"
              >
                Expose the hidden web.
              </motion.h1>
              
              <div className="h-12 flex items-center justify-center mt-6 text-white/60 font-mono text-sm md:text-base">
                 {showEnter && (
                    <TypewriterText text="Automated B2B Lead Auditing. Extract hidden tech stacks, detect vulnerabilities, and generate high-ticket growth proposals instantly." />
                 )}
              </div>

              {showEnter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 4 }}
                  className="pt-12"
                >
                  <p className="text-white/30 text-xs tracking-[0.3em] uppercase hover:text-white transition-colors flex items-center justify-center gap-2">
                    <Zap size={14} className="text-[#FFD700]" /> Click anywhere to initialize scanner
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="scanner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen pt-24 px-6 md:px-24 max-w-7xl mx-auto flex flex-col xl:flex-row gap-12"
          >
            <GhostLayer />
            
            {/* Main Scanner Area */}
            <div className="flex-1 space-y-16">
              <section className="space-y-8 text-center max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">
                  Target Acquisition
                </h2>
                <p className="text-white/40 text-lg">
                  Enter any competitor or business URL. We will extract their hidden tech stack, detect their marketing vulnerabilities, and generate an immediate attack plan.
                </p>

                <form onSubmit={handleScan} className="relative mt-8">
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-2 transition-all focus-within:border-white/40 focus-within:bg-white/10">
                    <Search className="text-white/40 ml-4" />
                    <input 
                      type="text" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="e.g., target-competitor.com"
                      className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-lg font-mono text-white/80 placeholder:text-white/20"
                      disabled={isScanning}
                    />
                    <button 
                      type="submit" 
                      disabled={isScanning || !url}
                      className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-white/90 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {isScanning ? <Zap className="animate-pulse" /> : "SCAN"}
                    </button>
                  </div>
                </form>

                {error && (
                   <p className="text-[#ff4d4d] text-sm pt-4 font-mono">{error}</p>
                )}
              </section>

              {isScanning && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                  className="flex flex-col items-center justify-center py-24 space-y-6"
                >
                  <div className="h-1 w-64 bg-white/10 overflow-hidden rounded-full">
                    <motion.div 
                      className="h-full bg-white"
                      animate={{ width: ["0%", "100%", "20%"], x: ["0%", "0%", "400%"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <p className="font-mono text-xs text-white/40 uppercase tracking-[0.3em] animate-pulse">
                    Bypassing surface layer... Injecting telemetry...
                  </p>
                </motion.div>
              )}

              <AnimatePresence>
                {scanResult && !isScanning && (
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} 
                    className="space-y-12"
                  >
                    <div className="grid md:grid-cols-4 gap-4 font-mono text-sm">
                       <div className="p-6 border border-white/10 rounded-xl bg-white/5">
                          <p className="text-white/40 mb-2">VULNERABILITY SCORE</p>
                          <p className={`text-4xl font-bold ${scanResult.analysis.vulnerabilityScore > 50 ? 'text-[#ff4d4d]' : 'text-[#28a745]'}`}>
                             {scanResult.analysis.vulnerabilityScore}/100
                          </p>
                       </div>
                       <div className="p-6 border border-white/10 rounded-xl bg-white/5">
                          <p className="text-white/40 mb-2">DETECTED NICHE</p>
                          <p className="text-2xl font-bold text-white/80">{scanResult.analysis.niche}</p>
                       </div>
                       <div className="p-6 border border-white/10 rounded-xl bg-white/5">
                          <p className="text-white/40 mb-2">LOAD TIME</p>
                          <p className={`text-2xl font-bold ${scanResult.data.loadTimeMs > 3500 ? 'text-[#ff4d4d]' : 'text-white/80'}`}>
                             {(scanResult.data.loadTimeMs / 1000).toFixed(2)}s
                          </p>
                       </div>
                       <div className="p-6 border border-white/10 rounded-xl bg-white/5 relative group">
                          <p className="text-white/40 mb-2 flex items-center gap-2">
                             EXTRACTED EMAIL <Mail size={12}/>
                          </p>
                          <p className="text-lg font-bold text-white/80 truncate">
                             {scanResult.analysis.extractedEmail || 'None Found'}
                          </p>
                          {scanResult.analysis.extractedEmail && (
                             <button 
                                onClick={() => setShowPitch(!showPitch)}
                                className="absolute top-4 right-4 bg-[#FFD700] text-black font-bold hover:bg-[#FFD700]/80 px-3 py-1 rounded text-xs transition-colors"
                             >
                                Generate Audit Report
                             </button>
                          )}
                       </div>
                    </div>

                    {showPitch && (
                       <motion.div 
                         initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                         className="p-8 border border-white/20 bg-white/5 rounded-2xl space-y-4"
                       >
                          <h3 className="text-xl font-bold tracking-wide uppercase flex items-center gap-2 text-white">
                             <Zap className="text-[#FFD700]" /> Full Growth Audit Report
                          </h3>
                          <p className="text-white/40 text-sm mb-4">A complete, highly persuasive proposal ready to send to the client to close the deal.</p>
                          <div className="bg-black/50 p-6 rounded-xl font-mono text-sm whitespace-pre-wrap text-white/80 border border-white/10 max-h-[500px] overflow-y-auto custom-scrollbar">
                             {scanResult.analysis.report}
                          </div>
                       </motion.div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="p-8 border border-[#ff4d4d]/30 bg-[#4a0e0e]/30 rounded-2xl space-y-6">
                          <div className="flex items-center gap-3 text-[#ff4d4d]">
                             <ShieldAlert size={24} />
                             <h3 className="text-xl font-bold tracking-wide uppercase">Architectural Gaps</h3>
                          </div>
                          <ul className="space-y-4">
                             {scanResult.analysis.gaps.length > 0 ? scanResult.analysis.gaps.map((gap: string, i: number) => (
                                <li key={i} className="flex gap-3 text-white/80 items-start">
                                   <XCircle className="text-[#ff4d4d] shrink-0 mt-1" size={16} />
                                   <span>{gap}</span>
                                </li>
                             )) : <p className="text-white/40">No critical gaps detected.</p>}
                          </ul>
                       </div>

                       <div className="p-8 border border-white/20 bg-white/10 rounded-2xl space-y-6">
                          <div className="flex items-center gap-3 text-white">
                             <Rocket size={24} />
                             <h3 className="text-xl font-bold tracking-wide uppercase">Growth Attack Plan</h3>
                          </div>
                          <ul className="space-y-4">
                             {scanResult.analysis.attackPlan.length > 0 ? scanResult.analysis.attackPlan.map((plan: string, i: number) => (
                                <li key={i} className="flex gap-3 text-white/80 items-start">
                                   <Zap className="text-[#FFD700] shrink-0 mt-1" size={16} />
                                   <span dangerouslySetInnerHTML={{ __html: plan.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                                </li>
                             )) : <p className="text-white/40">Target is heavily optimized.</p>}
                          </ul>
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* The Ghost Archive Sidebar */}
            <div className="xl:w-80 border-t xl:border-t-0 xl:border-l border-white/10 pt-12 xl:pt-0 xl:pl-12 space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white/60">
                     <Archive size={20} />
                     <h3 className="text-lg font-bold uppercase tracking-widest">The Archive</h3>
                  </div>
                  {savedLeads.length > 0 && (
                     <button onClick={clearArchive} className="text-xs text-[#ff4d4d] hover:text-[#ff4d4d]/80 transition-colors uppercase tracking-widest">
                        Clear All
                     </button>
                  )}
               </div>
               <p className="text-white/40 text-sm">Recently exposed targets stored securely in your local environment.</p>

               <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {savedLeads.length === 0 ? (
                     <p className="text-white/20 text-sm font-mono italic">No targets acquired yet.</p>
                  ) : (
                     savedLeads.map((lead, i) => (
                        <div key={i} className="p-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setUrl(lead.url)}>
                           <p className="font-bold truncate text-sm">{lead.url}</p>
                           <p className="text-xs text-white/40 truncate">{lead.email}</p>
                           <div className="mt-3 flex items-center justify-between">
                              <span className={`text-xs font-bold px-2 py-1 rounded bg-black/50 ${lead.score > 50 ? 'text-[#ff4d4d]' : 'text-[#28a745]'}`}>
                                 V-Score: {lead.score}
                              </span>
                              <button 
                                 onClick={(e) => deleteLead(lead.url, e)}
                                 className="text-white/20 hover:text-[#ff4d4d] transition-colors p-1"
                              >
                                 <Trash2 size={14} />
                              </button>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 30); // Typing speed
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}<motion.span animate={{opacity: [0, 1, 0]}} transition={{repeat: Infinity, duration: 0.8}} className="ml-1 inline-block w-2 h-4 bg-white/60 align-middle"/></span>;
}
