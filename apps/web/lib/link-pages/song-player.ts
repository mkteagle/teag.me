// This exact script is authorized by a CSP hash. It never interpolates page content.
export const songPlayerScript = `
for (const player of document.querySelectorAll('audio.link-page__audio')) {
  player.addEventListener('contextmenu', (event) => event.preventDefault());
  if (!player.dataset.playEvent || navigator.globalPrivacyControl || navigator.doNotTrack === '1') continue;
  let started = false;
  player.addEventListener('playing', () => { started = true; });
  function reportPlay() {
    if (!started || player.paused || player.seeking || player.currentTime <= 0) return;
    player.removeEventListener('timeupdate', reportPlay);
    void fetch(player.dataset.playEvent, { method: 'POST', credentials: 'omit', mode: 'no-cors', keepalive: true }).catch(() => {});
  }
  player.addEventListener('timeupdate', reportPlay);
}
`;
