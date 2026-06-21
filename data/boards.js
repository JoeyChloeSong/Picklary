/* Picklary boards: curated FAQ + Q&A demo seed content.
 * User submissions are local-only in the static site. Add moderation before public posting.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SITE_BOARDS = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  return {
    faqItems: [
  {
    "level": "2.0",
    "tag": "rules",
    "q": {
      "en": "What should a 2.0 player learn before worrying about DUPR?",
      "ko": "2.0 플레이어가 DUPR보다 먼저 배워야 하는 것은 무엇인가요?"
    },
    "a": {
      "en": "Learn the two-bounce rule, legal underhand/low-to-high serve motion, score calling, and where the non-volley zone begins. DUPR becomes useful after you have enough real match results.",
      "ko": "투바운스 규칙, 합법적인 서브 동작, 스코어 콜, 논발리존 위치를 먼저 익히세요. DUPR는 실제 경기 결과가 쌓였을 때 의미가 커집니다."
    }
  },
  {
    "level": "2.0",
    "tag": "rules",
    "q": {
      "en": "Why do I lose points even when I hit the ball hard?",
      "ko": "세게 치는데도 포인트를 자주 잃는 이유는 무엇인가요?"
    },
    "a": {
      "en": "At 2.0, most points are lost by missing serves, returns, and easy third balls. Choose a calm target over power until you can keep a simple rally alive.",
      "ko": "2.0에서는 서브, 리턴, 쉬운 3구 실수가 대부분입니다. 파워보다 안전한 타깃과 랠리 유지가 우선입니다."
    }
  },
  {
    "level": "2.0",
    "tag": "rules",
    "q": {
      "en": "Should I stand at the baseline after my return?",
      "ko": "리턴 후 베이스라인에 계속 있어도 되나요?"
    },
    "a": {
      "en": "No. After returning serve, move forward with balance so you and your partner can claim the kitchen line.",
      "ko": "아니요. 리턴한 팀은 균형을 유지하며 앞으로 이동해 파트너와 함께 키친 라인을 잡는 것이 좋습니다."
    }
  },
  {
    "level": "2.0",
    "tag": "rules",
    "q": {
      "en": "What is the easiest practice routine for a beginner?",
      "ko": "입문자에게 가장 쉬운 연습 루틴은 무엇인가요?"
    },
    "a": {
      "en": "Practice ten serves to each box, ten deep returns, and then a soft kitchen-line dink rally. Measure consistency, not winners.",
      "ko": "각 박스에 서브 10개, 깊은 리턴 10개, 키친 라인에서 부드러운 딩크 랠리를 반복하세요. 위너보다 성공률을 기록하세요."
    }
  },
  {
    "level": "2.0",
    "tag": "rules",
    "q": {
      "en": "Do I need an expensive paddle at 2.0?",
      "ko": "2.0도 비싼 패들이 필요한가요?"
    },
    "a": {
      "en": "No. A forgiving paddle with a large sweet spot and comfortable grip is more important than premium power or spin.",
      "ko": "아닙니다. 고급 파워/스핀보다 스위트스팟이 넓고 그립이 편한 패들이 더 중요합니다."
    }
  },
  {
    "level": "2.5",
    "tag": "consistency",
    "q": {
      "en": "What separates 2.5 from 2.0?",
      "ko": "2.5와 2.0의 차이는 무엇인가요?"
    },
    "a": {
      "en": "A 2.5 player can start points legally, keep more returns in play, and understand when to move toward the kitchen, but consistency still breaks under pressure.",
      "ko": "2.5는 포인트를 합법적으로 시작하고 리턴을 더 많이 넣으며 키친으로 이동할 타이밍을 이해합니다. 다만 압박 속 일관성은 아직 흔들립니다."
    }
  },
  {
    "level": "2.5",
    "tag": "consistency",
    "q": {
      "en": "How deep should my return be?",
      "ko": "리턴은 얼마나 깊어야 하나요?"
    },
    "a": {
      "en": "Aim for the back third of the court with height and margin. A deep return gives your team more time to move forward.",
      "ko": "코트 뒤쪽 1/3 지점을 높이와 여유를 두고 노리세요. 깊은 리턴은 우리 팀이 앞으로 이동할 시간을 줍니다."
    }
  },
  {
    "level": "2.5",
    "tag": "consistency",
    "q": {
      "en": "Why do my dinks pop up?",
      "ko": "딩크가 자꾸 뜨는 이유는 무엇인가요?"
    },
    "a": {
      "en": "The paddle face is often too open or the swing is too long. Keep the motion compact, use your legs, and aim for a soft arc.",
      "ko": "패들 면이 너무 열리거나 스윙이 길 때가 많습니다. 동작을 짧게 하고 다리를 쓰며 부드러운 포물선을 만드세요."
    }
  },
  {
    "level": "2.5",
    "tag": "consistency",
    "q": {
      "en": "When should I reset instead of attacking?",
      "ko": "언제 공격보다 리셋을 선택해야 하나요?"
    },
    "a": {
      "en": "Reset when contact is low, you are stretched, or both opponents are balanced at the kitchen. Attack only when the ball is clearly high.",
      "ko": "낮은 타점, 몸이 뻗은 상황, 상대 둘이 키친에서 균형 잡힌 상황이면 리셋이 좋습니다. 명확히 높은 공만 공격하세요."
    }
  },
  {
    "level": "2.5",
    "tag": "consistency",
    "q": {
      "en": "How should partners move at 2.5?",
      "ko": "2.5에서 파트너와 어떻게 움직여야 하나요?"
    },
    "a": {
      "en": "Move like a connected pair. Avoid chasing one ball all the way across the court unless your partner clearly calls you off.",
      "ko": "두 명이 연결된 것처럼 움직이세요. 파트너의 콜 없이 한 공을 끝까지 따라가며 코트를 비우지 않는 것이 중요합니다."
    }
  },
  {
    "level": "3.0",
    "tag": "third-shot",
    "q": {
      "en": "What is the main goal at 3.0?",
      "ko": "3.0의 가장 큰 목표는 무엇인가요?"
    },
    "a": {
      "en": "Build a repeatable serve-return-third shot pattern, then get to the kitchen without rushing.",
      "ko": "서브-리턴-3구 패턴을 반복 가능하게 만들고, 서두르지 않고 키친으로 진입하는 것입니다."
    }
  },
  {
    "level": "3.0",
    "tag": "third-shot",
    "q": {
      "en": "Do I need a perfect third-shot drop?",
      "ko": "완벽한 3구 드롭이 꼭 필요한가요?"
    },
    "a": {
      "en": "No. You need a reliable decision: drop when you have time and control, drive when the ball lets you create a easier fifth shot.",
      "ko": "아닙니다. 시간이 있고 컨트롤이 되면 드롭, 다음 공을 쉽게 만들 수 있으면 드라이브라는 의사결정이 더 중요합니다."
    }
  },
  {
    "level": "3.0",
    "tag": "third-shot",
    "q": {
      "en": "Why do I get stuck in the transition zone?",
      "ko": "전환구역에 자꾸 갇히는 이유는 무엇인가요?"
    },
    "a": {
      "en": "You may be moving while hitting. Split step before contact, reset low balls, and advance only after a neutral or good shot.",
      "ko": "움직이면서 치는 경우가 많습니다. 상대 타구 전 스플릿 스텝을 하고, 낮은 공은 리셋하며, 좋은 공 이후에만 전진하세요."
    }
  },
  {
    "level": "3.0",
    "tag": "third-shot",
    "q": {
      "en": "Should I speed up dinks?",
      "ko": "딩크를 스피드업해도 되나요?"
    },
    "a": {
      "en": "At 3.0, speed up only balls that sit high. Random attacks from low dinks usually feed counters.",
      "ko": "3.0에서는 높게 뜬 공만 스피드업하세요. 낮은 딩크에서 무리한 공격은 상대 카운터를 도와줍니다."
    }
  },
  {
    "level": "3.0",
    "tag": "third-shot",
    "q": {
      "en": "What paddle style fits many 3.0 players?",
      "ko": "3.0에게 맞는 패들 성향은 무엇인가요?"
    },
    "a": {
      "en": "An all-court paddle with control for drops and enough pop for simple putaways usually works better than extreme power.",
      "ko": "드롭 컨트롤과 간단한 마무리 반발력을 모두 갖춘 올라운드형이 극단적인 파워형보다 무난합니다."
    }
  },
  {
    "level": "3.5",
    "tag": "dink",
    "q": {
      "en": "What changes at 3.5?",
      "ko": "3.5에서 달라지는 점은 무엇인가요?"
    },
    "a": {
      "en": "Opponents punish loose balls more often. You need cleaner target selection, partner communication, and compact counters.",
      "ko": "상대가 느슨한 공을 더 자주 응징합니다. 더 깨끗한 타깃 선택, 파트너 소통, 짧은 카운터가 필요합니다."
    }
  },
  {
    "level": "3.5",
    "tag": "dink",
    "q": {
      "en": "How do I create pressure without overhitting?",
      "ko": "과하게 치지 않고 압박을 만드는 방법은?"
    },
    "a": {
      "en": "Use repeated safe dinks to move an opponent, then attack the ball that sits up rather than forcing the first opening.",
      "ko": "안전한 딩크를 반복해 상대를 움직인 뒤, 실제로 뜬 공을 공격하세요. 첫 틈을 억지로 만들 필요는 없습니다."
    }
  },
  {
    "level": "3.5",
    "tag": "dink",
    "q": {
      "en": "Who covers the middle in doubles?",
      "ko": "더블스에서 미들은 누가 커버하나요?"
    },
    "a": {
      "en": "It depends on stack, handedness, and ball direction. Agree on a simple rule before games, then call early and loudly.",
      "ko": "스태킹, 주손, 공 방향에 따라 다릅니다. 경기 전 간단한 원칙을 정하고 빠르고 크게 콜하세요."
    }
  },
  {
    "level": "3.5",
    "tag": "dink",
    "q": {
      "en": "Why do I lose hands battles?",
      "ko": "핸즈 배틀에서 자주 지는 이유는 무엇인가요?"
    },
    "a": {
      "en": "Your backswing may be too big. Keep the paddle in front, block first, and counter only when the ball is in your strike zone.",
      "ko": "백스윙이 큰 경우가 많습니다. 패들을 앞에 두고 먼저 블록한 뒤, 타점이 맞을 때만 카운터하세요."
    }
  },
  {
    "level": "3.5",
    "tag": "dink",
    "q": {
      "en": "How should I review match video at 3.5?",
      "ko": "3.5에서 경기 영상을 어떻게 봐야 하나요?"
    },
    "a": {
      "en": "Tag only three things: unforced errors, transition decisions, and missed attackable balls. Too many categories make review useless.",
      "ko": "언포스드 에러, 전환구역 의사결정, 공격 가능 공 놓침 세 가지만 태그하세요. 항목이 너무 많으면 리뷰가 흐려집니다."
    }
  },
  {
    "level": "4.0",
    "tag": "strategy",
    "q": {
      "en": "What makes a 4.0 player different from 3.5?",
      "ko": "4.0은 3.5와 무엇이 다른가요?"
    },
    "a": {
      "en": "A 4.0 player handles pressure with resets, counters speed-ups with less swing, and makes fewer pattern mistakes across full games.",
      "ko": "4.0은 압박 속 리셋, 짧은 카운터, 경기 전체의 패턴 실수 감소가 눈에 띕니다."
    }
  },
  {
    "level": "4.0",
    "tag": "strategy",
    "q": {
      "en": "When should I drive the third shot?",
      "ko": "3구 드라이브는 언제 사용해야 하나요?"
    },
    "a": {
      "en": "Drive when contact is balanced and the drive can force a weak block or set up a fifth-shot drop. Do not drive just because you are behind.",
      "ko": "균형 잡힌 타점에서 상대의 약한 블록이나 5구 드롭 기회를 만들 수 있을 때 사용하세요. 지고 있다고 무작정 드라이브하지 마세요."
    }
  },
  {
    "level": "4.0",
    "tag": "strategy",
    "q": {
      "en": "How do we use stacking responsibly?",
      "ko": "스태킹은 어떻게 안전하게 쓰나요?"
    },
    "a": {
      "en": "Use it to protect strengths and preferred sides, but rehearse serve/return movement so you do not create free confusion.",
      "ko": "강점과 선호 사이드를 살리기 위해 쓰되, 서브/리턴 후 이동을 미리 연습해 혼란을 만들지 않아야 합니다."
    }
  },
  {
    "level": "4.0",
    "tag": "strategy",
    "q": {
      "en": "How do I attack a strong dinker?",
      "ko": "딩크를 잘하는 상대는 어떻게 공략하나요?"
    },
    "a": {
      "en": "Change height, depth, and direction patiently. The goal is to earn a pop-up, not win the dink exchange immediately.",
      "ko": "높이, 깊이, 방향을 천천히 바꾸세요. 딩크 교환을 바로 이기는 것이 아니라 팝업을 얻는 것이 목표입니다."
    }
  },
  {
    "level": "4.0",
    "tag": "strategy",
    "q": {
      "en": "What is the best 4.0 practice game?",
      "ko": "4.0에게 좋은 연습 게임은?"
    },
    "a": {
      "en": "Start points in the transition zone and require a successful reset before attacking. This exposes rushed decisions quickly.",
      "ko": "전환구역에서 시작해 성공적인 리셋 후에만 공격할 수 있게 해보세요. 성급한 의사결정이 빨리 드러납니다."
    }
  },
  {
    "level": "4.5",
    "tag": "tournament",
    "q": {
      "en": "What should I scout in warmups?",
      "ko": "워밍업 때 무엇을 봐야 하나요?"
    },
    "a": {
      "en": "Look for backhand comfort, return depth, reset quality, and which player takes middle balls under stress.",
      "ko": "백핸드 편안함, 리턴 깊이, 리셋 품질, 압박 속 미들 공을 누가 가져가는지 보세요."
    }
  },
  {
    "level": "4.5",
    "tag": "tournament",
    "q": {
      "en": "How do I protect my weakest ball?",
      "ko": "내 약한 공은 어떻게 보호하나요?"
    },
    "a": {
      "en": "Know the situation that exposes it, then choose targets and court position that reduce that exposure instead of pretending it is not there.",
      "ko": "그 약점이 드러나는 상황을 알고, 없는 척하기보다 타깃과 위치 선택으로 노출을 줄이세요."
    }
  },
  {
    "level": "4.5",
    "tag": "tournament",
    "q": {
      "en": "What changes at 8-8 or 9-9?",
      "ko": "8-8 또는 9-9에서 무엇이 달라져야 하나요?"
    },
    "a": {
      "en": "Risk tolerance should become intentional. Choose patterns you can repeat under stress, not highlight shots you only make sometimes.",
      "ko": "위험 감수는 의도적이어야 합니다. 가끔 성공하는 하이라이트 샷보다 압박 속 반복 가능한 패턴을 고르세요."
    }
  },
  {
    "level": "4.5",
    "tag": "tournament",
    "q": {
      "en": "How many tactical notes should a team use?",
      "ko": "팀 전술 노트는 몇 개가 적당한가요?"
    },
    "a": {
      "en": "Two or three. More than that gets forgotten. Pick one serve/return idea, one target, and one emergency reset rule.",
      "ko": "두세 개면 충분합니다. 서브/리턴 아이디어 하나, 타깃 하나, 비상 리셋 원칙 하나 정도가 현실적입니다."
    }
  },
  {
    "level": "4.5",
    "tag": "tournament",
    "q": {
      "en": "What should I record after a tournament match?",
      "ko": "토너먼트 경기 후 무엇을 기록해야 하나요?"
    },
    "a": {
      "en": "Write the score context of key errors, the pattern that hurt you, and one adjustment you would try next time.",
      "ko": "주요 실수가 나온 점수 상황, 나를 괴롭힌 패턴, 다음에 시도할 한 가지 조정을 적으세요."
    }
  },
  {
    "level": "5.0",
    "tag": "role",
    "q": {
      "en": "What should a 5.0 player study from pros?",
      "ko": "5.0은 프로 경기에서 무엇을 봐야 하나요?"
    },
    "a": {
      "en": "Study decision trees: when a pro drives to create a drop, when they grind a dink pattern, and when they change speed after earning a predictable ball.",
      "ko": "의사결정 트리를 보세요. 프로가 언제 드라이브로 드롭 기회를 만드는지, 언제 딩크 패턴을 이어가는지, 어떤 공을 얻은 뒤 속도를 바꾸는지 확인하세요."
    }
  },
  {
    "level": "5.0",
    "tag": "role",
    "q": {
      "en": "How can video review stay useful at 5.0?",
      "ko": "5.0에서 영상 리뷰를 유용하게 유지하는 방법은?"
    },
    "a": {
      "en": "Tag patterns, not just mistakes. Look for the shot before the error and the opponent adjustment before the opening.",
      "ko": "실수만이 아니라 패턴을 태그하세요. 에러 직전의 샷과 상대가 조정한 순간을 함께 봐야 합니다."
    }
  },
  {
    "level": "5.0",
    "tag": "role",
    "q": {
      "en": "When should elite teams call timeout?",
      "ko": "상급 팀은 언제 타임아웃을 불러야 하나요?"
    },
    "a": {
      "en": "Use timeouts to stop pattern momentum, clarify targets, or reset body language before a game slips away.",
      "ko": "상대 패턴의 흐름을 끊고, 타깃을 다시 정하거나, 경기 분위기가 넘어가기 전 바디랭귀지를 리셋할 때 사용하세요."
    }
  },
  {
    "level": "5.0",
    "tag": "role",
    "q": {
      "en": "How do advanced players disguise speed-ups?",
      "ko": "상급자는 스피드업을 어떻게 위장하나요?"
    },
    "a": {
      "en": "They keep the same preparation as a dink, shorten the swing, and choose a target that matches the opponent’s paddle position.",
      "ko": "딩크와 같은 준비 자세를 유지하고, 스윙을 짧게 하며, 상대 패들 위치에 맞는 타깃을 선택합니다."
    }
  },
  {
    "level": "5.0",
    "tag": "role",
    "q": {
      "en": "What paddle decision matters most at 5.0?",
      "ko": "5.0에서 패들 선택의 핵심은 무엇인가요?"
    },
    "a": {
      "en": "A tournament player should value approved status, comfort over long matches, and predictable response under pressure over marketing claims.",
      "ko": "마케팅 문구보다 승인 상태, 긴 경기의 편안함, 압박 속 예측 가능한 반응이 더 중요합니다."
    }
  }
],
    qnaSeeds: [
  {
    "id": "deep-return-keeps-coming-to-backhand",
    "title": {
      "en": "Opponent keeps returning deep to my backhand. What should I change?",
      "ko": "상대가 계속 제 백핸드 쪽 깊은 리턴을 보냅니다. 어떻게 바꿔야 할까요?"
    },
    "level": "3.0",
    "tag": "return",
    "question": {
      "en": "In doubles, the opponent keeps pinning my backhand corner with deep returns. I either rush a bad drop or drive into the net. What is the safest response?",
      "ko": "더블스에서 상대가 제 백핸드 코너로 깊은 리턴을 계속 보냅니다. 나쁜 드롭을 급하게 치거나 드라이브가 네트에 걸립니다. 가장 안전한 대응은 무엇인가요?"
    },
    "votes": 18,
    "answers": [
      {
        "name": "Picklary 에디터",
        "votes": 31,
        "body": {
          "en": "First, buy time. Take a small adjustment step behind the ball instead of reaching. If the ball is low or behind you, choose a reset-style third shot with height and margin to the middle, not a perfect sideline drop. If the return sits up and you are balanced, drive through the middle hip to earn an easier fifth shot. Ask your partner to hold position until your shot quality is clear.",
          "ko": "먼저 시간을 확보하세요. 뻗어서 치기보다 공 뒤로 작은 조정 스텝을 하세요. 공이 낮거나 몸 뒤에 있으면 완벽한 사이드라인 드롭보다 가운데로 높이와 여유를 둔 리셋형 3구가 안전합니다. 리턴이 떠 있고 균형이 잡혔다면 가운데 힙 방향으로 드라이브해 쉬운 5구를 만드세요. 파트너에게는 당신의 샷 품질이 확인될 때까지 무리하게 전진하지 않도록 요청하세요."
        }
      },
      {
        "name": "KitchenLineCoach",
        "votes": 9,
        "body": {
          "en": "I also like serving slightly wider to change the return angle. It does not solve everything, but it can stop the opponent from grooving the same deep backhand return.",
          "ko": "서브 위치를 약간 넓게 줘서 리턴 각도를 바꾸는 것도 좋았습니다. 모든 해결책은 아니지만 상대가 같은 백핸드 깊은 리턴에 익숙해지는 것을 막을 수 있습니다."
        }
      }
    ]
  },
  {
    "id": "partner-stays-back-after-return",
    "title": {
      "en": "My partner stays back after returning serve. How do I handle it?",
      "ko": "파트너가 리턴 후 뒤에 머뭅니다. 어떻게 해야 하나요?"
    },
    "level": "2.5",
    "tag": "partner",
    "question": {
      "en": "In open play my partner hits the return and then waits near the baseline. I move forward alone and get attacked. Should I stay back too?",
      "ko": "오픈플레이에서 파트너가 리턴을 치고 베이스라인 근처에 머뭅니다. 저만 앞으로 가면 공격당합니다. 저도 뒤에 있어야 하나요?"
    },
    "votes": 14,
    "answers": [
      {
        "name": "Picklary 에디터",
        "votes": 27,
        "body": {
          "en": "Do not silently split the team. Before the next return, say something simple: “After the return, let’s both walk to the kitchen together.” If your partner still stays back, shade slightly toward the middle but avoid overcommitting. You can also hit safer dinks and resets until both of you are forward.",
          "ko": "팀이 말없이 갈라지게 두지 마세요. 다음 리턴 전 “리턴 후 같이 키친으로 걸어가요”처럼 간단히 말하세요. 그래도 파트너가 뒤에 있으면 미들 쪽을 조금 더 의식하되 과하게 커버하지 마세요. 둘 다 앞으로 올 때까지 더 안전한 딩크와 리셋을 선택하는 것도 좋습니다."
        }
      },
      {
        "name": "ThirdShotLearner",
        "votes": 6,
        "body": {
          "en": "A friendly cue helped my group: “return and run.” People usually forget, not refuse.",
          "ko": "저희 그룹은 “리턴하고 전진”이라는 짧은 cue가 도움이 됐습니다. 대부분은 거부가 아니라 잊어버리는 경우였습니다."
        }
      }
    ]
  },
  {
    "id": "dinks-keep-popping-up-under-pressure",
    "title": {
      "en": "My dinks keep popping up when the rally gets tense.",
      "ko": "압박이 생기면 딩크가 계속 떠요."
    },
    "level": "3.5",
    "tag": "dink",
    "question": {
      "en": "During casual drilling my dinks are fine, but in games they float high and get smashed. What should I focus on first?",
      "ko": "드릴에서는 딩크가 괜찮은데 경기만 되면 공이 높게 떠서 스매시를 당합니다. 무엇부터 봐야 하나요?"
    },
    "votes": 22,
    "answers": [
      {
        "name": "Picklary 에디터",
        "votes": 35,
        "body": {
          "en": "Check three things in order: contact height, paddle face, and recovery. If contact is below the knee, do not try to be too fine; send a safer cross-court arc. Keep the paddle face slightly less open under stress. After the dink, recover your paddle in front instead of watching the ball.",
          "ko": "타점 높이, 패들 면, 회복 순서로 확인하세요. 무릎 아래 타점이면 너무 정교하게 넣으려 하지 말고 안전한 크로스 포물선을 보내세요. 압박 상황에서는 패들 면이 과하게 열리지 않게 합니다. 딩크 후에는 공을 구경하지 말고 패들을 앞에 회복하세요."
        }
      },
      {
        "name": "ResetRally",
        "votes": 11,
        "body": {
          "en": "I started counting only “unattackable dinks” in practice. That made my games calmer because I was not aiming for perfect winners.",
          "ko": "연습 때 “공격당하지 않는 딩크”만 세기 시작했더니 경기에서도 완벽한 위너를 노리지 않아 더 차분해졌습니다."
        }
      }
    ]
  },
  {
    "id": "opponents-attack-middle-in-doubles",
    "title": {
      "en": "Opponents keep attacking the middle in doubles.",
      "ko": "상대가 더블스에서 계속 미들을 공격합니다."
    },
    "level": "4.0",
    "tag": "middle",
    "question": {
      "en": "Our opponents speed up through the middle and we both hesitate. How should we decide who takes it?",
      "ko": "상대가 미들로 스피드업을 하고 우리 둘 다 망설입니다. 누가 가져갈지 어떻게 정해야 하나요?"
    },
    "votes": 20,
    "answers": [
      {
        "name": "Picklary 에디터",
        "votes": 33,
        "body": {
          "en": "Create a default rule before the match. Common defaults are forehand takes middle, player across from the ball shades middle, or the stronger counter player owns middle during hands exchanges. The exact rule matters less than calling early. Add one emergency word such as “mine” or “yours” and rehearse it in warmup.",
          "ko": "경기 전에 기본 원칙을 만드세요. 흔한 방식은 포핸드가 미들, 공과 마주한 선수가 미들을 더 의식, 핸즈 교환에서는 카운터가 좋은 선수가 미들 담당 등입니다. 정확한 원칙보다 빠른 콜이 더 중요합니다. “마인”, “유어스” 같은 비상 단어를 하나 정하고 워밍업 때 연습하세요."
        }
      },
      {
        "name": "CounterReady",
        "votes": 8,
        "body": {
          "en": "Our team uses “forehand owns unless poached.” It is not perfect, but it removed most hesitation.",
          "ko": "저희 팀은 “포핸드 우선, 단 포치 콜 있으면 예외”를 씁니다. 완벽하진 않지만 망설임이 대부분 사라졌습니다."
        }
      }
    ]
  },
  {
    "id": "which-paddle-for-elbow-comfort-and-control",
    "title": {
      "en": "Which paddle profile helps elbow comfort without losing control?",
      "ko": "팔꿈치 부담을 줄이면서 컨트롤을 살리는 패들 성향은?"
    },
    "level": "3.0",
    "tag": "paddle",
    "question": {
      "en": "I want more control and less arm stress. Should I buy a heavy power paddle or a softer 16mm paddle?",
      "ko": "컨트롤은 늘리고 팔 부담은 줄이고 싶습니다. 무거운 파워 패들을 사야 할까요, 부드러운 16mm 패들이 좋을까요?"
    },
    "votes": 16,
    "answers": [
      {
        "name": "Picklary 에디터",
        "votes": 29,
        "body": {
          "en": "For many developing players, a softer-feeling 16mm control or all-court paddle is easier to manage than a very stiff power paddle. Also check grip size, overgrip thickness, swing weight, and how tightly you squeeze. Equipment can help, but pain should be treated as a health signal, not only a gear problem.",
          "ko": "많은 성장 단계 플레이어에게는 매우 딱딱한 파워 패들보다 부드러운 느낌의 16mm 컨트롤/올라운드 패들이 다루기 쉽습니다. 그립 사이즈, 오버그립 두께, 스윙웨이트, 손에 힘을 얼마나 주는지도 확인하세요. 장비가 도움은 되지만 통증은 단순 장비 문제가 아니라 몸의 신호로 봐야 합니다."
        }
      },
      {
        "name": "PaddleNerd",
        "votes": 7,
        "body": {
          "en": "Demo if you can. A paddle that feels soft in marketing copy may still swing heavy for your hand speed.",
          "ko": "가능하면 데모해 보세요. 마케팅 문구상 부드러운 패들도 본인 손속도에는 무겁게 느껴질 수 있습니다."
        }
      }
    ]
  },
  {
    "id": "how-to-handle-bangers-at-25",
    "title": {
      "en": "How should a 2.5 player handle hard hitters?",
      "ko": "2.5 플레이어는 강타자를 어떻게 상대해야 하나요?"
    },
    "level": "2.5",
    "tag": "defense",
    "question": {
      "en": "Several players hit every ball hard at me. I swing back and the point gets chaotic. What should I do instead?",
      "ko": "몇몇 플레이어가 모든 공을 세게 칩니다. 저도 같이 휘두르면 포인트가 혼란스러워집니다. 대신 무엇을 해야 하나요?"
    },
    "votes": 12,
    "answers": [
      {
        "name": "Picklary 에디터",
        "votes": 24,
        "body": {
          "en": "Start with a quiet block. Keep the paddle in front, loosen your grip slightly, and redirect the pace to the middle or at their feet. If you are at the kitchen, do not take a big backswing. If you are deep, use more height and depth instead of trying to win the speed contest.",
          "ko": "먼저 조용한 블록부터 하세요. 패들을 앞에 두고 그립 힘을 조금 빼며 상대 속도를 미들이나 발밑으로 돌려보내세요. 키친에 있다면 큰 백스윙을 하지 마세요. 뒤에 있다면 속도 싸움을 이기려 하기보다 높이와 깊이를 사용하세요."
        }
      },
      {
        "name": "NoPanicDinks",
        "votes": 5,
        "body": {
          "en": "The best advice I got: hard hitters want your panic. Make them hit one more ball.",
          "ko": "제가 들은 최고의 조언은 “강타자는 당신의 당황을 원한다. 한 번 더 치게 만들어라”였습니다."
        }
      }
    ]
  },
  {
    "id": "when-to-lob-from-the-kitchen",
    "title": {
      "en": "When is a kitchen-line lob a good choice?",
      "ko": "키친 라인에서 랍은 언제 좋은 선택인가요?"
    },
    "level": "4.5",
    "tag": "lob",
    "question": {
      "en": "I see better players use surprise lobs from the kitchen. When is this actually smart and when is it a low-percentage bailout?",
      "ko": "상급자들이 키친에서 기습 랍을 쓰는 것을 봅니다. 언제 좋은 선택이고 언제 확률 낮은 탈출샷인가요?"
    },
    "votes": 11,
    "answers": [
      {
        "name": "Picklary 에디터",
        "votes": 21,
        "body": {
          "en": "A kitchen-line lob is better when both opponents are leaning forward, your contact is balanced, and the wind/ceiling does not punish height. It is a poor bailout when you are late, falling away, or telegraphing the swing. Think of it as a tempo change earned by neutral control, not an escape from a bad ball.",
          "ko": "키친 라인 랍은 상대 둘이 앞으로 기울어 있고, 내 타점이 균형 잡혀 있으며, 바람/천장이 높이를 벌하지 않을 때 좋습니다. 늦거나 몸이 빠지거나 스윙이 읽히면 좋지 않은 탈출샷입니다. 나쁜 공에서 도망치는 샷이 아니라 중립 상황을 통제한 뒤 얻는 템포 변화로 생각하세요."
        }
      }
    ]
  },
  {
    "id": "how-to-use-video-review-for-50",
    "title": {
      "en": "How should a 5.0 player structure video review?",
      "ko": "5.0 플레이어는 영상 리뷰를 어떻게 구조화해야 하나요?"
    },
    "level": "5.0",
    "tag": "video-review",
    "question": {
      "en": "I have lots of match clips but review gets messy. What should I chart if I want practical adjustments?",
      "ko": "경기 클립은 많은데 리뷰가 산만해집니다. 실전 조정을 위해 무엇을 기록해야 하나요?"
    },
    "votes": 13,
    "answers": [
      {
        "name": "Picklary 에디터",
        "votes": 26,
        "body": {
          "en": "Use a small chart: score, serve/return side, third-shot choice, first transition decision, and the shot that changed the rally. Then write one adjustment for the next match. At 5.0, the most useful review is usually pattern timing, not a long list of isolated errors.",
          "ko": "작은 차트를 쓰세요. 점수, 서브/리턴 사이드, 3구 선택, 첫 전환구역 의사결정, 랠리를 바꾼 샷을 기록합니다. 그리고 다음 경기에서 시도할 조정 한 가지만 적으세요. 5.0에서는 고립된 실수 목록보다 패턴 타이밍 리뷰가 더 유용한 경우가 많습니다."
        }
      }
    ]
  }
]
  };
}));
