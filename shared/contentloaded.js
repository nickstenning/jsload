/*
 *
 * ContentLoaded.js
 *
 * Author: Diego Perini (diego.perini at gmail.com)
 * Summary: Cross-browser wrapper for DOMContentLoaded
 * Updated: 17/05/2008
 * License: MIT
 * Version: 1.1
 *
 * URL:
 * http://javascript.nwbox.com/ContentLoaded/
 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
 *
 * Notes:
 * based on code by Dean Edwards and John Resig
 * http://dean.edwards.name/weblog/2006/06/again/
 *
 */

// @w	window reference
// @f	function reference
function ContentLoaded(w, f) {

	var	d = w.document,
		D = 'DOMContentLoaded',
		// user agent, version
		u = w.navigator.userAgent.toLowerCase(),
		v = parseFloat(u.match(/.+(?:rv|it|ml|ra|ie)[\/: ]([\d.]+)/)[1]);

	function init(e) {
		if (!document.loaded) {
			document.loaded = true;
			// pass a fake event if needed
			f((e.type && e.type == D) ? e : {
				type: D,
				target: d,
				eventPhase: 0,
				currentTarget: d,
				timeStamp: +new Date,
				eventType: e.type || e
			});
		}
	}

	// safari < 525.13
	if (/webkit\//.test(u) && v < 525.13) {

		(function () {
			if (/complete|loaded/.test(d.readyState)) {
				init('khtml-poll');
			} else {
				setTimeout(arguments.callee, 10);
			}
		})();

	// internet explorer all versions
	} else if (/msie/.test(u) && !w.opera) {

		d.attachEvent('onreadystatechange',
			function (e) {
				if (d.readyState == 'complete') {
					d.detachEvent('on'+e.type, arguments.callee);
					init(e);
				}
			}
		);
		if (w == top) {
			(function () {
				try {
					d.documentElement.doScroll('left');
				} catch (e) {
					setTimeout(arguments.callee, 10);
					return;
				}
				init('msie-poll');
			})();
		}

	// browsers having native DOMContentLoaded
	} else if (d.addEventListener &&
		(/opera\//.test(u) && v > 9) ||
		(/gecko\//.test(u) && v >= 1.8) ||
		(/khtml\//.test(u) && v >= 4.0) ||
		(/webkit\//.test(u) && v >= 525.13)) {

		d.addEventListener(D,
			function (e) {
				d.removeEventListener(D, arguments.callee, false);
				init(e);
			}, false
		);

	// fallback to last resort for older browsers
	} else {

		// from Simon Willison
		var oldonload = w.onload;
		w.onload = function (e) {
			init(e || w.event);
			if (typeof oldonload == 'function') {
				oldonload(e || w.event);
			}
		};

	}
}
