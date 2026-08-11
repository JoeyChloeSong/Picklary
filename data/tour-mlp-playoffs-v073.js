'use strict';

module.exports = function applyMlpPlayoffsV073(board) {
  if (!board || typeof board !== 'object') return board;

  const UPDATED_AT = '2026-08-10T23:53:00-04:00';
  const UPDATED_LABEL = '2026-08-10 · 11:53 PM ET';
  const officialDallas = 'https://majorleaguepickleball.co/events-2026/mlp-playoffs-dallas-2026/';
  const officialRecap = 'https://majorleaguepickleball.co/news/mlp-playoffs-round-1-recap-bracket-update/';
  const officialNewport = 'https://majorleaguepickleball.co/events-2026/mlp-newport-beach-2026/';

  board.updated = UPDATED_LABEL;
  board.editorialNote = {
    en: 'Dallas Round 1 is complete. Brooklyn, Dallas, Palm Beach, and Texas all won their best-of-three series 2–0 and advanced to the Newport Beach quarterfinals. The next official MLP competition is August 14–16.',
    ko: 'Dallas 1라운드가 종료됐습니다. Brooklyn, Dallas, Palm Beach, Texas가 모두 3전 2선승제 시리즈를 2-0으로 마무리해 Newport Beach 8강에 진출했습니다. 다음 MLP 공식 일정은 8월 14–16일입니다.'
  };

  const finals = [
    {
      order:1,
      higherSeed:7, higher:'Palm Beach Royals', lowerSeed:12, lower:'Chicago Slice',
      seriesWinner:'Palm Beach Royals', seriesScore:'2–0', match1Score:'3–1', match2Score:'3–1',
      note:'Palm Beach won both matches 3–1. The second match again came down to Mixed Doubles 2 before the Royals closed the series.',
      noteKo:'Palm Beach가 두 경기를 모두 3-1로 이겼습니다. 2차전도 혼합복식 2까지 이어졌지만 Royals가 마무리하며 시리즈를 끝냈습니다.'
    },
    {
      order:2,
      higherSeed:8, higher:'Texas Ranchers', lowerSeed:9, lower:'Atlanta Bouncers',
      seriesWinner:'Texas Ranchers', seriesScore:'2–0', match1Score:'3–2 · DB 21–14', match2Score:'3–2 · DreamBreaker',
      note:'Both matches reached a DreamBreaker. Texas won the first decider 21–14 and took the second deciding game as well to complete the sweep.',
      noteKo:'두 경기 모두 DreamBreaker까지 갔습니다. Texas는 1차전 결정전을 21-14로 잡았고 2차전 결정전도 이겨 2-0 스윕을 완성했습니다.'
    },
    {
      order:3,
      higherSeed:6, higher:'Dallas Flash', lowerSeed:11, lower:'Las Vegas Night Owls',
      seriesWinner:'Dallas Flash', seriesScore:'2–0', match1Score:'3–1', match2Score:'3–0',
      note:'Dallas followed a 3–1 opening win with a 3–0 sweep in Match 2. Las Vegas won only one game across the seven games played in the series.',
      noteKo:'Dallas는 1차전 3-1 승리에 이어 2차전을 3-0으로 마무리했습니다. Las Vegas는 시리즈 전체 7게임에서 한 게임만 가져갔습니다.'
    },
    {
      order:4,
      higherSeed:5, higher:'Brooklyn Pickleball Team', lowerSeed:10, lower:'SoCal Hard Eights',
      seriesWinner:'Brooklyn Pickleball Team', seriesScore:'2–0', match1Score:'3–2 · DB 24–22', match2Score:'3–1',
      note:'Brooklyn survived a 24–22 DreamBreaker in Match 1 and then closed the series 3–1 in Match 2 on Sunday.',
      noteKo:'Brooklyn은 1차전 DreamBreaker를 24-22로 간신히 잡은 뒤 일요일 2차전을 3-1로 끝내 시리즈를 확정했습니다.'
    }
  ];

  function finalCard(s) {
    return {
      division:`Series final · #${s.higherSeed} ${s.higher} vs #${s.lowerSeed} ${s.lower}`,
      divisionKo:`시리즈 최종 · #${s.higherSeed} ${s.higher} vs #${s.lowerSeed} ${s.lower}`,
      champ:s.seriesWinner,
      silver:s.seriesWinner === s.higher ? s.lower : s.higher,
      score:`Series ${s.seriesScore} · Match 1 ${s.match1Score} · Match 2 ${s.match2Score}`,
      scoreKo:`시리즈 ${s.seriesScore} · 1차전 ${s.match1Score} · 2차전 ${s.match2Score}`,
      note:s.note,
      noteKo:s.noteKo
    };
  }

  const dallasStatus = (board.statusEvents || []).find((x) => x.slug === 'mlp-playoffs-dallas-2026');
  if (dallasStatus) Object.assign(dallasStatus, {
    status:'completed', updatedAt:UPDATED_AT, updatedAtLabel:UPDATED_LABEL,
    summary:'Dallas Round 1 is complete. Brooklyn, Dallas, Palm Beach, and Texas each won their series 2–0 and advanced to Newport Beach.',
    summaryKo:'Dallas 1라운드가 끝났습니다. Brooklyn, Dallas, Palm Beach, Texas가 각각 시리즈를 2-0으로 마무리해 Newport Beach 8강에 진출했습니다.',
    resultHint:'Round 1 complete · BKLYN, DAL, PBR, TEX advance 2–0',
    resultHintKo:'1라운드 종료 · BKLYN, DAL, PBR, TEX 2-0으로 8강 진출',
    sourceName:'Official MLP Round 1 recap', sourceUrl:officialRecap
  });

  const newportStatus = (board.statusEvents || []).find((x) => x.slug === 'mlp-newport-beach-2026');
  if (newportStatus) Object.assign(newportStatus, {
    status:'upcoming', updatedAt:'2026-08-10T23:52:00-04:00', updatedAtLabel:UPDATED_LABEL,
    summary:'All eight quarterfinalists are set: New Jersey, St. Louis, Los Angeles, Columbus, Brooklyn, Dallas, Palm Beach, and Texas. Newport Beach runs August 14–16.',
    summaryKo:'8강 진출 8팀이 모두 확정됐습니다. New Jersey, St. Louis, Los Angeles, Columbus, Brooklyn, Dallas, Palm Beach, Texas가 8월 14–16일 Newport Beach에서 경기합니다.',
    resultHint:'Eight quarterfinalists set · Aug 14–16',
    resultHintKo:'8강 진출 8팀 확정 · 8월 14–16일',
    sourceName:'Official MLP Newport Beach', sourceUrl:officialNewport
  });

  const dallas = (board.tournaments || []).find((x) => x.slug === 'mlp-playoffs-dallas-2026');
  if (dallas) {
    Object.assign(dallas, {
      status:'completed', resultStatus:'completed', resultCardMode:'matches', resultChecked:UPDATED_LABEL,
      resultCheckedKo:'2026-08-10 · 11:53 PM ET',
      resultNote:'Round 1 is final. All four higher seeds swept their best-of-three series 2–0. Brooklyn, Dallas, Palm Beach, and Texas advance to the Newport Beach quarterfinals.',
      resultNoteKo:'1라운드 최종 결과입니다. 상위 시드 네 팀이 모두 3전 2선승제 시리즈를 2-0으로 마무리했습니다. Brooklyn, Dallas, Palm Beach, Texas가 Newport Beach 8강에 진출합니다.',
      results:finals.map(finalCard),
      overview:'Dallas Round 1 ended with four 2–0 series sweeps. Brooklyn survived a 24–22 DreamBreaker in its opener, Texas needed DreamBreakers in both matches, Dallas won six of seven games, and Palm Beach posted back-to-back 3–1 wins.',
      overviewKo:'Dallas 1라운드는 네 시리즈 모두 2-0으로 끝났습니다. Brooklyn은 1차전 DreamBreaker를 24-22로 버텼고, Texas는 두 경기 모두 DreamBreaker 끝에 승리했습니다. Dallas는 7게임 중 6게임을 가져갔고 Palm Beach는 두 경기 연속 3-1 승리를 기록했습니다.',
      participants:['Brooklyn Pickleball Team — advanced','Dallas Flash — advanced','Palm Beach Royals — advanced','Texas Ranchers — advanced','SoCal Hard Eights — eliminated','Las Vegas Night Owls — eliminated','Chicago Slice — eliminated','Atlanta Bouncers — eliminated'],
      participantsKo:['Brooklyn Pickleball Team — 8강 진출','Dallas Flash — 8강 진출','Palm Beach Royals — 8강 진출','Texas Ranchers — 8강 진출','SoCal Hard Eights — 탈락','Las Vegas Night Owls — 탈락','Chicago Slice — 탈락','Atlanta Bouncers — 탈락'],
      watch:[
        'How the four Dallas winners recover before Newport Beach on August 14–16',
        'Brooklyn’s DreamBreaker ceiling after the 24–22 escape against SoCal',
        'Texas entering the quarterfinals after winning two straight DreamBreakers',
        'Dallas carrying the cleanest Round 1 game differential into the next round'
      ],
      watchKo:[
        'Dallas 승자 네 팀이 8월 14–16일 Newport Beach까지 어떻게 회복할지',
        'SoCal전 24-22 승리로 확인된 Brooklyn의 DreamBreaker 경쟁력',
        '두 경기 연속 DreamBreaker를 잡은 Texas가 8강에서도 결정전 강점을 이어갈지',
        '1라운드에서 가장 깔끔한 게임 득실을 보인 Dallas의 다음 라운드 흐름'
      ],
      notableFacts:[
        'All four Round 1 series ended 2–0; no third match was required.',
        'Brooklyn beat SoCal 3–2 in Match 1 via a 24–22 DreamBreaker, then 3–1 in Match 2.',
        'Dallas beat Las Vegas 3–1 and 3–0.',
        'Palm Beach beat Chicago 3–1 in both matches.',
        'Texas beat Atlanta 3–2 in both matches, with both decided by DreamBreakers.',
        'Brooklyn, Dallas, Palm Beach, and Texas advance to Newport Beach.'
      ],
      notableFactsKo:[
        '네 시리즈가 모두 2-0으로 끝나 3차전은 한 번도 열리지 않았습니다.',
        'Brooklyn은 SoCal과 1차전을 DreamBreaker 24-22로 3-2 승리한 뒤 2차전을 3-1로 잡았습니다.',
        'Dallas는 Las Vegas를 1차전 3-1, 2차전 3-0으로 이겼습니다.',
        'Palm Beach는 Chicago를 두 경기 모두 3-1로 이겼습니다.',
        'Texas는 Atlanta와 두 경기 모두 3-2 승리했고 두 경기 모두 DreamBreaker에서 결정됐습니다.',
        'Brooklyn, Dallas, Palm Beach, Texas가 Newport Beach 8강에 진출합니다.'
      ],
      storyline:'Dallas produced no series upset, but the path was not uniform: Brooklyn and Texas were pushed to deciding games, while Dallas and Palm Beach closed with more control. The four winners now rejoin the top four regular-season seeds in Newport Beach.',
      storylineKo:'Dallas에서는 시리즈 업셋이 나오지 않았지만 승리 과정은 달랐습니다. Brooklyn과 Texas는 결정전까지 몰렸고 Dallas와 Palm Beach는 비교적 안정적으로 마무리했습니다. 네 승자는 이제 정규시즌 상위 4팀과 Newport Beach에서 합류합니다.',
      sourceUrl:officialDallas,
      sourceName:'Official MLP Dallas Playoffs',
      sourceNameKo:'MLP Dallas 플레이오프 공식 페이지',
      secondaryUrl:officialRecap,
      secondaryName:'Official Round 1 recap',
      secondaryNameKo:'MLP 공식 1라운드 리캡'
    });

    for (const r of (dallas.playoffSeries || [])) {
      const f = finals.find((x) => x.order === r.order);
      if (!f) continue;
      Object.assign(r, {
        seriesFinal:true,
        seriesWinner:f.seriesWinner,
        seriesLead:f.seriesWinner,
        seriesLeadKo:f.seriesWinner,
        seriesScore:f.seriesScore,
        match1Winner:f.seriesWinner,
        match1Score:f.match1Score,
        match2Winner:f.seriesWinner,
        match2Score:f.match2Score,
        finalNote:f.note,
        finalNoteKo:f.noteKo
      });
    }

    dallas.scheduleRows = [
      { day:'August 7–9', dayKo:'8월 7–9일', time:'Final', timeKo:'최종', match:'Palm Beach Royals def. Chicago Slice · series 2–0', matchKo:'Palm Beach Royals, Chicago Slice에 시리즈 2-0 승리', note:'Match 1 3–1 · Match 2 3–1', noteKo:'1차전 3-1 · 2차전 3-1' },
      { day:'August 7–9', dayKo:'8월 7–9일', time:'Final', timeKo:'최종', match:'Texas Ranchers def. Atlanta Bouncers · series 2–0', matchKo:'Texas Ranchers, Atlanta Bouncers에 시리즈 2-0 승리', note:'Match 1 3–2 · Match 2 3–2 · both DreamBreakers', noteKo:'1차전 3-2 · 2차전 3-2 · 두 경기 모두 DreamBreaker' },
      { day:'August 7–9', dayKo:'8월 7–9일', time:'Final', timeKo:'최종', match:'Dallas Flash def. Las Vegas Night Owls · series 2–0', matchKo:'Dallas Flash, Las Vegas Night Owls에 시리즈 2-0 승리', note:'Match 1 3–1 · Match 2 3–0', noteKo:'1차전 3-1 · 2차전 3-0' },
      { day:'August 8–9', dayKo:'8월 8–9일', time:'Final', timeKo:'최종', match:'Brooklyn Pickleball Team def. SoCal Hard Eights · series 2–0', matchKo:'Brooklyn Pickleball Team, SoCal Hard Eights에 시리즈 2-0 승리', note:'Match 1 3–2 (DB 24–22) · Match 2 3–1', noteKo:'1차전 3-2 (DB 24-22) · 2차전 3-1' }
    ];

    dallas.projectedPaths = [];
    dallas.stories = [
      { kicker:'ROUND 1 FINAL', kickerKo:'1라운드 최종', title:'Four higher seeds advance without a third match', titleKo:'상위 시드 네 팀, 3차전 없이 모두 8강 진출', body:'Every best-of-three series ended 2–0. The favorites advanced, but Brooklyn and Texas both had to survive deciding games along the way.', bodyKo:'모든 3전 2선승제 시리즈가 2-0으로 끝났습니다. 상위 시드가 모두 진출했지만 Brooklyn과 Texas는 결정전을 넘겨야 했습니다.' },
      { kicker:'DREAMBREAKER TEST', kickerKo:'DREAMBREAKER 시험대', title:'Texas wins two deciding games; Brooklyn survives 24–22', titleKo:'Texas는 두 번의 결정전 승리, Brooklyn은 24-22 생존', body:'Texas reached a DreamBreaker in both matches against Atlanta and won both. Brooklyn needed a 24–22 escape in Match 1 before closing SoCal 3–1 in Match 2.', bodyKo:'Texas는 Atlanta와 두 경기 모두 DreamBreaker까지 갔고 모두 이겼습니다. Brooklyn은 1차전 24-22 결정전을 넘긴 뒤 2차전을 3-1로 마무리했습니다.' },
      { kicker:'NEXT STOP', kickerKo:'다음 무대', title:'Eight teams remain for Newport Beach', titleKo:'Newport Beach에 남은 8팀', body:'New Jersey, St. Louis, Los Angeles, and Columbus join Brooklyn, Dallas, Palm Beach, and Texas in the quarterfinal field.', bodyKo:'New Jersey, St. Louis, Los Angeles, Columbus가 Brooklyn, Dallas, Palm Beach, Texas와 함께 8강에 합류합니다.' }
    ];
  }

  const newport = (board.tournaments || []).find((x) => x.slug === 'mlp-newport-beach-2026');
  if (newport) Object.assign(newport, {
    status:'upcoming', resultStatus:'upcoming', resultChecked:UPDATED_LABEL,
    resultCheckedKo:'2026-08-10 · 11:53 PM ET',
    resultNote:'The eight quarterfinalists are confirmed. The official Newport Beach event page states that the top four seeds select from the four re-seeded Dallas winners; detailed pairings are published after Round 1.',
    resultNoteKo:'8강 진출 8팀이 확정됐습니다. 공식 Newport Beach 페이지에 따르면 상위 4개 시드가 Dallas 승자 4팀 중 상대를 선택하며, 세부 대진은 1라운드 이후 공지됩니다.',
    overview:'The quarterfinal field is set: New Jersey, St. Louis, Los Angeles, Columbus, Brooklyn, Dallas, Palm Beach, and Texas. Round 2 is scheduled for August 14–16 in Newport Beach.',
    overviewKo:'8강 진출 팀은 New Jersey, St. Louis, Los Angeles, Columbus, Brooklyn, Dallas, Palm Beach, Texas입니다. 2라운드는 8월 14–16일 Newport Beach에서 열립니다.',
    participants:['New Jersey 5s','St. Louis Shock','Los Angeles Mad Drops','Columbus Sliders','Brooklyn Pickleball Team','Dallas Flash','Palm Beach Royals','Texas Ranchers'],
    participantsKo:['New Jersey 5s','St. Louis Shock','Los Angeles Mad Drops','Columbus Sliders','Brooklyn Pickleball Team','Dallas Flash','Palm Beach Royals','Texas Ranchers'],
    notableFacts:['Eight quarterfinalists are confirmed.','The top four seeds received Dallas byes.','Brooklyn, Dallas, Palm Beach, and Texas advanced from Round 1 with 2–0 series wins.','Newport Beach is scheduled for August 14–16.','The top four seeds have opponent-selection rights among the re-seeded Dallas winners.'],
    notableFactsKo:['8강 진출 8팀이 확정됐습니다.','상위 4개 시드는 Dallas 1라운드 부전승을 받았습니다.','Brooklyn, Dallas, Palm Beach, Texas가 1라운드 시리즈를 2-0으로 이겨 진출했습니다.','Newport Beach 8강은 8월 14–16일 열립니다.','상위 4개 시드는 재시드된 Dallas 승자 중 상대를 선택할 권리가 있습니다.'],
    watch:['Which opponent each top-four seed selects','Whether Texas and Brooklyn carry their DreamBreaker confidence forward','Dallas entering with six wins in seven Round 1 games','Palm Beach’s women’s doubles as a quarterfinal anchor'],
    watchKo:['상위 4개 시드가 각각 어떤 상대를 선택할지','Texas와 Brooklyn이 DreamBreaker 자신감을 이어갈지','1라운드 7게임 중 6게임을 이긴 Dallas의 상승세','Palm Beach 여자복식이 8강에서도 중심축이 될지'],
    projectedPaths:[],
    projectionNote:'', projectionNoteKo:'',
    sourceUrl:officialNewport,
    sourceName:'Official MLP Newport Beach', sourceNameKo:'MLP Newport Beach 공식 페이지',
    secondaryUrl:officialRecap,
    secondaryName:'Official Dallas Round 1 recap', secondaryNameKo:'MLP Dallas 1라운드 공식 리캡'
  });

  board.posts = (board.posts || []).filter((x) => !['mlp-dallas-friday-results-0807','mlp-dallas-round1-final-0810'].includes(x.id));
  board.posts.unshift({
    id:'mlp-dallas-round1-final-0810', date:'2026-08-10', updatedAt:UPDATED_AT, updatedAtLabel:UPDATED_LABEL,
    kind:'result', tour:'MLP', discipline:'team', confidence:'official',
    title:'MLP Dallas Round 1 complete: Brooklyn, Dallas, Palm Beach, and Texas advance 2–0',
    titleKo:'MLP Dallas 1라운드 종료: Brooklyn·Dallas·Palm Beach·Texas, 모두 2-0으로 8강 진출',
    summary:'All four best-of-three series ended in 2–0 sweeps. Brooklyn survived a 24–22 DreamBreaker, Texas won two deciding games, Dallas won six of seven games, and Palm Beach posted two 3–1 wins.',
    summaryKo:'네 시리즈 모두 2-0으로 끝났습니다. Brooklyn은 DreamBreaker 24-22를 넘겼고, Texas는 두 번의 결정전을 잡았습니다. Dallas는 7게임 중 6게임을 이겼고 Palm Beach는 두 경기 모두 3-1로 승리했습니다.',
    sourceName:'Official MLP Round 1 recap', sourceUrl:officialRecap,
    secondaryUrl:officialDallas, secondaryName:'Official Dallas event page',
    internalUrl:'tournaments/mlp-playoffs-dallas-2026/'
  });

  board.storylines = (board.storylines || []).filter((x) => x.title !== 'Dallas Round 1 ends without a series upset');
  board.storylines.unshift({
    date:'2026-08-10', updatedAt:UPDATED_AT, confidence:'analysis', tour:'MLP',
    title:'Dallas Round 1 ends without a series upset',
    titleKo:'Dallas 1라운드, 시리즈 업셋 없이 상위 시드 모두 생존',
    body:'The final 2–0 series scores hide different levels of stress. Brooklyn and Texas were pushed into DreamBreakers, while Dallas and Palm Beach controlled more of their series. That contrast is the first tactical clue for Newport Beach.',
    bodyKo:'최종 시리즈 스코어는 모두 2-0이지만 과정의 압박은 달랐습니다. Brooklyn과 Texas는 DreamBreaker까지 몰렸고 Dallas와 Palm Beach는 더 안정적으로 시리즈를 운영했습니다. 이 차이가 Newport Beach의 첫 전술 포인트입니다.',
    sourceName:'Official MLP Round 1 recap', sourceUrl:officialRecap
  });

  return board;
};
