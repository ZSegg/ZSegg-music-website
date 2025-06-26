const fs = require("fs");
const path = require("path");

// 创建上传目录结构
const uploadsDir = path.join(__dirname, "uploads");
const imagesDir = path.join(uploadsDir, "images");
const audioDir = path.join(uploadsDir, "audio");

// 创建目录
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("创建 uploads 目录");
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
  console.log("创建 uploads/images 目录");
}

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir);
  console.log("创建 uploads/audio 目录");
}

console.log("上传目录初始化完成！");
