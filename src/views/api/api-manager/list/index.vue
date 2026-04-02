<template>
  <CrudForm>
    <template v-slot:header>
      <CrudHeader title="API管理"/>
    </template>
    <template v-slot:condition>
      <n-form :show-feedback="false" :model="paginationReactive" label-placement="left" style="margin-bottom: 3px">
        <n-grid :cols="22" :x-gap="16">
        <n-form-item-gi
            :span="4"
            label="名称"
            path="pagination.apiName"
        >
          <n-input
              clearable
              size="small"
              v-model:value="paginationReactive.apiName"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="2">
          <el-button color="#0099CB" class="cue-crud__header-query" type="primary" size="default" style="margin-bottom: 0"
                     :icon="Search" @click="handlePageChange(1, paginationReactive.pageSize)" >查询
          </el-button>
        </n-form-item-gi>
        </n-grid>
      </n-form>
    </template>
    <template v-slot:table>
      <n-data-table
          ref="table"
          remote
          bordered
          flex-height
          style="height: 100%"
          :single-line="false"
          size="small"
          :columns="columnsRef"
          :data="dataRef"
          :loading="loadingRef"
          :row-key="rowKey"
          class="cue-table"
      />
    </template>
    <template v-slot:page>
      <CrudPage
          :paginationReactive="paginationReactive"
          @page-change="handlePageChange"
      />
    </template>
  </CrudForm>

  <!-- 调试对话框 -->
  <el-dialog v-model="active" :before-close="dialogVisible" :width="600">
    <template #header> API调试: {{ drawTitle }} </template>
    <crudSplit class="titleSplit" title="调试URL" />
    <n-input v-model:value="drawPath" style="margin: 10px 0 20px 0" />
    <!-- query 参数 -->
    <template v-if="queryParamList && queryParamList.length > 0">
      <crudSplit class="titleSplit" title="query参数" />
      <n-table :single-line="false" size="small" style="margin: 10px 0 10px 0">
        <thead>
        <tr>
          <th>参数名称</th>
          <th>参数值</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in queryParamList" :key="index">
          <td>{{ item.key }}</td>
          <n-input v-model:value="item.value" size="large"></n-input>
        </tr>
        </tbody>
      </n-table>
    </template>

    <!-- body 参数 -->
    <template v-if="bodyParamList && bodyParamList.length > 0">
      <crudSplit class="titleSplit" title="body参数" />
      <n-table :single-line="false" size="small" style="margin: 10px 0 10px 0">
        <thead>
        <tr>
          <th>参数名称</th>
          <th>参数值</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in bodyParamList" :key="index">
          <td>{{ item.key }}</td>
          <n-input v-model:value="item.value" size="large"></n-input>
        </tr>
        </tbody>
      </n-table>
    </template>

    <!-- header 参数 -->
    <template v-if="headerParamList && headerParamList.length > 0">
      <crudSplit class="titleSplit" title="header参数" />
      <n-table :single-line="false" size="small" style="margin: 10px 0 10px 0">
        <thead>
        <tr>
          <th>参数名称</th>
          <th>参数值</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in headerParamList" :key="index">
          <td>{{ item.key }}</td>
          <n-input v-model:value="item.value" size="large"></n-input>
        </tr>
        </tbody>
      </n-table>
    </template>

    <crudSplit class="titleSplit" title="响应结果" />
      <div>
        <n-scrollbar style="max-height: 300px; min-height: 100px">
          <n-config-provider :hljs="hljs">
            <n-code :code="code" language="javascript" />
          </n-config-provider>
        </n-scrollbar>
      </div>
    <div v-if="executionTime > 0" style="text-align: right; margin-bottom: 10px; font-size: 14px; color: #666;">
      返回时间：{{ executionTime }}毫秒
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible">取消</el-button>
        <el-button color="#0099CB" @click="debugApi">发送请求</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 令牌弹窗 -->
  <el-dialog
    v-model="tokenDialogVisible"
    title="API令牌"
    width="660px"
  >
    <el-table :data="tokenList" style="width: 100%">
      <el-table-column prop="token" label="令牌" width="300" />
      <el-table-column prop="expire_time" label="过期时间">
        <template #default="scope">
          {{ scope.row.expire_time ? moment(scope.row.expire_time).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </template>
      </el-table-column>
      <el-table-column prop="create_time" label="创建时间">
        <template #default="scope">
          {{ scope.row.create_time ? moment(scope.row.create_time).format('YYYY-MM-DD HH:mm:ss') : '' }}
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="tokenDialogVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, h} from 'vue'
import apiAxios from '@/utils/api-axios'
import {
  ProfileOutlined,
  BugFilled
} from '@vicons/antd'
import { Key20Regular } from '@vicons/fluent'
import {
  NButton,
  NSpace,
  NTooltip,
  NIcon,
  NInput,
  NTable
} from 'naive-ui'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import moment from 'moment'
import CrudHeader from "@/components/cue/crud-header.vue";
import {Search} from "@element-plus/icons-vue";
import CrudForm from "@/components/cue/crud-form.vue";
import router from "@/router";
import CrudPage from "@/components/cue/crud-page.vue";
import crudSplit from "@/components/cue/crud-split.vue";
import utils from "@/utils";
import { useUserStore } from '@/store/user/user'

hljs.registerLanguage('javascript', javascript)

const columns = ( { debug }, { play } ) => {
  return [
    {
      title: '序号',
      key: 'key',
      align: 'center',
      width: 60,
      render: (_, index) => {
        return `${index + 1}`
      }
    },
    {
      title: 'ID',
      key: 'apiId',
      align: 'center',
      width: 250,
    },
    {
      title: '名称',
      key: 'apiName',
      align: 'center'
    },
    {
      title: '方式',
      key: 'apiMethod',
      width: 61,
      align: 'center'
    },
    {
      title: '路径',
      key: 'apiPath',
      align: 'center',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '状态',
      key: 'apiStatus',
      width: 66,
      align: 'center'
    },
    {
      title: 'API类型',
      key: 'apiFlag',
      width: 100,
      align: 'center'
    },
    {
      title: '创建时间',
      key: 'apiCreateTime',
      align: 'center'
    },
    {
      title: '操作',
      key: 'actions',
      align: 'center',
      width: 132,
      render(row) {
        return h(NSpace, {justify: "center"}, {
          default: () => [
            h(NTooltip, {}, {trigger: () =>
                  h(NButton, {circle: true, type: 'info', size: 'tiny', class: 'edit', onClick: () => {debug(row)}}, {icon: () =>
                        h(NIcon, null, { default: () => h(BugFilled) })} 
                  ), default: () => '调试'}
            ),
            h(NTooltip, {}, {trigger: () =>
                  h(NButton, {circle: true, type: 'info', size: 'tiny', class: 'edit', onClick: () => {play(row)}}, {icon: () =>
                        h(NIcon, null, { default: () => h(ProfileOutlined) })} 
                  ), default: () => '查看'}
            ),
            h(NTooltip, {}, {trigger: () =>
                  h(NButton, {circle: true, type: 'info', size: 'tiny', class: 'edit', onClick: () => {showTokenDialog(row)}}, {icon: () =>
                        h(NIcon, null, { default: () => h(Key20Regular) })} 
                  ), default: () => '令牌'}
            )
          ]
        })
      }
    }
  ]
}
const TableData = reactive({
  apiList: [],
  totalNum: 0
})

const rowKey = (rowData) => {
  return rowData.apiId
}

const stateOptions = [
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
const statusOptions = [
  {
    label: '待发布',
    value: '0'
  },
  {
    label: '发布',
    value: '1'
  }
]

const getApiTreeUrl = utils.getUrl('interface/getApiTreeFloder')
const dataRef = ref([])
const loadingRef = ref(false)
const folderData = ref([])
const userStore = useUserStore()

// 调试相关变量
const active = ref(false)
const code = ref('')
const drawTitle = ref('')
const drawPath = ref('')
const drawId = ref('')
const drawScript = ref('')
const drawMethod = ref('')
const queryParamList = ref([])
const bodyParamList = ref([])
const headerParamList = ref([])
const startTime = ref(0)
const executionTime = ref(0)

// 令牌弹窗相关
const tokenDialogVisible = ref(false)
const tokenList = ref([])

const menuIcon = () => {
  return h('svg', {
    class: 'icon',
    viewBox: '0 0 1260 1024',
    xmlns: 'http://www.w3.org/2000/svg',
    width: '19.688',
    height: '16'
  }, [
    h('path', {
      d: 'M1171.561 157.538H601.797L570.814 61.44A88.222 88.222 0 00486.794 0H88.747A88.747 88.747 0 000 88.747v846.506A88.747 88.747 0 0088.747 1024H1171.56a88.747 88.747 0 0088.747-88.747V246.285a88.747 88.747 0 00-88.747-88.747zm-1082.814 0V88.747h398.047l22.055 68.791z',
      fill: '#0099CB'
    })
  ])
}

function handlePageChange(currentPage, pageSize) {
  if (!loadingRef.value) {
    loadingRef.value = true
    paginationReactive.page = currentPage
    paginationReactive.pageSize = pageSize
    query(
        paginationReactive.page,
        paginationReactive.pageSize,
        paginationReactive.apiName,
        paginationReactive.apiFlag,
        paginationReactive.apiStatus,
        paginationReactive.apiPath,
        paginationReactive.apiTreeId
    ).then((data) => {
      dataRef.value = data.data
      dataRef.value.forEach((item) => {
        let date = new Date(parseInt(item.apiCreateTime))
        item.apiCreateTime = moment(date).format('YYYY-MM-DD HH:mm:ss')
      })
      dataRef.value.forEach((item) => {
        if (item.apiStatus === '-1') {
          item.apiStatus = '删除'
        }
        if (item.apiStatus === '0') {
          item.apiStatus = '待发布'
        }
        if (item.apiStatus === '1') {
          item.apiStatus = '发布'
        }
        if (item.apiStatus === '2') {
          item.apiStatus = '审核中'
        }
        if (item.apiStatus === '3') {
          item.apiStatus = '禁用'
        }
      })
      dataRef.value.forEach((item) => {
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
      paginationReactive.page = currentPage
      paginationReactive.pageCount = data.pageCount
      paginationReactive.itemCount = data.total
      loadingRef.value = false
    })
  }
}

function query(page, pageSize = 30, apiName = '', apiFlag = '', apiStatus = '', apiPath = '', apiTreeId = '') {
  return new Promise((resolve) => {
    const url = utils.getUrl('interface/getMyList')
    const params = {
      pageNum: page, 'pageSize': pageSize, 'apiName': apiName,
      order: 'api_create_time', 'sort': 'desc'
    }
    let sessionId = userStore.getSessionId
    apiAxios.post(url, params, {
      headers: {
        'sessionid': sessionId
      }
    }).then(function (response) {
      TableData.apiList = response.data.data
      TableData.totalNum = response.data.totalNum
      const copiedData = TableData.apiList.map((v) => v)
      const total = TableData.totalNum
      const pageCount = Math.ceil(total / pageSize)
      resolve({
        pageCount,
        data: copiedData,
        total
      })
    }).catch(function (error) {
      console.log(error)
    })
  })
}

// 调试相关函数
const activate = (row) => {
  code.value = ''
  active.value = true
  drawTitle.value = row.apiName
  drawPath.value = row.apiPath
  drawId.value = row.apiId
  drawScript.value = row.apiScript
  drawMethod.value = row.apiMethod
  bodyParamList.value = row.bodyArray.map(item => {
    return {
      key: item.paramTitle.trim(),
      value: item.demoValue,
      type: item.paramType
    }
  })
  headerParamList.value = row.headersArray
    .filter(item => item.paramTitle.trim() !== 'HDataApiToken')
    .map(item => {
      return {
        key: item.paramTitle.trim(),
        value: item.demoValue,
        type: item.paramType
      };
    });
  queryParamList.value = row.queryArray.map(item => {
    return {
      key: item.paramTitle.trim(),
      value: item.demoValue,
      type: item.paramType
    }
  })
}

// 显示令牌弹窗
const showTokenDialog = (row) => {
  tokenDialogVisible.value = true
  getTokens(row.apiId)
}

// 获取令牌列表
const getTokens = async (apiId) => {
  try {
    const url = utils.getUrl('interface/getMyToken')
    const params = {
      apiId: apiId
    }
    let sessionId = userStore.getSessionId
    
    const response = await apiAxios.post(url, params, {
      headers: {
        'sessionid': sessionId
      }
    })
    
    // 处理返回数据
    if (response.data && response.data.data) {
      tokenList.value = response.data.data
    } else {
      tokenList.value = []
    }
  } catch (error) {
    console.error('获取令牌失败:', error)
    tokenList.value = []
  }
}

function buildParamArray(paramList) {
  const result = [];
  for (let i = 0; i < paramList.length; i++) {
    const item = paramList[i];
    let value = item.value;

    if (item.type === '数组') {
      try {
        value = JSON.parse(item.value.replace(/\s+/g, ''));
      } catch (e) {
        console.warn('Invalid JSON in array param:', item.key, item.value);
        value = item.value; // 或设为 []
      }
    } else if (item.type === '数字' || item.type === 'number') {
      value = Number(item.value);
      if (isNaN(value)) value = 0;
    }

    // 每个参数作为一个独立对象推入数组
    const paramObj = {};
    paramObj[item.key] = value;
    result.push(paramObj);
  }
  return result;
}

function debugApi() {
  let url = drawPath.value
  startTime.value = Date.now()
  if (url.indexOf('proxy') > 0) {
    let regUrl = utils.getUrl(url.replace('/HData/DevApi/proxy', 'debug/proxy'))
    const requestBody = {
      bodyArray: buildParamArray(bodyParamList.value || []),
      headersArray: buildParamArray(headerParamList.value || []),
      queryArray: buildParamArray(queryParamList.value || []),
      httpMethod: drawMethod.value
    }
      apiAxios.post(regUrl, requestBody)
        .then(function (response) {
          code.value = JSON.stringify(response.data, null, 2)
          executionTime.value = Date.now() - startTime.value
          updateApiTimeConsuming(drawId.value, executionTime.value)
        })
        .catch(function (error) {
          code.value = JSON.stringify(error, null, 2)
          console.log(error)
        })
  } else {
      let sqlUrl = utils.getUrl('interface-ui/api/perform?id=' + drawId.value)
      let requestBody = {}
      let list = bodyParamList.value || []
      for (let i = 0; i < list.length; i++) {
        requestBody[list[i].key] = list[i].type === '数组'
          ? JSON.parse(list[i].value.replace(/\s+/g, ''))
          : (list[i].type === '数字' || list[i].type === 'number')
            ? Number(list[i].value)
            : list[i].value;
      }
      let sqlBody = {
        id: drawId.value,
        select: 'POST',
        apiPath: drawPath.value,
        codeType: 'SQL',
        codeValue: drawScript.value,
        requestBody: requestBody,
        optionInfo: {
          resultStructure: true,
          responseFormat:
            '{\n "success" : "@resultStatus",\n "message" : "@resultMessage",\n "code" : "@resultCode",\n "lifeCycleTime": "@timeLifeCycle",\n "executionTime": "@timeExecution",\n "value" : "@resultData"\n}'
        }
      }
      apiAxios.post(sqlUrl, sqlBody)
        .then(function (response) {
          code.value = JSON.stringify(response.data, null, 2)
          executionTime.value = response.data.executionTime
          updateApiTimeConsuming(drawId.value, executionTime.value)
        })
        .catch(function (error) {
          code.value = JSON.stringify(error, null, 2)
          console.log(error)
        })
    }
}

function updateApiTimeConsuming(apiId, timeConsuming) {
  const url = utils.getUrl('interface/updateApiTimeConsuming')
  const params = {
    apiId: apiId,
    timeConsuming: timeConsuming
  }
  apiAxios.post(url, params).then(function (response) {
    console.log(response.data)
  }).catch(function (error) {
    console.log(error)
  })
}

function dialogVisible() {
  active.value = false
  executionTime.value = 0
}

const columnsRef = ref(
    columns(
              {
          debug(row) {
            activate(row)
          }
        },
        {
          play(row) {
            router.push({
                  name: 'api-detail',
                  state: {apiId: row.apiId, backName: 'api-manager'},
                  query: {back: true}
                }
            )
            }
        }
    )
)
const paginationReactive = reactive({
  page: 1,
  pageCount: 1,
  pageSize: 30,
  apiName: '',
  apiFlag: null,
  apiStatus: null,
  apiPath: '',
  apiTreeId: '',
  itemCount: 0

})
function getTreeFolder ()  {
  apiAxios.get(getApiTreeUrl).then((res) => {
    folderData.value = res.data.data
  })
}
onMounted(() => {
  getTreeFolder()
  handlePageChange(1, 30)
})
</script>

<style lang="scss" scoped>

.n-base-select-menu .n-base-select-option {
  font-size: 12px;
}
</style>
