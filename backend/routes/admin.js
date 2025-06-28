const express = require("express");
const pool = require("../config/database");
const { adminAuth } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// 设置上传目录和文件名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadDir;

    if (file.fieldname === "audio_file") {
      uploadDir = path.join(__dirname, "../uploads/audio");
    } else if (
      file.fieldname === "cover_file" ||
      file.fieldname === "avatar_file"
    ) {
      uploadDir = path.join(__dirname, "../uploads/singers");
    } else {
      uploadDir = path.join(__dirname, "../uploads");
    }

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
const upload = multer({ storage });

// 图片上传接口
router.post("/upload", adminAuth, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "未上传文件" });
  }
  res.json({
    success: true,
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
  });
});

// 管理员登录
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找管理员
    const [admins] = await pool.execute(
      "SELECT * FROM admin WHERE username = ?",
      [username]
    );

    if (admins.length === 0) {
      return res.status(400).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    const admin = admins[0];

    // 验证密码（这里假设密码是明文存储，实际应该加密）
    if (password !== admin.password) {
      return res.status(400).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    // 生成JWT token
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { adminId: admin.id },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // 返回管理员信息（不包含密码）
    const { password: _, ...adminInfo } = admin;

    res.json({
      success: true,
      message: "登录成功",
      token,
      admin: adminInfo,
    });
  } catch (error) {
    console.error("管理员登录错误:", error);
    res.status(500).json({
      success: false,
      message: "登录失败",
    });
  }
});

// 获取当前管理员信息
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "未提供认证令牌",
      });
    }

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key"
    );

    const adminId = decoded.adminId;
    const [admins] = await pool.execute("SELECT * FROM admin WHERE id = ?", [
      adminId,
    ]);

    if (admins.length === 0) {
      return res.status(404).json({
        success: false,
        message: "管理员不存在",
      });
    }

    // 返回管理员信息（不包含密码）
    const { password, ...adminInfo } = admins[0];

    res.json({
      success: true,
      data: adminInfo,
    });
  } catch (error) {
    console.error("获取管理员信息错误:", error);
    res.status(401).json({
      success: false,
      message: "认证失败",
    });
  }
});

// 获取统计数据
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const [userCount] = await pool.execute(
      "SELECT COUNT(*) as count FROM user"
    );
    const [songCount] = await pool.execute(
      "SELECT COUNT(*) as count FROM sing"
    );
    const [albumCount] = await pool.execute(
      "SELECT COUNT(*) as count FROM album"
    );
    const [singerCount] = await pool.execute(
      "SELECT COUNT(*) as count FROM singer"
    );
    const [playlistCount] = await pool.execute(
      "SELECT COUNT(*) as count FROM playlist"
    );

    res.json({
      success: true,
      data: {
        userCount: userCount[0].count,
        songCount: songCount[0].count,
        albumCount: albumCount[0].count,
        singerCount: singerCount[0].count,
        playlistCount: playlistCount[0].count,
      },
    });
  } catch (error) {
    console.error("获取统计数据错误:", error);
    res.status(500).json({
      success: false,
      message: "获取统计数据失败",
    });
  }
});

// ==================== 歌曲管理 ====================

// 获取歌曲列表
router.get("/songs", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, name, singer, album } = req.query;
    const limitNum = Number.isNaN(Number(limit)) ? 20 : Number(limit);
    const offsetNum = Number.isNaN(Number(page))
      ? 0
      : (Number(page) - 1) * limitNum;

    let whereClause = "WHERE 1=1";
    let params = [];

    if (name) {
      whereClause += " AND s.name LIKE ?";
      params.push(`%${name}%`);
    }
    if (singer) {
      whereClause += " AND sg.name LIKE ?";
      params.push(`%${singer}%`);
    }
    if (album) {
      whereClause += " AND a.name LIKE ?";
      params.push(`%${album}%`);
    }

    const [songs] = await pool.query(
      `
      SELECT s.*, sg.name as singer_name, a.name as album_name, c.name as category_name
      FROM sing s
      LEFT JOIN singer sg ON s.singer_id = sg.id
      LEFT JOIN album a ON s.album_id = a.id
      LEFT JOIN category c ON s.category_id = c.id
      ${whereClause}
      ORDER BY s.id DESC
      LIMIT ? OFFSET ?
    `,
      [...params, limitNum, offsetNum]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM sing s
       LEFT JOIN singer sg ON s.singer_id = sg.id
       LEFT JOIN album a ON s.album_id = a.id
       ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: songs,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limitNum),
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

// 添加歌曲
router.post(
  "/songs",
  adminAuth,
  upload.fields([
    { name: "audio_file", maxCount: 1 },
    { name: "cover_file", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        composer,
        lyricist,
        singer_id,
        album_id,
        category_id,
        duration,
        lyrics,
      } = req.body;

      let audio_url = "";
      let cover_url = "";

      // 处理音频文件上传
      if (req.files && req.files.audio_file) {
        const audioFile = req.files.audio_file[0];
        audio_url = `/uploads/audio/${audioFile.filename}`;
      }

      // 处理封面图片上传
      if (req.files && req.files.cover_file) {
        const coverFile = req.files.cover_file[0];
        cover_url = `/uploads/singers/${coverFile.filename}`;
      }

      const [result] = await pool.query(
        `INSERT INTO sing (name, composer, lyricist, singer_id, album_id, category_id, duration, lyrics, audio_url, cover_url, hot, time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          title,
          composer || "",
          lyricist || "",
          singer_id,
          album_id,
          category_id || null,
          duration,
          lyrics || "",
          audio_url,
          cover_url,
          0,
        ]
      );

      res.json({
        success: true,
        message: "歌曲添加成功",
        data: { id: result.insertId },
      });
    } catch (error) {
      console.error("添加歌曲错误:", error);
      res.status(500).json({
        success: false,
        message: "添加歌曲失败",
      });
    }
  }
);

// 更新歌曲
router.put(
  "/songs/:id",
  adminAuth,
  upload.fields([
    { name: "audio_file", maxCount: 1 },
    { name: "cover_file", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        composer,
        lyricist,
        singer_id,
        album_id,
        category_id,
        duration,
        lyrics,
      } = req.body;

      // 获取当前歌曲信息
      const [currentSong] = await pool.query(
        "SELECT audio_url, cover_url FROM sing WHERE id = ?",
        [id]
      );

      let audio_url = currentSong[0]?.audio_url || "";
      let cover_url = currentSong[0]?.cover_url || "";

      // 处理音频文件上传
      if (req.files && req.files.audio_file) {
        const audioFile = req.files.audio_file[0];
        audio_url = `/uploads/audio/${audioFile.filename}`;
      }

      // 处理封面图片上传
      if (req.files && req.files.cover_file) {
        const coverFile = req.files.cover_file[0];
        cover_url = `/uploads/singers/${coverFile.filename}`;
      }

      await pool.query(
        `UPDATE sing SET name = ?, composer = ?, lyricist = ?, singer_id = ?, album_id = ?, category_id = ?, duration = ?, 
       lyrics = ?, audio_url = ?, cover_url = ?
       WHERE id = ?`,
        [
          title,
          composer || "",
          lyricist || "",
          singer_id,
          album_id,
          category_id || null,
          duration,
          lyrics || "",
          audio_url,
          cover_url,
          id,
        ]
      );

      res.json({
        success: true,
        message: "歌曲更新成功",
      });
    } catch (error) {
      console.error("更新歌曲错误:", error);
      res.status(500).json({
        success: false,
        message: "更新歌曲失败",
      });
    }
  }
);

// 删除歌曲
router.delete("/songs/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM sing WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "歌曲删除成功",
    });
  } catch (error) {
    console.error("删除歌曲错误:", error);
    res.status(500).json({
      success: false,
      message: "删除歌曲失败",
    });
  }
});

// ==================== 专辑管理 ====================

// 获取专辑列表
router.get("/albums", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, name, singer } = req.query;
    const limitNum = Number.isNaN(Number(limit)) ? 20 : Number(limit);
    const offsetNum = Number.isNaN(Number(page))
      ? 0
      : (Number(page) - 1) * limitNum;

    let whereClause = "WHERE 1=1";
    let params = [];

    if (name) {
      whereClause += " AND a.name LIKE ?";
      params.push(`%${name}%`);
    }
    if (singer) {
      whereClause += " AND sg.name LIKE ?";
      params.push(`%${singer}%`);
    }

    const [albums] = await pool.query(
      `
      SELECT a.*, sg.name as singer_name,
             (SELECT COUNT(*) FROM sing WHERE album_id = a.id) as song_count
      FROM album a
      LEFT JOIN singer sg ON a.singer_id = sg.id
      ${whereClause}
      ORDER BY a.id DESC
      LIMIT ? OFFSET ?
    `,
      [...params, limitNum, offsetNum]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM album a
       LEFT JOIN singer sg ON a.singer_id = sg.id
       ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: albums,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limitNum),
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

// 添加专辑
router.post("/albums", adminAuth, async (req, res) => {
  try {
    const { img, name, singer_id, time, hot, language, company, description } =
      req.body;

    const [result] = await pool.query(
      `INSERT INTO album (img, name, singer_id, time, hot, language, company, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [img, name, singer_id, time, hot || 0, language, company, description]
    );

    res.json({
      success: true,
      message: "专辑添加成功",
      data: { id: result.insertId },
    });
  } catch (error) {
    console.error("添加专辑错误:", error);
    res.status(500).json({
      success: false,
      message: "添加专辑失败",
    });
  }
});

// 更新专辑
router.put("/albums/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { img, name, singer_id, time, hot, language, company, description } =
      req.body;

    await pool.query(
      `UPDATE album SET img = ?, name = ?, singer_id = ?, time = ?, 
       hot = ?, language = ?, company = ?, description = ?
       WHERE id = ?`,
      [img, name, singer_id, time, hot || 0, language, company, description, id]
    );

    res.json({
      success: true,
      message: "专辑更新成功",
    });
  } catch (error) {
    console.error("更新专辑错误:", error);
    res.status(500).json({
      success: false,
      message: "更新专辑失败",
    });
  }
});

// 删除专辑
router.delete("/albums/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM album WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "专辑删除成功",
    });
  } catch (error) {
    console.error("删除专辑错误:", error);
    res.status(500).json({
      success: false,
      message: "删除专辑失败",
    });
  }
});

// ==================== 歌手管理 ====================

// 获取歌手列表
router.get("/singers", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, name, sexy } = req.query;
    const limitNum = Number.isNaN(Number(limit)) ? 20 : Number(limit);
    const offsetNum = Number.isNaN(Number(page))
      ? 0
      : (Number(page) - 1) * limitNum;

    let whereClause = "WHERE 1=1";
    let params = [];

    if (name) {
      whereClause += " AND name LIKE ?";
      params.push(`%${name}%`);
    }
    if (sexy) {
      whereClause += " AND sexy = ?";
      params.push(sexy);
    }

    const [singers] = await pool.query(
      `
      SELECT s.*,
             (SELECT COUNT(*) FROM album WHERE singer_id = s.id) as album_count,
             (SELECT COUNT(*) FROM sing WHERE singer_id = s.id) as song_count
      FROM singer s
      ${whereClause}
      ORDER BY s.id DESC
      LIMIT ? OFFSET ?
    `,
      [...params, limitNum, offsetNum]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM singer ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: singers,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limitNum),
      },
    });
  } catch (error) {
    console.error("获取歌手列表错误:", error);
    res.status(500).json({
      success: false,
      message: "获取歌手列表失败",
    });
  }
});

// 添加歌手
router.post(
  "/singers",
  adminAuth,
  upload.single("avatar_file"),
  async (req, res) => {
    try {
      const { name, sexy, birth, area, master, description, hot } = req.body;

      let avatar = "";

      // 处理头像文件上传
      if (req.file) {
        avatar = `/uploads/singers/${req.file.filename}`;
      }

      const [result] = await pool.query(
        `INSERT INTO singer (avatar, name, sexy, birth, area, master, description, hot)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [avatar, name, sexy, birth, area, master, description, hot || 0]
      );

      res.json({
        success: true,
        message: "歌手添加成功",
        data: { id: result.insertId },
      });
    } catch (error) {
      console.error("添加歌手错误:", error);
      res.status(500).json({
        success: false,
        message: "添加歌手失败",
      });
    }
  }
);

// 更新歌手
router.put(
  "/singers/:id",
  adminAuth,
  upload.single("avatar_file"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, sexy, birth, area, master, description, hot } = req.body;

      // 获取当前歌手信息
      const [currentSinger] = await pool.query(
        "SELECT avatar FROM singer WHERE id = ?",
        [id]
      );

      let avatar = currentSinger[0]?.avatar || "";

      // 处理头像文件上传
      if (req.file) {
        avatar = `/uploads/singers/${req.file.filename}`;
      }

      await pool.query(
        `UPDATE singer SET avatar = ?, name = ?, sexy = ?, birth = ?, 
       area = ?, master = ?, description = ?, hot = ?
       WHERE id = ?`,
        [avatar, name, sexy, birth, area, master, description, hot || 0, id]
      );

      res.json({
        success: true,
        message: "歌手更新成功",
      });
    } catch (error) {
      console.error("更新歌手错误:", error);
      res.status(500).json({
        success: false,
        message: "更新歌手失败",
      });
    }
  }
);

// 删除歌手
router.delete("/singers/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM singer WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "歌手删除成功",
    });
  } catch (error) {
    console.error("删除歌手错误:", error);
    res.status(500).json({
      success: false,
      message: "删除歌手失败",
    });
  }
});

// ==================== 用户管理 ====================

// 获取用户列表
router.get("/users", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, username, email } = req.query;
    const limitNum = Number.isNaN(Number(limit)) ? 20 : Number(limit);
    const offsetNum = Number.isNaN(Number(page))
      ? 0
      : (Number(page) - 1) * limitNum;

    let whereClause = "WHERE 1=1";
    let params = [];

    if (username) {
      whereClause += " AND username LIKE ?";
      params.push(`%${username}%`);
    }
    if (email) {
      whereClause += " AND email LIKE ?";
      params.push(`%${email}%`);
    }

    const [users] = await pool.query(
      `
      SELECT u.*,
             (SELECT COUNT(*) FROM playlist WHERE user_id = u.id) as playlist_count,
             (SELECT COUNT(*) FROM collect WHERE user_id = u.id) as collect_count,
             (SELECT COUNT(*) FROM comment WHERE user_id = u.id) as comment_count
      FROM user u
      ${whereClause}
      ORDER BY u.id DESC
      LIMIT ? OFFSET ?
    `,
      [...params, limitNum, offsetNum]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM user ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limitNum),
      },
    });
  } catch (error) {
    console.error("获取用户列表错误:", error);
    res.status(500).json({
      success: false,
      message: "获取用户列表失败",
    });
  }
});

// ==================== 辅助接口 ====================

// 获取所有歌手（用于下拉选择）
router.get("/singers/all", adminAuth, async (req, res) => {
  try {
    const [singers] = await pool.execute(
      "SELECT id, name FROM singer ORDER BY name"
    );

    res.json({
      success: true,
      data: singers,
    });
  } catch (error) {
    console.error("获取歌手列表错误:", error);
    res.status(500).json({
      success: false,
      message: "获取歌手列表失败",
    });
  }
});

// 获取所有专辑（用于下拉选择）
router.get("/albums/all", adminAuth, async (req, res) => {
  try {
    const [albums] = await pool.query(
      "SELECT id, name FROM album ORDER BY name"
    );

    res.json({
      success: true,
      data: albums,
    });
  } catch (error) {
    console.error("获取专辑列表错误:", error);
    res.status(500).json({
      success: false,
      message: "获取专辑列表失败",
    });
  }
});

// 获取所有分类（用于下拉选择）
router.get("/categories/all", adminAuth, async (req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT id, name FROM category ORDER BY name"
    );

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("获取分类列表错误:", error);
    res.status(500).json({
      success: false,
      message: "获取分类列表失败",
    });
  }
});

module.exports = router;
