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

async function fixAudioUrls() {
  try {
    console.log("开始修复音频URL...");

    // 获取所有歌曲
    const [songs] = await pool.query(
      "SELECT id, name, link, audio_url FROM sing"
    );

    for (const song of songs) {
      let newAudioUrl = "";

      // 如果已经有正确的audio_url，跳过
      if (song.audio_url && song.audio_url.startsWith("/uploads/audio/")) {
        console.log(
          `歌曲 "${song.name}" 已有正确的audio_url: ${song.audio_url}`
        );
        continue;
      }

      // 如果有旧的link字段，尝试转换为新的格式
      if (song.link && song.link.startsWith("/audio/")) {
        // 将 /audio/filename.mp3 转换为 /uploads/audio/filename.mp3
        const filename = song.link.replace("/audio/", "");
        newAudioUrl = `/uploads/audio/${filename}`;

        console.log(`歌曲 "${song.name}": ${song.link} -> ${newAudioUrl}`);

        // 更新数据库
        await pool.query(
          "UPDATE sing SET audio_url = ?, link = NULL WHERE id = ?",
          [newAudioUrl, song.id]
        );
      } else if (!song.audio_url) {
        console.log(`歌曲 "${song.name}" 没有音频文件`);
      }
    }

    console.log("音频URL修复完成！");
  } catch (error) {
    console.error("修复音频URL时出错:", error);
  } finally {
    await pool.end();
  }
}

fixAudioUrls();
