const pool = require("./config/database");

async function testConnection() {
  try {
    console.log("测试数据库连接...");
    const connection = await pool.getConnection();
    console.log("数据库连接成功！");

    // 测试查询
    const [rows] = await connection.execute(
      "SELECT COUNT(*) as count FROM user"
    );
    console.log("用户表记录数:", rows[0].count);

    const [songs] = await connection.execute(
      "SELECT COUNT(*) as count FROM sing"
    );
    console.log("歌曲表记录数:", songs[0].count);

    const [albums] = await connection.execute(
      "SELECT COUNT(*) as count FROM album"
    );
    console.log("专辑表记录数:", albums[0].count);

    const [singers] = await connection.execute(
      "SELECT COUNT(*) as count FROM singer"
    );
    console.log("歌手表记录数:", singers[0].count);

    connection.release();
    console.log("数据库测试完成！");
  } catch (error) {
    console.error("数据库连接错误:", error);
  } finally {
    process.exit();
  }
}

testConnection();
