<template>
  <div class="song-detail">
    <Header />

    <div class="content" v-loading="loading">
      <!-- 返回首页按钮 -->
      <div class="back-to-home">
        <el-button @click="$router.push('/')" type="info" plain>
          <el-icon><House /></el-icon>
          返回首页
        </el-button>
      </div>

      <div v-if="song" class="song-info">
        <div class="song-header">
          <div class="song-cover">
            <img
              :src="getImageUrl(song.cover_url || song.album?.img)"
              :alt="song.name"
              @error="handleImageError"
            />
          </div>
          <div class="song-meta">
            <h1>{{ song.name }}</h1>
            <p class="singer">
              歌手：<router-link :to="`/singer/${song.singer_id}`">{{
                song.singer_name
              }}</router-link>
            </p>
            <p class="album" v-if="song.album_name">
              专辑：<router-link :to="`/album/${song.album_id}`">{{
                song.album_name
              }}</router-link>
            </p>
            <p class="duration">时长：{{ formatDuration(song.duration) }}</p>
            <p class="hot">播放次数：{{ song.hot }}</p>
            <div class="actions">
              <el-button type="primary" @click="playSong">
                <el-icon><VideoPlay /></el-icon>
                播放
              </el-button>
              <el-button @click="toggleCollect">
                <el-icon><Star /></el-icon>
                {{ isCollected ? "取消收藏" : "收藏" }}
              </el-button>
            </div>
          </div>
        </div>

        <div class="song-content">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="歌词" name="lyrics">
              <div class="lyrics-section">
                <LyricsDisplay
                  :lyrics-text="song.lyrics || ''"
                  :current-time="playerStore.currentTime"
                />
              </div>
            </el-tab-pane>

            <el-tab-pane label="评论" name="comments">
              <div class="comments-section">
                <div class="comment-form">
                  <el-input
                    v-model="commentContent"
                    type="textarea"
                    :rows="3"
                    placeholder="写下你的评论..."
                  />
                  <el-button type="primary" @click="addComment" :loading="submitting">
                    发表评论
                  </el-button>
                </div>

                <div class="comment-list">
                  <!-- {{ comments }} -->
                  <div v-for="comment in comments" :key="comment.id" class="comment-item">
                    <div class="comment-header">
                      <span class="username">{{ comment.name || "匿名用户" }}</span>
                      <span class="time">{{ comment.time }}</span>
                    </div>
                    <div class="comment-content">{{ comment.content }}</div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="related-songs" v-if="relatedSongs.length > 0">
          <h3>相关歌曲</h3>
          <div class="song-grid">
            <div
              v-for="relatedSong in relatedSongs"
              :key="relatedSong.id"
              class="song-card"
              @click="playRelatedSong(relatedSong)"
            >
              <img
                :src="getImageUrl(relatedSong.cover_url || relatedSong.album?.img)"
                :alt="relatedSong.name"
                @error="handleImageError"
              />
              <div class="song-info">
                <h4>{{ relatedSong.name }}</h4>
                <p>{{ relatedSong.singer_name }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePlayerStore } from "../stores/player";
import { useUserStore } from "../stores/user";
import {
  getSongById,
  getComments,
  addComment as apiAddComment,
  getCollections,
  addCollection,
  removeCollection,
} from "../api/music";
import { getImageUrl, handleImageError } from "../utils/image";
import { ElMessage } from "element-plus";
import { VideoPlay, Star, House } from "@element-plus/icons-vue";
import Header from "../components/Header.vue";
import LyricsDisplay from "../components/LyricsDisplay.vue";

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();
const userStore = useUserStore();

const loading = ref(false);
const submitting = ref(false);
const song = ref(null);
const comments = ref([]);
const relatedSongs = ref([]);
const commentContent = ref("");
const activeTab = ref("lyrics");

const isCollected = computed(() => {
  return userStore.isCollected(song.value?.id, "SONG");
});

const loadSongDetail = async () => {
  loading.value = true;
  try {
    const songId = route.params.id;
    const response = await getSongById(songId);
    if (response.success) {
      song.value = response.data;
      relatedSongs.value = response.data.related_songs || [];
    }
  } catch (error) {
    ElMessage.error("加载歌曲详情失败");
  } finally {
    loading.value = false;
  }
};

const loadComments = async () => {
  try {
    const songId = route.params.id;
    const response = await getComments(songId);
    if (response.success) {
      comments.value = response.data;
    }
  } catch (error) {
    console.error("加载评论失败:", error);
  }
};

const playSong = () => {
  if (song.value) {
    playerStore.play(song.value);
  }
};

const playRelatedSong = (relatedSong) => {
  playerStore.play(relatedSong);
  router.push(`/song/${relatedSong.id}`);
};

const toggleCollect = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    router.push("/login");
    return;
  }

  try {
    if (isCollected.value) {
      // 取消收藏
      const collection = userStore.collections.find(
        (c) => c.rel_id === song.value.id && c.type === "SONG"
      );
      if (collection) {
        await removeCollection(collection.id);
        userStore.removeFromCollections(collection.id);
        ElMessage.success("取消收藏成功");
      }
    } else {
      // 添加收藏
      const response = await addCollection({
        relId: song.value.id,
        type: "SONG",
      });
      if (response.success) {
        // 添加到本地收藏列表
        userStore.addToCollections(response.data);
        ElMessage.success("收藏成功");
      }
    }
  } catch (error) {
    console.error("收藏操作失败:", error);
    ElMessage.error("操作失败，请重试");
  }
};

const addComment = async () => {
  if (!userStore.user) {
    ElMessage.warning("请先登录");
    return;
  }

  if (!commentContent.value.trim()) {
    ElMessage.warning("请输入评论内容");
    return;
  }

  submitting.value = true;
  try {
    const songId = route.params.id;
    await apiAddComment(songId, commentContent.value.trim());
    ElMessage.success("评论发表成功");
    commentContent.value = "";
    await loadComments();
  } catch (error) {
    ElMessage.error("评论发表失败");
  } finally {
    submitting.value = false;
  }
};

const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

onMounted(async () => {
  await loadSongDetail();
  await loadComments();
  // 如果用户已登录，加载收藏信息
  if (userStore.isLoggedIn) {
    await userStore.loadCollections();
  }
});
</script>

<style scoped>
.song-detail {
  min-height: 100vh;
  background: #f5f5f5;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.back-to-home {
  margin-bottom: 20px;
}

.back-to-home .el-button {
  font-size: 14px;
}

.song-info {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.song-header {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.song-cover img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.song-meta h1 {
  margin: 0 0 20px 0;
  font-size: 28px;
  color: #333;
}

.song-meta p {
  margin: 10px 0;
  color: #666;
  font-size: 14px;
}

.song-meta a {
  color: #409eff;
  text-decoration: none;
}

.song-meta a:hover {
  text-decoration: underline;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.song-content {
  margin-bottom: 30px;
}

.lyrics-section {
  padding: 20px 0;
}

.comments-section {
  padding: 20px 0;
}

.comment-form {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-form .el-button {
  align-self: flex-end;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fafafa;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.username {
  font-weight: bold;
  color: #409eff;
}

.time {
  color: #909399;
  font-size: 12px;
}

.comment-content {
  color: #333;
  line-height: 1.5;
}

.related-songs {
  margin-top: 30px;
}

.related-songs h3 {
  margin-bottom: 20px;
  color: #333;
}

.song-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.song-card {
  cursor: pointer;
  transition: transform 0.2s;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.song-card:hover {
  transform: translateY(-2px);
}

.song-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.song-card .song-info {
  padding: 10px;
  background: white;
}

.song-card h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.song-card p {
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}
</style>
