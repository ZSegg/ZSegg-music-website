const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const pool = require("../config/database");
const { auth } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// 设置头像上传配置
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/images/users");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `avatar-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    cb(null, filename);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("只允许上传图片文件"), false);
    }
  },
});

// 用户注册
router.post("/register", async (req, res) => {
  try {
    const { username, password, email, name, phone } = req.body;

    // 验证必填字段
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "用户名、密码和邮箱为必填项",
      });
    }

    // 检查用户名是否已存在
    const [existingUsers] = await pool.execute(
      "SELECT * FROM user WHERE username = ?",
      [username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "用户名已存在",
      });
    }

    // 检查邮箱是否已存在
    const [existingEmails] = await pool.execute(
      "SELECT * FROM user WHERE email = ?",
      [email]
    );

    if (existingEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: "邮箱已被注册",
      });
    }

    // 创建用户（直接存储明文密码）
    const [result] = await pool.execute(
      "INSERT INTO user (username, name, password, avatar, role, phone, email) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        username,
        name || username,
        password,
        "/images/users/default.jpg",
        "USER",
        phone || "",
        email,
      ]
    );

    // 生成JWT token
    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // 返回用户信息（不包含密码）
    const [newUser] = await pool.execute(
      "SELECT id, username, name, avatar, role, phone, email FROM user WHERE id = ?",
      [result.insertId]
    );

    res.json({
      success: true,
      message: "注册成功",
      token,
      user: newUser[0],
    });
  } catch (error) {
    console.error("用户注册错误:", error);
    res.status(500).json({
      success: false,
      message: "注册失败",
    });
  }
});

// 用户登录
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "用户名和密码为必填项",
      });
    }

    // 查找用户
    const [users] = await pool.execute(
      "SELECT * FROM user WHERE username = ? OR email = ?",
      [username, username]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    const user = users[0];
    // 直接比较明文密码
    const isValidPassword = password === user.password;
    if (!isValidPassword) {
      console.log("用户名或密码错误");
      return res.status(400).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user;

    console.log("userInfo:", userInfo);

    res.json({
      success: true,
      message: "登录成功",
      token,
      user: userInfo,
    });
  } catch (error) {
    console.error("用户登录错误:", error);
    res.status(500).json({
      success: false,
      message: "登录失败",
    });
  }
});

// 获取用户信息
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "未提供认证令牌",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key"
    );
    const userId = decoded.userId;

    const [users] = await pool.execute(
      "SELECT id, username, name, avatar, role, phone, email FROM user WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    res.json({
      success: true,
      data: users[0],
    });
  } catch (error) {
    console.error("获取用户信息错误:", error);
    res.status(401).json({
      success: false,
      message: "认证失败",
    });
  }
});

// 更新用户信息
router.put("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "未提供认证令牌",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key"
    );
    const userId = decoded.userId;

    const { name, avatar, phone, email } = req.body;

    // 检查邮箱是否被其他用户使用
    if (email) {
      const [existingEmails] = await pool.execute(
        "SELECT * FROM user WHERE email = ? AND id != ?",
        [email, userId]
      );

      if (existingEmails.length > 0) {
        return res.status(400).json({
          success: false,
          message: "邮箱已被其他用户使用",
        });
      }
    }
    console.log("name:", name);
    console.log("avatar:", avatar);
    console.log("phone:", phone);
    console.log("email:", email);
    console.log("userId:", userId);
    // 更新用户信息
    await pool.execute(
      "UPDATE user SET name = ?, avatar = ?, phone = ?, email = ? WHERE id = ?",
      [name, avatar, phone, email, userId]
    );

    // 获取更新后的用户信息
    const [users] = await pool.execute(
      "SELECT id, username, name, avatar, role, phone, email FROM user WHERE id = ?",
      [userId]
    );

    res.json({
      success: true,
      message: "用户信息更新成功",
      data: users[0],
    });
  } catch (error) {
    console.error("更新用户信息错误:", error);
    res.status(500).json({
      success: false,
      message: "更新用户信息失败",
    });
  }
});

// 修改密码
router.put("/password", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "未提供认证令牌",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key"
    );
    const userId = decoded.userId;

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "旧密码和新密码为必填项",
      });
    }

    // 获取用户当前密码
    const [users] = await pool.execute(
      "SELECT password FROM user WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    // 验证旧密码
    const isValidPassword = oldPassword === users[0].password;

    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "旧密码错误",
      });
    }

    // 更新密码
    await pool.query("UPDATE user SET password = ? WHERE id = ?", [
      newPassword,
      userId,
    ]);

    res.json({
      success: true,
      message: "密码修改成功",
    });
  } catch (error) {
    console.error("修改密码错误:", error);
    res.status(500).json({
      success: false,
      message: "修改密码失败",
    });
  }
});

// 头像上传接口
router.post(
  "/upload-avatar",
  auth,
  avatarUpload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "未上传文件",
        });
      }

      const userId = req.user.id;
      const avatarUrl = `/api/uploads/images/users/${req.file.filename}`;

      // 更新用户头像
      await pool.execute("UPDATE user SET avatar = ? WHERE id = ?", [
        avatarUrl,
        userId,
      ]);

      res.json({
        success: true,
        message: "头像上传成功",
        url: avatarUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("头像上传错误:", error);
      res.status(500).json({
        success: false,
        message: "头像上传失败",
      });
    }
  }
);

module.exports = router;
