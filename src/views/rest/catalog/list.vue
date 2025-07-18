<template>
  <CrudForm>
    <template v-slot:header>
      <CrudHeader title="接口管理" addButton @add-event="addRest"/>
    </template>
    <template v-slot:condition>
      <n-form :show-feedback="false" :model="paginationReactive" label-placement="left" style="margin-bottom: 3px">
        <n-grid :cols="22" :x-gap="16">
          <n-form-item-gi :span="4" label="任务名">
            <n-input
                size="small"
                clearable
                v-model:value="paginationReactive.taskName"
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
          bordered
          flex-height
          :single-line="false"
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
import {ref, reactive, onMounted, h} from 'vue'
import apiAxios from '@/utils/api-axios'
import {
  DeleteOutlined,
  EditOutlined,
} from '@vicons/antd'
import {NButton, NIcon, NPopconfirm, NSpace, NTooltip, useMessage} from "naive-ui";
import {useRouter} from "vue-router";
import {ElButton} from "element-plus";
import CrudForm from "@/components/cue/crud-form.vue";
import CrudPage from "@/components/cue/crud-page.vue";
import CrudHeader from "@/components/cue/crud-header.vue";
import {Search} from "@element-plus/icons-vue";
import utils from "@/utils";

const columns = ({ edit }, {del}) => {
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
      key: 'id',
      align: 'center'
    },
    {
      title: '任务名',
      align: 'center',
      key: 'taskName'
    },
    {
      title: '接口URL',
      align: 'center',
      key: 'dataUrl'
    },
    {
      title: '请求类型',
      align: 'center',
      key: 'httpType'
    },
    {
      title: '目标表',
      align: 'center',
      key: 'dataTable'
    },
    {
      title: '操作',
      align: 'center',
      key: 'actions',
      width: 132,
      render(row) {
        return h(NSpace, {justify: "center"}, {
          default: () => [
            h(
                NTooltip,
                {},
                {
                  trigger: () =>
                      h(
                          NButton,
                          {
                            circle: true,
                            type: 'info',
                            size: 'tiny',
                            class: 'edit',
                            onClick: () => {
                              edit(row)
                            }
                          },
                          {
                            icon: () =>
                                h(NIcon, null, { default: () => h(EditOutlined) })
                          }
                      ),
                  default: () => '编辑'
                }
            ),
            h(
                NPopconfirm,
                {
                  onPositiveClick: () => {
                    del(row)
                  }
                },
                {
                  trigger: () =>
                      h(
                          NTooltip,
                          {},
                          {
                            trigger: () =>
                                h(
                                    NButton,
                                    {
                                      circle: true,
                                      type: 'error',
                                      size: 'tiny',
                                      class: 'delete'
                                    },
                                    {
                                      icon: () =>
                                          h(NIcon, null, {
                                            default: () => h(DeleteOutlined)
                                          })
                                    }
                                ),
                            default: () => '删除'
                          }
                      ),
                  default: () => '确定删除吗？'
                }
            )
          ]
        })
      }
    }
  ]
}
const TableData = reactive({
  tableList: [],
  totalNum: 0
})

const rowKey = (rowData) => {
  return rowData.apiId
}

function query(
    page,
    pageSize = 30,
    taskName = ''
) {
  return new Promise((resolve) => {
    const url = utils.getUrl('httpHandle/getHttpDataListByParams')
    const params = {
      'pageNum': page,
      'pageSize': pageSize,
      'taskName': taskName
    }

    apiAxios.post(url, params)
        .then(function (response) {

          TableData.tableList = response.data.data
          TableData.totalNum = response.data.totalNum


          const copiedData = TableData.tableList.map((v) => v)
          const total = TableData.totalNum
          const pageCount = Math.ceil(total / pageSize)

          setTimeout(
              () =>
                  resolve({
                    pageCount,
                    data: copiedData,
                    total
                  }),
              300
          )
        })
        .catch(function (error) {
          console.log(error)
        })
  })
}


    const dataRef = ref([])
    const router = useRouter()
    const loadingRef = ref(false)
    const message = useMessage()
    const columnsRef = ref(
        columns(
            {
              edit(row) {
                router.push({
                      path: '/devops/rest/rest-edit',
                      query: {id: row.id}
                    }
                )
              }
            },
            {
              del(row) {
                let urlDel = utils.getUrl('httpHandle/deleteHttpDataById')
                let delPar = {
                  id: null
                }
                delPar.id = row.id
                apiAxios.post(urlDel, delPar).then(function (response) {

                  message.info(response.data.info)
                  handlePageChange(paginationReactive.page, paginationReactive.pageSize)
                })
              }
            }
        )
    )
    const paginationReactive = reactive({
      page: 1,
      pageCount: 1,
      pageSize: 30,
      taskName: '',
      itemCount: 0
    })

    function handlePageChange(currentPage, pageSize) {
      if (!loadingRef.value) {
        loadingRef.value = true
        paginationReactive.page = currentPage
        paginationReactive.pageSize = pageSize
        query(
            paginationReactive.page,
            paginationReactive.pageSize,
            paginationReactive.taskName
        ).then((data) => {
          dataRef.value = data.data
          dataRef.value.forEach((item) => {
            if (item.httpType === 1) {
              item.httpType = 'POST'
            }
            if (item.httpType === 2) {
              item.httpType = 'GET'
            }
          })
          paginationReactive.page = currentPage
          paginationReactive.pageCount = data.pageCount
          paginationReactive.itemCount = data.total
          loadingRef.value = false
        })
      }
    }

    function addRest() {
      router.push({
        path: '/devops/rest/rest-edit'
      })
    }

    onMounted(() => {
      handlePageChange(1, 30)
    })

</script>

<style lang="scss" scoped>

</style>
