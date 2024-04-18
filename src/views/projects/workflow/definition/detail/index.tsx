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

import {defineComponent, onBeforeUpdate, onMounted, onUpdated, PropType, ref, unref} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThemeStore } from '@/store/theme/theme'
import { useMessage} from 'naive-ui'
import { useI18n } from 'vue-i18n'
import Dag from '../../components/dag'
import {
  queryProcessDefinitionByCode,
  updateProcessDefinition
} from '@/service/modules/process-definition'
import {
  WorkflowDefinition,
  SaveForm,
  TaskDefinition,
  Connect,
  Location, WorkflowInstance
} from '../../components/dag/types'
import Styles from './index.module.scss'

const props = {
  code: {
    type: Number as PropType<number>,
    default: 0
  },
  projectCode: {
    type: Number as PropType<number>,
    default: 0
  },
  parentId: {
    type: Number as PropType<number>,
    default: 0
  }
}
interface SaveData {
  saveForm: SaveForm
  taskDefinitions: TaskDefinition[]
  connects: Connect[]
  locations: Location[]
}

export default defineComponent({
  name: 'WorkflowDefinitionDetails',
  props,
  setup(props, context) {
    const theme = useThemeStore()
    const route = useRoute()
    const router = useRouter()
    const message = useMessage()
    const { t } = useI18n()
    const definition = ref<WorkflowDefinition>()
    const readonly = ref(false)
    const isLoading = ref(true)

    const refresh = (code: number, projectCode: number) => {
      isLoading.value = true
      queryProcessDefinitionByCode(code, projectCode).then((res: any) => {
        readonly.value = res.processDefinition.releaseState === 'ONLINE'
        definition.value = res
        isLoading.value = false
      })
    }

    context.expose({ refresh })

    const save = ({
      taskDefinitions,
      saveForm,
      connects,
      locations
    }: SaveData) => {
      const globalParams = saveForm.globalParams.map((p) => {
        return {
          prop: p.key,
          value: p.value,
          direct: 'IN',
          type: 'VARCHAR'
        }
      })

      updateProcessDefinition(
        {
          parentId: props.parentId,
          projectCode: props.projectCode,
          type: 2,
          taskDefinitionJson: JSON.stringify(taskDefinitions),
          taskRelationJson: JSON.stringify(connects),
          locations: JSON.stringify(locations),
          name: saveForm.name,
          tenantCode: saveForm.tenantCode,
          executionType: saveForm.executionType,
          description: saveForm.description,
          globalParams: JSON.stringify(globalParams),
          timeout: saveForm.timeoutFlag ? saveForm.timeout : 0,
          releaseState: saveForm.release ? 'ONLINE' : 'OFFLINE'
        },
        !!props.code ? props.code : Number(route.query.code),
        props.projectCode
      ).then((ignored: any) => {
        message.success(t('project.dag.success'))
        router.push({ path: `/devops/${props.projectCode}/workflow-definition` })
      })
    }

    /*onMounted(() => {



      if (!props.code || !props.projectCode) return
      refresh()
    })*/

    return () => (
      <div
        class={[
          Styles.container,
          theme.darkTheme ? Styles['dark'] : Styles['light']
        ]}
      >
        {!isLoading.value ? (
            <Dag
                definition={definition.value}
                onRefresh={refresh}
                projectCode={props.projectCode}
                processCode={props.code}
                onSave={save}
                readonly={readonly.value}
            />
        ):(
              <div style={"height: 100%; display: flex; justify-content: center; flex-direction: column; align-items: center; text-align: center;"}>
                <p style={"font-size: 20px; color: #C2C2C2; user-select: none"}>打开工作流: 双击</p>
                <p style={"font-size: 20px; color: #C2C2C2; user-select: none"}>编辑工作流: 右键</p>
                <p style={"font-size: 20px; color: #C2C2C2; user-select: none"}>新建工作流: 点击+号</p>
              </div>
        )}
      </div>
    )
  }
})
