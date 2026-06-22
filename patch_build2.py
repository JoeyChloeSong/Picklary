from pathlib import Path
import re
root = Path('/mnt/data/adsense_upgrade/pickleball-site')
p = root/'build.js'
s = p.read_text(encoding='utf-8')
# Patch brief editions block via regex
s = re.sub(r"const briefEditions = \[\s*\{\s*edition: 1,\s*date: '2026-06-12',\s*title: 'What to actually pay attention to right now',\s*items: \[\s*\{ take: 'Raw carbon-fibre faces keep showing up across new releases\. For a 2\.0–3\.5 player the practical effect is spin-friendly texture and a controlled feel — useful, but not a reason to replace a paddle you still play well with\.', sourceName: 'PickleLevel — paddle face materials', sourceUrl: '/en/paddle-face-materials-compared/' \},\s*\{ take: 'If you compete, check the official approved-equipment list before buying, since tournament eligibility is decided there, not by marketing copy\.', sourceName: 'USA Pickleball', sourceUrl: 'https://usapickleball.org' \},\s*\{ take: \"Confused about ratings\? Read what a results-based system actually measures before you let the number bother you — it's feedback, not a verdict\.\", sourceName: 'DUPR', sourceUrl: 'https://dupr.com' \}\s*\]\s*\}\s*\];",
"""const briefEditions = [
  {
    edition: 1,
    date: '2026-06-12',
    title: 'What to actually pay attention to right now',
    titleKo: '지금 피클볼 플레이어가 실제로 확인할 것',
    items: [
      { take: 'Raw carbon-fibre faces keep showing up across new releases. For a 2.0–3.5 player the practical effect is spin-friendly texture and a controlled feel — useful, but not a reason to replace a paddle you still play well with.', takeKo: '로 카본 계열 표면은 새 패들에서 계속 많이 보입니다. 2.0~3.5 플레이어에게는 스핀과 컨트롤에 도움이 될 수 있지만, 아직 잘 맞는 패들을 무리하게 바꿀 이유는 아닙니다.', sourceName: 'PickleLevel — paddle face materials', sourceNameKo: 'PickleLevel — 패들 표면 소재 비교', sourceUrl: '/ko/paddle-face-materials-compared/' },
      { take: 'If you compete, check the official approved-equipment list before buying, since tournament eligibility is decided there, not by marketing copy.', takeKo: '대회에 나갈 계획이라면 구매 전 승인 장비 목록을 확인하세요. 대회 사용 가능 여부는 마케팅 문구가 아니라 공식 승인 목록으로 판단됩니다.', sourceName: 'USA Pickleball', sourceNameKo: 'USA Pickleball', sourceUrl: 'https://usapickleball.org' },
      { take: "Confused about ratings? Read what a results-based system actually measures before you let the number bother you — it's feedback, not a verdict.", takeKo: '레이팅이 헷갈린다면 숫자를 평가가 아니라 피드백으로 읽으세요. 경기 결과 기반 시스템이 무엇을 측정하는지 먼저 이해하는 편이 좋습니다.', sourceName: 'DUPR', sourceNameKo: 'DUPR', sourceUrl: 'https://dupr.com' }
    ]
  }
];""", s, flags=re.S)
# Insert localBrief helper after fmtDate if not present
if 'function localBriefTitle' not in s:
    anchor = "function fmtDate(loc, iso) {\n  try { return new Intl.DateTimeFormat(loc, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso)); }\n  catch (e) { return iso; }\n}\n"
    helper = """
function localBriefTitle(ed, loc) {
  return loc === 'ko' && ed.titleKo ? ed.titleKo : ed.title;
}
function localBriefItem(it, loc) {
  return {
    take: loc === 'ko' && it.takeKo ? it.takeKo : it.take,
    sourceName: loc === 'ko' && it.sourceNameKo ? it.sourceNameKo : it.sourceName,
    sourceUrl: it.sourceUrl,
  };
}
"""
    if anchor not in s: raise SystemExit('fmtDate anchor not found')
    s = s.replace(anchor, anchor + helper + "\n")
# Add community label in trustLabel
s = s.replace("advertising:'Advertising Disclosure'", "advertising:'Advertising Disclosure', community:'Community Guidelines'")
s = s.replace("advertising:'광고·제휴 고지'", "advertising:'광고·제휴 고지', community:'커뮤니티 가이드라인'")
s = s.replace("advertising:'Divulgación publicitaria'", "advertising:'Divulgación publicitaria', community:'Normas comunitarias'")
# Add community footer link after advertising if absent
if "community-guidelines/" not in s.split('function footer',1)[1].split('function sideRail',1)[0] if False else True:
    pass
# Simpler direct add if not in footer links
if "['community-guidelines/', trustLabel(loc, 'community')]" not in s:
    s = s.replace("    ['advertising-disclosure/', trustLabel(loc, 'advertising')],\n", "    ['advertising-disclosure/', trustLabel(loc, 'advertising')],\n    ['community-guidelines/', trustLabel(loc, 'community')],\n")
# Add sourcePanel helper after contentVisual
if 'function sourcePanel(' not in s:
    anchor = "function contentVisual(loc, categoryId) { return visualFigure(loc, categoryVisualKey[categoryId] || 'court', 'visual-card--article'); }\n"
    src = r'''
function sourcePanel(loc, categoryId) {
  const labels = loc === 'ko'
    ? { title: '출처 및 최신 확인 링크', intro: '규칙, 승인 장비, 랭킹, 가격처럼 바뀔 수 있는 정보는 아래 공식 출처에서 다시 확인하세요.' }
    : { title: 'Sources and live-check links', intro: 'For rules, approved equipment, rankings, prices, and other changing details, verify with these primary sources.' };
  const common = [
    { name: 'USA Pickleball', url: 'https://usapickleball.org' },
    { name: 'DUPR', url: 'https://dupr.com' },
  ];
  const byCat = {
    gear: [{ name: 'USA Pickleball Approved Equipment', url: 'https://equipment.usapickleball.org/paddle-list/' }],
    compete: [{ name: 'DUPR', url: 'https://dupr.com' }, { name: 'PPA Tour Rankings', url: 'https://ppatour.com/player-rankings/' }],
    scene: [{ name: 'PPA Tour Players', url: 'https://ppatour.com/athletes/' }, { name: 'Pickleball.com', url: 'https://pickleball.com' }],
    rules: [{ name: 'USA Pickleball Rules', url: 'https://usapickleball.org/what-is-pickleball/official-rules/' }],
    skills: [{ name: 'USA Pickleball', url: 'https://usapickleball.org' }],
  };
  const links = [...(byCat[categoryId] || []), ...common]
    .filter((x, i, arr) => arr.findIndex((y) => y.url === x.url) === i);
  return `<aside class="source-panel"><h2>${esc(labels.title)}</h2><p>${esc(labels.intro)}</p><ul>${links.map((x) => `<li><a href="${escAttr(x.url)}" rel="nofollow noopener" target="_blank">${esc(x.name)}</a></li>`).join('')}</ul></aside>`;
}
'''
    if anchor not in s: raise SystemExit('contentVisual anchor not found')
    s = s.replace(anchor, anchor + src + "\n")
# Insert source panel in posts
if '${sourcePanel(loc, p.category)}' not in s:
    s = s.replace('      <div class="prose">${body}</div>\n      ${listBlock', '      <div class="prose">${body}</div>\n      ${sourcePanel(loc, p.category)}\n      ${listBlock')
# Localize brief in home/renderBrief
home_old = "${briefPreview.items.slice(0, 2).map((it) => `<li><p>${esc(it.take)}</p>\n        <a class=\"brief-list__src\" href=\"${escAttr(it.sourceUrl)}\"${/^https?:/.test(it.sourceUrl) ? ' rel=\"nofollow noopener\" target=\"_blank\"' : ''}>${esc(tt(loc, 'brief.source'))}: ${esc(it.sourceName)}</a></li>`).join('')}"
home_new = "${briefPreview.items.slice(0, 2).map((raw) => { const it = localBriefItem(raw, loc); return `<li><p>${esc(it.take)}</p>\n        <a class=\"brief-list__src\" href=\"${escAttr(it.sourceUrl)}\"${/^https?:/.test(it.sourceUrl) ? ' rel=\"nofollow noopener\" target=\"_blank\"' : ''}>${esc(tt(loc, 'brief.source'))}: ${esc(it.sourceName)}</a></li>`; }).join('')}"
s = s.replace(home_old, home_new)
s = s.replace("  const translated = loc === SOURCE; // content authored in English", "  const translated = loc === SOURCE || loc === 'ko'; // Korean edition is manually localised for AdSense readiness")
s = s.replace("    <p class=\"edition__lede\">${esc(ed.title)}</p>", "    <p class=\"edition__lede\">${esc(localBriefTitle(ed, loc))}</p>")
brief_old = "${ed.items.map((it) => `<li><p>${esc(it.take)}</p>\n        <a class=\"brief-list__src\" href=\"${escAttr(it.sourceUrl)}\"${/^https?:/.test(it.sourceUrl) ? ' rel=\"nofollow noopener\" target=\"_blank\"' : ''}>${esc(tt(loc, 'brief.source'))}: ${esc(it.sourceName)}</a></li>`).join('')}"
brief_new = "${ed.items.map((raw) => { const it = localBriefItem(raw, loc); return `<li><p>${esc(it.take)}</p>\n        <a class=\"brief-list__src\" href=\"${escAttr(it.sourceUrl)}\"${/^https?:/.test(it.sourceUrl) ? ' rel=\"nofollow noopener\" target=\"_blank\"' : ''}>${esc(tt(loc, 'brief.source'))}: ${esc(it.sourceName)}</a></li>`; }).join('')}"
s = s.replace(brief_old, brief_new)
# Add render policy functions after renderContact
if 'function renderEditorialPolicy' not in s:
    marker = "function renderAuthor(loc) {"
    idx = s.find(marker)
    if idx < 0: raise SystemExit('renderAuthor marker not found')
    funcs = r'''
function renderEditorialPolicy(loc) {
  const html = loc === 'ko' ? `
<p>PickleLevel은 독자가 실제 플레이와 구매 판단에 사용할 수 있는 정보를 제공하는 것을 목표로 합니다. 검색 노출을 위한 반복 문장이나 출처 없는 수치는 사용하지 않습니다.</p>
<h2>작성 기준</h2>
<ul><li>레벨별로 바로 실행할 수 있는 조언을 제공합니다.</li><li>직접 테스트한 내용과 공개 스펙을 바탕으로 비교한 내용을 구분합니다.</li><li>가격, 랭킹, DUPR, 대회 결과, 승인 장비 여부처럼 변동되는 정보는 공식 출처 확인 경로를 함께 제공합니다.</li><li>선수 사진과 제품 이미지는 권리 문제가 없는 자체 제작 이미지 또는 허가된 이미지로만 사용합니다.</li></ul>
<h2>수정과 업데이트</h2>
<p>가이드에는 발행일과 수정일을 표시합니다. 정보가 바뀌거나 오류가 확인되면 본문을 고치고 업데이트합니다.</p>` : `
<p>PickleLevel aims to publish useful guidance that players can apply to practice, gear decisions, and player research. We avoid filler, copied text, and unsourced claims.</p>
<h2>Standards</h2><ul><li>Guides should help with a level, skill, paddle, player, or feedback decision.</li><li>We separate personal testing from specification-based comparison.</li><li>Changing details such as prices, rankings, DUPR, results, and approval status are linked to primary sources.</li><li>Player and product images are original, licensed, or permission-safe.</li></ul>
<h2>Updates</h2><p>Guides show publication and update dates. Confirmed errors are corrected.</p>`;
  return simplePage(loc, 'editorial-policy/', trustLabel(loc, 'editorial'), loc === 'ko' ? 'PickleLevel의 콘텐츠 작성·검수 기준입니다.' : 'How PickleLevel writes, reviews, and updates content.', html, { translated: loc === 'ko' || loc === SOURCE, noindex: false });
}

function renderCorrectionsPolicy(loc) {
  const html = loc === 'ko' ? `
<p>잘못된 규칙 설명, 오래된 가격, 선수 정보, 패들 스펙, 깨진 링크를 발견하면 알려 주세요. 확인 가능한 공식 출처를 함께 보내주시면 더 빠르게 검토할 수 있습니다.</p>
<h2>보내주실 내용</h2>
<ul><li>문제가 있는 페이지 주소</li><li>수정이 필요한 문장, 표, 이미지 설명</li><li>가능하면 공식 출처 링크</li></ul>
<p>제보 이메일: <a href="mailto:${escAttr(config.email)}">${esc(config.email)}</a></p>
<h2>수정 원칙</h2>
<p>확인된 오류는 가능한 한 빠르게 수정하고, 해석이 갈리는 정보는 단정하지 않고 조건과 출처를 함께 표시합니다.</p>` : `
<p>If you notice an outdated price, rule detail, player profile, paddle spec, or broken link, please contact us.</p><h2>Please include</h2><ul><li>The page URL</li><li>The text, table, or image note that needs correction</li><li>A primary source link, if possible</li></ul><p>Email: <a href="mailto:${escAttr(config.email)}">${esc(config.email)}</a></p><h2>Corrections</h2><p>Confirmed errors are corrected, and ambiguous claims are revised to include conditions and sources.</p>`;
  return simplePage(loc, 'corrections-policy/', trustLabel(loc, 'corrections'), loc === 'ko' ? '오류 제보와 수정 요청을 받는 방법입니다.' : 'How to report errors and request corrections.', html, { translated: loc === 'ko' || loc === SOURCE, noindex: false });
}

function renderCookiePolicy(loc) {
  const html = loc === 'ko' ? `
<p>현재 사이트는 언어 선택과 데모 기능을 위해 브라우저 로컬 저장소를 사용할 수 있습니다. Google AdSense를 활성화하면 Google을 포함한 제3자 광고 공급자가 쿠키를 사용할 수 있습니다.</p>
<h2>광고 쿠키</h2><p>개인 맞춤 광고가 제공되는 경우 방문자의 이전 방문 정보를 바탕으로 광고가 표시될 수 있습니다. 사용자는 Google 광고 설정에서 개인 맞춤 광고를 관리할 수 있습니다.</p>
<h2>사용자 선택권</h2><p>브라우저 설정에서 쿠키와 로컬 저장소를 삭제할 수 있습니다. 지역별 법규가 요구하는 경우 광고 쿠키 사용 전에 동의 절차를 추가해야 합니다.</p>` : `
<p>The site may use local storage for language preference and demo features. If AdSense is enabled, Google and third-party vendors may use cookies to serve ads.</p><h2>Advertising cookies</h2><p>Personalized ads may use previous visits to this and other websites. Visitors can manage personalized ads through Google Ads Settings.</p><h2>Choices</h2><p>Visitors can clear cookies and local storage in their browser. Where legally required, add a consent flow before ad cookies are set.</p>`;
  return simplePage(loc, 'cookie-policy/', trustLabel(loc, 'cookies'), loc === 'ko' ? '사이트의 쿠키와 로컬 저장소 사용 안내입니다.' : 'Cookies and local storage notice.', html, { translated: loc === 'ko' || loc === SOURCE, noindex: false });
}

function renderAdvertisingDisclosure(loc) {
  const html = loc === 'ko' ? `
<p>PickleLevel은 향후 Google AdSense 광고와 일부 제휴 링크를 사용할 수 있습니다. 광고와 콘텐츠는 명확히 구분되어야 하며, 사용자의 광고 클릭을 요청하거나 유도하지 않습니다.</p>
<h2>장비 추천 기준</h2><p>패들 페이지는 구매 결정을 돕기 위한 조사 대시보드입니다. 가격, 재고, 승인 상태는 변동되므로 구매 전 공식 판매처와 승인 장비 목록을 확인해야 합니다.</p>
<h2>제휴 링크</h2><p>일부 링크는 제휴 링크일 수 있으며, 사용자가 해당 링크를 통해 구매하면 사이트가 소정의 수수료를 받을 수 있습니다. 이 사실은 추천 순위나 설명을 조작하는 이유가 되어서는 안 됩니다.</p>` : `
<p>PickleLevel may use Google AdSense and selected affiliate links. Ads and editorial content should remain clearly separated, and users should never be asked or incentivized to click ads.</p><h2>Equipment recommendations</h2><p>Paddle pages are research dashboards. Prices, stock, and approval status can change, so readers should verify with official sellers and approved-equipment lists.</p><h2>Affiliate links</h2><p>Some outbound links may earn a commission at no extra cost to the reader. That must not change the substance of our recommendations.</p>`;
  return simplePage(loc, 'advertising-disclosure/', trustLabel(loc, 'advertising'), loc === 'ko' ? '광고, 제휴 링크, 장비 추천에 대한 고지입니다.' : 'Advertising, affiliate links, and recommendation disclosure.', html, { translated: loc === 'ko' || loc === SOURCE, noindex: false });
}

function renderCommunityGuidelines(loc) {
  const html = loc === 'ko' ? `
<p>하이라이트 배틀 기능은 플레이어가 자신의 영상을 공유하고 건설적인 피드백을 받는 경험을 목표로 합니다. 현재 정적 사이트 버전은 데모이며, 공개 운영 전에는 로그인, 저장소, 신고, 모더레이션 기능을 연결해야 합니다.</p>
<h2>허용되는 콘텐츠</h2><ul><li>본인이 촬영했거나 업로드 권한이 있는 피클볼 영상</li><li>기술 개선을 위한 건설적인 피드백</li><li>정확한 레벨과 스킬 태그</li></ul>
<h2>금지되는 콘텐츠</h2><ul><li>타인의 영상을 허락 없이 업로드하는 행위</li><li>욕설, 비방, 차별, 개인정보 노출</li><li>추천수 조작 또는 자동화 도구 사용</li></ul><p>신고: <a href="mailto:${escAttr(config.email)}">${esc(config.email)}</a></p>` : `
<p>The highlight feature is designed for constructive pickleball feedback. The static version is a demo; public operation should connect login, storage, reporting, and moderation.</p><h2>Allowed</h2><ul><li>Your own clips or clips you have permission to upload</li><li>Constructive feedback</li><li>Accurate level and skill tags</li></ul><h2>Not allowed</h2><ul><li>Unauthorized videos</li><li>Harassment, hate, personal data exposure, or abuse</li><li>Vote manipulation or automated traffic</li></ul>`;
  return simplePage(loc, 'community-guidelines/', trustLabel(loc, 'community'), loc === 'ko' ? '하이라이트 업로드와 피드백을 위한 기본 규칙입니다.' : 'Guidelines for highlight uploads and feedback.', html, { translated: loc === 'ko' || loc === SOURCE, noindex: false });
}

'''
    s = s[:idx] + funcs + s[idx:]
# Add legalBodiesFor before render404
if 'function legalBodiesFor' not in s:
    idx = s.find('function render404() {')
    if idx < 0: raise SystemExit('render404 marker missing')
    legal = r'''
function legalBodiesFor(loc) {
  const site = config.siteName, email = config.email;
  if (loc === 'ko') return {
    privacy: `
<p>이 개인정보처리방침은 ${esc(site)} 방문 시 어떤 정보가 처리될 수 있는지 설명합니다. 사이트는 필요한 정보만 최소한으로 처리하는 것을 목표로 합니다.</p>
<h2>수집하는 정보</h2><p>현재 사이트는 정적 정보 사이트이며 계정 생성을 요구하지 않습니다. 문의 이메일을 보내는 경우, 사용자가 이메일에 포함한 정보가 운영자에게 전달됩니다.</p>
<h2>로컬 저장소와 쿠키</h2><p>언어 선택, 하이라이트 데모, 관리자 데모 같은 일부 기능은 사용자의 브라우저 로컬 저장소를 사용할 수 있습니다. 이는 다른 사이트를 추적하기 위한 목적이 아닙니다.</p>
<h2>광고와 제3자 공급자</h2><p>사이트는 Google AdSense 광고를 사용할 수 있습니다. Google을 포함한 제3자 광고 공급자는 사용자의 이전 방문 정보를 바탕으로 광고를 제공하기 위해 쿠키를 사용할 수 있습니다. 사용자는 Google 광고 설정에서 개인 맞춤 광고를 관리할 수 있으며, Google의 광고 기술 안내에서 자세한 내용을 확인할 수 있습니다.</p>
<h2>사용자의 선택</h2><p>브라우저 설정에서 쿠키와 로컬 저장소를 삭제할 수 있습니다. 지역별 법규가 요구하는 경우 광고 쿠키 사용 전에 별도의 동의 절차를 적용해야 합니다.</p>
<h2>문의</h2><p>개인정보 관련 문의는 <a href="mailto:${escAttr(email)}">${esc(email)}</a>로 보내 주세요.</p>
<p class="muted">최종 수정일: ${esc(fmtDate(loc, new Date().toISOString()))}</p>`,
    terms: `
<p>${esc(site)}를 이용하면 본 약관에 동의한 것으로 간주됩니다. 이 약관은 일반적인 이용 안내이며 법률 자문이 아닙니다.</p>
<h2>콘텐츠 이용</h2><p>사이트의 글, 표, 이미지 카드, 데이터 정리는 일반 정보 제공을 위한 것입니다. 글 링크 공유는 가능하지만 본문 전체를 허락 없이 복제하거나 재배포할 수 없습니다.</p>
<h2>정확성</h2><p>피클볼 규칙, 장비, 가격, 선수 정보, 랭킹은 시간이 지나며 바뀔 수 있습니다. 사이트는 가능한 한 공식 출처를 함께 안내하지만 모든 정보가 실시간으로 최신임을 보장하지 않습니다.</p>
<h2>외부 링크</h2><p>외부 사이트 링크는 참고용입니다. 외부 사이트의 내용, 가격, 재고, 정책에 대해서는 해당 사이트가 책임집니다.</p>
<h2>문의</h2><p>이용약관 관련 문의는 <a href="mailto:${escAttr(email)}">${esc(email)}</a>로 보내 주세요.</p>
<p class="muted">최종 수정일: ${esc(fmtDate(loc, new Date().toISOString()))}</p>`,
    disclaimer: `
<p>${esc(site)}는 피클볼 플레이어를 위한 일반 정보 사이트입니다. 아래 내용을 확인한 뒤 정보를 활용해 주세요.</p>
<h2>일반 정보</h2><p>스킬, 훈련, 장비 설명은 일반적인 정보이며 전문 코칭, 의료, 법률 조언을 대체하지 않습니다. 통증이나 부상이 있다면 자격 있는 전문가와 상담하세요.</p>
<h2>장비 정보</h2><p>직접 테스트하지 않은 장비는 공개된 스펙과 공식 자료를 바탕으로 비교합니다. 패들의 타구감은 개인차가 크므로 가능하면 직접 시타해 보세요.</p>
<h2>제휴 고지</h2><p>일부 외부 링크는 제휴 링크일 수 있습니다. 해당 링크를 통해 구매하면 사이트가 수수료를 받을 수 있으나, 이는 독자에게 추가 비용을 만들지 않습니다.</p>
<h2>최신성</h2><p>가격, 랭킹, DUPR, 대회 결과, 승인 장비 여부는 변동됩니다. 중요한 결정 전에는 공식 출처를 다시 확인하세요.</p>
<p>정정 제보: <a href="mailto:${escAttr(email)}">${esc(email)}</a></p>
<p class="muted">최종 수정일: ${esc(fmtDate(loc, new Date().toISOString()))}</p>`,
  };
  return legalBodies();
}

'''
    s = s[:idx] + legal + s[idx:]
# Write policy pages and local legal
if 'renderEditorialPolicy(loc)' not in s.split('for (const loc of locales)',1)[1]:
    s = s.replace("    writePage(loc, 'about', renderAbout(loc));\n    writePage(loc, 'author', renderAuthor(loc));", "    writePage(loc, 'about', renderAbout(loc));\n    writePage(loc, 'editorial-policy', renderEditorialPolicy(loc));\n    writePage(loc, 'corrections-policy', renderCorrectionsPolicy(loc));\n    writePage(loc, 'cookie-policy', renderCookiePolicy(loc));\n    writePage(loc, 'advertising-disclosure', renderAdvertisingDisclosure(loc));\n    writePage(loc, 'community-guidelines', renderCommunityGuidelines(loc));\n    writePage(loc, 'author', renderAuthor(loc));")
s = s.replace("  const legal = legalBodies();\n\n  for (const loc of locales) {", "  const legal = legalBodies();\n\n  for (const loc of locales) {\n    const legalLoc = legalBodiesFor(loc);")
s = s.replace("legal.privacy));", "legalLoc.privacy, { translated: loc === 'ko' || loc === SOURCE, noindex: false }));")
s = s.replace("legal.terms));", "legalLoc.terms, { translated: loc === 'ko' || loc === SOURCE, noindex: false }));")
s = s.replace("legal.disclaimer));", "legalLoc.disclaimer, { translated: loc === 'ko' || loc === SOURCE, noindex: false }));")
# Sitemap page static links
if "trustLabel(loc, 'community')" not in s.split('function renderSitemapPage',1)[1].split('function legalBodies',1)[0]:
    s = s.replace("    { name: tt(loc, 'nav.about'), href: link(loc, 'about/') },\n    { name: tt(loc, 'author.title'), href: link(loc, 'author/') },", "    { name: tt(loc, 'nav.about'), href: link(loc, 'about/') },\n    { name: trustLabel(loc, 'editorial'), href: link(loc, 'editorial-policy/') },\n    { name: trustLabel(loc, 'corrections'), href: link(loc, 'corrections-policy/') },\n    { name: trustLabel(loc, 'cookies'), href: link(loc, 'cookie-policy/') },\n    { name: trustLabel(loc, 'advertising'), href: link(loc, 'advertising-disclosure/') },\n    { name: trustLabel(loc, 'community'), href: link(loc, 'community-guidelines/') },\n    { name: tt(loc, 'author.title'), href: link(loc, 'author/') },")
# buildSitemap entries
if "add('editorial-policy/'" not in s:
    s = s.replace("  add('about/', 'monthly', '0.5');\n  add('author/', 'monthly', '0.5');", "  add('about/', 'monthly', '0.5');\n  add('editorial-policy/', 'monthly', '0.4');\n  add('corrections-policy/', 'monthly', '0.4');\n  add('cookie-policy/', 'monthly', '0.4');\n  add('advertising-disclosure/', 'monthly', '0.4');\n  add('community-guidelines/', 'monthly', '0.4');\n  add('privacy/', 'yearly', '0.3');\n  add('terms/', 'yearly', '0.3');\n  add('disclaimer/', 'yearly', '0.3');\n  add('author/', 'monthly', '0.5');")
# Do not copy admin to dist unless configured
s = s.replace("  if (fs.existsSync(path.join(ROOT, 'admin'))) copyDir(path.join(ROOT, 'admin'), path.join(DIST, 'admin'));", "  if (config.exposeAdminDemo && fs.existsSync(path.join(ROOT, 'admin'))) copyDir(path.join(ROOT, 'admin'), path.join(DIST, 'admin'));")
# Robots disallow admin
s = s.replace("writeFile('robots.txt', `User-agent: *\\nAllow: /\\n\\nSitemap: ${config.url}/sitemap.xml\\n`);", "writeFile('robots.txt', `User-agent: *\\nAllow: /\\nDisallow: /admin/\\n\\nSitemap: ${config.url}/sitemap.xml\\n`);")
# Remove unused const legal maybe no issue
p.write_text(s, encoding='utf-8')
print('patched build.js')
