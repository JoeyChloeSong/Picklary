'use strict';
module.exports = function enrichTourBoard(board) {
  if (!board || !Array.isArray(board.tournaments)) return board;
  board.updated = '2026-07-22';
  board.seasonThreads = [
    {
      title:'The right side is becoming an attacking position', titleKo:'오른쪽 포지션이 공격 역할로 바뀌고 있다',
      body:'Gabriel Tardio, Hayden Patriquin, and Christian Alshon are making the traditional support-side role more proactive. Their counters, middle pressure, and transition attacks are changing partnership construction.',
      bodyKo:'Gabriel Tardio, Hayden Patriquin, Christian Alshon은 전통적인 보조 역할이던 오른쪽 포지션을 더 적극적으로 바꾸고 있습니다. 카운터, 중앙 압박, 전환 공격이 파트너십 구성 자체를 변화시킵니다.',
      links:['players/gabriel-tardio/','players/hayden-patriquin/','players/christian-alshon/']
    },
    {
      title:'Women’s doubles is now a partnership laboratory', titleKo:'여자복식은 파트너십 실험실이 됐다',
      body:'Waters, Bright, Rohrabacher, Black, Johnson, and the Kawamoto sisters offer different answers to the same question: how should speed, feel, middle ownership, and court coverage be divided?',
      bodyKo:'Waters, Bright, Rohrabacher, Black, Johnson, Kawamoto 자매는 속도·감각·중앙 소유·코트 커버를 어떻게 나눌 것인지에 서로 다른 답을 제시합니다.',
      links:['players/anna-leigh-waters/','players/anna-bright/','players/rachel-rohrabacher/','players/hurricane-tyra-black/','players/jorja-johnson/']
    },
    {
      title:'Singles remains the fastest route to a new name', titleKo:'싱글은 새로운 이름이 등장하는 가장 빠른 통로다',
      body:'Hunter Johnson, Kate Fahey, Christopher Haworth, Kaitlyn Christian, and Federico Staksrud show how one strong week can reshape the singles conversation.',
      bodyKo:'Hunter Johnson, Kate Fahey, Christopher Haworth, Kaitlyn Christian, Federico Staksrud는 한 번의 강한 대회가 싱글 구도를 얼마나 빠르게 바꿀 수 있는지 보여 줍니다.',
      links:['players/hunter-johnson/','players/kate-fahey/','players/federico-staksrud/']
    },
    {
      title:'Junior pathways are becoming part of the pro conversation', titleKo:'주니어 성장 경로가 프로 스토리의 일부가 되고 있다',
      body:'Ella Oh’s age-group progression gives readers a way to follow development, coaching, event choice, and equipment partnerships before a player reaches the senior tour.',
      bodyKo:'Ella Oh의 연령별 성장 과정은 선수가 시니어 투어에 오르기 전부터 성장, 코칭, 대회 선택, 장비 파트너십을 추적할 수 있게 합니다.',
      links:['players/ella-oh/']
    }
  ];

  const eventBySlug = (slug) => board.tournaments.find((x) => x.slug === slug);
  const addEvent = (event) => {
    const idx = board.tournaments.findIndex((x) => x.slug === event.slug);
    if (idx >= 0) board.tournaments[idx] = Object.assign({}, board.tournaments[idx], event);
    else board.tournaments.push(event);
  };
  const source = {
    indoor:'https://ppatour.com/tournament/2026/pickleball-central-indoor-national-championships/',
    indoorStats:'https://ppatour.com/championship-sunday-standout-stats-from-the-pickleball-central-indoor-national-championships/',
    mesa:'https://ppatour.com/tournament/2026/carvana-mesa-cup/',
    mesaStats:'https://ppatour.com/championship-sunday-standout-stats-from-the-carvana-mesa-cup-2/',
    cape:'https://ppatour.com/tournament/2026/zimmer-biomet-cape-coral-open/',
    capeStats:'https://ppatour.com/championship-sunday-standout-stats-from-the-zimmer-biomet-cape-coral-open/'
  };

  addEvent({
    slug:'ppa-indoor-national-championships-2026', archive:true, status:'completed', resultStatus:'confirmed', tour:'PPA', start:'2026-01-19', end:'2026-01-25',
    title:'Pickleball Central Indoor National Championships', titleKo:'Pickleball Central 인도어 내셔널 챔피언십',
    dates:'January 19–25, 2026', datesKo:'2026년 1월 19–25일', location:'Life Time Lakeville, Minnesota', locationKo:'미국 미네소타 Life Time Lakeville',
    overview:'The second event of the 2026 season produced five different championship stories: a new mixed team, a five-game men’s doubles final, an established women’s partnership, and two singles champions who took advantage of an open draw.',
    overviewKo:'2026 시즌 두 번째 대회는 새로운 혼합복식 조합, 5게임 남자복식 결승, 확립된 여자복식 파트너십, 열린 드로우를 활용한 두 싱글 챔피언이라는 다섯 가지 다른 우승 스토리를 만들었습니다.',
    sourceName:'PPA official event page', sourceUrl:source.indoor, secondaryName:'PPA Championship Sunday recap', secondaryUrl:source.indoorStats,
    resultChecked:'2026-07-22', resultNote:'Official Winners Circle and Championship Sunday recap verified.', resultNoteKo:'공식 Winners Circle과 Championship Sunday 리캡 확인 완료.',
    results:[
      {division:'Mixed doubles',divisionKo:'혼합복식',champ:'Hurricane Tyra Black / Christian Alshon',silver:'Anna Bright / Hayden Patriquin',bronze:'Parris Todd / Andrei Daescu',score:'11-8, 11-9, 11-6'},
      {division:'Men’s doubles',divisionKo:'남자복식',champ:'Andrei Daescu / Gabriel Tardio',silver:'Christian Alshon / Hayden Patriquin',bronze:'Eric Oncins / Dylan Frazier',score:'1-11, 14-12, 10-12, 11-8, 12-10'},
      {division:'Women’s doubles',divisionKo:'여자복식',champ:'Anna Bright / Anna Leigh Waters',silver:'Parris Todd / Hurricane Tyra Black',bronze:'Meghan Dizon / Lacy Schneemann',score:'11-1, 6-11, 11-3, 11-5'},
      {division:'Men’s singles',divisionKo:'남자싱글',champ:'Hunter Johnson',silver:'Christopher Haworth',bronze:'Roscoe Bellamy',score:'11-6, 11-0'},
      {division:'Women’s singles',divisionKo:'여자싱글',champ:'Parris Todd',silver:'Lea Jansen',bronze:'Kaitlyn Christian',score:'11-5, 11-5'}
    ],
    resultLinks:[{label:'Official Winners Circle',labelKo:'공식 Winners Circle',url:source.indoor},{label:'Championship Sunday recap',labelKo:'챔피언십 선데이 리캡',url:source.indoorStats}],
    participants:['Anna Leigh Waters and Anna Bright anchored the women’s doubles field.','Gabriel Tardio, Christian Alshon, Hayden Patriquin, and Andrei Daescu formed the men’s doubles final.','Singles draws were open enough for Hunter Johnson and Parris Todd to define the week.'],
    participantsKo:['Anna Leigh Waters와 Anna Bright가 여자복식의 중심이었습니다.','Gabriel Tardio, Christian Alshon, Hayden Patriquin, Andrei Daescu가 남자복식 결승을 구성했습니다.','싱글 드로우에서는 Hunter Johnson과 Parris Todd가 대회를 대표했습니다.'],
    watch:['How a new mixed team established role clarity immediately.','Why the men’s doubles final required five games and repeated tactical changes.','How indoor conditions rewarded compact counters and repeatable depth.'],
    watchKo:['새 혼합 조합이 역할을 얼마나 빨리 정립했는지.','남자복식 결승이 5게임과 반복 전술 변화를 요구한 이유.','실내 조건이 간결한 카운터와 반복 깊이에 준 이점.'],
    notableFacts:['The men’s doubles final lasted five games and included three games decided by two points.','Hunter Johnson allowed only six points in the men’s singles final.','Black and Alshon won their first title together without dropping a final game.','Bright and Waters recovered after losing Game Two in women’s doubles.'],
    notableFactsKo:['남자복식 결승은 5게임이었고 세 게임이 2점 차로 끝났습니다.','Hunter Johnson은 남자싱글 결승에서 6점만 허용했습니다.','Black과 Alshon은 결승에서 한 게임도 내주지 않고 첫 우승을 합작했습니다.','Bright와 Waters는 여자복식 2게임을 내준 뒤 회복했습니다.'],
    stories:[
      {kicker:'NEW TEAM',kickerKo:'새 조합',title:'Black and Alshon found immediate mixed chemistry',titleKo:'Black과 Alshon, 즉시 혼합복식 호흡 완성',body:'Athletic coverage and two-handed counters gave the new team a clear two-way pressure identity.',bodyKo:'운동 능력 기반 커버와 투핸드 카운터가 양방향 압박 정체성을 만들었습니다.'},
      {kicker:'FIVE-GAME TEST',kickerKo:'5게임 시험',title:'Daescu and Tardio survived the tactical swings',titleKo:'Daescu와 Tardio, 전술 변화 속 생존',body:'The final moved from a one-sided opener to repeated deuce pressure, testing role clarity and emotional control.',bodyKo:'일방적인 첫 게임 이후 반복 듀스 압박으로 바뀌며 역할과 감정 통제를 시험했습니다.'},
      {kicker:'SINGLES WINDOW',kickerKo:'싱글 기회',title:'Hunter Johnson turned an open draw into a statement',titleKo:'Hunter Johnson, 열린 드로우를 강한 선언으로',body:'A 11-6, 11-0 final showed how first-ball pressure can take control of a singles week.',bodyKo:'11-6, 11-0 결승은 첫 공 압박이 싱글 대회를 지배하는 방식을 보여 줬습니다.'}
    ],
    storyline:'Indoor Nationals established several 2026 themes early: aggressive right-side play, deeper singles fields, and the importance of partnerships that can change speed without losing structure.', storylineKo:'인도어 내셔널은 공격적인 오른쪽 역할, 깊어진 싱글 선수층, 구조를 잃지 않고 속도를 바꾸는 파트너십이라는 2026년 핵심 흐름을 일찍 보여 줬습니다.',
    deepReads:[
      {title:'Why indoor pickleball changes the counter battle',titleKo:'실내 피클볼이 카운터 싸움을 바꾸는 이유',body:'Stable light and wind remove excuses, so contact point, paddle preparation, and middle geometry become more visible. The event rewarded teams that could keep swings short and reset without drifting backward.',bodyKo:'안정된 조명과 바람 없는 환경에서는 타점, 패들 준비, 중앙 기하가 더 선명하게 드러납니다. 짧은 스윙과 뒤로 밀리지 않는 리셋이 강한 조합이 보상받았습니다.'},
      {title:'The new right-side job description',titleKo:'새로운 오른쪽 선수의 직무',body:'Tardio, Patriquin, and Alshon did more than defend their line. They created attacks from the middle and transition zone, forcing left-side partners to share rather than monopolize creation.',bodyKo:'Tardio, Patriquin, Alshon은 라인 수비를 넘어 중앙과 전환 구역에서 공격을 만들었습니다. 왼쪽 선수가 창조를 독점하기보다 나누게 했습니다.'},
      {title:'What club players can borrow',titleKo:'동호인이 가져갈 수 있는 것',body:'Use indoor sessions to measure repeatable contact: ten low resets, ten compact counters, and ten deep returns before adding speed.',bodyKo:'실내 연습에서는 속도보다 반복 타점을 측정하세요. 낮은 리셋 10개, 간결한 카운터 10개, 깊은 리턴 10개를 먼저 수행합니다.'}
    ],
    timeline:[['Jan 19','Opening rounds and progressive draw began.','대회 초반과 프로그레시브 드로우 시작.'],['Jan 24','Singles finalists separated themselves.','싱글 결승 진출자 확정.'],['Jan 25','Five divisions completed on Championship Sunday.','Championship Sunday 5개 종목 종료.']],
    clubLessons:['Short swings travel better under speed.','A right-side player needs permission to create.','Singles depth starts with serve-plus-one planning.'],
    clubLessonsKo:['빠른 공에는 짧은 스윙이 더 안정적입니다.','오른쪽 선수에게도 공격 시작 권한이 필요합니다.','싱글 깊이는 서브 + 첫 공격 계획에서 시작합니다.'],
    relatedPlayers:['hurricane-tyra-black','christian-alshon','gabriel-tardio','hayden-patriquin','hunter-johnson','anna-bright','anna-leigh-waters']
  });

  addEvent({
    slug:'carvana-mesa-cup-2026', archive:true, status:'completed', resultStatus:'confirmed', tour:'PPA', start:'2026-02-16', end:'2026-02-22',
    title:'Carvana Mesa Cup', titleKo:'Carvana 메사 컵', dates:'February 16–22, 2026', datesKo:'2026년 2월 16–22일', location:'Arizona Athletic Grounds, Mesa, Arizona', locationKo:'미국 애리조나 메사 Arizona Athletic Grounds',
    overview:'Mesa produced one of the season’s clearest partnership statements: Anna Bright and Hayden Patriquin defeated Anna Leigh Waters and Ben Johns in straight games for their first mixed title together.',
    overviewKo:'메사는 시즌의 가장 분명한 파트너십 선언 가운데 하나를 만들었습니다. Anna Bright와 Hayden Patriquin이 Anna Leigh Waters와 Ben Johns를 3게임 연속으로 꺾고 첫 혼합 우승을 합작했습니다.',
    sourceName:'PPA official event page', sourceUrl:source.mesa, secondaryName:'PPA Championship Sunday recap', secondaryUrl:source.mesaStats, resultChecked:'2026-07-22', resultNote:'Official event Winners Circle and stats recap verified.', resultNoteKo:'공식 Winners Circle과 통계 리캡 확인 완료.',
    results:[
      {division:'Mixed doubles',divisionKo:'혼합복식',champ:'Anna Bright / Hayden Patriquin',silver:'Anna Leigh Waters / Ben Johns',bronze:'Hurricane Tyra Black / Andrei Daescu',score:'11-8, 11-9, 11-3'},
      {division:'Men’s doubles',divisionKo:'남자복식',champ:'Ben Johns / Gabriel Tardio',silver:'Christian Alshon / Hayden Patriquin',bronze:'Andrei Daescu / Federico Staksrud',score:'8-11, 11-6, 11-8, 13-11'},
      {division:'Women’s doubles',divisionKo:'여자복식',champ:'Anna Bright / Anna Leigh Waters',silver:'Jorja Johnson / Hurricane Tyra Black',bronze:'Lacy Schneemann / Tina Pisnik',score:'11-1, 13-11, 11-7'},
      {division:'Men’s singles',divisionKo:'남자싱글',champ:'Christopher Haworth',silver:'Ben Johns',bronze:'Christian Alshon',score:'11-6, 11-6'},
      {division:'Women’s singles',divisionKo:'여자싱글',champ:'Anna Leigh Waters',silver:'Kate Fahey',bronze:'Brooke Buckner',score:'11-3, 11-1'}
    ],
    resultLinks:[{label:'Official Winners Circle',labelKo:'공식 Winners Circle',url:source.mesa},{label:'Championship Sunday recap',labelKo:'챔피언십 선데이 리캡',url:source.mesaStats}],
    participants:['Waters/Johns entered as the established mixed benchmark.','Bright/Patriquin offered speed, anticipation, and wider defensive coverage.','Haworth and Fahey represented a deeper singles challenge.'], participantsKo:['Waters/Johns는 혼합복식의 기존 기준점으로 출전했습니다.','Bright/Patriquin은 속도·예측·넓은 수비 범위를 제시했습니다.','Haworth와 Fahey는 깊어진 싱글 경쟁을 대표했습니다.'],
    watch:['How Bright and Patriquin prevented the No. 1 pair from settling into middle patterns.','Why Johns/Tardio recovered after dropping the opening men’s doubles game.','How singles challengers used depth rather than reckless pace.'], watchKo:['Bright와 Patriquin이 #1 조합의 중앙 패턴 정착을 막은 방식.','Johns/Tardio가 남자복식 첫 게임을 내준 뒤 회복한 이유.','싱글 도전자들이 무리한 속도보다 깊이를 사용한 방식.'],
    notableFacts:['Bright and Patriquin won their first mixed title as a team.','Bright has won mixed titles with multiple different partners, reinforcing her adaptability storyline.','Haworth beat Ben Johns 11-6, 11-6 in the men’s singles final.','Waters held Fahey to four total points in the women’s singles final.'], notableFactsKo:['Bright와 Patriquin은 팀 첫 혼합 우승을 기록했습니다.','Bright는 여러 파트너와 혼합 우승을 만들어 적응력 스토리를 강화했습니다.','Haworth는 남자싱글 결승에서 Ben Johns를 11-6, 11-6으로 꺾었습니다.','Waters는 여자싱글 결승에서 Fahey에게 총 4점만 허용했습니다.'],
    stories:[
      {kicker:'PARTNERSHIP BREAKTHROUGH',kickerKo:'파트너십 돌파',title:'Bright and Patriquin changed the mixed hierarchy for a week',titleKo:'Bright와 Patriquin, 혼합복식 위계를 흔들다',body:'The straight-game final was not a lucky finish; it was a role-clarity win built on anticipation and coverage.',bodyKo:'3게임 연속 승리는 우연이 아니라 예측과 커버에 기반한 역할 명확성의 승리였습니다.'},
      {kicker:'RESPONSE',kickerKo:'대응',title:'Johns and Tardio adjusted after losing Game One',titleKo:'Johns와 Tardio, 1게임 패배 후 조정',body:'The men’s final showed why elite teams need a second pattern when the preferred opening shape fails.',bodyKo:'남자 결승은 선호 패턴이 실패할 때 두 번째 패턴이 필요한 이유를 보여 줬습니다.'},
      {kicker:'SINGLES DEPTH',kickerKo:'싱글 깊이',title:'Haworth and Fahey kept the fields from feeling predetermined',titleKo:'Haworth와 Fahey, 예정된 결말을 거부하다',body:'Their finals appearances made singles a live development story rather than a static ranking list.',bodyKo:'두 선수의 결승 진출은 싱글을 고정된 랭킹표가 아니라 살아 있는 성장 스토리로 만들었습니다.'}
    ],
    storyline:'Mesa connected partnership experimentation with singles disruption. It showed that even dominant teams must solve new geometry, and that new singles names can move the conversation quickly.', storylineKo:'메사는 파트너십 실험과 싱글 이변을 연결했습니다. 지배적인 조합도 새로운 코트 기하를 해결해야 하며, 새로운 싱글 이름이 구도를 빠르게 바꿀 수 있음을 보여 줬습니다.',
    deepReads:[
      {title:'How an upset becomes repeatable',titleKo:'이변을 반복 가능한 승리로 만드는 법',body:'Bright and Patriquin did not chase constant winners. They kept the middle uncomfortable, used coverage to survive the first counter, and attacked the next predictable ball.',bodyKo:'Bright와 Patriquin은 계속 위너를 노리지 않았습니다. 중앙을 불편하게 만들고 첫 카운터를 커버한 뒤 예측 가능한 다음 공을 공격했습니다.'},
      {title:'Partnership fit is more than rankings',titleKo:'파트너 궁합은 랭킹 이상이다',body:'Role compatibility, communication cost, and which player owns the middle can matter more than adding two individual rankings.',bodyKo:'역할 호환성, 의사소통 비용, 중앙 소유권은 개인 랭킹 두 개를 더한 것보다 중요할 수 있습니다.'},
      {title:'Singles as an open development lane',titleKo:'열린 성장 통로로서의 싱글',body:'One strong week can create a new contender because the discipline exposes movement, depth, and first-ball quality with fewer partnership variables.',bodyKo:'싱글은 파트너 변수 없이 이동·깊이·첫 공 품질을 드러내므로 한 번의 강한 대회가 새 도전자를 만들 수 있습니다.'}
    ],
    timeline:[['Feb 16','Progressive draw opened at Arizona Athletic Grounds.','프로그레시브 드로우 시작.'],['Feb 21','Finalists set across all five divisions.','5개 종목 결승 대진 확정.'],['Feb 22','Bright/Patriquin delivered the event’s defining result.','Bright/Patriquin이 대회 대표 결과 완성.']],
    clubLessons:['Define partner roles before playing faster.','Keep one adjustment ready after losing the first game.','Depth creates safer singles offense.'], clubLessonsKo:['더 빠르게 하기 전에 파트너 역할을 정하세요.','첫 게임 패배 후 사용할 조정 하나를 준비하세요.','깊이가 더 안전한 싱글 공격을 만듭니다.'],
    relatedPlayers:['anna-bright','hayden-patriquin','anna-leigh-waters','ben-johns','gabriel-tardio','kate-fahey']
  });

  addEvent({
    slug:'zimmer-biomet-cape-coral-open-2026', archive:true, status:'completed', resultStatus:'confirmed', tour:'PPA', start:'2026-02-09', end:'2026-02-15',
    title:'Zimmer Biomet Cape Coral Open', titleKo:'Zimmer Biomet 케이프 코럴 오픈', dates:'February 9–15, 2026', datesKo:'2026년 2월 9–15일', location:'The Courts, Cape Coral, Florida', locationKo:'미국 플로리다 Cape Coral The Courts',
    overview:'Cape Coral gave the season a full podium map. Established No. 1 partnerships won three doubles divisions, while Kaitlyn Christian and Federico Staksrud took the singles titles.', overviewKo:'Cape Coral은 시즌의 완전한 포디엄 지도를 제공했습니다. 확립된 #1 파트너십이 복식 세 종목을 차지했고 Kaitlyn Christian과 Federico Staksrud가 싱글 우승을 기록했습니다.',
    sourceName:'PPA official event page', sourceUrl:source.cape, secondaryName:'PPA Championship Sunday recap', secondaryUrl:source.capeStats, resultChecked:'2026-07-22', resultNote:'Official Winners Circle, brackets, and Championship Sunday recap verified.', resultNoteKo:'공식 Winners Circle·브래킷·리캡 확인 완료.',
    results:[
      {division:'Mixed doubles',divisionKo:'혼합복식',champ:'Anna Leigh Waters / Ben Johns',silver:'Anna Bright / Hayden Patriquin',bronze:'Rachel Rohrabacher / Christian Alshon',score:'11-7, 9-11, 3-11, 12-10, 11-5'},
      {division:'Men’s doubles',divisionKo:'남자복식',champ:'Ben Johns / Gabriel Tardio',silver:'JW Johnson / CJ Klinger',bronze:'Christian Alshon / Hayden Patriquin',score:'11-9, 11-4, 11-5'},
      {division:'Women’s doubles',divisionKo:'여자복식',champ:'Anna Bright / Anna Leigh Waters',silver:'Jackie Kawamoto / Jade Kawamoto',bronze:'Hurricane Tyra Black / Jorja Johnson',score:'12-10, 11-3, 11-2'},
      {division:'Women’s singles',divisionKo:'여자싱글',champ:'Kaitlyn Christian',silver:'Genie Bouchard',bronze:'Lea Jansen'},
      {division:'Men’s singles',divisionKo:'남자싱글',champ:'Federico Staksrud',silver:'Hunter Johnson',bronze:'Christian Alshon'}
    ],
    resultLinks:[{label:'Official Winners Circle and brackets',labelKo:'공식 Winners Circle·브래킷',url:source.cape},{label:'Championship Sunday recap',labelKo:'챔피언십 선데이 리캡',url:source.capeStats}],
    participants:['The top mixed and men’s doubles partnerships were present.','Kawamoto sisters reached the women’s doubles final through synchronized spacing.','Singles fields opened without several usual top names.'], participantsKo:['혼합·남자복식 정상급 조합이 출전했습니다.','Kawamoto 자매는 동기화된 간격으로 여자복식 결승에 올랐습니다.','싱글은 일부 기존 강자가 빠진 열린 구도였습니다.'],
    watch:['How Waters/Johns recovered from a 1–2 deficit in mixed doubles.','Why the Kawamoto sisters’ spacing created a finals run.','How Christian and Staksrud used an open singles field without treating it as easy.'], watchKo:['Waters/Johns가 혼합복식 1–2 열세에서 회복한 방식.','Kawamoto 자매의 간격이 결승 진출을 만든 이유.','Christian과 Staksrud가 열린 싱글 구도를 가볍게 보지 않고 활용한 방식.'],
    notableFacts:['Waters and Johns won their 59th title together after a five-game final.','Bright and Waters survived a 12-10 opening game before pulling away.','The Kawamoto sisters and Black/Johnson occupied the remaining women’s doubles podium positions.','Cape Coral’s winners received 1,000 ranking points.'], notableFactsKo:['Waters와 Johns는 5게임 결승 끝에 통산 59번째 합작 우승을 기록했습니다.','Bright와 Waters는 첫 게임 12-10을 넘긴 뒤 격차를 벌렸습니다.','Kawamoto 자매와 Black/Johnson이 여자복식 나머지 포디엄을 차지했습니다.','Cape Coral 우승자는 랭킹 포인트 1,000점을 받았습니다.'],
    stories:[
      {kicker:'COMEBACK',kickerKo:'역전',title:'Waters and Johns needed a second mixed-doubles solution',titleKo:'Waters와 Johns, 두 번째 혼합 해법이 필요했다',body:'After falling behind 1–2, the top team won a deuce fourth game and then separated in Game Five.',bodyKo:'1–2 열세 후 듀스 4게임을 잡고 5게임에서 격차를 벌였습니다.'},
      {kicker:'SIBLING SPACING',kickerKo:'자매 간격',title:'The Kawamotos made synchronization a competitive weapon',titleKo:'Kawamoto 자매, 동기화를 경쟁 무기로',body:'Their finals run showed the value of low communication cost and repeatable movement patterns.',bodyKo:'결승 진출은 낮은 의사소통 비용과 반복 가능한 이동 패턴의 가치를 보여 줬습니다.'},
      {kicker:'OPEN SINGLES',kickerKo:'열린 싱글',title:'Christian and Staksrud converted opportunity into titles',titleKo:'Christian과 Staksrud, 기회를 타이틀로',body:'Open draws still require discipline; both champions handled the week without assuming the bracket would solve itself.',bodyKo:'열린 드로우도 규율이 필요합니다. 두 우승자는 브래킷이 스스로 해결될 것이라 생각하지 않았습니다.'}
    ],
    storyline:'Cape Coral showed the difference between a favorite and an automatic winner. The leading doubles teams still needed comeback tools, while synchronized challengers and open singles fields generated new reading paths.', storylineKo:'Cape Coral은 우승 후보와 자동 우승자의 차이를 보여 줬습니다. 선두 복식 조합도 역전 도구가 필요했고, 동기화된 도전자와 열린 싱글 구도가 새로운 읽을거리를 만들었습니다.',
    deepReads:[
      {title:'What a five-game comeback reveals',titleKo:'5게임 역전이 보여 주는 것',body:'A comeback is not only emotional. It usually includes a target change, a return-position change, or a new decision about who initiates speed.',bodyKo:'역전은 감정만의 문제가 아닙니다. 타깃, 리턴 위치, 누가 속도를 시작할지에 대한 변화가 포함됩니다.'},
      {title:'Why sibling teams can move differently',titleKo:'자매 조합이 다르게 움직이는 이유',body:'Years of shared pattern recognition reduce verbal communication and let both players react to the same cue.',bodyKo:'오랜 공유 패턴 인식이 언어 의사소통을 줄이고 같은 신호에 동시에 반응하게 합니다.'},
      {title:'How to read an open draw',titleKo:'열린 드로우를 읽는 법',body:'Do not call a draw weak. Ask which style benefits, which player handles expectation, and whether a new contender can repeat the result later.',bodyKo:'약한 드로우라고 단정하지 마세요. 어떤 스타일이 유리했는지, 기대 압박을 누가 견뎠는지, 결과가 반복 가능한지 물어보세요.'}
    ],
    timeline:[['Feb 9','Progressive draw began at The Courts.','The Courts에서 프로그레시브 드로우 시작.'],['Feb 14','Singles and doubles finalists emerged.','싱글·복식 결승 진출자 확정.'],['Feb 15','Five champions completed the podium map.','5개 챔피언과 포디엄 완성.']],
    clubLessons:['Save one tactical change for Game Two.','Partner familiarity can reduce hesitation.','Open opportunities still demand professional routines.'], clubLessonsKo:['2게임을 위한 전술 변화 하나를 남겨 두세요.','파트너 친숙함이 망설임을 줄입니다.','열린 기회에도 프로 수준 루틴이 필요합니다.'],
    relatedPlayers:['anna-leigh-waters','ben-johns','anna-bright','hayden-patriquin','gabriel-tardio','jw-johnson','federico-staksrud','hunter-johnson','hurricane-tyra-black','jorja-johnson']
  });

  addEvent({
    slug:'ppa-italy-portoroz-2026', status:'live', resultStatus:'live', tour:'PPA', start:'2026-07-22', end:'2026-07-26',
    title:'PPA Italy 125 Portoroz', titleKo:'PPA 이탈리아 125 포르토로즈', dates:'July 22–26, 2026', datesKo:'2026년 7월 22–26일', location:'Portoroz, Slovenia / European PPA 125 stop', locationKo:'슬로베니아 포르토로즈 · 유럽 PPA 125 대회',
    overview:'The Portoroz stop extends the July international corridor from Melbourne into Europe and Singapore. At a 125-level event, regional field development and ranking opportunity matter as much as familiar star names.', overviewKo:'포르토로즈 대회는 멜버른에서 유럽과 싱가포르로 이어지는 7월 국제 일정을 확장합니다. 125급 대회에서는 익숙한 스타 이름만큼 지역 선수 성장과 랭킹 기회가 중요합니다.',
    sourceName:'PPA official schedule', sourceUrl:'https://ppatour.com/schedule/', resultChecked:'2026-07-22', resultNote:'Tournament window opened; results remain live and must be checked at the official draw.', resultNoteKo:'대회 기간이 시작됐으며 결과는 진행 중입니다. 공식 드로우에서 확인해야 합니다.',
    results:[], resultLinks:[{label:'PPA official schedule',labelKo:'PPA 공식 일정',url:'https://ppatour.com/schedule/'}],
    participants:['European regional professionals and international entrants.','Players seeking ranking points in the PPA international pathway.'], participantsKo:['유럽 지역 프로와 국제 참가 선수.','PPA 국제 경로에서 랭킹 포인트를 노리는 선수들.'],
    watch:['Which local players translate home conditions into deeper runs.','How travel from Melbourne or onward to Singapore affects field selection.','Whether international 125 events create repeat names who later appear at 250 and 500 stops.'], watchKo:['현지 선수가 홈 조건을 활용해 얼마나 깊이 진출하는지.','멜버른 또는 싱가포르 이동이 선수 선택에 미치는 영향.','125 대회가 이후 250·500에서도 보이는 반복 이름을 만드는지.'],
    notableFacts:['The event sits inside a dense international July window.','The 125 tier emphasizes pathway development and ranking access.','Official live draws remain the result source.'], notableFactsKo:['촘촘한 7월 국제 일정 안에 위치합니다.','125 등급은 성장 경로와 랭킹 접근성이 핵심입니다.','공식 라이브 드로우가 결과 출처입니다.'],
    stories:[
      {kicker:'REGIONAL PATHWAY',kickerKo:'지역 성장 경로',title:'A smaller tier can create the next repeat name',titleKo:'작은 등급이 다음 반복 이름을 만든다',body:'The value of a 125 stop is not only the champion; it is identifying players who can carry results into larger events.',bodyKo:'125 대회의 가치는 우승자뿐 아니라 더 큰 대회로 결과를 이어갈 선수를 발견하는 데 있습니다.'},
      {kicker:'TRAVEL MAP',kickerKo:'이동 지도',title:'July’s international corridor changes field decisions',titleKo:'7월 국제 이동이 선수 선택을 바꾼다',body:'Melbourne, Portoroz, and Singapore place travel, recovery, and ranking opportunity into the same strategic calculation.',bodyKo:'멜버른·포르토로즈·싱가포르는 이동·회복·랭킹 기회를 하나의 전략 계산에 넣습니다.'}
    ],
    storyline:'Portoroz is a development-window event: readers should follow who emerges, not only who arrives with the biggest profile.', storylineKo:'포르토로즈는 성장 창구형 대회입니다. 가장 큰 이름뿐 아니라 새롭게 등장하는 선수를 추적해야 합니다.',
    deepReads:[{title:'How to follow a pathway event',titleKo:'성장 경로 대회를 보는 법',body:'Track quarterfinal repeaters, not just champions. A player who repeatedly reaches late rounds across 125 and 250 stops is building a stronger signal than one isolated upset.',bodyKo:'우승자뿐 아니라 반복 8강 진출자를 보세요. 125와 250에서 계속 후반 라운드에 오르는 선수가 한 번의 이변보다 강한 신호입니다.'}],
    timeline:[['Jul 22','Event window opens.','대회 기간 시작.'],['Jul 23–25','Draws progress and regional contenders emerge.','드로우 진행과 지역 도전자 등장.'],['Jul 26','Finals and official result confirmation.','결승과 공식 결과 확인.']], clubLessons:['Follow repeatability, not only one upset.'], clubLessonsKo:['한 번의 이변보다 반복성을 추적하세요.'], relatedPlayers:[]
  });

  const portStatus = (board.statusEvents || []).find((x) => x.slug === 'ppa-italy-portoroz-2026');
  if (portStatus) { portStatus.status='live'; portStatus.detail=true; portStatus.location='Portoroz, Slovenia'; portStatus.locationKo='슬로베니아 포르토로즈'; }

  const archiveSlugs = ['ppa-indoor-national-championships-2026','carvana-mesa-cup-2026','zimmer-biomet-cape-coral-open-2026'];
  const archivePosts = [
    {id:'reading-indoor-2026',date:'2026-07-22',kind:'analysis',tour:'PPA',discipline:'all',confidence:'official',title:'Indoor Nationals: five finals, three new season signals',titleKo:'인도어 내셔널: 5개 결승과 3가지 시즌 신호',summary:'A five-game men’s doubles final, a new mixed partnership, and open singles champions make the January event worth revisiting.',summaryKo:'5게임 남자복식 결승, 새 혼합 조합, 열린 싱글 챔피언이 1월 대회를 다시 읽게 합니다.',sourceName:'PPA official recap',sourceUrl:source.indoorStats,internalUrl:'tournaments/ppa-indoor-national-championships-2026/'},
    {id:'reading-mesa-2026',date:'2026-07-22',kind:'analysis',tour:'PPA',discipline:'all',confidence:'official',title:'Mesa: the partnership upset that changed the early-season map',titleKo:'메사: 초반 시즌 지도를 바꾼 파트너십 업셋',summary:'Bright and Patriquin’s straight-game mixed win provides a detailed lesson in role fit, coverage, and middle pressure.',summaryKo:'Bright와 Patriquin의 혼합복식 3게임 연속 승리는 역할 궁합, 커버, 중앙 압박의 교과서입니다.',sourceName:'PPA official recap',sourceUrl:source.mesaStats,internalUrl:'tournaments/carvana-mesa-cup-2026/'},
    {id:'reading-cape-coral-2026',date:'2026-07-22',kind:'analysis',tour:'PPA',discipline:'all',confidence:'official',title:'Cape Coral: comebacks, sibling spacing, and an open singles lane',titleKo:'Cape Coral: 역전·자매 간격·열린 싱글 통로',summary:'The event connects a five-game mixed comeback, the Kawamoto sisters’ finals run, and new singles winners.',summaryKo:'5게임 혼합 역전, Kawamoto 자매 결승, 새로운 싱글 우승자를 하나의 흐름으로 연결합니다.',sourceName:'PPA official recap',sourceUrl:source.capeStats,internalUrl:'tournaments/zimmer-biomet-cape-coral-open-2026/'}
  ];
  board.posts = board.posts || [];
  archivePosts.reverse().forEach((p) => { if (!board.posts.some((x) => x.id === p.id)) board.posts.unshift(p); });

  // Add default long-form reading prompts to every detailed event that lacks them.
  for (const event of board.tournaments) {
    if (!event.deepReads || !event.deepReads.length) {
      const title = event.title || event.slug;
      event.deepReads = [
        {title:'How to read this event',titleKo:'이 대회를 읽는 방법',body:`Use ${title} to connect the result with partnership roles, schedule pressure, and the next ranking opportunity. The score is the starting point, not the whole story.`,bodyKo:`${event.titleKo || title}의 결과를 파트너 역할, 일정 압박, 다음 랭킹 기회와 연결해 보세요. 스코어는 출발점이지 전체 이야기가 아닙니다.`},
        {title:'The player-development question',titleKo:'선수 성장 질문',body:'Look for one player whose decisions changed across rounds. Improvement during a tournament often matters more than one highlight shot.',bodyKo:'라운드가 진행되며 판단이 바뀐 선수 한 명을 찾아보세요. 대회 중의 발전은 한 번의 하이라이트 샷보다 중요할 수 있습니다.'},
        {title:'What a club team can borrow',titleKo:'동호인 팀이 가져갈 것',body:'Choose one repeatable pattern—return and advance, third-shot selection, middle coverage, or reset height—and turn it into a ten-minute drill.',bodyKo:'리턴 후 전진, 3구 선택, 중앙 커버, 리셋 높이 가운데 반복 패턴 하나를 골라 10분 드릴로 바꾸세요.'}
      ];
    }
    if (!event.clubLessons || !event.clubLessons.length) {
      event.clubLessons=['Separate confirmed results from live expectation.','Study repeated patterns before copying highlight speed.','Connect the event to one player page and one practice goal.'];
      event.clubLessonsKo=['확정 결과와 진행 중 기대를 구분하세요.','하이라이트 속도보다 반복 패턴을 먼저 보세요.','대회를 선수 페이지 하나와 연습 목표 하나에 연결하세요.'];
    }
    if (!event.timeline || !event.timeline.length) {
      event.timeline=[[event.dates || event.start || '', 'Event window and official draw', '대회 기간과 공식 드로우'],['Result update','Picklary verifies winners and storylines after the official table stabilizes.','공식 표가 안정된 뒤 우승자와 스토리를 검증합니다.']];
    }
  }
  return board;
};
