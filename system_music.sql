/*
 Navicat Premium Dump SQL

 Source Server         : 根用户
 Source Server Type    : MySQL
 Source Server Version : 80300 (8.3.0)
 Source Host           : localhost:3306
 Source Schema         : system_music

 Target Server Type    : MySQL
 Target Server Version : 80300 (8.3.0)
 File Encoding         : 65001

 Date: 26/06/2025 22:31:40
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admin
-- ----------------------------
DROP TABLE IF EXISTS `admin`;
CREATE TABLE `admin`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_admin_username`(`username` ASC) USING BTREE,
  INDEX `idx_admin_email`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of admin
-- ----------------------------
INSERT INTO `admin` VALUES (5, 'admin', 'admin123', '系统管理员', '/images/admin/admin.jpg', 'ADMIN', '13800138000', 'admin@example.com');
INSERT INTO `admin` VALUES (6, 'superadmin', 'super123', '超级管理员', '/images/admin/super.jpg', 'SUPER_ADMIN', '13800138001', 'super@example.com');

-- ----------------------------
-- Table structure for album
-- ----------------------------
DROP TABLE IF EXISTS `album`;
CREATE TABLE `album`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `singer_id` int NULL DEFAULT NULL,
  `time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `hot` int NULL DEFAULT 0,
  `language` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `company` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_album_name`(`name` ASC) USING BTREE,
  INDEX `idx_album_singer`(`singer_id` ASC) USING BTREE,
  CONSTRAINT `album_ibfk_1` FOREIGN KEY (`singer_id`) REFERENCES `singer` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_album_singer` FOREIGN KEY (`singer_id`) REFERENCES `singer` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of album
-- ----------------------------
INSERT INTO `album` VALUES (1, '/images/albums/yehuimei.jpg', '叶惠美', 1, '2003-07-31', 103, '华语', '杰威尔音乐', '周杰伦第四张专辑，收录了《晴天》、《东风破》等经典歌曲');
INSERT INTO `album` VALUES (2, '/images/albums/newheartbeat.jpg', '新的心跳', 2, '2015-11-06', 92, '华语', '蜂鸟音乐', '邓紫棋第五张专辑，收录了《泡沫》、《喜欢你》等歌曲');
INSERT INTO `album` VALUES (3, '/images/albums/autobiography.jpg', '自传', 3, '2016-07-21', 88, '华语', '相信音乐', '五月天第九张专辑，收录了《倔强》、《温柔》等歌曲');
INSERT INTO `album` VALUES (4, '/images/albums/cannotlearn.jpg', '学不会', 4, '2011-12-31', 80, '华语', '华纳音乐', '林俊杰第九张专辑，收录了《学不会》、《那些你很冒险的梦》等歌曲');
INSERT INTO `album` VALUES (5, '/images/albums/muse.jpg', 'MUSE', 5, '2012-09-14', 75, '华语', '华纳音乐', '蔡依林第十二张专辑，收录了《大艺术家》、《诗人漫步》等歌曲');
INSERT INTO `album` VALUES (6, '/images/albums/u87.jpg', 'U-87', 6, '2005-06-07', 91, '粤语', '英皇娱乐', '陈奕迅第十张粤语专辑，收录了《浮夸》、《最佳损友》等歌曲');
INSERT INTO `album` VALUES (7, '/images/albums/amit.jpg', '阿密特', 7, '2009-06-26', 82, '华语', '金牌大风', '张惠妹第十五张专辑，收录了《掉了》、《开门见山》等歌曲');
INSERT INTO `album` VALUES (8, '/images/albums/hero.jpg', '盖世英雄', 8, '2005-12-30', 78, '华语', '索尼音乐', '王力宏第十张专辑，收录了《大城小爱》、《花田错》等歌曲');

-- ----------------------------
-- Table structure for carousel
-- ----------------------------
DROP TABLE IF EXISTS `carousel`;
CREATE TABLE `carousel`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `album_id` int NULL DEFAULT NULL,
  `img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_carousel_album`(`album_id` ASC) USING BTREE,
  CONSTRAINT `carousel_ibfk_1` FOREIGN KEY (`album_id`) REFERENCES `album` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_carousel_album` FOREIGN KEY (`album_id`) REFERENCES `album` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of carousel
-- ----------------------------
INSERT INTO `carousel` VALUES (1, 1, '/images/carousel/new_songs.jpg');
INSERT INTO `carousel` VALUES (2, 2, '/images/carousel/hot_albums.jpg');
INSERT INTO `carousel` VALUES (3, 3, '/images/carousel/classic_songs.jpg');
INSERT INTO `carousel` VALUES (4, 4, '/images/carousel/popular_songs.jpg');
INSERT INTO `carousel` VALUES (5, 5, '/images/carousel/artist_recommend.jpg');

-- ----------------------------
-- Table structure for category
-- ----------------------------
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_category_name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of category
-- ----------------------------
INSERT INTO `category` VALUES (8, '乡村');
INSERT INTO `category` VALUES (5, '古典');
INSERT INTO `category` VALUES (2, '摇滚');
INSERT INTO `category` VALUES (3, '民谣');
INSERT INTO `category` VALUES (1, '流行');
INSERT INTO `category` VALUES (6, '爵士');
INSERT INTO `category` VALUES (4, '电子');
INSERT INTO `category` VALUES (7, '说唱');

-- ----------------------------
-- Table structure for collect
-- ----------------------------
DROP TABLE IF EXISTS `collect`;
CREATE TABLE `collect`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL DEFAULT NULL,
  `rel_id` int NULL DEFAULT NULL,
  `time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_collect_user`(`user_id` ASC) USING BTREE,
  INDEX `idx_collect_rel_type`(`rel_id` ASC, `type` ASC) USING BTREE,
  CONSTRAINT `collect_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_collect_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 24 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of collect
-- ----------------------------
INSERT INTO `collect` VALUES (22, 2, 3, '2025-06-25', 'ALBUM');
INSERT INTO `collect` VALUES (23, 2, 2, '2025-06-25', 'SINGER');

-- ----------------------------
-- Table structure for comment
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL DEFAULT NULL,
  `content` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sing_id` int NULL DEFAULT NULL,
  `time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_comment_song`(`sing_id` ASC) USING BTREE,
  INDEX `idx_comment_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`sing_id`) REFERENCES `sing` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_comment_sing` FOREIGN KEY (`sing_id`) REFERENCES `sing` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_comment_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of comment
-- ----------------------------

-- ----------------------------
-- Table structure for notice
-- ----------------------------
DROP TABLE IF EXISTS `notice`;
CREATE TABLE `notice`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of notice
-- ----------------------------
INSERT INTO `notice` VALUES (1, '系统维护通知', '系统将于今晚22:00-24:00进行维护，请提前保存您的播放列表。', '2024-01-01');
INSERT INTO `notice` VALUES (2, '新功能上线', '新增评论功能，欢迎体验！现在您可以为喜欢的歌曲、专辑、播放列表添加评论了。', '2024-01-02');
INSERT INTO `notice` VALUES (3, '会员特权', '开通会员享受无损音质、无广告播放等特权，详情请查看会员页面。', '2024-01-03');
INSERT INTO `notice` VALUES (4, '活动通知', '新用户注册即送7天会员体验，快来体验吧！', '2024-01-04');
INSERT INTO `notice` VALUES (5, '版权声明', '本站所有音乐资源均来自正版授权，请支持正版音乐。', '2024-01-05');

-- ----------------------------
-- Table structure for playlist
-- ----------------------------
DROP TABLE IF EXISTS `playlist`;
CREATE TABLE `playlist`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `user_id` int NULL DEFAULT NULL,
  `time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `hot` int NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_playlist_user`(`user_id` ASC) USING BTREE,
  CONSTRAINT `fk_playlist_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `playlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of playlist
-- ----------------------------
INSERT INTO `playlist` VALUES (17, '/api/uploads/images/playlists/1750867185100-168311585.jpg', 'test', 2, '2025-06-25', 'test', 2);

-- ----------------------------
-- Table structure for playlist_item
-- ----------------------------
DROP TABLE IF EXISTS `playlist_item`;
CREATE TABLE `playlist_item`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `playlist_id` int NULL DEFAULT NULL,
  `song_id` int NULL DEFAULT NULL,
  `user_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_playlist_item`(`playlist_id` ASC, `song_id` ASC) USING BTREE,
  INDEX `idx_playlist_user`(`user_id` ASC) USING BTREE,
  INDEX `fk_playlist_item_sing`(`song_id` ASC) USING BTREE,
  CONSTRAINT `fk_playlist_item_playlist` FOREIGN KEY (`playlist_id`) REFERENCES `playlist` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_playlist_item_sing` FOREIGN KEY (`song_id`) REFERENCES `sing` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_playlist_item_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `playlist_item_ibfk_1` FOREIGN KEY (`playlist_id`) REFERENCES `playlist` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `playlist_item_ibfk_2` FOREIGN KEY (`song_id`) REFERENCES `sing` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `playlist_item_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 39 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of playlist_item
-- ----------------------------

-- ----------------------------
-- Table structure for sing
-- ----------------------------
DROP TABLE IF EXISTS `sing`;
CREATE TABLE `sing`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `composer` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `lyricist` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `lyrics` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `singer_id` int NULL DEFAULT NULL,
  `audio_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `time` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `album_id` int NULL DEFAULT NULL,
  `category_id` int NULL DEFAULT NULL,
  `hot` int NULL DEFAULT 0,
  `duration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `cover_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_song_name`(`name` ASC) USING BTREE,
  INDEX `idx_song_singer`(`singer_id` ASC) USING BTREE,
  INDEX `idx_song_album`(`album_id` ASC) USING BTREE,
  INDEX `idx_song_category`(`category_id` ASC) USING BTREE,
  CONSTRAINT `fk_sing_album` FOREIGN KEY (`album_id`) REFERENCES `album` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_sing_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_sing_singer` FOREIGN KEY (`singer_id`) REFERENCES `singer` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `sing_ibfk_1` FOREIGN KEY (`singer_id`) REFERENCES `singer` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `sing_ibfk_2` FOREIGN KEY (`album_id`) REFERENCES `album` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `sing_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sing
-- ----------------------------
INSERT INTO `sing` VALUES (1, '晴天', '周杰伦', '周杰伦', '[00:00.00]晴天 - 周杰伦 (Jay Chou)\r\n[00:02.25]词：周杰伦\r\n[00:04.50]曲：周杰伦\r\n[00:06.75]编曲：周杰伦\r\n[00:09.00]制作人：周杰伦\r\n[00:11.25]合声：周杰伦\r\n[00:13.50]合声编写：周杰伦\r\n[00:15.75]吉他：蔡科俊Again\r\n[00:18.00]贝斯：陈任佑\r\n[00:20.25]鼓：陈柏州\r\n[00:22.51]录音助理：刘勇志\r\n[00:24.76]录音工程：杨瑞代（Alfa Studio）\r\n[00:27.01]混音工程：杨大纬（杨大纬录音工作室）\r\n[00:29.26]故事的小黄花\r\n[00:32.71]从出生那年就飘着\r\n[00:36.24]童年的荡秋千\r\n[00:39.75]随记忆一直晃到现在\r\n[00:42.91]Re So So Si Do Si La \r\n[00:45.93]So La Si Si Si Si La Si La So \r\n[00:49.87]吹着前奏望着天空\r\n[00:53.20]我想起花瓣试着掉落\r\n[00:56.72]为你翘课的那一天\r\n[00:58.83]花落的那一天\r\n[01:00.60]教室的那一间\r\n[01:02.32]我怎么看不见\r\n[01:04.12]消失的下雨天\r\n[01:05.81]我好想再淋一遍\r\n[01:09.99]没想到失去的勇气我还留着\r\n[01:16.12]好想再问一遍\r\n[01:17.97]你会等待还是离开\r\n[01:24.91]刮风这天我试过握着你手\r\n[01:30.45]但偏偏雨渐渐大到我看你不见\r\n[01:38.88]还要多久我才能在你身边\r\n[01:45.44]等到放晴的那天也许我会比较好一点\r\n[01:52.87]从前从前有个人爱你很久\r\n[01:58.54]但偏偏风渐渐把距离吹得好远\r\n[02:06.94]好不容易又能再多爱一天\r\n[02:13.50]但故事的最后你好像还是说了拜拜\r\n[02:34.90]为你翘课的那一天\r\n[02:36.88]花落的那一天\r\n[02:38.66]教室的那一间\r\n[02:40.39]我怎么看不见\r\n[02:42.15]消失的下雨天\r\n[02:43.87]我好想再淋一遍\r\n[02:48.00]没想到失去的勇气我还留着\r\n[02:54.15]好想再问一遍\r\n[02:56.03]你会等待还是离开\r\n[03:02.92]刮风这天我试过握着你手\r\n[03:08.49]但偏偏雨渐渐大到我看你不见\r\n[03:16.94]还要多久我才能在你身边\r\n[03:23.43]等到放晴的那天也许我会比较好一点\r\n[03:30.87]从前从前有个人爱你很久\r\n[03:37.14]偏偏风渐渐把距离吹得好远\r\n[03:44.88]好不容易又能再多爱一天\r\n[03:51.42]但故事的最后你好像还是说了拜拜\r\n[03:58.49]刮风这天我试过握着你手\r\n[04:01.97]但偏偏雨渐渐大到我看你不见\r\n[04:05.65]还要多久我才能够在你身边\r\n[04:09.07]等到放晴那天也许我会比较好一点\r\n[04:12.92]从前从前有个人爱你很久\r\n[04:15.91]但偏偏雨渐渐把距离吹得好远\r\n[04:19.38]好不容易又能再多爱一天\r\n[04:22.86]但故事的最后你好像还是说了拜\r\n[00:00.00]晴天 - 周杰伦 (Jay Chou)\r\n[00:02.25]词：周杰伦\r\n[00:04.50]曲：周杰伦\r\n[00:06.75]编曲：周杰伦\r\n[00:09.00]制作人：周杰伦\r\n[00:11.25]合声：周杰伦\r\n[00:13.50]合声编写：周杰伦\r\n[00:15.75]吉他：蔡科俊Again\r\n[00:18.00]贝斯：陈任佑\r\n[00:20.25]鼓：陈柏州\r\n[00:22.51]录音助理：刘勇志\r\n[00:24.76]录音工程：杨瑞代（Alfa Studio）\r\n[00:27.01]混音工程：杨大纬（杨大纬录音工作室）\r\n[00:29.26]故事的小黄花\r\n[00:32.71]从出生那年就飘着\r\n[00:36.24]童年的荡秋千\r\n[00:39.75]随记忆一直晃到现在\r\n[00:42.91]Re So So Si Do Si La \r\n[00:45.93]So La Si Si Si Si La Si La So \r\n[00:49.87]吹着前奏望着天空\r\n[00:53.20]我想起花瓣试着掉落\r\n[00:56.72]为你翘课的那一天\r\n[00:58.83]花落的那一天\r\n[01:00.60]教室的那一间\r\n[01:02.32]我怎么看不见\r\n[01:04.12]消失的下雨天\r\n[01:05.81]我好想再淋一遍\r\n[01:09.99]没想到失去的勇气我还留着\r\n[01:16.12]好想再问一遍\r\n[01:17.97]你会等待还是离开\r\n[01:24.91]刮风这天我试过握着你手\r\n[01:30.45]但偏偏雨渐渐大到我看你不见\r\n[01:38.88]还要多久我才能在你身边\r\n[01:45.44]等到放晴的那天也许我会比较好一点\r\n[01:52.87]从前从前有个人爱你很久\r\n[01:58.54]但偏偏风渐渐把距离吹得好远\r\n[02:06.94]好不容易又能再多爱一天\r\n[02:13.50]但故事的最后你好像还是说了拜拜\r\n[02:34.90]为你翘课的那一天\r\n[02:36.88]花落的那一天\r\n[02:38.66]教室的那一间\r\n[02:40.39]我怎么看不见\r\n[02:42.15]消失的下雨天\r\n[02:43.87]我好想再淋一遍\r\n[02:48.00]没想到失去的勇气我还留着\r\n[02:54.15]好想再问一遍\r\n[02:56.03]你会等待还是离开\r\n[03:02.92]刮风这天我试过握着你手\r\n[03:08.49]但偏偏雨渐渐大到我看你不见\r\n[03:16.94]还要多久我才能在你身边\r\n[03:23.43]等到放晴的那天也许我会比较好一点\r\n[03:30.87]从前从前有个人爱你很久\r\n[03:37.14]偏偏风渐渐把距离吹得好远\r\n[03:44.88]好不容易又能再多爱一天\r\n[03:51.42]但故事的最后你好像还是说了拜拜\r\n[03:58.49]刮风这天我试过握着你手\r\n[04:01.97]但偏偏雨渐渐大到我看你不见\r\n[04:05.65]还要多久我才能够在你身边\r\n[04:09.07]等到放晴那天也许我会比较好一点\r\n[04:12.92]从前从前有个人爱你很久\r\n[04:15.91]但偏偏雨渐渐把距离吹得好远\r\n[04:19.38]好不容易又能再多爱一天\r\n[04:22.86]但故事的最后你好像还是说了拜\r\n[00:00.00]晴天 - 周杰伦 (Jay Chou)\r\n[00:02.25]词：周杰伦\r\n[00:04.50]曲：周杰伦\r\n[00:06.75]编曲：周杰伦\r\n[00:09.00]制作人：周杰伦\r\n[00:11.25]合声：周杰伦\r\n[00:13.50]合声编写：周杰伦\r\n[00:15.75]吉他：蔡科俊Again\r\n[00:18.00]贝斯：陈任佑\r\n[00:20.25]鼓：陈柏州\r\n[00:22.51]录音助理：刘勇志\r\n[00:24.76]录音工程：杨瑞代（Alfa Studio）\r\n[00:27.01]混音工程：杨大纬（杨大纬录音工作室）\r\n[00:29.26]故事的小黄花\r\n[00:32.71]从出生那年就飘着\r\n[00:36.24]童年的荡秋千\r\n[00:39.75]随记忆一直晃到现在\r\n[00:42.91]Re So So Si Do Si La \r\n[00:45.93]So La Si Si Si Si La Si La So \r\n[00:49.87]吹着前奏望着天空\r\n[00:53.20]我想起花瓣试着掉落\r\n[00:56.72]为你翘课的那一天\r\n[00:58.83]花落的那一天\r\n[01:00.60]教室的那一间\r\n[01:02.32]我怎么看不见\r\n[01:04.12]消失的下雨天\r\n[01:05.81]我好想再淋一遍\r\n[01:09.99]没想到失去的勇气我还留着\r\n[01:16.12]好想再问一遍\r\n[01:17.97]你会等待还是离开\r\n[01:24.91]刮风这天我试过握着你手\r\n[01:30.45]但偏偏雨渐渐大到我看你不见\r\n[01:38.88]还要多久我才能在你身边\r\n[01:45.44]等到放晴的那天也许我会比较好一点\r\n[01:52.87]从前从前有个人爱你很久\r\n[01:58.54]但偏偏风渐渐把距离吹得好远\r\n[02:06.94]好不容易又能再多爱一天\r\n[02:13.50]但故事的最后你好像还是说了拜拜\r\n[02:34.90]为你翘课的那一天\r\n[02:36.88]花落的那一天\r\n[02:38.66]教室的那一间\r\n[02:40.39]我怎么看不见\r\n[02:42.15]消失的下雨天\r\n[02:43.87]我好想再淋一遍\r\n[02:48.00]没想到失去的勇气我还留着\r\n[02:54.15]好想再问一遍\r\n[02:56.03]你会等待还是离开\r\n[03:02.92]刮风这天我试过握着你手\r\n[03:08.49]但偏偏雨渐渐大到我看你不见\r\n[03:16.94]还要多久我才能在你身边\r\n[03:23.43]等到放晴的那天也许我会比较好一点\r\n[03:30.87]从前从前有个人爱你很久\r\n[03:37.14]偏偏风渐渐把距离吹得好远\r\n[03:44.88]好不容易又能再多爱一天\r\n[03:51.42]但故事的最后你好像还是说了拜拜\r\n[03:58.49]刮风这天我试过握着你手\r\n[04:01.97]但偏偏雨渐渐大到我看你不见\r\n[04:05.65]还要多久我才能够在你身边\r\n[04:09.07]等到放晴那天也许我会比较好一点\r\n[04:12.92]从前从前有个人爱你很久\r\n[04:15.91]但偏偏雨渐渐把距离吹得好远\r\n[04:19.38]好不容易又能再多爱一天\r\n[04:22.86]但故事的最后你好像还是说了拜[00:00.00]晴天 - 周杰伦 (Jay Chou)\r\n[00:02.25]词：周杰伦\r\n[00:04.50]曲：周杰伦\r\n[00:06.75]编曲：周杰伦\r\n[00:09.00]制作人：周杰伦\r\n[00:11.25]合声：周杰伦\r\n[00:13.50]合声编写：周杰伦\r\n[00:15.75]吉他：蔡科俊Again\r\n[00:18.00]贝斯：陈任佑\r\n[00:20.25]鼓：陈柏州\r\n[00:22.51]录音助理：刘勇志\r\n[00:24.76]录音工程：杨瑞代（Alfa Studio）\r\n[00:27.01]混音工程：杨大纬（杨大纬录音工作室）\r\n[00:29.26]故事的小黄花\r\n[00:32.71]从出生那年就飘着\r\n[00:36.24]童年的荡秋千\r\n[00:39.75]随记忆一直晃到现在\r\n[00:42.91]Re So So Si Do Si La \r\n[00:45.93]So La Si Si Si Si La Si La So \r\n[00:49.87]吹着前奏望着天空\r\n[00:53.20]我想起花瓣试着掉落\r\n[00:56.72]为你翘课的那一天\r\n[00:58.83]花落的那一天\r\n[01:00.60]教室的那一间\r\n[01:02.32]我怎么看不见\r\n[01:04.12]消失的下雨天\r\n[01:05.81]我好想再淋一遍\r\n[01:09.99]没想到失去的勇气我还留着\r\n[01:16.12]好想再问一遍\r\n[01:17.97]你会等待还是离开\r\n[01:24.91]刮风这天我试过握着你手\r\n[01:30.45]但偏偏雨渐渐大到我看你不见\r\n[01:38.88]还要多久我才能在你身边\r\n[01:45.44]等到放晴的那天也许我会比较好一点\r\n[01:52.87]从前从前有个人爱你很久\r\n[01:58.54]但偏偏风渐渐把距离吹得好远\r\n[02:06.94]好不容易又能再多爱一天\r\n[02:13.50]但故事的最后你好像还是说了拜拜\r\n[02:34.90]为你翘课的那一天\r\n[02:36.88]花落的那一天\r\n[02:38.66]教室的那一间\r\n[02:40.39]我怎么看不见\r\n[02:42.15]消失的下雨天\r\n[02:43.87]我好想再淋一遍\r\n[02:48.00]没想到失去的勇气我还留着\r\n[02:54.15]好想再问一遍\r\n[02:56.03]你会等待还是离开\r\n[03:02.92]刮风这天我试过握着你手\r\n[03:08.49]但偏偏雨渐渐大到我看你不见\r\n[03:16.94]还要多久我才能在你身边\r\n[03:23.43]等到放晴的那天也许我会比较好一点\r\n[03:30.87]从前从前有个人爱你很久\r\n[03:37.14]偏偏风渐渐把距离吹得好远\r\n[03:44.88]好不容易又能再多爱一天\r\n[03:51.42]但故事的最后你好像还是说了拜拜\r\n[03:58.49]刮风这天我试过握着你手\r\n[04:01.97]但偏偏雨渐渐大到我看你不见\r\n[04:05.65]还要多久我才能够在你身边\r\n[04:09.07]等到放晴那天也许我会比较好一点\r\n[04:12.92]从前从前有个人爱你很久\r\n[04:15.91]但偏偏雨渐渐把距离吹得好远\r\n[04:19.38]好不容易又能再多爱一天\r\n[04:22.86]但故事的最后你好像还是说了拜\r\n', 1, '/uploads/audio/qingtian.mp3', '2003-07-31', 1, 1, 15000, '4:29', '/uploads/images/sings/qingtian.jpg');
INSERT INTO `sing` VALUES (2, '东风破', '周杰伦', '方文山', '[00:00.00]东风破 - 周杰伦 (Jay Chou)\r\n[00:03.54]词：方文山\r\n[00:07.08]曲：周杰伦\r\n[00:10.63]编曲：林迈可\r\n[00:14.17]一盏离愁 孤单伫立在窗口\r\n[00:19.68]\r\n[00:20.73]我在门后 假装你人还没走\r\n[00:25.85]\r\n[00:27.26]旧地如重游 月圆更寂寞\r\n[00:32.29]\r\n[00:33.85]夜半清醒的烛火 不忍苛责我\r\n[00:39.68]\r\n[00:40.44]一壶漂泊 浪迹天涯难入喉\r\n[00:45.74]\r\n[00:47.00]你走之后 酒暖回忆思念瘦\r\n[00:52.40]\r\n[00:53.58]水向东流 时间怎么偷\r\n[00:58.62]\r\n[01:00.14]花开就一次成熟 我却错过\r\n[01:05.50]\r\n[01:10.04]谁在用琵琶弹奏 一曲东风破\r\n[01:15.52]\r\n[01:16.57]岁月在墙上剥落 看见小时候\r\n[01:21.92]\r\n[01:23.16]犹记得那年我们都还很年幼\r\n[01:28.46]\r\n[01:29.76]而如今琴声幽幽 我的等候 你没听过\r\n[01:36.27]谁在用琵琶弹奏 一曲东风破\r\n[01:41.71]\r\n[01:42.89]枫叶将故事染色 结局我看透\r\n[01:48.16]\r\n[01:49.47]篱笆外的古道我牵着你走过\r\n[01:54.83]\r\n[01:56.03]荒烟蔓草的年头 就连分手都很沉默\r\n[02:03.70]\r\n[02:28.93]一壶漂泊 浪迹天涯难入喉\r\n[02:34.66]\r\n[02:35.48]你走之后 酒暖回忆思念瘦\r\n[02:40.93]\r\n[02:42.06]水向东流 时间怎么偷\r\n[02:47.22]\r\n[02:48.60]花开就一次成熟 我却错过\r\n[02:54.03]\r\n[02:58.51]谁在用琵琶弹奏 一曲东风破\r\n[03:03.86]\r\n[03:05.04]岁月在墙上剥落 看见小时候\r\n[03:10.42]\r\n[03:11.63]犹记得那年我们都还很年幼\r\n[03:16.98]\r\n[03:18.20]而如今琴声幽幽 我的等候 你没听过\r\n[03:24.77]谁在用琵琶弹奏 一曲东风破\r\n[03:30.07]\r\n[03:31.33]枫叶将故事染色 结局我看透\r\n[03:36.72]\r\n[03:37.91]篱笆外的古道我牵着你走过\r\n[03:43.27]\r\n[03:44.52]荒烟蔓草的年头 就连分手都\r\n[03:49.92]\r\n[03:51.07]谁在用琵琶弹奏 一曲东风破\r\n[03:56.53]\r\n[03:57.67]岁月在墙上剥落 看见小时候\r\n[04:03.06]\r\n[04:04.27]犹记得那年我们都还很年幼\r\n[04:09.60]\r\n[04:10.83]而如今琴声幽幽 我的等候 你没听过\r\n[04:17.38]谁在用琵琶弹奏 一曲东风破\r\n[04:22.83]\r\n[04:23.96]枫叶将故事染色 结局我看透\r\n[04:29.35]\r\n[04:30.55]篱笆外的古道我牵着你走过\r\n[04:37.09]荒烟蔓草的年头 就连分手都很沉默\r\n', 1, '/uploads/audio/dongfengpo.mp3', '2003-07-31', 1, 1, 12000, '5:25', '/uploads/images/sings/dongfengpo.jpg');
INSERT INTO `sing` VALUES (3, '泡沫', '邓紫棋', '邓紫棋', '[00:00.00]G.E.M. 邓紫棋 - 泡沫\r\n[00:00.29]作词：G.E.M. 邓紫棋\r\n[00:00.55]作曲：G.E.M. 邓紫棋\r\n[00:00.81]OP：蜂鸟音乐\r\n[00:00.94]SP：百纳娱乐\r\n[00:01.08]阳光下的泡沫 是彩色的\r\n[00:08.20]就像被骗的我 是幸福的\r\n[00:15.24]追究什么对错\r\n[00:18.70]你的谎言 基于你还爱我\r\n[00:28.35]美丽的泡沫 虽然一刹花火\r\n[00:35.63]你所有承诺 虽然都太脆弱\r\n[00:42.67]但爱像泡沫\r\n[00:46.21]如果能够看破 有什么难过\r\n[00:57.61]早该知道泡沫 一触就破\r\n[01:04.65]就像已伤的心 不胜折磨\r\n[01:11.67]也不是谁的错\r\n[01:15.23]谎言再多 基于你还爱我\r\n[01:25.02]美丽的泡沫 虽然一刹花火\r\n[01:32.11]你所有承诺 虽然都太脆弱\r\n[01:39.16]爱本是泡沫\r\n[01:42.57]如果能够看破 有什么难过\r\n[01:53.22]再美的花朵 盛开过就凋落\r\n[02:00.30]再亮眼的星 一闪过就坠落\r\n[02:07.39]爱本是泡沫\r\n[02:10.78]如果能够看破有什么难过\r\n[02:21.36]为什么难过 有什么难过\r\n[02:35.70]为什么难过\r\n[02:46.43]全都是泡沫 只一刹的花火\r\n[02:53.27]你所有承诺 全部都太脆弱\r\n[03:00.34]而你的轮廓\r\n[03:03.76]怪我没有看破 才如此难过\r\n[03:14.43]相爱的把握 要如何再搜索\r\n[03:21.42]相拥着寂寞 难道就不寂寞\r\n[03:28.61]爱本是泡沫\r\n[03:32.11]怪我没有看破 才如此难过\r\n[03:43.54]在雨下的泡沫 一触就破\r\n[03:50.61]当初炽热的心 早已沉没\r\n[03:57.58]说什么你爱我\r\n[04:01.06]如果骗我 我宁愿你沉默\r\n', 2, '/uploads/audio/paomo.mp3', '2015-11-06', 2, 1, 18000, '4:24', '/uploads/images/sings/paomo.jpg');
INSERT INTO `sing` VALUES (4, '喜欢你', '邓紫棋', '邓紫棋', '[00:00.00]喜欢你 - G.E.M. 邓紫棋\r\n[00:02.95]词：黄家驹\r\n[00:04.40]曲：黄家驹\r\n[00:05.42]编曲：Lupo Groinig\r\n[00:06.86]OP：蜂鸟音乐\r\n[00:08.51]SP：百纳娱乐\r\n[00:12.30]细雨带风湿透黄昏的街道\r\n[00:18.47]抹去雨水双眼无故地仰望\r\n[00:23.99]望向孤单的晚灯\r\n[00:27.35]是那伤感的记忆\r\n[00:33.85]再次泛起心里无数的思念\r\n[00:40.05]以往片刻欢笑仍挂在脸上\r\n[00:45.56]愿你此刻可会知\r\n[00:48.90]是我衷心的说声\r\n[00:53.97]喜欢你 那双眼动人\r\n[01:00.07]笑声更迷人\r\n[01:03.14]愿再可 轻抚你\r\n[01:09.25]那可爱面容\r\n[01:12.33]挽手说梦话\r\n[01:15.40]像昨天 你共我\r\n[01:26.23]满带理想的我曾经多冲动\r\n[01:32.37]屡怨与她相爱难有自由\r\n[01:37.82]愿你此刻可会知\r\n[01:41.22]是我衷心的说声\r\n[01:46.20]喜欢你 那双眼动人\r\n[01:52.36]笑声更迷人\r\n[01:55.48]愿再可 轻抚你\r\n[02:01.57]那可爱面容\r\n[02:04.70]挽手说梦话\r\n[02:07.74]像昨天 你共我\r\n[02:25.52]每晚夜里自我独行\r\n[02:29.34]随处荡 多冰冷\r\n[02:37.80]以往为了自我挣扎\r\n[02:41.64]从不知 她的痛苦\r\n[02:54.01]喜欢你 那双眼动人\r\n[03:00.07]笑声更迷人\r\n[03:03.16]愿再可 轻抚你\r\n[03:09.30]那可爱面容\r\n[03:12.37]挽手说梦话\r\n[03:15.43]像昨天 你共我\r\n', 2, '/uploads/audio/xihuanni.mp3', '2015-11-06', 2, 1, 16000, '3:55', '/uploads/images/sings/xihuanni.jpg');
INSERT INTO `sing` VALUES (5, '倔强', '阿信', '阿信', '[00:00.00]倔强 - 五月天 (Mayday)\r\n[00:13.86]词：阿信\r\n[00:27.72]曲：阿信\r\n[00:41.59]当 我和世界不一样\r\n[00:45.10]\r\n[00:45.75]那就让我不一样\r\n[00:48.04]\r\n[00:48.78]坚持对我来说\r\n[00:50.77]就是以刚克刚\r\n[00:53.87]我 如果对自己妥协\r\n[00:57.42]\r\n[00:58.04]如果对自己说谎\r\n[01:00.41]\r\n[01:01.08]即使别人原谅\r\n[01:03.06]我也不能原谅\r\n[01:06.12]最美的愿望 一定最疯狂\r\n[01:12.27]我就是我自己的神\r\n[01:15.34]在我活的地方\r\n[01:18.37]我和我最后的倔强\r\n[01:21.57]握紧双手绝对不放\r\n[01:24.61]下一站是不是天堂\r\n[01:27.44]就算失望不能绝望\r\n[01:30.76]我和我骄傲的倔强\r\n[01:33.86]我在风中大声的唱\r\n[01:36.92]这一次为自己疯狂\r\n[01:39.85]就这一次 我和我的倔强\r\n[01:46.17]\r\n[01:58.42]对 爱我的人别紧张\r\n[02:01.94]\r\n[02:02.60]我的固执很善良\r\n[02:05.07]\r\n[02:05.68]我的手越肮脏\r\n[02:07.66]眼神越是发光\r\n[02:10.72]你 不在乎我的过往\r\n[02:14.18]\r\n[02:14.95]看到了我的翅膀\r\n[02:17.32]\r\n[02:18.01]你说被火烧过\r\n[02:20.02]才能出现凤凰\r\n[02:23.05]逆风的方向 更适合飞翔\r\n[02:29.25]我不怕千万人阻挡\r\n[02:32.34]只怕自己投降\r\n[02:35.33]我和我最后的倔强\r\n[02:38.41]握紧双手绝对不放\r\n[02:41.57]下一站是不是天堂\r\n[02:44.44]就算失望不能绝望\r\n[02:47.67]我和我骄傲的倔强\r\n[02:50.81]我在风中大声的唱\r\n[02:53.84]这一次为自己疯狂\r\n[02:56.74]就这一次 我和我的倔强\r\n[03:01.33]\r\n[03:12.24]我和我最后的倔强\r\n[03:15.37]握紧双手绝对不放\r\n[03:18.46]下一站是不是天堂\r\n[03:21.35]就算失望不能绝望\r\n[03:24.51]我和我骄傲的倔强\r\n[03:27.74]我在风中大声的唱\r\n[03:30.81]这一次为自己疯狂\r\n[03:33.71]就这一次 我和我的倔强\r\n[03:39.18]\r\n[03:39.77]就这一次 让我大声唱\r\n[03:43.04]啦啦啦啦啦啦啦啦\r\n[03:46.18]啦啦啦啦啦啦啦啦\r\n[03:49.30]啦啦啦啦啦啦啦啦\r\n[03:52.08]就算失望 不能绝望\r\n[03:55.36]啦啦啦啦啦啦啦啦\r\n[03:58.44]啦啦啦啦啦啦啦啦\r\n[04:01.49]啦啦啦啦啦啦啦啦\r\n[04:04.39]就这一次 我和我的倔强\r\n', 3, '/uploads/audio/juejiang.mp3', '2016-07-21', 3, 2, 14000, '4:18', '/uploads/images/sings/juejiang.jpg');
INSERT INTO `sing` VALUES (6, '温柔', '阿信', '阿信', '[00:00.00]温柔 - 五月天 (Mayday)\r\n[00:03.41]词：阿信\r\n[00:06.82]曲：阿信\r\n[00:10.24]编曲：五月天\r\n[00:13.65]走在风中今天阳光\r\n[00:16.59]突然好温柔\r\n[00:18.71]\r\n[00:19.94]天的温柔\r\n[00:21.48]地的温柔\r\n[00:23.10]像你抱着我\r\n[00:26.35]然后发现你的改变\r\n[00:29.51]孤单的今后\r\n[00:31.38]\r\n[00:32.16]如果冷\r\n[00:33.84]该怎么度过\r\n[00:40.34]\r\n[00:42.68]天边风光身边的我\r\n[00:45.64]都不在你眼中\r\n[00:47.51]\r\n[00:49.06]你的眼中藏着什么\r\n[00:52.27]我从来都不懂\r\n[00:54.53]\r\n[00:55.53]没有关系你的世界\r\n[00:58.86]就让你拥有\r\n[01:01.19]不打扰\r\n[01:02.93]是我的温柔\r\n[01:09.65]\r\n[01:11.78]不知道不明了不想要\r\n[01:13.71]为什么我的心\r\n[01:18.01]明明是想靠近\r\n[01:21.14]却孤单到黎明\r\n[01:23.97]\r\n[01:24.50]不知道不明了不想要\r\n[01:26.71]为什么我的心\r\n[01:31.04]那爱情的绮丽\r\n[01:34.18]总是在孤单里\r\n[01:37.46]再把我的最好的爱给你\r\n[01:43.98]\r\n[01:44.50]不知不觉不情不愿\r\n[01:47.49]又到巷子口\r\n[01:49.18]\r\n[01:50.70]我没有哭也没有笑\r\n[01:53.96]因为这是梦\r\n[01:55.92]\r\n[01:57.10]没有预兆没有理由\r\n[02:00.38]你真的有说过\r\n[02:02.78]如果有\r\n[02:04.60]就让你自由\r\n[02:11.92]\r\n[02:32.63]不知道不明了不想要\r\n[02:34.81]为什么我的心\r\n[02:39.06]明明是想靠近\r\n[02:42.24]却孤单到黎明\r\n[02:44.72]\r\n[02:45.45]不知道不明了不想要\r\n[02:48.09]为什么我的心\r\n[02:51.97]那爱情的绮丽\r\n[02:55.17]总是在孤单里\r\n[02:57.66]\r\n[02:58.44]再把我的最好的爱给你\r\n[03:05.36]不知不觉不情不愿\r\n[03:08.51]又到巷子口\r\n[03:10.78]\r\n[03:11.79]我没有哭也没有笑\r\n[03:15.12]因为这是梦\r\n[03:17.41]\r\n[03:18.30]没有预兆没有理由\r\n[03:21.44]你真的有说过\r\n[03:24.15]如果有\r\n[03:25.54]就让你自由\r\n[03:31.85]\r\n[03:33.78]自由\r\n[03:39.33]这是我的温柔\r\n[03:42.06]这是我的温柔\r\n[03:45.41]这是我的温柔\r\n[03:48.69]这是我的温柔\r\n[04:01.96]\r\n[04:03.74]让你自由\r\n', 3, '/uploads/audio/wenrou.mp3', '2016-07-21', 3, 2, 13000, '4:05', '/uploads/images/sings/wenrou.jpg');
INSERT INTO `sing` VALUES (7, '学不会', '林俊杰', '姚若龙', '[00:00.00]学不会 - 林俊杰 (JJ Lin)\r\n[00:03.40]词：姚若龙\r\n[00:06.81]曲：林俊杰\r\n[00:10.21]编曲：Terence Teo\r\n[00:13.62]制作人：李偲菘\r\n[00:17.03]你的痛苦 我都心疼 想为你解决\r\n[00:24.52]挡开流言 紧握你手 想飞奔往前\r\n[00:31.08]我相信爱 能证明一切\r\n[00:35.08]够真心 会超越时间\r\n[00:38.92]多付出 也多了喜悦\r\n[00:42.69]让幸福蔓延\r\n[00:48.63]总是学不会 再聪明一点\r\n[00:56.50]记得自我保护 必要时候讲些\r\n[01:00.69]善意谎言\r\n[01:03.83]总是学不会 真爱也有现实面\r\n[01:13.81]不是谁情愿 就能够解决\r\n[01:30.42]一次争吵 一个心结 累积着改变 yeah\r\n[01:37.88]内心疏远 足够秒杀 外表多浓烈\r\n[01:44.49]才发现爱 不代表一切\r\n[01:48.54]再真心 也会被阻绝\r\n[01:52.35]这世界 天天有诡雷\r\n[01:56.15]随时会爆裂\r\n[02:00.18]还是学不会 少浪漫一点\r\n[02:07.79]拼命着想的事 未必带来感动\r\n[02:12.75]或被感谢\r\n[02:15.71]还是学不会 解释我最伤 Oh 最累\r\n[02:27.34]痛死都不愿 怪谁\r\n[02:35.53]把每段痴情苦恋 在此刻 排列面前\r\n[02:43.39]也感觉 不埋怨 只怀念\r\n[02:55.40]总是学不会 再聪明一点\r\n[03:03.16]记得自我保护 必要时候讲些\r\n[03:08.05]善意谎言\r\n[03:10.86]不是学不会 只是觉得爱太美\r\n[03:22.56]值得去沉醉\r\n[03:30.21]流 泪\r\n', 4, '/uploads/audio/xuebuhui.mp3', '2011-12-31', 4, 1, 11000, '4:45', '/uploads/images/sings/xuebuhui.jpg');
INSERT INTO `sing` VALUES (8, '那些你很冒险的梦', '林俊杰', '王雅君', '[00:00.00]那些你很冒险的梦 - 林俊杰 (JJ Lin)\r\n[00:03.03]词：王雅君\r\n[00:06.06]曲：林俊杰\r\n[00:09.10]编曲：吴庆隆\r\n[00:12.13]制作人：许环良\r\n[00:15.17]当两颗心开始震动\r\n[00:19.42]\r\n[00:22.23]当你瞳孔学会闪躲\r\n[00:26.22]\r\n[00:28.60]当爱慢慢被遮住只剩下黑\r\n[00:35.05]\r\n[00:36.26]距离像影子被拉拖\r\n[00:40.35]\r\n[00:43.35]当爱的故事剩听说\r\n[00:47.43]\r\n[00:49.69]我找不到你单纯的面孔\r\n[00:54.50]\r\n[00:56.82]当生命每分每秒都为你转动\r\n[01:03.21]\r\n[01:04.10]心多执着就加倍心痛\r\n[01:09.37]\r\n[01:09.90]那些你很冒险的梦 我陪你去疯\r\n[01:17.29]\r\n[01:18.14]折纸飞机 碰到雨天 终究会坠落\r\n[01:23.92]太残忍的话我直说 因为爱很重\r\n[01:31.89]你却不想懂 只往反方向走\r\n[01:38.03]\r\n[01:46.06]哦 当爱的故事剩听说\r\n[01:54.74]\r\n[01:56.80]我找不到你单纯的面孔\r\n[02:02.69]\r\n[02:03.82]当生命每分每秒都为你转动\r\n[02:10.29]\r\n[02:10.91]心有多执着就加倍心痛\r\n[02:16.94]那些你很冒险的梦 我陪你去疯\r\n[02:24.46]\r\n[02:25.19]折纸飞机 碰到雨天 终究会坠落\r\n[02:30.92]太残忍的话我直说 因为爱很重\r\n[02:38.89]你却不想懂 只往反方向走\r\n[02:45.50]\r\n[02:46.37]我不想放手 你松开的左手\r\n[02:49.98]你爱的放纵 我白不回天空\r\n[02:53.94]我输了 累了\r\n[02:56.09]当你 再也 不回头\r\n[03:01.63]\r\n[03:02.79]那些你很冒险的梦 我陪你去疯\r\n[03:10.28]\r\n[03:11.14]折纸飞机 碰到雨天 终究会坠落\r\n[03:16.85]太残忍的话我直说 因为爱很重\r\n[03:24.79]你却不想懂 只往反方向走\r\n[03:30.71]\r\n[03:32.01]你真的不懂 我的爱已降落\r\n', 4, '/uploads/audio/maoxian.mp3', '2011-12-31', 4, 1, 12500, '4:55', '/uploads/images/sings/maoxian.jpg');
INSERT INTO `sing` VALUES (9, '大艺术家', '蔡依林', '严云农', '[00:00.00]大艺术家 - 蔡依林 (Jolin Tsai)\r\n[00:03.84]词：严云农\r\n[00:07.69]曲：Robin Jessen/Anna Judith Wik/Nermin Harambasic/Ronny Svendsen/Charite Viken Reinas/Eirik Johanson\r\n[00:11.53]编曲：林迈可\r\n[00:15.38]他眼神 湛蓝 像从 爱琴海边 刚归来\r\n[00:17.88]上半身 像诗人 下半身像 流浪汉\r\n[00:20.29]你爱他 神祕 爱他 危险 yeah\r\n[00:22.82]爱他 颓废 爱他的优越\r\n[00:25.38]他心里的野兽 比毕卡索更 狂野\r\n[00:27.88]桃花比村上隆 画的更泛滥 鲜艳\r\n[00:30.31]他爱你 随和 爱你 方便\r\n[00:32.35]Yeah 敢怒不敢言\r\n[00:34.26]你自我催眠 他是艺术家\r\n[00:36.88]你给他色盘 去拼贴背叛\r\n[00:39.43]他不是梵谷 也不是莫内\r\n[00:41.91]他的模特儿 却都从来不缺少 hr\r\n[00:45.39]面对你他装的 乖的 乖的\r\n[00:47.69]背对你却乱来 坏的 坏的\r\n[00:50.34]Ne ne ne nenever stop\r\n[00:52.66]他只想搜集 更多 芭比娃娃\r\n[00:54.88]Wake up你是大艺术家\r\n[00:57.22]你真心 创作的爱 无价\r\n[00:59.76]Wake up别再做慈善家\r\n[01:02.20]你其实 没有那么爱他\r\n[01:05.21]爱是缪思女神的吻\r\n[01:07.95]谁都应该被宠爱 纹身\r\n[01:09.99]Go get it go get it\r\n[01:12.82]那种美能让 维纳斯诞生\r\n[01:15.50]你无需 忍受他的\r\n[01:16.75]人在曹营 心在汉\r\n[01:18.00]要学会 放下不甘 戒掉母性泛滥\r\n[01:20.29]他要你 让让 你就 让让 yeah\r\n[01:22.87]说的爱你 只是嚷嚷\r\n[01:25.36]他的 博爱 始终没有极限\r\n[01:27.55]复制 谎言 瓶颈不曾出现\r\n[01:29.79]你该说再见 就说再见\r\n[01:32.30]Yeah千万别留恋\r\n[01:34.29]你自我催眠 他是艺术家\r\n[01:36.91]你给他色盘 去拼贴背叛\r\n[01:39.40]他不是梵谷 也不是莫内\r\n[01:41.96]他的模特儿 却都从来不缺少 hr\r\n[01:45.40]面对你他装的 乖的 乖的\r\n[01:47.64]背对你却乱来 坏的 坏的\r\n[01:50.36]Ne ne ne ne nenever stop\r\n[01:52.61]他只想搜集 更多 芭比娃娃\r\n[01:54.76]Wake up你是大艺术家\r\n[01:57.16]你真心 创作的爱 无价\r\n[01:59.76]Wake up别再做慈善家\r\n[02:02.24]你其实 没有那么爱他\r\n[02:05.36]爱是缪思女神的吻\r\n[02:07.92]谁都应该被宠爱 纹身\r\n[02:10.05]Go get it go get it\r\n[02:12.72]那种美能让 维纳斯诞生\r\n[02:16.09]\r\n[02:35.25]美不美丽 不是安迪沃荷 能决定\r\n[02:37.62]大艺术家 要有属于自己的感性\r\n[02:41.14]\r\n[02:45.09]爱过就要 拥有勇敢放手 的淡 定\r\n[02:47.84]大艺术家 会让爱情再文艺复兴\r\n[02:51.98]Do it now\r\n[02:54.78]Wake up你是大艺术家\r\n[02:57.20]你真心 创作的爱 无价\r\n[02:59.82]Wake up别再做慈善家\r\n[03:02.19]你其实 没有那么爱他\r\n[03:05.37]爱是缪思女神的吻\r\n[03:07.93]谁都应该被宠爱 纹身\r\n[03:10.06]Go get it go get it\r\n[03:12.67]那种美能让 维纳斯诞生\r\n', 5, '/uploads/audio/dayishujia.mp3', '2012-09-14', 5, 1, 13500, '4:05', '/uploads/images/sings/dayishujia.jpg');
INSERT INTO `sing` VALUES (10, '诗人漫步', '蔡依林', '姚若龙', '[00:00.00]诗人漫步 - 蔡依林 (Jolin Cai)\r\n[00:05.28]词：许哲珮\r\n[00:10.57]曲：许哲珮\r\n[00:15.86]编曲：谢明祥\r\n[00:21.15]你是诗人 漫步在风花雪月的早晨\r\n[00:29.01]你不怕了 外头的气温正温和\r\n[00:37.87]你微笑着 我的眼眶却红了\r\n[00:47.23]你是诗人 细数窗外雪飘落多缤纷\r\n[00:54.97]你很快乐 享受着孤独的片刻\r\n[01:03.89]你多天真 以为一切是这样的\r\n[01:11.94]幻想的都会成真 难过的都没发生\r\n[01:25.23]梦想再大 你还是看不见我\r\n[01:33.22]爱得再深 你还是爱自己多\r\n[01:40.08]你不会懂 伤口真的会痛\r\n[01:48.70]你心里的宇宙 我不在任何角落\r\n[01:57.24]世界再大 你还是原地不动\r\n[02:03.52]说得再多 你从来也没听懂\r\n[02:12.51]你的幽默 像玻璃划破双手\r\n[02:20.81]我在你的眼中 只是画面拼凑\r\n[03:02.51]你是诗人 细数窗外雪飘落多缤纷\r\n[03:10.43]你很快乐 享受着孤独的片刻\r\n[03:19.10]你多天真 以为一切是这样的\r\n[03:27.40]幻想的都会成真 难过的都没发生\r\n[03:40.57]梦想再大 你还是看不见我\r\n[03:48.37]爱得再深 你还是爱自己多\r\n[03:55.42]你不会懂 伤口真的会痛\r\n[04:03.91]你心里的宇宙 我不在任何角落\r\n[04:12.52]世界再大 你还是原地不动\r\n[04:20.44]说得再多 你从来也没听懂\r\n[04:27.31]你的幽默 像玻璃划破双手\r\n[04:35.92]我在你的眼中 只是画面拼凑\r\n[04:44.51]如果我受困在故事中\r\n[04:50.57]你是否会来拯救我\r\n', 5, '/uploads/audio/shiren.mp3', '2012-09-14', 5, 1, 11500, '3:55', '/uploads/images/sings/shiren.jpg');
INSERT INTO `sing` VALUES (11, '浮夸', '陈奕迅', '黄伟文', '[00:00.00]浮夸 - 陈奕迅 (Eason Chan)\r\n[00:09.74]词：黄伟文\r\n[00:19.48]曲：C.Y. Kong\r\n[00:29.22]有人问我 我就会讲\r\n[00:32.44]但是无人来\r\n[00:34.25]\r\n[00:36.26]我期待 到无奈\r\n[00:38.31]有话要讲 得不到装载\r\n[00:41.79]\r\n[00:42.65]我的心情犹像樽盖等被揭开\r\n[00:47.06]嘴巴却在养青苔\r\n[00:49.70]人潮内 愈文静\r\n[00:51.61]愈变得 不受理睬\r\n[00:53.92]自己要搞出意外\r\n[00:56.53]像突然地高歌\r\n[00:59.86]\r\n[01:00.38]任何地方也像开四面台\r\n[01:03.93]着最闪的衫 扮十分感慨\r\n[01:07.66]有人来拍照 要记住插袋\r\n[01:11.09]\r\n[01:11.92]你当我是浮夸吧\r\n[01:14.92]\r\n[01:15.58]夸张只因我很怕\r\n[01:18.60]\r\n[01:19.16]似木头 似石头的话\r\n[01:22.46]得到注意吗\r\n[01:24.36]\r\n[01:24.87]其实怕被忘记\r\n[01:26.87]至放大来演吧\r\n[01:30.03]很不安 怎去优雅\r\n[01:32.97]\r\n[01:33.52]世上还赞颂沉默吗\r\n[01:36.86]不够爆炸\r\n[01:39.01]\r\n[01:39.89]怎么有话题 让我夸\r\n[01:43.24]做大娱乐家\r\n[01:45.15]\r\n[01:51.53]那年十八 母校舞会\r\n[01:54.86]站着如喽罗\r\n[01:56.65]\r\n[01:58.57]那时候 我含泪\r\n[02:00.47]发誓各位 必须看到我\r\n[02:03.71]\r\n[02:05.17]在世间平凡又普通的路太多\r\n[02:08.67]\r\n[02:09.41]屋村你住哪一座\r\n[02:12.04]情爱中 工作中\r\n[02:13.92]受过的忽视太多\r\n[02:16.30]自尊已饱经跌堕\r\n[02:19.01]重视能治肚饿\r\n[02:22.71]未曾获得过 便知我为何\r\n[02:26.17]大动作很多 犯下这些错\r\n[02:29.96]搏人们看看我 算病态么\r\n[02:33.46]\r\n[02:34.25]你当我是浮夸吧\r\n[02:37.90]夸张只因我很怕\r\n[02:41.55]似木头 似石头的话\r\n[02:44.81]得到注意吗\r\n[02:46.53]\r\n[02:47.21]其实怕被忘记\r\n[02:49.37]至放大来演吧\r\n[02:51.76]\r\n[02:52.54]很不安 怎去优雅\r\n[02:55.93]世上还赞颂沉默吗\r\n[02:58.91]\r\n[02:59.55]不够爆炸\r\n[03:01.06]\r\n[03:02.22]怎么有话题 让我夸\r\n[03:05.48]做大娱乐家\r\n[03:08.25]\r\n[03:20.19]幸运儿并不多\r\n[03:23.06]\r\n[03:23.69]若然未当过就知我为何\r\n[03:27.15]用十倍苦心 做突出一个\r\n[03:30.80]正常人够我 富议论性么\r\n[03:33.99]\r\n[03:35.32]你叫我做浮夸吧\r\n[03:38.47]\r\n[03:38.98]加几声嘘声也不怕\r\n[03:41.90]\r\n[03:42.56]我在场 有闷场的话\r\n[03:45.45]\r\n[03:46.00]表演你看吗 够歇斯底里吗\r\n[03:50.22]以眼泪淋花吧\r\n[03:52.64]\r\n[03:53.66]一心只想你惊讶\r\n[03:56.17]\r\n[03:56.85]我旧时似未存在吗\r\n[03:59.78]\r\n[04:00.51]加重注码 青筋也现形\r\n[04:05.05]话我知 现在存在吗\r\n[04:08.89]\r\n[04:10.85]凝视我 别再只看天花\r\n[04:13.60]\r\n[04:18.85]我非你杯茶 也可尽情地喝吧\r\n[04:22.96]\r\n[04:24.78]别遗忘有人在 为你声沙\r\n', 6, '/uploads/audio/fukua.mp3', '2005-06-07', 6, 1, 14500, '4:45', '/uploads/images/sings/fukua.jpg');
INSERT INTO `sing` VALUES (12, '最佳损友', '陈奕迅', '黄伟文', '[00:00.00]最佳损友 - 陈奕迅 (Eason Chan)\r\n[00:00.28]词：黄伟文\r\n[00:00.56]曲：Eric Kwok\r\n[00:00.84]朋友 我当你一秒朋友\r\n[00:06.57]\r\n[00:07.27]朋友 我当你一世朋友\r\n[00:13.26]\r\n[00:14.00]奇怪 过去再不堪回首\r\n[00:20.68]怀缅 时时其实还有\r\n[00:26.60]\r\n[00:27.44]朋友 你试过将我营救\r\n[00:33.27]\r\n[00:33.96]朋友 你试过把我批斗\r\n[00:40.73]无法 再与你交心联手\r\n[00:46.48]毕竟 难得有过最佳损友\r\n[00:52.35]从前共你 促膝把酒\r\n[00:55.26]倾通宵都不够\r\n[00:56.93]我有痛快过 你有没有\r\n[01:01.13]很多东西今生只可给你\r\n[01:03.52]保守至到永久\r\n[01:05.28]别人如何明白透\r\n[01:07.71]实实在在 踏入过我宇宙\r\n[01:10.14]即使相处到 有个裂口\r\n[01:13.60]命运决定了 以后再没法聚头\r\n[01:17.17]但说过去 却那样厚\r\n[01:19.85]问我有没有 确实也没有\r\n[01:23.26]一直躲避的藉口 非什么大仇\r\n[01:26.62]为何旧知己 在最后\r\n[01:29.71]变不到老友\r\n[01:33.15]不知你是我敌友 已没法望透\r\n[01:36.89]被推着走 跟着生活流\r\n[01:39.95]来年陌生的\r\n[01:41.87]是昨日最亲的某某\r\n[01:50.35]\r\n[01:51.06]生死之交当天不知罕有\r\n[01:53.56]到你变节了 至觉未够\r\n[01:57.70]多想一天 彼此都不追究\r\n[02:00.13]相邀再次喝酒\r\n[02:01.86]待葡萄成熟透\r\n[02:04.41]但是命运入面 每个邂逅\r\n[02:06.89]一起走到了 某个路口\r\n[02:10.19]是敌与是友 各自也没有自由\r\n[02:13.59]位置变了 各有队友\r\n[02:16.52]问我有没有 确实也没有\r\n[02:19.79]一直躲避的藉口 非什么大仇\r\n[02:23.17]为何旧知己 在最后\r\n[02:26.42]变不到老友\r\n[02:29.83]不知你是我敌友 已没法望透\r\n[02:33.57]被推着走 跟着生活流\r\n[02:36.50]来年陌生的\r\n[02:38.48]是昨日最亲的某某\r\n[02:41.96]早知解散后 各自有际遇作导游\r\n[02:46.43]奇就奇在 接受了 各自有路走\r\n[02:49.77]却没人像你 让我 眼泪背着流\r\n[02:53.12]严重似情侣 讲分手\r\n[02:58.30]\r\n[03:10.62]有没有 确实也没有\r\n[03:13.10]一直躲避的藉口 非什么大仇\r\n[03:16.44]为何旧知己 在最后 变不到老友\r\n[03:23.03]不知你又有没有 挂念这旧友\r\n[03:26.87]或者自己 早就想通透\r\n[03:29.80]来年陌生的 是昨日 最亲的某某\r\n[03:35.25]总好于 那日我 没有\r\n[03:40.28]没有 遇过 某某\r\n', 6, '/uploads/audio/sunyou.mp3', '2005-06-07', 6, 1, 12500, '4:35', '/uploads/images/sings/sunyou.jpg');
INSERT INTO `sing` VALUES (13, '掉了', '张惠妹', '吴青峰', '[00:00.00]掉了 - 张惠妹 (aMEI)\r\n[00:06.01]词：吴青峰\r\n[00:12.02]曲：吴青峰\r\n[00:18.03]编曲：Martin Tang\r\n[00:24.04]心疼的玫瑰\r\n[00:27.04]半夜还开着\r\n[00:29.97]找不到匆匆掉落的花蕊\r\n[00:36.24]\r\n[00:36.98]回到现场却已来不及\r\n[00:41.89]等待任何回音都不可得\r\n[00:47.77]微弱的风筝\r\n[00:50.71]冬天里飘着\r\n[00:53.69]回不去手中缠线的那个\r\n[01:00.15]\r\n[01:00.73]没有蓝天 又何必去飞\r\n[01:05.84]怎么适合\r\n[01:10.43]\r\n[01:12.20]黑色笑靥掉了\r\n[01:15.10]雪白眼泪掉了\r\n[01:18.09]该出现的所有表情瞬间掉了\r\n[01:23.99]瞳孔没有颜色\r\n[01:26.96]结了冰的长河\r\n[01:29.90]回忆是最可怕的敌人\r\n[01:35.83]故事情节掉了\r\n[01:38.80]主角对白掉了\r\n[01:41.77]该属于剧中的对角戏也掉了\r\n[01:47.77]胸口没有快乐\r\n[01:50.68]断了翅的白鸽\r\n[01:53.68]不枯萎的借口全掉了\r\n[02:00.57]\r\n[02:05.59]曾经唱过的歌\r\n[02:08.44]分享过的笑声\r\n[02:11.42]在心中不断拉扯\r\n[02:17.29]想念不能承认\r\n[02:20.34]偷偷擦去泪痕\r\n[02:22.97]冬天过了还是会很冷 耶\r\n[02:34.51]\r\n[02:35.12]黑色笑靥掉了\r\n[02:38.09]雪白眼泪掉了\r\n[02:41.04]该出现的所有表情瞬间掉了\r\n[02:46.97]瞳孔没有颜色\r\n[02:49.96]结了冰的长河\r\n[02:52.86]回忆是最可怕的敌人\r\n[02:58.82]故事情节掉了\r\n[03:01.79]主角对白掉了\r\n[03:04.72]该属于剧中的对角戏也掉了\r\n[03:10.70]胸口没有快乐\r\n[03:13.64]断了翅的白鸽\r\n[03:16.62]不枯萎的借口全掉了\r\n', 7, '/uploads/audio/diaole.mp3', '2009-06-26', 7, 1, 13500, '4:05', '/uploads/images/sings/diaole.jpg');
INSERT INTO `sing` VALUES (15, '大城小爱', '王力宏', '王力宏', '[00:00.00]大城小爱 - 王力宏 (Leehom Wang)\r\n[00:04.82]词：王力宏/陈镇川/K. Tee\r\n[00:09.65]曲：王力宏\r\n[00:14.48]乌黑的发尾 盘成一个圈\r\n[00:17.86]缠绕所有对你的眷恋\r\n[00:20.85]\r\n[00:21.51]隔着半透明门帘\r\n[00:23.22]嘴里说的语言 完全没有欺骗\r\n[00:28.14]\r\n[00:28.88]屋顶灰色瓦片 安静的画面\r\n[00:32.43]灯火是你美丽那张脸\r\n[00:35.32]\r\n[00:36.07]终于找到所有流浪的终点\r\n[00:40.14]你的微笑结束了疲倦\r\n[00:43.28]\r\n[00:45.30]千万不要说天长地久\r\n[00:48.37]\r\n[00:48.90]免得你觉得我不切实际\r\n[00:52.05]\r\n[00:52.58]想多么简单就多么简单\r\n[00:55.91]\r\n[00:56.52]是妈妈告诉我的哲理\r\n[00:59.45]脑袋都是你 心里都是你\r\n[01:02.54]\r\n[01:03.22]小小的爱在大城里好甜蜜\r\n[01:06.77]念的都是你 全部都是你\r\n[01:10.38]小小的爱在大城里只为你倾心\r\n[01:14.70]\r\n[01:16.39]乌黑的发尾 盘成一个圈\r\n[01:19.93]缠绕所有对你的眷恋\r\n[01:22.53]\r\n[01:23.61]终于找到所有流浪的终点\r\n[01:27.58]你的微笑结束了疲倦\r\n[01:30.28]\r\n[01:30.86]千万不要说天长地久\r\n[01:34.35]免得你觉得我不切实际\r\n[01:38.21]想多么简单就多么简单\r\n[01:41.55]\r\n[01:42.16]让我大声的对你说\r\n[01:44.95]I\'m thinking of you\r\n[01:48.05]\r\n[01:48.83]脑袋都是你 心里都是你\r\n[01:52.40]小小的爱在大城里好甜蜜\r\n[01:56.08]念的都是你 全部都是你\r\n[01:59.14]\r\n[01:59.67]小小的爱在大城里只为你倾心\r\n[02:03.57]\r\n[02:04.18]那回程的票根你留做纪念\r\n[02:07.81]不必害怕面对离别\r\n[02:10.76]Oh\r\n[02:11.44]剪掉一束头发 让我放在胸前\r\n[02:14.97]走到哪里都有你陪\r\n[02:18.52]相随\r\n[02:21.68]脑袋都是你 心里都是你\r\n[02:24.68]\r\n[02:25.21]小小的爱在大城里好甜蜜\r\n[02:28.81]念的都是你 全部都是你\r\n[02:32.59]小小的爱在大城里只为你倾心\r\n[02:36.31]脑袋都是你 心里都是你\r\n[02:39.29]\r\n[02:39.90]小小的爱在大城里好甜蜜\r\n[02:43.38]Oh 念的都是你 全部都是你\r\n[02:47.13]小小的爱在大城里只为你倾心\r\n[02:50.83]啦啦啦啦啦\r\n[02:52.41]\r\n[03:22.41]乌黑的发尾 盘成一个圈\r\n[03:25.78]缠绕所有对你的眷恋\r\n[03:28.78]\r\n[03:29.43]那一种寸步不离的感觉\r\n[03:33.55]我知道这叫做永远\r\n', 8, '/uploads/audio/dacheng.mp3', '2005-12-30', 8, 1, 15500, '4:05', '/uploads/images/sings/dacheng.jpg');
INSERT INTO `sing` VALUES (16, '花田错', '王力宏', '王力宏', '[00:00.00]花田错 - 王力宏 (Leehom Wang)\r\n[00:02.73]词：陈镇川\r\n[00:05.47]曲：王力宏\r\n[00:08.21]我犯了错\r\n[00:10.38]\r\n[00:16.64]夜好深了纸窗里怎么亮着\r\n[00:19.51]那不是彻夜等候你为我点的烛火\r\n[00:23.17]不过是一次邂逅红楼那一场梦\r\n[00:27.15]我的山水全部褪色像被大雨洗过\r\n[00:30.49]杯中景色鬼魅我忘了我是谁\r\n[00:33.70]\r\n[00:34.37]心情就像夜凉如水\r\n[00:37.70]手里握着蝴蝶杯单飞不醉不归\r\n[00:44.35]花田里犯了错\r\n[00:45.67]\r\n[00:46.77]说好破晓前忘掉\r\n[00:51.45]花田里犯了错\r\n[00:52.91]拥抱变成了煎熬\r\n[00:58.76]花田里犯了错\r\n[01:00.33]犯错像迷恋镜花水月的无聊\r\n[01:05.95]花田里犯了错\r\n[01:07.58]请原谅我多情的打扰\r\n[01:14.32]\r\n[01:31.94]醉怎么会喝醉 美 因为你的美\r\n[01:35.07]\r\n[01:35.70]爱匆匆一瞥不过点缀\r\n[01:38.11]\r\n[01:39.19]飞看大雪纷飞 却再也找不回\r\n[01:42.95]被白雪覆盖那些青翠\r\n[01:45.56]\r\n[01:46.34]当时空成为拥有你\r\n[01:48.47]唯一条件 我又醉\r\n[01:53.63]琥珀色的月 结了霜的泪\r\n[01:57.55]我会记得这段岁月\r\n[02:00.15]花田里犯了错\r\n[02:01.53]\r\n[02:02.57]说好破晓前忘掉\r\n[02:07.30]花田里犯了错\r\n[02:08.89]拥抱变成了煎熬\r\n[02:14.52]花田里犯了错\r\n[02:16.11]犯错像迷恋镜花水月的无聊\r\n[02:21.70]花田里犯了错\r\n[02:23.35]请原谅我多情的打扰\r\n[02:30.41]我的山水全部褪了色\r\n[02:32.79]\r\n[02:33.98]多情的打扰请原谅我\r\n[02:36.61]\r\n[02:37.61]不是彻夜为我点的火\r\n[02:40.33]\r\n[02:41.29]在那花田里我犯了错\r\n[02:44.00]\r\n[02:45.04]我的山水全部褪了色\r\n[02:47.38]\r\n[02:48.49]多情的打扰请原谅我\r\n[02:51.42]\r\n[02:52.07]不是彻夜为我点的火\r\n[02:54.68]\r\n[02:55.78]在那花田里我犯了错\r\n[02:57.95]花田里犯了错\r\n[02:59.23]\r\n[03:00.34]说好破晓前忘掉\r\n[03:05.05]花田里犯了错\r\n[03:06.64]拥抱变成了煎熬\r\n[03:12.27]花田里犯了错\r\n[03:13.88]犯错像迷恋镜花水月的无聊\r\n[03:19.39]花田里犯了错\r\n[03:21.10]请原谅我多情的打扰\r\n', 8, '/uploads/audio/huatian.mp3', '2005-12-30', 8, 1, 12500, '3:55', '/uploads/images/sings/huatian.jpg');
INSERT INTO `sing` VALUES (17, '以父之名', '周杰伦', '黄俊郎', '[00:00.00]以父之名 - 周杰伦 (Jay Chou)\r\n[00:00.00]   \r\n[00:00.00]词：黄俊郎\r\n[00:01.00]   \r\n[00:01.00]曲：周杰伦\r\n[00:01.00]   \r\n[00:01.00]编曲：洪敬尧\r\n[00:02.00]   \r\n[00:02.00]Ave Maria grazia ricevuta per la mia famiglia\r\n[00:15.00]万福玛利亚 感谢您对于我家族的恩赐\r\n[00:15.00]Con risentito con un\'amorevole divino amen\r\n[00:30.00]与我的一切所遇 以及神圣的爱 阿门\r\n[00:30.00]Grazie chiedo a te o signore divino\r\n[00:34.00]我祈求上帝 您的恩典\r\n[00:34.00]In questo giorno di grazia prego per te\r\n[00:38.00]在这一天宽恕我的罪\r\n[00:38.00]Ave Maria piena di grazia\r\n[00:40.00]万福玛利亚\r\n[00:40.00]Il signore e con te\r\n[00:42.00]愿主与你同在\r\n[00:42.00]Sia fatta la tua volonta\r\n[00:44.00]愿主的旨意行在地上\r\n[00:44.00]Così in cielo e così in terra neil nome\r\n[00:47.00]如同行在天上\r\n[00:47.00]Del padre del figliolo e dello spirito santo amen\r\n[01:27.00]以圣父、圣子、圣灵的名义 阿门\r\n[01:27.00]微凉的晨露沾湿黑礼服\r\n[01:29.00]   \r\n[01:29.00]石板路有雾父在低诉\r\n[01:32.00]   \r\n[01:32.00]无奈的觉悟只能更残酷\r\n[01:35.00]   \r\n[01:35.00]一切都为了通往圣堂的路\r\n[01:38.00]   \r\n[01:38.00]吹不散的雾隐没了意图\r\n[01:40.00]   \r\n[01:40.00]谁轻柔踱步停住\r\n[01:43.00]   \r\n[01:43.00]还来不及哭穿过的子弹就带走温度\r\n[01:48.00]   \r\n[01:48.00]我们每个人都有罪\r\n[01:50.00]   \r\n[01:50.00]犯着不同的罪\r\n[01:51.00]   \r\n[01:51.00]我能决定谁对\r\n[01:53.00]   \r\n[01:53.00]谁又该要沉睡\r\n[01:54.00]   \r\n[01:54.00]争论不能解决\r\n[01:55.00]   \r\n[01:55.00]在永无止境的夜\r\n[01:57.00]   \r\n[01:57.00]关掉你的嘴\r\n[01:58.00]   \r\n[01:58.00]唯一的恩惠\r\n[01:59.00]   \r\n[01:59.00]挡在前面的人都有罪\r\n[02:01.00]   \r\n[02:01.00]后悔也无路可退\r\n[02:02.00]   \r\n[02:02.00]以父之名判决\r\n[02:03.00]   \r\n[02:03.00]那感觉没有适合字汇\r\n[02:05.00]   \r\n[02:05.00]就像边笑边掉泪\r\n[02:07.00]   \r\n[02:07.00]凝视着完全的黑\r\n[02:08.00]   \r\n[02:08.00]阻挡悲剧蔓延的悲剧会让我沉醉\r\n[02:10.00]   \r\n[02:10.00]低头亲吻我的左手\r\n[02:12.00]   \r\n[02:12.00]换取被宽恕的承诺\r\n[02:13.00]   \r\n[02:13.00]老旧管风琴在角落\r\n[02:15.00]   \r\n[02:15.00]一直一直一直伴奏\r\n[02:16.00]   \r\n[02:16.00]黑色帘幕被风吹动\r\n[02:17.00]   \r\n[02:17.00]阳光无言地穿透\r\n[02:19.00]   \r\n[02:19.00]洒向那群被我驯服后的兽\r\n[02:21.00]   \r\n[02:21.00]沉默地喊叫沉默地喊叫\r\n[02:23.00]   \r\n[02:23.00]孤单开始发酵\r\n[02:24.00]   \r\n[02:24.00]不停对着我嘲笑\r\n[02:25.00]   \r\n[02:25.00]回忆逐渐延烧\r\n[02:27.00]   \r\n[02:27.00]曾经纯真的画面\r\n[02:28.00]   \r\n[02:28.00]残忍地温柔出现\r\n[02:30.00]   \r\n[02:30.00]脆弱时间到\r\n[02:31.00]   \r\n[02:31.00]我们一起来祷告\r\n[02:32.00]   \r\n[02:32.00]仁慈的父我已坠入\r\n[02:36.00]   \r\n[02:36.00]看不见罪的国度\r\n[02:38.00]   \r\n[02:38.00]请原谅我的自负\r\n[02:41.00]   \r\n[02:41.00]Ah ya ya check it check it ah ya\r\n[02:44.00]   \r\n[02:44.00]没人能说没人可说\r\n[02:46.00]   \r\n[02:46.00]好难承受\r\n[02:48.00]   \r\n[02:48.00]荣耀的背后刻着一道孤独\r\n[02:52.00]   \r\n[02:52.00]Ah ya ya check it check it ah ya\r\n[02:54.00]   \r\n[02:54.00]闭上双眼我又看见\r\n[02:57.00]   \r\n[02:57.00]当年那梦的画面\r\n[03:00.00]   \r\n[03:00.00]天空是濛濛的雾\r\n[03:03.00]   \r\n[03:03.00]Ah ya ya check it check it ah ya\r\n[03:05.00]   \r\n[03:05.00]父亲牵着我的双手\r\n[03:08.00]   \r\n[03:08.00]轻轻走过\r\n[03:10.00]   \r\n[03:10.00]清晨那安安静静的石板路\r\n[03:14.00]   \r\n[03:14.00]Ah ya ya check it check it ah ya\r\n[03:23.00]   \r\n[03:23.00]Pie Jesu\r\n[03:28.00]慈悲的耶稣\r\n[03:28.00]Qui tollis peccata\r\n[03:33.00]请赦免世人的罪\r\n[03:33.00]Dona eis requiem\r\n[03:46.00]赐予他们安息\r\n[03:46.00]低头亲吻我的左手\r\n[03:47.00]   \r\n[03:47.00]换取被宽恕的承诺\r\n[03:49.00]   \r\n[03:49.00]老旧管风琴在角落\r\n[03:50.00]   \r\n[03:50.00]一直一直一直伴奏\r\n[03:52.00]   \r\n[03:52.00]黑色帘幕被风吹动\r\n[03:53.00]   \r\n[03:53.00]阳光无言地穿透\r\n[03:54.00]   \r\n[03:54.00]洒向那群被我驯服后的兽\r\n[03:57.00]   \r\n[03:57.00]沉默地喊叫沉默地喊叫\r\n[03:59.00]   \r\n[03:59.00]孤单开始发酵\r\n[04:00.00]   \r\n[04:00.00]不停对着我嘲笑\r\n[04:01.00]   \r\n[04:01.00]回忆逐渐延烧\r\n[04:03.00]   \r\n[04:03.00]曾经纯真的画面\r\n[04:04.00]   \r\n[04:04.00]残忍地温柔出现\r\n[04:05.00]   \r\n[04:05.00]脆弱时间到\r\n[04:06.00]   \r\n[04:06.00]我们一起来祷告\r\n[04:08.00]   \r\n[04:08.00]仁慈的父我已坠入\r\n[04:11.00]   \r\n[04:11.00]看不见罪的国度\r\n[04:14.00]   \r\n[04:14.00]请原谅我的自负\r\n[04:17.00]   \r\n[04:17.00]Ah ya ya check it check it ah ya\r\n[04:19.00]   \r\n[04:19.00]没人能说没人可说\r\n[04:22.00]   \r\n[04:22.00]好难承受\r\n[04:24.00]   \r\n[04:24.00]荣耀的背后刻着一道孤独\r\n[04:27.00]   \r\n[04:27.00]Ah ya ya check it check it ah ya\r\n[04:31.00]   \r\n[04:31.00]仁慈的父我已坠入\r\n[04:36.00]   \r\n[04:36.00]看不见罪的国度\r\n[04:41.00]   \r\n[04:41.00]请原谅我 我的自负\r\n[04:47.00]   \r\n[04:47.00]刻着一道孤独\r\n[04:52.00]   \r\n[04:52.00]仁慈的父我已坠入\r\n[04:55.00]   \r\n[04:55.00]看不见罪的国度\r\n[04:58.00]   \r\n[04:58.00]请原谅我的自负\r\n[05:00.00]   \r\n[05:00.00]Ah ya ya check it check it ah ya\r\n[05:03.00]   \r\n[05:03.00]没人能说没人可说\r\n[05:06.00]   \r\n[05:06.00]好难承受\r\n[05:08.00]   \r\n[05:08.00]荣耀的背后刻着一道孤独\r\n[05:11.00]   \r\n[05:11.00]Ah ya ya check it check it ah ya\r\n[05:14.00]   \r\n[05:14.00]闭上双眼我又看见\r\n[05:15.00]   \r\n[05:15.00]（斑驳的家徽擦拭了一夜）\r\n[05:17.00]   \r\n[05:17.00]当年那梦的画面\r\n[05:18.00]   \r\n[05:18.00]（孤独的光辉 才懂的感觉）\r\n[05:20.00]   \r\n[05:20.00]天空是濛濛的雾\r\n[05:21.00]   \r\n[05:21.00]（烛光 不不停的摇晃）\r\n[05:22.00]   \r\n[05:22.00]猫头鹰在窗棂上 对着远方眺望\r\n[05:25.00]   \r\n[05:25.00]父亲牵着我的双手\r\n[05:26.00]   \r\n[05:26.00]（通向大厅的长廊）\r\n[05:28.00]   \r\n[05:28.00]轻轻走过 清晨那\r\n[05:29.00]   \r\n[05:29.00]（一样说不出的沧桑）\r\n[05:30.00]   \r\n[05:30.00]安安静静的石板路\r\n[05:31.00]   \r\n[05:31.00]（没有喧嚣 只有宁静围绕）\r\n[05:33.00]   \r\n[05:33.00]我 慢慢睡着\r\n[05:34.00]   \r\n[05:34.00]天 刚刚破晓\r\n[05:39.00]   ', 1, '/uploads/audio/1750732399360-78481081.mp3', '2025-06-24 10:33:19', 1, 1, 0, '3:39', '/uploads/images/sings/1750732399539-237290092.jpg');

-- ----------------------------
-- Table structure for singer
-- ----------------------------
DROP TABLE IF EXISTS `singer`;
CREATE TABLE `singer`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `sexy` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `birth` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `area` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `master` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
  `hot` int NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_singer_name`(`name` ASC) USING BTREE,
  INDEX `idx_singer_area`(`area` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of singer
-- ----------------------------
INSERT INTO `singer` VALUES (1, '/uploads/images/singers/jay.jpg', '周杰伦', '男', '1979-01-18', '中国台湾', '晴天', '华语流行乐坛天王，创作型歌手，音乐制作人', 112);
INSERT INTO `singer` VALUES (2, '/uploads/images/singers/gem.jpg', '邓紫棋', '女', '1991-08-16', '中国香港', '泡沫', '华语流行乐坛天后，创作型歌手', 98);
INSERT INTO `singer` VALUES (3, '/uploads/images/singers/mayday.jpg', '五月天', '组合', '1997-03-29', '中国台湾', '倔强', '华语摇滚乐团，由阿信、怪兽、石头、玛莎、冠佑组成', 96);
INSERT INTO `singer` VALUES (4, '/uploads/images/singers/jj.jpg', '林俊杰', '男', '1981-03-27', '新加坡', '学不会', '新加坡华语流行乐坛歌手，音乐制作人', 85);
INSERT INTO `singer` VALUES (5, '/uploads/images/singers/jolin.jpg', '蔡依林', '女', '1980-09-15', '中国台湾', '大艺术家', '华语流行乐坛天后，舞曲天后', 80);
INSERT INTO `singer` VALUES (6, '/uploads/images/singers/eason.jpg', '陈奕迅', '男', '1974-07-27', '中国香港', '浮夸', '香港华语流行乐坛歌手，被誉为\"歌神\"', 95);
INSERT INTO `singer` VALUES (7, '/uploads/images/singers/amei.jpg', '张惠妹', '女', '1972-08-09', '中国台湾', '掉了', '华语流行乐坛天后，阿妹', 85);
INSERT INTO `singer` VALUES (8, '/uploads/images/singers/leehom.jpg', '王力宏', '男', '1976-05-17', '美国', '大城小爱', '美籍华裔流行乐坛歌手，音乐制作人', 78);

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `role` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `phone` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_username`(`username` ASC) USING BTREE,
  INDEX `idx_user_email`(`email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 11 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES (1, 'user1', '张三', 'password123', '/images/users/user1.jpg', 'USER', '13800138002', 'user1@example.com');
INSERT INTO `user` VALUES (2, 'user2', '李四', '123456', '/images/users/user2.jpg', 'USER', '13800138003', 'user2@example.com');
INSERT INTO `user` VALUES (3, 'user3', '王五', 'password123', '/images/users/user3.jpg', 'USER', '13800138004', 'user3@example.com');
INSERT INTO `user` VALUES (4, 'user4', '赵六', 'password123', '/images/users/user4.jpg', 'USER', '13800138005', 'user4@example.com');
INSERT INTO `user` VALUES (5, 'user5', '钱七', 'password123', '/images/users/user5.jpg', 'USER', '13800138006', 'user5@example.com');

SET FOREIGN_KEY_CHECKS = 1;
