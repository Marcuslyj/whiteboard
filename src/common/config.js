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
  lastSpeakerSize: {},
  // 画布拖动
  stageXy: {},
  // 跟基准值的缩放比
  scale: 1,
  // 是否有有效组件
  hasValidComponent: false,
  board: null,
  layerIds: {
    BG_LAYER: 'BG_LAYER',
    TEXT_LAYER: 'TEXT_LAYER',
    REMARK_LAYER: 'REMARK_LAYER',
  },
  layerManager: {},
  // 缓存队列管理，用于撤销还原,直接存toObject() 的数据,所以不用component 命名
  cacheGraphics: [],
  activeTool: 'pen',
  pencil: {
    activePencilTool: 'pen',
    color: '#333333',
    lineWidth: 14,
  },
  eraser: {
    activeEraserTool: 'eraser',
    lineWidth: 14,
    color: '#fff',
  },
  text: {
    color: '#333333',
    fontSize: 14,
  },
  convertCanvas: [],
  // board 和 document两种模式
  mode: 'board',
  toggleRouter: false,
  syncAction: null,
})
