# Picklary v1.2.2

## GitHub / Netlify

GitHub에는 SOURCE ZIP을 압축 해제한 내용을 저장소 최상위에 올리세요.
`package.json`, `public/`, `scripts/`, `data/`, `templates/`, `design/`, `.github/`를 함께 포함해야 합니다.

```text
Node: 22
Build command: npm run check
Publish directory: dist
Base directory: (empty)
```

NETLIFY_PREVIEW ZIP은 빌드된 배포본입니다. 압축 해제 후 `index.html`이 바로 보이는 폴더를 배포하세요.

## 변경 범위

기존 메뉴 이미지에서 그림 영역을 나누어 크게 배치했습니다. 모바일은 이미지와 짧은 메뉴명의 2열 구조입니다.
메뉴 버튼과 링크는 이미지 속 그림이 아닌 실제 HTML입니다.

자가진단 문항·계산식, 영상 편집 엔진, 주요 콘텐츠 데이터는 유지했습니다.
경기 결과 기준일은 2026-10-04 그대로입니다.

Vision Rating / Windows 전체 프로그램 ZIP은 이번 파일에도 포함되어 있지 않습니다.
실제 브라우저 MP4 출력과 외부 사진 로딩은 배포 후 별도 확인이 필요합니다.

검사 내역: `docs/RELEASE_AUDIT.md` / `docs/verification/v1.2.2/`
화면 미리보기: `docs/preview/`
