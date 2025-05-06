////
require('./utils.js')



function try1() {
	
}
dclass(try1,{}, {
	override:{
		_x:true, 
		hi:true
	},
	prototype:{
		_x:123,
		get x() {
			return this._x
		},
		func:function() {
			console.log(this.y)
		}, 
		hi:function() {
			throw new Error("need to override hi function")
		}
	}
}) 




function try2() {
	
}
dclass(try2, {try1:try1}, {
	override:{
		hi:true
	},
	prototype:{
		y:4444,
		//_x:333333
		hi:function() {
			console.log("hi try2")
		}
	}
})

function try3() {
	
}
dclass(try3,{try2:try2}, {
	prototype:{
		hi:function() {
			this.try2Super.prototype.hi.apply(this)
			console.log("hi try3")
		}
	}
})



var t2 = new try2()
console.log("x " + t2.x)
t2.func()

var t3 = new try3()
t3.hi()