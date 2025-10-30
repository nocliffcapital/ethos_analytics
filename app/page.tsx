"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Settings, TrendingUp, User } from "lucide-react";
import { fetchTrendingUsers, TrendingUser } from "@/lib/ethos";

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"twitter" | "wallet">("twitter");
  const [twitter, setTwitter] = useState("");
  const [wallet, setWallet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [trendingUsers, setTrendingUsers] = useState<TrendingUser[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [recentSearches, setRecentSearches] = useState<TrendingUser[]>([]);

  // Fetch trending users on mount
  useEffect(() => {
    async function loadTrending() {
      try {
        const users = await fetchTrendingUsers(5);
        setTrendingUsers(users);
      } catch (err) {
        console.error("Failed to load trending users:", err);
      } finally {
        setLoadingTrending(false);
      }
    }
    loadTrending();
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const loadRecentSearches = () => {
      try {
        const stored = localStorage.getItem("recent_searches");
        if (stored) {
          const searches = JSON.parse(stored);
          setRecentSearches(searches.slice(0, 5)); // Only show last 5
        }
      } catch (err) {
        console.error("Failed to load recent searches:", err);
      }
    };
    loadRecentSearches();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (activeTab === "twitter" && twitter) {
        params.set("twitter", twitter.startsWith("@") ? twitter : `@${twitter}`);
      } else if (activeTab === "wallet" && wallet) {
        params.set("wallet", wallet);
      } else {
        setError("Please enter a value");
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/resolve?${params}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to resolve profile");
      }

      const data = await response.json();
      router.push(`/u/${data.userkey}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background relative">
      {/* Subtle Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.1]">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(46, 123, 195, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(46, 123, 195, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>
      
      {/* Radial fade overlay */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-radial from-transparent via-background/30 to-background"></div>

      {/* Header */}
      <header className="border-b border-primary/20 glass sticky top-0 z-50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
        <div className="container mx-auto px-4 py-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-lg font-bold text-primary-foreground shadow-lg shadow-primary/50 group-hover:shadow-primary/70 transition-all duration-300 group-hover:scale-110">
                Ξ
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                ETHOS_ANALYTICS
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href="https://ethos.network" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono uppercase tracking-wide"
              >
                ETHOS_NETWORK
              </a>
              <Button 
                onClick={() => setShowSettingsModal(true)} 
                variant="outline" 
                size="sm" 
                className="h-7 px-2.5 text-xs border-primary/40 text-primary hover:bg-primary/20 hover:border-primary/60 transition-all duration-300"
                title="Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      </header>

      <div className="container mx-auto px-4 py-24 pb-24 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 relative">
            {/* Animated glow effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse pointer-events-none -z-10"></div>
            
            {/* Decorative elements */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50"></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/50"></div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-br from-foreground via-foreground/90 to-primary/60 bg-clip-text text-transparent uppercase tracking-tighter relative px-4 font-mono">
              Reputation Analytics
            </h1>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-0.5 w-8 bg-primary/30"></div>
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-[0.2em]">
                AI-Powered Insights
              </p>
              <div className="h-0.5 w-8 bg-primary/30"></div>
            </div>
            
            {/* Stats badges */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Real-time Analysis</span>
              </div>
              <div className="px-3 py-1.5 rounded-full border border-success/30 bg-success/5 backdrop-blur-sm">
                <span className="text-[10px] font-bold text-success uppercase tracking-wider">AI-Powered</span>
              </div>
            </div>
          </div>

          {/* Search Card */}
          <Card className="border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 overflow-hidden relative hover:border-primary/50 transition-all duration-500 shadow-xl">
            {/* Animated background effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary/40 rounded-tl-lg"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary/40 rounded-br-lg"></div>
            
            <CardHeader className="border-b border-primary/20 relative pb-3">
              <CardTitle className="text-base font-extrabold uppercase tracking-wide bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Initialize Search Query
              </CardTitle>
              <CardDescription className="font-mono text-[10px] uppercase tracking-wider flex items-center justify-center gap-1">
                Enter 
                <svg 
                  viewBox="0 0 24 24" 
                  className="h-2.5 w-2.5 fill-current inline-block"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                handle or wallet address
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-6 relative">
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Tab Selector */}
                <div className="flex gap-1 p-1 bg-secondary/30 rounded-lg border border-border/50">
                  <button
                    type="button"
                    onClick={() => setActiveTab("twitter")}
                    className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wide rounded transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      activeTab === "twitter"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      className="h-3.5 w-3.5 fill-current"
                      aria-hidden="true"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Handle
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("wallet")}
                    className={`flex-1 px-4 py-2 text-xs font-bold uppercase tracking-wide rounded transition-all duration-200 ${
                      activeTab === "wallet"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    Wallet Address
                  </button>
                </div>

                {/* Input Fields */}
                {activeTab === "twitter" ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        placeholder="@username"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        disabled={loading}
                        className="pl-4 pr-12 h-12 bg-input border-primary/20 focus:border-primary/50 font-mono text-sm"
                      />
                      <Button
                        type="submit"
                        disabled={loading || !twitter}
                        className="absolute right-1 top-1 h-10 px-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider flex items-center gap-1">
                      Enter 
                      <svg 
                        viewBox="0 0 24 24" 
                        className="h-2.5 w-2.5 fill-current inline-block"
                        aria-hidden="true"
                      >
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      handle with Ethos reviews
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Input
                        placeholder="0x..."
                        value={wallet}
                        onChange={(e) => setWallet(e.target.value)}
                        disabled={loading}
                        className="pl-4 pr-12 h-12 bg-input border-primary/20 focus:border-primary/50 font-mono text-sm"
                      />
                      <Button
                        type="submit"
                        disabled={loading || !wallet}
                        className="absolute right-1 top-1 h-10 px-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                      Enter Ethereum address with Ethos reviews
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                    <p className="text-xs text-destructive font-mono uppercase tracking-wide">
                      ERROR: {error}
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Recent Searches Section */}
          {recentSearches.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <h2 className="text-sm font-bold text-foreground/90 uppercase tracking-wide">
                  Your Last Searches
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {recentSearches.map((user) => (
                  <Card
                    key={user.userkey}
                    onClick={() => router.push(`/u/${encodeURIComponent(user.userkey)}`)}
                    className="border-primary/20 bg-gradient-to-br from-card via-card/95 to-card/90 overflow-hidden relative hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Corner accent */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/30 group-hover:border-primary/60 transition-colors"></div>
                    
                    <CardContent className="p-3 relative">
                      {/* Avatar and Name */}
                      <div className="flex items-center gap-2 mb-2">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full border border-primary/30"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-foreground truncate">
                            {user.displayName}
                          </h3>
                          {user.username && (
                            <p className="text-[9px] text-muted-foreground font-mono truncate">
                              @{user.username}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Score */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] text-muted-foreground font-mono uppercase">Score</span>
                        <span className="text-sm font-black text-primary tabular-nums">{user.score}</span>
                      </div>
                      
                      {/* Review Stats */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-muted-foreground font-mono uppercase">Reviews</span>
                          <span className="text-xs font-bold text-foreground tabular-nums">{user.totalReviewCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`text-[8px] px-1.5 py-0 font-mono ${
                              user.positiveReviewPercentage >= 70
                                ? 'bg-success/10 text-success border-success/30'
                                : user.positiveReviewPercentage >= 50
                                ? 'bg-primary/10 text-primary border-primary/30'
                                : 'bg-destructive/10 text-destructive border-destructive/30'
                            }`}
                          >
                            {user.positiveReviewPercentage}% POSITIVE
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Trending Users Section */}
          {!loadingTrending && trendingUsers.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground/90 uppercase tracking-wide">
                  Trending Entities
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {trendingUsers.map((user) => (
                  <Card
                    key={user.userkey}
                    onClick={() => router.push(`/u/${encodeURIComponent(user.userkey)}`)}
                    className="border-primary/20 bg-gradient-to-br from-card via-card/95 to-card/90 overflow-hidden relative hover:border-primary/50 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Corner accent */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/30 group-hover:border-primary/60 transition-colors"></div>
                    
                    <CardContent className="p-3 relative">
                      {/* Avatar and Name */}
                      <div className="flex items-center gap-2 mb-2">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.displayName}
                            className="w-8 h-8 rounded-full border border-primary/30"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-bold text-foreground truncate">
                            {user.displayName}
                          </h3>
                          {user.username && (
                            <p className="text-[9px] text-muted-foreground font-mono truncate">
                              @{user.username}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Score */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] text-muted-foreground font-mono uppercase">Score</span>
                        <span className="text-sm font-black text-primary tabular-nums">{user.score}</span>
                      </div>
                      
                      {/* Review Stats */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-muted-foreground font-mono uppercase">Reviews</span>
                          <span className="text-xs font-bold text-foreground tabular-nums">{user.totalReviewCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="outline"
                            className={`text-[8px] px-1.5 py-0 font-mono ${
                              user.positiveReviewPercentage >= 70
                                ? 'bg-success/10 text-success border-success/30'
                                : user.positiveReviewPercentage >= 50
                                ? 'bg-primary/10 text-primary border-primary/30'
                                : 'bg-destructive/10 text-destructive border-destructive/30'
                            }`}
                          >
                            {user.positiveReviewPercentage}% POSITIVE
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-primary/20 glass z-40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-30"></div>
        <div className="container mx-auto px-4 py-3.5 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30">
                Ξ
              </div>
              <span className="text-sm font-bold font-mono text-foreground uppercase tracking-wider">ETHOS_ANALYTICS</span>
              <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground font-mono">
              <a href="https://ethos.network" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors uppercase tracking-wide">
                ETHOS_NETWORK
              </a>
              <span className="text-primary/30">|</span>
              <a href="https://github.com/nocliffcapital/ethos_analytics" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors uppercase tracking-wide">
                GITHUB
              </a>
              <span className="text-primary/30">|</span>
              <a href="/docs" className="hover:text-primary transition-colors uppercase tracking-wide">
                DOCS
              </a>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
              © 2025 • ETHOS_ANALYTICS
            </div>
          </div>
        </div>
        {/* Tech accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      </footer>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
      </main>
  );
}

// Settings Modal Component
function SettingsModal({ onClose }: { onClose: () => void }) {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem("user_openai_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("user_openai_key", apiKey.trim());
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1500);
    }
  };

  const handleClear = () => {
    localStorage.removeItem("user_openai_key");
    setApiKey("");
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/90 backdrop-blur-md" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-lg mx-4 border-primary/50 shadow-2xl shadow-primary/20 bg-gradient-to-br from-card via-card/95 to-card/90 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/40 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/40 pointer-events-none"></div>
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <CardHeader className="border-b border-primary/20 relative">
          <CardTitle className="text-base font-extrabold uppercase tracking-wide bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Settings
          </CardTitle>
          <CardDescription className="font-mono text-[10px] uppercase tracking-wider">Configure Your OpenAI API Key</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-2 block uppercase tracking-wide">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full px-4 py-2.5 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-mono text-sm"
              />
              <p className="text-[10px] text-muted-foreground mt-2 font-mono">
                Your API key is stored locally and used only for your requests. The system will fall back to the default key if yours is not set or fails. Note: Our API key may get rate limited with excessive usage.
              </p>
            </div>

            {saved && (
              <div className="p-3 bg-success/10 border border-success/30 rounded-lg animate-in fade-in duration-200">
                <p className="text-xs text-success font-mono uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Settings saved successfully!
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="border-destructive/40 text-destructive hover:bg-destructive/20"
                disabled={!apiKey}
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                size="sm"
                className="border-border text-muted-foreground hover:bg-secondary"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
