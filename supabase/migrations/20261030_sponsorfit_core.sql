-- SponsorFit database schema (Supabase Postgres).
-- Apply with the Supabase SQL editor or `supabase db push`.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  safety jsonb not null default '{"alcohol": true, "gambling": true, "adult": true}'::jsonb,
  existing_sponsors text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.shows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  platform text not null check (platform in ('podcast','youtube')),
  audience_size integer not null default 10000 check (audience_size > 0),
  qloo_entity_id text,
  seed_entities jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index shows_user_idx on public.shows(user_id, created_at desc);

create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  show_id uuid not null references public.shows(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','running','complete','failed')),
  source text not null default 'qloo',
  profile jsonb not null default '{}'::jsonb,
  trace jsonb not null default '[]'::jsonb,
  without_qloo jsonb not null default '[]'::jsonb,
  qloo_calls integer not null default 0,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index analyses_user_idx on public.analyses(user_id, created_at desc);
create index analyses_show_idx on public.analyses(show_id, created_at desc);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rank integer not null,
  qloo_id text not null,
  name text not null,
  category text not null default 'Other',
  fit integer not null check (fit between 0 and 100),
  parts jsonb not null,
  affinity real,
  popularity real,
  tags text[] not null default '{}',
  reasons text[] not null default '{}',
  demographics jsonb not null default '{}'::jsonb,
  image text,
  hidden_gem boolean not null default false,
  safety text,
  competitor_of text,
  created_at timestamptz not null default now()
);
create index matches_analysis_idx on public.matches(analysis_id, rank);
create index matches_user_idx on public.matches(user_id);

create table public.pitches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  tone text not null default 'Professional',
  subject text not null,
  body text not null,
  follow_ups jsonb not null default '[]'::jsonb,
  ad_read text not null default '',
  updated_at timestamptz not null default now(),
  unique (match_id)
);
create index pitches_user_idx on public.pitches(user_id);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  stage text not null default 'Pitched' check (stage in ('Pitched','Replied','Negotiating','Won','Lost')),
  amount integer not null default 0 check (amount >= 0),
  note text not null default '',
  updated_at timestamptz not null default now(),
  unique (match_id)
);
create index deals_user_idx on public.deals(user_id);

create table public.kits (
  slug text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  data jsonb not null,
  views integer not null default 0,
  created_at timestamptz not null default now(),
  unique (match_id)
);
create index kits_user_idx on public.kits(user_id);

-- Row Level Security: every row belongs to its user
alter table public.profiles enable row level security;
alter table public.shows enable row level security;
alter table public.analyses enable row level security;
alter table public.matches enable row level security;
alter table public.pitches enable row level security;
alter table public.deals enable row level security;
alter table public.kits enable row level security;

create policy "own profile" on public.profiles for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

do $$
declare t text;
begin
  foreach t in array array['shows','analyses','matches','pitches','deals'] loop
    execute format('create policy "own rows" on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

create policy "owner manages kits" on public.kits for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "anyone reads kits" on public.kits for select to anon, authenticated using (true);

-- Public kit view counter (the only anonymous write, scoped to one column)
create or replace function public.bump_kit_view(kit_slug text)
returns void language sql security definer set search_path = '' as $$
  update public.kits set views = views + 1 where slug = kit_slug;
$$;
revoke all on function public.bump_kit_view(text) from public;
grant execute on function public.bump_kit_view(text) to anon, authenticated;

-- Profile row for every new user (including anonymous demo users)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1)));
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
