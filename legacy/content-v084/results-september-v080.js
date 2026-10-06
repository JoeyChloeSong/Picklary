'use strict';

module.exports = function applyResultsSeptemberV080(results) {
  if (!Array.isArray(results)) return results;
  const list = results.filter((r) => !['r-2026-ppa-nationals','r-2026-mlp-finals-nyc','r-2026-ppa-asia-shenzhen'].includes(r.id));

  list.unshift(
    {
      id:'r-2026-ppa-nationals', slug:'ppa-nationals-cary-2026', channel:'ppa', status:'published',
      event:'Veolia Pickleball National Championships', eventKo:'Veolia Pickleball National Championships', tier:'PPA Major · 2,000 points', tierKo:'PPA Major · 2,000포인트',
      dates:'Aug 31 – Sep 6, 2026', datesKo:'2026년 8월 31일 – 9월 6일', location:'Cary Tennis Park, Cary, NC', locationKo:'미국 노스캐롤라이나 Cary Tennis Park', checked:'2026-09-08',
      sourceName:'PPA Tour — Championship Sunday recap', sourceUrl:'https://www.ppatour.com/championship-sunday-standout-stats-from-the-veolia-pickleball-national-championships/',
      summary:'The opening major of the 2026–27 season produced two double-title winners. Anna Leigh Waters won women’s singles and women’s doubles; Anna Bright shared the women’s doubles title and won mixed. Hunter Johnson took men’s singles, while Ben Johns/Gabe Tardio won men’s doubles.',
      summaryKo:'2026–27 시즌 개막 메이저에서 두 명의 2관왕이 나왔습니다. Anna Leigh Waters는 여자 단식과 여자 복식, Anna Bright는 여자 복식과 혼합복식을 우승했습니다. 남자 단식은 Hunter Johnson, 남자 복식은 Ben Johns/Gabe Tardio가 차지했습니다.',
      winners:[
        {division:'Women’s Singles',divisionKo:'여자 단식',champ:'Anna Leigh Waters',silver:'Kate Fahey',note:'11–1, 11–9'},
        {division:'Men’s Singles',divisionKo:'남자 단식',champ:'Hunter Johnson',silver:'Federico Staksrud',note:'7–11, 11–3, 11–0'},
        {division:'Women’s Doubles',divisionKo:'여자 복식',champ:'Anna Bright / Anna Leigh Waters',silver:'Tyra Black / Jorja Johnson',note:'11–5, 11–6, 11–3'},
        {division:'Men’s Doubles',divisionKo:'남자 복식',champ:'Ben Johns / Gabe Tardio',silver:'Christian Alshon / Andrei Daescu',note:'11–8, 11–8, 5–11, 11–5'},
        {division:'Mixed Doubles',divisionKo:'혼합복식',champ:'Anna Bright / Hayden Patriquin',silver:'Jorja Johnson / JW Johnson',note:'11–9, 11–3, 11–7'}
      ],
      storylineTitle:'What changed after Nationals', storylineTitleKo:'Nationals 이후 달라진 점',
      storyline:'The tournament also opened the new September-to-May PPA season. The new World Pickleball Rankings combine three disciplines, so the value of consistency across doubles, mixed, and singles is more visible than under a single-discipline lens.',
      storylineKo:'이번 대회는 PPA의 새 9월–5월 시즌 개막전이기도 했습니다. 새 World Pickleball Rankings는 세 종목 성적을 합산하기 때문에 복식·혼합복식·단식 전반에서 꾸준한 선수의 가치가 이전보다 더 잘 드러납니다.'
    },
    {
      id:'r-2026-mlp-finals-nyc', slug:'mlp-finals-new-york-city-2026', channel:'mlp', status:'published',
      event:'2026 MLP Finals — New York City', eventKo:'2026 MLP 파이널 — New York City', tier:'MLP Championship', tierKo:'MLP 챔피언십',
      dates:'Aug 28–30, 2026', datesKo:'2026년 8월 28–30일', location:'CityPickle at Wollman Rink, New York, NY', locationKo:'미국 뉴욕 Wollman Rink · CityPickle', checked:'2026-09-02',
      sourceName:'MLP Finals official event page', sourceUrl:'https://majorleaguepickleball.co/events-2026/mlp-finals-new-york-city-2026/',
      summary:'New Jersey 5s won the 2026 season championship over St. Louis Shock. Both Finals matches reached DreamBreakers; New Jersey won the deciding singles games 22–20 and 21–9 to sweep the best-of-three series 2–0.',
      summaryKo:'New Jersey 5s가 St. Louis Shock를 꺾고 2026 시즌 챔피언이 됐습니다. 파이널 두 매치 모두 DreamBreaker까지 갔고 New Jersey가 결정 단식을 22-20, 21-9로 잡아 3전 2선승제 시리즈를 2-0으로 끝냈습니다.',
      winners:[{division:'Championship series',divisionKo:'챔피언십 시리즈',champ:'New Jersey 5s',silver:'St. Louis Shock',note:'Series 2–0 · DreamBreakers 22–20, 21–9'}],
      standings:[{team:'New Jersey 5s',note:'Champion',noteKo:'우승'},{team:'St. Louis Shock',note:'Runner-up',noteKo:'준우승'},{team:'Brooklyn Pickleball Team',note:'Semifinalist',noteKo:'4강'},{team:'Dallas Flash',note:'Semifinalist',noteKo:'4강'}],
      standingsLabel:'Final four', standingsLabelKo:'최종 4팀',
      storylineTitle:'Why New Jersey won', storylineTitleKo:'New Jersey가 우승한 이유',
      storyline:'The doubles games stayed close enough that both championship matches needed the fifth-game format. New Jersey’s roster had the stronger singles rotation for that exact moment, turning DreamBreaker depth into the decisive championship advantage.',
      storylineKo:'복식 네 경기만으로 승부가 나지 않아 파이널 두 매치 모두 다섯 번째 경기 형식으로 넘어갔습니다. 그 순간 New Jersey는 더 강한 단식 로테이션을 갖고 있었고, DreamBreaker 경쟁력이 우승을 가른 결정적 차이가 됐습니다.'
    },
    {
      id:'r-2026-ppa-asia-shenzhen', slug:'ppa-asia-shenzhen-open-2026', channel:'asia', status:'published',
      event:'Skechers Shenzhen Open 2026', eventKo:'Skechers Shenzhen Open 2026', tier:'PPA Asia 500', tierKo:'PPA Asia 500',
      dates:'Aug 20–23, 2026', datesKo:'2026년 8월 20–23일', location:"Shenzhen Bao'an Sports Center Gymnasium, China", locationKo:'중국 선전 Shenzhen Bao’an Sports Center Gymnasium', checked:'2026-08-23',
      sourceName:'PPA Tour Asia — Championship Sunday recap', sourceUrl:'https://www.ppatour-asia.com/goldin-completes-golden-comeback/',
      summary:'Shenzhen was a breakthrough stop. Grayson Goldin saved match point and won men’s singles, Chao Yi Wang returned to win women’s singles, and the doubles podiums mixed established U.S. pros with Asia-tour standouts.',
      summaryKo:'Shenzhen은 여러 선수에게 전환점이 된 대회였습니다. Grayson Goldin은 매치포인트를 막고 남자 단식을 우승했고, Chao Yi Wang은 복귀 후 여자 단식 정상에 올랐습니다. 복식에서는 미국 프로와 아시아 투어 강자들이 섞인 조합들이 우승했습니다.',
      winners:[
        {division:'Men’s Singles',divisionKo:'남자 단식',champ:'Grayson Goldin',silver:'Hien Truong',note:'4–11, 11–9, 12–10'},
        {division:'Women’s Singles',divisionKo:'여자 단식',champ:'Chao Yi Wang',silver:'Rika Fujiwara',note:'11–4, 11–8'},
        {division:'Men’s Doubles',divisionKo:'남자 복식',champ:'Collin Johns / Len Yang',silver:'Eunggwon Kim / Hong Kit Wong',note:'11–7, 11–8'},
        {division:'Women’s Doubles',divisionKo:'여자 복식',champ:'Sophia Nhi Huynh / Ho Tam',silver:'Lingwei Kong / Selina Turulja',note:'11–9, 3–11, 11–6'},
        {division:'Mixed Doubles',divisionKo:'혼합복식',champ:'Sahra Dennehy / Tama Shimabukuro',silver:'Sophia Nhi Huynh / Hien Truong',note:'11–6, 11–1'}
      ],
      storylineTitle:'Why it matters for Kuala Lumpur', storylineTitleKo:'Kuala Lumpur를 보기 전에 알아둘 흐름',
      storyline:'Chao Yi Wang carries a fresh singles title into Malaysia, while Kim/Wong reached the men’s doubles final but are still searching for their first gold together. The Kuala Lumpur draw brings many of these names back into the same projected paths.',
      storylineKo:'Chao Yi Wang은 여자 단식 우승 직후 말레이시아에 들어가고, Kim/Wong은 남자 복식 결승까지 갔지만 아직 첫 공동 우승을 노리고 있습니다. Kuala Lumpur 대진에서는 이 선수들이 다시 같은 우승 경로에서 만날 가능성이 큽니다.'
    }
  );

  return list;
};
