

class wobj {
	
	constructor() {
		console.log("wobj")
		console.log("is animated " + this.isAnimated())
	}
	isAnimated = () => false
}


class try1 extends wobj {
	constructor() {
		super()
		console.log("try1")
		console.log("is animated " + this.isAnimated())
	} 
	isAnimated=()=> true
}

var t = new try1()
console.log(t.isAnimated())

//*/
console.log("end")