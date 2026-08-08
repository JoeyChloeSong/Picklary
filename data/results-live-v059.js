'use strict';
module.exports = function applyResultsLiveV059(items) {
  if (!Array.isArray(items)) return items;
  const recap = items.find((x) => x.id === 'r-2026-mlp-orlando-live' || x.slug === '2026-mlp-orlando-live');
  if (!recap) return items;
  recap.checked='2026-07-31 · 5:35 PM ET';
  recap.winnersLabel='Completed Friday matches at 5:35 PM ET';
  recap.winnersLabelKo='오후 5:35 ET 기준 완료된 금요일 경기';
  recap.summary='Seven Friday matches were complete at the official scoreboard checkpoint. The live event remains in progress, so later scores and standings are not treated as final.';
  recap.summaryKo='공식 스코어보드 확인 시점에 금요일 7경기가 끝났습니다. 대회가 아직 진행 중이므로 이후 경기 결과와 순위는 최종 결과로 확정하지 않습니다.';
  recap.winners=[
    ['St. Louis Shock','Phoenix Flames','4–0'],
    ['LA Mad Drops','Palm Beach Royals','3–1'],
    ['Las Vegas Night Owls','Brooklyn Pickleball Team','2–2 · DB 21–16'],
    ['New Jersey 5s','Chicago Slice','3–1'],
    ['LA Mad Drops','California Black Bears','4–0'],
    ['Orlando Squeeze','Phoenix Flames','3–1'],
    ['Chicago Slice','Carolina Hogs','3–1']
  ];
  recap.winnersKo=recap.winners;
  return items;
};
