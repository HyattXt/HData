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

import { useRouter } from 'vue-router'
import { defineComponent, onMounted, ref, reactive, Ref } from 'vue'
import {
  NIcon,
  NDataTable,
  NButton,
  NInput,
  NBreadcrumb,
  NBreadcrumbItem, NForm, NGrid, NFormItemGi
} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { SearchOutlined } from '@vicons/antd'
import { useTable } from './table/use-table'
import { useFileState } from './use-file'
import ResourceFolderModal from './folder'
import ResourceUploadModal from './upload'
import ResourceRenameModal from './rename'
import { BreadcrumbItem, IRenameFile } from './types'
import type { Router } from 'vue-router'
import styles from './index.module.scss'
import { useFileStore } from '@/store/file/file'
import {
  queryCurrentResourceById,
  queryResourceById
} from '@/service/modules/resources'
import { ResourceFile } from '@/service/modules/resources/types'
import CrudForm from "@/components/cue/crud-form.vue";
import CrudHeader from "@/components/cue/crud-header.vue";
import CrudPageDs from "@/components/cue/crud-page-ds.vue";

export default defineComponent({
  name: 'File',
  setup() {
    const router: Router = useRouter()
    const fileId = ref(Number(router.currentRoute.value.params.id) || -1)

    const resourceListRef = ref()
    const folderShowRef = ref(false)
    const uploadShowRef = ref(false)
    const renameShowRef = ref(false)
    const searchRef = ref()

    const renameInfo = reactive({
      id: -1,
      name: '',
      description: ''
    })

    const paginationReactive = reactive({
      page: 1,
      pageSize: 30,
      itemCount: 0,
      pageSizes: [10, 30, 50]
    })

    const handleUpdatePage = (page: number) => {
      paginationReactive.page = page
      resourceListRef.value = getResourceListState(
        fileId.value,
        searchRef.value,
        paginationReactive.page,
        paginationReactive.pageSize
      )
    }

    const handleUpdatePageSize = (pageSize: number) => {
      paginationReactive.page = 1
      paginationReactive.pageSize = pageSize
      resourceListRef.value = getResourceListState(
        fileId.value,
        searchRef.value,
        paginationReactive.page,
        paginationReactive.pageSize
      )
    }

    const handleShowModal = (showRef: Ref<Boolean>) => {
      showRef.value = true
    }

    const setPagination = (count: number) => {
      paginationReactive.itemCount = count
    }

    const { getResourceListState } = useFileState(setPagination)

    const handleConditions = () => {
      resourceListRef.value = getResourceListState(
        fileId.value,
        searchRef.value
      )
    }

    const handleCreateFolder = () => {
      handleShowModal(folderShowRef)
    }

    const handleCreateFile = () => {
      const name = fileId.value
        ? 'resource-subfile-create'
        : 'resource-file-create'
      router.push({
        name,
        params: { id: fileId.value }
      })
    }

    const handleUploadFile = () => {
      handleShowModal(uploadShowRef)
    }

    const handleRenameFile: IRenameFile = (id, name, description) => {
      renameInfo.id = id
      renameInfo.name = name
      renameInfo.description = description
      handleShowModal(renameShowRef)
    }

    const handleGoRoot = () => {
      router.push({
        name: 'file-manage'
      })
    }

    const updateList = () => {
      resourceListRef.value = getResourceListState(
        fileId.value,
        searchRef.value
      )
    }
    const fileStore = useFileStore()

    onMounted(() => {
      resourceListRef.value = getResourceListState(fileId.value)
    })

    const breadcrumbItemsRef: Ref<Array<BreadcrumbItem> | undefined> = ref([
      {
        id: 1,
        fullName: 'l1'
      },
      {
        id: 2,
        fullName: 'l2'
      },
      {
        id: 4,
        fullName: 'l3'
      }
    ])

    onMounted(() => {
      const currFileId = Number(router.currentRoute.value.params.id) || -1
      if (currFileId === -1) {
        fileStore.setCurrentDir('/')
      } else {
        queryCurrentResourceById(currFileId).then((res: ResourceFile) => {
          if (res.fullName) {
            fileStore.setCurrentDir(res.fullName)
          }
        })
      }
    })

    const initBreadcrumb = async (dirs: string[]) => {
      let index = 0
      for (const dir of dirs) {
        const newDir = dirs.slice(0, index + 1).join('/')
        if (newDir) {
          const id = 0
          const resource = await queryResourceById(
            {
              id,
              type: 'FILE',
              fullName: newDir
            },
            id
          )
          breadcrumbItemsRef.value?.push({ id: resource.id, fullName: dir })
        } else {
          breadcrumbItemsRef.value?.push({ id: 0, fullName: 'Root' })
        }
        index = index + 1
      }
    }

    onMounted(() => {
      breadcrumbItemsRef.value = []
      if (fileId.value != -1) {
        queryCurrentResourceById(fileId.value).then((res: ResourceFile) => {
          if (res.fullName) {
            const dirs = res.fullName.split('/')
            if (dirs && dirs.length > 1) {
              initBreadcrumb(dirs)
            }
          }
        })
      }
    })

    return {
      fileId,
      searchRef,
      folderShowRef,
      uploadShowRef,
      renameShowRef,
      handleShowModal,
      resourceListRef,
      updateList,
      handleConditions,
      handleCreateFolder,
      handleCreateFile,
      handleUploadFile,
      handleRenameFile,
      handleUpdatePage,
      handleUpdatePageSize,
      handleGoRoot,
      pagination: paginationReactive,
      renameInfo,
      breadcrumbItemsRef
    }
  },
  render() {
    const { t } = useI18n()
    const { columnsRef, tableWidth } = useTable(
      this.handleRenameFile,
      this.updateList
    )
    const {
      handleConditions,
      handleCreateFolder,
      handleCreateFile,
      handleUploadFile
    } = this

    return (
      <>
        <CrudForm>
          {{
            header: () => (
                <CrudHeader
                    title="文件管理"
                    addButton
                    onAddEvent={handleCreateFolder}
                >
                  {{
                    'button-group': () => (
                        <div>
                          <el-button
                              class={"show-text el-button--default"}
                              onClick={handleUploadFile}
                          >
                            上传文件
                          </el-button>
                          <el-button
                              class={"show-text el-button--default"}
                              onClick={handleCreateFile}
                          >
                            创建文件
                          </el-button>
                        </div>
                    )}}
                </CrudHeader>
            ),
            condition: () => (
                <div style={'display: row'}>
                  <NForm showFeedback={false} label-placement="left" style="margin-bottom: 3px">
                    <NGrid cols="18" x-gap="16">
                      <NFormItemGi label="名称" span="3">
                        <NInput
                            size={'small'}
                            placeholder={t('resource.file.enter_keyword_tips')}
                            v-model={[this.searchRef, 'value']}
                        />
                      </NFormItemGi>
                      <NFormItemGi span="2">
                        <NButton size='small' color={'#0099CB'} type='primary' onClick={handleConditions} style={"padding: 0 15px 0 15px"}>
                          <NIcon>
                            <SearchOutlined />
                          </NIcon>
                          <div>
                            查询
                          </div>
                        </NButton>
                      </NFormItemGi>
                    </NGrid>
                  </NForm>
                  <NBreadcrumb separator='>' class={styles['breadcrumb']}>
                    {this.breadcrumbItemsRef?.map((item: BreadcrumbItem) => {
                      if (item.id === 0) {
                        return (
                            <NBreadcrumbItem>
                              <span onClick={this.handleGoRoot}>{item.fullName}</span>
                            </NBreadcrumbItem>
                        )
                      } else {
                        return (
                            <NBreadcrumbItem href={item.id.toString()}>
                              {item.fullName}
                            </NBreadcrumbItem>
                        )
                      }
                    })}
                  </NBreadcrumb>
                </div>
            ),
            table: () => (
                <NDataTable
                    remote
                    columns={columnsRef}
                    data={this.resourceListRef?.value.table}
                    scrollX={tableWidth}
                    bordered
                    flex-height
                    single-line={false}
                    class={"cue-table"}
                />
            ),
            page: () => (
                <CrudPageDs
                    page={this.pagination.page}
                    page-size={this.pagination.pageSize}
                    item-count={this.pagination.itemCount}
                    onPageChange={this.handleUpdatePage}
                    onPageSizeChange={this.handleUpdatePageSize}
                />
            )
          }}
        </CrudForm>
        <ResourceFolderModal
          v-model:show={this.folderShowRef}
          onUpdateList={this.updateList}
        />
        <ResourceUploadModal
          v-model:show={this.uploadShowRef}
          onUpdateList={this.updateList}
        />
        <ResourceRenameModal
          v-model:show={this.renameShowRef}
          id={this.renameInfo.id}
          name={this.renameInfo.name}
          description={this.renameInfo.description}
          onUpdateList={this.updateList}
        />
      </>
    )
  }
})
