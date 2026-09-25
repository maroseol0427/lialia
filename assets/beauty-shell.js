(() => {
  const embedded = window.parent !== window && new URLSearchParams(location.search).get('embedded') === '1';
  if (!embedded) {
    const shell = new URL('index.html', location.href);
    shell.searchParams.set('view', 'beauty');
    shell.hash = location.hash;
    location.replace(shell.href);
    return;
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        link.target === '_blank' || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    const home = new URL('index.html', location.href);
    if (url.origin === location.origin && url.pathname === location.pathname && !url.hash) {
      event.preventDefault(); window.scrollTo({top:0,behavior:'smooth'}); return;
    }
    if (url.origin === location.origin && url.pathname === home.pathname) {
      event.preventDefault();
      parent.postMessage({type:'lia:navigate', href:url.href}, location.origin);
    }
  });
  ['pointerdown','keydown'].forEach(type => document.addEventListener(type, () =>
    parent.postMessage({type:'lia:gesture'}, location.origin), {passive:true}));
})();
