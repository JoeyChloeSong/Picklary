Picklary v0.5.12.5 GitHub 패치 적용 방법

1. 기존 GitHub 로컬 저장소의 .git 폴더는 유지합니다.
2. 이 ZIP의 Picklary 폴더 안 파일을 기존 저장소 최상위에 덮어씁니다.
3. GitHub Desktop에서 변경 내역을 확인합니다.
4. 커밋 후 Push origin을 실행합니다.
5. Netlify 배포 완료 후 브라우저에서 새로고침합니다.

수정 원인
- 기존 /assets/css/style.css URL이 장기 immutable 캐시되어 새 버튼 CSS가 반영되지 않았습니다.
- CSS URL 버전을 picklary-0.5.12.5-20260716으로 변경했습니다.
- /assets/css/* 경로는 이후 배포 때 재검증하도록 Netlify 헤더를 추가했습니다.

변경 결과
- Find people to play with 버튼: 옐로-오렌지-코랄 그라데이션 pill 버튼
- 연결 주소: /en/boards/friends/
- 한국어 연결 주소: /ko/boards/friends/
