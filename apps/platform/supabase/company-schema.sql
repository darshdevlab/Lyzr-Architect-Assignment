-- Company access: database-backed membership, invitations and shared workspace.
create table public.architect_companies (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name)) between 2 and 80),
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create table public.architect_company_members (
 company_id uuid not null references public.architect_companies(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check(role in ('owner','admin','pm','developer','qa','designer','sales','marketing','program_manager','cx','finance','hr','devops','executive','viewer')),
 joined_at timestamptz not null default now(), primary key(company_id,user_id)
);
create index architect_members_user_idx on public.architect_company_members(user_id);
create table public.architect_company_workspaces (
 company_id uuid primary key references public.architect_companies(id) on delete cascade,
 data jsonb not null check(jsonb_typeof(data)='object' and octet_length(data::text)<=2400000),
 revision integer not null default 1 check(revision>0),updated_at timestamptz not null default now()
);
create table architect_private.company_invitations (
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.architect_companies(id) on delete cascade,
 email text not null,role text not null check(role in ('admin','pm','developer','qa','designer','sales','marketing','program_manager','cx','finance','hr','devops','executive','viewer')),
 token_hash text unique not null,created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now()+interval '7 days'),revoked_at timestamptz,accepted_at timestamptz,accepted_by uuid references auth.users(id)
);
alter table public.architect_companies enable row level security;
alter table public.architect_company_members enable row level security;
alter table public.architect_company_workspaces enable row level security;
alter table architect_private.company_invitations enable row level security;
revoke all on public.architect_companies,public.architect_company_members,public.architect_company_workspaces from anon,authenticated;
grant select on public.architect_companies,public.architect_company_members,public.architect_company_workspaces to authenticated;
grant insert,update on public.architect_company_workspaces to authenticated;
create function architect_private.company_role(company uuid) returns text language sql stable security definer set search_path='' as $$
 select role from public.architect_company_members where company_id=company and user_id=auth.uid();
$$;
revoke all on function architect_private.company_role(uuid) from public,anon;
grant execute on function architect_private.company_role(uuid) to authenticated;
create policy "Members see their companies" on public.architect_companies for select to authenticated using(architect_private.company_role(id) is not null);
create policy "Members see their roster" on public.architect_company_members for select to authenticated using(architect_private.company_role(company_id) is not null);
create policy "Members read company workspace" on public.architect_company_workspaces for select to authenticated using(architect_private.company_role(company_id) is not null);
create policy "Contributors create company workspace" on public.architect_company_workspaces for insert to authenticated with check(architect_private.company_role(company_id) is not null and architect_private.company_role(company_id)<>'viewer');
create policy "Contributors update company workspace" on public.architect_company_workspaces for update to authenticated using(architect_private.company_role(company_id) is not null and architect_private.company_role(company_id)<>'viewer') with check(architect_private.company_role(company_id) is not null and architect_private.company_role(company_id)<>'viewer');
create policy "Invitations accessible only through guarded routines" on architect_private.company_invitations for all to authenticated using(false) with check(false);

create function architect_private.company_command(action text, payload jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare person uuid:=auth.uid(); org uuid; target uuid; actor_role text; desired text; person_email text; org_name text; raw_token text; invite architect_private.company_invitations%rowtype; result jsonb;
begin
 if person is null then raise exception 'Sign in to use a company workspace'; end if;
 select lower(email) into person_email from auth.users where id=person and email_confirmed_at is not null and not is_anonymous;
 if person_email is null then raise exception 'Use a verified email account for company access'; end if;
 if action='create' then
  org_name:=trim(payload->>'name');
  if org_name is null or length(org_name)<2 or length(org_name)>80 then raise exception 'Company name must contain 2 to 80 characters'; end if;
  perform pg_advisory_xact_lock(hashtext(person::text));
  if (select count(*) from public.architect_companies where created_by=person)>=5 then raise exception 'The prototype supports up to five companies per account'; end if;
  insert into public.architect_companies(name,created_by) values(org_name,person) returning id into org;
  insert into public.architect_company_members(company_id,user_id,role) values(org,person,'owner');
  return jsonb_build_object('id',org,'name',org_name,'role','owner','canWrite',true,'canManage',true);
 elsif action='list' then
  select coalesce(jsonb_agg(jsonb_build_object('id',c.id,'name',c.name,'role',m.role,'canWrite',m.role<>'viewer','canManage',m.role in ('owner','admin')) order by c.created_at),'[]'::jsonb) into result from public.architect_companies c join public.architect_company_members m on m.company_id=c.id where m.user_id=person;
  return result;
 elsif action='accept' then
  raw_token:=payload->>'token';
  if raw_token is null or raw_token !~ '^[a-f0-9]{64}$' then raise exception 'This invitation link is invalid'; end if;
  select * into invite from architect_private.company_invitations where token_hash=encode(extensions.digest(raw_token,'sha256'),'hex') for update;
  if not found or invite.revoked_at is not null or invite.accepted_at is not null or invite.expires_at<=now() then raise exception 'This invitation is expired, revoked or already used'; end if;
  if person_email<>invite.email then raise exception 'Sign in with the email address this invitation was sent to'; end if;
  insert into public.architect_company_members(company_id,user_id,role) values(invite.company_id,person,invite.role) on conflict(company_id,user_id) do nothing;
  update architect_private.company_invitations set accepted_at=now(),accepted_by=person where id=invite.id;
  select jsonb_build_object('id',c.id,'name',c.name,'role',m.role,'canWrite',m.role<>'viewer','canManage',m.role in ('owner','admin')) into result from public.architect_companies c join public.architect_company_members m on m.company_id=c.id where c.id=invite.company_id and m.user_id=person;
  return result;
 end if;
 begin org:=(payload->>'companyId')::uuid;exception when invalid_text_representation then raise exception 'Choose a valid company';end;
 actor_role:=architect_private.company_role(org);
 if actor_role is null then raise exception 'You do not have access to this company';end if;
 if action='get' then
  select jsonb_build_object('id',id,'name',name,'role',actor_role,'canWrite',actor_role<>'viewer','canManage',actor_role in ('owner','admin')) into result from public.architect_companies where id=org;return result;
 elsif action='members' then
  select coalesce(jsonb_agg(jsonb_build_object('userId',m.user_id,'email',u.email,'name',coalesce(u.raw_user_meta_data->>'full_name',u.raw_user_meta_data->>'name',u.email),'role',m.role,'joinedAt',m.joined_at) order by m.joined_at),'[]'::jsonb) into result from public.architect_company_members m join auth.users u on u.id=m.user_id where m.company_id=org;return result;
 end if;
 -- Serialize management operations so two changes cannot remove the final owner.
 perform 1 from public.architect_companies where id=org for update;
 actor_role:=architect_private.company_role(org);
 if actor_role is null or actor_role not in ('owner','admin') then raise exception 'Only an owner or administrator can manage company access';end if;
 if action='invites' then
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'email',email,'role',role,'expiresAt',expires_at,'createdAt',created_at,'status',case when accepted_at is not null then 'Accepted' when revoked_at is not null then 'Revoked' when expires_at<=now() then 'Expired' else 'Pending' end) order by created_at desc),'[]'::jsonb) into result from architect_private.company_invitations where company_id=org;return result;
 elsif action='invite' then
  desired:=payload->>'role';person_email:=lower(trim(payload->>'email'));
  if person_email is null or length(person_email)>254 or person_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'Enter a valid employee email';end if;
  if desired is null or desired not in ('admin','pm','developer','qa','designer','sales','marketing','program_manager','cx','finance','hr','devops','executive','viewer') then raise exception 'Choose a supported role';end if;
  if desired='admin' and actor_role<>'owner' then raise exception 'Only owners can invite administrators';end if;
  if exists(select 1 from public.architect_company_members m join auth.users u on u.id=m.user_id where m.company_id=org and lower(u.email)=person_email) then raise exception 'This account is already a company member';end if;
  if (select count(*) from architect_private.company_invitations where company_id=org and accepted_at is null and revoked_at is null and expires_at>now())>=50 then raise exception 'The prototype supports fifty pending invitations per company';end if;
  update architect_private.company_invitations set revoked_at=now() where company_id=org and email=person_email and accepted_at is null and revoked_at is null;
  raw_token:=encode(extensions.gen_random_bytes(32),'hex');
  insert into architect_private.company_invitations(company_id,email,role,token_hash,created_by) values(org,person_email,desired,encode(extensions.digest(raw_token,'sha256'),'hex'),person) returning * into invite;
  return jsonb_build_object('id',invite.id,'token',raw_token,'expiresAt',invite.expires_at);
 elsif action='revoke' then
  update architect_private.company_invitations set revoked_at=now() where id=(payload->>'inviteId')::uuid and company_id=org and accepted_at is null and revoked_at is null;
  if not found then raise exception 'Pending invitation not found';end if;return jsonb_build_object('ok',true);
 elsif action in ('role','remove') then
  target:=(payload->>'userId')::uuid;
  select role into desired from public.architect_company_members where company_id=org and user_id=target;
  if desired is null then raise exception 'Company member not found';end if;
  if desired in ('owner','admin') and actor_role<>'owner' then raise exception 'Only owners can change owner or administrator access';end if;
  if desired='owner' and (select count(*) from public.architect_company_members where company_id=org and role='owner')<=1 then raise exception 'Keep at least one company owner';end if;
  if action='remove' then delete from public.architect_company_members where company_id=org and user_id=target;
  else
   desired:=payload->>'role';
   if desired is null or desired not in ('owner','admin','pm','developer','qa','designer','sales','marketing','program_manager','cx','finance','hr','devops','executive','viewer') then raise exception 'Choose a supported role';end if;
   if desired in ('owner','admin') and actor_role<>'owner' then raise exception 'Only owners can assign owner or administrator access';end if;
   update public.architect_company_members set role=desired where company_id=org and user_id=target;
  end if;return jsonb_build_object('ok',true);
 end if;
 raise exception 'Unsupported company action';
end $$;
revoke all on function architect_private.company_command(text,jsonb) from public,anon;
grant execute on function architect_private.company_command(text,jsonb) to authenticated;
create function public.architect_company(action text,payload jsonb default '{}'::jsonb) returns jsonb language sql security invoker set search_path='' as $$ select architect_private.company_command(action,payload); $$;
revoke all on function public.architect_company(text,jsonb) from public,anon;
grant execute on function public.architect_company(text,jsonb) to authenticated;
create function public.architect_save_company_workspace(company uuid,workspace_data jsonb,expected_revision integer) returns jsonb language plpgsql security invoker set search_path='' as $$
declare actual integer;
begin
 if auth.uid() is null then raise exception 'Sign in to save';end if;
 if architect_private.company_role(company) is null or architect_private.company_role(company)='viewer' then raise exception 'Your company role cannot edit this shared workspace';end if;
 if jsonb_typeof(workspace_data)<>'object' or octet_length(workspace_data::text)>2400000 then raise exception 'Company workspace must be an object under the size limit';end if;
 if expected_revision=0 then insert into public.architect_company_workspaces(company_id,data,revision) values(company,workspace_data,1) on conflict(company_id) do nothing returning revision into actual;
 else update public.architect_company_workspaces set data=workspace_data,revision=revision+1,updated_at=now() where company_id=company and revision=expected_revision returning revision into actual;end if;
 if actual is null then return jsonb_build_object('conflict',true);end if;return jsonb_build_object('revision',actual);
end $$;
revoke all on function public.architect_save_company_workspace(uuid,jsonb,integer) from public,anon;
grant execute on function public.architect_save_company_workspace(uuid,jsonb,integer) to authenticated;
create function public.architect_load_company_workspace(company uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 if architect_private.company_role(company) is null then raise exception 'You do not have access to this company';end if;
 select jsonb_build_object('data',data,'revision',revision) into result from public.architect_company_workspaces where company_id=company;
 return result;
end $$;
revoke all on function public.architect_load_company_workspace(uuid) from public,anon;
grant execute on function public.architect_load_company_workspace(uuid) to authenticated;
