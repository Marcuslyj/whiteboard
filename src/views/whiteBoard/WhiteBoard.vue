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
    <div class="tool-box-mask" v-if="tbMask" @click="clickTbMask"></div>
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
      v-if="shouldConvert"
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
import { socketEvent, api, sComponentId } from '@common/common'
import Vue from 'vue'
import { formateUrl, isEmpty } from '@common/utils'
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
      shouldConvert: false,
      convertCanvas: null,
      tbMask: false,
      whiteboards: [],
    }
  },
  mounted() {
    this.fortest()
    initTool()
    Vue.eventBus.$on('setTbMask', (visible) => {
      this.tbMask = visible
    })
  },
  methods: {
    // 初始化stage
    initStageInfo() {
      const wrapper = document.querySelector('.board-container-wrapper')
      const el = document.querySelector('#board-container')
      if (this.$globalConf.isSpeaker) {
        this.$globalConf.board = this.stage = new Konva.Stage({
          container: 'board-container',
          width: el.clientWidth,
          height: el.clientHeight,
        })
      } else if (this.$globalConf.speakerSize.width / this.$globalConf.speakerSize.height > wrapper.clientWidth / wrapper.clientHeight) {
        // 副屏初始化宽高($)，主讲屏等比缩放宽高
        // 被宽度限制
        const scale = this.$globalConf.speakerSize.width / this.$globalConf.speakerSize.height
        el.style.width = `${wrapper.clientWidth}px`
        el.style.height = `${wrapper.clientWidth / scale}px`
        this.$globalConf.board = this.stage = new Konva.Stage({
          container: 'board-container',
          width: wrapper.clientWidth,
          height: wrapper.clientWidth / scale,
        })
      } else {
      // 被高度限制
        const scale = this.$globalConf.speakerSize.width / this.$globalConf.speakerSize.height
        el.style.height = `${wrapper.clientHeight}px`
        el.style.width = `${wrapper.clientHeight * scale}px`
        this.$globalConf.board = this.stage = new Konva.Stage({
          container: 'board-container',
          width: wrapper.clientHeight * scale,
          height: wrapper.clientHeight,
        })
      }
      Object.keys(this.$globalConf.layerIds).map((layerId) => {
        const layer = new Konva.Layer({
          id: layerId,
        })
        this.$globalConf.layerManager[layerId] = layer
        this.$globalConf.layerManager.BG_LAYER.listening(false)
        this.stage.add(layer)
      })
      this.$refs['tool-bar'].active()
      bus.$on('resize', () => {
      // 主屏应该重绘，并同步画布尺寸
        if (this.$refs['board-container']) {
          const width = this.$refs['board-container'].clientWidth
          const height = this.$refs['board-container'].clientHeight
          this.stage && this.stage.size({
            width,
            height,
          })
        }
      })
    },
    // 初始化转换画板
    initConvertCanvas() {
      if (this.convertCanvas) {
        return
      }
      this.convertCanvas = new Konva.Stage({
        container: this.$refs.convertCanvas,
      })
      this.convertCanvas.layer = new Konva.Layer()
      this.convertCanvas.add(this.convertCanvas.layer)
    },
    // 文档上传成功
    async uploadSuccess({ data, ret }) {
      if (Number(ret.retCode) === 0) {
        this.Msgloading = this.Msgloading || []
        this.Msgloading.push(Message.loading({
          content: '读取中...',
          duration: 0,
        }))
        // let filePath = common.fileService + data.filePath
        // let pdf = await pdfjsLib.getDocument(filePath).promise
        const pdf = await loadPdf({ url: data.filePath })

        this.shouldConvert = true

        this.$nextTick(() => {
          this.initConvertCanvas()
          if (this.Msgloading.length) this.Msgloading.pop()()

          addCover(pdf, {
            stage: this.stage,
            layer: this.$globalConf.layerManager[this.$globalConf.layerIds.BG_LAYER],
            convertCanvas: this.convertCanvas,
          })
        })
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
      components.map((component) => {
        // 特殊组件
        if (specialType.includes[component.type]) {
          this.$globalConf[component.type] = component[component.type]
        } else if (component.type === 'remark') {
          remarkLayer.add(new Konva[component.className](component.attrs))
        } else if (component.type === 'text') {
          textLayer.add(new Konva.Text(component.attrs))
        } else {
          bgLayer.add(new Konva.Image(component.attrs))
        }
      })
      // 到时测试这种绘制的渲染效果
      if (isEmpty(this.$globalConf.baseWidth)) {
        this.$globalConf.scale = 1
      } else {
        this.$globalConf.scale = this.$globalConf.speackerSize.width / this.$globalConf.baseWidth
      }
      textLayer.scale({
        x: this.$globalConf.scale,
        y: this.$globalConf.scale,
      })
      remarkLayer.scale({
        x: this.$globalConf.scale,
        y: this.$globalConf.scale,
      })
      bgLayer.batchDraw()
      textLayer.batchDraw()
      remarkLayer.batchDraw()
    },
    fortest() {
    // 下面只是为了测试,后续需要调整
    // 临时创建会议
      const p = {
        theme: this.$route.params.theme,
        type: 0,
        startTime: '2020-01-06 10:00:00',
        endTime: '2020-01-06 12:00:00',
        adress: '南山A01大会议室',
        docPermission: 0,
        linkUrl: 'https://dev-meetingwhitboard.com/meeting/meet/meet.html',
      }
      console.log(this.$route)
      // 非主讲人
      if (this.$route.params.meetingId) {
        this.$globalConf.meetingId = this.$route.params.meetingId
        this.$globalConf.isSpeaker = false
        socketUtil.initSocket()
        this.startListener()
        getSocket().on('connect', () => {
          console.log(getSocket().connected) // true
          console.log(`meetingId:${this.$globalConf.meetingId}`)
          // socket 连接,加入会议房间
          const p1 = {
            theme: 'xxx',
            meetingId: this.$globalConf.meetingId,
            nickName: '张三',
            userId: this.$route.params.userId,
          }
          socketUtil.joinMeet(p1)
          // 获取会议
          getSocket().on(socketEvent.joinMeet, () => {
            socketUtil.getMeet({
              meetingId: this.$globalConf.meetingId,
            })
          })
        })
      } else {
        this.$api.post(api.createMeet, p, (res) => {
          if (res.ret.retCode === '0') {
            socketUtil.initSocket()
            this.startListener()
            getSocket().on('connect', () => {
              console.log(getSocket().connected) // true
              this.$globalConf.meetingId = res.data.meetingId
              console.log(`meetingId:${res.data.meetingId}`)
              // socket 连接,加入会议房间
              const p1 = {
                theme: 'xxx',
                meetingId: res.data.meetingId,
                nickName: '张三',
                userId: this.$route.params.userId,
              }
              socketUtil.joinMeet(p1)
              // 获取会议
              getSocket().on(socketEvent.joinMeet, () => {
                socketUtil.getMeet({
                  meetingId: res.data.meetingId,
                })
              })
            })
          }
        })
      }
    },
    startListener() {
      getSocket().on(socketEvent.getComponent, ({ components }) => {
        this.initComponents(components)
        this.initStageInfo()
      })
      getSocket().on(socketEvent.getMeet, this.handleGetMeet)
    },
    handleGetMeet(res) {
      console.log('getBoard')
      this.whiteboards = res.whiteboards
      if (this.whiteboards) {
        // 取出指定的board(whiteboardId+docId)
        if (!isEmpty(res.syncAction)) {
          const data = JSON.parse(res.syncAction)
          const params = {
            meetingId: this.$globalConf.meetingId,
            whiteboardId: data.whiteboardId,
            documentId: data.documentId,
          }
          socketUtil.getComponent(params)
        }
      } else {
        // 创建一个白板
        console.log('创建白板')
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
              componentType: 0,
              componentId: sComponentId.size,
              component: JSON.stringify({
                type: sComponentId.speakerSize,
                attrs: { width: el.clientWidth, height: el.clientHeight },
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
                type: sComponentId.stageXY,
                attrs: { x: 0, y: 0 },
              }),
            }
            socketUtil.addComponent(params)
            params = {
              meetingId: this.$globalConf.meetingId,
              whiteboardId: ret.data.whiteboardId,
              documentId: null,
              componentType: 0,
              componentId: sComponentId.baseWdith,
              component: JSON.stringify({
                componentId: sComponentId.baseWdith,
                attrs: { baseWdith: el.clientWidth },
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
            this.initStageInfo()
          } else {
            this.$error('创建白板失败')
          }
        })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.board-page {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  /deep/ {
    canvas {
      transform: translateZ(0);
    }
  }
  .board-container-wrapper {
    background-color: #fff;
    flex: 1;
    margin: 10px 10px 0;
    border: 1px solid #eee;
    overflow: hidden;
    position: relative;
    justify-content: center;
    align-items: center;
    #board-container{
      position:relative;
      z-index:10;
      width:100%;
      height:100%;
      /deep/ .konvajs-content{
        transition: opacity 0.5s;
        opacity: 1;
        &.invisible{
          opacity: 0;
        }
      }
    }
    .tool-box-mask{
      position: absolute;
      top:0;
      left:0;
      width:100%;
      height:100%;
      z-index: 11;
    }
  }
  .tool-wrapper {
    position: relative;
    margin: 10px;
    z-index:12;
  }
  .convertCanvas {
    width: 10px;
    height: 10px;
    overflow: hidden;
    position: absolute;
    z-index: -10;
    top: 0;
    left: 0;
  }
}
</style>
