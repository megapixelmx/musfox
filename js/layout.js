const MF_NAV_ITEMS = [
  { key:'inicio', label:'Inicio',
    icon:'<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9"/>' },
  { key:'explorar', label:'Explorar',
    icon:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>' },
  { key:'generos', label:'Generos',
    icon:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>' },
  { key:'crear', label:'Crear',
    icon:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>' },
  { key:'listas', label:'Mis Listas',
    icon:'<path d="M4 6h16M4 12h10M4 18h7"/><circle cx="18" cy="16" r="3"/><path d="M18 13v3l2 1"/>' }
];

function mfNavHref(rootPrefix, key){
  if(key === 'crear') return rootPrefix + 'lt/create.html';
  if(key === 'listas') return rootPrefix + 'lt/list.html';
  return rootPrefix + 'index.html#' + key;
}

function mfBuildShell(rootPrefix, activeKey){
  const logoPath = rootPrefix + 'img/logo.png';

  const sideNavHtml = MF_NAV_ITEMS.map(item => `
    <a class="nav-item ${item.key===activeKey?'active':''}" data-key="${item.key}" href="${mfNavHref(rootPrefix, item.key)}">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>
      <span>${item.label}</span>
    </a>`).join('');

  const tabNavHtml = MF_NAV_ITEMS.map(item => `
    <a class="tab-item ${item.key===activeKey?'active':''}" data-key="${item.key}" href="${mfNavHref(rootPrefix, item.key)}">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>
      <span>${item.label}</span>
    </a>`).join('');

  const shellHtml = `
    <div class="sidebar" id="mfSidebar">
      <div class="sidebar-logo">
        <img src="${logoPath}" alt="MusFox" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
        <div class="fallback-logo" style="display:none;">MF</div>
        <span>Mus<span style="color:var(--accent-orange)">Fox</span></span>
      </div>
      <div class="nav-group">
        <div class="sidebar-section-label">Navegacion</div>
        ${sideNavHtml}
      </div>
      <div class="sidebar-footer">
        Musica en vivo obtenida de fuentes abiertas de YouTube.
      </div>
    </div>
    <div class="topbar">
      <div class="brand">
        <img src="${logoPath}" alt="MusFox" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">
        <div class="fallback-logo" style="display:none;">MF</div>
        <span>Mus<span class="name-orange">Fox</span></span>
      </div>
      <div class="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input type="text" id="mfTopSearch" placeholder="Buscar canciones, artistas o generos...">
      </div>
      <div class="topbar-spacer"></div>
      <button class="collapse-btn" id="mfCollapseBtn" aria-label="Contraer menu">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
      </button>
    </div>
    <nav class="tab-bar" id="mfTabBar">
      ${tabNavHtml}
    </nav>
  `;

  document.getElementById('mfShellSlot').insertAdjacentHTML('beforebegin', shellHtml);

  const shell = document.getElementById('mfShell');
  const collapsed = localStorage.getItem('musfox_sidebar_collapsed') === '1';
  if(collapsed) shell.classList.add('collapsed');

  const collapseBtn = document.getElementById('mfCollapseBtn');
  collapseBtn.addEventListener('click', () => {
    shell.classList.toggle('collapsed');
    localStorage.setItem('musfox_sidebar_collapsed', shell.classList.contains('collapsed') ? '1' : '0');
  });

  const topSearch = document.getElementById('mfTopSearch');
  topSearch.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && topSearch.value.trim()){
      const q = encodeURIComponent(topSearch.value.trim());
      window.location.href = rootPrefix + 'index.html?q=' + q + '#explorar';
    }
  });

  if(window.location.protocol === 'file:'){
    const banner = document.createElement('div');
    banner.style.cssText = 'background:#3a2a12;color:#ffcf8a;font-size:12.5px;padding:10px 16px;text-align:center;';
    banner.textContent = 'Estas abriendo el archivo directamente. Para que cargue la musica, sirve esta carpeta con un servidor local (ej. "npx serve" o "python -m http.server") y abre http://localhost.';
    document.getElementById('mfShellSlot').insertAdjacentElement('beforebegin', banner);
  }
}

function mfCreateTrackCard(video, options){
  options = options || {};
  const card = document.createElement('div');
  card.className = 'track-card' + (options.rank ? ' rank-card' : '');
  const safeTitle = (video.title || '').replace(/"/g,'&quot;');
  card.innerHTML = `
    ${options.rank ? `<div class="rank-num">#${options.rank}</div>` : ''}
    <div class="track-thumb">
      <img src="${video.thumbnail}" alt="${safeTitle}" loading="lazy">
      <div class="play-overlay">
        <svg viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
      </div>
      ${video.lengthSeconds ? `<div class="duration">${mfFormatDuration(video.lengthSeconds)}</div>` : ''}
    </div>
    <div class="track-title">${video.title || ''}</div>
    <div class="track-author">${video.author || ''}</div>
    <div class="track-views">${mfFormatViews(video.viewCount)}</div>
  `;
  card.addEventListener('click', () => {
    window.location.href = options.rootPrefix + 'view/music.html?id=' + video.videoId;
  });
  return card;
}

function mfSkeletonRow(count){
  const wrap = document.createElement('div');
  wrap.className = 'skeleton-row';
  for(let i=0;i<count;i++){
    wrap.innerHTML += `
      <div class="skeleton-card">
        <div class="skeleton-thumb"></div>
        <div class="skeleton-line" style="width:90%"></div>
        <div class="skeleton-line" style="width:60%"></div>
      </div>`;
  }
  return wrap;
}

function mfErrorState(container, message, retryFn){
  container.innerHTML = '';
  const div = document.createElement('div');
  div.className = 'state-msg';
  div.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
    <div class="state-title">No se pudo cargar la musica</div>
    <div>${message}</div>
    <button class="retry-btn">Reintentar</button>
  `;
  div.querySelector('.retry-btn').addEventListener('click', retryFn);
  container.appendChild(div);
}
