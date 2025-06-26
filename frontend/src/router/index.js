import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "../stores/user";

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/Login.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/Register.vue"),
  },
  {
    path: "/song/:id",
    name: "SongDetail",
    component: () => import("../views/SongDetail.vue"),
  },
  {
    path: "/album/:id",
    name: "AlbumDetail",
    component: () => import("../views/AlbumDetail.vue"),
  },
  {
    path: "/singer/:id",
    name: "SingerDetail",
    component: () => import("../views/SingerDetail.vue"),
  },
  {
    path: "/playlist/:id",
    name: "PlaylistDetail",
    component: () => import("../views/PlaylistDetail.vue"),
  },
  {
    path: "/user",
    name: "UserCenter",
    component: () => import("../views/UserCenter.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/search",
    name: "Search",
    component: () => import("../views/Search.vue"),
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("../views/admin/AdminLayout.vue"),
    meta: { requiresAdmin: true },
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: () => import("../views/admin/Dashboard.vue"),
      },
      {
        path: "songs",
        name: "AdminSongs",
        component: () => import("../views/admin/Songs.vue"),
      },
      {
        path: "albums",
        name: "AdminAlbums",
        component: () => import("../views/admin/Albums.vue"),
      },
      {
        path: "singers",
        name: "AdminSingers",
        component: () => import("../views/admin/Singers.vue"),
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("../views/admin/Users.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next("/login");
  } else if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next("/");
  } else {
    next();
  }
});

export default router;
