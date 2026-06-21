/*
 * Categories. Each has an intro so category pages are not thin/duplicate.
 * `translations` localises name + blurb + intro per locale (optional).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SITE_CATEGORIES = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  return [
    {
      id: 'gear',
      slug: 'paddles-and-gear',
      name: 'Paddles & Gear',
      blurb: 'Honest, comparison-first guidance on paddles, shoes, and balls.',
      intro:
        'Choosing pickleball gear is mostly about matching equipment to how you actually play, not chasing the most expensive option. These guides compare paddles, shoes, and balls on the attributes that change how the game feels — weight, grip size, core, and face material — and explain the trade-offs in plain terms so you can decide for yourself.',
      translations: {
        ko: {
          name: '패들 & 장비',
          blurb: '패들·신발·공을 비교 중심으로 정직하게 안내합니다.',
          intro:
            '피클볼 장비 선택은 가장 비싼 제품을 고르는 일이 아니라, 자신의 플레이 방식에 맞추는 일입니다. 이 카테고리의 글들은 무게·그립 사이즈·코어·면 소재처럼 실제 타구감을 바꾸는 요소를 기준으로 비교하고, 그 장단점을 쉬운 말로 설명해 스스로 판단할 수 있게 돕습니다.'
        },
        es: {
          name: 'Palas y equipo',
          blurb: 'Guía honesta y comparativa sobre palas, calzado y bolas.',
          intro:
            'Elegir equipo de pickleball consiste sobre todo en ajustar el material a tu forma de jugar, no en buscar lo más caro. Estas guías comparan palas, calzado y bolas según lo que cambia la sensación de juego —peso, tamaño de empuñadura, núcleo y material de la cara— y explican las ventajas y desventajas con claridad.'
        }
      }
    },
    {
      id: 'skills',
      slug: 'skills-and-drills',
      name: 'Skills & Drills',
      blurb: 'A practice pathway organised by DUPR level, from 2.0 to 4.0+.',
      intro:
        'Improvement is easier when practice is sequenced. Instead of scattered tips, these articles are placed along a DUPR-level pathway — what to work on at 2.0–3.0, what unlocks 3.5, and the habits that separate 4.0+ players. Start where you are and follow the path.',
      translations: {
        ko: {
          name: '기술 & 연습',
          blurb: 'DUPR 레벨(2.0~4.0+)에 따라 정리한 연습 경로.',
          intro:
            '연습은 순서가 있을 때 더 쉽게 늡니다. 흩어진 팁 대신, 이 글들은 DUPR 레벨 경로 위에 배치되어 있습니다. 2.0~3.0에서 다질 것, 3.5로 가기 위한 것, 4.0+ 플레이어를 구분 짓는 습관을 다룹니다. 자신의 위치에서 시작해 경로를 따라가세요.'
        },
        es: {
          name: 'Técnica y ejercicios',
          blurb: 'Una ruta de práctica organizada por nivel DUPR, de 2.0 a 4.0+.',
          intro:
            'Mejorar es más fácil cuando la práctica está ordenada. En lugar de consejos sueltos, estos artículos se sitúan en una ruta por nivel DUPR: qué trabajar en 2.0–3.0, qué desbloquea el 3.5 y los hábitos del 4.0+. Empieza donde estés y sigue la ruta.'
        }
      }
    },
    {
      id: 'rules',
      slug: 'rules-and-getting-started',
      name: 'Rules & Getting Started',
      blurb: 'Scoring, the serve, the kitchen, positioning, and court etiquette.',
      intro:
        'Most early confusion in pickleball comes from a handful of rules — the serve, the two-bounce rule, and the non-volley zone (the "kitchen"). These guides explain the rules new players actually trip over, plus the unwritten etiquette of open play, so your first games go more smoothly.',
      translations: {
        ko: {
          name: '규칙 & 입문',
          blurb: '스코어링, 서브, 키친, 포지셔닝, 코트 매너.',
          intro:
            '피클볼 입문 초기의 혼란 대부분은 몇 가지 규칙에서 옵니다. 서브, 투바운스 규칙, 그리고 논발리존(키친)입니다. 이 글들은 초보자가 실제로 헷갈리는 규칙과 함께, 픽업 게임에서 통하는 암묵적 매너까지 설명해 첫 경기를 한결 수월하게 만듭니다.'
        },
        es: {
          name: 'Reglas e iniciación',
          blurb: 'Puntuación, saque, la cocina, posicionamiento y etiqueta.',
          intro:
            'Gran parte de la confusión inicial viene de unas pocas reglas: el saque, la regla de los dos botes y la zona de no volea (la "cocina"). Estas guías explican las reglas con las que de verdad tropiezan los principiantes, además de la etiqueta del juego abierto.'
        }
      }
    },
    {
      id: 'compete',
      slug: 'tournaments-and-leagues',
      name: 'Tournaments & Leagues',
      blurb: 'How tournaments are run, DUPR explained, and the competitive scene.',
      intro:
        'Ready to play beyond open play? These explainers cover how tournaments are structured (formats, brackets, and divisions), what DUPR is and how to use it, and how leagues and tours fit together — written for someone entering their first event, not for insiders.',
      translations: {
        ko: {
          name: '대회 & 리그',
          blurb: '대회 진행 방식, DUPR 설명, 경쟁 씬 개요.',
          intro:
            '픽업 게임을 넘어 도전할 준비가 되셨나요? 이 글들은 대회 구조(포맷·브래킷·디비전), DUPR이 무엇이고 어떻게 쓰는지, 리그와 투어가 어떻게 맞물리는지를 다룹니다. 내부자가 아니라 첫 대회를 앞둔 사람을 위한 설명입니다.'
        },
        es: {
          name: 'Torneos y ligas',
          blurb: 'Cómo se organizan los torneos, qué es DUPR y la escena competitiva.',
          intro:
            '¿Listo para jugar más allá del juego abierto? Estos artículos explican cómo se estructuran los torneos (formatos, cuadros y divisiones), qué es DUPR y cómo usarlo, y cómo encajan ligas y circuitos, pensados para quien afronta su primer torneo.'
        }
      }
    },
    {
      id: 'scene',
      slug: 'players-and-global-scene',
      name: 'Players & Global Scene',
      blurb: 'How to follow the pro game and find official rankings worldwide.',
      intro:
        'The professional and international side of pickleball moves quickly. Rather than reprint rankings that change week to week, these guides explain how the global scene is organised and where to find official, up-to-date sources for players, rankings, and results — so you always read the primary source.',
      translations: {
        ko: {
          name: '선수 & 글로벌 씬',
          blurb: '프로 경기를 따라가고 공식 순위를 찾는 법.',
          intro:
            '피클볼의 프로·국제 무대는 빠르게 바뀝니다. 매주 달라지는 순위를 그대로 옮기기보다, 이 글들은 글로벌 씬이 어떻게 구성되는지와 선수·순위·결과의 공식 최신 출처를 어디서 확인하는지를 설명합니다. 항상 원 출처를 보도록 안내합니다.'
        },
        es: {
          name: 'Jugadores y escena global',
          blurb: 'Cómo seguir el juego profesional y encontrar rankings oficiales.',
          intro:
            'La parte profesional e internacional del pickleball cambia rápido. En vez de reproducir rankings que varían cada semana, estas guías explican cómo se organiza la escena global y dónde encontrar fuentes oficiales y actualizadas de jugadores, rankings y resultados.'
        }
      }
    }
  ];
}));
