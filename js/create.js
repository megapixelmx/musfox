mfBuildShell('../', 'crear');

document.getElementById('createForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('plName').value.trim();
  const desc = document.getElementById('plDesc').value.trim();
  if(!name) return;
  const playlist = mfCreatePlaylist(name, desc);
  window.location.href = 'list.html?id=' + playlist.id;
});
