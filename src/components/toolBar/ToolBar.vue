<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2019-12-24 17:17:41
@version 1.0.0
-->
<template>
  <div class="toolbar">
    <div
      class="left part"
      v-if="isSimple"
    >
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
            <div class="tool-control row">
              <div
                v-for="(pencilTool,index) in pencilToolArr"
                :Key="index"
                :class="{'item-wrapper':true,'active-item':activePencilTool===pencilTool.name}"
              >
                <span><i :class="['iconfont',pencilTool.icon]"></i></span>
              </div>
            </div>
            <div class="color-control row">
              <div
                v-for="(color,index) in pencilColorArr"
                :key="index"
                :class="{'item-wrapper':true,'active-item':activePencilColor===color}"
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
                v-for="(radius,index) in radiusArr"
                :key="index"
                :class="{'item-wrapper':true,'active-item':activePencilWidth===radius}"
              >
                <span
                  class="cirlce"
                  :style="{width:`${radius}vw`,height:`${radius}vw`,'border-radius':`${radius/2}vw`,backgroundColor:`${activePencilColor}`}"
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
                v-for="(radius,index) in radiusArr"
                :key="index"
                :class="{'item-wrapper':true,'active-item':activeEraserWidth===radius}"
              >
                <span
                  class="circle"
                  :style="{width:`${radius}vw`,height:`${radius}vw`,'border-radius':`${radius/2}vw`}"
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

export default {
  props: {
    //简单模式，没有左边的工具
    isSimple: {
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
      radiusArr: [0.4, 0.6, 1, 1.2, 1.6],
      pencilToolArr: [
        {
          name: 'icon-gangbi',
          icon: 'icon-gangbi',
        },
        {
          name: 'icon-makebi',
          icon: 'icon-makebi',
        },
        {
          name: 'icon-arrow',
          icon: 'icon-arrow',
        }
      ],
      activePencilTool: 'icon-gangbi',
      activePencilColor: '#000',
      activePencilWidth: 1,

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
  mounted() {

  },
  methods: {
    uploadSuccess({ data, ret }) {
      if (0 == ret.retCode) {
        let filePath = data.filePath
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.toolbar {
  position: relative;
  display: flex;
  padding: 0.5vw;
  .center {
    display: flex;
    margin: auto;
    max-width: 100%;
    background: #f3f4f7;
    border-radius: 8px;
    box-shadow: 0 0 6px #919191;
    .group {
      &:not(:last-child) {
        border-right: 1px solid #999;
      }
      display: flex;
      li {
        position: relative;
        padding: 0.5vw 1vw;
        height: 2vw;
        overflow: hidden;
        .iconfont {
          font-size: 2vw;
        }
        &:hover {
          overflow: visible;
        }
        cursor: pointer;
      }
      .menu {
        position: absolute;
        bottom: 4vw;
        left: 50%;
        text-align: center;
        max-width: 24vw;
        transform: translateX(-50%);
        background: #f3f4f7;
        padding: 1vw;
        &::before {
          position: absolute;
          bottom: -2vw;
          left: 50%;
          transform: translateX(-50%);
          content: "";
          display: block;
          height: 0;
          width: 0;
          border: 1vw solid transparent;
          border-top: 1vw solid #f3f4f7;
        }
        .row {
          display: flex;
          justify-content: space-between;
          &:not(:first-child) {
            margin-top: 0.5vw;
          }
          .item-wrapper {
            box-sizing: border-box;
            width: 3vw;
            height: 3vw;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 3px solid transparent;
            &.active-item,
            &:hover {
              border: 0.2vw solid #f48924;
              border-radius: 0.3vw;
            }
          }
        }
      }
      .pencil {
        #preview-canvas {
          background: #fff;
          width: 100%;
          height: 10vw;
          border-radius: 0.5vw;
        }
        .tool-control {
          justify-content: space-around;
          .item-wrapper {
            flex-grow: 0;
          }
          .iconfont {
            font-size: 2vw;
            margin: 0.2vw 1vw;
          }
        }
        .color-control {
          .circle {
            display: inline-block;
            width: 1.4vw;
            height: 1.4vw;
            border-radius: 0.7vw;
          }
        }
        .width-control {
          .width-level {
            width: 3vw;
            height: 3vw;
            box-sizing: border-box;
            line-height: 3vw;
            font-size: 1.5vw;
            flex: 1;
            background-color: #fff;
            border-radius: 8px;
          }
        }
      }
      .eraser {
        .width-control {
          .width-level {
            width: 3vw;
            height: 3vw;
            box-sizing: border-box;
            line-height: 3vw;
            font-size: 1.5vw;
            flex: 1;
            background-color: #fff;
            border-radius: 8px;
          }
        }
        .circle {
          display: inline-block;
          background: #000;
        }
      }
    }
  }
  .part {
    position: absolute;
    > span {
      display: inline-block;
      cursor: pointer;
      background: #f3f4f7;
      padding: 0.5vw;
      border-radius: 8px;
      height: 2vw;
      box-shadow: 0 0 6px #919191;
      &:not(:first-child) {
        margin-left: 1vw;
      }
      .iconfont {
        font-size: 2vw;
      }
    }
  }
  .left {
    left: 5vw;
  }
  .right {
    right: 5vw;
  }
}
</style>
