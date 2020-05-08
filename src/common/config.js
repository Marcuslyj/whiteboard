import Vue from 'vue'

export default Vue.observable({
  // 房主
  owner: false,
  // 主讲权限
  speakerPermission: true,
  // 下载权限
  downloadPermission: false,
  // 文档
  docs: [],
  user: {},
  // 白板集合
  whiteboards: [],
  // 激活了第几个
  activeWhiteboardNum: 0,
  meetingId: null,
  theme: '',
  whiteboardId: null,
  documentId: null,
  documentPath: null,
  // 主讲屏大小
  speakerSize: {},
  // 第一笔绘制时的基准宽度
  baseWidth: '',
  lastSpeakerSize: {},
  // 画布拖动
  stageXY: {},
  // 跟基准值的缩放比
  scale: 1,
  // 是否有有效组件
  hasValidComponent: false,
  board: null,
  layerIds: {
    BG_LAYER: 'BG_LAYER',
    TEXT_LAYER: 'TEXT_LAYER',
    REMARK_LAYER: 'REMARK_LAYER',
    DRAW_LAYER: 'DRAW_LAYER',
    CUSTOM_CURSOR_LAYER: 'CUSTOM_CURSOR_LAYER',
  },
  layerManager: {},
  // 缓存队列管理，用于撤销还原,直接存toObject() 的数据,所以不用component 命名
  cacheGraphics: [],
  cPIndex: -1, // 操作缓存时游标位置
  activeTool: 'pan',
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
    fontSize: 20,
  },
  convertCanvas: [],
  // board 和 document两种模式
  mode: 'board',
  toggleRouter: false,
  syncAction: null,
  isFullscreen: false,
  // 转换画板数量
  convertCanvasCount: 1,
  // 当前whiteboard vue实例
  whiteboard: null,
  // 初始化完成标记
  initDone: false,
  // resize 标志
  resizeFlag: false,
})
