# Picklary Lite v0.7.5 EN — Acceptance Report

## Delivered changes

1. Reworked DualCam preview rendering so loaded video surfaces cannot cover playback controls or timelines.
2. Renamed both video cards according to their output positions.
3. Applied the same processing structure to Korean and English Windows editions.
4. Prepared a Netlify deployment package containing both downloads.

## Technical change

The former DualCam preview used `QVideoWidget`, which can create a native Windows child surface. In a unified, scrollable, high-DPI window with two simultaneous video surfaces, native Z-order can place the video surface above ordinary Qt controls.

v0.7.5 receives frames through `QVideoSink` and paints them on regular `QWidget` canvases. Video, play controls, and timelines now share one Qt layout and Z-order. The complete DualCam page is also vertically scrollable.

## Automated verification

- Python compileall: passed
- Korean unit and contract tests: 48 passed
- English unit and contract tests: 48 passed
- No DualCam QVideoWidget import: passed
- QVideoSink frame connection and frame reset on file replacement: passed
- New A/B output-position labels: passed
- Existing audio auto-sync, Horizontal/4K defaults, NVENC/CPU fallback, and Clip Editor handoff contracts: passed

## Limitation

The build environment does not include the Windows PySide6 GUI runtime or an NVIDIA GPU. Visual Windows playback verification must therefore be completed on the target PC after extracting the package to a new folder.
