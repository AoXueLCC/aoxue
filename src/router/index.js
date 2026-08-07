import { createRouter, createWebHashHistory } from 'vue-router'
import { ref } from 'vue'
import { useQuoteStore } from '../stores/quote'

/** 页面切换动画方向：forward 前进 / backward 后退 */
export const pageDirection = ref('forward')

const routes = [
  {
    path: '/',
    name: 'TruckList',
    component: () => import('../views/TruckList.vue'),
    meta: { index: 0, title: '车型列表' }
  },
  {
    path: '/truck/:id',
    name: 'TruckDetail',
    component: () => import('../views/TruckDetail.vue'),
    meta: { index: 1, title: '车型详情' }
  },
  {
    path: '/config',
    name: 'TruckConfig',
    component: () => import('../views/TruckConfig.vue'),
    meta: { index: 2, title: '配置车辆', requiresTruck: true }
  },
  {
    path: '/save',
    name: 'SaveQuote',
    component: () => import('../views/SaveQuote.vue'),
    meta: { index: 3, title: '确认报价', requiresTruck: true }
  },
  {
    path: '/success',
    name: 'Success',
    component: () => import('../views/SuccessPage.vue'),
    meta: { index: 4, title: '保存成功' }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('../views/HistoryPage.vue'),
    meta: { index: 5, title: '报价历史' }
  },
  {
    path: '/quote/:no',
    name: 'QuoteDetail',
    component: () => import('../views/QuoteDetail.vue'),
    meta: { index: 6, title: '报价单详情' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: { index: 99, title: '管理后台' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

/* hash 模式：GitHub Pages 子路径部署无需服务端重写，刷新/直链不 404 */
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  }
})

/** 守卫：配置流程页面必须先选车型 */
router.beforeEach((to, from) => {
  if (to.meta.requiresTruck) {
    const store = useQuoteStore()
    if (!store.truck) return { name: 'TruckList' }
  }
  return true
})

/** 记录切换方向，供 App.vue 过渡动画使用 */
router.afterEach((to, from) => {
  const toIdx = to.meta.index ?? 0
  const fromIdx = from.meta.index ?? 0
  pageDirection.value = toIdx >= fromIdx ? 'forward' : 'backward'
  document.title = to.meta.title ? `${to.meta.title} - 冷藏车智能报价` : '冷藏车智能报价系统'
})

export default router
