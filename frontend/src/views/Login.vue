<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-form">
        <h2>登录</h2>
        <el-radio-group v-model="loginType" class="login-type-switch" size="small">
          <el-radio-button label="user">用户登录</el-radio-button>
          <el-radio-button label="admin">管理员登录</el-radio-button>
        </el-radio-group>
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="用户名"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="loading"
              @click="handleLogin"
              class="login-btn"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>

        <div class="form-footer">
          <span v-if="loginType === 'user'">还没有账号？</span>
          <el-button v-if="loginType === 'user'" text @click="$router.push('/register')"
            >立即注册</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { ElMessage } from "element-plus";

const router = useRouter();
const userStore = useUserStore();
const loginFormRef = ref();
const loading = ref(false);

const loginType = ref("user");

const loginForm = reactive({
  username: "",
  password: "",
});

const loginRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
  ],
};

const handleLogin = async () => {
  try {
    await loginFormRef.value.validate();
    loading.value = true;
    if (loginType.value === "admin") {
      await userStore.loginAdmin(loginForm);
      ElMessage.success("管理员登录成功");
      router.push("/admin");
    } else {
      await userStore.loginUser(loginForm);
      ElMessage.success("登录成功");
      router.push("/");
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || "登录失败");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 28px;
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.login-type-switch {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
</style>
