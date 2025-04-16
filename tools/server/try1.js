
class try1 {
	constructor(i1) {
		console.log("here1 "+ i1);
	}
}

class try2 extends try1 {
	constructor(i1) {
		super(i1)
		console.log("here2")
	}
}

var t= new try2()




