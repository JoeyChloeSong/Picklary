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
          name: '패들·장비',
          blurb: '패들·신발·공을 실제 사용 기준으로 비교해 안내합니다.',
          intro:
            '피클볼 장비는 가격보다 내 플레이 방식에 맞는지가 더 중요합니다. 이 글들은 무게, 그립 크기, 코어 두께, 표면 소재처럼 실제 타구감에 영향을 주는 요소를 비교하고, 장단점을 이해하기 쉽게 설명합니다.'
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
          name: '기술·연습',
          blurb: 'DUPR 레벨(2.0~4.0+)에 맞춰 정리한 단계별 연습 가이드.',
          intro:
            '실력은 순서 있게 연습할 때 더 빨리 늡니다. 이 글들은 2.0~3.0에서 먼저 다질 기본기, 3.5로 올라가기 위해 필요한 기술, 4.0 이상에서 차이를 만드는 습관을 단계별로 정리했습니다. 현재 레벨에서 시작해 다음 단계로 이어가세요.'
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
          name: '규칙·입문',
          blurb: '점수 계산, 서브, 키친, 위치 선정, 코트 매너를 쉽게 정리합니다.',
          intro:
            '피클볼을 처음 시작할 때 가장 많이 헷갈리는 것은 서브, 투바운스 규칙, 비발리존(키친) 같은 기본 규칙입니다. 이 글들은 초보자가 자주 틀리는 부분과 오픈 플레이에서 알아두면 좋은 코트 매너를 함께 설명합니다.'
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
          name: '대회·리그',
          blurb: '대회 진행 방식, DUPR, 리그와 투어 구조를 이해하기 쉽게 설명합니다.',
          intro:
            '오픈 플레이를 넘어 대회에 도전하고 싶다면 여기서 시작하세요. 대회의 경기 방식, 대진표와 참가 부문, DUPR 활용법, 리그와 프로 투어의 구조를 첫 대회를 준비하는 눈높이에서 설명합니다.'
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
          name: '프로 선수·투어',
          blurb: '프로 경기, 선수, 공식 랭킹과 결과를 확인하는 방법.',
          intro:
            '피클볼 프로 투어와 국제 대회 정보는 빠르게 바뀝니다. 매주 달라지는 순위를 그대로 옮기기보다, 주요 투어가 어떻게 구성되는지와 선수·랭킹·경기 결과를 어디서 공식적으로 확인할 수 있는지 안내합니다.'
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
