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

import {defineComponent} from 'vue'
import {
  NResult
} from 'naive-ui'


const visitor = defineComponent({
  name: 'visitor',
  setup() {
  },
  render() {
    return (
        <div style={{display: 'flex', 'justify-content': 'center', 'align-items': 'center', height: '100%' }}>
            <NResult
                status="403"
                title="403 禁止访问"
                description="游客模式下禁止访问开发者工具"
            >
            </NResult>
        </div>
    )
  }
})

export default visitor
