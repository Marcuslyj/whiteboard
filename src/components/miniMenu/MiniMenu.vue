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
                    <li v-for="(item,index) in colors" :key="index" @click="type==='select-text'?changeSelectColor(item):changeColor(item)">
                        <span><i class="iconfont icon-circle" :style="{color:item}"></i></span>
                    </li>
                 </ul>
             </div>
        </Poptip>
         <Poptip placement="top" class="poptip-body menu-item">
             <i class="iconfont icon-text-size" ></i>
             <div slot="content">
                <ul class="hor fontSize-list">
                   <li v-for="(item,index) in fontSizes" :key="index" @click="type==='select-text'?changeSelectSize(item):changeSize(item)">
                        {{item}}
                    </li>
                </ul>
             </div>
        </Poptip>
        <div class="menu-item" @click="type==='select-text'?selectDel():del()">
            <i class="iconfont icon-menu-delete"></i>
        </div>
        <div class="menu-item" @click="type==='select-text'?selectCopy():copy()">
            <i class="iconfont icon-copy"></i>
        </div>
    </Row>
    <!-- 选中时其他 -->
     <Row v-show="type==='select-others'" class="mini-menu-inner">
        <div class="menu-item" @click="selectDel">
          <i class="iconfont icon-menu-delete"></i>
        </div>
         <Poptip placement="top" class="poptip-body menu-item">
             <i class="iconfont icon-circle" :style="{'color':activeColor}"></i>
             <div slot="content">
                 <ul class="color hor">
                    <li v-for="(item,index) in colors" :key="index" @click="changeSelectColor(item)">
                        <span><i class="iconfont icon-circle" :style="{color:item}"></i></span>
                    </li>
                 </ul>
             </div>
        </Poptip>
        <div class="menu-item" @click="selectCopy">
            <i class="iconfont icon-copy"></i>
        </div>
    </Row>
  </div>
</template>

<script>
import config from '@common/config'
import textTool from '@common/tool/text'
import selectTool from '@common/tool/select'

export default {
  props: ['type', 'miniStyle', 'textColor'],
  data() {
    return {
      activeColor: config.text.color || '',
      menuname: '',
      colors: ['#333333', '#d81e06', '#f4ea2a', '#0abf53', '#1296db'],
      fontSizes: [12, 16, 20, 24, 30],
    }
  },
  watch: {
    textColor(val) {
      this.activeColor = val || '#333333'
    },
  },
  methods: {
    // 文字绘制
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

    // 选中
    changeSelectColor(color) {
      this.activeColor = color
      selectTool.changeColor(color)
    },
    changeSelectSize(size) {
      selectTool.changeFontsize(size)
    },
    selectDel() {
      selectTool.del()
    },
    selectCopy() {
      selectTool.copy()
    },


  },
}
</script>

<style lang="scss" scoped>
.mini-menu{
  display: none;
  .mini-menu-inner{
    display:flex;
    padding:5px;
    border-radius:0.3vw;
    box-shadow: 0 0 6px #919191;
    background:#fff;
    .iconfont{
      font-size:18px;
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
