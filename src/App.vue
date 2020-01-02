<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
import { throttle } from 'throttle-debounce';

export default {
  name: 'app',
  mounted() {
    window.onresize = throttle(300, () => {
      this.$root.$emit('resize');
    });
  },
};
</script>

<style lang="scss" scoped>
#app {
  height: 100%;
}
</style>
