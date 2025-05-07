////
require('./utils.js')


const try1 =mclass({
	expandable:{
		obj:true
	},
	override:{
		x:true
	},
	prototype: {
		x:111,
		obj:[1]
	}
})


const try2 = mclass({
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
		obj:[2]
	}
})


const try3 = mclass({
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
		obj:["bla"],
		out() {
			for(var i in this.obj) {
				console.log(i +":" + this.obj[i])
			}
		}
		
	}
})

var t = new try3()
t.out()


//*/

console.log("done")
