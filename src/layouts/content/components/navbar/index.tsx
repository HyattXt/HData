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

import { defineComponent, PropType, ref, watch, reactive, onMounted, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import styles from './index.module.scss'
import { NButton, NMenu, NModal, NForm, NFormItem, NInput, NIcon } from 'naive-ui'
import User from '../user'
import { useProjectStore } from "@/store/route/project"
import { useForm } from '@/views/home/use-form'
import { useLogin } from '@/views/home/use-login'
import { useLocalesStore } from '@/store/locales/locales'
import { useThemeStore } from '@/store/theme/theme'
import { useUserStore } from '@/store/user/user'
import { useMessage } from 'naive-ui'
import { InfoCircleOutlined, FormOutlined, CloudOutlined } from '@vicons/antd'
import { Cloud } from '@vicons/fa'
import { useDataList } from '@/layouts/content/use-dataList'
import { sendVerificationCode, registerUser } from '@/service/modules/login'

const Navbar = defineComponent({
  name: 'Navbar',
  props: {
    headerMenuOptions: {
      type: Array as PropType<any>,
      default: []
    },
    localesOptions: {
      type: Array as PropType<any>,
      default: []
    },
    timezoneOptions: {
      type: Array as PropType<any>,
      default: []
    },
    userDropdownOptions: {
      type: Array as PropType<any>,
      default: []
    },
    iconOptions: {
      type: Array as PropType<any>,
      default: []
    },
  },
  setup(props, { emit }) {
    window.$message = useMessage()

    const route = useRoute()
    const router = useRouter()
    const ProjectStore = useProjectStore()

    const { state, t, locale } = useForm()
    const { handleLogin, getCaptchaUrl } = useLogin(state)
    const localesStore = useLocalesStore()
    const themeStore = useThemeStore()
    const userStore = useUserStore()
    const { changeMenuOption, changeHeaderMenuOptions, changeIconMenuOptions, changeUserDropdown } = useDataList()
    
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
      confirmPassword: '',
      captcha: ''
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
      },
      captcha: {
        trigger: ['blur', 'input'],
        validator() {
          if (!registerForm.captcha) {
            return new Error('请输入图形验证码')
          }
          return true
        }
      }
    }
    const countdown = ref(0)
    const isCounting = ref(false)

    const menuKey = ref(route.meta.activeMenu as string)

    const handleMenuClick = (key: string) => {
      // 检查登录状态，未登录且不是访问 home 页面时提示登录
      if (!userStore.isLoggedIn && key !== 'home') {
        window.$message.warning('请先登录后再访问此功能')
        return
      }
      
      if (key == 'projects') {
        router.push({ path: `/projects/${ProjectStore.getCurrentProject}/workflow/relation` })
      } else if (key == 'devops') {
        router.push({ path: `/${key}/${ProjectStore.getCurrentProject}/devops_overview` })
      } else {
        router.push({ path: `/${key}` })
      }
    }

    // 打开登录弹窗
    const openLoginModal = () => {
      getCaptchaUrl()
      loginModalVisible.value = true
    }

    // 关闭登录弹窗
    const closeLoginModal = () => {
      loginModalVisible.value = false
      // 清空登录表单
      state.loginForm.userName = ''
      state.loginForm.userPassword = ''
      state.loginForm.captcha = ''
      // 清空注册表单
      registerForm.phone = ''
      registerForm.code = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''
      registerForm.captcha = ''
      // 重置到登录标签
      activeTab.value = 'login'
      // 重置验证码倒计时
      countdown.value = 0
      isCounting.value = false
    }

    // 切换登录/注册标签
    const switchTab = (tab: string) => {
      activeTab.value = tab
    }

    // 获取验证码
    const getVerificationCode = async () => {
      if (!registerForm.phone) {
        window.$message.warning('请输入手机号')
        return
      }
      if (!/^1[3-9]\d{9}$/.test(registerForm.phone)) {
        window.$message.warning('请输入正确的手机号')
        return
      }
      if (!registerForm.captcha) {
        window.$message.warning('请输入图形验证码')
        return
      }
      
      try {
        // 调用后端发送验证码接口
        const params = {
          phone: registerForm.phone,
          captcha: registerForm.captcha
        }
        await sendVerificationCode(params)
        
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
      } catch (error) {
        // 发送失败，刷新图形验证码
        getCaptchaUrl()
      }
    }

    // 注册
    const handleRegister = async () => {
      try {
        // 调用后端注册接口
        const params = {
          userName: registerForm.phone,
          code: registerForm.code,
          userPassword: registerForm.password,
          repeatPassword: registerForm.confirmPassword,
          email: ''
        }
        await registerUser(params)
        
        window.$message.success('注册成功')
        activeTab.value = 'login'
      } catch (error) {
        window.$message.error('注册失败，请重试')
      }
    }

    watch(
      () => route.path,
      () => {
        menuKey.value = route.meta.activeMenu as string
      }
    )

    // 监听用户信息变化，自动刷新菜单
    watch(
      () => userStore.getUserInfo,
      (newVal, oldVal) => {
        // 当用户信息从空变为有值时（登录成功），重新生成菜单
        changeMenuOption(state)
        changeHeaderMenuOptions(state)
      },
      { immediate: true } // 立即执行一次，确保初始状态正确
    )

    onMounted(() => {
      getCaptchaUrl()
    })

    return {
      handleMenuClick,
      menuKey,
      t,
      handleLogin,
      getCaptchaUrl,
      ...toRefs(state),
      localesStore,
      userStore,
      loginModalVisible,
      activeTab,
      registerForm,
      registerRules,
      countdown,
      isCounting,
      openLoginModal,
      closeLoginModal,
      switchTab,
      getVerificationCode,
      handleRegister,
      InfoCircleOutlined,
      FormOutlined,
      CloudOutlined
    }
  },
  render() {
    return (
      <>
        <div class={styles.container}>
          <div class={styles['logo-container']}>
            <NIcon size={28} color="#165DFF" style={{ marginRight: '10px' }}>
              <Cloud />
            </NIcon>
            <span class={styles['logo-text']}>数据开放服务平台</span>
          </div>
          <div class={styles.nav} >
            <NMenu
              value={this.menuKey}
              mode='horizontal'
              options={this.headerMenuOptions}
              onUpdateValue={this.handleMenuClick}
            />
          </div>

          <div class={styles.settings} >
            {/*             <NMenu
              value={this.menuKey}
              mode='horizontal'
              options={this.iconOptions}
              onUpdateValue={this.handleMenuClick}
              style={"justify-content: flex-end;"}
            /> */}
            {/*<Theme/>*/}
            {/* <Project/> */}
            {!this.userStore.isLoggedIn ? (
              <NButton
                type="primary"
                round
                onClick={() => this.openLoginModal()}
                style={{ backgroundColor: '#165DFF' }}
              >
                登录 / 注册
              </NButton>
            ) : (
              <User userDropdownOptions={this.userDropdownOptions} />
            )}
          </div>
        </div >

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
                onClick={() => this.handleLogin(() => this.closeLoginModal())}
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
                  label="图形验证码"
                  label-style={{ color: 'black' }}
                  path='captcha'
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <NInput
                      type='text'
                      size='large'
                      v-model={[this.registerForm.captcha, 'value']}
                      placeholder="请输入图形验证码"
                      style={{ flex: 1 }}
                    />
                    <img src={'data:image/jpg;base64,' + this.loginForm.captchaUrl} alt="验证码" 
                      style={{ width: '120px', height: '40px', cursor: 'pointer' }} 
                      onClick={this.getCaptchaUrl} />
                  </div>
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
                  !this.registerForm.phone || !this.registerForm.password || !this.registerForm.confirmPassword || !this.registerForm.code || !this.registerForm.captcha
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
      </>
    )
  }
})

export default Navbar
