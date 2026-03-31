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

import { defineComponent, onMounted, toRefs, ref, reactive, withKeys } from 'vue'
import styles from './index.module.scss'
import {
  NInput,
  NButton,
  NForm,
  NFormItem,
  NModal,
  NCard,
  NTag,
  NIcon,
  useMessage
} from 'naive-ui'
import { useForm } from './use-form'
import { useTranslate } from './use-translate'
import { useLogin } from './use-login'
import { useLocalesStore } from '@/store/locales/locales'
import { useThemeStore } from '@/store/theme/theme'
import cookies from 'js-cookie'

// 导入Ant Design图标
import { SearchOutlined, AppstoreOutlined, BuildOutlined, EnvironmentOutlined, TeamOutlined, HeartOutlined, CarOutlined, CloudOutlined, ArrowRightOutlined, InfoCircleOutlined, FormOutlined }
  from '@vicons/antd'

const login = defineComponent({
  name: 'login',
  setup() {
    window.$message = useMessage()

    const { state, t, locale } = useForm()
    const { handleChange } = useTranslate(locale)
    const { handleLogin, getCaptchaUrl } = useLogin(state)
    const localesStore = useLocalesStore()
    const themeStore = useThemeStore()
    if (themeStore.getTheme) {
      themeStore.setDarkTheme()
    }

    // 登录/注册弹窗状态
    const loginModalVisible = ref(false)
    const activeTab = ref('login') // 'login' 或 'register'

    // 注册表单状态
    const registerForm = reactive({
      phone: '',
      code: '',
      password: '',
      confirmPassword: ''
    })

    // 注册表单校验规则
    const registerRules = {
      phone: {
        trigger: ['blur', 'input'],
        validator() {
          if (!registerForm.phone) {
            return new Error('请输入手机号')
          }
          if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
            return new Error('请输入正确的手机号格式')
          }
          return true
        }
      },
      password: {
        trigger: ['blur', 'input'],
        validator() {
          if (!registerForm.password) {
            return new Error('请设置密码')
          }
          if (registerForm.password.length < 8) {
            return new Error('密码长度不能少于8位')
          }
          // 密码复杂度校验：必须包含英文和特殊符号
          const hasLetter = /[a-zA-Z]/.test(registerForm.password)
          const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|\\:;"'<>,.?\/]/.test(registerForm.password)
          if (!hasLetter || !hasSpecialChar) {
            return new Error('密码必须包含英文和特殊符号')
          }
          return true
        }
      },
      confirmPassword: {
        trigger: ['blur', 'input'],
        validator() {
          if (!registerForm.confirmPassword) {
            return new Error('请再次输入密码')
          }
          if (registerForm.password !== registerForm.confirmPassword) {
            return new Error('两次输入的密码不一致')
          }
          return true
        }
      },
      code: {
        trigger: ['blur', 'input'],
        validator() {
          if (!registerForm.code) {
            return new Error('请输入验证码')
          }
          return true
        }
      }
    }
    const countdown = ref(0)
    const isCounting = ref(false)

    // 模拟API数据
    const apiResources = ref([
      {
        id: 1,
        name: '城市天气查询',
        status: '开放',
        description: '提供全国城市实时天气数据，包括温度、湿度、风力等信息',
        tags: ['气象环境', '实时数据'],
        provider: '国家气象局',
        updateTime: '2026-03-15'
      },
      {
        id: 2,
        name: '企业工商信息',
        status: '开放',
        description: '提供企业工商注册信息查询，包括企业名称、法定代表人、注册资本等',
        tags: ['企业信息', '工商数据'],
        provider: '国家市场监督管理总局',
        updateTime: '2026-03-10'
      },
      {
        id: 3,
        name: '公共交通实时查询',
        status: '开放',
        description: '提供城市公共交通实时位置和到站时间查询',
        tags: ['交通出行', '实时数据'],
        provider: '交通运输部',
        updateTime: '2026-03-08'
      },
      {
        id: 4,
        name: '身份证信息验证',
        status: '受限',
        description: '提供身份证号码真实性验证服务',
        tags: ['公共服务', '身份验证'],
        provider: '公安部',
        updateTime: '2026-03-05'
      },
      {
        id: 5,
        name: '地理坐标转换',
        status: '开放',
        description: '提供不同坐标系之间的转换服务',
        tags: ['地理信息', '坐标转换'],
        provider: '国家测绘局',
        updateTime: '2026-03-01'
      },
      {
        id: 6,
        name: '社保查询',
        status: '受限',
        description: '提供个人社保缴纳记录查询',
        tags: ['民生服务', '个人查询'],
        provider: '人力资源和社会保障部',
        updateTime: '2026-02-28'
      }
    ])

    // API分类
    const apiCategories = ref([
      { name: '公共服务', icon: BuildOutlined },
      { name: '地理信息', icon: EnvironmentOutlined },
      { name: '企业信息', icon: TeamOutlined },
      { name: '民生服务', icon: HeartOutlined },
      { name: '交通出行', icon: CarOutlined },
      { name: '气象环境', icon: CloudOutlined }
    ])

    // 热门搜索标签
    const hotSearchTags = ref(['天气查询', '企业信息', '交通出行', '地理坐标', '社保查询', '身份验证'])

    // 搜索关键词
    const searchKeyword = ref('')

    // 打开登录弹窗
    const openLoginModal = () => {
      loginModalVisible.value = true
    }

    // 关闭登录弹窗
    const closeLoginModal = () => {
      loginModalVisible.value = false
    }

    // 切换登录/注册标签
    const switchTab = (tab: string) => {
      activeTab.value = tab
    }

    // 获取验证码
    const getVerificationCode = () => {
      if (!registerForm.phone) {
        window.$message.warning('请输入手机号')
        return
      }
      if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
        window.$message.warning('请输入正确的手机号')
        return
      }
      // 模拟发送验证码
      window.$message.success('验证码已发送')
      // 开始倒计时
      countdown.value = 60
      isCounting.value = true
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
          isCounting.value = false
        }
      }, 1000)
    }

    // 注册
    const handleRegister = () => {
      // 表单校验由NForm的rules自动处理
      // 这里直接执行注册逻辑
      // 模拟注册
      window.$message.success('注册成功')
      activeTab.value = 'login'
    }

    // 申请API
    const applyApi = (apiId: number) => {
      // 检查是否登录
      // 这里可以通过userStore检查登录状态
      // 暂时直接打开登录弹窗
      openLoginModal()
    }

    // 查看API详情
    const viewApiDetail = (apiId: number) => {
      // 模拟查看详情
      window.$message.info('查看API详情')
    }

    onMounted(() => {
      getCaptchaUrl()
    })

    return {
      t,
      handleChange,
      handleLogin,
      getCaptchaUrl,
      ...toRefs(state),
      localesStore,
      loginModalVisible,
      activeTab,
      registerForm,
      registerRules,
      countdown,
      isCounting,
      apiResources,
      apiCategories,
      hotSearchTags,
      searchKeyword,
      openLoginModal,
      closeLoginModal,
      switchTab,
      getVerificationCode,
      handleRegister,
      applyApi,
      viewApiDetail,
      SearchOutlined,
      AppstoreOutlined,
      BuildOutlined,
      EnvironmentOutlined,
      TeamOutlined,
      HeartOutlined,
      CarOutlined,
      CloudOutlined,
      ArrowRightOutlined,
      InfoCircleOutlined,
      FormOutlined
    }
  },
  render() {
    return (
      <>
        <div class={styles.container}>
          {/* 顶部导航栏 */}
          <div class={styles.header}>
            <div class={styles['header-content']}>
              <div class={styles.logo}>
                <div class={styles['logo-img']} />
                <span class={styles['logo-text']}>数据开放服务平台</span>
              </div>
              <div class={styles['header-right']}>
                <NButton
                  type="primary"
                  round
                  onClick={() => this.openLoginModal()}
                  style={{ backgroundColor: '#165DFF' }}
                >
                  登录 / 注册
                </NButton>
              </div>
            </div>
          </div>

          {/* Banner标题区 */}
          <div class={styles.banner}>
            <div class={styles['banner-content']}>
              <h1 class={styles['banner-title']}>API数据资源目录</h1>
              <p class={styles['banner-description']}>一站式发现、申请、调用开放API服务，安全高效对接数据资源</p>
              <NButton
                type="default"
                round
                size="large"
                style={{
                  backgroundColor: '#1677FF',
                  color: 'white',
                  border: '1px solid white',
                  marginTop: '10px',
                  marginBottom: '10px',
                  padding: '8px 20px',
                  fontWeight: 500
                }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                浏览全部API资源
              </NButton>

              {/* 搜索区域 - 集成到Banner内部 */}
              <div class={styles['banner-search']}>
                <div class={styles['search-content']}>
                  <div class={styles['search-container']}>
                    <input
                      type="text"
                      placeholder="搜索API名称、场景、类型"
                      class={styles['search-input']}
                      v-model={this.searchKeyword}
                    />
                    <button class={styles['search-button']}>
                      <NIcon><SearchOutlined /></NIcon>
                      搜索
                    </button>
                  </div>
                  <div class={styles['hot-tags']}>
                    <span class={styles['hot-tags-label']}>热门：</span>
                    <a href="#" class={styles['hot-tag']}>用户信息</a>
                    <a href="#" class={styles['hot-tag']}>地理信息</a>
                    <a href="#" class={styles['hot-tag']}>气象数据</a>
                    <a href="#" class={styles['hot-tag']}>交通出行</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* API分类导航 */}
          <div class={styles.categories}>
            <h2 class={styles['section-title']}>API分类</h2>
            <div class={styles['categories-content']}>
              {this.apiCategories.map((category, index) => {
                const IconComponent = category.icon;
                return (
                  <div key={index} class={styles['category-item']}>
                    <NIcon size={30} style={{ marginBottom: '10px' }}>
                      <IconComponent />
                    </NIcon>
                    <span class={styles['category-name']}>{category.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* API资源列表 */}
          <div class={styles['api-list']}>
            <div class={styles['api-list-header']}>
              <h2 class={styles['section-title']}>API资源列表</h2>
              <span class={styles['api-count']}>共 {this.apiResources.length} 个API</span>
            </div>
            <div class={styles['api-list-content']}>
              {this.apiResources.slice(0, 6).map((api) => (
                <NCard
                  key={api.id}
                  class={styles['api-card']}
                  size="small"
                  hoverable
                >
                  <div class={styles['api-card-header']}>
                    <h3 class={styles['api-name']}>{api.name}</h3>
                    <NTag
                      type={api.status === '开放' ? 'success' : 'warning'}
                      size="small"
                    >
                      {api.status}
                    </NTag>
                  </div>
                  <p class={styles['api-description']}>{api.description}</p>
                  <div class={styles['api-tags']}>
                    {api.tags.map((tag, index) => (
                      <NTag key={index} size="small" style={{ marginRight: '8px' }}>
                        {tag}
                      </NTag>
                    ))}
                  </div>
                  <div class={styles['api-meta']}>
                    <span class={styles['api-provider']}>提供方：{api.provider}</span>
                    <span class={styles['api-update']}>更新时间：{api.updateTime}</span>
                  </div>
                  <div class={styles['api-actions']}>
                    <NButton
                      type="default"
                      size="medium"
                      onClick={() => this.viewApiDetail(api.id)}
                    >
                      <NIcon><InfoCircleOutlined /></NIcon>
                      查看详情
                    </NButton>
                    <NButton
                      type="primary"
                      size="medium"
                      style={{ backgroundColor: '#165DFF' }}
                      onClick={() => this.applyApi(api.id)}
                    >
                      <NIcon><FormOutlined /></NIcon>
                      立即申请
                    </NButton>
                  </div>
                </NCard>
              ))}
            </div>
            <div class={styles['load-more']}>
              <button class={styles['load-more-btn']}>加载更多API</button>
            </div>
          </div>

          {/* 底部版权信息 */}
          <div class={styles.footer}>
            <div class={styles['footer-content']}>
              <p>© 2026 数据开放服务平台 - API数据资源目录</p>
              <p>版权所有 | 保留所有权利</p>
            </div>
          </div>

          {/* 登录/注册弹窗 */}
          <NModal
            v-model={[this.loginModalVisible, 'show']}
            title={this.activeTab === 'login' ? '登录' : '注册'}
            preset="card"
            style={{ width: '400px' }}
            onClose={this.closeLoginModal}
          >
            {/* 登录表单 */}
            {this.activeTab === 'login' && (
              <div>
                <NForm rules={this.rules} ref='loginFormRef'>
                  <NFormItem
                    label={this.t('login.userName')}
                    label-style={{ color: 'black' }}
                    path='userName'
                  >
                    <NInput
                      class='input-user-name'
                      type='text'
                      size='large'
                      v-model={[this.loginForm.userName, 'value']}
                      placeholder={this.t('login.userName_tips')}
                      autofocus
                      onKeydown={withKeys(this.handleLogin, ['enter'])}
                    />
                  </NFormItem>
                  <NFormItem
                    label={this.t('login.userPassword')}
                    label-style={{ color: 'black' }}
                    path='userPassword'
                  >
                    <NInput
                      class='input-password'
                      type='password'
                      size='large'
                      v-model={[this.loginForm.userPassword, 'value']}
                      placeholder={this.t('login.userPassword_tips')}
                      onKeydown={withKeys(this.handleLogin, ['enter'])}
                    />
                  </NFormItem>
                  <NFormItem
                    label={this.t('login.captcha')}
                    label-style={{ color: 'black' }}
                    path='captcha'
                  >
                    <NInput
                      class='input-captcha'
                      size='large'
                      v-model={[this.loginForm.captcha, 'value']}
                      placeholder={this.t('login.captcha_tips')}
                    />
                    <img src={'data:image/jpg;base64,' + this.loginForm.captchaUrl} alt="验证码" class='btn-captcha'
                      style={{ width: '64%', height: '83%' }} onClick={this.getCaptchaUrl} />
                  </NFormItem>
                </NForm>
                <NButton
                  class='btn-login'
                  round
                  type='info'
                  disabled={
                    !this.loginForm.userName || !this.loginForm.userPassword || !this.loginForm.captcha
                  }
                  style={{ width: '100%' }}
                  onClick={this.handleLogin}
                >
                  {this.t('login.login')}
                </NButton>
                <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '14px' }}>
                  <span style={{ color: '#666' }}>
                    没有账号？
                    <span
                      style={{ color: '#165DFF', cursor: 'pointer', marginLeft: '4px' }}
                      onClick={() => this.switchTab('register')}
                    >
                      注册
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* 注册表单 */}
            {this.activeTab === 'register' && (
              <div>
                <NForm rules={this.registerRules}>
                  <NFormItem
                    label="手机号"
                    label-style={{ color: 'black' }}
                    path='phone'
                  >
                    <NInput
                      type='text'
                      size='large'
                      v-model={[this.registerForm.phone, 'value']}
                      placeholder="请输入手机号"
                    />
                  </NFormItem>
                  <NFormItem
                    label="密码"
                    label-style={{ color: 'black' }}
                    path='password'
                  >
                    <NInput
                      type='password'
                      size='large'
                      v-model={[this.registerForm.password, 'value']}
                      placeholder="请设置密码"
                    />
                  </NFormItem>
                  <NFormItem
                    label="确认密码"
                    label-style={{ color: 'black' }}
                    path='confirmPassword'
                  >
                    <NInput
                      type='password'
                      size='large'
                      v-model={[this.registerForm.confirmPassword, 'value']}
                      placeholder="请再次输入密码"
                    />
                  </NFormItem>
                  <NFormItem
                    label="短信验证码"
                    label-style={{ color: 'black' }}
                    path='code'
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <NInput
                        type='text'
                        size='large'
                        v-model={[this.registerForm.code, 'value']}
                        placeholder="请输入验证码"
                        style={{ flex: 1 }}
                      />
                      <NButton
                        type='default'
                        size='large'
                        disabled={this.isCounting}
                        style={{ minWidth: '120px' }}
                        onClick={this.getVerificationCode}
                      >
                        {this.isCounting ? `${this.countdown}s` : '获取验证码'}
                      </NButton>
                    </div>
                  </NFormItem>
                </NForm>
                <NButton
                  class='btn-login'
                  round
                  type='info'
                  disabled={
                    !this.registerForm.phone || !this.registerForm.password || !this.registerForm.confirmPassword || !this.registerForm.code
                  }
                  style={{ width: '100%' }}
                  onClick={this.handleRegister}
                >
                  注册
                </NButton>
                <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '14px' }}>
                  <span style={{ color: '#666' }}>
                    已有账号？
                    <span
                      style={{ color: '#165DFF', cursor: 'pointer', marginLeft: '4px' }}
                      onClick={() => this.switchTab('login')}
                    >
                      登录
                    </span>
                  </span>
                </div>
              </div>
            )}
          </NModal>
        </div>
      </>
    )
  }
})

export default login
