import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  ArrowUp,
  Plus,
  Search,
  Home,
  FolderKanban,
  FileText,
  Code2,
  Bot,
  Layers3,
  Database,
  FlaskConical,
  Rocket,
  Activity,
  Settings,
  Palette,
  ChevronDown,
  LogOut,
  Bell,
  Menu,
  X,
  Check,
  Copy,
  Trash2,
  Download,
  Command,
  PanelLeftClose,
  LifeBuoy,
  BookOpen,
  Clock,
  GitBranch,
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
  Building2,
  Users,
  ChartNoAxesCombined,
  Briefcase,
  Server,
  Cloud,
  Network,
  Box,
  Lock,
  RotateCcw,
} from 'lucide-react';
import {
  initialStore,
  readStore,
  createProject,
  addProject,
  updateProject,
  uid,
  buildHTML,
  type Store,
  type Project,
  type Theme,
} from './lib/model';
import { Appearance, Modal, PageTitle, Status, ThemeOptions } from './components/UI';
import Studio, { download } from './components/Studio';
import { Workbench } from './components/Workbench';
import Auth from './components/Auth';
import AccountCenter from './components/AccountCenter';
import { readAppearance, saveAppearance, type PersonalAppearance } from './lib/appearance';
import {
  contextFromUrl,
  writeContext,
  roleDestination,
  type NavigationContext,
} from './lib/navigation';
import { Brand, Avatar } from './components/Brand';
import { EDITION, EDITION_LINKS, ASSIGNMENT_URL, companyAreas, privateAreas } from './lib/edition';
import { CompanyStudio } from './components/CompanyStudio';
import InfrastructureStudio from './components/InfrastructureStudio';
import CompanyAccess from './components/CompanyAccess';
import {
  pendingInvite,
  getCompany,
  loadCompanyWorkspace,
  saveCompanyWorkspace,
  roleLabels,
  type CompanySummary,
} from './lib/company';
pendingInvite();
import { auth, loadWorkspace, saveWorkspace, getAccessToken } from './lib/cloud';
const baseAreas = [
  ['today', 'Your workspace', Home],
  ['projects', 'Projects', FolderKanban],
  ['plan', 'Plan & docs', FileText],
  ['studio', 'Build studio', Layers3],
  ['buildflows', 'Design & journeys', Palette],
  ['code', 'Code & repositories', Code2],
  ['agents', 'Agent studio', Bot],
  ['models', 'Models & routing', Sparkles],
  ['data', 'Data & connections', Database],
  ['qa', 'Test lab', FlaskConical],
  ['release', 'Release', Rocket],
  ['ops', 'Observe', Activity],
] as const;
const orgAreas = [
  ['company', 'Company overview', Building2],
  ['delivery', 'Product & delivery', FolderKanban],
  ['revenue', 'Sales & relationships', Briefcase],
  ['success', 'Customer success', Users],
  ['finance', 'Finance', Database],
  ['people', 'People & capacity', Users],
  ['metrics', 'Metrics & goals', ChartNoAxesCombined],
  ['growth', 'Marketing & growth', Sparkles],
  ['botteams', 'Bot teams', Bot],
  ['sync', 'Connected systems', Network],
] as const;
const infraAreas = [
  ['infrastructure', 'Private platform', Server],
  ['connections', 'Cloud connections', Cloud],
  ['runners', 'Execution pools', Layers3],
  ['installation', 'Install Architect', Box],
  ['governance', 'Policies & access', Lock],
  ['recovery', 'Backup & recovery', RotateCcw],
] as const;
const areas = [
  ...(EDITION >= 3 ? orgAreas : []),
  ...baseAreas,
  ...(EDITION === 4 ? infraAreas : []),
];
const viewFromUrl = () =>
  new URLSearchParams(location.search).get('view') ||
  (EDITION === 4 ? 'infrastructure' : EDITION === 3 ? 'company' : 'today');
const sample = () => {
  const p = createProject(
    'Support desk',
    'Build a calm customer support workspace with a ticket inbox, priority filters, ticket creation and a resolution workflow. Make it responsive and keyboard accessible.',
  );
  return {
    ...p,
    prd: '# Support desk\n\n## Who it is for\nSmall support teams that need a clear view of every customer request.\n\n## First release\nTicket inbox, search, priority filters, ticket creation, detail panel and resolution.\n\n## Acceptance criteria\n- Create a ticket with a title, customer and priority.\n- Filter open and resolved tickets.\n- Open a ticket and resolve it without losing inbox context.\n- All actions are usable by keyboard.\n\n## Not in this release\nOutbound email and real customer integrations.\n\n## Success\nA support agent can find and resolve a request in under one minute.',
    trd: '# Technical plan\n\nResponsive client application with semantic HTML and explicit loading, empty and validation states.\n\n## Data\nTickets: id, subject, customer, priority, status, createdAt.\n\n## Identity\nDemo preview state is separate from Architect account data. Production customer identity requires an app-specific provider.\n\n## Validation\nTicket creation, filtering, resolution, keyboard access and mobile layout.\n\n## Delivery\nStart with preview. Review test evidence before promoting to production.',
  };
};
function Contours() {
  return (
    <svg className="contours" viewBox="0 0 700 300" aria-hidden="true">
      {Array.from({ length: 21 }, (_, i) => (
        <ellipse
          key={i}
          cx="500"
          cy="175"
          rx={55 + i * 17}
          ry={22 + i * 9}
          transform="rotate(-24 500 175)"
          fill="none"
          stroke="currentColor"
          strokeWidth=".8"
        />
      ))}
    </svg>
  );
}
export default function App() {
  const [startupError, setStartupError] = useState('');
  const [appearance, setAppearance] = useState(readAppearance),
    [navigationContext, setNavigationContext] = useState(() => contextFromUrl(location.href));
  const [store, setStore] = useState<Store>(() => structuredClone(initialStore)),
    [view, setView] = useState(viewFromUrl),
    [session, setSession] = useState<{
      id: string;
      email?: string;
      name?: string;
      avatarUrl?: string;
    } | null>(null),
    [demo, setDemo] = useState(false),
    [boot, setBoot] = useState(true),
    [ready, setReady] = useState(false),
    [sync, setSync] = useState('Saved on this device'),
    [modal, setModal] = useState(''),
    [toast, setToast] = useState(''),
    [search, setSearch] = useState(''),
    [projectFilter, setProjectFilter] = useState('All'),
    [mobileNav, setMobileNav] = useState(false),
    [prompt, setPrompt] = useState(''),
    [newTitle, setNewTitle] = useState(''),
    [repo, setRepo] = useState(''),
    [newKind, setNewKind] = useState('prompt'),
    [profileName, setProfileName] = useState(''),
    [workspaceName, setWorkspaceName] = useState(''),
    [role, setRole] = useState('Builder'),
    [setupTheme, setSetupTheme] = useState<Theme>('atelier'),
    [activeDelete, setActiveDelete] = useState<string | null>(null),
    [saveError, setSaveError] = useState(''),
    [company, setCompany] = useState<CompanySummary | null>(null);
  const companyRef = useRef<CompanySummary | null>(null);
  const workspaceEpoch = useRef(0);
  const saveErrorRef = useRef(saveError);
  saveErrorRef.current = saveError;
  const revision = useRef(0),
    lastSaved = useRef(''),
    saveQueue = useRef(Promise.resolve()),
    sessionRef = useRef<string | null>(null),
    loadEpoch = useRef(0),
    saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    storeRef = useRef(store);
  storeRef.current = store;
  function updateSaveError(message: string) {
    saveErrorRef.current = message;
    setSaveError(message);
  }
  const displayName = company
    ? session?.name || session?.email?.split('@')[0] || 'Your account'
    : store.profile?.name || session?.name || 'Your account';
  const displayRole = company ? roleLabels[company.role] : store.profile?.role || role;
  const displayWorkspace = company?.name || store.profile?.workspace || 'My workspace';
  const project = store.projects.find((p) => p.id === store.activeProject) || null;
  const notify = useCallback((s: string) => setToast(s), []);
  function changeAppearance(value: PersonalAppearance) {
    setAppearance(value);
    saveAppearance(value, sessionRef.current || undefined);
  }
  const navigate = useCallback((v: string, target?: string | NavigationContext) => {
    if (v === 'company-access') {
      setModal('company-access');
      return;
    }
    const names: Record<string, string> = {
      build: 'studio',
      review: 'qa',
      bots: 'agents',
      insights: 'ops',
      products: 'projects',
      design: 'buildflows',
      people: EDITION >= 3 ? 'people' : 'settings',
      infrastructure: EDITION === 4 ? 'infrastructure' : 'release',
    };
    v = names[v] || v;
    const context = typeof target === 'object' ? target : {};
    setView(v);
    setNavigationContext(context);
    setMobileNav(false);
    const u = writeContext(new URL(location.href), context);
    u.searchParams.set('view', v);
    const contextId = typeof target === 'string' ? target : storeRef.current.activeProject;
    if (contextId) u.searchParams.set('project', contextId);
    else u.searchParams.delete('project');
    if (companyRef.current) u.searchParams.set('company', companyRef.current.id);
    else u.searchParams.delete('company');
    history.pushState({}, '', u);
    document.getElementById('main')?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, []);
  const enter = useCallback(
    async (user: { id: string; email?: string; name?: string; avatarUrl?: string }) => {
      if (sessionRef.current === user.id) return;
      const epoch = ++loadEpoch.current;
      sessionRef.current = user.id;
      updateSaveError('');
      setSession(user);
      setAppearance(readAppearance(user.id));
      setDemo(false);
      setReady(false);
      setBoot(true);
      revision.current = 0;
      try {
        const selected =
          new URLSearchParams(location.search).get('company') ||
          localStorage.getItem('architect.company.' + user.id);
        let active: CompanySummary | null = null;
        if (selected) {
          try {
            active = await getCompany(selected);
          } catch (e) {
            if (e instanceof Error && /do not have access|valid company/i.test(e.message)) {
              localStorage.removeItem('architect.company.' + user.id);
              const u = new URL(location.href);
              u.searchParams.delete('company');
              history.replaceState({}, '', u);
              notify(
                'Company access is no longer available. Your personal workspace is still available.',
              );
            } else throw e;
          }
        }
        if (epoch !== loadEpoch.current) return;
        companyRef.current = active;
        setCompany(active);
        const saved = active
          ? await loadCompanyWorkspace<Store>(active.id, user.id)
          : await loadWorkspace<Store>(user.id);
        if (epoch !== loadEpoch.current || sessionRef.current !== user.id) return;
        const s = saved ? readStore(JSON.stringify(saved.data)) : structuredClone(initialStore);
        revision.current = saved?.revision || 0;
        lastSaved.current = JSON.stringify(s);
        const requestedProject = new URLSearchParams(location.search).get('project');
        if (requestedProject && s.projects.some((p) => p.id === requestedProject))
          s.activeProject = requestedProject;
        storeRef.current = s;
        setStore(s);
        setSync('Saved to your account');
        if (!new URLSearchParams(location.search).has('view'))
          navigate(
            roleDestination(active?.role || s.profile?.role || '', EDITION),
            s.activeProject || undefined,
          );
        else setView(viewFromUrl());
        setNavigationContext(contextFromUrl(location.href));
        if (
          pendingInvite() ||
          sessionStorage.getItem('architect.entry') === 'company' ||
          sessionStorage.getItem('architect.entry') === 'employee' ||
          (EDITION >= 3 && !active)
        ) {
          setModal('company-access');
          sessionStorage.removeItem('architect.entry');
        } else if (!s.profile && !active) {
          setProfileName(user.name || '');
          setWorkspaceName('My workspace');
          setModal('onboard');
        }
      } catch (e) {
        if (epoch !== loadEpoch.current) return;
        setStore(structuredClone(initialStore));
        updateSaveError(
          'Your account data could not be loaded. Reload before editing to protect existing work.',
        );
        setSync('Cloud unavailable');
        notify(String(e));
        return;
      } finally {
        if (epoch === loadEpoch.current) setBoot(false);
      }
      if (epoch === loadEpoch.current) setReady(true);
    },
    [notify],
  );
  useEffect(() => {
    let alive = true;
    auth
      .getUser()
      .then((u) => {
        if (alive) {
          if (u && !new URLSearchParams(location.search).has('recovery')) void enter(u);
          else setBoot(false);
        }
      })
      .catch((e) => {
        if (alive) {
          setStartupError(e instanceof Error ? e.message : 'Unable to reconnect to your account.');
          setBoot(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [enter]);
  useEffect(
    () =>
      auth.onChange((u) => {
        if (u) {
          if (u.id !== sessionRef.current && !new URLSearchParams(location.search).has('recovery'))
            void enter(u);
        } else if (sessionRef.current) {
          loadEpoch.current++;
          sessionRef.current = null;
          setSession(null);
          setReady(false);
          setBoot(false);
          setStore(structuredClone(initialStore));
          updateSaveError('');
          companyRef.current = null;
          setCompany(null);
          workspaceEpoch.current++;
        }
      }),
    [enter],
  );
  useEffect(() => {
    const fn = () => {
      const target = new URL(location.href);
      const companyId = target.searchParams.get('company');
      if (sessionRef.current && companyId !== (companyRef.current?.id || null)) {
        void changeCompany(companyId ? { id: companyId } : null, target);
        return;
      }
      setView(viewFromUrl());
      setNavigationContext(contextFromUrl(location.href));
      const id = target.searchParams.get('project');
      if (id)
        setStore((s) => (s.projects.some((p) => p.id === id) ? { ...s, activeProject: id } : s));
    };
    window.addEventListener('popstate', fn);
    return () => window.removeEventListener('popstate', fn);
  }, [session]);
  useEffect(() => {
    const m = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.dataset.theme = appearance.theme;
      document.documentElement.dataset.mode =
        appearance.mode === 'system' ? (m.matches ? 'dark' : 'light') : appearance.mode;
      document.documentElement.dataset.density = appearance.compact ? 'compact' : 'comfortable';
    };
    apply();
    m.addEventListener('change', apply);
    return () => m.removeEventListener('change', apply);
  }, [appearance]);
  useEffect(() => {
    if (!ready) return;
    const raw = JSON.stringify(store);
    if (demo) {
      try {
        localStorage.setItem('architect-demo-v2', raw);
        setSync('Saved on this device');
      } catch {
        setSync('Device storage full');
      }
      return;
    }
    if (!session || raw === lastSaved.current || saveError || company?.canWrite === false) return;
    setSync('Saving…');
    const timer = setTimeout(() => {
      saveTimer.current = null;
      const sid = session.id;
      const scope = companyRef.current;
      const scopeEpoch = workspaceEpoch.current;
      saveQueue.current = saveQueue.current.then(async () => {
        if (sessionRef.current !== sid || scopeEpoch !== workspaceEpoch.current) return;
        try {
          const nextRevision = scope
            ? await saveCompanyWorkspace(scope.id, store, revision.current, sid)
            : await saveWorkspace(store, revision.current, sid);
          if (sessionRef.current !== sid || scopeEpoch !== workspaceEpoch.current) return;
          revision.current = nextRevision;
          lastSaved.current = raw;
          setSync('Saved to your account');
        } catch (e) {
          if (sessionRef.current !== sid || scopeEpoch !== workspaceEpoch.current) return;
          setSync('Save needs attention');
          updateSaveError(e instanceof Error ? e.message : 'Could not save');
        }
      });
    }, 650);
    saveTimer.current = timer;
    return () => {
      clearTimeout(timer);
      if (saveTimer.current === timer) saveTimer.current = null;
    };
  }, [store, ready, demo, session, saveError, company]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 6500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setModal('search');
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);
  useEffect(() => {
    if (modal === 'profile' || modal === 'workspace') {
      setProfileName(
        companyRef.current
          ? session?.name || session?.email || 'Your account'
          : storeRef.current.profile?.name || session?.name || '',
      );
      setWorkspaceName(companyRef.current?.name || storeRef.current.profile?.workspace || '');
      setRole(
        companyRef.current
          ? roleLabels[companyRef.current.role]
          : storeRef.current.profile?.role || 'Builder',
      );
    }
  }, [modal]);
  function startDemo() {
    loadEpoch.current++;
    companyRef.current = null;
    setCompany(null);
    workspaceEpoch.current++;
    const s = readStore(localStorage.getItem('architect-demo-v2'));
    if (!s.profile) {
      s.profile = {
        name: 'Darsh',
        workspace: 'Personal workspace',
        kind: 'personal',
        role: 'Builder',
      };
      const p = sample();
      s.projects = [p];
      s.activeProject = p.id;
    }
    setStore(s);
    setDemo(true);
    setSession(null);
    sessionRef.current = null;
    setReady(true);
    setBoot(false);
    updateSaveError('');
  }
  function writable() {
    if (companyRef.current?.canWrite === false) {
      notify('Your Viewer membership is read-only. Ask an administrator for contributor access.');
      return false;
    }
    return true;
  }
  function patch(p: Partial<Project>) {
    if (!writable()) return;
    if (project) setStore((s) => updateProject(s, project.id, p));
  }
  function selectProject(id: string, v = 'studio') {
    setStore((s) => ({ ...s, activeProject: id }));
    navigate(v, id);
  }
  useEffect(() => {
    if (!ready) return;
    const id = new URLSearchParams(location.search).get('project');
    if (id && store.projects.some((p) => p.id === id) && store.activeProject !== id)
      setStore((s) => ({ ...s, activeProject: id }));
  }, [ready]);
  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!writable()) return;
    const p = createProject(
      newTitle.trim() || prompt.split(/[.!\n]/)[0].slice(0, 42) || 'New project',
      prompt.trim(),
      newKind === 'import' ? repo.trim() : '',
    );
    setStore((s) => addProject(s, p));
    setModal('');
    setNewTitle('');
    setRepo('');
    setPrompt('');
    navigate(newKind === 'import' ? 'code' : 'studio', p.id);
    setNewKind('prompt');
    notify('Project created. Your prompt and draft specifications are ready.');
  }
  async function logout(discard = false) {
    const sid = sessionRef.current;
    const scopeEpoch = workspaceEpoch.current;
    if (sid && saveErrorRef.current && !discard) {
      notify('Export your unsaved work, then reload the saved account data before signing out.');
      return;
    }
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    await saveQueue.current;
    if (sessionRef.current !== sid || workspaceEpoch.current !== scopeEpoch) return;
    if (saveErrorRef.current && !discard) {
      notify('The queued save failed. Export your work or use sign out options.');
      return;
    }
    if (
      !discard &&
      sid &&
      !saveError &&
      companyRef.current?.canWrite !== false &&
      JSON.stringify(storeRef.current) !== lastSaved.current
    ) {
      try {
        const scope = companyRef.current;
        const nextRevision = scope
          ? await saveCompanyWorkspace(scope.id, storeRef.current, revision.current, sid)
          : await saveWorkspace(storeRef.current, revision.current, sid);
        if (sessionRef.current !== sid || workspaceEpoch.current !== scopeEpoch) return;
        revision.current = nextRevision;
      } catch (e) {
        updateSaveError(e instanceof Error ? e.message : 'Could not save before signing out.');
        notify('Could not save the latest changes. Export your work or use sign out options.');
        return;
      }
    }
    if (sessionRef.current !== sid || workspaceEpoch.current !== scopeEpoch) return;
    try {
      await auth.signOut(sid || undefined);
    } catch {
      notify('Signed out locally. Server session revocation could not be confirmed.');
    }
    if (sessionRef.current && sessionRef.current !== sid) return;
    try {
      for (const key of Object.keys(sessionStorage)) {
        if (key.startsWith('architect.draft.')) sessionStorage.removeItem(key);
      }
    } catch {
      /* Restricted storage must not prevent logout. */
    }
    loadEpoch.current++;
    workspaceEpoch.current++;
    companyRef.current = null;
    setCompany(null);
    sessionRef.current = null;
    setSession(null);
    setDemo(false);
    setReady(false);
    setStore(structuredClone(initialStore));
    setModal('');
    updateSaveError('');
    navigate('today');
  }

  async function changeCompany(next: Pick<CompanySummary, 'id'> | null, target?: URL) {
    if (!session) return;
    if (saveErrorRef.current) {
      notify('Resolve or export the current unsaved changes before switching workspace.');
      if (target) {
        const current = new URL(location.href);
        if (companyRef.current) current.searchParams.set('company', companyRef.current.id);
        else current.searchParams.delete('company');
        history.replaceState({}, '', current);
      }
      return;
    }
    const sid = session.id;
    const originEpoch = workspaceEpoch.current;
    setModal('');
    setBoot(true);
    setReady(false);
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    let switchEpoch = originEpoch;
    try {
      await saveQueue.current;
      if (sessionRef.current !== sid || workspaceEpoch.current !== originEpoch) return;
      if (saveErrorRef.current)
        throw new Error(
          'The queued save failed. Export your work and resolve it before switching company.',
        );
      const old = companyRef.current;
      const snapshot = storeRef.current;
      const raw = JSON.stringify(snapshot);
      if (old?.canWrite !== false && raw !== lastSaved.current) {
        const nextRevision = old
          ? await saveCompanyWorkspace(old.id, snapshot, revision.current, sid)
          : await saveWorkspace(snapshot, revision.current, sid);
        if (sessionRef.current !== sid || workspaceEpoch.current !== originEpoch) return;
        revision.current = nextRevision;
        lastSaved.current = raw;
      }
      switchEpoch = ++workspaceEpoch.current;
      const verified = next ? await getCompany(next.id) : null;
      if (sessionRef.current !== sid || switchEpoch !== workspaceEpoch.current) return;
      const saved = verified
        ? await loadCompanyWorkspace<Store>(verified.id, sid)
        : await loadWorkspace<Store>(sid);
      if (sessionRef.current !== sid || switchEpoch !== workspaceEpoch.current) return;
      companyRef.current = verified;
      setCompany(verified);
      if (verified) localStorage.setItem('architect.company.' + sid, verified.id);
      else localStorage.removeItem('architect.company.' + sid);
      const data = saved ? readStore(JSON.stringify(saved.data)) : structuredClone(initialStore);
      if (!data.profile && !verified)
        data.profile = {
          name: session.name || 'Builder',
          workspace: 'Personal workspace',
          kind: 'personal',
          role: 'Builder',
        };
      revision.current = saved?.revision || 0;
      lastSaved.current = JSON.stringify(data);
      setStore(data);
      setSync(verified ? 'Company workspace loaded' : 'Personal workspace loaded');
      storeRef.current = data;
      navigate(
        target?.searchParams.get('view') || (EDITION >= 3 ? 'company' : 'today'),
        target?.searchParams.get('project') || undefined,
      );
      if (target) {
        if (verified) target.searchParams.set('company', verified.id);
        else target.searchParams.delete('company');
        history.replaceState({}, '', target);
      }
    } catch (e) {
      if (sessionRef.current === sid) {
        notify(e instanceof Error ? e.message : 'Could not switch workspace.');
        setSync('Workspace switch needs attention');
        const current = new URL(location.href);
        if (companyRef.current) current.searchParams.set('company', companyRef.current.id);
        else current.searchParams.delete('company');
        history.replaceState({}, '', current);
      }
    } finally {
      if (sessionRef.current === sid && switchEpoch === workspaceEpoch.current) {
        setBoot(false);
        setReady(true);
      }
    }
  }

  async function openEdition(version: number) {
    const destination = versionHref(version);
    if (demo) {
      localStorage.setItem('architect-demo-v2', JSON.stringify(storeRef.current));
      location.assign(destination);
      return;
    }
    const sid = sessionRef.current,
      epoch = workspaceEpoch.current;
    if (!sid || saveErrorRef.current) {
      notify('Resolve or export unsaved changes before changing edition.');
      return;
    }
    setBoot(true);
    try {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      await saveQueue.current;
      if (sessionRef.current !== sid || workspaceEpoch.current !== epoch) return;
      if (saveErrorRef.current)
        throw new Error('The queued save failed. Resolve it before changing edition.');
      const raw = JSON.stringify(storeRef.current);
      if (companyRef.current?.canWrite !== false && raw !== lastSaved.current) {
        const scope = companyRef.current;
        const savedRevision = scope
          ? await saveCompanyWorkspace(scope.id, storeRef.current, revision.current, sid)
          : await saveWorkspace(storeRef.current, revision.current, sid);
        if (sessionRef.current !== sid || workspaceEpoch.current !== epoch) return;
        revision.current = savedRevision;
        lastSaved.current = raw;
      }
      if (sessionRef.current === sid && workspaceEpoch.current === epoch)
        location.assign(destination);
    } catch (e) {
      updateSaveError(e instanceof Error ? e.message : 'Could not save before changing edition.');
    } finally {
      if (sessionRef.current === sid && workspaceEpoch.current === epoch) setBoot(false);
    }
  }
  function versionHref(version: number) {
    const u = new URL(EDITION_LINKS[version]);
    const nextView =
      version === 2 && !baseAreas.some(([id]) => id === view)
        ? 'today'
        : version !== 4 && privateAreas.includes(view)
          ? 'release'
          : view;
    u.searchParams.set('view', nextView);
    if (nextView === view) writeContext(u, navigationContext);
    u.searchParams.set('theme', appearance.theme);
    u.searchParams.set('mode', appearance.mode);
    if (store.activeProject) u.searchParams.set('project', store.activeProject);
    if (company) u.searchParams.set('company', company.id);
    return u.toString();
  }
  if (boot)
    return (
      <div className="loading-screen">
        <Brand />
        <p>Opening your workspace…</p>
      </div>
    );
  if (startupError && !session && !demo)
    return (
      <div className="loading-screen">
        <Brand />
        <h1>Reconnect to your workspace.</h1>
        <p role="alert">{startupError}</p>
        <button
          className="button primary"
          onClick={async () => {
            setBoot(true);
            try {
              const u = await auth.getUser();
              setStartupError('');
              if (u) await enter(u);
            } catch (e) {
              setStartupError(e instanceof Error ? e.message : 'Connection is still unavailable.');
            } finally {
              setBoot(false);
            }
          }}
        >
          Try again
        </button>
        <button className="button" onClick={() => setStartupError('')}>
          Return to sign-in
        </button>
      </div>
    );
  if (!session && !demo)
    return (
      <Auth
        isDark={
          appearance.mode === 'dark' ||
          (appearance.mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches)
        }
        onToggleAppearance={() =>
          changeAppearance({
            ...appearance,
            mode: document.documentElement.dataset.mode === 'dark' ? 'light' : 'dark',
          })
        }
        onDemo={startDemo}
        onAuthenticated={(u) => void enter(u)}
      />
    );
  const title =
    areas.find((a) => a[0] === view)?.[1] ||
    (
      { settings: 'Workspace settings', inbox: 'Inbox', help: 'Help & resources' } as Record<
        string,
        string
      >
    )[view] ||
    'Workspace';
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to workspace
      </a>
      <aside className={'sidebar ' + (mobileNav ? 'open' : '')}>
        <div className="brand">
          <Brand />
          <button
            className="mobile-close icon-button"
            aria-label="Close navigation"
            onClick={() => setMobileNav(false)}
          >
            <X size={18} />
          </button>
        </div>
        <button className="workspace-switch" onClick={() => setModal('company-access')}>
          <span className="workspace-icon">{displayWorkspace[0]}</span>
          <span>
            {displayWorkspace}
            <small>
              {demo ? 'Demo workspace' : company ? roleLabels[company.role] : 'Personal · Free'}
            </small>
          </span>
          <ChevronDown size={14} />
        </button>
        <button className="rail-search" onClick={() => setModal('search')}>
          <Search size={15} />
          Find anything<kbd>⌘ K</kbd>
        </button>
        <nav aria-label="Main navigation">
          {areas.map(([id, label, Icon], i) => (
            <div key={id}>
              {(id === 'today' || id === 'company' || id === 'infrastructure') && (
                <div className="nav-label">
                  {id === 'company'
                    ? 'Company workspace'
                    : id === 'infrastructure'
                      ? 'Private platform'
                      : 'Create & ship'}
                </div>
              )}
              <button
                className={'nav-item ' + (view === id ? 'active' : '')}
                aria-current={view === id ? 'page' : undefined}
                onClick={() => navigate(id)}
              >
                <Icon size={17} />
                <span>{label}</span>
                {id === 'projects' && <small>{store.projects.length}</small>}
              </button>
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className="credit-card"
            onClick={() => {
              navigate('settings', { tab: 'Billing preview' });
            }}
          >
            <div className="row between">
              <span>Prototype workspace</span>
              <ArrowUpRight size={14} />
            </div>
            <div className="credit-meter">
              <i />
            </div>
            <small>
              {demo ? 'Explore all flows · Local demo' : 'Free model routing · Usage limits apply'}
            </small>
          </button>
          <div className="rail-bottom-actions">
            <button aria-label="Appearance" onClick={() => setModal('appearance')}>
              <Palette size={17} />
            </button>
            <button aria-label="Help and resources" onClick={() => navigate('help')}>
              <LifeBuoy size={17} />
            </button>
            <button aria-label="Workspace settings" onClick={() => navigate('settings')}>
              <Settings size={17} />
            </button>
          </div>
          <button className="profile-button" onClick={() => setModal('profile')}>
            <span className="avatar">
              <Avatar url={session?.avatarUrl} name={displayName} />
            </span>
            <span>
              <strong>{displayName}</strong>
              <small>{displayRole} workspace</small>
            </span>
            <ChevronDown size={14} />
          </button>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <div className="main-shell">
        <header className="topbar">
          <div className="row">
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={19} />
            </button>
            <span className="breadcrumb">
              Workspace <span>/</span> <strong>{title}</strong>
            </span>
          </div>
          <div className="topbar-actions">
            <span className={'save-indicator ' + (saveError ? 'error' : '')}>
              <i />
              {sync}
            </span>
            <button
              className="mode-toggle"
              aria-label={
                appearance.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
              onClick={() =>
                changeAppearance({
                  ...appearance,
                  mode: appearance.mode === 'dark' ? 'light' : 'dark',
                })
              }
            >
              {appearance.mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{appearance.mode === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <button className="edition-button" onClick={() => setModal('versions')}>
              Architect {EDITION}.0 <ChevronDown size={12} />
            </button>
            <button
              className="icon-button"
              aria-label="Open inbox"
              onClick={() => navigate('inbox')}
            >
              <Bell size={17} />
              <i className="notification-dot" />
            </button>
            <button
              className="avatar"
              aria-label="Your profile"
              onClick={() => setModal('profile')}
            >
              <Avatar url={session?.avatarUrl} name={displayName} />
            </button>
          </div>
        </header>
        {demo && (
          <div className="demo-banner">
            <span>
              <span className="live-dot" />
              Interactive demo · Projects stay in this browser. Sign in for cloud saving and AI.
            </span>
            <button
              onClick={() => {
                setDemo(false);
                setReady(false);
              }}
            >
              Sign in <ArrowUpRight size={13} />
            </button>
          </div>
        )}
        {company && (
          <div className="company-context-banner">
            <span>
              <Building2 size={13} /> {company.name} · {roleLabels[company.role]} ·{' '}
              {company.canWrite ? 'Collaborative workspace' : 'Read-only access'}
            </span>
            <button className="text-button" onClick={() => setModal('company-access')}>
              Members & access
            </button>
            <button className="text-button" onClick={() => void changeCompany(null)}>
              Personal workspace
            </button>
          </div>
        )}
        {saveError && (
          <div className="error-banner" role="alert">
            {saveError}
            <button onClick={() => location.reload()}>Reload saved account data</button>
            <button
              onClick={() =>
                download('architect-unsaved-work.json', JSON.stringify(store, null, 2))
              }
            >
              Export unsaved work
            </button>
            <button onClick={() => setModal('logout-unsaved')}>Sign out options</button>
          </div>
        )}
        {project && !['today', 'projects', 'settings', 'help'].includes(view) && (
          <div className="project-context">
            <button className="context-project" onClick={() => setModal('project-switch')}>
              <span className="project-glyph">
                <Layers3 size={15} />
              </span>
              {project.title}
              <ChevronDown size={12} />
            </button>
            <nav aria-label="Project journey">
              {[
                ['plan', 'Plan'],
                ['studio', 'Build'],
                ['qa', 'Test'],
                ['release', 'Release'],
                ['ops', 'Observe'],
              ].map(([id, label], i) => (
                <button
                  key={id}
                  aria-current={view === id ? 'step' : undefined}
                  className={view === id ? 'active' : ''}
                  onClick={() => navigate(id)}
                >
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {label}
                </button>
              ))}
            </nav>
            <span className="context-revision">
              v{project.revision} · {project.stage}
            </span>
          </div>
        )}
        <main
          id="main"
          tabIndex={-1}
          className={view === 'studio' ? 'main-content studio-main' : 'main-content'}
        >
          {view === 'company-access' ? (
            <CompanyAccess
              userEmail={session?.email}
              initialCompanyId={company?.id}
              onSelect={(c) => void changeCompany(c)}
            />
          ) : EDITION >= 3 && companyAreas.includes(view) ? (
            <CompanyStudio
              actor={{ id: session?.id || 'demo', name: displayName }}
              workspaceName={displayWorkspace}
              canManage={demo || (!company && !!session) || !!company?.canManage}
              navigationContext={navigationContext}
              readOnly={company?.canWrite === false}
              area={view}
              store={store}
              onChange={(next) => {
                if (company?.canWrite === false) {
                  notify('Your Viewer membership is read-only.');
                  return;
                }
                setStore(next);
              }}
              onNavigate={navigate}
              notify={notify}
              demo={demo}
              role={company ? roleLabels[company.role] : store.profile?.role || 'Product manager'}
            />
          ) : EDITION === 4 && privateAreas.includes(view) ? (
            <InfrastructureStudio
              readOnly={company?.canWrite === false}
              area={view}
              store={store}
              onChange={(next) => {
                if (company?.canWrite === false) {
                  notify('Your Viewer membership is read-only.');
                  return;
                }
                setStore(next);
              }}
              onNavigate={navigate}
              notify={notify}
            />
          ) : view === 'today' ? (
            <>
              <div className="home-greeting">
                <div>
                  <div className="eyebrow">Your space to make things happen</div>
                  <h1>
                    {['QA reviewer', 'QA engineer'].includes(displayRole)
                      ? 'Every detail matters.'
                      : displayRole === 'Developer'
                        ? 'Good ideas deserve good code.'
                        : 'A little focus. A lot of possibility.'}
                  </h1>
                  <p>
                    Welcome back, {displayName.split(' ')[0] || 'builder'}. Where will you take your
                    next idea?
                  </p>
                </div>
                <div className="date-stamp">
                  <span>
                    {new Date().toLocaleDateString('en', { month: 'short', year: 'numeric' })}
                  </span>
                  <strong>{new Date().getDate()}</strong>
                </div>
              </div>
              <div className="home-grid">
                <section className="hero-card">
                  <Contours />
                  <div className="hero-copy">
                    <span className="eyebrow">FROM A THOUGHT TO SOMETHING REAL</span>
                    <h2>
                      What would you
                      <br />
                      love to build?
                    </h2>
                    <p>
                      An idea, a rough sketch, a problem worth solving.
                      <br />
                      Start anywhere. We’ll find the next step together.
                    </p>
                  </div>
                  <form
                    className="home-composer"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (prompt.trim()) {
                        setNewTitle('');
                        setModal('new');
                      }
                    }}
                  >
                    <textarea
                      aria-label="Describe your app"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Build a customer support app with a ticket inbox…"
                    />
                    <div className="row between">
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => {
                          setNewKind('import');
                          setModal('new');
                        }}
                      >
                        <Plus size={15} />
                        Import a project
                      </button>
                      <button
                        className="send"
                        aria-label="Start building"
                        disabled={!prompt.trim()}
                      >
                        <ArrowUp size={20} />
                      </button>
                    </div>
                  </form>
                  <div className="suggestion-row">
                    {['Customer portal', 'Personal finance', 'Internal tool'].map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          setPrompt(
                            'Build a ' +
                              s.toLowerCase() +
                              ' app with a polished dashboard, searchable records, creation forms and useful empty states.',
                          )
                        }
                      >
                        {s}
                        <ArrowUpRight size={12} />
                      </button>
                    ))}
                  </div>
                </section>
                <aside className="companion">
                  <div className="row between">
                    <span className="eyebrow">A little direction</span>
                    <div className="agent-orb" />
                  </div>
                  <h2>
                    Your next step,
                    <br />
                    in perspective.
                  </h2>
                  <p>
                    {project ? (
                      <>
                        Your <strong>{project.title}</strong> is in {project.stage.toLowerCase()}.
                        Keep the requirements, implementation and evidence connected.
                      </>
                    ) : (
                      'Start a project from a prompt or bring an existing idea. Your work follows you from plan to release.'
                    )}
                  </p>
                  <div className="companion-note">
                    <span className="tiny">SUGGESTED NEXT STEP</span>
                    <h3>
                      {project?.built
                        ? 'Put your app to the test.'
                        : 'Turn the plan into a first version.'}
                    </h3>
                    <p>
                      {project?.built
                        ? 'Open Test Lab to review acceptance criteria and simulate a quality run.'
                        : 'Open Build Studio. Your prompt stays beside the preview at every step.'}
                    </p>
                    <button
                      className="button"
                      onClick={() =>
                        project ? navigate(project.built ? 'qa' : 'studio') : setModal('new')
                      }
                    >
                      {project?.built ? 'Open Test Lab' : 'Open Build Studio'}
                      <ArrowUpRight size={15} />
                    </button>
                  </div>
                  <div className="small-proof">
                    <ShieldCheck size={16} />
                    <span>
                      You choose the direction.
                      <br />
                      Review before anything ships.
                    </span>
                  </div>
                </aside>
              </div>
              <div className="section-heading">
                <h2>Pick up where you left off.</h2>
                <button className="text-button" onClick={() => navigate('projects')}>
                  All projects <ArrowUpRight size={15} />
                </button>
              </div>
              <div className="project-grid">
                {store.projects.slice(0, 3).map((p, i) => (
                  <ProjectCard
                    key={p.id}
                    p={p}
                    index={i}
                    onOpen={() => selectProject(p.id)}
                    onMenu={() => {
                      setStore((s) => ({ ...s, activeProject: p.id }));
                      setModal('project-menu');
                    }}
                  />
                ))}
                <button className="new-project-card" onClick={() => setModal('new')}>
                  <span>
                    <Plus size={24} />
                  </span>
                  <strong>Room for your next idea.</strong>
                  <small>Create a new project</small>
                </button>
              </div>
              <div className="home-footer">
                <span>Made for builders. Designed around you.</span>
                <button onClick={() => setModal('appearance')}>
                  Make this space yours <Palette size={14} />
                </button>
              </div>
            </>
          ) : view === 'projects' ? (
            <>
              <PageTitle
                eyebrow="Your collection"
                title="Everything you’re bringing to life."
                description="Every project carries its plans, code, agents and decisions with it."
              >
                <button className="button primary" onClick={() => setModal('new')}>
                  <Plus size={16} />
                  New project
                </button>
              </PageTitle>
              <div className="project-filters">
                <Search size={17} />
                <input
                  aria-label="Search projects"
                  placeholder="Find a project…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  aria-label="Filter projects"
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                >
                  {[
                    'All',
                    'Ready to build',
                    'Built',
                    'Reviewed',
                    'Deployment drafts',
                    'Sharing drafts',
                  ].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
                <span>{store.projects.length} projects</span>
              </div>
              <div className="project-grid">
                {store.projects
                  .filter(
                    (p) =>
                      (p.title + ' ' + p.brief).toLowerCase().includes(search.toLowerCase()) &&
                      (projectFilter === 'All' ||
                        (projectFilter === 'Ready to build' && !p.built) ||
                        (projectFilter === 'Built' && p.built) ||
                        (projectFilter === 'Reviewed' && p.reviewed) ||
                        (projectFilter === 'Deployment drafts' &&
                          (!!(p.workflow?.experiences as { releases?: unknown[] } | undefined)
                            ?.releases?.length ||
                            (!!p.workflow?.releaseStage &&
                              p.workflow?.releaseStage !== 'Not deployed'))) ||
                        (projectFilter === 'Sharing drafts' &&
                          Array.isArray(p.workflow?.records) &&
                          p.workflow.records.some((r: any) => r.id === 'ORG-E3'))),
                  )
                  .map((p, i) => (
                    <ProjectCard
                      key={p.id}
                      p={p}
                      index={i}
                      onOpen={() => selectProject(p.id)}
                      onMenu={() => {
                        setStore((s) => ({ ...s, activeProject: p.id }));
                        setModal('project-menu');
                      }}
                    />
                  ))}
              </div>
              {!store.projects.length && (
                <div className="empty">
                  <h2>A blank canvas, full of possibility.</h2>
                  <p>Start with a prompt, a template, or a repository reference.</p>
                  <button className="button primary" onClick={() => setModal('new')}>
                    Create your first project
                  </button>
                </div>
              )}
            </>
          ) : view === 'studio' ? (
            project ? (
              <Studio
                readOnly={company?.canWrite === false}
                navigationContext={navigationContext}
                key={project.id}
                project={project}
                onUpdate={patch}
                onPlan={(document) => navigate('plan', { document, tab: 'Overview' })}
                onReview={() => navigate('qa')}
                notify={notify}
                demo={demo}
                accessToken={getAccessToken() || undefined}
              />
            ) : (
              <NoProject onCreate={() => setModal('new')} />
            )
          ) : view === 'help' ? (
            <>
              <PageTitle
                eyebrow="A little guidance"
                title="Find your way. Keep your momentum."
                description="Every surface is connected to the same project. There’s no need to return home between steps."
              />
              <div className="grid-two">
                {[
                  [
                    'Your first app',
                    'Describe an idea → edit the plan → build → review → release.',
                    'studio',
                  ],
                  [
                    'Bring your code',
                    'Import a repository reference, check its branch and map connected services.',
                    'code',
                  ],
                  [
                    'Build with agents',
                    'Shape your app’s agent team, tools, memory and model preferences.',
                    'agents',
                  ],
                  [
                    'Understand this prototype',
                    'AI generation and account storage connect to real services. External deployment, billing, integrations and execution flows are marked as prototypes.',
                    'settings',
                  ],
                ].map(([t, d, v]) => (
                  <button className="panel help-card" key={t} onClick={() => navigate(v)}>
                    <BookOpen size={23} />
                    <h2>{t}</h2>
                    <p>{d}</p>
                    <ArrowUpRight size={17} />
                  </button>
                ))}
              </div>
            </>
          ) : view === 'inbox' ? (
            <>
              <PageTitle
                eyebrow="Your decisions"
                title="The next move is yours."
                description="Review requests in their original project context."
              />
              {project ? (
                <div className="panel">
                  {[
                    [
                      'Plan review',
                      'Check assumptions and acceptance criteria before building.',
                      'plan',
                    ],
                    ['Quality review', 'Review test evidence against this revision.', 'qa'],
                    [
                      'Release readiness',
                      'Confirm ownership, hosting and release gates.',
                      'release',
                    ],
                  ].map(([t, d, v], i) => (
                    <button className="inbox-row" key={t} onClick={() => navigate(v)}>
                      <span className="queue-number">0{i + 1}</span>
                      <span>
                        <strong>{t}</strong>
                        <small>
                          {project.title} · {d}
                        </small>
                      </span>
                      <ArrowUpRight size={17} />
                    </button>
                  ))}
                </div>
              ) : (
                <NoProject onCreate={() => setModal('new')} />
              )}
            </>
          ) : (
            <>
              {view === 'settings' && (
                <div className="settings-shortcuts">
                  <button className="button" onClick={() => setModal('profile')}>
                    Profile & account
                  </button>
                  <button className="button" onClick={() => setModal('appearance')}>
                    <Palette size={15} />
                    Appearance
                  </button>
                  <button className="button" onClick={() => setModal('workspace')}>
                    Workspace & role
                  </button>
                  <button
                    className="button"
                    onClick={() => navigate('settings', { tab: 'Billing preview' })}
                  >
                    Credits & billing
                  </button>
                </div>
              )}
              {view === 'settings' && (
                <AccountCenter
                  initialTab={navigationContext.tab}
                  account={session?.id || 'demo'}
                  demo={demo}
                  canManage={!company || company.canManage}
                  onNavigate={navigate}
                />
              )}
              <Workbench
                readOnly={company?.canWrite === false}
                navigationContext={navigationContext}
                key={(project?.id || 'none') + view}
                area={view === 'buildflows' ? 'studio' : view}
                demo={demo}
                project={project}
                onUpdate={patch}
                onNavigate={navigate}
                notify={notify}
              />
            </>
          )}
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
          <button aria-label="Dismiss notification" onClick={() => setToast('')}>
            <X size={14} />
          </button>
        </div>
      )}
      {modal === 'appearance' && (
        <Appearance
          store={{ ...store, ...appearance }}
          onClose={() => setModal('')}
          onSave={(v) => {
            changeAppearance(v);
            setModal('');
            notify('Appearance saved. Make yourself at home.');
          }}
        />
      )}
      {modal === 'new' && (
        <Modal title="Give your next idea a place." onClose={() => setModal('')} wide>
          <div className="segmented">
            {[
              ['prompt', 'Start with a prompt'],
              ['template', 'Use a template'],
              ['import', 'Import project'],
            ].map(([v, l]) => (
              <button key={v} aria-pressed={newKind === v} onClick={() => setNewKind(v)}>
                {l}
              </button>
            ))}
          </div>
          <form onSubmit={create}>
            {newKind === 'template' && (
              <div className="template-grid">
                {[
                  'Support desk',
                  'Customer portal',
                  'Research assistant',
                  'Analytics dashboard',
                  'Team tasks',
                  'Booking app',
                ].map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => {
                      setNewTitle(t);
                      setPrompt(
                        'Build a ' +
                          t.toLowerCase() +
                          ' with searchable records, a creation form, clear status and responsive dashboard.',
                      );
                    }}
                  >
                    <Layers3 size={18} />
                    {t}
                  </button>
                ))}
              </div>
            )}
            <label>
              Project name
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Something worth making"
                maxLength={80}
              />
            </label>
            <label>
              What should it do?
              <textarea
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                placeholder="Describe who it’s for, the problem it solves and what matters most."
                maxLength={12000}
              />
            </label>
            {newKind === 'import' && (
              <>
                <label>
                  GitHub repository URL
                  <input
                    type="url"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    placeholder="https://github.com/your-team/project"
                    pattern="https://github\.com/.+"
                  />
                </label>
                <p className="notice">
                  Prototype import: saves the repository reference and opens the connection
                  workflow. Source code is not fetched until a GitHub runtime connection is
                  configured.
                </p>
              </>
            )}
            <div className="notice subtle">
              <FileText size={17} />
              <span>
                We’ll attach editable PRD and technical-plan drafts. You can start building
                immediately and refine them as you go.
              </span>
            </div>
            <div className="modal-footer">
              <button type="button" className="button" onClick={() => setModal('')}>
                Cancel
              </button>
              <button className="button primary" disabled={company?.canWrite === false}>
                Create & open builder <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === 'search' && (
        <Modal title="Where would you like to go?" onClose={() => setModal('')}>
          <input
            autoFocus
            aria-label="Search workspace"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or projects…"
          />
          <div className="search-results">
            {areas
              .filter(([, n]) => n.toLowerCase().includes(search.toLowerCase()))
              .map(([id, n, I]) => (
                <button
                  key={id}
                  onClick={() => {
                    navigate(id);
                    setModal('');
                    setSearch('');
                  }}
                >
                  <I size={17} />
                  {n}
                  <ArrowUpRight size={14} />
                </button>
              ))}
            {store.projects
              .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
              .map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    selectProject(p.id);
                    setModal('');
                    setSearch('');
                  }}
                >
                  <FolderKanban size={17} />
                  {p.title}
                  <small>Project</small>
                </button>
              ))}
          </div>
        </Modal>
      )}
      {modal === 'project-switch' && (
        <Modal title="Keep your work in context." onClose={() => setModal('')}>
          {store.projects.map((p) => (
            <button
              className="project-switch-row"
              key={p.id}
              onClick={() => {
                selectProject(p.id, view);
                setModal('');
              }}
            >
              <Layers3 size={17} />
              {p.title}
              {p.id === store.activeProject && <Check size={16} />}
            </button>
          ))}
        </Modal>
      )}
      {modal === 'project-menu' && project && (
        <Modal title={project.title} onClose={() => setModal('')}>
          <label>
            Project name
            <input
              value={project.title}
              maxLength={80}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </label>
          <div className="action-stack">
            <button
              className="button"
              disabled={company?.canWrite === false}
              onClick={() => {
                if (!writable()) return;
                const copy = {
                  ...structuredClone(project),
                  id: uid(),
                  title: project.title + ' copy',
                  createdAt: new Date().toISOString(),
                };
                setStore((s) => addProject(s, copy));
                setModal('');
                notify('Project duplicated.');
              }}
            >
              <Copy size={16} />
              Duplicate project
            </button>
            <button
              className="button"
              onClick={() =>
                download(
                  project.title.replace(/[^a-z0-9]/gi, '-') + '.json',
                  JSON.stringify(project, null, 2),
                  'application/json',
                )
              }
            >
              <Download size={16} />
              Export project & context
            </button>
            <button
              className="button danger"
              disabled={company?.canWrite === false}
              onClick={() => {
                if (!writable()) return;
                setActiveDelete(project.id);
                setModal('delete');
              }}
            >
              <Trash2 size={16} />
              Delete project
            </button>
          </div>
        </Modal>
      )}
      {modal === 'delete' && (
        <Modal title="Delete this project?" onClose={() => setModal('')}>
          <p>
            This removes this project and its saved plans and conversations from this workspace.
            Export a copy first if you need it.
          </p>
          <div className="modal-footer">
            <button className="button" onClick={() => setModal('')}>
              Keep project
            </button>
            <button
              className="button danger"
              onClick={() => {
                if (!writable()) return;
                setStore((s) => ({
                  ...s,
                  projects: s.projects.filter((p) => p.id !== activeDelete),
                  activeProject: s.projects.find((p) => p.id !== activeDelete)?.id || null,
                }));
                setModal('');
                navigate('projects');
                notify('Project removed.');
              }}
            >
              Delete project
            </button>
          </div>
        </Modal>
      )}
      {modal === 'versions' && (
        <Modal title="One project. Three perspectives." onClose={() => setModal('')}>
          <p>
            Use the same account across versions. Your cloud projects and company membership are
            shared. Each URL signs in separately for security.
          </p>
          {[
            [2, 'Build, test and ship'],
            [3, 'Your company, connected'],
            [4, 'Your infrastructure, your control'],
          ].map(([v, t]) => (
            <a
              className="edition-link"
              key={v}
              href={versionHref(Number(v))}
              onClick={(e) => {
                e.preventDefault();
                void openEdition(Number(v));
              }}
            >
              <b>Architect {v}.0</b>
              <p>{t}</p>
              <small>{Number(v) === EDITION ? 'Current edition' : 'Open edition →'}</small>
            </a>
          ))}
          <a className="button" href={ASSIGNMENT_URL}>
            Explore the assignment & evidence
          </a>
        </Modal>
      )}
      {modal === 'company-access' && (
        <Modal
          title={EDITION >= 3 ? 'Your company workspace' : 'Choose your workspace'}
          onClose={() => setModal('')}
          wide
        >
          {demo ? (
            <>
              <p>
                Demo mode shows company and role flows without creating real accounts. Sign in to
                create an organization or accept an administrator’s invitation.
              </p>
              <button
                className="button primary"
                onClick={() => {
                  setDemo(false);
                  setReady(false);
                  setModal('');
                }}
              >
                Sign in for company access
              </button>
              {EDITION >= 3 && (
                <button
                  className="button"
                  onClick={() => {
                    setModal('');
                    navigate('company');
                  }}
                >
                  Explore company demo
                </button>
              )}
            </>
          ) : (
            <CompanyAccess
              userEmail={session?.email}
              initialCompanyId={company?.id}
              onSelect={(c) => void changeCompany(c)}
            />
          )}
        </Modal>
      )}
      {modal === 'credits' && (
        <Modal title="Know where every run goes." onClose={() => setModal('')}>
          <div className="balance-display">
            <span className="eyebrow">Current plan</span>
            <strong>Free prototype</strong>
            <p>OpenRouter-funded inference · Free models only</p>
          </div>
          <p className="notice">
            No platform credit balance is invented. Model usage is reported after real calls;
            purchases and invoices are demonstration flows.
          </p>
          <div className="modal-footer">
            <button
              className="button"
              onClick={() => {
                setModal('');
                navigate('models');
              }}
            >
              Model & provider usage
            </button>
            <button
              className="button primary"
              onClick={() => {
                setModal('');
                navigate('settings', { tab: 'Billing preview' });
              }}
            >
              Explore billing flows <ArrowRight size={16} />
            </button>
          </div>
        </Modal>
      )}
      {modal === 'logout-unsaved' && (
        <Modal title="Protect your latest work." onClose={() => setModal('')}>
          <p>
            Your latest changes have not reached the cloud. Export them before signing out. The
            account’s previously saved version will remain.
          </p>
          <div className="modal-footer">
            <button
              className="button"
              onClick={() =>
                download('architect-unsaved-work.json', JSON.stringify(store, null, 2))
              }
            >
              Export unsaved work
            </button>
            <button className="button" onClick={() => setModal('')}>
              Keep working
            </button>
            <button className="button danger" onClick={() => void logout(true)}>
              Discard unsaved changes & sign out
            </button>
          </div>
        </Modal>
      )}
      {(modal === 'profile' || modal === 'workspace' || modal === 'onboard') && (
        <Modal
          title={
            modal === 'onboard'
              ? 'Make room for your best work.'
              : modal === 'workspace'
                ? 'Your workspace. Your perspective.'
                : 'Your profile & account.'
          }
          onClose={() => {
            if (modal !== 'onboard') setModal('');
          }}
          wide={modal === 'onboard'}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (company) {
                setModal('');
                return;
              }
              if (modal === 'onboard') changeAppearance({ ...appearance, theme: setupTheme });
              setStore((s) => ({
                ...s,
                theme: modal === 'onboard' ? setupTheme : s.theme,
                profile: {
                  name: profileName.trim() || s.profile?.name || session?.name || 'Builder',
                  workspace: workspaceName.trim() || s.profile?.workspace || 'My workspace',
                  kind: 'personal',
                  role,
                },
              }));
              setModal('');
              if (EDITION >= 3) navigate('company');
              else if (project)
                navigate(
                  role === 'Developer'
                    ? 'code'
                    : role === 'QA reviewer'
                      ? 'qa'
                      : role === 'Designer'
                        ? 'studio'
                        : 'today',
                );
              else navigate('today');
              notify('Workspace preferences saved.');
            }}
          >
            <label>
              Your name
              <input
                readOnly={!!company}
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                maxLength={60}
              />
            </label>
            <label>
              Workspace name
              <input
                readOnly={!!company}
                required
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                maxLength={80}
              />
            </label>
            <label>
              Your perspective
              <select disabled={!!company} value={role} onChange={(e) => setRole(e.target.value)}>
                {company && <option value={displayRole}>{displayRole}</option>}
                {(EDITION >= 3
                  ? [
                      'Product manager',
                      'Developer',
                      'QA reviewer',
                      'Designer',
                      'Sales',
                      'Customer experience',
                      'Finance',
                      'People & HR',
                      'Marketing',
                      'DevOps',
                      'Executive',
                    ]
                  : ['Builder', 'Developer', 'QA reviewer', 'Designer']
                ).map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <p className="muted tiny">
              {company
                ? 'Your identity comes from your signed-in account. Your company administrator manages this role. Switch to your personal workspace to edit personal preferences.'
                : 'Changes your starting view and guidance. Permissions are managed separately.'}
            </p>
            {modal === 'onboard' && <ThemeOptions theme={setupTheme} onChange={setSetupTheme} />}
            <div className="modal-footer">
              {modal !== 'onboard' && (
                <button type="button" className="button" onClick={() => void logout()}>
                  <LogOut size={15} />
                  {demo ? 'Exit demo' : 'Sign out'}
                </button>
              )}
              <button className="button primary">
                {company ? 'Done' : modal === 'onboard' ? 'Enter workspace' : 'Save changes'}
                <Check size={15} />
              </button>
            </div>
          </form>
          <p className="tiny muted">{session?.email || 'Demo profile · No account created'}</p>
        </Modal>
      )}
    </div>
  );
}
function NoProject({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="empty">
      <div className="empty-mark">
        <Layers3 size={28} />
      </div>
      <h2>Your next idea starts here.</h2>
      <p>Create a project to connect your prompt, plan, code and agents.</p>
      <button className="button primary" onClick={onCreate}>
        <Plus size={16} />
        Create project
      </button>
    </div>
  );
}
function ProjectCard({
  p,
  index,
  onOpen,
  onMenu,
}: {
  p: Project;
  index: number;
  onOpen: () => void;
  onMenu: () => void;
}) {
  return (
    <article className={'project-card art-' + (index % 3)}>
      <button className="project-art" aria-label={'Open ' + p.title} onClick={onOpen}>
        <div className="project-art-grid" />
        <div className="project-art-window">
          <div className="window-dots">
            <i />
            <i />
            <i />
          </div>
          <div className="window-content">
            <div className="window-side" />
            <div className="window-lines">
              <i />
              <i />
              <div>
                <span />
                <span />
                <span />
              </div>
              <i />
            </div>
          </div>
        </div>
        <span className="project-art-badge">
          {p.repo ? <GitBranch size={12} /> : <Layers3 size={12} />}{' '}
          {p.built ? 'Interactive preview' : 'Ready to build'}
        </span>
      </button>
      <div className="project-card-info">
        <button onClick={onOpen}>
          <h3>{p.title || 'Untitled project'}</h3>
          <span>
            {p.stage} <i>·</i> Updated{' '}
            {new Date(p.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </span>
        </button>
        <button className="icon-button" aria-label={'Manage ' + p.title} onClick={onMenu}>
          ···
        </button>
      </div>
    </article>
  );
}
