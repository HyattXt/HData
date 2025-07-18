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

import { SearchOutlined } from '@vicons/antd'
import {
  NForm,
  NFormItem,
  NInput,
  NButton,
  NDatePicker,
  NSelect,
  NIcon
} from 'naive-ui'
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { stateType } from '@/common/common'

export default defineComponent({
  name: 'ProcessInstanceCondition',
  emits: ['handleSearch'],
  setup(props, ctx) {
    const searchValRef = ref('')
    const executorNameRef = ref('')
    const hostRef = ref('')
    const stateTypeRef = ref('')
    const startEndTimeRef = ref()

    const handleSearch = () => {
      let startDate = ''
      let endDate = ''
      if (startEndTimeRef.value) {
        startDate = format(
          new Date(startEndTimeRef.value[0]),
          'yyyy-MM-dd HH:mm:ss'
        )
        endDate = format(
          new Date(startEndTimeRef.value[1]),
          'yyyy-MM-dd HH:mm:ss'
        )
      }

      ctx.emit('handleSearch', {
        searchVal: searchValRef.value,
        executorName: executorNameRef.value,
        host: hostRef.value,
        stateType: stateTypeRef.value,
        startDate,
        endDate
      })
    }

    return {
      searchValRef,
      executorNameRef,
      hostRef,
      stateTypeRef,
      startEndTimeRef,
      handleSearch
    }
  },
  render() {
    const { t } = useI18n()
    const options = stateType(t)
    return (
      <NForm showFeedback={false} label-placement="left" inline style="margin-bottom: 3px">
        <NFormItem label="名称" >
          <NInput
            size='small'
            clearable
            v-model:value={this.searchValRef}
            placeholder={t('project.workflow.name')}
          />
        </NFormItem>
        <NFormItem label="执行用户" >
          <NInput
            size='small'
            clearable
            v-model:value={this.executorNameRef}
            placeholder={t('project.workflow.executor')}
          />
        </NFormItem>
        <NFormItem label="状态" >
          <NSelect
            size='small'
            options={options}
            defaultValue={''}
            v-model:value={this.stateTypeRef}
            style={{ width: '180px' }}
          />
        </NFormItem>
        <NFormItem label="时间" >
          <NDatePicker
            size='small'
            type='datetimerange'
            clearable
            v-model:value={this.startEndTimeRef}
          />
        </NFormItem>
        <NFormItem >
          <NButton size='small' color={'#0099CB'} type='primary' onClick={this.handleSearch} style={"padding: 0 15px 0 15px"}>
            <NIcon>
              <SearchOutlined />
            </NIcon>
            <div>
              查询
            </div>
          </NButton>
        </NFormItem>
      </NForm>
    )
  }
})
