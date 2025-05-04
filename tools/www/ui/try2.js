///-----
var try1={
	
	y:123,
	get x() {
		return this.y
	},
	set x(v) {
		this.y =v
	}
}

const stringKeys = Object.getOwnPropertyNames(try1)
const symbolKeys = Object.getOwnPropertySymbols(try1)
const allKeys = [...stringKeys, ...symbolKeys]

allKeys.forEach((key) => {
	
	console.log(key)
	
})




