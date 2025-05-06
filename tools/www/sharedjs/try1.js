////
require('./utils.js')


var e= new Events()

e.onclick.subscribe((msg)=>{
	console.log("here1 " + msg)
})

var ee = ()=>{
	console.log("here2")
}

e.onclick.subscribe(ee)



e.onclick(123)


e.onclick.unsubscribe(ee)
e.onclick(222)


console.log(""+e)
console.log("========•••••")

const try1 = mclass({
	needed: {
		_implemented:"need to implement _implemnt with a list of numbers"
	},
	prototype: {
		init() {
			console.log(this._implemented)
		}
	}
})



const try2 = mclass({
	sources:{
		try1:try1
	}, 
	prototype: {
		
		init() {
			try2.sources.try1.prototype.init.apply(this)
		}
	}
})


const try3 = mclass({
	sources:{
		try2:try2
	}, 
	prototype: {
		_implemented:[123,123],
		init() {
			try3.sources.try2.prototype.init.apply(this)
			console.log("ended")
		}
	}
})




 var t3 = new try3()


