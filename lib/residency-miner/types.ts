export interface Opportunity {
  id: string;
  name: string;
  org: string;
  url: string;
  deadline: string;
  genre: Genre[];
  duration: string;
  stipend: number | null;
  stipendMax: number | null;
  location: string;
  eligibility: string;
  description: string;
  firstSeen: string;
  lastUpdated: string;
  sourceUrl: string;
}

export type Genre =
  | "fiction"
  | "nonfiction"
  | "poetry"
  | "screenwriting"
  | "multi"
  | "other";

export interface MineRunLog {
  timestamp: string;
  sourcesFetched: number;
  newFound: number;
  updated: number;
  errors: { url: string; error: string }[];
}

export type SourceType = "aggregator" | "org_listing";
export type SourceStatus = "active" | "inactive";

export interface Source {
  id: string;
  name: string;
  url: string;
  type: SourceType;
  status: SourceStatus;
  discoveredAt: string;
  lastFetchedAt: string | null;
  lastSuccessAt: string | null;
  successCount: number;
  failureCount: number;
  consecutiveFailures: number;
}

export interface DiscoveryLog {
  timestamp: string;
  candidates: number;
  added: number;
  rejected: { url: string; reason: string }[];
}
