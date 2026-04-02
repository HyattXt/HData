import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import styles from './index.module.scss'
import {
  NButton,
  NCard,
  NTag,
  NIcon,
  useMessage
} from 'naive-ui'
import { useThemeStore } from '@/store/theme/theme'
import { useUserStore } from '@/store/user/user'
// 导入 Ant Design 图标
import { 
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
  FormOutlined,
  FileTextOutlined,
  DashboardOutlined,
  SyncOutlined,
  ProjectOutlined,
  ToolOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
  PhoneOutlined,
  FolderOutlined
} from '@vicons/antd'
import utils from "@/utils";
import apiAxios from "@/utils/api-axios";
import moment from "moment";

const login = defineComponent({
  name: 'login',
  setup() {
    window.$message = useMessage()

    const themeStore = useThemeStore()
    const userStore = useUserStore()
    const router = useRouter()
    const getApiFolderUrl = utils.getUrl('interface/getApiTreeFloder')
    if (themeStore.getTheme) {
      themeStore.setDarkTheme()
    }

    // API 分类 - 修改为 7 个分类
    const apiCategories = ref<any[]>([])
    
    // API 资源列表
    interface ApiItem {
      apiId: string
      apiMethod: string // 如 "GET", "POST" 等
      apiPath: string
      apiStatus: string // 如 "1"
      apiComment: string | null
      apiType: string | null
      apiCreateTime: string // "2025-11-04 15:47:04"
      apiGmtTime: string // 注意：你返回的是字符串数字如 "1762242424506"
      apiName: string
      apiFlag: number
      apiCreator: string
      apiAuthorizer: string
      apiFrequency: number
      apiScript: string
      apiSchema: string | null
      apiSample: string // JSON 字符串
      apiOption: string | null
      apiIpaddr: string | null
      apiDatasourceId: string | null
      apiDatasourceTable: string | null
      apiDatasourceType: string | null
      apiTreeId: string | null
      fieldsInfo: string | null
      headersArray: Array<{
        paramTitle: string
        paramNotes: string
        paramType: string
        paramIsNull: string
        demoValue: string
      }>
      bodyArray: Array<{
        paramTitle: string
        paramNotes: string
        paramType: string
        paramIsNull: string
        demoValue: string
      }>
      queryArray: Array<{
        paramTitle: string
        paramNotes: string
        paramType: string
        paramIsNull: string
        demoValue: string
      }>
      responseStatusArray: unknown | null
      requestDemo: string | null
      responseDemo: string | null
      addFlag: number
      bodyArrayNew: string // JSON 字符串
      apiTimeConsuming: string | null
      dataBaseLabelClassTypeNum: string | null
      dataBaseLabelId: string | null
      dataBaseLabelType: string | null
      dynamicTokenKey: string
      dynamicTokenBodyParam: string
      dynamicTokenHeaderParam: string
      dynamicTokenUrl: string
      dynamicTokenPosition: number | null
      dynamicTokenState: number
      dynamicTokenHttpType: string | null
      dynamicTokenHttpTokenKey: string
      apiBodyType: string | null
      apiDataSource: string
      userNames: string // 如 "admin,1088,test2"
      apiStatusText: string // 如 "已发布"
      apiFlagText: string // 如 "注册 API"
      treeName: string // 如 "接口分类1"
    }

// 定义分页响应结构（根据你实际使用情况）
    interface ApiResourcesResponse {
      list: ApiItem[]
      total: number
      pageCount: number
    }

// 创建 ref（带初始值 + 类型）
    const apiResources = ref<ApiResourcesResponse>({
      list: [],
      total: 0,
      pageCount: 0
    })

    // 搜索关键词
    const searchKeyword = ref('')
    
    // 当前页码
    const currentPage = ref(1)
    
    // 当前每页数量
    const currentPageSize = ref(6)
    
    // 当前选中的分类 ID
    const selectedApiTreeId = ref(1)

    // 获取 API 列表
    const fetchApiList = async (
      page: number = 1,
      pageSize: number = 6,
      apiName: string = '',
      apiTreeId: number = 1
    ) => {
      try {
        const url = utils.getUrl('interface/getList')
        const params = {
          pageNum: page,
          pageSize: pageSize,
          apiName: apiName,
          apiStatus: '1',
          apiTreeId: apiTreeId,
          order: 'api_create_time',
          sort: 'desc'
        }

        const response = await apiAxios.post(url, params)
        
        if (response.data && response.data.data) {
          const apiList = response.data.data
          const totalNum = response.data.totalNum
          
          // 处理时间格式
          apiList.forEach((item: any) => {
            if (item.apiGmtTime) {
              const date = new Date(parseInt(item.apiGmtTime))
              item.apiGmtTime = moment(date).format('YYYY-MM-DD HH:mm:ss')
            }
            
            // 转换状态文本
            const statusMap: { [key: string]: string } = {
              '-1': '删除',
              '0': '待发布',
              '1': '已发布',
              '2': '审核中',
              '3': '禁用'
            }
            if (item.apiStatus !== undefined) {
              item.apiStatusText = statusMap[item.apiStatus] || item.apiStatus
            }
            
            // 转换 API 类型文本
            const typeMap: { [key: string]: string } = {
              '1': '自定义 SQL',
              '2': '注册 API',
              '3': '标签 API'
            }
            if (item.apiFlag !== undefined) {
              item.apiFlagText = typeMap[item.apiFlag] || item.apiFlag
            }
          })
          
          return {
            list: apiList,
            total: totalNum,
            pageCount: Math.ceil(totalNum / pageSize)
          }
        }
        
        return { list: [], total: 0, pageCount: 0 }
      } catch (error) {
        console.error('获取 API 列表失败:', error)
        window.$message.error('获取 API 列表失败')
        return { list: [], total: 0, pageCount: 0 }
      }
    }

    // 获取 API 分类树
    const fetchApiCategories = async () => {
      try {
        const response = await apiAxios.get(getApiFolderUrl)
        if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          // 获取第一个根节点的 children
          const rootChildren = response.data.data[0].children
          if (rootChildren && Array.isArray(rootChildren)) {
            // 映射 children 数据到分类格式
            apiCategories.value = rootChildren.map((item: any) => ({
              name: item.titleName,
              id: item.id,
              parentId: item.parentId,
              createUser: item.createUser,
              type: item.type
            }))
          }
        }
      } catch (error) {
        console.error('获取 API 分类失败:', error)
        window.$message.error('获取 API 分类失败')
      }
    }
    
    // 搜索功能
    const handleSearch = async () => {
      currentPage.value = 1
      currentPageSize.value = 6
      selectedApiTreeId.value = 1 // 搜索时重置分类 ID 为 1
      apiResources.value = await fetchApiList(
        currentPage.value,
        currentPageSize.value,
        searchKeyword.value,
        selectedApiTreeId.value
      )
    }
    
    // 加载更多功能
    const handleLoadMore = async () => {
      currentPageSize.value += 3
      apiResources.value = await fetchApiList(
        currentPage.value,
        currentPageSize.value,
        searchKeyword.value,
        selectedApiTreeId.value
      )
    }
    
    // 切换 API 分类
    const handleCategoryChange = async (categoryId: number) => {
      selectedApiTreeId.value = categoryId
      currentPage.value = 1
      currentPageSize.value = 6
      searchKeyword.value = '' // 清空搜索关键词
      apiResources.value = await fetchApiList(
        currentPage.value,
        currentPageSize.value,
        searchKeyword.value,
        selectedApiTreeId.value
      )
    }

    // 申请 API
    const applyApi = (api: any) => {
      // 检查是否登录
      if (userStore.isLoggedIn) {
        // 已登录，执行申请逻辑，跳转到API目录并传递api信息
        router.push({
          path: '/service/api-dev',
          state: { apiId: api.apiId, action: 'apply' }
        })
      } else {
        // 未登录，提示用户登录
        window.$message.warning('请先登录后再访问此功能')
      }
    }

    // 查看 API 详情
    const viewApiDetail = (api: any) => {
      // 检查是否登录
      if (userStore.isLoggedIn) {
        // 已登录，执行查看详情逻辑
        router.push({ name: 'api-detail', state: { apiId: api.apiId }, query: { back: true } })
      } else {
        // 未登录，提示用户登录
        window.$message.warning('请先登录后再访问此功能')
      }
    }

    // 浏览全部 API 资源
    const browseAllApi = () => {
      // 检查是否登录
      if (userStore.isLoggedIn) {
        // 已登录，跳转到 API 目录
        router.push('/service/api-dev')
      } else {
        // 未登录，提示用户登录
        window.$message.warning('请先登录后再访问此功能')
      }
    }

    onMounted(async () => {
      // 组件挂载时获取 API 分类
      fetchApiCategories()
      apiResources.value = await fetchApiList()
    })

    return {
      userStore,
      apiResources,
      apiCategories,
      searchKeyword,
      currentPage,
      currentPageSize,
      selectedApiTreeId,
      handleSearch,
      handleLoadMore,
      handleCategoryChange,
      applyApi,
      viewApiDetail,
      browseAllApi,
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
      FormOutlined,
      FileTextOutlined,
      DashboardOutlined,
      SyncOutlined,
      ProjectOutlined,
      ToolOutlined,
      DollarOutlined,
      CustomerServiceOutlined,
      PhoneOutlined
    }
  },
  render: function() {
    // 图标映射表 - 移到 render 外部或组件外部更好
    const iconMap: { [key: string]: any } = {
      集抄: FileTextOutlined,
      计量云平台: CloudOutlined,
      二供: SyncOutlined,
      统一平台: AppstoreOutlined,
      管网运维: ToolOutlined,
      营收: DollarOutlined,
      公共服务: CustomerServiceOutlined,
      热线: PhoneOutlined
    }

    return (
      <>
        <div class={styles.container}>
          {/* Banner 标题区 */}
          <div class={styles.banner}>
            <div class={styles['banner-content']}>
              <h1 class={styles['banner-title']}>API 数据资源目录</h1>
              <p class={styles['banner-description']}>一站式发现、申请、调用开放 API 服务，安全高效对接数据资源</p>
              <NButton
                type='default'
                round
                size='large'
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
                onClick={() => this.browseAllApi()}
              >
                浏览全部 API 资源
              </NButton>

              {/* 搜索区域 - 集成到 Banner 内部 */}
              <div class={styles['banner-search']}>
                <div class={styles['search-content']}>
                  <div class={styles['search-container']}>
                    <input
                      type='text'
                      placeholder='搜索 API 名称、场景、类型'
                      class={styles['search-input']}
                      v-model={this.searchKeyword}
                      onKeyup={(e: KeyboardEvent) => {
                        if (e.key === 'Enter') {
                          this.handleSearch()
                        }
                      }}
                    />
                    <button class={styles['search-button']} onClick={() => this.handleSearch()}>
                      <NIcon>
                        <SearchOutlined />
                      </NIcon>
                      搜索
                    </button>
                  </div>
                  <div class={styles['hot-tags']}>
                    <span class={styles['hot-tags-label']}>热门：</span>
                    <a
                      href='#'
                      class={styles['hot-tag']}
                      onClick={(e) => {
                        e.preventDefault()
                        this.searchKeyword = '用户信息'
                        this.handleSearch()
                      }}
                    >
                      用户信息
                    </a>
                    <a
                      href='#'
                      class={styles['hot-tag']}
                      onClick={(e) => {
                        e.preventDefault()
                        this.searchKeyword = '抄表信息'
                        this.handleSearch()
                      }}
                    >
                      抄表信息
                    </a>
                    <a
                      href='#'
                      class={styles['hot-tag']}
                      onClick={(e) => {
                        e.preventDefault()
                        this.searchKeyword = '管线信息'
                        this.handleSearch()
                      }}
                    >
                      管线信息
                    </a>
                    <a
                      href='#'
                      class={styles['hot-tag']}
                      onClick={(e) => {
                        e.preventDefault()
                        this.searchKeyword = '水表信息'
                        this.handleSearch()
                      }}
                    >
                      水表信息
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* API 分类导航 */}
          <div class={styles.categories}>
            <h2 class={styles['section-title']}>API 分类</h2>
            <div class={styles['categories-content']}>
              {this.apiCategories.map((category, index) => {
                // 根据分类名称匹配图标，未匹配的显示通用图标
                const IconComponent = iconMap[category.name] || FolderOutlined
                const hasCustomIcon = !!iconMap[category.name]

                return (
                  <div
                    key={category.id || index}
                    class={styles['category-item']}
                    title={!hasCustomIcon ? '暂无自定义图标' : ''}
                    onClick={() => this.handleCategoryChange(category.id)}
                  >
                    <NIcon size={30} color={'#165DFF'} style={{ marginBottom: '10px' }}>
                      <IconComponent />
                    </NIcon>
                    <span class={styles['category-name']}>{category.name}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* API 资源列表 */}
          <div class={styles['api-list']}>
            <div class={styles['api-list-header']}>
              <h2 class={styles['section-title']}>API 资源列表</h2>
              <span class={styles['api-count']}>共 {this.apiResources.total} 个 API</span>
            </div>
            <div class={styles['api-list-content']}>
              {this.apiResources.list.slice(0, 6).map((api) => (
                <NCard key={api.apiId} class={styles['api-card']} size='small' hoverable>
                  <div class={styles['api-card-header']}>
                    <h3 class={styles['api-name']}>{api.apiName}</h3>
                    <NTag type={api.apiStatus === '1' ? 'success' : 'warning'} size='small'>
                      开放
                    </NTag>
                  </div>
                  <p class={styles['api-description']}>{api.apiComment}</p>
                  <div class={styles['api-tags']}>
                    <NTag size='small' type={'info'} style={{ marginRight: '8px' }}>
                      {api.treeName || '无分类'}
                    </NTag>
                    <NTag size='small' style={{ marginRight: '8px' }}>
                      {api.apiMethod}
                    </NTag>
                  </div>
                  <div class={styles['api-meta']}>
                    <span class={styles['api-provider']}>提供方：{api.apiDataSource}</span>
                    <span class={styles['api-update']}>更新时间：{api.apiGmtTime}</span>
                  </div>
                  <div class={styles['api-actions']}>
                    <NButton type='default' size='medium' onClick={() => this.viewApiDetail(api)}>
                      <NIcon>
                        <InfoCircleOutlined />
                      </NIcon>
                      查看详情
                    </NButton>
                    <NButton
                      type='primary'
                      size='medium'
                      style={{ backgroundColor: '#165DFF' }}
                      onClick={() => this.applyApi(api)}
                    >
                      <NIcon>
                        <FormOutlined />
                      </NIcon>
                      立即申请
                    </NButton>
                  </div>
                </NCard>
              ))}
            </div>
            <div class={styles['load-more']}>
              {this.apiResources.list.length < this.apiResources.total && (
                <button class={styles['load-more-btn']} onClick={() => this.handleLoadMore()}>
                  加载更多API
                </button>
              )}
            </div>
          </div>

          {/* 底部版权信息 */}
          <div class={styles.footer}>
            <div class={styles['footer-content']}>
              <p>© 2026 数据开放服务平台 - API 数据资源目录</p>
              <p>版权所有 | 保留所有权利</p>
            </div>
          </div>
        </div>
      </>
    )
  }
})

export default login
