<template>
  <div class="admin-singers">
    <div class="page-header">
      <h2>歌手管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><CirclePlus /></el-icon>
        添加歌手
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="歌手名称">
          <el-input v-model="searchForm.name" placeholder="请输入歌手名称" clearable />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="searchForm.sexy" placeholder="请选择性别" clearable>
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
            <el-option label="组合" value="组合" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 歌手列表 -->
    <el-card>
      <el-table :data="singers" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="歌手名称" min-width="200" />
        <el-table-column prop="sexy" label="性别" width="100">
          <template #default="{ row }">
            <el-tag :type="getGenderType(row.sexy)">
              {{ getGenderText(row.sexy) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="birth" label="出生日期" width="120" />
        <el-table-column prop="album_count" label="专辑数量" width="100" />
        <el-table-column prop="song_count" label="歌曲数量" width="100" />
        <el-table-column prop="hot" label="播放次数" width="100" />
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

    <!-- 添加/编辑歌手对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingSinger ? '编辑歌手' : '添加歌手'"
      width="600px"
    >
      <el-form
        :model="singerForm"
        :rules="singerRules"
        ref="singerFormRef"
        label-width="100px"
      >
        <el-form-item label="歌手名称" prop="name">
          <el-input v-model="singerForm.name" placeholder="请输入歌手名称" />
        </el-form-item>
        <el-form-item label="性别" prop="sexy">
          <el-select v-model="singerForm.sexy" placeholder="请选择性别">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
            <el-option label="组合" value="组合" />
          </el-select>
        </el-form-item>
        <el-form-item label="出生日期" prop="birth">
          <el-date-picker
            v-model="singerForm.birth"
            type="date"
            placeholder="选择出生日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="国籍" prop="area">
          <el-input v-model="singerForm.area" placeholder="请输入国籍" />
        </el-form-item>
        <el-form-item label="代表作" prop="master">
          <el-input v-model="singerForm.master" placeholder="请输入代表作" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input
            v-model="singerForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入歌手简介"
          />
        </el-form-item>
        <el-form-item label="头像" prop="avatar_file">
          <el-upload
            ref="avatarUploadRef"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
            accept=".jpg,.jpeg,.png,.gif"
            class="upload-demo"
          >
            <el-button type="primary">
              <el-icon><Picture /></el-icon>
              选择头像图片
            </el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg, jpeg, png, gif 格式，文件大小不超过 5MB
              </div>
            </template>
          </el-upload>
          <div v-if="singerForm.avatar_file" class="file-info">
            <el-icon><Picture /></el-icon>
            <span>{{ singerForm.avatar_file.name }}</span>
            <el-button size="small" type="danger" @click="removeAvatarFile"
              >删除</el-button
            >
          </div>
          <div v-if="singerForm.avatar && !singerForm.avatar_file" class="current-avatar">
            <img
              :src="getImageUrl(singerForm.avatar)"
              alt="当前头像"
              class="avatar-preview"
            />
            <span>当前头像</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleCloseDialog">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingSinger ? "更新" : "添加" }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { CirclePlus, Picture } from "@element-plus/icons-vue";
import { getAdminSingers, addSinger, updateSinger, deleteSinger } from "../../api/admin";
import { getImageUrl } from "../../utils/image";

const loading = ref(false);
const submitting = ref(false);
const showAddDialog = ref(false);
const editingSinger = ref(null);
const singers = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

const searchForm = ref({
  name: "",
  sexy: "",
});

const singerForm = ref({
  name: "",
  sexy: "",
  birth: "",
  area: "",
  master: "",
  description: "",
  avatar: "",
  avatar_file: null,
});

const singerRules = {
  name: [{ required: true, message: "请输入歌手名称", trigger: "blur" }],
  sexy: [{ required: true, message: "请选择性别", trigger: "change" }],
};

const singerFormRef = ref();
const avatarUploadRef = ref();

const loadSingers = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...searchForm.value,
    };

    const response = await getAdminSingers(params);
    if (response.success) {
      singers.value = response.data;
      console.log(singers.value);
      total.value = response.pagination.total;
    }
  } catch (error) {
    ElMessage.error("加载歌手列表失败");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  loadSingers();
};

const resetSearch = () => {
  searchForm.value = {
    name: "",
    sexy: "",
  };
  handleSearch();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  loadSingers();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadSingers();
};

const handleEdit = (singer) => {
  editingSinger.value = singer;
  singerForm.value = {
    name: singer.name,
    sexy: singer.sexy,
    birth: singer.birth || "",
    area: singer.area || "",
    master: singer.master || "",
    description: singer.description || "",
    avatar: singer.avatar || "",
    avatar_file: null,
  };
  showAddDialog.value = true;
  if (avatarUploadRef.value) {
    avatarUploadRef.value.clearFiles();
  }
};

const handleDelete = async (singer) => {
  try {
    await ElMessageBox.confirm("确定要删除这个歌手吗？", "提示", {
      type: "warning",
    });

    const response = await deleteSinger(singer.id);
    if (response.success) {
      ElMessage.success("删除成功");
      loadSingers();
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handleSubmit = async () => {
  try {
    await singerFormRef.value.validate();
    submitting.value = true;

    // 创建 FormData 对象来处理文件上传
    const formData = new FormData();
    formData.append("name", singerForm.value.name);
    formData.append("sexy", singerForm.value.sexy);
    formData.append("birth", singerForm.value.birth);
    formData.append("area", singerForm.value.area);
    formData.append("master", singerForm.value.master);
    formData.append("description", singerForm.value.description);

    if (singerForm.value.avatar_file) {
      formData.append("avatar_file", singerForm.value.avatar_file);
    }

    let response;
    if (editingSinger.value) {
      response = await updateSinger(editingSinger.value.id, formData);
    } else {
      response = await addSinger(formData);
    }

    if (response.success) {
      ElMessage.success(editingSinger.value ? "更新成功" : "添加成功");
      showAddDialog.value = false;
      loadSingers();
    }
  } catch (error) {
    ElMessage.error("操作失败");
  } finally {
    submitting.value = false;
  }
};

const handleAvatarChange = (file) => {
  // 检查文件大小 (5MB)
  const isLt5M = file.raw.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    ElMessage.error("头像图片大小不能超过 5MB!");
    return;
  }

  // 检查文件类型
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.raw.type)) {
    ElMessage.error("请选择正确的图片格式!");
    return;
  }

  singerForm.value.avatar_file = file.raw;
};

const removeAvatarFile = () => {
  singerForm.value.avatar_file = null;
  if (avatarUploadRef.value) {
    avatarUploadRef.value.clearFiles();
  }
};

const getGenderType = (gender) => {
  const types = {
    男: "primary",
    女: "danger",
    组合: "warning",
    // 保留英文映射以兼容
    male: "primary",
    female: "danger",
    group: "warning",
  };
  return types[gender] || "info";
};

const getGenderText = (gender) => {
  const texts = {
    男: "男",
    女: "女",
    组合: "组合",
    // 保留英文映射以兼容
    male: "男",
    female: "女",
    group: "组合",
  };
  return texts[gender] || "未知";
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const resetForm = () => {
  singerForm.value = {
    name: "",
    sexy: "",
    birth: "",
    area: "",
    master: "",
    description: "",
    avatar: "",
    avatar_file: null,
  };
  editingSinger.value = null;
  if (avatarUploadRef.value) {
    avatarUploadRef.value.clearFiles();
  }
};

const handleCloseDialog = () => {
  showAddDialog.value = false;
  resetForm();
};

onMounted(() => {
  loadSingers();
});
</script>

<style scoped>
.admin-singers {
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

.upload-demo {
  margin-bottom: 10px;
}

.file-info {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.current-avatar {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 10px;
}
</style>
