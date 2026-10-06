# Native application staging

No native programs were included in the supplied website ZIP.
Do not put documentation bundles here as installers.

Use `npm run release:register -- --id ... --file ... --version ... --reviewed` after operator testing. See the main README.
Only registry entries with reviewed=true, matching bytes and SHA256 are published by the build.
Do not add credentials, personal source videos or unlicensed model weights.
