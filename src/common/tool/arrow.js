import Konva from "Konva";
import Vue from 'vue';
import {generateUID} from '@common/utils';

function create(params) {
	const {stage, layer}=params;
	let isPainting=false;
	let arrow;
	let twoPois=[];
	stage.on("mousedown touchstart", function() {
		isPainting=true;
		twoPois[0]=stage.getPointerPosition();
	});
	stage.on("mousemove touchmove",function(){
		if(!isPainting) return;
		twoPois[1]=stage.getPointerPosition();
		const toolConfig=Vue.prototype.$globalConf.pencil;
		const arrowConfig = {
			id:generateUID(),
			pointerLength: 12,
			pointerWidth: 12,
			strokeWidth:toolConfig.lineWidth,
			fill: toolConfig.color,
			stroke: toolConfig.color,
			points: [twoPois[0].x, twoPois[0].y, twoPois[1].x, twoPois[1].y],
		};
		if(arrow){
			arrow.points([twoPois[0].x, twoPois[0].y, twoPois[1].x, twoPois[1].y]);
			layer.add(arrow);
		}
		else{
			arrow= new Konva.Arrow(arrowConfig);
		}
		layer.draw();
	});
	stage.on("mouseup touchend",function(){
		isPainting=false;
		twoPois=[];
		arrow=null;
	});
}

function destroy(params){
	const {stage}=params;
	stage.off('mousedown touchstart');
	stage.off("mousemove touchmove");
	stage.off("mouseup touchend");
}

export default {
  create,
  destroy
};

