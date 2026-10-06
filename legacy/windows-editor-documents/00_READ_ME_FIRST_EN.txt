Picklary Lite v0.7.5 EN — Fully Integrated Windows Edition

QUICK START
1. Extract the ZIP file completely to a new folder.
2. Double-click 00_RUN_PICKLARY_LITE_WINDOWS.bat.
3. Use Clip Editor / DualCam Composer at the top to switch modes in the same window.

WHAT CHANGED IN v0.7.5
- Fixed a Windows-native video surface issue that could cover the DualCam play controls and timelines after both videos were loaded.
- DualCam now uses QVideoSink frame canvases, keeping video and controls in the same Qt layout.
- Added vertical scrolling to the full DualCam page so all controls remain reachable on smaller or high-DPI displays.
- A: Video 1 (Left/Top in Output)
- B: Video 2 (Right/Bottom in Output)

DUALCAM AUDIO AUTO-SYNC
- Load both videos and click Find Start Points from Audio.
- Picklary detects a shared sound section and estimates the recording offset.
- Review and apply the suggested start points, or keep using manual start-point controls.

CORE FEATURES
- Drag-and-drop replacement in Clip Editor and DualCam Composer
- Active DualCam video only: play/pause and -3, -1, +1, +3 second seeking
- Defaults: Horizontal layout and 4K output
- Vertical / Horizontal output filenames
- Open a composed result directly in Clip Editor
- NVIDIA NVENC first with automatic CPU fallback
- Local processing; source videos are not uploaded

GPU CHECK
Run 02_GPU_DIAGNOSIS_WINDOWS.bat.
