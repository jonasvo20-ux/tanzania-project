// Welcome screen for the personal pages. Loaded synchronously at the top of
// <body> so it paints before the page runtime (React + the .dc template) is
// ready; Kumbukumbu.dc.html calls window.tzIntro.ready() once it has mounted
// and window.tzIntro.onOpen() to hold its hero animations until the flag opens.
(function () {
  var script = document.currentScript;
  var person = ((script && script.getAttribute('data-person')) || '').toLowerCase();

  var NAMES = {
    yohana: 'Yohana', saraphina: 'Saraphina', erick: 'Erick', charlse: 'Charlse',
    debora: 'Debora', criff: 'Criff', melania: 'Melania', mena: 'Mena',
    joseph: { sw: 'Mwalimu Joseph', en: 'Teacher Joseph' },
    josephat: 'Big Boss'
  };
  var T = {
    sw: { to: 'Kwa', from: 'Kutoka', friends: 'Marafiki zako wa Ubelgiji', all: 'Wote', open: 'Fungua', loading: 'Inapakia…' },
    en: { to: 'To', from: 'From', friends: 'Your friends in Belgium', all: 'Everyone', open: 'Open', loading: 'Loading…' }
  };

  var lang = 'sw';
  try { if (localStorage.getItem('tz-lang') === 'en') lang = 'en'; } catch (e) {}
  var t = T[lang];
  var n = NAMES[person];
  var name = n ? (typeof n === 'string' ? n : n[lang]) : t.all;
  var reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  var root = el('div');
  root.id = 'tz-intro';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'tzi-title');

  // Both halves carry the whole flag and ribbon; each is clipped to its side of the band.
  ['a', 'b'].forEach(function (side) {
    var door = el('div', 'tzi-door tzi-door--' + side);
    ['tzi-green', 'tzi-band', 'tzi-blue', 'tzi-ribbon'].forEach(function (c) { door.appendChild(el('i', c)); });
    root.appendChild(door);
  });

  var tag = el('div', 'tzi-tag');
  tag.appendChild(el('span', 'tzi-hole'));
  tag.appendChild(el('span', 'tzi-label', t.to));
  var title = el('h1', 'tzi-name', name);
  title.id = 'tzi-title';
  tag.appendChild(title);
  var from = el('p', 'tzi-from');
  from.appendChild(el('span', 'tzi-label', t.from));
  from.appendChild(document.createTextNode(t.friends));
  tag.appendChild(from);
  var btn = el('button', 'tzi-open');
  btn.type = 'button';
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>';
  var btnText = el('span', '', t.open);
  btn.appendChild(btnText);
  tag.appendChild(btn);
  root.appendChild(tag);

  document.documentElement.classList.add('tzi-lock');
  (document.body || document.documentElement).appendChild(root);

  // Drop the tag in once the heading font is in (or after 1.2s regardless),
  // so the name doesn't flash in a fallback face.
  var shown = false;
  function showIn() { if (!shown) { shown = true; root.classList.add('is-in'); } }
  setTimeout(showIn, 1200);
  try {
    if (document.fonts && document.fonts.load) document.fonts.load('400 1em Caprasimo').then(showIn, showIn);
    else showIn();
  } catch (e) { showIn(); }

  var opening = false, queued = false;
  var api = window.tzIntro = {
    opened: false,
    isReady: false,
    _cbs: [],
    onOpen: function (cb) { if (api.opened) cb(); else api._cbs.push(cb); },
    ready: function () {
      if (api.isReady) return;
      api.isReady = true;
      if (queued) open();
    }
  };
  // Never trap anyone behind the screen if the page runtime fails to load.
  setTimeout(api.ready, 15000);

  function burst() {
    var r = tag.getBoundingClientRect();
    var layer = el('div', 'tzi-burst');
    layer.style.left = (r.left + r.width / 2) + 'px';
    layer.style.top = (r.top + r.height / 2) + 'px';
    var colors = ['#1eb53a', '#00a3dd', '#fcd116', '#141414', '#ef3340', '#f9f4ed'];
    var reach = Math.min(window.innerWidth, window.innerHeight);
    for (var i = 0; i < 42; i++) {
      var a = (i / 42) * Math.PI * 2 + Math.random() * 0.3;
      var d = reach * (0.22 + Math.random() * 0.32);
      var w = 6 + Math.random() * 8;
      var p = document.createElement('i');
      p.style.width = w + 'px';
      p.style.height = (i % 4 ? w * 0.45 : w) + 'px';
      p.style.borderRadius = i % 4 ? '1px' : '50%';
      p.style.background = colors[i % colors.length];
      p.style.setProperty('--x', (Math.cos(a) * d).toFixed(1) + 'px');
      p.style.setProperty('--y2', (Math.sin(a) * d).toFixed(1) + 'px');
      p.style.setProperty('--rot', Math.round(Math.random() * 540 - 270) + 'deg');
      p.style.animationDelay = Math.round(Math.random() * 80) + 'ms';
      layer.appendChild(p);
    }
    root.appendChild(layer);
  }

  function open() {
    if (opening) return;
    if (!api.isReady) {
      queued = true;
      btnText.textContent = t.loading;
      return;
    }
    opening = true;
    showIn();
    root.classList.add('is-opening');
    if (!reduced) burst();

    var page = document.getElementById('dc-root');
    if (page && page.animate && !reduced) {
      document.documentElement.classList.add('tzi-zoom');
      page.style.transformOrigin = '50% ' + Math.round(window.scrollY + window.innerHeight / 2) + 'px';
      var zoom = page.animate(
        [{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
        { duration: 1200, delay: 200, easing: 'cubic-bezier(.2, .7, .2, 1)', fill: 'backwards' }
      );
      zoom.onfinish = zoom.oncancel = function () {
        page.style.transformOrigin = '';
        document.documentElement.classList.remove('tzi-zoom');
      };
    }

    setTimeout(function () {
      api.opened = true;
      var cbs = api._cbs;
      api._cbs = [];
      cbs.forEach(function (cb) { try { cb(); } catch (e) { console.error(e); } });
    }, reduced ? 0 : 250);
    setTimeout(function () { document.documentElement.classList.remove('tzi-lock'); }, reduced ? 300 : 800);
    setTimeout(function () { root.remove(); }, reduced ? 350 : 1450);
  }

  root.addEventListener('click', open);
})();
