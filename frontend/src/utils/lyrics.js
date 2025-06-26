/**
 * LRC 歌词解析工具
 */

// 解析 LRC 格式歌词
export const parseLrc = (lrcText) => {
  if (!lrcText || !lrcText.trim()) {
    return [];
  }

  const lines = lrcText.trim().split("\n");
  const lyrics = [];

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // 匹配时间标签 [mm:ss.xx]
    const timePattern = /\[(\d{2}):(\d{2})\.(\d{2})\]/g;
    const text = trimmedLine.replace(timePattern, "").trim();

    if (!text) return;

    let match;
    while ((match = timePattern.exec(trimmedLine)) !== null) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3]);
      const time = minutes * 60 + seconds + milliseconds / 100;

      lyrics.push({
        time,
        text,
        rawTime: match[0],
      });
    }
  });

  // 按时间排序
  return lyrics.sort((a, b) => a.time - b.time);
};

// 格式化时间为 LRC 格式
export const formatTimeToLrc = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 100);

  return `[${minutes.toString().padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}]`;
};

// 从 LRC 时间格式解析为秒数
export const parseLrcTime = (timeString) => {
  const match = timeString.match(/\[(\d{2}):(\d{2})\.(\d{2})\]/);
  if (!match) return 0;

  const minutes = parseInt(match[1]);
  const seconds = parseInt(match[2]);
  const milliseconds = parseInt(match[3]);

  return minutes * 60 + seconds + milliseconds / 100;
};

// 验证 LRC 格式
export const validateLrc = (lrcText) => {
  if (!lrcText || !lrcText.trim()) {
    return { valid: true, errors: [] };
  }

  const lines = lrcText.trim().split("\n");
  const errors = [];
  const lrcPattern = /^\[(\d{2}):(\d{2})\.(\d{2})\]/;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !lrcPattern.test(trimmedLine)) {
      errors.push(`第${index + 1}行格式错误：${trimmedLine}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

// 生成示例 LRC 歌词
export const generateSampleLrc = (songName, singerName) => {
  return `[00:00.00]${songName}
[00:03.50]${singerName}
[00:07.00]第一句歌词
[00:10.50]第二句歌词
[00:14.00]第三句歌词
[00:17.50]第四句歌词
[00:21.00]副歌第一句
[00:24.50]副歌第二句
[00:28.00]副歌第三句
[00:31.50]副歌第四句`;
};
