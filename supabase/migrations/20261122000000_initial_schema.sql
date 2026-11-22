create type public.team_role as enum (
  'super_admin',
  'team_captain',
  'department_lead',
  'member',
  'mentor'
);

create type public.membership_status as enum ('pending', 'approved', 'rejected');
create type public.task_status as enum ('todo', 'in_progress', 'review', 'done');
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role public.team_role not null default 'member',
  membership_status public.membership_status not null default 'pending',
  department_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  lead_profile_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_department_id_fkey
  foreign key (department_id) references public.departments(id) on delete set null;

create table public.sub_departments (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  department_id uuid references public.departments(id) on delete set null,
  sub_department_id uuid references public.sub_departments(id) on delete set null,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  due_date date,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.task_assignees (
  task_id uuid not null references public.tasks(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  primary key (task_id, profile_id)
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wiki_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  department_id uuid references public.departments(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.wiki_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  content text not null default '',
  category_id uuid references public.wiki_categories(id) on delete set null,
  department_id uuid references public.departments(id) on delete cascade,
  is_public boolean not null default false,
  created_by uuid not null references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (department_id, slug)
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bucket text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  department_id uuid references public.departments(id) on delete set null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (bucket, storage_path)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  department_id uuid references public.departments(id) on delete cascade,
  pinned boolean not null default false,
  published_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_team_role()
returns public.team_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_platform_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_team_role() in ('super_admin', 'team_captain')
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.sub_departments enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.task_comments enable row level security;
alter table public.wiki_categories enable row level security;
alter table public.wiki_pages enable row level security;
alter table public.files enable row level security;
alter table public.announcements enable row level security;
alter table public.activity_logs enable row level security;

create policy "approved users read profiles"
  on public.profiles for select to authenticated
  using (membership_status = 'approved' or id = auth.uid());

create policy "users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "managers update profiles"
  on public.profiles for update to authenticated
  using (public.is_platform_manager())
  with check (public.is_platform_manager());

create policy "approved users read departments"
  on public.departments for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.membership_status = 'approved'
  ));

create policy "managers manage departments"
  on public.departments for all to authenticated
  using (public.is_platform_manager())
  with check (public.is_platform_manager());

create policy "approved users read sub departments"
  on public.sub_departments for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.membership_status = 'approved'
  ));

create policy "managers manage sub departments"
  on public.sub_departments for all to authenticated
  using (public.is_platform_manager())
  with check (public.is_platform_manager());

create policy "approved users read tasks"
  on public.tasks for select to authenticated
  using (
    exists (select 1 from public.task_assignees ta where ta.task_id = tasks.id and ta.profile_id = auth.uid())
    or created_by = auth.uid()
    or public.is_platform_manager()
  );

create policy "managers create tasks"
  on public.tasks for insert to authenticated
  with check (public.is_platform_manager());

create policy "assignees and managers update tasks"
  on public.tasks for update to authenticated
  using (
    public.is_platform_manager()
    or exists (select 1 from public.task_assignees ta where ta.task_id = tasks.id and ta.profile_id = auth.uid())
  )
  with check (
    public.is_platform_manager()
    or exists (select 1 from public.task_assignees ta where ta.task_id = tasks.id and ta.profile_id = auth.uid())
  );

create policy "task assignees read"
  on public.task_assignees for select to authenticated
  using (
    profile_id = auth.uid()
    or public.is_platform_manager()
  );

create policy "managers manage task assignees"
  on public.task_assignees for all to authenticated
  using (public.is_platform_manager())
  with check (public.is_platform_manager());

create policy "task participants read comments"
  on public.task_comments for select to authenticated
  using (
    exists (
      select 1 from public.tasks t
      left join public.task_assignees ta on ta.task_id = t.id
      where t.id = task_comments.task_id
        and (t.created_by = auth.uid() or ta.profile_id = auth.uid() or public.is_platform_manager())
    )
  );

create policy "task participants create comments"
  on public.task_comments for insert to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.tasks t
      left join public.task_assignees ta on ta.task_id = t.id
      where t.id = task_comments.task_id
        and (t.created_by = auth.uid() or ta.profile_id = auth.uid() or public.is_platform_manager())
    )
  );

create policy "authors update comments"
  on public.task_comments for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "read wiki categories"
  on public.wiki_categories for select to authenticated
  using (true);

create policy "managers manage wiki categories"
  on public.wiki_categories for all to authenticated
  using (public.is_platform_manager())
  with check (public.is_platform_manager());

create policy "read public or authorized wiki pages"
  on public.wiki_pages for select to authenticated
  using (
    is_public
    or created_by = auth.uid()
    or public.is_platform_manager()
  );

create policy "managers create wiki pages"
  on public.wiki_pages for insert to authenticated
  with check (public.is_platform_manager());

create policy "authors and managers update wiki pages"
  on public.wiki_pages for update to authenticated
  using (created_by = auth.uid() or public.is_platform_manager())
  with check (created_by = auth.uid() or public.is_platform_manager());

create policy "approved users read files"
  on public.files for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.membership_status = 'approved'
  ));

create policy "approved users create files"
  on public.files for insert to authenticated
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.membership_status = 'approved'
    )
  );

create policy "approved users read announcements"
  on public.announcements for select to authenticated
  using (
    published_at is not null
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.membership_status = 'approved'
    )
  );

create policy "managers manage announcements"
  on public.announcements for all to authenticated
  using (public.is_platform_manager())
  with check (public.is_platform_manager());

create policy "users read own activity"
  on public.activity_logs for select to authenticated
  using (actor_id = auth.uid() or public.is_platform_manager());

insert into public.departments (name, slug, description)
values
  ('Software', 'software', 'Vehicle control, telemetry, dashboards and embedded software'),
  ('Mechanical', 'mechanical', 'Chassis, suspension, powertrain and manufacturing'),
  ('Electrical', 'electrical', 'Low voltage, high voltage, sensors and wiring'),
  ('Aerodynamics', 'aerodynamics', 'Aerodynamic analysis, CFD and composite components'),
  ('Business', 'business', 'Operations, sponsorship, finance and communications');

insert into storage.buckets (id, name, public)
values ('team-files', 'team-files', false)
on conflict (id) do nothing;

create policy "approved users read team files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'team-files'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.membership_status = 'approved'
    )
  );

create policy "approved users upload team files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'team-files'
    and (storage.foldername(name))[1] = 'team'
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.membership_status = 'approved'
    )
  );

create policy "creators and managers update team files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'team-files'
    and (owner_id = auth.uid() or public.is_platform_manager())
  )
  with check (
    bucket_id = 'team-files'
    and (owner_id = auth.uid() or public.is_platform_manager())
  );

create policy "creators and managers delete team files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'team-files'
    and (owner_id = auth.uid() or public.is_platform_manager())
  );
