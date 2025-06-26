-- 修复 lyrics 字段类型问题
-- 将 TEXT 类型改为 LONGTEXT 以支持更长的歌词内容

USE music_db;

-- 检查字段是否存在，如果存在则修改类型
ALTER TABLE sing MODIFY COLUMN lyrics LONGTEXT;

-- 验证修改结果
SELECT 
  COLUMN_NAME, 
  DATA_TYPE, 
  CHARACTER_MAXIMUM_LENGTH,
  IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'music_db' 
  AND TABLE_NAME = 'sing' 
  AND COLUMN_NAME = 'lyrics'; 