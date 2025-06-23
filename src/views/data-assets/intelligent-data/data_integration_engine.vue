<template>
  <el-config-provider :locale="zhCn">
    <div class="cue-drag-layout flex-row">
      <div class="cue-drag-layout__mainview" :style="{width: '100%'}">
        <div class="cue-crud cue-crud-v2">
          <CrudHead
              title="数据整合引擎"
              addButton updateButton deleteButton
              :disableUpdate="!currentRow"
              :disableDelete="ifDisableDelete"
              defineButton button-title="导出" @click-event="exportToCSV"
              @add-event="addMetadata" @update-event="editMetadata" @delete-event="delConfirm"
          />
          <div class="crud-v2-condition" >
            <div class="cue-crud__header-condition">
              <div class="cue-crud__header-content">
                <el-form inline>
                  <el-form-item label="数据名称">
                    <el-input type="text" style="width: 180px" clearable v-model="paginationReactive.dataName"/>
                  </el-form-item>
                </el-form>
              </div>
              <el-button color="#0099CB" class="cue-crud__header-query" type="primary" size="default"
                         :icon="Search" @click="handlePageChange(1,paginationReactive.pageSize)" >查询
              </el-button>
            </div>
          </div>
          <div class="cue-crud__body">
            <div class="cue-table">
              <div class="cue-table-container">
                <el-table v-loading="loadingRef" :data="TableData.tableList" border resizable highlight-current-row height="100%" show-overflow-tooltip @current-change="handleCurrentChange">
                  <el-table-column type="index" label="序号" width="50" align="center"/>
                  <el-table-column prop="dataName" label="数据名称" align="center"/>
                  <el-table-column prop="dataFormat" label="数据格式" align="center"/>
                  <el-table-column prop="integratedFormat" label="整合格式" align="center"/>
                  <el-table-column prop="integrationRules" label="整合规则" align="center"/>
                  <el-table-column prop="integratedPath" label="整合后路径" align="center"/>
                </el-table>
              </div>
            </div>
            <div class="cue-crud__body-border-bottom"></div>
          </div>
          <div class="cue-crud__footer">
            <div class="cue-crud__footer-tab">
            </div>
            <div class="cue-crud__footer-pager">
              <el-pagination
                  background
                  :default-page-size="30"
                  :page-sizes="[30, 90, 180, 300]"
                  layout="total, sizes, prev, pager, next"
                  :total="paginationReactive.itemCount"
                  @change="handlePageChange"
                  popper-class="page-select"
              >
              </el-pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog :before-close="metaDialogVisible" v-model="active" append-to-body class="model-form-wrapper">
      <template #header> {{ indexFormValue.opperate }} </template>
        <n-form
            :size="'small'"
            :model='indexFormValue'
            label-placement="left"
            require-mark-placement="left"
            :label-width="130"
            ref="formRef"
            :rules="rules"
        >
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="12" label="数据名称:" path="dataName">
              <n-input v-model:value="indexFormValue.dataName" placeholder="请输入数据名称" :disabled="ifUpdate"/>
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="数据格式:" path="dataFormat">
              <n-input v-model:value="indexFormValue.dataFormat" placeholder="请输入数据格式" :disabled="ifUpdate"/>
            </n-form-item-gi>
          </n-grid>
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="12" label="整合格式:" path="integratedFormat">
              <n-input v-model:value="indexFormValue.integratedFormat" placeholder="请输入整合格式" :disabled="ifUpdate"/>
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="整合规则:" path="integrationRules">
              <n-input v-model:value="indexFormValue.integrationRules" placeholder="请输入整合规则" :disabled="ifUpdate"/>
            </n-form-item-gi>
          </n-grid>
          <n-grid :cols="24" :x-gap="24">
            <n-form-item-gi :span="12" label="整合后路径:" path="integratedPath">
              <n-input v-model:value="indexFormValue.integratedPath" placeholder="请输入整合后路径" :disabled="ifUpdate"/>
            </n-form-item-gi>
          </n-grid>
        </n-form>
        <template #footer>
          <n-button color="#0099CB" type="primary" size="small" :disabled="ifUpdate" @click="createIndex">确定</n-button>
        </template>
    </el-dialog>
  </el-config-provider>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import {
  NButton,
  useMessage,
  NGrid,
} from "naive-ui";
import CrudHead from "@/components/cue/crud-header.vue";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import {Search} from "@element-plus/icons-vue";
import {ElMessageBox} from "element-plus";
import utils from '@/utils'

const TableData = reactive({
  tableList: [],
  totalNum: 0
})
const formRef = ref(null)
const active = ref(false)
const loadingRef = ref(true)
const message = useMessage()
const showDropdownRef = ref(false)
const indexFormValue = ref({})
const operaSpan = ref(0)
const operaOffSpan = ref(0)
const ifUpdate = ref(false)
const currentRow = ref()
const ifDisableDelete = ref(true)
const insertIndexUrl = utils.getUrl('QthDataIntegrationEngine/insert')
const updateIndexUrl = utils.getUrl('QthDataIntegrationEngine/update')
const deleteIndexUrl = utils.getUrl('QthDataIntegrationEngine/delete')

const rules = reactive({
  dataName: {
    required: true,
    message: '请输入内容',
    trigger: 'blur'
  }
})

const paginationReactive = reactive({
  dataName: '',
  dataFormat: '',
  page: 1,
  pageSize: 30,
  integratedFormat: '',
  integrationRules: '',
  integratedPath: '',
  itemCount: 0
})

function query(
    page,
    pageSize = 30,
    dataName,
) {
  const url = utils.getUrl('QthDataIntegrationEngine/getList')
  const params = {
    'pageNum': page,
    'pageSize': pageSize,
    'dataName': dataName,
  }
  loadingRef.value = true
  axios
      .post(url, params)
      .then(function (response) {
        TableData.tableList = response.data.data
        TableData.totalNum = response.data.totalNum
        paginationReactive.itemCount = TableData.totalNum
        loadingRef.value = false
      })
      .catch(function (error) {
        console.log(error)
      })
}

function addMetadata() {
  ifUpdate.value = false
  operaOffSpan.value = 0
  indexFormValue.value = {}
  indexFormValue.value.opperate = '新增'
  operaSpan.value = 0
  active.value = true
}

function editMetadata() {
  indexFormValue.value = { ...currentRow.value }
  indexFormValue.value.opperate = '编辑'
  active.value = true
}

function metaDialogVisible () {
  active.value = false
  formRef.value?.restoreValidation()
  Object.keys(indexFormValue.value).forEach(key => {
    indexFormValue.value[key] = ''; // 将表单的所有响应式属性设置为空字符串
  });
}

const delConfirm = () => {
  ElMessageBox.confirm(
      '您将删除' + currentRow.value.dataName + '，是否继续？',
      '提示',
      {
        cancelButtonText: '取消',
        confirmButtonText: '确定',
      }
  )
      .then(() => {
        deleteIndex(currentRow.value.id)
      })
      .catch(() => {
      })
}

function handleCurrentChange(val) {
  currentRow.value = val
  ifDisableDelete.value = !(currentRow.value);
}

function handlePageChange(currentPage, pageSize) {
  if (!loadingRef.value) {
    loadingRef.value = true
    paginationReactive.page = currentPage
    paginationReactive.pageSize = pageSize
    query(
        paginationReactive.page,
        paginationReactive.pageSize,
        paginationReactive.dataName
    )
  }
}

function createIndex () {
  formRef.value.validate((errors) => {
    if (!errors) {
      let params = indexFormValue.value
      let url = indexFormValue.value.opperate === '新增' ? insertIndexUrl : updateIndexUrl
      axios.post(url, params).then((res) => {
        message.info(res.data.info)
        query(
            paginationReactive.page,
            paginationReactive.pageSize,
            paginationReactive.dataName
        )
      })
      metaDialogVisible()
    } else {
      message.error('验证失败，请填写完整信息')
    }
  })
}

function deleteIndex (id) {
  let params ={
    id: id
  }
  axios.post(deleteIndexUrl, params).then((res) => {
    message.info(res.data.info)
    showDropdownRef.value = false
    query(
        paginationReactive.page,
        paginationReactive.pageSize,
        paginationReactive.dataName
    )
  })
}

function exportToCSV() {
  // 获取表格数据（假设为 tableData）
  const data = TableData.tableList;
  const header = ['序号', '数据名称', '数据格式', '整合格式', '整合规则', '整合后路径']

  // 将数据转换为 CSV 格式字符串
  const csvContent = convertToCSV(data, header);

  // 创建 Blob 对象并触发下载
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'table_data.csv');
  link.click();
  URL.revokeObjectURL(url);
}

function convertToCSV(data, header) {
  const headers = header.join(',') + '\n';
  const rows = data.map(row =>
      Object.values(row).map(val => `"${val}"`).join(',')
  ).join('\n');
  return headers + rows;
}

onMounted(() => {
  query(
      paginationReactive.page,
      paginationReactive.pageSize,
      paginationReactive.dataName
  )
})
</script>

<style scoped lang="scss">

</style>

