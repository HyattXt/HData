<template>
  <div class="cue-crud">
    <CrudHeader title="服务策略/新增策略"/>
    <n-card :bordered="false" class="mt-4 proCard" style="border-top: solid 1px #e8ecf0;">
      <n-form
          ref="form1Ref"
          :label-width="90"
          :model="formValue"
          :rules="rules"
          label-placement="left"
          require-mark-placement="left"
          style="margin: 40px 80px 0 80px"
      >
        <n-form-item label="策略名称" path="policyName">
          <n-input
              v-model:value="formValue.policyName"
              placeholder="请输入"
          />
        </n-form-item>
        <n-form-item label="规则类型" path="policyRule">
          <n-select
              v-model:value="formValue.policyRule"
              placeholder="请选择"
              :options="[
          { label: '黑名单', value: 1 },
          { label: '白名单', value: 2 }
        ]"
          />
        </n-form-item>
        <n-form-item label="创建人" path="creator">
          <n-input
              v-model:value="formValue.creator"
              placeholder="请输入"
          />
        </n-form-item>
        <n-form-item label="描述" path="policyDescription">
          <n-input
              v-model:value="formValue.policyDescription"
              type="textarea"
              :rows="2"
              placeholder="描述"
          />
        </n-form-item>
        <div style="float: right">
          <n-tooltip>
            <template #trigger>
              <n-button quaternary @click="addRequest">
                <n-icon size=20 style="padding-right: 3px">
                  <PlusSquareOutlined color="#1890ff"/>
                </n-icon>
              </n-button>
            </template>
            添加行
          </n-tooltip>
        </div>
        <n-data-table :columns="requestColumns" :data="requestParams" class="table-padding"/>
        <n-space justify="center" style="margin-top: 30px">
          <router-link to="/devops/service/api-strategy">
            <n-button tertiary>返回</n-button>
          </router-link>
          <n-button color="#0099CB" type="primary" @click="formSubmit">
            确定
          </n-button>
        </n-space>
      </n-form>
    </n-card>
  </div>
</template>

<script setup>
import {h, onMounted, ref} from 'vue'
import {NButton, NCheckbox, NFormItem, NIcon, NInput, NSelect, NTooltip, useMessage} from 'naive-ui'
import apiAxios from '@/utils/api-axios'
import {useRoute, useRouter} from "vue-router";
import {PlusSquareOutlined, QuestionCircleTwotone} from "@vicons/antd";
import utils from "@/utils";
import CrudHeader from "@/components/cue/crud-header.vue";
import axios from 'axios'

const form1Ref = ref(null)
const message = useMessage()
const isDisable = ref(false)
const emit = defineEmits(['nextStep'])
const route = useRoute()
const router = useRouter()
const requestParams = ref([])
const inputValidationStatus = ref([])
const formValue = ref({
  policyName: '',
  creator: '',
  policyType: 1,
  policyRule: null,
  policyDescription: ''
})

const requestColumns = [
  {
    title: '序号',
    key: 'key',
    align: 'center',
    width: 60,
    render: (_, index) => {
      return `${index + 1}`
    }
  },
  {
    title: "IP地址",
    key: "ipAddr",
    align: 'center',
    render(row, index) {
      return h(NFormItem, {
        validationStatus: inputValidationStatus.value[index],
        showFeedback: false
      }, h(NInput, {
        value: row.ipAddr,
        onUpdateValue(v) {
          requestParams.value[index].ipAddr = v;
        },
        onBlur(v) {
          validateIp(requestParams.value[index].ipAddr, requestParams.value[index].ipType, index)
        }
      }))
    }
  },
  {
    title: "描述",
    key: "name",
    align: 'center',
    render(row, index) {
      return h(NInput, {
        value: row.name,
        onUpdateValue(v) {
          requestParams.value[index].name = v;
        }
      });
    }
  },
  {
    title(column) {
      return h(NTooltip, {
        trigger: 'hover'
      }, {
        trigger: () => h('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            margin: '1px 0'
          }
        }, [
          h('div', '是否IP段'),
          h(NIcon, {style: {paddingLeft: '10px'}}, {default: () => h(QuestionCircleTwotone)})
        ]),
        default: () => h('p', '勾选IP段之后需要输入IP范围，如192.168.0.1~192.168.0.255，否则输入单个IP。')
      });
    },
    key: "ipType",
    width: 100,
    align: 'center',
    render(row, index) {
      return h(NCheckbox, {
        checkedValue: 2,
        uncheckedValue: 1,
        checked: row.ipType,
        onUpdateChecked(v) {
          requestParams.value[index].ipType = v;
          if (v === 2) {
            requestParams.value[index].ipAddr = '~';
          } else {
            requestParams.value[index].ipAddr = '';
          }
        }
      });
    }
  },
  {
    title: "操作",
    key: "actions",
    align: 'center',
    render(row, index) {
      return h(NButton, {
            quaternary: true, onClick: () => {
              deleteRequest(index)
            }
          },
          h(NIcon, {color: "#d3482f", size: 20, style: {paddingRight: '3px'}},
              [
                h('svg', {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: '0 0 28 28',
                  width: ' 19.688',
                  height: '16'
                }, [
                  h('path', {
                    d: 'M14 2.25a3.75 3.75 0 0 1 3.745 3.55l.005.2h5.5a.75.75 0 0 1 .102 1.493l-.102.007h-1.059l-1.22 15.053A3.75 3.75 0 0 1 17.233 26h-6.466a3.75 3.75 0 0 1-3.738-3.447L5.808 7.5H4.75a.75.75 0 0 1-.743-.648L4 6.75a.75.75 0 0 1 .648-.743L4.75 6h5.5A3.75 3.75 0 0 1 14 2.25zm6.687 5.25H7.313l1.211 14.932a2.25 2.25 0 0 0 2.243 2.068h6.466a2.25 2.25 0 0 0 2.243-2.068L20.686 7.5zm-8.937 3.75a.75.75 0 0 1 .743.648L12.5 12v8a.75.75 0 0 1-1.493.102L11 20v-8a.75.75 0 0 1 .75-.75zm4.5 0a.75.75 0 0 1 .743.648L17 12v8a.75.75 0 0 1-1.493.102L15.5 20v-8a.75.75 0 0 1 .75-.75zM14 3.75a2.25 2.25 0 0 0-2.245 2.096L11.75 6h4.5l-.005-.154A2.25 2.25 0 0 0 14 3.75z',
                    fill: 'currentColor'
                  })
                ])
              ]
          )
      )
    }
  }
]

const rules = {
  policyName: [
    {
      required: true,
      message: '请输入名称',
      trigger: 'blur'
    }
  ],
  policyRule: {
    required: true,
    message: '请选择规则类型',
    trigger: 'blur',
    type: 'number'
  },
  creator: {
    required: true,
    message: '请输入创建人',
    trigger: 'blur'
  }
}

const validateIp = (ip, type, index) => {
  if (!!ip) {
    let url = utils.getUrl('ServicePolicy/ipCheck')
    let body = {
      ipAddr: ip,
      ipType: type,
      servicePolicyId: Number(route.query.id) || 0
    }

    axios.post(url, body)
        .then(function (response) {

          if (response.data.status) {
            message.error(response.data.info)
            inputValidationStatus.value[index] = 'error'
          } else {
            inputValidationStatus.value[index] = void 0
          }
        })
  }
}

function formSubmit() {
  form1Ref.value.validate((errors) => {
    if (!errors) {
      let hasError = inputValidationStatus.value.some(function(status) {
        return status === 'error';
      });
      if (!hasError) {
        let body = {
          ...formValue.value,
          servicePolicyIpInfo: requestParams.value
        }
        let policySubmitUrl = utils.getUrl('ServicePolicy/insert')

        if(!!route.query.id){
          policySubmitUrl = utils.getUrl('ServicePolicy/update')
          body.id = Number(route.query.id)
        }
        apiAxios.post(policySubmitUrl, body)
            .then(function (response) {
              message.info(response.data.info)
                router.push({
                  path: '/devops/service/api-strategy',
                })
            })
      } else {
        message.error('验证失败，请重新修改输入的ip')
      }
    } else {
      message.error('验证失败，请填写完整信息')
    }
  })
}

function getInitData() {
  let url = utils.getUrl('ServicePolicy/queryServicePolicyById')
  let params = {id: route.query.id}

  apiAxios.post(url, params)
      .then(function (response) {
        formValue.value = response.data.obj
        requestParams.value = response.data.obj.servicePolicyIpInfo
      })
      .catch(function (error) {
        console.log(error)
      })
}

function addRequest() {
  requestParams.value.push({
    ipAddr: '',
    ipType: 1,
    name: ''
  })
}

function deleteRequest(index) {
  requestParams.value.splice(index, 1)
  inputValidationStatus.value.splice(index, 1)
}

onMounted(() => {
  if (route.query.id !== undefined) {
    getInitData();
    isDisable.value = true
  }
})
</script>

<style lang="scss" scoped>
.table-padding {
  :deep(.n-data-table-td) {
    padding: 0 0 0 12px;
  }
}
</style>
