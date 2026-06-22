from pathlib import Path
import re, textwrap
root = Path('/mnt/data/adsense_upgrade/pickleball-site')
p = root/'build.js'
s = p.read_text(encoding='utf-8')
# 1) Add Korean brief fields and helper
old = """const briefEditions = [\n  {\n    edition: 1,\n    date: '2026-06-12',\n    title: 'What to actually pay attention to right now',\n    items: [\n      { take: 'Raw carbon-fibre faces keep showing up across new releases. For a 2.0–3.5 player the practical effect is spin-friendly texture and a controlled feel — useful, but not a reason to replace a paddle you still play well with.', sourceName: 'PickleLevel — paddle face materials', sourceUrl: '/en/paddle-face-materials-compared/' },\n      { take: 'If you compete, check the official approved-equipment list before buying, since tournament eligibility is decided there, not by marketing copy.', sourceName: 'USA Pickleball', sourceUrl: 'https://usapickleball.org' },\n      { take: \"Confused about ratings? Read what a results-based system actually measures before you let the number bother you — it's feedback, not a verdict.\", sourceName: 'DUPR', sourceUrl: 'https://dupr.com' }\n    ]\n  }\n];"""
new = """const briefEditions = [\n  {\n    edition: 1,\n    date: '2026-06-12',\n    title: 'What to actually pay attention to right now',\n    titleKo: '지금 피클볼 플레이어가 실제로 확인할 것',\n    items: [\n      { take: 'Raw carbon-fibre faces keep showing up across new releases. For a 2.0–3.5 player the practical effect is spin-friendly texture and a controlled feel — useful, but not a reason to replace a paddle you still play well with.', takeKo: '로 카본 계열 표면은 새 패들에서 계속 많이 보입니다. 2.0~3.5 플레이어에게는 스핀과 컨트롤에 도움이 될 수 있지만, 아직 잘 맞는 패들을 무리하게 바꿀 이유는 아닙니다.', sourceName: 'PickleLevel — paddle face materials', sourceNameKo: 'PickleLevel — 패들 표면 소재 비교', sourceUrl: '/ko/paddle-face-materials-compared/' },\n      { take: 'If you compete, check the official approved-equipment list before buying, since tournament eligibility is decided there, not by marketing copy.', takeKo: '대회에 나갈 계획이라면 구매 전 승인 장비 목록을 확인하세요. 대회 사용 가능 여부는 마케팅 문구가 아니라 공식 승인 목록으로 판단됩니다.', sourceName: 'USA Pickleball', sourceNameKo: 'USA Pickleball', sourceUrl: 'https://usapickleball.org' },\n      { take: \"Confused about ratings? Read what a results-based system actually measures before you let the number bother you — it's feedback, not a verdict.\", takeKo: '레이팅이 헷갈린다면 숫자를 평가가 아니라 피드백으로 읽으세요. 경기 결과 기반 시스템이 무엇을 측정하는지 먼저 이해하는 편이 좋습니다.', sourceName: 'DUPR', sourceNameKo: 'DUPR', sourceUrl: 'https://dupr.com' }\n    ]\n  }\n];"""
if old not in s:
    raise SystemExit('brief block not found')
s = s.replace(old, new)
insert_after = "function fmtDate(loc, iso) {\n  try { return new Intl.DateTimeFormat(loc, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(iso)); }\n  catch (e) { return iso; }\n}\n"
helper = r'''
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
'''
s = s.replace(insert_after, insert_after + helper + "\n")

# 2) Footer extra links
old = """  const links = [\n    ['about/', tt(loc, 'footer.about')],\n    ['privacy/', tt(loc, 'footer.privacy')],\n    ['terms/', tt(loc, 'footer.terms')],\n    ['disclaimer/', tt(loc, 'footer.disclaimer')],\n    ['contact/', tt(loc, 'footer.contact')],\n    ['sitemap/', tt(loc, 'footer.sitemap')],\n  ].map(([r, label]) => `<a href=\"${link(loc, r)}\">${esc(label)}</a>`).join('');"""
new = """  const links = [\n    ['about/', tt(loc, 'footer.about')],\n    ['editorial-policy/', tt(loc, 'footer.editorial')],\n    ['corrections/', tt(loc, 'footer.corrections')],\n    ['community-guidelines/', tt(loc, 'footer.community')],\n    ['advertising-disclosure/', tt(loc, 'footer.advertising')],\n    ['privacy/', tt(loc, 'footer.privacy')],\n    ['terms/', tt(loc, 'footer.terms')],\n    ['disclaimer/', tt(loc, 'footer.disclaimer')],\n    ['contact/', tt(loc, 'footer.contact')],\n    ['sitemap/', tt(loc, 'footer.sitemap')],\n  ].map(([r, label]) => `<a href=\"${link(loc, r)}\">${esc(label)}</a>`).join('');"""
if old not in s:
    raise SystemExit('footer links block not found')
s = s.replace(old,new)

# 3) Add sourcePanel helper after contentVisual
anchor = "function contentVisual(loc, categoryId) { return visualFigure(loc, categoryVisualKey[categoryId] || 'court', 'visual-card--article'); }\n"
source_panel = r'''
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
if anchor not in s:
    raise SystemExit('contentVisual anchor not found')
s = s.replace(anchor, anchor + source_panel + "\n")

# 4) Insert source panel after prose in post
s = s.replace('      <div class="prose">${body}</div>\n      ${listBlock', '      <div class="prose">${body}</div>\n      ${sourcePanel(loc, p.category)}\n      ${listBlock')

# 5) Use localized brief in home and brief page
s = s.replace("${briefPreview.items.slice(0, 2).map((it) => `<li><p>${esc(it.take)}</p>\n        <a class=\"brief-list__src\" href=\"${escAttr(it.sourceUrl)}\"${/^https?:/.test(it.sourceUrl) ? ' rel=\"nofollow noopener\" target=\"_blank\"' : ''}>${esc(tt(loc, 'brief.source'))}: ${esc(it.sourceName)}</a></li>`).join('')}",
"${briefPreview.items.slice(0, 2).map((raw) => { const it = localBriefItem(raw, loc); return `<li><p>${esc(it.take)}</p>\n        <a class=\"brief-list__src\" href=\"${escAttr(it.sourceUrl)}\"${/^https?:/.test(it.sourceUrl) ? ' rel=\"nofollow noopener\" target=\"_blank\"' : ''}>${esc(tt(loc, 'brief.source'))}: ${esc(it.sourceName)}</a></li>`; }).join('')}")
s = s.replace("  const translated = loc === SOURCE; // content authored in English", "  const translated = loc === SOURCE || loc === 'ko'; // Korean edition is manually localised for AdSense readiness")
s = s.replace("    <p class=\"edition__lede\">${esc(ed.title)}</p>", "    <p class=\"edition__lede\">${esc(localBriefTitle(ed, loc))}</p>")
s = s.replace("${ed.items.map((it) => `<li><p>${esc(it.take)}</p>\n        <a class=\"brief-list__src\" href=\"${escAttr(it.sourceUrl)}\"${/^https?:/.test(it.sourceUrl) ? ' rel=\"nofollow noopener\" target=\"_blank\"' : ''}>${esc(tt(loc, 'brief.source'))}: ${esc(it.sourceName)}</a></li>`).join('')}",
"${ed.items.map((raw) => { const it = localBriefItem(raw, loc); return `<li><p>${esc(it.take)}</p>\n        <a class=\"brief-list__src\" href=\"${escAttr(it.sourceUrl)}\"${/^https?:/.test(it.sourceUrl) ? ' rel=\"nofollow noopener\" target=\"_blank\"' : ''}>${esc(tt(loc, 'brief.source'))}: ${esc(it.sourceName)}</a></li>`; }).join('')}")

# 6) simplePage default translated true; this makes trust/contact/legal pages indexable when we provide localized bodies.
old = """function simplePage(loc, rel, titleText, introText, htmlBody) {\n  const translated = loc === SOURCE;\n  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: titleText }])}"""
new = """function simplePage(loc, rel, titleText, introText, htmlBody, opts) {\n  opts = opts || {};\n  const translated = opts.translated !== false;\n  const body = `${breadcrumbs(loc, [{ name: tt(loc, 'breadcrumb.home'), rel: '' }, { name: titleText }])}"""
if old not in s:
    raise SystemExit('simplePage header not found')
s = s.replace(old,new)
s = s.replace("  return layout({ loc, rel, title: titleText, description: introText || titleText, noindex: !translated, bodyHtml: body });\n}", "  return layout({ loc, rel, title: titleText, description: introText || titleText, noindex: opts.noindex || !translated, bodyHtml: body });\n}")

# 7) Insert trust content functions before renderAbout, replace renderAbout.
marker = "function renderAbout(loc) {\n"
idx = s.find(marker)
if idx < 0: raise SystemExit('renderAbout marker not found')
trust_funcs = r'''
function trustContent(loc) {
  const email = config.email;
  if (loc === 'ko') return {
    aboutIntro: 'PickleLevel은 피클볼 플레이어가 자신의 레벨에 맞는 규칙, 스킬, 패들, 선수 분석, 하이라이트 피드백 경로를 찾도록 돕는 독립 정보 사이트입니다.',
    aboutBody: `
<p>PickleLevel은 피클볼 입문자와 중급자가 흩어진 정보를 찾아다니지 않도록 만든 레벨 기반 피클볼 허브입니다. 핵심 목표는 네 가지입니다. 규칙과 스킬을 쉽게 배우고, 패들을 비교하고, 세계 프로 선수의 플레이를 분석하고, 하이라이트 영상을 통해 서로 피드백을 주고받는 것입니다.</p>
<h2>무엇을 다루나요</h2>
<p>2.0부터 5.0까지의 레벨 pathway, 서브와 키친 같은 기본 규칙, 딩크와 3구 드롭 같은 핵심 기술, 브랜드별 인기 패들 정보, 프로 선수 카드, 커뮤니티 하이라이트 기능을 다룹니다.</p>
<h2>운영 원칙</h2>
<p>가격, 랭킹, DUPR, 대회 결과, 승인 장비 여부처럼 자주 바뀌는 정보는 공식 출처를 함께 안내합니다. 직접 확인이 필요한 정보는 단정하지 않고, 독자가 최신 원문을 확인할 수 있도록 링크를 제공합니다.</p>
<h2>운영자</h2>
<p>${esc(ownerBio(loc))} 문의와 정정 제보는 <a href="mailto:${escAttr(email)}">${esc(email)}</a>로 보내 주세요.</p>`,
    editorialIntro: 'PickleLevel의 콘텐츠 작성·검수 기준입니다.',
    editorialBody: `
<p>이 사이트의 콘텐츠는 검색 노출보다 플레이어에게 실제 도움이 되는지를 먼저 기준으로 작성합니다.</p>
<h2>콘텐츠 기준</h2>
<ul><li>레벨별로 바로 실행할 수 있는 조언을 제공합니다.</li><li>확인되지 않은 수치, 수상 기록, 사용 장비를 단정하지 않습니다.</li><li>가격과 랭킹처럼 변동되는 정보는 공식 출처 확인을 안내합니다.</li><li>장비 평가는 스펙 기반 비교와 실제 테스트 여부를 구분합니다.</li></ul>
<h2>업데이트</h2>
<p>가이드에는 발행일과 수정일을 표시합니다. 오래된 정보가 발견되면 정정 페이지나 이메일을 통해 업데이트합니다.</p>`,
    correctionsIntro: '오류 제보와 수정 요청을 받는 방법입니다.',
    correctionsBody: `
<p>잘못된 규칙 설명, 오래된 가격, 선수 정보, 패들 스펙, 링크 오류를 발견하면 이메일로 알려 주세요.</p>
<h2>제보 시 포함하면 좋은 내용</h2>
<ul><li>문제가 있는 페이지 주소</li><li>수정이 필요한 문장 또는 표</li><li>가능하면 공식 출처 링크</li></ul>
<p>제보 이메일: <a href="mailto:${escAttr(email)}">${esc(email)}</a></p>
<h2>수정 방식</h2>
<p>확인된 오류는 페이지 수정일을 갱신하고 본문 표현을 바로잡습니다. 해석이 갈리는 내용은 단정 대신 출처와 조건을 함께 표시합니다.</p>`,
    communityIntro: '하이라이트 업로드와 댓글/피드백을 위한 기본 규칙입니다.',
    communityBody: `
<p>하이라이트 배틀 기능은 플레이어가 자신의 영상을 공유하고 피드백을 받는 경험을 목표로 합니다. 공개 운영 전에는 로그인, 저장소, 신고, 모더레이션 기능이 필요합니다.</p>
<h2>허용되는 콘텐츠</h2>
<ul><li>본인이 촬영했거나 업로드 권한이 있는 피클볼 영상</li><li>기술 개선을 위한 건설적인 피드백</li><li>레벨과 스킬 태그가 정확한 영상</li></ul>
<h2>금지되는 콘텐츠</h2>
<ul><li>타인의 영상을 허락 없이 업로드하는 행위</li><li>욕설, 비방, 차별, 개인정보 노출</li><li>추천수 조작 또는 자동화 도구 사용</li></ul>
<p>문제가 있는 콘텐츠는 <a href="mailto:${escAttr(email)}">${esc(email)}</a>로 신고할 수 있습니다.</p>`,
    advertisingIntro: '광고, 제휴 링크, 장비 추천에 대한 고지입니다.',
    advertisingBody: `
<p>PickleLevel은 향후 Google AdSense 광고와 일부 제휴 링크를 사용할 수 있습니다. 광고와 콘텐츠는 명확히 구분되어야 하며, 사용자의 광고 클릭을 요청하거나 유도하지 않습니다.</p>
<h2>장비 추천 기준</h2>
<p>패들 페이지는 구매 결정을 돕기 위한 조사 대시보드입니다. 가격, 재고, 승인 상태는 변동되므로 구매 전 공식 판매처와 승인 장비 목록을 확인해야 합니다.</p>
<h2>제휴 링크</h2>
<p>일부 링크는 제휴 링크일 수 있으며, 사용자가 해당 링크를 통해 구매하면 사이트가 소정의 수수료를 받을 수 있습니다. 이 사실은 추천 순위나 설명을 조작하는 이유가 되어서는 안 됩니다.</p>`,
    cookieIntro: '사이트의 쿠키와 로컬 저장소 사용 안내입니다.',
    cookieBody: `
<p>현재 사이트는 언어 선택과 데모 기능을 위해 브라우저 로컬 저장소를 사용할 수 있습니다. Google AdSense를 활성화하면 Google을 포함한 제3자 광고 공급자가 쿠키를 사용할 수 있습니다.</p>
<h2>광고 쿠키</h2>
<p>개인 맞춤 광고가 제공되는 경우 방문자의 이전 방문 정보를 바탕으로 광고가 표시될 수 있습니다. 사용자는 Google 광고 설정에서 개인 맞춤 광고를 관리할 수 있습니다.</p>
<h2>선택권</h2>
<p>브라우저 설정에서 쿠키와 로컬 저장소를 삭제할 수 있습니다. 지역별 법규가 요구하는 경우 광고 쿠키 사용 전에 동의 절차를 추가해야 합니다.</p>`,
  };
  return {
    aboutIntro: config.tagline,
    aboutBody: `
<p>${esc(config.siteName)} is an independent information site for pickleball players who want level-based improvement, clearer paddle choices, pro-player context, and community highlight feedback.</p>
<h2>What we cover</h2><p>We cover rules, skills and drills, DUPR-level pathways, paddle comparisons, pro player profiles, and highlight-sharing guidance.</p>
<h2>How we work</h2><p>For prices, rankings, ratings, rules, and approved-equipment status, we point readers to primary sources instead of treating stale numbers as permanent facts.</p>
<h2>Who runs it</h2><p>${esc(ownerBio(loc))} Contact: <a href="mailto:${escAttr(email)}">${esc(email)}</a>.</p>`,
    editorialIntro: 'How PickleLevel writes, reviews, and updates content.',
    editorialBody: `<p>PickleLevel prioritizes useful, original guidance over search-engine filler.</p><h2>Standards</h2><ul><li>Guides must help a player make a level, skill, paddle, or feedback decision.</li><li>We do not invent statistics, credentials, player results, or product claims.</li><li>Changing information is linked back to primary sources.</li><li>Published specs and personal testing are separated clearly.</li></ul><h2>Updates</h2><p>Pages show publication and update dates. Corrections are made when reliable information changes.</p>`,
    correctionsIntro: 'How to report errors and request corrections.',
    correctionsBody: `<p>If you notice an outdated price, rule detail, player profile, paddle spec, or broken link, email <a href="mailto:${escAttr(email)}">${esc(email)}</a>.</p><h2>Please include</h2><ul><li>The page URL</li><li>The text or table that needs correction</li><li>A primary source link, if possible</li></ul><p>Confirmed corrections are reflected in the page text and update date.</p>`,
    communityIntro: 'Guidelines for highlight uploads and feedback.',
    communityBody: `<p>The highlight feature is designed for constructive pickleball feedback. Before public operation, login, storage, reporting, and moderation should be connected.</p><h2>Allowed</h2><ul><li>Your own pickleball clips or clips you have permission to upload</li><li>Constructive feedback</li><li>Accurate level and skill tags</li></ul><h2>Not allowed</h2><ul><li>Unauthorized video uploads</li><li>Harassment, hate, personal data exposure, or abuse</li><li>Vote manipulation or automated traffic</li></ul>`,
    advertisingIntro: 'Advertising, affiliate links, and recommendation disclosure.',
    advertisingBody: `<p>PickleLevel may use Google AdSense and selected affiliate links. Ads and editorial content should remain clearly separated, and users should never be asked or incentivized to click ads.</p><h2>Equipment recommendations</h2><p>Paddle pages are research dashboards. Prices, stock, and approval status can change, so readers should verify with official sellers and approved-equipment lists.</p><h2>Affiliate links</h2><p>Some outbound links may earn a commission at no extra cost to the reader. That must not change the substance of our recommendations.</p>`,
    cookieIntro: 'Cookies and local storage notice.',
    cookieBody: `<p>The site may use local storage for language preference and demo features. If AdSense is enabled, Google and third-party vendors may use cookies to serve ads.</p><h2>Advertising cookies</h2><p>Personalized ads may use prior visits to this or other websites. Visitors can manage personalized ads through Google Ads Settings.</p><h2>Choices</h2><p>Visitors can clear cookies and local storage in their browser. Where legally required, add a consent flow before ad cookies are set.</p>`,
  };
}

'''
s = s[:idx] + trust_funcs + s[idx:]
# Replace renderAbout function body by regex until renderContact
pattern = r"function renderAbout\(loc\) \{.*?\n\}\n\nfunction renderContact"
replacement = r'''function renderAbout(loc) {
  const t = trustContent(loc);
  return simplePage(loc, 'about/', tt(loc, 'nav.about'), t.aboutIntro, t.aboutBody);
}

function renderEditorialPolicy(loc) {
  const t = trustContent(loc);
  return simplePage(loc, 'editorial-policy/', tt(loc, 'footer.editorial'), t.editorialIntro, t.editorialBody);
}
function renderCorrections(loc) {
  const t = trustContent(loc);
  return simplePage(loc, 'corrections/', tt(loc, 'footer.corrections'), t.correctionsIntro, t.correctionsBody);
}
function renderCommunityGuidelines(loc) {
  const t = trustContent(loc);
  return simplePage(loc, 'community-guidelines/', tt(loc, 'footer.community'), t.communityIntro, t.communityBody);
}
function renderAdvertisingDisclosure(loc) {
  const t = trustContent(loc);
  return simplePage(loc, 'advertising-disclosure/', tt(loc, 'footer.advertising'), t.advertisingIntro, t.advertisingBody);
}
function renderCookieNotice(loc) {
  const t = trustContent(loc);
  return simplePage(loc, 'cookie-notice/', tt(loc, 'footer.cookies'), t.cookieIntro, t.cookieBody);
}

function renderContact'''
s = re.sub(pattern, replacement, s, flags=re.S)

# 8) Add legalBodiesFor before render404
marker = "function render404() {"
idx = s.find(marker)
if idx < 0: raise SystemExit('render404 marker not found')
legal_for = r'''
function legalBodiesFor(loc) {
  const site = config.siteName, email = config.email;
  if (loc === 'ko') return {
    privacy: `
<p>이 개인정보처리방침은 ${esc(site)} 방문 시 어떤 정보가 처리될 수 있는지 설명합니다. 사이트는 필요한 정보만 최소한으로 처리하는 것을 목표로 합니다.</p>
<h2>수집하는 정보</h2>
<p>현재 사이트는 정적 정보 사이트이며 계정 생성을 요구하지 않습니다. 문의 이메일을 보내는 경우, 사용자가 이메일에 포함한 정보가 운영자에게 전달됩니다.</p>
<h2>로컬 저장소와 쿠키</h2>
<p>언어 선택, 하이라이트 데모, 관리자 데모 같은 일부 기능은 사용자의 브라우저 로컬 저장소를 사용할 수 있습니다. 이는 다른 사이트를 추적하기 위한 목적이 아닙니다.</p>
<h2>광고와 제3자 공급자</h2>
<p>사이트는 Google AdSense 광고를 사용할 수 있습니다. Google을 포함한 제3자 광고 공급자는 사용자의 이전 방문 정보를 바탕으로 광고를 제공하기 위해 쿠키를 사용할 수 있습니다. 사용자는 Google 광고 설정에서 개인 맞춤 광고를 관리할 수 있으며, Google의 광고 기술 안내에서 자세한 내용을 확인할 수 있습니다.</p>
<h2>사용자의 선택</h2>
<p>브라우저 설정에서 쿠키와 로컬 저장소를 삭제할 수 있습니다. 지역별 법규가 요구하는 경우 광고 쿠키 사용 전에 별도의 동의 절차를 적용해야 합니다.</p>
<h2>문의</h2>
<p>개인정보 관련 문의는 <a href="mailto:${escAttr(email)}">${esc(email)}</a>로 보내 주세요.</p>
<p class="muted">최종 수정일: ${esc(fmtDate(loc, new Date().toISOString()))}</p>`,
    terms: `
<p>${esc(site)}를 이용하면 본 약관에 동의한 것으로 간주됩니다. 이 약관은 일반적인 이용 안내이며 법률 자문이 아닙니다.</p>
<h2>콘텐츠 이용</h2>
<p>사이트의 글, 표, 이미지 카드, 데이터 정리는 일반 정보 제공을 위한 것입니다. 글 링크 공유는 가능하지만 본문 전체를 허락 없이 복제하거나 재배포할 수 없습니다.</p>
<h2>정확성</h2>
<p>피클볼 규칙, 장비, 가격, 선수 정보, 랭킹은 시간이 지나며 바뀔 수 있습니다. 사이트는 가능한 한 공식 출처를 함께 안내하지만 모든 정보가 실시간으로 최신임을 보장하지 않습니다.</p>
<h2>외부 링크</h2>
<p>외부 사이트 링크는 참고용입니다. 외부 사이트의 내용, 가격, 재고, 정책에 대해서는 해당 사이트가 책임집니다.</p>
<h2>문의</h2>
<p>이용약관 관련 문의는 <a href="mailto:${escAttr(email)}">${esc(email)}</a>로 보내 주세요.</p>
<p class="muted">최종 수정일: ${esc(fmtDate(loc, new Date().toISOString()))}</p>`,
    disclaimer: `
<p>${esc(site)}는 피클볼 플레이어를 위한 일반 정보 사이트입니다. 아래 내용을 확인한 뒤 정보를 활용해 주세요.</p>
<h2>일반 정보</h2>
<p>스킬, 훈련, 장비 설명은 일반적인 정보이며 전문 코칭, 의료, 법률 조언을 대체하지 않습니다. 통증이나 부상이 있다면 자격 있는 전문가와 상담하세요.</p>
<h2>장비 정보</h2>
<p>직접 테스트하지 않은 장비는 공개된 스펙과 공식 자료를 바탕으로 비교합니다. 패들의 타구감은 개인차가 크므로 가능하면 직접 시타해 보세요.</p>
<h2>제휴 고지</h2>
<p>일부 외부 링크는 제휴 링크일 수 있습니다. 해당 링크를 통해 구매하면 사이트가 수수료를 받을 수 있으나, 이는 독자에게 추가 비용을 만들지 않습니다.</p>
<h2>최신성</h2>
<p>가격, 랭킹, DUPR, 대회 결과, 승인 장비 여부는 변동됩니다. 중요한 결정 전에는 공식 출처를 다시 확인하세요.</p>
<p>정정 제보: <a href="mailto:${escAttr(email)}">${esc(email)}</a></p>
<p class="muted">최종 수정일: ${esc(fmtDate(loc, new Date().toISOString()))}</p>`,
  };
  const legacy = legalBodies();
  return legacy;
}

'''
s = s[:idx] + legal_for + s[idx:]

# 9) Add writes for trust pages and use localized legal
s = s.replace("  const legal = legalBodies();\n\n  for (const loc of locales) {", "  const legal = legalBodies();\n\n  for (const loc of locales) {\n    const legalLoc = legalBodiesFor(loc);")
s = s.replace("    writePage(loc, 'about', renderAbout(loc));\n    writePage(loc, 'author', renderAuthor(loc));", "    writePage(loc, 'about', renderAbout(loc));\n    writePage(loc, 'editorial-policy', renderEditorialPolicy(loc));\n    writePage(loc, 'corrections', renderCorrections(loc));\n    writePage(loc, 'community-guidelines', renderCommunityGuidelines(loc));\n    writePage(loc, 'advertising-disclosure', renderAdvertisingDisclosure(loc));\n    writePage(loc, 'cookie-notice', renderCookieNotice(loc));\n    writePage(loc, 'author', renderAuthor(loc));")
s = s.replace("    writePage(loc, 'privacy', simplePage(loc, 'privacy/', tt(loc, 'footer.privacy'), '', legal.privacy));\n    writePage(loc, 'terms', simplePage(loc, 'terms/', tt(loc, 'footer.terms'), '', legal.terms));\n    writePage(loc, 'disclaimer', simplePage(loc, 'disclaimer/', tt(loc, 'footer.disclaimer'), '', legal.disclaimer));", "    writePage(loc, 'privacy', simplePage(loc, 'privacy/', tt(loc, 'footer.privacy'), '', legalLoc.privacy));\n    writePage(loc, 'terms', simplePage(loc, 'terms/', tt(loc, 'footer.terms'), '', legalLoc.terms));\n    writePage(loc, 'disclaimer', simplePage(loc, 'disclaimer/', tt(loc, 'footer.disclaimer'), '', legalLoc.disclaimer));")

# 10) Add sitemap main/static links
s = s.replace("    { name: tt(loc, 'nav.about'), href: link(loc, 'about/') },\n    { name: tt(loc, 'author.title'), href: link(loc, 'author/') },", "    { name: tt(loc, 'nav.about'), href: link(loc, 'about/') },\n    { name: tt(loc, 'footer.editorial'), href: link(loc, 'editorial-policy/') },\n    { name: tt(loc, 'footer.corrections'), href: link(loc, 'corrections/') },\n    { name: tt(loc, 'footer.community'), href: link(loc, 'community-guidelines/') },\n    { name: tt(loc, 'footer.advertising'), href: link(loc, 'advertising-disclosure/') },\n    { name: tt(loc, 'footer.cookies'), href: link(loc, 'cookie-notice/') },\n    { name: tt(loc, 'author.title'), href: link(loc, 'author/') },")
s = s.replace("    { name: tt(loc, 'footer.disclaimer'), href: link(loc, 'disclaimer/') },\n  ]);", "    { name: tt(loc, 'footer.disclaimer'), href: link(loc, 'disclaimer/') },\n    { name: tt(loc, 'footer.cookies'), href: link(loc, 'cookie-notice/') },\n  ]);")
s = s.replace("  add('about/', 'monthly', '0.5');\n  add('author/', 'monthly', '0.5');", "  add('about/', 'monthly', '0.5');\n  add('editorial-policy/', 'monthly', '0.4');\n  add('corrections/', 'monthly', '0.4');\n  add('community-guidelines/', 'monthly', '0.4');\n  add('advertising-disclosure/', 'monthly', '0.4');\n  add('cookie-notice/', 'monthly', '0.4');\n  add('privacy/', 'yearly', '0.3');\n  add('terms/', 'yearly', '0.3');\n  add('disclaimer/', 'yearly', '0.3');\n  add('author/', 'monthly', '0.5');")

# 11) Admin public build + robots
s = s.replace("  if (fs.existsSync(path.join(ROOT, 'admin'))) copyDir(path.join(ROOT, 'admin'), path.join(DIST, 'admin'));", "  if (config.exposeAdminDemo && fs.existsSync(path.join(ROOT, 'admin'))) copyDir(path.join(ROOT, 'admin'), path.join(DIST, 'admin'));")
s = s.replace("writeFile('robots.txt', `User-agent: *\\nAllow: /\\n\\nSitemap: ${config.url}/sitemap.xml\\n`);", "writeFile('robots.txt', `User-agent: *\\nAllow: /\\nDisallow: /admin/\\n\\nSitemap: ${config.url}/sitemap.xml\\n`);")

p.write_text(s, encoding='utf-8')
print('build.js patched')
