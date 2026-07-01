/* Picklary level pathway: 2.0 through 5.0. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SITE_LEVELS = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  return [
    {
      id: '2.0', slug: '2-0', title: 'Level 2.0: New Player Foundation',
      subtitle: 'Learn the court, scoring, serve, and safe rally habits before chasing advanced shots.',
      summary: 'A starter path for players who are still learning the rules, the kitchen, and basic ball control.',
      focus: ['Understand the court zones and non-volley zone', 'Serve legally and start points calmly', 'Keep the ball in play with simple forehands and backhands', 'Learn doubles scoring and basic court etiquette'],
      skills: ['Serve and return basics', 'Ready position', 'Two-bounce rule', 'Moving to the non-volley zone'],
      drills: ['10 serves to each box', 'Cross-court rally to 20 balls', 'Kitchen-line catch-and-dink drill', 'Score-calling practice with a partner'],
      paddleProfile: 'Forgiving widebody or hybrid paddle with a large sweet spot, medium weight, and soft feel.',
      related: ['pickleball-rules-at-a-glance', 'serve-and-return-basics', 'the-kitchen-non-volley-zone-explained'],
      translations: {
        ko: {
          title: '레벨 2.0: 완전 입문 기초',
          subtitle: '고급 샷보다 코트, 스코어, 서브, 안정적인 랠리 습관을 먼저 익히는 단계입니다.',
          summary: '규칙, 키친, 기본 컨트롤을 배우는 입문자를 위한 출발 경로입니다.',
          focus: ['코트 구역과 논발리존 이해', '합법적인 서브와 침착한 포인트 시작', '간단한 포핸드/백핸드로 공을 살리기', '더블스 스코어와 기본 매너 익히기'],
          skills: ['서브와 리턴 기본', '준비 자세', '투바운스 규칙', '논발리존으로 이동하기'],
          drills: ['각 서브 박스에 10개씩 넣기', '크로스 랠리 20구 이어가기', '키친 라인 캐치-앤-딩크', '파트너와 스코어 콜 연습'],
          paddleProfile: '스위트스팟이 넓고 부드러운 와이드바디 또는 하이브리드형 패들이 좋습니다.'
        },
        es: {
          title: 'Nivel 2.0: base de principiante',
          subtitle: 'Aprende la pista, la puntuación, el saque y hábitos de peloteo seguros antes de buscar golpes avanzados.',
          summary: 'Ruta inicial para aprender reglas, cocina y control básico.',
          focus: ['Entender zonas de la pista y cocina', 'Sacar legalmente y con calma', 'Mantener la bola en juego', 'Aprender puntuación de dobles y etiqueta'],
          skills: ['Saque y resto básicos', 'Posición preparada', 'Regla de dos botes', 'Subir a la zona de no volea'],
          drills: ['10 saques a cada cuadro', 'Peloteo cruzado a 20 bolas', 'Dink con captura en la cocina', 'Practicar cantar el marcador'],
          paddleProfile: 'Pala indulgente widebody o híbrida, punto dulce grande, peso medio y tacto suave.'
        }
      }
    },
    {
      id: '2.5', slug: '2-5', title: 'Level 2.5: Consistency Builder',
      subtitle: 'Reduce easy misses and start choosing safer targets.',
      summary: 'A bridge from beginner rules knowledge to reliable rally construction.',
      focus: ['Make more returns deep', 'Dink without popping the ball up', 'Move with your partner instead of chasing alone', 'Recognise when to reset instead of swinging harder'],
      skills: ['Deep returns', 'Basic dinks', 'Early split step', 'Simple target selection'],
      drills: ['Deep return ladder', '100 soft dinks with a partner', 'Serve-return-plus-one pattern', 'Transition-zone stop drill'],
      paddleProfile: 'Control or all-court paddle with enough forgiveness to protect consistency.',
      related: ['serve-and-return-basics', 'dinking-fundamentals', 'court-etiquette-and-open-play'],
      translations: {
        ko: {
          title: '레벨 2.5: 안정성 만들기',
          subtitle: '쉬운 실수를 줄이고 더 안전한 타깃을 고르기 시작하는 단계입니다.',
          summary: '입문 규칙 이해에서 안정적인 랠리 구성으로 넘어가는 연결 단계입니다.',
          focus: ['리턴을 더 깊게 보내기', '공을 띄우지 않는 기본 딩크', '파트너와 함께 움직이기', '세게 치기보다 리셋할 순간 알아차리기'],
          skills: ['깊은 리턴', '기본 딩크', '초기 스플릿 스텝', '쉬운 타깃 선택'],
          drills: ['깊은 리턴 사다리', '파트너와 부드러운 딩크 100개', '서브-리턴-다음 공 패턴', '전환구역 멈춤 드릴'],
          paddleProfile: '일관성을 지켜주는 컨트롤형 또는 올라운드형 패들이 잘 맞습니다.'
        },
        es: {
          title: 'Nivel 2.5: construir consistencia',
          subtitle: 'Reduce fallos fáciles y empieza a elegir objetivos seguros.',
          summary: 'Puente entre conocer las reglas y construir puntos fiables.',
          focus: ['Restar más profundo', 'Dink sin levantar la bola', 'Moverse con la pareja', 'Reconocer cuándo resetear'],
          skills: ['Restos profundos', 'Dinks básicos', 'Split step temprano', 'Selección simple de objetivos'],
          drills: ['Escalera de restos profundos', '100 dinks suaves', 'Patrón saque-resto-una bola', 'Parada en transición'],
          paddleProfile: 'Pala de control o all-court con perdón suficiente.'
        }
      }
    },
    {
      id: '3.0', slug: '3-0', title: 'Level 3.0: Reliable Rally Player',
      subtitle: 'Build repeatable patterns: serve, return, third shot, and kitchen play.',
      summary: 'For players who can rally but need structure to win more points instead of just keeping the ball alive.',
      focus: ['Use the third shot as a decision point', 'Get to the kitchen under control', 'Dink cross-court with shape and patience', 'Attack obvious high balls without over-hitting'],
      skills: ['Third-shot drop introduction', 'Cross-court dinking', 'Transition resets', 'High-ball putaways'],
      drills: ['Third-shot drop targets', 'Cross-court dink game to 11', 'Drive-drop decision drill', 'Reset from mid-court'],
      paddleProfile: 'All-court paddle: enough control for drops, enough pop for simple putaways.',
      related: ['the-third-shot-drop-explained', 'dinking-fundamentals', 'doubles-positioning-basics'],
      translations: {
        ko: {
          title: '레벨 3.0: 랠리가 되는 플레이어',
          subtitle: '서브, 리턴, 3구, 키친 플레이를 반복 가능한 패턴으로 만듭니다.',
          summary: '공을 넘기는 것은 가능하지만 승점 구조가 필요한 플레이어를 위한 단계입니다.',
          focus: ['3구를 의사결정 지점으로 사용', '통제된 상태로 키친 진입', '크로스 딩크의 궤적과 인내심 만들기', '명확히 높은 공은 과하지 않게 공격'],
          skills: ['3구 드롭 입문', '크로스 딩크', '전환구역 리셋', '높은 공 마무리'],
          drills: ['3구 드롭 타깃', '크로스 딩크 게임 11점', '드라이브/드롭 선택 드릴', '미드코트 리셋'],
          paddleProfile: '드롭 컨트롤과 간단한 마무리 파워를 모두 갖춘 올라운드형 패들이 좋습니다.'
        },
        es: {
          title: 'Nivel 3.0: jugador de peloteo fiable',
          subtitle: 'Crea patrones repetibles: saque, resto, tercer golpe y cocina.',
          summary: 'Para quien pelotea, pero necesita estructura para ganar puntos.',
          focus: ['Usar el tercer golpe como decisión', 'Llegar a la cocina controlado', 'Dink cruzado con forma', 'Atacar bolas altas claras'],
          skills: ['Introducción al tercer golpe drop', 'Dink cruzado', 'Resets en transición', 'Remates de bola alta'],
          drills: ['Objetivos de tercer golpe', 'Juego de dink cruzado', 'Decidir drive/drop', 'Reset desde media pista'],
          paddleProfile: 'Pala all-court con control para drops y pop para cerrar.'
        }
      }
    },
    {
      id: '3.5', slug: '3-5', title: 'Level 3.5: Pattern and Pressure',
      subtitle: 'Turn consistency into pressure with better positioning and shot selection.',
      summary: 'For players ready to convert neutral rallies into advantages with smarter patterns.',
      focus: ['Create pressure without rushing', 'Use speed-ups only when the ball is attackable', 'Hold the kitchen line with compact counters', 'Coordinate middle coverage with your partner'],
      skills: ['Dink patterns', 'Speed-up selection', 'Counter blocks', 'Doubles middle calls'],
      drills: ['Three-dink pattern drill', 'Attackable-ball recognition', 'Hands battle to 7', 'Middle-call shadow drill'],
      paddleProfile: 'Control or spin-focused paddle that rewards placement and quick hands.',
      related: ['dinking-fundamentals', 'the-third-shot-drop-explained', 'doubles-positioning-basics'],
      translations: {
        ko: {
          title: '레벨 3.5: 패턴과 압박',
          subtitle: '더 나은 포지셔닝과 샷 선택으로 안정성을 압박으로 바꿉니다.',
          summary: '중립 랠리를 유리한 상황으로 바꾸는 패턴이 필요한 단계입니다.',
          focus: ['서두르지 않고 압박 만들기', '공격 가능한 공에만 스피드업', '짧은 카운터로 키친 라인 유지', '파트너와 미들 커버 조율'],
          skills: ['딩크 패턴', '스피드업 선택', '카운터 블록', '더블스 미들 콜'],
          drills: ['3개 딩크 패턴 드릴', '공격 가능한 공 구분', '핸즈 배틀 7점', '미들 콜 섀도 드릴'],
          paddleProfile: '배치와 빠른 손을 살릴 수 있는 컨트롤/스핀형 패들이 잘 맞습니다.'
        },
        es: {
          title: 'Nivel 3.5: patrones y presión',
          subtitle: 'Convierte consistencia en presión con mejor posición y selección.',
          summary: 'Para convertir peloteos neutrales en ventaja.',
          focus: ['Crear presión sin precipitarse', 'Speed-up solo con bola atacable', 'Sostener la línea de cocina', 'Coordinar el medio'],
          skills: ['Patrones de dink', 'Selección de speed-up', 'Bloqueos de contra', 'Llamadas de medio'],
          drills: ['Patrón de tres dinks', 'Reconocer bola atacable', 'Batalla de manos a 7', 'Sombra de medio'],
          paddleProfile: 'Pala de control o spin que premie colocación y manos rápidas.'
        }
      }
    },
    {
      id: '4.0', slug: '4-0', title: 'Level 4.0: Advanced Doubles Strategy',
      subtitle: 'Win with resets, counters, pattern recognition, and disciplined partner movement.',
      summary: 'A competitive level where shot quality, recovery, and tactical discipline matter on every rally.',
      focus: ['Reset under pressure', 'Counter speed-ups without over-swinging', 'Use drives to create drops, not just winners', 'Adjust stacking, middle coverage, and target choices'],
      skills: ['Pressure resets', 'Counter exchanges', 'Drive-plus-drop patterns', 'Stacking basics'],
      drills: ['Two-ball reset ladder', 'Counter volley reaction', 'Drive then crash/drop choice', 'Stacking serve-return walkthrough'],
      paddleProfile: 'Stable all-court or control-power hybrid that stays solid on counters.',
      related: ['doubles-positioning-basics', 'the-third-shot-drop-explained', 'how-a-pickleball-tournament-works'],
      translations: {
        ko: {
          title: '레벨 4.0: 고급 더블스 전략',
          subtitle: '리셋, 카운터, 패턴 인식, 파트너 움직임으로 승률을 올립니다.',
          summary: '샷 품질, 회복, 전술적 절제가 매 랠리에서 중요한 경쟁 단계입니다.',
          focus: ['압박 속 리셋', '과한 스윙 없이 스피드업 카운터', '드라이브를 위너가 아니라 드롭 기회로 사용', '스태킹, 미들 커버, 타깃 조정'],
          skills: ['압박 리셋', '카운터 교환', '드라이브+드롭 패턴', '스태킹 기본'],
          drills: ['투볼 리셋 사다리', '카운터 발리 반응', '드라이브 후 전진/드롭 선택', '스태킹 서브-리턴 워크스루'],
          paddleProfile: '카운터 상황에서 흔들리지 않는 안정적인 올라운드 또는 컨트롤-파워 하이브리드가 좋습니다.'
        },
        es: {
          title: 'Nivel 4.0: estrategia avanzada de dobles',
          subtitle: 'Gana con resets, contras, lectura de patrones y movimiento disciplinado.',
          summary: 'Nivel competitivo donde calidad, recuperación y táctica importan en cada punto.',
          focus: ['Reset bajo presión', 'Contrarrestar speed-ups sin exceso', 'Usar drives para crear drops', 'Ajustar stacking y coberturas'],
          skills: ['Resets de presión', 'Intercambios de contra', 'Drive más drop', 'Stacking básico'],
          drills: ['Escalera de reset', 'Reacción de contra volea', 'Drive y elección', 'Recorrido de stacking'],
          paddleProfile: 'Pala all-court estable o híbrida control-potencia.'
        }
      }
    },
    {
      id: '4.5', slug: '4-5', title: 'Level 4.5: Tournament Pressure',
      subtitle: 'Refine decision-making, scouting, and point construction under pressure.',
      summary: 'For advanced players who need fewer loose points and better opponent-specific plans.',
      focus: ['Scout opponent patterns quickly', 'Protect your weakest ball under stress', 'Use serve and return location intentionally', 'Choose when to speed up, lob, reset, or grind'],
      skills: ['Scouting notes', 'Serve-return placement', 'Low-error pressure', 'Tempo changes'],
      drills: ['One-weakness protection games', 'Serve-location scoring', 'Forced reset games', 'Pattern charting from match video'],
      paddleProfile: 'Precise paddle matched to personal style: power only if control stays intact.',
      related: ['how-a-pickleball-tournament-works', 'doubles-positioning-basics', 'how-to-follow-the-global-pickleball-scene'],
      translations: {
        ko: {
          title: '레벨 4.5: 토너먼트 압박',
          subtitle: '압박 상황에서 의사결정, 상대 분석, 포인트 구성을 다듬습니다.',
          summary: '실수를 줄이고 상대별 플랜이 필요한 상급 경쟁자 단계입니다.',
          focus: ['상대 패턴을 빠르게 읽기', '압박 속 약한 공 보호', '서브와 리턴 위치를 의도적으로 사용', '스피드업/랍/리셋/그라인드 선택'],
          skills: ['상대 분석 노트', '서브-리턴 배치', '저실수 압박', '템포 변화'],
          drills: ['약점 보호 게임', '서브 위치 점수화', '강제 리셋 게임', '경기 영상 패턴 기록'],
          paddleProfile: '자신의 스타일에 정확히 맞는 패들. 파워는 컨트롤이 무너지지 않을 때만 우선합니다.'
        },
        es: {
          title: 'Nivel 4.5: presión de torneo',
          subtitle: 'Refina decisiones, scouting y construcción de puntos bajo presión.',
          summary: 'Para avanzados que necesitan menos puntos regalados y mejores planes.',
          focus: ['Leer patrones rivales', 'Proteger la bola débil', 'Usar ubicación de saque/resto', 'Elegir speed-up, lob, reset o grind'],
          skills: ['Notas de scouting', 'Colocación saque-resto', 'Presión con bajo error', 'Cambios de tempo'],
          drills: ['Juegos protegiendo debilidad', 'Saque por ubicación', 'Resets forzados', 'Charting de vídeo'],
          paddleProfile: 'Pala precisa para tu estilo; potencia solo si no rompe el control.'
        }
      }
    },
    {
      id: '5.0', slug: '5-0', title: 'Level 5.0: Pro-Pattern Study',
      subtitle: 'Study elite patterns, punish small openings, and manage momentum across matches.',
      summary: 'For highly competitive players studying pro-level decision trees and match plans.',
      focus: ['Turn small pop-ups into percentage attacks', 'Change patterns before opponents adjust', 'Use video analysis to refine habits', 'Manage momentum, timeouts, and match rhythm'],
      skills: ['Pro pattern study', 'Counter-disguise', 'Advanced partner systems', 'Video review workflow'],
      drills: ['Clip tagging and review', 'Two-pattern alternation', 'Disguise-to-counter drill', 'Pressure games from 8-8'],
      paddleProfile: 'Performance paddle chosen by exact play style, tournament approval status, and comfort over long matches.',
      related: ['how-to-follow-the-global-pickleball-scene', 'doubles-positioning-basics', 'the-third-shot-drop-explained'],
      translations: {
        ko: {
          title: '레벨 5.0: 프로 패턴 연구',
          subtitle: '엘리트 패턴을 분석하고 작은 기회를 응징하며 경기 흐름을 관리합니다.',
          summary: '프로 수준의 의사결정 트리와 경기 플랜을 연구하는 고경쟁 단계입니다.',
          focus: ['작은 팝업을 확률 높은 공격으로 전환', '상대가 적응하기 전에 패턴 변경', '영상 분석으로 습관 다듬기', '모멘텀, 타임아웃, 경기 리듬 관리'],
          skills: ['프로 패턴 연구', '카운터 위장', '고급 파트너 시스템', '영상 리뷰 워크플로'],
          drills: ['클립 태깅과 리뷰', '두 패턴 교차', '위장 후 카운터 드릴', '8-8 압박 게임'],
          paddleProfile: '플레이 스타일, 승인 상태, 긴 경기의 편안함까지 고려해 고성능 패들을 선택합니다.'
        },
        es: {
          title: 'Nivel 5.0: estudio de patrones pro',
          subtitle: 'Estudia patrones élite, castiga pequeñas aperturas y gestiona el ritmo.',
          summary: 'Para jugadores muy competitivos que estudian decisiones y planes pro.',
          focus: ['Convertir pop-ups pequeños', 'Cambiar patrones antes del ajuste rival', 'Usar análisis de vídeo', 'Gestionar momentum y ritmo'],
          skills: ['Patrones pro', 'Disfraz de contra', 'Sistemas avanzados de pareja', 'Flujo de revisión de vídeo'],
          drills: ['Etiquetar clips', 'Alternar dos patrones', 'Disfraz a contra', 'Juegos desde 8-8'],
          paddleProfile: 'Pala de rendimiento elegida por estilo, aprobación y comodidad.'
        }
      }
    }
  ];
}));
