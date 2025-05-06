///-----



function try1( ) {
	//console.log(hi)
	console.log("here1")
}


try1.prototype.func=function() {
	//console.log(hi)
}


function newTry1() {
	const ret = new try1()
	return ret
}


newTry1()
newTry1()