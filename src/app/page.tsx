"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Terminal,
  FileText,
  Calendar,
  Image as ImageIcon,
  Share2,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Zap,
  Globe,
  ArrowRight,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface BrandAudit {
  niche: string;
  targetAudience: string;
  swot: {
    strengths: string[];
    weaknesses: string[];
  };
  score: number;
  growthHacks: string[];
}

interface CalendarItem {
  day: string;
  platform: string;
  postTitle: string;
  caption: string;
  visualPrompt: string;
}

interface CampaignData {
  brandAudit: BrandAudit;
  contentCalendar: CalendarItem[];
  adSlogans: string[];
  imagePrompts: string[];
}

interface QueueItem {
  id: string;
  platform: string;
  type: "Calendar Post" | "Ad Banner";
  content: string;
  status: "QUEUED" | "DISPATCHING" | "SUCCESS" | "FAILED";
  dispatchedAt?: string;
  jobId?: string;
}

// Custom SVG components for brand logos to avoid version issues
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

export default function Home() {
  const [urlOrHandle, setUrlOrHandle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"audit" | "calendar" | "creatives" | "queue">("audit");
  const [logs, setLogs] = useState<string[]>([]);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  
  // Advanced context form state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [userBio, setUserBio] = useState("");
  const [userProducts, setUserProducts] = useState("");
  const [userAudience, setUserAudience] = useState("");

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Auto-expand advanced inputs if handle typed
  useEffect(() => {
    if (urlOrHandle.startsWith("@")) {
      setShowAdvanced(true);
    }
  }, [urlOrHandle]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlOrHandle) return;

    setIsLoading(true);
    setCampaign(null);
    setLogs([]);
    
    addLog(`🔍 Initiating 2-Layer Context Scraper Pipeline for: "${urlOrHandle}"`);
    
    const steps = [
      "📡 Extracting page metadata (og:title, meta description, h1/h2 headings)...",
      "🔬 Formulating contextual brand signals...",
      "🧠 Aligning custom user bio profiles...",
      "📊 Synthesizing SWOT intelligence (niche strengths vs gaps)...",
      "📅 Compiling 7-Day Structured Social Calendar Grid...",
      "🎨 Generating tailored slogans and creative prompts for Imagen...",
      "⚡ Initializing Pollinations asset generation sequence...",
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        addLog(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 700);

    try {
      const response = await fetch("/api/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urlOrHandle,
          userContext: showAdvanced ? {
            bio: userBio,
            products: userProducts,
            audience: userAudience
          } : null
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Generation failed");
      }

      const data = await response.json();
      
      clearInterval(interval);
      for (let i = currentStep; i < steps.length; i++) {
        addLog(steps[i]);
      }
      
      addLog("✨ Creative banners rendered successfully via Pollinations CDN.");
      addLog("🎉 Autonomous scraper and campaign generation complete!");
      
      setCampaign(data);
      setActiveTab("audit");
    } catch (error) {
      console.error(error);
      addLog("❌ Error: Autonomous compiler encountered a scraping exception.");
    } finally {
      setIsLoading(false);
    }
  };

  // Derive ad creatives array locally from slogan and prompts lists
  const creatives = campaign
    ? campaign.imagePrompts.map((prompt, index) => {
        const slogan = campaign.adSlogans[index] || campaign.adSlogans[0] || "Campaign Creative";
        const promptEncoded = encodeURIComponent(prompt + ", vibrant lighting, professional commercial photography, 8k resolution");
        return {
          slogan,
          imagePrompt: prompt,
          imageUrl: `https://image.pollinations.ai/p/${promptEncoded}?width=1080&height=1080&nologo=true`,
        };
      })
    : [];

  const handleDeployItem = async (platform: string, content: string, type: "Calendar Post" | "Ad Banner") => {
    const queueId = `q_${Math.random().toString(36).substring(2, 9)}`;
    const newQueueItem: QueueItem = {
      id: queueId,
      platform,
      type,
      content,
      status: "QUEUED",
    };

    setQueue((prev) => [newQueueItem, ...prev]);
    addLog(`📯 Enqueued ${type} for platform ${platform}.`);
    setActiveTab("queue");

    setQueue((prev) =>
      prev.map((item) => (item.id === queueId ? { ...item, status: "DISPATCHING" } : item))
    );
    addLog(`🚀 Dispatching webhook payload to simulated API endpoint...`);

    try {
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, content }),
      });

      if (!response.ok) throw new Error("Deployment failed");
      const data = await response.json();

      setQueue((prev) =>
        prev.map((item) =>
          item.id === queueId
            ? {
                ...item,
                status: "SUCCESS",
                jobId: data.jobId,
                dispatchedAt: data.dispatchedAt,
              }
            : item
        )
      );
      addLog(`✓ Social webhook callback received. JobID: ${data.jobId}`);
    } catch (err) {
      setQueue((prev) =>
        prev.map((item) => (item.id === queueId ? { ...item, status: "FAILED" } : item))
      );
      addLog(`❌ Webhook callback failed for platform: ${platform}`);
    }
  };

  const handleDispatchAll = async () => {
    if (!campaign) return;
    addLog("⚡ Deploying complete campaign matrix autonomously...");
    
    for (let i = 0; i < creatives.length; i++) {
      const creative = creatives[i];
      await handleDeployItem("Instagram", `Ad Campaign: ${creative.slogan} - ${creative.imageUrl}`, "Ad Banner");
    }
    for (let i = 0; i < Math.min(3, campaign.contentCalendar.length); i++) {
      const cal = campaign.contentCalendar[i];
      await handleDeployItem(cal.platform, `${cal.postTitle}: ${cal.caption}`, "Calendar Post");
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
      case "instagram reel":
      case "instagram reel / post":
      case "instagram post":
        return <InstagramIcon className="w-4 h-4 text-black" />;
      case "linkedin":
      case "linkedin post":
      case "linkedin article":
        return <LinkedinIcon className="w-4 h-4 text-black" />;
      case "x":
      case "twitter":
      case "x (twitter) post":
        return <TwitterIcon className="w-4 h-4 text-black" />;
      default:
        return <Globe className="w-4 h-4 text-black" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F0EA] text-black font-sans selection:bg-[#FFE600] selection:text-black pb-16">
      {/* Header banner */}
      <header className="border-b-4 border-black bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFE600] border-4 border-black flex items-center justify-center neo-shadow">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="font-anton text-2xl tracking-wide uppercase">
                Kokoku
              </span>
              <span className="ml-3 px-2 py-0.5 border-2 border-black text-[10px] bg-[#00FF9D] font-mono font-bold uppercase">
                NEO-RUNNER
              </span>
            </div>
          </div>
          <div className="text-xs font-mono font-bold uppercase flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5">
            <span className="inline-block w-3 h-3 bg-[#00FF9D] border-2 border-black animate-pulse" />
            Scraper: Live
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Core Inputs Form */}
        <section className="bg-[#E2D4FF] border-4 border-black p-6 md:p-10 neo-shadow rounded-none">
          <div className="max-w-3xl">
            <h2 className="font-anton text-4xl sm:text-5xl uppercase tracking-wider mb-4 leading-tight">
              AUTONOMOUS CAMPAIGN ENGINE
            </h2>
            <p className="font-sans text-lg text-slate-900 mb-8 border-l-4 border-black pl-4 font-semibold">
              Drop any website link. Our AI scans the site, crafts 7 days of viral content, and dispatches your campaign automatically. Paste a URL &rarr; Scan brand &rarr; Generate ads &rarr; Auto-deploy campaign. 100% autonomous.
            </p>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <label className="absolute -top-3 left-3 bg-[#FFE600] border-2 border-black px-2 py-0.5 text-[10px] font-mono font-bold uppercase z-10">
                    Target Domain / IG Handle
                  </label>
                  <input
                    type="text"
                    required
                    value={urlOrHandle}
                    onChange={(e) => setUrlOrHandle(e.target.value)}
                    placeholder="e.g. stripe.com or @cafedelight"
                    className="w-full px-4 py-4 bg-white border-4 border-black text-black placeholder-slate-400 focus:outline-none focus:bg-[#FFE600] transition-colors font-mono font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-4 bg-[#FFE600] hover:bg-[#ffd900] border-4 border-black text-black font-anton uppercase text-lg tracking-wider transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none neo-shadow hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Ingesting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Generate Campaign
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </button>
              </div>

              {/* Accordion Context Toggle */}
              <div className="border-4 border-black bg-white">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-4 py-3 bg-[#f4eeda] flex items-center justify-between font-anton uppercase text-xs tracking-wider border-b-2 border-black"
                >
                  <span>Advanced Context Form {urlOrHandle.startsWith("@") && "(Required for IG handles)"}</span>
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <AnimatePresence initial={false}>
                  {showAdvanced && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-t-2 border-black bg-[#F4F0EA]">
                        <div className="relative">
                          <label className="block text-[10px] font-mono font-bold uppercase mb-1.5">Profile Bio / Tagline</label>
                          <textarea
                            value={userBio}
                            onChange={(e) => setUserBio(e.target.value)}
                            placeholder="e.g. Specialty local bakery and café"
                            className="w-full p-3 bg-white border-2 border-black font-mono text-xs focus:bg-[#FFE600] focus:outline-none min-h-[80px]"
                          />
                        </div>
                        <div className="relative">
                          <label className="block text-[10px] font-mono font-bold uppercase mb-1.5">Core Products / Services</label>
                          <textarea
                            value={userProducts}
                            onChange={(e) => setUserProducts(e.target.value)}
                            placeholder="e.g. Organic sourdough, espresso coffee"
                            className="w-full p-3 bg-white border-2 border-black font-mono text-xs focus:bg-[#FFE600] focus:outline-none min-h-[80px]"
                          />
                        </div>
                        <div className="relative">
                          <label className="block text-[10px] font-mono font-bold uppercase mb-1.5">Target Audience & Location</label>
                          <textarea
                            value={userAudience}
                            onChange={(e) => setUserAudience(e.target.value)}
                            placeholder="e.g. Local remote workers, Brooklyn NY"
                            className="w-full p-3 bg-white border-2 border-black font-mono text-xs focus:bg-[#FFE600] focus:outline-none min-h-[80px]"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </div>
        </section>

        {/* Console Terminal Logs */}
        {(isLoading || logs.length > 0) && (
          <section className="bg-black border-4 border-black p-6 neo-shadow rounded-none">
            <div className="border-b-2 border-zinc-800 pb-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#00FF9D]" />
                <span className="font-mono text-xs uppercase font-extrabold text-white tracking-widest">
                  Pipeline Extraction Console
                </span>
              </div>
              <span className="w-3.5 h-3.5 bg-[#FF5C00] border-2 border-black animate-pulse" />
            </div>
            <div className="font-mono text-xs text-[#00FF9D] max-h-60 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-zinc-800">
              {logs.map((log, index) => (
                <div key={index} className="leading-relaxed">
                  <span className="text-[#FFE600] font-bold">&gt;&gt;</span> {log}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-zinc-400 italic animate-pulse pt-2">
                  <span>⚡ Executing metadata parsing layers...</span>
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>
          </section>
        )}

        {/* Deliverables Dashboard */}
        {campaign && (
          <section className="space-y-8">
            {/* Global Dispatch Controls */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#00FF9D] border-4 border-black p-6 neo-shadow rounded-none">
              <div>
                <h3 className="font-anton text-2xl uppercase tracking-wider mb-1">
                  Deliverable Assets Unlocked
                </h3>
                <p className="text-sm font-semibold text-slate-800">
                  Ready to deploy campaign channels autonomously? Trigger webhook dispatches instantly.
                </p>
              </div>
              <button
                onClick={handleDispatchAll}
                className="px-6 py-3 bg-[#FFE600] border-4 border-black text-black font-anton uppercase text-sm tracking-widest transition-all active:translate-x-1 active:translate-y-1 neo-shadow hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:shadow-none shrink-0"
              >
                Auto-Dispatch Entire Campaign
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap border-b-4 border-black gap-2">
              {[
                { id: "audit", label: "Brand Audit Case Study", icon: FileText },
                { id: "calendar", label: "7-Day Content Calendar", icon: Calendar },
                { id: "creatives", label: "AI Ad Creatives Studio", icon: ImageIcon },
                { id: "queue", label: `Deploy Queue (${queue.length})`, icon: Share2 },
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2.5 py-4 px-6 font-anton uppercase tracking-wider text-sm transition-all border-t-4 border-x-4 border-black -mb-1 ${
                      isActive
                        ? "bg-white text-black border-b-4 border-b-white"
                        : "bg-[#70A5FF] text-white hover:text-black border-b-4 border-b-black"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Deliverable Panels */}
            <div className="mt-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* BRAND AUDIT PANEL */}
                  {activeTab === "audit" && (
                    <div className="space-y-8">
                      {/* Score and Positioning Header */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Audit Score Circle */}
                        <div className="bg-white border-4 border-black p-6 neo-shadow flex flex-col items-center justify-center text-center">
                          <span className="font-mono text-xs uppercase font-extrabold text-slate-500 mb-2">Audit Score</span>
                          <div className="w-24 h-24 rounded-full border-8 border-black bg-[#FFE600] flex items-center justify-center font-anton text-3xl shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                            {campaign.brandAudit.score}%
                          </div>
                        </div>

                        {/* Niche & Target Audience Details */}
                        <div className="bg-white border-4 border-black p-6 neo-shadow md:col-span-3 space-y-4">
                          <div>
                            <span className="px-2.5 py-1 bg-[#00FF9D] border-2 border-black font-mono text-[10px] font-bold uppercase">Industry Niche</span>
                            <h4 className="font-anton text-2xl uppercase tracking-wider mt-2">{campaign.brandAudit.niche}</h4>
                          </div>
                          <div className="border-t-2 border-slate-200 pt-3">
                            <span className="block font-mono text-[9px] uppercase font-bold text-slate-500 mb-1">Identified Target Demographic</span>
                            <p className="font-semibold text-slate-800 text-sm md:text-base leading-relaxed">{campaign.brandAudit.targetAudience}</p>
                          </div>
                        </div>
                      </div>

                      {/* 2-Column SWOT Matrix Grid */}
                      <div>
                        <h4 className="font-anton text-2xl uppercase tracking-widest mb-6 flex items-center gap-2">
                          <TrendingUp className="w-6 h-6" />
                          SWOT Gaps Analysis
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Strengths */}
                          <div className="bg-[#E2D4FF] border-4 border-black neo-shadow p-6 rounded-none">
                            <h5 className="font-anton text-lg uppercase text-black border-b-2 border-black pb-2 mb-4 flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-black" />
                              Brand Strengths
                            </h5>
                            <ul className="space-y-3 font-semibold text-slate-800 text-sm md:text-base">
                              {campaign.brandAudit?.swot?.strengths?.map((item: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-black font-extrabold select-none">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Weaknesses */}
                          <div className="bg-[#70A5FF] border-4 border-black neo-shadow p-6 rounded-none text-white">
                            <h5 className="font-anton text-lg uppercase text-white border-b-2 border-white/30 pb-2 mb-4 flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-white" />
                              Identified Content Gaps
                            </h5>
                            <ul className="space-y-3 font-semibold text-white/95 text-sm md:text-base">
                              {campaign.brandAudit?.swot?.weaknesses?.map((item: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-white font-extrabold select-none">•</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Growth Hacks List */}
                      <div className="bg-white border-4 border-black neo-shadow p-6 rounded-none">
                        <h4 className="font-anton text-2xl uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Zap className="w-6 h-6 text-[#FFE600]" />
                          Recommended Growth Hacks
                        </h4>
                        <div className="space-y-4">
                          {campaign.brandAudit?.growthHacks?.map((hack: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center gap-4 bg-[#F4F0EA] p-4 border-2 border-black rounded-none hover:bg-[#E2D4FF]/30 transition-colors"
                            >
                              <div className="w-10 h-10 bg-[#FFE600] border-2 border-black font-anton text-lg flex items-center justify-center shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                                0{idx + 1}
                              </div>
                              <p className="text-black font-bold text-sm md:text-base">{hack}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CONTENT CALENDAR PANEL */}
                  {activeTab === "calendar" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-anton text-2xl uppercase tracking-wider">7-Day Content Matrix</h4>
                        <span className="font-mono text-xs uppercase font-bold border-2 border-black bg-white px-2 py-0.5">Optimized Feed</span>
                      </div>
                      <div className="space-y-6">
                        {campaign.contentCalendar.map((item, index) => {
                          // Alternate colors of calendar items for a vibrant brutalist touch
                          const bgColors = ["bg-white", "bg-[#E2D4FF]", "bg-[#70A5FF]/10"];
                          const bgColor = bgColors[index % bgColors.length];
                          
                          return (
                            <div
                              key={index}
                              className={`${bgColor} border-4 border-black p-6 neo-shadow rounded-none flex flex-col md:flex-row gap-6 items-start md:items-center`}
                            >
                              {/* Day and Platform Badge */}
                              <div className="flex md:flex-col items-center md:items-start gap-3 shrink-0">
                                <div className="w-16 h-16 bg-[#FFE600] border-4 border-black flex flex-col items-center justify-center neo-shadow">
                                  <span className="font-anton text-xl leading-none">{item.day}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-black text-[10px] font-mono font-bold uppercase">
                                  {getPlatformIcon(item.platform)}
                                  {item.platform}
                                </div>
                              </div>

                              {/* Caption and Hooks */}
                              <div className="flex-1 space-y-4">
                                <div>
                                  <h5 className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Post Title & Copy</h5>
                                  <h4 className="font-anton text-lg uppercase tracking-wide text-black mb-1">{item.postTitle}</h4>
                                  <p className="text-black font-semibold text-sm md:text-base leading-relaxed">{item.caption}</p>
                                </div>

                                <div className="bg-[#F4F0EA] p-4 border-2 border-black">
                                  <h5 className="font-mono text-[9px] font-extrabold text-[#FF5C00] uppercase tracking-widest mb-1">Visual Generation Instructions</h5>
                                  <p className="text-xs font-mono font-bold text-slate-700">{item.visualPrompt}</p>
                                </div>
                              </div>

                              {/* Dispatch Action */}
                              <div className="w-full md:w-auto shrink-0 self-stretch flex items-center">
                                <button
                                  onClick={() =>
                                    handleDeployItem(
                                      item.platform,
                                      `${item.postTitle}: ${item.caption}`,
                                      "Calendar Post"
                                    )
                                  }
                                  className="w-full md:w-auto px-5 py-3 bg-[#FFE600] border-4 border-black text-black font-anton text-xs uppercase tracking-widest transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none neo-shadow hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                  Deploy to Queue
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* AD CREATIVE STUDIO PANEL */}
                  {activeTab === "creatives" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-anton text-2xl uppercase tracking-wider">Asset Studio Renderings</h4>
                        <span className="font-mono text-xs uppercase font-bold border-2 border-black bg-white px-2 py-0.5">Pollinations Active</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {creatives.map((creative, index) => (
                          <div
                            key={index}
                            className="bg-white border-4 border-black neo-shadow rounded-none overflow-hidden flex flex-col justify-between"
                          >
                            <div>
                              {/* Rendered Ad Banner */}
                              <div className="relative aspect-square bg-[#F4F0EA] border-b-4 border-black">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={creative.imageUrl}
                                  alt={creative.slogan}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute top-3 left-3 px-3 py-1 bg-black text-white font-mono text-[9px] uppercase tracking-wider font-extrabold">
                                  Banner Asset {index + 1}
                                </div>
                              </div>

                              {/* Card Details */}
                              <div className="p-5 space-y-4">
                                <h5 className="font-anton text-lg uppercase leading-snug">
                                  &ldquo;{creative.slogan}&rdquo;
                                </h5>
                                <div className="bg-[#F4F0EA] p-3 border-2 border-black">
                                  <span className="block font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Asset Render Prompt</span>
                                  <p className="font-mono text-xs text-slate-700 leading-relaxed line-clamp-3">
                                    {creative.imagePrompt}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="p-5 pt-0 space-y-3">
                              <button
                                onClick={() =>
                                  handleDeployItem(
                                    "Instagram",
                                    `Ad Campaign: ${creative.slogan} - ${creative.imageUrl}`,
                                    "Ad Banner"
                                  )
                                }
                                className="w-full py-3 bg-[#00FF9D] border-4 border-black text-black font-anton text-xs uppercase tracking-widest transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none neo-shadow hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                Dispatch Banner
                              </button>
                              <a
                                href={creative.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-1.5 text-slate-600 hover:text-black font-mono font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                              >
                                Open Render Link
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DISPATCH QUEUE PANEL */}
                  {activeTab === "queue" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="font-anton text-2xl uppercase tracking-wider">Webhook Runner Logging</h4>
                        <button
                          onClick={() => setQueue([])}
                          className="font-mono text-xs uppercase font-extrabold border-2 border-black px-2 py-0.5 bg-white hover:bg-[#FFE600] transition-colors"
                        >
                          Clear Queue
                        </button>
                      </div>

                      {queue.length === 0 ? (
                        <div className="bg-white border-4 border-black neo-shadow p-12 text-center rounded-none">
                          <Share2 className="w-12 h-12 text-black mx-auto mb-4" />
                          <h5 className="font-anton text-xl uppercase tracking-widest mb-1">Queue is Currently Empty</h5>
                          <p className="font-mono text-xs text-slate-600 max-w-sm mx-auto">
                            Deploy content posts or ad creatives to trigger automated background webhook runner.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-white border-4 border-black neo-shadow rounded-none overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-black border-b-4 border-black text-white font-mono uppercase tracking-widest text-[10px] font-bold">
                                  <th className="py-4 px-6">Channel</th>
                                  <th className="py-4 px-6">Asset Type</th>
                                  <th className="py-4 px-6">Payload</th>
                                  <th className="py-4 px-6">State</th>
                                  <th className="py-4 px-6">Callback Logs</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y-2 divide-black">
                                {queue.map((item) => (
                                  <tr key={item.id} className="hover:bg-[#E2D4FF]/30 transition-colors font-mono font-bold">
                                    <td className="py-4 px-6 whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        {getPlatformIcon(item.platform)}
                                        {item.platform}
                                      </div>
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap">
                                      <span className="px-2 py-0.5 border-2 border-black bg-[#f4eeda] text-black">
                                        {item.type}
                                      </span>
                                    </td>
                                    <td className="py-4 px-6 max-w-xs truncate">
                                      <span title={item.content}>
                                        {item.content}
                                      </span>
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap">
                                      <span
                                        className={`inline-flex items-center gap-1 px-3 py-1 border-2 border-black font-extrabold ${
                                          item.status === "SUCCESS"
                                            ? "bg-[#00FF9D] text-black"
                                            : item.status === "DISPATCHING"
                                            ? "bg-[#FFE600] text-black"
                                            : item.status === "FAILED"
                                            ? "bg-[#FF5C00] text-black"
                                            : "bg-[#F4F0EA] text-black"
                                        }`}
                                      >
                                        {item.status === "DISPATCHING" && (
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        )}
                                        {item.status}
                                      </span>
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap text-slate-600 text-[10px]">
                                      {item.status === "SUCCESS" ? (
                                        <div className="space-y-0.5">
                                          <div>
                                            Job_Ref: <span className="font-extrabold text-black">{item.jobId}</span>
                                          </div>
                                          <div className="text-[9px]">
                                            API Callback: {new Date(item.dispatchedAt || "").toLocaleTimeString()}
                                          </div>
                                        </div>
                                      ) : item.status === "DISPATCHING" ? (
                                        <span className="text-black font-extrabold animate-pulse">Running webhook API...</span>
                                      ) : (
                                        <span>--</span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black mt-20 py-10 bg-white text-center font-mono text-xs uppercase font-extrabold">
        <p>© 2026 Kokoku Dashboard. Built by Misti Doi Deployers</p>
      </footer>
    </div>
  );
}
