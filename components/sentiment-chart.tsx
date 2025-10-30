"use client";

import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TimelineData = Array<{
  month: string;
  pos: number;
  neg: number;
  neu: number;
  score: number;
}>;

type ChartFilter = "all" | "positive" | "negative" | "neutral" | "cumulative";

// Custom Tooltip Component
function CustomTooltip({ active, payload, label, filter }: any) {
  if (!active || !payload || !payload.length) return null;

  // Find the data point values
  const positive = payload.find((p: any) => p.dataKey === "pos")?.value || 0;
  const negative = payload.find((p: any) => p.dataKey === "neg")?.value || 0;
  const neutral = payload.find((p: any) => p.dataKey === "neu")?.value || 0;
  const score = payload.find((p: any) => p.dataKey === "score")?.value || 0;
  const cumulativePos = payload.find((p: any) => p.dataKey === "cumulativePos")?.value || 0;
  const cumulativeNeg = payload.find((p: any) => p.dataKey === "cumulativeNeg")?.value || 0;

  // Format month name
  const monthName = new Date(label + "-01").toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="relative bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-md border-2 border-primary/40 rounded-lg shadow-2xl shadow-primary/20 p-3 min-w-[200px]">
      {/* Corner accent */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50 rounded-tl-lg"></div>
      
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-xl"></div>
      
      {/* Content */}
      <div className="relative space-y-2">
        {/* Month Header */}
        <div className="text-xs font-bold text-primary uppercase tracking-wider font-mono border-b border-primary/20 pb-1.5 mb-2">
          {monthName}
        </div>
        
        {/* Stats */}
        <div className="space-y-1.5">
          {/* Cumulative View */}
          {filter === "cumulative" && (
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <span className="text-[10px] font-semibold text-foreground/80 uppercase tracking-wide">Cumulative Positive</span>
                </div>
                <span className="text-sm font-black text-success tabular-nums">{cumulativePos}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-destructive"></div>
                  <span className="text-[10px] font-semibold text-foreground/80 uppercase tracking-wide">Cumulative Negative</span>
                </div>
                <span className="text-sm font-black text-destructive tabular-nums">{cumulativeNeg}</span>
              </div>
            </>
          )}

          {/* Monthly Views */}
          {filter !== "cumulative" && (
            <>
              {/* Positive */}
              {(filter === "all" || filter === "positive") && (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-success"></div>
                    <span className="text-[10px] font-semibold text-foreground/80 uppercase tracking-wide">Positive</span>
                  </div>
                  <span className="text-sm font-black text-success tabular-nums">{positive}</span>
                </div>
              )}
              
              {/* Negative */}
              {(filter === "all" || filter === "negative") && (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-destructive"></div>
                    <span className="text-[10px] font-semibold text-foreground/80 uppercase tracking-wide">Negative</span>
                  </div>
                  <span className="text-sm font-black text-destructive tabular-nums">{negative}</span>
                </div>
              )}
              
              {/* Neutral */}
              {(filter === "all" || filter === "neutral") && (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                    <span className="text-[10px] font-semibold text-foreground/80 uppercase tracking-wide">Neutral</span>
                  </div>
                  <span className="text-sm font-black text-muted-foreground tabular-nums">{neutral}</span>
                </div>
              )}
            </>
          )}
          
          {/* Divider */}
          <div className="border-t border-primary/20 pt-1.5 mt-1.5"></div>
          
          {/* Ethos Score */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide font-mono">Score</span>
            </div>
            <span className="text-base font-black text-blue-400 tabular-nums">{score}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SentimentChart({ data }: { data: TimelineData }) {
  const [filter, setFilter] = useState<ChartFilter>("all");

  // Calculate cumulative values and prepare chart data
  const chartData = useMemo(() => {
    let cumulativePos = 0;
    let cumulativeNeg = 0;
    
    return data.map(item => {
      cumulativePos += item.pos;
      cumulativeNeg += item.neg;
      
      return {
        ...item,
        cumulativePos,
        cumulativeNeg,
      };
    });
  }, [data]);

  // Calculate totals for display
  const totals = useMemo(() => {
    const total = chartData[chartData.length - 1] || { cumulativePos: 0, cumulativeNeg: 0 };
    return {
      positive: total.cumulativePos,
      negative: total.cumulativeNeg,
      neutral: chartData.reduce((sum, item) => sum + item.neu, 0),
    };
  }, [chartData]);

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as ChartFilter)} className="w-full sm:w-auto">
          <TabsList className="bg-secondary/30 w-full sm:w-auto grid grid-cols-5 sm:inline-flex">
            <TabsTrigger value="all" className="text-xs font-mono uppercase">All</TabsTrigger>
            <TabsTrigger value="positive" className="text-xs font-mono uppercase data-[state=active]:text-success">
              Positive
            </TabsTrigger>
            <TabsTrigger value="negative" className="text-xs font-mono uppercase data-[state=active]:text-destructive">
              Negative
            </TabsTrigger>
            <TabsTrigger value="neutral" className="text-xs font-mono uppercase">Neutral</TabsTrigger>
            <TabsTrigger value="cumulative" className="text-xs font-mono uppercase data-[state=active]:text-primary">
              Sum
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Stats Summary */}
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase">
          {filter === "all" && (
            <>
              <span className="text-success">+{totals.positive}</span>
              <span className="text-destructive">-{totals.negative}</span>
              <span className="text-muted-foreground">~{totals.neutral}</span>
            </>
          )}
          {filter === "positive" && <span className="text-success font-bold">Total: {totals.positive}</span>}
          {filter === "negative" && <span className="text-destructive font-bold">Total: {totals.negative}</span>}
          {filter === "neutral" && <span className="text-muted-foreground font-bold">Total: {totals.neutral}</span>}
          {filter === "cumulative" && (
            <>
              <span className="text-success">Σ+{totals.positive}</span>
              <span className="text-destructive">Σ-{totals.negative}</span>
            </>
          )}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3A3A37" opacity={0.5} />
          <XAxis 
            dataKey="month" 
            stroke="#9CA3AF" 
            style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif' }}
          />
          <YAxis 
            yAxisId="left" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif' }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#60A5FA"
            style={{ fontSize: '12px', fontFamily: 'Inter, sans-serif' }}
          />
          <Tooltip content={<CustomTooltip filter={filter} />} />
          <Legend 
            align="left"
            verticalAlign="bottom"
            wrapperStyle={{ 
              paddingTop: '12px',
              paddingLeft: '0px',
              color: '#F5F5F5',
              fontFamily: 'Inter, sans-serif',
              fontSize: '10px'
            }}
            iconSize={10}
          />
          
          {/* Monthly counts - only show when NOT in cumulative view */}
          {filter !== "cumulative" && (
            <>
              {(filter === "all" || filter === "positive") && (
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="pos" 
                  stroke="#4ADE80" 
                  name="Positive" 
                  strokeWidth={1.5}
                  dot={{ fill: '#4ADE80', r: 3 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              )}
              {(filter === "all" || filter === "negative") && (
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="neg" 
                  stroke="#EF4444" 
                  name="Negative" 
                  strokeWidth={1.5}
                  dot={{ fill: '#EF4444', r: 3 }}
                  activeDot={{ r: 5 }}
                  isAnimationActive={false}
                />
              )}
              {(filter === "all" || filter === "neutral") && (
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="neu" 
                  stroke="#9CA3AF" 
                  name="Neutral" 
                  strokeWidth={1.5}
                  dot={{ fill: '#9CA3AF', r: 2 }}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              )}
            </>
          )}

          {/* Cumulative lines - only show in cumulative view */}
          {filter === "cumulative" && (
            <>
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="cumulativePos" 
                stroke="#4ADE80" 
                name="Cumulative Positive" 
                strokeWidth={2}
                dot={{ fill: '#4ADE80', r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="cumulativeNeg" 
                stroke="#EF4444" 
                name="Cumulative Negative" 
                strokeWidth={2}
                dot={{ fill: '#EF4444', r: 3 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </>
          )}

          {/* Ethos Score */}
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="score" 
            stroke="#60A5FA" 
            name="Ethos Score" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#60A5FA', r: 3, strokeWidth: 2, stroke: '#22221F' }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

