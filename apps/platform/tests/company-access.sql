begin;
insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values
 ('8495e731-de9f-4aa8-bdee-960998f655a1','company-owner@example.invalid',now(),'{"full_name":"Owner test"}'),
 ('8495e731-de9f-4aa8-bdee-960998f655a2','company-developer@example.invalid',now(),'{"full_name":"Developer test"}'),
 ('8495e731-de9f-4aa8-bdee-960998f655a3','company-viewer@example.invalid',now(),'{"full_name":"Viewer test"}'),
 ('8495e731-de9f-4aa8-bdee-960998f655a4','company-marketing@example.invalid',now(),'{"full_name":"Marketing test"}'),
 ('8495e731-de9f-4aa8-bdee-960998f655a5','company-program@example.invalid',now(),'{"full_name":"Program test"}');
create temporary table test_company_context(key text primary key,value text);
grant select,insert,update on test_company_context to authenticated;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"8495e731-de9f-4aa8-bdee-960998f655a1","role":"authenticated"}',true);
do $$ declare c jsonb;i jsonb;r jsonb;blocked boolean:=false;begin
 c:=public.architect_company('create','{"name":"Company A integration test"}');insert into test_company_context values('companyA',c->>'id');
 assert c->>'role'='owner','Creator is not owner';
 r:=public.architect_save_company_workspace((c->>'id')::uuid,'{"projects":[{"id":"shared","title":"Shared project"}],"companyRecords":{"finance":[]}}',0);assert r->>'revision'='1','Owner save failed';
 i:=public.architect_company('invite',jsonb_build_object('companyId',c->>'id','email','company-developer@example.invalid','role','developer'));insert into test_company_context values('developerToken',i->>'token');
 i:=public.architect_company('invite',jsonb_build_object('companyId',c->>'id','email','company-viewer@example.invalid','role','viewer'));insert into test_company_context values('viewerToken',i->>'token');
 i:=public.architect_company('invite',jsonb_build_object('companyId',c->>'id','email','company-marketing@example.invalid','role','marketing'));insert into test_company_context values('marketingToken',i->>'token');
 i:=public.architect_company('invite',jsonb_build_object('companyId',c->>'id','email','company-program@example.invalid','role','program_manager'));insert into test_company_context values('programToken',i->>'token');
 begin perform public.architect_company('remove',jsonb_build_object('companyId',c->>'id','userId','8495e731-de9f-4aa8-bdee-960998f655a1'));exception when others then blocked:=true;end;
 assert blocked,'Last owner removal allowed';
end $$;
select set_config('request.jwt.claims','{"sub":"8495e731-de9f-4aa8-bdee-960998f655a3","role":"authenticated"}',true);
do $$ declare blocked boolean:=false;c jsonb;begin
 begin perform public.architect_company('accept',jsonb_build_object('token',(select value from test_company_context where key='developerToken')));exception when others then blocked:=true;end;
 assert blocked,'Wrong email accepted invitation';
 assert (select count(*) from public.architect_company_workspaces)=0,'Outsider can read company workspace';
 blocked:=false;begin perform public.architect_company('get',jsonb_build_object('companyId',(select value from test_company_context where key='companyA')));exception when others then blocked:=true;end;assert blocked,'Outsider can access company metadata';
 c:=public.architect_company('create','{"name":"Company B integration test"}');insert into test_company_context values('companyB',c->>'id');
 perform public.architect_save_company_workspace((c->>'id')::uuid,'{"projects":[{"id":"privateB"}]}',0);
end $$;
select set_config('request.jwt.claims','{"sub":"8495e731-de9f-4aa8-bdee-960998f655a2","role":"authenticated"}',true);
do $$ declare c jsonb;r jsonb;blocked boolean:=false;begin
 c:=public.architect_company('accept',jsonb_build_object('token',(select value from test_company_context where key='developerToken')));assert c->>'role'='developer','Invitation role mismatch';
 begin perform public.architect_company('accept',jsonb_build_object('token',(select value from test_company_context where key='developerToken')));exception when others then blocked:=true;end;assert blocked,'Invitation replay allowed';
 r:=public.architect_load_company_workspace((c->>'id')::uuid);assert r#>>'{data,projects,0,title}'='Shared project','Invited employee cannot read shared project';
 r:=public.architect_save_company_workspace((c->>'id')::uuid,'{"projects":[{"id":"shared","title":"Employee updated"}],"companyRecords":{"finance":[{"name":"Budget"}]}}',1);assert r->>'revision'='2','Contributor cannot update shared project';
 r:=public.architect_save_company_workspace((c->>'id')::uuid,'{}',1);assert (r->>'conflict')::boolean,'Stale company save allowed';
 assert (select count(*) from public.architect_company_workspaces)=1,'Cross-company workspace visible';
 blocked:=false;begin perform public.architect_company('invite',jsonb_build_object('companyId',c->>'id','email','other@example.invalid','role','admin'));exception when others then blocked:=true;end;assert blocked,'Contributor can invite';
end $$;
select set_config('request.jwt.claims','{"sub":"8495e731-de9f-4aa8-bdee-960998f655a3","role":"authenticated"}',true);
do $$ declare c jsonb;r jsonb;blocked boolean:=false;touched integer;begin
 c:=public.architect_company('accept',jsonb_build_object('token',(select value from test_company_context where key='viewerToken')));assert c->>'role'='viewer','Viewer role mismatch';
 r:=public.architect_load_company_workspace((c->>'id')::uuid);assert r#>>'{data,projects,0,title}'='Employee updated','Viewer cannot see current shared project';
 begin perform public.architect_save_company_workspace((c->>'id')::uuid,'{}',2);exception when others then blocked:=true;end;assert blocked,'Viewer can save workspace';
 update public.architect_company_workspaces set data='{}' where company_id=(c->>'id')::uuid;get diagnostics touched=row_count;assert touched=0,'Viewer direct update bypassed RLS';
 blocked:=false;begin update public.architect_company_members set role='owner' where company_id=(c->>'id')::uuid and user_id=auth.uid();exception when others then blocked:=true;end;assert blocked,'Viewer can self-promote';
end $$;
select set_config('request.jwt.claims','{"sub":"8495e731-de9f-4aa8-bdee-960998f655a1","role":"authenticated"}',true);
select public.architect_company('role',jsonb_build_object('companyId',(select value from test_company_context where key='companyA'),'userId','8495e731-de9f-4aa8-bdee-960998f655a2','role','admin'));
select set_config('request.jwt.claims','{"sub":"8495e731-de9f-4aa8-bdee-960998f655a2","role":"authenticated"}',true);
do $$ declare blocked boolean:=false;begin
 begin perform public.architect_company('invite',jsonb_build_object('companyId',(select value from test_company_context where key='companyA'),'email','other@example.invalid','role','admin'));exception when others then blocked:=true;end;assert blocked,'Admin can grant administrator';
end $$;
select set_config('request.jwt.claims','{"sub":"8495e731-de9f-4aa8-bdee-960998f655a1","role":"authenticated"}',true);
select public.architect_company('remove',jsonb_build_object('companyId',(select value from test_company_context where key='companyA'),'userId','8495e731-de9f-4aa8-bdee-960998f655a2'));
select set_config('request.jwt.claims','{"sub":"8495e731-de9f-4aa8-bdee-960998f655a2","role":"authenticated"}',true);
do $$ declare blocked boolean:=false;begin
 assert (select count(*) from public.architect_company_workspaces)=0,'Removed user can read company data';
 begin perform public.architect_save_company_workspace((select value::uuid from test_company_context where key='companyA'),'{}',2);exception when others then blocked:=true;end;assert blocked,'Removed member can write';
end $$;
select set_config('request.jwt.claims','{"sub":"8495e731-de9f-4aa8-bdee-960998f655a4","role":"authenticated"}',true);
do $$ declare c jsonb;r jsonb;blocked boolean:=false;begin
 c:=public.architect_company('accept',jsonb_build_object('token',(select value from test_company_context where key='marketingToken')));
 assert c->>'role'='marketing' and (c->>'canWrite')::boolean and not (c->>'canManage')::boolean,'Marketing permissions incorrect';
 r:=public.architect_save_company_workspace((c->>'id')::uuid,'{"projects":[{"id":"shared"}],"companyRecords":{"marketing":[{"title":"Campaign"}]}}',2);assert r->>'revision'='3','Marketing cannot contribute';
 begin perform public.architect_company('invite',jsonb_build_object('companyId',c->>'id','email','other@example.invalid','role','developer'));exception when others then blocked:=true;end;assert blocked,'Marketing can manage membership';
 assert (select count(*) from public.architect_company_workspaces)=1,'Marketing cross-org data leak';
end $$;
select set_config('request.jwt.claims','{"sub":"8495e731-de9f-4aa8-bdee-960998f655a5","role":"authenticated"}',true);
do $$ declare c jsonb;r jsonb;blocked boolean:=false;begin
 c:=public.architect_company('accept',jsonb_build_object('token',(select value from test_company_context where key='programToken')));
 assert c->>'role'='program_manager' and (c->>'canWrite')::boolean and not (c->>'canManage')::boolean,'Program manager permissions incorrect';
 r:=public.architect_load_company_workspace((c->>'id')::uuid);assert r#>>'{data,companyRecords,marketing,0,title}'='Campaign','Shared business work lost';
 r:=public.architect_save_company_workspace((c->>'id')::uuid,r->'data',3);assert r->>'revision'='4','Program manager cannot contribute';
 begin perform public.architect_company('role',jsonb_build_object('companyId',c->>'id','userId',auth.uid(),'role','owner'));exception when others then blocked:=true;end;assert blocked,'Program manager can self-promote';
end $$;
select set_config('request.jwt.claims','{"sub":"8495e731-de9f-4aa8-bdee-960998f655a1","role":"authenticated"}',true);
select public.architect_company('role',jsonb_build_object('companyId',(select value from test_company_context where key='companyA'),'userId','8495e731-de9f-4aa8-bdee-960998f655a4','role','program_manager'));
select public.architect_company('role',jsonb_build_object('companyId',(select value from test_company_context where key='companyA'),'userId','8495e731-de9f-4aa8-bdee-960998f655a5','role','marketing'));
select 'PASS: owner create; recipient verification; single-use invite; cross-org RLS; contributor shared edits; CAS; viewer write denial; self-escalation denial; admin limit; last owner protection; immediate removal; marketing/program roles accepted and owner-reassignable; contributor writes; management denial' as result;
rollback;
