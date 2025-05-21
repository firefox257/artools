////
require('./utils.js')


var Msgc = mclass({
	prototype: {
		init() {
			
		},
		add(name, func) {
			var call = ["_", name, "Calls"].join('')
			var self = this
			if(self[call] == undefined) {
				new Function(["self"], `
				self._${name}Calls = []
				self.${name} = function() {
					var a = this._${name}Calls
					var l = a.length
					for(var i = 0; i<l;i++) {
						a[i](...arguments)
					}
				}
			`)(self)
			}
			self[call].push(func)
	
		},
		remove(name, func) {
			var call = ["_", name, "Calls"].join('')
			if(this[call]!==undefined && func!== undefined) {
				var a = this[call]
				var l = a.length
				for (var i = 0; i < l; i++) {
					if (a[i] === func) {
						a[id].splice(i, 1)
						break
					}
				}
			} else {
				this[name]=undefined
			}
		},
		set(name, func) {
			var self = this
			var call = ["_", name, "Calls"].join('')
			if(self[call] !== undefined) {
				self[call]=undefined
			}
			self[name]=func
		}
	}
})




var $m= new Msgc()

$m.set("try1",()=>{
	console.log("hi")
	return 123
})//*/

var b= $m.try1()
console.log(b)

