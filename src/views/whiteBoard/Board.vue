<template>
  <div class="wrapper">
        <whiteboard v-if="$globalConf.toggleRouter" key='0'></whiteboard>
        <whiteboard v-if="!$globalConf.toggleRouter" key='1'></whiteboard>
  </div>
</template>

<script>
import whiteboard from './WhiteBoard'

export default {
  name: '',
  components: { whiteboard },
}
</script>

<style lang="scss" scoped>
.wrapper {
    height: 100%;
}
</style>
