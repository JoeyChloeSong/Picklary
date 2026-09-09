'use strict';
module.exports = function applyRealPaddleImages(paddles) {
  const map = {
    'joola-ben-johns-perseus': {
      image: 'https://joola.com/cdn/shop/files/JOOLA_WBG_2025_ProIV_Perseus-Perseus16mm-02.jpg?v=1788364348&width=900',
      imageAlt: 'JOOLA Ben Johns Perseus Pro IV 16mm actual product image', imageCredit: 'JOOLA', imageSourceUrl: 'https://joola.com/'
    },
    'joola-scorpeus': {
      image: 'https://joola.com/cdn/shop/files/JOOLA_WBG_2025_ProIV_Scorpeus-Scorpeus16mm-01.jpg?v=1788364405&width=900',
      imageAlt: 'JOOLA Collin Johns Scorpeus Pro IV 16mm actual product image', imageCredit: 'JOOLA', imageSourceUrl: 'https://joola.com/collections/pro-iv/products/joola-scorpeus-iv-16mm-pickleball-paddle'
    },
    'six-zero-double-black-diamond-control': {
      image: 'https://www.sixzeropickleball.com/cdn/shop/files/Double-Black-Diamond-Control-Six-Zero-417078952.png?v=1771375300&width=1080',
      imageAlt: 'Six Zero Double Black Diamond Control actual product image', imageCredit: 'Six Zero', imageSourceUrl: 'https://www.sixzeropickleball.com/'
    },
    'six-zero-ruby': {
      image: 'https://www.sixzeropickleball.com/cdn/shop/files/Ruby-Six-Zero-152745783_6c0f8641-6bfb-4cde-a761-5df8e3c6b6c6.png?v=1759968037&width=1080',
      imageAlt: 'Six Zero Ruby actual product image', imageCredit: 'Six Zero', imageSourceUrl: 'https://www.sixzeropickleball.com/'
    },
    'paddletek-bantam-tko-c': {
      image: 'https://www.paddletek.com/cdn/shop/files/Paddletek_Bantam_TKO-C_Ocean_14.3_Front.png?v=1763067437&width=1200',
      imageAlt: 'Paddletek Bantam TKO-C actual product image', imageCredit: 'Paddletek', imageSourceUrl: 'https://www.paddletek.com/'
    },
    'selkirk-project-boomstik': {
      image: 'https://www.selkirk.com/cdn/shop/files/vertical_1500x2000-PDP-Labs-Boomstik-Elongated-Pickleball-Paddle-01x.jpg?v=1787102091&width=900',
      imageAlt: 'Selkirk LABS Project Boomstik Elongated actual product image', imageCredit: 'Selkirk', imageSourceUrl: 'https://www.selkirk.com/'
    },
    'crbn-trufoam-genesis': {
      image: 'https://crbnpickleball.com/cdn/shop/files/CRBN-TruFoam-Genesis-Lifestyle-1.jpg?v=1767721026&width=1080',
      imageAlt: 'CRBN TruFoam Genesis official product lifestyle image', imageCredit: 'CRBN', imageSourceUrl: 'https://crbnpickleball.com/'
    },
    'volair-mach-2-forza': {
      image: 'https://volair.com/cdn/shop/files/Amazon_Storefront_Tile_11.png?v=1771306875&width=1080',
      imageAlt: 'Volair Mach 2 Forza official product visual', imageCredit: 'Volair', imageSourceUrl: 'https://volair.com/'
    }
  };
  for (const paddle of paddles || []) Object.assign(paddle, map[paddle.slug] || {});
  return paddles;
};
