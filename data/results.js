/* Completed-event recaps for the tournament results page.
 *
 * INTEGRITY RULES (read before editing):
 *  - Winners and scores are FACTS, verified from reliable sources on the `checked`
 *    date and linked via `sourceUrl`. They are not invented.
 *  - All prose summaries are written in our OWN words. Do NOT paste article text,
 *    stat tables, or quotes from the sources.
 *  - Standings/records can be amended after the fact, so every card shows a
 *    "results as of <checked>, verify at the official source" note in the template.
 *  - Only add a new event after you have confirmed the winners on an official or
 *    reputable source and written your own summary.
 */
module.exports = [
    {
    id: 'r-2026-mlp', slug: '2026-mlp-season', status: 'published',
    event: 'Major League Pickleball 2026 (in progress)', eventKo: '메이저 리그 피클볼 2026 (진행 중)',
    tier: 'Team league', tierKo: '팀 리그',
    dates: '2026 season — May to August', datesKo: '2026 시즌 — 5~8월',
    location: 'Multiple U.S. host cities', locationKo: '미국 여러 개최 도시',
    sourceName: 'MLP', sourceUrl: 'https://majorleaguepickleball.co/standings/',
    liveUrl: 'https://majorleaguepickleball.co/standings/', liveLabel: 'Live standings & New York scores', liveLabelKo: '라이브 순위·뉴욕 스코어',
    checked: '2026-06-26',
    summary: 'MLP’s 20-team coed league plays nine regular-season events from May to August, and standings points — not single-event wins — decide the 12-team playoff field. Five stops are complete and the New York event is underway; St. Louis and New Jersey have pulled clear at the top.',
    summaryKo: 'MLP는 20개 코에드 팀이 5~8월 9개 정규 이벤트를 치르며, 단일 이벤트 우승이 아니라 standings 포인트로 12팀 플레이오프 진출이 정해집니다. 5개 대회가 끝나고 뉴욕 대회가 진행 중이며, St. Louis와 New Jersey가 선두권을 형성했습니다.',
    winnersLabel: 'Event-by-event results (5 of 9 regular-season stops)', winnersLabelKo: '이벤트별 결과 (정규 9개 중 5개 완료)',
    winners: [
      { division: 'Dallas — May 22–25 (opener)', divisionKo: '댈러스 — 5/22–25 (개막)', champ: 'LA Mad Drops', note: 'Mad Drops lifted the first Super Sunday Belt.', noteKo: 'Mad Drops가 첫 Super Sunday 벨트 획득.' },
      { division: 'Columbus — May 28–31', divisionKo: '콜럼버스 — 5/28–31', champ: 'New Jersey 5s', silver: 'St. Louis Shock', bronze: 'Columbus Sliders', note: '5s swept the Shock 3-0 (11-3, 11-8, 11-9); host Sliders took 3rd.', noteKo: '5s가 Shock를 3-0(11-3, 11-8, 11-9)으로 완파; 홈팀 Sliders 3위.' },
      { division: 'St. Louis — June 4–7', divisionKo: '세인트루이스 — 6/4–7', champ: 'St. Louis Shock', silver: 'LA Mad Drops', note: 'Shock won 3-0, combined 33-9.', noteKo: 'Shock가 3-0(합산 33-9)으로 우승.' },
      { division: 'Austin — June 11–14', divisionKo: '오스틴 — 6/11–14', champ: 'New Jersey 5s', note: '5s added a second title; the Shock and Mad Drops did not play this stop.', noteKo: '5s가 두 번째 우승; 이 대회에는 Shock·Mad Drops 불참.' },
      { division: 'St. Petersburg — June 17–21', divisionKo: '세인트피터스버그 — 6/17–21', champ: 'St. Louis Shock', silver: 'LA Mad Drops', bronze: 'Brooklyn Pickleball Team', note: 'Shock beat the Mad Drops 3-0 (33-15) in the rubber match; Palm Beach 4th.', noteKo: 'Shock가 결승서 Mad Drops를 3-0(33-15)으로; Palm Beach 4위.' }
    ],
    standingsLabel: 'Title race so far', standingsLabelKo: '현재 타이틀 레이스',
    standings: [
      { team: 'St. Louis Shock', note: 'Won St. Louis and St. Pete; unbeaten in matches since late May and tracking toward a top-2 seed.', noteKo: 'St. Louis·St. Pete 우승; 5월 말 이후 경기 무패로 톱2 시드 유력.' },
      { team: 'New Jersey 5s', note: 'Bounced back from a 4th-place opener to win Columbus and Austin, led by Anna Leigh Waters.', noteKo: '개막 4위에서 반등해 Columbus·Austin 우승, 애나 리 워터스가 견인.' },
      { team: 'LA Mad Drops', note: 'Won the Dallas opener, then runner-up in St. Louis and St. Pete — swept by the Shock both times.', noteKo: 'Dallas 우승 후 St. Louis·St. Pete 준우승 — 두 번 모두 Shock에 스윕.' },
      { team: 'Columbus Sliders', note: '2025 champions; added Tyra Black by trade for a four-deep Top-10 doubles lineup.', noteKo: '2025 챔피언; 트레이드로 Tyra Black을 더해 톱10 복식 4인 라인업 구성.' },
      { team: 'Palm Beach Royals', note: 'Expansion side off to a strong debut behind Tyson McGuffin and Sofia Sewing.', noteKo: '신생팀이지만 타이슨 맥거핀·소피아 슈잉을 앞세워 호조의 데뷔.' }
    ],
    storylineTitle: 'Storyline — the Shock’s surge', storylineTitleKo: '관전 포인트 — Shock의 질주',
    storyline: 'The St. Louis Shock have been the story of the summer, taking back-to-back titles in St. Louis and St. Pete and staying unbeaten in matches since late May behind Anna Bright, Kate Fahey, Gabe Tardio and Hayden Patriquin. New Jersey answered an early stumble with wins in Columbus and Austin, while the Mad Drops keep reaching finals only to meet the Shock. With the Mid-Season Tournament next (July 8–12, alongside the Beer City Open and featuring all 20 teams plus guest national squads), seeding for the expanded playoffs is still wide open.',
    storylineKo: 'St. Louis Shock가 여름의 주인공입니다. St. Louis·St. Pete를 연달아 제패하고 5월 말 이후 경기 무패 행진을 이어가고 있죠(애나 브라이트·케이트 페이히·게이브 타르디오·헤이든 파트리퀸). New Jersey는 초반 부진을 Columbus·Austin 우승으로 만회했고, Mad Drops는 결승마다 Shock에 막혔습니다. 다음은 Mid-Season 토너먼트(7/8–12, Beer City Open 병행, 20개 팀+게스트 국가대표팀)이며, 확대된 플레이오프 시드는 아직 활짝 열려 있습니다.'
  },
  {
    id: 'r-2026-ppa-finals', slug: '2026-ppa-finals', status: 'published',
    event: 'Toys “R” Us PPA Finals', eventKo: 'Toys “R” Us PPA 파이널스',
    tier: 'Season finale', tierKo: '시즌 파이널',
    dates: 'May 4–10, 2026', datesKo: '2026년 5월 4–10일',
    location: 'Life Time Rancho San Clemente, San Clemente, CA',
    locationKo: '미국 캘리포니아 산클레멘테 (Life Time Rancho San Clemente)',
    sourceName: 'PPA Tour', sourceUrl: 'https://ppatour.com/championship-sunday-standout-stats-from-the-toys-r-us-ppa-finals/',
    checked: '2026-06-19',
    summary: 'The season-ending championship for the top qualifiers wrapped up the 2025–26 PPA Tour season, and the top seeds largely held serve. Ben Johns and Gabe Tardio finished an unbeaten men’s doubles campaign, and Anna Leigh Waters added more hardware in doubles and mixed even after sitting out singles.',
    summaryKo: '상위 시드 위주로 마무리된 2025–26 PPA 투어의 시즌 결승전입니다. 벤 존스와 게이브 타르디오가 무패의 남자 복식 시즌을 완성했고, 애나 리 워터스는 단식을 건너뛰고도 복식·혼합에서 우승을 더했습니다.',
    winners: [
      { division: 'Men’s singles', divisionKo: '남자 단식', champ: 'Christopher Haworth' },
      { division: 'Women’s singles', divisionKo: '여자 단식', champ: 'Kate Fahey' },
      { division: 'Men’s doubles', divisionKo: '남자 복식', champ: 'Ben Johns / Gabe Tardio' },
      { division: 'Women’s doubles', divisionKo: '여자 복식', champ: 'Anna Bright / Anna Leigh Waters' },
      { division: 'Mixed doubles', divisionKo: '혼합 복식', champ: 'Anna Leigh Waters / Ben Johns' }
    ],
    storylineTitle: 'Storyline & upset', storylineTitleKo: '관전 포인트 · 업셋',
    storyline: 'The biggest jolt came in men’s singles pool play, where Connor Garnett took down world No. 1 Christopher Haworth and finished pool play unbeaten — though Haworth recovered to win the title. Anna Leigh Waters withdrew from singles citing knee trouble, opening the door for Kate Fahey, who did not drop a game on her way to the women’s singles crown.',
    storylineKo: '가장 큰 이변은 남자 단식 풀 플레이에서 나왔습니다. 코너 가넷이 세계 1위 크리스토퍼 해워스를 잡고 풀 플레이를 무패로 마쳤죠(다만 해워스가 회복해 우승). 애나 리 워터스는 무릎 문제로 단식을 기권했고, 그 틈을 케이트 페이히가 한 게임도 내주지 않고 여자 단식 우승으로 메웠습니다.'
  },
  {
    id: 'r-2026-atlanta', slug: '2026-veolia-atlanta', status: 'published',
    event: 'Veolia Atlanta Pickleball Championships', eventKo: 'Veolia 애틀랜타 피클볼 챔피언십',
    tier: 'Slam', tierKo: '슬램',
    dates: 'April 27 – May 3, 2026', datesKo: '2026년 4월 27일 – 5월 3일',
    location: 'Life Time Peachtree Corners, Peachtree Corners, GA',
    locationKo: '미국 조지아 피치트리코너스 (Life Time Peachtree Corners)',
    sourceName: 'PPA Tour', sourceUrl: 'https://ppatour.com/championship-sunday-standout-stats-from-the-veolia-atlanta-pickleball-championships-2/',
    checked: '2026-06-19',
    summary: 'The final Slam of the regular season carried double ranking points and a national CBS window, and it doubled as the last chance to qualify for the Finals. Anna Leigh Waters swept all three of her events for another career Triple Crown, while Ben Johns and Gabe Tardio kept their men’s doubles streak alive.',
    summaryKo: '정규 시즌 마지막 슬램으로, 랭킹 포인트가 2배(2,000점)이고 CBS 전국 중계까지 걸린 대회였습니다. 동시에 파이널스 진출권이 걸린 마지막 관문이었죠. 애나 리 워터스가 출전 세 종목을 모두 휩쓸어 또 한 번의 트리플 크라운을 달성했고, 벤 존스·게이브 타르디오는 남자 복식 연승을 이어갔습니다.',
    winners: [
      { division: 'Men’s singles', divisionKo: '남자 단식', champ: 'Christopher Haworth' },
      { division: 'Women’s singles', divisionKo: '여자 단식', champ: 'Anna Leigh Waters' },
      { division: 'Men’s doubles', divisionKo: '남자 복식', champ: 'Ben Johns / Gabe Tardio' },
      { division: 'Women’s doubles', divisionKo: '여자 복식', champ: 'Anna Leigh Waters / Anna Bright' },
      { division: 'Mixed doubles', divisionKo: '혼합 복식', champ: 'Anna Leigh Waters / Ben Johns' }
    ],
    storylineTitle: 'Storyline & upset', storylineTitleKo: '관전 포인트 · 업셋',
    storyline: 'The run of the week belonged to 15-year-old Tama Shimabukuro of Hawaii. Seeded No. 22, he beat higher seeds and Hunter Johnson to reach the men’s singles final before falling to world No. 1 Christopher Haworth — a breakout that had the tour talking about the sport’s next generation.',
    storylineKo: '이 주의 주인공은 하와이 출신 15세 타마 시마부쿠로였습니다. 22번 시드였던 그는 상위 시드들과 헌터 존슨을 꺾고 남자 단식 결승까지 올라간 뒤 세계 1위 해워스에게 패했지만, 차세대 선수에 대한 화제를 만들어낸 돌풍이었습니다.'
  },
  {
    id: 'r-2026-hanoi', slug: '2026-ppa-asia-hanoi', status: 'published',
    event: 'PPA Asia — MB Hanoi Cup', eventKo: 'PPA 아시아 — MB 하노이컵',
    tier: 'International (PPA Asia)', tierKo: '국제 (PPA 아시아)',
    dates: 'April 1–5, 2026', datesKo: '2026년 4월 1–5일',
    location: 'My Dinh Indoor Arena, Hanoi, Vietnam', locationKo: '베트남 하노이 (My Dinh Indoor Arena)',
    sourceName: 'PPA Tour Asia', sourceUrl: 'https://www.ppatour-asia.com/tournament/2026/hanoi-cup/',
    checked: '2026-06-19',
    summary: 'The first PPA Tour Asia stop of 2026 was played on the slower JOOLA HC-40 ball in Vietnam’s capital, and it doubled as Anna Leigh Waters’ international debut. The men’s singles final made history.',
    summaryKo: '2026년 PPA 투어 아시아의 첫 대회로, 베트남 수도에서 더 느린 공식 공(JOOLA HC-40)으로 치러졌으며 애나 리 워터스의 국제무대 데뷔전이기도 했습니다. 남자 단식 결승은 역사를 썼습니다.',
    winners: [
      { division: 'Men’s singles', divisionKo: '남자 단식', champ: 'Ly Hoang Nam' },
      { division: 'Women’s singles', divisionKo: '여자 단식', champ: 'Kaitlyn Christian' },
      { division: 'Men’s doubles', divisionKo: '남자 복식', champ: 'Ben Johns / Gabe Tardio' },
      { division: 'Women’s doubles', divisionKo: '여자 복식', champ: 'Anna Leigh Waters / Anna Bright' },
      { division: 'Mixed doubles', divisionKo: '혼합 복식', champ: 'Anna Leigh Waters / Ben Johns' }
    ],
    storylineTitle: 'Storyline & upset', storylineTitleKo: '관전 포인트 · 업셋',
    storyline: 'For the first time at a PPA 1000-level event, two players from the host nation met in the men’s singles final — Ly Hoang Nam beat fellow Vietnamese player Truong Vinh Hien on home soil, after Ly knocked out No. 2 seed Christian Alshon and Truong upset the top seed. On the women’s side, Kaitlyn Christian saved match points from 2–8 down in the second game to complete a wild comeback for the title.',
    storylineKo: 'PPA 1000급 대회 사상 처음으로 개최국 선수 두 명이 남자 단식 결승에서 맞붙었습니다 — 리 호앙 남이 홈에서 같은 베트남의 쯔엉 빈 히엔을 꺾었죠. 리는 2번 시드 크리스티안 알숀을, 쯔엉은 1번 시드를 각각 잡아냈습니다. 여자 단식에서는 케이틀린 크리스티안이 2세트 2–8 열세에서 매치포인트를 막아내며 짜릿한 역전 우승을 거뒀습니다.'
  },
  {
    id: 'r-2026-masters', slug: '2026-ppa-masters', status: 'published',
    event: 'Carvana PPA Masters', eventKo: 'Carvana PPA 마스터스',
    tier: 'Slam', tierKo: '슬램',
    dates: 'January 12–18, 2026', datesKo: '2026년 1월 12–18일',
    location: 'Mission Hills Country Club, Rancho Mirage (Palm Springs), CA',
    locationKo: '미국 캘리포니아 랜초미라지/팜스프링스 (Mission Hills Country Club)',
    sourceName: 'PPA Tour', sourceUrl: 'https://ppatour.com/tournament/2026/the-ppa-masters-powered-by-invited/',
    checked: '2026-06-19',
    summary: 'The year’s big January Slam opened the season in Palm Springs and drew record broadcast numbers for pro pickleball. Anna Leigh Waters opened with another Masters Triple Crown, and Ben Johns and Gabe Tardio took the men’s doubles title to start their season.',
    summaryKo: '시즌을 여는 1월의 대형 슬램으로, 팜스프링스에서 프로 피클볼 사상 최고 수준의 중계 시청률을 기록했습니다. 애나 리 워터스가 또 한 번 마스터스 트리플 크라운으로 시즌을 열었고, 벤 존스·게이브 타르디오가 남자 복식 우승으로 출발했습니다.',
    winners: [
      { division: 'Men’s singles', divisionKo: '남자 단식', champ: 'Christopher Haworth' },
      { division: 'Women’s singles', divisionKo: '여자 단식', champ: 'Anna Leigh Waters' },
      { division: 'Men’s doubles', divisionKo: '남자 복식', champ: 'Ben Johns / Gabe Tardio' },
      { division: 'Women’s doubles', divisionKo: '여자 복식', champ: 'Anna Leigh Waters / Anna Bright' },
      { division: 'Mixed doubles', divisionKo: '혼합 복식', champ: 'Anna Leigh Waters / Ben Johns' }
    ],
    storylineTitle: 'Storyline & upset', storylineTitleKo: '관전 포인트 · 업셋',
    storyline: 'In men’s singles, Christopher Haworth came through against Jack Sock in the title match. The bigger headline was off the scoreboard: the Masters reportedly drew a peak audience of more than a million viewers, a record showing for a pro pickleball broadcast.',
    storylineKo: '남자 단식에서는 크리스토퍼 해워스가 결승에서 잭 삭을 꺾었습니다. 다만 더 큰 화제는 점수판 밖에 있었는데, 마스터스는 최고 100만 명 이상의 시청자를 모은 것으로 전해져 프로 피클볼 중계의 기록적인 수치를 남겼습니다.'
  }
];
