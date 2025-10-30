/**
 * Simple metrics collection for monitoring
 * Can be extended to export to Prometheus, CloudWatch, etc.
 */

type MetricType = "counter" | "gauge" | "histogram";

interface Metric {
  type: MetricType;
  name: string;
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

class MetricsCollector {
  private metrics: Metric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics in memory

  private addMetric(type: MetricType, name: string, value: number, labels?: Record<string, string>) {
    const metric: Metric = {
      type,
      name,
      value,
      timestamp: Date.now(),
      labels,
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // In production, you'd send this to your metrics backend
    if (process.env.NODE_ENV === "production") {
      // Example: send to CloudWatch, Prometheus, etc.
    }
  }

  // Increment a counter
  increment(name: string, labels?: Record<string, string>) {
    this.addMetric("counter", name, 1, labels);
  }

  // Set a gauge value
  gauge(name: string, value: number, labels?: Record<string, string>) {
    this.addMetric("gauge", name, value, labels);
  }

  // Record a histogram value (e.g., response time)
  histogram(name: string, value: number, labels?: Record<string, string>) {
    this.addMetric("histogram", name, value, labels);
  }

  // Timing helper
  async time<T>(name: string, fn: () => Promise<T>, labels?: Record<string, string>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.histogram(name, duration, labels);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.histogram(name, duration, { ...labels, error: "true" });
      throw error;
    }
  }

  // Get recent metrics (for debugging)
  getMetrics(name?: string): Metric[] {
    if (name) {
      return this.metrics.filter((m) => m.name === name);
    }
    return [...this.metrics];
  }

  // Get metric summary
  getSummary(name: string): {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
  } | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    const values = metrics.map((m) => m.value);
    return {
      count: values.length,
      sum: values.reduce((a, b) => a + b, 0),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }
}

export const metrics = new MetricsCollector();

// Common metric names
export const MetricNames = {
  API_REQUEST: "api.request",
  API_RESPONSE_TIME: "api.response_time",
  CACHE_HIT: "cache.hit",
  CACHE_MISS: "cache.miss",
  DB_QUERY_TIME: "db.query_time",
  REVIEW_FETCHED: "review.fetched",
  JOB_PROCESSED: "job.processed",
  ERROR: "error",
};

