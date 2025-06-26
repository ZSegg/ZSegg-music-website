const express = require("express");
const pool = require("../config/database");
const { auth } = require("../middleware/auth");

const router = express.Router();

// 获取歌曲列表
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      name,
      singer_id,
      album_id,
      category_id,
    } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    let params = [];

    if (name) {
      whereClause += " AND s.name LIKE ?";
      params.push(`%${name}%`);
    }
    if (singer_id) {
      whereClause += " AND s.singer_id = ?";
      params.push(singer_id);
    }
    if (album_id) {
      whereClause += " AND s.album_id = ?";
      params.push(album_id);
    }
    if (category_id) {
      whereClause += " AND s.category_id = ?";
      params.push(category_id);
    }

    const [songs] = await pool.execute(
      `
      SELECT s.*, sg.name as singer_name, sg.avatar as singer_avatar,
             a.name as album_name, a.img as album_img,
             c.name as category_name
      FROM sing s
      LEFT JOIN singer sg ON s.singer_id = sg.id
      LEFT JOIN album a ON s.album_id = a.id
      LEFT JOIN category c ON s.category_id = c.id
      ${whereClause}
      ORDER BY s.hot DESC, s.id DESC
      LIMIT ? OFFSET ?
    `,
      [...params, parseInt(limit), offset]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM sing s ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: songs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error("获取歌曲列表错误:", error);
    res.status(500).json({
      success: false,
      message: "获取歌曲列表失败",
    });
  }
});

// 获取热门歌曲
router.get("/hot", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    let limitNum = parseInt(limit);

    if (isNaN(limitNum) || limitNum <= 0) limitNum = 10;

    const [songs] = await pool.query(
      `
      SELECT s.*, sg.name as singer_name, sg.avatar as singer_avatar,
             a.name as album_name, a.img as album_img
      FROM sing s
      LEFT JOIN singer sg ON s.singer_id = sg.id
      LEFT JOIN album a ON s.album_id = a.id
      ORDER BY s.hot DESC
      LIMIT ?
    `,
      [limitNum]
    );

    res.json({
      success: true,
      data: songs,
    });
  } catch (error) {
    console.error("获取热门歌曲错误:", error);
    res.status(500).json({
      success: false,
      message: "获取热门歌曲失败",
    });
  }
});

// 获取新歌
router.get("/new", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    let limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum <= 0) limitNum = 10;

    const [songs] = await pool.query(
      `
      SELECT s.*, sg.name as singer_name, sg.avatar as singer_avatar,
             a.name as album_name, a.img as album_img
      FROM sing s
      LEFT JOIN singer sg ON s.singer_id = sg.id
      LEFT JOIN album a ON s.album_id = a.id
      ORDER BY s.id DESC
      LIMIT ?
    `,
      [limitNum]
    );

    res.json({
      success: true,
      data: songs,
    });
  } catch (error) {
    console.error("获取新歌错误:", error);
    res.status(500).json({
      success: false,
      message: "获取新歌失败",
    });
  }
});

// 获取歌曲详情
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [songs] = await pool.execute(
      `
      SELECT s.*, sg.name as singer_name, sg.avatar as singer_avatar,
             sg.sexy as singer_sexy, sg.birth as singer_birth, 
             sg.area as singer_area, sg.master as singer_master,
             sg.description as singer_description, sg.hot as singer_hot,
             a.name as album_name, a.img as album_img, a.time as album_time,
             a.hot as album_hot, a.language as album_language,
             a.company as album_company, a.description as album_description,
             c.name as category_name
      FROM sing s
      LEFT JOIN singer sg ON s.singer_id = sg.id
      LEFT JOIN album a ON s.album_id = a.id
      LEFT JOIN category c ON s.category_id = c.id
      WHERE s.id = ?
    `,
      [id]
    );

    if (songs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "歌曲不存在",
      });
    }

    const song = songs[0];

    // 获取相关歌曲（同歌手或同专辑）
    const [relatedSongs] = await pool.execute(
      `
      SELECT s.*, sg.name as singer_name
      FROM sing s
      LEFT JOIN singer sg ON s.singer_id = sg.id
      WHERE s.id != ? AND (s.singer_id = ? OR s.album_id = ?)
      ORDER BY s.hot DESC
      LIMIT 10
    `,
      [id, song.singer_id, song.album_id]
    );

    // 增加播放热度
    await pool.execute("UPDATE sing SET hot = hot + 1 WHERE id = ?", [id]);

    res.json({
      success: true,
      data: {
        ...song,
        related_songs: relatedSongs,
      },
    });
  } catch (error) {
    console.error("获取歌曲详情错误:", error);
    res.status(500).json({
      success: false,
      message: "获取歌曲详情失败",
    });
  }
});

// 收藏歌曲
router.post("/:id/collect", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查是否已收藏
    const [existing] = await pool.execute(
      "SELECT * FROM collect WHERE user_id = ? AND rel_id = ? AND type = 'SONG'",
      [userId, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "已经收藏过这首歌",
      });
    }

    // 添加收藏
    await pool.execute(
      "INSERT INTO collect (user_id, rel_id, time, type) VALUES (?, ?, ?, ?)",
      [userId, id, new Date().toISOString().split("T")[0], "SONG"]
    );

    res.json({
      success: true,
      message: "收藏成功",
    });
  } catch (error) {
    console.error("收藏歌曲错误:", error);
    res.status(500).json({
      success: false,
      message: "收藏失败",
    });
  }
});

// 取消收藏歌曲
router.delete("/:id/collect", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.execute(
      "DELETE FROM collect WHERE user_id = ? AND rel_id = ? AND type = 'SONG'",
      [userId, id]
    );

    res.json({
      success: true,
      message: "取消收藏成功",
    });
  } catch (error) {
    console.error("取消收藏歌曲错误:", error);
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

    const [result] = await pool.execute(
      "SELECT * FROM collect WHERE user_id = ? AND rel_id = ? AND type = 'SONG'",
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

// 获取歌曲评论
router.get("/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    const [comments] = await pool.query(
      `
      SELECT c.*, u.username, u.name, u.avatar
      FROM comment c
      LEFT JOIN user u ON c.user_id = u.id
      WHERE c.sing_id = ?
      ORDER BY c.id DESC
      LIMIT ? OFFSET ?
    `,
      [id, limitNum, offset]
    );

    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM comment WHERE sing_id = ?",
      [id]
    );

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limitNum),
      },
    });
  } catch (error) {
    console.error("获取歌曲评论错误:", error);
    res.status(500).json({
      success: false,
      message: "获取歌曲评论失败",
    });
  }
});

// 添加歌曲评论
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "评论内容不能为空",
      });
    }

    await pool.execute(
      "INSERT INTO comment (user_id, content, sing_id, time) VALUES (?, ?, ?, ?)",
      [userId, content.trim(), id, new Date().toISOString().split("T")[0]]
    );

    res.json({
      success: true,
      message: "评论添加成功",
    });
  } catch (error) {
    console.error("添加歌曲评论错误:", error);
    res.status(500).json({
      success: false,
      message: "添加评论失败",
    });
  }
});

// 更新播放次数
router.post("/:id/play", async (req, res) => {
  try {
    const { id } = req.params;

    // 增加播放热度
    await pool.execute("UPDATE sing SET hot = hot + 1 WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "播放次数更新成功",
    });
  } catch (error) {
    console.error("更新播放次数错误:", error);
    res.status(500).json({
      success: false,
      message: "更新播放次数失败",
    });
  }
});

module.exports = router;
