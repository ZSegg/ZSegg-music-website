<template>
  <div class="singer-detail" v-if="singer">
    <!-- 返回首页按钮 -->
    <div class="back-to-home">
      <el-button @click="$router.push('/')" type="info" plain>
        <el-icon><House /></el-icon>
        返回首页
      </el-button>
    </div>
    
    <div class="singer-header">
      <img 
        class="avatar" 
        :src="getImageUrl(singer.avatar)" 
        :alt="singer.name"
        @error="handleImageError"
      />
      <div class="info">
        <h2>{{ singer.name }}</h2>
        <div class="meta">
          <span>性别：{{ singer.sexy }}</span>
          <span class="divider">|</span>
          <span>出生日期：{{ singer.birth }}</span>
          <span class="divider">|</span>
          <span>地区：{{ singer.area }}</span>
        </div>
        <div class="actions">
          <el-button :type="isCollected ? 'danger' : 'info'" @click="toggleCollect">
            <el-icon><Star /></el-icon>
            {{ isCollected ? '已收藏' : '收藏' }}
          </el-button>
        </div>
        <div v-if="singer.description" class="description">
          <h4>歌手简介</h4>
          <p>{{ singer.description }}</p>
        </div>
      </div>
    </div>

    <el-divider>代表作</el-divider>
    <div class="song-list">
      <el-table :data="singer.songs" stripe>
        <el-table-column width="50">
          <template #default="{ $index }">
            <span class="song-index">{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="歌曲" min-width="300">
          <template #default="{ row }">
            <span class="song-name" @click="playSong(row)">{{ row.name }}</span>
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
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-divider>专辑列表</el-divider>
    <div class="album-list">
      <el-row :gutter="20">
        <el-col v-for="album in singer.albums" :key="album.id" :span="6">
          <div class="album-card" @click="$router.push(`/album/${album.id}`)">
            <img 
              :src="getImageUrl(album.img)" 
              :alt="album.name"
              @error="handleImageError"
            />
            <div class="album-info">
              <h4>{{ album.name }}</h4>
              <p>{{ album.time }}</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
  <el-empty v-else description="歌手不存在或已被删除" />
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import { useUserStore } from '../stores/user'
import { getSingerById, addCollection, removeCollection } from '../api/music'
import { ElMessage } from 'element-plus'
import { getImageUrl, handleImageError } from '../utils/image'
import { formatDuration } from '../utils/format'
import { House } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const playerStore = usePlayerStore()
const userStore = useUserStore()

const singer = ref(null)

const singerId = computed(() => route.params.id)

const isCollected = computed(() => {
  return userStore.isCollected(singerId.value, "SINGER");
});

const fetchSinger = async () => {
  try {
    const res = await getSingerById(singerId.value)
    singer.value = res.data
  } catch (error) {
    singer.value = null
  }
}

const playSong = (song) => {
  playerStore.play(song)
}

const toggleCollect = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.info('请先登录')
    router.push('/login')
    return
  }
  
  try {
    if (isCollected.value) {
      // 取消收藏
      const collection = userStore.collections.find(
        (c) => c.rel_id == singerId.value && c.type === "SINGER"
      );
      if (collection) {
        await removeCollection(collection.id)
        userStore.removeFromCollections(collection.id)
        ElMessage.success('已取消收藏')
      }
    } else {
      // 添加收藏
      const response = await addCollection({ 
        relId: singerId.value, 
        type: 'SINGER' 
      });
      if (response.success) {
        userStore.addToCollections(response.data);
        ElMessage.success('收藏成功')
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    ElMessage.error('操作失败')
  }
}

onMounted(async () => {
  await fetchSinger()
  // 如果用户已登录，加载收藏信息
  if (userStore.isLoggedIn) {
    await userStore.loadCollections();
  }
})
</script>

<style scoped>
.singer-detail {
  max-width: 1000px;
  margin: 30px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  padding: 32px;
}

.back-to-home {
  margin-bottom: 20px;
}

.back-to-home .el-button {
  font-size: 14px;
}

.singer-header {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  margin-bottom: 32px;
}
.avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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
.song-name {
  color: #333;
  cursor: pointer;
  font-weight: 500;
}
.song-name:hover {
  color: #409eff;
}
.album-list {
  margin-top: 24px;
}
.album-card {
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  text-align: center;
}
.album-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
}
.album-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
}
.album-info h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 16px;
}
.album-info p {
  margin: 0;
  color: #888;
  font-size: 13px;
}
</style> 