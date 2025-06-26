const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "music_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function checkAudioUrls() {
  try {
    console.log("检查数据库中的音频URL...");

    // 检查表结构
    const [columns] = await pool.query("DESCRIBE sing");
    console.log("歌曲表结构:");
    columns.forEach((col) => {
      console.log(`  ${col.Field}: ${col.Type}`);
    });

    // 获取所有歌曲
    const [songs] = await pool.query(
      "SELECT id, name, audio_url, link FROM sing LIMIT 10"
    );

    console.log("\n歌曲音频URL状态:");
    songs.forEach((song) => {
      console.log(`ID: ${song.id}, 名称: ${song.name}`);
      console.log(`  audio_url: ${song.audio_url || "NULL"}`);
      console.log(`  link: ${song.link || "NULL"}`);
      console.log("---");
    });
  } catch (error) {
    console.error("检查音频URL时出错:", error);
  } finally {
    await pool.end();
  }
}

checkAudioUrls();
