

const ihandler = {
    get(obj, key, receiver) {
		var k =key[0]
		//console.log("inner get "+key)
		return obj[key]
    },
    set(obj, key, v, receiver) {
		var k =key[0]
        if(k=='$') return
		if(obj[key]) {
			obj[key]= v
		}
    }
}


const phandler = {
    get(obj, key, receiver) {
		//console.log("public get "+key)
		var k =key[0]
		if(k=='_') return
        if(k== '$') {
			return function(...args) {
				
				return obj.inner[key](...args)
			}
		}
		return obj[key]
    },
    set(obj, key, v, receiver) {
		var k =key[0]
		if(k=='@') return
        if(k=='_'||k=='$') return
		if(obj[key]) {
			obj[key]= v
		}
    }
}

var try1= {
	
	_x:123,
	$func:function() {
		console.log("_x "+this._x)
	}

	
}

try1.inner = new Proxy(try1, ihandler)

var t1 = new Proxy(try1, phandler)


console.log(t1.x)
t1.$func()
console.log("@ "+t1._x)

//*/
