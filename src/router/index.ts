import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "تسجيل الدخول",
    component: () => import("../views/Login.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/categories",
    name: "الفئات",
    component: () => import("../views/Categories.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/categories/:id/questions",
    name: "أسئلة الفئة",
    component: () => import("../views/CategoryQuestions.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/countries",
    name: "الدول",
    component: () => import("../views/Countries.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/users",
    name: "المستخدمين",
    component: () => import("../views/Users.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/payments",
    name: "الدفع",
    component: () => import("../views/Payments.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/prices",
    name: "الأسعار",
    component: () => import("../views/Prices.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/versions",
    name: "إصدارات التطبيق",
    component: () => import("../views/AppVersions.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// حراس التنقل
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next("/categories");
  } else {
    next();
  }
});

export default router;
