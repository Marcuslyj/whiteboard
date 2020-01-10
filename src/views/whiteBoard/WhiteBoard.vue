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
    <div class="tool-box-mask" v-if="tbMask" @touchstart="clickTbMask" @mousedown="clickTbMask"></div>
    <!-- 绘制时的工具栏 -->
    <MiniMenu class="mini-menu" :type="miniMenuType" :miniStyle="miniMenuStyle"></MiniMenu>
    </section>
    <div class="tool-wrapper">
      <tool-bar
        ref="tool-bar"
        class="tool"
        @uploadSuccess="uploadSuccess"
        @clearBoard="clearBoard"
        :enable="enable"
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
import { addCover, loadPdf, addCoverImage } from '@common/tool/document'
import bus from '@common/eventBus'
import socketUtil, { getSocket } from '@common/socketUtil'
import {
  socketEvent, api, sComponentId,
} from '@common/common'
import Vue from 'vue'
import { formateUrl, isEmpty } from '@common/utils'
import cManager from '@common/componentManager'
import syncArea from '@common/syncArea'
import ToolBar from '@/components/toolBar/ToolBar'
import MiniMenu from '@/components/miniMenu/MiniMenu'
// import pdfjsLib from 'pdfjsLib'
// import common from '@common/common'

export default {
  components: {
    ToolBar,
    MiniMenu,
  },
  data() {
    return {
      stage: null,
      tbMask: false,
      whiteboards: [],
      enable: false,
      miniMenuType: '',
      miniMenuStyle: {},
    }
  },
  mounted() {
    // 创建stage
    const el = document.querySelector('.board-container-wrapper')
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
      // const params = {
      //   meetingId,
      //   whiteboardId,
      //   documentId,
      // }
      // if (this.$globalConf.isSpeaker) {
      //   this.$globalConf.speakerSize = {
      //     width: el.clientWidth,
      //     height: el.clientHeight,
      //   }
      //   // 通知副屏speakerSize 发生改变
      //   socketUtil.getComponent(params)
      // } else {

      // }
    })
    initTool()
    Vue.eventBus.$on('setTbMask', (visible) => {
      this.tbMask = visible
    })
    Vue.eventBus.$on('setMiniMenu', (params) => {
      const { miniMenuType = '', miniMenuStyle } = params
      this.miniMenuType = miniMenuType
      this.miniMenuStyle = miniMenuStyle
      console.log(this.miniMenuStyle)
    })
    this.fortest()
    this.initConvertCanvas()
  },
  methods: {
    // 更新stage
    updateStageInfo() {
      const wrapper = document.querySelector('.board-container-wrapper')
      if (this.$globalConf.isSpeaker) {
        // 主讲屏
        this.enable = true
        // 先记录
        const lastSpeakerSize = this.$globalConf.speakerSize
        const lastStageXY = this.$globalConf.stageXY
        syncArea.updateSpeakerSize({
          width: wrapper.clientWidth,
          height: wrapper.clientHeight,
        })
        this.stage.size(this.$globalConf.speakerSize)
        this.$globalConf.scale = (this.renderComponent.length === 0) ? 1 : this.$globalConf.speakerSize.width / this.$globalConf.baseWidth
        if (this.renderComponent.length === 0) {
          this.$globalConf.scale = 1
          this.$globalConf.stageXY = {
            x: 0,
            y: 0,
          }
        } else {
          this.$globalConf.scale = this.$globalConf.speakerSize.width / this.$globalConf.baseWidth
          this.$globalConf.stageXY = {
            x: lastStageXY.x * (this.$globalConf.speakerSize.width / lastSpeakerSize.width),
            y: lastStageXY.y * (this.$globalConf.speakerSize.height / lastSpeakerSize.height),
          }
        }
        syncArea.updateStageXY(this.$globalConf.stageXY)
        this.$refs['tool-bar'].active()
      } else {
        // 非主讲屏
        const el = document.querySelector('#board-container')
        if (this.$globalConf.speakerSize.width / this.$globalConf.speakerSize.height > wrapper.clientWidth / wrapper.clientHeight) {
          // 副屏初始化宽高($)，主讲屏等比缩放宽高
          // 被宽度限制
          const scale = this.$globalConf.speakerSize.width / this.$globalConf.speakerSize.height
          el.style.width = `${wrapper.clientWidth}px`
          el.style.height = `${wrapper.clientWidth / scale}px`
          this.stage.size({
            width: wrapper.clientWidth,
            height: wrapper.clientWidth / scale,
          })
        } else {
          // 被高度限制
          const scale = this.$globalConf.speakerSize.width / this.$globalConf.speakerSize.height
          el.style.height = `${wrapper.clientHeight}px`
          el.style.width = `${wrapper.clientHeight * scale}px`
          this.stage.size({
            width: wrapper.clientHeight * scale,
            height: wrapper.clientHeight,
          })
        }
        if (this.renderComponent.length === 0) {
          this.$globalConf.scale = 1
          this.$globalConf.stageXY = {
            x: 0,
            y: 0,
          }
        } else {
          this.$globalConf.scale = this.stage.getAttr('width') / this.$globalConf.baseWidth
          this.$globalConf.stageXY = {
            x: this.$globalConf.stageXY.x * (this.stage.getAttr('width') / this.$globalConf.speakerSize.width),
            y: this.$globalConf.stageXY.y * (this.stage.getAttr('height') / this.$globalConf.speakerSize.height),
          }
        }
      }
      syncArea.setLayerScale()
      syncArea.setStageXY()
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
      this.renderComponent = []
      let shape
      components.map((component) => {
        component = JSON.parse(component)
        // 特殊组件
        if (specialType.includes(component.type)) {
          this.$globalConf[component.type] = component[component.type]
        } else {
          this.renderComponent.push(component)
        }
      })
      this.updateStageInfo()
      this.renderComponent.forEach((component) => {
        if (component.type === 'remark') {
          shape = new Konva[component.className](component.attrs)
          remarkLayer.add(shape)
          shape.cache()
        } else if (component.type === 'text') {
          shape = new Konva[component.className](component.attrs)
          textLayer.add(shape)
          shape.cache()
        } else if (component.type === 'cover') {
          shape = addCoverImage(component.attrs)
        } else {
          shape = new Konva.Image(component.attrs)
          bgLayer.add(shape)
          bgLayer.batchDraw()
        }
      })

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
      this.$globalConf.meetingId = this.$route.params.meetingId || 78
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
      getSocket().on(socketEvent.updateComponent, this.handleUpdateComponent)
      getSocket().on(socketEvent.clearBoard, this.handleClearBoard)
      getSocket().on(socketEvent.addComponent, this.handleAddComponent)
      getSocket().on(socketEvent.updateComponentState, this.handleUpdateComponentState)
    },
    handleGetMeet(res) {
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
            this.$globalConf.documentId = null
            // 记录主讲屏size,特殊组件
            const el = document.querySelector('#board-container')

            syncArea.addSpeakerSize({ width: el.clientWidth, height: el.clientHeight })
            syncArea.addStageXY()
            syncArea.addBaseWidth()

            // 记录打开的画板id，文档id， 副屏打开时可以初始化
            const params = {
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
    // 收到更新信息
    handleUpdateComponent(res) {
      const component = JSON.parse(res.component)
      if (component.type === sComponentId.baseWidth) {
        console.log('update baseWidth')
        this.$globalConf.baseWidth = component[sComponentId.baseWidth]
        this.$globalConf.scale = this.stage.getAttr('width') / component[sComponentId.baseWidth]
        syncArea.setLayerScale()
      } else if (component.type === sComponentId.speakerSize) {

      } else if (component.type === sComponentId.stageXY) {
        this.$globalConf.stageXY = {
          x: this.$globalConf.stageXY.x * (this.stage.getAttr('width') / this.$globalConf.speakerSize.width),
          y: this.$globalConf.stageXY.y * (this.stage.getAttr('height') / this.$globalConf.speakerSize.height),
        }
        syncArea.setStageXY()
      }
    },
    // 接收到新增组件消息
    handleAddComponent(res) {
      let { component } = res
      component = JSON.parse(component)
      let shape
      const bgLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.BG_LAYER]
      const textLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.TEXT_LAYER]
      const remarkLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.REMARK_LAYER]
      if (component.type === 'remark') {
        shape = new Konva[component.className](component.attrs)
        remarkLayer.add(shape)
        remarkLayer.batchDraw()
        shape.cache()
      } else if (component.type === 'text') {
        shape = new Konva[component.className](component.attrs)
        textLayer.add(shape)
        textLayer.batchDraw()
        shape.cache()
      } else {
        shape = new Konva.Image(component.attrs)
        bgLayer.add(shape)
        bgLayer.batchDraw()
      }
    },
    // 收到更新组件状态信息
    handleUpdateComponentState(res) {
      const { componentId, state } = res
      cManager.updateVisible(componentId, state)
    },
    // 接收到清屏命令消息
    handleClearBoard() {
      const layers = [this.$globalConf.layerManager[this.$globalConf.layerIds.TEXT_LAYER], this.$globalConf.layerManager[this.$globalConf.layerIds.REMARK_LAYER]]
      layers.forEach((layer) => {
        layer.destroyChildren()
        layer.batchDraw()
      })
      const bgLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.BG_LAYER]
      if (this.$globalConf.isSpeaker) {
        // 没有文档封面
        if (!bgLayer.findOne('Image')) {
          syncArea.updateBaseWidth('')
        }
      }
    },
    clearBoard(componentType = 0) {
      const { meetingId, whiteboardId, documentId } = this.$globalConf
      const params = {
        meetingId,
        whiteboardId,
        documentId,
        componentType,
      }
      socketUtil.clearBoard(params)
    },
  },
}
</script>
<style lang="scss" src="./WhiteBoard.scss" scoped></style>
