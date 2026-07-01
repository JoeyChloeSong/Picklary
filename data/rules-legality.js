/* Rules & paddle-legality data for the Update Center "Rules & paddle legality" page.
 *
 * INTEGRITY RULES (read before editing):
 *  - Every paddle status row is a FACT taken from an official or reputable source on
 *    the `checked` date and linked via `sourceUrl`. The USAP rows come straight from
 *    the official compliance page; do NOT invent statuses or dates.
 *  - Statuses change continuously. The page always shows a "verified <date>, confirm
 *    at the official database" note, and links out to the live source.
 *  - All prose is in our OWN words — no pasted article text, tables, or quotes.
 *  - `kind` drives the status badge colour: removed | review | resolved | note.
 */
module.exports = {
  checked: '2026-06-26',
  // Recent USAP compliance entries + notable UPA-A (pro) cases.
  paddleStatus: [
    { brand: 'Facolos', model: 'Pro Series Elite X', authority: 'USAP', kind: 'removed',
      status: 'Removed from approved list', statusKo: '승인 목록에서 제외', date: '2026-03-24',
      note: 'Failed surface-roughness (grit) limits; the production version differed from the model originally submitted for certification.',
      noteKo: '표면 거칠기(그릿) 기준을 초과했고, 양산품이 인증에 제출된 모델과 달랐습니다.',
      sourceName: 'USA Pickleball Compliance', sourceUrl: 'https://equipment.usapickleball.org/compliance/' },
    { brand: 'Proton', model: 'Series Three Project Peacock (S3PE15)', authority: 'USAP', kind: 'review',
      status: 'Under investigation', statusKo: '조사 중', date: '2026-05-28',
      note: 'Listed on USAP’s compliance page; the model stays on the approved list while the review is open.',
      noteKo: 'USAP 컴플라이언스 페이지에 등재됐으나, 검토가 진행되는 동안에는 승인 목록에 남아 있습니다.',
      sourceName: 'USA Pickleball Compliance', sourceUrl: 'https://equipment.usapickleball.org/compliance/' },
    { brand: 'Speedup', model: 'Tide 14S', authority: 'USAP', kind: 'review',
      status: 'Under investigation', statusKo: '조사 중', date: '2026-05-27',
      note: 'On USAP’s compliance page; remains approved while under review.',
      noteKo: 'USAP 컴플라이언스 페이지에 등재; 검토 중 승인은 유지됩니다.',
      sourceName: 'USA Pickleball Compliance', sourceUrl: 'https://equipment.usapickleball.org/compliance/' },
    { brand: 'Six Zero', model: 'Ruby Pro 14mm', authority: 'USAP', kind: 'review',
      status: 'Under investigation', statusKo: '조사 중', date: '2025-11-20',
      note: 'An open compliance review on USAP’s list.',
      noteKo: 'USAP 목록상 컴플라이언스 검토가 진행 중입니다.',
      sourceName: 'USA Pickleball Compliance', sourceUrl: 'https://equipment.usapickleball.org/compliance/' },
    { brand: 'R.A.W. (Reign and Win)', model: 'Multiple models', authority: 'USAP', kind: 'resolved',
      status: 'Compliance issue resolved', statusKo: '컴플라이언스 해결됨', date: '2026-03-11',
      note: 'Previously flagged, now marked resolved on USAP’s compliance page.',
      noteKo: '이전에 플래그됐으나 USAP 페이지에서 해결로 표시됐습니다.',
      sourceName: 'USA Pickleball Compliance', sourceUrl: 'https://equipment.usapickleball.org/compliance/' },
    { brand: 'Luzz', model: 'Pro list (several models)', authority: 'UPA-A', kind: 'review',
      status: 'Delisted, several re-approved', statusKo: '프로 목록 삭제 후 일부 재승인', date: '2025 → 2026',
      note: 'Pulled from the UPA-A pro list in early 2025 over a submission mismatch; four models (Pro Blade 2, Pro-4 Inferno, Pro-Cannon, Tornazo) were back on the list by early 2026.',
      noteKo: '제출본 불일치로 2025년 초 UPA-A 프로 목록에서 삭제됐다가, 2026년 초까지 4종(Pro Blade 2, Pro-4 Inferno, Pro-Cannon, Tornazo)이 재등재됐습니다.',
      sourceName: 'The Dink', sourceUrl: 'https://www.thedinkpickleball.com/usa-pickleball-quietly-delists-several-paddle-models/' },
    { brand: 'Selkirk', model: 'Project Boomstik Elongated 16mm', authority: 'UPA-A', kind: 'note',
      status: 'Pro-approved without the MOI clamps', statusKo: 'MOI 클램프 없이 프로 승인', date: '2026',
      note: 'UPA-A approved the paddle without the MOI clamp accessories that ship with the retail version — the clamps are not part of the certified configuration.',
      noteKo: 'UPA-A는 양산품에 포함된 MOI 클램프 없이 이 패들을 승인했습니다 — 클램프는 인증 구성에 포함되지 않습니다.',
      sourceName: '11 Pickles', sourceUrl: 'https://www.11pickles.com/post/banned-pickleball-paddles', relPaddle: 'selkirk-project-boomstik' }
  ],
  // 2026 USAP rulebook changes (effective Jan 1, 2026), summarised in our own words.
  ruleChanges: [
    { tag: 'Scoring', tagKo: '스코어링', title: 'Rally scoring: a point is a point', titleKo: '랠리 스코어링: 언제든 득점',
      summary: 'In approved rally-scoring formats the game-winning point no longer has to be won on serve — either side can win the deciding rally, so big comebacks stay alive.',
      summaryKo: '승인된 랠리 스코어링에서 “게임 결정 포인트는 서브 팀만 딴다”는 제약이 사라졌습니다. 어느 쪽이든 마지막 랠리를 이기면 득점이라 역전 가능성이 커졌습니다.' },
    { tag: 'Serve', tagKo: '서브', title: 'Volley serve must be “clear”', titleKo: '발리 서브는 “명확히”',
      summary: 'The word “clearly” was added to all three volley-serve requirements — clearly below the waist, paddle head clearly below the wrist, a clear upward arc — giving referees more room to fault borderline serves. A tennis-style toss-and-hit serve was rejected again.',
      summaryKo: '발리 서브 3대 요건에 “명확히”가 추가됐습니다(허리 아래, 패들 헤드가 손목 아래, 명확한 상향 궤적). 애매한 서브를 폴트로 부를 재량이 커졌고, 테니스식 토스-앤-히트 서브는 또 부결됐습니다.' },
    { tag: 'Serve', tagKo: '서브', title: 'Spin on the serve, clarified', titleKo: '서브 스핀 명확화',
      summary: 'You can spin the ball through paddle contact on the serve; you cannot pre-spin it with your hand before contact.',
      summaryKo: '서브에서 패들 접촉으로 스핀을 거는 것은 허용됩니다. 다만 접촉 전에 손으로 미리 스핀을 거는 것은 금지입니다.' },
    { tag: 'Faults', tagKo: '폴트', title: 'A visible spare ball is a fault', titleKo: '보이는 여분 공은 폴트',
      summary: 'A spare ball that is visible during a live rally — even peeking from a pocket — is now a fault, to stop it from distracting opponents.',
      summaryKo: '살아있는 랠리 중 보이는 여분 공(주머니에서 살짝 보여도)은 이제 폴트입니다. 상대 시야를 방해하지 않기 위함입니다.' },
    { tag: 'Line calls', tagKo: '라인콜', title: 'Out calls must be prompt', titleKo: '아웃 콜은 신속하게',
      summary: 'An out call has to be made promptly — before the opponent strikes the ball or before it becomes dead — otherwise play continues.',
      summaryKo: '아웃 콜은 신속히(상대가 공을 치기 전 또는 공이 죽기 전) 해야 하며, 늦으면 인정되지 않고 플레이가 계속됩니다.' },
    { tag: 'Conduct', tagKo: '품행', title: 'Stronger conduct enforcement', titleKo: '품행 규정 강화',
      summary: 'Referees can warn or issue a technical foul before the match (including warm-up), asking the crowd for help on a line call is penalized, and there is clearer authority to eject players for violence or venue damage.',
      summaryKo: '심판은 경기 전(워밍업 포함)에도 경고·테크니컬 파울을 줄 수 있고, 라인콜에 관중 도움을 요청하면 제재되며, 폭력·시설 파손 시 즉시 퇴장시킬 근거가 명확해졌습니다.' },
    { tag: 'Inclusion', tagKo: '포용', title: 'Adaptive Standing Division formalized', titleKo: '적응 스탠딩 부문 공식화',
      summary: 'A formal Adaptive Standing Division and clearer wheelchair rules were added — a wheelchair counts as part of the body, and eligible adaptive players may use a two-bounce allowance.',
      summaryKo: '적응 스탠딩 부문이 공식화되고 휠체어 규정이 명확해졌습니다 — 휠체어는 신체의 일부로 간주되며, 자격 있는 적응 선수는 투바운스 허용을 사용할 수 있습니다.' }
  ]
};
