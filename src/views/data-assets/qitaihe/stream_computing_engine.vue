<template>
  <el-config-provider :locale="zhCn">
    <div class="cue-drag-layout flex-row">
      <div class="cue-drag-layout__mainview" :style="{width: '100%'}">
        <div class="cue-crud cue-crud-v2">
          <CrudHead
              title="流计算引擎"
              addButton updateButton deleteButton
              :disableUpdate="!currentRow"
              :disableDelete="ifDisableDelete"
              @add-event="addMetadata" @update-event="editMetadata" @delete-event="delConfirm"
          />
          <div class="crud-v2-condition" >
            <div class="cue-crud__header-condition">
              <div class="cue-crud__header-content">
                <el-form inline>
                  <el-form-item label="流计算数据组件">
                    <el-input type="text" style="width: 180px" clearable v-model="paginationReactive.streamComputingDataComponent"/>
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
                  <el-table-column prop="streamComputingDataComponent" label="流计算数据组件" align="center"/>
                  <el-table-column prop="associatedDataName" label="关联数据名称" align="center"/>
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
            <n-form-item-gi :span="12" label="流计算数据组件:" path="streamComputingDataComponent">
              <n-input v-model:value="indexFormValue.streamComputingDataComponent" placeholder="请输入流计算数据组件" :disabled="ifUpdate"/>
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="关联数据名称:" path="associatedDataName">
              <n-input v-model:value="indexFormValue.associatedDataName" placeholder="请输入关联数据名称" :disabled="ifUpdate"/>
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
const insertIndexUrl = utils.getUrl('QthStreamComputingEngine/insert')
const updateIndexUrl = utils.getUrl('QthStreamComputingEngine/update')
const deleteIndexUrl = utils.getUrl('QthStreamComputingEngine/delete')

const rules = reactive({
  streamComputingDataComponent: {
    required: true,
    message: '请输入内容',
    trigger: 'blur'
  }
})

const paginationReactive = reactive({
  streamComputingDataComponent: '',
  associatedDataName: '',
  page: 1,
  pageSize: 30,
  itemCount: 0
})

function query(
    page,
    pageSize = 30,
    streamComputingDataComponent,
) {
  const url = utils.getUrl('QthStreamComputingEngine/getList')
  const params = {
    'pageNum': page,
    'pageSize': pageSize,
    'streamComputingDataComponent': streamComputingDataComponent,
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
      '您将删除' + currentRow.value.streamComputingDataComponent + '，是否继续？',
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
        paginationReactive.streamComputingDataComponent
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
            paginationReactive.streamComputingDataComponent
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
        paginationReactive.streamComputingDataComponent
    )
  })
}

onMounted(() => {
  query(
      paginationReactive.page,
      paginationReactive.pageSize,
      paginationReactive.streamComputingDataComponent
  )
})
</script>

<style scoped lang="scss">

</style>

