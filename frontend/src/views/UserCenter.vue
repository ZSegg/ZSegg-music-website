<template>
  <div class="user-center">
    <!-- 返回首页按钮 -->
    <div class="back-to-home">
      <el-button @click="$router.push('/')" type="info" plain>
        <el-icon><House /></el-icon>
        返回首页
      </el-button>
    </div>

    <div class="user-header">
      <div class="user-info">
        <el-avatar
          :size="80"
          :src="getImageUrl(userStore.user?.avatar) || '/default-avatar.jpg'"
        />
        <div class="info">
          <h2>{{ userStore.user?.name || userStore.user?.username }}</h2>
          <p>{{ userStore.user?.email }}</p>
        </div>
      </div>
      <div class="actions">
        <el-button @click="editProfile">编辑资料</el-button>
        <el-button @click="changePassword">修改密码</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="user-tabs">
      <el-tab-pane label="我的歌单" name="playlists">
        <div class="playlist-section">
          <div class="section-header">
            <h3>我的歌单</h3>
            <el-button type="primary" @click="createPlaylist">创建歌单</el-button>
          </div>
          <el-row :gutter="20">
            <el-col v-for="playlist in myPlaylists" :key="playlist.id" :span="6">
              <div
                class="playlist-card"
                @click="$router.push(`/playlist/${playlist.id}`)"
              >
                <img
                  :src="playlist.img || '/default-playlist.jpg'"
                  :alt="playlist.name"
                />
                <div class="playlist-info">
                  <h4>{{ playlist.name }}</h4>
                  <p>{{ playlist.song_count }}首歌曲</p>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <el-tab-pane label="我的收藏" name="collections">
        <div class="collection-section">
          <el-tabs v-model="collectionType" class="collection-tabs">
            <el-tab-pane label="歌曲" name="SONG">
              <div class="song-list">
                <div v-for="item in songCollections" :key="item.id" class="song-item">
                  <img
                    :src="getImageUrl(item.item_img)"
                    :alt="item.item_name"
                    @error="handleImageError"
                  />
                  <div class="song-info">
                    <h4 @click="playSong(item)">{{ item.item_name }}</h4>
                    <p>{{ item.item_info }}</p>
                  </div>
                  <div class="actions">
                    <el-button text @click="playSong(item)">播放</el-button>
                    <el-button text type="danger" @click="removeCollection(item.id)"
                      >取消收藏</el-button
                    >
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="专辑" name="ALBUM">
              <el-row :gutter="20">
                <el-col v-for="item in albumCollections" :key="item.id" :span="6">
                  <div
                    class="album-card"
                    @click="item.rel_id && $router.push(`/album/${item.rel_id}`)"
                  >
                    <img
                      :src="getImageUrl(item.item_img)"
                      :alt="item.item_name"
                      @error="handleImageError"
                    />
                    <div class="album-info">
                      <h4>{{ item.item_name }}</h4>
                      <p>{{ item.item_info }}</p>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane label="歌手" name="SINGER">
              <el-row :gutter="20">
                <el-col v-for="item in singerCollections" :key="item.id" :span="6">
                  <div
                    class="singer-card"
                    @click="item.rel_id && $router.push(`/singer/${item.rel_id}`)"
                  >
                    <img
                      :src="getImageUrl(item.item_img)"
                      :alt="item.item_name"
                      @error="handleImageError"
                    />
                    <div class="singer-info">
                      <h4>{{ item.item_name }}</h4>
                      <p>{{ item.item_info }}</p>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-tab-pane>

      <el-tab-pane label="我的评论" name="comments">
        <div class="comment-section">
          <div v-for="comment in myComments" :key="comment.id" class="comment-item">
            <div class="comment-header">
              <span
                class="song-name"
                @click="comment.sing_id && $router.push(`/song/${comment.sing_id}`)"
              >
                {{ comment.song_name }}
              </span>
              <span class="time">{{ comment.time }}</span>
            </div>
            <div class="comment-content">{{ comment.content }}</div>
            <div class="comment-actions">
              <el-button text type="danger" @click="deleteComment(comment.id)"
                >删除</el-button
              >
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 创建歌单对话框 -->
    <el-dialog v-model="createDialogVisible" title="创建歌单" width="500px">
      <el-form :model="createForm" label-width="80px">
        <el-form-item label="歌单名称">
          <el-input v-model="createForm.name" placeholder="请输入歌单名称" />
        </el-form-item>
        <el-form-item label="歌单简介">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入歌单简介"
          />
        </el-form-item>
        <el-form-item label="封面图片">
          <el-upload
            class="avatar-uploader"
            action="/api/playlists/upload-cover"
            :show-file-list="false"
            :on-success="handleCoverSuccess"
            :before-upload="beforeCoverUpload"
            :headers="uploadHeaders"
            name="file"
          >
            <img v-if="createForm.img" :src="createForm.img" class="avatar-preview" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveCreate">创建</el-button>
      </template>
    </el-dialog>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑资料" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="头像">
          <div class="avatar-upload">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="uploadAvatar"
              accept="image/*"
              action="#"
            >
              <img
                v-if="editForm.avatar"
                :src="getImageUrl(editForm.avatar)"
                class="avatar-preview"
              />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">点击上传头像，支持 JPG、PNG 格式</div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="500px">
      <el-form :model="passwordForm" label-width="100px">
        <el-form-item label="原密码">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入原密码"
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePassword">修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { usePlayerStore } from "../stores/player";
import { useUserStore } from "../stores/user";
import {
  getPlaylists,
  createPlaylist as apiCreatePlaylist,
  updatePlaylist,
  deletePlaylist,
  getCollections as apiGetCollections,
  removeCollection as apiRemoveCollection,
  getComments,
  getUserComments,
  deleteComment as apiDeleteComment,
  updateProfile,
  changePassword as apiChangePassword,
  uploadAvatar as apiUploadAvatar,
} from "../api/music";
import { ElMessage, ElMessageBox } from "element-plus";
import { getImageUrl, handleImageError } from "../utils/image";
import { Plus, House } from "@element-plus/icons-vue";

const playerStore = usePlayerStore();
const userStore = useUserStore();

// console.log("userStore.user:", userStore.user);

const activeTab = ref("playlists");
const collectionType = ref("SONG");

const myPlaylists = ref([]);
const songCollections = ref([]);
const albumCollections = ref([]);
const singerCollections = ref([]);
const myComments = ref([]);

const createDialogVisible = ref(false);
const editDialogVisible = ref(false);
const passwordDialogVisible = ref(false);

const createForm = ref({
  name: "",
  description: "",
  img: "",
});

const editForm = ref({
  name: "",
  email: "",
  avatar: "",
});

const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const uploadHeaders = computed(() => ({
  Authorization: "Bearer " + userStore.token,
}));

const fetchMyPlaylists = async () => {
  try {
    const res = await getPlaylists({ user_id: userStore.user?.id });
    myPlaylists.value = res.data;
  } catch (error) {
    myPlaylists.value = [];
  }
};

const fetchCollections = async () => {
  try {
    const res = await apiGetCollections();
    songCollections.value = res.data.filter((item) => item.type === "SONG");
    albumCollections.value = res.data.filter((item) => item.type === "ALBUM");
    singerCollections.value = res.data.filter((item) => item.type === "SINGER");
    console.log("songCollections.value: ", songCollections.value);
    console.log("albumCollections.value: ", albumCollections.value);
    console.log("singerCollections.value: ", singerCollections.value);

    // 调试：查看第一个歌曲收藏的完整结构
    if (songCollections.value.length > 0) {
      console.log("第一个歌曲收藏的完整数据:", songCollections.value[0]);
    }
  } catch (error) {
    songCollections.value = [];
    albumCollections.value = [];
    singerCollections.value = [];
  }
};

const fetchMyComments = async () => {
  try {
    const res = await getUserComments();
    console.log("comments: ", res);
    myComments.value = res.data;
  } catch (error) {
    console.error("获取用户评论失败:", error);
    myComments.value = [];
  }
};

const playSong = (song) => {
  if (song) {
    console.log("传入的歌曲数据:", song);

    // 如果是收藏的歌曲，使用完整的歌曲数据
    const songData = {
      id: song.rel_id, // 使用rel_id作为歌曲ID
      name: song.name || song.song_name,
      audio_url: song.audio_url,
      singer: {
        id: song.singer_id,
        name: song.singer_name,
        avatar: song.singer_avatar,
      },
      album: {
        id: song.album_id,
        name: song.album_name,
        img: song.album_img,
      },
      composer: song.composer,
      lyricist: song.lyricist,
      lyrics: song.lyrics,
      duration: song.duration,
      hot: song.hot,
      cover_url: song.cover_url,
      category_id: song.category_id,
    };

    console.log("构造的播放数据:", songData);
    playerStore.play(songData);
  }
};

const createPlaylist = () => {
  createForm.value = { name: "", description: "", img: "" };
  createDialogVisible.value = true;
};

const saveCreate = async () => {
  if (!createForm.value.name.trim()) {
    ElMessage.warning("歌单名称不能为空");
    return;
  }
  try {
    await apiCreatePlaylist(createForm.value);
    ElMessage.success("创建成功");
    createDialogVisible.value = false;
    fetchMyPlaylists();
  } catch {
    ElMessage.error("创建失败");
  }
};

const editProfile = () => {
  editForm.value = {
    name: userStore.user?.name || "",
    email: userStore.user?.email || "",
    avatar: userStore.user?.avatar || "",
    phone: userStore.user?.phone || "",
    userId: userStore.user?.id || "",
    username: userStore.user?.username || "",
  };
  editDialogVisible.value = true;
};

const saveEdit = async () => {
  try {
    await updateProfile(editForm.value);
    ElMessage.success("更新成功");
    editDialogVisible.value = false;
    // 重新获取用户信息
    await userStore.loadUserInfo();
  } catch {
    ElMessage.error("更新失败");
  }
};

const changePassword = () => {
  passwordForm.value = { oldPassword: "", newPassword: "", confirmPassword: "" };
  passwordDialogVisible.value = true;
};

const savePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.warning("两次输入的密码不一致");
    return;
  }
  try {
    await apiChangePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword,
    });
    ElMessage.success("密码修改成功");
    passwordDialogVisible.value = false;
  } catch {
    ElMessage.error("密码修改失败");
  }
};

const removeCollection = async (id) => {
  ElMessageBox.confirm("确定要取消收藏吗？", "提示", { type: "warning" }).then(
    async () => {
      try {
        await apiRemoveCollection(id);
        ElMessage.success("取消收藏成功");
        fetchCollections();
      } catch {
        ElMessage.error("操作失败");
      }
    }
  );
};

const deleteComment = async (id) => {
  ElMessageBox.confirm("确定要删除这条评论吗？", "提示", { type: "warning" }).then(
    async () => {
      try {
        await apiDeleteComment(id);
        ElMessage.success("删除成功");
        fetchMyComments();
      } catch {
        ElMessage.error("删除失败");
      }
    }
  );
};

const beforeAvatarUpload = (file) => {
  console.log("beforeAvatarUpload called with file:", file);
  const isJPG = file.type === "image/jpeg" || file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error("上传头像图片只能是 JPG 或 PNG 格式!");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("上传头像图片大小不能超过 2MB!");
    return false;
  }
  console.log("File validation passed");
  return true;
};

const uploadAvatar = async (event) => {
  console.log("uploadAvatar called with event:", event);
  const file = event.file;

  try {
    // 创建 FormData
    const formData = new FormData();
    formData.append("file", file);

    console.log("Sending upload request...");
    // 调用用户头像上传接口
    const response = await apiUploadAvatar(formData);

    console.log("Upload response:", response);

    if (response.success) {
      editForm.value.avatar = response.url;
      // 直接更新用户信息中的头像
      if (userStore.user) {
        userStore.user.avatar = response.url;
      }
      ElMessage.success("头像上传成功");
    } else {
      throw new Error(response.message || "上传失败");
    }
  } catch (error) {
    console.error("上传头像失败:", error);
    ElMessage.error("头像上传失败，请重试");
  }
};

const handleCoverSuccess = (res) => {
  console.log("coversuccess: ", res);
  createForm.value.img = res.url || res.data?.url;
};

const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isImage) {
    ElMessage.error("只能上传图片文件!");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过2MB!");
    return false;
  }
  return true;
};

onMounted(() => {
  fetchMyPlaylists();
  fetchCollections();
  fetchMyComments();

  // console.log(" myPlaylists: ", myPlaylists.value);
});
</script>

<style scoped>
.user-center {
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

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}
.info h2 {
  margin: 0 0 8px 0;
  color: #333;
}
.info p {
  margin: 0;
  color: #666;
}
.actions {
  display: flex;
  gap: 12px;
}
.user-tabs {
  margin-top: 24px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.section-header h3 {
  margin: 0;
  color: #333;
}
.playlist-card,
.album-card,
.singer-card {
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  text-align: center;
  margin-bottom: 20px;
}
.playlist-card:hover,
.album-card:hover,
.singer-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}
.playlist-card img,
.album-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
}
.singer-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 8px;
}
.playlist-info h4,
.album-info h4,
.singer-info h4 {
  margin: 0 0 4px 0;
  color: #333;
  font-size: 16px;
}
.playlist-info p,
.album-info p,
.singer-info p {
  margin: 0;
  color: #888;
  font-size: 13px;
}
.song-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.song-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}
.song-item img {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}
.song-info {
  flex: 1;
}
.song-info h4 {
  margin: 0 0 4px 0;
  color: #333;
  cursor: pointer;
}
.song-info h4:hover {
  color: #409eff;
}
.song-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
.comment-item {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}
.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.song-name {
  color: #409eff;
  cursor: pointer;
  font-weight: 500;
}
.song-name:hover {
  text-decoration: underline;
}
.time {
  color: #999;
  font-size: 12px;
}
.comment-content {
  color: #333;
  line-height: 1.6;
  margin-bottom: 8px;
}
.comment-actions {
  display: flex;
  justify-content: flex-end;
}
.avatar-upload {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar-uploader {
  width: 120px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
}
.avatar-uploader:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.upload-tip {
  color: #999;
  font-size: 12px;
}
.avatar-uploader {
  display: inline-block;
}
.avatar-preview {
  width: 80px;
  height: 80px;
  display: block;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.avatar-uploader-icon {
  font-size: 32px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  background: #fafafa;
}
</style>
