# Picklary Tour Board + Clip Lite Web Restore v0.2.0

## Requested behavior restored

- Opening `/` immediately routes to the English home page at `/en/`.
- The language-selection landing page is no longer used.
- `/clip-lite/en/` is the directly runnable English browser editor.
- `/clip-lite/` is the directly runnable Korean browser editor.
- The established Clip Lite page composition is retained: navy/mint hero, large left video workspace, right two-step panel, value strip, Web/Windows guidance, and explanatory cards.
- Windows Picklary Lite v0.7.5 remains available separately at `/picklary-lite/en/` and `/picklary-lite/ko/`.
- The Tour Board expansion remains integrated with the existing Pro Scene URLs.

## Browser editor functions

- Drag/drop and file selection
- Browser-local video preview
- -5/-3/-1 and +1/+3/+5 second seeking
- IN/OUT marking and direct time entry
- Multiple clip list with preview and delete
- Combined MP4, separate MP4 ZIP, or both
- Browser-local FFmpeg processing; source video is not uploaded to Picklary

## Build and validation

- `npm run build`
- JavaScript syntax checks
- Internal static-link validation
- Windows-safe source packaging
- ZIP integrity checks

Browser codec support varies. HEVC/H.265, HDR, long, or large 4K video should use the Windows v0.7.5 package.
