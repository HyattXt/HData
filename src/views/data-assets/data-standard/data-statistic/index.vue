<template>
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
          <n-tooltip trigger="hover">
            <template #trigger>
              <NIcon size="14" class="tip-icon"><QuestionCircle28Regular/></NIcon>
            </template>
            {{ item.tip }}
          </n-tooltip>
        </div>
        <div class="stat-value">
          <template v-if="item.sub">
            {{ indexData[item.valueKey1] }}<span class="stat-slash">/</span>{{ indexData[item.valueKey2] }}
          </template>
          <template v-else>
            {{ indexData[item.valueKey] }}
          </template>
        </div>
        <div v-if="item.desc" class="stat-desc">{{ item.desc }}</div>
      </div>
    </div>
  </div>
  <div class="chart-row">
    <div class="panel panel-flex-1">
      <div class="section-header">
        <span class="section-title">热门标准云图</span>
        <span class="section-desc">
          数据元映射至数据模型
          <n-tooltip trigger="hover">
            <template #trigger>
              <NIcon size="14" class="tip-icon"><QuestionCircle28Regular/></NIcon>
            </template>
            按照数据元被引用的次数从高至低排列
          </n-tooltip>
        </span>
      </div>
      <div class="chart-wrap">
        <MyChart :option="cloudOption" height="376px" :key="cloudChartKey"/>
      </div>
    </div>
    <div class="panel panel-flex-1">
      <div class="section-header">
        <span class="section-title">数据元落标情况</span>
        <span class="section-desc">落标数与落标率统计趋势</span>
      </div>
      <div class="rate-summary-row">
        <div class="rate-tag rate-tag-count">
          <div class="rate-icon">
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M832 64H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-600 72h560v208H232V136zm560 480H232V408h560v208zm0 272H232V680h560v208z" fill="#3F76DD"/></svg>
          </div>
          <div class="rate-info">
            <div class="rate-value">{{ total ?? 0 }}</div>
            <div class="rate-label">总落标数</div>
          </div>
        </div>
        <div class="rate-tag rate-tag-rate">
          <div class="rate-icon">
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="16" height="16"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" fill="#3bb969"/><path d="M686.7 638.6L544.1 535.5V288c0-4.4-3.6-8-8-8H488c-4.4 0-8 3.6-8 8v275.4c0 2.6 1.2 5 3.3 6.5l165.4 120.6c3.6 2.6 8.6 1.8 11.2-1.7l28.6-39c2.7-3.7 1.9-8.7-1.8-11.2z" fill="#3bb969"/></svg>
          </div>
          <div class="rate-info">
            <div class="rate-value">{{ rate ?? '0%' }}</div>
            <div class="rate-label">总落标率</div>
          </div>
        </div>
      </div>
      <div class="chart-wrap">
        <MyChart :option="barOption" height="300px"/>
      </div>
    </div>
  </div>
  <div class="chart-row">
    <div class="panel panel-flex-1">
      <div class="section-header">
        <span class="section-title">最新30个数据元</span>
        <span class="section-desc">最近新增的数据元列表</span>
      </div>
      <div class="table-wrap">
        <n-data-table
            striped
            :columns="columns"
            :data="data"
            :max-height="300"
            :min-height="300"
        />
      </div>
    </div>
    <div class="panel panel-flex-1">
      <div class="section-header">
        <span class="section-title">最新30个标准的类型占比</span>
        <span class="section-desc">基础数据元与数据模型占比</span>
      </div>
      <div class="pie-row">
        <MyChart :option="pieOptionOne" height="300px" width="50%"/>
        <MyChart :option="pieOptionTwo" height="300px" width="50%"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import CrudHead from '@/components/cue/crud-header.vue'
import { QuestionCircle28Regular } from '@vicons/fluent'
import MyChart from "@/components/chart/modules/MyChart";
import 'echarts-wordcloud';
import {onMounted, ref, computed} from "vue";
import {
  queryModelIndexLatest, queryModelIndexLineChart,
  queryModelIndexNephogram,
  queryModelIndexNum,
  queryModelIndexRate
} from "@/service/modules/data-standard";

const total = ref()
const rate = ref()
const barOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    },
    backgroundColor: '#fff',
    formatter: function (params) {
      let result = '';
      params.forEach((param) => {
        // 检查数据点所属的系列是否是第二个 Y 轴对应的系列
        if (param.seriesIndex === 1) { // 假设'同比'系列是第二个系列
          result += `${param.seriesName}: ${(param.value * 100).toFixed(2)} %<br/>`; // 转换为百分比并保留两位小数
        } else {
          result += `${param.seriesName}: ${param.value}<br/>`; // 其他系列直接显示原始值
        }
      });
      return result;
    },
  },
  legend: {
    data: ['落标数','落标率'],
    icon: 'circle',
    right: 20,
    top: '-1%',
  },
  color: ['#3bb969', '#e6824d'],
  grid: {
    top: '8%',
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
    backgroundColor: 'rgba(255, 255, 255, 0)', // 设置为透明或其他颜色
    borderColor: 'transparent', // 边框色设置为透明
  },
  xAxis: [
    {
      type: 'category',
      data: [],
      axisTick: {
        alignWithLabel: true
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      splitArea: {
        show: false // 确保 splitArea 是显示的
      }
    },
    {
      type: 'value',
      position: 'right', // 放置在右侧
      splitArea: {
        show: false // 确保 splitArea 是显示的
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        formatter: function (value, index) {
          return (value * 100).toFixed(0) + ' %'; // 乘以100并保留两位小数
        }
      }
    }
  ],
  series: [
    {
      name: '落标数',
      type: 'bar',
      barWidth: '30%',
      itemStyle: {
        borderRadius: [5, 5, 0, 0]
      },
      data: []
    },
    {
      name: '落标率',
      type: 'line',
      yAxisIndex: 1,
      data: []
    }
  ]
})

const cloudChartKey = ref(0)

const cloudOption = ref({
  tooltip: {
    backgroundColor: '#fff',
    formatter: function (params) {
      return params.data.name + '：' + params.data.value
    },
  },
  series: [{
    type: 'wordCloud',
    shape: 'square',
    left: 'center',
    top: 'middle',
    width: '99%',
    height: '99%',
    right: null,
    bottom: null,
    gridSize: 6,
    sizeRange: [10, 56],
    rotationRange: [-10, 10],
    drawOutOfBound:true,
    rotationStep: 5,
    drawOutOfBound: false,
    layoutAnimation: true,
    textStyle: {
      color: function () {
        return 'rgb(' +
            Math.round(Math.random() * 255) + ',' +
            Math.round(Math.random() * 255) + ',' +
            Math.round(Math.random() * 255) + ')';
      },
      emphasis: {
        shadowBlur: 10,
        shadowColor: '#333'
      }
    },
    data: []
  }]
})

const pieOptionOne = ref({
  graphic: [
     {
      type: 'text',
      top: '45%',
      left: 'center',
      style: {
        text: '基础数据元',
        textAlign: 'center',
        fontSize: 15,
        color: '#666666'
    }
    },
    {
      type: 'text',
      top: '55%',
      left: 'center',
      style: {
        text: '0%',
        textAlign: 'center',
        fontSize: 20,
        color: '#666666'
      }
    },
  ],
  series: [{
    type: 'pie',
    radius: ['50%', '70%'],
    label: {
      show: false,
      position: 'center'
    },
    data: []
  }]
})
const pieOptionTwo = ref({
  graphic: [
    {
      type: 'text',
      top: '45%',
      left: 'center',
      style: {
        text: '数据模型',
        textAlign: 'center',
        fontSize: 15,
        color: '#666666'
      }
    },
    {
      type: 'text',
      top: '55%',
      left: 'center',
      style: {
        text: '0%',
        textAlign: 'center',
        fontSize: 20,
        color: '#666666'
      }
    },
  ],
  series: [{
    type: 'pie',
    radius: ['50%', '70%'],
    label: {
      show: false,
      position: 'center'
    },
    data: []
  }]
})

const columns = [
  {
    title: '序号',
    key: 'index',
    render: (unused, rowIndex) => rowIndex + 1,
    width: 60
  },
  {
    title: '数据元名称',
    key: 'chinese_name'
  },
  {
    title: '所属叶子类目',
    key: 'title_name'
  }
]

const statCards = computed(() => [
  {
    label: '数据元数',
    tip: '所有草稿/已发布/废止状态的基础数据元总数',
    valueKey: 'dataElementNum',
    desc: '基础',
    vars: {
      '--c-main': '#1677ff',
      '--c-icon-bg-from': '#e6f0ff',
      '--c-icon-bg-to': '#f0f5ff',
      '--c-icon-border': '#bae0ff55',
      '--c-icon-shadow': 'rgba(22,119,255,0.10)',
      '--c-corner-bg': 'rgba(22,119,255,0.08)',
      '--c-hover-border': '#b8d1ff',
      '--c-hover-shadow': 'rgba(22,119,255,0.10)',
      '--c-tip-hover': '#1677ff'
    },
    iconPath: 'M832 64H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V96c0-17.7-14.3-32-32-32zm-600 72h560v208H232V136zm560 480H232V408h560v208zm0 272H232V680h560v208z'
  },
  {
    label: '数据模型数',
    tip: '所有草稿/已发布/废止状态的基础和指标数据元总数',
    valueKey: 'modelNum',
    desc: '',
    vars: {
      '--c-main': '#722ED1',
      '--c-icon-bg-from': '#f3e9ff',
      '--c-icon-bg-to': '#faf5ff',
      '--c-icon-border': '#d3adf755',
      '--c-icon-shadow': 'rgba(114,46,209,0.10)',
      '--c-corner-bg': 'rgba(114,46,209,0.08)',
      '--c-hover-border': '#d3adf7',
      '--c-hover-shadow': 'rgba(114,46,209,0.10)',
      '--c-tip-hover': '#722ED1'
    },
    iconPath: 'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zM334.9 577.7c-15.4-4.5-27.3-17.4-34.1-36.7-7-19.9-6.9-44.1-.2-64.3 6.9-20.9 19.7-35.8 35.4-40.3 8.5-2.4 13-1.3 18.7 4.5 10.6 10.9 14.8 29.9 11.1 48.3-3.7 18.3-14.5 34.6-28.7 38.9-4.6 1.3-8.3.9-12.2-.4zm130.6 27.5c-17.9 0-32.4-14.5-32.4-32.4V402.4c0-17.9 14.5-32.4 32.4-32.4s32.4 14.5 32.4 32.4v170.5c0 18-14.5 32.3-32.4 32.3zm186.6 0c-17.9 0-32.4-14.5-32.4-32.4V402.4c0-17.9 14.5-32.4 32.4-32.4s32.4 14.5 32.4 32.4v170.5c0 18-14.5 32.3-32.4 32.3z'
  },
  {
    label: '近3个月添加数',
    tip: '近3个月添加的数据元与数据模型总数，包括添加后删除的',
    valueKey1: 'dataElement3Num',
    valueKey2: 'model3Num',
    sub: true,
    desc: '数据元 / 数据模型',
    vars: {
      '--c-main': '#52C41A',
      '--c-icon-bg-from': '#e9ffd6',
      '--c-icon-bg-to': '#f6ffed',
      '--c-icon-border': '#b7eb8f55',
      '--c-icon-shadow': 'rgba(82,196,26,0.10)',
      '--c-corner-bg': 'rgba(82,196,26,0.08)',
      '--c-hover-border': '#b7eb8f',
      '--c-hover-shadow': 'rgba(82,196,26,0.10)',
      '--c-tip-hover': '#52C41A'
    },
    iconPath: 'M904 296h-92v-92c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v92H648c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h92v92c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-92h92c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM916 472H792V596H668V472H544V348H668V224H792v124h124v124zM120 112h72c4.4 0 8 3.6 8 8v720c0 4.4-3.6 8-8 8h-72c-4.4 0-8-3.6-8-8V120c0-4.4 3.6-8 8-8zm256 0h72c4.4 0 8 3.6 8 8v720c0 4.4-3.6 8-8 8h-72c-4.4 0-8-3.6-8-8V120c0-4.4 3.6-8 8-8z'
  },
  {
    label: '近3个月发布数',
    tip: '近3个月添加并发布的数据元总数，同一个数据元添加后编辑的数量仍为1',
    valueKey: 'dataElement3ReleaseStatusNum',
    desc: '数据元',
    vars: {
      '--c-main': '#FA8C16',
      '--c-icon-bg-from': '#ffe8cc',
      '--c-icon-bg-to': '#fff7e6',
      '--c-icon-border': '#ffd59155',
      '--c-icon-shadow': 'rgba(250,140,22,0.10)',
      '--c-corner-bg': 'rgba(250,140,22,0.08)',
      '--c-hover-border': '#ffd591',
      '--c-hover-shadow': 'rgba(250,140,22,0.10)',
      '--c-tip-hover': '#FA8C16'
    },
    iconPath: 'M653.6 279.3l155.8 416.5c-1.7 2.7-3.7 5.3-5.9 7.7-32.2 35.1-76.4 56.6-123.5 56.6H280c-8.8 0-16-7.2-16-16v-56c0-8.8 7.2-16 16-16h114.8L279.2 193.6A8 8 0 0 1 286.8 184h267.6c5.2 0 9.6 3.4 11.5 8.3l87.7 228zM624 400c26.5 0 48-21.5 48-48s-21.5-48-48-48-48 21.5-48 48 21.5 48 48 48z'
  }
])

const data = ref([{}])
const indexData = ref({
  dataElement3Num: 0,
  dataElement3ReleaseStatusNum: 0,
  dataElementNum: 0,
  model3Num: 0,
  modelNum: 0
})

const initData = async () => {
  indexData.value = await queryModelIndexNum({})

  const cloudData = await queryModelIndexNephogram({})
  const words = cloudData.map(item => ({
    name: item.chineseName,
    value: item.fieldNum
  }))
  cloudOption.value = {
    ...cloudOption.value,
    series: [{
      type: 'wordCloud',
      shape: 'square',
      left: 'center',
      top: 'middle',
      width: '99%',
      height: '99%',
      right: null,
      bottom: null,
      gridSize: 6,
      sizeRange: [10, 56],
      rotationRange: [-10, 10],
      rotationStep: 5,
      drawOutOfBound: false,
      layoutAnimation: true,
      textStyle: {
        color: function () {
          return 'rgb(' +
              Math.round(Math.random() * 255) + ',' +
              Math.round(Math.random() * 255) + ',' +
              Math.round(Math.random() * 255) + ')';
        },
        emphasis: {
          shadowBlur: 10,
          shadowColor: '#333'
        }
      },
      data: words
    }]
  }
  cloudChartKey.value++

  data.value = await queryModelIndexLatest({})

  const pieData = await queryModelIndexRate({})
  pieOptionOne.value.series[0].data = [
      { value: pieData.modelDataElementNum/(pieData.modelNum + pieData.modelDataElementNum)*100, itemStyle: { color: '#13aad3' } },
      { value: pieData.modelNum/(pieData.modelNum + pieData.modelDataElementNum)*100, itemStyle: { color: '#f1f1f1' } }
  ]
  pieOptionOne.value.graphic[1].style.text = (pieData.modelDataElementNum/(pieData.modelNum + pieData.modelDataElementNum)*100).toFixed(2) + '%'

  pieOptionTwo.value.series[0].data = [
    { value: pieData.modelNum/(pieData.modelNum + pieData.modelDataElementNum)*100, itemStyle: { color: '#13aad3' } },
    { value: pieData.modelDataElementNum/(pieData.modelNum + pieData.modelDataElementNum)*100, itemStyle: { color: '#f1f1f1' } }
  ]
  pieOptionTwo.value.graphic[1].style.text = (pieData.modelNum/(pieData.modelNum + pieData.modelDataElementNum)*100).toFixed(2) + '%'

  const chartData = await queryModelIndexLineChart({})
  barOption.value.xAxis[0].data = chartData[3]
  barOption.value.series[0].data = chartData[0]
  barOption.value.series[1].data = chartData[1]

  total.value = chartData[0].reduce((acc, current) => acc + current, 0);
  const sum = chartData[2].reduce((acc, current) => acc + current, 0);
  if (sum !== 0) {
    rate.value = (total.value / sum * 100).toFixed(2) + '%';
  } else {
    rate.value = '0%'
  }

}

onMounted(() => {
  initData()
})
</script>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

.tip-icon {
  color: #c9cdd4;
  cursor: help;
  transition: color 0.2s ease;
}

.tip-icon:hover {
  color: var(--c-tip-hover);
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  color: #1d2129;
  line-height: 1.1;
  letter-spacing: -0.5px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.stat-slash {
  margin: 0 4px;
  color: #c9cdd4;
  font-weight: 500;
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

.chart-wrap {
  width: 100%;
  border-radius: 10px;
  background: linear-gradient(135deg, #fafcff 0%, #f5f9ff 100%);
  border: 1px solid #f0f4fa;
  padding: 8px;
  box-sizing: border-box;
}

.rate-summary-row {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.rate-tag {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  transition: all 0.25s ease-out;
  box-sizing: border-box;
}

.rate-tag:hover {
  transform: translateY(-1px);
}

.rate-tag-count {
  background: linear-gradient(135deg, #e6f0ff 0%, #d6e6ff 100%);
  border: 1px solid #b8d1ff;
}

.rate-tag-count:hover {
  box-shadow: 0 4px 10px rgba(22, 119, 255, 0.1);
}

.rate-tag-rate {
  background: linear-gradient(135deg, #e8fff2 0%, #d6ffe5 100%);
  border: 1px solid #b7f0c9;
}

.rate-tag-rate:hover {
  box-shadow: 0 4px 10px rgba(82, 196, 26, 0.1);
}

.rate-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.rate-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.rate-value {
  font-size: 20px;
  font-weight: 700;
  color: #1d2129;
  line-height: 1.2;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.rate-label {
  font-size: 12px;
  color: #6b7785;
  line-height: 1;
}

.table-wrap {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #f0f4fa;
}

.pie-row {
  display: flex;
  width: 100%;
  border-radius: 10px;
  background: linear-gradient(135deg, #fafcff 0%, #f5f9ff 100%);
  border: 1px solid #f0f4fa;
  padding: 8px;
  box-sizing: border-box;
}
</style>
