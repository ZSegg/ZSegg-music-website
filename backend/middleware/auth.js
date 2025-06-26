const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "请先登录",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key"
    );
    const [rows] = await pool.execute("SELECT * FROM user WHERE id = ?", [
      decoded.userId,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "用户不存在",
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "认证失败",
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "请先登录",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret_key"
    );
    const [rows] = await pool.execute("SELECT * FROM admin WHERE id = ?", [
      decoded.adminId,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "管理员不存在",
      });
    }

    req.admin = rows[0];
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "认证失败",
    });
  }
};

module.exports = { auth, adminAuth };
