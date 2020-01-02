import Vue from 'vue';

export default Vue.observable({
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
});
