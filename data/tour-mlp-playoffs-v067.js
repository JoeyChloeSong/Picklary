'use strict';

module.exports = function applyMlpPlayoffsV067(board) {
  if (!board || typeof board !== 'object') return board;

  const UPDATED_AT = '2026-08-05T10:36:00-04:00';
  const UPDATED_LABEL = '2026-08-05 · 10:36 AM ET';
  const officialStandings = 'https://majorleaguepickleball.co/standings/';
  const officialDallas = 'https://majorleaguepickleball.co/events-2026/mlp-playoffs-dallas-2026/';
  const officialNewport = 'https://majorleaguepickleball.co/events-2026/mlp-newport-beach-2026/';
  const officialFinals = 'https://majorleaguepickleball.co/events-2026/mlp-finals-new-york-city-2026/';

  board.updated = UPDATED_LABEL;
  board.editorialNote = {
    en: 'The 2026 MLP regular season is complete. Dallas Round 1 matchups and published start windows are official; quarterfinal opponent selections and Picklary matchup projections remain subject to the Dallas results.',
    ko: '2026 MLP 정규 시즌이 종료됐습니다. Dallas 1라운드 대진과 공개된 시작 시간은 공식 정보이며, 8강 상대 선택과 Picklary 예상 대진은 Dallas 결과에 따라 달라집니다.'
  };

  const standings = [
    { rank:1, team:'New Jersey 5s', points:118, stage:'Quarterfinal bye', stageKo:'8강 직행' },
    { rank:2, team:'St. Louis Shock', points:111, stage:'Quarterfinal bye', stageKo:'8강 직행' },
    { rank:3, team:'Los Angeles Mad Drops', points:86, stage:'Quarterfinal bye', stageKo:'8강 직행' },
    { rank:4, team:'Columbus Sliders', points:83, stage:'Quarterfinal bye', stageKo:'8강 직행' },
    { rank:5, team:'Brooklyn Pickleball Team', points:78, stage:'Dallas Round 1', stageKo:'Dallas 1라운드' },
    { rank:6, team:'Dallas Flash', points:72, stage:'Dallas Round 1', stageKo:'Dallas 1라운드' },
    { rank:7, team:'Palm Beach Royals', points:54, stage:'Dallas Round 1', stageKo:'Dallas 1라운드' },
    { rank:8, team:'Texas Ranchers', points:48, stage:'Dallas Round 1', stageKo:'Dallas 1라운드' },
    { rank:9, team:'Atlanta Bouncers', points:36, stage:'Dallas Round 1', stageKo:'Dallas 1라운드' },
    { rank:10, team:'SoCal Hard Eights', points:34, stage:'Dallas Round 1', stageKo:'Dallas 1라운드' },
    { rank:11, team:'Las Vegas Night Owls', points:34, stage:'Dallas Round 1', stageKo:'Dallas 1라운드' },
    { rank:12, team:'Chicago Slice', points:33, stage:'Dallas Round 1', stageKo:'Dallas 1라운드' }
  ];

  const rosters = [
    { seed:1, team:'New Jersey 5s', points:118, players:['Anna Leigh Waters','Federico Staksrud','Jorja Johnson','Milan Rane','Noe Khlif','Will Howells'], identity:'Elite women’s doubles, controlled first-ball pressure, and multiple mixed combinations.', identityKo:'최상급 여자복식, 첫 공 압박과 다양한 혼합복식 조합이 핵심입니다.', watch:'How opponents manage the Waters–Johnson pair without giving the men’s team a clean rhythm.', watchKo:'상대가 Waters–Johnson 조합을 억제하면서도 남자복식에 리듬을 내주지 않는지가 관건입니다.' },
    { seed:2, team:'St. Louis Shock', points:111, players:['Anna Bright','Kate Fahey','Angie Walker','Hayden Patriquin','Gabe Tardio','Hunter Johnson'], identity:'Four dependable doubles units with pace, countering, and disciplined targeting.', identityKo:'속도, 카운터와 타깃 공략을 갖춘 네 개의 안정적인 복식 조합입니다.', watch:'Whether Bright/Fahey and Patriquin/Tardio can keep dictating the first two games.', watchKo:'Bright/Fahey와 Patriquin/Tardio가 앞선 두 경기를 계속 지배할 수 있는지 주목합니다.' },
    { seed:3, team:'Los Angeles Mad Drops', points:86, players:['Ben Johns','Catherine Parenteau','Connor Garnett','Jade Kawamoto','Max Freeman','Samantha Parker'], identity:'Ben Johns-led point construction, strong mixed options, and high-end counter offense.', identityKo:'Ben Johns 중심의 포인트 설계, 강한 혼합복식 선택지와 상위급 카운터 공격이 특징입니다.', watch:'Which male pairing starts and how LA protects its women’s doubles floor.', watchKo:'어떤 남자 조합을 선발하고 여자복식의 하한선을 어떻게 지키는지가 중요합니다.' },
    { seed:4, team:'Columbus Sliders', points:83, players:['Alexander Crum','Andrei Daescu','CJ Klinger','Judit Castillo','Parris Todd','Tyra Hurricane Black'], identity:'Deep athletic roster, aggressive transition play, and flexible singles coverage.', identityKo:'두터운 운동 능력, 공격적인 전환 플레이와 유연한 단식 대응이 장점입니다.', watch:'Whether the high-ceiling roster settles on its cleanest mixed combinations.', watchKo:'높은 잠재력의 로스터가 가장 안정적인 혼합복식 조합을 확정할 수 있는지 봅니다.' },
    { seed:5, team:'Brooklyn Pickleball Team', points:78, players:['Christian Alshon','Christopher Haworth','Hannah Blatt','Jackie Kawamoto','Rachel Rohrabacher','Riley Newman'], identity:'Balanced doubles depth, elite hands, and several credible DreamBreaker options.', identityKo:'균형 잡힌 복식 뎁스, 최상급 핸즈와 여러 DreamBreaker 선택지가 강점입니다.', watch:'Health and availability matter because Brooklyn’s edge comes from six-player flexibility.', watchKo:'Brooklyn의 우위는 6인 로스터 유연성에서 나오므로 컨디션과 출전 가능 여부가 중요합니다.' },
    { seed:6, team:'Dallas Flash', points:72, players:['Alix Truong','Augustus Ge','Brooke Buckner','Danni-Elle Townsend','Ivan Jakovljevic','JW Johnson'], identity:'Home-court familiarity, JW Johnson’s calm pressure, and proven DreamBreaker resilience.', identityKo:'홈 코트 적응, JW Johnson의 차분한 압박과 검증된 DreamBreaker 대응력이 핵심입니다.', watch:'Dallas can shorten a series if its women’s doubles gives JW Johnson an early lead.', watchKo:'여자복식이 먼저 리드를 만들면 Dallas가 시리즈를 짧게 끝낼 가능성이 커집니다.' },
    { seed:7, team:'Palm Beach Royals', points:54, players:['Casey Diamond','Dekel Bar','Sofia Sewing','Tamaryn Emmrich','Tina Pisnik','Tyson McGuffin'], identity:'Veteran women’s stability, physical men’s doubles, and experienced lineup management.', identityKo:'베테랑 여자복식의 안정성, 힘 있는 남자복식과 풍부한 라인업 경험이 특징입니다.', watch:'The women can create a 1–0 platform, but the men must avoid extended neutral rallies.', watchKo:'여자복식이 1-0 기반을 만들 수 있지만 남자복식은 긴 중립 랠리를 피해야 합니다.' },
    { seed:8, team:'Texas Ranchers', points:48, players:['Eric Oncins','Kaitlyn Christian','Layne Sleeth','Lea Jansen','Nicolas Acevedo','Rafa Hewett'], identity:'Fast transition offense, multiple women’s combinations, and matchup-dependent mixed pairs.', identityKo:'빠른 전환 공격, 다양한 여자 조합과 상대에 맞춘 혼합복식 구성이 특징입니다.', watch:'Texas needs clarity on pair order because Atlanta has enough depth to punish a slow start.', watchKo:'Atlanta가 느린 출발을 응징할 뎁스를 갖췄기 때문에 조합 순서를 명확히 해야 합니다.' },
    { seed:9, team:'Atlanta Bouncers', points:36, players:['Donald Young','Jaume Martinez Vich','Jay Devilliers','Jessie Irvine','Keilly Ulery','Mari Humberg'], identity:'Experienced reset craft, creative men’s pairings, and several disruptive left-right looks.', identityKo:'노련한 리셋, 창의적인 남자 조합과 좌우 배치 변화를 통한 교란이 장점입니다.', watch:'Atlanta’s upset route starts with neutralizing Texas speed in the first four shots.', watchKo:'Atlanta의 업셋 경로는 첫 네 번의 타구에서 Texas의 속도를 억제하는 것부터 시작합니다.' },
    { seed:10, team:'SoCal Hard Eights', points:34, players:['Armaan Bhatia','Cailyn Campbell','Meghan Dizon','Naomi Nguyen','Rafael Lenhard','Will MacKinnon'], identity:'Young speed, singles upside, and volatile but dangerous attacking sequences.', identityKo:'젊은 속도, 단식 잠재력과 변동성은 있지만 위협적인 공격 연속 동작이 특징입니다.', watch:'SoCal wants a DreamBreaker path; Brooklyn wants to close the match before that point.', watchKo:'SoCal은 DreamBreaker 진입을 원하고 Brooklyn은 그 전에 경기를 끝내려 할 것입니다.' },
    { seed:11, team:'Las Vegas Night Owls', points:34, players:['Roscoe Bellamy','Liz Truluck','Callie Smith','Braden Jacobson','Blaine Hovenier','Chao Yi Wang'], identity:'Aggressive singles athletes, physical counters, and confidence in deciding-game pressure.', identityKo:'공격적인 단식 자원, 강한 카운터와 결정전 압박에 대한 자신감이 특징입니다.', watch:'The upset formula is to split the four doubles games and force Dallas into singles.', watchKo:'네 개 복식 경기를 2-2로 나눠 Dallas를 단식 결정전으로 끌고 가는 것이 업셋 공식입니다.' },
    { seed:12, team:'Chicago Slice', points:33, players:['AJ Koller','Elsie Hendershot','Emma Nelson','John Lucian Goins','Ting Chieh Wei','Zane Navratil'], identity:'Counterpunching, left-side variety, and a willingness to win through uncomfortable patterns.', identityKo:'카운터 펀치, 다양한 왼쪽 배치와 불편한 패턴에서도 버티는 경기력이 특징입니다.', watch:'Chicago must keep Palm Beach’s women from controlling the kitchen line early.', watchKo:'Chicago는 Palm Beach 여자 조합이 초반부터 키친 라인을 장악하지 못하게 해야 합니다.' }
  ];

  const playoffSeries = [
    { order:1, higherSeed:7, higher:'Palm Beach Royals', lowerSeed:12, lower:'Chicago Slice', first:'Friday · 2:00 PM CT', firstKo:'금요일 · 오후 2:00 CT', angle:'Palm Beach’s women’s stability versus Chicago’s counterpunching and left-side variety.', angleKo:'Palm Beach 여자복식의 안정성과 Chicago의 카운터·좌측 변화가 맞붙습니다.', picklary:'Slight Palm Beach edge, but Chicago has a credible path if it creates a DreamBreaker.', picklaryKo:'Palm Beach가 근소 우세지만 Chicago가 DreamBreaker를 만들면 충분히 승산이 있습니다.' },
    { order:2, higherSeed:8, higher:'Texas Ranchers', lowerSeed:9, lower:'Atlanta Bouncers', first:'Friday · follows PBR–CHI', firstKo:'금요일 · PBR–CHI 경기 후', angle:'Texas transition speed versus Atlanta’s veteran resets and matchup creativity.', angleKo:'Texas의 전환 속도와 Atlanta의 베테랑 리셋·매치업 변화가 핵심입니다.', picklary:'The closest seed matchup; first-game lineup execution may decide the entire series.', picklaryKo:'시드 차이가 가장 작은 시리즈로 첫 경기 라인업 실행력이 전체 흐름을 결정할 수 있습니다.' },
    { order:3, higherSeed:6, higher:'Dallas Flash', lowerSeed:11, lower:'Las Vegas Night Owls', first:'Friday · follows ATL–TEX', firstKo:'금요일 · ATL–TEX 경기 후', angle:'Dallas structure and home comfort versus Las Vegas singles pressure.', angleKo:'Dallas의 구조적인 운영·홈 적응과 Las Vegas의 단식 압박이 맞붙습니다.', picklary:'Dallas is favored in regulation; Las Vegas becomes more dangerous with every 2–2 split.', picklaryKo:'정규 네 경기에서는 Dallas 우세지만 2-2가 될수록 Las Vegas의 위협이 커집니다.' },
    { order:4, higherSeed:5, higher:'Brooklyn Pickleball Team', lowerSeed:10, lower:'SoCal Hard Eights', first:'Saturday · follows LV–DAL Match 2', firstKo:'토요일 · LV–DAL 2차전 후', angle:'Brooklyn’s six-player balance versus SoCal’s speed and DreamBreaker upside.', angleKo:'Brooklyn의 6인 균형과 SoCal의 속도·DreamBreaker 잠재력이 맞붙습니다.', picklary:'Brooklyn has the deeper regulation lineup; SoCal needs early scoreboard pressure.', picklaryKo:'정규 라인업 뎁스는 Brooklyn 우세이며 SoCal은 초반 스코어 압박이 필요합니다.' }
  ];

  const scheduleRows = [
    { day:'Friday, August 7', dayKo:'8월 7일 금요일', time:'2:00 PM CT', match:'Chicago Slice vs Palm Beach Royals · Match 1', matchKo:'Chicago Slice vs Palm Beach Royals · 1차전', note:'Championship Court', noteKo:'Championship Court' },
    { day:'Friday, August 7', dayKo:'8월 7일 금요일', time:'Follows', timeKo:'이어서', match:'Atlanta Bouncers vs Texas Ranchers · Match 1', matchKo:'Atlanta Bouncers vs Texas Ranchers · 1차전', note:'Rolling schedule', noteKo:'순차 진행' },
    { day:'Friday, August 7', dayKo:'8월 7일 금요일', time:'Follows', timeKo:'이어서', match:'Las Vegas Night Owls vs Dallas Flash · Match 1', matchKo:'Las Vegas Night Owls vs Dallas Flash · 1차전', note:'Rolling schedule', noteKo:'순차 진행' },
    { day:'Saturday, August 8', dayKo:'8월 8일 토요일', time:'11:00 AM CT', match:'Chicago Slice vs Palm Beach Royals · Match 2', matchKo:'Chicago Slice vs Palm Beach Royals · 2차전', note:'Series continuation', noteKo:'시리즈 계속' },
    { day:'Saturday, August 8', dayKo:'8월 8일 토요일', time:'Follows', timeKo:'이어서', match:'Las Vegas Night Owls vs Dallas Flash · Match 2', matchKo:'Las Vegas Night Owls vs Dallas Flash · 2차전', note:'Series continuation', noteKo:'시리즈 계속' },
    { day:'Saturday, August 8', dayKo:'8월 8일 토요일', time:'Follows', timeKo:'이어서', match:'SoCal Hard Eights vs Brooklyn Pickleball Team · Match 1', matchKo:'SoCal Hard Eights vs Brooklyn Pickleball Team · 1차전', note:'Series opener', noteKo:'시리즈 시작' },
    { day:'Saturday, August 8', dayKo:'8월 8일 토요일', time:'If needed', timeKo:'필요 시', match:'Chicago Slice vs Palm Beach Royals · Match 3', matchKo:'Chicago Slice vs Palm Beach Royals · 3차전', note:'Only if series is tied 1–1', noteKo:'시리즈 1-1일 때만' },
    { day:'Sunday, August 9', dayKo:'8월 9일 일요일', time:'11:00 AM CT', match:'Las Vegas Night Owls vs Dallas Flash · Match 3', matchKo:'Las Vegas Night Owls vs Dallas Flash · 3차전', note:'If needed', noteKo:'필요 시' },
    { day:'Sunday, August 9', dayKo:'8월 9일 일요일', time:'Follows', timeKo:'이어서', match:'Atlanta Bouncers vs Texas Ranchers · Match 2', matchKo:'Atlanta Bouncers vs Texas Ranchers · 2차전', note:'Series continuation', noteKo:'시리즈 계속' },
    { day:'Sunday, August 9', dayKo:'8월 9일 일요일', time:'Follows', timeKo:'이어서', match:'SoCal Hard Eights vs Brooklyn Pickleball Team · Match 2', matchKo:'SoCal Hard Eights vs Brooklyn Pickleball Team · 2차전', note:'Series continuation', noteKo:'시리즈 계속' },
    { day:'Sunday, August 9', dayKo:'8월 9일 일요일', time:'If needed', timeKo:'필요 시', match:'Atlanta Bouncers vs Texas Ranchers · Match 3', matchKo:'Atlanta Bouncers vs Texas Ranchers · 3차전', note:'Only if series is tied 1–1', noteKo:'시리즈 1-1일 때만' },
    { day:'Sunday, August 9', dayKo:'8월 9일 일요일', time:'If needed', timeKo:'필요 시', match:'SoCal Hard Eights vs Brooklyn Pickleball Team · Match 3', matchKo:'SoCal Hard Eights vs Brooklyn Pickleball Team · 3차전', note:'Only if series is tied 1–1', noteKo:'시리즈 1-1일 때만' }
  ];

  const projectedPaths = [
    { seed:1, team:'New Jersey 5s', opponent:'Texas Ranchers', note:'If seeds 5–8 all advance, a straight seed-order scenario pairs No. 1 with No. 8.', noteKo:'5–8번 시드가 모두 진출한다고 가정한 단순 시드 순서 시나리오에서는 1번과 8번이 만납니다.' },
    { seed:2, team:'St. Louis Shock', opponent:'Palm Beach Royals', note:'St. Louis would take the next available lower seed in this projection.', noteKo:'이 예상안에서는 St. Louis가 다음으로 낮은 시드를 선택합니다.' },
    { seed:3, team:'Los Angeles Mad Drops', opponent:'Dallas Flash', note:'A Dallas win would create a high-profile Ben Johns–JW Johnson team matchup.', noteKo:'Dallas가 진출하면 Ben Johns와 JW Johnson이 중심이 되는 주목도 높은 팀 매치가 됩니다.' },
    { seed:4, team:'Columbus Sliders', opponent:'Brooklyn Pickleball Team', note:'The remaining teams form a depth-heavy quarterfinal in the seed-order scenario.', noteKo:'남은 두 팀은 뎁스가 강한 8강 대진을 구성하게 됩니다.' }
  ];

  function upsert(list, slug, payload) {
    let item = (list || []).find((x) => x.slug === slug);
    if (!item) { item = { slug }; list.push(item); }
    Object.assign(item, payload);
    return item;
  }

  for (const item of (board.statusEvents || [])) {
    if (String(item.tour || '').toUpperCase() === 'MLP' && item.end && item.end < '2026-08-05') {
      item.status = 'completed';
    }
  }

  upsert(board.statusEvents, 'mlp-playoffs-dallas-2026', {
    status:'upcoming', tour:'MLP', start:'2026-08-07', end:'2026-08-09', updatedAt:UPDATED_AT, updatedAtLabel:UPDATED_LABEL,
    title:'MLP Playoffs — Dallas Round 1', titleKo:'MLP 플레이오프 — Dallas 1라운드',
    location:'Pickler Universe, Carrollton, Texas', locationKo:'미국 텍사스 Carrollton Pickler Universe',
    summary:'Seeds 5–12 begin best-of-three series in Dallas. Brooklyn–SoCal, Dallas–Las Vegas, Palm Beach–Chicago, and Texas–Atlanta decide the four Newport Beach quarterfinal spots.',
    summaryKo:'5–12번 시드가 Dallas에서 3전 2선승제 시리즈를 시작합니다. Brooklyn–SoCal, Dallas–Las Vegas, Palm Beach–Chicago, Texas–Atlanta가 Newport Beach 8강 진출권 4장을 놓고 맞붙습니다.',
    resultHint:'Round 1 · four best-of-three series', resultHintKo:'1라운드 · 3전 2선승제 4개 시리즈',
    sourceName:'Official MLP Dallas Playoffs', sourceUrl:officialDallas, detail:true
  });
  upsert(board.statusEvents, 'mlp-newport-beach-2026', {
    status:'upcoming', tour:'MLP', start:'2026-08-14', end:'2026-08-16', updatedAt:'2026-08-05T10:35:00-04:00', updatedAtLabel:UPDATED_LABEL,
    title:'MLP Playoffs — Newport Beach Quarterfinals', titleKo:'MLP 플레이오프 — Newport Beach 8강',
    location:'Tennis and Pickleball Club, Newport Beach, California', locationKo:'미국 캘리포니아 Newport Beach Tennis and Pickleball Club',
    summary:'Seeds 1–4 enter after a bye and select from the four re-seeded Dallas winners. Matchups become official only after Round 1.',
    summaryKo:'1–4번 시드가 부전승 후 합류해 Dallas 승자 4팀 중 상대를 선택합니다. 실제 대진은 1라운드 종료 후 확정됩니다.',
    resultHint:'Quarterfinal selections follow Dallas', resultHintKo:'Dallas 종료 후 8강 상대 선택',
    sourceName:'Official MLP Newport Beach', sourceUrl:officialNewport, detail:true
  });
  upsert(board.statusEvents, 'mlp-finals-new-york-city-2026', {
    status:'upcoming', tour:'MLP', start:'2026-08-28', end:'2026-08-30', updatedAt:'2026-08-05T10:34:00-04:00', updatedAtLabel:UPDATED_LABEL,
    title:'MLP Finals — New York City', titleKo:'MLP 파이널 — New York City',
    location:'CityPickle at Wollman Rink, New York City', locationKo:'미국 New York City CityPickle at Wollman Rink',
    summary:'The four quarterfinal winners play best-of-three semifinal series, followed by the championship series.',
    summaryKo:'8강 승자 4팀이 3전 2선승제 준결승을 치른 뒤 챔피언 결정 시리즈로 이어집니다.',
    resultHint:'Semifinals and championship · Aug 28–30', resultHintKo:'준결승·챔피언 결정전 · 8월 28–30일',
    sourceName:'Official MLP Finals NYC', sourceUrl:officialFinals, detail:true
  });

  const orlandoStatus = (board.statusEvents || []).find((x) => x.slug === 'mlp-orlando-2026');
  if (orlandoStatus) Object.assign(orlandoStatus, {
    status:'completed', updatedAt:'2026-08-02T17:00:00-04:00', updatedAtLabel:'2026-08-02 · Final',
    summary:'The Orlando finale closed the regular season. New Jersey secured the No. 1 playoff seed, followed by St. Louis, Los Angeles, and Columbus with first-round byes.',
    summaryKo:'Orlando 최종전으로 정규 시즌이 종료됐습니다. New Jersey가 플레이오프 1번 시드를 확보했고 St. Louis, Los Angeles, Columbus가 1라운드 부전승을 받았습니다.',
    resultHint:'Regular season complete · final top 12 set', resultHintKo:'정규 시즌 종료 · 최종 12개 팀 확정'
  });

  const commonPlayoffFacts = {
    standings, rosters, playoffSeries, scheduleRows, projectedPaths,
    projectionNote:'Picklary projection only. Official quarterfinal opponents are selected after Dallas and may not follow straight seed order.',
    projectionNoteKo:'Picklary 예상 시나리오입니다. 공식 8강 상대는 Dallas 종료 후 선택되며 단순 시드 순서와 다를 수 있습니다.'
  };

  upsert(board.tournaments, 'mlp-playoffs-dallas-2026', Object.assign({
    tour:'MLP', status:'upcoming', resultStatus:'upcoming', leadMode:'playoffs', dates:'August 7–9, 2026', datesKo:'2026년 8월 7–9일',
    title:'2026 MLP Playoffs — Dallas Round 1', titleKo:'2026 MLP 플레이오프 — Dallas 1라운드',
    location:'Pickler Universe, Carrollton, Texas', locationKo:'미국 텍사스 Carrollton Pickler Universe',
    resultChecked:UPDATED_LABEL,
    resultNote:'No series has started yet. The bracket, schedule windows, rosters, and Picklary matchup notes reflect the latest published information before first serve.',
    resultNoteKo:'아직 시리즈가 시작되지 않았습니다. 대진, 일정 시간대, 로스터와 Picklary 매치업 노트는 첫 경기 전 최신 공개 정보를 반영합니다.',
    overview:'The expanded postseason opens with four best-of-three series. Seeds 5–8 chose opponents from seeds 9–12, and every winner advances to Newport Beach to join the top four regular-season teams.',
    overviewKo:'확대된 포스트시즌은 3전 2선승제 4개 시리즈로 시작합니다. 5–8번 시드가 9–12번 시드 중 상대를 선택했고 승자 4팀이 Newport Beach에서 정규 시즌 상위 4팀과 합류합니다.',
    participants:['Brooklyn Pickleball Team vs SoCal Hard Eights','Dallas Flash vs Las Vegas Night Owls','Palm Beach Royals vs Chicago Slice','Texas Ranchers vs Atlanta Bouncers'],
    participantsKo:['Brooklyn Pickleball Team vs SoCal Hard Eights','Dallas Flash vs Las Vegas Night Owls','Palm Beach Royals vs Chicago Slice','Texas Ranchers vs Atlanta Bouncers'],
    watch:['Best-of-three lineup adjustments between Match 1 and Match 2','Home-team response rights for mixed doubles and DreamBreaker lineups','Whether lower seeds can force deciding matches through singles depth','How the four winners will be re-seeded for Newport Beach'],
    watchKo:['1차전과 2차전 사이의 라인업 조정','홈팀의 혼합복식·DreamBreaker 라인업 후공 선택권','하위 시드가 단식 뎁스로 결정전을 만들 수 있는지','승자 4팀의 Newport Beach 재시드 방식'],
    storyline:'Dallas is not a fixed knockout bracket. Series winners are re-seeded, then the top four teams select quarterfinal opponents, so every upset changes the next round’s map.',
    storylineKo:'Dallas는 고정 토너먼트 브래킷이 아닙니다. 시리즈 승자를 재시드한 뒤 상위 4팀이 8강 상대를 선택하므로 한 번의 업셋이 다음 라운드 전체 지도를 바꿉니다.',
    notableFacts:['Round 1 uses best-of-three match series.','Seeds 5–8 selected opponents from seeds 9–12.','The higher seed is the home team in the first two matches.','A third match is played only when the series is tied 1–1.','The four winners advance and are re-seeded No. 5–8 for Newport Beach.'],
    notableFactsKo:['1라운드는 3전 2선승제 매치 시리즈입니다.','5–8번 시드가 9–12번 시드 중 상대를 선택했습니다.','첫 두 경기는 상위 시드가 홈팀입니다.','시리즈가 1-1일 때만 3차전을 치릅니다.','승자 4팀은 Newport Beach에서 5–8번으로 재시드됩니다.'],
    stories:[
      { kicker:'SERIES FORMAT', kickerKo:'시리즈 포맷', title:'The second match is a coaching test, not a replay', titleKo:'2차전은 재경기가 아니라 코칭 테스트', body:'Lineup order, targeting, and DreamBreaker choices can all change after the opening match reveals the pressure point.', bodyKo:'1차전에서 약점이 드러난 뒤 라인업 순서, 타깃과 DreamBreaker 선택이 모두 바뀔 수 있습니다.' },
      { kicker:'UPSET LEVER', kickerKo:'업셋 변수', title:'One lower-seed win redraws Newport Beach', titleKo:'하위 시드 한 팀의 승리가 Newport Beach를 다시 그린다', body:'Dallas winners are re-seeded, so an upset changes who the top four teams can select next week.', bodyKo:'Dallas 승자는 재시드되므로 업셋이 발생하면 다음 주 상위 4팀의 선택 대상이 달라집니다.' },
      { kicker:'HOME RESPONSE', kickerKo:'홈팀 대응권', title:'Mixed doubles order is part of the competitive edge', titleKo:'혼합복식 순서 자체가 경쟁 우위', body:'The home team responds to mixed and DreamBreaker lineups, making seed value more than a number beside the team name.', bodyKo:'홈팀이 혼합복식과 DreamBreaker 라인업에 대응하므로 시드의 가치는 팀명 옆 숫자 이상입니다.' }
    ],
    sourceUrl:officialDallas, sourceName:'Official MLP Dallas Playoffs', secondaryUrl:officialStandings, secondaryName:'Final regular-season standings'
  }, commonPlayoffFacts));

  upsert(board.tournaments, 'mlp-newport-beach-2026', {
    tour:'MLP', status:'upcoming', resultStatus:'upcoming', dates:'August 14–16, 2026', datesKo:'2026년 8월 14–16일',
    title:'2026 MLP Playoffs — Newport Beach Quarterfinals', titleKo:'2026 MLP 플레이오프 — Newport Beach 8강',
    location:'Tennis and Pickleball Club, Newport Beach, California', locationKo:'미국 캘리포니아 Newport Beach Tennis and Pickleball Club',
    resultChecked:UPDATED_LABEL,
    resultNote:'Quarterfinal matchups will be selected after Dallas Round 1. The projected path shown below is an editorial scenario, not an official bracket.',
    resultNoteKo:'8강 대진은 Dallas 1라운드 후 선택됩니다. 아래 예상 경로는 편집 시나리오이며 공식 대진이 아닙니다.',
    overview:'New Jersey, St. Louis, Los Angeles, and Columbus enter after first-round byes. The No. 1 seed selects first from the four re-seeded Dallas winners, followed by No. 2 and the remaining seeds.',
    overviewKo:'New Jersey, St. Louis, Los Angeles, Columbus가 1라운드 부전승 후 합류합니다. 1번 시드가 Dallas 승자 4팀 중 먼저 상대를 선택하고 2번 시드와 나머지 팀이 이어서 선택합니다.',
    participants:['New Jersey 5s','St. Louis Shock','Los Angeles Mad Drops','Columbus Sliders','Four Dallas Round 1 winners'],
    participantsKo:['New Jersey 5s','St. Louis Shock','Los Angeles Mad Drops','Columbus Sliders','Dallas 1라운드 승자 4팀'],
    watch:['Opponent selection strategy by the top four seeds','How Dallas winners recover on a five-day turnaround','Whether top seeds choose matchup fit over lowest available seed'],
    watchKo:['상위 4개 시드의 상대 선택 전략','Dallas 승자의 5일 간격 회복','상위 시드가 최하위 시드보다 매치업 적합성을 우선할지'],
    storyline:'The selection format turns opponent choice into part of the competition before the first ball is struck.',
    storylineKo:'상대 선택 방식은 첫 공을 치기 전부터 선택 자체를 경쟁의 일부로 만듭니다.',
    notableFacts:['Best-of-three quarterfinal series','No. 1 selects first from re-seeded No. 5–8','Four winners advance to New York City','Friday starts at 2:00 PM, Saturday at 10:00 AM, and Sunday at noon local time'],
    notableFactsKo:['3전 2선승제 8강 시리즈','1번 시드가 재시드된 5–8번 중 먼저 선택','승자 4팀이 New York City로 진출','현지 기준 금요일 오후 2시, 토요일 오전 10시, 일요일 정오 시작'],
    standings, rosters:rosters.slice(0,4), projectedPaths,
    projectionNote:commonPlayoffFacts.projectionNote, projectionNoteKo:commonPlayoffFacts.projectionNoteKo,
    sourceUrl:officialNewport, sourceName:'Official MLP Newport Beach', secondaryUrl:officialDallas, secondaryName:'Dallas Round 1'
  });

  upsert(board.tournaments, 'mlp-finals-new-york-city-2026', {
    tour:'MLP', status:'upcoming', resultStatus:'upcoming', dates:'August 28–30, 2026', datesKo:'2026년 8월 28–30일',
    title:'2026 MLP Finals — New York City', titleKo:'2026 MLP 파이널 — New York City',
    location:'CityPickle at Wollman Rink, New York City', locationKo:'미국 New York City CityPickle at Wollman Rink',
    resultChecked:UPDATED_LABEL,
    resultNote:'Semifinal teams will be known after Newport Beach. The highest remaining seed selects from the two lowest remaining seeds before the championship series.',
    resultNoteKo:'준결승 진출 팀은 Newport Beach 종료 후 확정됩니다. 남은 최상위 시드가 하위 두 팀 중 상대를 선택한 뒤 챔피언 결정 시리즈로 이어집니다.',
    overview:'The final four play best-of-three semifinals and the two winners meet in a best-of-three championship series at Wollman Rink.',
    overviewKo:'최종 4팀이 Wollman Rink에서 3전 2선승제 준결승을 치르고 승자 2팀이 챔피언 결정 시리즈에서 만납니다.',
    participants:['Four Newport Beach quarterfinal winners'], participantsKo:['Newport Beach 8강 승자 4팀'],
    watch:['Semifinal opponent selection','Lineup fatigue across a three-day finals weekend','DreamBreaker depth under championship pressure'],
    watchKo:['준결승 상대 선택','3일간 파이널 주말의 라인업 피로','우승 압박 속 DreamBreaker 뎁스'],
    storyline:'The selection-driven bracket means the championship path remains fluid until each round is complete.',
    storylineKo:'선택형 대진이므로 각 라운드가 끝날 때까지 우승 경로가 유동적입니다.',
    notableFacts:['Semifinals and final use best-of-three series','Highest remaining seed selects a semifinal opponent','The two semifinal winners play for the 2026 title'],
    notableFactsKo:['준결승과 결승은 3전 2선승제','남은 최상위 시드가 준결승 상대 선택','준결승 승자 2팀이 2026 챔피언 결정'],
    sourceUrl:officialFinals, sourceName:'Official MLP Finals NYC', secondaryUrl:officialNewport, secondaryName:'Newport Beach quarterfinals'
  });

  const orlando = (board.tournaments || []).find((x) => x.slug === 'mlp-orlando-2026');
  if (orlando) Object.assign(orlando, {
    status:'completed', resultStatus:'completed', resultCardMode:'standings', updatedAt:'2026-08-02T17:00:00-04:00',
    resultChecked:'2026-08-05 · final standings verified',
    resultNote:'Orlando completed the regular season. The table below shows the final 12 playoff qualifiers and their postseason entry point.',
    resultNoteKo:'Orlando로 정규 시즌이 종료됐습니다. 아래 표는 최종 플레이오프 진출 12팀과 포스트시즌 시작 라운드를 보여줍니다.',
    overview:'New Jersey closed the season as the No. 1 seed with 118 points. St. Louis, Los Angeles, and Columbus joined the 5s in receiving Dallas byes; seeds 5–12 move into Round 1.',
    overviewKo:'New Jersey가 118점으로 정규 시즌 1번 시드를 차지했습니다. St. Louis, Los Angeles, Columbus도 Dallas 부전승을 받았고 5–12번 시드는 1라운드로 이동합니다.',
    results:[], standings, rosters,
    notableFacts:['New Jersey finished first with 118 standings points.','St. Louis, Los Angeles, and Columbus completed the top four.','Brooklyn, Dallas, Palm Beach, and Texas earned seeds 5–8.','Atlanta, SoCal, Las Vegas, and Chicago filled seeds 9–12.','The regular season is complete; the next official competition is Dallas Round 1.'],
    notableFactsKo:['New Jersey가 118 standings 포인트로 1위를 확정했습니다.','St. Louis, Los Angeles, Columbus가 상위 4팀을 완성했습니다.','Brooklyn, Dallas, Palm Beach, Texas가 5–8번 시드를 받았습니다.','Atlanta, SoCal, Las Vegas, Chicago가 9–12번 시드를 채웠습니다.','정규 시즌은 종료됐고 다음 공식 일정은 Dallas 1라운드입니다.'],
    watch:['How the top four use their recovery week','Which lower seed creates the first Dallas upset','How roster depth changes from one-match events to best-of-three series'],
    watchKo:['상위 4팀의 회복 주간 활용','Dallas에서 첫 업셋을 만드는 하위 시드','단일 매치에서 3전 2선승제로 바뀔 때 로스터 뎁스의 영향'],
    storyline:'Orlando settled qualification but did not lock a traditional bracket. Selection rights keep the postseason path open after every round.',
    storylineKo:'Orlando가 진출 팀을 확정했지만 전통적인 고정 브래킷은 만들지 않았습니다. 상대 선택권 때문에 매 라운드 후 포스트시즌 경로가 다시 열립니다.',
    resultLinks:[{ label:'Final standings', labelKo:'최종 순위', url:officialStandings },{ label:'Dallas Round 1', labelKo:'Dallas 1라운드', url:officialDallas }]
  });

  board.posts = (board.posts || []).filter((x) => !['mlp-orlando-friday-live-0731','mlp-playoffs-dallas-0805','mlp-regular-season-final-0802'].includes(x.id));
  board.posts.unshift(
    {
      id:'mlp-playoffs-dallas-0805', date:'2026-08-05', updatedAt:UPDATED_AT, updatedAtLabel:UPDATED_LABEL,
      kind:'tournament', tour:'MLP', discipline:'team', confidence:'official',
      title:'MLP Dallas Round 1: four best-of-three series open the postseason',
      titleKo:'MLP Dallas 1라운드: 3전 2선승제 4개 시리즈로 포스트시즌 시작',
      summary:'Brooklyn–SoCal, Dallas–Las Vegas, Palm Beach–Chicago, and Texas–Atlanta decide the four teams that join the top four seeds in Newport Beach.',
      summaryKo:'Brooklyn–SoCal, Dallas–Las Vegas, Palm Beach–Chicago, Texas–Atlanta가 Newport Beach에서 상위 4개 시드와 합류할 네 팀을 가립니다.',
      sourceName:'Official MLP Dallas Playoffs', sourceUrl:officialDallas, internalUrl:'tournaments/mlp-playoffs-dallas-2026/'
    },
    {
      id:'mlp-regular-season-final-0802', date:'2026-08-02', updatedAt:'2026-08-02T18:00:00-04:00', updatedAtLabel:'2026-08-02 · Final',
      kind:'result', tour:'MLP', discipline:'team', confidence:'official',
      title:'New Jersey takes the No. 1 seed as the MLP regular season closes',
      titleKo:'MLP 정규 시즌 종료: New Jersey 1번 시드 확정',
      summary:'The 5s finished on 118 points. St. Louis, Los Angeles, and Columbus complete the four Dallas byes, with the next eight teams entering Round 1.',
      summaryKo:'5s가 118점으로 마쳤습니다. St. Louis, Los Angeles, Columbus가 Dallas 부전승 4팀을 완성하고 다음 8팀이 1라운드에 들어갑니다.',
      sourceName:'Official MLP standings', sourceUrl:officialStandings, internalUrl:'tournaments/mlp-orlando-2026/'
    }
  );

  board.storylines = board.storylines || [];
  board.storylines = board.storylines.filter((x) => x.title !== 'Dallas selection rights make seeding part of the strategy');
  board.storylines.unshift({
    date:'2026-08-05', updatedAt:UPDATED_AT, confidence:'analysis', tour:'MLP',
    title:'Dallas selection rights make seeding part of the strategy', titleKo:'Dallas 상대 선택권, 시드 자체를 전략으로 만든다',
    body:'The higher seeds chose Round 1 opponents, and the top four will select again in Newport Beach. Matchup preference can matter more than simply facing the numerically lowest seed.',
    bodyKo:'상위 시드는 1라운드 상대를 선택했고 Newport Beach에서도 상위 4팀이 다시 선택합니다. 단순히 숫자가 가장 낮은 시드보다 매치업 선호가 더 중요할 수 있습니다.',
    sourceName:'Official MLP playoff format', sourceUrl:officialNewport
  });

  return board;
};
