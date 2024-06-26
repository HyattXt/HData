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

interface DefinitionChartData {
  xAxisData: Array<string>
  seriesData: Array<number>
}

interface StateTableData {
  number: number
  state: string
}

interface StateChartData {
  value: number
  name: string
}

interface StateData {
  table?: { title: string; key: string }[]
  processTable?: { number: number; state: string }[]
  chart: Array<StateChartData>
  tableCount?: Record<string, number>[]
}

interface TableDataType {
  正在运行: number[],
  失败: number[],
  暂停: number[],
  成功: number[],
  停止: number[],
  时间: number[]
}

export { DefinitionChartData, StateTableData, StateChartData, StateData,TableDataType }
