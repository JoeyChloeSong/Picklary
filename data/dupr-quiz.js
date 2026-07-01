/* DUPR self-check quiz — scenario POOL (10 served per attempt, adaptive).
 *
 * INTEGRITY: a SELF-ASSESSMENT of shot selection from widely-accepted pickleball
 * strategy. NOT an official DUPR rating (real DUPR = logged match results at dupr.com).
 *
 * Court (SVG viewBox 300x460): opponent side = TOP (y20-228), our side = BOTTOM
 * (y228-436), net at y=228. Their kitchen y176-228; our kitchen y228-280.
 * Position preset keys (resolved in build.js): ourUp ourBaseline ourTransition
 *   ourWideL ourWideR ourScramble ourReturn ourP1Wide · oppUp oppBack oppOneBackR oppStaggerL
 * ball: { from, to, power: 'soft'|'medium'|'hard' }  (from = an opponent spot)
 * Answer ids: shots dink drop drive reset block smash speedup lob roll flick ·
 *   power soft medium hard · zones kL kM kR / nL nM nR / mL mM mR / dL dM dR ·
 *   player p1 p2 (optional: scenarios where choosing who takes the ball matters)
 */
module.exports = [
  {
    "id": "d1-third",
    "difficulty": 1,
    "you": "ourBaseline",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 150,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 412
      },
      "power": "medium"
    },
    "incoming": "Deep return at your feet",
    "incomingKo": "발 앞으로 떨어진 깊은 리턴",
    "prompt": "Your third shot from the baseline; opponents are both at their kitchen.",
    "promptKo": "베이스라인에서의 세 번째 샷. 상대 둘은 키친에 있습니다.",
    "shot": {
      "drop": 3,
      "drive": 2,
      "lob": 1,
      "reset": 1
    },
    "power": {
      "soft": 3,
      "medium": 2,
      "hard": 0
    },
    "zone": {
      "kL": 2,
      "kM": 3,
      "kR": 2,
      "dM": 1
    },
    "explain": "From the baseline vs two players at the net, a soft third-shot drop into the kitchen buys time to move up.",
    "explainKo": "네트 앞 두 명을 상대로 베이스라인에서는 키친으로 부드러운 서드샷 드롭이 정석입니다. 전진할 시간을 벌죠."
  },
  {
    "id": "d1-popup",
    "difficulty": 1,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 110,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 250
      },
      "power": "soft"
    },
    "incoming": "High, attackable pop-up",
    "incomingKo": "높이 뜬 공격 가능한 볼",
    "prompt": "Dink rally at the kitchen — the opponent’s dink floats up and sits in your kitchen.",
    "promptKo": "키친 딩크 랠리 중 — 상대 딩크가 떠서 당신 키친에 머뭅니다(찬스볼).",
    "shot": {
      "speedup": 3,
      "smash": 3,
      "drive": 2,
      "dink": 0,
      "flick": 3,
      "roll": 2
    },
    "power": {
      "hard": 3,
      "medium": 2,
      "soft": 0
    },
    "zone": {
      "kL": 2,
      "kM": 3,
      "kR": 2
    },
    "explain": "A ball that sits up should be attacked firmly at the bodies or the middle.",
    "explainKo": "뜬 공은 상대 몸쪽이나 가운데로 단단히 공격해야 합니다."
  },
  {
    "id": "d1-feet",
    "difficulty": 1,
    "you": "ourTransition",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 150,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 330
      },
      "power": "hard"
    },
    "incoming": "Hard drive at your feet",
    "incomingKo": "발 앞으로 오는 강한 드라이브",
    "prompt": "You are in the transition zone moving forward; the opponent drives hard at your feet.",
    "promptKo": "트랜지션 존에서 전진 중인데, 상대가 발 앞으로 강하게 드라이브합니다.",
    "shot": {
      "reset": 3,
      "drop": 2,
      "block": 1,
      "dink": 1,
      "drive": 0,
      "smash": 0
    },
    "power": {
      "soft": 3,
      "medium": 1,
      "hard": 0
    },
    "zone": {
      "kL": 2,
      "kM": 3,
      "kR": 2
    },
    "explain": "Under pace in transition, a soft reset that lands in the kitchen takes the speed off.",
    "explainKo": "트랜지션에서 강한 공은 키친으로 부드럽게 떨어뜨리는 리셋으로 속도를 죽입니다."
  },
  {
    "id": "d1-dink",
    "difficulty": 1,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 90,
        "y": 190
      },
      "to": {
        "x": 210,
        "y": 250
      },
      "power": "soft"
    },
    "incoming": "Low cross-court dink",
    "incomingKo": "낮게 오는 크로스 딩크",
    "prompt": "Steady dink rally — nothing is sitting up; a low dink comes to your forehand.",
    "promptKo": "안정적인 딩크 랠리 — 뜬 공은 없고, 낮은 딩크가 포핸드로 옵니다.",
    "shot": {
      "dink": 3,
      "drop": 1,
      "reset": 1,
      "drive": 0,
      "speedup": 1
    },
    "power": {
      "soft": 3,
      "medium": 1,
      "hard": 0
    },
    "zone": {
      "kL": 3,
      "kM": 2,
      "kR": 3
    },
    "explain": "When nothing is high, stay patient with a controlled dink to a corner or the middle.",
    "explainKo": "뜬 공이 없을 때는 코너나 가운데로 컨트롤된 딩크를 이어가며 인내하세요."
  },
  {
    "id": "d1-oppback",
    "difficulty": 1,
    "you": "ourUp",
    "opp": "oppBack",
    "ball": {
      "from": {
        "x": 150,
        "y": 80
      },
      "to": {
        "x": 150,
        "y": 250
      },
      "power": "medium"
    },
    "incoming": "Floaty ball, opponents deep",
    "incomingKo": "상대가 뒤에 있고 떠서 오는 공",
    "prompt": "You get a medium ball at the kitchen, but both opponents are stuck back at their baseline.",
    "promptKo": "키친에서 중간 높이 공을 받았는데, 상대 둘은 베이스라인에 묶여 있습니다.",
    "shot": {
      "drop": 3,
      "dink": 3,
      "drive": 1,
      "reset": 1
    },
    "power": {
      "soft": 3,
      "medium": 1,
      "hard": 0
    },
    "zone": {
      "kL": 2,
      "kM": 3,
      "kR": 2
    },
    "explain": "With opponents trapped deep, drop softly into their kitchen so they must hit up from no-man’s-land.",
    "explainKo": "상대가 뒤에 묶이면 키친으로 부드럽게 떨어뜨려 어중간한 위치에서 올려치게 만드세요."
  },
  {
    "id": "d1-lobreach",
    "difficulty": 1,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 150,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 280
      },
      "power": "medium"
    },
    "incoming": "Reachable lob",
    "incomingKo": "닿을 수 있는 로브",
    "prompt": "The opponent lobs over you at the kitchen — short enough to take with an overhead.",
    "promptKo": "키친에서 상대가 머리 위로 로브를 올렸는데, 오버헤드로 닿을 만큼 짧습니다.",
    "shot": {
      "smash": 3,
      "drive": 2,
      "speedup": 2,
      "reset": 1,
      "lob": 1
    },
    "power": {
      "hard": 3,
      "medium": 1,
      "soft": 0
    },
    "zone": {
      "kL": 1,
      "kM": 3,
      "kR": 1,
      "mM": 1,
      "dM": 2
    },
    "explain": "A reachable lob is a free overhead — smash it down firmly at the feet or the middle.",
    "explainKo": "닿는 로브는 공짜 오버헤드입니다. 발 앞이나 가운데로 단단히 스매시하세요."
  },
  {
    "id": "d1-return",
    "difficulty": 1,
    "you": "ourReturn",
    "opp": "oppBack",
    "ball": {
      "from": {
        "x": 90,
        "y": 92
      },
      "to": {
        "x": 206,
        "y": 400
      },
      "power": "medium"
    },
    "incoming": "Serve to receive",
    "incomingKo": "리시브해야 하는 서브",
    "prompt": "You are returning serve from the baseline. Your partner is already up at the kitchen; the serving team is back at their baseline.",
    "promptKo": "베이스라인에서 서브를 리턴합니다. 파트너는 이미 앞쪽 키친에 있고, 서브 팀은 베이스라인에 있습니다.",
    "shot": {
      "drive": 3,
      "drop": 1,
      "lob": 1,
      "dink": 0
    },
    "power": {
      "medium": 3,
      "hard": 2,
      "soft": 0
    },
    "zone": {
      "nL": 1,
      "nM": 1,
      "mL": 2,
      "mM": 2,
      "mR": 1,
      "dL": 3,
      "dM": 3,
      "dR": 2
    },
    "explain": "Return deep — ideally cross-court — to keep the serving team pinned at their baseline, then move up to the kitchen behind your return. A deep, diagonal return buys the most time to reach the net and gives them the toughest third shot.",
    "explainKo": "깊게 — 가능하면 대각선으로 — 리턴해 서브 팀을 베이스라인에 묶고, 리턴을 따라 키친으로 전진하세요. 깊고 대각선인 리턴은 네트로 갈 시간을 가장 많이 벌어 주고 상대의 세 번째 샷을 가장 어렵게 만듭니다."
  },
  {
    "id": "d1-middle",
    "difficulty": 1,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 150,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 252
      },
      "power": "soft"
    },
    "incoming": "Dink up the middle",
    "incomingKo": "가운데로 오는 딩크",
    "prompt": "A dink comes right up the middle between you and your partner.",
    "promptKo": "딩크가 당신과 파트너 사이 가운데로 옵니다.",
    "shot": {
      "dink": 3,
      "drop": 1,
      "reset": 1,
      "speedup": 1,
      "drive": 0
    },
    "power": {
      "soft": 3,
      "medium": 1,
      "hard": 0
    },
    "zone": {
      "kL": 1,
      "kM": 3,
      "kR": 1
    },
    "explain": "Communicate, take the middle ball, and dink it back softly — middles cause confusion if rushed.",
    "explainKo": "콜을 주고받아 가운데 공을 처리하고 부드럽게 딩크로 돌려주세요. 서두르면 혼선이 납니다."
  },
  {
    "id": "d1-shoulder",
    "difficulty": 1,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 120,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 255
      },
      "power": "soft"
    },
    "incoming": "Soft floaty ball, shoulder height",
    "incomingKo": "어깨 높이로 뜨는 느린 공",
    "prompt": "A soft, floaty ball arrives shoulder height at the net — attackable.",
    "promptKo": "느리고 떠서 오는 공이 네트에서 어깨 높이로 옵니다 — 공격 가능.",
    "shot": {
      "speedup": 3,
      "smash": 2,
      "drive": 2,
      "dink": 1,
      "flick": 3,
      "roll": 2
    },
    "power": {
      "medium": 3,
      "hard": 2,
      "soft": 0
    },
    "zone": {
      "kL": 2,
      "kM": 3,
      "kR": 2
    },
    "explain": "A shoulder-height floater is an attack — speed it up at the body or the middle.",
    "explainKo": "어깨 높이의 뜬 공은 공격 기회입니다. 몸쪽이나 가운데로 스피드업하세요."
  },
  {
    "id": "d1-comfort",
    "difficulty": 1,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 210,
        "y": 190
      },
      "to": {
        "x": 90,
        "y": 252
      },
      "power": "soft"
    },
    "incoming": "Comfortable kitchen dink",
    "incomingKo": "편안한 키친 딩크",
    "prompt": "A comfortable, low dink lands in your kitchen; everyone is at the net.",
    "promptKo": "편안하고 낮은 딩크가 키친에 떨어집니다. 모두 네트에 있습니다.",
    "shot": {
      "dink": 3,
      "drop": 1,
      "reset": 1,
      "speedup": 0,
      "drive": 0
    },
    "power": {
      "soft": 3,
      "medium": 1,
      "hard": 0
    },
    "zone": {
      "kL": 3,
      "kM": 2,
      "kR": 3
    },
    "explain": "Low and comfortable means keep dinking — change direction patiently, don’t force an attack.",
    "explainKo": "낮고 편안하면 딩크를 이어가세요. 방향만 인내심 있게 바꾸고 무리한 공격은 금물."
  },
  {
    "id": "d2-thirddrive",
    "difficulty": 2,
    "you": "ourBaseline",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 150,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 412
      },
      "power": "medium"
    },
    "incoming": "Lower, drivable return",
    "incomingKo": "낮아서 드라이브 가능한 리턴",
    "prompt": "Third shot, opponents up — but the return came in low and drivable.",
    "promptKo": "세 번째 샷, 상대는 앞에 — 그런데 리턴이 낮게 와 드라이브가 가능합니다.",
    "shot": {
      "drive": 3,
      "drop": 3,
      "speedup": 1,
      "lob": 0
    },
    "power": {
      "medium": 3,
      "hard": 2,
      "soft": 1
    },
    "zone": {
      "kM": 2,
      "nM": 1,
      "mM": 2,
      "dL": 1,
      "dM": 3,
      "dR": 1
    },
    "explain": "A low, drivable return lets you mix in a drive to a gap; a drop is still the safe alternative.",
    "explainKo": "낮은 드라이브 가능 리턴이면 빈 곳으로 드라이브를 섞을 수 있습니다. 드롭도 안전한 대안."
  },
  {
    "id": "d2-gap",
    "difficulty": 2,
    "you": "ourBaseline",
    "opp": "oppStaggerL",
    "ball": {
      "from": {
        "x": 150,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 412
      },
      "power": "medium"
    },
    "incoming": "Return, middle gap open",
    "incomingKo": "리턴, 가운데가 비어 있음",
    "prompt": "Opponents have shifted and left a clear gap up the middle.",
    "promptKo": "상대가 한쪽으로 쏠려 가운데가 확실히 비었습니다.",
    "shot": {
      "drive": 3,
      "drop": 2,
      "speedup": 2,
      "dink": 0
    },
    "power": {
      "medium": 3,
      "hard": 2,
      "soft": 1
    },
    "zone": {
      "kL": 1,
      "kM": 3,
      "mM": 1,
      "dM": 2
    },
    "explain": "A middle gap invites a firm drive — it causes confusion about who takes it.",
    "explainKo": "가운데가 비면 단단한 드라이브로 공략하세요. 누가 받을지 혼선이 생깁니다."
  },
  {
    "id": "d2-wide",
    "difficulty": 2,
    "you": "ourWideL",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 210,
        "y": 190
      },
      "to": {
        "x": 25,
        "y": 285
      },
      "power": "medium"
    },
    "incoming": "Sharp angle, you’re stretched",
    "incomingKo": "날카로운 각도, 몸이 늘어남",
    "prompt": "A sharp angled dink pulls you wide and you are stretched and reaching.",
    "promptKo": "날카로운 각도의 딩크에 코트 밖으로 끌려 나가 몸이 늘어났습니다.",
    "shot": {
      "dink": 3,
      "reset": 3,
      "drop": 2,
      "drive": 0,
      "speedup": 0,
      "smash": 0
    },
    "power": {
      "soft": 3,
      "medium": 1,
      "hard": 0
    },
    "zone": {
      "kL": 1,
      "kM": 3,
      "kR": 2
    },
    "explain": "Stretched and off-balance, get a soft ball back to the middle and recover — no winners from here.",
    "explainKo": "균형이 무너졌을 때는 가운데로 부드럽게 돌려놓고 회복하세요. 여기서 위너는 금물."
  },
  {
    "id": "d2-blockchest",
    "difficulty": 2,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 110,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 256
      },
      "power": "hard"
    },
    "incoming": "Hard speed-up at your chest",
    "incomingKo": "가슴으로 오는 강한 스피드업",
    "prompt": "The opponent speeds one up hard at you at the net, around chest height.",
    "promptKo": "상대가 네트에서 가슴 높이로 강하게 스피드업을 합니다.",
    "shot": {
      "block": 3,
      "reset": 2,
      "speedup": 1,
      "drive": 1,
      "smash": 0
    },
    "power": {
      "medium": 3,
      "soft": 2,
      "hard": 1
    },
    "zone": {
      "kL": 2,
      "kM": 3,
      "kR": 2
    },
    "explain": "A hard speed-up at the net is blocked — a firm, compact paddle redirects it down into the kitchen.",
    "explainKo": "네트에서 오는 강한 스피드업은 블록입니다. 짧고 단단한 라켓면으로 키친으로 떨어뜨려 받아넘기세요."
  },
  {
    "id": "d2-highbh",
    "difficulty": 2,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 90,
        "y": 190
      },
      "to": {
        "x": 120,
        "y": 250
      },
      "power": "soft"
    },
    "incoming": "Slightly high backhand dink",
    "incomingKo": "약간 높은 백핸드 딩크",
    "prompt": "The opponent leaves a slightly high dink to your backhand side.",
    "promptKo": "상대가 백핸드 쪽으로 약간 높은 딩크를 줍니다.",
    "shot": {
      "speedup": 3,
      "drive": 2,
      "dink": 1,
      "block": 1,
      "roll": 3,
      "flick": 2
    },
    "power": {
      "medium": 3,
      "hard": 1,
      "soft": 1
    },
    "zone": {
      "kL": 1,
      "kM": 3,
      "kR": 2
    },
    "explain": "A slightly high ball can be sped up with control at the body — keep it medium, not wild.",
    "explainKo": "약간 높은 공은 컨트롤된 스피드업으로 몸쪽을 노리세요. 무리한 강타보다 중간 강도가 좋습니다."
  },
  {
    "id": "d2-knees",
    "difficulty": 2,
    "you": "ourTransition",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 150,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 325
      },
      "power": "medium"
    },
    "incoming": "Ball back at your knees, moving up",
    "incomingKo": "전진 중 무릎으로 오는 공",
    "prompt": "You drove and it came back at your knees as you move through the transition zone.",
    "promptKo": "드라이브를 쳤는데 트랜지션을 지나는 사이 무릎 높이로 되돌아옵니다.",
    "shot": {
      "reset": 3,
      "drop": 2,
      "block": 1,
      "drive": 0,
      "smash": 0
    },
    "power": {
      "soft": 3,
      "medium": 1,
      "hard": 0
    },
    "zone": {
      "kL": 2,
      "kM": 3,
      "kR": 2
    },
    "explain": "Moving through transition, soften it into the kitchen — don’t over-hit from a low contact.",
    "explainKo": "트랜지션을 지날 때는 키친으로 부드럽게. 낮은 타점에서 과하게 치지 마세요."
  },
  {
    "id": "d2-lowdrive",
    "difficulty": 2,
    "you": "ourTransition",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 210,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 320
      },
      "power": "hard"
    },
    "incoming": "Low drive at midcourt",
    "incomingKo": "미드코트로 오는 낮은 드라이브",
    "prompt": "Opponents at the net; you are at midcourt and they hit a low, hard drive.",
    "promptKo": "상대는 네트, 당신은 미드코트. 상대가 낮고 강한 드라이브를 칩니다.",
    "shot": {
      "reset": 3,
      "block": 2,
      "drop": 2,
      "drive": 0,
      "speedup": 0
    },
    "power": {
      "soft": 3,
      "medium": 1,
      "hard": 0
    },
    "zone": {
      "kL": 2,
      "kM": 3,
      "kR": 2
    },
    "explain": "From midcourt against a low drive, reset softly into the kitchen and earn your way to the net.",
    "explainKo": "미드코트에서 낮은 드라이브를 받을 땐 키친으로 부드럽게 리셋하며 네트로 전진하세요."
  },
  {
    "id": "d2-shortlow",
    "difficulty": 2,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 90,
        "y": 190
      },
      "to": {
        "x": 210,
        "y": 250
      },
      "power": "soft"
    },
    "incoming": "Short, low dink at a tempting angle",
    "incomingKo": "짧고 낮지만 각이 유혹적인 딩크",
    "prompt": "A short, low dink lands at your forehand with a tempting angle — but it is low.",
    "promptKo": "짧고 낮은 딩크가 포핸드 쪽 유혹적인 각도로 떨어집니다 — 다만 낮습니다.",
    "shot": {
      "dink": 3,
      "drop": 1,
      "reset": 1,
      "speedup": 0,
      "drive": 0
    },
    "power": {
      "soft": 3,
      "medium": 1,
      "hard": 0
    },
    "zone": {
      "kL": 1,
      "kM": 2,
      "kR": 3
    },
    "explain": "Low contact means build, not blast — dink to a corner and wait for a true pop-up.",
    "explainKo": "낮은 타점에서는 강타가 아니라 빌드업. 코너로 딩크하고 진짜 뜬 공을 기다리세요."
  },
  {
    "id": "d2-deeplob",
    "difficulty": 2,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 150,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 300
      },
      "power": "medium"
    },
    "incoming": "Deep lob over your head",
    "incomingKo": "머리 위를 넘기는 깊은 로브",
    "prompt": "The opponent lobs you, but it is deep and over your head — not a clean overhead.",
    "promptKo": "상대가 로브를 올렸는데 머리 위로 깊게 넘어가 깔끔한 오버헤드가 아닙니다.",
    "shot": {
      "drop": 3,
      "reset": 3,
      "lob": 1,
      "smash": 0,
      "drive": 0
    },
    "power": {
      "soft": 3,
      "medium": 1,
      "hard": 0
    },
    "zone": {
      "kL": 2,
      "kM": 3,
      "kR": 2
    },
    "explain": "If the lob is past your reach, let it bounce and drop/reset back — smashing a bad ball gives points away.",
    "explainKo": "로브가 닿지 않으면 바운드시킨 뒤 드롭/리셋으로 돌리세요. 무리한 스매시는 실점입니다."
  },
  {
    "id": "d2-sitter",
    "difficulty": 2,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 120,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 248
      },
      "power": "soft"
    },
    "incoming": "Opponent’s block pops up to you",
    "incomingKo": "상대 블록이 떠서 당신에게",
    "prompt": "Your partner sped up at the opponents, whose block pops up high — the sitter comes to you.",
    "promptKo": "파트너가 상대에게 스피드업했고, 상대의 블록이 높게 떠서 당신에게 옵니다(찬스볼).",
    "shot": {
      "smash": 3,
      "speedup": 2,
      "drive": 2,
      "dink": 0,
      "flick": 2,
      "roll": 1
    },
    "power": {
      "hard": 3,
      "medium": 2,
      "soft": 0
    },
    "zone": {
      "kL": 2,
      "kM": 3,
      "kR": 2
    },
    "explain": "A popped-up block is a put-away — finish it down at the feet or the middle.",
    "explainKo": "떠오른 블록은 마무리 기회입니다. 발 앞이나 가운데로 내리쳐 끝내세요."
  },
  {
    "id": "d3-atp",
    "difficulty": 3,
    "you": "ourWideR",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 90,
        "y": 190
      },
      "to": {
        "x": 285,
        "y": 250
      },
      "power": "soft"
    },
    "incoming": "Wide, low, short — pulls you off court",
    "incomingKo": "넓고 낮고 짧게 — 코트 밖으로 끌어냄",
    "prompt": "A sharply angled dink lands wide, low, and short, pulling you past the sideline (an ATP chance).",
    "promptKo": "날카로운 각의 딩크가 넓고 낮고 짧게 떨어져 사이드라인 밖으로 끌어냅니다(ATP 기회).",
    "shot": {
      "drive": 3,
      "smash": 1,
      "dink": 1,
      "speedup": 1
    },
    "power": {
      "medium": 3,
      "hard": 3,
      "soft": 0
    },
    "zone": {
      "kR": 1,
      "nR": 1,
      "mM": 1,
      "mR": 2,
      "dM": 2,
      "dR": 3
    },
    "explain": "Around-the-post: the ball is outside the post, so there is no net to clear — drive it hard down the open court.",
    "explainKo": "어라운드 더 포스트(ATP): 공이 포스트 바깥이라 넘길 네트가 없습니다. 빈 코트로 강하게 드라이브하세요."
  },
  {
    "id": "d3-erne",
    "difficulty": 3,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 75,
        "y": 190
      },
      "to": {
        "x": 70,
        "y": 250
      },
      "power": "soft"
    },
    "incoming": "Repeated dink to the same sideline",
    "incomingKo": "같은 사이드라인으로 반복되는 딩크",
    "prompt": "The opponent keeps dinking to the same sideline spot; you anticipate and move to the Erne position.",
    "promptKo": "상대가 같은 사이드라인 자리로 계속 딩크합니다. 미리 읽고 Erne 위치로 이동합니다.",
    "shot": {
      "speedup": 3,
      "smash": 2,
      "drive": 2,
      "dink": 0,
      "reset": 0
    },
    "power": {
      "hard": 3,
      "medium": 2,
      "soft": 0
    },
    "zone": {
      "kM": 3,
      "kR": 2,
      "dM": 1
    },
    "explain": "An Erne takes the ball out of the air at the sideline and attacks down — surprise plus angle wins the point.",
    "explainKo": "Erne는 사이드라인에서 공을 공중에서 잡아 내리꽂는 공격입니다. 기습과 각도로 포인트를 가져옵니다."
  },
  {
    "id": "d3-hands",
    "difficulty": 3,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 130,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 255
      },
      "power": "hard"
    },
    "incoming": "Fast hands battle, ball at chest",
    "incomingKo": "빠른 핸즈 배틀, 가슴으로 오는 공",
    "prompt": "You are in a fast hands battle at the net; the ball comes at your chest at pace.",
    "promptKo": "네트에서 빠른 핸즈 배틀 중. 공이 가슴으로 빠르게 옵니다.",
    "shot": {
      "block": 3,
      "speedup": 2,
      "reset": 1,
      "drive": 1,
      "smash": 0,
      "flick": 2,
      "roll": 1
    },
    "power": {
      "medium": 3,
      "hard": 1,
      "soft": 1
    },
    "zone": {
      "kL": 2,
      "kM": 3,
      "kR": 2
    },
    "explain": "In a hands battle, a compact block/counter at the body beats a big swing — control wins fast exchanges.",
    "explainKo": "핸즈 배틀에서는 큰 스윙보다 몸쪽을 향한 짧은 블록/카운터가 유리합니다. 빠른 교환은 컨트롤이 이깁니다."
  },
  {
    "id": "d3-linedrive",
    "difficulty": 3,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 210,
        "y": 190
      },
      "to": {
        "x": 210,
        "y": 255
      },
      "power": "hard"
    },
    "incoming": "Hard drive down your line",
    "incomingKo": "라인을 따라 오는 강한 드라이브",
    "prompt": "Set at the kitchen, you face a hard drive aimed right down your line.",
    "promptKo": "키친에 자리 잡았는데, 라인을 따라 강한 드라이브가 옵니다.",
    "shot": {
      "block": 3,
      "reset": 2,
      "drive": 0,
      "speedup": 1,
      "smash": 0
    },
    "power": {
      "medium": 3,
      "soft": 2,
      "hard": 1
    },
    "zone": {
      "kL": 1,
      "kM": 3,
      "kR": 2
    },
    "explain": "Block the drive firmly back into the kitchen to neutralise pace, then re-engage the dink game.",
    "explainKo": "드라이브를 키친으로 단단히 블록해 속도를 죽인 뒤 다시 딩크 게임으로 돌아가세요."
  },
  {
    "id": "d3-noopening",
    "difficulty": 3,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 90,
        "y": 190
      },
      "to": {
        "x": 120,
        "y": 250
      },
      "power": "soft"
    },
    "incoming": "High backhand, but no open court",
    "incomingKo": "높은 백핸드지만 빈 코트가 없음",
    "prompt": "You get a high backhand at the kitchen, but the opponents are in perfect position with no open court.",
    "promptKo": "키친에서 높은 백핸드를 받았지만, 상대가 완벽한 포지션이라 빈 코트가 없습니다.",
    "shot": {
      "speedup": 3,
      "dink": 2,
      "block": 1,
      "smash": 1,
      "drive": 1,
      "roll": 2,
      "flick": 2
    },
    "power": {
      "medium": 3,
      "hard": 1,
      "soft": 1
    },
    "zone": {
      "kL": 2,
      "kM": 3,
      "kR": 1
    },
    "explain": "No open court means a controlled speed-up at the body, not a blind smash into two ready defenders.",
    "explainKo": "빈 코트가 없으면 준비된 두 수비수에게 막무가내 스매시 대신 몸쪽으로 컨트롤된 스피드업을 하세요."
  },
  {
    "id": "d3-goodrop",
    "difficulty": 3,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 150,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 250
      },
      "power": "soft"
    },
    "incoming": "A perfect drop into your kitchen",
    "incomingKo": "키친에 완벽히 떨어진 드롭",
    "prompt": "The opponent’s third-shot drop lands perfectly low in your kitchen.",
    "promptKo": "상대의 서드샷 드롭이 당신 키친에 완벽하게 낮게 떨어집니다.",
    "shot": {
      "dink": 3,
      "drop": 2,
      "reset": 1,
      "speedup": 0,
      "drive": 0,
      "smash": 0
    },
    "power": {
      "soft": 3,
      "medium": 1,
      "hard": 0
    },
    "zone": {
      "kL": 2,
      "kM": 3,
      "kR": 2
    },
    "explain": "You cannot attack a great drop — dink it back and stay in the neutral kitchen exchange.",
    "explainKo": "잘 떨어진 드롭은 공격할 수 없습니다. 딩크로 돌리며 중립적인 키친 교환을 이어가세요."
  },
  {
    "id": "d3-poach",
    "difficulty": 3,
    "you": "ourUp",
    "opp": "oppStaggerL",
    "ball": {
      "from": {
        "x": 90,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 252
      },
      "power": "medium"
    },
    "incoming": "Middle ball, you’re the stronger forehand",
    "incomingKo": "가운데 공, 당신이 더 강한 포핸드",
    "prompt": "A middle ball arrives and you are the stronger forehand poaching the middle; a gap is open.",
    "promptKo": "가운데 공이 오고, 당신이 가운데를 커버하는 더 강한 포핸드입니다. 한쪽이 비어 있습니다.",
    "shot": {
      "speedup": 3,
      "drive": 3,
      "dink": 1,
      "block": 0
    },
    "power": {
      "medium": 3,
      "hard": 2,
      "soft": 0
    },
    "zone": {
      "kL": 1,
      "kM": 3,
      "mM": 1,
      "dM": 2
    },
    "explain": "Take the middle with your forehand and drive/speed-up into the open gap — decisiveness rewards the poach.",
    "explainKo": "포핸드로 가운데를 잡아 빈 공간으로 드라이브/스피드업하세요. 과감함이 포치를 살립니다."
  },
  {
    "id": "d3-deflob",
    "difficulty": 3,
    "you": "ourScramble",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 150,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 400
      },
      "power": "hard"
    },
    "incoming": "You’re pushed back, scrambling",
    "incomingKo": "뒤로 밀려 허둥대는 상황",
    "prompt": "You have been pushed off the kitchen and are scrambling at the baseline under pressure.",
    "promptKo": "키친에서 밀려나 베이스라인에서 압박을 받으며 허둥대고 있습니다.",
    "shot": {
      "lob": 3,
      "reset": 2,
      "drop": 2,
      "smash": 0,
      "drive": 1
    },
    "power": {
      "medium": 3,
      "soft": 1,
      "hard": 1
    },
    "zone": {
      "nM": 1,
      "mL": 1,
      "mM": 2,
      "mR": 1,
      "dL": 2,
      "dM": 3,
      "dR": 2
    },
    "explain": "When scrambling and out of position, a good deep defensive lob can reset the point and buy recovery time.",
    "explainKo": "포지션이 무너진 채 허둥댈 때는, 깊은 수비 로브가 포인트를 리셋하고 회복 시간을 벌어줍니다."
  },
  {
    "id": "d3-chestmid",
    "difficulty": 3,
    "you": "ourTransition",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 150,
        "y": 190
      },
      "to": {
        "x": 150,
        "y": 320
      },
      "power": "medium"
    },
    "incoming": "Controllable chest ball, moving in",
    "incomingKo": "전진 중 다룰 수 있는 가슴 공",
    "prompt": "Moving in through midcourt, you get a controllable chest-high ball with a gap up the middle.",
    "promptKo": "미드코트를 지나며 전진 중, 가운데가 빈 상태에서 다룰 수 있는 가슴 높이 공을 받습니다.",
    "shot": {
      "reset": 3,
      "drive": 2,
      "drop": 2,
      "speedup": 1,
      "smash": 0
    },
    "power": {
      "soft": 2,
      "medium": 3,
      "hard": 0
    },
    "zone": {
      "kL": 1,
      "kM": 3,
      "mM": 1,
      "dM": 2
    },
    "explain": "It is controllable but you are still in transition — a reset is safest; a measured drive to the gap is the aggressive option.",
    "explainKo": "다룰 수 있지만 아직 트랜지션입니다. 리셋이 가장 안전하고, 빈 곳으로의 절제된 드라이브가 공격 옵션입니다."
  },
  {
    "id": "d3-atp2",
    "difficulty": 3,
    "you": "ourWideL",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 210,
        "y": 190
      },
      "to": {
        "x": 18,
        "y": 255
      },
      "power": "soft"
    },
    "incoming": "Wide low ball — clean ATP or safe dink?",
    "incomingKo": "넓고 낮은 공 — 깔끔한 ATP냐 안전한 딩크냐",
    "prompt": "A wide, low ball is just outside the post on your backhand side; it is a tough but possible ATP.",
    "promptKo": "넓고 낮은 공이 백핸드 쪽 포스트 바로 바깥에 옵니다 — 어렵지만 가능한 ATP입니다.",
    "shot": {
      "drive": 3,
      "dink": 2,
      "reset": 1,
      "smash": 0,
      "speedup": 1
    },
    "power": {
      "medium": 3,
      "hard": 2,
      "soft": 1
    },
    "zone": {
      "kL": 1,
      "nL": 1,
      "mL": 2,
      "mM": 1,
      "dL": 3,
      "dM": 2
    },
    "explain": "If you can get around the post, drive it down the open court; if the contact is unsure, a safe dink keeps the point alive.",
    "explainKo": "포스트를 돌 수 있으면 빈 코트로 드라이브하세요. 타점이 불안하면 안전한 딩크로 포인트를 살리는 것도 좋습니다."
  },
  {
    "id": "dp1-middle",
    "difficulty": 2,
    "you": "ourUp",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 150,
        "y": 188
      },
      "to": {
        "x": 150,
        "y": 266
      },
      "power": "soft"
    },
    "incoming": "A soft dink splits the middle between you both",
    "incomingKo": "둘 사이 가운데로 떨어지는 부드러운 딩크",
    "prompt": "A soft ball drops down the middle at the kitchen. Which player should take it, and how?",
    "promptKo": "키친에서 공이 둘 사이 가운데로 부드럽게 옵니다. 어느 플레이어가, 어떻게 칠까요?",
    "player": {
      "p1": 3,
      "p2": 1
    },
    "shot": {
      "dink": 3,
      "reset": 1,
      "roll": 1,
      "drop": 1
    },
    "power": {
      "soft": 3,
      "medium": 1,
      "hard": 0
    },
    "zone": {
      "kM": 3,
      "kL": 2,
      "kR": 2
    },
    "explain": "On a ball down the middle, the player whose forehand covers the center takes it — for two right-handers that is Player 1 on the left. Call it early and dink it back low.",
    "explainKo": "가운데로 오는 공은 포핸드가 중앙을 덮는 플레이어가 잡습니다 — 둘 다 오른손잡이면 왼쪽의 플레이어 1입니다. 일찍 \"마인\" 콜하고 낮게 딩크로 돌려보내세요."
  },
  {
    "id": "dp2-cover",
    "difficulty": 3,
    "you": "ourP1Wide",
    "opp": "oppUp",
    "ball": {
      "from": {
        "x": 206,
        "y": 188
      },
      "to": {
        "x": 150,
        "y": 270
      },
      "power": "medium"
    },
    "incoming": "Player 1 is pulled wide; the ball comes back to the middle",
    "incomingKo": "플레이어 1이 넓게 끌려나간 상태에서 공이 가운데로 돌아옵니다",
    "prompt": "Player 1 is stretched wide and out of position. A ball comes to the middle. Which player should take it?",
    "promptKo": "플레이어 1이 코트 밖으로 끌려나가 자리를 비웠습니다. 공이 가운데로 옵니다. 어느 플레이어가 칠까요?",
    "player": {
      "p1": 1,
      "p2": 3
    },
    "shot": {
      "reset": 3,
      "dink": 2,
      "block": 2,
      "drop": 1
    },
    "power": {
      "soft": 3,
      "medium": 1,
      "hard": 0
    },
    "zone": {
      "kM": 3,
      "kL": 2,
      "kR": 1
    },
    "explain": "When your partner is pulled out of position, the player still in position covers the middle — here Player 2. Take it, reset softly, and give Player 1 time to recover.",
    "explainKo": "파트너가 자리를 벗어나면, 제자리에 있는 플레이어가 가운데를 커버합니다 — 여기선 플레이어 2입니다. 받아서 부드럽게 리셋하고 플레이어 1이 복귀할 시간을 주세요."
  }
];
