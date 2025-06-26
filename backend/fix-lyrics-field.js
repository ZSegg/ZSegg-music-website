const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function fixLyricsField() {
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

    console.log("数据库连接成功，开始修复 lyrics 字段...");

    // 修改 lyrics 字段类型为 LONGTEXT
    await connection.execute("ALTER TABLE sing MODIFY COLUMN lyrics LONGTEXT");
    console.log("✅ lyrics 字段类型已修改为 LONGTEXT");

    // 验证修改结果
    const [columns] = await connection.execute(
      `
      SELECT 
        COLUMN_NAME, 
        DATA_TYPE, 
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'sing' 
        AND COLUMN_NAME = 'lyrics'
    `,
      [process.env.DB_NAME || "music_db"]
    );

    if (columns.length > 0) {
      const column = columns[0];
      console.log("✅ 字段信息验证成功:");
      console.log(`  字段名: ${column.COLUMN_NAME}`);
      console.log(`  数据类型: ${column.DATA_TYPE}`);
      console.log(`  最大长度: ${column.CHARACTER_MAXIMUM_LENGTH}`);
      console.log(`  允许空值: ${column.IS_NULLABLE}`);
    }

    console.log("🎉 lyrics 字段修复完成！现在可以存储更长的歌词内容了。");
  } catch (error) {
    console.error("❌ 修复失败:", error.message);

    if (error.code === "ER_CANT_DROP_FIELD_OR_KEY") {
      console.log("💡 提示: 字段可能不存在，尝试添加字段...");
      try {
        await connection.execute("ALTER TABLE sing ADD COLUMN lyrics LONGTEXT");
        console.log("✅ 已添加 lyrics LONGTEXT 字段");
      } catch (addError) {
        console.error("❌ 添加字段也失败:", addError.message);
      }
    }
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit();
  }
}

fixLyricsField();
