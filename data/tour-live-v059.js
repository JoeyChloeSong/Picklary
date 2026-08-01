'use strict';

module.exports = function applyTourLiveV059(board) {
  if (!board || typeof board !== 'object') return board;
  board.updated = '2026-07-31 · 5:35 PM ET';
  board.editorialNote = {
    en: 'MLP Orlando is live. Completed matches below were checked against the official event scoreboard at 5:35 PM ET on July 31; later matches, group tables, and playoff positions can change during the day.',
    ko: 'MLP 올랜도 대회가 진행 중입니다. 아래 완료 경기는 7월 31일 오후 5시 35분(미 동부시간) 공식 이벤트 스코어보드 기준이며 이후 경기, 조별 순위와 플레이오프 위치는 당일에도 바뀔 수 있습니다.'
  };

  const matches = [
    { division:'Friday · Phoenix Flames vs St. Louis Shock', divisionKo:'금요일 · Phoenix Flames vs St. Louis Shock', champ:'St. Louis Shock', silver:'Phoenix Flames', score:'4–0 · 11–2, 11–5, 11–2, 11–2' },
    { division:'Friday · Palm Beach Royals vs LA Mad Drops', divisionKo:'금요일 · Palm Beach Royals vs LA Mad Drops', champ:'LA Mad Drops', silver:'Palm Beach Royals', score:'3–1 · 11–3, 11–1, 11–5, 8–11' },
    { division:'Friday · Las Vegas Night Owls vs Brooklyn Pickleball Team', divisionKo:'금요일 · Las Vegas Night Owls vs Brooklyn Pickleball Team', champ:'Las Vegas Night Owls', silver:'Brooklyn Pickleball Team', score:'2–2 · DreamBreaker 21–16' },
    { division:'Friday · New Jersey 5s vs Chicago Slice', divisionKo:'금요일 · New Jersey 5s vs Chicago Slice', champ:'New Jersey 5s', silver:'Chicago Slice', score:'3–1 · 11–2, 6–11, 11–5, 11–2' },
    { division:'Friday · LA Mad Drops vs California Black Bears', divisionKo:'금요일 · LA Mad Drops vs California Black Bears', champ:'LA Mad Drops', silver:'California Black Bears', score:'4–0 · 13–11, 11–1, 11–9, 11–3' },
    { division:'Friday · Orlando Squeeze vs Phoenix Flames', divisionKo:'금요일 · Orlando Squeeze vs Phoenix Flames', champ:'Orlando Squeeze', silver:'Phoenix Flames', score:'3–1 · 11–7, 8–11, 11–9, 11–5' },
    { division:'Friday · Carolina Hogs vs Chicago Slice', divisionKo:'금요일 · Carolina Hogs vs Chicago Slice', champ:'Chicago Slice', silver:'Carolina Hogs', score:'3–1 · 11–2, 11–4, 11–9, 4–11' }
  ];

  const status = (board.statusEvents || []).find((x) => x.slug === 'mlp-orlando-2026');
  if (status) Object.assign(status, {
    status:'live', start:'2026-07-30', end:'2026-08-02',
    updatedAt:'2026-07-31T17:35:00-04:00',
    updatedAtLabel:'2026-07-31 · 5:35 PM ET',
    summary:'The regular-season finale is live at Walt Disney World. Seven Friday matches were final at the latest checkpoint, including regulation wins for St. Louis, LA, New Jersey, Orlando and Chicago plus a Las Vegas DreamBreaker win.',
    summaryKo:'Walt Disney World에서 정규 시즌 최종전이 진행 중입니다. 최신 확인 시점에 금요일 7경기가 종료됐으며 St. Louis, LA, New Jersey, Orlando, Chicago의 정규 승리와 Las Vegas의 DreamBreaker 승리가 포함됩니다.',
    resultHint:'Live · 7 Friday matches verified at 5:35 PM ET',
    resultHintKo:'진행 중 · 금요일 완료 경기 7개 확인 (오후 5:35 ET)'
  });

  // Close stale July statuses so the live count reflects the current calendar.
  for (const x of (board.statusEvents || [])) {
    if (x.slug === 'ppa-italy-portoroz-2026') {
      x.status='completed'; x.detail=true;
      x.resultHint='Completed · official podium publication pending';
      x.resultHintKo='완료 · 공식 포디엄 공개 대기';
      x.location='Portoroz, Slovenia'; x.locationKo='슬로베니아 포르토로즈';
    }
  }

  const event = (board.tournaments || []).find((x) => x.slug === 'mlp-orlando-2026');
  if (event) Object.assign(event, {
    status:'live', resultStatus:'live', resultCardMode:'matches',
    updatedAt:'2026-07-31T17:35:00-04:00',
    resultChecked:'2026-07-31 · 5:35 PM ET',
    resultNote:'Friday remains live. These seven completed matches were verified from the official MLP Orlando scoreboard; matches showing partial scores at the checkpoint are not published as final.',
    resultNoteKo:'금요일 일정은 계속 진행 중입니다. 아래 7경기는 공식 MLP 올랜도 스코어보드에서 완료를 확인했으며, 확인 시점에 일부 스코어만 표시된 경기는 최종 결과로 게시하지 않았습니다.',
    results:matches,
    overview:'The final regular-season stop is live at ESPN Wide World of Sports. Friday has already produced a St. Louis sweep, two LA regulation wins, a Las Vegas DreamBreaker, and important responses from New Jersey, Orlando and Chicago as the playoff cut tightens.',
    overviewKo:'ESPN Wide World of Sports에서 정규 시즌 최종전이 진행 중입니다. 금요일에는 St. Louis의 스윕, LA의 정규 승리 2회, Las Vegas의 DreamBreaker 승리와 함께 New Jersey, Orlando, Chicago가 플레이오프 컷 경쟁에 중요한 승리를 추가했습니다.',
    notableFacts:[
      'St. Louis opened Friday by sweeping Phoenix in four games.',
      'LA Mad Drops beat Palm Beach 3-1 and California 4-0 in its first two Friday matches.',
      'Las Vegas and Brooklyn split doubles before the Night Owls won the DreamBreaker 21-16.',
      'New Jersey beat Chicago 3-1, while Chicago later answered with a 3-1 win over Carolina.',
      'Host Orlando beat Phoenix 3-1 as group-play pressure increased.',
      'The event remains live, so standings and the final playoff bracket are not yet settled.'
    ],
    notableFactsKo:[
      'St. Louis는 Phoenix를 네 경기 스윕하며 금요일을 시작했습니다.',
      'LA Mad Drops는 금요일 첫 두 경기에서 Palm Beach를 3-1, California를 4-0으로 이겼습니다.',
      'Las Vegas와 Brooklyn은 복식을 2-2로 나눈 뒤 Night Owls가 DreamBreaker를 21-16으로 이겼습니다.',
      'New Jersey는 Chicago를 3-1로 이겼고, Chicago는 이어 Carolina를 3-1로 꺾으며 반등했습니다.',
      '홈팀 Orlando는 Phoenix를 3-1로 이기며 조별 경쟁에서 중요한 승리를 추가했습니다.',
      '대회는 진행 중이므로 최종 standings와 플레이오프 대진은 아직 확정되지 않았습니다.'
    ],
    stories:[
      { kicker:'LIVE LEAD', kickerKo:'라이브 선두', title:'St. Louis opened with the cleanest Friday statement', titleKo:'St. Louis, 가장 선명한 금요일 출발', body:'A 4-0 win limits tiebreak noise and maximizes the value of every game differential in a compressed group.', bodyKo:'4-0 승리는 타이브레이크 변수를 줄이고 압축된 조에서 게임 득실의 가치를 극대화합니다.' },
      { kicker:'DOUBLE WIN', kickerKo:'하루 2승', title:'LA converted two matches into efficient standings pressure', titleKo:'LA, 두 경기로 효율적인 순위 압박', body:'A 3-1 win followed by a 4-0 sweep is the kind of sequence that changes both record and differential.', bodyKo:'3-1 승리 뒤 4-0 스윕은 승패뿐 아니라 득실까지 동시에 바꾸는 흐름입니다.' },
      { kicker:'HOST RESPONSE', kickerKo:'홈팀 반응', title:'Orlando protected its home window against Phoenix', titleKo:'Orlando, Phoenix전에서 홈 일정 방어', body:'The Squeeze won three of four games and kept local momentum attached to the playoff conversation.', bodyKo:'Squeeze는 네 경기 중 세 경기를 잡아 홈 분위기를 플레이오프 경쟁과 연결했습니다.' },
      { kicker:'DREAMBREAKER', kickerKo:'드림브레이커', title:'Las Vegas kept its bubble case alive under singles pressure', titleKo:'Las Vegas, 단식 압박 속 버블 경쟁 유지', body:'Brooklyn forced a 2-2 split, but Las Vegas won the deciding DreamBreaker 21-16.', bodyKo:'Brooklyn이 2-2를 만들었지만 Las Vegas가 결정전 DreamBreaker를 21-16으로 이겼습니다.' }
    ]
  });

  const port = (board.tournaments || []).find((x) => x.slug === 'ppa-italy-portoroz-2026');
  if (port) Object.assign(port, {
    status:'completed', resultStatus:'pending', resultChecked:'2026-07-31',
    resultNote:'The event window has closed. Picklary is waiting for a stable official podium table before publishing medal names.',
    resultNoteKo:'대회 기간은 종료됐습니다. Picklary는 안정적인 공식 포디엄 표가 공개된 뒤 메달리스트 이름을 게시합니다.'
  });

  board.posts = (board.posts || []).filter((x) => x.id !== 'mlp-orlando-friday-live-0731');
  board.posts.unshift({
    id:'mlp-orlando-friday-live-0731', date:'2026-07-31', updatedAt:'2026-07-31T17:35:00-04:00', updatedAtLabel:'2026-07-31 · 5:35 PM ET',
    kind:'result', tour:'MLP', discipline:'team', confidence:'official',
    title:'MLP Orlando live: seven Friday matches verified as the playoff race tightens',
    titleKo:'MLP 올랜도 라이브: 플레이오프 경쟁 속 금요일 7경기 완료 확인',
    summary:'Seven Friday matches were final at the 5:35 PM ET checkpoint: St. Louis swept Phoenix, LA collected two wins, Las Vegas won a DreamBreaker, and New Jersey, Orlando and Chicago added regulation victories.',
    summaryKo:'오후 5시 35분(ET) 확인 시점에 금요일 7경기가 종료됐습니다. St. Louis는 Phoenix를 스윕했고, LA는 2승, Las Vegas는 DreamBreaker 승리, New Jersey·Orlando·Chicago는 정규 승리를 추가했습니다.',
    sourceName:'Official MLP Orlando scoreboard', sourceUrl:'https://majorleaguepickleball.co/events-2026/mlp-orlando-2026/', internalUrl:'tournaments/mlp-orlando-2026/'
  });

  board.storylines = board.storylines || [];
  const title='Orlando Friday turns every game differential into playoff leverage';
  if (!board.storylines.some((x)=>x.title===title)) board.storylines.unshift({
    date:'2026-07-31', updatedAt:'2026-07-31T17:35:00-04:00', confidence:'official', tour:'MLP',
    title, titleKo:'올랜도 금요일, 모든 게임 득실이 플레이오프 지렛대로',
    body:'With the regular-season finale live, sweeps and 3-1 regulation wins affect more than one match: they shape group placement, tiebreaks, and the postseason path.',
    bodyKo:'정규 시즌 최종전에서는 스윕과 3-1 정규 승리가 한 경기 이상의 의미를 갖습니다. 조별 순위, 타이브레이크와 포스트시즌 경로를 함께 바꿉니다.',
    sourceName:'Official MLP Orlando scoreboard', sourceUrl:'https://majorleaguepickleball.co/events-2026/mlp-orlando-2026/'
  });
  return board;
};
