-- Make the schema easy to browse and edit in the Supabase Table Editor.
-- Adds descriptions (shown in the dashboard), updated_at triggers and
-- missing timestamps. Safe to re-run.

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

alter table public.shows add column if not exists updated_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

do $$ declare t text; begin
  foreach t in array array['shows','profiles','deals','pitches'] loop
    execute format('drop trigger if exists trg_touch on public.%I', t);
    execute format('create trigger trg_touch before update on public.%I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

comment on table public.profiles  is 'One row per user (auto-created on sign-up). Brand-safety switches and existing sponsors.';
comment on table public.shows     is 'A podcast or YouTube channel the user analyses.';
comment on table public.analyses  is 'One agent run for a show: status, audience profile, step trace, Without-Qloo baseline.';
comment on table public.matches   is 'Ranked sponsor brands produced by an analysis, with Fit Score parts and evidence.';
comment on table public.pitches   is 'Saved pitch email, follow-ups and ad read for a match (one per match).';
comment on table public.deals     is 'Sponsorship pipeline card for a match: stage, amount, note.';
comment on table public.kits      is 'Public media-kit snapshots served at /kit/<slug>. Anyone with the slug can read.';

comment on column public.profiles.safety            is 'JSON switches {alcohol, gambling, adult}; true = avoid that category.';
comment on column public.profiles.existing_sponsors is 'Brands already sponsoring the user; competitors are flagged.';
comment on column public.shows.platform             is 'podcast or youtube.';
comment on column public.shows.audience_size        is 'Average listeners per episode / views per video. Drives the rate advisor.';
comment on column public.shows.qloo_entity_id       is 'Qloo entity id of the show, if found in the taste graph.';
comment on column public.shows.seed_entities        is 'Similar shows/artists used as the audience signal.';
comment on column public.analyses.status            is 'queued | running | complete | failed.';
comment on column public.analyses.source            is 'qloo = live Qloo API, sample = built-in demo graph.';
comment on column public.analyses.profile           is 'Audience profile: tags, themes, age index, heatmap.';
comment on column public.analyses.trace             is 'Every agent step and Qloo call, for the live trace view.';
comment on column public.analyses.without_qloo      is 'What a plain LLM would have suggested (the Without vs With Qloo panel).';
comment on column public.analyses.qloo_calls        is 'Qloo API calls used (cap 40 per run).';
comment on column public.matches.fit                is 'Fit Score 0-100 = 45% affinity + 25% demographics + 20% taste + 10% novelty.';
comment on column public.matches.parts              is 'The four Fit Score parts, each 0-1.';
comment on column public.matches.hidden_gem         is 'High fit but low popularity.';
comment on column public.matches.safety             is 'Brand-safety flag (alcohol, gambling, adult) or null.';
comment on column public.matches.competitor_of      is 'Existing sponsor this brand competes with, or null.';
comment on column public.deals.stage                is 'Pitched | Replied | Negotiating | Won | Lost.';
comment on column public.deals.amount               is 'Deal value in USD.';
comment on column public.kits.views                 is 'Page views, incremented by bump_kit_view().';
