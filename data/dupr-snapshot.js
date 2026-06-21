/* DUPR reference for player profiles.
 *
 * IMPORTANT: We intentionally do NOT ship specific DUPR numbers here.
 * DUPR ratings change every time match results are processed, and reproducing
 * precise figures we cannot continuously verify would risk being inaccurate
 * (and is exactly the kind of unverifiable "live stat" that hurts trust and
 * AdSense review). Instead, player pages link to the official DUPR rankings.
 *
 * If you ever want to show a value, add it ONLY after confirming it on the
 * official source, e.g.:
 *   'Ben Johns': { doubles: 7.1, singles: 6.6 }
 * and keep the official link visible. Leave this empty to stay verify-at-source.
 */
module.exports = {
  updated: '',
  checked: '',
  sourceName: 'DUPR rankings',
  sourceUrl: 'https://www.dupr.com/rankings',
  ratings: {}
};
