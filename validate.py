"""Verify content traceability and public asset references; no network or credentials."""
import json,pathlib,collections
root=pathlib.Path(__file__).parent
d=json.loads((root/'data.json').read_text());c=json.loads((root/'config.json').read_text())
ids={f['feature_id'] for f in d['features']}
assert len(ids)==len(d['features'])==109
assert len(d['baseline'])==422
assert len(d['handoffs'])==228
assert len(d['captureIndex'])==432
assert len(d['products'])==16
assert len(d['platforms'])==11
assert collections.Counter(f['primary_introduction'] for f in d['features'])=={'2.0':65,'3.0':42,'4.0':2}
assert collections.Counter(f['classification'] for f in d['features'])=={'Enhance':40,'New':69}
for f in d['features']:
 assert f['journey']['feature_id']==f['feature_id']
 for k in ['entry','primary_flow','outcome','recovery','actors']:assert f['journey'][k]
for h in d['handoffs']:assert h['from_feature'] in ids and h['to_feature'] in ids
for r in d['baseline']:assert r['parent_feature'] in ids
for s in d['screenshots']:assert (root/s['image']).is_file()
for p in d['platforms']:
 assert p['capture_count']==sum(s['platform']==p['key'] for s in d['captureIndex'])
for m in d['market']['platforms']:
 for key in m['positioning_sources']+m['metric_sources']:assert key in d['market']['sources']
for v,conf in c['versions'].items():
 for s in conf['screenshots']:assert (root/s['image']).is_file()
print('PASS: 109 unique packages, 422 mappings, 228 valid handoffs, 11 platform records, 432 capture metadata, public asset/source integrity.')
