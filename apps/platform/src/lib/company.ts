import { authenticatedRPC } from './cloud.ts';
export const companyRoles = [
  'owner',
  'admin',
  'pm',
  'developer',
  'qa',
  'designer',
  'sales',
  'marketing',
  'program_manager',
  'cx',
  'finance',
  'hr',
  'devops',
  'executive',
  'viewer',
] as const;
export type CompanyRole = (typeof companyRoles)[number];
export const roleLabels: Record<CompanyRole, string> = {
  owner: 'Owner',
  admin: 'Administrator',
  pm: 'Product manager',
  developer: 'Developer',
  qa: 'QA engineer',
  designer: 'Designer',
  sales: 'Sales',
  marketing: 'Marketing',
  program_manager: 'Program manager',
  cx: 'Customer experience',
  finance: 'Finance',
  hr: 'People & HR',
  devops: 'DevOps',
  executive: 'Executive',
  viewer: 'Viewer',
};
export interface CompanySummary {
  id: string;
  name: string;
  role: CompanyRole;
  canWrite: boolean;
  canManage: boolean;
}
export interface CompanyMember {
  userId: string;
  email: string;
  name: string;
  role: CompanyRole;
  joinedAt: string;
}
export interface CompanyInvite {
  id: string;
  email: string;
  role: CompanyRole;
  expiresAt: string;
  createdAt: string;
  status: 'Pending' | 'Accepted' | 'Revoked' | 'Expired';
}
const command = <T>(action: string, payload: Record<string, unknown> = {}) =>
  authenticatedRPC<T>('architect_company', { action, payload });
export const listCompanies = () => command<CompanySummary[]>('list');
export const getCompany = (companyId: string) => command<CompanySummary>('get', { companyId });
export const createCompany = (name: string) =>
  command<CompanySummary>('create', { name: name.trim() });
export const listMembers = (companyId: string) =>
  command<CompanyMember[]>('members', { companyId });
export const listInvites = (companyId: string) =>
  command<CompanyInvite[]>('invites', { companyId });
export function canManageCompany(role: CompanyRole) {
  return role === 'owner' || role === 'admin';
}
export function canWriteCompany(role: CompanyRole) {
  return companyRoles.includes(role) && role !== 'viewer';
}
export function invitationUrl(token: string, origin = location.origin) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error('Invalid invitation token.');
  return `${origin}/?join=company#invite=${token}`;
}
export async function createInvite(
  companyId: string,
  email: string,
  role: Exclude<CompanyRole, 'owner'>,
) {
  const r = await command<{ id: string; token: string; expiresAt: string }>('invite', {
    companyId,
    email: email.trim().toLowerCase(),
    role,
  });
  return { id: r.id, inviteUrl: invitationUrl(r.token), expiresAt: r.expiresAt };
}
export const acceptInvite = async (token: string) => {
  const company = await command<CompanySummary>('accept', { token: token.trim() });
  sessionStorage.removeItem('architect.pendingInvite');
  return company;
};
export const revokeInvite = (companyId: string, inviteId: string) =>
  command<{ ok: true }>('revoke', { companyId, inviteId });
export const updateMemberRole = (companyId: string, userId: string, role: CompanyRole) =>
  command<{ ok: true }>('role', { companyId, userId, role });
export const removeMember = (companyId: string, userId: string) =>
  command<{ ok: true }>('remove', { companyId, userId });
export const loadCompanyWorkspace = <T>(companyId: string, expectedUserId?: string) =>
  authenticatedRPC<{ data: T; revision: number } | null>(
    'architect_load_company_workspace',
    { company: companyId },
    expectedUserId,
  );
export async function saveCompanyWorkspace(
  companyId: string,
  data: unknown,
  expectedRevision: number,
  expectedUserId?: string,
) {
  if (new TextEncoder().encode(JSON.stringify(data)).length > 2000000)
    throw new Error(
      'The company workspace exceeds the 2 MB prototype limit. Export older projects before continuing.',
    );
  const r = await authenticatedRPC<{ revision: number; conflict?: boolean }>(
    'architect_save_company_workspace',
    { company: companyId, workspace_data: data, expected_revision: expectedRevision },
    expectedUserId,
  );
  if (r.conflict)
    throw new Error(
      'A teammate changed this company workspace. Reload before saving to avoid overwriting their work.',
    );
  return r.revision;
}
/** Call before OAuth navigation; token stays out of server request URLs and survives redirect. */
export function pendingInvite(): string | null {
  const params = new URLSearchParams(location.hash.slice(1));
  const token = params.get('invite');
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    sessionStorage.setItem('architect.pendingInvite', token);
    history.replaceState({}, '', location.pathname + location.search);
    return token;
  }
  return sessionStorage.getItem('architect.pendingInvite');
}
export function parseInvite(value: string) {
  const trimmed = value.trim();
  if (/^[a-f0-9]{64}$/.test(trimmed)) return trimmed;
  try {
    const u = new URL(trimmed);
    const token = new URLSearchParams(u.hash.slice(1)).get('invite');
    if (token && /^[a-f0-9]{64}$/.test(token)) return token;
  } catch {}
  throw new Error('Paste the full invitation link your administrator shared.');
}
