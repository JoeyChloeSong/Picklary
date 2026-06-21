/* Starter highlight leaderboard examples for the static demo page. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SITE_HIGHLIGHTS = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  return [
    { title: '3.0 reset rally under pressure', level: '3.0', skill: 'reset', votes: 128, note: 'Good example of staying low in transition.' },
    { title: 'Best 3rd-shot drop of the week', level: '3.5', skill: 'third-shot drop', votes: 114, note: 'Soft landing into the kitchen with time to move up.' },
    { title: 'Fast-hands kitchen exchange', level: '4.0', skill: 'hands battle', votes: 101, note: 'Compact counters and no backswing.' },
    { title: 'Beginner serve consistency challenge', level: '2.5', skill: 'serve', votes: 86, note: 'Useful for newer players building rhythm.' }
  ];
}));
