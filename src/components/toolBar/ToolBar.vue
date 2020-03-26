<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2019-12-24 17:17:41
@version 1.0.0
-->
<template>
  <div class="toolbar" @mousedown.stop="" @touchstart.stop="">
    <!-- 工具条能否起作用的遮罩 -->
    <!-- <div class="mask" v-show="!$globalConf.speakerPermission"></div> -->
    <!-- <div
      class="left part"
      v-if="isHome"
    >
      <span><i class="iconfont icon-add"></i></span>
      <span><i class="iconfont icon-boards"></i></span>
    </div> -->
    <div class="center">
      <ul class="group draw-tool" v-if="$globalConf.speakerPermission">
        <li v-if="$globalConf.mode==='board'" ref="pan-tool" @click.stop.prevent="clickPanTool" :class="{'activeTool':isActive('pan-tool')}">
          <div class="inner">
            <Tooltip content="拖动" placement="top-end">
            <i class="iconfont icon-shou"></i>
            </Tooltip>
          </div>
        </li>
        <li ref="select-tool" @click.stop.prevent="clickSelectTool" :class="{'activeTool':isActive('select-tool')}">
          <div class="inner">
            <Tooltip content="指针" placement="top-end">
              <i class="iconfont icon-select"></i>
            </Tooltip>
          </div>
        </li>
        <li ref="pencil-tool" @click.stop.prevent="clickPencilTool" :class="{'activeTool':isActive('pencil-tool')}">
           <div class="inner">
            <Tooltip content="画笔" placement="top-end">
            <i class="iconfont icon-pen"></i>
            </Tooltip>
           </div>
            <div class="menu pencil" v-show="boxName === 'pencil'">
              <div class="preview-wrapper">
                <canvas id="preview-canvas"></canvas>
              </div>
              <div class="tool-control row">
                <div
                v-for="(pencilTool, index) in pencilToolArr"
                :Key="index"
                :class="{
                  'item-wrapper': true,
                  'active-item':
                    $globalConf.pencil.activePencilTool === pencilTool.name
                }"
                @click.stop.prevent="changePencilTool(pencilTool.name)"
              >
                <span><i :class="['iconfont', pencilTool.icon]"></i></span>
              </div>
            </div>
            <div class="color-control row">
              <div
                v-for="(color, index) in pencilColorArr"
                :key="index"
                :class="{
                  'item-wrapper': true,
                  'active-item': $globalConf.pencil.color === color
                }"
                @click.stop.prevent="changePencilColor(color)"
              >
                <span class="circle" :style="{ backgroundColor: color }"></span>
              </div>
            </div>
            <div class="width-control row">
              <div class="width-level">{{ $globalConf.pencil.lineWidth }}</div>
              <div
                v-for="(item, index) in widthArr"
                :key="index"
                :class="{
                  'item-wrapper': true,
                  'active-item': $globalConf.pencil.lineWidth === item.lineWidth
                }"
                @click.stop.prevent="changePencilWidth(item.lineWidth)"
              >
                <span
                  class="cirlce"
                  :style="{
                    width: `${item.width}vw`,
                    height: `${item.width}vw`,
                    'border-radius': `${item.width / 2}vw`,
                    backgroundColor: `${$globalConf.pencil.color}`
                  }"
                ></span>
              </div>
            </div>
          </div>
        </li>
       <!-- </Tooltip> -->
        <li ref="eraser-tool" @click.stop.prevent="clickEraserTool" :class="{'activeTool':isActive('eraser-tool')}">
          <div class="inner">
            <Tooltip content="橡皮擦" placement="top-end">
              <i class="iconfont icon-eraser"></i>
            </Tooltip>
          </div>
          <div class="menu eraser" v-if="boxName === 'eraser'">
            <div class="row">
              <div
                v-for="(eraserTool, index) in eraserToolArr"
                :Key="index"
                :class="{
                  'item-wrapper': true,
                  'active-item':
                    $globalConf.eraser.activeEraserTool === eraserTool.name
                }"
                @click.stop.prevent="changeEraserTool(eraserTool.name)"
              >
                <span><i :class="['iconfont', eraserTool.icon]"></i></span>
              </div>
            </div>
            <div class="row width-control">
              <div class="width-level">{{ $globalConf.eraser.lineWidth }}</div>
              <div
                v-for="(item, index) in widthArr"
                :key="index"
                :class="{
                  'item-wrapper': true,
                  'active-item': $globalConf.eraser.lineWidth === item.lineWidth
                }"
                @click.stop.prevent="changeEraserWidth(item.lineWidth)"
              >
                <span
                  class="circle"
                  :style="{
                    width: `${item.width}vw`,
                    height: `${item.width}vw`,
                    'border-radius': `${item.width / 2}vw`
                  }"
                ></span>
              </div>
            </div>
          </div>
        </li>
       </Tooltip>
        <li ref="text-tool" @click.stop="clickTextTool" :class="{'activeTool':isActive('text-tool')}">
          <div class="inner">
            <Tooltip content="文本框" placement="top-end">
               <i class="iconfont icon-text"></i>
            </Tooltip>
          </div>
        </li>
       </Tooltip>
      </ul>
      <ul class="group bussiness-tool">
        <li v-if="$globalConf.speakerPermission && $globalConf.mode==='board'">
          <div class="inner">
            <Tooltip content="导入文档" placement="top-end">
            <Upload
              :action="common.api.upload"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              :format="['pdf', 'doc', 'docx', 'ppt', 'pptx']"
              :before-upload="beforeUpload"
              :on-success="uploadSuccess"
              :data="{ fbId: common.fbId.upload }"
              :show-upload-list="false"
            >
              <i class="iconfont icon-upload"></i>
            </Upload>
           </Tooltip>
          </div>
        </li>
        <li ref="file-tool" @click.stop.prevent="clickFile">
          <div class="inner">
            <Tooltip content="文档管理" placement="top-end">
              <i class="iconfont icon-file"></i>
            </Tooltip>
          </div>
          <div class="menu file" v-show="boxName === 'file'">
            <Tabs value="meeting">
              <TabPane label="会议文档" name="meeting">
                <div class="file-bd">
                  <div class="nodata-tip" v-if="files.length===0">暂无文档</div>
                  <div class="file-list" v-else>
                     <div class="file-item" v-for="(file,index) in files" :key="index" @click.stop.prevent="openFile(file)">
                       <span class="title">{{file.documentName}}</span>
                       <span class="btns">
                          <Icon type="md-download" @click.stop.prevent="downloadFile(file)" v-if="$globalConf.downloadPermission"/>
                          <Icon type="ios-trash" @click.stop.prevent="deleteFile(file)" v-if="$globalConf.owner"/>
                       </span>
                     </div>
                  </div>
                </div>
              </TabPane>
            </Tabs>
          </div>
        </li>
        <li @click="clip">
          <div class="inner">
            <Tooltip content="剪切" placement="top-end">
              <i class="iconfont icon-clip"></i>
            </Tooltip>
          </div>
        </li>
      </ul>
      <ul class="group other-tool">
        <li @click.stop="back" v-if="$globalConf.speakerPermission">
          <div class="inner">
          <Tooltip content="撤销" placement="top-end">
            <i class="iconfont icon-houtui"></i>
          </Tooltip>
          </div>
        </li>
        <li @click.stop="goAhead" v-if="$globalConf.speakerPermission">
          <div class="inner">
            <Tooltip content="恢复" placement="top-end">
              <i class="iconfont icon-qianjin"></i>
            </Tooltip>
          </div>
        </li>
        <li @click.stop="showUsers">
          <div class="inner">
            <Tooltip content="用户列表" placement="top-end">
              <i class="iconfont icon-userSetting"></i>
            </Tooltip>
          </div>
        </li>
      </ul>
    </div>
    <div class="right part">
      <span v-show="$globalConf.mode === 'document'" @click="gotoBoard" v-if="$globalConf.speakerPermission"
        ><i class="iconfont icon-shangyiye1"></i
      ></span>
      <span @click="handleFullscreen"
        ><i
          :class="[
            'iconfont',
            `icon-${$globalConf.isFullscreen ? 'normalscreen' : 'fullscreen'}`
          ]"
        ></i
      ></span>
    </div>
  </div>
</template>

<script>
import { Upload, Message } from 'view-design'
import common, { api, fileService, socketEvent } from '@common/common'
import Vue from 'vue'
import cManager from '@common/componentManager'
import {
  formateUrl, fullscreen, exitFullscreen, fileLinkToStreamDownload,
} from '@common/utils'
import { openDocument } from '@common/tool/document'
import { getSocket } from '@common/socketUtil'
import _data from './data'

export default {
  props: {
    // 简单模式，没有左边的工具
    isHome: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    Upload,
  },
  data() {
    return {
      common,
      ..._data,
    }
  },
  mounted() {
    // // 模拟测试
    // this.MsgUploading = [function () {}]
    // this.uploadSuccess({
    //   // data: { filePath: '/F19/12/100/dd71bf8f-3f54-486e-9048-9cf675961045.pdf' },
    //   data: { filePath: '/F19/12/100/83d88c00-bede-4dd8-9428-59a75da12f37.pdf' },
    //   // data: { filePath: '/F19/12/100/2d46f4f8-b2de-4401-83a4-ffd2040937a8.pdf' },
    //   ret: { retCode: 0 },
    // })

    // document.body.addEventListener('mousedown', this.handleBodyClick)
    // document.body.addEventListener('touchstart', this.handleBodyClick)
  },
  // 关闭时销毁工具
  beforeDestroy() {
    document.body.removeEventListener('mousedown', this.handleBodyClick)
    document.body.removeEventListener('touchstart', this.handleBodyClick)
    Vue.eventBus.$emit('deactive-tool', {
      toolName: this.$globalConf.activeTool,
    })
  },
  methods: {
    isActive(classname) {
      return this.menuRef[classname].indexOf(this.$globalConf.activeTool) >= 0
    },
    beforeUpload() {
      this.MsgUploading = this.MsgUploading || []
      this.MsgUploading.push(
        Message.loading({
          content: '上传中...',
          duration: 0,
        }),
      )
      return true
    },
    uploadSuccess(res) {
      if (this.MsgUploading.length) this.MsgUploading.pop()()
      this.$emit('uploadSuccess', res)
    },
    changePencilTool(name, isFirst = false) {
      const stage = this.$globalConf.board
      const layer = this.$globalConf.layerManager[
        this.$globalConf.layerIds.REMARK_LAYER
      ]
      if (name !== this.$globalConf.activeTool && !isFirst) {
        Vue.eventBus.$emit('deactive-tool', {
          toolName: this.$globalConf.activeTool,
        })
        this.$globalConf.activeTool = this.$globalConf.pencil.activePencilTool = name
        Vue.eventBus.$emit('active-tool', {
          toolName: this.$globalConf.activeTool,
          stage,
          layer,
        })
      } else if (isFirst) {
        Vue.eventBus.$emit('active-tool', {
          toolName: this.$globalConf.activeTool,
          stage,
          layer,
        })
      }
      this.resetCanvas()
    },
    changePencilColor(color) {
      this.$globalConf.pencil.color = color
      this.resetCanvas()
    },
    changePencilWidth(lineWidth) {
      this.$globalConf.pencil.lineWidth = lineWidth
      this.resetCanvas()
    },
    // eraser
    changeEraserTool(name) {
      if (this.$globalConf.activeTool === name) return
      const stage = this.$globalConf.board
      const layer = this.$globalConf.layerManager[
        this.$globalConf.layerIds.REMARK_LAYER
      ]
      Vue.eventBus.$emit('deactive-tool', {
        toolName: this.$globalConf.activeTool,
      })
      this.$globalConf.activeTool = this.$globalConf.eraser.activeEraserTool = name
      if (name === 'eraser' || name === 'deleteGraphic') {
        Vue.eventBus.$emit('active-tool', {
          toolName: this.$globalConf.activeTool,
          stage,
          layer,
        })
      } else {
        this.$confirm('确定清除所有批注?不可撤销!', () => {
          // const layers = [
          //   layer,
          //   this.$globalConf.layerManager[this.$globalConf.layerIds.TEXT_LAYER],
          // ]
          // Vue.eventBus.$emit('active-tool', {
          //   toolName: this.$globalConf.activeTool,
          //   layers,
          // })
          this.$emit('clearBoard')
        })
      }
    },
    changeEraserWidth(lineWidth) {
      this.$globalConf.eraser.lineWidth = lineWidth
    },
    // 目前只限定激活钢笔事件，初始化时
    active() {
      switch (this.$globalConf.activeTool) {
      case 'pen':
      case 'markPencil':
      case 'arrow': this.changePencilTool(this.$globalConf.activeTool, true); break
      case 'eraser':
      case 'deleteGraphic':
      case 'clearBoard':
        this.changeEraserTool(this.$globalConf.activeTool); break
      case 'pan':
        this.clickPanTool(); break
      case 'select':
        this.clickPanTool(); break
      case 'text':
        this.clickTextTool(); break
      default: break
      }
    },
    clickPanTool() {
      // this.setLiStyle('pan-tool')
      this.setBoxName('')
      // 开启画板移动功能
      if (this.isHome) {
        const stage = this.$globalConf.board
        const layer = this.$globalConf.layerManager[
          this.$globalConf.layerIds.REMARK_LAYER
        ]
        Vue.eventBus.$emit('deactive-tool', {
          toolName: this.$globalConf.activeTool,
        })
        this.$globalConf.activeTool = 'pan'
        Vue.eventBus.$emit('active-tool', {
          toolName: this.$globalConf.activeTool,
          stage,
          layer,
        })
      }
    },
    clickSelectTool() {
      // this.setLiStyle('select-tool')
      this.setBoxName('')
      const stage = this.$globalConf.board
      Vue.eventBus.$emit('deactive-tool', {
        toolName: this.$globalConf.activeTool,
      })
      this.$globalConf.activeTool = 'select'
      Vue.eventBus.$emit('active-tool', {
        toolName: this.$globalConf.activeTool,
        stage,
      })
    },
    clickPencilTool() {
      // this.setLiStyle('pencil-tool')
      this.setBoxName('pencil')
      this.changePencilTool(this.$globalConf.pencil.activePencilTool)
    },
    clickEraserTool() {
      // this.setLiStyle('eraser-tool')
      this.setBoxName('eraser')
      // 清屏不能点击就促发
      if (this.$globalConf.eraser.activeEraserTool === 'clearBoard') {
        this.$globalConf.eraser.activeEraserTool = 'eraser'
      }
      this.changeEraserTool(this.$globalConf.eraser.activeEraserTool)
    },
    clickTextTool() {
      // this.setLiStyle('text-tool')
      this.setBoxName('text')
      const stage = this.$globalConf.board
      const layer = this.$globalConf.layerManager[
        this.$globalConf.layerIds.TEXT_LAYER
      ]
      Vue.eventBus.$emit('deactive-tool', {
        toolName: this.$globalConf.activeTool,
      })
      this.$globalConf.activeTool = 'text'
      Vue.eventBus.$emit('active-tool', {
        toolName: this.$globalConf.activeTool,
        stage,
        layer,
      })
    },
    clickFile() {
      // this.setLiStyle('file-tool')
      this.setBoxName('file')
      this.getFiles()
    },
    getFiles() {

    },
    // 打开文档
    openFile({ documentId, url: documentPath }) {
      if (!this.$globalConf.speakerPermission) return
      openDocument({
        documentId,
        documentPath,
      })
    },
    // 删除文档
    deleteFile({ documentId, documentName = '-' }) {
      this.$confirm(`确定删除文档[${documentName}]?不可撤销!`, () => {
        let socket = getSocket()
        // 删除文档
        socket.emit(socketEvent.deleteDocument, {
          meetingId: this.$globalConf.meetingId,
          whiteboardId: this.$globalConf.whiteboardId,
          documentId,
        })
      })
    },
    // 获取文档
    getDocumentList() {
      this.$api.get(
        formateUrl(api.documentList, {
          meetingId: this.$globalConf.meetingId,
        }),
        null,
        (res) => {
          if (res.data && res.data.documents) {
            this.files = res.data.documents
          }
        },
      )
    },
    downloadFile(file) {
      this.$api.post(
        formateUrl(api.downloadPostil, {
          documentId: file.documentId,
        }),
        null,
        ({ data, ret: { retCode, retMsg } }) => {
          console.log(retCode, retMsg)
          if (Number(retCode) === 0) {
            let url = fileService + data.url
            fileLinkToStreamDownload(url, file.documentName, 'pdf')
          } else {
            Vue.prototype.$Message.error({
              content: retMsg,
              duration: 10,
              closable: true,
            })
          }
        },
      )
    },
    // 裁剪
    clip() {
      this.$emit('clip')
    },
    back() {
      cManager.back()
    },
    goAhead() {
      cManager.goAhead()
    },
    showUsers() {
      this.$emit('showUsers')
    },
    setLiStyle(ref) {
      const el = document.querySelector('.center .activeTool')
      el && el.classList.remove('activeTool')
      this.$refs[ref].classList.add('activeTool')
    },
    setBoxName(boxName) {
      this.boxName = this.boxName === boxName ? '' : boxName
      console.log(this.boxName)
      Vue.eventBus.$emit('setTbMask', this.boxName !== '')
    },
    // 预览图
    resetCanvas() {
      const el = document.querySelector('#preview-canvas')
      const ctx = el.getContext('2d')
      // 获取3个点
      const start = [15, el.height / 2]
      const mid = [(el.width - 30) / 2, el.height / 2]
      let end = [el.width - 15, el.height / 2]
      ctx.strokeStyle = this.$globalConf.pencil.color
      ctx.lineWidth = this.$globalConf.pencil.lineWidth
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.clearRect(0, 0, el.width, el.height)
      let PI2
      let dx
      let dy
      let radians
      let length
      let width
      switch (this.$globalConf.activeTool) {
      case 'markPencil':
        ctx.beginPath()
        ctx.globalAlpha = 0.5
        ctx.moveTo(start[0], start[1])
        ctx.bezierCurveTo(start[0], start[1], mid[0], mid[1], end[0], end[1])
        ctx.stroke()
        break
      case 'pen':
        ctx.beginPath()
        ctx.globalAlpha = 1
        ctx.lineWidth = this.$globalConf.pencil.lineWidth / 2
        ctx.moveTo(start[0], start[1])
        ctx.bezierCurveTo(start[0], start[1], mid[0], mid[1], end[0], end[1])
        ctx.stroke()
        break
      case 'arrow':
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.lineCap = 'butt'
        ctx.lineJoin = 'bevel'
        end = [el.width - 30, el.height / 2]
        ctx.moveTo(start[0], start[1])
        ctx.lineTo(end[0], end[1])
        ctx.stroke()
        ctx.save()
        PI2 = Math.PI * 2
        dx = end[0] - start[0]
        dy = end[1] - start[1]
        radians = (Math.atan2(dy, dx) + PI2) % PI2
        length = this.$globalConf.pencil.lineWidth + 30
        width = this.$globalConf.pencil.lineWidth + 30
        ctx.beginPath()
        ctx.fillStyle = this.$globalConf.pencil.color
        ctx.translate(end[0] + 15, end[1])
        ctx.rotate(radians)
        ctx.moveTo(0, 0)
        ctx.lineTo(-length, width / 2)
        ctx.lineTo(-length, -width / 2)
        ctx.fill()
        ctx.closePath()
        ctx.restore()
        break
      default:
        break
      }
    },
    handleBodyClick() {
      this.boxName = ''
    },
    gotoBoard() {
      this.$emit('gotoBoard')
    },
    handleFullscreen() {
      this.$globalConf.isFullscreen = !this.$globalConf.isFullscreen
      if (this.$globalConf.isFullscreen) {
        fullscreen()
      } else {
        exitFullscreen()
      }
    },
  },
}
</script>

<style lang="scss" src="./ToolBar.scss" scoped></style>
