<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2019-12-24 09:34:21
@version 1.0.0
-->
<template>
  <div class="board-page">
    <section class="board-container-wrapper">
    <div id="board-container"
      ref="board-container">
    </div>
    <!-- 用于工具条menu 关闭遮罩 -->
    <div class="tool-box-mask" v-if="tbMask" @click="clickTbMask" :enable="enable"></div>
    </section>
    <div class="tool-wrapper">
      <tool-bar
        ref="tool-bar"
        class="tool"
        @uploadSuccess="uploadSuccess"
      ></tool-bar>
    </div>
    <!-- 用于转换图片 -->
    <div
      ref="convertCanvas"
      class="convertCanvas"
    ></div>
  </div>
</template>

<script>
import { Message } from 'view-design'
import Konva from 'konva'
import { initTool } from '@common/tool'
import { addCover, loadPdf } from '@common/tool/document'
import bus from '@common/eventBus'
import socketUtil, { getSocket } from '@common/socketUtil'
import {
  socketEvent, api, sComponentId,
} from '@common/common'
import Vue from 'vue'
import { formateUrl, isEmpty } from '@common/utils'
import cManager from '@common/componentManager'
import ToolBar from '@/components/toolBar/ToolBar'
// import pdfjsLib from 'pdfjsLib'
// import common from '@common/common'

export default {
  components: {
    ToolBar,
  },
  data() {
    return {
      stage: null,
      tbMask: false,
      whiteboards: [],
      enable: false,
    }
  },
  mounted() {
    // 创建stage
    const el = document.querySelector('#board-container')
    this.$globalConf.board = this.stage = new Konva.Stage({
      container: 'board-container',
      width: el.clientWidth,
      height: el.clientHeight,
    })
    Object.keys(this.$globalConf.layerIds).map((layerId) => {
      const layer = new Konva.Layer({
        id: layerId,
      })
      this.$globalConf.layerManager[layerId] = layer
      this.$globalConf.layerManager.BG_LAYER.listening(false)
      this.stage.add(layer)
    })

    bus.$on('resize', () => {
      const { meetingId, whiteboardId, documentId } = this.$globalConf
      const params = {
        meetingId,
        whiteboardId,
        documentId,
      }
      if (this.$globalConf.isSpeaker) {
        this.$globalConf.speakerSize = {
          width: el.clientWidth,
          height: el.clientHeight,
        }
        // 通知副屏speakerSize 发生改变
        socketUtil.getComponent(params)
      }
    })
    initTool()
    Vue.eventBus.$on('setTbMask', (visible) => {
      this.tbMask = visible
    })
    this.fortest()
    this.initConvertCanvas()
  },
  methods: {
    // 更新stage
    updateStageInfo() {
      if (this.$globalConf.isSpeaker) {
        // 主讲屏
        this.enable = true
        this.stage.size(this.$globalConf.speakerSize)
        this.$globalConf.scale = isEmpty(this.$globalConf.baseWidth) ? 1 : this.$globalConf.speakerSize.width / this.$globalConf.baseWdith
      } else {
        // 非主讲屏
        const wrapper = document.querySelector('.board-container-wrapper')
        const el = document.querySelector('#board-container')

        if (this.$globalConf.speakerSize.width / this.$globalConf.speakerSize.height > wrapper.clientWidth / wrapper.clientHeight) {
          // 副屏初始化宽高($)，主讲屏等比缩放宽高
          // 被宽度限制
          const scale = this.$globalConf.speakerSize.width / this.$globalConf.speakerSize.height
          el.style.width = `${wrapper.clientWidth}px`
          el.style.height = `${wrapper.clientWidth / scale}px`
          console.log(`${el.style.width}`)
          this.stage.size({
            width: wrapper.clientWidth,
            height: wrapper.clientWidth / scale,
          })
        } else {
          // 被高度限制
          const scale = this.$globalConf.speakerSize.width / this.$globalConf.speakerSize.height
          el.style.height = `${wrapper.clientHeight}px`
          el.style.width = `${wrapper.clientHeight * scale}px`
          console.log(`${el.style.width}`)
          this.stage.size({
            width: wrapper.clientHeight * scale,
            height: wrapper.clientHeight,
          })
        }
        this.$globalConf.scale = isEmpty(this.$globalConf.baseWidth) ? 1 : this.stage.getAttr('width') / this.$globalConf.baseWdith
      }
      const textLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.TEXT_LAYER]
      const remarkLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.REMARK_LAYER]

      console.log(`layer 缩放${this.$globalConf.scale}`)
      textLayer.scale({
        x: this.$globalConf.scale,
        y: this.$globalConf.scale,
      })
      remarkLayer.scale({
        x: this.$globalConf.scale,
        y: this.$globalConf.scale,
      })
      this.$refs['tool-bar'].active()
    },
    // 初始化转换画板
    initConvertCanvas() {
      if (this.$globalConf.convertCanvas) {
        return
      }
      this.$globalConf.convertCanvas = new Konva.Stage({
        container: this.$refs.convertCanvas,
      })
      this.$globalConf.convertCanvas.layer = new Konva.Layer()
      this.$globalConf.convertCanvas.add(this.$globalConf.convertCanvas.layer)
    },
    // 文档上传成功
    async uploadSuccess({ data, ret }) {
      if (Number(ret.retCode) === 0) {
        this.Msgloading = this.Msgloading || []
        this.Msgloading.push(Message.loading({
          content: '转换中...',
          duration: 0,
        }))
        // 文档转pdf，获取文档路径和文档id
        let result = await new Promise((resolve, reject) => {
          this.$api.post(
            formateUrl(api.docToPdf, {
              meetingId: this.$globalConf.meetingId,
              whiteboardId: this.$globalConf.whiteboardId,
            }),
            {
              docPath: data.filePath,
            },
            (res) => resolve(res),
            (err) => reject(err),
          )
        })
        if (this.Msgloading.length) this.Msgloading.pop()()
        if (Number(result.ret.retCode) === 0) {
          this.Msgloading.push(Message.loading({
            content: '读取中...',
            duration: 0,
          }))
          const pdf = await loadPdf({ url: result.data.url })
          if (this.Msgloading.length) this.Msgloading.pop()()
          addCover(pdf, { documentPath: result.data.url, documentId: result.data.documentId })
        }
      }
    },
    // 点击画板，弹窗消失
    clickTbMask() {
      this.$refs['tool-bar'].boxName = ''
      this.tbMask = false
    },
    // 开始初始化组件到Canvas 中，有特殊组件和普通组件,对layer 进行缩放
    initComponents(components) {
      const bgLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.BG_LAYER]
      const textLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.TEXT_LAYER]
      const remarkLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.REMARK_LAYER]
      const specialType = ['baseWidth', 'speakerSize', 'stageXY']
      cManager.clearLayer(bgLayer, textLayer, remarkLayer)
      components.map((component) => {
        component = JSON.parse(component)
        // 特殊组件
        if (specialType.includes(component.type)) {
          this.$globalConf[component.type] = component[component.type]
        } else if (component.type === 'remark') {
          remarkLayer.add(new Konva[component.className](component.attrs))
        } else if (component.type === 'text') {
          textLayer.add(new Konva.Text(component.attrs))
        } else {
          bgLayer.add(new Konva.Image(component.attrs))
        }
      })
      this.updateStageInfo()
      // 到时测试这种绘制的渲染效果
      bgLayer.draw()
      textLayer.draw()
      remarkLayer.draw()
    },
    fortest() {
    // 下面只是为了测试,后续需要调整
      console.log(this.$route)
      // 非主讲人
      if (this.$route.params.userId === '0') {
        this.$globalConf.isSpeaker = true
        console.log('主屏')
      } else {
        this.$globalConf.isSpeaker = false
        console.log('副屏')
      }
      this.$globalConf.meetingId = this.$route.params.meetingId || 74
      socketUtil.initSocket()
      this.startListener()
      getSocket().on('connect', () => {
        // console.log(getSocket().connected) // true
        // console.log(`meetingId:${this.$globalConf.meetingId}`)
        // socket 连接,加入会议房间
        const p1 = {
          theme: 'xxx',
          meetingId: this.$globalConf.meetingId,
          nickName: '张三',
          userId: this.$route.params.userId || '2',
        }
        socketUtil.joinMeet(p1)
        // 获取会议
        getSocket().on(socketEvent.joinMeet, () => {
          socketUtil.getMeet({
            meetingId: this.$globalConf.meetingId,
          })
        })
      })
    },
    startListener() {
      getSocket().on(socketEvent.getComponent, ({ components }) => {
        this.initComponents(components)
      })
      getSocket().on(socketEvent.getMeet, this.handleGetMeet)
    },
    handleGetMeet(res) {
      // console.log('getBoard')
      this.whiteboards = res.whiteboards
      if (this.whiteboards) {
        // 取出指定的board(whiteboardId+documentId)
        if (!isEmpty(res.syncAction)) {
          const { whiteboardId, documentId } = JSON.parse(res.syncAction)
          this.$globalConf.whiteboardId = whiteboardId
          this.$globalConf.documentId = documentId
          const params = {
            meetingId: this.$globalConf.meetingId,
            whiteboardId,
            documentId,
          }
          socketUtil.getComponent(params)
        } else {
          // 没有就默认首个板
          const params = {
            meetingId: this.$globalConf.meetingId,
            whiteboardId: this.whiteboards[0].whiteboardId,
            documentId: null,
          }
          this.$globalConf.whiteboardId = this.whiteboards[0].whiteboardId
          this.$globalConf.documentId = null
          socketUtil.getComponent(params)
        }
      } else {
        // 创建一个白板
        // console.log('创建白板')
        const url = formateUrl(api.createBoard, { meetingId: this.$globalConf.meetingId })
        const name = 'board_1'
        this.$api.post(url, { whiteboardName: name }, (ret) => {
          if (ret.ret.retCode === '0') {
            this.$globalConf.whiteboardId = ret.data.whiteboardId
            // 记录主讲屏size,特殊组件
            const el = document.querySelector('#board-container')
            let params = {
              meetingId: this.$globalConf.meetingId,
              whiteboardId: ret.data.whiteboardId,
              documentId: null,
              componentType: 1,
              componentId: sComponentId.speakerSize,
              component: JSON.stringify({
                componentId: sComponentId.speakerSize,
                type: sComponentId.speakerSize,
                speakerSize: { width: el.clientWidth, height: el.clientHeight },
              }),
            }
            socketUtil.addComponent(params)
            params = {
              meetingId: this.$globalConf.meetingId,
              whiteboardId: ret.data.whiteboardId,
              documentId: null,
              componentType: 1,
              componentId: sComponentId.stageXY,
              component: JSON.stringify({
                componentId: sComponentId.stageXY,
                type: sComponentId.stageXY,
                stageXY: { x: 0, y: 0 },
              }),
            }
            socketUtil.addComponent(params)
            params = {
              meetingId: this.$globalConf.meetingId,
              whiteboardId: ret.data.whiteboardId,
              documentId: null,
              componentType: 0,
              componentId: sComponentId.baseWidth,
              component: JSON.stringify({
                componentId: sComponentId.baseWidth,
                baseWidth: '',
                type: sComponentId.baseWdith,
              }),
            }
            socketUtil.addComponent(params)
            // 记录当前画板或文档的属性
            this.$globalConf.speakerSize = {
              width: el.clientWidth,
              height: el.clientHeight,
            }
            this.$globalConf.screenScale = this.$globalConf.stageXY = {
              x: 0,
              y: 0,
            }
            // 记录打开的画板id，文档id， 副屏打开时可以初始化
            params = {
              meetingId: this.$globalConf.meetingId,
              syncAction: JSON.stringify({
                whiteboardId: ret.data.whiteboardId,
                documentId: null,
              }),
            }
            socketUtil.syncAction(params)
            this.updateStageInfo()
          } else {
            this.$error('创建白板失败')
          }
        })
      }
    },
  },
}
</script>
<style lang="scss" src="./WhiteBoard.scss" scoped></style>
