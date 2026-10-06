# v1.2.2 test scope

The Node build/reference and unit tests execute on the generated website. Image hashes verify both committed WebP sizes and their source-crop provenance. All original engine/template/content files in the preservation manifest are compared byte-for-byte with v1.2.1.

The new image/menu audit renders shipped HTML/CSS/JS in Chromium at widths 1440, 1024, 768, 390, and 360, in Korean and English. Local images are embedded as data URLs, CSS/JS are injected without changing browser URL-navigation policy, and external requests are blocked. Image decode and screenshot capture are awaited. Srcset variants are checked for existence, dimensions and hashes; the render harness uses the large candidate, so it is not a bandwidth or live srcset-selection test.

The existing tool browser test exercises actual synthetic local H.264 video preview, IN/OUT cuts, deletion, JSON export and quiz interaction. A test adapter is used only for encoder failure/cancellation. localStorage is an explicit in-memory stand-in. These tests do NOT establish real WASM/MP4 output, persistent browser storage in production, actual desktop app execution, third-party photo uptime, copyright permissions, live Netlify deployment, or AdSense approval.

Screenshots in docs/preview are generated from this release. Earlier snapshots/reports, where retained, are historical rather than a new test run.
