const MF_PROVIDERS = [
  { type: 'piped', base: 'https://pipedapi.kavin.rocks' },
  { type: 'piped', base: 'https://piped-api.privacy.com.de' },
  { type: 'piped', base: 'https://pipedapi.adminforge.de' },
  { type: 'piped', base: 'https://api.piped.yt' },
  { type: 'piped', base: 'https://pipedapi.leptons.xyz' },
  { type: 'piped', base: 'https://pipedapi-libre.kavin.rocks' },
  { type: 'invidious', base: 'https://invidious.tiekoetter.com' },
  { type: 'invidious', base: 'https://yewtu.be' },
  { type: 'invidious', base: 'https://invidious.nerdvpn.de' }
];

const MF_CACHE = new Map();

async function mfFetchJson(url, timeoutMs){
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs || 9000);
  try{
    const res = await fetch(url, {
      signal: controller.signal,
      mode: 'cors',
      headers: { 'Accept': 'application/json' }
    });
    if(!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  }finally{
    clearTimeout(timer);
  }
}

function mfExtractVideoId(url){
  if(!url) return '';
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : url.replace('/watch?v=', '');
}

function mfNormalizePipedItem(item){
  const vid = mfExtractVideoId(item.url);
  return {
    videoId: vid,
    title: item.title || '',
    author: item.uploaderName || item.uploader || '',
    viewCount: typeof item.views === 'number' ? item.views : undefined,
    publishedText: item.uploadedDate || '',
    lengthSeconds: item.duration && item.duration > 0 ? item.duration : undefined,
    thumbnail: item.thumbnail || (vid ? `https://i.ytimg.com/vi/${vid}/mqdefault.jpg` : ''),
    description: item.shortDescription || ''
  };
}

function mfNormalizeInvidiousItem(item){
  const thumb = item.videoThumbnails && item.videoThumbnails.length
    ? (item.videoThumbnails.find(t => t.quality === 'medium') || item.videoThumbnails[0]).url
    : `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`;
  return {
    videoId: item.videoId,
    title: item.title || '',
    author: item.author || '',
    viewCount: typeof item.viewCount === 'number' ? item.viewCount : undefined,
    publishedText: item.publishedText || '',
    lengthSeconds: item.lengthSeconds,
    thumbnail: thumb.startsWith('http') ? thumb : `https://i.ytimg.com${thumb}`,
    description: item.description || item.descriptionHtml || ''
  };
}

async function mfRunAcrossProviders(taskPerProvider){
  let lastError = null;
  for(const provider of MF_PROVIDERS){
    try{
      const result = await taskPerProvider(provider);
      if(result && (!Array.isArray(result) || result.length > 0)){
        return result;
      }
    }catch(err){
      lastError = err;
    }
  }
  if(lastError) throw lastError;
  return [];
}

async function mfSearch(query){
  const cacheKey = 'search:' + query;
  if(MF_CACHE.has(cacheKey)) return MF_CACHE.get(cacheKey);

  const results = await mfRunAcrossProviders(async (provider) => {
    if(provider.type === 'piped'){
      const data = await mfFetchJson(`${provider.base}/search?q=${encodeURIComponent(query)}&filter=music_songs`);
      const items = (data.items || []).filter(i => i.url);
      return items.map(mfNormalizePipedItem).filter(v => v.videoId);
    }else{
      const data = await mfFetchJson(`${provider.base}/api/v1/search?q=${encodeURIComponent(query)}&type=video`);
      return (data || []).filter(i => i.videoId).map(mfNormalizeInvidiousItem);
    }
  });

  MF_CACHE.set(cacheKey, results);
  return results;
}

async function mfGetVideo(id){
  const cacheKey = 'video:' + id;
  if(MF_CACHE.has(cacheKey)) return MF_CACHE.get(cacheKey);

  const result = await mfRunAcrossProviders(async (provider) => {
    if(provider.type === 'piped'){
      const data = await mfFetchJson(`${provider.base}/streams/${id}`);
      if(!data || !data.title) return null;
      return {
        videoId: id,
        title: data.title || '',
        author: data.uploader || '',
        viewCount: typeof data.views === 'number' ? data.views : undefined,
        publishedText: data.uploadDate || '',
        lengthSeconds: data.duration,
        thumbnail: data.thumbnailUrl || `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
        description: data.description ? data.description.replace(/<[^>]+>/g, '') : '',
        related: (data.relatedStreams || []).filter(r => r.url).map(mfNormalizePipedItem)
      };
    }else{
      const data = await mfFetchJson(`${provider.base}/api/v1/videos/${id}`);
      if(!data || !data.title) return null;
      const norm = mfNormalizeInvidiousItem(data);
      norm.related = (data.recommendedVideos || []).filter(r => r.videoId).map(mfNormalizeInvidiousItem);
      return norm;
    }
  });

  if(!result) throw new Error('No se encontro informacion de esta cancion');
  MF_CACHE.set(cacheKey, result);
  return result;
}

function mfFormatViews(n){
  if(n === undefined || n === null) return '';
  if(n >= 1000000000) return (n/1000000000).toFixed(1).replace('.0','') + 'B reproducciones';
  if(n >= 1000000) return (n/1000000).toFixed(1).replace('.0','') + 'M reproducciones';
  if(n >= 1000) return (n/1000).toFixed(1).replace('.0','') + 'K reproducciones';
  return n + ' reproducciones';
}

function mfFormatDuration(sec){
  if(!sec && sec !== 0) return '';
  const m = Math.floor(sec/60);
  const s = Math.floor(sec%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

const MF_GENRES = [
  { label: 'Pop', query: 'pop hits 2026' },
  { label: 'Reggaetón', query: 'reggaeton 2026' },
  { label: 'Hip-Hop', query: 'hip hop 2026' },
  { label: 'Rock', query: 'rock 2026' },
  { label: 'Electrónica', query: 'electronic music 2026' },
  { label: 'Salsa', query: 'salsa 2026' },
  { label: 'Bachata', query: 'bachata 2026' },
  { label: 'Indie', query: 'indie music 2026' },
  { label: 'Trap', query: 'trap 2026' },
  { label: 'Cumbia', query: 'cumbia 2026' }
];
