# Picklary revenue-growth upgrade notes

Applied on top of `picklary-source-improved.zip`.

## Goals
- Maximize user acquisition, session depth, and return visits.
- Strengthen blog-to-site return loops.
- Improve SEO and AdSense readiness without turning pages into thin affiliate or link-list pages.

## Implemented upgrades
1. **Content circulation / next-step paths**
   - Added reusable "What to do next / 다음에 볼 것" cards to article, column, and level detail pages.
   - Cards push readers into DUPR self-check, Paddle Finder, next level pages, Skill Review, rules, or results depending on context.

2. **Blog return loop**
   - Added a stronger blog-return strategy section on Home and the Blogs page.
   - Clarifies that external blogs hold longer stories/update notes while Picklary remains the tool and guide hub.
   - Adds internal return CTAs back to DUPR self-check and blog gateways.

3. **Weekly return habit**
   - Added Home-page return-loop cards: weekly self-check, video feedback, paddle re-check, and The Brief.
   - These create clear reasons to revisit without pretending to publish unverified live news.

4. **SEO / content depth**
   - Added an editorial Gear Lab bridge section explaining how to choose equipment as problem-solving, not shopping.
   - Reinforces AdSense-safe intent: educational criteria, source verification, and no hard purchase push.

5. **Paddle Finder trust labels**
   - Added dynamic result badges such as best fit, benchmark pick, style fit, budget fit, level fit, and shape/thickness fit.
   - These make recommendation logic easier to trust and encourage deeper comparison.

6. **Image optimization**
   - Converted large PNG hero/diagram images to WebP and updated code references.
   - Removed unreferenced large PNG copies from source and dist.
   - `assets/img` is now much lighter for mobile loading.

## Validation
- `npm run build`: success.
- Generated HTML files: 283.
- Missing internal links: 0.
- Missing assets: 0.
- Images without alt text: 0.
- No obvious `undefined` or `NaN` output found in generated Korean/English pages.
