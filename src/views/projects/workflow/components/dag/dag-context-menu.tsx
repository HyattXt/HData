/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { genTaskCodeAndCopy } from '@/service/modules/task-definition'
import type { Cell } from '@antv/x6'
import { defineComponent, onMounted, PropType, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import styles from './menu.module.scss'
import { IWorkflowTaskInstance } from './types'
import {NButton, NTooltip} from 'naive-ui'

const props = {
  startReadonly: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  menuReadonly: {
    type: Boolean as PropType<boolean>,
    default: false
  },
  taskInstance: {
    type: Object as PropType<IWorkflowTaskInstance>,
    require: true
  },
  cell: {
    type: Object as PropType<Cell>,
    require: true
  },
  visible: {
    type: Boolean as PropType<boolean>,
    default: true
  },
  left: {
    type: Number as PropType<number>,
    default: 0
  },
  top: {
    type: Number as PropType<number>,
    default: 0
  },
  processCode: {
    type: Number as PropType<number>,
    default: 0
  }
}

export default defineComponent({
  name: 'dag-context-menu',
  props,
  emits: ['hide', 'start', 'edit', 'viewLog', 'copyTask', 'removeTasks'],
  setup(props, ctx) {
    const graph = inject('graph', ref())
    const route = useRoute()
    const projectCode = Number(route.params.projectCode)
    const hasInstancesPath = route.path.includes('/instances');

    const hide = () => {
      ctx.emit('hide', false)
    }

    const startRunning = () => {
      ctx.emit('start', Number(props.cell?.id))
    }

    const handleEdit = () => {
      ctx.emit('edit', Number(props.cell?.id),props.cell?.data.taskName, props.cell?.data.taskType)
    }

    const handleViewLog = () => {
      if (props.taskInstance) {
        ctx.emit('viewLog', props.taskInstance.id, props.taskInstance.taskType)
      }
    }

    const handleCopy = () => {
      const type = props.cell?.data.taskType
      const targetCode = Number(props.cell?.id)
      const flag = props.cell?.data.flag

      genTaskCodeAndCopy(targetCode, props.processCode, projectCode).then((res: any) => {
        const code = res.code
        const taskName = res.name
        ctx.emit('copyTask',projectCode, !!props.processCode ? props.processCode : Number(route.query.code), taskName, code, targetCode, type, flag, {
          x: JSON.parse(JSON.stringify(props.cell)).position.x + 30,
          y: JSON.parse(JSON.stringify(props.cell)).position.y
        })
      })
    }

    const handleDelete = () => {
      graph.value?.removeCell(props.cell)
      ctx.emit('removeTasks', [Number(props.cell?.id)])
    }

    onMounted(() => {
      document.addEventListener('click', () => {
        hide()
      })
    })

    return {
      startRunning,
      handleEdit,
      handleCopy,
      handleDelete,
      handleViewLog,
      hasInstancesPath
    }
  },
  render() {
    const { t } = useI18n()

    return (
      this.visible && (
        <div
          class={styles['dag-context-menu']}
          style={{ left: `${this.left}px`, top: `${this.top}px` }}
        >
          <NButton
            class={`${styles['menu-item']}`}
            disabled={this.startReadonly}
            onClick={this.startRunning}
          >
            {t('project.node.start')}
          </NButton>
          {!this.hasInstancesPath &&
            (<NButton
              class={`${styles['menu-item']}`}
              disabled={this.menuReadonly}
              onClick={this.handleEdit}
            >
              {t('project.node.edit')}
            </NButton>)}
          {!this.hasInstancesPath &&
            (<NButton
              class={`${styles['menu-item']}`}
              disabled={this.menuReadonly}
              onClick={this.handleCopy}
            >
              {t('project.node.copy')}
            </NButton>)}
          {!this.hasInstancesPath &&
            (<NTooltip
                    v-slots={{
                      trigger: () => (
                          <NButton
                              class={`${styles['menu-item']}`}
                              disabled={this.menuReadonly}
                              onClick={this.handleDelete}
                          >
                            {t('project.node.delete')}
                          </NButton>
                      ),
                      default: () => '删除该任务后后续将不能新增该任务，如需恢复请点击对应版本恢复'
                    }}
                ></NTooltip>)}
          {this.taskInstance && (
            <NButton
              class={`${styles['menu-item']}`}
              onClick={this.handleViewLog}
            >
              {t('project.node.view_log')}
            </NButton>
          )}
        </div>
      )
    )
  }
})
