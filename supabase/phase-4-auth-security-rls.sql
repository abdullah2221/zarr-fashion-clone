-- Phase 4: Auth security / role safety.

-- Allow authenticated users to create only their own customer profile.
drop policy if exists "users insert own customer profile" on public.profiles;
create policy "users insert own customer profile"
on public.profiles
for insert
with check (
  id = auth.uid()
  and role = 'customer'
);

-- Keep self-update role lock.
drop policy if exists "users update own profile except role" on public.profiles;
create policy "users update own profile except role"
on public.profiles
for update
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = (select p.role from public.profiles as p where p.id = auth.uid())
);

-- Super admin role update RPC (safe server-side role changes).
create or replace function public.set_user_role(target_user_id uuid, target_role public.user_role)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.profiles;
begin
  if not public.is_super_admin() then
    raise exception 'Only super admin can change roles';
  end if;

  update public.profiles
  set role = target_role, updated_at = now()
  where id = target_user_id
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Target profile not found';
  end if;

  return updated_profile;
end;
$$;

revoke all on function public.set_user_role(uuid, public.user_role) from public;
grant execute on function public.set_user_role(uuid, public.user_role) to authenticated;
