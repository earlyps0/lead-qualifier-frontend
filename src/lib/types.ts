export interface LeadInput {
  companyName: string;
  industry: string;
  budget: string;
  authorityRole: string;
  painPoint: string;
  timeline: string;
  notes?: string;
}

export interface QualificationResult {
  score: number;
  summary: string;
  bant: {
    budget: number;
    authority: number;
    need: number;
    timeline: number;
  };
}

export interface Lead {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  budget: string;
  score: number;
  summary: string;
  bant_budget: number;
  bant_authority: number;
  bant_need: number;
  bant_timeline: number;
  created_at: string;
}

export type RunStatus =
  | "QUEUED"
  | "WAITING_FOR_DEPLOY"
  | "EXECUTING"
  | "REATTEMPTING"
  | "FROZEN"
  | "COMPLETED"
  | "CANCELED"
  | "FAILED"
  | "CRASHED"
  | "INTERRUPTED"
  | "SYSTEM_FAILURE"
  | "DELAYED"
  | "EXPIRED"
  | "TIMED_OUT";
