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

import { reactive, h } from 'vue'
import { NEllipsis, NIcon } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import {
  HomeOutlined,
  ProfileOutlined,
  FolderOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  LogoutOutlined,
  FundProjectionScreenOutlined,
  PartitionOutlined,
  SettingOutlined,
  FileSearchOutlined,
  RobotOutlined,
  AppstoreOutlined,
  UsergroupAddOutlined,
  UserAddOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ControlOutlined,
  SlackOutlined,
  EnvironmentOutlined,
  KeyOutlined,
  SafetyOutlined,
  GroupOutlined,
  ContainerOutlined,
  ApartmentOutlined,
  BarsOutlined,
  CloudServerOutlined,
  ApiOutlined,
  PieChartOutlined,
  BarChartOutlined,
  BoxPlotOutlined
} from '@vicons/antd'
import { useRoute, RouterLink } from 'vue-router'
import { useUserStore } from '@/store/user/user'
import { timezoneList } from '@/common/timezone'
import type { UserInfoRes } from '@/service/modules/users/types'

export function useDataList() {
  const { t } = useI18n()
  const route = useRoute()
  const userStore = useUserStore()

  const renderIcon = (icon: any) => {
    return () => h(NIcon, null, { default: () => h(icon) })
  }

  const localesOptions = [
    {
      label: 'English',
      key: 'en_US'
    },
    {
      label: '中文',
      key: 'zh_CN'
    }
  ]

  const timezoneOptions = () =>
    timezoneList.map((item) => ({ label: item, value: item }))

  const state = reactive({
    isShowSide: false,
    localesOptions,
    timezoneOptions: timezoneOptions(),
    userDropdownOptions: [],
    menuOptions: [],
    headerMenuOptions: [],
    iconMenuOptions: [],
    sideMenuOptions: []
  })

  const changeMenuOption = (state: any) => {
    const projectCode = route.params.projectCode || ''
    state.menuOptions = [
      {
        label: () => h(NEllipsis, null, { default: () => t('menu.home') }),
        key: 'home',
        icon: renderIcon(HomeOutlined)
      },
      {
        label: () => h(NEllipsis, null, { default: () => t('menu.project') }),
        key: 'projects',
        icon: renderIcon(ProfileOutlined),
        children: [
          {
            label: t('menu.project_overview'),
            key: `/projects/${projectCode}`,
            icon: renderIcon(FundProjectionScreenOutlined)
          },
          {
            label: t('menu.workflow'),
            key: 'workflow',
            icon: renderIcon(PartitionOutlined),
            children: [
              {
                label: t('menu.workflow_relation'),
                key: `/projects/${projectCode}/workflow/relation`
              },
              {
                label: t('menu.workflow_definition'),
                key: `/projects/${projectCode}/workflow-definition`
              },
              /*{
                label: t('menu.workflow_instance'),
                key: `/projects/${projectCode}/workflow/instances`
              }*/
            ]
          },
          {
            label: t('menu.task'),
            key: 'task',
            icon: renderIcon(SettingOutlined),
            children: [
              {
                label: t('menu.task_definition'),
                key: `/projects/${projectCode}/task/definitions`
              },
              /*{
                label: t('menu.task_instance'),
                key: `/projects/${projectCode}/task/instances`
              }*/
            ]
          }
        ]
      },
      {
        label: () => h(NEllipsis, null, { default: () => t('menu.resources') }),
        key: 'resource',
        icon: renderIcon(FolderOutlined),
        children: [
          {
            label: t('menu.file_manage'),
            key: '/resource/file-manage',
            icon: renderIcon(FileSearchOutlined)
          },
          {
            label: t('menu.udf_manage'),
            key: 'udf-manage',
            icon: renderIcon(RobotOutlined),
            children: [
              {
                label: t('menu.resource_manage'),
                key: '/resource/resource-manage'
              },
              {
                label: t('menu.function_manage'),
                key: '/resource/function-manage'
              }
            ]
          },
          {
            label: t('menu.task_group_manage'),
            key: 'task-group-manage',
            icon: renderIcon(GroupOutlined),
            children: [
              {
                label: t('menu.task_group_option'),
                key: '/resource/task-group-option'
              },
              {
                label: t('menu.task_group_queue'),
                key: '/resource/task-group-queue'
              }
            ]
          }
        ]
      },
      {
        label: () =>
          h(NEllipsis, null, { default: () => t('menu.data_quality') }),
        key: 'data-quality',
        icon: renderIcon(ContainerOutlined),
        children: [
          {
            label: t('menu.task_result'),
            key: '/data-quality/task-result',
            icon: renderIcon(ApartmentOutlined)
          },
          {
            label: t('menu.rule'),
            key: '/data-quality/rule',
            icon: renderIcon(BarsOutlined)
          }
        ]
      },
      {
        label: () =>
          h(NEllipsis, null, { default: () => t('menu.datasource') }),
        key: 'datasource',
        icon: renderIcon(DatabaseOutlined),
        children: []
      },
      {
        label: () => h(NEllipsis, null, { default: () => t('menu.monitor') }),
        key: 'monitor',
        icon: renderIcon(DesktopOutlined),
        children: [
          {
            label: t('menu.service_manage'),
            key: 'service-manage',
            icon: renderIcon(AppstoreOutlined),
            children: [
              {
                label: t('menu.master'),
                key: '/monitor/master'
              },
              {
                label: t('menu.worker'),
                key: '/monitor/worker'
              },
              {
                label: t('menu.db'),
                key: '/monitor/db'
              }
            ]
          },
          {
            label: t('menu.statistical_manage'),
            key: 'statistical-manage',
            icon: renderIcon(AppstoreOutlined),
            children: [
              {
                label: t('menu.statistics'),
                key: '/monitor/statistics'
              },
              {
                label: t('menu.audit_log'),
                key: '/monitor/audit-log'
              }
            ]
          }
        ]
      },
      {
        label: () => h(NEllipsis, null, { default: () => t('menu.security') }),
        key: 'security',
        icon: renderIcon(SafetyCertificateOutlined),
        children:
          (userStore.getUserInfo as UserInfoRes).userType === 'ADMIN_USER'
            ? [
              {
                label: t('menu.tenant_manage'),
                key: '/security/tenant-manage',
                icon: renderIcon(UsergroupAddOutlined)
              },
              {
                label: t('menu.user_manage'),
                key: '/security/user-manage',
                icon: renderIcon(UserAddOutlined)
              },
              {
                label: t('menu.alarm_group_manage'),
                key: '/security/alarm-group-manage',
                icon: renderIcon(WarningOutlined)
              },
              {
                label: t('menu.alarm_instance_manage'),
                key: '/security/alarm-instance-manage',
                icon: renderIcon(InfoCircleOutlined)
              },
              {
                label: t('menu.worker_group_manage'),
                key: '/security/worker-group-manage',
                icon: renderIcon(ControlOutlined)
              },
              {
                label: t('menu.yarn_queue_manage'),
                key: '/security/yarn-queue-manage',
                icon: renderIcon(SlackOutlined)
              },
              {
                label: t('menu.environment_manage'),
                key: '/security/environment-manage',
                icon: renderIcon(EnvironmentOutlined)
              },
              {
                label: t('menu.k8s_namespace_manage'),
                key: '/security/k8s-namespace-manage',
                icon: renderIcon(CloudServerOutlined)
              },
              {
                label: t('menu.token_manage'),
                key: '/security/token-manage',
                icon: renderIcon(SafetyOutlined)
              }
            ]
            : [
              {
                label: t('menu.token_manage'),
                key: '/security/token-manage',
                icon: renderIcon(SafetyOutlined)
              }
            ]
      },

      {
        label: () => h(NEllipsis, null, { default: () => t('menu.devops') }),
        key: 'devops',
        icon: renderIcon(BoxPlotOutlined),
        children: [
          {
            label: t('menu.devops_overview'),
            key: '/devops/devops_overview',
            icon: renderIcon(BarsOutlined)
          },
          {
            label: t('menu.devops_task'),
            key: 'devops_task',
            icon: renderIcon(SettingOutlined),
            children: [
              {
                label: t('menu.workflow_instance'),
                key: `/devops/${projectCode}/workflow/instances`
              },
              {
                label: t('menu.task_instance'),
                key: `/devops/${projectCode}/task/instances`
              }
            ]
          }
        ]
      },
      window.webConfig.SHOW_API ? {
        label: () => h(NEllipsis, null, { default: () => t('menu.api') }),
        key: 'service',
        icon: renderIcon(ApiOutlined),
        children: [
          {
            label: t('menu.api_dev'),
            key: '/service/api-dev',
            icon: renderIcon(ApartmentOutlined)
          },
          {
            label: t('menu.api_manager'),
            key: '/service/api-manager',
            icon: renderIcon(BarsOutlined)
          }
        ]
      } : {},
      window.webConfig.SHOW_DATA_ASSETS ? {
        label: () => h(NEllipsis, null, { default: () => t('menu.data_assets') }),
        key: 'data-assets',
        icon: renderIcon(PieChartOutlined),
        children: !!window.webConfig.VITE_APP_PROD_ASSETS_HOME_URL ? [
          {
            label: t('menu.assets_overview'),
            key: '/data-assets/assets-overview',
            icon: renderIcon(BarChartOutlined)
          },
          {
            label: t('menu.assets_catalog'),
            key: '/data-assets/assets-catalog',
            icon: renderIcon(BarsOutlined)
          }
        ] : [
          {
            label: t('menu.assets_catalog'),
            key: '/data-assets/assets-catalog',
            icon: renderIcon(BarsOutlined)
          }
        ]

      } : {},

      window.webConfig.SHOW_REST ? {
        label: () => h(NEllipsis, null, { default: () => t('menu.rest') }),
        key: 'rest',
        icon: renderIcon(BoxPlotOutlined),
        children: [
          {
            label: t('menu.rest_manager'),
            key: '/rest/rest-manager',
            icon: renderIcon(BarsOutlined)
          }
        ]
      } : {}
    ]
  }

  const changeHeaderMenuOptions = (state: any) => {
    state.headerMenuOptions = state.menuOptions.filter(x => x.key !== 'line_test' && x.key !== 'security' && x.key !== 'data-quality' && x.key !== 'task-group-manage' && x.key !== 'resource' && x.key !== 'datasource').map(
      (item: { label: string; key: string; icon: any }) => {
        return {
          label: item.label,
          key: item.key,
          // icon: item.icon
        }
      }
    )
  }
  const changeIconMenuOptions = (state: any) => {
    state.iconMenuOptions = state.menuOptions.filter(item => item.key === 'line_test' || item.key === 'security' || item.key === 'data-quality' || item.key === 'task-group-manage' || item.key === 'resource' || item.key === 'datasource').map(
      (item: { label: string; key: string; icon: any, children: any }) => {
        return {
          // label: () =>
          //   h(
          //     'a',
          //     {
          //       href: '/' + item.key,
          //       target: '_self',
          //       rel: 'subsection'
          //     },
          //     ''
          //   ),
          label: () =>
            h(
              RouterLink,
              {
                to: {
                  path: '/' + item.key,
                }
              },
              ''
            ),
          key: item.key,
          icon: item.icon,
          children: [
            {
              label: item.label,
              key: item.key,
              // icon: item.icon
            }
          ]
        }
      }
    )
  }
  const changeUserDropdown = (state: any) => {
    state.userDropdownOptions = [
      {
        label: t('user_dropdown.profile'),
        key: 'profile',
        icon: renderIcon(UserOutlined)
      },
      {
        label: t('user_dropdown.password'),
        key: 'password',
        icon: renderIcon(KeyOutlined)
      },
      {
        label: t('user_dropdown.logout'),
        key: 'logout',
        icon: renderIcon(LogoutOutlined)
      }
    ]
  }

  return {
    state,
    changeHeaderMenuOptions,
    changeIconMenuOptions,
    changeMenuOption,
    changeUserDropdown
  }
}
