(() => {
  'use strict';

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


(() => {
  const tabs = [...document.querySelectorAll('#weekly-result-tabs [role="tab"]')];
  const select = (tab, focus = false) => {
    tabs.forEach(item => {
      const active = item === tab;
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', e => {
      const targets = {ArrowRight:(i+1)%tabs.length, ArrowLeft:(i-1+tabs.length)%tabs.length, Home:0, End:tabs.length-1};
      if (!(e.key in targets)) return;
      e.preventDefault(); select(tabs[targets[e.key]], true);
    });
  });
})();
