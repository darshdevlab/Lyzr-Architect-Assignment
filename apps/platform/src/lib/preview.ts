/** Preview isolation is enforced by the iframe sandbox and the restrictive CSP.
 * Generated HTML is deliberately kept separate from editor instrumentation. */
export interface ElementSelection {
  selector: string;
  tag: string;
  text: string;
}
export const PREVIEW_CSP =
  "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src 'none'; connect-src 'none'; frame-src 'none'; object-src 'none'; media-src data: blob:; base-uri 'none'; form-action 'none'";
export function extractHTML(text: string): string {
  const fenced = text.match(/```(?:html)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] || text).trim();
  const start = candidate.search(/<!doctype\s+html|<html[\s>]/i);
  if (start < 0)
    throw new Error(
      'The model did not return a complete HTML application. Try again with a more specific prompt.',
    );
  const html = candidate.slice(start);
  if (!/<\/html\s*>/i.test(html))
    throw new Error('The generated application was incomplete. Try a smaller first version.');
  if (html.length > 500_000)
    throw new Error('The generated application is too large for this prototype preview.');
  return html.slice(0, html.search(/<\/html\s*>/i) + html.match(/<\/html\s*>/i)![0].length);
}
export function isPreviewSelection(
  event: { source: unknown; data: unknown },
  source: unknown,
  token: string,
): event is {
  source: unknown;
  data: { type: 'architect:select'; token: string; selection: ElementSelection };
} {
  if (!source || event.source !== source || !event.data || typeof event.data !== 'object')
    return false;
  const d = event.data as Record<string, unknown>,
    s = d.selection as Record<string, unknown> | undefined;
  return (
    d.type === 'architect:select' &&
    d.token === token &&
    !!s &&
    typeof s.selector === 'string' &&
    s.selector.length > 0 &&
    s.selector.length <= 500 &&
    typeof s.tag === 'string' &&
    s.tag.length <= 40 &&
    typeof s.text === 'string' &&
    s.text.length <= 500
  );
}
export function previewDocument(html: string, selecting: boolean, token: string): string {
  // Place our policy before generated content; multiple policies only restrict further.
  const guard = `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}"><meta name="referrer" content="no-referrer">`;
  const inspector = `<script data-architect-inspector>(()=>{let selecting=${JSON.stringify(selecting)};const token=${JSON.stringify(token).replace(/</g, '\\u003c')};let previous=null;window.addEventListener('message',e=>{if(e.source===parent&&e.data&&e.data.type==='architect:selection-mode'&&e.data.token===token){selecting=e.data.enabled===true;if(previous)previous.style.outline='';}});function path(el){const parts=[];while(el&&el!==document.body&&parts.length<30){const tag=el.tagName.toLowerCase();const siblings=el.parentElement?[...el.parentElement.children].filter(n=>n.tagName===el.tagName):[];parts.unshift(tag+(siblings.length>1?':nth-of-type('+(siblings.indexOf(el)+1)+')':''));el=el.parentElement;}return parts.length?'body > '+parts.join(' > '):'body'}document.addEventListener('click',e=>{const el=e.target instanceof Element?e.target:null;if(!el)return;if(selecting){e.preventDefault();e.stopImmediatePropagation();parent.postMessage({type:'architect:select',token,selection:{selector:path(el).slice(0,500),tag:el.tagName.toLowerCase().slice(0,40),text:(el.textContent||'').trim().slice(0,500)}},'*')}else{const a=el.closest('a');if(a&&a.getAttribute('href')&&!a.getAttribute('href').startsWith('#'))e.preventDefault()}},true);document.addEventListener('mouseover',e=>{if(!selecting)return;if(previous)previous.style.outline='';previous=e.target;if(previous&&previous.style)previous.style.outline='2px solid #db6f4c'});})();<\/script>`;
  // A leading policy is parsed into the implicit head even if a generated document
  // places executable content before its own head. Keep it ahead of all model output.
  const body = '<!doctype html>' + guard + html.replace(/^<!doctype[^>]*>\s*/i, '');
  return /<\/body\s*>/i.test(body)
    ? body.replace(/<\/body\s*>/i, inspector + '</body>')
    : body.replace(/<\/html\s*>/i, inspector + '</html>');
}
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
export function demoHTML(title: string, brief: string, prompt: string): string {
  const kind = /support|ticket|helpdesk/i.test(brief + ' ' + prompt)
    ? 'support'
    : /inventory|stock|catalog/i.test(brief + ' ' + prompt)
      ? 'inventory'
      : 'tasks';
  const label = kind === 'support' ? 'ticket' : kind === 'inventory' ? 'item' : 'task';
  const labels =
    kind === 'support'
      ? ['Review onboarding issue', 'Answer account question', 'Investigate integration request']
      : kind === 'inventory'
        ? ['Studio notebook', 'Desk organizer', 'Travel bottle']
        : ['Define your first milestone', 'Share the plan with your team', 'Ship something useful'];
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>*{box-sizing:border-box}body{margin:0;background:#f7f7f2;color:#263c33;font:15px/1.5 system-ui}main{max-width:1000px;margin:auto;padding:32px}header{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #dce2d7;padding-bottom:20px}h1{font-size:clamp(26px,5vw,48px);line-height:1.1;letter-spacing:-1.5px}p,small{color:#617167}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.stat,section{background:white;border:1px solid #dce2d7;border-radius:16px;padding:22px}.stat b{display:block;font-size:28px}.stat span{font-size:12px}section{margin-top:22px}form{display:flex;gap:8px;margin:18px 0}input{min-width:0;flex:1;padding:12px;border:1px solid #ccd8cf;border-radius:8px;font:inherit}button{font:inherit;border:0;background:#346b56;color:white;border-radius:8px;padding:10px 14px;cursor:pointer}button:focus-visible,input:focus-visible{outline:3px solid #b67047;outline-offset:3px}.item{display:flex;align-items:center;gap:12px;border-top:1px solid #edf0e8;padding:14px 0}.item span{flex:1}.item.done span{text-decoration:line-through;color:#819087}.item button{background:#eff4ec;color:#355841;padding:5px 10px}footer{font-size:12px;margin-top:22px}@media(max-width:480px){main{padding:18px}.stats{gap:8px}.stat{padding:12px}form{flex-wrap:wrap}}</style></head><body><main><header><strong>${esc(title)}</strong><small>Interactive demo</small></header><h1>${kind === 'support' ? 'Every conversation, considered.' : kind === 'inventory' ? 'A clearer view of your inventory.' : 'A little more clarity. Every day.'}</h1><p>${esc(brief.slice(0, 160) || 'A focused workspace for your next idea.')}</p><div class="stats"><div class="stat"><b id="total">3</b><span>Total ${label}s</span></div><div class="stat"><b id="open">3</b><span>Open</span></div><div class="stat"><b id="done">0</b><span>Completed</span></div></div><section><strong>Your ${label}s</strong><form id="form"><input id="new" aria-label="New ${label}" placeholder="Add a ${label}…" maxlength="160" required><button>Add ${label}</button></form><input id="search" aria-label="Search ${label}s" placeholder="Search ${label}s…"><div id="items" aria-live="polite"></div></section><footer>Demo template · Changes last for this preview session · No external services connected</footer></main><script>const items=${JSON.stringify(labels).replace(/</g, '\\u003c')}.map((title,id)=>({id,title,done:false}));function render(){const root=document.getElementById('items');root.replaceChildren();const filtered=items.filter(t=>t.title.toLowerCase().includes(document.getElementById('search').value.toLowerCase()));if(!filtered.length)root.textContent='No ${label}s found. Add one above.';filtered.forEach(t=>{const row=document.createElement('div');row.className='item'+(t.done?' done':'');const check=document.createElement('button');check.textContent=t.done?'✓':'○';check.setAttribute('aria-label',(t.done?'Reopen ':'Complete ')+t.title);check.onclick=()=>{t.done=!t.done;render()};const title=document.createElement('span');title.textContent=t.title;const del=document.createElement('button');del.textContent='×';del.setAttribute('aria-label','Delete '+t.title);del.onclick=()=>{items.splice(items.indexOf(t),1);render()};row.append(check,title,del);root.append(row)});document.getElementById('total').textContent=items.length;document.getElementById('open').textContent=items.filter(t=>!t.done).length;document.getElementById('done').textContent=items.filter(t=>t.done).length}document.getElementById('form').onsubmit=e=>{e.preventDefault();const el=document.getElementById('new');if(!el.value.trim())return;items.push({id:Date.now(),title:el.value.trim(),done:false});el.value='';render()};document.getElementById('search').oninput=render;render();<\/script></body></html>`;
}
