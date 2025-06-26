const express = require("express");
const pool = require("../config/database");

const router = express.Router();

// 获取首页数据
router.get("/", async (req, res) => {
  try {
    // 获取轮播图
    const [carousels] = await pool.execute(
      `
      SELECT c.*, a.name as album_name, a.img as album_img,
             sg.name as singer_name
      FROM carousel c
      LEFT JOIN album a ON c.album_id = a.id
      LEFT JOIN singer sg ON a.singer_id = sg.id
      ORDER BY c.id DESC
      LIMIT 5
    `
    );

    // 获取热门歌曲
    const [hotSongs] = await pool.execute(
      `
      SELECT s.*, sg.name as singer_name, sg.avatar as singer_avatar,
             a.name as album_name, a.img as album_img
      FROM sing s
      LEFT JOIN singer sg ON s.singer_id = sg.id
      LEFT JOIN album a ON s.album_id = a.id
      ORDER BY s.hot DESC
      LIMIT 10
    `
    );

    // 获取热门专辑
    const [hotAlbums] = await pool.execute(
      `
      SELECT a.*, sg.name as singer_name, sg.avatar as singer_avatar,
             (SELECT COUNT(*) FROM sing WHERE album_id = a.id) as song_count
      FROM album a
      LEFT JOIN singer sg ON a.singer_id = sg.id
      ORDER BY a.hot DESC
      LIMIT 8
    `
    );

    // 获取热门歌手
    const [hotSingers] = await pool.execute(
      `
      SELECT s.*,
             (SELECT COUNT(*) FROM album WHERE singer_id = s.id) as album_count,
             (SELECT COUNT(*) FROM sing WHERE singer_id = s.id) as song_count
      FROM singer s
      ORDER BY s.hot DESC
      LIMIT 8
    `
    );

    // 获取热门歌单
    const [hotPlaylists] = await pool.execute(
      `
      SELECT p.*, u.username, u.name as user_name, u.avatar as user_avatar,
             (SELECT COUNT(*) FROM playlist_item WHERE playlist_id = p.id) as song_count
      FROM playlist p
      LEFT JOIN user u ON p.user_id = u.id
      ORDER BY p.hot DESC
      LIMIT 8
    `
    );

    // 获取最新公告
    const [notices] = await pool.execute(
      `
      SELECT * FROM notice
      ORDER BY id DESC
      LIMIT 5
    `
    );

    res.json({
      success: true,
      data: {
        carousels,
        hot_songs: hotSongs,
        hot_albums: hotAlbums,
        hot_singers: hotSingers,
        hot_playlists: hotPlaylists,
        notices,
      },
    });
  } catch (error) {
    console.error("获取首页数据错误:", error);
    res.status(500).json({
      success: false,
      message: "获取首页数据失败",
    });
  }
});

// 获取推荐歌曲
router.get("/recommend", async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    // 基于热度的推荐
    const [recommendSongs] = await pool.execute(
      `
      SELECT s.*, sg.name as singer_name, sg.avatar as singer_avatar,
             a.name as album_name, a.img as album_img
      FROM sing s
      LEFT JOIN singer sg ON s.singer_id = sg.id
      LEFT JOIN album a ON s.album_id = a.id
      ORDER BY s.hot DESC, RAND()
      LIMIT ?
    `,
      [parseInt(limit)]
    );

    res.json({
      success: true,
      data: recommendSongs,
    });
  } catch (error) {
    console.error("获取推荐歌曲错误:", error);
    res.status(500).json({
      success: false,
      message: "获取推荐歌曲失败",
    });
  }
});

// 获取分类数据
router.get("/categories", async (req, res) => {
  try {
    const [categories] = await pool.execute(
      "SELECT * FROM category ORDER BY name"
    );

    // 为每个分类获取热门歌曲
    const categoryData = await Promise.all(
      categories.map(async (category) => {
        const [songs] = await pool.execute(
          `
          SELECT s.*, sg.name as singer_name, sg.avatar as singer_avatar,
                 a.name as album_name, a.img as album_img
          FROM sing s
          LEFT JOIN singer sg ON s.singer_id = sg.id
          LEFT JOIN album a ON s.album_id = a.id
          WHERE s.category_id = ?
          ORDER BY s.hot DESC
          LIMIT 6
        `,
          [category.id]
        );

        return {
          ...category,
          songs,
        };
      })
    );

    res.json({
      success: true,
      data: categoryData,
    });
  } catch (error) {
    console.error("获取分类数据错误:", error);
    res.status(500).json({
      success: false,
      message: "获取分类数据失败",
    });
  }
});

// 获取新歌推荐
router.get("/new-songs", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [newSongs] = await pool.execute(
      `
      SELECT s.*, sg.name as singer_name, sg.avatar as singer_avatar,
             a.name as album_name, a.img as album_img
      FROM sing s
      LEFT JOIN singer sg ON s.singer_id = sg.id
      LEFT JOIN album a ON s.album_id = a.id
      ORDER BY s.id DESC
      LIMIT ?
    `,
      [parseInt(limit)]
    );

    res.json({
      success: true,
      data: newSongs,
    });
  } catch (error) {
    console.error("获取新歌推荐错误:", error);
    res.status(500).json({
      success: false,
      message: "获取新歌推荐失败",
    });
  }
});

// 获取排行榜
router.get("/charts", async (req, res) => {
  try {
    // 歌曲排行榜
    const [songCharts] = await pool.execute(
      `
      SELECT s.*, sg.name as singer_name, sg.avatar as singer_avatar,
             a.name as album_name, a.img as album_img
      FROM sing s
      LEFT JOIN singer sg ON s.singer_id = sg.id
      LEFT JOIN album a ON s.album_id = a.id
      ORDER BY s.hot DESC
      LIMIT 20
    `
    );

    // 专辑排行榜
    const [albumCharts] = await pool.execute(
      `
      SELECT a.*, sg.name as singer_name, sg.avatar as singer_avatar,
             (SELECT COUNT(*) FROM sing WHERE album_id = a.id) as song_count
      FROM album a
      LEFT JOIN singer sg ON a.singer_id = sg.id
      ORDER BY a.hot DESC
      LIMIT 10
    `
    );

    // 歌手排行榜
    const [singerCharts] = await pool.execute(
      `
      SELECT s.*,
             (SELECT COUNT(*) FROM album WHERE singer_id = s.id) as album_count,
             (SELECT COUNT(*) FROM sing WHERE singer_id = s.id) as song_count
      FROM singer s
      ORDER BY s.hot DESC
      LIMIT 10
    `
    );

    res.json({
      success: true,
      data: {
        song_charts: songCharts,
        album_charts: albumCharts,
        singer_charts: singerCharts,
      },
    });
  } catch (error) {
    console.error("获取排行榜错误:", error);
    res.status(500).json({
      success: false,
      message: "获取排行榜失败",
    });
  }
});

module.exports = router;
