<template>
  <div id="app">
    <router-view />
    <Player />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUserStore } from './stores/user';
import Player from './components/Player.vue';

const userStore = useUserStore();

onMounted(async () => {
  // 页面加载时自动加载用户/管理员信息
  if (userStore.token) {
    await userStore.loadUserInfo();
  }
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
}
</style> 