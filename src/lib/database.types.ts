// Hand-authored to mirror supabase/migrations/001_initial.sql, which is the
// schema authority (CLAUDE.md rule 2). Regenerate with the Supabase CLI once it
// is authenticated locally, then commit the generated file over this one:
//   supabase gen types typescript --project-id ggpucjklyigxmnhdtyuj > src/lib/database.types.ts
// Keep the shapes below in step with the migration until then.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TaskPattern =
  | 'extraction'
  | 'classification'
  | 'summarisation'
  | 'generation'
  | 'reconciliation'
  | 'translation'
  | 'analysis'
  | 'agentic_workflow'
  | 'conversation'
  | 'other';

export type PromptStrategy =
  | 'zero_shot'
  | 'few_shot'
  | 'rag'
  | 'agentic'
  | 'fine_tuned'
  | 'other';

export type EntryStatus = 'pending' | 'approved' | 'rejected';

// Columns exposed by the public_entries view (submitter_id withheld).
// These are `type` aliases, not interfaces, so they satisfy the
// Record<string, unknown> constraint supabase-js puts on Row/Insert/Update.
export type PublicEntryRow = {
  id: string;
  task_name: string;
  task_pattern: TaskPattern;
  industry_tags: string[];
  task_unit: string;
  provider: string;
  model: string;
  prompt_strategy: PromptStrategy;
  calls_per_unit: number;
  includes_retries: boolean;
  input_tokens_median: number;
  output_tokens_median: number;
  input_tokens_p90: number | null;
  output_tokens_p90: number | null;
  sample_size: number;
  measurement_date: string;
  methodology: string;
  source_url: string | null;
  submitter_display: string | null;
  created_at: string;
};

export type EntriesRow = PublicEntryRow & {
  submitter_id: string;
  status: EntryStatus;
  reviewed_at: string | null;
};

// Fields a submitter may set on insert. status defaults to 'pending' in the DB
// and RLS forbids anything else, so it is intentionally omitted here.
export type EntriesInsert = {
  id?: string;
  task_name: string;
  task_pattern: TaskPattern;
  industry_tags: string[];
  task_unit: string;
  provider: string;
  model: string;
  prompt_strategy: PromptStrategy;
  calls_per_unit?: number;
  includes_retries?: boolean;
  input_tokens_median: number;
  output_tokens_median: number;
  input_tokens_p90?: number | null;
  output_tokens_p90?: number | null;
  sample_size: number;
  measurement_date: string;
  methodology: string;
  source_url?: string | null;
  submitter_id: string;
  submitter_display?: string | null;
  created_at?: string;
};

export interface Database {
  public: {
    Tables: {
      entries: {
        Row: EntriesRow;
        Insert: EntriesInsert;
        Update: Partial<EntriesInsert>;
        Relationships: [];
      };
    };
    Views: {
      public_entries: {
        Row: PublicEntryRow;
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      task_pattern: TaskPattern;
      prompt_strategy: PromptStrategy;
      entry_status: EntryStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
