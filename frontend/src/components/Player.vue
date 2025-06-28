<template>
  <transition name="slide-up">
    <div class="player" v-if="playerStore.currentSong && showPlayer">
      <div class="player-content">
        <!-- 歌曲信息 -->
        <div class="song-info">
          <img
            :src="getCoverUrl(playerStore.currentSong)"
            :alt="playerStore.currentSong.name"
            @click="goToSongDetail"
            class="song-cover"
          />
          <div class="song-details">
            <!-- {{ playerStore.currentSong }} -->
            <h4>{{ playerStore.currentSong.name }}</h4>
            <p>{{ playerStore.currentSong.singer?.name }}</p>
          </div>
        </div>

        <!-- 播放控制 -->
        <div class="player-controls">
          <div class="control-buttons">
            <el-button circle @click="playerStore.prev" :disabled="!playerStore.hasPrev">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <el-button circle size="large" @click="togglePlay">
              <el-icon v-if="playerStore.isPlaying"><VideoPause /></el-icon>
              <el-icon v-else><VideoPlay /></el-icon>
            </el-button>
            <el-button circle @click="playerStore.next" :disabled="!playerStore.hasNext">
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>

          <!-- 进度条 -->
          <div class="progress-container">
            <span class="time">{{ formatTime(playerStore.currentTime) }}</span>
            <el-slider
              v-model="currentTimeSlider"
              :max="playerStore.duration"
              @change="seekTo"
              class="progress-slider"
            />
            <span class="time">{{ formatTime(playerStore.duration) }}</span>
          </div>
        </div>

        <!-- 音量控制 -->
        <div class="volume-control">
          <el-icon><Microphone /></el-icon>
          <el-slider
            v-model="playerStore.volume"
            :max="1"
            :step="0.1"
            @change="setVolume"
            class="volume-slider"
          />
        </div>
      </div>
    </div>
  </transition>
  <audio
    v-if="playerStore.currentSong"
    ref="audioRef"
    :src="getAudioUrl(playerStore.currentSong)"
    @loadedmetadata="onLoadedMetadata"
    @timeupdate="onTimeUpdate"
    @ended="onEnded"
    @error="onError"
    style="display: none"
  />
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { usePlayerStore } from "../stores/player";
import { ElMessage } from "element-plus";
import { updatePlayCount } from "../api/music";
import {
  ArrowLeft,
  ArrowRight,
  VideoPlay,
  VideoPause,
  Microphone,
} from "@element-plus/icons-vue";

const router = useRouter();
const playerStore = usePlayerStore();
const audioRef = ref(null);
const showPlayer = ref(false);

const currentTimeSlider = computed({
  get: () => playerStore.currentTime,
  set: (value) => playerStore.setCurrentTime(value),
});

const togglePlay = async () => {
  if (playerStore.isPlaying) {
    audioRef.value?.pause();
    playerStore.pause();
  } else {
    // 开始播放时更新播放次数
    if (playerStore.currentSong && playerStore.currentSong.id) {
      try {
        await updatePlayCount(playerStore.currentSong.id);
        // 更新本地播放次数
        if (playerStore.currentSong.hot !== undefined) {
          playerStore.currentSong.hot = (playerStore.currentSong.hot || 0) + 1;
        }
      } catch (error) {
        console.error("更新播放次数失败:", error);
      }
    }

    audioRef.value?.play();
    playerStore.resume();
  }
};

const seekTo = (value) => {
  if (audioRef.value) {
    audioRef.value.currentTime = value;
    playerStore.setCurrentTime(value);
  }
};

const setVolume = (value) => {
  if (audioRef.value) {
    audioRef.value.volume = value;
    playerStore.setVolume(value);
  }
};

const onLoadedMetadata = () => {
  if (audioRef.value) {
    playerStore.setDuration(audioRef.value.duration);
    audioRef.value.volume = playerStore.volume;
    if (playerStore.isPlaying) {
      audioRef.value.play().catch(() => {});
    }
  }
};

const onTimeUpdate = () => {
  if (audioRef.value) {
    playerStore.setCurrentTime(audioRef.value.currentTime);
  }
};

const onEnded = () => {
  playerStore.next();
};

const onError = (error) => {
  console.error("音频播放错误:", error);
  console.error("当前歌曲:", playerStore.currentSong);
  console.error("音频URL:", getAudioUrl(playerStore.currentSong));

  // 显示用户友好的错误信息
  ElMessage.error("音频文件加载失败，请检查文件是否存在");
};

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getAudioUrl = (song) => {
  if (!song) return null;
  // return song.audio_url;
  // console.log("song.audio_url: ", song.audio_url);

  // 如果是完整的URL（以http开头），直接返回
  if (song.audio_url && song.audio_url.startsWith("http")) {
    return song.audio_url;
  }

  // 如果是相对路径，需要添加API前缀
  if (song.audio_url) {
    return `/api${song.audio_url}`;
  }

  // 处理旧的link字段
  if (song.link) {
    if (song.link.startsWith("http")) {
      return song.link;
    } else {
      return `/api${song.link}`;
    }
  }

  return null;
};

const getCoverUrl = (song) => {
  if (!song) return null;
  if (song.cover_url && song.cover_url.startsWith("http")) {
    return song.cover_url;
  } else if (song.cover_url) {
    return `/api${song.cover_url}`;
  }
  return song.album?.img || "/default-cover.jpg";
};

// 监听播放状态变化
watch(
  () => playerStore.isPlaying,
  (isPlaying) => {
    if (isPlaying) {
      audioRef.value?.play();
    } else {
      audioRef.value?.pause();
    }
  }
);

// 监听当前歌曲变化
watch(
  () => playerStore.currentSong,
  (song) => {
    console.log("song: ", song);
    // 这里不再直接 play，由 onLoadedMetadata 负责
  }
);

const handleMouseMove = (e) => {
  // 距离底部 80px 内显示播放器
  const threshold = 80;
  const viewportHeight = window.innerHeight;
  if (viewportHeight - e.clientY <= threshold) {
    showPlayer.value = true;
  } else {
    showPlayer.value = false;
  }
};

onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
});
onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
});

const goToSongDetail = () => {
  if (playerStore.currentSong && playerStore.currentSong.id) {
    router.push(`/song/${playerStore.currentSong.id}`);
  }
};
</script>

<style scoped>
.player {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(16px);
  border-top: 1.5px solid #e0e0e0;
  z-index: 1000;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s;
}

.player-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 12px 28px 12px 20px;
  display: flex;
  align-items: center;
  gap: 28px;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 220px;
}

.song-info img {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  border: 2px solid #f0f0f0;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.song-info img:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.song-details h4 {
  margin: 0 0 2px 0;
  font-size: 16px;
  color: #222;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-details p {
  margin: 0;
  font-size: 13px;
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 18px;
}

.control-buttons .el-button {
  background: #f5f7fa;
  border: none;
  box-shadow: 0 1px 4px rgba(102, 126, 234, 0.06);
  color: #409eff;
  transition: background 0.2s, color 0.2s;
}
.control-buttons .el-button:hover {
  background: #e6f0ff;
  color: #337ecc;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 420px;
}

.time {
  font-size: 12px;
  color: #aaa;
  min-width: 38px;
}

.progress-slider {
  flex: 1;
  --el-slider-main-bg-color: #409eff;
  --el-slider-runway-bg-color: #e0e7ef;
  --el-slider-height: 4px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 140px;
  background: #f7f9fa;
  border-radius: 16px;
  padding: 4px 12px;
  box-shadow: 0 1px 4px rgba(102, 126, 234, 0.04);
}

.volume-slider {
  flex: 1;
  --el-slider-main-bg-color: #409eff;
  --el-slider-runway-bg-color: #e0e7ef;
  --el-slider-height: 4px;
}

.volume-control .el-icon {
  font-size: 18px;
  color: #409eff;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}
.toggle-btn,
.show-btn {
  display: none;
}

@media (max-width: 700px) {
  .player-content {
    flex-direction: column;
    gap: 10px;
    padding: 10px 6px 10px 6px;
  }
  .song-info {
    min-width: 0;
    gap: 8px;
  }
  .song-info img {
    width: 44px;
    height: 44px;
  }
  .player-controls {
    gap: 6px;
  }
  .progress-container {
    max-width: 100%;
    gap: 6px;
  }
  .volume-control {
    min-width: 0;
    padding: 2px 6px;
    gap: 6px;
  }
  .toggle-btn,
  .show-btn {
    right: 10px;
    bottom: 70px;
    padding: 4px 12px;
    font-size: 13px;
  }
}
</style>
