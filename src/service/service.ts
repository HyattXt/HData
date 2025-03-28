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

import axios, {AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig} from 'axios'
import { useUserStore } from '@/store/user/user'
import qs from 'qs'
import _ from 'lodash'
import cookies from 'js-cookie'
import router from '@/router'
import utils from '@/utils'
import type {SessionIdRes} from "@/service/modules/login/types";
import {loginSso} from "@/service/modules/login";
import type {UserInfoRes} from "@/service/modules/users/types";
import {getUserInfo} from "@/service/modules/users";
import {useTimezoneStore} from "@/store/timezone/timezone";

const userStore = useUserStore()
const timezoneStore = useTimezoneStore()

/**
 * @description Log and display errors
 * @param {Error} error Error object
 */
const handleError = (res: AxiosResponse<any, any>) => {
  // Print to console
  if (import.meta.env.MODE === 'development') {
    utils.log.capsule('DolphinScheduler', 'UI')
    utils.log.error(res)
  }
  window.$message.error(res.data.msg)
}

const baseRequestConfig: AxiosRequestConfig = {
  baseURL:
    import.meta.env.MODE === 'development'
      ? '/HData/Dev'
      : window.webConfig.VITE_APP_PROD_WEB_URL + '/HData/Dev',
  timeout: 15000,
  headers: {"X-Content-Type-Options" : "nosniff",
            "X-XSS-Protection" : "1",
            "Content-Security-Policy" : "default-src 'self'; script-src 'self'; frame-ancestors 'self'"

  },
  transformRequest: (params) => {
    if (_.isPlainObject(params)) {
      return qs.stringify(params, { arrayFormat: 'repeat' })
    } else {
      return params
    }
  },
  paramsSerializer: (params) => {
    return qs.stringify(params, { arrayFormat: 'repeat' })
  }
}

const service = axios.create(baseRequestConfig)

const err = (err: AxiosError): Promise<AxiosError> => {
  if (err.response?.status === 401) {
    userStore.setSessionId('')
    userStore.setUserInfo({})
    router.push({ path: '/login' })
  }

  return Promise.reject(err)
}

service.interceptors.request.use( async (config: InternalAxiosRequestConfig<any>) => {
  if ((!userStore.getSessionId || userStore.getSessionTimeOut) && !config.url?.includes('login')) {
    if(!userStore.getSessionId) console.log('未访问登录页且未获取到SessionId')
    if(userStore.getSessionTimeOut) console.log('未访问登录页且SessionId过期')
    let uniwater_utoken = getUrlParam("uniwater_utoken") || ""
    if (uniwater_utoken) {
      console.log('获取到token，尝试进行单点登录')
      const loginRes: SessionIdRes = await loginSso({uniwater_utoken: uniwater_utoken})
      await userStore.setSessionId(loginRes.sessionId)
      await userStore.setSessionTime(Date.now())

      const userInfoRes: UserInfoRes = await getUserInfo()
      await userStore.setUserInfo(userInfoRes)

      const timezone = userInfoRes.timeZone ? userInfoRes.timeZone : 'UTC'
      await timezoneStore.setTimezone(timezone)

    }
  }
  config.headers && (config.headers.sessionId = userStore.getSessionId)
  const language = cookies.get('language')
  config.headers = config.headers || {}
  if (language) config.headers.language = language

  return config
}, err)

// The response to intercept
service.interceptors.response.use((res: AxiosResponse) => {
  // No code will be processed
  if (res.data.code === undefined) {
    return res.data
  }

  switch (res.data.code) {
    case 0:
      return res.data.data
    default:
      handleError(res)
      throw new Error()
  }
}, err)

export function getUrlParam(name:String) {
  const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
  let params =
      window.location.search == "" ? window.location.href.substring(window.location.href.indexOf("?") + 1) : window.location.search.substring(1);
  const r = params.match(reg); //匹配目标参数
  if (r != null) return decodeURI(r[2]);
  return null; //返回参数值
}

export { service as axios }
