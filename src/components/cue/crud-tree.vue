<template>
  <el-config-provider :locale="zhCn">
    <div
      class="cue-drag-layout__mainview"
      style="width: 280px; margin-right: 12px"
    >
      <div class="tree-container">
        <div class="add-buttons">
          <span class="title">分类</span>
          <div
            class="button-item-toggle"
            @click="packHandle"
            :title="expandedKeys.length ? '收起' : '展开'"
          >
            <n-icon size="16" style="padding-top: 5px"
              ><CaretUp v-if="expandedKeys.length" /><CaretDown v-else
            /></n-icon>
          </div>
          <div
            v-if="addButton"
            class="button-item"
            @click="$emit('addEvent')"
            title="添加"
          >
            <n-icon size="16"><Add12Filled /></n-icon>
          </div>
        </div>
        <n-input
          type="text"
          placeholder="搜索"
          class="search-input"
          v-model:value="pattern"
        >
          <template #suffix>
            <n-icon :component="SearchOutlined" />
          </template>
        </n-input>
        <n-spin
          :show="showSpin"
          style="height: 100%"
          content-class="tree-scrollbar"
        >
          <n-tree
            class="tree-scrollbar"
            block-line
            show-irrelevant-nodes
            :data="folderData"
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
    <el-dialog
      v-model="showAddRef"
      :before-close="addDialogVisible"
      width="500px"
    >
      <template #header> 新建文件夹 </template>
      <el-form ref="ruleFormRef" :rules="rules" :model="addFormValue">
        <el-form-item required label="文件夹名称" prop="titleName">
          <el-input
            type="text"
            style="width: 240px"
            v-model="addFormValue.titleName"
          />
        </el-form-item>
        <el-form-item required style="padding-top: 20px" label="目标文件夹">
          <el-tree-select
            :data="treeFolder"
            node-key="id"
            :props="folderProps"
            v-model="selectedMenu"
            check-strictly
            style="width: 240px"
            popper-class="form-item-select"
            :render-content="renderContent"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button color="#0099CB" @click="createMenu(ruleFormRef)"
            >确定</el-button
          >
        </div>
      </template>
    </el-dialog>
    <el-dialog
        v-model="showUpdateRef"
      :before-close="updateDialogVisible"
      title="修改文件夹"
      width="500px"
    >
      <template #header> 修改文件夹 </template>
      <el-form ref="ruleFormRef" :rules="rules" :model="updateFormValue">
        <el-form-item required label="文件夹名称" prop="titleName">
          <el-input
            type="text"
            style="width: 240px"
            v-model="updateFormValue.titleName"
            @input="handleUpdateInput"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button color="#0099CB" @click="updateMenu(ruleFormRef)"
            >确定</el-button
          >
        </div>
      </template>
    </el-dialog>
  </el-config-provider>
</template>

<script setup>
  import { SearchOutlined } from '@vicons/antd'
  import { Add12Filled } from '@vicons/fluent'
  import { CaretUp, CaretDown } from '@vicons/fa'
  import { ref, unref } from 'vue'
  import { NIcon, useMessage } from 'naive-ui'
  import { ElButton } from 'element-plus'
  import zhCn from 'element-plus/es/locale/lang/zh-cn'

  const props = defineProps({
    treeFolder: Array,
    folderData: Array,
    selectedMenu: Number,
    menuIcon: Function,
    renderSuffix: Function,
    nodeProps: Function,
    addButton: {
      type: Boolean,
      default: false
    },
    showAddRef: {
      type: Boolean,
      default: false
    },
    showUpdateRef: {
      type: Boolean,
      default: false
    },
    showSpin: {
      type: Boolean,
      default: false
    },
    updateFormValue: Object,
    addFormValue: Object
  })

  const emit = defineEmits([
    'addEvent',
    'updateMenu',
    'createMenu',
    'update:updateFormValue.titleName',
    'update:addFormValue.titleName',
    'update:showUpdateRef',
    'update:showAddRef'
  ])

  const expandedKeys = ref([1])
  const pattern = ref('')
  const ruleFormRef = ref()
  const message = useMessage()

  const folderProps = {
    children: 'children',
    label: 'titleName'
  }

  const rules = {
    titleName: {
      required: true,
      message: '请输入名称',
      trigger: 'blur'
    }
  }

  const renderContent = (h, { data }) => {
    return h('div',{style: {display: 'flex', alignItems: 'center'}},[
      h('svg', {
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
      ]),
      h(
          'span',
          {
            style: {
              'padding-left': '5px',
            },
          },
          data.titleName
      )
    ])
  }

  function addDialogVisible() {
    props.addFormValue.titleName = ''
    emit('update:showAddRef', false)
    emit('update:addFormValue.titleName', props.addFormValue.titleName)
  }

  function updateDialogVisible() {
    props.updateFormValue.titleName = ''
    emit('update:showUpdateRef', false)
    emit('update:updateFormValue.titleName', props.updateFormValue.titleName)
  }
  function handleUpdateInput() {
    emit('update:updateFormValue.titleName', props.updateFormValue.titleName)
  }

  function createMenu(ruleFormRef) {
    ruleFormRef.validate((valid) => {
      if (valid) {
        emit('createMenu')
      } else {
        message.error('验证失败，请填写完整信息')
      }
    })
  }

  function updateMenu(ruleFormRef) {
    ruleFormRef.validate((valid) => {
      if (valid) {
        emit('updateMenu')
      } else {
        message.error('验证失败，请填写完整信息')
      }
    })
  }

  function onExpandedKeys(keys) {
    expandedKeys.value = keys
  }
  function packHandle() {
    if (expandedKeys.value.length) {
      expandedKeys.value = []
    } else {
      setId(unref(props.treeFolder))
    }
  }

  function setId(datas) {
    //遍历树  获取id数组
    for (let i in datas) {
      expandedKeys.value.push(datas[i].id) // 遍历项目满足条件后的操作
      if (datas[i].children) {
        //存在子节点就递归
        setId(datas[i].children)
      }
    }
  }
</script>

<style scoped></style>
