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
            <CrudHead title="全部数据" defineButton button-title="元数据采集" :loadingMeta="loadingMeta" @click-event="handleMetadata">
              <template v-slot:button-group>
                <div>
                  <el-button
                      class="show-text"
                      :class="{'active-button': paginationReactive.likeState, 'noActive-button': !paginationReactive.likeState}"
                      @click="queryLike"
                  >
                    我的点赞
                  </el-button>
                </div>
                <div>
                  <el-button
                      class="show-text"
                      :class="{'active-button': paginationReactive.collectionState, 'noActive-button': !paginationReactive.collectionState}"
                      @click="queryCollect"
                  >
                    我的收藏
                  </el-button>
                </div>
              </template>
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
                    <div class="list-item mb16 bgf" v-for="item in dataRef" :key="item.id">
                      <div class="top pb16">
                        <div class="FBH FBJ t-title">
                          <div class="t-left">
                            <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M32 192a128 128 0 0 1 128-128h704a128 128 0 0 1 128 128v192H32V192z" fill="#2399ED"></path><path d="M32 384h320v192h-320z" fill="#E3F2FD"></path><path d="M32 384h320v192h-320z" fill="#E3F2FD" ></path><path d="M32 576h320v192h-320z" fill="#CDE8FF" ></path><path d="M32 768h320v192h-192a128 128 0 0 1-128-128v-64z" fill="#ABD9FF" ></path><path d="M352 384h320v192h-320z" fill="#CDE8FF" ></path><path d="M352 384h320v192h-320z" fill="#CDE8FF" ></path><path d="M352 576h320v192h-320z" fill="#ABD9FF" ></path><path d="M352 768h320v192h-320z" fill="#96D0FF" ></path><path d="M672 384h320v192h-320z" fill="#ABD9FF" ></path><path d="M672 384h320v192h-320z" fill="#ABD9FF" ></path><path d="M672 576h320v192h-320z" fill="#96D0FF" ></path><path d="M672 768h320v64a128 128 0 0 1-128 128h-192v-192z" fill="#7FC6FF" ></path></svg>
                            <a target="_blank" rel="noopener noreferrer" class="ml8 mr48 fs16" :title="item.sqlLineageName" @click="play(item)">{{ item.sqlLineageName }}</a>
                          </div>
                          <div class="FBH FBJ FBAC t-right">
                            <div style="display: flex; align-items: center;">
                              <div class="hand">
                                <svg @click="handleLikeCollection(true, item.likeState, item.collectionState, item.sqlLineageName)" class="icon" viewBox="0 0 1024 1024"  xmlns="http://www.w3.org/2000/svg" width="15" height="15"><path d="M335.008 916.629333c-35.914667 22.314667-82.88 10.773333-104.693333-25.557333a77.333333 77.333333 0 0 1-8.96-57.429333l46.485333-198.24a13.141333 13.141333 0 0 0-4.021333-12.864l-152.16-132.586667c-31.605333-27.52-35.253333-75.648-8.234667-107.733333a75.68 75.68 0 0 1 51.733333-26.752L354.848 339.2c4.352-0.362667 8.245333-3.232 10.026667-7.594667l76.938666-188.170666c16.032-39.2 60.618667-57.92 99.52-41.461334a76.309333 76.309333 0 0 1 40.832 41.461334l76.938667 188.16c1.781333 4.373333 5.674667 7.253333 10.026667 7.605333l199.712 16.277333c41.877333 3.413333 72.885333 40.458667 69.568 82.517334a76.938667 76.938667 0 0 1-26.08 51.978666l-152.16 132.586667c-3.541333 3.082667-5.141333 8.074667-4.021334 12.853333l46.485334 198.24c9.621333 41.013333-15.36 82.336-56.138667 92.224a75.285333 75.285333 0 0 1-57.525333-9.237333l-170.976-106.24a11.296 11.296 0 0 0-12.010667 0l-170.986667 106.24z" :fill="item.collectionState ? '#F0D155' : '#bfbfbf'"></path></svg>
                              </div>
                              <span style="color: rgba(0, 0, 0, 0.15); padding: 0 8px">|</span>
                              <div class="hand">
                                <svg @click="handleLikeCollection(false, item.likeState, item.collectionState, item.sqlLineageName)" class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="15" height="15"><path d="M948.4 407.2c-29.2-35.5-76.9-35.5-92.6-35.5H730c10.2-55.2 18.9-119.4 0.2-187.1-12.8-46.6-36.3-79.7-72-101.1-18.7-11.2-38.1-16.9-57.8-16.9-51.8 0-90.6 38.4-96.4 95.7-2.2 21.4-4.2 41.7-9.3 59.1-19 63.9-65.4 112.7-108.3 151.8-16 14.4-33.1 40.2-33.3 69.2-0.6 77.6-0.7 155.5-0.7 235.1l-0.1 141.4c-0.2 47.3 25 85.4 67 101.7 22.2 9 45.7 14 70.1 14.7 38.8 0.5 77.8 0.5 114.3 0.5h56.9c37.2 0 74.4 0 111.8 0.4h1.2c43.5 0 77.7-21.7 93.9-59.5l4.8-11.1c11.3-26 22.9-52.9 30.1-82.8 22-90.9 44.9-188.2 63.4-283.8 7.4-37.9 1.6-68.8-17.4-91.8zM216.1 374.5h-11.9c-56.2 0-101.9 45.7-101.9 101.9v348.4c0 56.2 45.7 101.9 101.9 101.9h11.9c56.2 0 101.9-45.7 101.9-101.9V476.4c0.1-56.2-45.7-101.9-101.9-101.9z" :fill="item.likeState ? '#F0D155' : '#bfbfbf'"></path></svg>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div class="text-box notesPi">
                          <span class="t-label">描述：</span>
                          <span class="color25">{{ item.notes }}</span>
                        </div>
                        <div class="FBH FBJ">
                          <div class="text-box">
                            <span class="t-label">任务流：</span>
                            <span class="t-content">{{ item.taskName }}</span>
                          </div>
                          <div class="text-box">
                            <span class="t-label">数据库：</span>
                            <span class="t-content">{{ item.dataSourceName }}</span>
                          </div>
                          <div class="text-box">
                            <span class="t-label">数据库类型：</span>
                            <span class="t-content">{{ item.dbType }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="bottom pt16 FBH FBJS">
                        <div class="text-box-4">
                          <span class="t-label">数据行数：</span>
                          <span class="t-content text-break">{{ item.tableDataRow }}</span>
                        </div>
                        <div class="text-box-4">
                          <span class="t-label">表大小：</span>
                          <span class="t-content text-break">{{ item.tableDataLength }}</span>
                        </div>
                        <div class="text-box-4">
                          <span class="t-label">添加时间：</span>
                          <span class="t-content">{{ item.tableCreateTime }}</span>
                        </div>
                        <div class="text-box-4">
                          <span class="t-label">修改时间：</span>
                          <span class="t-content">{{ item.tableUpdateTime }}</span>
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
import { NIcon, useMessage } from 'naive-ui'
import {useRoute, useRouter} from "vue-router";
import { CaretUp, CaretDown } from '@vicons/fa'
import CrudHead from "@/components/cue/crud-header.vue"
import {Add12Filled} from "@vicons/fluent";
import utils from "@/utils";
import {ElButton} from "element-plus";
import {useUserStore} from "@/store/user/user";
import {updateLikeCollection} from "@/service/modules/data-bussiness";

const TableData = reactive({
  tableList: [],
  totalNum: 0
})

const userStore = useUserStore()
const dataRef = ref([])
const router = useRouter()
const loadingRef = ref(true)
const loadingMeta = ref(false)
const showSpin = ref(false)
const message = useMessage()
const treeFolder = ref([])
const expandedKeys = ref([1]);
const pattern = ref('');
const route = useRoute()
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
function queryLike () {
  paginationReactive.likeState = 1 - paginationReactive.likeState
  handlePageChange(1, paginationReactive.pageSize)
}
function queryCollect () {
  paginationReactive.collectionState = 1 - paginationReactive.collectionState
  handlePageChange(1, paginationReactive.pageSize)
}

async function handleLikeCollection(ifCollection, initLike, initCollection, tableName) {
  let params = {
    userId: userStore.getUserInfo.id,
    sqlLineageName: tableName,
    likeState: initLike,
    collectionState: initCollection,
  }
  if (ifCollection) {
    params.collectionState = 1 - initCollection
  } else {
    params.likeState = 1 - initLike
  }
  await updateLikeCollection(params)
  handlePageChange(paginationReactive.page, paginationReactive.pageSize)
}

function handleMetadata() {
  let url = utils.getUrl('interface_lineage/sqlLineageExcute')
  loadingMeta.value = true
  message.info('采集中，请稍后查看')
  apiAxios.get(url)
      .then(function () {
        loadingMeta.value = false
      })
      .catch(function () {
        message.error('采集数据失败，请咨询管理员')
      })
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
function play(row) {
  router.push({
        name: 'assets-detail',
        state: {tableName: row.sqlLineageName, tableComment: row.notes, dbType: row.dbType, fieldArray: row.fieldArray, backName: 'assets-catalog'}
      }
  )
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
function setId(datas) { //遍历树  获取id数组
  for (let i in datas) {
    expandedKeys.value.push(datas[i].id)  // 遍历项目满足条件后的操作
    if (datas[i].children) {  //存在子节点就递归
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
  if(route.query.type === 'collect'){
    paginationReactive.collectionState = 1
  } else if(route.query.type === 'like'){
    paginationReactive.likeState = 1
  }
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

.list-item {
  padding: 16px 24px;
  margin: 8px 0;
  border-radius: 15px;
  user-select: none;
  transition: transform 0.3s; /* 添加过渡效果 */

  &:hover {
    /* 悬停特效 */
    transform: scale(1.005); /* 稍微放大 */
    box-shadow: 0 2px 4px rgba(181, 181, 181, 0.3);
  }

  .top {
    border-bottom: 1px solid #e8e8e8;

    .t-title .l-icon {
      width: 16px;
    }
  }

  .bottom {
    flex-wrap: wrap;
  }

  .notesPi {
    padding: 3px 0;
  }

  .text-box {
    width: 33.33%;

    .t-label {
      color: rgba(0, 0, 0, .45);
    }

    .t-content {
      color: rgba(0, 0, 0, .65);
      width: 60%;
      margin-right: 8px;
    }

  }

  .text-box-4 {
    width: 25%;

    .t-label {
      color: rgba(0, 0, 0, .45);
    }

    .t-content {
      color: rgba(0, 0, 0, .65);
      width: 60%;
      margin-right: 8px;
    }

    .t-content.text-break {
      flex: 1;
      word-wrap: break-word;
      word-break: break-all;
    }
  }
}

.bgf {
  background-color: #fff;
}

.pt16 {
  padding-top: 16px;
}

.pb16 {
  padding-bottom: 16px;
}

.FBJ {
  justify-content: space-between;
}

.FBJS {
  justify-content: flex-start;
}

.FBH {
  display: flex;
}

.mr48 {
  margin-right: 48px;
}
.ml8 {
  margin-left: 8px;
}
.fs16 {
  font-size: 16px;
}

.color25 {
  color: rgba(0, 0, 0, .25);
}

a, a:hover {
  color: #2466ff;
}

a {
  text-decoration: none;
  background-color: transparent;
  outline: none;
  cursor: pointer;
  -webkit-transition: color .3s;
  transition: color .3s;
}

.cue-table-container {
  overflow: auto;
  background-color: #e8ecf0;
}

::-webkit-scrollbar {
  display: none;
}

.no-data {
  /* 为“无数据”提示添加样式 */
  height: 100%;
  text-align: center;
  background-color: #ffffff;
  color: #999;
  display: flex;              /* 启用Flexbox布局 */
  justify-content: center;    /* 在水平方向上居中 */
  align-items: center;
  user-select: none;
  .icon {
    margin-right: 8px;  /* 图标和文字间距 */
    flex-shrink: 0;     /* 防止 SVG 被压缩 */
  }
}

.active-button {
  color: #4698EBFF !important;
  border-color: #C8E0F9FF !important;
  background-color: #EDF5FDFF !important;
}

.noActive-button {
  color: #000000 !important;
  border-color: #F1F2F4FF !important;
  background-color: #F1F2F4FF !important;
}

.hand {
  cursor: pointer;
}

</style>

