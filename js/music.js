mfBuildShell('../', '');

const mfParams = new URLSearchParams(window.location.search);
const mfVideoId = mfParams.get('id');

function mfShowError(message){
  document.getElementById('playerLoading').style.display = 'none';
  document.getElementById('playerContent').style.display = 'none';
  const err = document.getElementById('playerError');
  err.style.display = 'flex';
  err.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'state-msg';
  div.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
    <div class="state-title">No se pudo cargar esta cancion</div>
    <div>${message}</div>
    <a href="../index.html" class="btn-secondary" style="margin-top:8px;">Volver al inicio</a>
  `;
  err.appendChild(div);
}

let mfCurrentTrack = null;

function mfLoadPlayer(){
  if(!mfVideoId){
    mfShowError('No se especifico ninguna cancion.');
    return;
  }
  mfGetVideo(mfVideoId).then(video => {
    mfCurrentTrack = {
      videoId: video.videoId,
      title: video.title,
      author: video.author,
      thumbnail: video.thumbnail
    };

    document.getElementById('ytFrame').src = `https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`;
    document.getElementById('pTitle').textContent = video.title || '';
    document.getElementById('pAuthor').textContent = video.author || '';
    document.getElementById('pViews').textContent = mfFormatViews(video.viewCount);
    document.getElementById('pDate').textContent = video.publishedText || '';
    document.getElementById('pDesc').textContent = video.description || 'Sin descripcion disponible.';
    document.getElementById('openYoutubeBtn').href = `https://www.youtube.com/watch?v=${video.videoId}`;
    document.title = video.title + ' - MusFox';

    const relatedWrap = document.getElementById('relatedList');
    relatedWrap.innerHTML = '';
    const related = (video.related || []).filter(v => v.videoId).slice(0, 10);
    if(!related.length){
      relatedWrap.innerHTML = '<div class="playlist-empty-tracks">No hay recomendaciones disponibles.</div>';
    }else{
      related.forEach(rv => {
        const item = document.createElement('div');
        item.className = 'related-item';
        item.innerHTML = `
          <img src="${rv.thumbnail}" alt="">
          <div class="info">
            <div class="t">${rv.title || ''}</div>
            <div class="a">${rv.author || ''}</div>
          </div>
        `;
        item.addEventListener('click', () => {
          window.location.href = 'music.html?id=' + rv.videoId;
        });
        relatedWrap.appendChild(item);
      });
    }

    document.getElementById('playerLoading').style.display = 'none';
    document.getElementById('playerContent').style.display = 'block';
  }).catch(() => {
    mfShowError('No hay conexion con las fuentes de musica. Revisa tu internet e intenta de nuevo.');
  });
}

function mfOpenAddModal(){
  const overlay = document.getElementById('mfOverlay');
  const modal = document.getElementById('addModal');
  const listWrap = document.getElementById('modalPlaylistList');
  const playlists = mfGetPlaylists();
  listWrap.innerHTML = '';
  if(!playlists.length){
    listWrap.innerHTML = '<div class="modal-empty">Todavia no tienes listas creadas.</div>';
  }else{
    playlists.forEach(pl => {
      const already = pl.tracks.find(t => t.videoId === mfCurrentTrack.videoId);
      const row = document.createElement('div');
      row.className = 'modal-list-item';
      row.innerHTML = `<span>${pl.name}</span><button></button>`;
      row.querySelector('button').textContent = already ? 'Añadida ✓' : 'Añadir';
      row.querySelector('button').addEventListener('click', () => {
        if(mfAddTrackToPlaylist(pl.id, mfCurrentTrack)){
          row.querySelector('button').textContent = 'Añadida ✓';
        }
      });
      listWrap.appendChild(row);
    });
  }
  overlay.classList.add('active');
  modal.classList.add('active');
}

function mfCloseAddModal(){
  document.getElementById('mfOverlay').classList.remove('active');
  document.getElementById('addModal').classList.remove('active');
}

document.getElementById('addToListBtn').addEventListener('click', mfOpenAddModal);
document.getElementById('addModalClose').addEventListener('click', mfCloseAddModal);
document.getElementById('mfOverlay').addEventListener('click', mfCloseAddModal);

mfLoadPlayer();
