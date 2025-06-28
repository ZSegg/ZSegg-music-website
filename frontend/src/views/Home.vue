<template>
  <div class="home">
    <!-- 头部导航 -->
    <Header />

    <div class="main-content">
      <el-skeleton v-if="loading" rows="12" animated />
      <template v-else>
        <!-- 轮播图 -->
        <div class="carousel-section">
          <el-carousel height="400px" indicator-position="outside">
            <el-carousel-item v-for="item in carouselData" :key="item.id">
              <div class="carousel-item" @click="goToAlbum(item.album_id)">
                <img
                  :src="getImageUrl(item.img)"
                  :alt="item.album_name"
                  @error="handleImageError"
                />
                <div class="carousel-overlay">
                  <h3>{{ item.album_name || "专辑名称" }}</h3>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- 热门推荐 -->
        <div class="section">
          <div class="section-header">
            <h2>热门推荐</h2>
            <el-button text @click="$router.push('/search?type=hot')">更多</el-button>
          </div>
          <div class="song-grid">
            <div
              v-for="song in hotSongs"
              :key="song.id"
              class="song-card"
              @click="playSong(song)"
            >
              <div class="song-cover">
                <img
                  :src="getImageUrl(song.cover_url || song.album?.img)"
                  :alt="song.name"
                  @error="handleImageError"
                />
                <div class="play-overlay">
                  <el-icon><VideoPlay /></el-icon>
                </div>
                <div class="collect-overlay" @click="toggleCollect(song, $event)">
                  <el-icon :class="{ 'collected': isCollected(song.id) }">
                    <Star />
                  </el-icon>
                </div>
              </div>
              <div class="song-info">
                <h4>{{ song.name || "歌曲名称" }}</h4>
                <p>{{ song.singer_name || "歌手名称" }}</p>
                <p class="play-count">{{ song.hot || 0 }}次播放</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 新歌推荐 -->
        <div class="section">
          <div class="section-header">
            <h2>新歌推荐</h2>
            <el-button text @click="$router.push('/search?type=new')">更多</el-button>
          </div>
          <div class="song-grid">
            <div
              v-for="song in newSongs"
              :key="song.id"
              class="song-card"
              @click="playSong(song)"
            >
              <div class="song-cover">
                <img
                  :src="getImageUrl(song.cover_url || song.album?.img)"
                  :alt="song.singer"
                  @error="handleImageError"
                />
                <div class="play-overlay">
                  <el-icon><VideoPlay /></el-icon>
                </div>
                <div class="collect-overlay" @click="toggleCollect(song, $event)">
                  <el-icon :class="{ 'collected': isCollected(song.id) }">
                    <Star />
                  </el-icon>
                </div>
              </div>
              <div class="song-info">
                <h4>{{ song.name || "歌曲名称" }}</h4>
                <p>{{ song.singer_name || "歌手名称" }}</p>
                <p class="play-count">{{ song.hot || 0 }}次播放</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 热门歌手 -->
        <div class="section">
          <div class="section-header">
            <h2>热门歌手</h2>
            <el-button text @click="$router.push('/search?type=singer')">更多</el-button>
          </div>
          <div class="singer-grid">
            <div
              v-for="singer in hotSingers"
              :key="singer.id"
              class="singer-card"
              @click="goToSinger(singer.id)"
            >
              <div class="singer-avatar">
                <img
                  :src="getImageUrl(singer.avatar)"
                  :alt="singer.name"
                  @error="handleImageError"
                />
              </div>
              <div class="singer-info">
                <h4>{{ singer.name || "歌手名称" }}</h4>
                <p>{{ singer.area || "地区" }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 热门歌单 -->
        <div class="section">
          <div class="section-header">
            <h2>热门歌单</h2>
            <el-button text @click="$router.push('/search?type=playlist')"
              >更多</el-button
            >
          </div>
          <div class="playlist-grid">
            <div
              v-for="playlist in hotPlaylists"
              :key="playlist.id"
              class="playlist-card"
              @click="goToPlaylist(playlist.id)"
            >
              <div class="playlist-cover">
                <img
                  :src="getImageUrl(playlist.img)"
                  :alt="playlist.name"
                  @error="handleImageError"
                />
                <div class="playlist-overlay">
                  <el-icon><VideoPlay /></el-icon>
                </div>
              </div>
              <div class="playlist-info">
                <h4>{{ playlist.name || "歌单名称" }}</h4>
                <p>{{ playlist.song_count || 0 }}首歌曲</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePlayerStore } from "../stores/player";
import { useUserStore } from "../stores/user";
import { getHomeData, getHotSongs, getNewSongs, getHotSingers, addCollection, removeCollection } from "../api/music";
import Header from "../components/Header.vue";
import { getImageUrl, handleImageError, preloadImage } from "../utils/image";
import { ElMessage } from "element-plus";
import { VideoPlay, Star } from "@element-plus/icons-vue";

const router = useRouter();
const playerStore = usePlayerStore();
const userStore = useUserStore();

const carouselData = ref([]);
const hotSongs = ref([]);
const newSongs = ref([]);
const hotSingers = ref([]);
const hotPlaylists = ref([]);
const loading = ref(true);

const loadAllData = async () => {
  loading.value = true;
  await Promise.all([loadHomeData(), loadHotSongs(), loadNewSongs(), loadHotSingers()]);

  // 预加载所有图片
  await preloadAllImages();

  loading.value = false;
};

const loadHomeData = async () => {
  try {
    const data = (await getHomeData()).data;
    console.log("data: ", data);
    carouselData.value = data.carousels || [];
    hotPlaylists.value = data.hot_playlists || [];
    console.log("carouselData.value: ", carouselData.value);
  } catch (error) {
    console.error("加载首页数据失败:", error);
  }
};

const loadHotSongs = async () => {
  try {
    const data = (await getHotSongs()).data;
    hotSongs.value = data.slice(0, 8);
  } catch (error) {
    console.error("加载热门歌曲失败:", error);
  }
};

const loadNewSongs = async () => {
  try {
    const data = (await getNewSongs()).data;
    newSongs.value = data.slice(0, 8);
    console.log(newSongs.value);
  } catch (error) {
    console.error("加载新歌失败:", error);
  }
};

const loadHotSingers = async () => {
  try {
    const data = (await getHotSingers()).data;
    hotSingers.value = data.slice(0, 6);
  } catch (error) {
    console.error("加载热门歌手失败:", error);
  }
};

const playSong = (song) => {
  playerStore.play(song);
};

const toggleCollect = async (song, event) => {
  event.stopPropagation(); // 阻止事件冒泡
  
  if (!userStore.isLoggedIn) {
    ElMessage.warning("请先登录");
    router.push("/login");
    return;
  }

  try {
    const isCollected = userStore.isCollected(song.id, "SONG");
    
    if (isCollected) {
      // 取消收藏
      const collection = userStore.collections.find(
        (c) => c.rel_id === song.id && c.type === "SONG"
      );
      if (collection) {
        await removeCollection(collection.id);
        userStore.removeFromCollections(collection.id);
        ElMessage.success("取消收藏成功");
      }
    } else {
      // 添加收藏
      const response = await addCollection({
        relId: song.id,
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

const isCollected = (songId) => {
  return userStore.isCollected(songId, "SONG");
};

const goToAlbum = (albumId) => {
  router.push(`/album/${albumId}`);
};

const goToSinger = (singerId) => {
  console.log(singerId);
  router.push(`/singer/${singerId}`);
};

const goToPlaylist = (playlistId) => {
  router.push(`/playlist/${playlistId}`);
};

// 预加载所有图片
const preloadAllImages = async () => {
  const imageUrls = [];

  // 收集所有图片URL
  carouselData.value.forEach((item) => {
    if (item.img) {
      imageUrls.push(getImageUrl(item.img));
    }
  });

  hotSongs.value.forEach((song) => {
    if (song.album?.img) {
      imageUrls.push(getImageUrl(song.album.img));
    }
  });

  newSongs.value.forEach((song) => {
    if (song.album?.img) {
      imageUrls.push(getImageUrl(song.album.img));
    }
  });

  hotSingers.value.forEach((singer) => {
    if (singer.avatar) {
      console.log("singer.avatar ", singer.avatar);
      imageUrls.push(getImageUrl(singer.avatar));
    }
  });

  hotPlaylists.value.forEach((playlist) => {
    if (playlist.img) {
      // console.log("playlist.img", playlist.img);
      imageUrls.push(getImageUrl(playlist.img));
    }
  });

  // 并发预加载所有图片
  const preloadPromises = imageUrls.map((url) =>
    preloadImage(url).catch(() => {
      // 忽略加载失败的图片
      console.warn("图片预加载失败:", url);
    })
  );

  await Promise.all(preloadPromises);
};

onMounted(async () => {
  await loadAllData();
  // 如果用户已登录且不是管理员，加载收藏信息
  if (userStore.isLoggedIn && !userStore.isAdmin) {
    await userStore.loadCollections();
  }
});
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.carousel-section {
  margin-bottom: 40px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.carousel-item {
  position: relative;
  height: 100%;
  cursor: pointer;
  background: #f5f5f5;
}

.carousel-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.carousel-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 20px;
  min-height: 80px;
  display: flex;
  align-items: flex-end;
}

.carousel-overlay h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.section {
  margin-bottom: 40px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.song-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.song-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.song-card:hover {
  transform: translateY(-4px);
}

.song-cover {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
  width: 100%;
  height: 200px;
  background: #f5f5f5;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.song-card:hover .play-overlay {
  opacity: 1;
}

.collect-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  opacity: 0;
}

.song-card:hover .collect-overlay {
  opacity: 1;
}

.collect-overlay:hover {
  background: rgba(255, 193, 7, 0.9);
  transform: scale(1.1);
}

.collect-overlay .collected {
  color: #ffc107;
}

.song-info {
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.song-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #333;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.song-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.play-count {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.2;
}

.singer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.singer-card {
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s;
}

.singer-card:hover {
  transform: translateY(-4px);
}

.singer-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 10px;
  background: #f5f5f5;
  flex-shrink: 0;
}

.singer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.singer-info {
  min-height: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.singer-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #333;
  line-height: 1.2;
}

.singer-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.2;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.playlist-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.playlist-cover {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 10px;
  width: 100%;
  height: 200px;
  background: #f5f5f5;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.playlist-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.playlist-card:hover .playlist-overlay {
  opacity: 1;
}

.playlist-overlay .el-icon {
  font-size: 48px;
  color: white;
}

.playlist-info {
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.playlist-info h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #333;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.playlist-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}
</style>
