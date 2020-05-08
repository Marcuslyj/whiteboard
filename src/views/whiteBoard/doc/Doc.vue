<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2020-05-04 09:57:48
@version 1.0.0
-->
<template>
  <div class="doc">
    <div class="main">
       <div class="no-doc" v-if="$globalConf.docs.length===0">
        <Icon type="ios-add-circle" />
       </div>
       <div class="has-doc" v-else>

       </div>
    </div>
    <footer>
      <div class="left"></div>
      <div class="center lg-w">
        <fl-tools position="hr"></fl-tools>
      </div>
      <div class="right">
        <div class="icon-btn" @click="handleFullscreen">
          <i class="iconfont" :class="[`icon-${$globalConf.isFullscreen ? 'normalscreen' : 'fullscreen'}`]"></i>
        </div>
      </div>
    </footer>
    <div class="mini-w vertical-tool">
        <fl-tools position="vertical"></fl-tools>
    </div>
  </div>
</template>

<script>
import flTools from '@/components/fl-tools/FlTools'
import { fullscreen, exitFullscreen } from '@common/utils'

export default {
  data() {
    return {}
  },
  components: {
    flTools,
  },
  methods: {
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

<style lang="scss" scoped>
  @import '@/styles/variable.scss';
  .doc{
    height:100%;
    display: flex;
    flex-direction: column;
    .main{
      flex:1;
      .no-doc{
        width:70%;
        height:100%;
        margin:0 auto;
        display: flex;
        justify-content: center;
        align-items: center;
        background:#eee;
        .ivu-icon{
          font-size:20vmin;
          cursor: pointer;
          color:$theme-color;
          &:hover{
            color:#333;
          }
        }
      }
    }
    footer{
      display:flex;
      justify-content: space-between;
      padding:10px;
      .right{
        .icon-btn{
           border:1px solid #eee;
           border-radius: 4px;
        }
      }
    }
    .vertical-tool{
      position: fixed;
      right:10px;
      top:75px;
    }
    .mini-w{
      display: none;
    }
  }
  @media screen and(max-width: 600px){
    .doc{
      .lg-w{
        display: none;
      }
      .mini-w{
        display: block;
      }
    }
  }
</style>
