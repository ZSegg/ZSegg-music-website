const express = require("express");
const pool = require("../config/database");
const { adminAuth } = require("../middleware/auth");

const router = express.Router();

// 获取轮播图列表
router.get("/", async (req, res) => {
  try {
    const [carousels] = await pool.execute(
      `
      SELECT c.*, a.name as album_name, a.img as album_img,
             sg.name as singer_name
      FROM carousel c
      LEFT JOIN album a ON c.album_id = a.id
      LEFT JOIN singer sg ON a.singer_id = sg.id
      ORDER BY c.id DESC
    `
    );

    res.json({
      success: true,
      data: carousels,
    });
  } catch (error) {
    console.error("获取轮播图列表错误:", error);
    res.status(500).json({
      success: false,
      message: "获取轮播图列表失败",
    });
  }
});

// 新增轮播图（管理端）
router.post("/", adminAuth, async (req, res) => {
  try {
    const { album_id, img } = req.body;
    if (!img) {
      return res.status(400).json({ success: false, message: "图片不能为空" });
    }
    await pool.execute("INSERT INTO carousel (album_id, img) VALUES (?, ?)", [
      album_id,
      img,
    ]);
    res.json({ success: true, message: "添加成功" });
  } catch (error) {
    console.error("添加轮播图错误:", error);
    res.status(500).json({ success: false, message: "添加失败" });
  }
});

// 删除轮播图（管理端）
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM carousel WHERE id = ?", [id]);
    res.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("删除轮播图错误:", error);
    res.status(500).json({ success: false, message: "删除失败" });
  }
});

// 编辑轮播图（管理端）
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { album_id, img } = req.body;
    await pool.execute(
      "UPDATE carousel SET album_id = ?, img = ? WHERE id = ?",
      [album_id, img, id]
    );
    res.json({ success: true, message: "更新成功" });
  } catch (error) {
    console.error("更新轮播图错误:", error);
    res.status(500).json({ success: false, message: "更新失败" });
  }
});

module.exports = router;
