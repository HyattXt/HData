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
import {login, captchaUrl} from '@/service/modules/login'
import { getUserInfo } from '@/service/modules/users'
import { useUserStore } from '@/store/user/user'
import type { Router } from 'vue-router'
import type { SessionIdRes } from '@/service/modules/login/types'
import type { UserInfoRes } from '@/service/modules/users/types'
import { useRouteStore } from '@/store/route/route'
import { useTimezoneStore } from '@/store/timezone/timezone'

export function useLogin(state: any) {
  const router: Router = useRouter()
  const userStore = useUserStore()
  const routeStore = useRouteStore()
  const timezoneStore = useTimezoneStore()

  const handleLogin = () => {
    state.loginFormRef.validate(async (valid: any) => {
      if (!valid) {
        const loginRes: SessionIdRes = await login({ ...state.loginForm })
        await userStore.setSessionId(loginRes.sessionId)
        await userStore.setSessionTime(Date.now())

        const userInfoRes: UserInfoRes = await getUserInfo()
        await userStore.setUserInfo(userInfoRes)

        const timezone = userInfoRes.timeZone ? userInfoRes.timeZone : 'UTC'
        await timezoneStore.setTimezone(timezone)

        const path = routeStore.lastRoute

        router.push({ path: path || 'home' })
      }
    })
  }

/*  const loginNew = async () => {

    let uniwater_utoken = getUrlParam("uniwater_utoken") || ""
    if (uniwater_utoken){
      const loginRes: SessionIdRes = await login1({uniwater_utoken : uniwater_utoken})
      await userStore.setSessionId(loginRes.sessionId)

      const userInfoRes: UserInfoRes = await getUserInfo()
      await userStore.setUserInfo(userInfoRes)

      const timezone = userInfoRes.timeZone ? userInfoRes.timeZone : 'UTC'
      await timezoneStore.setTimezone(timezone)

      const path = routeStore.lastRoute
      //router.push({ path: path || 'home' })
    }

  }*/

  const getCaptchaUrl = async () => {
      state.loginForm.captchaUrl = await captchaUrl()
  }

  return {
    handleLogin,
    getCaptchaUrl
  }
}
