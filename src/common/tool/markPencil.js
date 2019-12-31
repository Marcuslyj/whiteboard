import Konva from "Konva";
import Vue from 'vue';
import {generateUID} from '@common/utils';

function create(params) {
	const {stage, layer}=params;
	let line;
	let isPainting=false;
	stage.on("mousedown touchstart", function() {
		isPainting=true;
		const poi=stage.getPointerPosition();
		const toolConfig=Vue.prototype.$globalConf.pencil;
		const lineConfig = {
			id:generateUID(),
			stroke:toolConfig.color,
			strokeWidth: toolConfig.lineWidth,
			lineJoin: "round",
			lineCap: "round",
			globalCompositeOperation: "source-over",
			points: [poi.x, poi.y],
			bezier:true
		};
		line = new Konva.Line(lineConfig);
		layer.add(line);
		stage.on("mousemove touchmove", function() {
			if(!isPainting){
				return;
			}
			const poi=stage.getPointerPosition();
			line.points(line.points().concat(poi.x, poi.y));
			layer.draw();
		});
	
		//清除事件
		stage.on("mouseup touchend", function() {
			isPainting=false;
			line=null;
		});
	});


}

function destroy(params){
	console.log('pen destroy')
	const {stage}=params;
	stage.off('mousedown touchstart');
	// stage.off("mousemove touchmove");
	// stage.off("mouseup touchend");
}

export default {
  create,
  destroy
};
