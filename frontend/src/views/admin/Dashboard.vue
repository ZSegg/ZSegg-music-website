<template>
  <div class="admin-dashboard">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :span="6" v-for="stat in stats" :key="stat.title">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stat.value }}</div>
              <div class="stat-title">{{ stat.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 最近活动 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>
          <div class="recent-activities">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-icon">
                <el-icon><component :is="activity.icon" /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 系统信息 -->
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
            </div>
          </template>
          <div class="system-info">
            <div class="info-item">
              <span class="info-label">系统版本:</span>
              <span class="info-value">v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">运行时间:</span>
              <span class="info-value">{{ uptime }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">数据库状态:</span>
              <span class="info-value">
                <el-tag type="success" size="small">正常</el-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">服务器状态:</span>
              <span class="info-value">
                <el-tag type="success" size="small">运行中</el-tag>
              </span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  User, 
  VideoPlay, 
  Folder, 
  Star,
  CirclePlus,
  ChatDotRound
} from '@element-plus/icons-vue'
import { getAdminStats } from '../../api/admin'

const stats = ref([
  { title: '总用户数', value: 0, icon: 'User', color: '#409EFF' },
  { title: '总歌曲数', value: 0, icon: 'VideoPlay', color: '#67C23A' },
  { title: '总专辑数', value: 0, icon: 'Folder', color: '#E6A23C' },
  { title: '总播放列表', value: 0, icon: 'Star', color: '#F56C6C' }
])

const recentActivities = ref([
  { id: 1, title: '新用户注册', time: '2分钟前', icon: 'CirclePlus' },
  { id: 2, title: '歌曲被播放', time: '5分钟前', icon: 'VideoPlay' },
  { id: 3, title: '专辑被收藏', time: '10分钟前', icon: 'Star' },
  { id: 4, title: '评论被发布', time: '15分钟前', icon: 'ChatDotRound' }
])

const uptime = ref('0天 0小时 0分钟')

const loadStats = async () => {
  try {
    const response = await getAdminStats()
    if (response.success) {
      const data = response.data
      stats.value[0].value = data.userCount
      stats.value[1].value = data.songCount
      stats.value[2].value = data.albumCount
      stats.value[3].value = data.playlistCount
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

const updateUptime = () => {
  // 模拟运行时间计算
  const startTime = new Date('2024-01-01')
  const now = new Date()
  const diff = now - startTime
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  uptime.value = `${days}天 ${hours}小时 ${minutes}分钟`
}

onMounted(() => {
  loadStats()
  updateUptime()
  // 每分钟更新一次运行时间
  setInterval(updateUptime, 60000)
})
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: white;
}

.stat-icon .el-icon {
  font-size: 24px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-title {
  font-size: 14px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-activities {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: #409EFF;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
}

.activity-time {
  font-size: 12px;
  color: #909399;
}

.system-info {
  padding: 10px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #606266;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}
</style> 