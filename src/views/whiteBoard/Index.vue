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
        <Icon type="ios-arrow-back" />
        <span class="theme">会议主题会议主题会议主题会议主题</span>
        <i class="sp"></i>
        <i class="iconfont icon-baiban"></i>
        <i class="iconfont icon-doc"></i>
        <i class="iconfont icon-chexiao"></i>
        <i class="iconfont icon-huitui"></i>
      </div>
      <div class="right">
        <i class="iconfont icon-kaishi"></i>
        <i class="iconfont icon-save"></i>
        <i class="iconfont icon-wendangguanli"></i>
        <i class="iconfont icon-yaoqing"></i>
        <i class="iconfont icon-yonghuliebiao"></i>
        <i class="iconfont icon-shijian"></i>
      </div>
    </header>
    <router-view></router-view>
    <Footer>工具栏</Footer>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
  header{
    height:5vh;
    min-height:60px;
    box-shadow:0 1px 1px rgba(0,0,0,.08);
    position:relative;
    padding:0 2vw;
    .left{
      height:100%;
      display:flex;
      align-items: center;
      .theme{
        line-height:100%;
        display:inline-block;
        font-size:1.5vh;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
        max-width:20vw;
        font-weight:600;
        color:#333;
      }
      .sp{
        display:inline-block;
        height:2vh;
        width:1px;
        background:#8a8a8a;
        margin:0 1vh;
      }
      .icon-baiban,.icon-doc{
        font-size:3vh;
      }
    }
    .ivu-icon,.iconfont{
      font-size:2vh;
      margin-right:2vh;
    }
    .iconfont{
      font-size:2.3vh;
      cursor: pointer;
      &:hover{
        color:#16c2c2;
      }
    }
    .right{
      position:absolute;
      right:2vw;
      top:0;
      height:100%;
      display: flex;
      align-items: center;
    }

  }
</style>
