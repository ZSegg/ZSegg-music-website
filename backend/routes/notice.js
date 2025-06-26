const express = require("express");
const pool = require("../config/database");
const { adminAuth } = require("../middleware/auth");

const router = express.Router();

// 获取公告列表
router.get("/", async (req, res) => {
  try {
    const [notices] = await pool.execute(
      "SELECT * FROM notice ORDER BY time DESC"
    );
    res.json({ success: true, data: notices });
  } catch (error) {
    console.error("获取公告错误:", error);
    res.status(500).json({ success: false, message: "获取公告失败" });
  }
});

// 新增公告（管理端）
router.post("/", adminAuth, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ success: false, message: "标题和内容不能为空" });
    }
    await pool.execute(
      "INSERT INTO notice (title, content, time) VALUES (?, ?, NOW())",
      [title, content]
    );
    res.json({ success: true, message: "添加成功" });
  } catch (error) {
    console.error("添加公告错误:", error);
    res.status(500).json({ success: false, message: "添加失败" });
  }
});

// 删除公告（管理端）
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM notice WHERE id = ?", [id]);
    res.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("删除公告错误:", error);
    res.status(500).json({ success: false, message: "删除失败" });
  }
});

// 编辑公告（管理端）
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    await pool.execute(
      "UPDATE notice SET title = ?, content = ? WHERE id = ?",
      [title, content, id]
    );
    res.json({ success: true, message: "更新成功" });
  } catch (error) {
    console.error("更新公告错误:", error);
    res.status(500).json({ success: false, message: "更新失败" });
  }
});

module.exports = router;
