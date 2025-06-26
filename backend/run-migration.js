const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  let connection;

  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "music_db",
      charset: "utf8mb4",
    });

    console.log("数据库连接成功，开始执行迁移...");

    // 读取迁移文件
    const migrationPath = path.join(__dirname, "database", "migrate.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    // 分割SQL语句
    const statements = migrationSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    // 执行每个SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(
          `执行语句 ${i + 1}/${statements.length}:`,
          statement.substring(0, 50) + "..."
        );
        await connection.execute(statement);
      }
    }

    console.log("数据库迁移完成！");

    // 验证迁移结果
    const [songs] = await connection.execute(
      "SELECT id, name, lyrics, audio_url, cover_url FROM sing LIMIT 3"
    );
    console.log("验证迁移结果:");
    songs.forEach((song) => {
      console.log(`歌曲: ${song.name}`);
      console.log(`  - lyrics: ${song.lyrics ? "已设置" : "未设置"}`);
      console.log(`  - audio_url: ${song.audio_url || "未设置"}`);
      console.log(`  - cover_url: ${song.cover_url || "未设置"}`);
    });
  } catch (error) {
    console.error("迁移失败:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit();
  }
}

runMigration();
