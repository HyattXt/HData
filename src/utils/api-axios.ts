import axios, { AxiosRequestConfig } from 'axios'

const apiAxios = {
  request: async (config: AxiosRequestConfig) =>  {
    try {
      const res = await axios(config)
      if(res.data.status === 1) {
        throw new Error(res.data.info)
      }
      return res
    } catch (error) {
      window.$message.error((error as Error).message)
      throw error
    }
  },

  get: (url: string, params?: object, config?: AxiosRequestConfig) =>
    apiAxios.request({ method: 'get', url, params, ...config }),

  post: (url: string, data?: object, config?: AxiosRequestConfig) =>
    apiAxios.request({ method: 'post', url, data, ...config })
}

export default apiAxios