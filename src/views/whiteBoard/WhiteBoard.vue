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
    <MiniMenu class="mini-menu" :type="miniMenuType" :miniStyle="miniMenuStyle" :textColor="textColor"></MiniMenu>
    </section>
    <div class="tool-wrapper">
      <tool-bar
        ref="tool-bar"
        class="tool"
        @uploadSuccess="uploadSuccess"
        @clearBoard="clearBoard"
        @gotoBoard="gotoBoard"
      ></tool-bar>
    </div>
    <!-- 用于转换图片,创建多个转换板，防止同时操作一个 -->
    <!-- <div
      ref="convertCanvas"
      class="convertCanvas"
    ></div> -->
    <div class="convertCanvas-wrapper">
      <div v-for="item in convertCanvas" :key="item.id" ref="convertCanvas" class="convertCanvas"></div>
    </div>
  </div>
</template>

<script>
import { Message } from 'view-design'
import Konva from 'konva'
import { initTool, destroyTool } from '@common/tool'
import {
  addCover, loadPdf, addCoverImage, init as initDocument, renderPages,
} from '@common/tool/document'
import socketUtil, { getSocket, destroySocket } from '@common/socketUtil'
import {
  socketEvent, api, sComponentId,
} from '@common/common'
import Vue from 'vue'
import {
  formateUrl, isEmpty, formateComponent, cache, generateUID,
} from '@common/utils'
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
      textColor: null,
      renderComponent: [],
      convertCanvas: [],
    }
  },
  created() {
    // 缓存whiteboard实例
    this.$globalConf.whiteboard = this
  },
  mounted() {
    console.log('mounted')
    this.$globalConf.mode = 'board'
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
    initTool()
    Vue.eventBus.$on('setTbMask', (visible) => {
      this.tbMask = visible
    })
    Vue.eventBus.$on('setMiniMenu', (params) => {
      const { miniMenuType = '', miniMenuStyle, textColor } = params
      this.miniMenuType = miniMenuType
      this.miniMenuStyle = miniMenuStyle
      this.textColor = textColor
    })
    this.initConvertCanvas()
    this.startMeeting()
  },
  methods: {
    // 接受刷新广播
    onRefresh() {
      clearTimeout(this.timerRefresh)
      this.timerRefresh = setTimeout(() => {
        this.$globalConf.toggleRouter = !this.$globalConf.toggleRouter
      }, 600)
    },
    // 更新stage
    updateStageInfo() {
      const wrapper = document.querySelector('.board-container-wrapper')
      if (this.$globalConf.isSpeaker) {
        // 主讲屏
        // 先记录
        const baseStageXY = this.$globalConf.stageXY
        this.$globalConf.speakerSize = {
          width: wrapper.clientWidth,
          height: wrapper.clientHeight,
        }
        syncArea.updateSpeakerSize(this.$globalConf.speakerSize)
        this.stage.size(this.$globalConf.speakerSize)
        console.log(`需要渲染的画板组件数量：${this.renderComponent.length}`)
        if (this.renderComponent.length === 0) {
          this.$globalConf.scale = 1
          this.$globalConf.stageXY = {
            x: 0,
            y: 0,
          }
          // 更新基准宽度和基准stage xy
          syncArea.updateBaseWidth(this.stage.getAttr('width'))
          syncArea.updateStageXY(this.$globalConf.stageXY)
        } else {
          this.$globalConf.scale = this.$globalConf.speakerSize.width / this.$globalConf.baseWidth
          this.$globalConf.stageXY = {
            x: baseStageXY.x * this.$globalConf.scale,
            y: baseStageXY.y * this.$globalConf.scale,
          }
        }

        this.$nextTick(() => {
          this.$refs['tool-bar'].active()
          // this.$parent.$children[0].$refs['tool-bar'].active()
        })
      } else {
        // 非主讲屏
        const el = document.querySelector('#board-container')
        let width
        let height
        if (this.$globalConf.speakerSize.width / this.$globalConf.speakerSize.height > wrapper.clientWidth / wrapper.clientHeight) {
          // 副屏初始化宽高($)，主讲屏等比缩放宽高
          // 被宽度限制
          const scale = this.$globalConf.speakerSize.width / this.$globalConf.speakerSize.height
          width = wrapper.clientWidth
          height = wrapper.clientWidth / scale
        } else {
          // 被高度限制
          const scale = this.$globalConf.speakerSize.width / this.$globalConf.speakerSize.height
          width = wrapper.clientHeight * scale
          height = wrapper.clientHeight
        }
        // 更新画布尺寸
        el.style.height = `${height}px`
        el.style.width = `${width}px`
        this.stage.size({
          width,
          height,
        })
        Object.keys(this.$globalConf.layerIds).map((layerId) => {
          this.$globalConf.layerManager[layerId].size({
            width, height,
          })
        })
        // if (this.renderComponent.length === 0) {
        //   this.$globalConf.scale = 1
        //   this.$globalConf.stageXY = {
        //     x: 0,
        //     y: 0,
        //   }
        // } else {
        // 副屏任何时候都是同步数据
        this.$globalConf.scale = this.stage.getAttr('width') / this.$globalConf.baseWidth
        this.$globalConf.stageXY = {
          x: this.$globalConf.stageXY.x * this.$globalConf.scale,
          y: this.$globalConf.stageXY.y * this.$globalConf.scale,
          // }
        }
      }
      syncArea.setLayerScale()
      syncArea.setStageXY()
    },
    // 初始化转换画板
    initConvertCanvas() {
      this.$globalConf.convertCanvas = []
      this.convertCanvas = Array.from({ length: this.$globalConf.convertCanvasCount }).map(() => ({ id: generateUID() }))
      this.$nextTick(() => {
        this.$refs.convertCanvas.map((canvas, index) => {
          let convertCanvas = new Konva.Stage({
            container: this.$refs.convertCanvas[index],
          })
          convertCanvas.layer = new Konva.Layer()
          convertCanvas.add(convertCanvas.layer)
          this.$globalConf.convertCanvas.push(convertCanvas)
        })
      })
    },
    addConvertCanvas(index) {
      return new Promise((resolve, reject) => {
        let count = ++this.$globalConf.convertCanvasCount
        this.convertCanvas.push({ id: generateUID() })
        this.$nextTick(() => {
          let convertCanvas = new Konva.Stage({
            container: this.$refs.convertCanvas[count - 1],
          })
          convertCanvas.layer = new Konva.Layer()
          convertCanvas.add(convertCanvas.layer)
          this.$globalConf.convertCanvas.splice(index, 0, convertCanvas)
          resolve(convertCanvas)
        })
      })
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
              docName: data.fileName,
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

      let hasSpecial
      // 有特殊组件
      cManager.clearLayer(bgLayer, textLayer, remarkLayer)
      // 初始化文档
      if (this.$globalConf.documentPath && `${this.$globalConf.documentId}`) {
        initDocument(this.$globalConf.documentId, this.$globalConf.documentPath)
      }
      // 初始化画笔数据
      this.renderComponent = []
      let shape
      let componentState
      components.map((component) => {
        if (component) {
          componentState = component.state
          component = JSON.parse(component.component)
          // 特殊组件
          if (specialType.includes(component.type)) {
            this.$globalConf[component.type] = component[component.type]
            hasSpecial = true
          } else if (this.$globalConf.isSpeaker) {
            component.visible = true
            componentState === 1 && this.renderComponent.push(component)
          } else {
            // 非主讲屏都渲染,软删除的visible 为false
            component.visible = componentState === 1
            this.renderComponent.push(component)
          }
        }
      })
      if (hasSpecial) {
        this.updateStageInfo()
        // 主讲屏
        if (this.$globalConf.isSpeaker) {
          const params = {
            state: 0,
            componentTypes: [0],
          }
          this.$globalConf.hasValidComponent = this.renderComponent.length > 0
          // 删除掉之前的软删除（此时不再需要撤回了）
          socketUtil.deleteComponentsTypesState(formateComponent(params))

          // 广播其他屏重新初始化
          socketUtil.broadcast({ meetingId: this.$globalConf.meetingId, msg: JSON.stringify({ event: 'refresh' }) })
        }
        this.renderComponent.forEach((component) => {
          if (component.type === 'remark') {
            shape = new Konva[component.className](component.attrs)
            shape.visible(component.visible)
            remarkLayer.add(shape)
            cache(shape)
          } else if (component.type === 'text') {
            shape = new Konva[component.className](component.attrs)
            shape.visible(component.visible)
            textLayer.add(shape)
            cache(shape)
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
      } else {
        // 添加特殊组件
        this.addSpecialComponent()
        console.log('add special component')
        // 重新进入
        this.$globalConf.toggleRouter = !this.$globalConf.toggleRouter
        // const params = {
        //   meetingId: this.$globalConf.meetingId,
        //   whiteboardId: this.$globalConf.whiteboardId,
        //   documentId: this.$globalConf.documentId,
        // }
        // socketUtil.getComponent(params)
      }
    },
    // 开始初始化
    startMeeting() {
      if (!getSocket()) {
        socketUtil.initSocket()
        this.startListener()
        getSocket().on('connect', () => {
          // console.log(getSocket().connected) // true
          // console.log(`meetingId:${this.$globalConf.meetingId}`)
          // socket 连接,加入会议房间
          const meetingInfo = {
            theme: '',
            meetingId: this.$globalConf.meetingId,
            nickName: this.$globalConf.user.username,
            userId: this.$globalConf.user.userId,
          }
          socketUtil.joinMeet(meetingInfo)
          // 获取会议
          getSocket().on(socketEvent.joinMeet, (res) => {
            this.$globalConf.isSpeaker = res.isSpeaker
            console.log(`isSpeaker:${res.isSpeaker}`)
            // 防止多个主讲屏，通知其他的主讲屏断连
            if (this.$globalConf.isSpeaker) {
              socketUtil.broadcast({
                meetingId: this.$globalConf.meetingId,
                msg: JSON.stringify({ event: 'speakerOnline' }),
              })
            }
            socketUtil.getMeet({
              meetingId: this.$globalConf.meetingId,
            })
          })
        })
      } else {
        this.startListener()
        socketUtil.getMeet({
          meetingId: this.$globalConf.meetingId,
        })
      }
    },
    startListener() {
      getSocket().on(socketEvent.getComponent, ({ components }) => {
        this.$nextTick(
          () => {
            this.initComponents(components)
          },
        )
      })
      getSocket().on(socketEvent.getMeet, (res) => {
        this.$nextTick(
          () => this.handleGetMeet(res),
        )
      })
      getSocket().on(socketEvent.updateComponent, this.handleUpdateComponent)
      getSocket().on(socketEvent.clearBoard, this.handleClearBoard)
      getSocket().on(socketEvent.addComponent, this.handleAddComponent)
      getSocket().on(socketEvent.updateComponentState, this.handleUpdateComponentState)
      getSocket().on(socketEvent.broadcast, ({ msg }) => {
        let { event } = JSON.parse(msg)
        switch (event) {
        case 'refresh':
          if (!this.$globalConf.isSpeaker) this.onRefresh()
          break
        case 'speakerOnline':
          if (this.$globalConf.isSpeaker) destroySocket()
          break
        default:
          break
        }
      })
    },
    stopListener() {
      let socket = getSocket()
      let events = [socketEvent.getComponent, socketEvent.getMeet,
        socketEvent.updateComponent, socketEvent.clearBoard,
        socketEvent.addComponent, socketEvent.updateComponentState, socketEvent.broadcast]
      events.map((event) => {
        if (socket) socket.off(event)
      })
    },
    handleGetMeet(res) {
      this.$globalConf.mode = 'board'
      this.whiteboards = res.whiteboards
      if (this.whiteboards) {
        // 取出指定的board(whiteboardId+documentId)
        if (!isEmpty(res.syncAction)) {
          const { whiteboardId, documentId, documentPath } = this.$globalConf.syncAction = JSON.parse(res.syncAction)
          this.$globalConf.mode = documentId == null ? 'board' : 'document'

          this.$globalConf.whiteboardId = whiteboardId
          this.$globalConf.documentId = documentId
          this.$globalConf.documentPath = documentPath
          const params = {
            meetingId: this.$globalConf.meetingId,
            whiteboardId,
            documentId,
          }
          socketUtil.getComponent(params)
        } else {
          if (!this.$globalConf.isSpeaker) {
            return
          }
          // 没有就默认首个板
          const params = {
            meetingId: this.$globalConf.meetingId,
            whiteboardId: this.whiteboards[0].whiteboardId,
            documentId: null,
          }
          this.$globalConf.whiteboardId = this.whiteboards[0].whiteboardId
          this.$globalConf.documentId = null
          this.$globalConf.documentPath = null
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
            this.addSpecialComponent()

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
    addSpecialComponent() {
      const el = document.querySelector('#board-container')

      syncArea.addSpeakerSize({ width: el.clientWidth, height: el.clientHeight })
      syncArea.addStageXY()
      syncArea.addBaseWidth()
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
        console.log('speakerSize')
        this.$globalConf.toggleRouter = !this.$globalConf.toggleRouter
      } else if (component.type === sComponentId.stageXY) {
        this.$globalConf.stageXY = {
          x: component.stageXY.x * this.$globalConf.scale,
          y: component.stageXY.y * this.$globalConf.scale,
        }
        syncArea.setStageXY()
        // 文档滚动
        if (this.$globalConf.mode === 'document') {
          clearTimeout(this.timerRenderPages)
          this.timerRenderPages = setTimeout(renderPages, 300)
        }
      } else if (component.type === 'cover') {
        let node = this.stage.find(`#${component.attrs.id}`)[0]
        if (node) node.setAttrs({ x: component.attrs.x, y: component.attrs.y })
        this.$globalConf.layerManager[this.$globalConf.layerIds.BG_LAYER].draw()
      } else if (component.type === 'text' || component.type === 'remark') {
        cManager.renderUpdateComponent(component, component.type)
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
        cache(shape)
      } else if (component.type === 'text') {
        shape = new Konva[component.className](component.attrs)
        textLayer.add(shape)
        textLayer.batchDraw()
        shape.cache()
      } else if (component.type === 'cover') {
        shape = addCoverImage(component.attrs)
      } else {
        shape = new Konva.Image(component.attrs)
        bgLayer.add(shape)
        bgLayer.batchDraw()
      }
    },
    // 收到更新组件状态信息
    handleUpdateComponentState(res) {
      const { componentId, state } = res
      cManager.updateVisible(componentId, state === 1)
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
    gotoBoard() {
      const params = {
        meetingId: this.$globalConf.meetingId,
        syncAction: JSON.stringify({
          whiteboardId: this.$globalConf.whiteboardId,
          documentId: null,
        }),
      }
      socketUtil.syncAction(params)
      this.$globalConf.toggleRouter = !this.$globalConf.toggleRouter
    },
  },
  beforeDestroy() {
    // 清缓存
    this.$globalConf.whiteboard = null
    this.$globalConf.mode = ''
    destroyTool()

    this.stopListener()
    Vue.eventBus.$off('setTbMask')
    Vue.eventBus.$off('setMiniMenu')
  },
}
</script>
<style lang="scss" src="./WhiteBoard.scss" scoped></style>
