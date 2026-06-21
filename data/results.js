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
    dates: '2026 season — ongoing', datesKo: '2026 시즌 — 진행 중',
    location: 'Multiple U.S. host cities', locationKo: '미국 여러 개최 도시',
    sourceName: 'MLP', sourceUrl: 'https://majorleaguepickleball.co/league-standings/',
    checked: '2026-06-19',
    summary: 'MLP’s team season runs through the summer in a multi-event format where standings points accumulate toward the playoffs. Through the early events the league has been defined by parity, with several different teams taking event titles.',
    summaryKo: 'MLP 팀 시즌은 여름 내내 여러 이벤트로 진행되며, standings 포인트가 누적되어 플레이오프로 이어집니다. 초반 이벤트들은 “전력 평준화”가 특징으로, 여러 팀이 번갈아 이벤트 우승을 차지했습니다.',
    winners: [
      { division: 'Latest event — MLP Austin', divisionKo: '최근 이벤트 — MLP 오스틴', champ: 'New Jersey 5s' },
      { division: 'Standings leader (early season)', divisionKo: '시즌 초반 standings 선두', champ: 'New Jersey 5s' },
      { division: 'Week 1 — MLP Dallas', divisionKo: '1주차 — MLP 댈러스', champ: 'Los Angeles Mad Drops' }
    ],
    storylineTitle: 'Storyline', storylineTitleKo: '관전 포인트',
    storyline: 'The New Jersey 5s recovered from a slow opening event to win MLP Austin and climb back atop the standings, going unbeaten across their last two events. With teams trading wins, playoff seeding is tight.',
    storylineKo: '뉴저지 5s는 부진했던 개막 이벤트를 딛고 MLP 오스틴에서 우승하며 다시 standings 선두로 올라섰고, 최근 두 이벤트를 무패로 마쳤습니다. 팀들이 승리를 주고받으며 플레이오프 시드 경쟁이 치열합니다.'
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
