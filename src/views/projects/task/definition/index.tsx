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

import { defineComponent, onMounted, toRefs, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  NButton,
  NCard,
  NDataTable, NDatePicker, NForm, NFormItem,
  NIcon,
  NInput,
  NPagination,
  NSelect,
  NSpace
} from 'naive-ui'
import { SearchOutlined } from '@vicons/antd'
import { useI18n } from 'vue-i18n'
import { useTable } from './use-table'
import { useTask } from './use-task'
import { TASK_TYPES_MAP } from '@/views/projects/task/constants/task-type'
import Card from '@/components/card'
import VersionModal from './components/version-modal'
import MoveModal from './components/move-modal'
import TaskModal from '@/views/projects/task/components/node/detail-modal'
import styles from './index.module.scss'
import type { INodeData } from './types'
import CrudHeader from '@/components/cue/crud-header.vue'
import CrudForm from '@/components/cue/crud-form.vue'
import { stateType } from '@/common/common'
import CrudPageDs from '@/components/cue/crud-page-ds.vue'

const TaskDefinition = defineComponent({
  name: 'task-definition',
  setup() {
    const route = useRoute()
    const projectCode = Number(route.params.projectCode)
    const { t } = useI18n()

    const { task, onToggleShow, onTaskSave, onEditTask, onInitTask } =
      useTask(projectCode)

    const { variables, getTableData, createColumns } = useTable(onEditTask)

    const requestData = () => {
      getTableData({
        pageSize: variables.pageSize,
        pageNo: variables.page,
        searchTaskName: variables.searchTaskName,
        searchWorkflowName: variables.searchWorkflowName,
        taskType: variables.taskType
      })
    }

    const handlePageChange = (page: number) => {
      variables.page = page
      requestData()
    }

    const onUpdatePageSize = () => {
      variables.page = 1
      requestData()
    }

    const onSearch = () => {
      variables.page = 1
      requestData()
    }

    const onRefresh = () => {
      variables.showVersionModalRef = false
      variables.showMoveModalRef = false
      requestData()
    }
    const onCreate = () => {
      onToggleShow(true)
    }
    const onTaskCancel = () => {
      onToggleShow(false)
      onInitTask()
    }
    const onTaskSubmit = async (params: { data: INodeData }) => {
      const result = await onTaskSave(params.data)
      if (result) {
        onTaskCancel()
        onRefresh()
      }
    }
    onMounted(() => {
      createColumns(variables)
      requestData()
    })

    watch(useI18n().locale, () => {
      createColumns(variables)
    })

    return {
      t,
      ...toRefs(variables),
      ...toRefs(task),
      onSearch,
      requestData,
      handlePageChange,
      onUpdatePageSize,
      onRefresh,
      onCreate,
      onTaskSubmit,
      onTaskCancel,
      projectCode
    }
  },
  render() {
    const {
      t,
      onSearch,
      requestData,
      handlePageChange,
      onUpdatePageSize,
      onRefresh,
      onCreate,
      loadingRef
    } = this

    return (
      <>
        <CrudForm>
          {{
            header: () => (
              <CrudHeader title="任务管理" />
            ),
            condition: () => (
              <NForm showFeedback={false} label-placement="left" inline style="margin-bottom: 3px">
                <NFormItem label="任务名称">
                  <NInput
                    v-model={[this.searchTaskName, 'value']}
                    size='small'
                    placeholder={t('project.task.task_name')}
                    clearable
                  />
                </NFormItem>
                <NFormItem label="工作流名称">
                  <NInput
                    v-model={[this.searchWorkflowName, 'value']}
                    size='small'
                    placeholder={t('project.task.workflow_name')}
                    clearable
                  />
                </NFormItem>
                <NFormItem label="任务类型">
                  <NSelect
                    v-model={[this.taskType, 'value']}
                    size='small'
                    options={Object.keys(TASK_TYPES_MAP).map((item) => {
                      return { value: item, label: item }
                    })}
                    placeholder={t('project.task.task_type')}
                    style={{ width: '180px' }}
                    clearable
                  />
                </NFormItem>
                <NFormItem>
                  <NButton size='small' color={'#0099CB'} type='primary' onClick={onSearch} style={"padding: 0 15px 0 15px"}>
                    <NIcon>
                      <SearchOutlined />
                    </NIcon>
                    <div>
                      查询
                    </div>
                  </NButton>
                </NFormItem>
              </NForm>
            ),
            table: () => (
              <NDataTable
                loading={loadingRef}
                columns={this.columns}
                data={this.tableData}
                scrollX={this.tableWidth}
                size={'small'}
                bordered
                flex-height
                single-line={false}
              />
            ),
            page: () => (
              <CrudPageDs
                page={this.page}
                page-size={this.pageSize}
                item-count={this.total}
                onPageChange={handlePageChange}
                onPageSizeChange={onUpdatePageSize}
              />
            )
          }}
        </CrudForm>
        <VersionModal
          show={this.showVersionModalRef}
          row={this.row}
          onConfirm={() => (this.showVersionModalRef = false)}
          onRefresh={onRefresh}
        />
        <MoveModal
          show={this.showMoveModalRef}
          row={this.row}
          onCancel={() => (this.showMoveModalRef = false)}
          onRefresh={onRefresh}
        />
        <TaskModal
          show={this.taskShow}
          data={this.taskData}
          onSubmit={this.onTaskSubmit}
          onCancel={this.onTaskCancel}
          projectCode={this.projectCode}
          from={1}
          readonly={this.taskReadonly}
          saving={this.taskSaving}
        />
      </>
    )
  }
})

export default TaskDefinition
