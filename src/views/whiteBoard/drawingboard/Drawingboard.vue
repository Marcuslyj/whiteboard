<!--
Description
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2020-05-04 09:57:44
@version 1.0.0
-->
<template>
  <div class="board">
      <div class="board-container">
          111
      </div>
      <footer>
        <div class="left">
          <div class="board-btn">
            <span class="title">1/5</span>
            <div class="icon-btn" v-if="$globalConf.speakerPermission">
              <i class="iconfont icon-add"></i>
            </div>
          </div>
        </div>
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
  .board{
    height:100%;
    display: flex;
    flex-flow: column nowrap;
    .board-container{
      flex:1;
    }
    footer{
      display:flex;
      justify-content: space-between;
      padding:10px;
      // .left,.right{
      //   padding:5px 10px;
      // }
      .left{
        .board-btn{
          min-width:110px;
          border-radius:4px;
          padding:0 10px;
          border:1px solid #eee;
          cursor:pointer;
          .title{
            font-size:20px;
            margin-right:16px;
          }
        }
      }
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
    .board{
      .lg-w{
        display: none;
      }
      .mini-w{
        display: block;
      }
    }
  }
</style>
