
import Vue from 'vue'
import markPencil from './markPencil'
import arrow from './arrow'
import pen from './pen'
import eraser from './eraser'
import clearBoard from './clearBoard'
import deleteGraphic from './deleteGraphic'


const toolCollection={
	markPencil,
	arrow,
	pen,
	eraser,
	clearBoard,
	deleteGraphic
};

export const initTool=()=>{
	Vue.eventBus.$on('active-tool',function({toolName,...params}){
		toolCollection[toolName].create(params);
		console.log(`initTool:${toolName}`)
	});

	Vue.eventBus.$on('deactive-tool',function({toolName,...params}){
		toolCollection[toolName].destroy&&toolCollection[toolName].destroy(params);
		console.log(`destroyTool:${toolName}`)
	});
};
