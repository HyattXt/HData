<template>
  <div class="n-scrollbar-container">
    <CrudHead class="sticky-top" title="服务详情" defineButton button-title="导出" @click-event="exportPdf"/>
    <div id="pdfContent">
      <n-card :title=basicInfo.apiName size="large">
        <n-descriptions label-placement="left">
          <n-descriptions-item label="API类型">
            {{ basicInfo.apiFlag }}
          </n-descriptions-item>
          <n-descriptions-item label="更新时间">
            {{ basicInfo.apiGmtTime }}
          </n-descriptions-item>
          <n-descriptions-item label="描述">
            {{ basicInfo.apiComment }}
          </n-descriptions-item>
          <n-descriptions-item label="创建人">
            {{ basicInfo.apiCreator }}
          </n-descriptions-item>
          <n-descriptions-item label="频次限制">
            {{ basicInfo.apiFrequency }}次/秒
          </n-descriptions-item>
          <n-descriptions-item label="服务地址">
            {{ ip.replace('/HData/DevApi', '') + apiData.portTable.data[0]?.apiPath }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>
      <n-card size="small" style="height: 200px">
        <CrudSplit class='titleSplit' title="服务路径"/>
        <CrudTable
            :tableData="apiData.portTable.data"
            :columnData="apiData.portTable.columns"
        />
      </n-card>
      <n-card size="small" style="height: 200px">
        <CrudSplit class='titleSplit' title="请求参数(Headers)"/>
        <CrudTable
            :tableData="apiData.requestParamHeadersTable.data"
            :columnData="apiData.requestParamHeadersTable.columns"
        />
      </n-card>
      <n-card size="small" style="height: 200px">
        <CrudSplit class='titleSplit' title="请求参数(Body)"/>
        <CrudTable
            :tableData="apiData.requestParamBodyTable.data"
            :columnData="apiData.requestParamBodyTable.columns"
        />
      </n-card>
      <n-card size="small" style="height: 200px">
        <CrudSplit class='titleSplit' title="返回字段"/>
        <CrudTable
          :tableData="apiData.responseTable.data"
          :columnData="apiData.responseTable.columns"
        />
      </n-card>
      <n-card size="small">
        <CrudSplit class='titleSplit' title="自定义SQL"/>
        <n-descriptions label-placement="left" column="1" separator="" style="padding: 18px">
          <n-descriptions-item>
            {{ basicInfo.apiScript }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>
      <n-card size="small">
      <CrudSplit class='titleSplit' title="授权用户"/>
      <n-descriptions label-placement="left" column="1" style="padding: 18px">
        <n-descriptions-item label="用户列表">
          {{ apiAuthorizerName }}
        </n-descriptions-item>
      </n-descriptions>
    </n-card>
    </div>
  </div>
</template>

<script setup>

import {onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import apiAxios from '@/utils/api-axios';
import CrudHead from "@/components/cue/crud-header.vue";
import moment from "moment/moment";
import CrudSplit from "@/components/cue/crud-split.vue";
import CrudTable from "@/components/cue/crud-table.vue";
import utils from "@/utils";
import html2pdf from 'html2pdf.js'

const route = useRoute()
const backName = ref("")
const router = useRouter()
const basicInfo = ref({})
const apiAuthorizer = ref([])
const apiAuthorizerName = ref('')
const userList = ref([])
const ip = ref(import.meta.env.MODE === 'development'
    ? import.meta.env.VITE_APP_DEV_API_URL
    : window.webConfig.VITE_APP_PROD_API_URL)
const apiData =ref({
      portTable: {
        data: [],
        columns: [
          { prop: 'apiPath', label: 'URL' },
          { prop: 'json', label: '返回参数格式' },
          { prop: 'apiMethod', label: '请求方式' }
        ]
      },
      requestParamHeadersTable: {
        data: [],
        columns: [
          { prop: 'paramTitle', label: '参数标题 ' },
          { prop: 'paramNotes', label: '参数描述' },
          { prop: 'paramType', label: '参数类型' },
          { prop: 'paramIsNull', label: '是否必填' },
          { prop: 'demoValue', label: '示例值' }
        ]
      },
      requestParamBodyTable: {
        data: [],
        columns: [
          { prop: 'paramTitle', label: '参数标题 ' },
          { prop: 'paramNotes', label: '参数描述' },
          { prop: 'paramType', label: '参数类型' },
          { prop: 'paramIsNull', label: '是否必填' },
          { prop: 'demoValue', label: '示例值' }
        ]
      },
      responseTable: {
        data: [],
        columns: [
          { prop: 'paramTitle', label: '字段' },
          { prop: 'paramType', label: '类型' },
          { prop: 'paramNotes', label: '说明' },
          { prop: 'demoValue', label: '示例值' }
        ]
      },
      responseCodeInfoTable: {
        data: [],
        columns: [
          {
            title: '#',
            type: 'index',
            data: ''
          },

          { data: 'statusCode', title: '状态码 ' },
          { data: 'statusValue', title: '状态值' },
          { data: 'paramNotes', title: '状态说明' }
        ]
      },
      requestExampleTable: {
        data: [],
        columns: [
          {
            title: '#',
            type: 'index',
            data: ''
          },

          { data: 'organization', title: '状态码 ' },
          { data: 'job', title: '状态值' },
          { data: 'isType', title: '状态说明' }
        ]
      },
      requestDemo: '',
      responseDemo: ''
    })

const exportPdf = () => {
  const element = document.getElementById('pdfContent')
  let opt = {
    filename:     basicInfo.value.apiName + '.pdf',
    jsPDF:        { format: 'a3', orientation: 'landscape' }
  };
  html2pdf().set(opt).from(element).save()
}

function queryUser() {
  const listUrl = utils.getUrl('interface/getUser')
  const authListUrl = utils.getUrl('interface/getAuthorizeInfo')
  apiAxios.get(listUrl).then(function (response) {

    userList.value = response.data.data
    userList.value = userList.value.map((item) => {
      let tempList = {}
      tempList.value = item.id
      tempList.label = item.userName
      return tempList
    })

  })
  let authBody = {
    'apiId': basicInfo.value.apiId
  }

  apiAxios.post(authListUrl, authBody).then(function (response) {

    let list = response.data.data
    apiAuthorizer.value = list.map((item) => {
      return item.id
    })
    apiAuthorizerName.value = list
        .map((item) => {
          let authList
          authList = item.userName
          return authList
        })
        .join(',')
  })
}

function queryBasic(apiParam, type) {
  let url
  let basicPar = {}
  if(type === 'apiName'){
    url = utils.getUrl('interface/getInterfaceInfoByApiName')
    basicPar.apiName = apiParam
  } else {
    url = utils.getUrl('interface/getInterfaceInfoById')
    basicPar.apiId = apiParam
  }

  apiAxios.post(url, basicPar).then(function (response) {

    basicInfo.value = response.data.obj
    if (basicInfo.value.apiFlag === 1) {
      basicInfo.value.apiFlag = '接口开发'
      basicInfo.value.apiScript = basicInfo.value.apiScript.replace(/.*HD688296/,"")
      basicInfo.value.apiPath = basicInfo.value.apiPath.replace('/api/','/HData/DevApi/api/')
    }
    if (basicInfo.value.apiFlag === 2) {
      basicInfo.value.apiFlag = '接口注册'
    }
    let date = new Date(parseInt(basicInfo.value.apiGmtTime))
    basicInfo.value.apiGmtTime = moment(date).format('YYYY-MM-DD HH:mm:ss')

    apiData.value.portTable.data.push({
      apiPath: basicInfo.value.apiPath,
      json: 'json',
      apiMethod: basicInfo.value.apiMethod
    })
    apiData.value.requestParamHeadersTable.data = basicInfo.value.headersArray
    apiData.value.requestParamHeadersTable.data.map(item => {
      return item.paramIsNull = item.paramIsNull === 'Y' ? '否' : '是'
    })
    apiData.value.requestParamBodyTable.data = basicInfo.value.bodyArray
    apiData.value.requestParamBodyTable.data.map(item => {
      return item.paramIsNull = item.paramIsNull === 'Y' ? '否' : '是'
    })
    apiData.value.responseTable.data = basicInfo.value.fieldsInfo
    queryUser()
  })
}

onMounted(() => {
  !!history.state.apiId ? queryBasic(history.state.apiId, 'apiId') : queryBasic(history.state.apiName, 'apiName')
  backName.value = history.state.backName
})
</script>

<style scoped>
.n-scrollbar-container {
  width: 100%;
  height: 100%;
  max-height: inherit;
  scrollbar-width: none;
  overflow: auto;
}

.sticky-top {
  position: sticky;
  top: 0; /* 粘在顶部 */
  z-index: 10; /* 确保固定在顶部的div在其他内容之上 */
  padding: 10px; /* 添加一些内边距 */
}

::-webkit-scrollbar {
  display: none;
}

.titleSplit {
  background: white !important;
  font-size: 14px !important;
  padding-left: 0 !important;
  color: #2B96EF;
}
</style>
