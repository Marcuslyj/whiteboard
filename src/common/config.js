import Vue from 'vue'

export default Vue.observable({
  meetingId: null,
  whiteboardId: null,
  documentId: null,
  documentPath: null,
  isSpeaker: true,
  // 主讲屏大小
  speakerSize: {},
  // 第一笔绘制时的基准宽度
  baseWidth: '',
  // 画布拖动
  stageXy: {},
  // 跟基准值的缩放比
  scale: 1,
  board: null,
  layerIds: {
    BG_LAYER: 'BG_LAYER',
    TEXT_LAYER: 'TEXT_LAYER',
    REMARK_LAYER: 'REMARK_LAYER',
  },
  layerManager: {},
  // 组件管理，用于撤退还原
  cacheGraphics: [],
  activeTool: 'pen',
  pencil: {
    activePencilTool: 'pen',
    color: '#000',
    lineWidth: 14,
  },
  eraser: {
    activeEraserTool: 'eraser',
    lineWidth: 14,
    color: '#fff',
  },
  text: {
    color: '#f00',
    fontSize: 14,
  },
  convertCanvas: null,
  // board 和 document两种模式
  mode: 'board',
})
