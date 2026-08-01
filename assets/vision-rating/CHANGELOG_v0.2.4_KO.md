# Picklary Vision Rating Local Web v0.2.4 변경사항

## `Failed to fetch` 연결 중단 대응

- 로컬 분석 엔진을 명령창에 종속된 전경 프로세스가 아니라 백그라운드 프로세스로 실행합니다.
- 감시 프로세스가 로컬 서버의 비정상 종료를 감지하면 자동으로 재시작합니다.
- 브라우저가 API 연결을 일시적으로 잃으면 작업 조회·설정·분석 시작 요청을 자동 재시도합니다.
- 연결이 복구되면 동일한 작업 ID를 다시 조회해 진행 상태를 이어갑니다.
- 연결이 끝내 복구되지 않으면 `분석 재개` 버튼을 표시합니다.

## 네이티브 추론 격리 강화

- 본 분석뿐 아니라 코트·선수 자동 인식도 별도 자식 프로세스에서 실행합니다.
- DirectML 또는 OpenCV 네이티브 오류가 발생해도 로컬 API 서버가 함께 종료되지 않도록 분리했습니다.
- 작업별 `worker.lock`과 heartbeat를 추가해 서버 재시작 후 분석 작업이 중복 실행되는 것을 방지합니다.

## 진단 로그

- `logs/local_server.log`
- `logs/local_server_fault.log`
- `logs/watchdog.log`
- 작업별 `worker_console.log`
- 작업별 `auto_setup_console.log`

`Picklary_Vision_Rating.cmd --logs`로 로그 폴더를 바로 열 수 있습니다.

## 단일 실행파일 통합

- 최초 설치와 이후 실행 모두 `Picklary_Vision_Rating.cmd` 하나만 사용합니다.
- 실행 시 환경이 없으면 자동 설치하고, 이미 준비되어 있으면 바로 로컬 엔진과 브라우저를 엽니다.
- 기존 여러 CMD 파일은 배포판에서 제거했습니다.
