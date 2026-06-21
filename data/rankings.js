/* Current pickleball leaders — reconstructed for the Rankings page.
 *
 * INTEGRITY: These reflect the post-2025/26-season picture verified from reputable
 * sources (PPA Tour and major outlets) on the `updated` date. We name LEADERS and
 * notable chasers rather than print a precise numbered ladder or DUPR decimals,
 * because exact positions/ratings change continuously — the live ladder is linked.
 * `slug` (when present) links to that player's page on this site and shows their
 * illustration; names without a slug show an initials badge and link to the source.
 */
module.exports = {
  updated: '2026-06-19',
  sourceName: 'PPA Tour rankings',
  sourceUrl: 'https://www.ppatour.com/player-rankings/',
  duprUrl: 'https://www.dupr.com/rankings',
  note: 'A snapshot of who is leading each pro division after the 2025–26 PPA Tour season. Positions and DUPR change as results are processed — open the official ladder for the live order.',
  noteKo: '2025–26 PPA 투어 시즌을 마친 시점에서 각 프로 종목을 이끄는 선수 스냅샷입니다. 순위와 DUPR은 경기 결과에 따라 계속 바뀌므로, 실시간 순서는 공식 랭킹에서 확인하세요.',
  disciplines: [
    {
      key: "Men's singles", keyKo: '남자 단식',
      leader: { name: 'Christopher Haworth' },
      chasers: [{ name: 'Federico Staksrud', slug: 'federico-staksrud' }, { name: 'Hunter Johnson' }, { name: 'JW Johnson', slug: 'jw-johnson' }],
      note: 'Haworth has held the world No. 1 spot; Staksrud and a deep field chase.',
      noteKo: '해워스가 세계 1위를 지켜 왔고, 스탁스루드 등 두꺼운 선수층이 추격합니다.'
    },
    {
      key: "Women's singles", keyKo: '여자 단식',
      leader: { name: 'Anna Leigh Waters', slug: 'anna-leigh-waters' },
      chasers: [{ name: 'Kate Fahey' }, { name: 'Catherine Parenteau', slug: 'catherine-parenteau' }],
      note: 'Waters has dominated women’s singles; Fahey is the clear next-best.',
      noteKo: '워터스가 여자 단식을 지배해 왔고, 페이히가 확실한 2인자입니다.'
    },
    {
      key: "Men's doubles", keyKo: '남자 복식',
      leader: { name: 'Ben Johns', slug: 'ben-johns' }, leader2: { name: 'Gabe Tardio' },
      chasers: [{ name: 'Federico Staksrud', slug: 'federico-staksrud' }, { name: 'Andrei Daescu' }, { name: 'Christian Alshon', slug: 'christian-alshon' }],
      note: 'Johns/Tardio ran a dominant 2026 men’s doubles season together.',
      noteKo: '존스/타르디오가 2026 남자 복식 시즌을 압도적으로 보냈습니다.'
    },
    {
      key: "Women's doubles", keyKo: '여자 복식',
      leader: { name: 'Anna Bright', slug: 'anna-bright' }, leader2: { name: 'Anna Leigh Waters', slug: 'anna-leigh-waters' },
      chasers: [{ name: 'Jorja Johnson' }, { name: 'Jade Kawamoto' }],
      note: 'The “two Annas” have been the team to beat in women’s doubles.',
      noteKo: '“두 명의 애나”가 여자 복식에서 가장 강한 팀이었습니다.'
    },
    {
      key: 'Mixed doubles', keyKo: '혼합 복식',
      leader: { name: 'Anna Leigh Waters', slug: 'anna-leigh-waters' }, leader2: { name: 'Ben Johns', slug: 'ben-johns' },
      chasers: [{ name: 'Anna Bright', slug: 'anna-bright' }, { name: 'Hayden Patriquin' }],
      note: 'Waters/Johns have been the top mixed team across the season.',
      noteKo: '워터스/존스가 시즌 내내 최고의 혼합 복식 팀이었습니다.'
    }
  ]
};
