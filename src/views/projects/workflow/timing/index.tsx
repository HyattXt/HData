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

import {SearchOutlined} from '@vicons/antd'
import {
  NButton,
  NDataTable,
  NForm,
  NFormItemGi,
  NGrid,
  NIcon,
  NInput,
} from 'naive-ui'
import { defineComponent, onMounted, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { Router } from 'vue-router'
import { useTable } from './use-table'
import TimingModal from '../definition/components/timing-modal'
import CrudForm from "@/components/cue/crud-form.vue";
import CrudHeader from "@/components/cue/crud-header.vue";
import CrudPageDs from "@/components/cue/crud-page-ds.vue";

export default defineComponent({
  name: 'WorkflowDefinitionTiming',
  setup() {
    const { variables, createColumns, getTableData } = useTable()

    const requestData = () => {
      getTableData({
        pageSize: variables.pageSize,
        pageNo: variables.page,
        searchVal: variables.searchVal
      })
    }

    const handlePageChange = (page: number) => {
      variables.page = page
      requestData()
    }

    const handleSearch = () => {
      variables.page = 1
      requestData()
    }

    const handleChangePageSize = (pageSize: number) => {
      variables.page = 1
      variables.pageSize = pageSize
      requestData()
    }

    onMounted(() => {
      createColumns(variables)
      requestData()
    })

    watch(useI18n().locale, () => {
      createColumns(variables)
    })

    return {
      requestData,
      handleSearch,
      handlePageChange,
      handleChangePageSize,
      ...toRefs(variables)
    }
  },
  render() {
    const { t } = useI18n()
    const router: Router = useRouter()
    const { loadingRef } = this

    return (
        <>
          <CrudForm>
            {{
              header: () => (
                  <CrudHeader title="工作流定时" />
              ),
              condition: () => (
                  <NForm showFeedback={false} label-placement="left" style="margin-bottom: 3px">
                    <NGrid cols="18" x-gap="16">
                      <NFormItemGi label="名称" span="3">
                        <NInput
                            size={'small'}
                            placeholder={t('resource.file.enter_keyword_tips')}
                            v-model={[this.searchVal, 'value']}
                        />
                      </NFormItemGi>
                      <NFormItemGi span="2">
                        <NButton size='small' color={'#0099CB'} type='primary' onClick={this.handleSearch} style={"padding: 0 15px 0 15px"}>
                          <NIcon>
                            <SearchOutlined />
                          </NIcon>
                          <div style={"font-size: 12px"}>
                            查询
                          </div>
                        </NButton>
                      </NFormItemGi>
                    </NGrid>
                  </NForm>
              ),
              table: () => (
                  <NDataTable
                      loading={loadingRef}
                      rowKey={(row: any) => row.id}
                      columns={this.columns}
                      data={this.tableData}
                      scrollX={this.tableWidth}
                      bordered
                      flex-height
                      single-line={false}
                  />
              ),
              page: () => (
                  <>
                    <CrudPageDs
                        page={this.page}
                        page-size={this.pageSize}
                        item-count={this.total}
                        onPageChange={this.handlePageChange}
                        onPageSizeChange={this.handleChangePageSize}
                    />
                  </>
              )
            }}
          </CrudForm>
          <TimingModal
              type={'update'}
              v-model:row={this.row}
              v-model:show={this.showRef}
              onUpdateList={this.handleSearch}
          />
        </>
    )
  }
})
