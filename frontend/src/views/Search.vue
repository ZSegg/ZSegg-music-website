<template>
  <div class="search-page">
    <Header />

    <div class="main-content">
      <!-- 返回首页按钮 -->
      <div class="back-to-home">
        <el-button @click="$router.push('/')" type="info" plain>
          <el-icon><House /></el-icon>
          返回首页
        </el-button>
      </div>

      <div class="search-header">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索歌曲、歌手、专辑..."
          @keyup.enter="handleSearch"
          @input="handleInput"
          clearable
          size="large"
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>

        <!-- 搜索建议 -->
        <div
          v-if="showSuggestions && suggestions.length > 0"
          class="search-suggestions-dropdown"
        >
          <div
            v-for="suggestion in suggestions"
            :key="`${suggestion.type}-${suggestion.id}`"
            class="suggestion-item"
            @click="handleSuggestionClick(suggestion)"
          >
            <el-icon>
              <component :is="getSuggestionIcon(suggestion.type)" />
            </el-icon>
            <span>{{ suggestion.name }}</span>
            <span class="suggestion-type">{{
              getSuggestionTypeText(suggestion.type)
            }}</span>
          </div>
        </div>
      </div>

      <div v-if="searchKeyword && hasResults" class="search-results">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane label="歌曲" name="song">
            <div class="song-results">
              <el-table :data="songResults" stripe v-loading="loading">
                <el-table-column width="50">
                  <template #default="{ $index }">
                    <span class="song-index">{{ $index + 1 }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="歌曲" min-width="300">
                  <template #default="{ row }">
                    <div class="song-info">
                      <img
                        :src="getImageUrl(row.cover_url)"
                        :alt="row.name"
                        @error="handleImageError"
                      />

                      <div class="song-details">
                        <span class="song-name" @click="playSong(row)">
                          {{ row.name }}
                        </span>
                        <span v-if="row.composer" class="composer">
                          作曲：{{ row.composer }}
                        </span>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="歌手" width="150">
                  <template #default="{ row }">
                    <router-link :to="`/singer/${row.singer_id}`">{{
                      row.singer?.name || row.singer_name
                    }}</router-link>
                  </template>
                </el-table-column>
                <el-table-column label="专辑" width="150">
                  <template #default="{ row }">
                    <router-link :to="`/album/${row.album_id}`">{{
                      row.album?.name || row.album_name
                    }}</router-link>
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

              <!-- 分页 -->
              <div v-if="songPagination" class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="songPagination.page"
                  v-model:page-size="songPagination.limit"
                  :total="songPagination.total"
                  :page-sizes="[10, 20, 50, 100]"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="歌手" name="singer">
            <div class="singer-results" v-loading="loading">
              <el-row :gutter="20">
                <el-col v-for="singer in singerResults" :key="singer.id" :span="6">
                  <div class="singer-card" @click="$router.push(`/singer/${singer.id}`)">
                    <img
                      :src="getImageUrl(singer.avatar)"
                      :alt="singer.name"
                      @error="handleImageError"
                    />
                    <div class="singer-info">
                      <h4>{{ singer.name }}</h4>
                      <p>{{ singer.area }}</p>
                      <span class="song-count">{{ singer.song_count || 0 }}首歌曲</span>
                    </div>
                  </div>
                </el-col>
              </el-row>

              <!-- 分页 -->
              <div v-if="singerPagination" class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="singerPagination.page"
                  v-model:page-size="singerPagination.limit"
                  :total="singerPagination.total"
                  :page-sizes="[12, 24, 48, 96]"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="歌单" name="playlist">
            <div class="playlist-results" v-loading="loading">
              <el-row :gutter="20">
                <el-col v-for="playlist in playlistResults" :key="playlist.id" :span="6">
                  <div
                    class="playlist-card"
                    @click="$router.push(`/playlist/${playlist.id}`)"
                  >
                    <img
                      :src="getImageUrl(playlist.img)"
                      :alt="playlist.name"
                      @error="handleImageError"
                    />
                    <div class="playlist-info">
                      <h4>{{ playlist.name }}</h4>
                      <p>
                        {{
                          playlist.creator_name || playlist.username || playlist.user_name
                        }}
                      </p>
                      <span class="song-count">{{ playlist.song_count || 0 }}首歌曲</span>
                    </div>
                  </div>
                </el-col>
              </el-row>

              <!-- 分页 -->
              <div v-if="playlistPagination" class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="playlistPagination.page"
                  v-model:page-size="playlistPagination.limit"
                  :total="playlistPagination.total"
                  :page-sizes="[12, 24, 48, 96]"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div v-else-if="!searchKeyword" class="search-suggestions">
        <h3>热门搜索</h3>
        <div class="suggestion-tags">
          <el-tag
            v-for="item in hotSearch"
            :key="`${item.type}-${item.id}`"
            @click="handleHotSearchClick(item)"
            class="suggestion-tag"
            :type="getHotSearchTagType(item.type)"
          >
            <el-icon>
              <component :is="getSuggestionIcon(item.type)" />
            </el-icon>
            {{ item.name }}
          </el-tag>
        </div>

        <h3>搜索历史</h3>
        <div class="suggestion-tags">
          <el-tag
            v-for="keyword in searchHistory"
            :key="keyword"
            @click="
              searchKeyword = keyword;
              handleSearch();
            "
            class="suggestion-tag"
            closable
            @close="removeSearchHistory(keyword)"
          >
            {{ keyword }}
          </el-tag>
        </div>
      </div>

      <div v-else-if="searchKeyword && !hasResults && !loading" class="no-results">
        <el-empty description="没有找到相关结果" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePlayerStore } from "../stores/player";
import { search, getSearchSuggestions, getHotSearch } from "../api/music";
import Header from "../components/Header.vue";
import { Search, VideoPlay, User, Folder, List, House } from "@element-plus/icons-vue";
import { getImageUrl, handleImageError } from "../utils/image";
import { formatDuration } from "../utils/format";

const route = useRoute();
const router = useRouter();
const playerStore = usePlayerStore();

const searchKeyword = ref("");
const activeTab = ref("song");
const loading = ref(false);
const suggestions = ref([]);
const showSuggestions = ref(false);
const hotSearch = ref([]);
const searchHistory = ref([]);

// 搜索结果
const songResults = ref([]);
const singerResults = ref([]);
const playlistResults = ref([]);

// 分页信息
const songPagination = ref(null);
const singerPagination = ref(null);
const playlistPagination = ref(null);

// 计算属性
const hasResults = computed(() => {
  return (
    songResults.value.length > 0 ||
    singerResults.value.length > 0 ||
    playlistResults.value.length > 0
  );
});

// 获取搜索建议
const getSuggestions = async (keyword) => {
  if (!keyword.trim()) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  try {
    const res = await getSearchSuggestions(keyword);
    suggestions.value = res.data || [];
    showSuggestions.value = suggestions.value.length > 0;
  } catch (error) {
    console.error("获取搜索建议失败:", error);
  }
};

// 处理输入
const handleInput = () => {
  if (searchKeyword.value.trim()) {
    getSuggestions(searchKeyword.value);
  } else {
    showSuggestions.value = false;
  }
};

// 处理搜索
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) return;

  loading.value = true;
  showSuggestions.value = false;

  try {
    // 保存搜索历史
    addSearchHistory(searchKeyword.value.trim());

    // 获取所有类型的搜索结果
    const [songRes, singerRes, playlistRes] = await Promise.all([
      search(searchKeyword.value.trim(), "song"),
      search(searchKeyword.value.trim(), "singer"),
      search(searchKeyword.value.trim(), "playlist"),
    ]);

    // 更新所有搜索结果和分页信息
    songResults.value = songRes.data?.songs?.data || [];
    songPagination.value = songRes.data?.songs?.pagination || null;

    singerResults.value = singerRes.data?.singers?.data || [];
    singerPagination.value = singerRes.data?.singers?.pagination || null;

    playlistResults.value = playlistRes.data?.playlists?.data || [];
    playlistPagination.value = playlistRes.data?.playlists?.pagination || null;
  } catch (error) {
    console.error("搜索失败:", error);
  } finally {
    loading.value = false;
  }
};

// 处理标签页切换
const handleTabClick = () => {
  // 切换标签页时不需要重新搜索，直接显示已缓存的结果
  // 如果需要重新搜索，用户会手动点击搜索按钮
};

// 处理建议点击
const handleSuggestionClick = (suggestion) => {
  searchKeyword.value = suggestion.name;
  showSuggestions.value = false;

  // 根据建议类型跳转到对应页面
  switch (suggestion.type) {
    case "song":
      router.push(`/song/${suggestion.id}`);
      break;
    case "singer":
      router.push(`/singer/${suggestion.id}`);
      break;
    case "album":
      router.push(`/album/${suggestion.id}`);
      break;
    default:
      handleSearch();
  }
};

// 处理热门搜索点击
const handleHotSearchClick = (item) => {
  searchKeyword.value = item.name;
  handleSearch();
};

// 播放歌曲
const playSong = (song) => {
  playerStore.play(song);
};

// 获取建议图标
const getSuggestionIcon = (type) => {
  const icons = {
    song: VideoPlay,
    singer: User,
    album: Folder,
    playlist: List,
  };
  return icons[type] || Search;
};

// 获取建议类型文本
const getSuggestionTypeText = (type) => {
  const texts = {
    song: "歌曲",
    singer: "歌手",
    album: "专辑",
    playlist: "歌单",
  };
  return texts[type] || "";
};

// 获取热门搜索标签类型
const getHotSearchTagType = (type) => {
  const types = {
    song: "success",
    singer: "warning",
    album: "info",
    playlist: "danger",
  };
  return types[type] || "";
};

// 搜索历史管理
const addSearchHistory = (keyword) => {
  const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  const index = history.indexOf(keyword);
  if (index > -1) {
    history.splice(index, 1);
  }
  history.unshift(keyword);
  if (history.length > 10) {
    history.pop();
  }
  localStorage.setItem("searchHistory", JSON.stringify(history));
  searchHistory.value = history;
};

const removeSearchHistory = (keyword) => {
  const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
  const index = history.indexOf(keyword);
  if (index > -1) {
    history.splice(index, 1);
    localStorage.setItem("searchHistory", JSON.stringify(history));
    searchHistory.value = history;
  }
};

// 分页处理
const handleSizeChange = (size) => {
  const pagination = getCurrentPagination();
  if (pagination) {
    pagination.limit = size;
    pagination.page = 1;
    handleSearch();
  }
};

const handleCurrentChange = (page) => {
  const pagination = getCurrentPagination();
  if (pagination) {
    pagination.page = page;
    handleSearch();
  }
};

const getCurrentPagination = () => {
  switch (activeTab.value) {
    case "song":
      return songPagination.value;
    case "singer":
      return singerPagination.value;
    case "playlist":
      return playlistPagination.value;
    default:
      return null;
  }
};

// 监听路由参数变化
watch(
  () => route.query.keyword,
  (newKeyword) => {
    if (newKeyword) {
      searchKeyword.value = newKeyword;
      handleSearch();
    }
  },
  { immediate: true }
);

onMounted(async () => {
  // 加载热门搜索
  try {
    const res = await getHotSearch();
    hotSearch.value = res.data || [];
  } catch (error) {
    console.error("获取热门搜索失败:", error);
  }

  // 加载搜索历史
  searchHistory.value = JSON.parse(localStorage.getItem("searchHistory") || "[]");

  // 如果URL中有搜索关键词，自动搜索
  if (route.query.keyword) {
    searchKeyword.value = route.query.keyword;
    handleSearch();
  }
});
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-content {
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

.search-header {
  margin-bottom: 30px;
  position: relative;
}

.search-suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;
}

.suggestion-item:hover {
  background: #f5f5f5;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-type {
  margin-left: auto;
  color: #999;
  font-size: 12px;
}

.search-results {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.song-index {
  color: #999;
  font-size: 14px;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.song-info img {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}

.song-details {
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

.singer-card,
.playlist-card {
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  text-align: center;
  margin-bottom: 20px;
}

.singer-card:hover,
.playlist-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.playlist-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
}

.singer-card img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
  border-radius: 50%;
  margin: 0 auto;
}

.singer-info h4,
.playlist-info h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 16px;
}

.singer-info p,
.playlist-info p {
  margin: 0 0 4px 0;
  color: #888;
  font-size: 13px;
}

.song-count {
  color: #999;
  font-size: 12px;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: center;
}

.search-suggestions {
  background: white;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.search-suggestions h3 {
  margin: 0 0 20px 0;
  color: #333;
  text-align: left;
}

.suggestion-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-start;
  margin-bottom: 30px;
}

.suggestion-tag {
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.suggestion-tag:hover {
  transform: scale(1.05);
}

.no-results {
  background: white;
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
</style>
