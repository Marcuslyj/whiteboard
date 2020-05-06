<!--
Description 2 期工具条
@authors fanjiongrong (fanjiongrong@tvflnet.com)
@date    2020-05-06 10:27:41
@version 1.0.0
-->
<template>
  <div class="tools">
    <ul :class="`${position}-ul`">
      <li>
        <Tooltip content="拖动" placement="top">
          <i class="iconfont icon-shou"></i>
        </Tooltip>
      </li>
      <li>
        <Tooltip content="指针" placement="top">
          <i class="iconfont icon-select"></i>
        </Tooltip>
      </li>
      <li>
        <Tooltip content="画笔" placement="top">
          <i class="iconfont icon-pen"></i>
        </Tooltip>
      </li>
      <li>
        <Tooltip content="激光笔" placement="top">
          <i class="iconfont icon-jiguangbi"></i>
        </Tooltip>
      </li>
      <li>
        <Poptip trigger="click" :placement="position==='hr'?'top':'left'" class="poptip-body menu-item">
            <Tooltip content="橡皮" placement="top"><div class="icon-btn"><i class="iconfont icon-eraser"></i></div></Tooltip>
            <div slot="content" class="pop-content">
                <div class="icon-btn">
                    <i class="iconfont icon-xiangpi1"></i>
                </div>
                <div class="icon-btn">
                    <i class="iconfont icon-juxing"></i>
                </div>
                <div class="icon-btn">
                    <i class="iconfont icon-qingchu"></i>
                </div>
            </div>
        </Poptip>
      </li>
      <li>
        <Tooltip content="文本框" placement="top">
          <i class="iconfont icon-text"></i>
        </Tooltip>
      </li>
      <li>
        <Tooltip content="粗细" placement="top">
          <i class="iconfont icon-cuxi"></i>
        </Tooltip>
      </li>
         <li>

           <Poptip trigger="click" :placement="position==='hr'?'top':'left'" class="poptip-body menu-item">
           <Tooltip content="图形" placement="top"><div class="icon-btn"><i class="iconfont icon-juxing1"></i></div></Tooltip>
            <div slot="content" class="pop-content">
                <div class="icon-btn">
                    <i class="iconfont icon-juxing"></i>
                </div>
                <div class="icon-btn">
                    <i class="iconfont icon-yuan"></i>
                </div>
                <div class="icon-btn">
                    <i class="iconfont icon-line"></i>
                </div>
                <div class="icon-btn">
                    <i class="iconfont icon-arrow"></i>
                </div>
            </div>
        </Poptip>
        <!-- </Tooltip> -->
      </li>
      <li>
        <Tooltip content="截屏" placement="top">
            <i class="iconfont icon-clip"></i>
        </Tooltip>
      </li>
      <li>
           <Tooltip content="导入文档" placement="top">
            <Upload
              :action="common.api.upload"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              :format="['pdf', 'doc', 'docx', 'ppt', 'pptx']"
              :before-upload="beforeUpload"
              :on-success="uploadSuccess"
              :data="{ fbId: common.fbId.upload }"
              :show-upload-list="false"
            >
            <i class="iconfont icon-upload"></i>
            </Upload>
           </Tooltip>
      </li>
    </ul>
  </div>
</template>

<script>
import { Upload, Message } from 'view-design'
import common, { api, fileService, socketEvent } from '@common/common'

export default {
  components: {
    Upload,
  },
  props: {
    position: {
      type: String,
      defalut: 'hr',
    },
  },
  data() {
    return {
      common,
      MsgUploading: null,
    }
  },
  methods: {
    beforeUpload() {
      // 遮罩
      this.$root.showMask(true)
      this.MsgUploading = this.MsgUploading || []
      this.MsgUploading.push(
        Message.loading({
          content: '上传中...',
          duration: 0,
        }),
      )
      return true
    },
    uploadSuccess(res) {
      if (this.MsgUploading.length) this.MsgUploading.pop()()
      this.$emit('uploadSuccess', res)
    },
  },
}
</script>

<style lang="scss" scoped src="./FlTools.scss"></style>
