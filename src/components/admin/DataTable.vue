<script setup>
import { ref, computed } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import FieldForm from './FieldForm.vue'

/**
 * 通用 CRUD 表格：搜索 + 列表 + 新增/编辑/删除
 * 直接修改 props.rows（父组件持有的编辑副本，同一引用）
 */
const props = defineProps({
  schema: { type: Object, required: true },
  rows: { type: Array, required: true },
  brands: { type: Array, default: () => [] }
})

const keyword = ref('')
const showForm = ref(false)
const editingRow = ref(null)

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return props.rows
  return props.rows.filter((r) =>
    props.schema.searchKeys.some((k) => String(r[k] || '').toLowerCase().includes(kw))
  )
})

function openCreate() {
  editingRow.value = null
  showForm.value = true
}

function openEdit(row) {
  editingRow.value = row
  showForm.value = true
}

function onSave(row) {
  if (editingRow.value) {
    const idx = props.rows.findIndex((r) => r[props.schema.primary] === editingRow.value[props.schema.primary])
    if (idx >= 0) props.rows.splice(idx, 1, row)
  } else {
    // 新增：检查主键唯一
    const dup = props.rows.some((r) => r[props.schema.primary] === row[props.schema.primary])
    if (dup) {
      showToast(`ID「${row[props.schema.primary]}」已存在，请更换`)
      return
    }
    props.rows.push(row)
  }
  showForm.value = false
}

function onDelete(row) {
  showConfirmDialog({
    title: '删除确认',
    message: `确定删除「${row[props.schema.searchKeys[0]] || row[props.schema.primary]}」？\n删除后需点击「发布」才生效`,
    confirmButtonColor: '#ff4d4f'
  })
    .then(() => {
      const idx = props.rows.findIndex((r) => r[props.schema.primary] === row[props.schema.primary])
      if (idx >= 0) props.rows.splice(idx, 1)
    })
    .catch(() => {})
}

/** 缩略图（image 单图 / gallery 首图） */
function thumbOf(row, col) {
  if (col.key === 'image') return row.image || ''
  if (col.key === 'gallery') return Array.isArray(row.gallery) && row.gallery.length ? row.gallery[0] : ''
  return ''
}

function isImgCol(col) {
  return col.key === 'image' || col.key === 'gallery' || col.key === 'logo'
}

function fmtCell(row, col) {
  if (col.key === 'price') return `¥${Number(row.price || 0).toLocaleString('zh-CN')}`
  if (col.key === 'icon') return row.icon || ''
  if (col.key === 'colors') return Array.isArray(row.colors) ? row.colors.join(',') : row.colors
  if (col.key === 'fitTypes') return Array.isArray(row.fitTypes) ? row.fitTypes.join('/') : ''
  return row[col.key] ?? ''
}

function nameOf(row) {
  return row[props.schema.searchKeys[0]] || row[props.schema.primary]
}
</script>

<template>
  <div class="data-table">
    <div class="toolbar">
      <div class="search-box">
        <van-icon name="search" size="15" color="#86909c" />
        <input v-model="keyword" class="search-input" placeholder="搜索..." />
      </div>
      <button class="btn-add" @click="openCreate">
        <van-icon name="plus" size="14" />
        新增
      </button>
    </div>

    <div class="count-line">共 {{ filtered.length }} 条</div>

    <div class="row-list">
      <div v-for="row in filtered" :key="row[schema.primary]" class="data-row">
        <img v-if="isImgCol(schema.columns[0]) && thumbOf(row, schema.columns[0])" :src="thumbOf(row, schema.columns[0])" class="row-thumb" alt="" />
        <span v-else-if="isImgCol(schema.columns[0])" class="row-thumb row-thumb-empty">
          {{ row[schema.primary] ? row[schema.primary].slice(-2) : '--' }}
        </span>

        <div class="row-info">
          <div class="row-title">{{ nameOf(row) }}</div>
          <div class="row-sub">
            <template v-for="(col, i) in schema.columns.slice(1)" :key="col.key">
              <span class="row-cell">{{ col.label }}: {{ fmtCell(row, col) }}</span>
              <span v-if="i < schema.columns.length - 2" class="row-sep">·</span>
            </template>
          </div>
        </div>

        <div class="row-actions">
          <button class="act-btn edit" @click="openEdit(row)">编辑</button>
          <button class="act-btn del" @click="onDelete(row)">删除</button>
        </div>
      </div>

      <div v-if="!filtered.length" class="empty">
        <van-icon name="orders-o" size="36" color="#c9cdd4" />
        <p>暂无数据{{ keyword ? '（试试其他关键字）' : '，点击「新增」添加' }}</p>
      </div>
    </div>

    <FieldForm
      v-model:show="showForm"
      :schema="schema"
      :row="editingRow"
      :brands="brands"
      @save="onSave"
    />
  </div>
</template>

<style scoped>
.data-table {
  padding: 0 12px;
}

.toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 12px;
  background: #f0f1f4;
  border-radius: 19px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #1d2129;
}

.btn-add {
  height: 38px;
  padding: 0 16px;
  border: none;
  border-radius: 19px;
  background: linear-gradient(135deg, #1677ff, #69b1ff);
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

.count-line {
  font-size: 11px;
  color: #86909c;
  margin: 10px 2px 8px;
}

.row-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.data-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(29, 33, 41, 0.05);
}

.row-thumb {
  width: 56px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f0f1f4;
}

.row-thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #c9cdd4;
  background: linear-gradient(135deg, #f0f1f4, #e5e8ee);
}

.row-info {
  flex: 1;
  min-width: 0;
}

.row-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-sub {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 4px;
  margin-top: 3px;
  font-size: 11px;
  color: #86909c;
}

.row-sep {
  color: #e5e6eb;
}

.row-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.act-btn {
  height: 28px;
  padding: 0 10px;
  border-radius: 14px;
  border: none;
  font-size: 12px;
  cursor: pointer;
}

.act-btn.edit {
  background: #e8f1ff;
  color: #1677ff;
}

.act-btn.del {
  background: #fff1f0;
  color: #ff4d4f;
}

.empty {
  text-align: center;
  padding: 48px 0;
  color: #86909c;
  font-size: 13px;
}

.empty p {
  margin-top: 8px;
}
</style>
