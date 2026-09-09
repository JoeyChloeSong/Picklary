'use strict';

module.exports = function applyTourSeptemberV080(board) {
  if (!board || typeof board !== 'object') return board;

  const UPDATED_AT = '2026-09-08T23:04:00-04:00';
  const UPDATED_LABEL = '2026-09-08 · 11:04 PM ET';
  const PPA_NATIONALS = 'https://www.ppatour.com/events/2026/veolia-pickleball-national-championships/';
  const PPA_NATIONALS_RECAP = 'https://www.ppatour.com/championship-sunday-standout-stats-from-the-veolia-pickleball-national-championships/';
  const PPA_EVENTS = 'https://www.ppatour.com/events/';
  const KL_EVENT = 'https://www.ppatour-asia.com/tournament/2026/kuala-lumpur-cup/';
  const KL_DRAW = 'https://www.ppatour-asia.com/rivals-debutants-and-danger-in-malaysia/';
  const SHENZHEN_EVENT = 'https://www.ppatour-asia.com/tournament/2026/shenzhen-open/';
  const SHENZHEN_RECAP = 'https://www.ppatour-asia.com/goldin-completes-golden-comeback/';
  const MLP_FINALS = 'https://majorleaguepickleball.co/events-2026/mlp-finals-new-york-city-2026/';
  const MLP_FINALS_RECAP = 'https://worldpickleballmagazine.com/new-jersey-5s-win-2026-mlp-championship/';
  const MLP_VIEWERS = 'https://majorleaguepickleball.co/news/major-league-pickleball-finals-on-cbs-set-all-time-league-viewership-record/';
  const MLP_NATIONS = 'https://majorleaguepickleball.co/events-2026/';

  board.updated = UPDATED_LABEL;
  board.editorialNote = {
    en: 'Updated through September 8 ET: PPA Nationals champions are final, New Jersey is the 2026 MLP champion, and the PPA Asia 1000 Kuala Lumpur Cup is on its September 9 qualifying day in Malaysia with the draw and five-day schedule published.',
    ko: '9월 8일 ET 기준으로 업데이트했습니다. PPA Nationals 우승 결과와 New Jersey의 2026 MLP 우승을 반영했고, 말레이시아 현지 9월 9일 예선이 시작된 PPA Asia 1000 Kuala Lumpur의 대진과 5일 일정을 확인했습니다.'
  };

  board.statusEvents = board.statusEvents || [];
  board.tournaments = board.tournaments || [];
  board.posts = board.posts || [];
  board.storylines = board.storylines || [];

  function upsertEvent(item) {
    const i = board.statusEvents.findIndex((x) => x.slug === item.slug);
    if (i >= 0) board.statusEvents[i] = Object.assign({}, board.statusEvents[i], item);
    else board.statusEvents.push(item);
  }
  function upsertTournament(item) {
    const i = board.tournaments.findIndex((x) => x.slug === item.slug);
    if (i >= 0) board.tournaments[i] = Object.assign({}, board.tournaments[i], item);
    else board.tournaments.push(item);
  }

  // Close stale MLP playoff states left from the August build.
  upsertEvent({
    slug:'mlp-newport-beach-2026', tour:'MLP', status:'completed', start:'2026-08-14', end:'2026-08-16',
    updatedAt:'2026-08-19T12:00:00-04:00', updatedAtLabel:'2026-08-19',
    title:'MLP Playoffs — Newport Beach Quarterfinals', titleKo:'MLP 플레이오프 — Newport Beach 8강',
    location:'Tennis and Pickleball Club at Newport Beach, CA', locationKo:'미국 캘리포니아 Newport Beach',
    summary:'New Jersey, St. Louis, Brooklyn, and Dallas advanced from Newport Beach to the four-team New York City Finals field.',
    summaryKo:'New Jersey, St. Louis, Brooklyn, Dallas가 Newport Beach 8강을 통과해 New York City 파이널 4강에 진출했습니다.',
    resultHint:'NJ · STL · Brooklyn · Dallas advance to NYC', resultHintKo:'NJ · STL · Brooklyn · Dallas, NYC 파이널 진출',
    sourceName:'Official MLP Newport Beach', sourceUrl:'https://majorleaguepickleball.co/events-2026/mlp-newport-beach-2026/', detail:true
  });

  upsertEvent({
    slug:'mlp-finals-new-york-city-2026', tour:'MLP', status:'completed', start:'2026-08-28', end:'2026-08-30',
    updatedAt:'2026-09-02T12:00:00-04:00', updatedAtLabel:'2026-09-02',
    title:'DoorDash MLP Finals — New York City', titleKo:'DoorDash MLP 파이널 — New York City',
    location:'CityPickle at Wollman Rink, New York, NY', locationKo:'미국 뉴욕 Wollman Rink · CityPickle',
    summary:'New Jersey 5s defeated St. Louis Shock to win the 2026 MLP season title. The final series went to DreamBreakers in both matches, and the CBS window averaged 773,000 viewers.',
    summaryKo:'New Jersey 5s가 St. Louis Shock를 꺾고 2026 MLP 시즌 챔피언이 됐습니다. 파이널 두 매치 모두 DreamBreaker까지 갔고, CBS 중계는 평균 77만3천 명을 기록했습니다.',
    resultHint:'Champion: New Jersey 5s · Runner-up: St. Louis Shock', resultHintKo:'우승 New Jersey 5s · 준우승 St. Louis Shock',
    sourceName:'Official MLP Finals', sourceUrl:MLP_FINALS, detail:true
  });

  upsertEvent({
    slug:'ppa-nationals-cary-2026', tour:'PPA', status:'completed', start:'2026-08-31', end:'2026-09-06',
    updatedAt:'2026-09-08T12:00:00-04:00', updatedAtLabel:'2026-09-08',
    title:'Veolia Pickleball National Championships', titleKo:'Veolia Pickleball National Championships',
    location:'Cary Tennis Park, Cary, NC', locationKo:'미국 노스캐롤라이나 Cary Tennis Park',
    summary:'The first major of the 2026–27 PPA season is complete. Anna Leigh Waters won women’s singles and women’s doubles, Anna Bright won women’s doubles and mixed, Hunter Johnson won men’s singles, and Ben Johns/Gabe Tardio won men’s doubles.',
    summaryKo:'2026–27 PPA 시즌 첫 메이저가 끝났습니다. Anna Leigh Waters는 여자 단식·여자 복식, Anna Bright는 여자 복식·혼합복식, Hunter Johnson은 남자 단식, Ben Johns/Gabe Tardio는 남자 복식에서 우승했습니다.',
    resultHint:'Waters/Bright double titles · Hunter Johnson MS · Johns/Tardio MD', resultHintKo:'Waters·Bright 2관왕 · Hunter Johnson 남단 · Johns/Tardio 남복',
    sourceName:'Official PPA Nationals', sourceUrl:PPA_NATIONALS, detail:true
  });

  upsertEvent({
    slug:'ppa-asia-shenzhen-open-2026', tour:'PPA Asia', status:'completed', start:'2026-08-20', end:'2026-08-23',
    updatedAt:'2026-08-23T20:00:00+08:00', updatedAtLabel:'2026-08-23',
    title:'Skechers Shenzhen Open 2026', titleKo:'Skechers Shenzhen Open 2026',
    location:"Shenzhen Bao'an Sports Center Gymnasium, Shenzhen, China", locationKo:'중국 선전 Shenzhen Bao’an Sports Center Gymnasium',
    summary:'Grayson Goldin saved match point in the men’s singles final, Chao Yi Wang won women’s singles, Collin Johns/Len Yang won men’s doubles, Sophia Nhi Huynh/Ho Tam took women’s doubles, and Sahra Dennehy/Tama Shimabukuro won mixed.',
    summaryKo:'Grayson Goldin이 남자 단식 결승에서 매치포인트를 막고 역전 우승했고, Chao Yi Wang 여자 단식, Collin Johns/Len Yang 남자 복식, Sophia Nhi Huynh/Ho Tam 여자 복식, Sahra Dennehy/Tama Shimabukuro 혼합복식이 금메달을 차지했습니다.',
    resultHint:'Goldin comeback · Wang WS · Johns/Yang MD · Dennehy/Shimabukuro XD', resultHintKo:'Goldin 역전 우승 · Wang 여단 · Johns/Yang 남복 · Dennehy/Shimabukuro 혼복',
    sourceName:'PPA Tour Asia Shenzhen recap', sourceUrl:SHENZHEN_RECAP, detail:true
  });

  upsertEvent({
    slug:'ppa-asia-kuala-lumpur-cup-2026', tour:'PPA Asia', status:'live', start:'2026-09-09', end:'2026-09-13',
    updatedAt:UPDATED_AT, updatedAtLabel:UPDATED_LABEL,
    title:'PPA Asia 1000 Leapmotor Kuala Lumpur Cup 2026', titleKo:'PPA Asia 1000 Leapmotor Kuala Lumpur Cup 2026',
    location:'The Hood, Kuala Lumpur, Malaysia', locationKo:'말레이시아 쿠알라룸푸르 The Hood',
    summary:'The Kuala Lumpur Cup is on its September 9 qualifying day in Malaysia with 1,000 ranking points and up to US$300,000 in pro prize money. The draws are published: Zane Ford is the men’s singles No. 1 seed, Kaitlyn Christian is the women’s singles No. 1, and Gabriel Tardio/Noe Khlif lead men’s doubles.',
    summaryKo:'Kuala Lumpur Cup은 말레이시아 현지 9월 9일 예선 일정에 들어갔습니다. 우승 시 1,000포인트, 프로 상금은 최대 미화 30만 달러입니다. 대진표도 공개됐습니다. 남자 단식 1번 시드는 Zane Ford, 여자 단식 1번 시드는 Kaitlyn Christian, 남자 복식 1번 시드는 Gabriel Tardio/Noe Khlif입니다.',
    resultHint:'LIVE Sep 9 qualifying · The Hood · 1000 pts · draw published', resultHintKo:'현지 9월 9일 예선 · The Hood · 1000점 · 대진 공개',
    sourceName:'Official PPA Asia Kuala Lumpur Cup', sourceUrl:KL_EVENT, detail:true
  });

  upsertEvent({
    slug:'ppa-arizona-open-2026', tour:'PPA', status:'upcoming', start:'2026-09-14', end:'2026-09-20',
    updatedAt:UPDATED_AT, updatedAtLabel:UPDATED_LABEL,
    title:'Veolia Arizona Open', titleKo:'Veolia Arizona Open',
    location:'Arizona Athletic Grounds, Mesa, AZ', locationKo:'미국 애리조나 Mesa · Arizona Athletic Grounds',
    summary:'The next U.S. PPA main-tour stop after Nationals is the 1,000-point Arizona Open in Mesa, September 14–20.',
    summaryKo:'Nationals 다음 미국 PPA 본투어는 9월 14–20일 Mesa에서 열리는 1,000포인트 Arizona Open입니다.',
    resultHint:'Sep 14–20 · Mesa · 1000 pts', resultHintKo:'9월 14–20일 · Mesa · 1000점',
    sourceName:'PPA Tour events calendar', sourceUrl:PPA_EVENTS, detail:true
  });

  upsertEvent({
    slug:'mlp-nations-cup-dallas-2026', tour:'MLP', status:'upcoming', start:'2026-10-30', end:'2026-11-01',
    updatedAt:UPDATED_AT, updatedAtLabel:UPDATED_LABEL,
    title:'2026 MLP Nations Cup — Dallas', titleKo:'2026 MLP Nations Cup — Dallas',
    location:'Dallas, TX', locationKo:'미국 텍사스 Dallas',
    summary:'The 2026 MLP season title is decided; the next MLP event on the league calendar is the Nations Cup in Dallas, October 30–November 1.',
    summaryKo:'2026 MLP 시즌 챔피언은 확정됐고, 리그의 다음 공식 일정은 10월 30일–11월 1일 Dallas에서 열리는 Nations Cup입니다.',
    resultHint:'Next MLP event · Oct 30–Nov 1', resultHintKo:'다음 MLP 일정 · 10월 30일–11월 1일',
    sourceName:'Official MLP 2026 events', sourceUrl:MLP_NATIONS, detail:true
  });


  upsertTournament({
    slug:'mlp-nations-cup-dallas-2026', tour:'MLP', status:'upcoming', resultStatus:'upcoming', title:'2026 MLP Nations Cup — Dallas', titleKo:'2026 MLP Nations Cup — Dallas',
    dates:'Oct 30 – Nov 1, 2026', datesKo:'2026년 10월 30일 – 11월 1일', location:'Dallas, TX', locationKo:'미국 텍사스 Dallas',
    overview:'The 2026 club season is complete, and the Nations Cup is the next MLP event listed for Dallas. Picklary is keeping this page intentionally conservative until MLP publishes the final field, rosters, match format, and detailed schedule.',
    overviewKo:'2026 클럽 시즌이 끝난 뒤 이어지는 다음 MLP 일정은 Dallas Nations Cup입니다. 최종 참가 팀·선수 명단·경기 방식·세부 일정은 MLP 공식 발표 전까지 임의로 채우지 않고, 확인된 정보만 순차적으로 반영합니다.',
    participants:['Official Nations Cup field and rosters — to be confirmed by MLP'],
    participantsKo:['Nations Cup 최종 참가 팀과 선수 명단 — MLP 공식 발표 후 반영'],
    watch:['How leading MLP players regroup after the club championship season','Which national or representative combinations MLP confirms for Dallas','Whether the event format changes partnership strategy compared with regular-season MLP','Schedule, rosters, and draw should be rechecked once MLP publishes the event-specific page'],
    watchKo:['클럽 챔피언십을 마친 주요 MLP 선수들이 어떤 조합으로 다시 구성되는지','MLP가 Dallas에 어떤 국가·대표 조합을 확정하는지','정규시즌 MLP와 다른 경기 방식이 파트너 전략에 어떤 변화를 만드는지','대회 전용 공식 페이지가 공개되면 일정·선수 명단·대진을 다시 확인할 필요가 있습니다.'],
    notableFacts:['Oct 30 – Nov 1, 2026','Dallas, Texas','Next MLP event listed after the 2026 season championship'],
    notableFactsKo:['2026년 10월 30일 – 11월 1일','미국 텍사스 Dallas','2026 시즌 챔피언십 이후 예정된 다음 MLP 일정'],
    storyline:'For now, the useful information is the calendar position rather than an invented matchup. Picklary will convert this preview into a result-first event page as MLP confirms the field and competition details.',
    storylineKo:'현재 단계에서 중요한 정보는 임의의 예상 대진이 아니라 공식 일정의 위치입니다. MLP가 참가 팀과 경기 방식을 확정하면 프리뷰를 보강하고, 실제 경기가 시작되면 결과 우선 페이지로 전환합니다.',
    results:[], resultChecked:UPDATED_LABEL, resultCheckedKo:UPDATED_LABEL,
    resultNote:'Upcoming event. Final field, rosters, detailed format, draw, and results are not yet confirmed on the event-specific MLP page.',
    resultNoteKo:'다가오는 대회입니다. 최종 참가 팀, 선수 명단, 세부 경기 방식, 대진과 결과는 대회별 MLP 공식 페이지에서 확정되는 대로 반영합니다.',
    sourceUrl:MLP_NATIONS, sourceName:'Official MLP 2026 events', sourceNameKo:'MLP 2026 공식 일정', archive:false, detail:true
  });

  const nationalsResults = [
    { division:'Women’s Singles', divisionKo:'여자 단식', champ:'Anna Leigh Waters', silver:'Kate Fahey', score:'11–1, 11–9' },
    { division:'Men’s Singles', divisionKo:'남자 단식', champ:'Hunter Johnson', silver:'Federico Staksrud', score:'7–11, 11–3, 11–0' },
    { division:'Women’s Doubles', divisionKo:'여자 복식', champ:'Anna Bright / Anna Leigh Waters', silver:'Tyra Black / Jorja Johnson', score:'11–5, 11–6, 11–3' },
    { division:'Men’s Doubles', divisionKo:'남자 복식', champ:'Ben Johns / Gabe Tardio', silver:'Christian Alshon / Andrei Daescu', score:'11–8, 11–8, 5–11, 11–5' },
    { division:'Mixed Doubles', divisionKo:'혼합복식', champ:'Anna Bright / Hayden Patriquin', silver:'Jorja Johnson / JW Johnson', score:'11–9, 11–3, 11–7' }
  ];
  upsertTournament({
    slug:'ppa-nationals-cary-2026', tour:'PPA', status:'completed', resultStatus:'confirmed', title:'Veolia Pickleball National Championships 2026', titleKo:'Veolia Pickleball National Championships 2026',
    dates:'Aug 31 – Sep 6, 2026', datesKo:'2026년 8월 31일 – 9월 6일', location:'Cary Tennis Park, Cary, NC', locationKo:'미국 노스캐롤라이나 Cary Tennis Park',
    overview:'The first PPA major of the new September-to-May season immediately reset the competitive picture. The event was worth 2,000 points and was the first major using the new three-discipline World Pickleball Rankings framework.',
    overviewKo:'9월–5월 체제로 바뀐 새 시즌의 첫 PPA 메이저입니다. 2,000포인트가 걸렸고, 성별 복식·혼합복식·단식 결과를 합산하는 새 World Pickleball Rankings 체계가 적용되는 첫 메이저였습니다.',
    participants:['Anna Leigh Waters — women’s singles & doubles champion','Anna Bright — women’s doubles & mixed champion','Hunter Johnson — men’s singles champion','Ben Johns / Gabe Tardio — men’s doubles champions','Anna Bright / Hayden Patriquin — mixed champions'],
    participantsKo:['Anna Leigh Waters — 여자 단식·복식 우승','Anna Bright — 여자 복식·혼합복식 우승','Hunter Johnson — 남자 단식 우승','Ben Johns / Gabe Tardio — 남자 복식 우승','Anna Bright / Hayden Patriquin — 혼합복식 우승'],
    watch:['Waters and Bright both leave Cary with two titles, but in different combinations.','Hunter Johnson flipped the men’s singles final after dropping the first game and won the decider 11–0.','Johns/Tardio collected another men’s doubles title while Bright/Patriquin denied the Johnson siblings in mixed.','The new PPA ranking model weights gender doubles 50%, mixed 35%, and singles 15%, so multi-discipline consistency matters more than before.'],
    watchKo:['Waters와 Bright가 각각 2관왕에 올랐지만 우승 조합은 달랐습니다.','Hunter Johnson은 남자 단식 결승 1게임을 내준 뒤 흐름을 뒤집어 최종 게임을 11-0으로 끝냈습니다.','Johns/Tardio가 남자 복식 우승을 추가했고, 혼합복식에서는 Bright/Patriquin이 Johnson 남매를 막았습니다.','새 PPA 랭킹은 성별 복식 50%, 혼합복식 35%, 단식 15% 비중이라 여러 종목에서 꾸준한 성적을 내는 가치가 커졌습니다.'],
    notableFacts:['Aug 31–Sep 6 at Cary Tennis Park','PPA Major · 2,000 points','Opening event of the 2026–27 PPA season','Five pro gold-medal finals completed'],
    notableFactsKo:['8월 31일–9월 6일 Cary Tennis Park','PPA Major · 2,000포인트','2026–27 PPA 시즌 개막전','프로 5개 종목 결승 완료'],
    storyline:'The most useful takeaway is not simply who won. Waters and Bright showed how elite women can create value across multiple disciplines, while Hunter Johnson’s singles final showed how dramatically one tactical reset can change a short best-of-three match.',
    storylineKo:'핵심은 우승자 이름만 보는 것이 아닙니다. Waters와 Bright는 여러 종목에서 다른 파트너와 결과를 만들어내는 다종목 경쟁력을 보여줬고, Hunter Johnson의 단식 결승은 짧은 3전 2선승제에서도 전술 리셋 하나가 흐름을 얼마나 크게 바꿀 수 있는지 보여줬습니다.',
    results:nationalsResults, resultChecked:UPDATED_LABEL, resultCheckedKo:UPDATED_LABEL,
    sourceUrl:PPA_NATIONALS, sourceName:'Official PPA Nationals', sourceNameKo:'PPA Nationals 공식 페이지', secondaryUrl:PPA_NATIONALS_RECAP, secondaryName:'PPA Championship Sunday recap', secondaryNameKo:'PPA Championship Sunday 공식 리캡', archive:true, detail:true
  });

  const shenzhenResults = [
    { division:'Men’s Singles', divisionKo:'남자 단식', champ:'Grayson Goldin', silver:'Hien Truong', score:'4–11, 11–9, 12–10', note:'Goldin saved match point from 5–10 in the third game.', noteKo:'Goldin이 3게임 5-10에서 매치포인트를 막고 역전했습니다.' },
    { division:'Women’s Singles', divisionKo:'여자 단식', champ:'Chao Yi Wang', silver:'Rika Fujiwara', score:'11–4, 11–8' },
    { division:'Men’s Doubles', divisionKo:'남자 복식', champ:'Collin Johns / Len Yang', silver:'Eunggwon Kim / Hong Kit Wong', score:'11–7, 11–8' },
    { division:'Women’s Doubles', divisionKo:'여자 복식', champ:'Sophia Nhi Huynh / Ho Tam', silver:'Lingwei Kong / Selina Turulja', score:'11–9, 3–11, 11–6' },
    { division:'Mixed Doubles', divisionKo:'혼합복식', champ:'Sahra Dennehy / Tama Shimabukuro', silver:'Sophia Nhi Huynh / Hien Truong', score:'11–6, 11–1' }
  ];
  upsertTournament({
    slug:'ppa-asia-shenzhen-open-2026', tour:'PPA Asia', status:'completed', resultStatus:'confirmed', title:'Skechers Shenzhen Open 2026', titleKo:'Skechers Shenzhen Open 2026',
    dates:'Aug 20–23, 2026', datesKo:'2026년 8월 20–23일', location:"Shenzhen Bao'an Sports Center Gymnasium, Shenzhen, China", locationKo:'중국 선전 Shenzhen Bao’an Sports Center Gymnasium',
    overview:'The Shenzhen 500 produced one of PPA Asia’s best comeback stories of the season. Grayson Goldin erased a 5–10 third-game deficit in the men’s singles final, while the doubles titles showed the increasingly international mix of the Asia field.',
    overviewKo:'Shenzhen 500에서는 이번 PPA Asia 시즌을 대표할 만한 역전극이 나왔습니다. Grayson Goldin이 남자 단식 결승 3게임 5-10 열세를 뒤집었고, 복식에서는 여러 국가 출신 선수가 섞인 조합들이 우승하며 아시아 투어의 국제화 흐름을 보여줬습니다.',
    participants:['Grayson Goldin — men’s singles champion','Chao Yi Wang — women’s singles champion','Collin Johns / Len Yang — men’s doubles champions','Sophia Nhi Huynh / Ho Tam — women’s doubles champions','Sahra Dennehy / Tama Shimabukuro — mixed champions'],
    participantsKo:['Grayson Goldin — 남자 단식 우승','Chao Yi Wang — 여자 단식 우승','Collin Johns / Len Yang — 남자 복식 우승','Sophia Nhi Huynh / Ho Tam — 여자 복식 우승','Sahra Dennehy / Tama Shimabukuro — 혼합복식 우승'],
    watch:['Goldin scored seven straight points to close the singles final after facing match point.','Huynh and Ho became the first Vietnamese women to win a women’s doubles PPA Tour Asia gold.','Kim/Wong finally broke a run of semifinal exits but were stopped by Johns/Yang in the final.','Tama Shimabukuro converted a big multi-event week into mixed doubles gold.'],
    watchKo:['Goldin은 매치포인트 위기에서 7연속 득점으로 단식 결승을 끝냈습니다.','Huynh/Ho는 PPA Tour Asia 여자 복식 금메달을 딴 첫 베트남 여성 조합이 됐습니다.','Kim/Wong은 연속 준결승 탈락 흐름을 끊고 결승에 올랐지만 Johns/Yang에게 막혔습니다.','Tama Shimabukuro는 여러 종목에서 깊이 올라간 주간을 혼합복식 금메달로 마무리했습니다.'],
    notableFacts:['PPA Asia 500 · US$70,000 prize pool','Five pro gold-medal finals','Goldin won from match point down','Next PPA Asia stop: Kuala Lumpur 1000'],
    notableFactsKo:['PPA Asia 500 · 총상금 미화 7만 달러','프로 5개 종목 결승','Goldin, 매치포인트 위기에서 역전 우승','다음 PPA Asia 대회: Kuala Lumpur 1000'],
    storyline:'Shenzhen matters because it gives context to Kuala Lumpur. Chao Yi Wang arrives in Malaysia off a singles title, Kim/Wong are still chasing a men’s doubles breakthrough together, and several players from the Shenzhen field are seeded to collide again.',
    storylineKo:'Shenzhen 결과는 Kuala Lumpur를 보는 기준이 됩니다. Chao Yi Wang은 단식 우승 직후 말레이시아에 들어가고, Kim/Wong은 남자 복식 첫 우승을 계속 노립니다. Shenzhen에서 맞붙었던 선수들이 Kuala Lumpur 시드에서도 다시 충돌할 가능성이 큽니다.',
    results:shenzhenResults, resultChecked:'2026-08-23', resultCheckedKo:'2026-08-23',
    sourceUrl:SHENZHEN_EVENT, sourceName:'Official PPA Asia Shenzhen event', sourceNameKo:'PPA Asia Shenzhen 공식 페이지', secondaryUrl:SHENZHEN_RECAP, secondaryName:'PPA Asia Championship Sunday recap', secondaryNameKo:'PPA Asia 결승 공식 리캡', archive:true, detail:true
  });

  upsertTournament({
    slug:'ppa-asia-kuala-lumpur-cup-2026', tour:'PPA Asia', status:'live', resultStatus:'live', title:'PPA Asia 1000 Leapmotor Kuala Lumpur Cup 2026', titleKo:'PPA Asia 1000 Leapmotor Kuala Lumpur Cup 2026',
    dates:'Sep 9–13, 2026', datesKo:'2026년 9월 9–13일', location:'The Hood, Kuala Lumpur, Malaysia', locationKo:'말레이시아 쿠알라룸푸르 The Hood',
    overview:'Malaysia hosts a 1,000-point PPA Asia stop with up to US$300,000 in pro prize money. The September 9 qualifying session runs 9:00 AM–9:00 PM GMT+8, followed by the main draw, quarterfinals, semifinals, and Championship Sunday on September 13.',
    overviewKo:'말레이시아에서 1,000포인트 PPA Asia 대회가 진행됩니다. 프로 상금은 최대 미화 30만 달러입니다. 현지시간(GMT+8) 9월 9일 오전 9시–오후 9시 예선에 이어 본선, 8강, 준결승을 거쳐 9월 13일 Championship Sunday로 마무리됩니다.',
    participants:['Men’s singles: #1 Zane Ford · #2 Hong Kit Wong · #3 Tama Shimabukuro · #4 Noe Khlif','Women’s singles: #1 Kaitlyn Christian · #2 Brooke Buckner · #3 Chao Yi Wang','Men’s doubles: #1 Gabriel Tardio / Noe Khlif · #2 Augustus Ge / Len Yang · #3 Tama Shimabukuro / Yuta Funemizu · #4 Eunggwon Kim / Hong Kit Wong','Mixed doubles: #1 Gabriel Tardio / Jessie Irvine; Kaitlyn Christian is also seeded in mixed and women’s doubles'],
    participantsKo:['남자 단식: #1 Zane Ford · #2 Hong Kit Wong · #3 Tama Shimabukuro · #4 Noe Khlif','여자 단식: #1 Kaitlyn Christian · #2 Brooke Buckner · #3 Chao Yi Wang','남자 복식: #1 Gabriel Tardio / Noe Khlif · #2 Augustus Ge / Len Yang · #3 Tama Shimabukuro / Yuta Funemizu · #4 Eunggwon Kim / Hong Kit Wong','혼합복식: #1 Gabriel Tardio / Jessie Irvine. Kaitlyn Christian은 혼합복식과 여자 복식에도 시드를 받았습니다.'],
    watch:['Tardio/Khlif go from recent MLP rivals to the No. 1 men’s doubles seed in Malaysia.','A projected men’s doubles semifinal could match Tardio/Khlif with Eunggwon Kim/Hong Kit Wong.','Noe Khlif’s Asia singles debut could run into #5 Luc Pham in the quarterfinals.','Kaitlyn Christian and Brooke Buckner are the projected women’s singles finalists, but Chao Yi Wang arrives off the Shenzhen title.','The event is a useful test of whether U.S.-based stars can immediately adapt to the faster travel and unfamiliar regional matchups of PPA Asia.'],
    watchKo:['Tardio/Khlif는 최근 MLP에서 상대였지만 말레이시아에서는 남자 복식 1번 시드로 한 팀을 이룹니다.','남자 복식 예상 준결승에서는 Tardio/Khlif와 Eunggwon Kim/Hong Kit Wong이 만날 가능성이 있습니다.','Noe Khlif의 아시아 단식 데뷔는 8강에서 #5 Luc Pham과 이어질 가능성이 있습니다.','여자 단식 예상 결승은 Kaitlyn Christian과 Brooke Buckner지만, Shenzhen 우승자 Chao Yi Wang이 반대편에서 기다립니다.','미국 중심의 상위 선수들이 긴 이동과 익숙하지 않은 지역 매치업에 얼마나 빠르게 적응하는지 확인할 수 있는 대회입니다.'],
    notableFacts:['Sep 9–13 at The Hood, Kuala Lumpur','PPA Asia 1000 · up to US$300,000 pro prize money','Qualifying starts Sep 9 at 9:00 AM GMT+8','Finals: Sep 13, not before 1:00 PM GMT+8','Draws published September 8'],
    notableFactsKo:['9월 9–13일 · The Hood, Kuala Lumpur','PPA Asia 1000 · 프로 상금 최대 미화 30만 달러','9월 9일 오전 9시(GMT+8) 예선 시작','결승은 9월 13일 오후 1시(GMT+8) 이후','9월 8일 대진 공개'],
    storyline:'The headline is the crossover between the U.S. pro scene and Asia. Tardio and Khlif arrive from opposite sides of the MLP Finals and immediately become the top men’s doubles seed, while Christian, Buckner, Chao Yi Wang, and the established Asia names make the women’s draws much deeper than a simple exhibition field.',
    storylineKo:'핵심은 미국 프로 무대와 아시아 투어의 본격적인 교차입니다. MLP 파이널에서 상대였던 Tardio와 Khlif가 곧바로 남자 복식 1번 시드를 이루고, Christian·Buckner·Chao Yi Wang과 아시아 강자들이 함께 들어오면서 단순 초청전이 아닌 깊은 대진이 만들어졌습니다.',
    scheduleRows:[
      {day:'Sep 9', dayKo:'9월 9일', time:'9:00 AM–9:00 PM GMT+8', timeKo:'오전 9시–오후 9시 GMT+8', match:'Qualifying', matchKo:'예선'},
      {day:'Sep 10', dayKo:'9월 10일', time:'9:00 AM–10:00 PM GMT+8', timeKo:'오전 9시–오후 10시 GMT+8', match:'R64 / R32 / R16', matchKo:'64강 / 32강 / 16강'},
      {day:'Sep 11', dayKo:'9월 11일', time:'9:00 AM–7:00 PM GMT+8', timeKo:'오전 9시–오후 7시 GMT+8', match:'R16 & Quarterfinals', matchKo:'16강 및 8강'},
      {day:'Sep 12', dayKo:'9월 12일', time:'9:00 AM–7:00 PM GMT+8', timeKo:'오전 9시–오후 7시 GMT+8', match:'Semifinals', matchKo:'준결승'},
      {day:'Sep 13', dayKo:'9월 13일', time:'1:00 PM–6:00 PM GMT+8', timeKo:'오후 1시–6시 GMT+8', match:'Finals', matchKo:'결승'}
    ],
    resultChecked:UPDATED_LABEL, resultCheckedKo:UPDATED_LABEL,
    resultNote:'The draw and schedule are published and qualifying is underway locally; no final pro result has been posted yet. Picklary will switch this page to result-first mode as official matches are completed.',
    resultNoteKo:'대진과 일정이 공개됐고 현지에서는 예선이 진행되는 시간대입니다. 아직 프로 종목 최종 결과는 없습니다. 공식 경기가 끝나는 대로 이 페이지는 미리보기보다 결과가 먼저 보이도록 전환합니다.',
    results:[], sourceUrl:KL_EVENT, sourceName:'Official PPA Asia Kuala Lumpur Cup', sourceNameKo:'PPA Asia Kuala Lumpur Cup 공식 페이지', secondaryUrl:KL_DRAW, secondaryName:'Official September 8 draw preview', secondaryNameKo:'9월 8일 PPA Asia 공식 대진 프리뷰', archive:false, detail:true
  });

  upsertTournament({
    slug:'mlp-finals-new-york-city-2026', tour:'MLP', status:'completed', resultStatus:'confirmed', title:'2026 DoorDash MLP Finals — New York City', titleKo:'2026 DoorDash MLP 파이널 — New York City',
    dates:'Aug 28–30, 2026', datesKo:'2026년 8월 28–30일', location:'CityPickle at Wollman Rink, New York, NY', locationKo:'미국 뉴욕 Wollman Rink · CityPickle',
    overview:'New Jersey 5s finally converted a third straight championship appearance into the season title. St. Louis pushed both Finals matches to DreamBreakers, but New Jersey won the deciding singles rotations 22–20 and 21–9 to sweep the championship series 2–0.',
    overviewKo:'New Jersey 5s가 세 시즌 연속 챔피언십 진출 끝에 마침내 시즌 우승을 차지했습니다. St. Louis는 파이널 두 매치를 모두 DreamBreaker까지 끌고 갔지만, New Jersey가 결정 단식 로테이션을 22-20과 21-9로 가져가 시리즈를 2-0으로 끝냈습니다.',
    participants:['Champion — New Jersey 5s','Runner-up — St. Louis Shock','Semifinalist — Brooklyn Pickleball Team','Semifinalist — Dallas Flash'],
    participantsKo:['우승 — New Jersey 5s','준우승 — St. Louis Shock','4강 — Brooklyn Pickleball Team','4강 — Dallas Flash'],
    watch:['Both championship matches reached DreamBreakers, so the title was decided by singles depth after the doubles games split.','Federico Staksrud and Anna Leigh Waters gave New Jersey a major advantage in the deciding singles rotations.','The Finals on CBS averaged 773,000 viewers, an MLP record and the second-most watched pro pickleball event on any network according to MLP.','The season championship is complete; the next MLP event is the Nations Cup in Dallas, October 30–November 1.'],
    watchKo:['챔피언십 두 매치 모두 DreamBreaker까지 가면서 복식보다 단식 로테이션의 깊이가 우승을 갈랐습니다.','New Jersey는 결정전에서 Federico Staksrud와 Anna Leigh Waters의 단식 경쟁력이 큰 우위로 작용했습니다.','MLP에 따르면 CBS 파이널 중계는 평균 77만3천 명으로 리그 역대 최고이자 프로 피클볼 전체에서도 두 번째로 높은 시청 기록이었습니다.','시즌 챔피언은 확정됐고 다음 MLP 일정은 10월 30일–11월 1일 Dallas Nations Cup입니다.'],
    notableFacts:['New Jersey 5s — 2026 MLP champion','St. Louis Shock — runner-up','Final series 2–0','DreamBreakers: 22–20 and 21–9 to New Jersey','773,000 average CBS viewers'],
    notableFactsKo:['New Jersey 5s — 2026 MLP 챔피언','St. Louis Shock — 준우승','파이널 시리즈 2-0','DreamBreaker: New Jersey 22-20, 21-9 승리','CBS 평균 시청자 77만3천 명'],
    storyline:'MLP’s best regular-season teams reached the final, but the title still came down to a very specific roster-building question: what happens when all four doubles games cannot separate the teams? New Jersey had the stronger DreamBreaker structure and used it twice.',
    storylineKo:'정규시즌 최상위권 두 팀이 결승에서 만났지만 우승은 결국 로스터 구성의 한 가지 질문으로 좁혀졌습니다. 네 번의 복식 경기로 승부가 나지 않을 때 누가 더 강한가? New Jersey는 DreamBreaker 구조에서 우위를 보였고 이를 두 번 모두 결과로 바꿨습니다.',
    results:[{division:'Championship series', divisionKo:'챔피언십 시리즈', champ:'New Jersey 5s', silver:'St. Louis Shock', score:'Series 2–0 · DreamBreakers 22–20, 21–9', scoreKo:'시리즈 2-0 · DreamBreaker 22-20, 21-9'}],
    resultChecked:'2026-09-02', resultCheckedKo:'2026-09-02', sourceUrl:MLP_FINALS, sourceName:'Official MLP Finals', sourceNameKo:'MLP Finals 공식 페이지', secondaryUrl:MLP_FINALS_RECAP, secondaryName:'Championship match analysis', secondaryNameKo:'챔피언십 경기 분석', archive:true, detail:true
  });

  upsertTournament({
    slug:'ppa-arizona-open-2026', tour:'PPA', status:'upcoming', resultStatus:'upcoming', title:'Veolia Arizona Open 2026', titleKo:'Veolia Arizona Open 2026',
    dates:'Sep 14–20, 2026', datesKo:'2026년 9월 14–20일', location:'Arizona Athletic Grounds, Mesa, AZ', locationKo:'미국 애리조나 Mesa · Arizona Athletic Grounds',
    overview:'The first U.S. PPA Open after Nationals is a 1,000-point stop in Mesa. It begins one day after the Kuala Lumpur Cup finishes, making the travel and lineup choices of players who move between the U.S. and Asia especially relevant.',
    overviewKo:'Nationals 이후 첫 미국 PPA Open은 Mesa에서 열리는 1,000포인트 대회입니다. Kuala Lumpur Cup 결승 바로 다음 날 일정이 시작되기 때문에 미국과 아시아를 오가는 선수들의 이동·출전 선택도 관전 포인트입니다.',
    participants:['Main-tour field — check the official event page as entries update'], participantsKo:['본투어 출전 명단 — 변경 가능하므로 공식 이벤트 페이지에서 최종 확인'],
    watch:['How Nationals results reshape seeding and expectations','Whether multi-event champions keep momentum after the major','Travel management for players active in PPA Asia'], watchKo:['Nationals 결과가 시드와 기대치를 어떻게 바꾸는지','메이저 다관왕 선수들이 흐름을 이어갈지','PPA Asia를 병행하는 선수들의 이동·체력 관리'],
    notableFacts:['Sep 14–20 · Mesa, Arizona','PPA Open · 1,000 points'], notableFactsKo:['9월 14–20일 · 미국 애리조나 Mesa','PPA Open · 1,000포인트'],
    resultChecked:UPDATED_LABEL, resultCheckedKo:UPDATED_LABEL, resultNote:'Upcoming event — final draws and results will be added from the official PPA source.', resultNoteKo:'다가오는 대회입니다. 최종 대진과 결과는 PPA 공식 출처 확인 후 반영합니다.', results:[], sourceUrl:PPA_EVENTS, sourceName:'PPA Tour events calendar', sourceNameKo:'PPA Tour 공식 일정', archive:false, detail:true
  });

  // Add fresh result-first posts and remove stale pre-playoff lead items that would outrank them.
  board.posts = board.posts.filter((x) => !['mlp-dallas-round1-final-0810','ppa-nationals-final-0908','mlp-finals-2026-champion','ppa-asia-kl-draw-0908'].includes(x.id));
  board.posts.unshift(
    {
      id:'ppa-asia-kl-draw-0908', date:'2026-09-08', updatedAt:UPDATED_AT, updatedAtLabel:UPDATED_LABEL, kind:'preview', tour:'PPA Asia', discipline:'all', confidence:'official',
      title:'Kuala Lumpur draw is out: Tardio/Khlif top men’s doubles as PPA Asia 1000 starts',
      titleKo:'Kuala Lumpur 대진 공개: Tardio/Khlif 남자 복식 1번 시드, PPA Asia 1000 개막',
      summary:'The September 9–13 PPA Asia 1000 at The Hood is ready to start. Zane Ford and Kaitlyn Christian lead the singles seeds, while Gabriel Tardio/Noe Khlif top men’s doubles and Tardio/Jessie Irvine top mixed.',
      summaryKo:'9월 9–13일 The Hood에서 열리는 PPA Asia 1000이 개막을 앞두고 있습니다. 단식은 Zane Ford와 Kaitlyn Christian이 1번 시드, 남자 복식은 Gabriel Tardio/Noe Khlif, 혼합복식은 Tardio/Jessie Irvine이 1번 시드입니다.',
      sourceName:'PPA Tour Asia official draw preview', sourceUrl:KL_DRAW, secondaryUrl:KL_EVENT, secondaryName:'Official event page', internalUrl:'tournaments/ppa-asia-kuala-lumpur-cup-2026/'
    },
    {
      id:'ppa-nationals-final-0908', date:'2026-09-08', updatedAt:'2026-09-08T12:00:00-04:00', updatedAtLabel:'2026-09-08', kind:'result', tour:'PPA', discipline:'all', confidence:'official',
      title:'PPA Nationals final: Waters and Bright leave Cary with two titles each',
      titleKo:'PPA Nationals 최종 결과: Waters·Bright 각각 2관왕',
      summary:'Hunter Johnson won men’s singles, Ben Johns/Gabe Tardio men’s doubles, Anna Leigh Waters women’s singles, Waters/Anna Bright women’s doubles, and Bright/Hayden Patriquin mixed.',
      summaryKo:'남자 단식은 Hunter Johnson, 남자 복식은 Ben Johns/Gabe Tardio, 여자 단식은 Anna Leigh Waters, 여자 복식은 Waters/Anna Bright, 혼합복식은 Bright/Hayden Patriquin이 우승했습니다.',
      sourceName:'PPA Championship Sunday recap', sourceUrl:PPA_NATIONALS_RECAP, secondaryUrl:PPA_NATIONALS, secondaryName:'Official event page', internalUrl:'tournaments/ppa-nationals-cary-2026/'
    },
    {
      id:'mlp-finals-2026-champion', date:'2026-09-02', updatedAt:'2026-09-02T12:00:00-04:00', updatedAtLabel:'2026-09-02', kind:'result', tour:'MLP', discipline:'team', confidence:'official',
      title:'New Jersey 5s are the 2026 MLP champions', titleKo:'New Jersey 5s, 2026 MLP 챔피언',
      summary:'New Jersey defeated St. Louis in the championship series after both matches reached DreamBreakers. The CBS Finals window averaged 773,000 viewers, an MLP record.',
      summaryKo:'New Jersey가 두 매치 모두 DreamBreaker까지 간 챔피언십 시리즈에서 St. Louis를 꺾었습니다. CBS 파이널 중계는 평균 77만3천 명으로 MLP 역대 최고를 기록했습니다.',
      sourceName:'MLP Finals official page', sourceUrl:MLP_FINALS, secondaryUrl:MLP_VIEWERS, secondaryName:'MLP viewership release', internalUrl:'tournaments/mlp-finals-new-york-city-2026/'
    }
  );

  board.storylines = board.storylines.filter((x) => !['Kuala Lumpur turns recent rivals into top seeds','The PPA season restarts with a ranking reset'].includes(x.title));
  board.storylines.unshift(
    {
      date:'2026-09-08', updatedAt:UPDATED_AT, confidence:'analysis', tour:'PPA Asia',
      title:'Kuala Lumpur turns recent rivals into top seeds', titleKo:'Kuala Lumpur, 최근 라이벌들이 1번 시드 파트너로',
      body:'Tardio and Khlif arrive from opposite sides of the MLP Finals and immediately become the No. 1 men’s doubles team in Malaysia. That partnership is the clearest example of how quickly the pro game now crosses league, tour, and regional boundaries.',
      bodyKo:'Tardio와 Khlif는 MLP 파이널에서 서로 다른 팀으로 맞붙은 뒤 말레이시아에서는 곧바로 남자 복식 1번 시드 파트너가 됐습니다. 리그·투어·지역 경계를 빠르게 넘나드는 현재 프로 피클볼의 흐름을 가장 잘 보여주는 조합입니다.',
      sourceName:'PPA Tour Asia draw preview', sourceUrl:KL_DRAW
    },
    {
      date:'2026-09-08', updatedAt:'2026-09-08T12:00:00-04:00', confidence:'analysis', tour:'PPA',
      title:'The PPA season restarts with a ranking reset', titleKo:'PPA 새 시즌, 랭킹 계산 방식까지 달라졌다',
      body:'Nationals did more than crown five champions. It opened the September-to-May schedule under a World Pickleball Rankings formula that values gender doubles most, followed by mixed and singles, changing how multi-discipline performance should be read.',
      bodyKo:'Nationals는 단순히 다섯 종목 우승자를 가린 대회가 아닙니다. 9월–5월 새 시즌의 시작이자 성별 복식, 혼합복식, 단식을 서로 다른 비중으로 합산하는 World Pickleball Rankings 체계가 적용되는 첫 메이저였습니다.',
      sourceName:'PPA Nationals storylines', sourceUrl:'https://www.ppatour.com/veolia-pickleball-national-championships-storylines/'
    }
  );

  return board;
};
