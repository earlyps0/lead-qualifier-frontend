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

export interface UserProfile {
  id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: "free" | "active" | "past_due" | "canceled" | "trialing";
  current_period_end: string | null;
}

export interface UsageInfo {
  used: number;
  limit: number | null;
  remaining: number | null;
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
