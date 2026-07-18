-- Token Cost Index: initial schema
-- Run via: supabase db push (or supabase migration up)

-- Enums -----------------------------------------------------------------

create type task_pattern as enum (
  'extraction',
  'classification',
  'summarisation',
  'generation',
  'reconciliation',
  'translation',
  'analysis',
  'agentic_workflow',
  'conversation',
  'other'
);

create type prompt_strategy as enum (
  'zero_shot',
  'few_shot',
  'rag',
  'agentic',
  'fine_tuned',
  'other'
);

create type entry_status as enum ('pending', 'approved', 'rejected');

-- Core table ------------------------------------------------------------

create table entries (
  id uuid primary key default gen_random_uuid(),

  -- What the task is
  task_name text not null check (char_length(task_name) between 5 and 120),
  task_pattern task_pattern not null,
  industry_tags text[] not null default '{}',
  task_unit text not null check (char_length(task_unit) between 3 and 60),
  -- e.g. 'per invoice', 'per contract clause', 'per support ticket'

  -- How it was run
  provider text not null,           -- e.g. 'anthropic', 'openai', 'google'
  model text not null,              -- e.g. 'claude-sonnet-4-6'
  prompt_strategy prompt_strategy not null,
  calls_per_unit numeric not null default 1 check (calls_per_unit >= 1),
  includes_retries boolean not null default false,

  -- What it cost (tokens per task unit, across all calls)
  input_tokens_median integer not null check (input_tokens_median > 0),
  output_tokens_median integer not null check (output_tokens_median > 0),
  input_tokens_p90 integer check (input_tokens_p90 >= input_tokens_median),
  output_tokens_p90 integer check (output_tokens_p90 >= output_tokens_median),

  -- Trust and provenance
  sample_size integer not null check (sample_size >= 10),
  measurement_date date not null,
  methodology text not null check (char_length(methodology) >= 80),
  source_url text,

  -- Submission metadata
  submitter_id uuid not null references auth.users (id),
  submitter_display text,           -- optional public handle
  status entry_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- Allowed industry tags enforced by trigger (arrays cannot use enum checks cleanly)
create or replace function validate_industry_tags()
returns trigger as $$
declare
  allowed text[] := array[
    'accounting', 'supply_chain', 'legal', 'finance', 'insurance',
    'healthcare', 'engineering', 'hr', 'marketing', 'customer_service',
    'retail', 'manufacturing', 'government', 'education', 'general'
  ];
  tag text;
begin
  if array_length(new.industry_tags, 1) is null then
    raise exception 'At least one industry tag is required';
  end if;
  foreach tag in array new.industry_tags loop
    if not (tag = any (allowed)) then
      raise exception 'Invalid industry tag: %', tag;
    end if;
  end loop;
  return new;
end;
$$ language plpgsql;

create trigger entries_validate_tags
  before insert or update on entries
  for each row execute function validate_industry_tags();

-- Indexes ---------------------------------------------------------------

create index entries_status_idx on entries (status);
create index entries_pattern_idx on entries (task_pattern) where status = 'approved';
create index entries_tags_idx on entries using gin (industry_tags) where status = 'approved';
create index entries_model_idx on entries (provider, model) where status = 'approved';

-- Row Level Security ----------------------------------------------------

alter table entries enable row level security;

-- Anyone (including anonymous) can read approved entries
create policy "public read approved"
  on entries for select
  using (status = 'approved');

-- Authenticated users can insert their own pending entries
create policy "authenticated insert pending"
  on entries for insert
  to authenticated
  with check (
    submitter_id = auth.uid()
    and status = 'pending'
  );

-- Submitters can read their own entries regardless of status
create policy "own entries read"
  on entries for select
  to authenticated
  using (submitter_id = auth.uid());

-- No update or delete policies for regular users.
-- Moderation (status changes) happens via Supabase Studio with the
-- service role in v1. An admin role and policy come in v2.

-- Public API view -------------------------------------------------------
-- PostgREST exposes this view for the read API, keeping submitter_id private.

create view public_entries as
  select
    id, task_name, task_pattern, industry_tags, task_unit,
    provider, model, prompt_strategy, calls_per_unit, includes_retries,
    input_tokens_median, output_tokens_median,
    input_tokens_p90, output_tokens_p90,
    sample_size, measurement_date, methodology, source_url,
    submitter_display, created_at
  from entries
  where status = 'approved';

grant select on public_entries to anon;
