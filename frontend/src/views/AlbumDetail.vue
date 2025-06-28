<template>
  <div class="album-detail">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 专辑详情 -->
    <div v-else-if="album" class="album-content">
      <!-- 返回首页按钮 -->
      <div class="back-to-home">
        <el-button @click="$router.push('/')" type="info" plain>
          <el-icon><House /></el-icon>
          返回首页
        </el-button>
      </div>
      
      <div class="album-header">
        <img
          class="cover"
          :src="getImageUrl(album.img)"
          :alt="album.name"
          @error="handleImageError"
        />
        <div class="info">
          <h2>{{ album.name }}</h2>
          <div class="meta">
            <span>歌手：</span>
            <router-link :to="`/singer/${album.singer_id}`">{{
              album.singer_name
            }}</router-link>
            <span class="divider">|</span>
            <span>发行时间：{{ album.time }}</span>
          </div>
          <div class="actions">
            <el-button type="primary" @click="playAll" :disabled="!album.songs?.length">
              <el-icon><VideoPlay /></el-icon>
              播放全部
            </el-button>
            <el-button :type="isCollected ? 'danger' : 'info'" @click="toggleCollect">
              <el-icon><Star /></el-icon>
              {{ isCollected ? "已收藏" : "收藏" }}
            </el-button>
          </div>
          <div class="desc">
            <span>热度：{{ album.hot }}</span>
            <span class="divider">|</span>
            <span>语种：{{ album.language }}</span>
            <span class="divider">|</span>
            <span>唱片公司：{{ album.company }}</span>
            <span class="divider">|</span>
            <span>歌曲数：{{ album.songs?.length || 0 }}</span>
          </div>
          <div v-if="album.description" class="description">
            <h4>专辑简介</h4>
            <p>{{ album.description }}</p>
          </div>
        </div>
      </div>

      <el-divider>歌曲列表</el-divider>
      <div class="song-list">
        <el-table :data="album.songs" stripe v-loading="loading">
          <el-table-column width="50">
            <template #default="{ $index }">
              <span class="song-index">{{ $index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="歌曲" min-width="300">
            <template #default="{ row }">
              <div class="song-info">
                <span class="song-name" @click="playSong(row)">{{ row.name }}</span>
                <span v-if="row.composer" class="composer">作曲：{{ row.composer }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="歌手" width="150">
            <template #default="{ row }">
              <router-link :to="`/singer/${row.singer_id}`">{{
                row.singer_name
              }}</router-link>
            </template>
          </el-table-column>
          <el-table-column label="时长" width="100">
            <template #default="{ row }">
              {{ formatDuration(row.duration) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button text type="primary" @click="playSong(row)">播放</el-button>
              <el-button text type="info" @click="addToPlaylist(row)"
                >添加到歌单</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 错误状态 -->
    <el-empty v-else description="专辑不存在或已被删除" />

    <el-dialog v-model="playlistDialogVisible" title="添加到歌单" width="400px">
      <el-radio-group v-model="selectedPlaylistId" style="display: block">
        <el-radio v-for="playlist in myPlaylists" :key="playlist.id" :label="playlist.id">
          {{ playlist.name }}
        </el-radio>
      </el-radio-group>
      <template #footer>
        <el-button @click="playlistDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddToPlaylist">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePlayerStore } from "../stores/player";
import { useUserStore } from "../stores/user";
import {
  getAlbumById,
  getCollections,
  addCollection,
  removeCollection,
  getPlaylists,
} from "../api/music";
import { ElMessage } from "element-plus";
import { getImageUrl, handleImageError } from "../utils/image";
import { formatDuration } from "../utils/format";
import { VideoPlay, Star, House } from "@element-plus/icons-vue";
import { addSongToPlaylist } from "../api/music.js";

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();
const userStore = useUserStore();

const album = ref(null);
const loading = ref(false);

const playlistDialogVisible = ref(false);
const myPlaylists = ref([]);
const selectedPlaylistId = ref(null);
const songToAdd = ref(null);

const albumId = computed(() => route.params.id);

const isCollected = computed(() => {
  return userStore.isCollected(albumId.value, "ALBUM");
});

const fetchAlbum = async () => {
  loading.value = true;
  try {
    const res = await getAlbumById(albumId.value);
    album.value = res.data;
  } catch (error) {
    console.error("获取专辑详情失败:", error);
    ElMessage.error("获取专辑详情失败");
  } finally {
    loading.value = false;
  }
};

const playAll = () => {
  if (album.value?.songs?.length > 0) {
    playerStore.setPlaylist(album.value.songs);
    playerStore.play(album.value.songs[0], 0);
    ElMessage.success("开始播放专辑");
  } else {
    ElMessage.warning("专辑中没有歌曲");
  }
};

const playSong = (song) => {
  playerStore.play(song);
  ElMessage.success(`正在播放：${song.name}`);
};

const toggleCollect = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.info("请先登录");
    router.push("/login");
    return;
  }

  try {
    if (isCollected.value) {
      // 取消收藏
      const collection = userStore.collections.find(
        (c) => c.rel_id == albumId.value && c.type === "ALBUM"
      );
      if (collection) {
        await removeCollection(collection.id);
        userStore.removeFromCollections(collection.id);
        ElMessage.success("已取消收藏");
      }
    } else {
      // 添加收藏
      const response = await addCollection({ 
        relId: albumId.value, 
        type: "ALBUM" 
      });
      if (response.success) {
        userStore.addToCollections(response.data);
        ElMessage.success("收藏成功");
      }
    }
  } catch (error) {
    console.error("收藏操作失败:", error);
    ElMessage.error("操作失败，请重试");
  }
};

const fetchMyPlaylists = async () => {
  try {
    const res = await getPlaylists({ user_id: userStore.user?.id });
    myPlaylists.value = res.data;
  } catch (error) {
    myPlaylists.value = [];
  }
};

const addToPlaylist = (song) => {
  if (!userStore.isLoggedIn) {
    ElMessage.info("请先登录");
    router.push("/login");
    return;
  }
  songToAdd.value = song;
  fetchMyPlaylists();
  playlistDialogVisible.value = true;
};

const handleAddToPlaylist = async () => {
  if (!selectedPlaylistId.value) {
    ElMessage.warning("请选择一个歌单");
    return;
  }
  try {
    await addSongToPlaylist(selectedPlaylistId.value, songToAdd.value.id);
    ElMessage.success("添加成功");
    playlistDialogVisible.value = false;
    selectedPlaylistId.value = null;
    songToAdd.value = null;
  } catch (error) {
    ElMessage.error("添加失败");
  }
};

onMounted(async () => {
  await fetchAlbum();
  // 如果用户已登录，加载收藏信息
  if (userStore.isLoggedIn) {
    await userStore.loadCollections();
  }
});
</script>

<style scoped>
.album-detail {
  max-width: 1000px;
  margin: 30px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 32px;
}

.loading-container {
  padding: 40px;
}

.album-content {
  min-height: 400px;
}

.back-to-home {
  margin-bottom: 20px;
}

.back-to-home .el-button {
  font-size: 14px;
}

.album-header {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  margin-bottom: 32px;
}

.cover {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;
}

.cover:hover {
  transform: scale(1.02);
}

.info {
  flex: 1;
}

.info h2 {
  margin: 0 0 16px 0;
  font-size: 28px;
  color: #333;
  font-weight: 600;
}

.meta {
  margin: 12px 0;
  color: #666;
  font-size: 15px;
}

.meta a {
  color: #409eff;
  text-decoration: none;
}

.meta a:hover {
  text-decoration: underline;
}

.meta .divider {
  margin: 0 8px;
  color: #ccc;
}

.actions {
  margin-bottom: 12px;
  display: flex;
  gap: 12px;
}

.desc {
  color: #888;
  font-size: 14px;
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.desc .divider {
  color: #ccc;
}

.description {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.description h4 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
}

.description p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.song-list {
  margin-top: 24px;
}

.song-index {
  color: #999;
  font-size: 14px;
  font-weight: 500;
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-name {
  color: #333;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;
}

.song-name:hover {
  color: #409eff;
}

.composer {
  color: #999;
  font-size: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .album-detail {
    margin: 16px;
    padding: 20px;
  }

  .album-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }

  .cover {
    width: 150px;
    height: 150px;
    margin: 0 auto;
  }

  .info h2 {
    font-size: 24px;
  }

  .actions {
    justify-content: center;
  }

  .desc {
    justify-content: center;
  }
}
</style>
