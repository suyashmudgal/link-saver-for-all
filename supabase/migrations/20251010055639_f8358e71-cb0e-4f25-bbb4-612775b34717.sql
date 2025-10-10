-- Create profiles table for user data
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create enum for item types
create type public.item_type as enum ('link', 'image', 'video', 'note');

-- Create items table
create table public.items (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  type item_type not null,
  content text not null,
  thumbnail_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Enable RLS on items
alter table public.items enable row level security;

-- Items policies
create policy "Users can view their own items"
  on public.items for select
  using (auth.uid() = user_id);

create policy "Users can create their own items"
  on public.items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own items"
  on public.items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own items"
  on public.items for delete
  using (auth.uid() = user_id);

-- Function to handle new user signup
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for profiles updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

-- Trigger for items updated_at
create trigger update_items_updated_at
  before update on public.items
  for each row execute function public.update_updated_at_column();