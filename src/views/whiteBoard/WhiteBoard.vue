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
import { formateUrl } from '@common/utils'
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
    bus.$on('resize', () => {
      // 主屏应该重绘，并同步画布尺寸
      if (this.$refs['board-container']) {
        const width = this.$refs['board-container'].clientWidth
        const height = this.$refs['board-container'].clientHeight

        this.stage.size({
          width,
          height,
        })
      }
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
      }
      // 副屏初始化宽高($)，主讲屏等比缩放宽高
      else if (this.$globalConf.speakerWidth / this.$globalConf.speakerHeight > wrapper.clientWidth / wrapper.clientHeight) {
      // 被宽度限制
        const scale = this.$globalConf.speakerWidth / this.$globalConf.speakerHeight
        el.style.width = `${wrapper.clientWidth}px`
        el.style.height = `${wrapper.clientWidth / scale}px`
        this.$globalConf.board = this.stage = new Konva.Stage({
          container: 'board-container',
          width: wrapper.clientWidth,
          height: wrapper.clientWidth / scale,
        })
      } else {
      // 被高度限制
        const scale = this.$globalConf.speakerWidth / this.$globalConf.speakerHeight
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
    getBoards() {
      getSocket().on(socketEvent.getMeet, (res) => {
        console.log('getBoard')
        this.whiteboards = res.whiteboards
        if (this.whiteboards.length >= 0) {
          // 默认获取首个白板首屏数据初始化组件
          const params = {
            meetingId: this.$$globalConf.meetingId,
            whiteboardId: this.whiteboards[0].whiteboardId,
            documentId: '',
          }
          socketUtil.getComponent(params)
          getSocket().on(socketEvent.getComponent, ({ components }) => {
            this.initComponents(components)
          })
        }
        // 创建一个白板
        else {
          console.log('创建白板')
          const url = formateUrl(api.createBoard, { meetingId: this.$globalConf.meetingId })
          const name = 'board_1'
          this.$api.post(url, { whiteboardName: name }, (ret) => {
            if (ret.retCode === '0') {
              this.$globalConf.whiteboardId = ret.data.whiteboardId
              // 记录主讲屏size,特殊组件
              const el = document.querySelector('#board-container')
              let params = {
                meetingId: this.$globalConf.meetingId,
                whiteboardId: ret.data.whiteboardId,
                documentId: null,
                componentType: 1,
                componentId: sComponentId.size,
                component: JSON.stringify({ attrs: { id: sComponentId.speakerSize, width: el.clientWidth, height: el.clientHeight } }),
              }
              socketUtil.addComponent(params)
              params = {
                meetingId: this.$globalConf.meetingId,
                whiteboardId: ret.data.whiteboardId,
                documentId: null,
                componentType: 1,
                componentId: sComponentId.stageXY,
                component: JSON.stringify({ attrs: { id: sComponentId.stageXY, x: 0, y: 0 } }),
              }
              socketUtil.addComponent(params)
              params = {
                meetingId: this.$globalConf.meetingId,
                whiteboardId: ret.data.whiteboardId,
                documentId: null,
                componentType: 1,
                componentId: sComponentId.baseWdith,
                component: JSON.stringify({ attrs: { id: sComponentId.baseWdith, baseWdith: el.clientWidth } }),
              }
              socketUtil.addComponent(params)
            } else {
              this.$error('创建白板失败')
            }
          })
        }
      })
    },
    // 开始初始化组件到Canvas 中
    initComponents(components) {
      const bgLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.BG_LAYER]
      const textLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.TEXT_LAYER]
      const remarkLayer = this.$globalConf.layerManager[this.$globalConf.layerIds.REMARK_LAYER]
      components.map((component) => {
        if (component.componentType === 0) {
          // 文字,其他标注(普通)
          if (component.attrs.className === 'Text') {
            textLayer.add(new Konva.Text(component.attrs))
          } else {
            remarkLayer.add(new Konva[component.className](component.attrs))
          }
        } else {
          // 封面
          bgLayer.add(new Konva.Image(component.attrs))
        }
      })
      // 到时测试这种绘制的渲染效果
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
      this.$api.post(api.createMeet, p, (res) => {
        if (res.ret.retCode === '0') {
          socketUtil.initSocket()
          getSocket().on('connect', () => {
            console.log(getSocket().connected) // true
            this.$globalConf.meetingId = res.data.meetingId
            console.log(`meetingId:${res.data.meetingId}`)
            this.initStageInfo()
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
              this.getBoards() // 开启等待
            })
          })
        }
      })
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
