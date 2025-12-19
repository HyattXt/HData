<template>
  <CrudForm :width="'calc(100% - ' + (280 + 12) + 'px)'">
    <template v-slot:tree>
      <crudTree
        :tree-folder="treeFolder"
        :folder-data="treeFolder"
        :show-spin="showSpin"
        :menuIcon="menuIcon"
        :nodeProps="nodeProps"
        v-model:showUpdateRef="showUpdateRef"
        v-model:updateFormValue="updateFormValue"
        v-model:addFormValue="addFormValue"
        v-model:selectedMenu="selectedMenu"
      />
    </template>
    <template v-slot:header>
      <CrudHeader title="API开发">
        <template v-slot:button-group>
          <n-dropdown trigger="hover" :options="options" @select="handleExport" size="small">
            <n-button tertiary size="small">导出</n-button>
          </n-dropdown>
        </template>
      </CrudHeader>
    </template>
    <template v-slot:condition>
      <el-form inline>
        <el-form-item label="名称">
          <el-input type="text" style="width: 180px" clearable v-model="paginationReactive.apiName" />
        </el-form-item>
        <el-form-item label="API类型">
          <el-select
            v-model="paginationReactive.apiFlag"
            clearable
            style="width: 180px"
            popper-class="form-item-select"
          >
            <el-option v-for="item in stateOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="API状态">
          <el-select
            v-model="paginationReactive.apiStatus"
            clearable
            style="width: 180px"
            popper-class="form-item-select"
          >
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="路径">
          <el-input type="text" style="width: 180px" clearable v-model="paginationReactive.apiPath" />
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
      <CrudPage :paginationReactive="paginationReactive" @page-change="handlePageChange" />
    </template>
  </CrudForm>
</template>

<script setup>
  import { ref, reactive, onMounted, h } from 'vue'
  import { useRouter } from 'vue-router'
  import apiAxios from '@/utils/api-axios'
  import {
    BoxPlotOutlined,
    ProfileOutlined,
    ToTopOutlined,
    UserOutlined,
    VerticalAlignBottomOutlined
  } from '@vicons/antd'
  import { NButton, useMessage, NIcon, NPopover, NSpace, NTooltip, NPopconfirm } from 'naive-ui'
  import hljs from 'highlight.js/lib/core'
  import javascript from 'highlight.js/lib/languages/javascript'
  import moment from 'moment'
  import CrudTree from '@/components/cue/crud-tree.vue'
  import CrudTable from '@/components/cue/crud-table.vue'
  import { ElButton, ElMessageBox } from 'element-plus'
  import CrudSplit from '@/components/cue/crud-split.vue'
  import CrudForm from '@/components/cue/crud-form.vue'
  import CrudHeader from '@/components/cue/crud-header.vue'
  import CrudPage from '@/components/cue/crud-page.vue'
  import { PencilAlt, TrashAlt } from '@vicons/fa'
  import utils from '@/utils'
  import router from '@/router'
  import axios from 'axios'

  hljs.registerLanguage('javascript', javascript)

  const columns = [
    {
      label: 'ID',
      prop: 'apiId'
    },
    {
      label: '名称',
      prop: 'apiName'
    },
    {
      label: '方式',
      prop: 'apiMethod',
      width: 61
    },
    {
      label: '路径',
      prop: 'apiPath'
    },
    {
      label: '状态',
      prop: 'apiStatus',
      width: 66
    },
    {
      label: 'API类型',
      prop: 'apiFlag',
      width: 100
    },
    {
      label: '来源',
      prop: 'apiDataSource',
      width: 100
    },
    {
      label: '授权用户',
      prop: 'userNames',
      width: 150
    },
    {
      label: '创建时间',
      prop: 'apiCreateTime'
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
            onClick: () => play(row)
          },
          { default: () => '查看' }
        )
      }
    }
  ]

  const TableData = reactive({
    apiList: [],
    totalNum: 0
  })

  function query(page, pageSize = 30, apiName = '', apiFlag = '', apiStatus = '', apiPath = '', apiTreeId = 1) {
    return new Promise((resolve) => {
      const url = utils.getUrl('interface/getList')
      const params = {
        pageNum: page,
        pageSize: pageSize,
        apiName: apiName,
        apiFlag: apiFlag,
        apiStatus: apiStatus,
        apiPath: apiPath,
        apiTreeId: apiTreeId,
        order: 'api_create_time',
        sort: 'desc'
      }

      apiAxios
        .post(url, params)
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

  function exportExcel(page, pageSize = 30, apiName = '', apiFlag = '', apiStatus = '', apiPath = '', apiTreeId = '') {
    return new Promise((resolve, reject) => {
      const url = utils.getUrl('interface/exportExcel')
      const params = {
        pageNum: page,
        pageSize: pageSize,
        apiName: apiName,
        apiFlag: apiFlag || null,
        apiStatus: apiStatus || null,
        apiPath: apiPath,
        apiTreeId: apiTreeId || '',
        order: 'api_create_time',
        sort: 'desc'
      }

      // ⚠️ 必须设置 responseType: 'blob' 才能接收二进制流
      axios
        .post(url, params, {
          responseType: 'blob', // ← 关键！
          headers: {
            'Content-Type': 'application/json',
            Accept: '*/*', // 允许任何响应类型
            'User-Agent': 'Apifox/1.0.0 (https://apifox.com)', // 可选：匹配 curl 的 User-Agent
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1'
          }
        })
        .then((response) => {
          let fileName = '接口信息.xlsx' // 默认名（防止无文件名）
          // 创建 Blob 并触发下载
          const blob = new Blob([response.data], {
            type: response.headers['content-type'] || 'application/octet-stream'
          })

          const downloadUrl = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = fileName // 使用接口返回的真实文件名
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(downloadUrl)

          resolve(response)
        })
        .catch((error) => {
          console.error('导出失败:', error)

          // 处理错误：如果后端返回的是 JSON 错误（但 responseType 是 blob）
          if (error.response?.data instanceof Blob) {
            const reader = new FileReader()
            reader.onload = () => {
              try {
                const errText = reader.result
                const errJson = JSON.parse(errText)
                alert(errJson.message || '导出失败，请稍后重试')
                reject(errJson)
              } catch (e) {
                alert('服务器返回异常')
                reject(error)
              }
            }
            reader.readAsText(error.response.data)
          } else {
            alert('网络错误或服务不可用')
            reject(error)
          }
        })
    })
  }

  const dataRef = ref([])
  const loadingRef = ref(false)
  const showSpin = ref(false)
  const folderData = ref([])
  const treeFolder = ref([])
  const currentRow = ref()
  const ifDisableDelete = ref(true)
  const ifDisableUpdate = ref(true)
  const showUpdateRef = ref(false)
  const updateFormValue = ref({})
  const selectedMenu = ref(1)
  const addFormValue = ref({ titleName: '' })
  const getApiTreeUrl = utils.getUrl('interface/getApiTree')
  const getApiFolderUrl = utils.getUrl('interface/getApiTreeFloder')
  const options = [
    {
      label: '当前页',
      key: '1'
    },
    {
      label: '全部',
      key: '2'
    }
  ]

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
      label: '删除',
      value: '-1'
    },
    {
      label: '待发布',
      value: '0'
    },
    {
      label: '已发布',
      value: '1'
    },
    {
      label: '审核中',
      value: '2'
    },
    {
      label: '禁用',
      value: '3'
    }
  ]
  function getTreeFolder() {
    apiAxios
      .get(getApiTreeUrl)
      .then((res) => {
        folderData.value = res.data.data
      })
      .catch(function (error) {
        console.log(error)
      })
  }
  function getApiFolder() {
    showSpin.value = true
    apiAxios
      .get(getApiFolderUrl)
      .then((res) => {
        treeFolder.value = res.data.data
        showSpin.value = false
      })
      .catch(function (error) {
        console.log(error)
      })
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
            height: '16'
          },
          [
            h('path', {
              d: 'M0 101.888C0 76.288 17.042286 59.245714 42.642286 59.245714h349.915428c17.042286 0 34.084571 17.042286 42.642286 34.157715l16.457143 51.2H972.8c25.6 0 42.642286 17.042286 42.642286 42.642285v733.842286c8.557714 25.6-8.484571 42.715429-34.084572 42.715429H42.642286c-25.6 0-42.642286-17.115429-42.642286-42.715429v-819.2z',
              fill: '#FFA000'
            }),
            h('path', {
              d: 'M904.557714 912.603429H119.442286c-25.6 0-42.642286-17.115429-42.642286-42.715429v-614.4c0-25.6 17.042286-42.642286 42.642286-42.642286h793.6c25.6 0 42.715429 17.042286 42.715428 42.642286v614.4c0 17.115429-25.6 42.715429-51.2 42.715429',
              fill: '#FFFFFF'
            }),
            h('path', {
              d: 'M981.357714 963.803429H42.642286c-25.6 0-42.642286-17.115429-42.642286-42.715429V340.845714c0-25.6 17.042286-42.642286 42.642286-42.642285H972.8c34.157714-8.557714 51.2 17.042286 51.2 42.642285v580.242286c0 25.6-17.042286 42.715429-42.642286 42.715429',
              fill: '#FFCA28'
            }),
            h('path', {
              d: 'M366.957714 631.003429H119.442286c-8.484571 0-25.6-8.557714-25.6-25.6 0-17.115429 8.557714-25.6 25.6-25.6h247.515428c8.484571 0 25.6 8.484571 25.6 25.6-8.557714 17.042286-17.115429 25.6-25.6 25.6m0-153.6H119.442286c-8.484571 0-25.6-8.557714-25.6-25.6 0-17.115429 8.557714-25.6 25.6-25.6h247.515428c8.484571 0 25.6 8.484571 25.6 25.6 0 17.042286-17.115429 25.6-25.6 25.6',
              fill: '#FFFFFF'
            })
          ]
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
      }
    }
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
            item.apiStatus = '已发布'
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
      })
    }
  }

  function handleCurrentChange(val) {
    currentRow.value = val
    if (currentRow.value && currentRow.value.apiStatus !== '已发布' && currentRow.value.apiStatus !== '审核中') {
      ifDisableUpdate.value = false
      ifDisableDelete.value = currentRow.value.addFlag !== 2
    } else {
      ifDisableDelete.value = true
      ifDisableUpdate.value = true
    }
  }

  function play(row) {
    router.push({
      name: 'api-detail',
      state: { apiId: row.apiId, backName: 'api-catalog' },
      query: { back: true }
    })
  }

  function handleExport(type) {
    let pageSize
    if (type === 1) {
      pageSize = paginationReactive.pageSize
    } else if (type === 2) {
      pageSize = 99999
    }
    exportExcel(
      paginationReactive.page,
      pageSize,
      paginationReactive.apiName,
      paginationReactive.apiFlag,
      paginationReactive.apiStatus,
      paginationReactive.apiPath,
      paginationReactive.apiTreeId
    )
  }

  const paginationReactive = reactive({
    page: 1,
    pageCount: 1,
    pageSize: 10,
    apiName: '',
    apiFlag: null,
    apiStatus: null,
    apiPath: '',
    apiTreeId: '',
    itemCount: 0
  })
  onMounted(() => {
    getTreeFolder()
    getApiFolder()
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
