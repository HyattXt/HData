<template>
  <CrudForm :width="'calc(100% - ' + (280 + 12) + 'px)'">
    <template v-slot:tree>
      <crudTree
        addButton
        @add-event="showAddRef = !showAddRef"
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
        @create-menu="createMenu" />
    </template>
    <template v-slot:header>
      <CrudHeader
        title="模型列表"
        addButton
        updateButton
        deleteButton
        :disableUpdate="!currentRow"
        :disableDelete="false"
        @add-event="addMetadata"
        @update-event="editMetadata"
        @delete-event="delConfirm">
        <template v-slot:button-group>
          <n-button tertiary size="small" @click="showImportModal = true" style="margin-right: 8px;">导入</n-button>
          <n-dropdown
            trigger="hover"
            size="small"
            :options="exportDropdownOptions"
            @select="handleExportSelect"
            style="margin-left: 12px">
            <n-button tertiary size="small" :disabled="selectedRows.length === 0">导出</n-button>
          </n-dropdown>
        </template>
      </CrudHeader>
    </template>
    <template v-slot:condition>
      <el-form inline>
        <el-form-item label="模型名称">
          <el-input type="text" style="width: 180px" clearable v-model="paginationReactive.chineseName" />
        </el-form-item>
        <el-form-item label="字段名称">
          <el-input type="text" style="width: 180px" clearable v-model="paginationReactive.dataElementName" />
        </el-form-item>
        <el-form-item label="时间" class="el-line-height">
          <NDatePicker
            size="small"
            type="datetimerange"
            clearable
            v-model:value="createDate"
            @update:value="handleDate" />
        </el-form-item>
      </el-form>
    </template>
    <template v-slot:query>
      <el-button
        color="#0099CB"
        class="cue-crud__header-query"
        type="primary"
        size="default"
        :icon="Search"
        @click="handlePageChange(1, paginationReactive.pageSize)">
        查询
      </el-button>
    </template>
    <template v-slot:table>
      <CrudTable
        :tableData="tableData"
        :columnData="columns"
        :loadingRef="loadingRef"
        @current-change="handleCurrentChange"
        multiple
        @selection-change="handleSelectionChange" />
    </template>
    <template v-slot:tab>
      <el-radio-group v-model="paginationReactive.tableType" @change="tableTypeChange">
        <el-radio-button label="贴源表" value="1" />
        <el-radio-button label="维度表" value="2" />
        <el-radio-button label="事实表" value="3" />
        <el-radio-button label="汇总表" value="4" />
      </el-radio-group>
    </template>
    <template v-slot:page>
      <CrudPage :paginationReactive="paginationReactive" @page-change="handlePageChange" />
    </template>
  </CrudForm>
  <el-dialog :before-close="metaDialogVisible" v-model="active" append-to-body class="model-form-wrapper">
    <template #header>{{ indexFormValue.opperate }}</template>
    <n-form
      :size="'small'"
      :model="indexFormValue"
      label-placement="left"
      require-mark-placement="left"
      :label-width="90"
      ref="formRef"
      :rules="rules">
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="24" label="模型目录:" path="treeId">
          <n-tree-select
            v-model:value="indexFormValue.treeId"
            :options="treeFolder"
            key-field="id"
            label-field="titleName"
            children-field="children"
            placeholder="选择目标指标目录"
            :render-prefix="menuIcon" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="中文名称:" path="chineseName">
          <n-input v-model:value="indexFormValue.chineseName" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="英文名称:" path="englishName">
          <n-input v-model:value="indexFormValue.englishName" :disabled="ifUpdate" />
        </n-form-item-gi>
        <n-form-item-gi :span="12" label="模型类型:" path="tableType">
          <n-select v-model:value="indexFormValue.tableType" :options="tableTypeOptions" />
        </n-form-item-gi>
        <n-form-item-gi :span="24" label="备注:" path="remarks">
          <n-input type="textarea" v-model:value="indexFormValue.remarks" />
        </n-form-item-gi>
      </n-grid>
    </n-form>
    <template #footer>
      <n-button color="#0099CB" type="primary" size="small" @click="handleCreateModel">确定</n-button>
    </template>
  </el-dialog>
  <el-dialog v-model="showImportModal" title="导入模型" width="600px" append-to-body>
    <div class="import-modal-content">
      <div class="template-download">
        <n-button type="primary" @click="downloadTemplate" block>
          <n-icon size="16"><DownloadOutlined /></n-icon>
          <span style="margin-left: 8px">下载模板</span>
        </n-button>
        <p class="template-tip">请先下载模板，填写数据后再上传</p>
      </div>

      <div class="upload-area" @click="triggerFileInput" @drop.prevent="handleDrop" @dragover.prevent>
        <input ref="fileInputRef" type="file" accept=".xlsx,.xls" style="display: none" @change="handleFileSelect" />
        <div v-if="!selectedFile" class="upload-placeholder">
          <n-icon size="48" color="#999"><CloudUploadOutlined /></n-icon>
          <p>拖拽文件到此处，或点击浏览</p>
          <p class="upload-hint">支持 .xlsx, .xls 格式</p>
        </div>
        <div v-else class="file-info">
          <n-icon size="24" color="#0099CB"><FileExcelOutlined /></n-icon>
          <div class="file-details">
            <p class="file-name">{{ selectedFile.name }}</p>
            <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
          <n-button text @click.stop="clearFile">
            <n-icon><CloseOutlined /></n-icon>
          </n-button>
        </div>
      </div>
    </div>
    <template #footer>
      <n-button @click="closeImportModal">取消</n-button>
      <n-button
        type="primary"
        :disabled="!selectedFile"
        @click="handleImport"
        :loading="importing"
        style="margin-left: 12px">
        确定导入
      </n-button>
    </template>
  </el-dialog>
  <el-config-provider :locale="zhCn">
  <el-dialog
      v-model="appliedModelDialogVisible"
      width="1200px"
      title="模型表明细"
  >
    <el-table
        :data="appliedModelTableData"
        border
        style="width: 100%"
        empty-text="暂无数据"
    >
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column v-for="col in appliedModelColumns" :key="col.prop" :prop="col.prop" :label="col.label" :width="col.width" show-overflow-tooltip />
    </el-table>
    <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
      <el-pagination
          v-model:current-page="appliedModelPagination.page"
          v-model:page-size="appliedModelPagination.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="appliedModelPagination.total"
          layout="total, sizes, prev, pager, next"
          :prev-text="'上一页'"
          :next-text="'下一页'"
          :locale="{ total: '共 {total} 条', pagesize: '条/页' }"
          @size-change="handleAppliedModelPageChange"
          @current-change="handleAppliedModelPageChange"
      />
    </div>
  </el-dialog>
  </el-config-provider>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, h, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { BoxPlotOutlined } from '@vicons/antd'
  import { NButton, useMessage, NIcon, NPopover, NGrid, NDropdown } from 'naive-ui'
  import hljs from 'highlight.js/lib/core'
  import javascript from 'highlight.js/lib/languages/javascript'
  import CrudTree from '@/components/cue/crud-tree.vue'
  import CrudTable from '@/components/cue/crud-table.vue'
  import { ElButton, ElMessageBox } from 'element-plus'
  import CrudForm from '@/components/cue/crud-form.vue'
  import CrudHeader from '@/components/cue/crud-header.vue'
  import CrudPage from '@/components/cue/crud-page.vue'
  import { PencilAlt, TrashAlt } from '@vicons/fa'
  import { DownloadOutlined, CloudUploadOutlined, CloseOutlined } from '@vicons/material'
  import { FileExcelOutlined } from '@vicons/antd'
  import utils from '@/utils'
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
    queryModelColumn,
    queryModelByName,
    queryModelDataType,
    importModel,
    exportDdl,
    batchDeleteModel,
    exportLedger,
    exportModel,
    queryAppliedModelList,
  } from '@/service/modules/data-standard'
  import { Search } from '@element-plus/icons-vue'

  hljs.registerLanguage('javascript', javascript)

  const formRef = ref(null)
  const loadingRef = ref(false)
  const showSpin = ref(false)
  const active = ref(false)
  const dataType = ref(0)
  const treeFolder = ref([])
  const showAddRef = ref(false)
  const currentRow = ref()
  const selectedRows = ref([])
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
  const showImportModal = ref(false)
  const selectedFile = ref(null)
  const fileInputRef = ref(null)
  const importing = ref(false)

  const appliedModelDialogVisible = ref(false)
  const appliedModelTableData = ref([])
  const appliedModelPagination = reactive({
    currentmodelId: 0,
    page: 1,
    pageSize: 10,
    total: 0,
  })

  const appliedModelColumns = [
    { label: '模型ID', prop: 'modelId', width: 80 },
    { label: '模型中文名', prop: 'modelChineseName' },
    { label: '模型英文名', prop: 'modelEnglishName' },
    { label: '数据元ID', prop: 'dataElementId', width: 90 },
    { label: '数据元中文名', prop: 'dataElementChineseName' },
    { label: '数据元英文名', prop: 'dataElementEnglishName' },
    { label: '字段ID', prop: 'fieldId', width: 80 },
    { label: '字段中文名', prop: 'fieldChineseName' },
    { label: '字段英文名', prop: 'fieldEnglishName' },
    { label: '字段数据类型', prop: 'fieldDataType', width: 120 },
    { label: '分类名称', prop: 'categoryName' },
  ]

  const handleShowAppliedModel = async (row) => {
    appliedModelPagination.currentmodelId = row.id
    appliedModelPagination.page = 1
    await loadAppliedModelList()
    appliedModelDialogVisible.value = true
  }

  const loadAppliedModelList = async () => {
    const params = {
      modelId: appliedModelPagination.currentmodelId,
      pageNum: appliedModelPagination.page,
      pageSize: appliedModelPagination.pageSize,
    }
    const data = await queryAppliedModelList(params)
    appliedModelTableData.value = data.totalList || []
    appliedModelPagination.total = data.total || 0
  }

  const handleAppliedModelPageChange = async (currentPage, pageSize) => {
    appliedModelPagination.page = currentPage
    appliedModelPagination.pageSize = pageSize
    await loadAppliedModelList()
  }

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
    itemCount: 0,
  })

  const taskData = ref({
    createSql: '',
  })
  const rules = ref({
    chineseName: {
      required: true,
      message: '请输入名称',
      trigger: 'blur',
    },
    englishName: [
      {
        required: true,
        message: '请输入名称',
        trigger: 'blur',
      },
    ],
    tableType: {
      required: true,
      message: '请选择类型',
      trigger: 'blur',
    },
  })

  const message = useMessage()

  const columns = [
    {
      label: '中文名称',
      prop: 'chineseName',
    },
    {
      label: '英文名称',
      prop: 'englishName',
      disabled: ifUpdate.value,
    },
    {
      label: '归属库',
      prop: 'treeName',
    },
    {
      label: '创建人',
      prop: 'creator',
    },
    {
      label: '添加日期',
      prop: 'createTime',
    },
    {
      label: '更新日期',
      prop: 'updateTime',
    },
    {
      label: '字段总数',
      prop: 'fieldCount',
      width: 100,
    },
    {
      label: '落标明细',
      prop: 'landedFieldCount',
      width: 120,
      slots: (row) => {
        return h(
          ElButton,
          {
            text: true,
            type: 'primary',
            size: 'small',
            onClick: () => handleShowAppliedModel(row),
          },
          { default: () => row.landedFieldCount || 0 }
        )
      },
    },
    {
      label: '已落标字段数',
      prop: 'landedFieldCount',
      width: 120,
    },
    {
      label: '落标率',
      prop: 'landedRate',
      width: 100,
      slots: (row) => {
        const rate = row.landedRate
        if (rate === null || rate === undefined || rate === '') return '-'
        const num = Number(rate)
        if (isNaN(num)) return rate
        return (num).toFixed(2) + '%'
      },
    },
    {
      label: '操作',
      prop: 'actions',
      width: 132,
      slots: (row) => {
        return [
          h(
            ElButton,
            {
              class: 'el-button--text',
              size: 'small',
              onClick: () => editDetail(row),
            },
            { default: () => '编辑' },
          ),
          h(
            ElButton,
            {
              class: 'el-button--text',
              size: 'small',
              onClick: () => handleCreateTable(row),
            },
            { default: () => '生成物理表' },
          ),
        ]
      },
    },
  ]

  const tableTypeOptions = [
    { label: '贴源表', value: '1' },
    { label: '维度表', value: '2' },
    { label: '事实表', value: '3' },
    { label: '汇总表', value: '4' },
  ]

  const exportDropdownOptions = computed(() => {
    const disabled = selectedRows.value.length === 0
    return [
      { label: '导出台账', key: 'model', disabled },
      { label: '导出建表语句', key: 'ddl', disabled },
      { label: '落标检测报告', key: 'ledger', disabled },
    ]
  })

  const handleExportSelect = (key) => {
    if (key === 'model') handleExportModel()
    if (key === 'ddl') handleExportDdl()
    if (key === 'ledger') handleExportLedger()
  }

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
      paginationReactive.dataElementName,
    )
    loadingRef.value = false
  }

  const handleCreateModel = () => {
    formRef.value.validate(async (errors) => {
      if (!errors) {
        let params = { ...indexFormValue.value, tableType: paginationReactive.tableType }
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
          paginationReactive.dataElementName,
        )
      } else {
        message.error('验证失败，请填写完整信息')
      }
    })
  }

  const editDetail = (row) => {
    router.push({
      name: 'model-detail',
      state: {
        tableName: row.englishName + ' (' + row.chineseName + ')',
        modelId: row.id,
        englishName: row.englishName,
      },
      query: { back: true },
    })
  }

  const handleCreateTable = async (row) => {
    let params = {
      chineseName: '',
      startTime: '',
      endTime: '',
      pageNum: 1,
      pageSize: 4096,
      modelId: row.id,
    }
    const data = await queryModelColumn(params)

    modelTableData.value = data.totalList
    taskData.value.createSql = generateCreateTableSQL(modelTableData.value, row.englishName)

    let tableName = {
      sqlStr: row.englishName,
    }
    let tableDDL = {
      sqlStr: taskData.value.createSql,
    }
    await modelTableExists(tableName)
    await modelTableCreate(tableDDL)
    message.info('创建成功')
  }

  const handleDate = () => {
    if (!!createDate.value) {
      paginationReactive.startTime = utils.formatTimestamp(createDate.value[0])
      paginationReactive.endTime = utils.formatTimestamp(createDate.value[1])
    } else {
      paginationReactive.startTime = paginationReactive.endTime = ''
    }
  }

  async function query(chineseName, pageNum, pageSize, startTime, endTime, tableType, apiTreeId = 1, dataElementName) {
    const params = {
      chineseName: chineseName,
      pageNum: pageNum,
      pageSize: pageSize,
      startTime: startTime,
      endTime: endTime,
      tableType: tableType,
      apiTreeId: apiTreeId,
      dataElementName: dataElementName,
    }
    const data = await queryModelList(params)
    tableData.value = data.totalList
    paginationReactive.itemCount = data.total
  }

  async function getTreeFolder() {
    showSpin.value = true
    treeFolder.value = await queryModelTreeFolder({})
    showSpin.value = false
  }

  async function queryDataType() {
    const data = await queryModelDataType()
    dataType.value = data.dataWareType || 0
    if (dataType.value === 12) {
      typeOptions.value = [
        { label: 'VARCHAR', value: 'VARCHAR' },
        { label: 'INT', value: 'INT' },
        { label: 'DOUBLE', value: 'DOUBLE' },
        { label: 'DECIMAL', value: 'DECIMAL' },
        { label: 'TIMESTAMP', value: 'TIMESTAMP' },
        { label: 'CHAR', value: 'CHAR' },
        { label: 'CLOB', value: 'CLOB' },
      ]
    } else if (dataType.value === 2) {
      typeOptions.value = [
        { label: 'STRING', value: 'STRING' },
        { label: 'DECIMAL', value: 'DECIMAL' },
      ]
    }
  }

  function generateCreateTableSQL(tableData, tableName) {
    let sql =
      dataType.value === 0 || dataType.value === 2
        ? `CREATE TABLE IF NOT EXISTS ${tableName} (\n`
        : `CREATE TABLE ${tableName} (\n`

    tableData.forEach((field) => {
      sql += `  ${field.englishName} ${field.dataType}`

      if (!!field.fieldLength && !!field.fieldAccuracy) {
        sql += `(${field.fieldLength}, ${field.fieldAccuracy})`
      }
      // 处理需要长度的类型
      else if (!!field.fieldLength) {
        sql += `(${field.fieldLength})`
      }

      // 添加注释
      if (dataType.value === 0) sql += ` COMMENT '${field.chineseName}'`
      sql += ',\n'
    })

    // 移除最后一个逗号和换行符
    sql = sql.slice(0, -2) + '\n'

    dataType.value === 0 || dataType.value === 2 ? (sql += `)`) : (sql += `);`)

    return sql
  }

  function menuIcon({ option }) {
    switch (option.type) {
      case 1:
        return h(
          'svg',
          {
            class: 'icon',
            viewBox: '0 0 1024 1024',
            version: '1.1',
            xmlns: 'http://www.w3.org/2000/svg',
            width: '16',
            height: '16',
          },
          [
            h('path', {
              d: 'M0 101.888C0 76.288 17.042286 59.245714 42.642286 59.245714h349.915428c17.042286 0 34.084571 17.042286 42.642286 34.157715l16.457143 51.2H972.8c25.6 0 42.642286 17.042286 42.642286 42.642285v733.842286c8.557714 25.6-8.484571 42.715429-34.084572 42.715429H42.642286c-25.6 0-42.642286-17.115429-42.642286-42.715429v-819.2z',
              fill: '#FFA000',
            }),
            h('path', {
              d: 'M904.557714 912.603429H119.442286c-25.6 0-42.642286-17.115429-42.642286-42.715429v-614.4c0-25.6 17.042286-42.642286 42.642286-42.642286h793.6c25.6 0 42.715429 17.042286 42.715428 42.642286v614.4c0 17.115429-25.6 42.715429-51.2 42.715429',
              fill: '#FFFFFF',
            }),
            h('path', {
              d: 'M981.357714 963.803429H42.642286c-25.6 0-42.642286-17.115429-42.642286-42.715429V340.845714c0-25.6 17.042286-42.642285 42.642286-42.642285H972.8c34.157714-8.557714 51.2 17.042286 51.2 42.642285v580.242286c0 25.6-17.042286 42.715429-42.642286 42.715429',
              fill: '#FFCA28',
            }),
            h('path', {
              d: 'M366.957714 631.003429H119.442286c-8.484571 0-25.6-8.557714-25.6-25.6 0-17.115429 8.557714-25.6 25.6-25.6h247.515428c8.484571 0 25.6 8.484571 25.6 25.6-8.557714 17.042286-17.115429 25.6-25.6 25.6m0-153.6H119.442286c-8.484571 0-25.6-8.557714-25.6-25.6 0-17.115429 8.557714-25.6 25.6-25.6h247.515428c8.484571 0 25.6 8.484571 25.6 25.6 0 17.042286-17.115429 25.6-25.6 25.6',
              fill: '#FFFFFF',
            }),
          ],
        )
      case 2:
        return h(NIcon, { color: '#0099CB' }, { default: () => h(BoxPlotOutlined) })
    }
  }
  function nodeProps({ option }) {
    return {
      onClick() {
        paginationReactive.apiTreeId = option.id
        selectedMenu.value = option.id
        handlePageChange(1, paginationReactive.pageSize)
      },
      onContextmenu(e) {
        e.preventDefault()
      },
    }
  }
  function renderSuffix({ option }) {
    if (option.id === selectedMenu.value) {
      return h(
        NPopover,
        { trigger: 'hover', placement: 'bottom', style: { padding: 0, width: '100px' } },
        {
          trigger: () =>
            h(
              NButton,
              { text: true, type: 'primary', color: '#000', style: { padding: '5px' } },
              { default: () => '┄' },
            ),
          default: () =>
            h('div', [
              h(
                'div',
                h(
                  NButton,
                  {
                    onClick: () => updateTree(option.id, option.parentId),
                    quaternary: true,
                    style: { width: '100px', 'font-size': '12px', 'justify-content': 'left' },
                  },
                  {
                    icon: () => h(NIcon, { text: true, size: '12' }, { default: () => h(PencilAlt) }),
                    default: () => '修改',
                  },
                ),
              ),
              h(
                'div',
                h(
                  NButton,
                  {
                    onClick: () => delTreeConfirm(option.id, option.titleName),
                    disabled: !!option.children,
                    quaternary: true,
                    style: { width: '100px', 'font-size': '12px', 'justify-content': 'left' },
                  },
                  {
                    icon: () => h(NIcon, { text: true, size: '12' }, { default: () => h(TrashAlt) }),
                    default: () => '删除',
                  },
                ),
              ),
            ]),
        },
      )
    } else {
      return h('div', { class: 'tree_count' }, { default: () => option.children?.length || 0 })
    }
  }

  function metaDialogVisible() {
    active.value = false
    formRef.value?.restoreValidation()
    Object.keys(indexFormValue.value).forEach((key) => {
      indexFormValue.value[key] = '' // 将表单的所有响应式属性设置为空字符串
    })
  }

  function handleSelect(key, option) {
    if (option.key !== '删除') {
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
        paginationReactive.dataElementName,
      )
      loadingRef.value = false
    }
  }

  const delTreeConfirm = (id, titleName) => {
    ElMessageBox.confirm('您将删除' + titleName + '，是否继续？', '提示', {
      cancelButtonText: '取消',
      confirmButtonText: '确定',
    })
      .then(() => {
        delMenu(id)
      })
      .catch(() => {})
  }

  function updateTree(id, parentId) {
    showUpdateRef.value = true
    updateFormValue.value.id = id
    updateFormValue.value.parentId = parentId
  }

  const delConfirm = () => {
    if (selectedRows.value.length === 0) {
      message.warning('请先选择要删除的模型')
      return
    }

    const names = selectedRows.value.map((row) => row.chineseName).join('、')
    ElMessageBox.confirm(`您将删除以下模型：${names}，是否继续？`, '提示', {
      cancelButtonText: '取消',
      confirmButtonText: '确定',
    })
      .then(() => {
        deleteApi(selectedRows.value)
      })
      .catch(() => {})
  }

  async function delMenu(id) {
    let params = {
      id: id,
    }
    await deleteModelTreeFolder(params)
    await getTreeFolder()
  }

  async function deleteApi(rows) {
    // 将选中的行ID转换为逗号分隔的字符串
    const idsString = rows.map((row) => row.id).join(',')
    let delPar = {
      ids: idsString,
    }
    await batchDeleteModel(delPar)
    message.info('删除成功')
    // 清空选中状态
    selectedRows.value = []
    await query(
      paginationReactive.chineseName,
      paginationReactive.page,
      paginationReactive.pageSize,
      paginationReactive.startTime,
      paginationReactive.endTime,
      paginationReactive.tableType,
      paginationReactive.apiTreeId,
      paginationReactive.dataElementName,
    )
  }

  async function updateMenu(ruleFormRef) {
    let params = {
      id: updateFormValue.value.id,
      titleName: updateFormValue.value.titleName,
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
      type: 1,
    }
    await createModelTreeFolder(params)
    showAddRef.value = false
    await getTreeFolder()
  }

  function handleCurrentChange(val) {
    currentRow.value = val
    if (currentRow.value && currentRow.value.apiStatus !== '已发布') {
      ifDisableUpdate.value = false
      ifDisableDelete.value = currentRow.value.addFlag !== 2
    } else {
      ifDisableDelete.value = true
      ifDisableUpdate.value = true
    }
  }

  function handleSelectionChange(selection) {
    selectedRows.value = selection
    // 如果有选中行，更新当前行和按钮状态
    if (selection.length > 0) {
      currentRow.value = selection[selection.length - 1]
      ifDisableDelete.value = false
      ifDisableUpdate.value = selection.length === 1 && currentRow.value.apiStatus !== '已发布'
    } else {
      currentRow.value = null
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
          englishName: value,
        }
        await queryModelByName(param)
      },
      trigger: 'blur',
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

  const downloadTemplate = () => {
    const link = document.createElement('a')
    link.href = `${import.meta.env.BASE_URL}templates/model-import-template.xlsx`
    link.download = '模型导入模板.xlsx'
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    message.success('模板下载成功')
  }

  const triggerFileInput = () => {
    fileInputRef.value?.click()
  }

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const handleDrop = (event) => {
    const file = event.dataTransfer.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const validateAndSetFile = (file) => {
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
    const validExtensions = ['.xlsx', '.xls']

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase()

    if (!validExtensions.includes(fileExtension)) {
      message.error('只支持 .xlsx 和 .xls 格式的文件')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      message.error('文件大小不能超过 10MB')
      return
    }

    selectedFile.value = file
    message.success('文件选择成功')
  }

  const clearFile = () => {
    selectedFile.value = null
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const _blobToJson = (blob: Blob): Promise<any> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('解析响应失败'))
      reader.onload = () => {
        try {
          const text = typeof reader.result === 'string' ? reader.result : ''
          resolve(text ? JSON.parse(text) : {})
        } catch (e) {
          reject(new Error('响应格式非法'))
        }
      }
      reader.readAsText(blob, 'utf-8')
    })

  const _isExcelContentType = (ct?: string): boolean => {
    const s = String(ct || '').toLowerCase()
    if (!s) return false
    return (
      s.includes('application/vnd.ms-excel') ||
      s.includes('openxmlformats-officedocument') ||
      s.includes('application/octet-stream') ||
      s.includes('application/x-xls') ||
      s.includes('application/xlsx') ||
      s.includes('spreadsheetml')
    )
  }

  const _extractFilename = (disposition?: string, fallback = '导入失败记录.xlsx'): string => {
    const raw = String(disposition || '').trim()
    if (!raw) return fallback
    try {
      const utf8Match = raw.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
      if (utf8Match && utf8Match[1]) return decodeURIComponent(utf8Match[1])
      const quotedMatch = raw.match(/filename\s*=\s*"([^"]+)"/i)
      if (quotedMatch && quotedMatch[1]) return quotedMatch[1]
      const plainMatch = raw.match(/filename\s*=\s*([^;"'\s]+)/i)
      if (plainMatch && plainMatch[1]) return plainMatch[1]
    } catch { /* ignore */ }
    return fallback
  }

  const _downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => window.URL.revokeObjectURL(url), 0)
  }

  const _isSuccessJson = (payload: any): { ok: boolean; msg?: string } => {
    if (!payload) return { ok: false }
    if (payload.code === 0 || payload.code === 200 || payload.success === true) {
      return { ok: true, msg: payload.msg || payload.message }
    }
    return { ok: false, msg: payload.msg || payload.message }
  }

  const handleImport = async () => {
    if (!selectedFile.value) {
      message.warning('请选择要导入的文件')
      return
    }

    importing.value = true

    try {
      const formData = new FormData()
      formData.append('file', selectedFile.value)

      const wrapped = await importModel(formData)
      const headers = (wrapped && wrapped.headers) || {}
      const blob: Blob | undefined = wrapped && wrapped.data
      const ct: string = headers['content-type'] || headers['Content-Type'] || ''

      if (blob && _isExcelContentType(ct)) {
        const disposition = headers['content-disposition'] || headers['Content-Disposition']
        const filename = _extractFilename(disposition, '导入失败记录.xlsx')
        _downloadBlob(blob, filename)
        const badStatus = wrapped && (typeof wrapped.status === 'number') && wrapped.status >= 400
        message.warning(
          badStatus
            ? `导入失败，失败数据已下载：${filename}`
            : `导入存在失败数据，已下载：${filename}`
        )
        closeImportModal()
        await handlePageChange(1, paginationReactive.pageSize)
        return
      }

      if (blob instanceof Blob && ct.toLowerCase().includes('application/json')) {
        const json = await _blobToJson(blob)
        const { ok, msg } = _isSuccessJson(json)
        if (ok) {
          message.success(msg || '导入成功')
          closeImportModal()
          await handlePageChange(1, paginationReactive.pageSize)
        } else {
          message.error(msg || '导入失败')
        }
        return
      }

      if (blob instanceof Blob) {
        const text = await _blobToJson(blob).catch(() => null)
        if (text && typeof text === 'object') {
          const { ok, msg } = _isSuccessJson(text)
          if (ok) {
            message.success(msg || '导入成功')
            closeImportModal()
            await handlePageChange(1, paginationReactive.pageSize)
          } else {
            message.error(msg || '导入失败')
          }
          return
        }
      }

      message.success('导入成功')
      closeImportModal()
      await handlePageChange(1, paginationReactive.pageSize)
    } catch (error: any) {
      if (error && error.data instanceof Blob && _isExcelContentType(error.headers?.['content-type'])) {
        try {
          const disposition = error.headers?.['content-disposition']
          const filename = _extractFilename(disposition, '导入失败记录.xlsx')
          _downloadBlob(error.data, filename)
          message.warning(`导入失败，失败数据已下载：${filename}`)
          closeImportModal()
          await handlePageChange(1, paginationReactive.pageSize)
          return
        } catch (innerErr) {
          console.error('下载失败Excel异常:', innerErr)
        }
      }
      console.error('导入失败:', error)
      message.error('导入失败: ' + (error?.message || '未知错误'))
    } finally {
      importing.value = false
    }
  }

  const closeImportModal = () => {
    showImportModal.value = false
    clearFile()
  }

  const handleExportDdl = async () => {
    if (selectedRows.value.length === 0) {
      message.warning('请先选择要导出的模型')
      return
    }

    try {
      // 将选中的模型ID转换为字符串数组
      const modelIds = selectedRows.value.map((row) => String(row.id))
      const response = await exportDdl({
        modelIds: modelIds,
      })

      // 创建下载链接
      const blob = new Blob([response], { type: 'application/sql' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // 生成文件名：如果只有一个模型，使用模型名称；多个模型使用时间戳
      let fileName
      if (selectedRows.value.length === 1) {
        fileName = `${selectedRows.value[0].englishName}_${new Date().getTime()}.sql`
      } else {
        fileName = `models_export_${new Date().getTime()}.sql`
      }
      link.download = fileName

      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // 释放 URL 对象
      window.URL.revokeObjectURL(url)

      message.success(`成功导出 ${selectedRows.value.length} 个模型的DDL`)
    } catch (error) {
      console.error('导出失败:', error)
      message.error('导出失败: ' + (error.message || '未知错误'))
    }
  }

  const handleExportLedger = async () => {
    if (selectedRows.value.length === 0) {
      message.warning('请先选择要导出的模型')
      return
    }

    try {
      const modelIds = selectedRows.value.map((row) => Number(row.id))
      const response = await exportLedger({
        modelIds: modelIds,
      })

      const blob = new Blob([response])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const timeStr = new Date().getTime()
      let fileName
      if (selectedRows.value.length === 1) {
        fileName = `${selectedRows.value[0].englishName}_落标检测报告_${timeStr}.xlsx`
      } else {
        fileName = `落标检测报告_${timeStr}.xlsx`
      }
      link.download = fileName

      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(url)

      message.success(`成功导出 ${selectedRows.value.length} 个模型的落标检测报告`)
    } catch (error) {
      console.error('导出落标检测报告失败:', error)
      message.error('导出失败: ' + (error.message || '未知错误'))
    }
  }

  const handleExportModel = async () => {
    if (selectedRows.value.length === 0) {
      message.warning('请先选择要导出的模型')
      return
    }

    try {
      const modelIds = selectedRows.value.map((row) => Number(row.id))
      const response = await exportModel({
        modelIds: modelIds,
      })

      const blob = new Blob([response])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      const timeStr = new Date().getTime()
      let fileName
      if (selectedRows.value.length === 1) {
        fileName = `${selectedRows.value[0].englishName}_台账_${timeStr}.xlsx`
      } else {
        fileName = `模型台账_${timeStr}.xlsx`
      }
      link.download = fileName

      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(url)

      message.success(`成功导出 ${selectedRows.value.length} 个模型的台账`)
    } catch (error) {
      console.error('导出台账失败:', error)
      message.error('导出失败: ' + (error.message || '未知错误'))
    }
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

  .import-modal-content {
    padding: 10px 0;

    .template-download {
      margin-bottom: 20px;

      .template-tip {
        margin-top: 8px;
        font-size: 12px;
        color: #999;
        text-align: center;
      }
    }

    .upload-area {
      border: 2px dashed #d9d9d9;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      min-height: 180px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        border-color: #0099cb;
        background-color: #f0f9ff;
      }

      .upload-placeholder {
        p {
          margin: 10px 0 5px;
          color: #666;

          &.upload-hint {
            font-size: 12px;
            color: #999;
          }
        }
      }

      .file-info {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;

        .file-details {
          flex: 1;
          text-align: left;

          .file-name {
            margin: 0;
            font-weight: 500;
            color: #333;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .file-size {
            margin: 4px 0 0;
            font-size: 12px;
            color: #999;
          }
        }
      }
    }
  }
</style>