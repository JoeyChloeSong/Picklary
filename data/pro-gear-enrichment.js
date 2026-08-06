'use strict';

const checked = '2026-08-05';

const newPaddles = [
  {
    brand:'JOOLA', model:'Kosmos Pro V', slug:'joola-kosmos-pro-v', style:'all-court', shape:'hybrid',
    core:'Propulsion core with KineticFrame, 14mm / 16mm', face:'Textured carbon fiber', priceBand:'$$$', priceUsd:299.95,
    priceSource:'Official JOOLA product page; verify current stock and certification before purchase', sourceName:'JOOLA Kosmos Pro V', sourceUrl:'https://joola.com/collections/pro-v/products/kosmos-pro-v-pickleball-paddle',
    levels:['3.5','4.0','4.5','5.0'], traits:['power','control','speed','stability'],
    usedBy:'Federico Staksrud (16mm) and Tyson McGuffin (14mm) signature line',
    reviewSignal:'A hybrid-shape Pro V paddle that blends baseline drive power, kitchen hand speed, transition control, and a more usable sweet spot than a fully elongated shape.',
    summary:'The 16mm build suits measured all-court construction; the 14mm build adds a quicker, poppier response for aggressive first-strike play.',
    ratings:{power:8.8,control:8.4,spin:8.5,forgiveness:8.2,speed:8.5},
    translations:{ko:{reviewSignal:'베이스라인 드라이브 파워, 키친 핸드 스피드, 전환 컨트롤을 균형 있게 묶은 하이브리드형 Pro V 패들입니다. 완전한 엘롱게이티드보다 실사용 스위트스폿이 넓습니다.',summary:'16mm는 차분한 올라운드 포인트 설계에, 14mm는 빠르고 팝이 강한 선제 공격에 더 잘 맞습니다.'}},
    image:'/assets/img/paddles/joola-kosmos-pro-v.svg', imageAlt:'Illustrated product card for JOOLA Kosmos Pro V'
  },
  {
    brand:'JOOLA', model:'Scorpeus Pro V', slug:'joola-scorpeus-pro-v', style:'hands', shape:'widebody',
    core:'Propulsion core with KineticFrame, 14mm / 16mm', face:'Textured carbon fiber', priceBand:'$$$', priceUsd:299.95,
    priceSource:'Official JOOLA product page; verify current stock and certification before purchase', sourceName:'JOOLA Scorpeus Pro V', sourceUrl:'https://joola.com/products/scorpeus-pro-v-pickleball-paddle',
    levels:['3.5','4.0','4.5','5.0'], traits:['forgiveness','hands','control','stability'],
    usedBy:'Anna Bright and Collin Johns signature line; also reported in tour use by Catherine Parenteau',
    reviewSignal:'JOOLA’s widest Pro V shape emphasizes a large sweet spot, stability, blocks, resets, counters, and fast doubles exchanges.',
    summary:'A doubles-first paddle for players who want to survive speed, neutralize pace, and redirect the next ball instead of relying on maximum reach.',
    ratings:{power:8.2,control:9.0,spin:8.4,forgiveness:9.2,speed:8.8},
    translations:{ko:{reviewSignal:'JOOLA Pro V 중 가장 넓은 형태로 큰 스위트스폿, 안정성, 블록, 리셋, 카운터와 빠른 복식 교전에 초점을 둡니다.',summary:'최대 리치보다 속도전을 버티고 상대 페이스를 중화한 뒤 다음 공을 재지정하는 복식 플레이어에게 맞습니다.'}},
    image:'/assets/img/paddles/joola-scorpeus-pro-v.svg', imageAlt:'Illustrated product card for JOOLA Scorpeus Pro V'
  },
  {
    brand:'RPM', model:'Friction Pro V2 16mm Elongated', slug:'rpm-friction-pro-v2', style:'all-court', shape:'elongated',
    core:'Tri-density core with enhanced EVA foam ring, 16mm', face:'CarbonBite carbon surface / axial carbon layup', priceBand:'$$$', priceUsd:249.99,
    priceSource:'Official RPM / athlete product pages; verify edition and availability', sourceName:'RPM Friction Pro V2', sourceUrl:'https://drop.dourdarcels.io/products/rpm-x-dour-darcels-james-ignatowich-limited-edition-rpm-friction-pro-16mm-elongated-v2-pickleball-paddle',
    levels:['3.5','4.0','4.5','5.0'], traits:['power','spin','reach','stability'],
    usedBy:'James Ignatowich competition choice; Ella Oh signature editions',
    reviewSignal:'An elongated advanced-player platform designed to combine top-end power and spin with a stable 16mm feel and a broad effective sweet spot.',
    summary:'Best for players who want aggressive drives and high-ball attacks without giving up all of the control needed for resets and kitchen touch.',
    ratings:{power:9.1,control:8.1,spin:9.0,forgiveness:8.4,speed:7.7},
    translations:{ko:{reviewSignal:'상급자의 강한 파워와 스핀, 안정적인 16mm 감각, 넓은 유효 스위트스폿을 함께 노린 엘롱게이티드 플랫폼입니다.',summary:'강한 드라이브와 높은 공 공격을 원하지만 리셋과 키친 터치까지 완전히 포기하고 싶지 않은 플레이어에게 맞습니다.'}},
    image:'/assets/img/paddles/rpm-friction-pro-v2.svg', imageAlt:'Illustrated product card for RPM Friction Pro V2'
  },
  {
    brand:'Facolos', model:'Elite X V2 Gabe Tardio Signature', slug:'facolos-elite-x-v2', style:'all-court', shape:'elongated / hybrid',
    core:'ElsFoam grooved elastic-foam platform, 16mm', face:'Three-layer Toray T700 carbon with TrueGrit texture', priceBand:'$$$', priceUsd:249.99,
    priceSource:'Official Facolos early-access page; competition approval status must be verified', sourceName:'Facolos Elite X V2', sourceUrl:'https://shopfacolos.com/products/elite-x-v2-0-gabe-tardio-green',
    levels:['4.0','4.5','5.0'], traits:['spin','speed','stability','control'],
    usedBy:'Gabe Tardio signature development platform',
    reviewSignal:'A low-balance, spin-forward signature design built for quick counters, controlled drives, transition resets, and a wider effective sweet spot.',
    summary:'The early-access version is positioned for testing and may not carry final tournament approval; verify the production model before sanctioned play.',
    ratings:{power:8.6,control:8.7,spin:9.2,forgiveness:8.5,speed:8.8},
    translations:{ko:{reviewSignal:'낮은 밸런스와 높은 스핀 성능을 바탕으로 빠른 카운터, 통제된 드라이브, 전환 리셋, 넓은 유효 스위트스폿을 노린 시그니처 설계입니다.',summary:'얼리 액세스 버전은 테스트용으로 안내되며 최종 대회 승인 상태가 다를 수 있으므로 공식 경기 전 생산 모델 승인을 확인해야 합니다.'}},
    image:'/assets/img/paddles/facolos-elite-x-v2.svg', imageAlt:'Illustrated product card for Facolos Elite X V2'
  },
  {
    brand:'Franklin', model:'C45 Aurelius Anna Leigh Waters', slug:'franklin-c45-aurelius', style:'all-court', shape:'traditional / wide',
    core:'PowerFlex polymer core, 12.7mm / 14mm / 16mm', face:'T700 carbon applied at 45 degrees', priceBand:'$$$', priceUsd:229.99,
    priceSource:'Official Franklin product page; verify chosen thickness and approval', sourceName:'Franklin ALW C45 Aurelius', sourceUrl:'https://franklinsports.com/anna-leigh-waters-c45-paddle-series',
    levels:['3.5','4.0','4.5','5.0'], traits:['speed','spin','power','control'],
    usedBy:'Anna Leigh Waters official shape and signature C45 line',
    reviewSignal:'A compact, fast C45 shape that supports aggressive counters, early speed-ups, spin, and precise direction changes without the swing weight of a long paddle.',
    summary:'The thinner builds emphasize speed and pop; thicker builds add control and stability for players who want the same shape with more braking power.',
    ratings:{power:8.9,control:8.2,spin:9.0,forgiveness:8.1,speed:9.2},
    translations:{ko:{reviewSignal:'긴 패들의 높은 스윙웨이트 없이 공격적인 카운터, 빠른 스피드업, 스핀과 방향 전환을 지원하는 컴팩트하고 빠른 C45 형태입니다.',summary:'얇은 모델은 속도와 팝, 두꺼운 모델은 같은 형태에서 더 많은 컨트롤과 안정성을 제공합니다.'}},
    image:'/assets/img/paddles/franklin-c45-aurelius.svg', imageAlt:'Illustrated product card for Franklin C45 Aurelius'
  },
  {
    brand:'Franklin', model:'C45 Hayden Patriquin Signature', slug:'franklin-c45-hayden', style:'power', shape:'elongated',
    core:'PowerFlex polymer core, 14mm / 16mm', face:'T700 carbon applied at 45 degrees', priceBand:'$$$', priceUsd:229.99,
    priceSource:'Official Franklin product page; verify thickness and stock', sourceName:'Franklin Hayden C45', sourceUrl:'https://franklinsports.com/c45-hayden-paddle-series',
    levels:['3.5','4.0','4.5','5.0'], traits:['reach','power','spin','speed'],
    usedBy:'Hayden Patriquin signature C45 line',
    reviewSignal:'An elongated C45 platform built for reach, two-handed leverage, spin, and explosive transition attacks.',
    summary:'It fits athletic pressure players who use movement to arrive early and want the paddle to turn that time advantage into pace and angles.',
    ratings:{power:9.0,control:7.9,spin:8.9,forgiveness:7.8,speed:8.5},
    translations:{ko:{reviewSignal:'리치, 투핸드 레버리지, 스핀과 폭발적인 전환 공격을 위해 설계된 엘롱게이티드 C45 플랫폼입니다.',summary:'움직임으로 일찍 도착한 뒤 그 시간 우위를 속도와 각도로 바꾸는 운동 능력 중심 압박형 플레이어에게 맞습니다.'}},
    image:'/assets/img/paddles/franklin-c45-hayden.svg', imageAlt:'Illustrated product card for Franklin Hayden C45'
  },
  {
    brand:'Friday', model:'Fever 102 Elongated 16mm', slug:'friday-fever-102', style:'power', shape:'elongated',
    core:'Polypropylene core with dual edge foam and internal perimeter weighting, 16mm', face:'Carbon performance face', priceBand:'$$', priceUsd:102,
    priceSource:'Current pro-use reports and Friday product positioning; verify the exact production edition', sourceName:'Friday / Rachel announcement', sourceUrl:'https://www.thedinkpickleball.com/friday-pickleball-signs-first-ever-pro-rachel-rohrabacher/',
    levels:['3.5','4.0','4.5','5.0'], traits:['power','spin','reach','stability'],
    usedBy:'Rachel Rohrabacher reported 2026 match-day paddle while her Aura signature model develops',
    reviewSignal:'A value-priced elongated Gen-3-style paddle with meaningful pop, spin, and perimeter stability for aggressive doubles counters.',
    summary:'Its pro fit is about compressing the middle and countering through pace; club players should confirm they can control the extra rebound before copying the setup.',
    ratings:{power:8.8,control:7.4,spin:8.8,forgiveness:8.0,speed:7.6},
    translations:{ko:{reviewSignal:'공격적인 복식 카운터를 위해 충분한 팝, 스핀, 페리미터 안정성을 제공하는 가성비형 엘롱게이티드 Gen-3 계열 패들입니다.',summary:'프로에게는 중앙 압박과 속도 카운터에 맞지만, 동호인은 높은 반발력을 통제할 수 있는지 먼저 확인해야 합니다.'}},
    image:'/assets/img/paddles/friday-fever-102.svg', imageAlt:'Illustrated product card for Friday Fever 102'
  },
  {
    brand:'HIT', model:'Hand Cannon', slug:'hit-hand-cannon', style:'power', shape:'elongated / custom pro',
    core:'Custom pro-tuned construction; production specifications evolving', face:'Performance carbon surface', priceBand:'$$$', priceUsd:null,
    priceSource:'Brand launch coverage; retail specifications and availability may change', sourceName:'Pickleball.com HIT profile', sourceUrl:'https://pickleball.com/people/what-is-hit-pickleball-an-inside-look-at-hunter-johnsons-new-paddle-sponsor',
    levels:['4.0','4.5','5.0'], traits:['power','spin','control','reach'],
    usedBy:'Hunter Johnson custom HIT competition platform',
    reviewSignal:'A pro-custom platform developed around a reinforced handle, strong power and spin, and enough control for direct singles patterns.',
    summary:'This is better treated as a player-equipment story than a normal retail recommendation until final public specifications and availability stabilize.',
    ratings:{power:9.2,control:8.1,spin:8.7,forgiveness:7.7,speed:8.0},
    translations:{ko:{reviewSignal:'강화 핸들, 강한 파워와 스핀, 직접적인 싱글 패턴에 필요한 컨트롤을 중심으로 조정된 프로 커스텀 플랫폼입니다.',summary:'최종 판매 스펙과 공급이 안정되기 전에는 일반 구매 추천보다 선수 장비 스토리로 보는 편이 적절합니다.'}},
    image:'/assets/img/paddles/hit-hand-cannon.svg', imageAlt:'Illustrated product card for HIT Hand Cannon'
  },
  {
    brand:'JOOLA', model:'Agassi Pro V 14mm', slug:'joola-agassi-pro-v', style:'all-court', shape:'extended sweet spot / tennis-inspired',
    core:'Pro V propulsion platform, 14mm', face:'Textured carbon performance face', priceBand:'$$$', priceUsd:299.95,
    priceSource:'Reported 2026 tour use; verify the exact player edition and official product page', sourceName:'Current player-equipment tracking', sourceUrl:'https://www.ppatour.com/player-rankings/',
    levels:['3.5','4.0','4.5','5.0'], traits:['power','control','spin','reach'],
    usedBy:'Reported 2026 tour use by Lea Jansen and Kate Fahey',
    reviewSignal:'A tennis-inspired Pro V shape that offers a high sweet spot, clean drive leverage, spin, and enough control for singles-to-doubles crossover.',
    summary:'It makes most sense for players with compact racquet-sport mechanics who want direct acceleration without moving to the longest paddle shape.',
    ratings:{power:8.8,control:8.2,spin:8.7,forgiveness:8.0,speed:8.1},
    translations:{ko:{reviewSignal:'높은 스위트스폿, 깔끔한 드라이브 레버리지, 스핀과 싱글·복식 전환에 필요한 컨트롤을 제공하는 테니스 기반 Pro V 형태입니다.',summary:'가장 긴 패들까지 가지 않으면서 직접적인 가속을 원하는 컴팩트한 라켓 스포츠 스윙 플레이어에게 잘 맞습니다.'}},
    image:'/assets/img/paddles/joola-agassi-pro-v.svg', imageAlt:'Illustrated product card for JOOLA Agassi Pro V'
  },
  {
    brand:'PIKKL', model:'Hurricane Pro 14mm', slug:'pikkl-hurricane-pro', style:'spin', shape:'widebody / standard',
    core:'Thermoformed polymer core with foam perimeter, 14mm', face:'T700 raw carbon', priceBand:'$$', priceUsd:159.99,
    priceSource:'Current athlete and equipment tracking; verify current Paddletek Group listing', sourceName:'Paddletek Group / Tyra Black', sourceUrl:'https://www.paddletek.com/blogs/news/paddletek-group-announces-landmark-move-agreement-to-acquire-pikkl-and-signing-of-jw-jorja-julie-johnson-and-hurricane-tyra-black',
    levels:['3.5','4.0','4.5','5.0'], traits:['spin','control','speed','forgiveness'],
    usedBy:'Hurricane Tyra Black signature line; PIKKL now part of Paddletek Group',
    reviewSignal:'A quick, spin-first widebody paddle for counters, resets, directional shaping, and elastic defense rather than maximum raw power.',
    summary:'It mirrors Tyra Black’s game: absorb pace, stay balanced, then turn the next ball with spin or a compact counter.',
    ratings:{power:7.8,control:9.0,spin:9.4,forgiveness:8.7,speed:9.0},
    translations:{ko:{reviewSignal:'최대 파워보다 카운터, 리셋, 방향성 스핀과 탄력적인 수비에 초점을 둔 빠른 스핀 우선 와이드바디 패들입니다.',summary:'상대 페이스를 흡수하고 균형을 유지한 뒤 다음 공을 스핀이나 짧은 카운터로 전환하는 Tyra Black의 게임과 닮았습니다.'}},
    image:'/assets/img/paddles/pikkl-hurricane-pro.svg', imageAlt:'Illustrated product card for PIKKL Hurricane Pro'
  },
  {
    brand:'ProXR', model:'Riley Newman Pro 13mm', slug:'proxr-riley-newman-pro', style:'all-court', shape:'elongated / hybrid',
    core:'Charge Core with control and charge perimeter rings, 13mm', face:'Conductive T700 ultra raw carbon', priceBand:'$$$', priceUsd:199.99,
    priceSource:'Current retailer specifications; verify official Paddletek Group availability', sourceName:'Riley Newman Pro product page', sourceUrl:'https://pickleballcentral.com/proxr-riley-newman-pro-pickleball-paddle/',
    levels:['3.5','4.0','4.5','5.0'], traits:['speed','spin','power','control'],
    usedBy:'Riley Newman signature ProXR line under Paddletek Group',
    reviewSignal:'A fast 13mm signature paddle that combines a crisp response, spin, extended reach, and foam-ring stability for aggressive all-court doubles.',
    summary:'The setup rewards early reads and compact attacks; players with late contact may prefer a thicker, calmer paddle.',
    ratings:{power:8.9,control:8.0,spin:9.0,forgiveness:8.0,speed:9.1},
    translations:{ko:{reviewSignal:'공격적인 올라운드 복식을 위해 빠른 13mm 반응, 스핀, 리치, 폼 링 안정성을 결합한 시그니처 패들입니다.',summary:'빠른 판단과 짧은 공격 스윙을 보상하며, 타점이 늦은 플레이어라면 더 두껍고 차분한 패들이 편할 수 있습니다.'}},
    image:'/assets/img/paddles/proxr-riley-newman-pro.svg', imageAlt:'Illustrated product card for ProXR Riley Newman Pro'
  },
  {
    brand:'Paddletek', model:'Bantam TKO-CX 12.7mm', slug:'paddletek-bantam-tko-cx', style:'power', shape:'elongated',
    core:'Bantam QRT polymer core, 12.7mm', face:'PT-700 unidirectional raw carbon', priceBand:'$$$', priceUsd:199.99,
    priceSource:'Official Paddletek product page', sourceName:'Paddletek Bantam TKO-CX', sourceUrl:'https://www.paddletek.com/products/bantam-tko-cx',
    levels:['3.5','4.0','4.5','5.0'], traits:['power','spin','reach','speed'],
    usedBy:'Designed with Christian Alshon',
    reviewSignal:'A long-handle, thin-core attacking paddle built for two-handed backhands, reach, spin, and immediate acceleration.',
    summary:'It fits players who create pressure early; the trade-off is that soft resets demand disciplined hands and clean contact.',
    ratings:{power:9.4,control:7.4,spin:9.0,forgiveness:7.5,speed:8.7},
    translations:{ko:{reviewSignal:'투핸드 백핸드, 리치, 스핀과 즉각적인 가속을 위해 만든 긴 핸들·얇은 코어 공격형 패들입니다.',summary:'일찍 압박을 만드는 플레이어에게 맞지만 부드러운 리셋은 정교한 손과 정확한 타점을 요구합니다.'}},
    image:'/assets/img/paddles/paddletek-bantam-tko-cx.svg', imageAlt:'Illustrated product card for Paddletek Bantam TKO-CX'
  }
];

const gear = {
  'ben-johns': { paddleName:'JOOLA Perseus Pro V 16mm', paddleSlug:'joola-perseus-pro-v', status:'Official signature model', statusKo:'공식 시그니처 모델', verified:checked, sourceName:'JOOLA', sourceUrl:'https://joola.com/collections/pro-v/products/joola-perseus-pro-v-pickleball-paddle-1', traits:['reach','controlled power','spin','ball placement'], traitsKo:['리치','통제된 파워','스핀','볼 배치'], fit:'The elongated shape and flexing frame support his long-lever speed-ups, spin variation, and ability to build a point before finishing.', fitKo:'엘롱게이티드 형태와 플렉스 프레임이 긴 레버리지 스피드업, 스핀 변화, 포인트를 설계한 뒤 마무리하는 스타일을 지원합니다.', copy:'Copy the pace changes and contact discipline, not only the put-away power.', copyKo:'마무리 파워만 따라 하지 말고 속도 변화와 타점 규율을 따라 하세요.', confidence:'official' },
  'anna-leigh-waters': { paddleName:'Franklin C45 Aurelius (ALW shape)', paddleSlug:'franklin-c45-aurelius', status:'Official signature line', statusKo:'공식 시그니처 라인', verified:checked, sourceName:'Franklin Sports', sourceUrl:'https://franklinsports.com/anna-leigh-waters-c45-paddle-series', traits:['hand speed','spin','counter pop','direction change'], traitsKo:['핸드 스피드','스핀','카운터 팝','방향 전환'], fit:'The compact official shape keeps the paddle fast during rapid exchanges while the textured carbon and PowerFlex core preserve spin and attack speed.', fitKo:'컴팩트한 공식 형태가 고속 교전에서 패들을 빠르게 유지하고, 카본 표면과 PowerFlex 코어가 스핀과 공격 속도를 살립니다.', copy:'Her advantage comes from early preparation; a fast paddle cannot replace early recognition.', copyKo:'핵심 강점은 조기 준비입니다. 빠른 패들이 빠른 판단을 대신할 수는 없습니다.', confidence:'official' },
  'federico-staksrud': { paddleName:'JOOLA Kosmos Pro V 16mm', paddleSlug:'joola-kosmos-pro-v', status:'Official signature model', statusKo:'공식 시그니처 모델', verified:checked, sourceName:'JOOLA', sourceUrl:'https://joola.com/collections/professional-pickleball-paddles/products/kosmos-pro-v-pickleball-paddle', traits:['dwell time','hybrid reach','transition control','drive stability'], traitsKo:['체류감','하이브리드 리치','전환 컨트롤','드라이브 안정성'], fit:'The 16mm hybrid gives him enough dwell to slow transition balls while retaining the drive leverage needed for his disciplined singles patterns.', fitKo:'16mm 하이브리드가 전환 공을 늦출 체류감을 주면서도 규율 있는 싱글 패턴에 필요한 드라이브 레버리지를 유지합니다.', copy:'Use the paddle to support a repeatable pattern; do not expect it to create the pattern for you.', copyKo:'패들은 반복 가능한 패턴을 지원해야지, 패턴 자체를 대신 만들어 주지는 않습니다.', confidence:'official' },
  'jw-johnson': { paddleName:'PIKKL / Paddletek Group performance platform', paddleSlug:'', status:'Current brand platform; exact match-day model not publicly pinned', statusKo:'현재 브랜드 플랫폼·정확한 경기 모델은 공개 확인 중', verified:checked, sourceName:'Paddletek Group', sourceUrl:'https://www.paddletek.com/blogs/news/paddletek-group-announces-landmark-move-agreement-to-acquire-pikkl-and-signing-of-jw-jorja-julie-johnson-and-hurricane-tyra-black', traits:['stability','compact counters','two-handed control','low extra motion'], traitsKo:['안정성','짧은 카운터','투핸드 컨트롤','불필요한 동작 최소화'], fit:'His equipment search points toward a stable, predictable platform that preserves compact mechanics and two-handed control.', fitKo:'장비 선택 흐름은 짧은 스윙과 투핸드 컨트롤을 유지하는 안정적이고 예측 가능한 플랫폼을 향합니다.', copy:'Focus on his short preparation and quiet hands while the exact model remains fluid.', copyKo:'정확한 모델이 바뀔 수 있는 시기에는 짧은 준비와 조용한 손을 중심으로 관찰하세요.', confidence:'brand' },
  'catherine-parenteau': { paddleName:'JOOLA Scorpeus Pro V 14mm', paddleSlug:'joola-scorpeus-pro-v', status:'Verified 2026 tour use (not a signature model)', statusKo:'2026 투어 사용 확인·시그니처 모델 아님', verified:'2026-05-22', sourceName:'JOOLA tour equipment report', sourceUrl:'https://joola.com/blogs/updates/joola-leads-all-paddle-brands-in-2026-ppa-medals', traits:['forgiveness','fast blocks','counter stability','all-court consistency'], traitsKo:['관용성','빠른 블록','카운터 안정성','올코트 일관성'], fit:'The widebody Scorpeus gives her a stable contact window that complements low-error pressure and disciplined doubles defense.', fitKo:'와이드바디 Scorpeus가 안정적인 타점 영역을 제공해 낮은 실수율의 압박과 규율 있는 복식 수비를 보완합니다.', copy:'The lesson is high-percentage contact, not simply using a wide paddle.', copyKo:'배울 점은 단순히 넓은 패들을 쓰는 것이 아니라 성공 확률 높은 타점을 반복하는 것입니다.', confidence:'verified' },
  'anna-bright': { paddleName:'JOOLA Scorpeus Pro V 14mm / 16mm', paddleSlug:'joola-scorpeus-pro-v', status:'Official signature line', statusKo:'공식 시그니처 라인', verified:checked, sourceName:'JOOLA', sourceUrl:'https://joola.com/products/scorpeus-pro-v-pickleball-paddle', traits:['fast hands','large sweet spot','counter stability','reset control'], traitsKo:['빠른 손','큰 스위트스폿','카운터 안정성','리셋 컨트롤'], fit:'The shortest, widest Pro V shape supports her high-speed women’s doubles exchanges and aggressive countering without losing defensive stability.', fitKo:'짧고 넓은 Pro V 형태가 빠른 여자복식 교전과 공격적 카운터를 지원하면서 수비 안정성을 유지합니다.', copy:'Notice how she earns offense through stable defense before accelerating.', copyKo:'바로 가속하기보다 안정적인 수비로 공격권을 먼저 얻는 과정을 관찰하세요.', confidence:'official' },
  'tyson-mcguffin': { paddleName:'JOOLA Kosmos Pro V 14mm', paddleSlug:'joola-kosmos-pro-v', status:'Official signature model', statusKo:'공식 시그니처 모델', verified:checked, sourceName:'JOOLA', sourceUrl:'https://joola.com/collections/professional-pickleball-paddles/products/kosmos-pro-v-pickleball-paddle', traits:['quick response','drive pop','hand speed','hybrid sweet spot'], traitsKo:['빠른 반응','드라이브 팝','핸드 스피드','하이브리드 스위트스폿'], fit:'The 14mm hybrid version matches his fast, aggressive first-strike style while keeping more usable face width than a narrow elongated paddle.', fitKo:'14mm 하이브리드가 빠르고 공격적인 선제 스타일에 맞으며 좁은 엘롱게이티드보다 넓은 유효 면적을 유지합니다.', copy:'Pair the pop with footwork and recovery; otherwise the same rebound can increase errors.', copyKo:'팝을 풋워크와 회복 동작에 연결해야 합니다. 그렇지 않으면 같은 반발력이 실수를 늘릴 수 있습니다.', confidence:'official' },
  'riley-newman': { paddleName:'ProXR Riley Newman Pro 13mm', paddleSlug:'proxr-riley-newman-pro', status:'Signature product line', statusKo:'시그니처 제품 라인', verified:checked, sourceName:'ProXR product listing', sourceUrl:'https://pickleballcentral.com/proxr-riley-newman-pro-pickleball-paddle/', traits:['fast response','spin','extended reach','foam-ring stability'], traitsKo:['빠른 반응','스핀','확장 리치','폼 링 안정성'], fit:'The thin core and extended handle suit his early attacks, two-handed leverage, and fast all-court doubles decisions.', fitKo:'얇은 코어와 긴 핸들이 빠른 공격, 투핸드 레버리지, 신속한 올라운드 복식 판단에 맞습니다.', copy:'Copy his preparation and body position before copying the thin-core pop.', copyKo:'얇은 코어의 팝보다 먼저 준비 자세와 몸 위치를 따라 하세요.', confidence:'product' },
  'james-ignatowich': { paddleName:'RPM Friction Pro V2 16mm Elongated', paddleSlug:'rpm-friction-pro-v2', status:'Official competition choice / co-designed line', statusKo:'공식 경기 선택·공동 설계 라인', verified:checked, sourceName:'RPM', sourceUrl:'https://drop.dourdarcels.io/products/rpm-x-dour-darcels-james-ignatowich-limited-edition-rpm-friction-pro-16mm-elongated-v2-pickleball-paddle', traits:['top-end power','spin','reach','stable 16mm feel'], traitsKo:['상단 파워','스핀','리치','안정적인 16mm 감각'], fit:'The elongated 16mm build preserves reach and aggressive drive power while giving his high-speed game enough stability to reset and counter.', fitKo:'엘롱게이티드 16mm 구조가 리치와 강한 드라이브 파워를 유지하면서 고속 게임에 필요한 리셋·카운터 안정성을 제공합니다.', copy:'Use the reach to create better contact, not to swing bigger from a late position.', copyKo:'늦은 위치에서 더 크게 휘두르기보다 리치를 활용해 더 좋은 타점을 만드세요.', confidence:'official' },
  'christian-alshon': { paddleName:'Paddletek Bantam TKO-CX 12.7mm', paddleSlug:'paddletek-bantam-tko-cx', status:'Official co-designed model', statusKo:'공식 공동 설계 모델', verified:checked, sourceName:'Paddletek', sourceUrl:'https://www.paddletek.com/products/bantam-tko-cx', traits:['explosive power','two-handed handle','spin','reach'], traitsKo:['폭발적 파워','투핸드 핸들','스핀','리치'], fit:'A thin core, long handle, and elongated face reinforce his two-handed offense, speed-ups, and willingness to attack before the point fully settles.', fitKo:'얇은 코어, 긴 핸들, 엘롱게이티드 면이 투핸드 공격, 스피드업, 포인트가 완전히 안정되기 전의 선제 공격을 강화합니다.', copy:'Only copy the early attack after building the same contact height and recovery discipline.', copyKo:'같은 타점 높이와 회복 규율을 만든 뒤에만 빠른 공격 선택을 따라 하세요.', confidence:'official' },
  'lea-jansen': { paddleName:'JOOLA Agassi Pro V 14mm', paddleSlug:'joola-agassi-pro-v', status:'Reported 2026 tour use; verify before purchase', statusKo:'2026 투어 사용 보도·구매 전 재확인', verified:'2026-05-18', sourceName:'Current player profile tracking', sourceUrl:'https://pickleball.com/players/lea-jansen', traits:['drive leverage','compact swing','spin','singles control'], traitsKo:['드라이브 레버리지','컴팩트 스윙','스핀','싱글 컨트롤'], fit:'The tennis-inspired shape complements her compact drive mechanics and direct singles pressure without forcing the highest swing weight.', fitKo:'테니스 기반 형태가 높은 스윙웨이트를 강요하지 않으면서 컴팩트한 드라이브와 직접적인 싱글 압박을 보완합니다.', copy:'Her consistency and movement matter more than the racquet-like shape.', copyKo:'라켓과 닮은 형태보다 일관성과 움직임이 더 중요합니다.', confidence:'reported' },
  'lucy-kovalova': { paddleName:'ONIX Evoke Premier', paddleSlug:'onix-evoke-premier', status:'Co-developed signature line', statusKo:'공동 개발 시그니처 라인', verified:checked, sourceName:'ONIX', sourceUrl:'https://www.onixpickleball.com/products/evoke-premier-pickleball-paddle-v2', traits:['solid power','composite pop','touch','stable standard face'], traitsKo:['단단한 파워','컴포지트 팝','터치','안정적인 표준 면'], fit:'The solid standard face and composite response suit her structured doubles patterns and strong, compact put-aways.', fitKo:'단단한 표준 면과 컴포지트 반응이 구조적인 복식 패턴과 강하고 짧은 마무리에 맞습니다.', copy:'Study the compact finish and court position instead of adding unnecessary swing length.', copyKo:'불필요하게 스윙을 늘리기보다 짧은 마무리와 코트 위치를 관찰하세요.', confidence:'official' },
  'ella-oh': { paddleName:'RPM Friction Pro V2 Pink Signature', paddleSlug:'rpm-friction-pro-v2', status:'Official signature line', statusKo:'공식 시그니처 라인', verified:checked, sourceName:'Ella Oh official site', sourceUrl:'https://ellaoh.com/paddle.html', traits:['configurable shape','controlled power','spin','junior-friendly options'], traitsKo:['선택 가능한 형태','통제된 파워','스핀','주니어 선택지'], fit:'The line offers elongated or widebody shapes and 14mm or 16mm cores, allowing the equipment to follow her growth rather than locking a junior into one extreme setup.', fitKo:'엘롱게이티드·와이드바디와 14mm·16mm 선택지가 있어 성장 중인 주니어를 하나의 극단적인 세팅에 고정하지 않습니다.', copy:'Young players should copy her preparation and development process, not assume a premium paddle replaces coaching.', copyKo:'주니어는 고가 패들이 코칭을 대신한다고 생각하지 말고 준비 동작과 성장 과정을 따라 해야 합니다.', confidence:'official' },
  'gabriel-tardio': { paddleName:'Facolos Elite X V2 Gabe Tardio Signature', paddleSlug:'facolos-elite-x-v2', status:'Official signature development platform; approval varies by edition', statusKo:'공식 시그니처 개발 플랫폼·버전별 승인 확인 필요', verified:checked, sourceName:'Facolos', sourceUrl:'https://shopfacolos.com/products/elite-x-v2-0-gabe-tardio-green', traits:['low balance','spin','counter speed','stability'], traitsKo:['낮은 밸런스','스핀','카운터 속도','안정성'], fit:'A lower balance point and wider effective sweet spot match his high-hand grip, compact backhand counters, and ability to redirect pace through the middle.', fitKo:'낮은 밸런스와 넓은 유효 스위트스폿이 높은 그립 위치, 짧은 백핸드 카운터, 중앙으로 페이스를 재지정하는 능력에 맞습니다.', copy:'His unusual grip and timing are personal; copy the early read, not the grip blindly.', copyKo:'독특한 그립과 타이밍은 개인적입니다. 그립을 그대로 따라 하기보다 조기 판단을 배우세요.', confidence:'official' },
  'hayden-patriquin': { paddleName:'Franklin C45 Hayden Patriquin 14mm / 16mm', paddleSlug:'franklin-c45-hayden', status:'Official signature line', statusKo:'공식 시그니처 라인', verified:checked, sourceName:'Franklin Sports', sourceUrl:'https://franklinsports.com/c45-hayden-paddle-series', traits:['reach','spin','transition pop','two-handed leverage'], traitsKo:['리치','스핀','전환 팝','투핸드 레버리지'], fit:'The elongated C45 turns his court speed into earlier contact, giving him leverage for counters, poaches, and transition attacks.', fitKo:'엘롱게이티드 C45가 빠른 코트 이동을 더 이른 타점으로 바꾸고 카운터, 포치, 전환 공격에 레버리지를 제공합니다.', copy:'The paddle works because he arrives early; improve movement before choosing extra reach.', copyKo:'패들이 작동하는 이유는 그가 일찍 도착하기 때문입니다. 추가 리치보다 먼저 움직임을 개선하세요.', confidence:'official' },
  'kate-fahey': { paddleName:'JOOLA Agassi Pro V 14mm', paddleSlug:'joola-agassi-pro-v', status:'Reported current tour paddle; sponsorship has changed', statusKo:'현재 투어 패들 보도·스폰서 변경 이력 있음', verified:'2026-07-16', sourceName:'Current pro-paddle tracker', sourceUrl:'https://www.ppatour.com/athletes/kate-fahey/', traits:['singles drive','high sweet spot','spin','transition control'], traitsKo:['싱글 드라이브','높은 스위트스폿','스핀','전환 컨트롤'], fit:'The tennis-inspired shape supports deep, repeatable singles drives while keeping a manageable transition feel as her doubles game develops.', fitKo:'테니스 기반 형태가 깊고 반복 가능한 싱글 드라이브를 지원하고, 복식 게임이 성장하는 과정에서 다룰 만한 전환 감각을 유지합니다.', copy:'Copy repeatable depth and footwork; the paddle is secondary to her physical point construction.', copyKo:'반복 가능한 깊이와 풋워크를 따라 하세요. 패들은 체력 기반 포인트 설계보다 부차적입니다.', confidence:'reported' },
  'jorja-johnson': { paddleName:'PIKKL / Paddletek Group performance platform', paddleSlug:'', status:'Current brand platform; prototype/model still evolving publicly', statusKo:'현재 브랜드 플랫폼·프로토타입/모델 공개 변화 중', verified:checked, sourceName:'Paddletek Group', sourceUrl:'https://www.paddletek.com/blogs/news/paddletek-group-announces-landmark-move-agreement-to-acquire-pikkl-and-signing-of-jw-jorja-julie-johnson-and-hurricane-tyra-black', traits:['hand speed','light handling','two-handed backhand','soft-game creativity'], traitsKo:['핸드 스피드','가벼운 조작성','투핸드 백핸드','소프트 게임 창의성'], fit:'Her equipment path favors low swing resistance and fast orientation so she can disguise direction and react in kitchen exchanges.', fitKo:'장비 선택은 낮은 스윙 저항과 빠른 방향 전환을 선호해 키친 교전에서 방향을 숨기고 반응하는 데 초점을 둡니다.', copy:'The key is loose hands and early paddle position, not chasing the lightest possible setup.', copyKo:'핵심은 가장 가벼운 세팅이 아니라 힘을 뺀 손과 이른 패들 위치입니다.', confidence:'brand' },
  'hurricane-tyra-black': { paddleName:'PIKKL Hurricane Pro 14mm', paddleSlug:'pikkl-hurricane-pro', status:'Official signature line within Paddletek Group', statusKo:'Paddletek Group 내 공식 시그니처 라인', verified:checked, sourceName:'Paddletek Group', sourceUrl:'https://www.paddletek.com/blogs/news/paddletek-group-announces-landmark-move-agreement-to-acquire-pikkl-and-signing-of-jw-jorja-julie-johnson-and-hurricane-tyra-black', traits:['spin','fast hands','control','defensive stability'], traitsKo:['스핀','빠른 손','컨트롤','수비 안정성'], fit:'The quick widebody and spin-first face support elastic defense, compact counters, and the ability to change direction after absorbing pace.', fitKo:'빠른 와이드바디와 스핀 우선 표면이 탄력적인 수비, 짧은 카운터, 상대 페이스 흡수 후 방향 전환을 지원합니다.', copy:'Copy the defend-then-counter sequence rather than forcing offense from a bad height.', copyKo:'나쁜 높이에서 공격을 억지로 만들기보다 수비 후 카운터 순서를 따라 하세요.', confidence:'official' },
  'hunter-johnson': { paddleName:'HIT Pickleball Hand Cannon custom platform', paddleSlug:'hit-hand-cannon', status:'Current pro-custom platform; retail specs evolving', statusKo:'현재 프로 커스텀 플랫폼·판매 스펙 변화 중', verified:'2026-01-30', sourceName:'Pickleball.com', sourceUrl:'https://pickleball.com/people/what-is-hit-pickleball-an-inside-look-at-hunter-johnsons-new-paddle-sponsor', traits:['first-ball power','spin','custom handle','singles control'], traitsKo:['첫 공 파워','스핀','커스텀 핸들','싱글 컨트롤'], fit:'The custom platform is tuned around a solid handle, direct power, and enough touch to turn serve-plus-one pressure into shorter singles points.', fitKo:'단단한 커스텀 핸들, 직접적인 파워, 서브 후 첫 공격을 짧은 싱글 포인트로 연결할 터치에 맞춰 조정됩니다.', copy:'Copy the serve-plus-one structure; a custom paddle cannot fix a weak first-step recovery.', copyKo:'서브 후 첫 공격 구조를 배우세요. 커스텀 패들도 약한 첫 스텝 회복을 고쳐 주지는 않습니다.', confidence:'verified' },
  'rachel-rohrabacher': { paddleName:'Friday Fever 102 Elongated 16mm', paddleSlug:'friday-fever-102', status:'Verified 2026 match-day model; Aura signature model announced', statusKo:'2026 경기 모델 확인·Aura 시그니처 모델 개발 발표', verified:'2026-07-16', sourceName:'Friday signing report', sourceUrl:'https://www.thedinkpickleball.com/friday-pickleball-signs-first-ever-pro-rachel-rohrabacher/', traits:['counter power','middle pressure','spin','perimeter stability'], traitsKo:['카운터 파워','중앙 압박','스핀','페리미터 안정성'], fit:'The elongated, lively platform gives her enough punch to compress the middle while perimeter weighting helps stabilize rapid counters.', fitKo:'반발력 있는 엘롱게이티드 플랫폼이 중앙을 압축할 펀치를 제공하고, 페리미터 웨이팅이 빠른 카운터를 안정시킵니다.', copy:'Her middle pressure works because of anticipation and recovery, not only paddle pop.', copyKo:'중앙 압박은 패들 팝만이 아니라 예측과 회복 때문에 작동합니다.', confidence:'verified' }
};

module.exports = function enrich(players, paddles) {
  for (const np of newPaddles) {
    const existing = paddles.find((p) => p.slug === np.slug);
    if (existing) Object.assign(existing, np);
    else paddles.push(np);
  }
  for (const player of players) {
    const g = gear[player.slug];
    if (!g) continue;
    player.gear = g;
    player.paddle = g.paddleName;
    if (g.paddleSlug) player.paddleSlug = g.paddleSlug;
  }
  for (const paddle of paddles) {
    const users = players.filter((p) => p.gear && p.gear.paddleSlug === paddle.slug);
    if (users.length) {
      paddle.proUsers = users.map((p) => p.slug);
      paddle.usedBy = users.map((p) => p.name).join(', ') + (paddle.usedBy ? ' · ' + paddle.usedBy : '');
    }
  }
  return { players, paddles };
};
