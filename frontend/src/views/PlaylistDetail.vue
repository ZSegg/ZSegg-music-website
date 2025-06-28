<template>
  <div class="playlist-detail" v-if="playlist">
    <!-- 返回首页按钮 -->
    <div class="back-to-home">
      <el-button @click="$router.push('/')" type="info" plain>
        <el-icon><House /></el-icon>
        返回首页
      </el-button>
    </div>
    
    <div class="playlist-header">
      <img
        class="cover"
        :src="playlist.img"
        :alt="playlist.name"
        @error="handleImageError"
      />
      <div class="info">
        <h2>{{ playlist.name }}</h2>
        <div class="meta">
          <span>创建者：</span>
          <span>{{ playlist.creator_name || playlist.username }}</span>
          <span class="divider">|</span>
          <span>创建时间：{{ playlist.time }}</span>
          <span class="divider">|</span>
          <span>{{ playlist.songs?.length || 0 }}首歌曲</span>
        </div>
        <div class="actions">
          <el-button type="primary" @click="playAll">播放全部</el-button>
          <el-button :type="isCollected ? 'danger' : 'info'" @click="toggleCollect">
            <el-icon><Star /></el-icon>
            {{ isCollected ? "已收藏" : "收藏" }}
          </el-button>
          <el-button v-if="isOwner" type="warning" @click="editPlaylist">
            编辑歌单
          </el-button>
        </div>
        <div v-if="playlist.description" class="description">
          <h4>歌单简介</h4>
          <p>{{ playlist.description }}</p>
        </div>
      </div>
    </div>

    <el-divider>歌曲列表</el-divider>
    <div class="song-list">
      <el-table :data="playlist.songs" stripe>
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
        <el-table-column label="专辑" width="150">
          <template #default="{ row }">
            <router-link :to="`/album/${row.album_id}`">{{ row.album_name }}</router-link>
          </template>
        </el-table-column>
        <el-table-column label="时长" width="100">
          <template #default="{ row }">
            {{ formatDuration(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column label="播放次数" width="120">
          <template #default="{ row }">
            {{ row.hot || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button text type="primary" @click="playSong(row)">播放</el-button>
            <el-button v-if="isOwner" text type="danger" @click="removeSong(row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑歌单对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑歌单" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="歌单名称">
          <el-input v-model="editForm.name" placeholder="请输入歌单名称" />
        </el-form-item>
        <el-form-item label="歌单简介">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入歌单简介"
          />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-input v-model="editForm.img" placeholder="请输入封面图片URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
  <el-empty v-else description="歌单不存在或已被删除" />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePlayerStore } from "../stores/player";
import { useUserStore } from "../stores/user";
import {
  getPlaylistById,
  updatePlaylist,
  removeSongFromPlaylist,
  getCollections,
  addCollection,
  removeCollection,
} from "../api/music";
import { ElMessage, ElMessageBox } from "element-plus";
import { getImageUrl, handleImageError } from "../utils/image";
import { formatDuration } from "../utils/format";
import { Star, House } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();
const userStore = useUserStore();

const playlist = ref(null);
const isCollected = computed(() => {
  return userStore.isCollected(playlistId.value, "PLAYLIST");
});
const editDialogVisible = ref(false);
const editForm = ref({
  name: "",
  description: "",
  img: "",
});

const playlistId = computed(() => route.params.id);
const isOwner = computed(
  () => userStore.isLoggedIn && playlist.value?.user_id === userStore.user?.id
);

const fetchPlaylist = async () => {
  try {
    const res = await getPlaylistById(playlistId.value);
    playlist.value = res.data;
  } catch (error) {
    playlist.value = null;
  }
};

const playAll = () => {
  if (playlist.value?.songs?.length > 0) {
    playerStore.setPlaylist(playlist.value.songs);
    playerStore.play(playlist.value.songs[0], 0);
  }
};

const playSong = (song) => {
  playerStore.play(song);
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
        (c) => c.rel_id == playlistId.value && c.type === "PLAYLIST"
      );
      if (collection) {
        await removeCollection(collection.id);
        userStore.removeFromCollections(collection.id);
        ElMessage.success("已取消收藏");
      }
    } else {
      // 添加收藏
      const response = await addCollection({ 
        relId: playlistId.value, 
        type: "PLAYLIST" 
      });
      if (response.success) {
        userStore.addToCollections(response.data);
        ElMessage.success("收藏成功");
      }
    }
  } catch (error) {
    console.error("收藏操作失败:", error);
    ElMessage.error("操作失败");
  }
};

const editPlaylist = () => {
  editForm.value = {
    name: playlist.value.name,
    description: playlist.value.description || "",
    img: playlist.value.img || "",
  };
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    await updatePlaylist(playlistId.value, editForm.value);
    ElMessage.success("更新成功");
    editDialogVisible.value = false;
    fetchPlaylist();
  } catch {
    ElMessage.error("更新失败");
  }
};

const removeSong = async (songId) => {
  ElMessageBox.confirm("确定要从歌单中删除这首歌吗？", "提示", { type: "warning" }).then(
    async () => {
      try {
        await removeSongFromPlaylist(playlistId.value, songId);
        ElMessage.success("删除成功");
        fetchPlaylist();
      } catch {
        ElMessage.error("删除失败");
      }
    }
  );
};

onMounted(async () => {
  await fetchPlaylist();
  // 如果用户已登录，加载收藏信息
  if (userStore.isLoggedIn) {
    await userStore.loadCollections();
  }
  console.log("playlist: ", playlist);
});
</script>

<style scoped>
.playlist-detail {
  max-width: 1000px;
  margin: 30px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 32px;
}

.back-to-home {
  margin-bottom: 20px;
}

.back-to-home .el-button {
  font-size: 14px;
}

.playlist-header {
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
}
.info {
  flex: 1;
}
.meta {
  margin: 12px 0;
  color: #666;
  font-size: 15px;
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
.description {
  margin-top: 16px;
}
.description h4 {
  margin: 0 0 8px 0;
  color: #333;
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
}
.song-name:hover {
  color: #409eff;
}
.composer {
  color: #999;
  font-size: 12px;
}
</style>
