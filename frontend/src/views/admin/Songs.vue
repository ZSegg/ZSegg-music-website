<template>
  <div class="admin-songs">
    <div class="page-header">
      <h2>歌曲管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><CirclePlus /></el-icon>
        添加歌曲
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="歌曲名称">
          <el-input v-model="searchForm.title" placeholder="请输入歌曲名称" clearable />
        </el-form-item>
        <el-form-item label="歌手">
          <el-input v-model="searchForm.singer" placeholder="请输入歌手名称" clearable />
        </el-form-item>
        <el-form-item label="专辑">
          <el-input v-model="searchForm.album" placeholder="请输入专辑名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 歌曲列表 -->
    <el-card>
      <!-- {{ songs }} -->
      <el-table :data="songs" v-loading="loading" stripe>
        <el-table-column label="ID" width="80">
          <template #default="{ row }">
            {{ row.id }}
          </template>
        </el-table-column>
        <el-table-column label="歌曲名称" min-width="200">
          <template #default="{ row }">
            {{ row.name }}
          </template>
        </el-table-column>
        <el-table-column label="歌手" width="150">
          <template #default="{ row }">
            {{ row.singer_name }}
          </template>
        </el-table-column>
        <el-table-column label="专辑" width="150">
          <template #default="{ row }">
            {{ row.album_name }}
          </template>
        </el-table-column>
        <el-table-column label="分类" width="100">
          <template #default="{ row }">
            {{ row.category_name }}
          </template>
        </el-table-column>
        <el-table-column label="时长" width="100">
          <template #default="{ row }">
            {{ row.duration }}
          </template>
        </el-table-column>
        <el-table-column label="播放次数" width="100">
          <template #default="{ row }">
            {{ row.hot }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑歌曲对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingSong ? '编辑歌曲' : '添加歌曲'"
      width="600px"
    >
      <el-form :model="songForm" :rules="songRules" ref="songFormRef" label-width="100px">
        <el-form-item label="歌曲名称" prop="title">
          <el-input v-model="songForm.title" placeholder="请输入歌曲名称" />
        </el-form-item>
        <el-form-item label="作曲者" prop="composer">
          <el-input v-model="songForm.composer" placeholder="请输入作曲者" />
        </el-form-item>
        <el-form-item label="作词者" prop="lyricist">
          <el-input v-model="songForm.lyricist" placeholder="请输入作词者" />
        </el-form-item>
        <el-form-item label="歌手" prop="singer_id">
          <el-select v-model="songForm.singer_id" placeholder="请选择歌手" filterable>
            <el-option
              v-for="singer in singers"
              :key="singer.id"
              :label="singer.name"
              :value="singer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="专辑" prop="album_id">
          <el-select v-model="songForm.album_id" placeholder="请选择专辑" filterable>
            <el-option
              v-for="album in albums"
              :key="album.id"
              :label="album.name"
              :value="album.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类" prop="category_id">
          <el-select v-model="songForm.category_id" placeholder="请选择分类" filterable>
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时长(秒)" prop="duration">
          <el-input-number v-model="songForm.duration" :min="1" :max="3600" />
        </el-form-item>
        <el-form-item label="歌词(LRC格式)" prop="lyrics">
          <div class="lyrics-header">
            <el-button size="small" @click="generateSampleLyrics" type="info">
              生成示例歌词
            </el-button>
            <span
              class="lyrics-count"
              :class="{ warning: songForm.lyrics.length > 50000 }"
            >
              {{ songForm.lyrics.length }}/100000 字符
            </span>
          </div>
          <el-input
            v-model="songForm.lyrics"
            type="textarea"
            :rows="8"
            placeholder="请输入LRC格式歌词，例如：
[00:00.00]歌曲名称
[00:03.50]歌手名称
[00:07.00]第一句歌词
[00:10.50]第二句歌词
[00:14.00]第三句歌词"
          />
          <div class="lyrics-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>LRC格式说明：每行以 [分:秒.毫秒] 开头，后跟歌词内容</span>
          </div>
        </el-form-item>
        <el-form-item label="音频文件" prop="audio_file">
          <el-upload
            ref="audioUploadRef"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAudioChange"
            accept=".mp3,.wav,.flac,.m4a"
            class="upload-demo"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              选择音频文件
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 mp3, wav, flac, m4a 格式，文件大小不超过 50MB
              </div>
            </template>
          </el-upload>
          <div v-if="songForm.audio_file" class="file-info">
            <el-icon><Document /></el-icon>
            <span>{{ songForm.audio_file.name }}</span>
            <el-button size="small" type="danger" @click="removeAudioFile"
              >删除</el-button
            >
          </div>
        </el-form-item>
        <el-form-item label="封面图片" prop="cover_file">
          <el-upload
            ref="coverUploadRef"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleCoverChange"
            accept=".jpg,.jpeg,.png,.gif"
            class="upload-demo"
          >
            <el-button type="primary">
              <el-icon><Picture /></el-icon>
              选择封面图片
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg, jpeg, png, gif 格式，文件大小不超过 5MB
              </div>
            </template>
          </el-upload>
          <div v-if="songForm.cover_file" class="file-info">
            <el-icon><Picture /></el-icon>
            <span>{{ songForm.cover_file.name }}</span>
            <el-button size="small" type="danger" @click="removeCoverFile"
              >删除</el-button
            >
          </div>
          <div v-if="songForm.cover_url && !songForm.cover_file" class="current-cover">
            <img
              :src="getImageUrl(songForm.cover_url)"
              alt="当前封面"
              class="cover-preview"
            />
            <span>当前封面</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingSong ? "更新" : "添加" }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  CirclePlus,
  Upload,
  Document,
  Picture,
  InfoFilled,
} from "@element-plus/icons-vue";
import {
  getAdminSongs,
  addSong,
  updateSong,
  deleteSong,
  getAllSingers,
  getAllAlbums,
  getAllCategories,
} from "../../api/admin";
import { validateLrc, generateSampleLrc } from "../../utils/lyrics";
import { getImageUrl } from "../../utils/image";

const loading = ref(false);
const submitting = ref(false);
const showAddDialog = ref(false);
const editingSong = ref(null);
const songs = ref([]);
const singers = ref([]);
const albums = ref([]);
const categories = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

const audioUploadRef = ref();
const coverUploadRef = ref();

const searchForm = ref({
  title: "",
  singer: "",
  album: "",
});

const songForm = ref({
  title: "",
  singer_id: "",
  album_id: "",
  duration: 0,
  lyrics: "",
  audio_file: null,
  cover_file: null,
  audio_url: "",
  cover_url: "",
  composer: "",
  lyricist: "",
  category_id: "",
});

const songRules = {
  title: [{ required: true, message: "请输入歌曲名称", trigger: "blur" }],
  composer: [{ required: true, message: "请输入作曲者", trigger: "blur" }],
  lyricist: [{ required: true, message: "请输入作词者", trigger: "blur" }],
  singer_id: [{ required: true, message: "请选择歌手", trigger: "change" }],
  album_id: [{ required: true, message: "请选择专辑", trigger: "change" }],
  category_id: [{ required: true, message: "请选择分类", trigger: "change" }],
  duration: [{ required: true, message: "请输入时长", trigger: "blur" }],
  lyrics: [
    {
      validator: (rule, value, callback) => {
        if (value && value.trim()) {
          // 检查长度限制 (LONGTEXT 最大 4GB，但建议限制在合理范围内)
          if (value.length > 100000) {
            callback(new Error("歌词内容过长，请控制在10万字符以内"));
            return;
          }

          const validation = validateLrc(value);
          if (!validation.valid) {
            callback(new Error(validation.errors[0]));
            return;
          }
        }
        callback();
      },
      trigger: "blur",
    },
  ],
};

const songFormRef = ref();

const loadSongs = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...searchForm.value,
    };

    const response = await getAdminSongs(params);
    if (response.success) {
      songs.value = response.data;
      total.value = response.pagination.total;
    }
  } catch (error) {
    ElMessage.error("加载歌曲列表失败");
  } finally {
    loading.value = false;
  }
};

const loadSingers = async () => {
  try {
    const response = await getAllSingers();
    if (response.success) {
      singers.value = response.data;
    }
  } catch (error) {
    console.error("加载歌手列表失败:", error);
  }
};

const loadAlbums = async () => {
  try {
    const response = await getAllAlbums();
    if (response.success) {
      albums.value = response.data;
    }
  } catch (error) {
    console.error("加载专辑列表失败:", error);
  }
};

const loadCategories = async () => {
  try {
    const response = await getAllCategories();
    if (response.success) {
      categories.value = response.data;
    }
  } catch (error) {
    console.error("加载分类列表失败:", error);
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadSongs();
};

const resetSearch = () => {
  searchForm.value = {
    title: "",
    singer: "",
    album: "",
  };
  handleSearch();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  loadSongs();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadSongs();
};

const handleAudioChange = (file) => {
  // 检查文件大小 (50MB)
  const isLt50M = file.raw.size / 1024 / 1024 < 50;
  if (!isLt50M) {
    ElMessage.error("音频文件大小不能超过 50MB!");
    return;
  }

  // 检查文件类型
  const allowedTypes = [
    "audio/mp3",
    "audio/wav",
    "audio/flac",
    "audio/m4a",
    "audio/mpeg",
  ];
  if (!allowedTypes.includes(file.raw.type)) {
    ElMessage.error("请选择正确的音频文件格式!");
    return;
  }

  songForm.value.audio_file = file.raw;
};

const handleCoverChange = (file) => {
  // 检查文件大小 (5MB)
  const isLt5M = file.raw.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error("封面图片大小不能超过 5MB!");
    return;
  }

  // 检查文件类型
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.raw.type)) {
    ElMessage.error("请选择正确的图片格式!");
    return;
  }

  songForm.value.cover_file = file.raw;
};

const removeAudioFile = () => {
  songForm.value.audio_file = null;
  if (audioUploadRef.value) {
    audioUploadRef.value.clearFiles();
  }
};

const removeCoverFile = () => {
  songForm.value.cover_file = null;
  if (coverUploadRef.value) {
    coverUploadRef.value.clearFiles();
  }
};

const handleEdit = (song) => {
  editingSong.value = song;
  songForm.value = {
    title: song.name,
    singer_id: song.singer_id,
    album_id: song.album_id,
    duration: song.duration,
    lyrics: song.lyrics || "",
    audio_file: null,
    cover_file: null,
    audio_url: song.audio_url || "",
    cover_url: song.cover_url || "",
    composer: song.composer || "",
    lyricist: song.lyricist || "",
    category_id: song.category_id || "",
  };
  showAddDialog.value = true;
};

const handleDelete = async (song) => {
  try {
    await ElMessageBox.confirm("确定要删除这首歌曲吗？", "提示", {
      type: "warning",
    });

    const response = await deleteSong(song.id);
    if (response.success) {
      ElMessage.success("删除成功");
      loadSongs();
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const resetForm = () => {
  songForm.value = {
    title: "",
    singer_id: "",
    album_id: "",
    duration: 0,
    lyrics: "",
    audio_file: null,
    cover_file: null,
    audio_url: "",
    cover_url: "",
    composer: "",
    lyricist: "",
    category_id: "",
  };
  editingSong.value = null;
  if (audioUploadRef.value) {
    audioUploadRef.value.clearFiles();
  }
  if (coverUploadRef.value) {
    coverUploadRef.value.clearFiles();
  }
};

const handleCloseDialog = () => {
  showAddDialog.value = false;
  resetForm();
};

const handleSubmit = async () => {
  try {
    await songFormRef.value.validate();
    submitting.value = true;

    // 创建 FormData 对象来处理文件上传
    const formData = new FormData();
    formData.append("title", songForm.value.title);
    formData.append("singer_id", songForm.value.singer_id);
    formData.append("album_id", songForm.value.album_id);
    formData.append("duration", songForm.value.duration);
    formData.append("lyrics", songForm.value.lyrics);
    formData.append("composer", songForm.value.composer);
    formData.append("lyricist", songForm.value.lyricist);
    formData.append("category_id", songForm.value.category_id);

    if (songForm.value.audio_file) {
      formData.append("audio_file", songForm.value.audio_file);
    }

    if (songForm.value.cover_file) {
      formData.append("cover_file", songForm.value.cover_file);
    }

    let response;
    if (editingSong.value) {
      response = await updateSong(editingSong.value.id, formData);
    } else {
      response = await addSong(formData);
    }

    if (response.success) {
      ElMessage.success(editingSong.value ? "更新成功" : "添加成功");
      showAddDialog.value = false;
      // 重置表单
      songForm.value = {
        title: "",
        singer_id: "",
        album_id: "",
        duration: 0,
        lyrics: "",
        audio_file: null,
        cover_file: null,
        audio_url: "",
        cover_url: "",
        composer: "",
        lyricist: "",
        category_id: "",
      };
      editingSong.value = null;
      // 清除上传组件
      if (audioUploadRef.value) {
        audioUploadRef.value.clearFiles();
      }
      if (coverUploadRef.value) {
        coverUploadRef.value.clearFiles();
      }
      loadSongs();
    }
  } catch (error) {
    console.error("提交失败:", error);
    ElMessage.error("操作失败");
  } finally {
    submitting.value = false;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const generateSampleLyrics = () => {
  const songName = songForm.value.title || "歌曲名称";
  const selectedSinger = singers.value.find((s) => s.id === songForm.value.singer_id);
  const singerName = selectedSinger ? selectedSinger.name : "歌手名称";

  songForm.value.lyrics = generateSampleLrc(songName, singerName);
};

onMounted(() => {
  loadSongs();
  loadSingers();
  loadAlbums();
  loadCategories();
  // console.log("songs: ", songs.value);
});
</script>

<style scoped>
.admin-songs {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
}

.search-card {
  margin-bottom: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.current-cover {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.cover-preview {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.upload-demo {
  width: 100%;
}

.lyrics-tip {
  margin-top: 8px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lyrics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.lyrics-count {
  color: #606266;
  font-size: 12px;
}

.warning {
  color: #f56c6c;
}
</style>
