"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Zap, Database, Cpu, Shield, TrendingUp, MessageSquare, BarChart3, Code, Award, Calendar } from "lucide-react";

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background relative">
      {/* Tech Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(46, 123, 195, 0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Header */}
      <header className="border-b border-primary/20 glass sticky top-0 z-50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
        <div className="container mx-auto px-4 py-3 relative">
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
            <Link 
              href="/"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors font-mono uppercase tracking-wide"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              BACK
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      </header>

      <div className="container mx-auto px-4 py-12 pb-24 relative z-10 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent uppercase tracking-tight">
            Documentation
          </h1>
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
            How Ethos Analytics Works
          </p>
        </div>

        {/* Overview Card */}
        <Card className="border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 mb-6 overflow-hidden relative shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl"></div>
          <CardHeader className="border-b border-primary/20 relative">
            <CardTitle className="text-xl font-extrabold uppercase tracking-wide flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Overview
            </CardTitle>
            <CardDescription className="font-mono text-xs uppercase tracking-wider">
              AI-Powered reputation analytics from Ethos Network
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <p className="text-sm text-foreground/90 leading-relaxed mb-4">
              Ethos Analytics is an AI-powered reputation analysis tool that aggregates and analyzes reviews from the Ethos Network. 
              It provides comprehensive insights into user reputation through sentiment analysis, thematic extraction, and temporal trends.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-center">
                <div className="text-2xl font-black text-success mb-1">AI</div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase">GPT-5 Nano</div>
              </div>
              <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg text-center">
                <div className="text-2xl font-black text-primary mb-1">24h</div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase">Cache</div>
              </div>
              <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg text-center">
                <div className="text-2xl font-black text-primary mb-1">Live</div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase">Data</div>
              </div>
              <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-center">
                <div className="text-2xl font-black text-success mb-1">Fast</div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase">Analysis</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Data Sources */}
          <Card className="border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/40"></div>
            <CardHeader className="border-b border-primary/20 relative">
              <CardTitle className="text-sm font-extrabold uppercase tracking-wide flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                Data Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2 text-sm text-foreground/90">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">▹</span>
                  <span><strong className="font-mono text-primary">Ethos Network API:</strong> Live review data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">▹</span>
                  <span><strong className="font-mono text-primary">User Profiles:</strong> Twitter & wallet addresses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">▹</span>
                  <span><strong className="font-mono text-primary">Sentiment Scores:</strong> Positive, negative, neutral</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">▹</span>
                  <span><strong className="font-mono text-primary">Temporal Data:</strong> Monthly review trends</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          <Card className="border-success/30 bg-gradient-to-br from-card via-card/95 to-card/90 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-success/40"></div>
            <CardHeader className="border-b border-success/20 relative">
              <CardTitle className="text-sm font-extrabold uppercase tracking-wide flex items-center gap-2">
                <Cpu className="h-4 w-4 text-success" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2 text-sm text-foreground/90">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">▹</span>
                  <span><strong className="font-mono text-success">GPT-5 Nano:</strong> Cost-effective LLM</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">▹</span>
                  <span><strong className="font-mono text-success">Theme Extraction:</strong> Auto-detect patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">▹</span>
                  <span><strong className="font-mono text-success">Summarization:</strong> Comprehensive insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">▹</span>
                  <span><strong className="font-mono text-success">Context-Aware:</strong> Personalized to user</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card className="border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 mb-6 overflow-hidden relative shadow-xl">
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary/40"></div>
          <CardHeader className="border-b border-primary/20 relative">
            <CardTitle className="text-xl font-extrabold uppercase tracking-wide flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">User Input</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Enter a Twitter handle or Ethereum wallet address. The system resolves this to an Ethos userkey using the Ethos Network API.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">Data Fetching</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Retrieves all reviews for the user from Ethos Network, categorized by sentiment (positive, negative, neutral).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-success/20 border border-success/50 flex items-center justify-center text-success font-bold">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">AI Processing</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    GPT-5 Nano analyzes all reviews to generate summaries, extract themes, and identify key patterns in the reputation data.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold">
                    4
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">Aggregation & Spike Detection</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Computes statistics (sentiment counts, percentages), builds timeline trends, calculates the historical Ethos score trajectory, and detects anomaly months with unusual review activity (2x+ average or 150%+ increase).
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-success/20 border border-success/50 flex items-center justify-center text-success font-bold">
                    5
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">Spike Analysis</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    For each detected spike, AI analyzes the reviews from that month to determine what triggered the anomaly, extracting key themes and generating concise explanations.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center text-primary font-bold">
                    6
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">Caching</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Results are cached for 24 hours to minimize AI costs. Subsequent visits load instantly from cache until expiration.
                  </p>
                </div>
              </div>

              {/* Step 7 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-success/20 border border-success/50 flex items-center justify-center text-success font-bold">
                    7
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">Visualization</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    Displays comprehensive analytics: reputation summary, theme badges, sentiment timeline chart, Ethos badge, Timeline Insights (spike analysis), and filterable reviews list.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-primary/30 bg-gradient-to-br from-card to-card/90 relative overflow-hidden shadow-xl">
            <CardHeader className="border-b border-primary/20">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                Smart Themes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-xs text-foreground/80 leading-relaxed mb-3">
                AI automatically identifies common themes in positive and negative reviews, presenting them as keyword badges.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge className="text-[9px] bg-success/15 text-success border-success/40">Trustworthy</Badge>
                <Badge className="text-[9px] bg-success/15 text-success border-success/40">Helpful</Badge>
                <Badge className="text-[9px] bg-destructive/15 text-destructive border-destructive/40">Unreliable</Badge>
                <Badge className="text-[9px] bg-destructive/15 text-destructive border-destructive/40">Scammer</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-gradient-to-br from-card to-card/90 relative overflow-hidden shadow-xl">
            <CardHeader className="border-b border-primary/20">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                Timeline View
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-xs text-foreground/80 leading-relaxed mb-3">
                Interactive chart showing monthly sentiment trends alongside the Ethos score evolution over time.
              </p>
              <div className="h-2 bg-gradient-to-r from-success/20 via-primary/20 to-destructive/20 rounded-full"></div>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-gradient-to-br from-card to-card/90 relative overflow-hidden shadow-xl">
            <CardHeader className="border-b border-primary/20">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Timeline Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-xs text-foreground/80 leading-relaxed mb-3">
                AI-powered spike detection automatically identifies unusual activity months and explains what caused reputation changes.
              </p>
              <div className="flex gap-1.5">
                <div className="w-8 h-8 rounded border border-success/40 bg-success/10 flex items-center justify-center">
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                </div>
                <div className="w-8 h-8 rounded border border-border/30 bg-card/50"></div>
                <div className="w-8 h-8 rounded border border-border/30 bg-card/50"></div>
                <div className="w-8 h-8 rounded border border-destructive/40 bg-destructive/10 flex items-center justify-center">
                  <TrendingUp className="h-3.5 w-3.5 text-destructive rotate-180" />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* API Endpoints */}
        <Card className="border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 overflow-hidden relative shadow-xl mb-6">
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-primary/40"></div>
          <CardHeader className="border-b border-primary/20 relative">
            <CardTitle className="text-xl font-extrabold uppercase tracking-wide flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              API Endpoints
            </CardTitle>
            <CardDescription className="font-mono text-xs uppercase tracking-wider">
              Internal API Reference
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <div className="space-y-6">
              {/* Resolve Endpoint */}
              <div className="border border-primary/20 rounded-lg p-4 bg-card/50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="text-[9px] bg-success/20 text-success border-success/50 font-mono">GET</Badge>
                  <code className="text-xs font-mono text-primary">/api/resolve</code>
                </div>
                <p className="text-xs text-foreground/80 mb-3">
                  Resolves a Twitter handle or wallet address to an Ethos userkey.
                </p>
                <div className="text-[10px] font-mono space-y-1">
                  <div className="text-muted-foreground">Query Parameters:</div>
                  <div className="pl-3 space-y-0.5">
                    <div><span className="text-primary">twitter</span>: Twitter handle (e.g., @elonmusk)</div>
                    <div><span className="text-primary">wallet</span>: Ethereum address (e.g., 0x...)</div>
                  </div>
                  <div className="text-muted-foreground mt-2">Response:</div>
                  <pre className="pl-3 text-success">{"{ \"userkey\": \"service:x.com:elonmusk\", \"profile\": {...} }"}</pre>
                </div>
              </div>

              {/* Summary Endpoint */}
              <div className="border border-primary/20 rounded-lg p-4 bg-card/50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="text-[9px] bg-success/20 text-success border-success/50 font-mono">GET</Badge>
                  <code className="text-xs font-mono text-primary">/api/summary</code>
                </div>
                <p className="text-xs text-foreground/80 mb-3">
                  Fetches comprehensive reputation summary with AI-generated insights.
                </p>
                <div className="text-[10px] font-mono space-y-1">
                  <div className="text-muted-foreground">Query Parameters:</div>
                  <div className="pl-3 space-y-0.5">
                    <div><span className="text-primary">userkey</span>: Ethos userkey (required)</div>
                    <div><span className="text-primary">refresh</span>: Force refresh cache (optional, boolean)</div>
                  </div>
                  <div className="text-muted-foreground mt-2">Response:</div>
                  <pre className="pl-3 text-success text-[9px]">{"{ \"summary\": \"...\", \"counts\": {...}, \"timeline\": [...], \"themes\": [...] }"}</pre>
                  <div className="text-muted-foreground mt-2">Cache:</div>
                  <div className="pl-3 text-warning">24 hours (in-memory)</div>
                </div>
              </div>

              {/* Reviews Endpoint */}
              <div className="border border-primary/20 rounded-lg p-4 bg-card/50">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="text-[9px] bg-success/20 text-success border-success/50 font-mono">GET</Badge>
                  <code className="text-xs font-mono text-primary">/api/reviews</code>
                </div>
                <p className="text-xs text-foreground/80 mb-3">
                  Retrieves paginated, filterable list of individual reviews.
                </p>
                <div className="text-[10px] font-mono space-y-1">
                  <div className="text-muted-foreground">Query Parameters:</div>
                  <div className="pl-3 space-y-0.5">
                    <div><span className="text-primary">userkey</span>: Ethos userkey (required)</div>
                    <div><span className="text-primary">sentiment</span>: Filter by POSITIVE | NEGATIVE | NEUTRAL</div>
                    <div><span className="text-primary">limit</span>: Results per page (default: 50)</div>
                    <div><span className="text-primary">offset</span>: Pagination offset (default: 0)</div>
                  </div>
                  <div className="text-muted-foreground mt-2">Response:</div>
                  <pre className="pl-3 text-success text-[9px]">{"{ \"reviews\": [...], \"total\": 42, \"limit\": 50, \"offset\": 0 }"}</pre>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ethos Badge Tiers */}
        <Card className="border-primary/30 bg-gradient-to-br from-card via-card/95 to-card/90 overflow-hidden relative shadow-xl mb-6">
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/40"></div>
          <CardHeader className="border-b border-primary/20 relative">
            <CardTitle className="text-xl font-extrabold uppercase tracking-wide flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Ethos Badge Tiers
            </CardTitle>
            <CardDescription className="font-mono text-xs uppercase tracking-wider">
              Reputation Score Ranges
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg" style={{ borderColor: '#b72b38' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ borderWidth: 2, borderColor: '#b72b38' }}>
                  <Shield className="h-6 w-6" style={{ color: '#b72b38' }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#b72b38' }}>Untrusted</div>
                  <div className="text-[10px] font-mono text-muted-foreground">0 - 799</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg" style={{ borderColor: '#c28f0f' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ borderWidth: 2, borderColor: '#c28f0f' }}>
                  <Shield className="h-6 w-6" style={{ color: '#c28f0f' }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#c28f0f' }}>Questionable</div>
                  <div className="text-[10px] font-mono text-muted-foreground">800 - 1199</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg" style={{ borderColor: '#c1c0b6' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ borderWidth: 2, borderColor: '#c1c0b6' }}>
                  <Shield className="h-6 w-6" style={{ color: '#c1c0b6' }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#c1c0b6' }}>Neutral</div>
                  <div className="text-[10px] font-mono text-muted-foreground">1200 - 1399</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg" style={{ borderColor: '#7b8da8' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ borderWidth: 2, borderColor: '#7b8da8' }}>
                  <Shield className="h-6 w-6" style={{ color: '#7b8da8' }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#7b8da8' }}>Known</div>
                  <div className="text-[10px] font-mono text-muted-foreground">1400 - 1599</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg" style={{ borderColor: '#4e86b9' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ borderWidth: 2, borderColor: '#4e86b9' }}>
                  <Shield className="h-6 w-6" style={{ color: '#4e86b9' }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#4e86b9' }}>Established</div>
                  <div className="text-[10px] font-mono text-muted-foreground">1600 - 1799</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg" style={{ borderColor: '#2e7ac3' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ borderWidth: 2, borderColor: '#2e7ac3' }}>
                  <Shield className="h-6 w-6" style={{ color: '#2e7ac3' }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#2e7ac3' }}>Reputable</div>
                  <div className="text-[10px] font-mono text-muted-foreground">1800 - 1999</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg" style={{ borderColor: '#427b56' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ borderWidth: 2, borderColor: '#427b56' }}>
                  <Shield className="h-6 w-6" style={{ color: '#427b56' }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#427b56' }}>Exemplary</div>
                  <div className="text-[10px] font-mono text-muted-foreground">2000 - 2199</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg" style={{ borderColor: '#147f31' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ borderWidth: 2, borderColor: '#147f31' }}>
                  <Shield className="h-6 w-6" style={{ color: '#147f31' }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#147f31' }}>Distinguished</div>
                  <div className="text-[10px] font-mono text-muted-foreground">2200 - 2399</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg" style={{ borderColor: '#826da6' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ borderWidth: 2, borderColor: '#826da6' }}>
                  <Shield className="h-6 w-6" style={{ color: '#826da6' }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#826da6' }}>Revered</div>
                  <div className="text-[10px] font-mono text-muted-foreground">2400 - 2599</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg" style={{ borderColor: '#7a5fae' }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ borderWidth: 2, borderColor: '#7a5fae' }}>
                  <Shield className="h-6 w-6" style={{ color: '#7a5fae' }} />
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: '#7a5fae' }}>Renowned</div>
                  <div className="text-[10px] font-mono text-muted-foreground">2600 - 2800</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="border-success/30 bg-gradient-to-br from-card via-card/95 to-card/90 overflow-hidden relative shadow-xl mb-6">
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-success/40"></div>
          <CardHeader className="border-b border-success/20 relative">
            <CardTitle className="text-xl font-extrabold uppercase tracking-wide flex items-center gap-2">
              <Zap className="h-5 w-5 text-success" />
              Getting Started
            </CardTitle>
            <CardDescription className="font-mono text-xs uppercase tracking-wider">
              Quick Setup Guide
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 relative">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">1. Clone the Repository</h3>
                <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-success border border-success/20">
                  git clone https://github.com/nocliffcapital/ethos_analytics.git<br />
                  cd ethos_analytics
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">2. Install Dependencies</h3>
                <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-success border border-success/20">
                  npm install
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">3. Set Up Environment</h3>
                <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-success border border-success/20">
                  echo &quot;OPENAI_API_KEY=your_openai_api_key&quot; &gt; .env.local
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Get your OpenAI API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com</a>
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground mb-2 uppercase tracking-wide">4. Start Development Server</h3>
                <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-success border border-success/20">
                  npm run dev
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Visit <code className="text-primary">http://localhost:3000</code> to view the app.
                </p>
              </div>
            </div>
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
              <Link href="/docs" className="hover:text-primary transition-colors uppercase tracking-wide">
                DOCS
              </Link>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
              © 2025 • ETHOS_ANALYTICS
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      </footer>
    </main>
  );
}

