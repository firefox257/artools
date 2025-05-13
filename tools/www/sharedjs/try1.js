////
require('./utils.js')


const try1 =mclass({
	className:"try1",
	expandable:{
		obj:true
	},
	override:{
		x:true
	},
	prototype: {
		x:111,
		init(x, y){
			console.log("init try1 x:"+ x+ " y:"+y)
		},
		obj:{
			x:0,
			y:0
		}
	}
})


const try2 = mclass({
	className:"try2",
	expandable:{
		obj:true
	},
	override:{
		x:true
	},
	sources: {
		try1:try1
	},
	prototype: {
		x:222, 
		init(){
			try1.prototype.init.apply(this, arguments)
			console.log("init try2")
		},
		obj:{
			title:"title"
		}
	}
})


const try3 = mclass({
	className:"try3",
	expandable:{
		obj:true
	},
	override:{
		x:true
	},
	sources: {
		try2:try2
	},
	prototype: {
		x:333,
		obj:{},
		init(){
			try2.prototype.init.apply(this, arguments)
			console.log("init try3")
		},
		out() {
			for(var i in this.obj) {
				console.log(i +":" + this.obj[i])
			}
		}
		
	}
})

var t = new try3(22,33)
t.out()

class ttry1 {
	
}
var tt = new ttry1

console.log(t.constructor.className)

//*/

console.log("done")
