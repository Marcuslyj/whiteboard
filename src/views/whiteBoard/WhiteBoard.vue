<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2019-12-24 09:34:21
@version 1.0.0
-->
<template>
  <div class="board-page">
    <section id="board-container"><i class="iconfont icon-jiami"></i>画板</section>
    <div class="tool-wrapper">
      <tool-bar class="tool"></tool-bar>
    </div>
  </div>
</template>

<script>
  import ToolBar from '@/components/toolBar/ToolBar'
  export default {
    components:{
      ToolBar
    }
  }
</script>

<style lang="scss" scoped>
  .board-page{
    position:relative;
    height:100%;
    display:flex;
    flex-direction: column;
    #board-container{ 
      background-color:#fff;
      flex:1;
      margin:10px 10px 0;
      border:1px solid #eee;
    }
    .tool-wrapper{
      margin:20px;
    }

  }

</style>
