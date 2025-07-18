<template>
  <CrudForm :width="'calc(100% - ' + (280+12) + 'px)'">
    <template v-slot:tree>
      <crudTree
          addButton
          @add-event="showAddRef=!showAddRef"
          :tree-folder="treeFolder"
          :folder-data="treeFolder"
          :show-spin="showSpin"
          :menuIcon="menuIcon"
          :nodeProps="nodeProps"
          :renderSuffix="renderSuffix"
          v-model:showUpdateRef="showUpdateRef"
          v-model:showAddRef="showAddRef"
          v-model:updateFormValue="updateFormValue"
          v-model:addFormValue="addFormValue"
          v-model:selectedMenu="selectedMenu"
          @update-menu="updateMenu"
          @create-menu="createMenu"
      />
    </template>
    <template v-slot:header>
      <CrudHeader
          title="模型列表"
          addButton updateButton deleteButton
          :disableUpdate="!currentRow"
          :disableDelete="false"
          @add-event="addMetadata" @update-event="editMetadata" @delete-event="delConfirm"
      />
    </template>
    <template v-slot:condition>
      <el-form inline>
        <el-form-item label="模型名称">
          <el-input type="text" style="width: 180px" clearable v-model="paginationReactive.chineseName"/>
        </el-form-item>
        <el-form-item label="包含数据元名称">
          <el-input type="text" style="width: 180px" clearable v-model="paginationReactive.dataElementName"/>
        </el-form-item>
        <el-form-item label="时间" class="el-line-height">
          <NDatePicker
              size='small'
              type='datetimerange'
              clearable
              v-model:value="createDate"
              @update:value="handleDate"
          />
        </el-form-item>
      </el-form>
    </template>
    <template v-slot:query>
      <el-button color="#0099CB" class="cue-crud__header-query" type="primary" size="default"
                 :icon="Search" @click="handlePageChange(1, paginationReactive.pageSize)" >查询
      </el-button>
    </template>
    <template v-slot:table>
      <CrudTable
          :tableData="tableData"
          :columnData="columns"
          :loadingRef="loadingRef"
          @current-change="handleCurrentChange"
      />
    </template>
    <template v-slot:tab>
      <el-radio-group v-model="paginationReactive.tableType" @change="tableTypeChange">
        <el-radio-button label="贴源表" value=1 />
        <el-radio-button label="维度表" value=2 />
        <el-radio-button label="事实表" value=3 />
        <el-radio-button label="汇总表" value=4 />
      </el-radio-group>
    </template>
    <template v-slot:page>
      <CrudPage
          :paginationReactive="paginationReactive"
          @page-change="handlePageChange"
      />
    </template>
  </CrudForm>
  <el-dialog :before-close="metaDialogVisible" v-model="active" append-to-body class="model-form-wrapper">
    <template #header> {{ indexFormValue.opperate }} </template>
    <n-form
        :size="'small'"
        :model='indexFormValue'
        label-placement="left"
        require-mark-placement="left"
        :label-width="90"
        ref="formRef"
        :rules="rules"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="24" label="模型目录:" path="treeId">
          <n-tree-select
            v-model:value="indexFormValue.treeId"
            :options="treeFolder"
            key-field="id"
            label-field="titleName"
            children-field="children"
            placeholder="选择目标指标目录"
            :render-prefix="menuIcon"
        />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="中文名称:" path="chineseName">
          <n-input v-model:value="indexFormValue.chineseName"/>
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="英文名称:" path="englishName">
          <n-input v-model:value="indexFormValue.englishName" :disabled="ifUpdate"/>
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="模型类型:" path="tableType">
          <n-select v-model:value="indexFormValue.tableType" :options="tableTypeOptions"/>
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注:" path="remarks">
          <n-input type="textarea" v-model:value="indexFormValue.remarks"/>
        </n-form-item-gi>
      </n-grid>
    </n-form>
    <template #footer>
      <n-button color="#0099CB" type="primary" size="small" @click="handleCreateModel">确定</n-button>
    </template>
  </el-dialog>
</template>

<script setup>
import {ref, reactive, onMounted, h} from 'vue'
import { useRouter } from 'vue-router'
import {BoxPlotOutlined} from '@vicons/antd'
import {
  NButton,
  useMessage,
  NIcon,
  NPopover, NGrid
} from 'naive-ui'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import CrudTree from "@/components/cue/crud-tree.vue";
import CrudTable from "@/components/cue/crud-table.vue";
import {ElButton, ElMessageBox} from "element-plus";
import CrudForm from "@/components/cue/crud-form.vue";
import CrudHeader from "@/components/cue/crud-header.vue";
import CrudPage from "@/components/cue/crud-page.vue";
import {PencilAlt, TrashAlt} from "@vicons/fa";
import utils from "@/utils";
import {
  queryModelTreeFolder,
  queryModelList,
  createModelTreeFolder,
  updateModelTreeFolder,
  deleteModelTreeFolder,
  updateModel,
  createModel,
  deleteModel,
  modelTableExists,
  modelTableCreate,
  queryModelColumn, queryModelByName, queryModelDataType
} from "@/service/modules/data-standard";
import {Search} from "@element-plus/icons-vue";

hljs.registerLanguage('javascript', javascript)

const formRef = ref(null)
const loadingRef = ref(false)
const showSpin = ref(false)
const active = ref(false)
const dataType = ref(0)
const treeFolder = ref([])
const showAddRef = ref(false)
const currentRow = ref()
const ifDisableDelete = ref(true)
const ifDisableUpdate = ref(true)
const ifUpdate = ref(false)
const operaOffSpan = ref(0)
const indexFormValue = ref({})
const startTime = ref(0)
const showUpdateRef = ref(false)
const updateFormValue = ref({})
const selectedMenu = ref(1)
const addFormValue = ref({ titleName: '' })
const router = useRouter()
const tableData = ref([])
const createDate = ref(null)
const modelTableData = ref([])


const paginationReactive = reactive({
  page: 1,
  pageCount: 1,
  pageSize: 10,
  chineseName: '',
  dataElementName: '',
  tableType: 1,
  startTime: '',
  endTime: '',
  apiTreeId: 1,
  itemCount: 0
})


const taskData = ref({
  createSql: ''
})
const rules = ref({
  chineseName: {
    required: true,
    message: '请输入名称',
    trigger: 'blur'
  },
  englishName: [
    {
      required: true,
      message: '请输入名称',
      trigger: 'blur'
    }
  ],
  tableType: {
    required: true,
    message: '请选择类型',
    trigger: 'blur'
  }
})

const message = useMessage()

const columns =  [
  {
    label: '中文名称',
    prop: 'chineseName'
  },
  {
    label: '英文名称',
    prop: 'englishName',
    disabled: ifUpdate.value
  },
  {
    label: '归属库',
    prop: 'treeName'
  },
  {
    label: '创建人',
    prop: 'creator'
  },
  {
    label: '添加日期',
    prop: 'createTime',
  },
  {
    label: '更新日期',
    prop: 'updateTime'
  },
  {
    label: '操作',
    prop: 'actions',
    width: 132,
    slots: (row) => {
      return [h(
          ElButton,
          {
            class: 'el-button--text',
            size: 'small',
            onClick: () => editDetail(row)
          },
          { default: ()=> '编辑' }
      ),
        h(
            ElButton,
            {
              class: 'el-button--text',
              size: 'small',
              onClick: () => handleCreateTable(row)
            },
            { default: ()=> '生成物理表' }
        )]
    }
  }
]

const tableTypeOptions = [
  {label: '贴源表', value: '1'},
  {label: '维度表', value: '2'},
  {label: '事实表', value: '3'},
  {label: '汇总表', value: '4'},
]

const tableTypeChange = async () => {
  loadingRef.value = true
  paginationReactive.page = 1
  await query(
      paginationReactive.chineseName,
      paginationReactive.page,
      paginationReactive.pageSize,
      paginationReactive.startTime,
      paginationReactive.endTime,
      paginationReactive.tableType,
      paginationReactive.apiTreeId,
      paginationReactive.dataElementName
  )
  loadingRef.value = false

}

const handleCreateModel = () => {
  formRef.value.validate(async (errors) => {
    if (!errors) {
      let params = {...indexFormValue.value, tableType: paginationReactive.tableType}
      indexFormValue.value.opperate === '新增' ? await createModel(params) : await updateModel(params)
      message.info('成功')
      metaDialogVisible()
      await query(
          paginationReactive.chineseName,
          paginationReactive.page,
          paginationReactive.pageSize,
          paginationReactive.startTime,
          paginationReactive.endTime,
          paginationReactive.tableType,
          paginationReactive.apiTreeId,
          paginationReactive.dataElementName
      )
    } else {
      message.error('验证失败，请填写完整信息')
    }
  })
}

const editDetail = (row) => {
  router.push({
        name: 'model-detail',
        state: {tableName: row.englishName + ' (' + row.chineseName + ')', modelId: row.id, englishName: row.englishName},
        query: {back: true}
      }
  )
}

const handleCreateTable = async (row) => {
  let params = {
    chineseName: '',
    startTime: '',
    endTime: '',
    pageNum: 1,
    pageSize: 4096,
    modelId: row.id
  }
  const data = await queryModelColumn(params)

  modelTableData.value = data.totalList
  taskData.value.createSql = generateCreateTableSQL(modelTableData.value, row.englishName)

  let tableName = {
    sqlStr: row.englishName
  }
  let tableDDL = {
    sqlStr: taskData.value.createSql
  }
  await modelTableExists(tableName)
  await modelTableCreate(tableDDL)
  message.info('创建成功')
}

const handleDate = () => {
  if(!!createDate.value) {
    paginationReactive.startTime = utils.formatTimestamp(createDate.value[0])
    paginationReactive.endTime = utils.formatTimestamp(createDate.value[1])
  } else {
    paginationReactive.startTime = paginationReactive.endTime = ''
  }
}

async function query(
    chineseName,
    pageNum,
    pageSize,
    startTime,
    endTime,
    tableType,
    apiTreeId = 1,
    dataElementName
) {
  const params = {
    chineseName: chineseName,
    pageNum: pageNum,
    pageSize: pageSize,
    startTime: startTime,
    endTime: endTime,
    tableType: tableType,
    apiTreeId: apiTreeId,
    dataElementName: dataElementName
  }
  const data = await queryModelList(params)
  tableData.value = data.totalList
  paginationReactive.itemCount = data.total
}

async function getTreeFolder ()  {
  showSpin.value = true
  treeFolder.value = await queryModelTreeFolder({})
  showSpin.value = false
}

async function queryDataType() {
  const data = await queryModelDataType()
  dataType.value = data.dataWareType || 0
  if (dataType.value === 12) {
    typeOptions.value = [
      {label: 'VARCHAR', value: 'VARCHAR'},
      {label: 'INT', value: 'INT'},
      {label: 'DOUBLE', value: 'DOUBLE'},
      {label: 'DECIMAL', value: 'DECIMAL'},
      {label: 'TIMESTAMP', value: 'TIMESTAMP'},
      {label: 'CHAR', value: 'CHAR'},
      {label: 'CLOB', value: 'CLOB'}
    ]
  } else if (dataType.value === 2) {
    typeOptions.value = [
      {label: 'STRING', value: 'STRING'},
      {label: 'DECIMAL', value: 'DECIMAL'}
    ]
  }
}

function generateCreateTableSQL(tableData, tableName) {
  let sql = dataType.value === 0 || dataType.value === 2 ? `CREATE TABLE IF NOT EXISTS ${tableName} (\n` : `CREATE TABLE ${tableName} (\n`;

  tableData.forEach(field => {
    sql += `  ${field.englishName} ${field.dataType}`;

    if ( !!field.fieldLength && !!field.fieldAccuracy) {
      sql += `(${field.fieldLength}, ${field.fieldAccuracy})`;
    }
    // 处理需要长度的类型
    else if (!!field.fieldLength) {
      sql += `(${field.fieldLength})`;
    }

    // 添加注释
    if(dataType.value === 0) sql += ` COMMENT '${field.chineseName}'`;
    sql += ',\n';
  });

  // 移除最后一个逗号和换行符
  sql = sql.slice(0, -2) + '\n';

  dataType.value === 0 || dataType.value === 2 ? sql += `)` : sql += `);`;

  return sql;
}

function menuIcon({ option }) {
  switch (option.type) {
    case 1 : return  h('svg', {
      class: 'icon',
      viewBox: '0 0 1024 1024',
      version: '1.1',
      xmlns: 'http://www.w3.org/2000/svg',
      width: '16',
      height: '16',
    }, [
      h('path', {
        d: 'M0 101.888C0 76.288 17.042286 59.245714 42.642286 59.245714h349.915428c17.042286 0 34.084571 17.042286 42.642286 34.157715l16.457143 51.2H972.8c25.6 0 42.642286 17.042286 42.642286 42.642285v733.842286c8.557714 25.6-8.484571 42.715429-34.084572 42.715429H42.642286c-25.6 0-42.642286-17.115429-42.642286-42.715429v-819.2z',
        fill: '#FFA000',
      }),
      h('path', {
        d: 'M904.557714 912.603429H119.442286c-25.6 0-42.642286-17.115429-42.642286-42.715429v-614.4c0-25.6 17.042286-42.642286 42.642286-42.642286h793.6c25.6 0 42.715429 17.042286 42.715428 42.642286v614.4c0 17.115429-25.6 42.715429-51.2 42.715429',
        fill: '#FFFFFF',
      }),
      h('path', {
        d: 'M981.357714 963.803429H42.642286c-25.6 0-42.642286-17.115429-42.642286-42.715429V340.845714c0-25.6 17.042286-42.642286 42.642286-42.642285H972.8c34.157714-8.557714 51.2 17.042286 51.2 42.642285v580.242286c0 25.6-17.042286 42.715429-42.642286 42.715429',
        fill: '#FFCA28',
      }),
      h('path', {
        d: 'M366.957714 631.003429H119.442286c-8.484571 0-25.6-8.557714-25.6-25.6 0-17.115429 8.557714-25.6 25.6-25.6h247.515428c8.484571 0 25.6 8.484571 25.6 25.6-8.557714 17.042286-17.115429 25.6-25.6 25.6m0-153.6H119.442286c-8.484571 0-25.6-8.557714-25.6-25.6 0-17.115429 8.557714-25.6 25.6-25.6h247.515428c8.484571 0 25.6 8.484571 25.6 25.6 0 17.042286-17.115429 25.6-25.6 25.6',
        fill: '#FFFFFF',
      }),
    ])
    case 2 : return h(NIcon, {color: '#0099CB'}, { default: () => h(BoxPlotOutlined) })
  }
}
function nodeProps ({option}) {
  return {
    onClick() {
      paginationReactive.apiTreeId = option.id
      selectedMenu.value = option.id
      handlePageChange(1, paginationReactive.pageSize)
    },
    onContextmenu (e)  {
      e.preventDefault()
    }
  };
}
function renderSuffix({ option }) {
  if (option.id === selectedMenu.value) {
    return h(
        NPopover,
        {trigger: "hover", placement: "bottom", style: {padding: 0,width: '100px'}},
        {
          trigger: () =>
              h(
                  NButton,
                  { text: true, type: "primary", color: "#000", style:{padding: '5px'} },
                  { default: () => "┄" }
              ),
          default: () =>
              h('div', [
                h('div', h(NButton, { onClick: () => updateTree(option.id, option.parentId), quaternary: true, style: {width: '100px', 'font-size': '12px', 'justify-content': 'left'}},{icon: () => h(NIcon,{ text: true ,size: '12'}, {default: () => h(PencilAlt)} ),default: () =>"修改"} )),
                h('div', h(NButton, { onClick: () => delTreeConfirm(option.id, option.titleName), disabled: !!option.children, quaternary: true, style: {width: '100px', 'font-size': '12px', 'justify-content': 'left'}},{icon: () => h(NIcon,{ text: true ,size: '12'}, {default: () => h(TrashAlt)} ),default: () =>"删除"} ))
              ])
        }
    )
  } else {
    return h('div', {class: "tree_count" }, { default: () => option.children?.length || 0  } )
  }
}

function metaDialogVisible () {
  active.value = false
  formRef.value?.restoreValidation()
  Object.keys(indexFormValue.value).forEach(key => {
    indexFormValue.value[key] = ''; // 将表单的所有响应式属性设置为空字符串
  });
}

function handleSelect (key, option) {
  if(option.key !== '删除') {

    showAddRef.value = true
  }
}
async function handlePageChange(currentPage, pageSize) {
  if (!loadingRef.value) {
    loadingRef.value = true
    paginationReactive.page = currentPage
    paginationReactive.pageSize = pageSize
    await query(
        paginationReactive.chineseName,
        paginationReactive.page,
        paginationReactive.pageSize,
        paginationReactive.startTime,
        paginationReactive.endTime,
        paginationReactive.tableType,
        paginationReactive.apiTreeId,
        paginationReactive.dataElementName
    )
    loadingRef.value = false
  }
}

  const delTreeConfirm = (id, titleName) => {
    ElMessageBox.confirm(
        '您将删除' + titleName + '，是否继续？',
        '提示',
        {
          cancelButtonText: '取消',
          confirmButtonText: '确定',
        }
    )
        .then(() => {
          delMenu(id)
        })
        .catch(() => {
        })
  }

  function updateTree(id, parentId) {
    showUpdateRef.value = true
    updateFormValue.value.id = id
    updateFormValue.value.parentId = parentId
  }

  const delConfirm = () => {
    ElMessageBox.confirm(
        '您将删除' + currentRow.value.chineseName + '，是否继续？',
        '提示',
        {
          cancelButtonText: '取消',
          confirmButtonText: '确定',
        }
    )
        .then(() => {
          deleteApi(currentRow.value)
        })
        .catch(() => {
        })
  }

  async function delMenu(id) {
    let params = {
      id: id,
    }
    await deleteModelTreeFolder(params)
    await getTreeFolder()
  }

async function deleteApi(row) {
  let delPar = {
    id: row.id
  }
  await deleteModel(delPar)
  message.info('删除成功')
  await query(
      paginationReactive.chineseName,
      paginationReactive.page,
      paginationReactive.pageSize,
      paginationReactive.startTime,
      paginationReactive.endTime,
      paginationReactive.tableType,
      paginationReactive.apiTreeId,
      paginationReactive.dataElementName
  )
}

  async function updateMenu(ruleFormRef) {
    let params = {
      id: updateFormValue.value.id,
      titleName: updateFormValue.value.titleName
    }
    await updateModelTreeFolder(params)
    showUpdateRef.value = false
    await getTreeFolder()
  }

  async function createMenu() {
    let params = {
      projectCode: window.webConfig.VITE_APP_PROD_PROJECT_ID,
      parentId: selectedMenu.value,
      titleName: addFormValue.value.titleName,
      type: 1
    }
    await createModelTreeFolder(params)
    showAddRef.value = false
    await getTreeFolder()
  }

  function handleCurrentChange(val) {
    currentRow.value = val
    if (currentRow.value && currentRow.value.apiStatus !== '已发布') {
      ifDisableUpdate.value = false
      ifDisableDelete.value = currentRow.value.addFlag !== 2;
    } else {
      ifDisableDelete.value = true
      ifDisableUpdate.value = true
    }
  }

  function addMetadata() {
    ifUpdate.value = false
    operaOffSpan.value = 0
    indexFormValue.value = {}
    indexFormValue.value.treeId = paginationReactive.apiTreeId
    indexFormValue.value.opperate = '新增'
    rules.value.englishName[1] = {
      async validator(validator, value) {
        let param = {
          englishName: value
        }
        await queryModelByName(param)
      },
      trigger: 'blur'
    }
    active.value = true
  }

  function editMetadata() {
    ifUpdate.value = true
    indexFormValue.value = { ...currentRow.value }
    indexFormValue.value.treeId = Number(currentRow.value.treeId)
    indexFormValue.value.opperate = '编辑'
    rules.value.englishName[1] = {}
    active.value = true
  }


  onMounted(() => {
    getTreeFolder()
    handlePageChange(1, 30)
    queryDataType()
  })
</script>

<style lang="scss" scoped>

.el-line-height {
  :deep(.el-form-item__content) {
    line-height: 28px;
  }
}

</style>
