import request from "./index";

// 管理员登录
export const adminLogin = (data) => {
  return request({
    url: "/admin/login",
    method: "post",
    data,
  });
};

// 获取管理员信息
export const getAdminInfo = () => {
  return request({
    url: "/admin/profile",
    method: "get",
  });
};

// 获取统计数据
export const getAdminStats = () => {
  return request({
    url: "/admin/stats",
    method: "get",
  });
};

// ==================== 歌曲管理 ====================

// 获取歌曲列表
export const getAdminSongs = (params) => {
  return request({
    url: "/admin/songs",
    method: "get",
    params,
  });
};

// 添加歌曲
export const addSong = (data) => {
  return request({
    url: "/admin/songs",
    method: "post",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 更新歌曲
export const updateSong = (id, data) => {
  return request({
    url: `/admin/songs/${id}`,
    method: "put",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 删除歌曲
export const deleteSong = (id) => {
  return request({
    url: `/admin/songs/${id}`,
    method: "delete",
  });
};

// ==================== 专辑管理 ====================

// 获取专辑列表
export const getAdminAlbums = (params) => {
  return request({
    url: "/admin/albums",
    method: "get",
    params,
  });
};

// 添加专辑
export const addAlbum = (data) => {
  return request({
    url: "/admin/albums",
    method: "post",
    data,
  });
};

// 更新专辑
export const updateAlbum = (id, data) => {
  return request({
    url: `/admin/albums/${id}`,
    method: "put",
    data,
  });
};

// 删除专辑
export const deleteAlbum = (id) => {
  return request({
    url: `/admin/albums/${id}`,
    method: "delete",
  });
};

// ==================== 歌手管理 ====================

// 获取歌手列表
export const getAdminSingers = (params) => {
  return request({
    url: "/admin/singers",
    method: "get",
    params,
  });
};

// 添加歌手
export const addSinger = (data) => {
  return request({
    url: "/admin/singers",
    method: "post",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 更新歌手
export const updateSinger = (id, data) => {
  return request({
    url: `/admin/singers/${id}`,
    method: "put",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 删除歌手
export const deleteSinger = (id) => {
  return request({
    url: `/admin/singers/${id}`,
    method: "delete",
  });
};

// ==================== 用户管理 ====================

// 获取用户列表
export const getAdminUsers = (params) => {
  return request({
    url: "/admin/users",
    method: "get",
    params,
  });
};

// 更新用户状态
export const updateUserStatus = (id, data) => {
  return request({
    url: `/admin/users/${id}/status`,
    method: "put",
    data,
  });
};

// ==================== 辅助接口 ====================

// 获取所有歌手（用于下拉选择）
export const getAllSingers = () => {
  return request({
    url: "/admin/singers/all",
    method: "get",
  });
};

// 获取所有专辑（用于下拉选择）
export const getAllAlbums = () => {
  return request({
    url: "/admin/albums/all",
    method: "get",
  });
};

// 获取所有分类（用于下拉选择）
export const getAllCategories = () => {
  return request({
    url: "/admin/categories/all",
    method: "get",
  });
};
