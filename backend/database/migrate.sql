-- 数据库迁移脚本：为 sing 表添加新字段

USE music_db;

-- 修改 lyrics 字段类型为 LONGTEXT
ALTER TABLE sing MODIFY COLUMN lyrics LONGTEXT;

-- 添加 audio_url 字段
ALTER TABLE sing ADD COLUMN IF NOT EXISTS audio_url VARCHAR(255);

-- 添加 cover_url 字段
ALTER TABLE sing ADD COLUMN IF NOT EXISTS cover_url VARCHAR(255);

-- 更新现有记录的字段值
UPDATE sing SET 
  lyrics = CASE 
    WHEN lyrics IS NULL OR lyrics = '' THEN CONCAT(
      '[00:00.00]', name, '\n',
      '[00:03.50]歌手名称\n',
      '[00:07.00]第一句歌词\n',
      '[00:10.50]第二句歌词\n',
      '[00:14.00]第三句歌词\n',
      '[00:17.50]第四句歌词\n',
      '[00:21.00]副歌第一句\n',
      '[00:24.50]副歌第二句\n',
      '[00:28.00]副歌第三句\n',
      '[00:31.50]副歌第四句'
    )
    ELSE lyrics
  END,
  audio_url = CASE 
    WHEN audio_url IS NULL OR audio_url = '' THEN link
    ELSE audio_url
  END,
  cover_url = CONCAT('/cover/', id, '.jpg')
WHERE lyrics IS NULL OR audio_url IS NULL OR cover_url IS NULL; 