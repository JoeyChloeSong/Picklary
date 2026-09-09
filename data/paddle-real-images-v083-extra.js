module.exports = function applyExtraPaddleRealImages(paddles) {
  const map = {
    'selkirk-luxx-control-air': {
      image: '/assets/img/paddles-real/selkirk-luxx-control-air.png',
      imageAlt: 'Selkirk LUXX Control Air actual product image', imageCredit: 'Web reference', imageSourceUrl: 'https://www.selkirk.com/'
    },
    'selkirk-omni': {
      image: '/assets/img/paddles-real/selkirk-omni.png',
      imageAlt: 'Selkirk Omni actual product image', imageCredit: 'Web reference', imageSourceUrl: 'https://www.selkirk.com/'
    },
    'six-zero-double-black-diamond-control': {
      image: '/assets/img/paddles-real/six-zero-double-black-diamond-control.png',
      imageAlt: 'Six Zero Double Black Diamond actual product image', imageCredit: 'Web reference', imageSourceUrl: 'https://www.sixzeropickleball.com/'
    },
    'franklin-c45': {
      image: '/assets/img/paddles-real/franklin-c45.png',
      imageAlt: 'Franklin C45 actual product image', imageCredit: 'Web reference', imageSourceUrl: 'https://franklinsports.com/'
    }
  };
  for (const p of paddles || []) {
    if (p && p.slug && map[p.slug] && (!p.image || /\/assets\/img\/paddles\/.+\.svg$/i.test(String(p.image)))) Object.assign(p, map[p.slug]);
  }
  return paddles;
};
