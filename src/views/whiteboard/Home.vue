<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2020-05-04 09:57:01
@version 1.0.0
-->
<template>
  <div>
    <header>
      <div class="left">
        <Icon type="ios-arrow-back" @click="goback"/>
        <span class="theme">会议主题会议主题会议主题会议主题会议主题会议主题</span>
        <i class="sp"></i>
        <Tooltip content="白板" placement="bottom-end"><div class="btn" :class="{active:$globalConf.mode==='board'}" @click="changeMode('board')"><i class="iconfont icon-baiban"></i></div></Tooltip>
        <Tooltip content="文档" placement="bottom-end"><div class="btn" :class="{active:$globalConf.mode==='doc'}" @click="changeMode('doc')"><i class="iconfont icon-doc"></i></div></Tooltip>
        <Tooltip content="撤销" placement="bottom-end"><div class="btn"><i class="iconfont icon-chexiao"></i></div></Tooltip>
        <Tooltip content="还原" placement="bottom-end"><div class="btn"><i class="iconfont icon-huitui"></i></div></Tooltip>
      </div>
      <div class="right lg-w">
        <Tooltip content="开始演示" placement="bottom-end"><div class="btn"><i class="iconfont icon-kaishi"></i></div></Tooltip>
        <Tooltip content="保存文档" placement="bottom-end"><div class="btn"><i class="iconfont icon-save"></i></div></Tooltip>
        <Tooltip content="文档列表" placement="bottom-end"><div class="btn"><i class="iconfont icon-wendangguanli"></i></div></Tooltip>
        <Tooltip content="邀请" placement="bottom-end"><div class="btn"><i class="iconfont icon-yaoqing"></i></div></Tooltip>
        <Tooltip content="用户" placement="bottom-end"><div class="btn"><i class="iconfont icon-yonghuliebiao"></i></div></Tooltip>
        <Tooltip content="日志" placement="bottom-end"><div class="btn"><i class="iconfont icon-shijian"></i></div></Tooltip>
      </div>
      <div class="right mini-w" >
        <Dropdown trigger="click" placement="bottom-end">
          <div class="btn">
            <Icon type="ios-apps-outline" />
          </div>
          <DropdownMenu slot="list" >
              <DropdownItem>
                <div class="menu-c"><i class="iconfont icon-kaishi"></i>演示</div>
              </DropdownItem>
              <DropdownItem>
                <div class="menu-c"><i class="iconfont icon-save"></i>保存</div>
              </DropdownItem>
              <DropdownItem>
                <div class="menu-c"><i class="iconfont icon-wendangguanli"></i>文档</div>
              </DropdownItem>
              <DropdownItem>
                <div class="menu-c"><i class="iconfont icon-yaoqing"></i>邀请</div>
              </DropdownItem>
              <DropdownItem>
                <div class="menu-c"><i class="iconfont icon-yonghuliebiao"></i>用户</div>
              </DropdownItem>
               <DropdownItem>
                <div class="menu-c"><i class="iconfont icon-shijian"></i>日志</div>
              </DropdownItem>

          </DropdownMenu>
        </Dropdown>
     </div>
    </header>
    <section class="main">
      <div class="canvas-main drawingboard-wrapper" v-show="$globalConf.mode==='board'">
        <drawingboard></drawingboard>
      </div>
      <div class="canvas-main doc-wrapper" v-show="$globalConf.mode==='doc'">
        <doc></doc>
      </div>
    </section>
  </div>
</template>

<script>
import drawingboard from '@/views/whiteboard/drawingboard/Drawingboard'
import doc from '@/views/whiteboard/doc/Doc'

export default {
  components: {
    drawingboard,
    doc,
  },
  methods: {
    changeMode(mode) {
      this.$globalConf.mode = mode
    },
    goback() {
      this.$router.push({ name: 'myMeeting' })
    },
  },
}
</script>

<style lang="scss" scoped>
header{
  height:60px;
  box-shadow:0 1px 1px rgba(0,0,0,.08);
  position:relative;
  padding:0 30px;
  .left{
    height:100%;
    display:flex;
    align-items: center;
    .theme{
      line-height:100%;
      display:inline-block;
      font-size:18px;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
      max-width:200px;
      font-weight:600;
      color:#333;
    }
    .sp{
      display:inline-block;
      height:28px;
      width:1px;
      background:#8a8a8a;
      margin:0 10px;
    }
  }
  .btn{
    width:43px;
    height:43px;
    text-align: center;
    line-height:43px;
    cursor: pointer;
    &.active{
      background:#16c2c2;
    }
  }
  .ivu-icon,.iconfont{
    font-size:23px;
     &:hover{
      color:#16c2c2;
    }
  }
  .right{
    position:absolute;
    right:50px;
    top:0px;
    height:100%;
    display: flex;
    align-items: center;
  }
  .mini-w{
    display: none;
    right:10px;
    /deep/ .ivu-dropdown{
      .ivu-icon{
        line-height:unset;
      }
      .menu-c{
        display: flex;
        align-items: center;
        .iconfont{
          margin-right:10px;
          font-size:18px;
        }
      }
    }
  }
}
footer{
  position:fixed;
  bottom:0;
  left:0;
  right:0;
  height:60px;
}

.main{
  height:calc(100vh - 65px);
  .canvas-main{
    height:100%;
  }
}

@media screen and(max-width:760px) {
  header{
    padding:0 10px;
    .lg-w{
      display: none;
    }
    .mini-w{
      display: flex;
    }
  }
}
@media screen and(max-width:500px) {
  .theme{
    display: none !important;
  }
}
</style>
