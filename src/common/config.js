import Vue from 'vue';

export default Vue.observable({
    board: null,
    layerIds: {
        BG_LAYER: 'BG_LAYER',
        TEXT_LAYER: 'TEXT_LAYER',
        REMARK_LAYER: 'REMARK_LAYER'
    },
    layerManager: {},
    //组件管理，用于撤退还原
    graphics:[],
    pencil:{
        activePencilTool:'pen',
        color:'#000',
        lineWidth:6,
    },
    eraser:{
        activeEraserTool:'eraser',
        lineWidth:6,
        color:'#fff'
    }
    
});
