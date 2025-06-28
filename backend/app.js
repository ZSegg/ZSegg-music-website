const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/songs");
const albumRoutes = require("./routes/albums");
const singerRoutes = require("./routes/singers");
const playlistRoutes = require("./routes/playlists");
const collectionRoutes = require("./routes/collections");
const commentRoutes = require("./routes/comments");
const searchRoutes = require("./routes/search");
const homeRoutes = require("./routes/home");
const carouselRoutes = require("./routes/carousel");
const noticeRoutes = require("./routes/notice");
const categoryRoutes = require("./routes/category");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/api/uploads/images/users",
  express.static(path.join(__dirname, "uploads/images/users"))
);
app.use("/images", express.static("images"));

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/singers", singerRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/carousel", carouselRoutes);
app.use("/api/notice", noticeRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/admin", adminRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "服务器内部错误",
  });
});

// 404处理
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "接口不存在",
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
