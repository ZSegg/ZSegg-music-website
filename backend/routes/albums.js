const express = require("express");
const pool = require("../config/database");
const { auth } = require("../middleware/auth");

const router = express.Router();

// 获取专辑列表
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, name, singer_id, language } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    let params = [];

    if (name) {
      whereClause += " AND a.name LIKE ?";
      params.push(`%${name}%`);
    }
    if (singer_id) {
      whereClause += " AND a.singer_id = ?";
      params.push(singer_id);
    }
    if (language) {
      whereClause += " AND a.language = ?";
      params.push(language);
    }

    const [albums] = await pool.query(
      `
      SELECT a.*, sg.name as singer_name, sg.avatar as singer_avatar,
             (SELECT COUNT(*) FROM sing WHERE album_id = a.id) as song_count
      FROM album a
      LEFT JOIN singer sg ON a.singer_id = sg.id
      ${whereClause}
      ORDER BY a.hot DESC, a.id DESC
      LIMIT ? OFFSET ?
    `,
      [...params, parseInt(limit), offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM album a ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: albums,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error("获取专辑列表错误:", error);
    res.status(500).json({
      success: false,
      message: "获取专辑列表失败",
    });
  }
});

// 获取热门专辑
router.get("/hot", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [albums] = await pool.query(
      `
      SELECT a.*, sg.name as singer_name, sg.avatar as singer_avatar,
             (SELECT COUNT(*) FROM sing WHERE album_id = a.id) as song_count
      FROM album a
      LEFT JOIN singer sg ON a.singer_id = sg.id
      ORDER BY a.hot DESC
      LIMIT ?
    `,
      [parseInt(limit)]
    );

    res.json({
      success: true,
      data: albums,
    });
  } catch (error) {
    console.error("获取热门专辑错误:", error);
    res.status(500).json({
      success: false,
      message: "获取热门专辑失败",
    });
  }
});

// 获取专辑详情
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [albums] = await pool.query(
      `
      SELECT a.*, sg.name as singer_name, sg.avatar as singer_avatar,
             sg.sexy as singer_sexy, sg.birth as singer_birth,
             sg.area as singer_area, sg.master as singer_master,
             sg.description as singer_description, sg.hot as singer_hot
      FROM album a
      LEFT JOIN singer sg ON a.singer_id = sg.id
      WHERE a.id = ?
    `,
      [id]
    );

    if (albums.length === 0) {
      return res.status(404).json({
        success: false,
        message: "专辑不存在",
      });
    }

    const album = albums[0];

    // 获取专辑中的歌曲
    const [songs] = await pool.query(
      `
      SELECT s.*, sg.name as singer_name
      FROM sing s
      LEFT JOIN singer sg ON s.singer_id = sg.id
      WHERE s.album_id = ?
      ORDER BY s.id
    `,
      [id]
    );

    // 获取相关专辑（同歌手）
    const [relatedAlbums] = await pool.query(
      `
      SELECT a.*, sg.name as singer_name
      FROM album a
      LEFT JOIN singer sg ON a.singer_id = sg.id
      WHERE a.id != ? AND a.singer_id = ?
      ORDER BY a.hot DESC
      LIMIT 5
    `,
      [id, album.singer_id]
    );

    // 增加专辑热度
    await pool.execute("UPDATE album SET hot = hot + 1 WHERE id = ?", [id]);

    res.json({
      success: true,
      data: {
        ...album,
        songs: songs,
        related_albums: relatedAlbums,
      },
    });
  } catch (error) {
    console.error("获取专辑详情错误:", error);
    res.status(500).json({
      success: false,
      message: "获取专辑详情失败",
    });
  }
});

// 收藏专辑
router.post("/:id/collect", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查是否已收藏
    const [existing] = await pool.query(
      "SELECT * FROM collect WHERE user_id = ? AND rel_id = ? AND type = 'ALBUM'",
      [userId, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "已经收藏过这张专辑",
      });
    }

    // 添加收藏
    await pool.query(
      "INSERT INTO collect (user_id, rel_id, time, type) VALUES (?, ?, ?, ?)",
      [userId, id, new Date().toISOString().split("T")[0], "ALBUM"]
    );

    res.json({
      success: true,
      message: "收藏成功",
    });
  } catch (error) {
    console.error("收藏专辑错误:", error);
    res.status(500).json({
      success: false,
      message: "收藏失败",
    });
  }
});

// 取消收藏专辑
router.delete("/:id/collect", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      "DELETE FROM collect WHERE user_id = ? AND rel_id = ? AND type = 'ALBUM'",
      [userId, id]
    );

    res.json({
      success: true,
      message: "取消收藏成功",
    });
  } catch (error) {
    console.error("取消收藏专辑错误:", error);
    res.status(500).json({
      success: false,
      message: "取消收藏失败",
    });
  }
});

// 检查是否已收藏
router.get("/:id/collect/check", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await pool.query(
      "SELECT * FROM collect WHERE user_id = ? AND rel_id = ? AND type = 'ALBUM'",
      [userId, id]
    );

    res.json({
      success: true,
      data: {
        collected: result.length > 0,
      },
    });
  } catch (error) {
    console.error("检查收藏状态错误:", error);
    res.status(500).json({
      success: false,
      message: "检查收藏状态失败",
    });
  }
});

module.exports = router;
