<template>
  <n-card :bordered="false" size="small" >
    <n-alert title="仅显示前10条数据" type="info">
    </n-alert>
    <n-scrollbar x-scrollable >
    <n-table :single-line="false" style="margin-top: 10px">
      <thead>
      <tr>
        <th class="tableWidth" v-for="(value,key) in dataInfo[0]">{{ key.replace(tableName+'.','') }}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in dataInfo" >
        <td class="tableWidth" v-for="value in item">{{ value }}</td>
      </tr>
      </tbody>
    </n-table>
    </n-scrollbar>
  </n-card>
</template>
<script setup>

import apiAxios from '@/utils/api-axios'
import { onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {useMessage} from "naive-ui";
import utils from "@/utils";

const dataInfo =ref([])
const route = useRoute()
const message = useMessage()
const tableName = ref(history.state.tableName)

onMounted(() => {
  const url = utils.getUrl('interface_lineage/getTableDataByTableName')
  let params ={
    tableName: history.state.tableName
  }
  apiAxios.post(url,params)
      .then(function (response) {

        dataInfo.value = response.data.data
      })
      .catch(function () {
        message.error('请求数据失败，请咨询管理员')
      })
})
</script>

<style scoped>
.tableWidth{
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
