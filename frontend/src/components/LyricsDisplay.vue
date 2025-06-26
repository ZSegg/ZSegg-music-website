<template>
  <div class="lyrics-display">
    <div v-if="!lyrics || lyrics.length === 0" class="no-lyrics">
      <el-icon><Document /></el-icon>
      <span>暂无歌词</span>
    </div>
    <div v-else class="lyrics-container" ref="lyricsContainer">
      <div
        v-for="(line, index) in lyrics"
        :key="index"
        :class="[
          'lyrics-line',
          { 'active': currentLyricIndex === index }
        ]"
        :ref="el => { if (el) lineRefs[index] = el; }"
      >
        <span class="lyrics-text">{{ line.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, computed } from 'vue';
import { Document } from '@element-plus/icons-vue';
import { parseLrc } from '../utils/lyrics';

const props = defineProps({
  lyricsText: {
    type: String,
    default: ''
  },
  currentTime: {
    type: Number,
    default: 0
  }
});

const lyricsContainer = ref(null);
const lineRefs = ref([]);

// 解析歌词
const lyrics = computed(() => {
  return parseLrc(props.lyricsText);
});

// 当前歌词索引
const currentLyricIndex = computed(() => {
  if (!lyrics.value.length) return -1;
  
  for (let i = lyrics.value.length - 1; i >= 0; i--) {
    if (props.currentTime >= lyrics.value[i].time) {
      return i;
    }
  }
  return -1;
});

// 监听当前歌词变化，自动滚动
watch(currentLyricIndex, async (newIndex) => {
  if (newIndex >= 0 && lineRefs.value[newIndex]) {
    await nextTick();
    const activeElement = lineRefs.value[newIndex];
    if (activeElement && lyricsContainer.value) {
      activeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }
});
</script>

<style scoped>
.lyrics-display {
  height: 300px;
  overflow: hidden;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fafafa;
}

.no-lyrics {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  gap: 8px;
}

.lyrics-container {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

.lyrics-line {
  padding: 8px 0;
  text-align: center;
  transition: all 0.3s ease;
  opacity: 0.6;
}

.lyrics-line.active {
  opacity: 1;
  color: #409eff;
  font-weight: bold;
  transform: scale(1.05);
}

.lyrics-text {
  font-size: 14px;
  line-height: 1.5;
}

/* 自定义滚动条 */
.lyrics-container::-webkit-scrollbar {
  width: 6px;
}

.lyrics-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.lyrics-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.lyrics-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style> 