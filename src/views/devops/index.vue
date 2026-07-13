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
      <span class="section-desc">按选择时间范围查看任务运行状态与趋势</span>
    </div>
    <div class="filter-row">
      <n-select
        size="small"
        :value="ProjName"
        :default-value="ProjName"
        :options="ProjSelect"
        class="filter-select"
        style="display:none;"
        @update:value="handleProjData"
      />
      <span class="filter-label">日期范围</span>
      <n-date-picker
        v-model:value="datePickerRange"
        type="datetimerange"
        size="small"
        :start-placeholder="t('project.task.start_time')"
        :end-placeholder="t('project.task.end_time')"
        @update:value="handleTaskData"
        clearable
      />
    </div>
  </div>

  <div class="stats-row">
    <router-link
      v-for="(item, index) in statCards"
      :key="'sc-' + index"
      :to="item.link"
      class="stat-link"
    >
      <div class="stat-card" :style="item.vars">
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
    </router-link>
  </div>

  <div class="chart-row">
    <div class="panel panel-flex-2">
      <div class="section-header">
        <span class="section-title">实例运行时段分布</span>
        <span class="section-desc">按日期聚合的实例数量变化趋势</span>
      </div>
      <div class="chart-wrap chart-wrap-line">
        <MyChart
          v-if="resolvedChartData.length > 0 && resolvedChartData[0]?.时间?.length > 0"
          :option="runTrendLineOption"
          height="290px"
        />
      </div>
    </div>
  </div>

  <div class="chart-row">
    <div class="panel panel-flex-2">
      <div class="section-header">
        <span class="section-title">实例类别占比</span>
        <span class="section-desc">不同任务类型的实例分布情况</span>
      </div>
      <div class="chart-wrap">
        <div class="pie-wrap">
          <div class="pie-left">
            <TaskPie
              v-if="resolvedTaskPie.chart && resolvedTaskPie.chart.length > 0"
              :data="resolvedTaskPie.chart"
              :task-total-num="resolvedTaskPie.table && resolvedTaskPie.table.length > 0 ? resolvedTaskPie.table[0].taskTotalNum : 0"
              :colors="colors"
              height="350px"
            />
          </div>
          <div class="pie-right">
            <div
              v-for="(item, index) in progressElements"
              :key="'pe-' + index"
              class="progress-row"
            >
              <div class="progress-dot" :style="{ background: colors[index % colors.length] }"></div>
              <div class="progress-name">{{ item.name }}</div>
              <n-progress :percentage="item.ratio" :height="15" class="progress-bar" :show-indicator="false" />
              <div class="progress-value">{{ item.displayRatio }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="chart-row">
    <div class="panel panel-flex-1">
      <div class="section-header">
        <span class="section-title">作业运行时长排行 TOP10</span>
        <span class="section-desc">按最大运行时长从高到低排序</span>
        <div class="section-right">
          <n-select
            size="small"
            :value="RunSelectCurrent"
            default-value="今天"
            :options="RunSelect"
            class="section-select"
            @update:value="handleRunTop10Data"
          />
        </div>
      </div>
      <div class="table-wrap">
        <n-data-table
          :columns="RunSelectHeader"
          :data="resolvedRunTop10Data"
          size="small"
          striped
          :single-line="false"
          min-height="150"
          max-height="300"
        />
      </div>
    </div>

    <div class="panel panel-flex-1">
      <div class="section-header">
        <span class="section-title">作业运行出错排行 TOP10</span>
        <span class="section-desc">按出错次数从高到低排序</span>
        <div class="section-right">
          <n-select
            size="small"
            :value="RunErrorSelectCurrent"
            default-value="今天"
            :options="RunSelect"
            class="section-select"
            @update:value="handleRunErrorTop10Data"
          />
        </div>
      </div>
      <div class="table-wrap">
        <n-data-table
          :columns="RunErrorSelectHeader"
          :data="resolvedRunErrorTop10Data"
          size="small"
          striped
          :single-line="false"
          min-height="150"
          max-height="300"
        />
      </div>
    </div>
  </div>

  <div class="chart-row">
    <div class="panel panel-flex-2">
      <div class="section-header">
        <span class="section-title">API 调用次数 TOP10</span>
        <span class="section-desc">按访问次数从高到低排序</span>
        <div class="section-right">
          <n-select
            size="small"
            :value="ApiSelectCurrent"
            default-value="今天"
            :options="RunSelect"
            class="section-select"
            @update:value="handleApiTop10Data"
          />
        </div>
      </div>
      <div class="table-wrap">
        <n-data-table
          :columns="ApiTop10DataHeader"
          :data="resolvedApiTop10Data"
          striped
          :single-line="false"
          size="small"
          min-height="150"
          max-height="300"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, toRefs, watch, isRef, unref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAsyncState } from '@vueuse/core'
import { format } from 'date-fns'
import { toLower } from 'lodash'
import {
  NGrid,
  NGi,
  NProgress,
  NDataTable,
  NDatePicker,
  NSpace,
  NSelect
} from 'naive-ui'
import TaskPie from '@/components/chart/modules/TaskPie'
import MyChart from '@/components/chart/modules/MyChart'
import CrudSplit from '@/components/cue/crud-split.vue'
import Card from '@/components/card'
import { countTaskState } from '@/service/modules/projects-analysis'
import type { TaskStateRes } from '@/service/modules/projects-analysis/types'
import {
  getInterfaceTop10,
  getJobRunErrorTop10,
  getJobRuntimeTop10,
  getTaskStatisticsInfo,
  queryUnauthorizedProject,
  getDataByProjectCodeAndDate,
  getStatisticsDataByProjectCodeAndDate
} from '@/service/modules/devops-analysis'
import { countProcessInstanceState } from '@/service/modules/projects-analysis'

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
  table?: { title: string; key: string }[]
  processTable?: { number: number; state: string }[]
  chart: Array<StateChartData>
  tableCount?: Record<string, number>[]
}

interface TableDataType {
  正在运行: number[]
  失败: number[]
  暂停: number[]
  成功: number[]
  停止: number[]
  时间: number[]
}

const { t, locale } = useI18n()

const taskVariables = reactive({
  taskLoadingRef: ref(false)
})

function useTaskState() {
  const getTaskState = (date: Array<any>) => {
    if (taskVariables.taskLoadingRef) return
    taskVariables.taskLoadingRef = true
    const { state } = useAsyncState(
      countTaskState({
        startDate: !date ? '' : format(date[0], 'yyyy-MM-dd HH:mm:ss'),
        endDate: !date ? '' : format(date[1], 'yyyy-MM-dd HH:mm:ss'),
        projectCode: 0
      }).then((res: TaskStateRes): StateData => {
        const table: { title: string; key: string }[] = res.taskCountDtos.map((item: any) => {
          return {
            title: t('home.' + toLower(item.taskStateType)),
            key: t('home.' + toLower(item.taskStateType))
          }
        })
        const tableData: Record<string, number> = {}
        for (let i = 0; i < res.taskCountDtos.length; i++) {
          tableData[t('home.' + toLower(res.taskCountDtos[i].taskStateType))] = res.taskCountDtos[i].count
        }
        const tableCount = [tableData]
        const chart = res.taskCountDtos.map((item: any) => {
          return {
            value: item.count,
            name: t('home.' + toLower(item.taskStateType))
          }
        })
        taskVariables.taskLoadingRef = false
        return { table, chart, tableCount }
      }),
      { table: [], chart: [], tableCount: [] }
    )
    return state
  }

  const getTaskDev = (date: Array<any>, projectCode: any) => {
    const { state } = useAsyncState(
      getStatisticsDataByProjectCodeAndDate({
        startTime: !date ? '' : format(date[0][0], 'yyyy-MM-dd HH:mm:ss'),
        endTime: !date ? '' : format(date[0][1], 'yyyy-MM-dd HH:mm:ss'),
        projectCode
      }).then(function (res: any) {
        const table = [0, 0, 0, 0, 0, 0]
        if (res[0] != null) {
          for (let i = 0; i < res.length; i++) {
            table[3] = res[i].running
            table[2] = res[i].fail
            table[4] = res[i].paused
            table[5] = res[i].stoped
            table[1] = res[i].succeed
            table[0] = res[i].running + res[i].fail + res[i].paused + res[i].stoped + res[i].succeed
          }
        }
        const header = [
          { title: '实例总数', key: '实例总数' },
          { title: '成功', key: '成功' },
          { title: '失败', key: '失败' },
          { title: '正在运行', key: '正在运行' },
          { title: '暂停', key: '暂停' },
          { title: '停止', key: '停止' }
        ]
        return { table, header }
      }),
      { table: [], header: [] }
    )
    return state
  }

  const getTaskData = (date: Array<any>, projectCode: any) => {
    const { state } = useAsyncState(
      getDataByProjectCodeAndDate({
        startTime: !date ? '' : format(date[0][0], 'yyyy-MM-dd HH:mm:ss'),
        endTime: !date ? '' : format(date[0][1], 'yyyy-MM-dd HH:mm:ss'),
        projectCode
      }).then(function (res: any) {
        const tableData: TableDataType = {
          正在运行: [],
          失败: [],
          暂停: [],
          成功: [],
          停止: [],
          时间: []
        }
        for (let i = 0; i < res.length; i++) {
          tableData['正在运行'].push(res[i].running)
          tableData['失败'].push(res[i].fail)
          tableData['暂停'].push(res[i].paused)
          tableData['停止'].push(res[i].stoped)
          tableData['成功'].push(res[i].succeed)
          tableData['时间'].push(res[i].dayTime)
        }
        const table = [tableData]
        return { table }
      }),
      { table: [] }
    )
    return state
  }

  const getTaskStatisticsInfoData = (date: Array<any>, projectCode: any) => {
    if (taskVariables.taskLoadingRef) return
    taskVariables.taskLoadingRef = true
    const { state } = useAsyncState(
      getTaskStatisticsInfo({ projectCode }).then(function (res: any) {
        const table = res.map((item: any) => {
          return {
            value: item.taskNum,
            name: item.taskType,
            ratio: item.ratio !== null ? item.ratio : 0,
            taskTotalNum: item.taskTotalNum
          }
        })
        const chart = res.map((item: any) => {
          return {
            value: item.taskNum,
            name: item.taskType
          }
        })
        taskVariables.taskLoadingRef = false
        return { table, chart }
      }),
      { table: [], chart: [] }
    )
    return state
  }

  const getJobRuntimeTop10Data = (date: Array<any>, projectCode: any) => {
    const { state } = useAsyncState(
      getJobRuntimeTop10({
        startTime: !date ? '' : format(date[0], 'yyyy-MM-dd HH:mm:ss'),
        endTime: !date ? '' : format(date[1], 'yyyy-MM-dd HH:mm:ss'),
        projectCode
      }).then(function (res: any) {
        const table = res.map((item: any, index: any) => {
          return {
            排名: index + 1,
            任务名名称: item.taskName,
            工作流名称: item.processName,
            任务代码: item.taskCode,
            最大运行时长: item.taskRunTime
          }
        })
        return { table }
      }),
      { table: [] }
    )
    return state
  }

  const getJobRunErrorTop10Data = (date: Array<any>, projectCode: any) => {
    const { state } = useAsyncState(
      getJobRunErrorTop10({
        startTime: !date ? '' : format(date[0], 'yyyy-MM-dd HH:mm:ss'),
        endTime: !date ? '' : format(date[1], 'yyyy-MM-dd HH:mm:ss'),
        projectCode
      }).then(function (res: any) {
        const table = res.map((item: any, index: any) => {
          return {
            排名: index + 1,
            任务名: item.taskName,
            业务流程: item.NAME,
            出错次数: item.taskError
          }
        })
        return { table }
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
        projectCode
      }).then(function (res: any) {
        const table = res.map((item: any, index: any) => {
          return {
            排名: index + 1,
            接口地址: item.interfaceUrl,
            接口类型: item.interfaceUrlType === 1 ? '接口开发' : '接口注册',
            接口访问次数: item.interfaceNum
          }
        })
        return { table }
      }),
      { table: [] }
    )
    return state
  }

  return {
    getTaskState,
    taskVariables,
    getTaskData,
    getTaskDev,
    getTaskStatisticsInfoData,
    getJobRuntimeTop10Data,
    getJobRunErrorTop10Data,
    getInterfaceTop10Data
  }
}

const processVariables = reactive({
  processLoadingRef: ref(false)
})

function useProcessState() {
  const getProcessState = (date: Array<number>) => {
    if (processVariables.processLoadingRef) return
    processVariables.processLoadingRef = true
    const { state } = useAsyncState(
      countProcessInstanceState({
        startDate: !date ? '' : format(date[0], 'yyyy-MM-dd HH:mm:ss'),
        endDate: !date ? '' : format(date[1], 'yyyy-MM-dd HH:mm:ss'),
        projectCode: 0
      }).then((res: TaskStateRes): StateData => {
        const processTable: { number: number; state: string }[] = res.taskCountDtos.map((item) => {
          return {
            state: t('home.' + toLower(item.taskStateType)),
            number: item.count
          }
        })
        const chart = res.taskCountDtos.map((item) => {
          return {
            value: item.count,
            name: t('home.' + toLower(item.taskStateType))
          }
        })
        processVariables.processLoadingRef = false
        return { processTable, chart }
      }),
      { processTable: [], chart: [] }
    )
    return state
  }
  return { getProcessState, processVariables }
}

const {
  getInterfaceTop10Data,
  getJobRunErrorTop10Data,
  getJobRuntimeTop10Data,
  getTaskStatisticsInfoData,
  getTaskState,
  getTaskData,
  getTaskDev
} = useTaskState()

const { processVariables: _processVariables } = useProcessState()

const route = useRoute()
const router = useRouter()

const dateRef = ref([
  [
    new Date(new Date().setHours(0, 0, 0, 0)).getTime() - 6 * 24 * 60 * 60 * 1000,
    new Date(new Date().setHours(0, 0, 0, 0)).getTime() + 24 * 60 * 60 * 1000
  ]
])

const datePickerRange = ref<[number, number]>([
  new Date(new Date().setHours(0, 0, 0, 0)).getTime() - 6 * 24 * 60 * 60 * 1000,
  new Date(new Date().setHours(0, 0, 0, 0)).getTime() + 24 * 60 * 60 * 1000
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

const Proj = ref<any>()
const ProjName = ref<any>()
const ProjSelect = ref<any[]>([])
const taskStateRef = ref<any>()
const processStateRef = ref<any>()
const taskDataRef = ref<any>()
const taskDevRef = ref<any>()
const taskPieData = ref<any>()
const RunTop10 = ref<any>()
const RunErrorTop10 = ref<any>()
const ApiTop10 = ref<any>()
const RunSelectCurrent = ref<any>()
const RunErrorSelectCurrent = ref<any>()
const ApiSelectCurrent = ref<any>('今天')

const colors = [
  '#6e40aa', '#c83dac', '#ff5375', '#ff8c38', '#c9d33a',
  '#79f659', '#28ea8d', '#1eb8d0', '#cab2d6', '#6a3d9a',
  '#E6FF33', '#33FFC7', '#FFC733', '#33C7FF', '#C733FF',
  '#FF3357', '#33FF33', '#33FFC7', '#FF33C7', '#33C7FF',
  '#C73333', '#33C733', '#FF57E6', '#E6FF57', '#57E6FF'
]

const RunSelectHeader = [
  { title: '排名', key: '排名', width: 60 },
  { title: '任务名名称', key: '任务名名称' },
  { title: '工作流名称', key: '工作流名称' },
  { title: '最大运行时长', key: '最大运行时长', width: 130 }
]

const RunErrorSelectHeader = [
  { title: '排名', key: '排名', width: 60 },
  { title: '任务名', key: '任务名' },
  { title: '业务流程', key: '业务流程' },
  { title: '出错次数', key: '出错次数', width: 100 }
]

const ApiTop10DataHeader = [
  { title: '排名', key: '排名', width: 60 },
  { title: '接口地址', key: '接口地址' },
  { title: '接口类型', key: '接口类型' },
  { title: '接口访问次数', key: '接口访问次数' }
]

Proj.value = route.params.projectCode

RunTop10.value = getJobRuntimeTop10Data(
  [
    new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
    new Date(new Date().setHours(23, 59, 59, 999)).getTime()
  ],
  Proj.value
)
RunErrorTop10.value = getJobRunErrorTop10Data(
  [
    new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
    new Date(new Date().setHours(23, 59, 59, 999)).getTime()
  ],
  Proj.value
)
ApiTop10.value = getInterfaceTop10Data(
  [
    new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
    new Date(new Date().setHours(23, 59, 59, 999)).getTime()
  ],
  Proj.value
)

const handleRunTop10Data = (val: any) => {
  RunTop10.value = getJobRuntimeTop10Data(val, Proj.value)
  RunSelectCurrent.value = RunSelect.value.filter((item) => item.value[0] === val[0])[0].label
}

const handleRunErrorTop10Data = (val: any) => {
  RunErrorTop10.value = getJobRunErrorTop10Data(val, Proj.value)
  RunErrorSelectCurrent.value = RunSelect.value.filter((item) => item.value[0] === val[0])[0].label
}

const handleApiTop10Data = (val: any) => {
  ApiTop10.value = getInterfaceTop10Data(val, Proj.value)
  ApiSelectCurrent.value = RunSelect.value.filter((item) => item.value[0] === val[0])[0].label
}

const handleTaskData = (val: any) => {
  if (!val) return
  taskDataRef.value = getTaskData([val], Proj.value)
  taskDevRef.value = getTaskDev([val], Proj.value)
  taskPieData.value = getTaskStatisticsInfoData([val], Proj.value)
  dateRef.value = [val]
  datePickerRange.value = val
}

const handleProjData = (val: any) => {
  taskDataRef.value = getTaskData(dateRef.value, val)
  taskDevRef.value = getTaskDev(dateRef.value, val)
  taskPieData.value = getTaskStatisticsInfoData(dateRef.value, val)
  Proj.value = val
  const currentRoute = router.currentRoute.value as any
  currentRoute.params.projectCode = val
  router.replace(currentRoute)
  ProjName.value = ProjSelect.value.filter((item: any) => item.value === val).label
}

const initData = () => {
  taskStateRef.value = getTaskState(dateRef.value as any) || taskStateRef.value
  taskDataRef.value = getTaskData(dateRef.value, Proj.value) || taskDataRef.value
  taskDevRef.value = getTaskDev(dateRef.value, Proj.value) || taskDevRef.value
  taskPieData.value = getTaskStatisticsInfoData(dateRef.value, Proj.value)
}

taskDevRef.value = getTaskDev(dateRef.value, Proj.value)
taskDataRef.value = getTaskData(dateRef.value, Proj.value) || taskDataRef.value
taskPieData.value = getTaskStatisticsInfoData(dateRef.value, Proj.value)

const initProjData = async () => {
  const { state } = useAsyncState(
    queryUnauthorizedProject({ userId: 0 }).then(function (res: any) {
      const table = res.map((item: any) => {
        return { label: item.name, value: item.code }
      })
      ProjName.value = table
        .filter((item: any) => item.value.toString() === route.params.projectCode)
        .map((item: any) => item.label)[0]
      ProjSelect.value = table
      return { table, Proj }
    }),
    { table: [] }
  )
  return state
}
initProjData()

watch(
  () => locale.value,
  () => initData()
)

onMounted(() => {
  initData()
})

const unwrap = <T = any>(val: any): T => {
  if (isRef(val)) return unref(val) as T
  return val as T
}

function _encodeTimeRange(range: any) {
  if (!Array.isArray(range) || range.length !== 2) return ''
  const [a, b] = range
  const s = typeof a === 'number' ? a : Number(a)
  const e = typeof b === 'number' ? b : Number(b)
  if (!Number.isFinite(s) || !Number.isFinite(e)) return ''
  return encodeURIComponent(`${s},${e}`)
}

const ALL = computed(() => `/devops/${route.params.projectCode}/task/instances?timeRange=${_encodeTimeRange(datePickerRange.value)}`)
const SUCCESS = computed(() => `/devops/${route.params.projectCode}/task/instances?stateType=SUCCESS&timeRange=${_encodeTimeRange(datePickerRange.value)}`)
const FAILURE = computed(() => `/devops/${route.params.projectCode}/task/instances?stateType=FAILURE&timeRange=${_encodeTimeRange(datePickerRange.value)}`)
const RUNNING_EXECUTION = computed(() => `/devops/${route.params.projectCode}/task/instances?stateType=RUNNING_EXECUTION&timeRange=${_encodeTimeRange(datePickerRange.value)}`)
const STOP = computed(() => `/devops/${route.params.projectCode}/task/instances?stateType=STOP&timeRange=${_encodeTimeRange(datePickerRange.value)}`)
const PAUSE = computed(() => `/devops/${route.params.projectCode}/task/instances?stateType=PAUSE&timeRange=${_encodeTimeRange(datePickerRange.value)}`)

const resolvedTaskDev = computed(() => unwrap<any>(taskDevRef.value) || { table: [], header: [] })
const resolvedTableCount = computed<any[]>(() => {
  const d = resolvedTaskDev.value
  if (d && Array.isArray(d.table) && d.table.length) return d.table
  return [0, 0, 0, 0, 0, 0]
})

const statCards = computed(() => {
  const c = resolvedTableCount.value
  const total = c[0] ?? 0
  const success = c[1] ?? 0
  const fail = c[2] ?? 0
  const running = c[3] ?? 0
  const paused = c[4] ?? 0
  const stoped = c[5] ?? 0
  return [
    {
      label: '实例总数',
      desc: '已统计的全部实例',
      value: total,
      link: ALL.value,
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
      iconPath: 'M67.1 310.4c-6.7 3.7-6.7 14.1 0 17.7l423.3 239.2c12.2 6.7 27.5 6.7 39.8 0l423.3-239.2c6.7-3.7 6.7-14.1 0-17.7L519.2 65.1c-5.5-3.1-12.2-3.1-17.7 0L67.1 310.4zM954.1 503.1l-89.3-50.8L563.2 623c-15.9 9.2-34.3 13.5-52 13.5-17.7 0-36.1-4.3-52-13.5L156.5 452.3l-89.3 50.8c-6.7 3.7-6.7 14.1 0 17.7L490.4 760c12.2 6.7 27.5 6.7 39.8 0l423.3-239.2c7.3-4.2 7.3-14 0.6-17.7zM954.1 697.6L863 646.2 562.6 815.7c-15.9 9.2-34.3 13.5-52 13.5s-36.1-4.3-52-13.5L158.3 646.2l-91.1 51.4c-6.7 3.7-6.7 14.1 0 17.7l423.3 239.2c12.2 6.7 27.5 6.7 39.8 0l423.3-239.2c7.2-4.2 7.2-14 0.5-17.7z'
    },
    {
      label: '成功',
      desc: '已成功执行的实例',
      value: success,
      link: SUCCESS.value,
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
      iconPath: 'M512 41.472c-129.901714 0-247.661714 52.662857-332.8 137.801143A469.211429 469.211429 0 0 0 41.545143 512c0 129.901714 52.662857 247.661714 137.801143 332.726857A469.211429 469.211429 0 0 0 512 982.528c129.901714 0 247.661714-52.662857 332.726857-137.801143A469.211429 469.211429 0 0 0 982.528 512c0-129.901714-52.662857-247.661714-137.801143-332.8A469.211429 469.211429 0 0 0 512 41.545143zM787.382857 384L500.370286 671.012571a43.885714 43.885714 0 0 1-62.098286 0L279.259429 512l62.098286-62.098286 128 128 256-256 62.025143 62.098286z'
    },
    {
      label: '失败',
      desc: '执行失败的实例数',
      value: fail,
      link: FAILURE.value,
      vars: {
        '--c-main': '#F5222D',
        '--c-icon-bg-from': '#fff1f0',
        '--c-icon-bg-to': '#fff7f6',
        '--c-icon-border': '#ffa39e55',
        '--c-icon-shadow': 'rgba(245,34,45,0.10)',
        '--c-corner-bg': 'rgba(245,34,45,0.08)',
        '--c-hover-border': '#ffa39e',
        '--c-hover-shadow': 'rgba(245,34,45,0.10)'
      },
      iconPath: 'M512 41.472a470.528 470.528 0 1 0 0 941.056A470.528 470.528 0 0 0 512 41.472zM574.025143 512l146.285714-146.285714L658.285714 303.616l-146.285714 146.285714-146.285714-146.285714L303.542857 365.714286l146.285714 146.285714-146.285714 146.285714L365.714286 720.384l146.285714-146.285714 146.285714 146.285714L720.310857 658.285714l-146.285714-146.285714z'
    },
    {
      label: '正在运行',
      desc: '当前运行中的实例',
      value: running,
      link: RUNNING_EXECUTION.value,
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
      iconPath: 'M501.94 0A502.121 502.121 0 0 0 0 501.94c0 277.083 224.858 502.002 501.94 502.002s502.002-224.919 502.002-502.001S779.023 0 501.94 0zM401.59 677.647V326.295c0-20.6 23.552-32.648 40.116-20.119l234.436 175.706c13.553 10.06 13.553 30.118 0 40.177L441.705 697.705a25.058 25.058 0 0 1-40.116-20.058z'
    },
    {
      label: '暂停',
      desc: '处于暂停状态实例',
      value: paused,
      link: PAUSE.value,
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
      iconPath: 'M874.058005 149.941995a510.06838 510.06838 0 1 0 109.740156 162.738976 511.396369 511.396369 0 0 0-109.740156-162.738976zM417.954256 281.533601a41.046923 41.046923 0 0 0-41.77128 40.201839v385.116718a41.892007 41.892007 0 0 0 83.663287 0v-385.116718a41.167649 41.167649 0 0 0-41.892007-40.201839zM606.045744 281.533601a41.046923 41.046923 0 0 0-41.77128 40.201839v385.116718a41.892007 41.892007 0 0 0 83.663287 0v-385.116718a41.167649 41.167649 0 0 0-41.892007-40.201839z'
    },
    {
      label: '停止',
      desc: '已停止运行的实例',
      value: stoped,
      link: STOP.value,
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
      iconPath: 'M510.9 60.7c-245.6 0-446.7 199.8-446.7 446.7C64.2 753 263.9 954 510.8 954s446.6-199.7 446.6-446.6c0.1-245.6-199.6-446.7-446.5-446.7z m139.8 574c0 8.8-7.2 16-16 16H389.3c-8.8 0-16-7.2-16-16V389.3c0-8.8 7.2-16 16-16h245.5c8.8 0 16 7.2 16 16v245.4z'
    }
  ]
})

const resolvedChartData = computed(() => {
  const inner = taskDataRef.value
  const resolved = unwrap<any>(inner) || { table: [] }
  return Array.isArray(resolved.table) ? resolved.table : []
})

const resolvedTaskPie = computed(() => {
  const inner = taskPieData.value
  const resolved = unwrap<any>(inner) || { table: [], chart: [] }
  return {
    table: Array.isArray(resolved.table) ? resolved.table : [],
    chart: Array.isArray(resolved.chart) ? resolved.chart : []
  }
})

const progressElements = computed<any[]>(() => {
  const table = resolvedTaskPie.value.table
  if (!Array.isArray(table)) return []
  return table
    .filter((item: any) => item && item.ratio !== 0)
    .map((item: any) => {
      const ratio: number = Number(item.ratio || 0)
      const formattedRatio = ratio.toFixed(1)
      return {
        name: item.name,
        ratio,
        displayRatio: `${formattedRatio}% | ${item.value}`
      }
    })
})

const _unwrapTable = (wrapped: any) => {
  const inner = unwrap<any>(wrapped)
  return Array.isArray(inner?.table) ? inner.table : []
}

const resolvedRunTop10Data = computed(() => _unwrapTable(RunTop10.value))
const resolvedRunErrorTop10Data = computed(() => _unwrapTable(RunErrorTop10.value))
const resolvedApiTop10Data = computed(() => _unwrapTable(ApiTop10.value))

const runTrendSeriesThemes: Record<string, { main: string; from: string; to: string }> = {
  成功: { main: '#52C41A', from: 'rgba(82,196,26,0.26)', to: 'rgba(82,196,26,0.02)' },
  失败: { main: '#F5222D', from: 'rgba(245,34,45,0.22)', to: 'rgba(245,34,45,0.02)' },
  正在运行: { main: '#FA8C16', from: 'rgba(250,140,22,0.18)', to: 'rgba(250,140,22,0.02)' },
  暂停: { main: '#722ED1', from: 'rgba(114,46,209,0.18)', to: 'rgba(114,46,209,0.02)' },
  停止: { main: '#13C2C2', from: 'rgba(19,194,194,0.18)', to: 'rgba(19,194,194,0.02)' }
}

const runTrendLineOption = computed(() => {
  const table = (resolvedChartData.value?.[0] ?? {}) as Partial<TableDataType>
  const timeList = (table.时间 ?? []) as Array<string | number>
  const keys = ['成功', '失败', '正在运行', '暂停', '停止'] as const

  const series = keys.map((name) => {
    const theme = runTrendSeriesThemes[name]
    const main = theme.main
    const needArea = name === '成功' || name === '失败'
    const data = ((table as any)[name] ?? []) as Array<number>
    return {
      name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: false,
      emphasis: {
        focus: 'series',
        scale: 1.3,
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 }
      },
      lineStyle: {
        width: needArea ? 3 : 2.4,
        color: main,
        shadowBlur: needArea ? 10 : 6,
        shadowColor: `${main}3d`,
        shadowOffsetY: needArea ? 3 : 2
      },
      itemStyle: { color: main, borderColor: '#ffffff', borderWidth: 2 },
      ...(needArea
        ? {
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: theme.from },
                  { offset: 1, color: theme.to }
                ]
              }
            }
          }
        : {}),
      data
    }
  })

  const orderedColors = keys.map((k) => runTrendSeriesThemes[k].main)

  return {
    color: orderedColors,
    legend: {
      data: [...keys],
      icon: 'roundRect',
      itemWidth: 14,
      itemHeight: 4,
      itemGap: 18,
      right: 4,
      top: 4,
      textStyle: { color: '#4e5969', fontSize: 12 }
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#eef0f3',
      borderWidth: 1,
      padding: [10, 12],
      textStyle: { color: '#1d2129', fontSize: 13, lineHeight: 20 },
      axisPointer: {
        type: 'line',
        lineStyle: { color: 'rgba(22,119,255,0.25)', width: 1, type: 'dashed' }
      }
    },
    grid: {
      left: '2%',
      right: '3%',
      top: '40',
      bottom: '16',
      containLabel: true,
      backgroundColor: 'transparent',
      borderColor: 'transparent'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeList,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#f2f3f5', width: 1 } },
      axisLabel: { color: '#86909c', fontSize: 11, margin: 8 }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#86909c', fontSize: 11, margin: 8 },
      splitLine: { lineStyle: { color: '#f2f3f5', width: 1, type: 'dashed' } }
    },
    series
  }
})

const { taskLoadingRef } = toRefs(taskVariables)
</script>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.stat-link {
  text-decoration: none;
  color: inherit;
  min-width: 0;
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
  height: 100%;
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

.panel-flex-2 {
  flex: 2;
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
  padding: 10px;
  box-sizing: border-box;
}

.chart-wrap-line {
  min-height: 310px;
}

.table-wrap {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #f0f4fa;
  background: #ffffff;
}

.pie-wrap {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  height: 370px;
  padding: 8px 12px;
  box-sizing: border-box;
  gap: 16px;
}

.pie-left {
  flex: 1;
  min-width: 0;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e6ecf4;
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(22, 119, 255, 0.03);
}

.pie-right {
  flex: 1;
  min-width: 0;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e6ecf4;
  padding: 8px 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: 0 1px 4px rgba(22, 119, 255, 0.03);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.pie-right::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 9px;
  margin-bottom: 5px;
  border-radius: 8px;
  background: linear-gradient(135deg, #eef5ff 0%, #f5f9ff 100%);
  border: 1px solid #e3ecfa;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.progress-row:last-child {
  margin-bottom: 0;
}

.progress-row:hover {
  background: linear-gradient(135deg, #e6f0ff 0%, #eef5ff 100%);
  border-color: #c8dcff;
  box-shadow: 0 2px 6px rgba(22, 119, 255, 0.07);
}

.progress-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9);
}

.progress-name {
  width: 24%;
  min-width: 60px;
  text-align: left;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
  color: #1d2129;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.progress-bar {
  flex-grow: 1;
  min-width: 80px;
}

.progress-value {
  width: auto;
  min-width: 78px;
  text-align: right;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 500;
  color: #4e5969;
  white-space: nowrap;
  line-height: 1.3;
  font-variant-numeric: tabular-nums;
}

.hover_div {
  transition: border-color 0.3s, box-shadow 0.3s;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
