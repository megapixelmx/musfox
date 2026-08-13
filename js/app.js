const MF_ROOT = '';

function mfSetActiveView(){
  const hash = (window.location.hash || '#inicio').replace('#','');
  const valid = ['inicio','explorar','generos'];
  const key = valid.includes(hash) ? hash : 'inicio';
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + key).classList.add('active');

  document.querySelectorAll('.nav-item, .tab-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll(`.nav-item[data-key="${key}"], .tab-item[data-key="${key}"]`).forEach(n => n.classList.add('active'));

  if(key === 'explorar'){
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if(q && !mfExplorarLoaded){
      document.getElementById('mfTopSearch').value = q;
      mfRunSearch(q);
    }
  }
  if(key === 'generos' && !mfGenerosLoaded){
    mfInitGeneros();
  }
}

function mfLoadRow(containerId, fetcher, opts){
  opts = opts || {};
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  container.appendChild(mfSkeletonRow(6));
  fetcher().then(videos => {
    container.innerHTML = '';
    if(!videos || !videos.length){
      mfErrorState(container, 'No se encontraron resultados en este momento.', () => mfLoadRow(containerId, fetcher, opts));
      return;
    }
    let list = videos.slice();
    if(opts.sortByViews){
      list = list.sort((a,b) => (b.viewCount||0) - (a.viewCount||0));
    }
    list = list.slice(0, opts.limit || 12);
    list.forEach((v, i) => {
      container.appendChild(mfCreateTrackCard(v, { rootPrefix: MF_ROOT, rank: opts.showRank ? i+1 : null }));
    });
  }).catch(() => {
    mfErrorState(container, 'No hay conexion con las fuentes de musica. Revisa tu internet e intenta de nuevo.', () => mfLoadRow(containerId, fetcher, opts));
  });
}

function mfLoadGrid(containerId, fetcher, opts){
  opts = opts || {};
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  container.appendChild(mfSkeletonRow(6));
  fetcher().then(videos => {
    container.innerHTML = '';
    if(!videos || !videos.length){
      mfErrorState(container, 'No se encontraron resultados.', () => mfLoadGrid(containerId, fetcher, opts));
      return;
    }
    const list = videos.slice(0, opts.limit || 24);
    list.forEach(v => container.appendChild(mfCreateTrackCard(v, { rootPrefix: MF_ROOT })));
  }).catch(() => {
    mfErrorState(container, 'No hay conexion con las fuentes de musica. Revisa tu internet e intenta de nuevo.', () => mfLoadGrid(containerId, fetcher, opts));
  });
}

function mfBuildGenreRows(){
  const wrap = document.getElementById('genre-rows');
  MF_GENRES.slice(0,4).forEach(genre => {
    const id = 'row-genre-' + genre.label.toLowerCase();
    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = `
      <div class="section-head"><h2>${genre.label}</h2></div>
      <div class="row-scroll" id="${id}"></div>
    `;
    wrap.appendChild(section);
    mfLoadRow(id, () => mfSearch(genre.query), { limit: 10 });
  });
}

let mfExplorarLoaded = false;
function mfRunSearch(query){
  mfExplorarLoaded = true;
  mfLoadGrid('grid-explorar', () => mfSearch(query), { limit: 30 });
}

let mfGenerosLoaded = false;
function mfInitGeneros(){
  mfGenerosLoaded = true;
  const chipsWrap = document.getElementById('genre-chips');
  MF_GENRES.forEach((genre, i) => {
    const chip = document.createElement('button');
    chip.className = 'genre-chip' + (i===0 ? ' active' : '');
    chip.textContent = genre.label;
    chip.addEventListener('click', () => {
      document.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      mfLoadGrid('grid-generos', () => mfSearch(genre.query), { limit: 24 });
    });
    chipsWrap.appendChild(chip);
  });
  mfLoadGrid('grid-generos', () => mfSearch(MF_GENRES[0].query), { limit: 24 });
}

mfBuildShell(MF_ROOT, 'inicio');
mfSetActiveView();
window.addEventListener('hashchange', mfSetActiveView);

mfLoadRow('row-tendencias', () => mfSearch('musica tendencia 2026'), { limit: 12, showRank: true });
mfLoadRow('row-masescuchadas', () => mfSearch('top hits 2026'), { limit: 12, sortByViews: true });
mfBuildGenreRows();
mfLoadGrid('grid-catalogo', () => mfSearch('musica popular 2026'), { limit: 18 });
