<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2019-12-24 09:34:21
@version 1.0.0
-->
<template>
  <div class="board-page">
    <section class="board-container-wrapper">
      <!-- <document-navigator v-if="$globalConf.mode === 'document'" :pdf="pdf" class="document-navigator"></document-navigator> -->
    <div class="postilSave" v-if="$globalConf.mode==='document' && $globalConf.speakerPermission" @click="savePostil"><i class="iconfont icon-save"></i></div>
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
        @clip="saveClipImg"
        @showUsers="showUsers"
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
    <!-- <Modal class="clipModal" v-model="clip.showClip" title="保存截图">
      <div class="form-group">
        <span class="label">图片名：</span>
        <div>
          <Input v-model="clip.clipName"></Input>
          <span class="wrong-tip" v-show="clip.wrongTip!==''">{{clip.wrongTip}}</span>
        </div>
      </div>

      <div class="img-wrapper">
        <img :src="clip.clipImg" style="width:400px"/>
      </div>
       <div slot="footer">
          <Button size="large"  @click="cancelClipImg">取消</Button>
          <Button type="primary" size="large" @click="saveClipImg">保存</Button>
        </div>
    </Modal> -->
    <side-drawer v-model="showSideDrawer"></side-drawer>
  </div>
</template>

<script>
import { Message } from 'view-design'
import Konva from 'konva'
import { initTool, destroyTool } from '@common/tool'
import {
  addCover, loadPdf, addCoverImage, init as initDocument, renderPages, destroy as destroyDocument,
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
import SideDrawer from '@/components/side-drawer/SideDrawer'
import DocumentNavigator from '@/components/document-navigator/DocumentNavigator'

export default {
  components: {
    ToolBar,
    MiniMenu,
    SideDrawer,
    DocumentNavigator,
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
      clip: {
        showClip: false,
        clipImg: '',
        clipName: '',
        wrongTip: '',
      },
      tempLayer: null,
      convertCanvas: [],
      timerSavePostil: null,
      showSideDrawer: false,
      // pdfjs对象，传给documentNavigator
      pdf: null,
    }
  },
  created() {
    this.$nextTick(() => {
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
    })
  },
  methods: {
    // 同步批注
    savePostil() {
      clearTimeout(this.timerSavePostil)
      this.timerSavePostil = setTimeout(() => {
        Vue.eventBus.$emit('savePostil')
      }, 500)
    },
    // 接受刷新广播
    onRefresh() {
      this.$globalConf.resizeFlag = true
      clearTimeout(this.timerRefresh)
      this.timerRefresh = setTimeout(() => {
        this.$globalConf.toggleRouter = !this.$globalConf.toggleRouter
      }, 600)
    },
    // 更新stage
    updateStageInfo() {
      const wrapper = document.querySelector('.board-container-wrapper')
      if (this.$globalConf.speakerPermission) {
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
          this.$globalConf.resizeFlag = false
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
      return new Promise((resolve) => {
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
        // 封面组件id
        let componentId = generateUID()
        // 文档转pdf，获取文档路径和文档id
        try {
          let result = await new Promise((resolve, reject) => {
            this.$api.post(
              formateUrl(api.docToPdf, {
                meetingId: this.$globalConf.meetingId,
                whiteboardId: this.$globalConf.whiteboardId,
              }),
              {
                docPath: data.filePath,
                docName: data.fileName,
                componentId,
                // 封面组件，componentType是1
                componentType: 1,
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
            // 添加封面组件
            await addCover(pdf, { documentPath: result.data.url, documentId: result.data.documentId, componentId })
            // 更新文档列表
            this.$refs['tool-bar'].getDocumentList()
            // 通知副屏更新文档列表
            socketUtil.broadcast({
              meetingId: this.$globalConf.meetingId,
              msg: JSON.stringify({
                event: 'updateDocumentList',
              }),
            })
          } else {
            this.$error(result.ret.retMsg)
          }
        } finally {
          this.$root.showMask(false)
        }
      } else {
      // 遮罩
        this.$root.showMask(false)
      }
    },
    // 点击画板，弹窗消失
    clickTbMask() {
      this.$refs['tool-bar'].boxName = ''
      this.tbMask = false
    },
    // 开始初始化组件到Canvas 中，有特殊组件和普通组件,对layer 进行缩放
    initComponents(components) {
      // 初始化完成标记
      this.$globalConf.initDone = false
      const bgLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.BG_LAYER]
      const textLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.TEXT_LAYER]
      const remarkLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.REMARK_LAYER]
      const specialType = ['baseWidth', 'speakerSize', 'stageXY']

      let hasSpecial
      // 有特殊组件
      cManager.clearLayer(bgLayer, textLayer, remarkLayer);
      // 初始化文档
      (async () => {
        if (this.$globalConf.documentPath && `${this.$globalConf.documentId}`) {
          this.pdf = await initDocument(this.$globalConf.documentId, this.$globalConf.documentPath)
        }
      })()
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
          } else if (this.$globalConf.speakerPermission) {
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
        if (this.$globalConf.speakerPermission) {
          const params = {
            state: 0,
            componentTypes: [0],
          }
          this.$globalConf.hasValidComponent = this.renderComponent.length > 0
          // 删除掉之前的软删除（此时不再需要撤回了）
          socketUtil.deleteComponentsTypesState(formateComponent(params))

          // 广播其他屏重新初始化
          // socketUtil.broadcast({ meetingId: this.$globalConf.meetingId, msg: JSON.stringify({ event: 'refresh' }) })
        }
        this.renderComponent.forEach((component) => {
          if (component.type === 'remark') {
            shape = new Konva[component.className](component.attrs)
            shape.visible(component.visible)
            remarkLayer.add(shape)
            // cache(shape)
          } else if (component.type === 'text') {
            shape = new Konva[component.className](component.attrs)
            shape.visible(component.visible)
            textLayer.add(shape)
            // cache(shape)
          } else if (component.type === 'cover') {
            shape = addCoverImage(component.attrs)
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
      // 初始化完成
      this.$globalConf.initDone = true
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
            realName: this.$globalConf.user.realName,
            userId: this.$globalConf.user.userId,
          }
          socketUtil.joinMeet(meetingInfo)
          // 获取会议
          getSocket().on(socketEvent.joinMeet, (res) => {
            this.$globalConf.speakerPermission = res.speakerPermission
            this.$globalConf.downloadPermission = res.downloadPermission
            this.$globalConf.owner = res.owner
            this.$globalConf.user = {
              ...this.$globalConf.user,
              ...res,
            }
            console.log(`speakerPermission:${res.speakerPermission}`)
            // 防止多个主讲屏，通知其他的主讲屏断连
            if (this.$globalConf.speakerPermission) {
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
      let socket = getSocket()
      socket
        .on(socketEvent.getComponent, ({ components }) => {
          this.$nextTick(
            () => {
              this.initComponents(components)
            },
          )
        })
        .on(socketEvent.getMeet, (res) => {
          this.$nextTick(
            () => this.handleGetMeet(res),
          )
        })
        .on(socketEvent.updateComponent, this.handleUpdateComponent)
        .on(socketEvent.clearBoard, this.handleClearBoard)
        .on(socketEvent.addComponent, this.handleAddComponent)
        .on(socketEvent.updateComponentState, this.handleUpdateComponentState)
        .on(socketEvent.broadcast, ({ msg }) => {
          let { event } = JSON.parse(msg)
          switch (event) {
          case 'refresh':
            if (!this.$globalConf.speakerPermission) this.onRefresh()
            break
          case 'speakerOnline':
            if (this.$globalConf.speakerPermission) destroySocket()
            break
          case 'updateDocumentList':
            this.$refs['tool-bar'].getDocumentList()
            break
          default:
            break
          }
        })
        .on(socketEvent.deleteDocument, this.handleDeleteDocument)
    },
    stopListener() {
      let socket = getSocket()
      let events = [socketEvent.getComponent, socketEvent.getMeet,
        socketEvent.updateComponent, socketEvent.clearBoard,
        socketEvent.addComponent, socketEvent.updateComponentState, socketEvent.broadcast, socketEvent.deleteDocument]
      events.map((event) => {
        if (socket) socket.off(event)
      })
    },
    // 删除文档封面组件
    handleDeleteDocument({ componentId, documentId }) {
      this.$refs['tool-bar'].deleteDocument(documentId)
      // 通知副屏更新文档列表
      socketUtil.broadcast({
        meetingId: this.$globalConf.meetingId,
        msg: JSON.stringify({
          event: 'updateDocumentList',
        }),
      })
      if (componentId && this.$globalConf.mode === 'board') {
        const bgLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.BG_LAYER]
        let node = bgLayer.find(`#${componentId}`)[0]
        if (node) {
          node.destroy()
          bgLayer.draw()
        }
      }
    },
    handleGetMeet(res) {
      this.$globalConf.mode = 'board'
      this.whiteboards = res.whiteboards
      if (this.whiteboards) {
        // 取出指定的board(whiteboardId+documentId)
        let { syncAction } = res
        syncAction = this.$globalConf.syncAction = !isEmpty(syncAction) ? JSON.parse(syncAction) : {}

        if (!isEmpty(syncAction.whiteboardId)) {
          const { whiteboardId, documentId, documentPath } = this.$globalConf.syncAction = JSON.parse(res.syncAction)
          this.$globalConf.mode = documentId == null ? 'board' : 'document'
          // 缓存whiteboard实例
          this.$globalConf.whiteboard = this.$globalConf.mode === 'document' ? this : null

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
          if (!this.$globalConf.speakerPermission) {
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

          // 重新存syncAction
          const paramsSA = {
            meetingId: this.$globalConf.meetingId,
            syncAction: JSON.stringify({
              ...syncAction,
              whiteboardId: this.$globalConf.whiteboardId,
              documentId: null,
            }),
          }
          socketUtil.syncAction(paramsSA)
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
            let syncAction = {
              whiteboardId: ret.data.whiteboardId,
              documentId: null,
            }
            const params = {
              meetingId: this.$globalConf.meetingId,
              syncAction: JSON.stringify(syncAction),
            }
            socketUtil.syncAction(params)
            //
            this.$globalConf.syncAction = syncAction
            this.updateStageInfo()
          } else {
            this.$error('创建白板失败')
          }
        })
      }
      // 获取文档
      this.$refs['tool-bar'].getDocumentList()
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
      if (this.$globalConf.speakerPermission) {
        // 没有文档封面，（这个判断有时会导致异常，等文档列表搞定之后，换成文档接口，内存中做判断）
        if (!bgLayer.findOne('Image')) {
          syncArea.updateBaseWidth('')
          this.$globalConf.hasValidComponent = false
        }
        // 清掉缓存队列
        cManager.clearCache()
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
      this.$globalConf.activeTool = 'pen'
      cManager.clearCache()
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
    // 裁剪
    // clipImg() {
    //   this.clip.wrongTip = ''
    //   this.clip.showClip = true
    //   this.clip.clipImg = this.$globalConf.board.toDataURL()
    // },
    saveClipImg() {
      if (isEmpty(this.tempLayer)) {
        this.tempLayer = new Konva.Layer()
        this.$globalConf.board.add(this.tempLayer)
        this.tempLayer.zIndex(0)
        this.tempLayer.destroyChildren()
      }
      const { width, height } = this.$globalConf.board.size()
      const { x, y } = this.$globalConf.board.getAbsoluteTransform()
      const rect = new Konva.Rect({
        fill: '#fff',
        x: -x,
        y: -y,
        width,
        height,
      })
      this.tempLayer.add(rect)
      this.tempLayer.batchDraw()
      const link = document.createElement('a')
      link.href = this.$globalConf.board.toDataURL()
      link.download = true
      document.body.appendChild(link)
      link.click()
    },
    showUsers() {
      this.showSideDrawer = true
    },
    cancelClipImg() {
      this.clip.showClip = false
    },
  },
  beforeDestroy() {
    // 清缓存
    if (this.$globalConf.whiteboard === this) {
      this.$globalConf.whiteboard = null
    }

    this.$globalConf.mode = ''
    destroyTool()
    this.$globalConf.board.clearCache()
    this.$globalConf.board.destroy()

    this.stopListener()
    Vue.eventBus.$off('setTbMask')
    Vue.eventBus.$off('setMiniMenu')
    // 销毁文档相关
    destroyDocument({ all: true })
  },
}
</script>
<style lang="scss" src="./WhiteBoard.scss" scoped></style>
<style lang="scss">
  .clipModal{
    .form-group{
      display: flex;
      .label{
        width:80px;
        height:32px;
        font-size:14px;
        font-weight: 600;
        line-height:32px;
      }
      .wrong-tip{
        color:#f00
      }
    }
    .img-wrapper{
      margin-top:10px;
      border-radius:5px;
      border:1px solid #eee;
    }
  }
</style>
