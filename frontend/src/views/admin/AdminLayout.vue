<template>
  <div class="admin-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="250px" class="admin-sidebar">
        <div class="admin-header">
          <h2>音乐管理系统</h2>
        </div>
        <el-menu
          :default-active="$route.path"
          router
          class="admin-menu"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/admin">
            <el-icon><Monitor /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/admin/songs">
            <el-icon><VideoPlay /></el-icon>
            <span>歌曲管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/albums">
            <el-icon><Folder /></el-icon>
            <span>专辑管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/singers">
            <el-icon><User /></el-icon>
            <span>歌手管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><UserFilled /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-container>
        <el-header class="admin-header-main">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>管理后台</el-breadcrumb-item>
              <el-breadcrumb-item>{{ getCurrentPageTitle() }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-button @click="$router.push('/')" type="info" plain size="small" style="margin-right: 15px;">
              <el-icon><House /></el-icon>
              返回首页
            </el-button>
            <el-dropdown @command="handleCommand">
              <span class="admin-user">
                {{ userStore.user?.username || "管理员" }}
                <el-icon><CaretBottom /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <el-main class="admin-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useUserStore } from "../../stores/user";
import {
  Monitor,
  VideoPlay,
  Folder,
  User,
  UserFilled,
  CaretBottom,
  House,
} from "@element-plus/icons-vue";

const router = useRouter();
const userStore = useUserStore();

const getCurrentPageTitle = () => {
  const routeMap = {
    "/admin": "仪表盘",
    "/admin/songs": "歌曲管理",
    "/admin/albums": "专辑管理",
    "/admin/singers": "歌手管理",
    "/admin/users": "用户管理",
  };
  return routeMap[router.currentRoute.value.path] || "管理";
};

const handleCommand = (command) => {
  if (command === "logout") {
    userStore.logout();
    router.push("/login");
  }
};
</script>

<style scoped>
.admin-layout,
.el-container,
.el-main {
  height: 100vh;
  min-height: 100vh;
}

.admin-sidebar {
  background-color: #304156;
  color: #bfcbd9;
}

.admin-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #1f2d3d;
}

.admin-header h2 {
  color: #bfcbd9;
  margin: 0;
  font-size: 18px;
}

.admin-menu {
  border: none;
}

.admin-header-main {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.admin-user {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
}

.admin-user .el-icon {
  margin-left: 5px;
}

.admin-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
