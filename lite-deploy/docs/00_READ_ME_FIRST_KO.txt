Picklary Lite v0.7.5 완전 통합 Windows 버전

실행
1. ZIP 압축을 완전히 풉니다.
2. 00_RUN_PICKLARY_LITE_WINDOWS.bat 파일을 실행합니다.
3. 상단의 Clip 편집 / DualCam 합치기 버튼으로 같은 창에서 모드를 바꿉니다.

v0.7.5 수정 사항
- DualCam에서 두 영상을 불러온 뒤 영상 표면이 재생 버튼과 타임라인을 덮는 Windows 네이티브 출력 문제를 수정했습니다.
- DualCam도 QVideoSink 프레임 캔버스를 사용하여 영상과 조작부가 같은 Qt 레이아웃 안에서 렌더링됩니다.
- DualCam 전체 페이지에 세로 스크롤을 추가해 작은 화면이나 높은 DPI에서도 모든 조작부에 접근할 수 있습니다.
- A: 1번 영상(출력시 좌측/상단)
- B: 2번 영상(출력시 우측/하단)

DualCam 사운드 자동 정렬
- 두 영상을 불러온 뒤 '사운드로 시작점 자동 찾기'를 누릅니다.
- 공통 소리 구간을 찾아 녹화 시간차와 권장 시작점을 계산합니다.
- 결과를 확인한 뒤 적용하거나 기존 수동 시작점 기능을 사용할 수 있습니다.

기존 주요 기능
- Clip과 DualCam 모두 드래그앤드롭 영상 교체
- 활성 DualCam 영상만 재생/정지 및 -3초, -1초, +1초, +3초 이동
- 기본값: 좌우(Horizontal), 4K
- 결과 파일명: Vertical 또는 Horizontal
- 합성 결과를 Clip 편집으로 바로 전달
- NVIDIA NVENC 우선, 실패 시 CPU 자동 전환

GPU 확인
02_GPU_DIAGNOSIS_WINDOWS.bat을 실행합니다.
