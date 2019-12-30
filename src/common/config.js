import Vue from 'vue'

export default Vue.observable({
    board: null,
    layerIds: {
        BG_LAYER: 'BG_LAYER',
        TEXT_LAYER: 'TEXT_LAYER',
        REMARK_LAYER: 'REMARK_LAYER'
    },
    layerManager: {},
})