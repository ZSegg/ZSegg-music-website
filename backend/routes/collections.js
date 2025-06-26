const express = require("express");
const pool = require("../config/database");
const { auth } = require("../middleware/auth");

const router = express.Router();

// 获取用户收藏列表
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE c.user_id = ?";
    let params = [userId];

    if (type) {
      whereClause += " AND c.type = ?";
      params.push(type);
    }

    const [collections] = await pool.query(
      `
      SELECT c.*, 
             CASE 
               WHEN c.type = 'SONG' THEN s.name
               WHEN c.type = 'ALBUM' THEN a.name
               WHEN c.type = 'SINGER' THEN sg.name
               WHEN c.type = 'PLAYLIST' THEN p.name
             END as item_name,
             CASE 
               WHEN c.type = 'SONG' THEN sg.name
               WHEN c.type = 'ALBUM' THEN sg.name
               WHEN c.type = 'SINGER' THEN sg.area
               WHEN c.type = 'PLAYLIST' THEN u.name
             END as item_info,
             CASE 
               WHEN c.type = 'SONG' THEN a.img
               WHEN c.type = 'ALBUM' THEN a.img
               WHEN c.type = 'SINGER' THEN sg.avatar
               WHEN c.type = 'PLAYLIST' THEN p.img
             END as item_img
      FROM collect c
      LEFT JOIN sing s ON c.type = 'SONG' AND c.rel_id = s.id
      LEFT JOIN album a ON (c.type = 'ALBUM' AND c.rel_id = a.id) OR (c.type = 'SONG' AND s.album_id = a.id)
      LEFT JOIN singer sg ON (c.type = 'SINGER' AND c.rel_id = sg.id) OR (c.type = 'SONG' AND s.singer_id = sg.id) OR (c.type = 'ALBUM' AND a.singer_id = sg.id)
      LEFT JOIN playlist p ON c.type = 'PLAYLIST' AND c.rel_id = p.id
      LEFT JOIN user u ON c.type = 'PLAYLIST' AND p.user_id = u.id
      ${whereClause}
      ORDER BY c.id DESC
      LIMIT ? OFFSET ?
    `,
      [...params, parseInt(limit), offset]
    );

    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM collect c ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: collections,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error("获取收藏列表错误:", error);
    res.status(500).json({
      success: false,
      message: "获取收藏列表失败",
    });
  }
});

// 获取收藏统计
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [stats] = await pool.execute(
      `
      SELECT 
        type,
        COUNT(*) as count
      FROM collect 
      WHERE user_id = ?
      GROUP BY type
    `,
      [userId]
    );

    const result = {
      song: 0,
      album: 0,
      singer: 0,
      playlist: 0,
      total: 0,
    };

    stats.forEach((item) => {
      const type = item.type.toLowerCase();
      result[type] = item.count;
      result.total += item.count;
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("获取收藏统计错误:", error);
    res.status(500).json({
      success: false,
      message: "获取收藏统计失败",
    });
  }
});

// 添加收藏
router.post("/", auth, async (req, res) => {
  try {
    const { relId, type } = req.body;
    const userId = req.user.id;

    if (!relId || !type) {
      return res.status(400).json({
        success: false,
        message: "缺少必要参数",
      });
    }

    // 检查是否已收藏
    const [existing] = await pool.execute(
      "SELECT * FROM collect WHERE user_id = ? AND rel_id = ? AND type = ?",
      [userId, relId, type]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "已经收藏过了",
      });
    }

    // 添加收藏
    await pool.execute(
      "INSERT INTO collect (user_id, rel_id, time, type) VALUES (?, ?, ?, ?)",
      [userId, relId, new Date().toISOString().split("T")[0], type]
    );

    res.json({
      success: true,
      message: "收藏成功",
    });
  } catch (error) {
    console.error("添加收藏错误:", error);
    res.status(500).json({
      success: false,
      message: "收藏失败",
    });
  }
});

// 删除收藏
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 检查收藏是否属于当前用户
    const [existing] = await pool.execute(
      "SELECT * FROM collect WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "收藏不存在",
      });
    }

    // 删除收藏
    await pool.execute("DELETE FROM collect WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);

    res.json({
      success: true,
      message: "取消收藏成功",
    });
  } catch (error) {
    console.error("删除收藏错误:", error);
    res.status(500).json({
      success: false,
      message: "取消收藏失败",
    });
  }
});

// 批量删除收藏
router.delete("/batch", auth, async (req, res) => {
  try {
    const { ids } = req.body;
    const userId = req.user.id;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "请选择要删除的收藏",
      });
    }

    // 删除指定的收藏
    await pool.execute("DELETE FROM collect WHERE id IN (?) AND user_id = ?", [
      ids,
      userId,
    ]);

    res.json({
      success: true,
      message: "删除成功",
    });
  } catch (error) {
    console.error("批量删除收藏错误:", error);
    res.status(500).json({
      success: false,
      message: "删除失败",
    });
  }
});

// 清空收藏
router.delete("/clear", auth, async (req, res) => {
  try {
    const { type } = req.query;
    const userId = req.user.id;

    let whereClause = "WHERE user_id = ?";
    let params = [userId];

    if (type) {
      whereClause += " AND type = ?";
      params.push(type);
    }

    await pool.execute(`DELETE FROM collect ${whereClause}`, params);

    res.json({
      success: true,
      message: "清空成功",
    });
  } catch (error) {
    console.error("清空收藏错误:", error);
    res.status(500).json({
      success: false,
      message: "清空失败",
    });
  }
});

module.exports = router;
