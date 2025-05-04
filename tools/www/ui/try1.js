////
require('./utils.js')



function try1() {
	
}
dclass(try1,{}, {
	override:{
		_x:true
	},
	prototype:{
		_x:123,
		get x() {
			return this._x
		},
		func:function() {
			console.log(this.y)
		}
	}
}) 




function try2() {
	
}
dclass(try2, {try1:try1}, {
	prototype:{
		y:4444,
		//_x:333333
	}
})




var t2 = new try2()
console.log("x " + t2.x)
t2.func()
//t2.func()

//*/