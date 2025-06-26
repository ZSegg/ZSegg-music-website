<template>
  <header class="header">
    <div class="header-content">
      <div class="logo" @click="$router.push('/')">
        <h1>音乐网站</h1>
      </div>

      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索歌曲、歌手、专辑..."
          @keyup.enter="handleSearch"
          clearable
        >
          <template #append>
            <el-button @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>

      <div class="nav-menu">
        <el-menu mode="horizontal" :router="true" class="nav-menu-list" :ellipsis="false">
          <el-menu-item index="/search">发现</el-menu-item>
          <el-menu-item v-if="userStore.isAdmin" index="/admin">管理</el-menu-item>
        </el-menu>
      </div>

      <div class="user-menu">
        <template v-if="userStore.isLoggedIn">
          <el-dropdown @command="handleUserCommand">
            <div class="user-avatar">
              <el-avatar
                :src="getImageUrl(userStore.user?.avatar) || '/default-avatar.jpg'"
              />
              <span class="username">{{
                userStore.user?.name || userStore.user?.username
              }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button @click="$router.push('/login')">登录</el-button>
          <el-button type="primary" @click="$router.push('/register')">注册</el-button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { getImageUrl } from "../utils/image";

const router = useRouter();
const userStore = useUserStore();
const searchKeyword = ref("");

// console.log(userStore.isAdmin);
console.log("user: ", userStore.user);

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push(`/search?keyword=${encodeURIComponent(searchKeyword.value.trim())}`);
  }
};

const handleUserCommand = (command) => {
  switch (command) {
    case "profile":
      router.push("/user");
      break;
    case "logout":
      userStore.logout();
      router.push("/");
      break;
  }
};
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  height: 60px;
  gap: 16px;
}

.logo {
  cursor: pointer;
  flex-shrink: 0;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  color: #667eea;
  font-weight: bold;
  white-space: nowrap;
}

.search-box {
  width: 300px;
  flex-shrink: 0;
}

.nav-menu {
  flex: 1;
  display: flex;
  /* justify-content: center; */
}

.nav-menu-list {
  border: none;
  background: transparent;
  display: flex;
  gap: 20px;
}

.nav-menu-list .el-menu-item {
  border: none;
  color: #333;
  white-space: nowrap;
  padding: 0 16px;
  height: 60px;
  line-height: 60px;
}

.nav-menu-list .el-menu-item:hover {
  color: #667eea;
  background-color: transparent;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.user-avatar:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.username {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: visible;
  text-overflow: unset;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 10px;
    gap: 8px;
  }

  .logo h1 {
    font-size: 20px;
  }

  .search-box {
    width: 200px;
  }

  .nav-menu {
    display: none;
  }

  .user-menu {
    gap: 8px;
  }

  .username {
    display: none;
  }
}

@media (max-width: 480px) {
  .search-box {
    width: 150px;
  }

  .logo h1 {
    font-size: 18px;
  }
}
</style>
