<template>
  <n-scrollbar style="height: 526px">
    <n-form
      :model="formValue"
      label-placement="top"
      :rules="rules"
      ref="form2Ref"
    >
      <n-form-item label="标签分类">
        <n-select
          v-model:value="formValue.dataBaseLabelType"
          size="small"
          placeholder="请选择"
          :options="[{ label: '标签', value: 1 }, { label: '群组', value: 2 }]"
          @update:value="queryDataSource"
        />
      </n-form-item>
      <n-form-item v-if="formValue.dataBaseLabelType === 1" label="标签类型" path="dataBaseLabelClassTypeNum">
        <n-select
          v-model:value="formValue.dataBaseLabelClassTypeNum"
          size="small"
          placeholder="请选择"
          :options="sourceType"
          label-field="name"
          value-field="num"
          @update:value="queryDataSource"
        />
      </n-form-item>
      <n-form-item label="标签名称" path="dataBaseLabelId">
        <n-select
          v-model:value="formValue.dataBaseLabelId"
          label-field="labelName"
          value-field="labelName"
          size="small"
          filterable
          :options="sList"
          @update:value="submitValue"
        />
      </n-form-item>
      <n-form-item label="数据表" path="apiDatasourceTable">
        <n-select
          v-model:value="formValue.apiDatasourceTable"
          size="small"
          disabled
        />
      </n-form-item>
      <n-form-item label="字段预览">
        <n-data-table
          size="small"
          :single-line="false"
          :columns="[
            {
              title: '字段名称',
              key: 'TABLE_NAME',
              align: 'center',
              ellipsis: { tooltip: true }
            },
            {
              title: '字段类型',
              key: 'COLUMN_TYPE',
              align: 'center',
              ellipsis: { tooltip: true }
            },
            {
              title: '字段注释',
              key: 'COLUMN_COMMENT',
              align: 'center',
              ellipsis: { tooltip: true }
            }
          ]"
          :data="colList"
        >
        </n-data-table>
      </n-form-item>
    </n-form>
  </n-scrollbar>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue'
  import { useMessage } from 'naive-ui'
  import apiAxios from '@/utils/api-axios'
  import { useRoute } from 'vue-router'
  import utils from '@/utils'

  const emit = defineEmits(['nextStep2_1'])
  const route = useRoute()
  const form2Ref: any = ref(null)
  const message = useMessage()
  const sList = ref([])
  const colList = ref([])

  const formValue = ref({
    dataBaseLabelClassTypeNum: '',
    dataBaseLabelId: '',
    apiDatasourceType: '',
    apiDatasourceId: '',
    apiDatasourceTable: '',
    dataBaseLabelType: 1
  })

  const sourceType = ref([])

  const rules = {
    dataBaseLabelClassTypeNum: {
      required: true,
      message: '请选择标签类型',
      trigger: 'blur'
    },
    dataBaseLabelId: {
      required: true,
      message: '请选择标签名称',
      trigger: 'blur'
    }
  }

  function getDataWarehouse() {
    const url = utils.getUrl('apiService/getDataWarehouse')
    apiAxios.post(url).then(function (response) {
      formValue.value.apiDatasourceType = response.data.data[0].type
      formValue.value.apiDatasourceId = response.data.data[0].id
    })
  }

  function querySourceType() {
    const url = utils.getUrl('interface/getDataBaseLabelClass')
    apiAxios.post(url).then(function (response) {
      sourceType.value = response.data.data
    })
  }

  function queryDataSource() {
    formValue.value.dataBaseLabelId = ''
    formValue.value.apiDatasourceTable = ''
    colList.value = []
    const url = formValue.value.dataBaseLabelType === 1 ? utils.getUrl('interface/getDataBaseLabel') : utils.getUrl('interface/getDataBaseLabelGroup')
    let params = {
      labelClassNum: formValue.value.dataBaseLabelClassTypeNum
    }
    apiAxios.post(url, params).then(function (response) {
      sList.value = response.data.data
      emit('nextStep2_1', formValue.value)
    })
  }

  function queryCol() {
    const url = utils.getUrl('apiService/getColumnsByTable')
    const params = {
      type: formValue.value.apiDatasourceType,
      id: formValue.value.apiDatasourceId,
      tableName: formValue.value.apiDatasourceTable
    }
    apiAxios.post(url, params).then(function (response) {
      colList.value = response.data.data
      emit('nextStep2_1', formValue.value)
    })
  }

  function submitValue() {
    formValue.value.apiDatasourceTable = sList.value.find(
      (obj: any) => obj.labelName === formValue.value.dataBaseLabelId
    ).tableName
    queryCol()
  }

  function getInitData() {
    let url = utils.getUrl('interface/getInterfaceInfoById')
    let params = { apiId: '' }
    params.apiId = route.query.apiId as string

    apiAxios.post(url, params)
      .then(function (response) {
        formValue.value.dataBaseLabelType =
          response.data.obj.dataBaseLabelType
        console.log(formValue.value.dataBaseLabelType)
        formValue.value.dataBaseLabelClassTypeNum =
          response.data.obj.dataBaseLabelClassTypeNum
        queryDataSource()
        formValue.value.dataBaseLabelId = response.data.obj.dataBaseLabelId
        formValue.value.apiDatasourceTable =
          response.data.obj.apiDatasourceTable
        queryCol()
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  onMounted(() => {
    getDataWarehouse()
    querySourceType()
    if (!!route.query.apiId) {
      getInitData()
    }
  })
</script>

<style scoped>
  .n-data-table {
    font-size: 12px;
  }
</style>
