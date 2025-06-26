-- 插入测试数据

-- 插入管理员
INSERT INTO admin (username, password, name, avatar, role, phone, email) VALUES 
('admin', 'admin123', '系统管理员', '/images/admin/admin.jpg', 'ADMIN', '13800138000', 'admin@example.com'),
('superadmin', 'super123', '超级管理员', '/images/admin/super.jpg', 'SUPER_ADMIN', '13800138001', 'super@example.com');

-- 插入用户
INSERT INTO user (username, name, password, avatar, role, phone, email) VALUES 
('user1', '张三', 'password123', '/images/users/user1.jpg', 'USER', '13800138002', 'user1@example.com'),
('user2', '李四', 'password123', '/images/users/user2.jpg', 'USER', '13800138003', 'user2@example.com'),
('user3', '王五', 'password123', '/images/users/user3.jpg', 'USER', '13800138004', 'user3@example.com'),
('user4', '赵六', 'password123', '/images/users/user4.jpg', 'USER', '13800138005', 'user4@example.com'),
('user5', '钱七', 'password123', '/images/users/user5.jpg', 'USER', '13800138006', 'user5@example.com');

-- 插入分类
INSERT INTO category (name) VALUES 
('流行'),
('摇滚'),
('民谣'),
('电子'),
('古典'),
('爵士'),
('说唱'),
('乡村');

-- 插入歌手
INSERT INTO singer (avatar, name, sexy, birth, area, master, description, hot) VALUES 
('/images/singers/jay.jpg', '周杰伦', '男', '1979-01-18', '中国台湾', '晴天', '华语流行乐坛天王，创作型歌手，音乐制作人', 100),
('/images/singers/gem.jpg', '邓紫棋', '女', '1991-08-16', '中国香港', '泡沫', '华语流行乐坛天后，创作型歌手', 95),
('/images/singers/mayday.jpg', '五月天', '组合', '1997-03-29', '中国台湾', '倔强', '华语摇滚乐团，由阿信、怪兽、石头、玛莎、冠佑组成', 90),
('/images/singers/jj.jpg', '林俊杰', '男', '1981-03-27', '新加坡', '学不会', '新加坡华语流行乐坛歌手，音乐制作人', 85),
('/images/singers/jolin.jpg', '蔡依林', '女', '1980-09-15', '中国台湾', '大艺术家', '华语流行乐坛天后，舞曲天后', 80),
('/images/singers/eason.jpg', '陈奕迅', '男', '1974-07-27', '中国香港', '浮夸', '香港华语流行乐坛歌手，被誉为"歌神"', 88),
('/images/singers/amei.jpg', '张惠妹', '女', '1972-08-09', '中国台湾', '掉了', '华语流行乐坛天后，阿妹', 82),
('/images/singers/leehom.jpg', '王力宏', '男', '1976-05-17', '美国', '大城小爱', '美籍华裔流行乐坛歌手，音乐制作人', 78);

-- 插入专辑
INSERT INTO album (img, name, singer_id, time, hot, language, company, description) VALUES 
('/images/albums/yehuimei.jpg', '叶惠美', 1, '2003-07-31', 95, '华语', '杰威尔音乐', '周杰伦第四张专辑，收录了《晴天》、《东风破》等经典歌曲'),
('/images/albums/newheartbeat.jpg', '新的心跳', 2, '2015-11-06', 90, '华语', '蜂鸟音乐', '邓紫棋第五张专辑，收录了《泡沫》、《喜欢你》等歌曲'),
('/images/albums/autobiography.jpg', '自传', 3, '2016-07-21', 85, '华语', '相信音乐', '五月天第九张专辑，收录了《倔强》、《温柔》等歌曲'),
('/images/albums/cannotlearn.jpg', '学不会', 4, '2011-12-31', 80, '华语', '华纳音乐', '林俊杰第九张专辑，收录了《学不会》、《那些你很冒险的梦》等歌曲'),
('/images/albums/muse.jpg', 'MUSE', 5, '2012-09-14', 75, '华语', '华纳音乐', '蔡依林第十二张专辑，收录了《大艺术家》、《诗人漫步》等歌曲'),
('/images/albums/u87.jpg', 'U-87', 6, '2005-06-07', 88, '粤语', '英皇娱乐', '陈奕迅第十张粤语专辑，收录了《浮夸》、《最佳损友》等歌曲'),
('/images/albums/amit.jpg', '阿密特', 7, '2009-06-26', 82, '华语', '金牌大风', '张惠妹第十五张专辑，收录了《掉了》、《开门见山》等歌曲'),
('/images/albums/hero.jpg', '盖世英雄', 8, '2005-12-30', 78, '华语', '索尼音乐', '王力宏第十张专辑，收录了《大城小爱》、《花田错》等歌曲');

-- 插入歌曲
INSERT INTO sing (name, composer, lyricist, singer_id, link, time, album_id, category_id, hot, duration) VALUES 
('晴天', '周杰伦', '周杰伦', 1, '/audio/qingtian.mp3', '2003-07-31', 1, 1, 15000, '4:29'),
('东风破', '周杰伦', '方文山', 1, '/audio/dongfengpo.mp3', '2003-07-31', 1, 1, 12000, '5:25'),
('泡沫', '邓紫棋', '邓紫棋', 2, '/audio/paomo.mp3', '2015-11-06', 2, 1, 18000, '4:24'),
('喜欢你', '邓紫棋', '邓紫棋', 2, '/audio/xihuanni.mp3', '2015-11-06', 2, 1, 16000, '3:55'),
('倔强', '阿信', '阿信', 3, '/audio/jueqiang.mp3', '2016-07-21', 3, 2, 14000, '4:18'),
('温柔', '阿信', '阿信', 3, '/audio/wenrou.mp3', '2016-07-21', 3, 2, 13000, '4:05'),
('学不会', '林俊杰', '姚若龙', 4, '/audio/xuebuhui.mp3', '2011-12-31', 4, 1, 11000, '4:45'),
('那些你很冒险的梦', '林俊杰', '王雅君', 4, '/audio/maoxian.mp3', '2011-12-31', 4, 1, 12500, '4:55'),
('大艺术家', '蔡依林', '严云农', 5, '/audio/dayishujia.mp3', '2012-09-14', 5, 1, 13500, '4:05'),
('诗人漫步', '蔡依林', '姚若龙', 5, '/audio/shiren.mp3', '2012-09-14', 5, 1, 11500, '3:55'),
('浮夸', '陈奕迅', '黄伟文', 6, '/audio/fukua.mp3', '2005-06-07', 6, 1, 14500, '4:45'),
('最佳损友', '陈奕迅', '黄伟文', 6, '/audio/sunyou.mp3', '2005-06-07', 6, 1, 12500, '4:35'),
('掉了', '张惠妹', '吴青峰', 7, '/audio/diaole.mp3', '2009-06-26', 7, 1, 13500, '4:05'),
('开门见山', '张惠妹', '林夕', 7, '/audio/kaimen.mp3', '2009-06-26', 7, 1, 11500, '3:55'),
('大城小爱', '王力宏', '王力宏', 8, '/audio/dacheng.mp3', '2005-12-30', 8, 1, 15500, '4:05'),
('花田错', '王力宏', '王力宏', 8, '/audio/huatian.mp3', '2005-12-30', 8, 1, 12500, '3:55');

-- 插入歌单
INSERT INTO playlist (img, name, user_id, time, description, hot) VALUES 
('/images/playlists/favorite.jpg', '我的最爱', 1, '2024-01-01', '我最喜欢的歌曲集合', 85),
('/images/playlists/work.jpg', '工作音乐', 1, '2024-01-02', '工作时听的轻音乐', 75),
('/images/playlists/sport.jpg', '运动歌单', 2, '2024-01-03', '运动时听的动感音乐', 80),
('/images/playlists/sleep.jpg', '睡前音乐', 2, '2024-01-04', '睡前放松的音乐', 70),
('/images/playlists/classic.jpg', '经典老歌', 3, '2024-01-05', '经典老歌合集', 90),
('/images/playlists/popular.jpg', '流行热歌', 3, '2024-01-06', '当下流行的热门歌曲', 95),
('/images/playlists/love.jpg', '情歌对唱', 4, '2024-01-07', '经典情歌对唱', 85),
('/images/playlists/rock.jpg', '摇滚精选', 5, '2024-01-08', '摇滚音乐精选', 80);

-- 插入歌单歌曲
INSERT INTO playlist_item (playlist_id, song_id, user_id) VALUES 
(1, 1, 1), (1, 3, 1), (1, 5, 1), (1, 7, 1), (1, 9, 1),
(2, 2, 1), (2, 4, 1), (2, 6, 1), (2, 8, 1),
(3, 1, 2), (3, 3, 2), (3, 5, 2), (3, 7, 2), (3, 9, 2), (3, 11, 2),
(4, 2, 2), (4, 4, 2), (4, 6, 2), (4, 8, 2),
(5, 1, 3), (5, 3, 3), (5, 5, 3), (5, 7, 3), (5, 9, 3),
(6, 2, 3), (6, 4, 3), (6, 6, 3), (6, 8, 3), (6, 10, 3),
(7, 1, 4), (7, 3, 4), (7, 5, 4), (7, 7, 4),
(8, 5, 5), (8, 11, 5), (8, 13, 5), (8, 15, 5);

-- 插入收藏
INSERT INTO collect (user_id, rel_id, time, type) VALUES 
(1, 1, '2024-01-01', 'SONG'), (1, 3, '2024-01-01', 'SONG'), (1, 1, '2024-01-01', 'ALBUM'), (1, 1, '2024-01-01', 'PLAYLIST'),
(2, 2, '2024-01-02', 'SONG'), (2, 4, '2024-01-02', 'SONG'), (2, 2, '2024-01-02', 'ALBUM'), (2, 2, '2024-01-02', 'PLAYLIST'),
(3, 5, '2024-01-03', 'SONG'), (3, 7, '2024-01-03', 'SONG'), (3, 3, '2024-01-03', 'ALBUM'), (3, 3, '2024-01-03', 'PLAYLIST'),
(4, 6, '2024-01-04', 'SONG'), (4, 8, '2024-01-04', 'SONG'), (4, 4, '2024-01-04', 'ALBUM'), (4, 4, '2024-01-04', 'PLAYLIST'),
(5, 9, '2024-01-05', 'SONG'), (5, 11, '2024-01-05', 'SONG'), (5, 5, '2024-01-05', 'ALBUM'), (5, 5, '2024-01-05', 'PLAYLIST');

-- 插入评论
INSERT INTO comment (user_id, content, sing_id, time) VALUES 
(1, '非常好听的歌曲，旋律优美！', 1, '2024-01-01'),
(2, '经典中的经典，百听不厌', 1, '2024-01-02'),
(3, '邓紫棋的声音很有特色', 3, '2024-01-03'),
(4, '五月天的歌总是能给人力量', 5, '2024-01-04'),
(5, '林俊杰的创作能力很强', 7, '2024-01-05'),
(1, '周杰伦的经典专辑，值得收藏', 1, '2024-01-06'),
(2, '邓紫棋的专辑质量很高', 3, '2024-01-07'),
(3, '五月天的音乐很有感染力', 5, '2024-01-08'),
(4, '这个歌单很棒，歌曲选择很用心', 1, '2024-01-09'),
(5, '工作时的好伴侣', 2, '2024-01-10');

-- 插入轮播图
INSERT INTO carousel (album_id, img) VALUES 
(1, '/images/carousel/new_songs.jpg'),
(2, '/images/carousel/hot_albums.jpg'),
(3, '/images/carousel/classic_songs.jpg'),
(4, '/images/carousel/popular_songs.jpg'),
(5, '/images/carousel/artist_recommend.jpg');

-- 插入公告
INSERT INTO notice (title, content, time) VALUES 
('系统维护通知', '系统将于今晚22:00-24:00进行维护，请提前保存您的播放列表。', '2024-01-01'),
('新功能上线', '新增评论功能，欢迎体验！现在您可以为喜欢的歌曲、专辑、播放列表添加评论了。', '2024-01-02'),
('会员特权', '开通会员享受无损音质、无广告播放等特权，详情请查看会员页面。', '2024-01-03'),
('活动通知', '新用户注册即送7天会员体验，快来体验吧！', '2024-01-04'),
('版权声明', '本站所有音乐资源均来自正版授权，请支持正版音乐。', '2024-01-05'); 