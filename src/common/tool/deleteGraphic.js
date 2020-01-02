// 组件删除
import Konva from 'konva'

function create(params){
	const {stage,layer}=params
	stage.on('click',function(evt){
		if(evt.target===stage){
			return
		}
		stage.find('Transformer').destroy()
		var tr = new Konva.Transformer({
			node: evt.target,
			centeredScaling: true,
			rotationSnaps: [0, 90, 180, 270],
			resizeEnabled: false,
			rotateEnabled:false,
			padding:40
		});

		const label = new Konva.Label();

		//增加一个删除按钮
		label.add(new Konva.Tag({
			fill: '#fff',
			stroke: '#78c8f8',
			shadowColor: 'black',
			shadowBlur: 10,
			shadowOffset: [10, 10],
			shadowOpacity: 0.2,
			lineJoin: 'round',
			pointerDirection: 'none',
			pointerWidth: 20,
			pointerHeight: 20,
			cornerRadius: 2
		}));
		
		const text = new Konva.Text({
			fontSize: 30,
			text: "x",
			fill:'#333',
		});
		label.add(text)
		layer.add(tr)
		layer.add(label)
		layer.draw()
		label.position({
			x:tr.position().x+tr.width()+40-8,
			y:tr.position().y-40-15
		})

		label.on('mouseover',function(){
			label.getTag().fill('red')
			label.getText().fill('#fff')
			layer.draw()
		})
		label.on('mouseout',function(){
		label.getTag().stroke('#78c8f8')
		layer.draw()
		})
		label.on('click',function(){
		label.remove()
		tr.destroy()
		layer.draw()
		})

	})
}

function destroy(params){
	const {stage}=params
	stage.off('click')
	stage.find('Transformer').destroy()
}

export default{
	create,
	destroy
}