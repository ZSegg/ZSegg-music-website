const express = require("express");
const pool = require("../config/database");
const { adminAuth } = require("../middleware/auth");

const router = express.Router();

// 获取分类列表
router.get("/", async (req, res) => {
  try {
    const [categories] = await pool.execute(
      "SELECT * FROM category ORDER BY name"
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

// 获取分类详情
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // 获取分类信息
    const [categories] = await pool.execute(
      "SELECT * FROM category WHERE id = ?",
      [id]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "分类不存在",
      });
    }

    const category = categories[0];

    // 获取该分类下的歌曲
    const [songs] = await pool.execute(
      `
      SELECT s.*, sg.name as singer_name, sg.avatar as singer_avatar,
             a.name as album_name, a.img as album_img
      FROM sing s
      LEFT JOIN singer sg ON s.singer_id = sg.id
      LEFT JOIN album a ON s.album_id = a.id
      WHERE s.category_id = ?
      ORDER BY s.hot DESC, s.id DESC
      LIMIT ? OFFSET ?
    `,
      [id, parseInt(limit), offset]
    );

    const [countResult] = await pool.execute(
      "SELECT COUNT(*) as total FROM sing WHERE category_id = ?",
      [id]
    );

    res.json({
      success: true,
      data: {
        ...category,
        songs: songs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / limit),
        },
      },
    });
  } catch (error) {
    console.error("获取分类详情错误:", error);
    res.status(500).json({
      success: false,
      message: "获取分类详情失败",
    });
  }
});

// 新增分类（管理端）
router.post("/", adminAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "分类名称不能为空" });
    }
    await pool.execute("INSERT INTO category (name) VALUES (?)", [name]);
    res.json({ success: true, message: "添加成功" });
  } catch (error) {
    console.error("添加分类错误:", error);
    res.status(500).json({ success: false, message: "添加失败" });
  }
});

// 删除分类（管理端）
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM category WHERE id = ?", [id]);
    res.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("删除分类错误:", error);
    res.status(500).json({ success: false, message: "删除失败" });
  }
});

// 编辑分类（管理端）
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await pool.execute("UPDATE category SET name = ? WHERE id = ?", [name, id]);
    res.json({ success: true, message: "更新成功" });
  } catch (error) {
    console.error("更新分类错误:", error);
    res.status(500).json({ success: false, message: "更新失败" });
  }
});

module.exports = router;
