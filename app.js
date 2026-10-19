(() => {
  'use strict';

  const slides = [...document.querySelectorAll('.slide')];
  const navLinks = [...document.querySelectorAll('.section-nav a')];
  function updateNavigation(index) {
    const currentSlide = Math.max(0, Math.min(index, slides.length - 1));
    navLinks.forEach((link, i) => {
      link.classList.toggle('active', i === currentSlide);
      if (i === currentSlide) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  let scrollQueued = false;
  function trackCurrentSection() {
    if (scrollQueued) return;
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
