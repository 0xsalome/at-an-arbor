export enum ContributionLevel {
  NONE = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  PEAK = 4,
}

export interface ContributionDay {
  date: string;
  count: number;
  level: ContributionLevel;
}

export interface ContributionWeek {
  days: ContributionDay[];
  weekIndex: number; // 0 is most recent
}

export interface StrataData {
  username: string;
  totalContributions: number;
  weeks: ContributionWeek[];
}
