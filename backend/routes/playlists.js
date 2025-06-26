const express = require("express");
const pool = require("../config/database");
const { auth } = require("../middleware/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// 歌单封面上传配置
const coverStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/images/playlists");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});
const coverUpload = multer({ storage: coverStorage });

// 获取歌单列表
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, name, user_id } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    let params = [];

    if (name) {
      whereClause += " AND p.name LIKE ?";
      params.push(`%${name}%`);
    }
    if (user_id) {
      whereClause += " AND p.user_id = ?";
      params.push(user_id);
    }

    const [playlists] = await pool.query(
      `
      SELECT p.*, u.username, u.name as user_name, u.avatar as user_avatar,
             (SELECT COUNT(*) FROM playlist_item WHERE playlist_id = p.id) as song_count
      FROM playlist p
      LEFT JOIN user u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.hot DESC, p.id DESC
      LIMIT ? OFFSET ?
    `,
      [...params, parseInt(limit), offset]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM playlist p ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: playlists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error("获取歌单列表错误:", error);
    res.status(500).json({
      success: false,
      message: "获取歌单列表失败",
    });
  }
});

// 获取热门歌单
router.get("/hot", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [playlists] = await pool.execute(
      `
      SELECT p.*, u.username, u.name as user_name, u.avatar as user_avatar,
             (SELECT COUNT(*) FROM playlist_item WHERE playlist_id = p.id) as song_count
      FROM playlist p
      LEFT JOIN user u ON p.user_id = u.id
      ORDER BY p.hot DESC
      LIMIT ?
    `,
      [parseInt(limit)]
    );

    res.json({
      success: true,
      data: playlists,
    });
  } catch (error) {
    console.error("获取热门歌单错误:", error);
    res.status(500).json({
      success: false,
      message: "获取热门歌单失败",
    });
  }
});

// 获取歌单详情
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [playlists] = await pool.execute(
      `
      SELECT p.*, u.username, u.name as user_name, u.avatar as user_avatar
      FROM playlist p
      LEFT JOIN user u ON p.user_id = u.id
      WHERE p.id = ?
    `,
      [id]
    );

    if (playlists.length === 0) {
      return res.status(404).json({
        success: false,
        message: "歌单不存在",
      });
    }

    const playlist = playlists[0];

    // 获取歌单中的歌曲
    const [songs] = await pool.execute(
      `
      SELECT s.*, sg.name as singer_name, sg.avatar as singer_avatar,
             a.name as album_name, a.img as album_img
      FROM playlist_item pi
      LEFT JOIN sing s ON pi.song_id = s.id
      LEFT JOIN singer sg ON s.singer_id = sg.id
      LEFT JOIN album a ON s.album_id = a.id
      WHERE pi.playlist_id = ?
      ORDER BY pi.id
    `,
      [id]
    );

    // 增加歌单热度
    await pool.execute("UPDATE playlist SET hot = hot + 1 WHERE id = ?", [id]);

    res.json({
      success: true,
      data: {
        ...playlist,
        songs: songs,
      },
    });
  } catch (error) {
    console.error("获取歌单详情错误:", error);
    res.status(500).json({
      success: false,
      message: "获取歌单详情失败",
    });
  }
});

// 创建歌单
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, img } = req.body;
    console.log("name: ", name);
    console.log("description: ", description);
    console.log("img: ", img);

    const userId = req.user.id;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "歌单名称不能为空",
      });
    }

    const [result] = await pool.execute(
      "INSERT INTO playlist (img, name, user_id, time, description, hot) VALUES (?, ?, ?, ?, ?, ?)",
      [
        img || "",
        name.trim(),
        userId,
        new Date().toISOString().split("T")[0],
        description || "",
        0,
      ]
    );

    res.json({
      success: true,
      message: "歌单创建成功",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("创建歌单错误:", error);
    res.status(500).json({
      success: false,
      message: "创建歌单失败",
    });
  }
});

// 更新歌单
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, img } = req.body;
    const userId = req.user.id;

    // 检查歌单是否属于当前用户
    const [playlists] = await pool.execute(
      "SELECT * FROM playlist WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (playlists.length === 0) {
      return res.status(403).json({
        success: false,
        message: "无权修改此歌单",
      });
    }

    await pool.execute(
      "UPDATE playlist SET name = ?, description = ?, img = ? WHERE id = ?",
      [name, description, img, id]
    );

    res.json({
      success: true,
      message: "歌单更新成功",
    });
  } catch (error) {
    console.error("更新歌单错误:", error);
    res.status(500).json({
      success: false,
      message: "更新歌单失败",
    });
  }
});

// 删除歌单
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查歌单是否属于当前用户
    const [playlists] = await pool.execute(
      "SELECT * FROM playlist WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (playlists.length === 0) {
      return res.status(403).json({
        success: false,
        message: "无权删除此歌单",
      });
    }

    await pool.execute("DELETE FROM playlist WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "歌单删除成功",
    });
  } catch (error) {
    console.error("删除歌单错误:", error);
    res.status(500).json({
      success: false,
      message: "删除歌单失败",
    });
  }
});

// 添加歌曲到歌单
router.post("/:id/songs", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { song_id } = req.body;
    const userId = req.user.id;

    // 检查歌单是否属于当前用户
    const [playlists] = await pool.execute(
      "SELECT * FROM playlist WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (playlists.length === 0) {
      return res.status(403).json({
        success: false,
        message: "无权操作此歌单",
      });
    }

    // 检查歌曲是否已在歌单中
    const [existing] = await pool.execute(
      "SELECT * FROM playlist_item WHERE playlist_id = ? AND song_id = ?",
      [id, song_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "歌曲已在歌单中",
      });
    }

    // 添加歌曲到歌单
    await pool.query(
      "INSERT INTO playlist_item (playlist_id, song_id, user_id) VALUES (?, ?, ?)",
      [id, song_id, userId]
    );

    res.json({
      success: true,
      message: "歌曲添加成功",
    });
  } catch (error) {
    console.error("添加歌曲到歌单错误:", error);
    res.status(500).json({
      success: false,
      message: "添加歌曲失败",
    });
  }
});

// 从歌单移除歌曲
router.delete("/:id/songs/:song_id", auth, async (req, res) => {
  try {
    const { id, song_id } = req.params;
    const userId = req.user.id;

    // 检查歌单是否属于当前用户
    const [playlists] = await pool.execute(
      "SELECT * FROM playlist WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (playlists.length === 0) {
      return res.status(403).json({
        success: false,
        message: "无权操作此歌单",
      });
    }

    await pool.execute(
      "DELETE FROM playlist_item WHERE playlist_id = ? AND song_id = ?",
      [id, song_id]
    );

    res.json({
      success: true,
      message: "歌曲移除成功",
    });
  } catch (error) {
    console.error("从歌单移除歌曲错误:", error);
    res.status(500).json({
      success: false,
      message: "移除歌曲失败",
    });
  }
});

// 收藏歌单
router.post("/:id/collect", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查是否已收藏
    const [existing] = await pool.execute(
      "SELECT * FROM collect WHERE user_id = ? AND rel_id = ? AND type = 'PLAYLIST'",
      [userId, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "已经收藏过这个歌单",
      });
    }

    // 添加收藏
    await pool.execute(
      "INSERT INTO collect (user_id, rel_id, time, type) VALUES (?, ?, ?, ?)",
      [userId, id, new Date().toISOString().split("T")[0], "PLAYLIST"]
    );

    res.json({
      success: true,
      message: "收藏成功",
    });
  } catch (error) {
    console.error("收藏歌单错误:", error);
    res.status(500).json({
      success: false,
      message: "收藏失败",
    });
  }
});

// 取消收藏歌单
router.delete("/:id/collect", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.execute(
      "DELETE FROM collect WHERE user_id = ? AND rel_id = ? AND type = 'PLAYLIST'",
      [userId, id]
    );

    res.json({
      success: true,
      message: "取消收藏成功",
    });
  } catch (error) {
    console.error("取消收藏歌单错误:", error);
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
      "SELECT * FROM collect WHERE user_id = ? AND rel_id = ? AND type = 'PLAYLIST'",
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

// 歌单封面上传接口
router.post("/upload-cover", auth, coverUpload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "未上传文件" });
  }
  const url = `/api/uploads/images/playlists/${req.file.filename}`;
  res.json({ success: true, url, filename: req.file.filename });
});

module.exports = router;
