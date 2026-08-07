<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { showToast } from 'vant'
import { normalizeRow, toNumbers, defaultRow } from '../../admin/schemas'
import ImageUploader from './ImageUploader.vue'

/**
 * 字段表单弹窗：按 schema 渲染分组表单
 * 支持 text/number/select/multiselect/tags/textarea/image/images/video
 */
const props = defineProps({
  show: { type: Boolean, default: false },
  schema: { type: Object, required: true },
  row: { type: Object, default: null }, // null = 新增
  brands: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:show', 'save'])

const form = reactive({})
const editingId = ref('')

const groups = computed(() => {
  const seen = []
  for (const f of props.schema.fields) {
    if (!seen.includes(f.group)) seen.push(f.group)
  }
  return seen
})

function fieldsOf(group) {
  return props.schema.fields.filter((f) => f.group === group)
}

/** 打开弹窗时初始化表单 */
watch(
  () => props.show,
  (open) => {
    if (!open) return
    const base = props.row ? { ...props.row } : defaultRow(props.schema)
    for (const f of props.schema.fields) {
      if (f.type === 'tags') {
        base[f.key] = Array.isArray(base[f.key]) ? base[f.key].join(',') : base[f.key] || ''
      }
    }
    Object.assign(form, base)
    editingId.value = props.row ? props.row[props.schema.primary] : ''
  }
)

const brandMap = computed(() => {
  const m = {}
  for (const b of props.brands) m[b.id] = b.name
  return m
})

/** 选择品牌时自动带出品牌名称（编辑旧数据时已有 brand 不被覆盖） */
watch(
  () => form.brandId,
  (id) => {
    const name = brandMap.value[id]
    if (name) form.brand = name
  }
)

/** 多选 chips 切换 */
function toggleOption(field, opt) {
  if (!Array.isArray(form[field.key])) form[field.key] = []
  const list = form[field.key]
  const idx = list.indexOf(opt)
  if (idx >= 0) list.splice(idx, 1)
  else list.push(opt)
}

function resolveOptions(field) {
  if (Array.isArray(field.options)) return field.options
  if (field.options === 'brands') return props.brands.map((b) => b.id)
  return []
}

function optionLabel(field, opt) {
  if (field.options === 'brands') return brandMap.value[opt] || opt
  return opt
}

function onSave() {
  const missing = props.schema.fields.filter((f) => f.required && !String(form[f.key] || '').trim())
  if (missing.length) {
    showToast(`请填写：${missing.map((f) => f.label).join('、')}`)
    return
  }
  let row = normalizeRow(props.schema, { ...form })
  row = toNumbers(props.schema, row)
  // 品牌名由品牌表带出（brandId → brand），避免被 normalizeRow 剥离导致数据不一致
  const brandField = props.schema.fields.find((f) => f.key === 'brandId' && f.options === 'brands')
  if (brandField) row.brand = brandMap.value[row.brandId] || ''
  emit('save', row)
}
</script>

<template>
  <van-popup :show="show" position="bottom" round closeable :style="{ maxHeight: '85vh' }" @update:show="emit('update:show', $event)">
    <div class="form-popup">
      <div class="form-head">
        <span class="form-title">{{ row ? '编辑' : '新增' }}{{ schema.title }}</span>
        <button class="btn-save" @click="onSave">保存</button>
      </div>

      <div class="form-body">
        <template v-for="group in groups" :key="group">
          <div class="group-title">{{ group }}</div>

          <div v-for="field in fieldsOf(group)" :key="field.key" class="field-row">
            <div class="field-label">
              {{ field.label }}
              <span v-if="field.required" class="required">*</span>
            </div>

            <!-- 文本 -->
            <input
              v-if="field.type === 'text'"
              v-model="form[field.key]"
              class="f-input"
              :placeholder="field.placeholder || ''"
              :disabled="field.key === schema.primary && !!editingId"
            />

            <!-- 数字 -->
            <input
              v-else-if="field.type === 'number'"
              v-model="form[field.key]"
              class="f-input"
              type="number"
              :placeholder="field.placeholder || ''"
            />

            <!-- 多行文本 -->
            <textarea
              v-else-if="field.type === 'textarea'"
              v-model="form[field.key]"
              class="f-input f-textarea"
              rows="3"
              :placeholder="field.placeholder || ''"
            ></textarea>

            <!-- 单选 -->
            <div v-else-if="field.type === 'select'" class="chip-group">
              <button
                v-for="opt in resolveOptions(field)"
                :key="opt"
                class="chip"
                :class="{ active: form[field.key] === opt }"
                @click="form[field.key] = opt"
              >
                {{ optionLabel(field, opt) }}
              </button>
            </div>

            <!-- 多选 -->
            <div v-else-if="field.type === 'multiselect'" class="chip-group">
              <button
                v-for="opt in field.options"
                :key="opt"
                class="chip"
                :class="{ active: (form[field.key] || []).includes(opt) }"
                @click="toggleOption(field, opt)"
              >
                {{ opt }}
              </button>
            </div>

            <!-- 标签（逗号分隔） -->
            <input
              v-else-if="field.type === 'tags'"
              v-model="form[field.key]"
              class="f-input"
              :placeholder="field.placeholder || ''"
            />

            <!-- 图片/视频上传 -->
            <ImageUploader
              v-else-if="['image', 'images', 'video'].includes(field.type)"
              v-model="form[field.key]"
              :kind="field.type === 'video' ? 'video' : field.type"
              :hint="field.hint || ''"
            />

            <div v-if="field.hint && field.type !== 'image' && field.type !== 'images' && field.type !== 'video'" class="field-hint">
              {{ field.hint }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.form-popup {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.form-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
}

.form-title {
  font-size: 17px;
  font-weight: 700;
  color: #1d2129;
}

.btn-save {
  height: 34px;
  padding: 0 20px;
  border: none;
  border-radius: 17px;
  background: linear-gradient(135deg, #1677ff, #69b1ff);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
}

.form-body {
  padding: 0 16px 20px;
  max-height: 62vh;
  overflow-y: auto;
}

.group-title {
  font-size: 12px;
  font-weight: 700;
  color: #86909c;
  margin: 14px 0 8px;
}

.group-title:first-child {
  margin-top: 0;
}

.field-row {
  margin-bottom: 12px;
}

.field-label {
  font-size: 13px;
  color: #4e5969;
  margin-bottom: 6px;
}

.required {
  color: #ff4d4f;
}

.f-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e5e6eb;
  border-radius: 10px;
  font-size: 14px;
  color: #1d2129;
  background: #f8f9fb;
  outline: none;
  transition: border-color 0.2s;
}

.f-input:focus {
  border-color: #1677ff;
  background: #ffffff;
}

.f-input:disabled {
  color: #86909c;
  background: #f0f1f4;
}

.f-textarea {
  height: auto;
  padding: 10px 12px;
  resize: none;
  line-height: 1.5;
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  height: 34px;
  padding: 0 16px;
  border-radius: 17px;
  border: 1.5px solid #e5e6eb;
  background: #ffffff;
  color: #4e5969;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}

.chip.active {
  border-color: #1677ff;
  background: #e8f1ff;
  color: #1677ff;
  font-weight: 600;
}

.field-hint {
  font-size: 11px;
  color: #86909c;
  margin-top: 4px;
}
</style>
