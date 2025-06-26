<template>
  <div class="admin-albums">
    <div class="page-header">
      <h2>专辑管理</h2>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><CirclePlus /></el-icon>
        添加专辑
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="专辑名称">
          <el-input v-model="searchForm.name" placeholder="请输入专辑名称" clearable />
        </el-form-item>
        <el-form-item label="歌手">
          <el-input v-model="searchForm.singer" placeholder="请输入歌手名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 专辑列表 -->
    <el-card>
      <el-table :data="albums" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="专辑名称" min-width="200" />
        <el-table-column prop="singer_name" label="歌手" width="150" />
        <el-table-column label="发行日期" width="120">
          <template #default="{ row }">
            {{ row.time }}
          </template>
        </el-table-column>
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

    <!-- 添加/编辑专辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingAlbum ? '编辑专辑' : '添加专辑'"
      width="600px"
    >
      <el-form
        :model="albumForm"
        :rules="albumRules"
        ref="albumFormRef"
        label-width="100px"
      >
        <el-form-item label="专辑名称" prop="name">
          <el-input v-model="albumForm.name" placeholder="请输入专辑名称" />
        </el-form-item>
        <el-form-item label="歌手" prop="singer_id">
          <el-select v-model="albumForm.singer_id" placeholder="请选择歌手" filterable>
            <el-option
              v-for="singer in singers"
              :key="singer.id"
              :label="singer.name"
              :value="singer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发行日期" prop="release_date">
          <el-date-picker
            v-model="albumForm.release_date"
            type="date"
            placeholder="选择发行日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="albumForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入专辑描述"
          />
        </el-form-item>
        <el-form-item label="封面图片" prop="cover_url">
          <el-input v-model="albumForm.cover_url" placeholder="请输入封面图片URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ editingAlbum ? "更新" : "添加" }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { CirclePlus } from "@element-plus/icons-vue";
import {
  getAdminAlbums,
  addAlbum,
  updateAlbum,
  deleteAlbum,
  getAllSingers,
} from "../../api/admin";

const loading = ref(false);
const submitting = ref(false);
const showAddDialog = ref(false);
const editingAlbum = ref(null);
const albums = ref([]);
const singers = ref([]);
const currentPage = ref(1);
const pageSize = ref(20);
const total = ref(0);

const searchForm = ref({
  name: "",
  singer: "",
});

const albumForm = ref({
  name: "",
  singer_id: "",
  release_date: "",
  description: "",
  cover_url: "",
});

const albumRules = {
  name: [{ required: true, message: "请输入专辑名称", trigger: "blur" }],
  singer_id: [{ required: true, message: "请选择歌手", trigger: "change" }],
  release_date: [{ required: true, message: "请选择发行日期", trigger: "change" }],
};

const albumFormRef = ref();

const loadAlbums = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...searchForm.value,
    };

    const response = await getAdminAlbums(params);
    if (response.success) {
      albums.value = response.data;
      total.value = response.pagination.total;
    }
  } catch (error) {
    ElMessage.error("加载专辑列表失败");
  } finally {
    loading.value = false;
  }
  console.log(albums.value);
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

const handleSearch = () => {
  currentPage.value = 1;
  loadAlbums();
};

const resetSearch = () => {
  searchForm.value = {
    name: "",
    singer: "",
  };
  handleSearch();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  loadAlbums();
};

const handleCurrentChange = (page) => {
  currentPage.value = page;
  loadAlbums();
};

const handleEdit = (album) => {
  editingAlbum.value = album;
  albumForm.value = {
    name: album.name,
    singer_id: album.singer_id,
    release_date: album.release_date,
    description: album.description || "",
    cover_url: album.cover_url || "",
  };
  showAddDialog.value = true;
};

const handleDelete = async (album) => {
  try {
    await ElMessageBox.confirm("确定要删除这个专辑吗？", "提示", {
      type: "warning",
    });

    const response = await deleteAlbum(album.id);
    if (response.success) {
      ElMessage.success("删除成功");
      loadAlbums();
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

const handleSubmit = async () => {
  try {
    await albumFormRef.value.validate();
    submitting.value = true;

    let response;
    if (editingAlbum.value) {
      response = await updateAlbum(editingAlbum.value.id, albumForm.value);
    } else {
      response = await addAlbum(albumForm.value);
    }

    if (response.success) {
      ElMessage.success(editingAlbum.value ? "更新成功" : "添加成功");
      showAddDialog.value = false;
      loadAlbums();
    }
  } catch (error) {
    ElMessage.error("操作失败");
  } finally {
    submitting.value = false;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

onMounted(() => {
  loadAlbums();
  loadSingers();
});
</script>

<style scoped>
.admin-albums {
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
</style>
