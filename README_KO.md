# Picklary v1.2.0 — 비주얼 메뉴 개편본

**v1.1.0의 자가진단·웹 편집기·Vision 안내·다운로드 구조를 유지한 화면 개편판입니다.**
브라우저에서 실행되는 기능과 별도 프로그램이 필요한 기능을 구분해서 표시합니다.

## 시작
ZIP을 압축 해제한 내용을 GitHub 저장소 최상위에 올리세요.
`package.json`, `netlify.toml`, `data/`, `public/`, `scripts/`, `templates/`, `.github/`가 최상위에 있어야 합니다.

Netlify 설정:
```text
Build command: npm run check
Publish directory: dist
Node: 22
Base directory: 비워 두기
```

로컬:
```sh
npm ci --ignore-scripts
npm run check
npm run serve
```
`http://127.0.0.1:8080/ko/` 또는 `/en/`에서 확인합니다. HTML을 더블클릭해서 열지 마세요.

## 무엇이 바뀌었나요?
- 상단 메뉴: 아이콘+텍스트, 현재 위치 표시
- 홈: 기능별 개념도·사진을 사용한 6개 카드, 자가진단·편집·Vision 바로가기
- Gear Lab: 사진 카테고리, 브랜드 칩, 연속 갤러리, 검색·선택 상태 동기화
- Tour Board: 카드 안의 종목 탭, 우승/준우승, 게임별 점수, 일부 결과·미확인 상태
- 모바일: 2열 카드와 하단 빠른 이동. 자가진단·편집 작업 화면은 하단 메뉴 제외
- Learn: 기존 9개 가이드에 패턴 개념도 추가

## 무엇이 바뀌지 않았나요?
기존 계산식, 32개 문항, 편집 엔진, 실제 경기 결과·랭킹·제품 데이터 등 18개 파일은 v1.1.0과 동일합니다.
콘텐츠 기준일은 2026-10-04이며 이번 작업은 대회 결과 업데이트가 아닙니다.

Vision 전체 프로그램과 Windows 프로그램 ZIP은 이 사이트 소스에 포함되어 있지 않습니다.
실제 프로그램 파일을 검토한 뒤 등록하세요:
```sh
npm run release:register -- --id vision-ko --file /path/to/Vision_KO.zip --version 0.2.4 --reviewed
npm run release:register -- --id windows-editor --file /path/to/Windows.zip --version 0.9.8 --reviewed
npm run check
```
영문 Vision은 `--id vision-en`입니다.

## 영상 추출 및 이미지
브라우저 인코딩 코어는 최초 추출 시 별도 다운로드합니다. 최종 MP4 출력은 Preview에서 짧은 영상으로 확인하세요.
`npm run engine:cache`와 GitHub의 선택형 인코더 검사 워크플로우는 유지되어 있습니다.
로컬 사진은 17개이며 31개는 외부 출처를 참조합니다. 외부 사진이 불러와지지 않으면 같은 인물/제품이 아닌 사진으로 대체하지 않습니다.
사진 이용권 문서 확보와 외부 이미지 가용성은 별도 확인 사항입니다.

개편안: `docs/VISUAL_UX_V1_KO.md`
검증 결과: `docs/RELEASE_AUDIT.md`
검사 범위: `docs/TEST_SCOPE.md`
