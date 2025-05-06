require('./utils.js')


const try1=mclass({
	prototype:{
		init(){
			
		},
		get h() {
			return 123
		}
	}
})

const try2=mclass({
	sources:{
		try1:try1
	},
	prototype: {
		init(){}
	}
})
var t= new try2()

console.log(t.h)