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

import { ref, onMounted, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { queryResourceList } from '@/service/modules/resources'
import { useTaskNodeStore } from '@/store/project/task-node'
import { NButton, NIcon, NTag } from 'naive-ui'
import utils from '@/utils'
import type { IJsonItem, IResource } from '../types'
import { CopyOutlined } from '@vicons/antd'
import { useClipboard } from '@vueuse/core'

export function useResources(): IJsonItem {
  const { t } = useI18n()

  const resourcesOptions = ref([] as IResource[])
  const resourcesLoading = ref(false)

  const taskStore = useTaskNodeStore()

  const source = ref('Hello')
  const { copy } = useClipboard({ source })

  const getResources = async () => {
/*    if (taskStore.resources.length) {
      resourcesOptions.value = taskStore.resources
      return
    }*/
    if (resourcesLoading.value) return
    resourcesLoading.value = true
    const res = await queryResourceList({ type: 'FILE' })
    utils.removeUselessChildren(res)
    resourcesOptions.value = res || []
    resourcesLoading.value = false
    taskStore.updateResource(res)
  }

  const copyResourceName = async (name: string) => {
    event?.stopPropagation()
    await copy(name)
    window.$message.success(t('project.node.copy_success'))
  }

  onMounted(() => {
    getResources()
  })

  return {
    type: 'tree-select',
    field: 'resourceList',
    class: 'resource-select',
    name: t('project.node.resources'),
    span: 24,
    options: resourcesOptions,
    props: {
      multiple: true,
      checkable: true,
      cascade: true,
      showPath: true,
      filterable: true,
      clearFilterAfterSelect: false,
      checkStrategy: 'child',
      placeholder: t('project.node.resources_tips'),
      keyField: 'fullName',
      labelField: 'name',
      disabledField: 'disable',
      loading: resourcesLoading.value,
      'render-tag': ({
                       option,
                       handleClose
                     }: {
        option: any
        handleClose: any
      }) => {
        return h(
            NTag,
            {
              type: 'success',
              closable: true,
              onClose: () => {
                handleClose()
              }
            },
            {
              default: () => option.fullName,
              avatar: () =>
                  h(
                      NButton,
                      {
                        tag: 'div',
                        type: 'info',
                        size: 'tiny',
                        onClick: () => copyResourceName(option.fullName)
                      },
                      {
                        icon: () =>
                            h(NIcon, null, {
                              default: () => h(CopyOutlined)
                            })
                      }
                  )
            }
        )
      }
    }
  }
}
