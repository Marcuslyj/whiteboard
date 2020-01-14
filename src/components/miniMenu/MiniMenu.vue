<!--
Description 组件旁边的便捷工具栏（选中，文字编辑时）
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2020-01-09 10:02:43
@version 1.0.0
-->
<template>
  <div ref="menu" class="mini-menu" :style="[miniStyle]">
    <!-- 选中时只修改当前组件，编辑时修改全局 -->
    <Row v-show="type==='edit-text'||type==='select-text'" class="mini-menu-inner">
        <Poptip placement="top" class="poptip-body menu-item">
             <i class="iconfont icon-circle" :style="{'color':activeColor}"></i>
             <div slot="content">
                 <ul class="color hor">
                    <li v-for="(item,index) in colors" :key="index" @click="changeColor(item)">
                        <span><i class="iconfont icon-circle" :style="{color:item}"></i></span>
                    </li>
                 </ul>
             </div>
        </Poptip>
         <Poptip placement="top" class="poptip-body menu-item">
             <i class="iconfont icon-text-size" ></i>
             <div slot="content">
                <ul class="hor fontSize-list">
                   <li v-for="(item,index) in fontSizes" :key="index" @click="changeSize(item)">
                        {{item}}
                    </li>
                </ul>
             </div>
        </Poptip>
        <div class="menu-item" @click="del">
            <i class="iconfont icon-menu-delete"></i>
        </div>
        <div class="menu-item" @click="copy">
            <i class="iconfont icon-copy"></i>
        </div>
    </Row>
    <Row v-show="type==='select'" class="mini-menu-inner">
        <div class="menu-item">
          <i class="iconfont icon-menu-delete"></i>
        </div>
         <Poptip placement="top" class="poptip-body menu-item">
             <i class="iconfont icon-circle" :style="{'color':activeColor}"></i>
             <div slot="content">
                 <ul class="color hor">
                    <li v-for="(item,index) in colors" :key="index" @click="changeSize(item)">
                        <span><i class="iconfont icon-circle" :style="{color:item}"></i></span>
                    </li>
                 </ul>
             </div>
        </Poptip>
        <div class="menu-item">
            <i class="iconfont icon-copy"></i>
        </div>
    </Row>
  </div>
</template>

<script>
import config from '@common/config'
import textTool from '@common/tool/text'

export default {
  props: ['type', 'miniStyle', 'textColor'],
  data() {
    return {
      activeColor: '',
      menuname: '',
      colors: ['#333333', '#d81e06', '#f4ea2a', '#0abf53', '#1296db'],
      fontSizes: [8, 10, 12, 16, 22],
    }
  },
  watch: {
    textColor(val) {
      this.activeColor = val || '#333333'
    },
  },
  methods: {
    changeColor(color) {
      this.activeColor = color
      config.text.color = color
      document.querySelector('.editor-textarea').style.color = color
      document.querySelector('.editor-textarea').focus()
    },
    changeSize(size) {
      config.text.fontSize = size
      document.querySelector('.editor-textarea').style.fontSize = `${size}px`
      document.querySelector('.editor-textarea').focus()
    },
    copy() {
      textTool.copy()
    },
    del() {
      textTool.del()
    },
  },
}
</script>

<style lang="scss" scoped>
.mini-menu{
  display: none;
  .mini-menu-inner{
    display:flex;
    padding:10px;
    border-radius:0.3vw;
    box-shadow: 0 0 6px #919191;
    background:#f0f0f0;
    .iconfont{
      font-size:2vw;
    }
    .menu-item{
      cursor: pointer;
      &:not(:first-child){
        margin-left:10px;
      }
    }
    .poptip-body{
      display: flex;
      /deep/ .hor{
        display: flex;
        justify-content: space-around
      }
    }
  }
}
</style>
