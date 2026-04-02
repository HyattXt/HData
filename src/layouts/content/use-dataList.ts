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
import { NEllipsis, NIcon, useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import {
  FolderOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  LogoutOutlined,
  PartitionOutlined,
  SettingOutlined,
  FileSearchOutlined,
  RobotOutlined,
  AppstoreOutlined,
  UsergroupAddOutlined,
  UserAddOutlined,
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
  BarChartOutlined,
  ProjectOutlined,
  FormOutlined,
  RadarChartOutlined,
  VerifiedOutlined, UnorderedListOutlined, TagsOutlined, AppstoreTwotone
} from '@vicons/antd'
import { SecurityFilled, DesignServicesFilled, PlaylistAddCheckTwotone } from '@vicons/material'
import { RuleDraft, UserAvatarFilled, UserMultiple, Catalog } from '@vicons/carbon'
import { TextBulletListSquareEdit24Regular, DocumentBulletListClock20Regular, MyLocation16Filled, EditSettings24Regular, ClockAlarm16Regular } from '@vicons/fluent'
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user/user'
import { timezoneList } from '@/common/timezone'
import type { UserInfoRes } from '@/service/modules/users/types'
import { useProjectStore } from "@/store/route/project";

export function useDataList() {
  const { t } = useI18n()
  const userStore = useUserStore()
  const ProjectStore = useProjectStore()
  const router = useRouter()

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
    // 检查登录状态的辅助函数
    const checkLogin = (key: string): boolean => {
      if (!userStore.isLoggedIn && key !== 'home' && !key.startsWith('/home')) {
        window.$message.warning('请先登录后再访问此功能')
        return false
      }
      return true
    }

    state.menuOptions = [
      {
        label: () => h(NEllipsis, null, { default: () => t('menu.home') }),
        key: 'home'
      },
      {
        label: () => h(NEllipsis, null, { default: () => '资源目录' }),
        key: 'service',
        children: [
          {
            label: t('menu.token_manage'),
            key: 'service/api-dev',
            icon: renderIcon(SafetyOutlined),
            onClick: (e: MouseEvent) => {
              if (!checkLogin('/service/api-dev')) {
                e.preventDefault()
                return false
              }
            }
          }
        ]
      },
            {
        label: () => h(NEllipsis, null, { default: () => '我的资源' }),
        key: 'my-service',
        children: [
          {
            label: t('menu.token_manage'),
            key: 'my-service/api-manager',
            icon: renderIcon(SafetyOutlined),
            onClick: (e: MouseEvent) => {
              if (!checkLogin('/my-service/api-manager')) {
                e.preventDefault()
                return false
              }
            }
          }
        ]
      },
      ...((userStore.getUserInfo as UserInfoRes).approvalUserType == 1
        ? [
          {
            label: () => h(NEllipsis, null, { default: () => t('menu.token_manage') }),
            key: 'security',
            children: [
              {
                label: t('menu.token_manage'),
                key: '/security/token-manage',
                icon: renderIcon(SafetyOutlined),
                onClick: (e: MouseEvent) => {
                  if (!checkLogin('/security/token-manage')) {
                    e.preventDefault()
                    return false
                  }
                }
              }
            ]
          }
        ]
        : []),
      {
        label: () => h(NEllipsis, null, { default: () => t('menu.data_examine') }),
        key: 'data-examine',
        children: (userStore.getUserInfo as UserInfoRes).approvalUserType == 1
          ? [
              {
                label: t('menu.examine_list'),
                key: '/data-examine/examine-list',
                icon: renderIcon(BarsOutlined),
                onClick: (e: MouseEvent) => {
                  if (!checkLogin('/data-examine/examine-list')) {
                    e.preventDefault()
                    return false
                  }
                }
              },
              {
                label: t('menu.my_examine'),
                key: '/data-examine/my-examine',
                icon: renderIcon(DocumentBulletListClock20Regular),
                onClick: (e: MouseEvent) => {
                  if (!checkLogin('/data-examine/my-examine')) {
                    e.preventDefault()
                    return false
                  }
                }
              },
              {
                label: t('menu.already_examine'),
                key: '/data-examine/already-examine',
                icon: renderIcon(PlaylistAddCheckTwotone),
                onClick: (e: MouseEvent) => {
                  if (!checkLogin('/data-examine/already-examine')) {
                    e.preventDefault()
                    return false
                  }
                }
              },
              {
                label: t('menu.my_approval'),
                key: '/data-examine/my-approval',
                icon: renderIcon(MyLocation16Filled),
                onClick: (e: MouseEvent) => {
                  if (!checkLogin('/data-examine/my-approval')) {
                    e.preventDefault()
                    return false
                  }
                }
              }
            ]
          : [
              {
                label: t('menu.my_approval'),
                key: '/data-examine/my-approval',
                icon: renderIcon(MyLocation16Filled),
                onClick: (e: MouseEvent) => {
                  if (!checkLogin('/data-examine/my-approval')) {
                    e.preventDefault()
                    return false
                  }
                }
              }
            ]
      }
    ]
  }

  const changeHeaderMenuOptions = (state: any) => {
    state.headerMenuOptions = state.menuOptions.filter((x: any) => !x.icon).map(
      (item: { label: string; key: string; icon: any }) => {
        return {
          label: item.label,
          key: item.key,
        }
      }
    )
  }
  const changeIconMenuOptions = (state: any) => {
    state.iconMenuOptions = state.menuOptions.filter((item: any) => !!item.icon).map(
      (item: { label: string; key: string; icon: any, children: any }) => {
        return {
          label: () =>
            h(
              RouterLink,
              {
                to: {
                  path: '/' + item.key,
                }
              },
            ),
          key: item.key,
          icon: item.icon,
          children: [
            {
              label: item.label,
              key: item.key,
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
