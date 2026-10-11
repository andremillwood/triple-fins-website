"""Convert an authorized XLSX export into the private importer format (stdlib only).
Usage: python scripts/read-catalogue-workbook.py /private/source.xlsx /private/source.json
"""
import json
import re
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree as ET

repo = Path(__file__).resolve().parent.parent
source, target = map(lambda p: Path(p).resolve(), sys.argv[1:3])
if any(p.is_relative_to(repo) for p in (source, target)):
    raise ValueError('Keep source and output outside the repository')
ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(source) as archive:
    shared = []
    if 'xl/sharedStrings.xml' in archive.namelist():
        shared = [''.join(item.itertext()) for item in ET.fromstring(archive.read('xl/sharedStrings.xml'))]
    rels = {r.attrib['Id']: r.attrib['Target'] for r in ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))}
    sheets = {}
    for sheet in ET.fromstring(archive.read('xl/workbook.xml')).find('m:sheets', ns):
        name = sheet.attrib['name']
        if name not in ['Summary', 'Launch Range', 'Comparable Brand', 'Notes & Sources']:
            continue
        rel = rels[sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]
        path = rel.lstrip('/') if rel.startswith('/') else 'xl/' + rel
        rows = []
        for row in ET.fromstring(archive.read(path)).findall('m:sheetData/m:row', ns):
            index = int(row.attrib['r']) - 1
            cells = []
            for cell in row:
                col = 0
                for char in re.match(r'[A-Z]+', cell.attrib['r'])[0]:
                    col = col * 26 + ord(char) - 64
                value = cell.find('m:v', ns)
                text = value.text if value is not None else None
                if cell.attrib.get('t') == 's' and text is not None:
                    text = shared[int(text)]
                elif cell.attrib.get('t') == 'inlineStr':
                    text = ''.join(cell.find('m:is', ns).itertext())
                while len(cells) < col:
                    cells.append(None)
                cells[col - 1] = text
            if any(v is not None for v in cells):
                while len(rows) <= index:
                    rows.append([])
                rows[index] = cells
        sheets[name] = rows
payload = {'spreadsheetId': '1nw4BD6Mm0EVYnLG8jJWsZA5LN9WimaU5Pj1T4HaeQmo', 'retrievedAt': datetime.now(timezone.utc).isoformat(), 'sheets': sheets}
with target.open('x') as output:
    target.chmod(0o600)
    json.dump(payload, output, ensure_ascii=False, indent=2)
print('Private workbook JSON prepared. Verify the export identity before importing.')
