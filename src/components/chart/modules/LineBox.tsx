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

import { defineComponent, PropType, ref } from 'vue'
import initChart from '@/components/chart'
import type { Ref } from 'vue'

const props = {
  height: {
    type: [String, Number] as PropType<string | number>,
    default: '100%'
  },
  width: {
    type: [String, Number] as PropType<string | number>,
    default: '100%'
  },
  data: {
    type: Array as PropType<Array<any>>,
    default: []
  },
  title: {},
  label: {
    type: String,
    default: ''
  }
}

const lineChart = defineComponent({
  name: 'lineChart',
  props,
  setup(props) {
    const lineChartRef: Ref<HTMLDivElement | null> = ref(null)
    const option = {
      title: {
        show: false,//false
        text: props.title,//主标题文本
        textStyle: {
          color: '#1F2225',
          fontSize: '16',
          fontFamily: 'sans-serif',
        }
      }
      ,
      tooltip: {              //设置tip提示
        trigger: 'axis',
        backgroundColor: 'rgb(255,255,255)'
      },

      legend: {               //设置区分（哪条线属于什么）
        data: props.data[0].keys,
        icon: 'circle',
        right: 20,
        top: 50,
      },
      color: ['#3bb969', '#0299cb', '#e6824d', '#BB85B3', '#FFB834'],       //设置区分（每条线是什么颜色，和 legend 一一对应）
      xAxis: {                //设置x轴
        type: 'category',
        boundaryGap: false,     //坐标轴两边不留白
        data: props.data[0].time,
        nameTextStyle: {        //坐标轴名称的文字样式
          color: '#333',
          fontSize: 16,
          padding: [0, 0, 0, 20]
        },
        axisLine: {             //坐标轴轴线相关设置。
          lineStyle: {
            color: '#333',
          }
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        name: '',
        minInterval: 1,
        nameTextStyle: {
          color: '#333',
          fontSize: 16,
          padding: [0, 0, 10, 0]
        },
        axisLine: {
          lineStyle: {
            color: '#333',
          }
        },
        type: 'value',
        splitArea: {
          show: false // 确保 splitArea 是显示的
        }
      },
      series: [
        {
          name: props.title,
          showSymbol: true,
          symbolSize: 8, // 标记点大小
          itemStyle: {
            fill: 'none' // 填充颜色，设置为'none'表示空心
          },
          data: props.data[0][props.label],
          type: 'line',               // 类型为折线图
          // smooth: false,
          lineStyle: {                // 线条样式 => 必须使用normal属性
            color: '#3bb969',
          },
        }
      ],
      grid: {
        left: '0%',
        top: '6%',
        right: '4%',
        bottom: '9%',
        containLabel: true,
        backgroundColor: 'rgba(255, 255, 255, 0)', // 设置为透明或其他颜色
        borderColor: 'transparent', // 边框色设置为透明
      },
    };

    initChart(lineChartRef, option)

    return { lineChartRef }
  },
  render() {
    const {  width } = this
    return (
      <div
        ref='lineChartRef'
        style={{
          height: '100%',
          width: typeof width === 'number' ? width + 'px' : width
        }}
      />
    )
  }
})

export default lineChart
