"use client";

import { use, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Search, TrendingUp, TrendingDown, Shield, Award, BarChart3, MessageSquare, Crown, Sparkles, ThumbsUp, Meh, ThumbsDown, AlertTriangle, Clock, Settings, Calendar, HandHeart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SentimentChart } from "@/components/sentiment-chart";
import { ReviewsList } from "@/components/reviews-list";

type PageProps = {
  params: Promise<{ userkey: string }>;
};

type SearchItem = {
  userkey: string;
  username?: string;
  displayName: string;
  avatarUrl?: string;
  score: number;
  positiveReviewPercentage: number;
  positiveReviewCount: number;
  negativeReviewCount: number;
  totalReviewCount: number;
};

export default function SummaryPage(props: PageProps) {
  const params = use(props.params);
  const userkey = params.userkey;
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(0);

  // Animated loading messages
  const loadingMessages = [
    "Initializing reputation scan...",
    "Connecting to Ethos Network...",
    "Fetching review data...",
    "Processing reviews...",
    "Analyzing sentiment patterns...",
    "Computing statistics...",
    "Building timeline...",
    "Extracting keywords...",
    "Detecting trends...",
    "Identifying outliers...",
    "Generating AI summary...",
    "Compiling insights...",
    "Organizing data...",
    "Finalizing report...",
    "Almost ready...",
  ];

  // Cycle through loading messages (15 messages * ~1.33s = ~20 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 1333); // Change message every ~1.33 seconds for 20 second total loop

    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["summary", userkey],
    queryFn: async () => {
      const userApiKey = typeof window !== 'undefined' ? localStorage.getItem("user_openai_key") : null;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (userApiKey) {
        headers['X-User-OpenAI-Key'] = userApiKey;
      }
      
      const response = await fetch(`/api/summary?userkey=${encodeURIComponent(userkey)}`, {
        cache: 'no-store', // Don't use browser cache
        headers,
      });
      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }
      const data = await response.json();
      
      // Save to recent searches
      if (typeof window !== 'undefined' && data.profile) {
        try {
          const searchItem = {
            userkey: data.userkey,
            username: data.profile.twitter || data.profile.displayName?.split(' ')[0],
            displayName: data.profile.displayName || data.profile.twitter || "Unknown",
            avatarUrl: data.profile.avatarUrl,
            score: data.profile.score || 0,
            positiveReviewPercentage: data.stats?.pctPositive || 0,
            positiveReviewCount: data.stats?.positive || 0,
            negativeReviewCount: data.stats?.negative || 0,
            totalReviewCount: (data.stats?.positive || 0) + (data.stats?.negative || 0) + (data.stats?.neutral || 0),
          };

          const stored = localStorage.getItem("recent_searches");
          let searches: SearchItem[] = stored ? JSON.parse(stored) : [];
          
          // Remove duplicate if exists
          searches = searches.filter((s) => s.userkey !== searchItem.userkey);
          
          // Add to beginning
          searches.unshift(searchItem);
          
          // Keep only last 5
          searches = searches.slice(0, 5);
          
          localStorage.setItem("recent_searches", JSON.stringify(searches));
        } catch (err) {
          console.error("Failed to save recent search:", err);
        }
      }
      
      return data;
    },
    staleTime: 0, // Always fetch from server
    gcTime: 5 * 60 * 1000, // Keep in memory for 5 minutes only
  });

  const canRefresh = () => {
    if (!data?.lastUpdated) return true;
    const lastUpdate = new Date(data.lastUpdated).getTime();
    const now = Date.now();
    const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
    return hoursSinceUpdate >= 24;
  };

  const handleRefresh = async () => {
    if (!canRefresh()) {
      const lastUpdate = new Date(data.lastUpdated).getTime();
      const now = Date.now();
      const hoursRemaining = Math.ceil(24 - (now - lastUpdate) / (1000 * 60 * 60));
      alert(`⏰ Data is cached. You can refresh in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}.\n\nThis saves AI processing costs! 💰`);
      return;
    }
    
    // Force refresh by adding query parameter
    const response = await fetch(`/api/summary?userkey=${encodeURIComponent(userkey)}&refresh=true`);
    if (response.ok) {
      refetch();
    }
  };

  // Function to get tier and color based on Ethos score
  const getEthosTier = (score: number) => {
    if (score >= 2600) return { tier: "Renowned", color: "#7a5fae", range: "2600-2800" };
    if (score >= 2400) return { tier: "Revered", color: "#826da6", range: "2400-2599" };
    if (score >= 2200) return { tier: "Distinguished", color: "#147f31", range: "2200-2399" };
    if (score >= 2000) return { tier: "Exemplary", color: "#427b56", range: "2000-2199" };
    if (score >= 1800) return { tier: "Reputable", color: "#2e7ac3", range: "1800-1999" };
    if (score >= 1600) return { tier: "Established", color: "#4e86b9", range: "1600-1799" };
    if (score >= 1400) return { tier: "Known", color: "#7b8da8", range: "1400-1599" };
    if (score >= 1200) return { tier: "Neutral", color: "#c1c0b6", range: "1200-1399" };
    if (score >= 800) return { tier: "Questionable", color: "#c28f0f", range: "800-1199" };
    return { tier: "Untrusted", color: "#b72b38", range: "0-799" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
        {/* Animated background layers */}
        <div className="fixed inset-0 pointer-events-none">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(46, 123, 195, 0.15) 1px, transparent 0)',
              backgroundSize: '40px 40px',
              animation: 'grid-pulse 3s ease-in-out infinite'
            }}
          />
          {/* Radial gradient overlay */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background/50"></div>
        </div>

        {/* Central loading card */}
        <div className="w-full max-w-md mx-4 relative">
          <Card className="border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 overflow-hidden relative shadow-2xl shadow-primary/20 backdrop-blur-xl">
            {/* Decorative corner accents with animation */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary/40 rounded-tl-lg pointer-events-none animate-pulse" style={{ animationDuration: '2s' }}></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary/40 rounded-br-lg pointer-events-none animate-pulse" style={{ animationDuration: '2s', animationDelay: '1s' }}></div>
            
            {/* Multiple layered glows - reduced by 30% */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-primary/10 via-primary/3 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-radial from-blue-500/7 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            
            <CardContent className="pt-12 pb-12 relative">
              <div className="text-center">
                {/* Simple single spinner */}
                <div className="relative mb-8 flex justify-center">
                  <Loader2 className="h-16 w-16 text-primary animate-spin" />
                </div>

                {/* Loading text with animation */}
                <div className="space-y-4">
                  <h2 
                    key={loadingMessage}
                    className="text-lg font-bold text-primary uppercase tracking-wide font-mono animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    {loadingMessages[loadingMessage]}
                  </h2>
                  
                  {/* Simple progress dots */}
                  <div className="flex items-center justify-center gap-2 py-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary/40"
                        style={{
                          animation: `pulse 1.5s ease-in-out infinite`,
                          animationDelay: `${i * 0.15}s`
                        }}
                      />
                    ))}
                  </div>

                  {/* Subtext with icon */}
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                      Processing Ethos Network Data
                    </p>
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  </div>
                  
                  {/* Additional message */}
                  <p className="text-[9px] text-muted-foreground/70 font-mono uppercase tracking-wider mt-2">
                    This may take some time. Be patient
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <style jsx>{`
          @keyframes grid-pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-muted-foreground">{error instanceof Error ? error.message : "An error occurred"}</p>
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Search
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
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
      
      {/* Ethos-style header */}
      <header className="border-b border-primary/20 glass sticky top-0 z-50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
        <div className="container mx-auto px-4 py-2.5 relative">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-lg font-bold text-primary-foreground shadow-lg shadow-primary/50 group-hover:shadow-primary/70 transition-all duration-300 group-hover:scale-110">
                Ξ
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                ETHOS_ANALYTICS
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            </Link>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setShowSearchModal(true)} 
                size="sm" 
                className="h-8 px-3 text-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 font-semibold"
              >
                <Search className="h-3.5 w-3.5 mr-1.5" />
                NEW SEARCH
              </Button>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm" 
                disabled={!canRefresh()}
                className={`h-8 px-3 text-xs border-primary/40 text-primary hover:bg-primary/20 hover:border-primary/60 transition-all duration-300 font-semibold ${!canRefresh() ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={!canRefresh() ? `Available in ${Math.ceil(24 - (Date.now() - new Date(data?.lastUpdated).getTime()) / (1000 * 60 * 60))} hours` : 'Refresh data'}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                REFRESH
              </Button>
              <Button 
                onClick={() => setShowSettingsModal(true)} 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 text-xs border-primary/40 text-primary hover:bg-primary/20 hover:border-primary/60 transition-all duration-300"
                title="Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
        {/* Tech accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      </header>

      <div className="container mx-auto px-4 py-6 pb-24 relative z-10">

        {/* Hero Cards - Summary and Badge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          {/* Main Summary Card - Takes 2 columns */}
          <Card className="lg:col-span-2 border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 overflow-hidden relative group hover:border-primary/50 transition-all duration-500 shadow-xl">
            {/* Animated background effects - reduced by 30% */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-radial from-primary/7 via-primary/3 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-radial from-blue-500/5 to-transparent rounded-full blur-3xl"></div>
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary/40 rounded-tl-lg"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary/40 rounded-br-lg"></div>
            
            <CardHeader className="border-b border-primary/20 relative pb-3 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 w-full sm:w-auto min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    {/* Profile Avatar */}
                    {data.profile?.avatarUrl ? (
                      <img
                        src={data.profile.avatarUrl}
                        alt={data.profile.displayName || "Profile"}
                        className="w-10 h-10 rounded-full border-2 border-primary/30 shadow-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/30 flex-shrink-0">
                        <Award className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent uppercase truncate">
                        {data.profile?.twitter 
                          ? `@${data.profile.twitter}'s Reputation`
                          : data.profile?.displayName 
                            ? `${data.profile.displayName}'s Reputation`
                            : 'Reputation Summary'
                        }
                      </CardTitle>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="w-1 h-1 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">LIVE ANALYSIS</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* External Links Icons */}
                  {data.profile && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {/* Twitter Link */}
                      {data.profile.twitter && (
                        <a
                          href={`https://x.com/${data.profile.twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-7 h-7 rounded-md bg-secondary/30 hover:bg-primary/20 border border-primary/20 hover:border-primary/50 transition-all group hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                          title={`@${data.profile.twitter} on X`}
                        >
                          <svg className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                      )}
                      
                      {/* Etherscan Link */}
                      {data.profile.primaryWallet && (
                        <a
                          href={`https://etherscan.io/address/${data.profile.primaryWallet}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-7 h-7 rounded-md bg-secondary/30 hover:bg-blue-500/20 border border-primary/20 hover:border-blue-500/50 transition-all group hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20"
                          title={`View on Etherscan: ${data.profile.primaryWallet}`}
                        >
                          <svg className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-400 transition-colors" viewBox="0 0 293.775 293.667" fill="currentColor">
                            <path d="M146.887 0L30 146.887l116.887 67.44V146.887L30 79.447l116.887-67.44z"/>
                            <path d="M146.887 293.667l116.888-146.78-116.888-67.44v67.44l116.888 67.44-116.888 67.34z" opacity=".6"/>
                            <path d="M146.887 214.327l116.888-67.44-116.888-67.44v134.88z" opacity=".45"/>
                            <path d="M30 146.887l116.887 67.44V79.447L30 146.887z" opacity=".8"/>
                          </svg>
                        </a>
                      )}
                      
                      {/* Ethos Link */}
                      <a
                        href={
                          data.profile.twitter 
                            ? `https://app.ethos.network/profile/x/${data.profile.twitter}`
                            : data.profile.primaryWallet
                              ? `https://app.ethos.network/profile/address/${data.profile.primaryWallet}`
                              : `https://app.ethos.network/profile/${encodeURIComponent(userkey)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-7 h-7 rounded-md bg-secondary/30 hover:bg-primary/20 border border-primary/20 hover:border-primary/50 transition-all group hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                        title="View on Ethos Network"
                      >
                        <div className="text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors">Ξ</div>
                      </a>
                    </div>
                  )}
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <div className="relative inline-flex flex-col items-start sm:items-end gap-2">
                    {/* Label */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-primary rounded-full"></div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Sentiment Score</span>
                    </div>
                    
                    {/* Percentage Display */}
                    <div className="flex items-center gap-2.5">
                      {data.stats.pctPositive >= 90 ? <Crown className="h-8 w-8 text-yellow-500" /> :
                       data.stats.pctPositive >= 80 ? <Sparkles className="h-8 w-8 text-cyan-400" /> :
                       data.stats.pctPositive >= 70 ? <ThumbsUp className="h-8 w-8 text-green-500" /> :
                       data.stats.pctPositive >= 60 ? <Meh className="h-8 w-8 text-amber-500" /> :
                       data.stats.pctPositive >= 40 ? <ThumbsDown className="h-8 w-8 text-orange-500" /> :
                       <AlertTriangle className="h-8 w-8 text-red-500" />
                      }
                      <span className="text-3xl font-mono font-bold tracking-tighter text-primary tabular-nums leading-none">
                        {data.stats.pctPositive}
                      </span>
                      <span className="text-lg font-mono font-bold text-primary/70 leading-none">%</span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full h-1 bg-secondary/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                        style={{ width: `${data.stats.pctPositive}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3 pb-1 relative">
              <p className="text-sm leading-relaxed text-foreground/90 font-normal mb-0">{data.summary}</p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 mt-1 border-t border-border text-[10px] text-muted-foreground font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse flex-shrink-0"></div>
                  <span className="truncate">
                    CACHED: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Just now'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-primary/80">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">Refresh in {data.lastUpdated ? Math.ceil(24 - (Date.now() - new Date(data.lastUpdated).getTime()) / (1000 * 60 * 60)) : 24}h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ethos Badge Card - Takes 1 column */}
          {(() => {
            const currentScore = data.timeline && data.timeline.length > 0 
              ? data.timeline[data.timeline.length - 1].score 
              : 1000;
            const tierInfo = getEthosTier(currentScore);
            
            return (
              <Card className="border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 overflow-hidden relative hover:border-primary/50 transition-all duration-500 shadow-xl">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50"></div>
                
                <CardHeader className="border-b border-primary/20 pb-2 relative">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-primary/10 rounded border border-primary/30">
                      <Shield className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <CardTitle className="text-sm font-extrabold uppercase tracking-wide">Ethos Badge</CardTitle>
                  </div>
                  <CardDescription className="font-mono text-[10px] uppercase tracking-wider">Tier & Statistics</CardDescription>
                </CardHeader>
                <CardContent className="pt-3 pb-3 relative">
                  <div className="flex items-center gap-4">
                    {/* Badge Section */}
                    <div className="flex flex-col items-center relative">
                      {/* Pulsing glow effect */}
                      <div 
                        className="absolute w-20 h-20 rounded-full blur-xl opacity-30 animate-pulse"
                        style={{ backgroundColor: tierInfo.color }}
                      ></div>
                      
                      <div 
                        className="w-20 h-20 rounded-full flex items-center justify-center mb-2 relative backdrop-blur-sm transition-all duration-300 hover:scale-110"
                        style={{ 
                          border: `3px solid ${tierInfo.color}`,
                          backgroundColor: 'transparent',
                          boxShadow: `0 0 20px ${tierInfo.color}40`
                        }}
                      >
                        <Shield 
                          className="w-10 h-10 drop-shadow-lg" 
                          style={{ color: tierInfo.color }}
                          strokeWidth={1.5}
                        />
                      </div>
                      <h3 
                        className="text-base font-black mb-1 tracking-tight uppercase"
                        style={{ 
                          color: tierInfo.color,
                          textShadow: `0 0 20px ${tierInfo.color}60`
                        }}
                      >
                        {tierInfo.tier}
                      </h3>
                      <p className="text-2xl font-black text-foreground mb-0.5 tabular-nums">
                        {currentScore}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">
                        {tierInfo.range}
                      </p>
                    </div>
                    
                    {/* Stats Stack */}
                    <div className="flex-1 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between px-2 py-1 rounded bg-secondary/30 border border-border/50">
                        <span className="text-[10px] text-muted-foreground font-mono uppercase">Total</span>
                        <span className="text-base font-black text-foreground tabular-nums">
                          {data.stats.positive + data.stats.negative + data.stats.neutral}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-2 py-1 rounded bg-success/10 border border-success/30">
                        <span className="text-[10px] text-success font-mono uppercase">Positive</span>
                        <span className="text-base font-black text-success flex items-center gap-1 tabular-nums">
                          <TrendingUp className="h-3 w-3" />
                          {data.stats.positive}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-2 py-1 rounded bg-destructive/10 border border-destructive/30">
                        <span className="text-[10px] text-destructive font-mono uppercase">Negative</span>
                        <span className="text-base font-black text-destructive flex items-center gap-1 tabular-nums">
                          <TrendingDown className="h-3 w-3" />
                          {data.stats.negative}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-2 py-1 rounded bg-secondary/30 border border-border/50">
                        <span className="text-[10px] text-muted-foreground font-mono uppercase">Neutral</span>
                        <span className="text-base font-black text-muted-foreground tabular-nums">
                          {data.stats.neutral}
                        </span>
                      </div>
                      {data.profile?.vouchesReceived !== undefined && (
                        <div className="flex items-center justify-between px-2 py-1 rounded bg-primary/10 border border-primary/30 mt-0.5">
                          <span className="text-[10px] text-primary font-mono uppercase">Vouched</span>
                          <span className="text-base font-black text-primary flex items-center gap-1 tabular-nums">
                            <HandHeart className="h-3 w-3" />
                            {data.profile.vouchesReceived}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>

        {/* Project Voting Bar - Only shown for projects */}
        {data.projectVotes && (
          <Card className="mb-5 border-primary/30 bg-gradient-to-r from-card/95 via-card to-card/95 overflow-hidden relative hover:border-primary/50 transition-all duration-500 shadow-xl">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/40 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/40 pointer-events-none"></div>
            
            {/* Glow effect - reduced by 30% */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-gradient-radial from-primary/7 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            
            <CardHeader className="border-b border-primary/20 pb-2 relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-primary/10 rounded border border-primary/30">
                      <BarChart3 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <CardTitle className="text-sm font-extrabold uppercase tracking-wide">Community Sentiment</CardTitle>
                  </div>
                  <CardDescription className="font-mono text-[10px] uppercase tracking-wider mt-1">Bullish vs Bearish Votes</CardDescription>
                </div>
                
                {/* Bull/Bear indicator based on which side is stronger */}
                <div className={`p-2 rounded-lg ${
                  data.projectVotes.percentBullish > data.projectVotes.percentBearish 
                    ? 'bg-success/10 border border-success/30' 
                    : 'bg-destructive/10 border border-destructive/30'
                }`}>
                  {data.projectVotes.percentBullish > data.projectVotes.percentBearish ? (
                    <ThumbsUp className="h-6 w-6 text-success" />
                  ) : (
                    <ThumbsDown className="h-6 w-6 text-destructive" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-4 pb-4 relative">
              <div className="flex items-center justify-between gap-8 mb-4">
                {/* Bullish Section */}
                <div className="flex items-center gap-3">
                  <ThumbsUp className="h-5 w-5 text-success" />
                  <div>
                    <div className="text-2xl font-black text-success tabular-nums">
                      {data.projectVotes.percentBullish}%
                    </div>
                    <div className="text-[10px] text-success/80 font-mono uppercase tracking-wide">bullish</div>
                  </div>
                </div>

                {/* Center - Total Votes */}
                <div className="text-center">
                  <div className="text-xl font-black text-primary mb-1 tabular-nums">
                    {data.projectVotes.totalVotes.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">
                    total votes
                  </div>
                </div>

                {/* Bearish Section */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-black text-destructive tabular-nums">
                      {data.projectVotes.percentBearish}%
                    </div>
                    <div className="text-[10px] text-destructive/80 font-mono uppercase tracking-wide">bearish</div>
                  </div>
                  <ThumbsDown className="h-5 w-5 text-destructive" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-secondary/30 rounded-full overflow-hidden flex">
                <div 
                  className="bg-gradient-to-r from-success/80 to-success h-full transition-all duration-1000 ease-out"
                  style={{ width: `${data.projectVotes.percentBullish}%` }}
                />
                <div 
                  className="bg-gradient-to-r from-destructive to-destructive/80 h-full transition-all duration-1000 ease-out"
                  style={{ width: `${data.projectVotes.percentBearish}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Themes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 md:items-stretch">
          {/* Positive Themes */}
          <Card className="border-success/40 bg-gradient-to-br from-card via-card/95 to-card/90 flex flex-col relative overflow-hidden group hover:border-success/60 transition-all duration-500 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-success/10 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-success/40"></div>
            
            <CardHeader className="border-b border-success/20 pb-2 flex-shrink-0 relative">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-success/10 rounded border border-success/30">
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                </div>
                <CardTitle className="text-sm font-extrabold uppercase tracking-wide text-success">
                  Positive Themes
                </CardTitle>
              </div>
              <CardDescription className="font-mono text-[10px] uppercase tracking-wider">What people appreciate most</CardDescription>
            </CardHeader>
            <CardContent className="pt-3 pb-3 flex flex-col flex-grow relative">
              {/* Summary of positive reviews */}
              {data.positiveSummary && (
                <p className="text-sm text-foreground/90 leading-relaxed flex-grow">
                  {data.positiveSummary}
                </p>
              )}
              
              {/* Theme Badges - Fixed at bottom */}
              {data.positiveThemes && data.positiveThemes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-success/20 flex-shrink-0">
                  {data.positiveThemes.map((theme: string, i: number) => (
                    <Badge key={i} variant="default" className="text-[9px] px-2 py-1 bg-success/15 text-success border border-success/40 font-mono uppercase hover:bg-success/25 hover:scale-105 transition-all duration-200 shadow-lg">
                      {theme}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Negative Themes */}
          <Card className="border-destructive/40 bg-gradient-to-br from-card via-card/95 to-card/90 flex flex-col relative overflow-hidden group hover:border-destructive/60 transition-all duration-500 shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-destructive/10 to-transparent rounded-full blur-2xl"></div>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-destructive/40"></div>
            
            <CardHeader className="border-b border-destructive/20 pb-2 flex-shrink-0 relative">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-destructive/10 rounded border border-destructive/30">
                  <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                </div>
                <CardTitle className="text-sm font-extrabold uppercase tracking-wide text-destructive">
                  Negative Themes
                </CardTitle>
              </div>
              <CardDescription className="font-mono text-[10px] uppercase tracking-wider">Areas of concern or improvement</CardDescription>
            </CardHeader>
            <CardContent className="pt-3 pb-3 flex flex-col flex-grow relative">
              {/* Summary of negative reviews */}
              {data.negativeSummary && (
                <p className="text-sm text-foreground/90 leading-relaxed flex-grow">
                  {data.negativeSummary}
                </p>
              )}
              
              {/* Theme Badges - Fixed at bottom */}
              {data.negativeThemes && data.negativeThemes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-destructive/20 flex-shrink-0">
                  {data.negativeThemes.map((theme: string, i: number) => (
                    <Badge key={i} variant="destructive" className="text-[9px] px-2 py-1 bg-destructive/15 text-destructive border border-destructive/40 font-mono uppercase hover:bg-destructive/25 hover:scale-105 transition-all duration-200 shadow-lg">
                      {theme}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/70 italic mt-4 pt-3 border-t border-destructive/20 flex-shrink-0 font-mono">[ NO_NEGATIVE_THEMES_DETECTED ]</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline Chart */}
        {data.timeline && data.timeline.length > 0 && (
          <Card className="mb-5 border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 relative overflow-hidden hover:border-primary/50 transition-all duration-500 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-blue-500/3 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/40"></div>
            
            <CardHeader className="border-b border-primary/20 pb-2 relative">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-primary/10 rounded border border-primary/30">
                  <BarChart3 className="h-3.5 w-3.5 text-primary" />
                </div>
                <CardTitle className="text-sm font-extrabold uppercase tracking-wide">
                  Sentiment Timeline & Ethos Score
                </CardTitle>
              </div>
              <CardDescription className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
                Monthly review counts with score trend
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 pb-4 relative">
              <SentimentChart data={data.timeline} />
            </CardContent>
          </Card>
        )}

        {/* Timeline Insights - Spike Analysis */}
        {data.spikeInsights && data.spikeInsights.length > 0 && (
          <Card className="mb-5 border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 relative hover:border-primary/50 transition-all duration-500 shadow-xl" style={{ overflow: 'visible' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-primary/7 to-transparent rounded-full blur-3xl pointer-events-none" style={{ clipPath: 'inset(0 0 0 0 round 0.5rem)' }}></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/40 pointer-events-none"></div>
            
            <CardHeader className="border-b border-primary/20 pb-2 relative">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-primary/10 rounded border border-primary/30">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                </div>
                <CardTitle className="text-sm font-extrabold uppercase tracking-wide">
                  Timeline Insights
                </CardTitle>
              </div>
              <CardDescription className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">
                Notable events and reputation milestones
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 pb-4 relative overflow-visible">
              {/* Calendar View */}
              <div className="mb-6 overflow-visible">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 relative">
                  {(() => {
                    // Get all months from timeline
                    const allMonths = data.timeline.map((t: any) => t.month);
                    const spikeMonths = new Set(data.spikeInsights.map((s: any) => s.month));
                    
                    return allMonths.map((month: string) => {
                      const monthData = data.timeline.find((t: any) => t.month === month);
                      const spikeData = data.spikeInsights.find((s: any) => s.month === month);
                      const isSpike = spikeMonths.has(month);
                      const totalReviews = monthData ? monthData.pos + monthData.neg + monthData.neu : 0;
                      
                      const monthName = new Date(month + "-01").toLocaleDateString("en-US", {
                        month: "short",
                        year: "2-digit",
                      });
                      
                      return (
                        <div
                          key={month}
                          className={`relative group cursor-pointer p-2 rounded-lg border transition-all duration-300 ${
                            isSpike
                              ? spikeData?.type === 'positive'
                                ? 'bg-success/10 border-success/40 hover:bg-success/20 hover:border-success/60'
                                : spikeData?.type === 'negative'
                                ? 'bg-destructive/10 border-destructive/40 hover:bg-destructive/20 hover:border-destructive/60'
                                : 'bg-primary/10 border-primary/40 hover:bg-primary/20 hover:border-primary/60'
                              : totalReviews > 0
                              ? 'bg-card/50 border-border/30 hover:bg-card/80 hover:border-border/50'
                              : 'bg-card/20 border-border/20 opacity-50'
                          }`}
                        >
                          {/* Month label */}
                          <div className="text-center">
                            <div className="text-[9px] font-bold font-mono uppercase tracking-tight text-foreground/80">
                              {monthName}
                            </div>
                            <div className="text-xs font-black text-foreground/70 mt-0.5 tabular-nums">
                              {totalReviews}
                            </div>
                            {isSpike && (
                              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                            )}
                          </div>
                          
                          {/* Tooltip on hover */}
                          {isSpike && spikeData && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" style={{ zIndex: 9999 }}>
                              <div className="bg-card/98 backdrop-blur-md border-2 border-primary/50 rounded-lg shadow-2xl shadow-primary/20 p-3 min-w-[220px] max-w-[300px]">
                                <div className="text-[10px] font-bold text-primary uppercase tracking-wide font-mono mb-1.5">
                                  {spikeData.magnitude}x Spike
                                </div>
                                <div className="text-[9px] text-foreground/80 leading-relaxed">
                                  {spikeData.analysis.slice(0, 120)}...
                                </div>
                                {/* Arrow pointing down */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary/50"></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-primary/10">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded border border-success/40 bg-success/10"></div>
                    <span className="text-[9px] text-muted-foreground font-mono uppercase">Positive Spike</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded border border-destructive/40 bg-destructive/10"></div>
                    <span className="text-[9px] text-muted-foreground font-mono uppercase">Negative Spike</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded border border-primary/40 bg-primary/10"></div>
                    <span className="text-[9px] text-muted-foreground font-mono uppercase">Mixed Spike</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded border border-border/30 bg-card/50"></div>
                    <span className="text-[9px] text-muted-foreground font-mono uppercase">Regular Activity</span>
                  </div>
                </div>
              </div>
              
              {/* Detailed Spike Cards */}
              <div className="space-y-4">
                {data.spikeInsights.map((spike: any, index: number) => {
                  const monthName = new Date(spike.month + "-01").toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  });
                  
                  return (
                    <div 
                      key={index}
                      className="p-4 rounded-lg border border-primary/20 bg-card/50 relative overflow-hidden hover:border-primary/40 transition-all duration-300"
                    >
                      {/* Subtle glow effect */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-radial from-primary/5 to-transparent rounded-full blur-2xl"></div>
                      
                      <div className="relative">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {spike.type === 'positive' ? (
                              <div className="p-1 bg-card/80 rounded border border-success/30">
                                <TrendingUp className="h-4 w-4 text-success" />
                              </div>
                            ) : spike.type === 'negative' ? (
                              <div className="p-1 bg-card/80 rounded border border-destructive/30">
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              </div>
                            ) : (
                              <div className="p-1 bg-card/80 rounded border border-primary/30">
                                <BarChart3 className="h-4 w-4 text-primary" />
                              </div>
                            )}
                            <span className="text-sm font-bold text-foreground uppercase tracking-wide font-mono">
                              {monthName}
                            </span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-[9px] font-mono uppercase bg-primary/10 text-primary border-primary/30"
                          >
                            {spike.magnitude}x spike • {spike.reviewCount} reviews
                          </Badge>
                        </div>
                        
                        {/* Analysis */}
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {spike.analysis}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <Card className="border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 relative overflow-hidden hover:border-primary/50 transition-all duration-500 shadow-xl">
          <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-radial from-primary/3 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/40"></div>
          
          <CardHeader className="border-b border-primary/20 pb-2 relative">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-primary/10 rounded border border-primary/30">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
              </div>
              <CardTitle className="text-sm font-extrabold uppercase tracking-wide">
                All Reviews
              </CardTitle>
            </div>
            <CardDescription className="text-muted-foreground font-mono text-[10px] uppercase tracking-wider">Browse and filter individual reviews</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <ReviewsList userkey={userkey} />
          </CardContent>
        </Card>
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

      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal onClose={() => setShowSearchModal(false)} />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  );
}

// Search Modal Component
function SearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"twitter" | "wallet">("twitter");
  const [twitter, setTwitter] = useState("");
  const [wallet, setWallet] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    try {
      let params = "";
      if (activeTab === "twitter") {
        params = `twitter=${encodeURIComponent(twitter)}`;
      } else if (activeTab === "wallet") {
        params = `wallet=${encodeURIComponent(wallet)}`;
      }

      const response = await fetch(`/api/resolve?${params}`);
      const data = await response.json();

      if (data.userkey) {
        router.push(`/u/${encodeURIComponent(data.userkey)}`);
        onClose();
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
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
        
        {/* Glow effect - reduced by 30% */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-radial from-primary/7 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <CardHeader className="border-b border-primary/20 relative">
          <CardTitle className="text-base font-extrabold uppercase tracking-wide bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Initialize New Search
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
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-secondary/30 rounded-lg border border-border/50">
              <button
                type="button"
                onClick={() => setActiveTab("twitter")}
                className={`flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded transition-all duration-200 flex items-center justify-center gap-1.5 ${
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
                className={`flex-1 px-3 py-2 text-xs font-bold uppercase tracking-wide rounded transition-all duration-200 ${
                  activeTab === "wallet"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                Wallet Address
              </button>
            </div>

            {/* Input Fields */}
            {activeTab === "twitter" && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@username"
                  className="w-full px-4 py-2.5 h-12 bg-input border border-primary/20 focus:border-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-mono text-sm"
                  autoFocus
                />
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
            )}
            {activeTab === "wallet" && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2.5 h-12 bg-input border border-primary/20 focus:border-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-mono text-sm"
                  autoFocus
                />
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                  Enter Ethereum address with Ethos reviews
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2 justify-end pt-2">
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
                type="submit"
                disabled={isSearching || (!twitter && !wallet)}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
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

