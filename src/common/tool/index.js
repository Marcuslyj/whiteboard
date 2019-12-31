
import Vue from 'vue'
import markPencil from './markPencil'
import arrow from './arrow'
import pen from './pen'
import eraser from './eraser'


const toolCollection={
	markPencil,
	arrow,
	pen,
	eraser,
};

export const initTool=()=>{
	Vue.eventBus.$on('active-tool',function({toolName,...params}){
		toolCollection[toolName].create(params);
	});

	Vue.eventBus.$on('deactive-tool',function({toolName,...params}){
		toolCollection[toolName].destroy(params);
	});
};
