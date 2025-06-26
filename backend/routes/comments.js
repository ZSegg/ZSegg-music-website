const express = require("express");
const pool = require("../config/database");
const { auth } = require("../middleware/auth");

const router = express.Router();

// 获取歌曲评论列表
router.get("/song/:song_id", async (req, res) => {
  try {
    const { song_id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [comments] = await pool.execute(
      `
      SELECT c.*, u.username, u.name, u.avatar
      FROM comment c
      LEFT JOIN user u ON c.user_id = u.id
      WHERE c.sing_id = ?
      ORDER BY c.id DESC
      LIMIT ? OFFSET ?
    `,
      [song_id, parseInt(limit), offset]
    );

    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM comment WHERE sing_id = ?",
      [song_id]
    );

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
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

// 获取用户评论列表
router.get("/user", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;

    const [comments] = await pool.execute(
      `
      SELECT c.*, s.name as song_name, s.link as song_link,
             sg.name as singer_name, a.name as album_name
      FROM comment c
      LEFT JOIN sing s ON c.sing_id = s.id
      LEFT JOIN singer sg ON s.singer_id = sg.id
      LEFT JOIN album a ON s.album_id = a.id
      WHERE c.user_id = ?
      ORDER BY c.id DESC
      LIMIT ? OFFSET ?
    `,
      [userId, parseInt(limit), offset]
    );

    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM comment WHERE user_id = ?",
      [userId]
    );

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error("获取用户评论错误:", error);
    res.status(500).json({
      success: false,
      message: "获取用户评论失败",
    });
  }
});

// 添加歌曲评论
router.post("/song/:song_id", auth, async (req, res) => {
  try {
    const { song_id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "评论内容不能为空",
      });
    }

    const [result] = await pool.execute(
      "INSERT INTO comment (user_id, content, sing_id, time) VALUES (?, ?, ?, ?)",
      [userId, content.trim(), song_id, new Date().toISOString().split("T")[0]]
    );

    // 获取新添加的评论
    const [comments] = await pool.execute(
      `
      SELECT c.*, u.username, u.name, u.avatar
      FROM comment c
      LEFT JOIN user u ON c.user_id = u.id
      WHERE c.id = ?
    `,
      [result.insertId]
    );

    res.json({
      success: true,
      message: "评论添加成功",
      data: comments[0],
    });
  } catch (error) {
    console.error("添加歌曲评论错误:", error);
    res.status(500).json({
      success: false,
      message: "添加评论失败",
    });
  }
});

// 删除评论
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查评论是否属于当前用户
    const [comments] = await pool.execute(
      "SELECT * FROM comment WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (comments.length === 0) {
      return res.status(403).json({
        success: false,
        message: "无权删除此评论",
      });
    }

    await pool.execute("DELETE FROM comment WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "评论删除成功",
    });
  } catch (error) {
    console.error("删除评论错误:", error);
    res.status(500).json({
      success: false,
      message: "删除评论失败",
    });
  }
});

// 获取评论统计
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [stats] = await pool.execute(
      "SELECT COUNT(*) as total FROM comment WHERE user_id = ?",
      [userId]
    );

    res.json({
      success: true,
      data: {
        total: stats[0].total,
      },
    });
  } catch (error) {
    console.error("获取评论统计错误:", error);
    res.status(500).json({
      success: false,
      message: "获取评论统计失败",
    });
  }
});

module.exports = router;
