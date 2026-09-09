module.exports = function applyPlayerRealImages(players) {
  const map = {
    'ben-johns': { image: '/assets/img/players-real/ben-johns.png', imageAlt: 'Ben Johns headshot' },
    'anna-leigh-waters': { image: '/assets/img/players-real/anna-leigh-waters.png', imageAlt: 'Anna Leigh Waters headshot' },
    'federico-staksrud': { image: '/assets/img/players-real/federico-staksrud.png', imageAlt: 'Federico Staksrud headshot' },
    'jw-johnson': { image: '/assets/img/players-real/jw-johnson.png', imageAlt: 'JW Johnson headshot' },
    'catherine-parenteau': { image: '/assets/img/players-real/catherine-parenteau.png', imageAlt: 'Catherine Parenteau headshot' },
    'anna-bright': { image: '/assets/img/players-real/anna-bright.png', imageAlt: 'Anna Bright headshot' },
    'tyson-mcguffin': { image: '/assets/img/players-real/tyson-mcguffin.png', imageAlt: 'Tyson McGuffin headshot' },
    'riley-newman': { image: '/assets/img/players-real/riley-newman.png', imageAlt: 'Riley Newman headshot' },
    'james-ignatowich': { image: '/assets/img/players-real/james-ignatowich.png', imageAlt: 'James Ignatowich headshot' },
    'christian-alshon': { image: '/assets/img/players-real/christian-alshon.png', imageAlt: 'Christian Alshon headshot' },
    'lea-jansen': { image: '/assets/img/players-real/lea-jansen.png', imageAlt: 'Lea Jansen headshot' },
    'lucy-kovalova': { image: '/assets/img/players-real/lucy-kovalova.png', imageAlt: 'Lucy Kovalova headshot' }
  };
  for (const p of players || []) {
    if (p && p.slug && map[p.slug]) Object.assign(p, map[p.slug]);
  }
  return players;
};
