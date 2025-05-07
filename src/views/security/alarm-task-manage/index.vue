<template>
  <el-config-provider :locale="zhCn">
    <div class="cue-drag-layout flex-row">
      <div class="cue-drag-layout__mainview" :style="{ width: '100%' }">
        <div class="cue-crud cue-crud-v2">
          <CrudHead
              title="告警任务管理"
              addButton deleteButton updateButton
              :disable-update="ifDisableUpdate"
              :disableDelete="ifDisableDelete"
              @add-event="addMetadata"
              @update-event="editMetadata"
              @delete-event="delConfirm"
          />
          <div class="crud-v2-condition">
            <div class="cue-crud__header-condition">
              <div class="cue-crud__header-content">
                <el-form inline>
                  <el-form-item label="任务名称">
                    <el-input type="text" style="width: 180px" clearable v-model="paginationReactive.taskName"/>
                  </el-form-item>
                  <el-form-item label="告警类型">
                    <el-select
                      v-model="paginationReactive.alarmType"
                      clearable
                      style="width: 180px"
                      popper-class="form-item-select"
                    >
                      <el-option
                        v-for="item in alarmType"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="告警状态">
                    <el-select
                      v-model="paginationReactive.alarmState"
                      clearable
                      style="width: 180px"
                      popper-class="form-item-select"
                    >
                      <el-option
                        v-for="item in alarmState"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="告警方式">
                    <el-select
                      v-model="paginationReactive.alarmMethod"
                      clearable
                      style="width: 180px"
                      popper-class="form-item-select"
                    >
                      <el-option
                        v-for="item in alarmMethod"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
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
                <el-table v-loading="loadingRef" :data="dataRef" show-overflow-tooltip border resizable highlight-current-row @current-change="handleCurrentChange" height="100%">
                  <el-table-column type="index" fixed label="序号" width="50" align="center"/>
                  <el-table-column prop="alarmInstanceName" label="告警实例名称" align="center"/>
                  <el-table-column prop="taskName" label="任务名称" align="center"/>
                  <el-table-column label="告警方式" width="120" align="center">
                    <template #default="scope">
                      {{ scope.row.alarmMethod === 1 ? '短信' : '一诺' }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="alarmContent" label="告警模板" align="center"/>
                  <el-table-column prop="alarmDescription" label="任务描述" align="center"/>
                  <el-table-column label="状态" width="120" align="center">
                    <template #default="scope">
                      <el-switch
                        v-model="scope.row.alarmState"
                        style="--el-switch-on-color: #0099cb"
                        :active-value="1"
                        :inactive-value="0"
                        @change="handleRelease(scope.row)"
                      >
                      </el-switch>
                    </template>
                  </el-table-column>
                  <el-table-column prop="creationTime" label="创建时间" align="center"/>
                  <el-table-column label="告警类型" width="120" align="center">
                    <template #default="scope">
                      {{ scope.row.alarmType === 1 ? '单人告警' : '群告警' }}
                    </template>
                  </el-table-column>
                  <el-table-column fixed="right" label="操作" width="120" align="center">
                    <template #default="scope">
                      <el-button class="el-button--text" size="small" @click="play(scope.row)">
                        授权
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <div class="cue-crud__body-border-bottom"></div>
          </div>
          <div class="cue-crud__footer">
            <div class="cue-crud__footer-tab"> </div>
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
    <div class="add-dialog">
      <el-dialog v-model="active" width="800px" :before-close="dialogVisible">
        <template #header> 任务新增 </template>
            <el-form
                :model="detailPaginationReactive"
                inline
            >
              <el-form-item label="任务名称">
                <el-input type="text" v-model="detailPaginationReactive.taskName"/>
              </el-form-item>
              <el-form-item label="任务流名称">
                <el-input type="text" v-model="detailPaginationReactive.processName"/>
              </el-form-item>
              <el-button color="#0099CB" type="primary" size="default" style="height: 24px;font-size: 12px;margin-bottom: 8px;"
                         :icon="Search" @click="refreshDetail(1,detailPaginationReactive.pageSize)" >查询
              </el-button>
            </el-form>
            <el-table row-key="taskCode"	ref="dataSetRef" @current-change="handleSelectionChange" :data="detailDataRef" border resizable show-overflow-tooltip highlight-current-row height="100%">
              <el-table-column type="index" fixed label="序号" width="50" align="center"/>
              <el-table-column prop="taskName" label="任务名称" align="center"/>
              <el-table-column prop="taskDescription" label="任务描述" align="center"/>
              <el-table-column prop="taskType" label="任务类型" width="120" align="center"/>
              <el-table-column prop="processName" label="工作流名称" align="center"/>
            </el-table>
                <el-pagination
                    background
                    :default-page-size="10"
                    :page-sizes="[10]"
                    layout="total, sizes, prev, pager, next"
                    :total="detailPaginationReactive.itemCount"
                    @change="handleDetailPageChange"
                    popper-class="page-select"
                    style="justify-content: flex-end;"
                >
                </el-pagination>
        <template #footer>
          <div class="dialog-footer">
            <el-button color="#f1f2f4" @click="dialogVisible">取消</el-button>
            <el-button color="#0099CB" type="primary" :disabled="ifChecked" @click="submitSelect">确定</el-button>
          </div>
        </template>
      </el-dialog>
      <el-dialog v-model="activeAdd" width="800px" append-to-body :before-close="dialogFormVisible">
        <template #header> {{formValues.operate}}{{formValues.taskName}}告警任务 </template>
        <n-form
          :size="'small'"
          :model="formValues"
          label-placement="left"
          require-mark-placement="left"
          :label-width="110"
          ref="ruleFormRef"
          :rules="rules"
        >
        <n-grid :cols="24" :x-gap="24">
          <n-form-item-gi :span="12" label="告警实例名称:" path="alarmInstanceName">
            <n-input v-model:value="formValues.alarmInstanceName" :disabled="ifNameUpdate"/>
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="告警方式:" path="alarmMethod">
            <n-select v-model:value="formValues.alarmMethod" :options="[{label: '短信', value: 1}, {label: '一诺', value: 2}]" clearable />
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="任务描述:" path="alarmDescription">
            <n-input v-model:value="formValues.alarmDescription" :disabled="ifNameUpdate"/>
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="启用状态:" path="alarmState">
            <n-select v-model:value="formValues.alarmState" :options="[{label: '上线', value: 1}, {label: '下线', value: 0}]" />
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="告警类型:" path="alarmType">
            <n-select v-model:value="formValues.alarmType" :options="[{label: '单人告警', value: 1}, {label: '群告警', value: 2}]" />
          </n-form-item-gi>
          <n-form-item-gi :span="12" label="触发条件:" path="taskAlarmStatus">
            <n-select v-model:value="formValues.taskAlarmStatus" :options="[{label: '成功', value: 1}, {label: '失败', value: 2}, {label: '全量', value: 3}]" />
          </n-form-item-gi>
          <n-form-item-gi
            :span="24"
            label="通知内容模板:"
            path="alarmContent"
          >
            <n-input
              ref="inputRef"
              v-model:value="formValues.alarmContent"
              type="textarea"
              placeholder="请输入模板内容"
              :autosize="{ minRows: 5 }"
              @click="updateCursorPosition"
              @keyup="updateCursorPosition"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="24" label="模板变量:">
            <n-space>
              <n-button
                type="info"
                ghost
                v-for="(variable, index) in variables"
                :key="index"
                @click="insertVariable(variable)"
              >
                {{ variable.label }}
              </n-button>
            </n-space>
          </n-form-item-gi>
        </n-grid>
        </n-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button color="#f1f2f4" @click="dialogFormVisible">取消</el-button>
            <el-button color="#0099CB" type="primary" @click="submitFormAdd">确定</el-button>
          </div>
        </template>
      </el-dialog>
      <el-dialog v-model="showModal" width="600px">
        <template #header> 任务授权 </template>
        <CrudSplit title="任务名称：" style="margin-bottom: 10px; font-size: 14px; background: rgba(255,255,255,0)">
          <template v-slot:default>
            <div style="display: flex; align-items: center">
              <div style="font-size: 14px">任务名称：</div>
              <div style="font-size: 16px; margin-left: 10px">{{drawTitle}}</div>
            </div>
          </template>
        </CrudSplit>

        <CrudSplit title="授权用户：" style="margin-top: 10px; font-size: 14px; background: rgba(255,255,255,0)"/>
        <n-form-item :show-label="false" path="user.name">
          <n-transfer
            ref="transfer"
            v-model:value="apiAuthorizer"
            virtual-scroll
            :options="userList"
            source-filterable
            target-filterable
          />
        </n-form-item>
        <template #footer>
          <div class="dialog-footer">
            <el-button color="#0099CB" @click="subAuth">确定</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </el-config-provider>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue'
  import axios from 'axios'
  import { useMessage, NGrid } from 'naive-ui'
  import zhCn from 'element-plus/es/locale/lang/zh-cn'
  import CrudHead from '@/components/cue/crud-header.vue'
  import { Search } from '@element-plus/icons-vue'
  import { ElButton, ElMessageBox } from 'element-plus'
  import utils from '@/utils'
  import CrudSplit from '@/components/cue/crud-split.vue'

  const dataRef = ref([])
  const ruleFormRef = ref()
  const detailDataRef = ref([])
  const dataSetRef = ref()
  const inputRef = ref()
  const cursorPosition = ref(0)
  const addDataSetRef = ref([])
  const ifChecked = ref(true)
  const active = ref(false)
  const activeAdd = ref(false)
  const showModal = ref(false)
  const loadingRef = ref(true)
  const detailLoadingRef = ref(true)
  const message = useMessage()
  const currentRow = ref()
  const userList = ref([])
  const drawTitle = ref('')
  const drawId = ref('')
  const apiAuthorizer = ref([])
  const ifDisableDelete = ref(true)
  const ifDisableUpdate = ref(true)
  const delCatalogDetailUrl = utils.getUrl('Alarm/delete')

  const rules = reactive({
    alarmInstanceName: {
      required: true,
      message: '请输入告警实例名称',
      trigger: 'blur'
    },
    alarmMethod: {
      required: true,
      message: '请输入告警方式',
      trigger: 'blur',
      type: 'number'
    },
    alarmState: {
      required: true,
      message: '请选择启用状态',
      trigger: 'blur',
      type: 'number'
    },
    alarmType: {
      required: true,
      message: '请选择告警类型',
      trigger: 'blur',
      type: 'number'
    },
    taskAlarmStatus: {
      required: true,
      message: '请选择触发条件',
      trigger: 'blur',
      type: 'number'
    },
    alarmContent: {
      required: true,
      message: '请填写模板',
      trigger: 'blur'
    }
  })

  const variables = [
    {
      label: '任务名称',
      value: '{taskName}'
    },
    {
      label: '任务描述',
      value: '{description}'
    },
    {
      label: '任务状态',
      value: '{taskAlarmStatus}'
    },
    {
      label: '运行结束时间',
      value: '{endTime}'
    },
  ]

  const alarmType = [
    {
      label: '单人告警',
      value: '1'
    },
    {
      label: '群告警',
      value: '2'
    }
  ]

  const alarmState = [
    {
      label: '上线',
      value: '1'
    },
    {
      label: '未上线',
      value: '0'
    }
  ]

  const alarmMethod = [
    {
      label: '短信',
      value: '1'
    },
    {
      label: '一诺',
      value: '2'
    }
  ]

  const paginationReactive = reactive({
    page: 1,
    pageSize: 30,
    taskName: '',
    alarmType: '',
    alarmState: '',
    alarmMethod: '',
    itemCount: 0
  })
  const detailPaginationReactive = reactive({
    page: 1,
    pageSize: 10,
    itemCount: 0,
    taskName: '',
    processName: '2'
  })

  const formValues = ref({
    alarmInstanceName: '',
    taskCode: '',
    alarmMethod: '',
    alarmDescription: '',
    alarmState: '',
    alarmType: '',
    taskAlarmStatus: '',
    alarmContent: '',
    operate: ''
  })

  function query(
    page,
    pageSize = 30,
    taskName = '',
    alarmType = '',
    alarmState = '',
    alarmMethod = ''
  ) {
    const url = utils.getUrl('Alarm/getList')
    const params = {
      pageNum: page,
      pageSize: pageSize,
      taskName: taskName,
      alarmType: alarmType,
      alarmState: alarmState,
      alarmMethod: alarmMethod
    }
    loadingRef.value = true
    axios
      .post(url, params)
      .then(function (response) {
        dataRef.value = []
        dataRef.value = response.data.data
        paginationReactive.itemCount = response.data.totalNum
        loadingRef.value = false
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  function detailQuery(page, pageSize = 10, taskName = '', processName = '') {
    const url = utils.getUrl('Alarm/queryTaskInfo')
    const params = {
      taskName: taskName,
      processName: processName,
      pageNum: page,
      pageSize: pageSize
    }
    axios
      .post(url, params)
      .then(function (response) {
        detailDataRef.value = []
        detailDataRef.value = response.data.data
        detailPaginationReactive.itemCount = response.data.totalNum
        detailLoadingRef.value = false
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  function addMetadata() {
    detailPaginationReactive.page = 1
    detailPaginationReactive.taskName = ''
    detailPaginationReactive.processName = ''
    detailQuery(
      detailPaginationReactive.page,
      detailPaginationReactive.pageSize,
      detailPaginationReactive.taskName,
      detailPaginationReactive.processName
    )
    active.value = true
  }
  const delConfirm = () => {
    ElMessageBox.confirm(
      '您将删除' + currentRow.value.taskName + '，是否继续？',
      '提示',
      {
        cancelButtonText: '取消',
        confirmButtonText: '确定'
      }
    )
      .then(() => {
        delMetadata(
          currentRow.value.id,
          currentRow.value.taskName,
          currentRow.value.dataCatalogAddFlag,
          currentRow.value.dataSourceAddFlag
        )
      })
      .catch(() => {})
  }

  function delMetadata(id, taskName, dataCatalogAddFlag, dataSourceAddFlag) {
    let params = {
      id: id,
      taskName: taskName,
      dataCatalogAddFlag: dataCatalogAddFlag,
      dataSourceAddFlag: dataSourceAddFlag
    }
    axios.post(delCatalogDetailUrl, params).then((res) => {
      message.info(res.data.info)
      query(
        paginationReactive.page,
        paginationReactive.pageSize,
        paginationReactive.taskName,
        paginationReactive.alarmType,
        paginationReactive.alarmState,
        paginationReactive.alarmMethod
      )
    })
  }

  function dialogVisible() {
    active.value = false
    ifChecked.value = true
    addDataSetRef.value = {}
  }

  function dialogFormVisible() {
    activeAdd.value = false
    ruleFormRef.value?.restoreValidation()
    formValues.value = {
      alarmInstanceName: '',
      taskCode: '',
      alarmMethod: '',
      alarmDescription: '',
      alarmState: '',
      alarmType: '',
      taskAlarmStatus: '',
      alarmContent: '',
      alarmContentSuccess: '',
      alarmContentFailed: ''
    }
  }

  function submitSelect() {
    formValues.value.taskCode = addDataSetRef.value.taskCode
    formValues.value.taskName = addDataSetRef.value.taskName
    formValues.value.operate = '新增'
    activeAdd.value = true
    active.value = false
  }

  function handleSelectionChange(currentRow) {
    addDataSetRef.value = currentRow
    ifChecked.value = !addDataSetRef.value
  }

  // 更新光标位置
  const updateCursorPosition = (e) => {
    if (inputRef.value) {
      cursorPosition.value = e.srcElement.selectionStart
    }
  }

  // 在光标位置插入变量
  const insertVariable = (variable) => {
    const currentValue = formValues.value.alarmContent
    const beforeCursor = currentValue.substring(0, cursorPosition.value)
    const afterCursor = currentValue.substring(cursorPosition.value)

    formValues.value.alarmContent = beforeCursor + variable.value + afterCursor

  }

  const submitFormAdd = () => {
    ruleFormRef.value.validate(async (errors) => {
      if (!errors) {
        let params = { ...formValues.value }
        let url = ''
        url =
          formValues.value.operate === '新增'
            ? utils.getUrl('Alarm/insert')
            : utils.getUrl('Alarm/update')
        axios
          .post(url, params)
          .then(function (response) {
            message.info(response.data.info)
            dialogFormVisible()
            query(
              paginationReactive.page,
              paginationReactive.pageSize,
              paginationReactive.taskName,
              paginationReactive.alarmType,
              paginationReactive.alarmState,
              paginationReactive.alarmMethod
            )
          })
          .catch(function (error) {
            console.log(error)
          })
      } else {
        message.error('验证失败，请填写完整信息')
      }
    })
  }

  function handleRelease(row) {
    let params = {
      alarmState: row.alarmState,
      id: row.id
    }
    let url = utils.getUrl('Alarm/update')
    axios
      .post(url, params)
      .then(function () {
        query(
          paginationReactive.page,
          paginationReactive.pageSize,
          paginationReactive.taskName,
          paginationReactive.alarmType,
          paginationReactive.alarmState,
          paginationReactive.alarmMethod
        )
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  function editMetadata() {
    formValues.value = { ...currentRow.value }
    activeAdd.value = true
  }

  function handlePageChange(currentPage, pageSize) {
    if (!loadingRef.value) {
      loadingRef.value = true
      paginationReactive.page = currentPage
      paginationReactive.pageSize = pageSize
      query(
        paginationReactive.page,
        paginationReactive.pageSize,
        paginationReactive.taskName,
        paginationReactive.alarmType,
        paginationReactive.alarmState,
        paginationReactive.alarmMethod
      )
    }
  }

  function handleDetailPageChange(currentPage, pageSize) {
    if (!detailLoadingRef.value) {
      detailLoadingRef.value = true
      detailPaginationReactive.page = currentPage
      detailPaginationReactive.pageSize = pageSize
      detailQuery(
        detailPaginationReactive.page,
        detailPaginationReactive.pageSize,
        detailPaginationReactive.taskName,
        detailPaginationReactive.processName
      )
    }
  }

  function refreshDetail(currentPage, pageSize) {
    handleDetailPageChange(currentPage, pageSize)
    dataSetRef.value.clearSelection()
  }

  function play(row) {
    drawTitle.value = row.taskName
    drawId.value = row.id
    queryUser(row.id)
    showModal.value = true
  }

  function queryUser(id) {
    const listUrl = utils.getUrl('Alarm/getUser')
    const authListUrl = utils.getUrl('Alarm/getAuthorizeInfo')
    axios.get(listUrl).then(function (response) {
      userList.value = response.data.data
      userList.value = userList.value.map((item) => {
        let tempList = {}
        tempList.value = item.id
        tempList.label = item.userName
        return tempList
      })
    })
    let authBody = {
      alarmId: id
    }
    axios.post(authListUrl, authBody).then(function (response) {
      let list = response.data.data
      apiAuthorizer.value = list.map((item) => {
        let authList
        authList = item.id
        return authList
      })
    })
  }

  function subAuth() {
    let subUrl = utils.getUrl('Alarm/insertAuthorizeInfo')
    let requestBody = {
      alarmId: drawId.value,
      authorizeId: apiAuthorizer.value
    }
    axios
      .post(subUrl, requestBody)
      .then(function (response) {
        message.info(response.data.info)
        showModal.value = false
        query(
          paginationReactive.page,
          paginationReactive.pageSize,
          paginationReactive.taskName,
          paginationReactive.alarmType,
          paginationReactive.alarmState,
          paginationReactive.alarmMethod
        )
      })
      .catch(function (error) {
        message.info('授权失败,请联系管理员')
        console.log(error)
      })
  }

  function handleCurrentChange(val) {
    currentRow.value = val
    if (currentRow.value && currentRow.value.alarmState === 0) {
      ifDisableUpdate.value = false
      ifDisableDelete.value = false
    } else {
      ifDisableDelete.value = true
      ifDisableUpdate.value = true
    }
  }

  onMounted(() => {
    query(
      paginationReactive.page,
      paginationReactive.pageSize,
      paginationReactive.taskName,
      paginationReactive.alarmType,
      paginationReactive.alarmState,
      paginationReactive.alarmMethod
    )
  })
</script>

<style scoped lang="scss">
  .add-dialog {
    :deep(.el-dialog__body) {
      padding: 12px !important;
    }
  }

  .el-tabs__content {
    height: 420px;
    border: 1px solid #ccc !important;
  }
</style>
