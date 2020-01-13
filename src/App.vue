<template>
  <div id="app">
    <router-view v-if="$globalConf.toggleRouter"></router-view>
    <router-view v-if="!$globalConf.toggleRouter"></router-view>
  </div>
</template>

<script>
import { throttle } from 'throttle-debounce'
import bus from '@common/eventBus.js'

export default {
  name: 'app',
  mounted() {
    window.onresize = throttle(300, () => {
      bus.$emit('resize')
    })
  },
}
</script>

<style lang="scss" scoped>
#app {
  height: 100%;
}
</style>
