export interface Opportunity {
  id: string;
  name: string;
  org: string;
  url: string;
  deadline: string;
  genre: Genre[];
  duration: string;
  stipend: number | null;
  location: string;
  eligibility: string;
  description: string;
  firstSeen: string;
  lastUpdated: string;
  status: Status;
  sourceUrl: string;
}

export type Genre =
  | "fiction"
  | "nonfiction"
  | "poetry"
  | "screenwriting"
  | "multi"
  | "other";

export type Status = "new" | "reviewed" | "bookmarked" | "applied" | "skipped";

export interface MineRunLog {
  timestamp: string;
  sourcesFetched: number;
  newFound: number;
  updated: number;
  errors: { url: string; error: string }[];
}
