from pathlib import Path
import json, re, textwrap
root = Path('/mnt/data/adsense_upgrade/pickleball-site')
# Patch config basics
cfg = root/'data/site.config.js'
s = cfg.read_text(encoding='utf-8')
s = re.sub(r"email:\s*'[^']*'", "email: 'hello@picklelevel.com'", s)
s = re.sub(r"locales:\s*\[[^\]]+\]", "locales: ['ko', 'en']", s)
s = s.replace("adminDemoPassword: 'courtnote'", "adminDemoPassword: 'courtnote',\n\n    // For AdSense review, keep the front-end admin demo out of the public build.\n    exposeAdminDemo: false")
cfg.write_text(s, encoding='utf-8')

# Patch i18n footer labels and trust texts
for lang in ['ko','en']:
    p = root/f'i18n/{lang}.json'
    data = json.loads(p.read_text(encoding='utf-8'))
    data.setdefault('footer', {})
    if lang == 'ko':
        data['footer'].update({
            'editorial': '편집정책', 'corrections': '정정·제보', 'community': '커뮤니티 가이드라인', 'advertising': '광고·제휴 고지', 'cookies': '쿠키 안내'
        })
    else:
        data['footer'].update({
            'editorial': 'Editorial policy', 'corrections': 'Corrections', 'community': 'Community guidelines', 'advertising': 'Advertising disclosure', 'cookies': 'Cookie notice'
        })
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

