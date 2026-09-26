create table if not exists public.architect_workspaces (
 user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
 data jsonb not null default '{}'::jsonb check (octet_length(data::text) <= 1200000),
 revision integer not null default 1 check(revision>0),
 updated_at timestamptz not null default now()
);
alter table public.architect_workspaces enable row level security;
grant select,insert,update,delete on public.architect_workspaces to authenticated;
revoke all on public.architect_workspaces from anon;
create policy "Owners read workspace" on public.architect_workspaces for select to authenticated using ((select auth.uid())=user_id);
create policy "Owners create workspace" on public.architect_workspaces for insert to authenticated with check ((select auth.uid())=user_id);
create policy "Owners update workspace" on public.architect_workspaces for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "Owners delete workspace" on public.architect_workspaces for delete to authenticated using ((select auth.uid())=user_id);
create or replace function public.architect_save_workspace(workspace_data jsonb, expected_revision integer) returns jsonb language plpgsql security invoker set search_path='' as $$
declare actual_revision integer;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if jsonb_typeof(workspace_data) <> 'object' or octet_length(workspace_data::text)>1200000 then raise exception 'Workspace must be an object under the size limit'; end if;
 if expected_revision=0 then
  insert into public.architect_workspaces(user_id,data,revision) values(auth.uid(),workspace_data,1) on conflict(user_id) do nothing returning revision into actual_revision;
 else
  update public.architect_workspaces set data=workspace_data,revision=revision+1,updated_at=now() where user_id=auth.uid() and revision=expected_revision returning revision into actual_revision;
 end if;
 if actual_revision is null then return jsonb_build_object('conflict',true); end if;
 return jsonb_build_object('revision',actual_revision);
end $$;
revoke all on function public.architect_save_workspace(jsonb,integer) from public,anon;
grant execute on function public.architect_save_workspace(jsonb,integer) to authenticated;
create schema if not exists architect_private;
revoke all on schema architect_private from public,anon,authenticated;
create table if not exists architect_private.generation_limits(
 day date not null,user_id uuid not null,requests integer not null default 0,last_at timestamptz not null default now(),
 primary key(day,user_id)
);
alter table architect_private.generation_limits enable row level security;
create or replace function public.architect_reserve_generation() returns jsonb language plpgsql security definer set search_path='' as $$
declare person uuid:=auth.uid(); used integer; total_used integer; recent timestamptz; today date:=(now() at time zone 'UTC')::date;
begin
 if person is null then raise exception 'Authentication required'; end if;
 if coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then return jsonb_build_object('allowed',false,'reason','Sign in with a verified account for live AI.'); end if;
 perform pg_advisory_xact_lock(74691283);
 select coalesce(sum(requests),0) into total_used from architect_private.generation_limits where day=today;
 select requests,last_at into used,recent from architect_private.generation_limits where day=today and user_id=person;
 if total_used>=40 then return jsonb_build_object('allowed',false,'reason','The shared demo has used its 40 daily AI requests. Try again after midnight UTC.'); end if;
 if coalesce(used,0)>=10 then return jsonb_build_object('allowed',false,'reason','You have used your 10 daily demo AI requests. Try again after midnight UTC.'); end if;
 if recent is not null and recent>now()-interval '15 seconds' then return jsonb_build_object('allowed',false,'reason','Please wait 15 seconds between AI requests.'); end if;
 insert into architect_private.generation_limits(day,user_id,requests,last_at) values(today,person,1,now()) on conflict(day,user_id) do update set requests=architect_private.generation_limits.requests+1,last_at=now();
 return jsonb_build_object('allowed',true,'remaining',9-coalesce(used,0));
end $$;
revoke all on function public.architect_reserve_generation() from public,anon;
grant execute on function public.architect_reserve_generation() to authenticated;


-- Keep the privileged quota routine outside the exposed REST schema.
alter function public.architect_reserve_generation() set schema architect_private;
grant usage on schema architect_private to authenticated;
create function public.architect_reserve_generation() returns jsonb language sql security invoker set search_path='' as $$ select architect_private.architect_reserve_generation(); $$;
revoke all on function public.architect_reserve_generation() from public,anon;
grant execute on function public.architect_reserve_generation() to authenticated;
create policy "Quota writes only through guarded function" on architect_private.generation_limits for all to authenticated using(false) with check(false);
