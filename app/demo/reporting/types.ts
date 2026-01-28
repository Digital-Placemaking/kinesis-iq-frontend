export type TimeRange = "7d" | "30d" | "90d";

export type TrendDirection = "up" | "down" | "neutral";

export interface Trend {
  direction: TrendDirection;
  value: number;
}

export interface FunnelStep {
  label: string;
  value: number;
  color: string;
}

export interface SentimentItem {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export interface Location {
  name: string;
  responses: number;
  sentiment: number;
}

export interface TimeSeriesData {
  date: string;
  visits: number;
  responses: number;
}

export interface ReportingData {
  pageVisits: number;
  surveyResponses: number;
  uniqueSessions: number;
  conversionRate: number;
  engagementActions: number;
  happinessScore: number;
  happyResponses: number;
  trends: {
    pageVisits: Trend;
    surveyResponses: Trend;
    happinessScore: Trend;
    engagementActions: Trend;
  };
  funnel: FunnelStep[];
  sentiment: SentimentItem[];
  locations: Location[];
  timeSeries: TimeSeriesData[];
}

export interface FeedbackItem {
  text: string;
  sentiment: "Happy" | "Neutral" | "Concerned";
  date: string;
}



