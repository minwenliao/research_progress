(() => {
  'use strict';

  const slides = [...document.querySelectorAll('.slide')];
  const navLinks = [...document.querySelectorAll('.section-nav a')];
  const presentToggle = document.querySelector('#present-toggle');
  const presentationControls = document.querySelector('.presentation-controls');
  const previous = document.querySelector('#slide-prev');
  const next = document.querySelector('#slide-next');
  const counter = document.querySelector('#slide-counter');
  const liveStatus = document.querySelector('#interaction-status');
  let currentSlide = 0;
  let presenting = false;
  let savedScrollPosition = 0;

  function updateNavigation(index) {
    currentSlide = Math.max(0, Math.min(index, slides.length - 1));
    navLinks.forEach((link, i) => {
      link.classList.toggle('active', i === currentSlide);
      if (i === currentSlide) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    counter.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    previous.disabled = currentSlide === 0;
    next.disabled = currentSlide === slides.length - 1;
  }

  function showSlide(index) {
    const target = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, i) => {
      slide.classList.toggle('current-slide', i === target);
      if (i !== target) slide.querySelectorAll('video').forEach(video => video.pause());
    });
    updateNavigation(target);
    if (presenting) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      liveStatus.textContent = `Section ${target + 1} of ${slides.length}: ${slides[target].querySelector('h1, h2').textContent}`;
    }
  }

  presentToggle.addEventListener('click', () => {
    presenting = !presenting;
    if (presenting) savedScrollPosition = window.scrollY;
    document.body.classList.toggle('presenting', presenting);
    presentationControls.hidden = !presenting;
    presentToggle.setAttribute('aria-pressed', String(presenting));
    presentToggle.innerHTML = `<span class="present-icon" aria-hidden="true"></span>${presenting ? 'Exit' : 'Present'}`;
    if (presenting) showSlide(currentSlide);
    else {
      slides.forEach(slide => slide.classList.remove('current-slide'));
      window.scrollTo({ top: savedScrollPosition, behavior: 'instant' });
    }
  });

  previous.addEventListener('click', () => showSlide(currentSlide - 1));
  next.addEventListener('click', () => showSlide(currentSlide + 1));
  navLinks.forEach((link, index) => {
    link.addEventListener('click', event => {
      if (presenting) {
        event.preventDefault();
        showSlide(index);
      }
    });
  });
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    if (navLinks.includes(link)) return;
    link.addEventListener('click', event => {
      if (!presenting) return;
      const index = slides.findIndex(slide => `#${slide.id}` === link.getAttribute('href'));
      if (index >= 0) { event.preventDefault(); showSlide(index); }
    });
  });

  document.addEventListener('keydown', event => {
    if (!presenting) return;
    const active = document.activeElement;
    if (active && (active.matches('video, input, textarea, select, [contenteditable="true"]') || active.closest('[role="tablist"]'))) return;
    if (event.key === 'Escape') { event.preventDefault(); presentToggle.click(); }
    else if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); showSlide(currentSlide + 1); }
    else if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); showSlide(currentSlide - 1); }
  });

  let scrollQueued = false;
  function trackCurrentSection() {
    if (presenting || scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      const marker = Math.min(window.innerHeight * 0.35, 240);
      let index = 0;
      slides.forEach((slide, i) => { if (slide.getBoundingClientRect().top <= marker) index = i; });
      updateNavigation(index);
      scrollQueued = false;
    });
  }
  window.addEventListener('scroll', trackCurrentSection, { passive: true });
  window.addEventListener('resize', trackCurrentSection, { passive: true });
  updateNavigation(0);
  trackCurrentSection();

  const tabs = [...document.querySelectorAll('#case-explorer [role="tab"]')];
  function activateCase(tab, moveFocus = false) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      panel.hidden = !selected;
      if (!selected) panel.querySelectorAll('video').forEach(video => video.pause());
    });
    if (moveFocus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateCase(tab));
    tab.addEventListener('keydown', event => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activateCase(tabs[nextIndex], true);
    });
  });

  const figureTabs = [...document.querySelectorAll('#architectures [role="tab"]')];
  function activateFigure(tab, focus = false) {
    figureTabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    if (focus) tab.focus();
  }
  figureTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateFigure(tab));
    tab.addEventListener('keydown', event => {
      const destinations = {ArrowRight:(i+1)%figureTabs.length, ArrowLeft:(i-1+figureTabs.length)%figureTabs.length, Home:0, End:figureTabs.length-1};
      if (!(event.key in destinations)) return;
      event.preventDefault();
      activateFigure(figureTabs[destinations[event.key]], true);
    });
  });
  const roboVideos = [...document.querySelectorAll('#robomme video')];
  const roboButton = document.querySelector('#robomme-play');
  const roboStatus = document.querySelector('#robomme-status');
  let roboPlaying = false;
  function stopRobo() {
    roboPlaying = false;
    roboVideos.forEach(v => v.pause());
    roboButton.textContent = 'Play all from the start';
  }
  roboButton.addEventListener('click', async () => {
    if (roboPlaying) { stopRobo(); roboStatus.textContent = 'All four videos paused'; return; }
    roboButton.disabled = true;
    document.querySelectorAll('video').forEach(v => v.pause());
    roboVideos.forEach(v => { v.currentTime = 0; v.playbackRate = 1; });
    const starts = await Promise.allSettled(roboVideos.map(v => v.play()));
    if (starts.every(x => x.status === 'fulfilled')) {
      roboPlaying = true;
      roboButton.textContent = 'Pause all';
      roboStatus.textContent = 'Started together · each recording stops at its own end';
    } else {
      stopRobo(); roboStatus.textContent = 'Use the individual controls to play each video';
    }
    roboButton.disabled = false;
  });
  roboVideos.forEach(v => v.addEventListener('ended', () => {
    if (roboVideos.every(v => v.ended)) { stopRobo(); roboStatus.textContent = 'All four recordings finished'; }
  }));

})();
