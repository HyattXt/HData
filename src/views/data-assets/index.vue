<!--
  Licensed to the Apache Software Foundation (ASF) under one or more
  contributor license agreements.  See the NOTICE file distributed with
  this work for additional information regarding copyright ownership.
  The ASF licenses this file to You under the Apache License, Version 2.0
  (the "License"); you may not use this file except in compliance with
  the License.  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
<template>

  <div class="panel filter-panel">
    <div class="section-header">
      <span class="section-title">统计周期</span>
      <span class="section-desc">近 7 天 / 近 30 天的资产变化趋势</span>
    </div>
    <div class="filter-row">
      <span class="filter-label">趋势统计</span>
      <n-select
        size="small"
        v-model:value="AssentsSelectCurrent"
        default-value="近7天"
        :options="AssentsSelect"
        class="filter-select"
        @update:value="handlegetAssetOverviewLineData"
      />
    </div>
  </div>

  <div class="stats-row">
    <div
      v-for="(item, index) in statCards"
      :key="index"
      class="stat-card"
      :style="item.vars"
    >
      <div class="stat-icon-wrap">
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" class="stat-icon">
          <path :d="item.iconPath" fill="currentColor"/>
        </svg>
      </div>
      <div class="stat-content">
        <div class="stat-header">
          <span class="stat-label">{{ item.label }}</span>
        </div>
        <div class="stat-value">{{ item.value }}</div>
        <div v-if="item.desc" class="stat-desc">{{ item.desc }}</div>
      </div>
    </div>
  </div>

  <div class="chart-row">
    <div class="panel panel-flex-1">
      <div class="section-header">
        <span class="section-title">我的收藏</span>
        <span class="section-desc">最近收藏的数据表资产</span>
        <div class="section-right">
          <router-link
            to="/data-assets/assets-catalog?type=collect&back=true"
            class="section-link"
          >
            更多 &gt;
          </router-link>
        </div>
      </div>
      <div class="list-scroll">
        <div
          v-for="(item, idx) in collectData"
          :key="'c-' + (item.sqlLineageName || 'c') + (item.collectionTime || idx)"
          class="list-item"
        >
          <div class="item-main-row">
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="item-icon">
              <path d="M102.4 179.2a76.8 76.8 0 0 1 76.8-76.8h665.6a76.8 76.8 0 0 1 76.8 76.8v665.6a76.8 76.8 0 0 1-76.8 76.8H179.2a76.8 76.8 0 0 1-76.8-76.8V179.2z" fill="#1677FF"/>
              <path d="M102.4 332.8a76.8 76.8 0 0 1 76.8-76.8h665.6a76.8 76.8 0 0 1 76.8 76.8v512a76.8 76.8 0 0 1-76.8 76.8H179.2a76.8 76.8 0 0 1-76.8-76.8V332.8z" fill="#FFFFFF" fill-opacity=".35"/>
              <path d="M332.8 256h358.4v51.2H332.8v-51.2z" fill="#FFFFFF"/>
              <path d="M320 588.8V384h-51.2v204.8H102.4v51.2h166.4v281.6h51.2V640h166.4v281.6h51.2V640h166.4v281.6h51.2V640h166.4v-51.2H320z" fill="#FFFFFF"/>
            </svg>
            <span class="item-title">{{ item.sqlLineageName || '-' }}</span>
            <span class="item-time">收藏时间&nbsp;·&nbsp;{{ item.collectionTime }}</span>
            <div class="item-stat">
              <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="14" height="14"><path d="M335.008 916.629333c-35.914667 22.314667-82.88 10.773333-104.693333-25.557333a77.333333 77.333333 0 0 1-8.96-57.429333l46.485333-198.24a13.141333 13.141333 0 0 0-4.021333-12.864l-152.16-132.586667c-31.605333-27.52-35.253333-75.648-8.234667-107.733333a75.68 75.68 0 0 1 51.733333-26.752L354.848 339.2c4.352-0.362667 8.245333-3.232 10.026667-7.594667l76.938666-188.170666c16.032-39.2 60.618667-57.92 99.52-41.461334a76.309333 76.309333 0 0 1 40.832 41.461334l76.938667 188.16c1.781333 4.373333 5.674667 7.253333 10.026667 7.605333l199.712 16.277333c41.877333 3.413333 72.885333 40.458667 69.568 82.517334a76.938667 76.938667 0 0 1-26.08 51.978666l-152.16 132.586667c-3.541333 3.082667-5.141333 8.074667-4.021334 12.853333l46.485334 198.24c9.621333 41.013333-15.36 82.336-56.138667 92.224a75.285333 75.285333 0 0 1-57.525333-9.237333l-170.976-106.24a11.296 11.296 0 0 0-12.010667 0l-170.986667 106.24z" fill="#bfbfbf"/></svg>
              <span class="item-stat-num">{{ item.totalCollections || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel panel-flex-1">
      <div class="section-header">
        <span class="section-title">我的点赞</span>
        <span class="section-desc">最近点赞的数据表资产</span>
        <div class="section-right">
          <router-link
            to="/data-assets/assets-catalog?type=like&back=true"
            class="section-link"
          >
            更多 &gt;
          </router-link>
        </div>
      </div>
      <div class="list-scroll">
        <div
          v-for="(item, idx) in likeData"
          :key="'l-' + (item.sqlLineageName || 'l') + (item.likeTime || idx)"
          class="list-item"
        >
          <div class="item-main-row">
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20" class="item-icon">
              <path d="M102.4 179.2a76.8 76.8 0 0 1 76.8-76.8h665.6a76.8 76.8 0 0 1 76.8 76.8v665.6a76.8 76.8 0 0 1-76.8 76.8H179.2a76.8 76.8 0 0 1-76.8-76.8V179.2z" fill="#1677FF"/>
              <path d="M102.4 332.8a76.8 76.8 0 0 1 76.8-76.8h665.6a76.8 76.8 0 0 1 76.8 76.8v512a76.8 76.8 0 0 1-76.8 76.8H179.2a76.8 76.8 0 0 1-76.8-76.8V332.8z" fill="#FFFFFF" fill-opacity=".35"/>
              <path d="M332.8 256h358.4v51.2H332.8v-51.2z" fill="#FFFFFF"/>
              <path d="M320 588.8V384h-51.2v204.8H102.4v51.2h166.4v281.6h51.2V640h166.4v281.6h51.2V640h166.4v281.6h51.2V640h166.4v-51.2H320z" fill="#FFFFFF"/>
            </svg>
            <span class="item-title">{{ item.sqlLineageName || '-' }}</span>
            <span class="item-time">点赞时间&nbsp;·&nbsp;{{ item.likeTime }}</span>
            <div class="item-stat">
              <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="14" height="14"><path d="M948.4 407.2c-29.2-35.5-76.9-35.5-92.6-35.5H730c10.2-55.2 18.9-119.4 0.2-187.1-12.8-46.6-36.3-79.7-72-101.1-18.7-11.2-38.1-16.9-57.8-16.9-51.8 0-90.6 38.4-96.4 95.7-2.2 21.4-4.2 41.7-9.3 59.1-19 63.9-65.4 112.7-108.3 151.8-16 14.4-33.1 40.2-33.3 69.2-0.6 77.6-0.7 155.5-0.7 235.1l-0.1 141.4c-0.2 47.3 25 85.4 67 101.7 22.2 9 45.7 14 70.1 14.7 38.8 0.5 77.8 0.5 114.3 0.5h56.9c37.2 0 74.4 0 111.8 0.4h1.2c43.5 0 77.7-21.7 93.9-59.5l4.8-11.1c11.3-26 22.9-52.9 30.1-82.8 22-90.9 44.9-188.2 63.4-283.8 7.4-37.9 1.6-68.8-17.4-91.8zM216.1 374.5h-11.9c-56.2 0-101.9 45.7-101.9 101.9v348.4c0 56.2 45.7 101.9 101.9 101.9h11.9c56.2 0 101.9-45.7 101.9-101.9V476.4c0.1-56.2-45.7-101.9-101.9-101.9z" fill="#bfbfbf"/></svg>
              <span class="item-stat-num">{{ item.totalLikes || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="chart-row">
    <div class="panel panel-flex-1">
      <div class="section-header">
        <span class="section-title">数据表总数</span>
        <span class="section-desc">最近 {{ trendDays }} 天的表数量变化趋势</span>
      </div>
      <div class="chart-wrap">
        <MyChart
          v-if="AssetOverviewLineData?.value.table?.length > 0"
          :option="tablesLineOption"
          height="280px"
        />
      </div>
    </div>
    <div class="panel panel-flex-1">
      <div class="section-header">
        <span class="section-title">数据存储量</span>
        <span class="section-desc">最近 {{ trendDays }} 天的存储容量变化（MB）</span>
      </div>
      <div class="chart-wrap">
        <MyChart
          v-if="AssetOverviewLineData?.value.table?.length > 0"
          :option="sizeLineOption"
          height="280px"
        />
      </div>
    </div>
  </div>

  <div class="chart-row">
    <div class="panel panel-flex-1">
      <div class="section-header">
        <span class="section-title">存储记录数</span>
        <span class="section-desc">最近 {{ trendDays }} 天的记录数变化趋势</span>
      </div>
      <div class="chart-wrap">
        <MyChart
          v-if="AssetOverviewLineData?.value.table?.length > 0"
          :option="recordsLineOption"
          height="280px"
        />
      </div>
    </div>
    <div class="panel panel-flex-1">
      <div class="section-header">
        <span class="section-title">API服务数</span>
        <span class="section-desc">最近 {{ trendDays }} 天的 API 服务数量变化</span>
      </div>
      <div class="chart-wrap">
        <MyChart
          v-if="AssetOverviewLineData?.value.table?.length > 0"
          :option="apiLineOption"
          height="280px"
        />
      </div>
    </div>
  </div>

  <div class="chart-row">
    <div class="panel panel-flex-1">
      <div class="section-header">
        <span class="section-title">API 调用次数 TOP10</span>
        <span class="section-desc">按访问次数从高到低排序</span>
        <div class="section-right">
          <n-select
            size="small"
            v-model:value="ApiSelectCurrent"
            default-value="今天"
            :options="RunSelect"
            class="section-select"
            @update:value="handlegetInterfaceTop10Data"
          />
        </div>
      </div>
      <div class="table-wrap">
        <n-data-table
          :columns="ApiTop10DataHeader"
          :data="ApiTop10?.value.table"
          size="small"
          striped
          :single-line="false"
          min-height="150"
          max-height="300"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, toRefs, unref, isRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAsyncState } from '@vueuse/core'
import { format } from 'date-fns'
import MyChart from '@/components/chart/modules/MyChart'
import CrudHead from '@/components/cue/crud-header.vue'
import { useUserStore } from '@/store/user/user'
import { queryListUrl } from '@/service/modules/data-bussiness'
import { queryUnauthorizedProject } from '@/service/modules/devops-analysis'
import {
  getInterfaceTop10,
  getAssetOverview,
  getAssetOverviewLineChart
} from '@/service/modules/assets-analysis'

interface DefinitionChartData {
  xAxisData: Array<string>
  seriesData: Array<number>
}

interface StateTableData {
  number: number
  state: string
}

interface StateChartData {
  value: number
  name: string
}

interface StateData {
  table: Array<StateTableData>
  chart: Array<StateChartData>
}

interface TableDataType {
  totalDataSource: number[]
  totalTables: number[]
  dataSize: number[]
  totalRecords: number[]
  totalApiInterface: number[]
  time: string[]
}

const { t } = useI18n()

const taskVariables = reactive({
  taskLoadingRef: ref(false)
})

const getProjData = () => {
  const { state } = useAsyncState(
    queryUnauthorizedProject({
      userId: 0
    }).then(function (res: any) {
      const table = res.map((item: any) => {
        return {
          label: item.name,
          value: item.code
        }
      })
      const proj = table[0].value
      return { table, proj }
    }),
    { table: [] }
  )
  return state
}

const getInterfaceTop10Data = (date: Array<any>, projectCode: any) => {
  const { state } = useAsyncState(
    getInterfaceTop10({
      startTime: !date ? '' : format(date[0], 'yyyy-MM-dd HH:mm:ss'),
      endTime: !date ? '' : format(date[1], 'yyyy-MM-dd HH:mm:ss'),
      projectCode: projectCode
    }).then(function (res: any) {
      const table = res.map((item: any, index: any) => {
        return {
          排名: index + 1,
          接口地址: item.interfaceUrl,
          接口类型: item.interfaceUrlType,
          接口访问次数: item.interfaceNum
        }
      })
      return { table }
    }),
    { table: [] }
  )
  return state
}

const getAssetOverviewData = (projectCode: any) => {
  const { state } = useAsyncState(
    getAssetOverview({
      projectCode: projectCode
    }).then(function (res: any) {
      const table = [0, 0, 0, 0, 0]
      if (res[0] != null) {
        let i = 0
        for (i = 0; i < res.length; i++) {
          table[0] = res[i].totalDataSource
          table[1] = res[i].totalTables
          table[2] = Number((parseInt(res[i].dataSize) / 1024 / 1024).toFixed(2))
          table[3] = res[i].totalRecords
          table[4] = res[i].totalApiInterface
        }
      }
      return { table }
    }),
    { table: [] }
  )
  return state
}

const getAssetOverviewLineData = (pageSize: number, projectCode: any) => {
  const { state } = useAsyncState(
    getAssetOverviewLineChart({
      pageSize: pageSize,
      projectCode: projectCode
    }).then(function (res: any) {
      const tableData: TableDataType = {
        totalDataSource: [],
        totalTables: [],
        dataSize: [],
        totalRecords: [],
        totalApiInterface: [],
        time: []
      }
      let i = 0
      for (i = 0; i < res.length; i++) {
        tableData['totalDataSource'].push(parseInt(res[i].totalDataSource))
        tableData['totalTables'].push(parseInt(res[i].totalTables))
        tableData['dataSize'].push(parseInt(res[i].dataSize) / 1024 / 1024)
        tableData['totalRecords'].push(parseInt(res[i].totalRecords))
        tableData['totalApiInterface'].push(parseInt(res[i].totalApiInterface))
        tableData['time'].push(res[i].createTime.substring(5, 10))
      }
      const table = [tableData]
      return { table }
    }),
    { table: [] }
  )
  return state
}

const dateRef = ref([
  [
    new Date(new Date().setHours(0, 0, 0, 0)).getTime() - 6 * 24 * 60 * 60 * 1000,
    new Date(new Date().setHours(0, 0, 0, 0)).getTime() + 24 * 60 * 60 * 1000
  ]
])

const RunSelect = ref([
  {
    label: '今天',
    value: [
      new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
      new Date(new Date().setHours(23, 59, 59, 999)).getTime()
    ]
  },
  {
    label: '昨天',
    value: [
      new Date(new Date().setHours(0, 0, 0, 0)).getTime() - 24 * 60 * 60 * 1000,
      new Date(new Date().setHours(23, 59, 59, 999)).getTime() - 24 * 60 * 60 * 1000
    ]
  },
  {
    label: '近7天',
    value: [
      new Date(new Date().setHours(0, 0, 0, 0)).getTime() - 6 * 24 * 60 * 60 * 1000,
      new Date(new Date().setHours(23, 59, 59, 999)).getTime()
    ]
  },
  {
    label: '近15天',
    value: [
      new Date(new Date().setHours(0, 0, 0, 0)).getTime() - 14 * 24 * 60 * 60 * 1000,
      new Date(new Date().setHours(23, 59, 59, 999)).getTime()
    ]
  },
  {
    label: '近30天',
    value: [
      new Date(new Date().setHours(0, 0, 0, 0)).getTime() - 29 * 24 * 60 * 60 * 1000,
      new Date(new Date().setHours(23, 59, 59, 999)).getTime()
    ]
  }
])

const AssentsSelect = ref([
  {
    label: '近7天',
    value: 7
  },
  {
    label: '近30天',
    value: 30
  }
])

const ApiTop10DataHeader = [
  { title: '排名', key: '排名', width: 60 },
  { title: '接口地址', key: '接口地址' },
  { title: '接口类型', key: '接口类型' },
  { title: '接口访问次数', key: '接口访问次数' }
]

const taskStateRef = ref()
const processStateRef = ref()
const taskDataRef = ref()
const taskDevRef = ref()
const RunSelectCurrent = ref()
const RunErrorSelectCurrent = ref()
const ApiSelectCurrent = ref('今天')
const AssentsSelectCurrent = ref('近7天')

const trendDays = computed(() => {
  const match = AssentsSelect.value.find((item) => item.label === AssentsSelectCurrent.value)
  return match?.value ?? 7
})

const route = useRoute()

const Proj = ref()
Proj.value = route.params.projectCode

const ApiTop10 = ref()
const AssetOverview = ref()
const AssetOverviewLineData = ref()

const userStore = useUserStore()
const likeData = ref<any[]>([])
const collectData = ref<any[]>([])

const initLikeCollectData = async (likeState: number, collectionState: number) => {
  const params = {
    userId: (userStore.getUserInfo as any).id,
    sqlLineageName: '',
    likeState,
    collectionState
  }
  const data = await queryListUrl(params)
  if (likeState) {
    likeData.value = data.totalList
  } else {
    collectData.value = data.totalList
  }
}

const initData = () => {
  ApiTop10.value = getInterfaceTop10Data(
    [
      new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
      new Date(new Date().setHours(23, 59, 59, 999)).getTime()
    ],
    Proj.value
  )
  AssetOverview.value = getAssetOverviewData(Proj.value)
  AssetOverviewLineData.value = getAssetOverviewLineData(7, Proj.value)
}

const handlegetInterfaceTop10Data = (val: any) => {
  ApiTop10.value = getInterfaceTop10Data(val, Proj.value)
  ApiSelectCurrent.value = RunSelect.value.filter((item) => item.value[0] === val[0])[0].label
}

const handlegetAssetOverviewLineData = (val: any) => {
  AssetOverviewLineData.value = getAssetOverviewLineData(val, Proj.value)
  AssentsSelectCurrent.value = AssentsSelect.value.filter((item) => item.value === val)[0].label
}

const statCards = computed(() => {
  const overview = AssetOverview?.value?.table ?? []
  const ds = overview[0] ?? 0
  const tables = overview[1] ?? 0
  const size = overview[2] ?? 0
  const records = overview[3] ?? 0
  const api = overview[4] ?? 0
  return [
    {
      label: '数据源总数',
      desc: '已接入的数据源',
      value: ds,
      vars: {
        '--c-main': '#1677ff',
        '--c-icon-bg-from': '#e6f0ff',
        '--c-icon-bg-to': '#f0f5ff',
        '--c-icon-border': '#bae0ff55',
        '--c-icon-shadow': 'rgba(22,119,255,0.10)',
        '--c-corner-bg': 'rgba(22,119,255,0.08)',
        '--c-hover-border': '#b8d1ff',
        '--c-hover-shadow': 'rgba(22,119,255,0.10)'
      },
      iconPath: 'M512 64C264.704 64 64.256 157.888 64 273.728v476.288C64 865.92 264.576 960 512 960s448-94.08 448-209.984V273.728C959.744 157.888 759.296 64 512 64zM211.008 847.744a35.008 35.008 0 1 1 0-70.016 35.008 35.008 0 0 1 0 70.016z m692.992-165.12a444.736 444.736 0 0 1-51.456 28.16C760.704 753.92 639.68 777.6 512 777.6c-127.68 0-248.704-23.68-340.544-66.752a444.8 444.8 0 0 1-51.456-28.16V613.312c76.416 64.64 223.36 108.224 392 108.224 168.704 0 315.584-43.648 392-108.16v69.248zM176 574.72a35.008 35.008 0 1 1 69.952 0 35.008 35.008 0 0 1-69.952 0z m728-129.664a444.608 444.608 0 0 1-51.456 28.16C760.704 516.288 639.68 539.968 512 539.968c-127.68 0-248.704-23.68-340.544-66.752a444.8 444.8 0 0 1-51.456-28.16V375.744C196.416 440.384 343.36 483.968 512 483.968c168.704 0 315.584-43.648 392-108.16v69.248z'
    },
    {
      label: '数据表总数',
      desc: '当前所有数据源下的表',
      value: tables,
      vars: {
        '--c-main': '#722ED1',
        '--c-icon-bg-from': '#f3e9ff',
        '--c-icon-bg-to': '#faf5ff',
        '--c-icon-border': '#d3adf755',
        '--c-icon-shadow': 'rgba(114,46,209,0.10)',
        '--c-corner-bg': 'rgba(114,46,209,0.08)',
        '--c-hover-border': '#d3adf7',
        '--c-hover-shadow': 'rgba(114,46,209,0.10)'
      },
      iconPath: 'M0 0h1024v292.608H0zM0 365.738667h292.608v292.522666H0V365.738667zM0 731.306667h292.608V1024H0V731.392z m365.738667-365.653334h292.522666v292.522667H365.738667V365.738667z m0 365.653334h292.522666V1024H365.738667V731.392zM731.306667 365.738667H1024v292.522666H731.392V365.738667zM731.392 731.392H1024V1024H731.392z'
    },
    {
      label: '数据存储量(MB)',
      desc: '累计存储容量',
      value: size,
      vars: {
        '--c-main': '#52C41A',
        '--c-icon-bg-from': '#e9ffd6',
        '--c-icon-bg-to': '#f6ffed',
        '--c-icon-border': '#b7eb8f55',
        '--c-icon-shadow': 'rgba(82,196,26,0.10)',
        '--c-corner-bg': 'rgba(82,196,26,0.08)',
        '--c-hover-border': '#b7eb8f',
        '--c-hover-shadow': 'rgba(82,196,26,0.10)'
      },
      iconPath: 'M446.293333 481.706667c224 0 401.493333-75.093333 401.493334-170.666667v-85.333333c0-97.706667-177.92-170.666667-401.493334-170.666667S44.8 128 44.8 223.573333v85.333334c0 97.706667 178.346667 172.8 401.493333 172.8zM446.293333 820.053333c-154.88 0-309.76-34.56-401.493333-103.253333v79.786667c0 97.706667 178.346667 170.666667 401.493333 170.666666 34.56 0 68.693333 0 102.826667-5.12a354.986667 354.986667 0 0 1-50.346667-145.493333c-17.493333 2.56-34.986667 3.413333-52.48 3.413333zM44.8 464.213333v97.28c0 97.706667 177.92 170.666667 401.493333 170.666667h54.186667a334.506667 334.506667 0 0 1 80.213333-173.653333 1093.12 1093.12 0 0 1-134.4 8.533333c-154.88 0.426667-309.76-33.706667-401.493333-102.826667zM959.146667 612.693333H640c-16.213333 0-22.613333 6.4-22.613333 23.04v279.04c0 16.64 6.4 23.04 22.613333 23.04h317.44c17.92 0 24.32-6.4 24.32-24.746666v-275.626667c1.706667-18.346667-4.693333-24.746667-22.613333-24.746667zM756.48 682.666667h89.6v61.866666h-89.6z m-23.04 232.106666h-90.026667V853.333333h90.026667z m0-85.333333h-90.026667V768h90.026667z m0-83.2h-85.333333a7.68 7.68 0 0 1-6.826667-5.12V682.666667h90.026667z m23.04 23.04h89.6v61.866667h-89.6z m91.306667 147.2h-90.026667V853.333333h90.026667z m112.64 0h-89.6V853.333333h89.6z m0-88.746667s-2.986667 5.12-4.693334 5.12h-85.333333V768h91.306667z m0-79.786666h-89.6V682.666667h89.6zM794.026667 414.293333v79.786667h-76.373334l88.32 113.066667L896 494.08h-76.8V414.293333z m47.786666 105.813334l-35.84 45.226666-35.413333-45.226666z'
    },
    {
      label: '数据表记录数',
      desc: '表内累计记录行数',
      value: records,
      vars: {
        '--c-main': '#FA8C16',
        '--c-icon-bg-from': '#ffe8cc',
        '--c-icon-bg-to': '#fff7e6',
        '--c-icon-border': '#ffd59155',
        '--c-icon-shadow': 'rgba(250,140,22,0.10)',
        '--c-corner-bg': 'rgba(250,140,22,0.08)',
        '--c-hover-border': '#ffd591',
        '--c-hover-shadow': 'rgba(250,140,22,0.10)'
      },
      iconPath: 'M364.771556 128.284444h290.247111c27.164444 0 49.066667-22.556444 49.066666-50.403555v-27.477333c0-27.875556-22.044444-50.403556-49.066666-50.403556H364.771556c-27.164444 0-49.066667 22.556444-49.066667 50.403556v27.477333c-0.113778 27.875556 21.902222 50.403556 49.066667 50.403555M653.653333 485.319111H322.844444c-28.387556 0-50.915556-23.182222-50.915555-51.399111s22.528-51.370667 50.915555-51.370667h331.946667c28.387556 0 50.915556 23.153778 50.915556 51.370667 0.853333 29.326222-22.641778 51.399111-52.024889 51.399111m-132.124445 222.577778H320.853333c-27.420444 0-49.92-23.182222-49.92-51.399111s22.499556-51.399111 49.92-51.399111h200.675556c27.392 0 49.891556 23.182222 49.891555 51.399111 0.995556 29.212444-21.504 51.399111-49.891555 51.399111M854.442667 67.527111h-82.716445v55.722667c0 39.424-31.203556 71.480889-69.745778 71.480889H312.149333c-38.542222 0-69.745777-32.056889-69.745777-71.480889V67.527111H164.124444C113.208889 67.527111 71.111111 109.795556 71.111111 163.157333v765.212445C71.111111 980.736 112.213333 1024 164.124444 1024h690.204445c52.849778 0 93.013333-42.268444 93.013333-95.630222V163.157333c0.113778-52.337778-41.016889-95.630222-92.899555-95.630222'
    },
    {
      label: 'API 服务数',
      desc: '已发布的 API 服务',
      value: api,
      vars: {
        '--c-main': '#13C2C2',
        '--c-icon-bg-from': '#ccfbfb',
        '--c-icon-bg-to': '#e6fffb',
        '--c-icon-border': '#87e8de55',
        '--c-icon-shadow': 'rgba(19,194,194,0.10)',
        '--c-corner-bg': 'rgba(19,194,194,0.08)',
        '--c-hover-border': '#87e8de',
        '--c-hover-shadow': 'rgba(19,194,194,0.10)'
      },
      iconPath: 'M1021.12 56.064l-53.248-53.184a10.368 10.368 0 0 0-14.272 0l-95.552 95.488A250.048 250.048 0 0 0 717.44 55.296a250.368 250.368 0 0 0-177.6 73.6L411.904 256.832a10.112 10.112 0 0 0 0 14.144l340.992 341.12c1.984 1.984 4.48 2.88 7.168 2.88 2.496 0 5.12-0.96 7.104-2.88l127.936-128a251.392 251.392 0 0 0 30.464-318.208L1021.12 70.4a10.24 10.24 0 0 0 0-14.272V56.064zM595.84 555.584a10.048 10.048 0 0 0-14.208 0L498.176 639.168l-113.344-113.28L468.48 442.048a10.048 10.048 0 0 0 0-14.208l-45.696-45.696a10.112 10.112 0 0 0-14.208 0L324.928 465.92l-53.952-54.016a9.92 9.92 0 0 0-7.104-2.816 10.624 10.624 0 0 0-7.168 2.816L128.896 539.904a251.392 251.392 0 0 0-30.464 318.208L2.944 953.664a10.048 10.048 0 0 0 0 14.208l53.184 53.184c1.984 2.048 4.544 2.944 7.168 2.944a10.368 10.368 0 0 0 7.104-2.88l95.552-95.552c41.536 28.16 90.496 43.136 140.672 43.072a250.24 250.24 0 0 0 177.6-73.6l127.872-127.872a10.048 10.048 0 0 0 0-14.208l-53.952-54.016 83.648-83.712a10.048 10.048 0 0 0 0-14.208l-45.888-45.44z'
    }
  ]
})

const buildLineOption = (
  theme: { main: string; from: string; to: string },
  name: string,
  labelKey: keyof TableDataType,
  unit?: string
) => {
  const inner = AssetOverviewLineData?.value
  const resolved = (isRef(inner) ? (inner as any).value : inner) as any
  const table = resolved?.table?.[0]
  const timeList = (table?.time ?? []) as string[]
  const valueList = ((table?.[labelKey] ?? []) as number[]) || []
  const { main, from, to } = theme
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#eef0f3',
      borderWidth: 1,
      padding: [10, 12],
      textStyle: {
        color: '#1d2129',
        fontSize: 13,
        lineHeight: 20
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: main,
          opacity: 0.25,
          width: 1,
          type: 'dashed'
        }
      },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params
        if (!p) return ''
        const marker = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${main};margin-right:6px;vertical-align:middle;"></span>`
        const v = (p.value ?? 0)
        const num = typeof v === 'number'
          ? v.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
          : String(v)
        const u = unit ? ` <span style="color:#86909c;margin-left:2px;">${unit}</span>` : ''
        return `
          <div style="font-size:12px;color:#86909c;margin-bottom:6px;">${p.axisValueLabel || p.name}</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;">
            <span>${marker}${name}</span>
            <span style="font-weight:600;color:#1d2129;margin-left:16px;">${num}${u}</span>
          </div>
        `
      }
    },
    grid: {
      left: '2%',
      right: '3%',
      top: '8%',
      bottom: '3%',
      containLabel: true,
      backgroundColor: 'transparent',
      borderColor: 'transparent'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeList,
      axisTick: { show: false },
      axisLine: {
        lineStyle: {
          color: '#f2f3f5',
          width: 1
        }
      },
      axisLabel: {
        color: '#86909c',
        fontSize: 11,
        margin: 8
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#86909c',
        fontSize: 11,
        margin: 8
      },
      splitLine: {
        lineStyle: {
          color: '#f2f3f5',
          width: 1,
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        emphasis: {
          focus: 'series',
          scale: 1.3,
          itemStyle: {
            borderColor: '#ffffff',
            borderWidth: 2
          }
        },
        lineStyle: {
          width: 3,
          color: main,
          shadowBlur: 10,
          shadowColor: `${main}4d`,
          shadowOffsetY: 3
        },
        itemStyle: {
          color: main,
          borderColor: '#ffffff',
          borderWidth: 2
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: from },
              { offset: 1, color: to }
            ]
          }
        },
        data: valueList
      }
    ]
  }
}

const tablesLineOption = computed(() =>
  buildLineOption(
    {
      main: '#1677ff',
      from: 'rgba(22,119,255,0.30)',
      to: 'rgba(22,119,255,0.02)'
    },
    '数据表总数',
    'totalTables'
  )
)

const sizeLineOption = computed(() =>
  buildLineOption(
    {
      main: '#FA8C16',
      from: 'rgba(250,140,22,0.30)',
      to: 'rgba(250,140,22,0.02)'
    },
    '数据存储量',
    'dataSize',
    'MB'
  )
)

const recordsLineOption = computed(() =>
  buildLineOption(
    {
      main: '#52C41A',
      from: 'rgba(82,196,26,0.30)',
      to: 'rgba(82,196,26,0.02)'
    },
    '存储记录数',
    'totalRecords'
  )
)

const apiLineOption = computed(() =>
  buildLineOption(
    {
      main: '#13C2C2',
      from: 'rgba(19,194,194,0.30)',
      to: 'rgba(19,194,194,0.02)'
    },
    'API 服务数',
    'totalApiInterface'
  )
)

const { taskLoadingRef } = toRefs(taskVariables)

onMounted(() => {
  initData()
  initLikeCollectData(1, 0)
  initLikeCollectData(0, 1)
})
</script>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.stat-card {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 14px;
  padding: 18px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eef0f3;
  overflow: hidden;
  transition: all 0.25s ease-out;
  box-sizing: border-box;
  min-height: 120px;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--c-main);
  opacity: 0.95;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 3px;
  right: 0;
  width: 90px;
  height: 110px;
  background: linear-gradient(135deg, var(--c-corner-bg) 0%, transparent 70%);
  border-radius: 0 0 0 100%;
  pointer-events: none;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--c-hover-border);
  box-shadow: 0 8px 20px var(--c-hover-shadow);
}

.stat-icon-wrap {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--c-icon-bg-from) 0%, var(--c-icon-bg-to) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--c-main);
  box-shadow: 0 4px 10px var(--c-icon-shadow), inset 0 0 0 1px var(--c-icon-border);
  position: relative;
  z-index: 1;
}

.stat-icon {
  width: 28px;
  height: 28px;
}

.stat-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7785;
  line-height: 1;
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  color: #1d2129;
  line-height: 1.1;
  letter-spacing: -0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.stat-desc {
  margin-top: 6px;
  font-size: 12px;
  color: #86909c;
  line-height: 1;
}

.chart-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eef0f3;
  padding: 18px;
  box-sizing: border-box;
  transition: all 0.25s ease-out;
}

.panel:hover {
  border-color: #e0e6ef;
  box-shadow: 0 4px 14px rgba(22, 119, 255, 0.05);
}

.panel-flex-1 {
  flex: 1;
  min-width: 0;
}

.filter-panel {
  margin-bottom: 12px;
  background: linear-gradient(135deg, #fafcff 0%, #f5f9ff 100%);
  border: 1px solid #e6eef8;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 13px;
  color: #4e5969;
  line-height: 1;
}

.filter-select {
  width: 160px;
}

.section-header {
  position: relative;
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 16px;
  padding-left: 12px;
}

.section-header::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #1677ff 0%, #4096ff 100%);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.4;
}

.section-desc {
  font-size: 12px;
  color: #86909c;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  line-height: 1.4;
}

.section-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-link {
  text-decoration: none;
  color: #0974f1;
  font-size: 12px;
  transition: color 0.2s ease;
}

.section-link:hover {
  color: #0054d9;
}

.section-select {
  width: 150px;
}

.chart-wrap {
  width: 100%;
  border-radius: 10px;
  background: linear-gradient(135deg, #fafcff 0%, #f5f9ff 100%);
  border: 1px solid #f0f4fa;
  padding: 8px;
  box-sizing: border-box;
}

.table-wrap {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #f0f4fa;
}

.list-scroll {
  padding: 8px 0;
  background: linear-gradient(135deg, #fafcff 0%, #f5f9ff 100%);
  border: 1px solid #f0f4fa;
  border-radius: 10px;
  box-sizing: border-box;
  max-height: 240px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.list-scroll::-webkit-scrollbar {
  display: none;
}

.list-item {
  background: #fff;
  margin: 0 8px 8px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #eef0f3;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.list-item:last-child {
  margin-bottom: 0;
}

.list-item:hover {
  background: #ffffff;
  border-color: #d6e4ff;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.06);
}

.item-main-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-icon {
  flex-shrink: 0;
}

.item-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  font-weight: 500;
  color: #1d2129;
}

.item-time {
  flex-shrink: 0;
  font-size: 12px;
  color: #86909c;
  margin-right: 8px;
}

.item-stat {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #86909c;
}

.item-stat-num {
  font-size: 12px;
  color: #86909c;
}
</style>
