"""Import the supplied Korean CSV and English artwork; run from any directory.
No clinical text is synthesized. IDs/concern tags are editorial navigation metadata.
"""
import csv
import hashlib
import json
from pathlib import Path
import re
import subprocess
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT.parent / 'data'
# source name | stable id | artwork stem | artwork focal point
MAPPING = '''써마지|tx_thermage|쎄마지|0%
울쎄라 프라임|tx_ulthera|울쎄라|100%
엠페이스|tx_emface|엠페이스|100%
올타이트|tx_oltight|올타이트|100%
덴서티|tx_density|덴서티|100%
슈링크|tx_shurink|슈링크유니버스|100%
인모드|tx_inmode|인모드|100%
포텐자|tx_pore_lift|포텐자|100%
큐어젯|tx_curejet|큐어젯|100%
시크릿 레이저|tx_secret_rf|시크릿레이저|0%
약물 전달기기|tx_delivery|약물전달기기|100%
MTS|tx_mts|MTS|100%
셀르디엠|tx_cellredm|셀르디엠|100%
엘라비에 리투오|tx_elravie|엘라비에|100%
리쥬란|tx_rejuran|리쥬란|0%
스킨바이브|tx_skinvive|스킨바이브|100%
올리디아 스킨|tx_olidia|올리디아|100%
쥬베룩|tx_juvelook|쥬베룩|100%
연어주사|tx_salmon|연어주사|100%
릴리이드M|tx_lilied|릴리아드|100%
더모톡신|tx_skin_botox|더모톡신|100%
턱보톡스|tx_jaw_botox|턱보톡스|0%
주름보톡스|tx_wrinkle_botox|주름보톡스|0%
입꼬리보톡스|tx_mouth_botox|입꼬리보톡스|100%
측두근보톡스|tx_temporal_botox|측두근보톡스|100%
귀밑샘보톡스|tx_parotid_botox|귀밑샘보톡스|100%
타이트닝|tx_tightening|타이트닝|100%
윤곽주사|tx_contour|윤곽주사|100%
피코 레이저|tx_toning|피코레이저|80%
카프리 레이저|tx_capri|카프리레이저|100%'''

# Focal points checked against the artwork. Keep headline-only artwork intact.
FOCAL = {
    'tx_oltight': ('0% 50%', 1.05), 'tx_density': ('25% 50%', 1.15),
    'tx_mts': ('0% 50%', 1.1), 'tx_skinvive': ('0% 50%', 1.1),
    'tx_temporal_botox': ('0% 50%', 1.15), 'tx_parotid_botox': ('0% 50%', 1.2),
    'tx_contour': ('0% 50%', 1.15), 'tx_salmon': ('0% 50%', 1.15),
    'tx_cellredm': ('76% 50%', 1.15), 'tx_delivery': ('100% 50%', 1.35),
    'tx_secret_rf': ('0% 50%', 1.3), 'tx_jaw_botox': ('0% 50%', 1.25),
    'tx_capri': ('100% 50%', 1.35), 'tx_ulthera': ('100% 50%', 1.1),
    'tx_shurink': ('100% 50%', 1.16),
}

def lines(value):
    return [line.strip().lstrip('• ').strip() for line in value.splitlines()
            if line.strip() and not re.fullmatch(r'[-—–\s]+', line)]

def packages(value):
    result = []
    for part in re.split(r'^\s*\+\s*$', value, flags=re.M):
        if not part.strip(): continue
        amounts = [int(x.replace(',', '')) for x in re.findall(r'₩([\d,]+)', part)]
        assert amounts, f'Unrecognized price: {part}'
        title, *body = lines(part)
        description = [x for x in body if '₩' not in x and 'VAT' not in x]
        result.append(dict(name=title, description='\n'.join(description),
                           price=amounts[-1], originalPrice=amounts[0] if len(amounts)>1 else None,
                           vatExcluded='VAT 별도' in part, raw=part.strip()))
    return result

def faqs(value):
    result = []
    for part in re.split(r'(?:^|\n)Q\.\s*', value):
        if not part.strip(): continue
        q, _, answer = part.strip().partition('\n')
        assert answer.strip(), q
        result.append(dict(question=q, answer=answer.strip()))
    return result

def main():
    source = next(p for p in DATA.glob('*.csv') if unicodedata.normalize('NFC', p.stem) == '시술설명')
    rows = list(csv.DictReader(source.open(encoding='utf-8-sig')))
    metadata = {row.split('|')[0]: row.split('|')[1:] for row in MAPPING.splitlines()}
    images = {unicodedata.normalize('NFC', p.stem): p for p in DATA.glob('*_eng.png')}
    research = json.loads((ROOT/'src/data/treatmentClassification.json').read_text())['treatments']
    output = []
    provenance = []
    image_dir = ROOT / 'public/images/treatments'
    image_dir.mkdir(parents=True, exist_ok=True)
    for row in rows:
        name = row['장비(시술)'].strip()
        id, stem, position = metadata[name]
        image = images[stem + '_eng']
        file = id.removeprefix('tx_') + '.jpg'
        target = image_dir / file
        if not target.exists() or image.stat().st_mtime > target.stat().st_mtime:
            subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '80', '-Z', '1600', str(image), '--out', str(target)], check=True, capture_output=True)
        output.append(dict(id=id, name=name, category=row['카테고리'].strip(),
            effects=row['효과'].strip(), overview=row['시술 안내'].strip(),
            advantages=lines(row['장점']), recommendedFor=lines(row['이런 분께 추천']),
            packages=packages(row['가격']), faqs=faqs(row['FAQ']), cautions=lines(row['주의사항']),
            targets=research[id]['matchTargets'], image=file, position=FOCAL.get(id, (position+' 50%', 1))[0],
            scale=FOCAL.get(id, ('', 1))[1], fit='contain' if id == 'tx_mouth_botox' else 'cover', raw=row))
        provenance.append(dict(id=id, source=str(image.relative_to(ROOT.parent)), output=file))
    assert len(output)==30 and len({r['id'] for r in output})==30
    payload = dict(source=source.name, sha256=hashlib.sha256(source.read_bytes()).hexdigest(), language='ko', treatments=output)
    (ROOT/'src/data/treatments.generated.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2)+'\n')
    (image_dir/'sources.json').write_text(json.dumps(provenance, ensure_ascii=False, indent=2)+'\n')
    print(f"Imported {len(output)} treatments, {sum(len(t['packages']) for t in output)} packages, {sum(len(t['faqs']) for t in output)} FAQs, {len(provenance)} images.")

if __name__=='__main__': main()
