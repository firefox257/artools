////
require('./utils.js')

const mclassConstructProxy = {
    construct(target, argumentsList, newTarget) {
        var obj = new target()
		var proxy;
       	if (target.sources !== undefined) {
            for (var i in target.sources) {
				var init= target.sources[i].prototype.init
				
                if (init !== undefined) {
                    init.apply(obj,argumentsList)
                }
				if(proxy==undefined)proxy=target.sources[i].proxy
				else {
					throw new Error("mclass from all the sources can only have one proxy")
				}
            }
        }
		if(proxy==undefined)proxy=target.proxy
		else {
			throw new Error("mclass from all the sources can only have one proxy")
		}
		
		
        if (obj.init !== undefined) obj.init(...argumentsList)
		if(proxy!==undefined) return new Proxy(obj, proxy)
        return obj
    }
}

globalThis.mclass = function (def) {
    var dc = function () {}

    //check overrides
    var funcr = {}

    if (def.sources!==undefined) {
        for (var skey in def.sources) {
            //check overrides
            var source = def.sources[skey]
            var allKeys = getAllKeys(source.prototype, { constructor: true, init:true })
            //check overrides
            var override = source.override ? source.override : {}

            for (var key in allKeys) {
                if (funcr[key] !== undefined && override[key] == undefined) {
                    throw new Error(
                        `Overlay classes ${skey} Clobber on ${key} is not overrideable`
                    )
                }
                if (override[key]) funcr[key] = true
                else funcr[key] = false
            }
			
            deepSet(allKeys, dc.prototype, source.prototype)
        }
    }

    {
        var allKeys = getAllKeys(def.prototype, { constructor: true })

        for (var key in allKeys) {
            if (funcr[key] !== undefined && !funcr[key]) {
                throw new Error(`Clobber on ${key} is not overrideable`)
            }
        }

        deepSet(allKeys, dc.prototype, def.prototype)

        {
            var allKeys = getAllKeys(def, { prototype: true })
            //check overrides
            deepSet(allKeys, dc, def)
        }
    }
    //*/

    return new Proxy(dc, mclassConstructProxy)
}


const EventObj=mclass({
	prototype: {
		_list:[],
		subscribe(func) {
			this._list.push(func)
		},
		unsubscribe(func) {
			this._list=this._list.filter(i=> i!==func)
		},  
		run(...args) {
			
		}
	}
})


const Events = mclass({
	proxy: {
		get(obj, key, receiver) {
				 return obj._events[key]? obj._events[key] : obj._events[key] = (()=>{
					var list =[]
					var f = function(...args){
						list.forEach((i)=>{
							i(...args)
						})
					}
					
					f.subscribe= function(func) {
						list.push(func)
					}
					f.unsubscribe= function(func) {
						list=list.filter(i=> i!==func)
					}
					return f
				})()
		}
		
	},
	prototype: {
		_events:{},
		init() {
			
		},
		toString() {
			return this._events.toString()
		}
	}
})

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