<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2019-12-24 17:17:41
@version 1.0.0
-->
<template>
  <div class="toolbar">
    <div class="mask" v-show="!enable"></div>
    <div class="left part" v-if="isHome">
      <span><i class="iconfont icon-add"></i></span>
      <span><i class="iconfont icon-boards"></i></span>
    </div>
    <div class="center">
      <ul class="group draw-tool">
        <li>
          <i class="iconfont icon-select"></i>
        </li>
        <li><i class="iconfont icon-pen"></i>
          <div class="menu pencil">
            <div class="preview-wrapper">
              <canvas id="preview-canvas"></canvas>
            </div>
            <div class="tool-control row" >
              <div
                v-for="(pencilTool,index) in pencilToolArr"
                :Key="index"
                :class="{'item-wrapper':true,'active-item':activePencilTool===pencilTool.name}"
                @click="changePencilTool(pencilTool.name)"
              >
                <span><i :class="['iconfont',pencilTool.icon]"></i></span>
              </div>
            </div>
            <div class="color-control row">
              <div
                v-for="(color,index) in pencilColorArr"
                :key="index"
                :class="{'item-wrapper':true,'active-item':activePencilColor===color}"
                @click="changePencilColor(color)"
              >
                <span
                  class="circle"
                  :style="{backgroundColor:color}"
                ></span>
              </div>

            </div>
            <div class="width-control row">
              <div class="width-level">{{activePencilWidth}}</div>
              <div
                v-for="(item,index) in widthArr"
                :key="index"
                :class="{'item-wrapper':true,'active-item':activePencilWidth===item.lineWidth}"
                @click="changePencilWidth(width)"
              >
                <span
                  class="cirlce"
                  :style="{width:`${item.width}vw`,height:`${item.width}vw`,'border-radius':`${item.width/2}vw`,backgroundColor:`${activePencilColor}`}"
                ></span>
              </div>
            </div>
          </div>
        </li>
        <li>
          <i class="iconfont icon-eraser"></i>
          <div class="menu eraser">
            <div class="row">
              <div
                v-for="(eraserTool,index) in eraserToolArr"
                :Key="index"
                :class="{'item-wrapper':true,'active-item':activeEraserTool===eraserTool.name}"
              >
                <span><i :class="['iconfont',eraserTool.icon]"></i></span>
              </div>
            </div>
            <div class="row width-control">
              <div class="width-level">{{activePencilWidth}}</div>
              <div
                v-for="(item,index) in widthArr"
                :key="index"
                :class="{'item-wrapper':true,'active-item':activeEraserWidth===item.lineWidth}"
              >
                <span
                  class="circle"
                  :style="{width:`${item.width}vw`,height:`${item.width}vw`,'border-radius':`${item.width/2}vw`}"
                ></span>
              </div>
            </div>
          </div>
        </li>
        <li><i class="iconfont icon-text"></i></li>
      </ul>
      <ul class="group bussiness-tool">
        <li>
          <Upload
            :action="common.api.upload"
            accept="application/pdf"
            :format="['pdf']"
            :on-success="uploadSuccess"
            :data="{fbId:common.fbId.upload}"
          >
            <i class="iconfont icon-upload"></i>
          </Upload>
        </li>
        <li><i class="iconfont icon-download"></i></li>
        <li><i class="iconfont icon-file"></i></li>
        <li><i class="iconfont icon-clip"></i></li>
      </ul>
      <ul class="group other-tool">
        <li><i class="iconfont icon-houtui"></i></li>
        <li><i class="iconfont icon-qianjin"></i></li>
      </ul>
    </div>
    <div class="right part">
      <span><i class="iconfont icon-fullscreen"></i></span>
    </div>
  </div>
</template>

<script>
import { Upload } from 'view-design';
import common from '@common/common'
import Vue from 'vue'
export default {
  props: {
    //简单模式，没有左边的工具
    isHome: {
      type: Boolean,
      default: true
    },
    enable:{
      type: Boolean,
      default: true
    }
  },
  components: {
    Upload
  },
  data() {
    return {
      common,
      activeTool: 'select',
      //笔
      pencilColorArr: ['#000', '#f00', 'yellow', '#0f0', '#00f'],
      widthArr: [{
        width:0.4,
        lineWidth:4,
      },{
        width:0.6,
        lineWidth:6
      },{
        width:1,
        lineWidth:10
      },{
        width:1.2,
        lineWidth:12
      },
      {
        width:1.6,
        lineWidth:16
      }],
      pencilToolArr: [
        {
          name: 'pen',
          icon: 'icon-gangbi',
        },
        {
          name: 'markPencil',
          icon: 'icon-makebi',
        },
        {
          name: 'icon-arrow',
          icon: 'icon-arrow',
        }
      ],
      activePencilTool: 'markPencil',
      activePencilColor: '#000',
      activePencilWidth: 10,

      //eraserToolArr
      eraserToolArr: [
        {
          name: 'icon-eraser',
          icon: 'icon-eraser',
        },
        {
          name: 'icon-qingkong',
          icon: 'icon-qingkong',
        },
        {
          name: 'icon-clear',
          icon: 'icon-clear',
        }
      ],
      activeEraserWidth: 1,
      activeEraserTool: 'icon-eraser',
    }
  },
  methods: {
    uploadSuccess({ data, ret }) {
      if (0 == ret.retCode) {
        let filePath = data.filePath
      }
    },
    changePencilTool(name){
      this.activePencilTool=name
      const stage=this.$globalConf.board
      const layer=this.$globalConf.layerManager[this.$globalConf.layerIds['REMARK_LAYER']]
      const toolConfig={
        lineWidth:this.activePencilWidth,
        color:this.activePencilColor
      }
      Vue.eventBus.$emit('active-tool',{toolName:'markPencil',stage,layer,toolConfig})
    },
    changePencilColor(color){
      this.activePencilColor=color
    },
    changePencilWidth(width){
      this.activePencilWidth=width
    },
    active(){
      this.changePencilTool(this.activePencilTool)
    }
  }
}
</script>

<style lang="scss" src="./ToolBar.scss" scoped></style>  
