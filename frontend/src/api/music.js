import api from "./index";

// 歌曲相关
export const getSongs = (params) => {
  return api.get("/songs", { params });
};

export const getSongById = (id) => {
  return api.get(`/songs/${id}`);
};

export const getHotSongs = () => {
  return api.get("/songs/hot");
};

export const getNewSongs = () => {
  return api.get("/songs/new");
};

// 专辑相关
export const getAlbums = (params) => {
  return api.get("/albums", { params });
};

export const getAlbumById = (id) => {
  return api.get(`/albums/${id}`);
};

export const getHotAlbums = () => {
  return api.get("/albums/hot");
};

// 歌手相关
export const getSingers = (params) => {
  return api.get("/singers", { params });
};

export const getSingerById = (id) => {
  return api.get(`/singers/${id}`);
};

export const getHotSingers = () => {
  return api.get("/singers/hot");
};

// 歌单相关
export const getPlaylists = (params) => {
  return api.get("/playlists", { params });
};

export const getPlaylistById = (id) => {
  return api.get(`/playlists/${id}`);
};

export const createPlaylist = (playlistData) => {
  return api.post("/playlists", playlistData);
};

export const updatePlaylist = (id, playlistData) => {
  return api.put(`/playlists/${id}`, playlistData);
};

export const deletePlaylist = (id) => {
  return api.delete(`/playlists/${id}`);
};

export const addSongToPlaylist = (playlistId, songId) => {
  return api.post(`/playlists/${playlistId}/songs`, { song_id: songId });
};

export const removeSongFromPlaylist = (playlistId, songId) => {
  return api.delete(`/playlists/${playlistId}/songs/${songId}`);
};

// 收藏相关
export const getCollections = (type) => {
  return api.get("/collections", { params: { type } });
};

export const addCollection = (data) => {
  return api.post("/collections", data);
};

export const removeCollection = (id) => {
  return api.delete(`/collections/${id}`);
};

// 评论相关
export const getComments = (songId) => {
  return api.get(`/songs/${songId}/comments`);
};

export const addComment = (songId, content) => {
  return api.post(`/songs/${songId}/comments`, { content });
};

export const deleteComment = (commentId) => {
  return api.delete(`/comments/${commentId}`);
};

// 搜索
export const search = (keyword, type = "all") => {
  return api.get("/search", { params: { q: keyword, type } });
};

// 搜索建议
export const getSearchSuggestions = (keyword) => {
  return api.get("/search/suggest", { params: { q: keyword } });
};

// 热门搜索
export const getHotSearch = () => {
  return api.get("/search/hot");
};

// 首页数据
export const getHomeData = () => {
  return api.get("/home");
};

// 用户相关
export const updateProfile = (userData) => {
  return api.put("/auth/profile", userData);
};

export const changePassword = (passwordData) => {
  return api.put("/auth/password", passwordData);
};

// 头像上传
export const uploadAvatar = (formData) => {
  return api.post("/auth/upload-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updatePlayCount = (id) => {
  return api.post(`/songs/${id}/play`);
};
