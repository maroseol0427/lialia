/* Keep the original audio element alive while changing the visible page. */
(() => {
  const base = new URL('.', location.href);
  const beautyURL = new URL('beauty.html', base);
  const homeURL = new URL('index.html', base);
  const dock = document.getElementById('playerDock');
  const homeTitle = document.title;
  const homeNodes = [...document.body.children].filter(node =>
    node !== dock && node.id !== 'bgAudio' && !['SCRIPT','STYLE'].includes(node.tagName));
  const frame = document.createElement('iframe');
  frame.id = 'beautyView';
  frame.title = 'LIA 뷰티 화보';
  frame.hidden = true;
  frame.setAttribute('aria-label', 'LIA 뷰티 화보 페이지');
  document.body.append(frame);
  let inBeauty = false;
  let homeScroll = 0;
  const saved = new Map();
  function resize() {
    document.documentElement.style.setProperty('--music-space',
      Math.ceil(dock.getBoundingClientRect().height + 40) + 'px');
  }
  new ResizeObserver(resize).observe(dock);
  resize();
  function render(url, focus = true) {
    const beauty = url.pathname === beautyURL.pathname;
    if (beauty && !inBeauty) {
      homeScroll = window.scrollY;
      homeNodes.forEach(node => {
        saved.set(node, {hidden:node.hidden, inert:node.inert});
        node.hidden = true;
        node.inert = true;
      });
      document.body.classList.add('beauty-mode');
      frame.hidden = false;
      if (!frame.src) frame.src = beautyURL.href + '?embedded=1' + url.hash;
      document.title = 'LIALIA — Beauty, in a whisper.';
      if (focus) frame.focus();
    } else if (!beauty && inBeauty) {
      frame.hidden = true;
      document.body.classList.remove('beauty-mode');
      homeNodes.forEach(node => {
        const state = saved.get(node);
        node.hidden = state.hidden;
        node.inert = state.inert;
      });
      document.title = homeTitle;
      window.scrollTo({top:homeScroll, behavior:'instant'});
      if (focus && !url.hash) document.querySelector('.logo')?.focus({preventScroll:true});
    }
    inBeauty = beauty;
    if (!beauty && url.hash) {
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (target) {
        target.scrollIntoView({behavior:'instant'});
        if (focus) {
          if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex','-1');
          target.focus({preventScroll:true});
        }
      }
    }
  }
  function navigate(url) {
    if (url.origin !== location.origin) return;
    if (![homeURL.pathname, base.pathname, beautyURL.pathname].includes(url.pathname)) return;
    history.pushState({}, '', url.pathname + url.hash);
    render(url);
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.altKey || event.shiftKey ||
        link.target === '_blank' || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    if (url.origin === location.origin && url.pathname === beautyURL.pathname) {
      event.preventDefault();
      navigate(url);
    }
  });
  window.addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
    if (event.data?.type === 'lia:navigate' && typeof event.data.href === 'string')
      navigate(new URL(event.data.href, base));
    // Browser autoplay restrictions may require a gesture in the parent player.
    if (event.data?.type === 'lia:gesture' && typeof unlockBound !== 'undefined' && unlockBound)
      unlockAudio();
  });
  window.addEventListener('popstate', () => render(new URL(location.href)));
  const initial = new URL(location.href);
  if (initial.searchParams.get('view') === 'beauty') {
    const url = new URL(beautyURL);
    url.hash = initial.hash;
    history.replaceState({}, '', url.pathname + url.hash);
    render(url, false);
  }
})();
