<template>
  <el-config-provider :locale="zhCn">
    <div class="cue-drag-layout flex-row">
        <div class="cue-drag-layout__mainview" style="width: 280px; margin-right: 12px">
          <div class="tree-container">
            <div class="add-buttons">
              <span class="title">分类</span>
              <div class="button-item-toggle" @click="packHandle" :title="expandedKeys.length ? '收起' : '展开'">
                <n-icon size="16" style="padding-top: 5px"><CaretUp v-if="expandedKeys.length"/><CaretDown v-else /></n-icon>
              </div>
              <div v-if="false" class="button-item" @click="packHandle" title="添加">
                <n-icon size="16"><Add12Filled/></n-icon>
              </div>
            </div>
            <n-input
                type="text"
                placeholder="搜索"
                class="search-input"
                v-model:value="pattern"
            >
              <template #suffix>
                <n-icon :component="SearchOutlined"/>
              </template>
            </n-input>
            <n-spin :show="showSpin" style="height: 100%" content-class="tree-scrollbar">
              <n-tree
                  class="tree-scrollbar"
                  block-line
                  show-irrelevant-nodes
                  :data="treeFolder"
                  key-field="id"
                  label-field="titleName"
                  children-field="children"
                  :pattern="pattern"
                  @update:expanded-keys="onExpandedKeys"
                  :expanded-keys="expandedKeys"
                  :render-prefix="menuIcon"
                  :render-suffix="renderSuffix"
                  :nodeProps="nodeProps"
              />
            </n-spin>
          </div>
        </div>
        <div class="cue-drag-layout__mainview" :style="{width: 'calc(100% - ' + (280 + 12) + 'px)'}">
          <div class="cue-crud cue-crud-v2">
            <CrudHead title="全部数据">
            </CrudHead>
            <div class="crud-v2-condition" >
              <div class="cue-crud__header-condition">
                <div class="cue-crud__header-content">
                  <el-form inline>
                    <el-form-item label="表名">
                      <el-input type="text" style="width: 180px" clearable v-model="paginationReactive.sqlLineageName"/>
                    </el-form-item>
                    <el-form-item label="注释">
                      <el-input type="text" style="width: 180px" clearable v-model="paginationReactive.notes"/>
                    </el-form-item>
                  </el-form>
                </div>
                <el-button color="#0099CB" class="cue-crud__header-query" type="primary" size="default"
                           :icon="Search" @click="handlePageChange(1,paginationReactive.pageSize)" >查询
                </el-button>
              </div>
            </div>
            <div class="cue-crud__body">
                <div class="cue-table">
                  <div class="cue-table-container">
                    <div v-if="dataRef.length === 0" class="no-data">
                      <svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="40" height="40"><path d="M35.698301 77.721345h59.476898c4.135408 0 7.419408 3.284 7.419408 7.419408s-3.284 7.419408-7.419408 7.419409H35.698301c-4.135408 0-7.419408-3.284-7.419408-7.419409s3.284-7.419408 7.419408-7.419408z m0 0" fill="#F4C15B" ></path><path d="M65.497565 47.922081c4.135408 0 7.419408 3.284 7.419409 7.419408v59.476898c0 4.135408-3.284 7.419408-7.419409 7.419408-4.135408 0-7.419408-3.284-7.419408-7.419408V55.341489c0-4.135408 3.284-7.419408 7.419408-7.419408z m0 0" fill="#F4C15B" ></path><path d="M362.030645 116.277943l28.704597 7.662668c4.013778 1.094667 6.324742 5.108445 5.230075 9.122223-1.094667 4.013778-5.108445 6.324742-9.122224 5.230075l-28.704597-7.662668c-4.013778-1.094667-6.324742-5.108445-5.230075-9.122223 1.216296-3.892149 5.108445-6.324742 9.122224-5.230075z m0 0" fill="#4680E8" p-id="10133"></path><path d="M414.939542 74.558974l7.662667 28.704596c1.094667 4.013778-1.216296 8.027557-5.230075 9.122224-4.013778 1.094667-8.027557-1.216296-9.122223-5.230075L400.587243 78.329493c-1.094667-4.013778 1.216296-8.027557 5.230075-9.122224 4.013778-0.973037 8.149186 1.337926 9.122224 5.351705z m0 0" fill="#8FB3FF" p-id="10134"></path><path d="M477.57881 99.493051L456.536881 120.53498c-2.919112 2.919112-7.541038 2.919112-10.46015 0-2.919112-2.919112-2.919112-7.541038 0-10.460149l21.041929-21.041929c2.919112-2.919112 7.541038-2.919112 10.46015 0 2.919112 2.797482 2.919112 7.541038 0 10.460149z m0 0" fill="#ABC3EF" ></path><path d="M927.000356 113.358831c-24.569189 0-44.516451 19.947262-44.516451 44.638081 0 24.569189 19.947262 44.516451 44.516451 44.516451 24.569189 0 44.638081-19.947262 44.638081-44.516451-0.12163-24.690818-20.068892-44.638081-44.638081-44.638081z m0 74.315715c-16.420002 0-29.799264-13.379261-29.799263-29.799264s13.379261-29.799264 29.799263-29.799263 29.799264 13.379261 29.799264 29.799263c-0.12163 16.541632-13.500891 29.799264-29.799264 29.799264z m0 0" fill="#F4C15B" p-id="10136"></path><path d="M905.715168 374.984202l-446.137546-59.476897v235.718256l446.137546 46.827414V374.984202z m0 0" fill="#4680E8" p-id="10137"></path><path d="M102.594607 392.742131l356.861385-77.113196v267.706853L102.594607 660.448984V392.742131z m0 0" fill="#8FB3FF" p-id="10138"></path><path d="M519.05452 482.018292l386.660648-106.91246V880.598646l-386.660648 106.91246V482.018292z m0 0" fill="#4680E8" p-id="10139"></path><path d="M102.594607 392.742131l416.338283 89.276161v502.816962L102.594607 883.517757V392.742131z m0 0" fill="#8FB3FF" p-id="10140"></path><path d="M519.05452 481.166884L102.594607 392.742131l-89.276161 178.430692 431.298729 101.317497 74.437345-191.323436z m0 0" fill="#ABC3EF" p-id="10141"></path><path d="M756.597221 28.461337L711.95914 46.584155v59.476897l44.638081-18.122817V28.461337z m0 0" fill="#F4C15B" p-id="10142"></path><path d="M659.780021 87.938235l44.638081 18.122817V46.584155l-44.638081-18.122818v59.476898z m96.8172-65.43675L708.796769 3.648889l-48.895118 16.906521 48.773489 20.67704 47.922081-18.730965z m0 0" fill="#E5CF6E" p-id="10143"></path><path d="M519.05452 482.018292l386.660648-106.91246 104.114978 178.430693-371.821831 121.751276-118.953795-193.269509z m0 0" fill="#8FB3FF" p-id="10144"></path><path d="M728.257513 388.241834S744.799145 283.883597 831.156194 231.947737c0 0 7.541038 8.514075 22.623115 27.853189 0 0-39.408006-6.203112-125.521796 128.440908z m0 0" fill="#ABC3EF" p-id="10145"></path><path d="M519.05452 383.984796s1.702815-57.165934 43.543413-186.09336c0 0 7.541038 8.514075 22.623115 27.853189-0.12163 0-15.933484 13.74415-66.166528 158.240171z m0 0" fill="#8FB3FF" ></path><path d="M373.585461 373.646276S326.514788 235.231738 211.209882 172.835729c0 0-19.217484 27.001782-40.381042 35.515857-0.12163 0 132.697945 46.219266 202.756621 165.29469z m0 0" fill="#E5CF6E" ></path></svg>
                      暂无数据
                    </div>
                    <div class="card-item mb16 bgf" v-for="item in dataRef" :key="item.id">
                      <div class="card-header">
                        <div class="table-info">
                          <svg class="table-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="22" height="22"><path d="M32 192a128 128 0 0 1 128-128h704a128 128 0 0 1 128 128v192H32V192z" fill="#2399ED"></path><path d="M32 384h320v192h-320z" fill="#E3F2FD"></path><path d="M32 384h320v192h-320z" fill="#E3F2FD" ></path><path d="M32 576h320v192h-320z" fill="#CDE8FF" ></path><path d="M32 768h320v192h-192a128 128 0 0 1-128-128v-64z" fill="#ABD9FF" ></path><path d="M352 384h320v192h-320z" fill="#CDE8FF" ></path><path d="M352 384h320v192h-320z" fill="#CDE8FF" ></path><path d="M352 576h320v192h-320z" fill="#ABD9FF" ></path><path d="M352 768h320v192h-320z" fill="#96D0FF" ></path><path d="M672 384h320v192h-320z" fill="#ABD9FF" ></path><path d="M672 384h320v192h-320z" fill="#ABD9FF" ></path><path d="M672 576h320v192h-320z" fill="#96D0FF" ></path><path d="M672 768h320v64a128 128 0 0 1-128 128h-192v-192z" fill="#7FC6FF" ></path></svg>
                          <div class="table-text">
                            <div class="table-title" :title="item.sqlLineageName">{{ item.sqlLineageName }}</div>
                            <div class="table-desc">{{ item.notes || '暂无描述' }}</div>
                          </div>
                        </div>
                        <div class="meta-info">
                          <span class="meta-tag"><span class="meta-label">任务流</span><span class="meta-value">{{ item.taskName || '-' }}</span></span>
                          <span class="meta-tag"><span class="meta-label">数据库</span><span class="meta-value">{{ item.dataSourceName || '-' }}</span></span>
                          <span class="meta-tag"><span class="meta-label">类型</span><span class="meta-value">{{ item.dbType || '-' }}</span></span>
                        </div>
                      </div>
                      <div class="metrics-row">
                        <div class="metric-cell metric-visit">
                          <div class="metric-icon-wrap">
                            <svg class="metric-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M512 128C254.4 128 42.666667 360.533333 0 512c42.666667 151.466667 254.4 384 512 384s469.333333-232.533333 512-384C981.333333 360.533333 769.6 128 512 128z m0 640c-167.466667 0-309.333333-108.8-375.466667-256 66.133333-147.2 208-256 375.466667-256s309.333333 108.8 375.466667 256C821.333333 659.2 679.466667 768 512 768z m0-53.333333c76.8 0 138.666667-61.866667 138.666667-138.666667s-61.866667-138.666667-138.666667-138.666667-138.666667 61.866667-138.666667 138.666667 61.866667 138.666667 138.666667 138.666667z m0-74.666667c-34.133333 0-64-29.866667-64-64s29.866667-64 64-64 64 29.866667 64 64-29.866667 64-64 64z" fill="#4680E8"></path></svg>
                          </div>
                          <div class="metric-info">
                            <div class="metric-num">{{ item.visitCount || 0 }}</div>
                            <div class="metric-label">访问数</div>
                          </div>
                        </div>
                        <div class="metric-cell metric-like">
                          <div class="metric-icon-wrap">
                            <svg class="metric-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M948.4 407.2c-29.2-35.5-76.9-35.5-92.6-35.5H730c10.2-55.2 18.9-119.4 0.2-187.1-12.8-46.6-36.3-79.7-72-101.1-18.7-11.2-38.1-16.9-57.8-16.9-51.8 0-90.6 38.4-96.4 95.7-2.2 21.4-4.2 41.7-9.3 59.1-19 63.9-65.4 112.7-108.3 151.8-16 14.4-33.1 40.2-33.3 69.2-0.6 77.6-0.7 155.5-0.7 235.1l-0.1 141.4c-0.2 47.3 25 85.4 67 101.7 22.2 9 45.7 14 70.1 14.7 38.8 0.5 77.8 0.5 114.3 0.5h56.9c37.2 0 74.4 0 111.8 0.4h1.2c43.5 0 77.7-21.7 93.9-59.5l4.8-11.1c11.3-26 22.9-52.9 30.1-82.8 22-90.9 44.9-188.2 63.4-283.8 7.4-37.9 1.6-68.8-17.4-91.8z" fill="#F08D48"></path></svg>
                          </div>
                          <div class="metric-info">
                            <div class="metric-num">{{ item.likeCount || 0 }}</div>
                            <div class="metric-label">点赞数</div>
                          </div>
                        </div>
                        <div class="metric-cell metric-collect">
                          <div class="metric-icon-wrap">
                            <svg class="metric-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M335.008 916.629333c-35.914667 22.314667-82.88 10.773333-104.693333-25.557333a77.333333 77.333333 0 0 1-8.96-57.429333l46.485333-198.24a13.141333 13.141333 0 0 0-4.021333-12.864l-152.16-132.586667c-31.605333-27.52-35.253333-75.648-8.234667-107.733333a75.68 75.68 0 0 1 51.733333-26.752L354.848 339.2c4.352-0.362667 8.245333-3.232 10.026667-7.594667l76.938666-188.170666c16.032-39.2 60.618667-57.92 99.52-41.461334a76.309333 76.309333 0 0 1 40.832 41.461334l76.938667 188.16c1.781333 4.373333 5.674667 7.253333 10.026667 7.605333l199.712 16.277333c41.877333 3.413333 72.885333 40.458667 69.568 82.517334a76.938667 76.938667 0 0 1-26.08 51.978666l-152.16 132.586667c-3.541333 3.082667-5.141333 8.074667-4.021334 12.853333l46.485334 198.24c9.621333 41.013333-15.36 82.336-56.138667 92.224a75.285333 75.285333 0 0 1-57.525333-9.237333l-170.976-106.24a11.296 11.296 0 0 0-12.010667 0l-170.986667 106.24z" fill="#F0C548"></path></svg>
                          </div>
                          <div class="metric-info">
                            <div class="metric-num">{{ item.collectionCount || 0 }}</div>
                            <div class="metric-label">收藏数</div>
                          </div>
                        </div>
                        <div class="metric-cell metric-rate">
                          <div class="metric-icon-wrap">
                            <svg class="metric-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M512 85.333333c-235.52 0-426.666667 191.146667-426.666667 426.666667s191.146667 426.666667 426.666667 426.666667 426.666667-191.146667 426.666667-426.666667-191.146667-426.666667-426.666667-426.666667z m-61.866667 665.6L256 556.373333l59.733333-59.733333 134.4 134.4 294.4-294.4 59.733334 59.733333z" fill="#52C41A"></path></svg>
                          </div>
                          <div class="metric-info">
                            <div class="metric-num">{{ formatSuccessRate(item.taskSuccessRate) }}</div>
                            <div class="metric-label">任务成功率</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              <div class="cue-crud__body-border-bottom"></div>
            </div>
            <div class="cue-crud__footer">
              <div class="cue-crud__footer-tab">
              </div>
              <div class="cue-crud__footer-pager">
                <el-pagination
                    background
                    :default-page-size="10"
                    :page-sizes="[10, 30, 90, 180, 300]"
                    layout="total, sizes, prev, pager, next"
                    :total="paginationReactive.itemCount"
                    @change="handlePageChange"
                    popper-class="page-select"
                >
                </el-pagination>
              </div>
            </div>
          </div>
        </div>
    </div>
  </el-config-provider>
</template>

<script setup>
import {Search} from '@element-plus/icons-vue'
import { ref, reactive, onMounted, h, unref} from 'vue'
import apiAxios from '@/utils/api-axios'
import zhCn from "element-plus/es/locale/lang/zh-cn";
import {
  ApartmentOutlined,
  SearchOutlined,
  TableOutlined
} from '@vicons/antd'
import { NIcon } from 'naive-ui'
import { CaretUp, CaretDown } from '@vicons/fa'
import CrudHead from "@/components/cue/crud-header.vue"
import {Add12Filled} from "@vicons/fluent";
import utils from "@/utils";
import {useUserStore} from "@/store/user/user";

const TableData = reactive({
  tableList: [],
  totalNum: 0
})

const userStore = useUserStore()
const dataRef = ref([])
const loadingRef = ref(true)
const showSpin = ref(false)
const treeFolder = ref([])
const expandedKeys = ref([1]);
const pattern = ref('');
const getApiFolderUrl = utils.getUrl('interface_lineage/getTreeAll')
const paginationReactive = reactive({
  page: 1,
  pageSize: 10,
  sqlLineageName: '',
  notes: '',
  apiTreeId: 1,
  userId: userStore.getUserInfo.id,
  likeState: 0,
  collectionState: 0,
  itemCount: 0
})

function formatSuccessRate(rate) {
  if (rate === null || rate === undefined || rate === '') {
    return '0%'
  }
  const numRate = Number(rate)
  if (isNaN(numRate)) {
    return '0%'
  }
  if (numRate >= 0 && numRate <= 1) {
    return (numRate).toFixed(2) + '%'
  }
  return numRate.toFixed(2) + '%'
}

function query(
    page,
    pageSize = 10,
    sqlLineageName = '',
    notes = '',
    apiTreeId = 1,
    userId,
    likeState,
    collectionState,
) {
  const url = utils.getUrl('interface_lineage/getSqlLineageListByParams')
  const params = {
    'pageNum': page,
    'pageSize': pageSize,
    'sqlLineageName': sqlLineageName,
    'notes': notes,
    'apiTreeId': apiTreeId,
    'userId': userId,
    'likeState': likeState,
    'collectionState': collectionState,
  }
  apiAxios.post(url, params)
      .then(function (response) {
        TableData.tableList = response.data.data
        TableData.totalNum = response.data.totalNum
        TableData.tableList.forEach((item) => {
          if (item.dbType === '0') {
            item.dbType = 'mysql'
          }
          if (item.dbType === '5') {
            item.dbType = 'oracle'
          }
          if (item.dbType === '2') {
            item.dbType = 'hive'
          }
          if (item.dbType === '12') {
            item.dbType = 'dm'
          }
        })
        dataRef.value = TableData.tableList.map((v) => v)
        paginationReactive.itemCount = TableData.totalNum
        loadingRef.value = false
      })
      .catch(function (error) {
        console.log(error)
      })
}
function nodeProps ({option}) {
  return {
    onClick() {
      paginationReactive.apiTreeId = option.id
      handlePageChange(1, paginationReactive.pageSize)
    }
  }
}

function getApiFolder ()  {
  showSpin.value = true
  let params ={}
  apiAxios.post(getApiFolderUrl,params).then((res) => {
    treeFolder.value = res.data.data
    showSpin.value = false
  })
}
function handlePageChange(currentPage, pageSize) {
  if (!loadingRef.value) {
    loadingRef.value = true
    paginationReactive.page = currentPage
    paginationReactive.pageSize = pageSize
    query(
        paginationReactive.page,
        paginationReactive.pageSize,
        paginationReactive.sqlLineageName,
        paginationReactive.notes,
        paginationReactive.apiTreeId,
        paginationReactive.userId,
        paginationReactive.likeState,
        paginationReactive.collectionState
    )
  }
}
function onExpandedKeys(keys) {
  expandedKeys.value = keys;
}
function packHandle() {
  if (expandedKeys.value.length) {
    expandedKeys.value = [];
  } else {
    setId(unref(treeFolder.value))
  }
}
function setId(datas) {
  for (let i in datas) {
    expandedKeys.value.push(datas[i].id)
    if (datas[i].children) {
      setId(datas[i].children);
    }
  }
}

function menuIcon({ option }) {
  switch (option.type) {
    case 1:
      return h('svg', {
        class: 'icon',
        viewBox: '0 0 1024 1024',
        version: '1.1',
        xmlns: 'http://www.w3.org/2000/svg',
        width: '16',
        height: '16',
      }, [
        h('path', {
          d: 'M0 101.888C0 76.288 17.042286 59.245714 42.642286 59.245714h349.915428c17.042286 0 34.084571 17.042286 42.642286 34.157715l16.457143 51.2H972.8c25.6 0 42.642286 17.042286 42.642286 42.642285v733.842286c8.557714 25.6-8.484571 42.715429-34.084572 42.715429H42.642286c-25.6 0-42.642286-17.115429-42.642286-42.715429v-819.2z',
          fill: '#FFA000',
        }),
        h('path', {
          d: 'M904.557714 912.603429H119.442286c-25.6 0-42.642286-17.115429-42.642286-42.715429v-614.4c0-25.6 17.042286-42.642286 42.642286-42.642286h793.6c25.6 0 42.715429 17.042286 42.715428 42.642286v614.4c0 17.115429-25.6 42.715429-51.2 42.715429',
          fill: '#FFFFFF',
        }),
        h('path', {
          d: 'M981.357714 963.803429H42.642286c-25.6 0-42.642286-17.115429-42.642286-42.715429V340.845714c0-25.6 17.042286-42.642286 42.642286-42.642285H972.8c34.157714-8.557714 51.2 17.042286 51.2 42.642285v580.242286c0 25.6-17.042286 42.715429-42.642286 42.715429',
          fill: '#FFCA28',
        }),
        h('path', {
          d: 'M366.957714 631.003429H119.442286c-8.484571 0-25.6-8.557714-25.6-25.6 0-17.115429 8.557714-25.6 25.6-25.6h247.515428c8.484571 0 25.6 8.484571 25.6 25.6-8.557714 17.042286-17.115429 25.6-25.6 25.6m0-153.6H119.442286c-8.484571 0-25.6-8.557714-25.6-25.6 0-17.115429 8.557714-25.6 25.6-25.6h247.515428c8.484571 0 25.6 8.484571 25.6 25.6 0 17.042286-17.115429 25.6-25.6 25.6',
          fill: '#FFFFFF',
        }),
      ])
    case 2:
      return h(
          NIcon,
          { color: '#0099CB' },
          { default: () => h(ApartmentOutlined) }
      )
    default:
      return h(
          NIcon,
          { color: '#0099CB' },
          { default: () => h(TableOutlined) }
      )
  }
}

function renderSuffix({ option }) {
    return h('div', {class: "tree_count" }, { default: () => option.children?.length || 0  } )
}

onMounted(() => {
  getApiFolder()
  query(
      paginationReactive.page,
      paginationReactive.pageSize,
      paginationReactive.sqlLineageName,
      paginationReactive.notes,
      paginationReactive.apiTreeId,
      paginationReactive.userId,
      paginationReactive.likeState,
      paginationReactive.collectionState
  )
})
</script>

<style scoped lang="scss">

.button-item-toggle{
  right: 20px !important;
}

.bgf {
  background-color: #fff;
}

.mb16 {
  margin-bottom: 16px;
}

.cue-table-container {
  overflow: auto;
  background-color: #e8ecf0;
  padding: 8px 0;
}

::-webkit-scrollbar {
  display: none;
}

.no-data {
  height: 100%;
  text-align: center;
  background-color: #ffffff;
  color: #999;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  .icon {
    margin-right: 8px;
    flex-shrink: 0;
  }
}

.card-item {
  padding: 20px 24px;
  margin: 8px 0;
  border-radius: 12px;
  user-select: none;
  transition: all 0.3s ease;
  border: 1px solid transparent;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(70, 128, 232, 0.12);
    border-color: rgba(70, 128, 232, 0.2);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px dashed #f0f0f0;

    .table-info {
      display: flex;
      align-items: flex-start;
      flex: 1;
      min-width: 0;

      .table-icon {
        flex-shrink: 0;
        margin-right: 12px;
        margin-top: 2px;
      }

      .table-text {
        flex: 1;
        min-width: 0;

        .table-title {
          font-size: 17px;
          font-weight: 600;
          color: rgba(0, 0, 0, 0.88);
          margin-bottom: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .table-desc {
          font-size: 13px;
          color: rgba(0, 0, 0, 0.45);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .meta-info {
      flex-shrink: 0;
      display: flex;
      gap: 8px;
      margin-left: 16px;

      .meta-tag {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        background: #fafafa;
        border-radius: 4px;
        font-size: 12px;
        line-height: 1.5;

        .meta-label {
          color: rgba(0, 0, 0, 0.45);
          margin-right: 4px;
        }

        .meta-value {
          color: rgba(0, 0, 0, 0.75);
          font-weight: 500;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  .metrics-row {
    display: flex;
    gap: 12px;

    .metric-cell {
      flex: 1;
      display: flex;
      align-items: center;
      padding: 14px 16px;
      border-radius: 10px;
      background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
      border: 1px solid #f0f2f5;
      transition: all 0.25s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      }

      &.metric-visit {
        background: linear-gradient(135deg, #eef4ff 0%, #ffffff 100%);
        border-color: #e0eaff;
      }

      &.metric-like {
        background: linear-gradient(135deg, #fff5ec 0%, #ffffff 100%);
        border-color: #ffe8d4;
      }

      &.metric-collect {
        background: linear-gradient(135deg, #fffbea 0%, #ffffff 100%);
        border-color: #fff1c2;
      }

      &.metric-rate {
        background: linear-gradient(135deg, #f0fff0 0%, #ffffff 100%);
        border-color: #d4f5d4;
      }

      .metric-icon-wrap {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 14px;
        flex-shrink: 0;
        background: rgba(255, 255, 255, 0.8);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      }

      .metric-icon {
        width: 24px;
        height: 24px;
      }

      .metric-info {
        display: flex;
        flex-direction: column;
        min-width: 0;

        .metric-num {
          font-size: 22px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 4px;
          font-family: 'DIN Alternate', 'Helvetica Neue', Arial, sans-serif;

          .metric-visit & {
            color: #4680E8;
          }

          .metric-like & {
            color: #F08D48;
          }

          .metric-collect & {
            color: #F0C548;
          }

          .metric-rate & {
            color: #52C41A;
          }
        }

        .metric-label {
          font-size: 13px;
          color: rgba(0, 0, 0, 0.5);
        }
      }
    }
  }
}

</style>
