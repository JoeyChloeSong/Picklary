# Picklary Clip Lite v0.4 구현 및 검증 보고서

## 웹 버전
- 자동 프록시 변환 제거
- 원본 Object URL 직접 재생
- 15초 지연 또는 실제 오류 시 수동 호환 변환 안내
- 사용자가 요청한 경우에만 FFmpeg WebAssembly 로드
- Node 단위 테스트 5건 통과
- Vite production build 통과

## 로컬 네이티브 버전
- QMediaPlayer + QVideoWidget + QAudioOutput 적용
- QUrl.fromLocalFile로 원본 경로 직접 연결
- I/O 방식 복수 구간 지정
- 통합본/개별본/둘 다 내보내기
- Python 단위 테스트 4건 통과
- Qt offscreen UI smoke test 통과
- 4초 H.264/AAC 테스트 영상 로딩 및 2개 구간 export 검증 통과

## 제한사항
- 웹 브라우저가 지원하지 않는 HEVC/H.265는 사용자가 호환 미리보기 생성을 선택해야 합니다.
- 네이티브 Windows 버전의 HEVC 지원은 Windows에 설치된 Media Foundation/HEVC 코덱에 따릅니다.
- 네이티브 소스 실행본은 최초 실행 시 PySide6 설치가 필요할 수 있습니다.
- Windows EXE는 Windows 환경에서 BUILD_EXE_WINDOWS.bat로 생성할 수 있습니다.
