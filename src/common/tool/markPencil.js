import konva from "konva";

function create(params) {
	const {stage, layer, toolConfig}=params
	let line
	stage.on("mousedown", function({ evt }) {
		const graphicProp = {
		stroke: toolConfig.color,
		strokeWidth: toolConfig.lineWidth,
		lineJoin: "round",
		lineCap: "round",
		globalCompositeOperation: "source-over",
		points: [evt.offsetX, evt.offsetY],
		bezier:true
		};
		line = new konva.Line(graphicProp)
		layer.add(line);

		stage.on("mousemove", function({ evt }) {
			line.points(line.points().concat(evt.offsetX, evt.offsetY))
			layer.draw()
		})

		//清除事件
		stage.on("mouseup", function() {
		stage.off("mousemove")
		stage.off("mouseup")
		});
	});
}

function destroy(stage){
	stage.off('mousedown')
}

export default {
  create,
  destroy
};
