/* ============================================================
   Moonlit Games — chrome bootstrap (WordPress build)

   In the original static site, chrome.js INJECTED the sidebar / topbar /
   footer / search modal into each subpage. In the WordPress theme those are
   rendered server-side by header.php and footer.php, so this file no longer
   injects anything.

   Its only remaining job is to expose the asset base URL that script.js uses
   to build image src paths (formerly window.__MLG_BASE__, formerly the
   data-base attribute). We derive it from the localized `MLG` object printed
   by wp_localize_script().

   All interactive behaviour (sidebar collapse, clock, ticker, theme toggle,
   search, sliders, counters) lives in script.js and runs on DOMContentLoaded.
   ============================================================ */
(function () {
	// MLG is provided by wp_localize_script (see functions.php → mlg_enqueue).
	// MLG.assets already ends without a trailing slash, e.g.
	//   https://site.test/wp-content/themes/moonlit-games/assets
	var assetsBase = (window.MLG && window.MLG.assets) ? window.MLG.assets : '';

	// script.js builds paths like `${MLG_BASE}images/foo.png`, and in this build
	// all images live under assets/img/. We therefore point the base at
	// `${assets}/` and rewrite the image folder token below.
	window.__MLG_BASE__ = assetsBase ? assetsBase + '/' : '';

	// The original data referenced images with an `images/` prefix. In the theme
	// they live in `img/`. Expose a tiny helper + a global the data layer reads.
	window.__MLG_IMG__ = assetsBase ? assetsBase + '/img/' : 'img/';
})();
