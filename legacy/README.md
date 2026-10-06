# Preserved legacy source — not published by the new build

This folder preserves the v0.8.4-era browser video editor and editorial data so
nothing depends on rebuilding them from memory. It is NOT copied into `dist/`.

The old editor loads FFmpeg/fflate from remote CDNs and advertises a Windows
application whose binary was absent from the supplied website source. Its
export path has not been end-to-end verified in this environment. Do not expose
it as a fully tested service without testing its worker/import chain, codecs,
memory limits, save/cancel paths and external-code privacy disclosure.

The old data includes unsupported numeric rankings/ratings and faulty image
associations. It is a recovery reference, not a trusted publication source.
Review and source-check any content before migrating it into `data/`.

Public `/clip-lite/` links now lead to the new local-video worksheet, which
explicitly exports notes only. This is a deliberate public-feature reduction;
do not describe the worksheet as an MP4 editor or AI Vision Rating.
