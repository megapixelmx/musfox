const MF_PL_KEY = 'musfox_playlists';

function mfGetPlaylists(){
  try{
    return JSON.parse(localStorage.getItem(MF_PL_KEY)) || [];
  }catch(e){
    return [];
  }
}

function mfSavePlaylists(list){
  localStorage.setItem(MF_PL_KEY, JSON.stringify(list));
}

function mfCreatePlaylist(name, description){
  const list = mfGetPlaylists();
  const playlist = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    name: name,
    description: description || '',
    tracks: [],
    createdAt: new Date().toISOString()
  };
  list.push(playlist);
  mfSavePlaylists(list);
  return playlist;
}

function mfDeletePlaylist(id){
  mfSavePlaylists(mfGetPlaylists().filter(p => p.id !== id));
}

function mfGetPlaylist(id){
  return mfGetPlaylists().find(p => p.id === id) || null;
}

function mfAddTrackToPlaylist(id, track){
  const list = mfGetPlaylists();
  const playlist = list.find(p => p.id === id);
  if(!playlist) return false;
  if(playlist.tracks.find(t => t.videoId === track.videoId)) return false;
  playlist.tracks.push(track);
  mfSavePlaylists(list);
  return true;
}

function mfRemoveTrackFromPlaylist(id, videoId){
  const list = mfGetPlaylists();
  const playlist = list.find(p => p.id === id);
  if(!playlist) return;
  playlist.tracks = playlist.tracks.filter(t => t.videoId !== videoId);
  mfSavePlaylists(list);
}
