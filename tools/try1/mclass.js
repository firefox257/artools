///////

const mclassInnerHandler = {
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

const mclassPublicHandler = {
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

const mclassConstructorHandler = {
    construct(target, argumentsList, newTarget) {
		//console.log("constructor")
    	var copy = new target() //Reflect.construct(target, argumentsList, newTarget)
		copy.inner = new Proxy(copy, mclassInnerHandler)
        
		var pcopy = new Proxy(copy, mclassPublicHandler)
		return pcopy
    } //end constructor proxy
}

function mclass(name, o, extenders) {
    var f = function() {}
	f.name=name
    f.prototype = o  
	
	
	var l= extenders.length
	for(var i = 0; i < l) {
		var at = extenders[i]
		o[at.name+"Super"] = o.prototype
	}
	
	
	
    return new Proxy(f, mclassConstructorHandler)
}

const try1 = mclass("try1",{
    _x:123,
	$func:function() {
		console.log("x " + this._x)
		this._$hfunc()
	},
	_$hfunc:function() {
		console.log("hi")
	}
})


var t1 = new try1()
t1.$func()
console.log("x here " + t1._x)
//t1._$hfunc()
//*/