// Netlify Edge Function — first-visit language by country.
// South Korea (KR) -> Korean (/ko/); everyone else -> English (/en/).
// A "picklary_lang" cookie (set on each locale page in site.js) remembers a
// visitor's manual language choice, so returning to "/" honours it.
export default async (request, context) => {
  const url = new URL(request.url);
  if (url.pathname !== "/") return; // only act on the bare root

  let lang = context.cookies.get("picklary_lang");
  if (lang !== "ko" && lang !== "en") {
    const code =
      (context.geo && context.geo.country && context.geo.country.code) || "";
    lang = code === "KR" ? "ko" : "en";
  }
  return new Response(null, {
    status: 302,
    headers: { Location: "/" + lang + "/", "Cache-Control": "no-cache" },
  });
};
