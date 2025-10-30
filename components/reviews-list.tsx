"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";

type Review = {
  id: string;
  score: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  comment?: string;
  createdAt: string;
  author: string;
  votes?: {
    upvotes: number;
    downvotes: number;
  };
};

export function ReviewsList({ userkey }: { userkey: string }) {
  const [sentiment, setSentiment] = useState<"all" | "POSITIVE" | "NEGATIVE" | "NEUTRAL">("all");
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", userkey, sentiment, offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        userkey,
        limit: "5",
        offset: offset.toString(),
      });
      
      if (sentiment !== "all") {
        params.set("sentiment", sentiment);
      }

      const response = await fetch(`/api/reviews?${params}`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json();
    },
  });

  const getSentimentColor = (score: string): "default" | "destructive" | "secondary" => {
    switch (score) {
      case "POSITIVE":
        return "default";
      case "NEGATIVE":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Filter reviews by search query
  const filteredReviews = data?.reviews?.filter((review: Review) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      review.comment?.toLowerCase().includes(query) ||
      review.author?.toLowerCase().includes(query)
    );
  }) || [];

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Tabs value={sentiment} onValueChange={(v) => {
          setSentiment(v as any);
          setOffset(0);
        }}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="POSITIVE" className="data-[state=active]:text-success">Positive</TabsTrigger>
            <TabsTrigger value="NEGATIVE" className="data-[state=active]:text-destructive">Negative</TabsTrigger>
            <TabsTrigger value="NEUTRAL">Neutral</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading reviews...</p>
          </div>
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-3">
          {searchQuery && (
            <div className="text-xs text-muted-foreground">
              Found {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
            </div>
          )}
          {filteredReviews.map((review: Review) => (
            <div
              key={review.id}
              className="border border-border rounded-lg p-4 bg-card/50 hover:bg-card transition-all hover:border-primary/30"
            >
              <div className="flex items-start justify-between mb-3">
                <Badge 
                  variant={getSentimentColor(review.score)}
                  className={`font-medium ${review.score === 'POSITIVE' ? 'bg-success/20 text-success border-success/50 hover:bg-success/30' : ''}`}
                >
                  {review.score}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {review.comment && (
                <p className="text-sm text-foreground/90 mb-3 leading-relaxed">
                  {review.comment}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground font-mono">
                    {review.author}
                  </span>
                  {(review as any).authorTwitter && (
                    <a
                      href={`https://x.com/${(review as any).authorTwitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      @{(review as any).authorTwitter}
                    </a>
                  )}
                </div>
                {review.votes && (
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-primary">
                      ↑ {review.votes.upvotes}
                    </span>
                    <span className="text-destructive">
                      ↓ {review.votes.downvotes}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {data.hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setOffset((prev) => prev + 5)}
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                Show More
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? `No reviews match "${searchQuery}"` : "No reviews found"}
          </p>
        </div>
      )}
    </div>
  );
}

