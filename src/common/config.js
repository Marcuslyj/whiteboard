import Vue from 'vue';

export default Vue.observable({
    board:null,
    layerIds:{
        DOC_ENTRY_LAYER:'DOC_ENTRY_LAYER',
        TEXT_LAYER:'TEXT_LAYER',
        DOC_BG_LAYER:'DOC_BG_LAYER',
        REMARK_LAYER:'REMARK_LAYER'
    },
    layerManager:{},
    //组件管理，用于撤退还原
    graphics:[],
    pencil:{
        activePencilTool:'markPencil',
        color:'#000',
        lineWidth:6,
    },
    
});