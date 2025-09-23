<template>
  <CrudForm>
    <template v-slot:header>
      <CrudHeader
        title="服务策略"
        addButton
        updateButton
        deleteButton
        :disableUpdate="ifDisableUpdate"
        :disableDelete="ifDisableDelete"
        @add-event="showModal = !showModal"
        @update-event="editMetadata(currentRow)"
        @delete-event="delConfirm"
      />
    </template>
    <template v-slot:condition>
      <el-form inline>
        <el-form-item label="策略类型">
          <el-select
              v-model="paginationReactive.policyType"
              clearable
              style="width: 180px"
              popper-class="form-item-select"
          >
            <el-option
                v-for="item in stateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="策略名称">
          <el-input
            type="text"
            style="width: 180px"
            clearable
            v-model="paginationReactive.policyName"
          />
        </el-form-item>
      </el-form>
    </template>
    <template v-slot:query>
      <el-button
        color="#0099CB"
        class="cue-crud__header-query"
        type="primary"
        size="default"
        @click="handlePageChange(1, paginationReactive.pageSize)"
        >查询
      </el-button>
    </template>
    <template v-slot:table>
      <CrudTable
        :tableData="dataRef"
        :columnData="columns"
        :loadingRef="loadingRef"
        @current-change="handleCurrentChange"
      />
    </template>
    <template v-slot:page>
      <CrudPage
        :paginationReactive="paginationReactive"
        @page-change="handlePageChange"
      />
    </template>
  </CrudForm>
  <el-dialog v-model="active" :before-close="dialogVisible" :width="700">
    <template #header> 绑定服务: {{ drawTitle }} </template>
    <el-config-provider :locale="zhCn">
      <el-form inline>
        <el-form-item label="名称">
          <el-input
              type="text"
              style="width: 140px"
              clearable
              v-model="detailPaginationReactive.apiName"
          />
        </el-form-item>
        <el-form-item label="API类型">
          <el-select
              v-model="detailPaginationReactive.apiFlag"
              clearable
              style="width: 120px"
              popper-class="form-item-select"
          >
            <el-option
                v-for="item in apiStateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="路径">
          <el-input
              type="text"
              style="width: 140px"
              clearable
              v-model="detailPaginationReactive.apiPath"
          />
        </el-form-item>
        <el-button color="#0099CB" type="primary" size="default" style="height: 24px;font-size: 12px;margin-bottom: 8px;"
                   :icon="Search" @click="handleApiPageChange(1,detailPaginationReactive.pageSize)" >查询
        </el-button>
      </el-form>
    <el-table row-key="apiId"	ref="dataSetRef" @selection-change="handleSelectionChange" :data="apiDataRef" border resizable show-overflow-tooltip highlight-current-row height="100%">
      <el-table-column type="selection" reserve-selection width="55" />
      <el-table-column type="index" fixed label="序号" width="50" align="center"/>
      <el-table-column prop="apiId" label="ID" align="center"/>
      <el-table-column prop="apiName" label="API名称" align="center"/>
      <el-table-column prop="apiFlag" label="API类型" width="100" align="center"/>
      <el-table-column prop="apiPath" label="API路径" align="center"/>
    </el-table>
    <el-pagination
        background
        :default-page-size="10"
        :page-sizes="[10]"
        layout="total, sizes, prev, pager, next"
        :total="detailPaginationReactive.itemCount"
        @change="handleApiPageChange"
        popper-class="page-select"
        style="justify-content: flex-end;"
    >
    </el-pagination>
    </el-config-provider>
    <template #footer>
      <div class="dialog-footer">
        <el-button color="#f1f2f4" @click="dialogVisible">取消</el-button>
        <el-button color="#0099CB" type="primary" @click="submitSelect">确定</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="showModal" :width="700">
    <template #header> 策略新增 </template>
    <crudSplit class="titleSplit" title="选择策略类型" />
    <n-data-table
      bordered
      :single-line="false"
      :columns="[
        { type: 'selection', multiple: false },
        { title: '策略类型', key: '策略类型' },
        { title: '描述', key: '描述' }
      ]"
      :data="[
        {
          key: '黑白名单',
          策略类型: '黑白名单',
          描述: '支持黑白名单控制特定用户或IP的访问权限'
        },
/*        {
          key: '熔断',
          策略类型: '熔断',
          描述: '支持服务异常时自动停止请求以保护系统稳定'
        },*/
      ]"
      @update:checked-row-keys="handleCheck"
      :default-checked-row-keys="['黑白名单']"
      style="margin-top: 10px"
    />
    <template #footer>
      <n-button color="#0099CB" type="primary" size="small" @click="createApi">
        确定
      </n-button>
    </template>
  </el-dialog>
</template>

<script setup>
  import { ref, reactive, onMounted, h } from 'vue'
  import { useRouter } from 'vue-router'
  import apiAxios from '@/utils/api-axios'
  import { NButton, useMessage } from 'naive-ui'
  import CrudTable from '@/components/cue/crud-table.vue'
  import { ElButton, ElMessageBox } from 'element-plus'
  import CrudSplit from '@/components/cue/crud-split.vue'
  import CrudForm from '@/components/cue/crud-form.vue'
  import CrudHeader from '@/components/cue/crud-header.vue'
  import CrudPage from '@/components/cue/crud-page.vue'
  import utils from '@/utils'
  import {Search} from "@element-plus/icons-vue";
  import zhCn from "element-plus/es/locale/lang/zh-cn";

  const dataRef = ref([])
  const apiDataRef = ref([])
  const loadingRef = ref(false)
  const apiLoadingRef = ref(false)
  const active = ref(false)
  const dataSetRef = ref()
  const addDataSetRef = ref()
  const drawTitle = ref('')
  const drawId = ref()
  const currentRow = ref()
  const ifDisableDelete = ref(true)
  const ifDisableUpdate = ref(true)
  const showModal = ref(false)
  const checkRow = ref(['黑白名单'])
  const bindingPolicyUrl = utils.getUrl('ServicePolicy/bindingPolicy')
  const queryApiInfoUrl = utils.getUrl('ServicePolicy/queryApiInfoByServicePolicyId')
  const router = useRouter()
  const paginationReactive = reactive({
    page: 1,
    pageCount: 1,
    pageSize: 10,
    policyName: '',
    policyType: '',
    itemCount: 0
  })
  const detailPaginationReactive = reactive({
    page: 1,
    pageCount: 1,
    pageSize: 10,
    apiName: '',
    apiFlag: '',
    apiPath: '',
    itemCount: 0
  })
  const defaultPagination = {
    page: 1,
    pageCount: 1,
    pageSize: 10,
    apiName: '',
    apiPath: '',
    itemCount: 0
  };
  const columns = [
    {
      label: '策略名称',
      prop: 'policyName'
    },
    {
      label: '策略类型',
      prop: 'policyType',
      width: 150,
      slots: (row) => {
        switch (row.policyType) {
          case 1: return h("div",'黑白名单')
        }
      }
    },
    {
      label: '规则',
      prop: 'policyRule',
      slots: (row) => {
        switch (row.policyRule) {
          case 1: return h("div",'黑名单')
          case 2: return h("div",'白名单')
        }
      }
    },
    {
      label: '已绑定IP数',
      prop: 'bindIpNum',
    },
    {
      label: '创建人',
      prop: 'policyName'
    },
    {
      label: '创建时间',
      prop: 'updateTime'
    },
    {
      label: '备注',
      prop: 'policyDescription'
    },
    {
      label: '操作',
      prop: 'actions',
      width: 132,
      slots: (row) => {
        return h(
            ElButton,
            {
              class: 'el-button--text',
              size: 'small',
              onClick: () => activate(row)
            },
            { default: () => '绑定服务' }
        )
      }
    }
  ]

  const TableData = reactive({
    apiList: [],
    totalNum: 0
  })

  const ApiTableData = reactive({
    apiList: [],
    totalNum: 0
  })

  const rules = {
    titleName: {
      required: true,
      message: '请输入名称',
      trigger: 'blur'
    }
  }

  const activate = async (row) => {
    active.value = true
    drawTitle.value = row.policyName
    drawId.value = row.id
    await queryApiInfoByServicePolicyId(row.id)
    await handleApiPageChange(1, 10)
  }
  const message = useMessage()

  const stateOptions = [
    {
      label: '黑白名单',
      value: '1'
    },
/*    {
      label: '熔断',
      value: '2'
    }*/
  ]

  const apiStateOptions = [
    {
      label: '自定义SQL',
      value: '1'
    },
    {
      label: '注册API',
      value: '2'
    },
    {
      label: '标签API',
      value: '3'
    }
  ]

  function query(
      page,
      pageSize = 30,
      policyName = '',
      policyType = ''
  ) {
    return new Promise((resolve) => {
      const url = utils.getUrl('ServicePolicy/getList')
      const params = {
        pageNum: page,
        pageSize: pageSize,
        policyName: policyName,
        policyType: policyType
      }

      apiAxios.post(url, params)
          .then(function (response) {
            TableData.apiList = response.data.data
            TableData.totalNum = response.data.totalNum
            const copiedData = TableData.apiList.map((v) => v)
            const total = TableData.totalNum
            const pageCount = Math.ceil(total / pageSize)
            loadingRef.value = false
            resolve({
              pageCount,
              data: copiedData,
              total
            })
          })
          .catch(function (error) {
            console.log(error)
          })
    })
  }

  function apiQuery(
      page,
      pageSize = 30,
      apiName = '',
      apiFlag = '',
      apiPath = '',
      apiStatus = '',
      policyId = drawId.value
  ) {
    return new Promise((resolve) => {
      const url = utils.getUrl('interface/getNotBindingPolicyList')
      const params = {
        pageNum: page,
        pageSize: pageSize,
        apiName: apiName,
        apiFlag: apiFlag,
        apiStatus: apiStatus,
        apiPath: apiPath,
        servicePolicyId: policyId
      }

      apiAxios.post(url, params)
          .then(function (response) {
            ApiTableData.apiList = response.data.data
            ApiTableData.totalNum = response.data.totalNum
            const copiedData = ApiTableData.apiList.map((v) => v)
            const total = ApiTableData.totalNum
            const pageCount = Math.ceil(total / pageSize)
            apiLoadingRef.value = false
            resolve({
              pageCount,
              data: copiedData,
              total
            })
          })
          .catch(function (error) {
            console.log(error)
          })
    })
  }

  function handlePageChange(currentPage, pageSize) {
    if (!loadingRef.value) {
      loadingRef.value = true
      paginationReactive.page = currentPage
      paginationReactive.pageSize = pageSize
      query(
        paginationReactive.page,
        paginationReactive.pageSize,
        paginationReactive.policyName,
        paginationReactive.policyType,
        paginationReactive.apiTreeId
      ).then((data) => {
        dataRef.value = data.data
        paginationReactive.page = currentPage
        paginationReactive.pageCount = data.pageCount
        paginationReactive.itemCount = data.total
      })
    }
  }

  function handleApiPageChange(currentPage, pageSize) {
    if (!apiLoadingRef.value) {
      apiLoadingRef.value = true
      detailPaginationReactive.page = currentPage
      detailPaginationReactive.pageSize = pageSize
      apiQuery(
          detailPaginationReactive.page,
          detailPaginationReactive.pageSize,
          detailPaginationReactive.apiName,
          detailPaginationReactive.apiFlag,
          detailPaginationReactive.apiPath
      ).then((data) => {
        apiDataRef.value = data.data
        apiDataRef.value.forEach((item) => {
          if (item.apiFlag === 1) {
            item.apiFlag = '自定义SQL'
          }
          if (item.apiFlag === 2) {
            item.apiFlag = '注册API'
          }
          if (item.apiFlag === 3) {
            item.apiFlag = '标签API'
          }
        })
        detailPaginationReactive.page = currentPage
        detailPaginationReactive.pageCount = data.pageCount
        detailPaginationReactive.itemCount = data.total
      })
    }
  }

  function handleSelectionChange() {
    addDataSetRef.value = dataSetRef.value.getSelectionRows()
  }

  function queryApiInfoByServicePolicyId(servicePolicyId) {
    let params = {
      servicePolicyId: servicePolicyId
    }
    apiAxios.post(queryApiInfoUrl, params)
        .then(function (response) {
          if (response.data.data) {
            response.data.data.forEach((row) => {
              dataSetRef.value.toggleRowSelection(row)
            })
          } else {
            dataSetRef.value.clearSelection()
          }
        })
  }

  function submitSelect() {
      let params = {
        apiId: addDataSetRef.value.map(item => item.apiId).join(','),
        servicePolicyId: drawId.value
      }
      apiAxios.post(bindingPolicyUrl,params).then((res) => {
        message.info(res.data.info)
        active.value = false
        Object.assign(detailPaginationReactive, defaultPagination);
        dataSetRef.value.clearSelection()
        handlePageChange(paginationReactive.page, paginationReactive.pageSize)
      }).catch(function (error) {
        message.error(error)
      })
  }

  function createApi() {
    if (checkRow.value[0] === '黑白名单') {
      router.push({ path: '/devops/service/api-strategy/bw-list' })
    }
  }

  function handleCheck(rowKeys) {
    checkRow.value = rowKeys
  }

  const delConfirm = () => {
    ElMessageBox.confirm(
      '您将删除' + currentRow.value.policyName + '，是否继续？',
      '提示',
      {
        cancelButtonText: '取消',
        confirmButtonText: '确定'
      }
    )
      .then(() => {
        deleteApi(currentRow.value)
      })
      .catch(() => {})
  }

  function deleteApi(row) {
    let urlDel = utils.getUrl('ServicePolicy/delete')
    let body ={id: row.id}
    apiAxios.post(urlDel, body)
      .then(function (response) {
        message.info(response.data.info)
        handlePageChange(paginationReactive.page, paginationReactive.pageSize)
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  function dialogVisible() {
    active.value = false
    dataSetRef.value.clearSelection()
    Object.assign(detailPaginationReactive, defaultPagination);
  }

  function handleCurrentChange(val) {
    currentRow.value = val
    if (currentRow.value) {
      ifDisableDelete.value = false
      ifDisableUpdate.value = false
    } else {
      ifDisableDelete.value = true
      ifDisableUpdate.value = true
    }
  }

  function editMetadata(row) {
      router.push({
        path: '/devops/service/api-strategy/bw-list',
        query: { id: row.id }
      })
  }
  
  onMounted(() => {
    handlePageChange(1, 30)
  })
</script>

<style scoped>
  .titleSplit {
    background: white !important;
    font-size: 14px !important;
    padding: 0 !important;
  }

  a {
    text-decoration: none;
  }
</style>
