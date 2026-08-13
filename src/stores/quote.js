import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const STORAGE_KEY = 'reefer-quote-vue-v1'
export const HISTORY_KEY = 'reefer-quote-vue-history-v1'

/**
 * 报价核心 Store：管理整个配置流程的状态与价格联动
 * 状态持久化到 localStorage，刷新页面不丢失
 */
export const useQuoteStore = defineStore('quote', () => {
  /* ========== 核心选择状态 ========== */
  const truck = ref(null)
  const chassis = ref(null)
  const refrigerator = ref(null)
  const body = ref(null)
  const accessories = ref([])
  const transportFee = ref(0)
  const otherFees = ref(0)
  const note = ref('')
  const customer = ref({ name: '', phone: '', company: '', address: '' })

  /** 最近一次保存的报价（仅内存，SuccessPage 展示用，不持久化） */
  const lastQuote = ref(null)

  /** 进入确认页前的配置步骤 tab（仅内存，确认页返回时恢复） */
  const configTab = ref('')

  /* ========== 价格计算（实时联动） ========== */
  /** 车辆价格：由底盘档位决定（档位价覆盖整车价）；无档位车的"标配"档位已携带车型基础价，取消选择=0 */
  const vehiclePrice = computed(() => {
    if (chassis.value && chassis.value.price != null) return chassis.value.price
    return 0
  })
  const chassisPrice = computed(() => (chassis.value?.price ?? 0))
  const refrigeratorPrice = computed(() => (refrigerator.value ? refrigerator.value.price : 0))
  const bodyPrice = computed(() => (body.value ? body.value.price : 0))
  const accessoryTotal = computed(() => accessories.value.reduce((sum, a) => sum + a.price, 0))
  const accessoryCount = computed(() => accessories.value.length)
  const feeTotal = computed(() => Number(transportFee.value || 0) + Number(otherFees.value || 0))

  /** 购置税（按裸车价）：新能源车（纯电/混动）÷22.6，非新能源 ÷11.3 */
  const isNewEnergy = computed(() => ['纯电', '混动'].includes(truck.value?.energy))
  const purchaseTax = computed(() => {
    const p = vehiclePrice.value
    if (!p) return 0
    return Math.round(p / (isNewEnergy.value ? 22.6 : 11.3))
  })

  /** 配置总价（不含购置税）：配置过程展示 */
  const totalPrice = computed(
    () =>
      vehiclePrice.value +
      refrigeratorPrice.value +
      bodyPrice.value +
      accessoryTotal.value +
      feeTotal.value
  )

  /** 最终总价（含购置税）：确认报价页 / 保存的报价单使用 */
  const finalTotal = computed(() => totalPrice.value + purchaseTax.value)

  /** 底部栏已选摘要：底盘/冷机/厢体/配装（未选则省略） */
  const selectionSummary = computed(() => {
    const parts = []
    if (chassis.value) parts.push(`底盘 ${chassis.value.name}`)
    if (refrigerator.value) parts.push(`冷机 ${refrigerator.value.model}`)
    if (body.value) parts.push(`厢体 ${body.value.name}`)
    if (accessories.value.length) parts.push(`配装 ${accessories.value.length}项`)
    return parts.join(' · ')
  })

  /** 当前配置进度（0~4） */
  const configStep = computed(() => {
    if (!truck.value) return 0
    if (!chassis.value) return 1
    if (!refrigerator.value) return 2
    if (!body.value) return 3
    return 4
  })

  /** 报价明细行（PriceBar / 确认页共用） */
  const priceLines = computed(() => {
    const lines = [
      { label: '车辆价格', value: vehiclePrice.value },
      { label: '冷机价格', value: refrigeratorPrice.value },
      { label: '厢体价格', value: bodyPrice.value },
      { label: '配装价格', value: accessoryTotal.value }
    ]
    lines.push({ label: '购置税', value: purchaseTax.value })
    if (feeTotal.value > 0) {
      lines.push({ label: '运输及其他', value: feeTotal.value })
    }
    return lines
  })

  /* ========== 操作 ========== */

  /** 选择车辆（进入配置流程第一步） */
  function setTruck(t) {
    truck.value = t
    chassis.value = null
    refrigerator.value = null
    body.value = null
    accessories.value = []
    transportFee.value = 0
    otherFees.value = 0
    note.value = ''
    customer.value = { name: '', phone: '', company: '', address: '' }
  }

  function setChassis(c) {
    chassis.value = c
  }

  function setRefrigerator(r) {
    refrigerator.value = r
  }

  /** 退出配置流程：保留已选车辆，清空已选配置（再次进入时按标配重新预选） */
  function clearConfig() {
    chassis.value = null
    refrigerator.value = null
    body.value = null
    accessories.value = []
    transportFee.value = 0
    otherFees.value = 0
    note.value = ''
  }

  function setBody(b) {
    body.value = b
  }

  /** 勾选/取消配装：单选组（mode single，如地板/裙边/蒙皮）组内互斥；其余（多选/开关）原逻辑 */
  function toggleAccessory(acc) {
    if (acc.mode === 'single') {
      const others = accessories.value.filter((a) => a.id !== acc.id && a.group === acc.group)
      for (const o of others) accessories.value.splice(accessories.value.indexOf(o), 1)
    }
    const idx = accessories.value.findIndex((a) => a.id === acc.id)
    if (idx >= 0) {
      accessories.value.splice(idx, 1)
    } else {
      accessories.value.push(acc)
    }
  }

  function isAccessorySelected(id) {
    return accessories.value.some((a) => a.id === id)
  }

  /** 生成报价单号 */
  function genQuoteNo() {
    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
    const rand = String(Math.floor(1000 + Math.random() * 9000))
    return `QF${date}${rand}`
  }

  /** 保存报价（写入 localStorage 历史，后续可扩展报价单列表） */
  function saveQuote() {
    const quote = {
      no: genQuoteNo(),
      customer: { ...customer.value },
      truck: truck.value
        ? {
            id: truck.value.id,
            name: truck.value.name,
            price: vehiclePrice.value,
            truckType: truck.value.truckType,
            energy: truck.value.energy,
            image: truck.value.gallery?.[0] || truck.value.image || ''
          }
        : null,
      chassis: chassis.value ? { id: chassis.value.id, name: chassis.value.name, price: chassis.value.price } : null,
      refrigerator: refrigerator.value
        ? { id: refrigerator.value.id, model: refrigerator.value.model, price: refrigerator.value.price }
        : null,
      body: body.value ? { id: body.value.id, name: body.value.name, price: body.value.price } : null,
      accessories: accessories.value.map((a) => ({ id: a.id, name: a.name, price: a.price })),
      purchaseTax: purchaseTax.value,
      transportFee: transportFee.value,
      otherFees: otherFees.value,
      note: note.value,
      total: finalTotal.value,
      createdAt: Date.now()
    }
    let list = []
    try {
      list = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    } catch (e) {
      /* 历史数据损坏时从空列表开始 */
    }
    if (!Array.isArray(list)) list = []
    list.push(quote)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
    return quote
  }

  /** 清空配置 */
  function reset() {
    truck.value = null
    chassis.value = null
    refrigerator.value = null
    body.value = null
    accessories.value = []
    transportFee.value = 0
    otherFees.value = 0
    note.value = ''
    customer.value = { name: '', phone: '', company: '', address: '' }
  }

  /* ========== 持久化 ========== */
  watch(
    () => ({
      truck: truck.value,
      chassis: chassis.value,
      refrigerator: refrigerator.value,
      body: body.value,
      accessories: accessories.value,
      transportFee: transportFee.value,
      otherFees: otherFees.value,
      note: note.value,
      customer: customer.value
    }),
    (state) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    },
    { deep: true }
  )

  /** 启动时恢复上次配置 */
  function restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      if (saved && saved.truck) {
        truck.value = saved.truck
        chassis.value = saved.chassis || null
        refrigerator.value = saved.refrigerator
        body.value = saved.body
        accessories.value = saved.accessories || []
        transportFee.value = saved.transportFee || 0
        otherFees.value = saved.otherFees || 0
        note.value = saved.note || ''
        customer.value = saved.customer || { name: '', phone: '', company: '', address: '' }
      }
    } catch (e) {
      /* 忽略损坏数据 */
    }
  }

  return {
    truck,
    chassis,
    refrigerator,
    body,
    accessories,
    transportFee,
    otherFees,
    note,
    customer,
    lastQuote,
    configTab,
    vehiclePrice,
    chassisPrice,
    refrigeratorPrice,
    bodyPrice,
    accessoryTotal,
    accessoryCount,
    feeTotal,
    purchaseTax,
    totalPrice,
    finalTotal,
    selectionSummary,
    configStep,
    priceLines,
    setTruck,
    clearConfig,
    setChassis,
    setRefrigerator,
    setBody,
    toggleAccessory,
    isAccessorySelected,
    genQuoteNo,
    saveQuote,
    reset,
    restore
  }
})
