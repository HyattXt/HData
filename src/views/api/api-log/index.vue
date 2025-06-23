<template>
  <CrudForm>
    <template v-slot:header>
      <CrudHeader title="调用日志"/>
    </template>
    <template v-slot:condition>
      <n-form :show-feedback="false" :model="paginationReactive" label-placement="left" style="margin-bottom: 3px">
        <n-grid :cols="22" :x-gap="16">
          <n-form-item-gi
            :span="4"
            label="访问IP"
            path="pagination.interfaceIp"
          >
            <n-input
              clearable
              size="small"
              v-model:value="paginationReactive.interfaceIp"
            />
          </n-form-item-gi>
          <n-form-item-gi :span="4" label="服务路径">
            <n-input
              clearable
              size="small"
              v-model:value="paginationReactive.interfaceUrl"
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
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import moment from 'moment'
import CrudHeader from "@/components/cue/crud-header.vue";
import {ElButton} from "element-plus";
import {Search} from "@element-plus/icons-vue";
import CrudForm from "@/components/cue/crud-form.vue";
import CrudPage from "@/components/cue/crud-page.vue";
import utils from "@/utils";

const columnsRef =  [
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
      title: '访问ip',
      key: 'interfaceIp',
      align: 'center'
    },
    {
      title: '访问时间',
      key: 'interfaceTimestamp',
      align: 'center',
      render: (row) => {
          let date = new Date(parseInt(row.interfaceTimestamp*1000))
          return moment(date).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    {
      title: '访问路径',
      key: 'interfaceUrl',
      align: 'center',
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: '请求方式',
      key: 'interfaceType',
      align: 'center',
      render: (row) => {
        switch (row.interfaceType) {
          case 1 : return 'get'
          case 2 : return 'post'
        }
      }
    },
    {
      title: 'API类型',
      key: 'interfaceUrlType',
      align: 'center',
      render: (row) => {
        switch (row.interfaceType) {
          case 1 : return 'api'
          case 2 : return 'proxy代理'
        }
      }
    }
  ]

const TableData = reactive({
  apiList: [],
  totalNum: 0
})

const rowKey = (rowData) => {
  return rowData.apiId
}

const dataRef = ref([])
const loadingRef = ref(false)

function handlePageChange(currentPage, pageSize) {
  if (!loadingRef.value) {
    loadingRef.value = true
    paginationReactive.page = currentPage
    paginationReactive.pageSize = pageSize
    query(
      paginationReactive.page,
      paginationReactive.pageSize,
      paginationReactive.interfaceIp,
      paginationReactive.interfaceUrl
    ).then((data) => {
      dataRef.value = data.data
      paginationReactive.page = currentPage
      paginationReactive.pageCount = data.pageCount
      paginationReactive.itemCount = data.total
      loadingRef.value = false
    })
  }
}

function query(page, pageSize = 30, interfaceIp = '', interfaceUrl = '') {
  return new Promise((resolve) => {
    const url = utils.getUrl('interface/queryInterfaceStatistics')
    const params = {
      pageNum: page, 'pageSize': pageSize, 'interfaceIp': interfaceIp, 'interfaceUrl': interfaceUrl
    }
    axios.post(url, params).then(function (response) {
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

const paginationReactive = reactive({
  page: 1,
  pageCount: 1,
  pageSize: 30,
  interfaceIp: '',
  interfaceUrl: '',
  itemCount: 0

})

onMounted(() => {
  handlePageChange(1, 30)
})
</script>

<style lang="scss" scoped>

.n-base-select-menu .n-base-select-option {
  font-size: 12px;
}
</style>
