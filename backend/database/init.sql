-- 创建数据库
CREATE DATABASE IF NOT EXISTS music_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE music_db;

-- 管理员表
CREATE TABLE IF NOT EXISTS admin (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255),
  password VARCHAR(255),
  name VARCHAR(255),
  avatar VARCHAR(255),
  role VARCHAR(255),
  phone VARCHAR(255),
  email VARCHAR(255)
);

-- 用户表
CREATE TABLE IF NOT EXISTS user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255),
  name VARCHAR(255),
  password VARCHAR(255),
  avatar VARCHAR(255),
  role VARCHAR(255),
  phone VARCHAR(255),
  email VARCHAR(255)
);

-- 歌手表
CREATE TABLE IF NOT EXISTS singer (
  id INT PRIMARY KEY AUTO_INCREMENT,
  avatar VARCHAR(255),
  name VARCHAR(255),
  sexy VARCHAR(255),
  birth VARCHAR(255),
  area VARCHAR(255),
  master VARCHAR(255),
  description TEXT,
  hot INT DEFAULT 0
);

-- 专辑表
CREATE TABLE IF NOT EXISTS album (
  id INT PRIMARY KEY AUTO_INCREMENT,
  img VARCHAR(255),
  name VARCHAR(255),
  singer_id INT,
  time VARCHAR(255),
  hot INT DEFAULT 0,
  language VARCHAR(255),
  company VARCHAR(255),
  description TEXT,
  FOREIGN KEY (singer_id) REFERENCES singer(id) ON DELETE SET NULL
);

-- 分类表
CREATE TABLE IF NOT EXISTS category (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255)
);

-- 歌曲表
CREATE TABLE IF NOT EXISTS sing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  composer VARCHAR(255),
  lyricist VARCHAR(255),
  singer_id INT,
  link VARCHAR(255),
  time VARCHAR(255),
  album_id INT,
  category_id INT,
  hot INT DEFAULT 0,
  duration VARCHAR(255),
  lyrics LONGTEXT,
  audio_url VARCHAR(255),
  cover_url VARCHAR(255),
  FOREIGN KEY (singer_id) REFERENCES singer(id) ON DELETE SET NULL,
  FOREIGN KEY (album_id) REFERENCES album(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE SET NULL
);

-- 歌单表
CREATE TABLE IF NOT EXISTS playlist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  img VARCHAR(255),
  name VARCHAR(255),
  user_id INT,
  time VARCHAR(255),
  description TEXT,
  hot INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 歌单歌曲表
CREATE TABLE IF NOT EXISTS playlist_item (
  id INT PRIMARY KEY AUTO_INCREMENT,
  playlist_id INT,
  song_id INT,
  user_id INT,
  FOREIGN KEY (playlist_id) REFERENCES playlist(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES sing(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 收藏表
CREATE TABLE IF NOT EXISTS collect (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  rel_id INT,
  time VARCHAR(255),
  type VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- 评论表
CREATE TABLE IF NOT EXISTS comment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  content VARCHAR(255),
  sing_id INT,
  time VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (sing_id) REFERENCES sing(id) ON DELETE CASCADE
);

-- 轮播图表
CREATE TABLE IF NOT EXISTS carousel (
  id INT PRIMARY KEY AUTO_INCREMENT,
  album_id INT,
  img VARCHAR(255),
  FOREIGN KEY (album_id) REFERENCES album(id) ON DELETE SET NULL
);

-- 公告表
CREATE TABLE IF NOT EXISTS notice (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  content TEXT,
  time VARCHAR(255)
);

-- 插入示例数据

-- 插入管理员
INSERT INTO admin (username, password, email) VALUES 
('admin', 'admin123', 'admin@example.com');

-- 插入用户
INSERT INTO user (username, password, email, name, role) VALUES 
('user1', 'password123', 'user1@example.com', '用户1', 'user'),
('user2', 'password123', 'user2@example.com', '用户2', 'user');

-- 插入歌手
INSERT INTO singer (name, sexy, birth, area, master, description) VALUES 
('周杰伦', 'male', '1979-01-18', '中国台湾', '华语流行乐坛天王', '华语流行乐坛天王'),
('邓紫棋', 'female', '1991-08-16', '中国香港', '华语流行乐坛天后', '华语流行乐坛天后'),
('五月天', 'group', '1997-03-29', '中国台湾', '华语摇滚乐团', '华语摇滚乐团');

-- 插入专辑
INSERT INTO album (name, singer_id, time, description) VALUES 
('叶惠美', 1, '2003-07-31', '周杰伦第四张专辑'),
('新的心跳', 2, '2015-11-06', '邓紫棋第五张专辑'),
('自传', 3, '2016-07-21', '五月天第九张专辑');

-- 插入歌曲
INSERT INTO sing (name, composer, lyricist, singer_id, link, time, album_id, category_id, hot, duration, lyrics, audio_url, cover_url) VALUES 
('晴天', '周杰伦', '周杰伦', 1, '/song/1', '269', 1, 1, 0, '269', '[00:00.00]晴天\n[00:03.50]周杰伦\n[00:07.00]故事的小黄花\n[00:10.50]从出生那年就飘着\n[00:14.00]童年的荡秋千\n[00:17.50]随记忆一直晃到现在\n[00:21.00]Re So So Si Do Si La\n[00:24.50]So La Si Si Si Si La Si La So\n[00:28.00]吹着前奏望着天空\n[00:31.50]我想起花瓣试着掉落', '/audio/1.mp3', '/cover/1.jpg'),
('泡沫', '邓紫棋', '邓紫棋', 2, '/song/2', '264', 2, 1, 0, '264', '[00:00.00]泡沫\n[00:03.50]邓紫棋\n[00:07.00]阳光下的泡沫\n[00:10.50]是彩色的\n[00:14.00]就像被骗的我\n[00:17.50]是幸福的\n[00:21.00]追究什么对错\n[00:24.50]你的谎言\n[00:28.00]基于你还爱我\n[00:31.50]美丽的泡沫', '/audio/2.mp3', '/cover/2.jpg'),
('倔强', '五月天', '五月天', 3, '/song/3', '258', 3, 2, 0, '258', '[00:00.00]倔强\n[00:03.50]五月天\n[00:07.00]当我和世界不一样\n[00:10.50]那就让我不一样\n[00:14.00]坚持对我来说\n[00:17.50]就是以刚克刚\n[00:21.00]我如果对自己妥协\n[00:24.50]如果对自己说谎\n[00:28.00]即使别人原谅\n[00:31.50]我也不能原谅', '/audio/3.mp3', '/cover/3.jpg');

-- 插入播放列表
INSERT INTO playlist (name, user_id, time, description) VALUES 
('我的最爱', 1, '2024-04-01', '我最喜欢的歌曲'),
('工作音乐', 1, '2024-04-02', '工作时听的音乐'),
('运动歌单', 2, '2024-04-03', '运动时听的音乐');

-- 插入播放列表项目
INSERT INTO playlist_item (playlist_id, song_id, user_id) VALUES 
(1, 1, 1),
(1, 2, 1),
(2, 3, 1);

-- 插入收藏
INSERT INTO collect (user_id, rel_id, time, type) VALUES 
(1, 1, '2024-04-01', 'song'),
(1, 1, '2024-04-01', 'album'),
(2, 2, '2024-04-02', 'song');

-- 插入评论
INSERT INTO comment (user_id, content, sing_id, time) VALUES 
(1, '非常好听的歌曲！', 1, '2024-04-01'),
(2, '经典专辑，值得收藏', 1, '2024-04-01');

-- 插入分类
INSERT INTO category (name) VALUES 
('流行'),
('摇滚'),
('民谣');

-- 插入轮播图
INSERT INTO carousel (album_id, img) VALUES 
(1, '/images/carousel1.jpg'),
(2, '/images/carousel2.jpg');

-- 插入公告
INSERT INTO notice (title, content, time) VALUES 
('系统维护通知', '系统将于今晚进行维护，请提前保存您的播放列表。', '2024-04-01'),
('新功能上线', '新增评论功能，欢迎体验！', '2024-04-02'); 