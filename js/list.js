mfBuildShell('../', 'listas');

function mfIconTrash(){
  return `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12"/></svg>`;
}
function mfIconChevron(){
  return `<svg class="chevron" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;
}
function mfIconX(){
  return `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
}

function mfRenderPlaylists(){
  const wrap = document.getElementById('playlistsWrap');
  const playlists = mfGetPlaylists();
  const params = new URLSearchParams(window.location.search);
  const autoOpen = params.get('id');

  if(!playlists.length){
    wrap.innerHTML = `
      <div class="state-msg" style="padding:70px 20px;">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h10M4 18h7"/><circle cx="18" cy="16" r="3"/><path d="M18 13v3l2 1"/></svg>
        <div class="state-title">Aún no tienes listas</div>
        <div>Crea tu primera lista para empezar a guardar canciones</div>
        <a href="create.html" class="btn-primary" style="margin-top:10px;">Crear lista</a>
      </div>`;
    return;
  }

  wrap.innerHTML = '';
  playlists.slice().reverse().forEach(pl => {
    const card = document.createElement('div');
    card.className = 'playlist-card' + (pl.id === autoOpen ? ' open' : '');
    card.innerHTML = `
      <div class="playlist-head">
        <div class="playlist-head-info">
          <h3>${pl.name}</h3>
          <p>${pl.tracks.length} canción${pl.tracks.length===1?'':'es'}${pl.description ? ' · ' + pl.description : ''}</p>
        </div>
        <div class="playlist-head-actions">
          <button class="icon-btn del-btn" title="Eliminar lista">${mfIconTrash()}</button>
          <button class="icon-btn toggle-btn" title="Ver canciones">${mfIconChevron()}</button>
        </div>
      </div>
      <div class="playlist-tracks">
        ${pl.tracks.length ? pl.tracks.map(t => `
          <div class="track-row-mini" data-video="${t.videoId}">
            <img src="${t.thumbnail}" alt="">
            <div class="info">
              <div class="t">${t.title}</div>
              <div class="a">${t.author}</div>
            </div>
            <button class="icon-btn remove-track" data-video="${t.videoId}" title="Quitar de la lista">${mfIconX()}</button>
          </div>
        `).join('') : '<div class="playlist-empty-tracks">Esta lista todavía no tiene canciones. Añádelas desde la página de una canción.</div>'}
      </div>
    `;

    card.querySelector('.playlist-head').addEventListener('click', (e) => {
      if(e.target.closest('.del-btn')) return;
      card.classList.toggle('open');
    });
    card.querySelector('.del-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      if(confirm('¿Eliminar la lista "' + pl.name + '"?')){
        mfDeletePlaylist(pl.id);
        mfRenderPlaylists();
      }
    });
    card.querySelectorAll('.info, .track-row-mini img').forEach(el => {
      el.addEventListener('click', () => {
        const videoId = el.closest('.track-row-mini').dataset.video;
        window.location.href = '../view/music.html?id=' + videoId;
      });
    });
    card.querySelectorAll('.remove-track').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        mfRemoveTrackFromPlaylist(pl.id, btn.dataset.video);
        mfRenderPlaylists();
      });
    });

    wrap.appendChild(card);
  });
}

mfRenderPlaylists();
