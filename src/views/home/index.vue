<template>
  <div class="page">
    <div class="home-container">
      <div class="stats-row">
        <div
          v-for="(item, index) in statsCards"
          :key="index"
          class="stat-card"
          :style="{ '--card-color': item.color }"
          @click="handleClick(item.type)"
        >
          <div class="stat-icon-wrap">
            <img :src="item.icon" class="stat-icon" referrerpolicy="no-referrer" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ data[item.dataKey] ?? 0 }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
      <div class="middle-section">
        <div class="modules-panel">
          <div class="section-header">
            <span class="section-title">核心能力</span>
            <span class="section-desc">数据中台 8 大功能模块</span>
          </div>
          <div class="modules-grid">
            <div
              v-for="(item, index) in loopData0"
              :key="index"
              class="module-card"
            >
              <div class="module-icon-wrap">
                <img
                  :src="item.lanhuimage0"
                  class="module-icon"
                  referrerpolicy="no-referrer"
                />
              </div>
              <div class="module-content">
                <div class="module-title">
                  {{ item.slot1 === 1 ? item.specialSlot1.lanhutext0 : item.specialSlot2.lanhutext0 }}
                </div>
                <div class="module-desc">
                  {{ item.slot1 === 1 ? item.specialSlot1.lanhutext1 : item.specialSlot2.lanhutext1 }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="visual-panel">
          <div class="section-header">
            <span class="section-title">数据资产全景</span>
            <span class="section-desc">平台资产架构总览</span>
          </div>
          <div class="visual-wrap">
            <img
              :src='mainImagePath'
              class="visual-image"
              referrerpolicy="no-referrer"
            />
          </div>
        </div>
      </div>
      <div class="resource-panel">
        <div class="section-header">
          <div class="section-title-wrap">
            <span class="section-title">资源规划</span>
            <span class="section-count">
              共 {{ totalResourceList.length }} 个业务系统
            </span>
          </div>
          <div class="legend-row">
            <span class="legend-item"><i class="dot dot-active"></i>已对接</span>
            <span class="legend-item"><i class="dot dot-inactive"></i>未对接</span>
          </div>
        </div>
        <div class="resource-rows">
          <div
            v-for="(row, rowIdx) in resourceRows"
            :key="'row-' + rowIdx"
            class="resource-row"
            :style="row.length < 9 ? { 'grid-template-columns': `repeat(${row.length}, minmax(0, 1fr))` } : {}"
          >
            <template v-for="(item, idx) in row" :key="'r' + rowIdx + '-c' + idx">
              <div
                v-if="item.__isMore"
                class="resource-tag tag-more"
                @click="toggleResourceExpand"
                :title="'点击展开剩余系统'"
              >
                <span class="tag-name">{{ item.systemName }}</span>
              </div>
              <div
                v-else-if="item.__isCollapse"
                class="resource-tag tag-collapse"
                @click="toggleResourceExpand"
                title="点击收起"
              >
                <span class="tag-name">▲ 收起</span>
              </div>
              <div
                v-else
                :class="['resource-tag', item.abutmentStatus === '1' ? 'tag-active' : 'tag-inactive']"
                :title="item.remarks || item.systemName"
              >
                <i v-if="item.abutmentStatus === '1'" class="tag-tick">✓</i>
                <span class="tag-name">{{ item.systemName }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import {computed, onMounted, ref} from "vue";
import {useUserStore} from "@/store/user/user";
import {useRouter} from "vue-router";
import {getDatasourceHome} from "@/service/modules/data-source";
import {resourcePlanningList} from "@/service/modules/resources";

const MAX_RESOURCE_VISIBLE = 18
const RESOURCE_COLS = 9

const userStore = useUserStore()
const router = useRouter()
const data = ref({})
const totalResourceList = ref([])
const showAllResource = ref(false)

const visibleResourceList = computed(() => {
  const total = totalResourceList.value
  if (showAllResource.value || total.length <= MAX_RESOURCE_VISIBLE) {
    return [...total]
  }
  const list = total.slice(0, MAX_RESOURCE_VISIBLE - 1)
  list.push({
    __isMore: true,
    systemName: `更多 +${total.length - (MAX_RESOURCE_VISIBLE - 1)}`,
  })
  return list
})

const resourceRows = computed(() => {
  const total = totalResourceList.value.length
  // ≤18 且折叠：尽量均分两行（上 ceil(n/2)，下 floor(n/2)）
  if (!showAllResource.value && total <= MAX_RESOURCE_VISIBLE) {
    const list = visibleResourceList.value
    const mid = Math.ceil(list.length / 2)
    return [list.slice(0, mid), list.slice(mid)]
  }
  // 其余情况：按每行 9 个正常切（展开态 / >18折叠态的 17+更多）
  const list = visibleResourceList.value
  const rows = []
  for (let i = 0; i < list.length; i += RESOURCE_COLS) {
    rows.push(list.slice(i, i + RESOURCE_COLS))
  }
  if (showAllResource.value && total > MAX_RESOURCE_VISIBLE) {
    const collapseItem = { __isCollapse: true, systemName: '收起' }
    const lastRow = rows[rows.length - 1]
    if (lastRow.length < RESOURCE_COLS) {
      lastRow.push(collapseItem)
    } else {
      rows.push([collapseItem])
    }
  }
  return rows
})

const loopDataBack = `${import.meta.env.BASE_URL}images/home/background.png`
const loopData0 = [
  {
    lanhuimage0: `${import.meta.env.BASE_URL}images/home/2-1.png`,
    specialSlot1: {
      lanhutext0: '数据规划',
      lanhutext1: '基于智慧水务数据归集与数据源维护',
    },
    slot1: 1,
  },
  {
    lanhuimage0: `${import.meta.env.BASE_URL}images/home/2-2.png`,
    specialSlot2: {
      lanhutext0: '数据工厂',
      lanhutext1:
          '定义数据标准，对平台模型与元数据，数据质量与数据安全进行管理',
    },
    slot2: 2,
  },
  {
    lanhuimage0: `${import.meta.env.BASE_URL}images/home/2-3.png`,
    specialSlot1: {
      lanhutext0: '数据开发',
      lanhutext1: '基于归集数据进行数据模型开发以及数据处理',
    },
    slot1: 1,
  },
  {
    lanhuimage0: `${import.meta.env.BASE_URL}images/home/2-4.png`,
    specialSlot2: {
      lanhutext0: '资源管理',
      lanhutext1:
          '对资产进行编目统计，指标会聚等操作，数据血缘以及基本信息展示',
    },
    slot2: 2,
  },
  {
    lanhuimage0: `${import.meta.env.BASE_URL}images/home/2-5.png`,
    specialSlot1: {
      lanhutext0: '服务开发',
      lanhutext1: '基于自定义SQL以及封装API低代码服务开发',
    },
    slot1: 1,
  },
  {
    lanhuimage0: `${import.meta.env.BASE_URL}images/home/2-6.png`,
    specialSlot2: {
      lanhutext0: '数据运营',
      lanhutext1: '基于资源管理资源库数据对优质数据进行运营管理',
    },
    slot2: 2,
  },
  {
    lanhuimage0: `${import.meta.env.BASE_URL}images/home/2-5.png`,
    specialSlot1: {
      lanhutext0: '运维中心',
      lanhutext1: '对数据开发以及服务开发的任务进行运维和告警等操作',
    },
    slot1: 1,
  },
  {
    lanhuimage0: `${import.meta.env.BASE_URL}images/home/2-6.png`,
    specialSlot2: {
      lanhutext0: '数据标签',
      lanhutext1: '基于资源管理资源库数据对优质数据进行运营管理',
    },
    slot2: 2,
  },
]
const mainImagePath = `${import.meta.env.BASE_URL}images/home/main.png`
const topImagePath = {
  one: `${import.meta.env.BASE_URL}images/home/1.png`,
  two: `${import.meta.env.BASE_URL}images/home/2.png`,
  three: `${import.meta.env.BASE_URL}images/home/3.png`,
  four: `${import.meta.env.BASE_URL}images/home/4.png`,
  five: `${import.meta.env.BASE_URL}images/home/5.png`,
  six: `${import.meta.env.BASE_URL}images/home/6.png`,
  seven: `${import.meta.env.BASE_URL}images/home/7.png`
}
const statsCards = [
  { icon: topImagePath.one,   dataKey: 'dataSourceNum', label: '数据连接',  type: 'datasource',   color: '#1677ff' },
  { icon: topImagePath.two,   dataKey: 'interfaceNum',  label: '数据服务',  type: 'api',          color: '#13c2c2' },
  { icon: topImagePath.three, dataKey: 'dataElementNum',label: '数据元',    type: 'dataElement',  color: '#722ed1' },
  { icon: topImagePath.four,  dataKey: 'dataModel',     label: '数据模型',  type: 'dataModel',    color: '#eb2f96' },
  { icon: topImagePath.five,  dataKey: 'processNum',    label: '任务流',    type: 'workFlow',     color: '#fa8c16' },
  { icon: topImagePath.six,   dataKey: 'taskNum',       label: '任务实例',  type: 'workInstance', color: '#52c41a' },
  { icon: topImagePath.seven, dataKey: 'assetsNum',     label: '数据资产',  type: 'dataAsset',    color: '#f5222d' },
]

const initData = async () => {
  data.value = await getDatasourceHome()
  const list = await resourcePlanningList({}) || []
  const filteredList = list.filter(item => item.systemName?.trim())
  showAllResource.value = false
  if(filteredList.length) {
    totalResourceList.value = filteredList
  } else {
    totalResourceList.value = [
      { systemName: "档案系统", abutmentStatus: '1', remarks: '' },
      { systemName: "企业管理域", abutmentStatus: '1', remarks: '' },
      { systemName: "协调办公", abutmentStatus: '1', remarks: '' },
      { systemName: "仓储管理", abutmentStatus: '1', remarks: '' },
      { systemName: "设备管理", abutmentStatus: '1', remarks: '' },
      { systemName: "水力模型", abutmentStatus: '1', remarks: '' },
      { systemName: "生产调度", abutmentStatus: '1', remarks: '' },
      { systemName: "应急指挥", abutmentStatus: '1', remarks: '' },
      { systemName: "科学调度", abutmentStatus: '1', remarks: '' },
      { systemName: "热线服务", abutmentStatus: '1', remarks: '' },
      { systemName: "二供管理系统", abutmentStatus: '1', remarks: '' },
      { systemName: "营业服务", abutmentStatus: '1', remarks: '' },
      { systemName: "地理信息系统", abutmentStatus: '1', remarks: '' },
      { systemName: "表务管理", abutmentStatus: '1', remarks: '' },
      { systemName: "漏损管理系统", abutmentStatus: '1', remarks: '' },
      { systemName: "工程报表", abutmentStatus: '1', remarks: '' },
      { systemName: "管网管理域", abutmentStatus: '1', remarks: '' },
      { systemName: "工单管理系统", abutmentStatus: '1', remarks: '' },
      { systemName: "智慧抄表", abutmentStatus: '0', remarks: '对接中' },
      { systemName: "水质监测", abutmentStatus: '0', remarks: '规划中' },
    ]
  }
}

const toggleResourceExpand = () => {
  showAllResource.value = !showAllResource.value
}

const handleClick = (type) => {
  switch (type) {
    case 'datasource':
      router.push({
        path: '/datasource',
        query: {back: true}
      })
      break
    case 'api':
      router.push({
        path: '/service/api-dev',
        query: {back: true}
      })
      break
    case 'dataElement':
      router.push({
        path: '/data-assets/data-standard/standard-list',
        query: {back: true}
      })
      break
    case 'dataModel':
      router.push({
        path: '/data-assets/data-standard/model-list',
        query: {back: true}
      })
      break
    case 'workFlow':
      router.push({
        path: `/devops/${window.webConfig.VITE_APP_PROD_PROJECT_ID}/workflow-definition`,
        query: {back: true}
      })
      break
    case 'workInstance':
      router.push({
        path: `/devops/${window.webConfig.VITE_APP_PROD_PROJECT_ID}/task/instances`,
        query: {back: true}
      })
      break
    case 'dataAsset':
      router.push({
        path: '/data-assets/assets-classify',
        query: {back: true}
      })
      break
  }
}

onMounted(() => {
  // @ts-ignore
  console.log(__APP_VERSION__)
  initData()
})

</script>

<style scoped>
.page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(180deg, #f5f7fa 0%, #eef2f7 100%);
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.page::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.home-container {
  padding: 16px;
  min-height: 100%;
  box-sizing: border-box;
}

.flex-col {
  display: flex;
  flex-direction: column;
}
.flex-row {
  display: flex;
  flex-direction: row;
}
.justify-between {
  display: flex;
  justify-content: space-between;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.stat-card {
  position: relative;
  background: #fff;
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  border: 1px solid #eef0f3;
  transition: all 0.25s ease-out;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--card-color, #1677ff);
    opacity: 0.85;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: #d6e4ff;
    box-shadow: 0 8px 24px rgba(22, 119, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04);

    &::before {
      opacity: 1;
      width: 6px;
    }
  }
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--card-color, #1677ff) 12%, #fff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.stat-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--card-color, #1677ff);
  line-height: 32px;
  letter-spacing: 0.5px;
  font-family: 'DIN Alternate', 'SourceHanSansSC-Bold', -apple-system, sans-serif;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-label {
  font-size: 13px;
  color: #86909c;
  line-height: 20px;
  margin-top: 2px;
}

.middle-section {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 14px 4px;
}

.section-title-wrap {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  line-height: 22px;
  position: relative;
  padding-left: 12px;

  &::before {
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
}

.section-desc {
  font-size: 12px;
  color: #86909c;
}

.section-count {
  font-size: 12px;
  color: #86909c;
  padding: 2px 8px;
  background: #f2f3f5;
  border-radius: 4px;
}

.modules-panel,
.visual-panel,
.resource-panel {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eef0f3;
  padding: 18px;
  box-sizing: border-box;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.module-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fafcff 0%, #f5f9ff 100%);
  border: 1px solid #f0f4fa;
  transition: all 0.25s ease-out;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
    border-color: #d6e4ff;
    background: linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%);
    box-shadow: 0 4px 12px rgba(22, 119, 255, 0.08);
  }
}

.module-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(22, 119, 255, 0.06);
}

.module-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.module-content {
  flex: 1;
  min-width: 0;
}

.module-title {
  font-size: 14px;
  font-weight: 600;
  color: #1d2129;
  line-height: 22px;
  margin-bottom: 4px;
}

.module-desc {
  font-size: 12px;
  color: #6b7785;
  line-height: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.visual-wrap {
  width: 100%;
  height: calc(100% - 40px);
  min-height: 380px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f5f9ff 0%, #eaf1ff 100%);
  border: 1px solid #e6edf8;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.visual-image {
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 6px;
}

.legend-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #86909c;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dot-active {
  background: #52c41a;
  box-shadow: 0 0 0 2px rgba(82, 196, 26, 0.15);
}
.dot-inactive {
  background: #c9cdd4;
}

.resource-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.resource-row {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 10px;
}

.resource-tag {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 8px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease-out;
  cursor: pointer;
  user-select: none;
  text-align: center;
  min-height: 42px;
  box-sizing: border-box;
}

.tag-active {
  color: #1677ff;
  background: linear-gradient(135deg, #e6f0ff 0%, #d6e6ff 100%);
  border: 1px solid #b8d1ff;

  &:hover {
    background: linear-gradient(135deg, #d6e6ff 0%, #c2d9ff 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(22, 119, 255, 0.1);
  }
}

.tag-inactive {
  color: #86909c;
  background: #f7f8fa;
  border: 1px solid #e5e6eb;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
}

.tag-tick {
  font-style: normal;
  font-size: 11px;
  width: 14px;
  height: 14px;
  line-height: 14px;
  text-align: center;
  border-radius: 50%;
  background: #52c41a;
  color: #fff;
  flex-shrink: 0;
}

.tag-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

.tag-more {
  color: #fff;
  background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
  border: 1px solid #1677ff;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(22, 119, 255, 0.25);

  &:hover {
    background: linear-gradient(135deg, #0958d9 0%, #1677ff 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(22, 119, 255, 0.35);
  }

  .tag-name {
    letter-spacing: 0.5px;
  }
}

.tag-collapse {
  color: #722ed1;
  background: linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%);
  border: 1px dashed #9254de;
  font-weight: 600;

  &:hover {
    background: linear-gradient(135deg, #efdbff 0%, #d3adf7 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(114, 46, 209, 0.15);
  }
}

@media (max-width: 1440px) {
  .stats-row {
    grid-template-columns: repeat(4, 1fr);
  }
  .middle-section {
    grid-template-columns: 1fr;
  }
  .resource-row {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>
