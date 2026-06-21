# PickleLevel 자동 업데이트 에이전트 운영 가이드

이 폴더는 PickleLevel 사이트 운영자가 뉴스, 대회 일정/결과, 국내 대회, 신규 패들, 리뷰어 점수, PPA/MLP/UPA-A 규정, USA Pickleball 패들 승인/ban 관련 정보를 **자동으로 감지하고 검수용 초안으로 만드는** 기능입니다.

## 핵심 원칙

AdSense 승인과 장기 운영 안정성을 위해 이 에이전트는 기본적으로 **완전 자동 게시**를 하지 않습니다.

1. 공식/허용 출처를 확인합니다.
2. 변경 신호를 감지합니다.
3. OpenAI API 키가 있으면 한국어 초안을 생성합니다.
4. 운영자가 초안을 확인합니다.
5. 승인한 초안만 공개 업데이트 센터에 반영합니다.

이 구조는 다음 리스크를 줄입니다.

- 잘못된 경기 결과, 랭킹, 대회 일정 게시
- 특정 패들 ban/승인 여부를 잘못 안내하는 문제
- 원문 기사나 리뷰 텍스트를 과도하게 복사하는 저작권 문제
- 미검수 자동 생성 콘텐츠로 인한 AdSense 품질 저하

## 파일 구성

```text
automation/
├── picklelevel-agent.js           # 자동 감지 + OpenAI 초안 생성 + 승인/게시 변환
├── sources.json                   # 모니터링 출처 목록
├── reviewer-score-template.csv    # 패들 리뷰 점수 수동 입력 템플릿
└── README_AGENT.md                # 이 문서

data/agent/
├── drafts/                        # 검수 전 초안
├── approved/                      # 승인된 초안
├── archive/                       # 승인/처리 후 보관
└── source-state.json              # 출처별 변경 감지 해시

data/auto-updates.js              # 사이트 업데이트 센터에 실제 표시되는 데이터
```

## 로컬 실행 명령

현재 프로젝트 폴더에서 실행합니다.

```powershell
npm run agent:status
```

등록된 출처와 초안 개수를 확인합니다.

```powershell
npm run agent:scan
```

출처를 확인하고 변경이 있으면 `data/agent/drafts/`에 초안을 생성합니다.

```powershell
npm run agent:publish
npm run build
```

승인된 초안을 `data/auto-updates.js`에 반영하고 사이트를 다시 빌드합니다.

## OpenAI API 연결

OpenAI API를 사용하려면 프로젝트 루트에 `.env` 파일을 만들고 아래 값을 설정합니다.

```text
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.5
```

Windows PowerShell에서 일시적으로만 설정하려면:

```powershell
$env:OPENAI_API_KEY="sk-..."
$env:OPENAI_MODEL="gpt-5.5"
npm run agent:scan
```

API 키가 없으면 에이전트는 보수적인 초안만 만들고, 사람이 직접 요약문을 작성하도록 안내합니다.

## 초안 승인 방법

초안 파일을 열어서 다음을 확인하세요.

- 원문 링크가 정확한가?
- 경기 결과, 점수, 일정, 참가 선수, 패들 승인 여부가 원문에서 확인되는가?
- 원문 문장을 길게 복사하지 않았는가?
- 사용자가 행동해야 할 내용이 명확한가?
- 이미 사이트에 있는 선수/패들/레벨 페이지도 수정해야 하는가?

확인 후 승인:

```powershell
node automation/picklelevel-agent.js --approve data/agent/drafts/파일명.json
npm run agent:publish
npm run build
```

## GitHub Actions 자동 실행

`.github/workflows/picklelevel-agent.yml`가 포함되어 있습니다. GitHub 저장소에 올린 후 아래 Secret을 설정하면 매일 자동으로 초안 생성 PR을 만들 수 있습니다.

```text
OPENAI_API_KEY
OPENAI_MODEL
```

`OPENAI_MODEL`은 사용 가능한 모델명으로 바꿀 수 있습니다.

## 출처 추가 방법

`automation/sources.json`에 항목을 추가합니다.

권장 출처 유형:

- 공식 단체: PPA, MLP, UPA-A, USA Pickleball, DUPR
- 국내 공식/준공식: 대한피클볼협회, 국내 대회 플랫폼
- 브랜드 공식 페이지: 신규 패들 출시 확인용
- 리뷰어: 사용 허가 또는 공정 이용 범위 내에서 링크와 점수만 인용

주의:

- 기사 본문을 복사하지 마세요.
- 유료/로그인/약관상 금지된 페이지를 크롤링하지 마세요.
- 리뷰 점수는 직접 만들지 말고, 출처가 있는 점수만 입력하세요.
- 패들 ban/승인 여부는 반드시 공식 목록에서 최종 확인하세요.

## AdSense 운영 팁

업데이트 센터는 정보 가치가 높지만, 검수되지 않은 자동 생성 글이 많아지면 품질 리스크가 생깁니다. 따라서 초기에는 다음 기준을 권장합니다.

- 자동 감지: 켜기
- 자동 초안: 켜기
- 자동 게시: 끄기
- 고위험 주제(패들 ban, 룰 변경, 선수 부상, 대회 결과): 반드시 수동 승인
- 광고: 업데이트 센터에는 승인 후 안정화되기 전까지 과도하게 넣지 않기
