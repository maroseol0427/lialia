(() => {
  const menuButton = document.getElementById('menuToggle');
  const menu = document.getElementById('mainNav');
  function closeMenu(returnFocus = false) {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = '메뉴';
    if (returnFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menu.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? '닫기' : '메뉴';
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.nav')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.classList.contains('open')) closeMenu(true); });

  const cards = [...document.querySelectorAll('.beauty-card')];
  const filters = [...document.querySelectorAll('.filter-button')];
  const count = document.getElementById('photoCount');
  document.getElementById('beautyFilters').hidden = false;
  filters.forEach(button => button.addEventListener('click', () => {
    const mood = button.dataset.filter;
    filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
    cards.forEach(card => { card.hidden = mood !== 'all' && card.dataset.mood !== mood; });
    count.textContent = `${cards.filter(card => !card.hidden).length}장의 화보 · ${button.textContent.trim()}`;
  }));

  const dialog = document.getElementById('beautyLightbox');
  // Image links remain usable if native dialogs or JavaScript are unavailable.
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const image = document.getElementById('beautyImage');
  const caption = document.getElementById('beautyCaption');
  const position = document.getElementById('beautyPosition');
  const closeButton = dialog.querySelector('.dialog-close');
  let selected = 0, visibleCards = [], opener = null, previousOverflow = '';
  function show(index) {
    selected = (index + visibleCards.length) % visibleCards.length;
    const card = visibleCards[selected];
    const source = card.querySelector('img');
    image.src = card.querySelector('.beauty-photo').href;
    image.alt = source.alt;
    caption.textContent = card.querySelector('figcaption span').textContent;
    position.textContent = `${selected + 1} / ${visibleCards.length}`;
  }
  function open(event, link, card) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    opener = link;
    visibleCards = cards.filter(item => !item.hidden);
    if (!visibleCards.includes(card)) visibleCards = cards;
    show(visibleCards.indexOf(card));
    previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  }
  cards.forEach(card => {
    const link = card.querySelector('.beauty-photo');
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => open(event, link, card));
  });
  const cover = document.querySelector('.cover-frame a');
  cover.setAttribute('aria-haspopup', 'dialog');
  cover.addEventListener('click', event => open(event, cover, cards.find(card => card.dataset.photo === '0')));
  closeButton.addEventListener('click', () => dialog.close());
  document.getElementById('beautyPrevious').addEventListener('click', () => show(selected - 1));
  document.getElementById('beautyNext').addEventListener('click', () => show(selected + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(selected - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(selected + 1); }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    opener?.focus({preventScroll: true});
  });
})();
