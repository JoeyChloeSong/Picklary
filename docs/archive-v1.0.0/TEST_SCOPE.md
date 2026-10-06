# 검사 범위와 한계

## 자동 정적 검사
- 소스에서 76개 HTML, 66개 indexable URL 생성
- 내부 href/src 및 앵커, canonical/hreflang, 중복 제목, sitemap, JSON-LD
- 대상명-이미지 등록부의 일관성, 기존 로컬 이미지의 중복 해시
- 결과 행 구조, 우승자 기준 게임 점수, 미확인 값의 비어 있음, 시리즈/게임 구분
- 정확한 경로 기준 이전 URL 110개와 목적지
- 광고 요청 스크립트 부재, 공개 디렉터리에서 data/legacy/admin 제외
- 해시 이름의 CSS/JS와 정상 404 구조

이 검사는 **이미지를 시각적으로 식별하는 검사 또는 기사 내용을 자동으로 사실 확인하는 검사**가 아닙니다. 정확한 사진 선택과 출처 대조는 별도 편집 과정입니다.

## 실제 수행한 화면/동작 검사
Python Playwright + Chromium에서 1440, 768, 390, 360px 화면을 사용했습니다. 핵심 12경로의 가로 넘침, 헤더 위치, 일정 통계/본문 관계, 제품 사진/설명 분리를 검사했습니다. 메뉴/Escape, 검색/초기화/브랜드, 3제품 비교, 연습 점검, 로컬 영상 재생과 시간 캡처, 노트 저장·불러오기·삭제, CSV/JSON 내보내기, HTML 주입 방지, CSV 수식 주입 방지를 검사했습니다.

## 제작 환경 제한을 명시합니다
관리형 Chromium은 URL 탐색을 차단합니다. 정책을 변경하지 않고 **생성된 로컬 HTML/CSS/JavaScript를 about:blank에 주입**하여 레이아웃과 상호작용을 검사했습니다. HTTP 응답은 별도 로컬 Node 서버로 검사했습니다.

about:blank의 불투명 출처에서는 native localStorage에 접근할 수 없으므로, **저장 테스트에는 명시적인 메모리 테스트 대역을 사용했습니다.** 이는 실제 운영 도메인에서의 브라우저 저장 지속성을 검증한 것이 아닙니다.

외부 네트워크 요청을 차단한 상태로 검사했습니다. 따라서 화면 사진에는 로컬 이미지 17개와, 외부 이미지의 실패 안내가 보일 수 있습니다. **31개 외부 사진의 운영 환경 로딩 성공을 이 검사로 주장하지 않습니다.** 전체 원본 사진 URL은 `data/media.json`에 있으며 배포 후 `npm run check:live -- <주소> --images`로 검사하세요.

## 재실행
일반 네트워크/브라우저 환경:
```bash
python -m pip install playwright beautifulsoup4
python scripts/browser-audit.py
```

현재처럼 관리형 탐색 제한이 있는 환경:
```bash
python scripts/browser-audit.py --offline-render
```

Linux 기본 Chromium 경로는 `/usr/bin/chromium`입니다. 다른 환경에서는 `CHROMIUM_PATH`를 지정하세요. 샘플 영상 테스트에는 ffmpeg가 필요합니다. 필수 빌드 검사인 `npm run check`에는 Python·브라우저·ffmpeg가 필요하지 않습니다.

## 증빙 파일
`npm run check`는 `test-results/audit.json`, 화면 검사는 `test-results/browser-audit.json`과 스크린샷을 생성합니다. 배포의 최종 성공, 실서비스 로그, Google 승인, 사진 이용권은 별도 확인 대상입니다.
