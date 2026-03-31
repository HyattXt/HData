<template>
  <!-- 🔥 适配 NaiveUI：只做内部弹性布局，不影响外层 -->
  <div class="api-page-wrapper">
    <!-- 搜索框：STICKY 固定，永远在顶部，不被滚走 -->
    <div class="api-search-sticky">
      <div class="search-container">
        <div class="search-header">
          <h1 class="api-title">资源目录</h1>
          <p class="api-description">浏览全量开放API资源，按需申请使用</p>
        </div>
        <div class="search-box">
          <input v-model="paginationReactive.apiName" @keyup.enter="handlePageChange(1, paginationReactive.pageSize)"
            placeholder="搜索 API 名称、场景、类型" class="search-input" />
          <button @click="handlePageChange(1, paginationReactive.pageSize)" class="search-btn">
            <SearchOutlined />
            搜索
          </button>
        </div>
      </div>
    </div>

    <!-- 中间主体：左右布局 -->
    <div class="api-body-layout">
      <!-- 左侧分类栏 -->
      <!-- 左侧分类栏 -->
      <div class="api-sidebar">
        <div class="tree-title">
          <NIcon size="22px">
            <UnorderedListOutlined />
          </NIcon>
          资源分类
        </div>

        <!-- 🔥 全部分类（固定id=1） -->
        <div class="tree-item tree-item-all" :class="{ active: activeCategory === 1 }" @click="handleCategoryChange(1)">
          全部分类
        </div>

        <!-- 原有分类列表 -->
        <div v-for="item in apiCategories" :key="item.id" class="tree-item"
          :class="{ active: activeCategory === item.id }" @click="handleCategoryChange(item.id)">
          {{ item.name }}
        </div>
      </div>

      <!-- 右侧内容区：唯一滚动区域 -->
      <div class="api-right-container">
        <!-- 🔥 唯一滚动：API 列表 -->
        <div class="api-list-scroll">
          <div v-if="dataRef.length === 0" class="empty-tip">暂无数据</div>

          <div class="api-card" v-for="item in dataRef" :key="item.apiId" @click="handleCurrentChange(item)">
            <div class="card-header">
              <div class="api-name">
                <svg class="api-icon" viewBox="0 0 24 24" fill="#165dff">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
                {{ item.apiName }}
              </div>
              <div class="card-buttons">
                <button class="btn btn-view" @click.stop="play(item)">查看详情</button>
                <button class="btn btn-apply" @click.stop="showApplyDialog(item)">立即申请</button>
              </div>
            </div>

            <div class="api-path" :title="item.apiPath">{{ item.apiPath }}</div>
            <div class="api-info">
              <el-tag :type="getMethodTagType(item.apiMethod)" size="small" class="method-tag">{{ item.apiMethod
              }}</el-tag>
              <el-tag :type="getStatusTagType(item.apiStatus)" size="small" class="status-tag">{{ item.apiStatus
              }}</el-tag>
              <span class="info-text">类型：{{ item.apiFlag }}</span>
              <span class="info-text">提供方：{{ item.apiDataSource || '未知' }}</span>
            </div>
            <div class="api-desc" v-if="item.apiComment">{{ item.apiComment }}</div>
            <div class="api-footer">
              <span>更新时间：{{ item.apiGmtTime || item.apiCreateTime }}</span>
            </div>
          </div>
        </div>

        <!-- 🔥 分页组件：永远固定在底部，不滚动 -->
        <div class="api-pagination-bar" v-if="dataRef.length > 0">
          <el-config-provider :locale="zhCn">
            <el-pagination background :default-page-size="30" :page-sizes="[30, 90, 180, 300]"
              layout="total, sizes, prev, pager, next" :total="paginationReactive.itemCount"
              @change="handlePageChange" />
          </el-config-provider>
        </div>
      </div>
    </div>
  </div>

  <!-- 申请弹窗 -->
  <el-dialog v-model="applyDialogVisible" :width="600" title="API申请" @close="handleClose">
    <el-form :model="applyForm" label-width="100px" :rules="applyRules" ref="applyFormRef" :show-message="false">
      <el-form-item label="申请人或单位" prop="applicant"><el-input v-model="applyForm.applicant" /></el-form-item>
      <el-form-item label="申请理由" prop="reasonForApplication"><el-input type="textarea" v-model="applyForm.reasonForApplication"
          rows="4" /></el-form-item>
      <el-form-item label="有效期" prop="expiryDate"><el-date-picker v-model="applyForm.expiryDate" type="datetime"
          style="width:100%" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitApply">提交申请</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import apiAxios from '@/utils/api-axios'
import { SearchOutlined, UnorderedListOutlined } from '@vicons/antd'
import { useMessage } from 'naive-ui'
import moment from 'moment'
import utils from '@/utils'
import { ElButton, ElInput, ElForm, ElFormItem, ElDatePicker, ElDialog, ElTag, ElPagination, ElConfigProvider } from 'element-plus'
import zhCn from "element-plus/es/locale/lang/zh-cn";
import {insertApproval} from "@/service/modules/data-bussiness";

const router = useRouter()
const message = useMessage()

const dataRef = ref([])
const apiCategories = ref([])
const activeCategory = ref(1)
const targetApiId = ref(null) // 用于存储从home页面传递过来的apiId

const paginationReactive = reactive({
  page: 1,
  pageSize: 30,
  apiName: '',
  apiTreeId: '',
  itemCount: 0,
})

const applyDialogVisible = ref(false)
const applyForm = ref({
  applicant: '',
  expiryDate: '',
  approvalStatus: 2,
  approvalType: 7,
  releaseState: 2,
  objName: "",
  objNum: "",
  reasonForApplication: ""
})
const applyFormRef = ref(null)
const currentApi = ref(null)
const applyRules = ref({
  applicant: [{ required: true, trigger: 'blur' }],
  reasonForApplication: [{ required: true, trigger: 'blur' }],
  expiryDate: [{ required: true, trigger: 'change' }],
})

function query(page, pageSize) {
  return new Promise((resolve) => {
    const url = utils.getUrl('interface/getList')
    const params = {
      pageNum: page, pageSize,
      apiName: paginationReactive.apiName,
      apiTreeId: paginationReactive.apiTreeId,
      order: 'api_create_time', sort: 'desc',
    }

    // 如果有targetApiId，则添加到查询参数中
    if (targetApiId.value) {
      params.apiId = targetApiId.value
      // 只在首次查询时使用targetApiId，之后清空
      targetApiId.value = null
    }

    apiAxios.post(url, params).then((res) => {
      const list = res.data.data || []
      const total = res.data.totalNum || 0
      list.forEach(item => {
        item.apiCreateTime = item.apiCreateTime ? moment(+item.apiCreateTime).format('YYYY-MM-DD HH:mm') : ''
        item.apiGmtTime = item.apiGmtTime ? moment(+item.apiGmtTime).format('YYYY-MM-DD HH:mm') : ''
        const statusMap = { '-1': '删除', '0': '待发布', '1': '已发布', '2': '审核中', '3': '禁用' }
        item.apiStatus = statusMap[item.apiStatus] || item.apiStatus
        const flagMap = { 1: '自定义SQL', 2: '注册API', 3: '标签API' }
        item.apiFlag = flagMap[item.apiFlag] || item.apiFlag
      })
      dataRef.value = list
      paginationReactive.itemCount = total
      resolve({ list, total })
    })
  })
}

const fetchApiCategories = async () => {
  try {
    const res = await apiAxios.get(utils.getUrl('interface/getApiTreeFloder'))
    if (res.data.data?.[0]?.children) {
      apiCategories.value = res.data.data[0].children.map(item => ({ id: item.id, name: item.titleName }))
    }
  } catch (e) { }
}

const handlePageChange = (page, pageSize) => {
  paginationReactive.page = page
  paginationReactive.pageSize = pageSize
  // 清空apiId，恢复正常查询
  query(page, pageSize)
}

const handleCategoryChange = (id) => {
  activeCategory.value = id
  paginationReactive.apiTreeId = id
  // 清空apiId，恢复正常查询
  handlePageChange(1, paginationReactive.pageSize)
}

const handleFilterChange = () => {
  // 清空apiId，恢复正常查询
  handlePageChange(1, paginationReactive.pageSize)
}
const handleCurrentChange = (item) => { }

const showApplyDialog = (api) => {
  currentApi.value = api
  applyForm.value = { 
    applicant: '', 
    reasonForApplication: '', 
    expiryDate: '',
    objNum: api.apiId,
    objName: api.apiName,
    releaseState: 2,
    approvalStatus: 2,
    approvalType: 7
  }
  applyDialogVisible.value = true
}

// 处理从home页面传递过来的参数
const handleIncomingParams = () => {
  // 从路由state中获取参数
  const state = history.state
  if (state) {
    targetApiId.value = state.apiId || null
  }
}

const submitApply = () => {
  applyFormRef.value.validate(async ok => {
    if (!ok) {
      message.error('请填写完整信息')
      return
    }
      await insertApproval(applyForm.value)
      window.$message.success('提交成功')
      applyDialogVisible.value = false
      handlePageChange(paginationReactive.page, paginationReactive.pageSize)
  })
}

const handleClose = () => {
  applyFormRef.value?.resetFields()
  applyDialogVisible.value = false
}

const play = (row) => router.push({ name: 'api-detail', state: { apiId: row.apiId }, query: { back: true } })
const getMethodTagType = m => ({ GET: 'success', POST: 'primary', PUT: 'warning', DELETE: 'danger' }[m] || 'info')
const getStatusTagType = s => ({ '已发布': 'success', '待发布': 'warning', '禁用': 'danger' }[s] || 'info')

onMounted(() => {
  fetchApiCategories()
  // 处理从home页面传递过来的参数
  handleIncomingParams()
  handlePageChange(1, 30)
})
</script>

<style scoped>
/* 最外层：只做弹性，不影响 NaiveUI 滚动 */
.api-page-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

/* 🔥 真正固定：搜索框 STICKY，永远不滚走 */
.api-search-sticky {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 20px;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 40px;
}

.search-header {
  flex: 0 0 auto;
  max-width: 400px;
}

.api-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
}

.api-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 700px;
  flex-shrink: 0;
  margin-left: 65px;
}

.search-input {
  flex: 1;
  height: 38px;
  padding: 0 14px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  outline: none;
  font-size: 14px;
}

.search-input:focus {
  border-color: #165dff;
}

.search-btn {
  height: 38px;
  padding: 0 18px;
  background: #165dff;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  min-width: 80px;
}

.search-btn :deep(.n-icon) {
  font-size: 14px;
  width: 14px;
  height: 14px;
}

/* 主体左右布局 */
.api-body-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 左侧分类容器 */
.api-sidebar {
  width: 260px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  padding: 24px 20px;
  overflow-y: auto;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  margin-bottom: 16px;
  margin-left: 16px;
}

/* 标题样式 */
.tree-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tree-title i {
  color: #165dff;
  font-size: 16px;
}

/* 分类项 */
.tree-item {
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  color: #4b5563;
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.tree-item:hover {
  background: #f9fafb;
  color: #165dff;
}

.tree-item.active {
  background: rgba(22, 93, 255, 0.1);
  color: #165dff;
  font-weight: 500;
  border-left: 3px solid #165dff;
}

/* 筛选分组 */
.filter-group {
  margin-top: 28px;
}

.filter-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: #4b5563;
  padding: 8px 0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.filter-item:hover {
  color: #165dff;
}


/* 自定义复选框 */
.filter-item input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  outline: none;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.filter-item input[type="checkbox"]:checked {
  background: #165dff;
  border-color: #165dff;
}

.filter-item input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.filter-item input[type="checkbox"]:hover {
  border-color: #165dff;
}

/* 滚动条美化 */
.api-sidebar::-webkit-scrollbar {
  width: 6px;
}

.api-sidebar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.api-sidebar::-webkit-scrollbar-track {
  background: #f9fafb;
}

/* 右侧容器：弹性 + 内部滚动 */
.api-right-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
}

/* 🔥 唯一滚动区域：API 列表 */
.api-list-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty-tip {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  background: #fff;
  border-radius: 8px;
}

/* API 卡片 */
.api-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #e5e6eb;
  cursor: pointer;
  transition: all 0.2s;
}

.api-card:hover {
  border-color: #165dff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.api-name {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.api-icon {
  width: 18px;
  height: 18px;
  color: #666;
}

.card-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.btn-view {
  background: #f5f7fa;
  color: #333;
}

.btn-apply {
  background: #165dff;
  color: #fff;
}

.api-path {
  background: #f7f8fa;
  padding: 10px 12px;
  border-radius: 6px;
  color: #4e5969;
  font-size: 13px;
  margin-bottom: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.api-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.method-tag,
.status-tag {
  transform: scale(0.85);
  transform-origin: left center;
}

.info-text {
  font-size: 13px;
  color: #666;
}

.api-desc {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 12px;
}

.api-footer {
  font-size: 12px;
  color: #909399;
}

/* 🔥 分页条：永远贴底，不滚动 */
.api-pagination-bar {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background: #f5f7fa;
  border-top: 1px solid #e5e6eb;
  flex-shrink: 0;
}
</style>