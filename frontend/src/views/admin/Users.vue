<template>
  <div class="admin-users">
    <div class="page-header">
      <h2>用户管理</h2>
    </div>

    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="searchForm.email" placeholder="请输入邮箱" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card>
      <el-table :data="users" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="playlist_count" label="播放列表" width="100" />
        <el-table-column prop="collection_count" label="收藏数" width="100" />
        <el-table-column prop="last_login" label="最后登录" width="180">
          <template #default="{ row }">
            {{ formatDate(row.last_login) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="注册时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small" 
              :type="row.status === 'active' ? 'danger' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" @click="handleViewDetails(row)">详情</el-button>
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

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="showDetailsDialog"
      title="用户详情"
      width="600px"
    >
      <div v-if="selectedUser" class="user-details">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">{{ selectedUser.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ selectedUser.username }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ selectedUser.email }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ selectedUser.nickname }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="selectedUser.status === 'active' ? 'success' : 'danger'">
              {{ selectedUser.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ formatDate(selectedUser.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ formatDate(selectedUser.last_login) }}</el-descriptions-item>
          <el-descriptions-item label="播放列表数">{{ selectedUser.playlist_count }}</el-descriptions-item>
          <el-descriptions-item label="收藏数">{{ selectedUser.collection_count }}</el-descriptions-item>
        </el-descriptions>

        <div class="user-stats" style="margin-top: 20px;">
          <h4>用户统计</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card shadow="hover">
                <div class="stat-item">
                  <div class="stat-number">{{ selectedUser.playlist_count }}</div>
                  <div class="stat-label">播放列表</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover">
                <div class="stat-item">
                  <div class="stat-number">{{ selectedUser.collection_count }}</div>
                  <div class="stat-label">收藏</div>
                </div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card shadow="hover">
                <div class="stat-item">
                  <div class="stat-number">{{ selectedUser.comment_count || 0 }}</div>
                  <div class="stat-label">评论</div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getAdminUsers, 
  updateUserStatus 
} from '../../api/admin'

const loading = ref(false)
const showDetailsDialog = ref(false)
const selectedUser = ref(null)
const users = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const searchForm = ref({
  username: '',
  email: '',
  status: ''
})

const loadUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...searchForm.value
    }
    
    const response = await getAdminUsers(params)
    if (response.success) {
      users.value = response.data
      total.value = response.pagination.total
    }
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadUsers()
}

const resetSearch = () => {
  searchForm.value = {
    username: '',
    email: '',
    status: ''
  }
  handleSearch()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  loadUsers()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  loadUsers()
}

const handleToggleStatus = async (user) => {
  try {
    const action = user.status === 'active' ? '禁用' : '启用'
    await ElMessageBox.confirm(`确定要${action}用户 "${user.username}" 吗？`, '提示', {
      type: 'warning'
    })
    
    const newStatus = user.status === 'active' ? 'disabled' : 'active'
    const response = await updateUserStatus(user.id, { status: newStatus })
    
    if (response.success) {
      ElMessage.success(`${action}成功`)
      loadUsers()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleViewDetails = (user) => {
  selectedUser.value = user
  showDetailsDialog.value = true
}

const formatDate = (dateString) => {
  if (!dateString) return '未登录'
  return new Date(dateString).toLocaleString()
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users {
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

.user-details {
  padding: 20px 0;
}

.user-stats h4 {
  margin-bottom: 15px;
  color: #303133;
}

.stat-item {
  text-align: center;
  padding: 10px;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}
</style> 