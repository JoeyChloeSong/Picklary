'use strict';

module.exports = function applyMlpPlayoffsV068(board) {
  if (!board || typeof board !== 'object') return board;

  const UPDATED_AT = '2026-08-08T00:59:00-04:00';
  const UPDATED_LABEL = '2026-08-08 · 12:59 AM ET';
  const RESULT_DATE = '2026-08-07';
  const officialDallas = 'https://majorleaguepickleball.co/events-2026/mlp-playoffs-dallas-2026/';

  board.updated = UPDATED_LABEL;
  board.editorialNote = {
    en: 'Dallas Round 1 is underway. Friday Match 1 results are confirmed for Palm Beach–Chicago, Texas–Atlanta, and Dallas–Las Vegas. These are series-opening match wins, not completed best-of-three series.',
    ko: 'Dallas 1라운드가 진행 중입니다. 금요일 Palm Beach–Chicago, Texas–Atlanta, Dallas–Las Vegas의 1차전 결과가 확인됐습니다. 아래 결과는 3전 2선승제 시리즈의 첫 매치 승리이며 시리즈 최종 승자가 확정된 것은 아닙니다.'
  };

  const completed = [
    {
      division: 'Match 1 · Palm Beach Royals vs Chicago Slice',
      divisionKo: '1차전 · Palm Beach Royals vs Chicago Slice',
      champ: 'Palm Beach Royals', silver: 'Chicago Slice', score: '3–1',
      games: [
        { label:'Women\'s Doubles', labelKo:'여자복식', left:'Elsie Hendershot / Ting Chieh Wei', right:'Sofia Sewing / Tina Pisnik', score:'10–12', winner:'right' },
        { label:'Men\'s Doubles', labelKo:'남자복식', left:'John Lucian Goins / Zane Navratil', right:'Casey Diamond / Dekel Bar', score:'5–11', winner:'right' },
        { label:'Mixed Doubles 1', labelKo:'혼합복식 1', left:'Ting Chieh Wei / John Lucian Goins', right:'Tina Pisnik / Dekel Bar', score:'11–8', winner:'left' },
        { label:'Mixed Doubles 2', labelKo:'혼합복식 2', left:'Elsie Hendershot / AJ Koller', right:'Sofia Sewing / Casey Diamond', score:'9–11', winner:'right' }
      ]
    },
    {
      division: 'Match 1 · Texas Ranchers vs Atlanta Bouncers',
      divisionKo: '1차전 · Texas Ranchers vs Atlanta Bouncers',
      champ: 'Texas Ranchers', silver: 'Atlanta Bouncers', score: '3–2 · DreamBreaker 21–14',
      games: [
        { label:'Women\'s Doubles', labelKo:'여자복식', left:'Jessie Irvine / Mari Humberg', right:'Kaitlyn Christian / Lea Jansen', score:'11–8', winner:'left' },
        { label:'Men\'s Doubles', labelKo:'남자복식', left:'Jaume Martinez Vich / Jay Devilliers', right:'Eric Oncins / Nicolas Acevedo', score:'11–7', winner:'left' },
        { label:'Mixed Doubles 1', labelKo:'혼합복식 1', left:'Jessie Irvine / Jay Devilliers', right:'Lea Jansen / Eric Oncins', score:'1–11', winner:'right' },
        { label:'Mixed Doubles 2', labelKo:'혼합복식 2', left:'Mari Humberg / Jaume Martinez Vich', right:'Kaitlyn Christian / Nicolas Acevedo', score:'10–12', winner:'right' },
        { label:'DreamBreaker', labelKo:'DreamBreaker', left:'Atlanta Bouncers', right:'Texas Ranchers', score:'14–21', winner:'right' }
      ]
    },
    {
      division: 'Match 1 · Dallas Flash vs Las Vegas Night Owls',
      divisionKo: '1차전 · Dallas Flash vs Las Vegas Night Owls',
      champ: 'Dallas Flash', silver: 'Las Vegas Night Owls', score: '3–1',
      games: [
        { label:'Women\'s Doubles', labelKo:'여자복식', left:'Callie Smith / Chao Yi Wang', right:'Alix Truong / Danni-Elle Townsend', score:'11–9', winner:'left' },
        { label:'Men\'s Doubles', labelKo:'남자복식', left:'Clayton Powell / Roscoe Bellamy', right:'Augustus Ge / JW Johnson', score:'11–13', winner:'right' },
        { label:'Mixed Doubles 1', labelKo:'혼합복식 1', left:'Chao Yi Wang / Roscoe Bellamy', right:'Brooke Buckner / JW Johnson', score:'4–11', winner:'right' },
        { label:'Mixed Doubles 2', labelKo:'혼합복식 2', left:'Liz Truluck / Clayton Powell', right:'Danni-Elle Townsend / Augustus Ge', score:'1–11', winner:'right' }
      ]
    }
  ];

  const status = (board.statusEvents || []).find((x) => x.slug === 'mlp-playoffs-dallas-2026');
  if (status) Object.assign(status, {
    status:'live', updatedAt:UPDATED_AT, updatedAtLabel:UPDATED_LABEL,
    summary:'Friday Match 1 is complete in three series: Palm Beach beat Chicago 3–1, Texas beat Atlanta 3–2 in a DreamBreaker, and Dallas beat Las Vegas 3–1. All three winners lead their best-of-three series 1–0; Brooklyn–SoCal opens Saturday.',
    summaryKo:'금요일 세 시리즈의 1차전이 끝났습니다. Palm Beach가 Chicago를 3-1, Texas가 Atlanta를 DreamBreaker 끝에 3-2, Dallas가 Las Vegas를 3-1로 이겼습니다. 세 팀 모두 시리즈에서 1-0으로 앞서 있으며 Brooklyn–SoCal은 토요일 시작합니다.',
    resultHint:'Friday Match 1 complete · PBR, TEX, DAL lead 1–0',
    resultHintKo:'금요일 1차전 종료 · PBR, TEX, DAL 시리즈 1-0 우위'
  });

  const dallas = (board.tournaments || []).find((x) => x.slug === 'mlp-playoffs-dallas-2026');
  if (dallas) {
    Object.assign(dallas, {
      status:'live', resultStatus:'live', resultCardMode:'matches', resultChecked:UPDATED_LABEL,
      resultNote:'Friday Match 1 is complete in three Round 1 series. Palm Beach, Texas, and Dallas each lead 1–0. Brooklyn–SoCal has not started yet. A team still needs a second match win to advance.',
      resultNoteKo:'금요일 1라운드 세 시리즈의 1차전이 종료됐습니다. Palm Beach, Texas, Dallas가 각각 시리즈 1-0으로 앞서고 있으며 Brooklyn–SoCal은 아직 시작 전입니다. 8강 진출을 위해서는 한 번의 매치 승리가 더 필요합니다.',
      results: completed,
      overview:'Dallas Round 1 is now live. Palm Beach, Texas, and Dallas won their Friday openers and can clinch Newport Beach with one more match win. Brooklyn and SoCal begin their series Saturday.',
      overviewKo:'Dallas 1라운드가 진행 중입니다. Palm Beach, Texas, Dallas가 금요일 1차전을 승리해 한 번만 더 이기면 Newport Beach 8강 진출을 확정합니다. Brooklyn과 SoCal은 토요일 시리즈를 시작합니다.',
      watch:[
        'Can Chicago, Atlanta, and Las Vegas force a deciding third match?',
        'How Palm Beach, Texas, and Dallas adjust after winning Match 1',
        'Brooklyn–SoCal opens Saturday with no series cushion for either side',
        'DreamBreaker lineup choices after Texas won the first deciding game 21–14'
      ],
      watchKo:[
        'Chicago, Atlanta, Las Vegas가 3차전까지 시리즈를 끌고 갈 수 있을지',
        '1차전을 이긴 Palm Beach, Texas, Dallas가 2차전에서 어떤 조정을 할지',
        'Brooklyn–SoCal은 토요일 처음 시작하므로 어느 쪽에도 시리즈 여유가 없다는 점',
        'Texas가 첫 DreamBreaker를 21-14로 잡은 뒤 결정전 라인업 선택이 어떻게 달라질지'
      ],
      notableFacts:[
        'Palm Beach leads Chicago 1–0 after a 3–1 Match 1 win.',
        'Texas leads Atlanta 1–0 after a 21–14 DreamBreaker decided Match 1.',
        'Dallas leads Las Vegas 1–0 after taking three straight games following the women’s doubles loss.',
        'Brooklyn vs SoCal begins Saturday.',
        'Round 1 remains best-of-three; Friday winners have not yet clinched quarterfinal berths.'
      ],
      notableFactsKo:[
        'Palm Beach가 1차전을 3-1로 이겨 Chicago에 시리즈 1-0으로 앞섭니다.',
        'Texas가 DreamBreaker 21-14로 1차전을 잡아 Atlanta에 시리즈 1-0으로 앞섭니다.',
        'Dallas는 여자복식 패배 후 세 게임을 연속으로 잡아 Las Vegas에 시리즈에서 1-0으로 앞서 있습니다.',
        'Brooklyn vs SoCal은 토요일 시작합니다.',
        '1라운드는 3전 2선승제이므로 금요일 승리 팀도 아직 8강 진출 확정은 아닙니다.'
      ]
    });

    for (const s of (dallas.playoffSeries || [])) {
      if (s.higher === 'Palm Beach Royals') Object.assign(s, { seriesScore:'1–0', seriesLead:'Palm Beach Royals', match1Score:'3–1', match1Winner:'Palm Beach Royals', match1Games:completed[0].games });
      if (s.higher === 'Texas Ranchers') Object.assign(s, { seriesScore:'1–0', seriesLead:'Texas Ranchers', match1Score:'3–2 · DB 21–14', match1Winner:'Texas Ranchers', match1Games:completed[1].games });
      if (s.higher === 'Dallas Flash') Object.assign(s, { seriesScore:'1–0', seriesLead:'Dallas Flash', match1Score:'3–1', match1Winner:'Dallas Flash', match1Games:completed[2].games });
      if (s.higher === 'Brooklyn Pickleball Team') Object.assign(s, { seriesScore:'0–0', seriesLead:'Not started', seriesLeadKo:'시작 전', match1Score:'—', match1Winner:'' });
    }

    dallas.stories = [
      { kicker:'FRIDAY RESULT', kickerKo:'금요일 결과', title:'Palm Beach wins the first two doubles and closes 3–1', titleKo:'Palm Beach, 첫 두 복식을 잡고 3-1 승리', body:'Chicago answered in Mixed 1, but Sofia Sewing and Casey Diamond closed Mixed 2 by two points. Palm Beach now needs one more match win to advance.', bodyKo:'Chicago가 혼합복식 1에서 반격했지만 Sofia Sewing–Casey Diamond가 혼합복식 2를 2점 차로 마무리했습니다. Palm Beach는 한 번만 더 이기면 8강에 진출합니다.' },
      { kicker:'DREAMBREAKER', kickerKo:'DREAMBREAKER', title:'Texas erases a 0–2 start and steals Match 1', titleKo:'Texas, 0-2 출발을 뒤집고 1차전 탈환', body:'Atlanta won both gender doubles, then Texas swept the mixed games and controlled the DreamBreaker 21–14. That comeback changes the pressure profile of the series.', bodyKo:'Atlanta가 여자·남자복식을 모두 잡았지만 Texas가 혼합복식 두 경기를 모두 이긴 뒤 DreamBreaker를 21-14로 가져갔습니다. 이 역전승으로 시리즈 압박 구도가 완전히 달라졌습니다.' },
      { kicker:'DALLAS RESPONSE', kickerKo:'DALLAS 반격', title:'Flash drops women’s doubles, then wins the next three', titleKo:'Dallas, 여자복식 패배 후 세 게임 연속 승리', body:'Augustus Ge/JW Johnson stabilized the men’s game, then Dallas won both mixed doubles decisively. Las Vegas now needs Match 2 to keep its season alive.', bodyKo:'Augustus Ge–JW Johnson이 남자복식에서 흐름을 되찾은 뒤 Dallas가 혼합복식 두 경기를 모두 크게 이겼습니다. Las Vegas는 시즌을 이어가려면 2차전을 반드시 잡아야 합니다.' }
    ];
  }

  board.posts = (board.posts || []).filter((x) => x.id !== 'mlp-dallas-friday-results-0807');
  board.posts.unshift({
    id:'mlp-dallas-friday-results-0807', date:RESULT_DATE, updatedAt:UPDATED_AT, updatedAtLabel:UPDATED_LABEL,
    kind:'result', tour:'MLP', discipline:'team', confidence:'official',
    title:'Dallas Playoffs Friday: Palm Beach, Texas, and Dallas take 1–0 series leads',
    titleKo:'MLP Dallas 금요일: Palm Beach·Texas·Dallas, 시리즈 1-0 우위',
    summary:'Palm Beach beat Chicago 3–1, Texas rallied past Atlanta 3–2 in a 21–14 DreamBreaker, and Dallas beat Las Vegas 3–1. These are Match 1 wins in best-of-three series.',
    summaryKo:'Palm Beach가 Chicago를 3-1, Texas가 Atlanta를 DreamBreaker 21-14 끝에 3-2, Dallas가 Las Vegas를 3-1로 이겼습니다. 모두 3전 2선승제 시리즈의 1차전 결과입니다.',
    sourceName:'Official MLP Dallas Playoffs', sourceUrl:officialDallas, internalUrl:'tournaments/mlp-playoffs-dallas-2026/'
  });

  board.storylines = (board.storylines || []).filter((x) => x.title !== 'Friday winners now carry clinch pressure into Match 2');
  board.storylines.unshift({
    date:RESULT_DATE, updatedAt:UPDATED_AT, confidence:'analysis', tour:'MLP',
    title:'Friday winners now carry clinch pressure into Match 2',
    titleKo:'금요일 승리 팀, 2차전에서 이제 ‘끝낼 수 있는 압박’을 안는다',
    body:'Palm Beach, Texas, and Dallas all need one more match win. The tactical question shifts from finding a first winning formula to deciding how much to preserve versus adjust after opponents have seen the opening lineup.',
    bodyKo:'Palm Beach, Texas, Dallas는 이제 한 번만 더 이기면 됩니다. 전술 질문도 첫 승리 공식을 찾는 단계에서, 상대가 1차전 라인업을 본 상황에서 얼마나 유지하고 얼마나 바꿀지로 이동합니다.',
    sourceName:'Official MLP Dallas Playoffs', sourceUrl:officialDallas
  });

  return board;
};
