const express = require("express");
const pool = require("../config/database");
const { auth } = require("../middleware/auth");

const router = express.Router();

// 获取歌手列表
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 20, name, sexy, area } = req.query;
    const offset = (page - 1) * limit;

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
    if (area) {
      whereClause += " AND area LIKE ?";
      params.push(`%${area}%`);
    }

    const [singers] = await pool.execute(
      `
      SELECT s.*,
             (SELECT COUNT(*) FROM album WHERE singer_id = s.id) as album_count,
             (SELECT COUNT(*) FROM sing WHERE singer_id = s.id) as song_count
      FROM singer s
      ${whereClause}
      ORDER BY s.hot DESC, s.id DESC
      LIMIT ? OFFSET ?
    `,
      [...params, parseInt(limit), offset]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM singer ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: singers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
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

// 获取热门歌手
router.get("/hot", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    let limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum <= 0) limitNum = 10;
    // console.log("limitNum:", limitNum, typeof limitNum);
    const [singers] = await pool.query(
      `
      SELECT 
        s.*,
        COUNT(DISTINCT a.id) as album_count,
        COUNT(DISTINCT sg.id) as song_count
      FROM singer s
      LEFT JOIN album a ON a.singer_id = s.id
      LEFT JOIN sing sg ON sg.singer_id = s.id
      GROUP BY s.id
      ORDER BY s.hot DESC
      LIMIT ?
      `,
      [limitNum]
    );
    // console.log("singers:", singers);
    res.json({
      success: true,
      data: singers,
    });
  } catch (error) {
    console.error("获取热门歌手错误:", error);
    res.status(500).json({
      success: false,
      message: "获取热门歌手失败",
    });
  }
});

// 获取歌手详情
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [singers] = await pool.execute("SELECT * FROM singer WHERE id = ?", [
      id,
    ]);

    if (singers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "歌手不存在",
      });
    }

    const singer = singers[0];

    // 获取歌手的专辑
    const [albums] = await pool.execute(
      `
      SELECT a.*, (SELECT COUNT(*) FROM sing WHERE album_id = a.id) as song_count
      FROM album a
      WHERE a.singer_id = ?
      ORDER BY a.hot DESC
    `,
      [id]
    );

    // 获取歌手的歌曲
    const [songs] = await pool.execute(
      `
      SELECT s.*, a.name as album_name, a.img as album_img
      FROM sing s
      LEFT JOIN album a ON s.album_id = a.id
      WHERE s.singer_id = ?
      ORDER BY s.hot DESC
    `,
      [id]
    );

    // 获取相关歌手（同地区）
    const [relatedSingers] = await pool.execute(
      `
      SELECT s.*
      FROM singer s
      WHERE s.id != ? AND s.area = ?
      ORDER BY s.hot DESC
      LIMIT 5
    `,
      [id, singer.area]
    );

    // 增加歌手热度
    await pool.execute("UPDATE singer SET hot = hot + 1 WHERE id = ?", [id]);

    res.json({
      success: true,
      data: {
        ...singer,
        albums: albums,
        songs: songs,
        related_singers: relatedSingers,
      },
    });
  } catch (error) {
    console.error("获取歌手详情错误:", error);
    res.status(500).json({
      success: false,
      message: "获取歌手详情失败",
    });
  }
});

// 收藏歌手
router.post("/:id/collect", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查是否已收藏
    const [existing] = await pool.execute(
      "SELECT * FROM collect WHERE user_id = ? AND rel_id = ? AND type = 'SINGER'",
      [userId, id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "已经收藏过这个歌手",
      });
    }

    // 添加收藏
    await pool.execute(
      "INSERT INTO collect (user_id, rel_id, time, type) VALUES (?, ?, ?, ?)",
      [userId, id, new Date().toISOString().split("T")[0], "SINGER"]
    );

    res.json({
      success: true,
      message: "收藏成功",
    });
  } catch (error) {
    console.error("收藏歌手错误:", error);
    res.status(500).json({
      success: false,
      message: "收藏失败",
    });
  }
});

// 取消收藏歌手
router.delete("/:id/collect", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.execute(
      "DELETE FROM collect WHERE user_id = ? AND rel_id = ? AND type = 'SINGER'",
      [userId, id]
    );

    res.json({
      success: true,
      message: "取消收藏成功",
    });
  } catch (error) {
    console.error("取消收藏歌手错误:", error);
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
      "SELECT * FROM collect WHERE user_id = ? AND rel_id = ? AND type = 'SINGER'",
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
