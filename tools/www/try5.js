//const {hi} = require("./try6.js")



function loadMod(mod) {
	return require(mod)
}


const {hi } = loadMod("./try6.js")

hi()

console.log(tttt)
/*
function try1() {
	var x = 123
	var y = 444
	return{ x:x, y:y}
}

const {x, y} = try1()

console.log(x)
console.log(y)

console.log("done")
*/
