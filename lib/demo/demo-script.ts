import { RELEASE_SEEN, WELCOME_SEEN } from '@/components/onboarding/visit';

/**
 * The app inside the onboarding's frame (an iframe named `enbrio-demo`): the real interface, shown to a
 * first-time student, that must leave no trace. Run in <head> before anything else:
 * - localStorage reads the browser's real store but writes only to memory (progress, visits, «seen»
 *   flags, settings stay as they were in the student's own app);
 * - the onboarding and the first-visit cards (guide offer, Kimu's cheer, nudges) never open inside it;
 * - sessionStorage is its own, in memory (the tab's is shared with the page around the frame: Kimu's
 *   chat there stays the student's);
 * - the visit beacon does not count it.
 * The window's name survives navigation inside the frame (Kimu's «take me there»), so every page of the
 * frame is a demo page.
 */
export const DEMO_NAME = 'enbrio-demo';

export const demoScript = `try {
  if (window.name === '${DEMO_NAME}') {
    document.documentElement.dataset.demo = '1';
    var GONE = {};
    var shade = function (real) {
      var mem = new Map();
      var shadow = {
        getItem: function (k) { k = String(k); if (mem.has(k)) { var v = mem.get(k); return v === GONE ? null : v; } return real ? real.getItem(k) : null; },
        setItem: function (k, v) { mem.set(String(k), String(v)); },
        removeItem: function (k) { mem.set(String(k), GONE); },
        clear: function () { if (real) for (var i = 0; i < real.length; i++) mem.set(real.key(i), GONE); mem.forEach(function (_, k) { mem.set(k, GONE); }); },
        key: function (i) { var ks = []; if (real) for (var j = 0; j < real.length; j++) { var k = real.key(j); if (!mem.has(k) || mem.get(k) !== GONE) ks.push(k); } mem.forEach(function (v, k) { if (v !== GONE && ks.indexOf(k) < 0) ks.push(k); }); return ks[i] === undefined ? null : ks[i]; },
        get length() { var n = 0; while (shadow.key(n) !== null) n++; return n; }
      };
      return { shadow: shadow, mem: mem };
    };
    var local = shade(window.localStorage);
    // The tab's sessionStorage is shared with the page that holds the frame: the demo's keeps its own, empty.
    var session = shade(null);
    Object.defineProperty(window, 'localStorage', { configurable: true, get: function () { return local.shadow; } });
    Object.defineProperty(window, 'sessionStorage', { configurable: true, get: function () { return session.shadow; } });
    ['${WELCOME_SEEN}', '${RELEASE_SEEN}', 'enbrioatlas:intro-full'].forEach(function (k) { local.mem.set(k, '1'); });
    local.mem.set('enbrioatlas:planes-seen', JSON.stringify(['sagitala', 'zeharkakoa', 'koronala', 'dortsala']));
    ['enbrioatlas:bisita', 'enbrioatlas:kimu-animo'].forEach(function (k) { session.mem.set(k, '1'); });
  }
} catch (e) {}`;
