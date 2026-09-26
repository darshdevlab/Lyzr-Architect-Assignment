"""Rebuild the reviewable feature/evidence manifest after adding real captures to config.json."""
import csv,json,pathlib
root=pathlib.Path(__file__).parent
data=json.loads((root/'data.json').read_text());config=json.loads((root/'config.json').read_text());rows=[]
for feature in data['features']:
 images=[(v,s) for v,edition in config['versions'].items() for s in edition['screenshots'] if feature['feature_id'] in s.get('featureIds',[])]
 rows.append({'feature_id':feature['feature_id'],'product':feature['product'],'feature':feature['feature'],'first_introduction':feature['primary_introduction'],'evidence_images':'; '.join(s['image'] for _,s in images),'pictured_editions':'; '.join(sorted(set(v for v,_ in images))),'pictured_stages':'; '.join(sorted(set(s.get('stage','representative screen') for _,s in images))),'evidence_status':'Prototype UI evidence only; external integration execution not implied' if images else 'No public feature-specific image linked; specification only'})
with (root/'FEATURE-EVIDENCE-MAP.csv').open('w') as file:
 writer=csv.DictWriter(file,fieldnames=rows[0]);writer.writeheader();writer.writerows(rows)
print(f'{sum(bool(r["evidence_images"]) for r in rows)} of {len(rows)} packages have representative screenshot evidence.')
