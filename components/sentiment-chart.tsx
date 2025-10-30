"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type TimelineData = Array<{
  month: string;
  pos: number;
  neg: number;
  neu: number;
  score: number;
}>;

// Custom Tooltip Component
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  // Find the data point values
  const positive = payload.find((p: any) => p.dataKey === "pos")?.value || 0;
  const negative = payload.find((p: any) => p.dataKey === "neg")?.value || 0;
  const neutral = payload.find((p: any) => p.dataKey === "neu")?.value || 0;
  const score = payload.find((p: any) => p.dataKey === "score")?.value || 0;

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
          {/* Positive */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-[10px] font-semibold text-foreground/80 uppercase tracking-wide">Positive</span>
            </div>
            <span className="text-sm font-black text-success tabular-nums">{positive}</span>
          </div>
          
          {/* Negative */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-destructive"></div>
              <span className="text-[10px] font-semibold text-foreground/80 uppercase tracking-wide">Negative</span>
            </div>
            <span className="text-sm font-black text-destructive tabular-nums">{negative}</span>
          </div>
          
          {/* Neutral */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
              <span className="text-[10px] font-semibold text-foreground/80 uppercase tracking-wide">Neutral</span>
            </div>
            <span className="text-sm font-black text-muted-foreground tabular-nums">{neutral}</span>
          </div>
          
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
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#3A3A37" opacity={0.3} />
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
        <Tooltip content={<CustomTooltip />} />
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
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="pos" 
          stroke="#4ADE80" 
          name="Positive" 
          strokeWidth={2.5}
          dot={{ fill: '#4ADE80', r: 4 }}
          activeDot={{ r: 6 }}
          isAnimationActive={false}
        />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="neg" 
          stroke="#EF4444" 
          name="Negative" 
          strokeWidth={2.5}
          dot={{ fill: '#EF4444', r: 4 }}
          activeDot={{ r: 6 }}
          isAnimationActive={false}
        />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="neu" 
          stroke="#9CA3AF" 
          name="Neutral" 
          strokeWidth={2}
          dot={{ fill: '#9CA3AF', r: 3 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="score" 
          stroke="#60A5FA" 
          name="Ethos Score" 
          strokeWidth={3}
          strokeDasharray="5 5"
          dot={{ fill: '#60A5FA', r: 5, strokeWidth: 2, stroke: '#22221F' }}
          activeDot={{ r: 7 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

