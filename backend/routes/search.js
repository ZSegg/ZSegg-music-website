const express = require("express");
const pool = require("../config/database");

const router = express.Router();

// 综合搜索
router.get("/", async (req, res) => {
  try {
    const { q, type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "搜索关键词不能为空",
      });
    }

    const keyword = `%${q.trim()}%`;
    let results = {};

    // 搜索歌曲
    if (!type || type === "song") {
      const [songs] = await pool.query(
        `
        SELECT s.*, sg.name as singer_name, sg.avatar as singer_avatar,
               a.name as album_name, a.img as album_img,
               c.name as category_name
        FROM sing s
        LEFT JOIN singer sg ON s.singer_id = sg.id
        LEFT JOIN album a ON s.album_id = a.id
        LEFT JOIN category c ON s.category_id = c.id
        WHERE s.name LIKE ? OR sg.name LIKE ? OR a.name LIKE ?
        ORDER BY s.hot DESC
        LIMIT ? OFFSET ?
      `,
        [keyword, keyword, keyword, parseInt(limit), offset]
      );

      const [songCount] = await pool.query(
        `
        SELECT COUNT(*) as total FROM sing s
        LEFT JOIN singer sg ON s.singer_id = sg.id
        LEFT JOIN album a ON s.album_id = a.id
        WHERE s.name LIKE ? OR sg.name LIKE ? OR a.name LIKE ?
      `,
        [keyword, keyword, keyword]
      );

      results.songs = {
        data: songs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: songCount[0].total,
          pages: Math.ceil(songCount[0].total / limit),
        },
      };
    }

    // 搜索专辑
    if (!type || type === "album") {
      const [albums] = await pool.query(
        `
        SELECT a.*, sg.name as singer_name, sg.avatar as singer_avatar,
               (SELECT COUNT(*) FROM sing WHERE album_id = a.id) as song_count
        FROM album a
        LEFT JOIN singer sg ON a.singer_id = sg.id
        WHERE a.name LIKE ? OR sg.name LIKE ?
        ORDER BY a.hot DESC
        LIMIT ? OFFSET ?
      `,
        [keyword, keyword, parseInt(limit), offset]
      );

      const [albumCount] = await pool.query(
        `
        SELECT COUNT(*) as total FROM album a
        LEFT JOIN singer sg ON a.singer_id = sg.id
        WHERE a.name LIKE ? OR sg.name LIKE ?
      `,
        [keyword, keyword]
      );

      results.albums = {
        data: albums,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: albumCount[0].total,
          pages: Math.ceil(albumCount[0].total / limit),
        },
      };
    }

    // 搜索歌手
    if (!type || type === "singer") {
      const [singers] = await pool.query(
        `
        SELECT s.*,
               (SELECT COUNT(*) FROM album WHERE singer_id = s.id) as album_count,
               (SELECT COUNT(*) FROM sing WHERE singer_id = s.id) as song_count
        FROM singer s
        WHERE s.name LIKE ? OR s.area LIKE ? OR s.master LIKE ?
        ORDER BY s.hot DESC
        LIMIT ? OFFSET ?
      `,
        [keyword, keyword, keyword, parseInt(limit), offset]
      );

      const [singerCount] = await pool.query(
        `
        SELECT COUNT(*) as total FROM singer
        WHERE name LIKE ? OR area LIKE ? OR master LIKE ?
      `,
        [keyword, keyword, keyword]
      );

      results.singers = {
        data: singers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: singerCount[0].total,
          pages: Math.ceil(singerCount[0].total / limit),
        },
      };
    }

    // 搜索歌单
    if (!type || type === "playlist") {
      const [playlists] = await pool.query(
        `
        SELECT p.*, u.username, u.name as user_name, u.avatar as user_avatar,
               (SELECT COUNT(*) FROM playlist_item WHERE playlist_id = p.id) as song_count
        FROM playlist p
        LEFT JOIN user u ON p.user_id = u.id
        WHERE p.name LIKE ? OR p.description LIKE ? OR u.name LIKE ?
        ORDER BY p.hot DESC
        LIMIT ? OFFSET ?
      `,
        [keyword, keyword, keyword, parseInt(limit), offset]
      );

      const [playlistCount] = await pool.query(
        `
        SELECT COUNT(*) as total FROM playlist p
        LEFT JOIN user u ON p.user_id = u.id
        WHERE p.name LIKE ? OR p.description LIKE ? OR u.name LIKE ?
      `,
        [keyword, keyword, keyword]
      );

      results.playlists = {
        data: playlists,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: playlistCount[0].total,
          pages: Math.ceil(playlistCount[0].total / limit),
        },
      };
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("搜索错误:", error);
    res.status(500).json({
      success: false,
      message: "搜索失败",
    });
  }
});

// 搜索建议
router.get("/suggest", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json({
        success: true,
        data: [],
      });
    }

    const keyword = `%${q.trim()}%`;

    // 获取歌曲建议
    const [songSuggestions] = await pool.query(
      `
      SELECT DISTINCT s.name, 'song' as type, s.id
      FROM sing s
      WHERE s.name LIKE ?
      ORDER BY s.hot DESC
      LIMIT 5
    `,
      [keyword]
    );

    // 获取歌手建议
    const [singerSuggestions] = await pool.query(
      `
      SELECT DISTINCT name, 'singer' as type, id
      FROM singer
      WHERE name LIKE ?
      ORDER BY hot DESC
      LIMIT 5
    `,
      [keyword]
    );

    // 获取专辑建议
    const [albumSuggestions] = await pool.query(
      `
      SELECT DISTINCT name, 'album' as type, id
      FROM album
      WHERE name LIKE ?
      ORDER BY hot DESC
      LIMIT 5
    `,
      [keyword]
    );

    const suggestions = [
      ...songSuggestions,
      ...singerSuggestions,
      ...albumSuggestions,
    ].slice(0, 10);

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("获取搜索建议错误:", error);
    res.status(500).json({
      success: false,
      message: "获取搜索建议失败",
    });
  }
});

// 热门搜索
router.get("/hot", async (req, res) => {
  try {
    // 获取热门歌曲
    const [hotSongs] = await pool.query(
      `
      SELECT s.name, 'song' as type, s.id, s.hot
      FROM sing s
      ORDER BY s.hot DESC
      LIMIT 10
    `
    );

    // 获取热门歌手
    const [hotSingers] = await pool.query(
      `
      SELECT name, 'singer' as type, id, hot
      FROM singer
      ORDER BY hot DESC
      LIMIT 10
    `
    );

    // 获取热门专辑
    const [hotAlbums] = await pool.query(
      `
      SELECT name, 'album' as type, id, hot
      FROM album
      ORDER BY hot DESC
      LIMIT 10
    `
    );

    const hotSearch = [...hotSongs, ...hotSingers, ...hotAlbums]
      .sort((a, b) => b.hot - a.hot)
      .slice(0, 20);

    res.json({
      success: true,
      data: hotSearch,
    });
  } catch (error) {
    console.error("获取热门搜索错误:", error);
    res.status(500).json({
      success: false,
      message: "获取热门搜索失败",
    });
  }
});

module.exports = router;
