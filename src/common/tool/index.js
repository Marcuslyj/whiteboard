
import Vue from 'vue'
import markPencil from './markPencil'

const toolCollection={
	markPencil
}

export const initTool=()=>{
	Vue.eventBus.$on('active-tool',function({toolName,...params}){
		toolCollection[toolName].create(params)
	})

	Vue.eventBus.$on('deactive-tool',function({toolName,...params}){
		toolCollection[toolName].destroy(...params)
	})
}
