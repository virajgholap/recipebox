-- Recipe Box — let people delete their own account
--
-- Run after 0002_user_recipes.sql. Safe to re-run.
--
-- The Privacy Policy says you can delete your data from inside the app, so
-- this has to exist. It cannot be done from the browser: deleting a row from
-- auth.users needs privileges the anon key does not have, and handing the
-- client a service_role key to do it would be far worse than the problem.
--
-- So: one security-definer function, owned by postgres, that deletes exactly
-- one user — the caller. It takes no arguments on purpose. A function that
-- accepted a user id would be an account-deletion weapon pointed at everyone.

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  -- profiles, user_recipes and recipe_progress all cascade from auth.users,
  -- but delete them explicitly so the intent survives a schema change that
  -- someone forgets to add a cascade to.
  delete from public.recipe_progress where user_id = caller;
  delete from public.user_recipes   where user_id = caller;
  delete from public.profiles       where id      = caller;
  delete from auth.users            where id      = caller;
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
