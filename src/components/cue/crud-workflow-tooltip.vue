<template>
  <div class="cue-workflow__header" >
    <div class="cue-workflow__header-left">
      <el-tooltip content="保存" placement="top">
        <n-button text :disabled="readOnly" @click="$emit('saveEvent')">
          <n-icon size="18">
            <Save24Regular />
          </n-icon>
        </n-button>
      </el-tooltip>
      <el-tooltip content="执行" placement="top">
        <n-button v-if="showRun" text tag="div" :disabled="disableRun" style="margin-right: 20px" @click="$emit('runEvent')">
          <n-icon size="18">
            <PlayCircle20Regular />
          </n-icon>
        </n-button>
      </el-tooltip>
      <el-tooltip v-if="showStop" content="停止" placement="top">
        <n-button text tag="div" :disabled="disableStop" style="margin-right: 20px" @click="$emit('stopEvent')">
          <n-icon size="18">
            <RecordStop24Regular />
          </n-icon>
        </n-button>
      </el-tooltip>
      <el-tooltip v-if="showFormat" content="格式化" placement="top">
        <n-button text :disabled="readOnly" @click="$emit('formatEvent')">
          <n-icon size="18">
            <Broom16Filled />
          </n-icon>
        </n-button>
      </el-tooltip>
      <slot name="define-button"></slot>
      <n-tag v-if="releaseState === 1" type="info">
        已上线
      </n-tag>
      <n-tag v-if="releaseState === 2" type="warning">
        审批中
      </n-tag>
    </div>
    <div class="cue-workflow__header-right">
      <div style="padding-right: 10px">
        <n-button strong secondary size="small" type="info" @click="showVersionModalRef = true" :disabled="readOnly">
          版本: V{{version}}
        </n-button>
      </div>
      <div style="padding-right: 10px">
      <n-button v-if="$route.query.back" secondary size="small" type="info" color="#0099CB" @click="onClose">
        关闭
      </n-button>
      </div>
      <slot name="right"></slot>
    </div>
  </div>
  <VersionModal
      :show="showVersionModalRef"
      :row="{taskCode: taskCode, taskVersion: version}"
      @confirm="showVersionModalRef = false"
      @refresh="onRefresh"
  />
</template>

<script setup>

import { Save24Regular, PlayCircle20Regular, RecordStop24Regular, Broom16Filled } from '@vicons/fluent'
import VersionModal from "@/views/projects/task/definition/components/version-modal";
import { ref } from "vue";
import { useRouter } from 'vue-router'

defineProps({
  disableRun: {
    type: Boolean,
    default: false
  },
  disableStop: {
    type: Boolean,
    default: true
  },
  showFormat: {
    type: Boolean,
    default: false
  },
  readOnly: {
    type: Boolean,
    default: false
  },
  releaseState: {
    type: Number
  },
  showRun: {
    type: Boolean,
    default: true
  },
  showStop: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  },
  taskCode: {
    type: Number,
    default: 0
  }
})

const router = useRouter()
const showVersionModalRef = ref(false)
const emit = defineEmits(['refresh', 'saveEvent', 'runEvent', 'stopEvent'])

const onRefresh = () => {
  showVersionModalRef.value = false
  emit('refresh');
}

const onClose = () => {
  if (history.state.back !== '/login') {
    router.go(-1)
    return
  }
}

console.log(history.state)

</script>

<style lang="scss">
@import '@/components/cue/variables.scss';

.cue-workflow__header {
  width: 100%;
  border-bottom: 1px solid #ddd;
  padding: 0 20px;
  height: 40px;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  flex-flow: row nowrap;
  -webkit-box-align: center;
  align-items: center;
  background-color: #fff;

  >div {
    width: 50%;
    height: 100%;
  }

  .cue-workflow__header-left {
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    flex-flow: row nowrap;
    -webkit-box-align: center;
    align-items: center;

     button {
      margin-right: 20px;
      cursor: pointer;
    }
  }

  .cue-workflow__header-right {
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    flex-flow: row nowrap;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: end;
    justify-content: flex-end;
    padding-right: 56px;
  }
}
</style>
