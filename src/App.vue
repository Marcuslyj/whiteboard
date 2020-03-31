<template>
  <div id="app">
    <router-view></router-view>
    <div v-if="mask" class="mask"></div>
  </div>
</template>

<script>
import { throttle } from 'throttle-debounce'
import Vue from 'vue'

export default {
  name: 'app',
  data() {
    return {
      mask: false,
    }
  },
  created() {
    this.$root.showMask = this.showMask.bind(this)
  },
  mounted() {
    window.onresize = throttle(300, () => {
      Vue.eventBus.$emit('resize')
    })
  },
  methods: {
    showMask(show) {
      this.mask = show
    },
  },
}
</script>

<style lang="scss" scoped>
#app {
  height: 100%;
  .mask{
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.13);
  }
}
</style>
