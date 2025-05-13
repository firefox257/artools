require('./utils.js')

const EventObservers = mclass({
    prototype: {
        _target: undefined,
        _calls: {},
        _globals: [],
        init(o) {
            if (o.eventTarget == undefined) {
                this._target = this
            } else {
                this._target = o.eventTarget
            }

            if (o.eventWatchers !== undefined) {
                for (var i in o.eventWatchers) {
                    this.add(i, o.eventWatchers[i])
                }
            }
			
			if(o.eventGlobalWatcher!==undefined) {
				this.addGlobal(o.eventGlobalWatcher)
			}
        },
        add(id, func) {
            if (this._calls[id] == undefined) {
                this._calls[id] = []

                this._target[id] = new Function(
                    ['calls', 'globals'],
                    `
				
				return function(){
					var l = calls.length
					//todo maybe retuen array?
					for(var i= 0; i< l; i++) {
						calls[i](...arguments)
					}
					
					l = globals.length
					//todo maybe retuen array?
					for(var i= 0; i< l; i++) {
						globals[i]("${id}",...arguments)
					}
					
				}
				
				
				`
                )(this._calls[id], this._globals)
            } //end if

            this._calls[id].push(func)
        },
        remove(id, func) {
            if (this._calls[id] !== undefined) {
                var a = this._calls[id]
                var l = a.length
                for (var i = 0; i < l; i++) {
                    if (a[i] === func) {
                        this._calls[id].splice(i, 1)
                        break
                    }
                }
            }
        },
        addGlobal(func) {
            this._globals.push(func)
        },
        removeGlobal(func) {
            var a = this._globala
            var l = a.length
            for (var i = 0; i < l; i++) {
                if (a[i] === func) {
                    this._globals.splice(i, 1)
                    break
                }
            }
        }
    }
})

const PropertyObservers = mclass({
    prototype: {
        _target: undefined,
        _calls: {},
		_properties:undefined,
		_globals:[],
        init(o) {
            if (o.propertyTarget == undefined) {
                this._target = this
            } else {
                this._target = o.propertyTarget
            }

            if (o.propertyValues!==undefined) {
				this._properties = o.propertyValues
            } else {
				this._properties={}
			}
			
			for(var i in this._properties){
				this.add(i)
			}
			
			if(o.propertyWatchers!==undefined) {
				for(var i in o.propertyWatchers) {
					this.add(i, o.propertyWatchers[i])
				}
			}
			if(o.propertyGlobalWatcher!==undefined) {
				
				this.addGlobal(o.propertyGlobalWatcher)
				
			}
			
        },
        add(id, func) {
            if (this._calls[id] == undefined) {
               
			   this._calls[id] = []
			   this._target[id] = new Function(
			   ['target', 'calls', 'globals'],
			   `
				var obj = {}
				
				Object.defineProperty(target, "${id}", {
					
					get() {
						return obj.${id}
					}, 
					set(v) {
						
						obj.${id}=v
						var l= calls.length
						for(var i = 0; i < l; i++) {
							calls[i](v)
						}
						l=globals.length
						for(var i=0;i<l;i++) {
							globals[i]("${id}",v)
						}
					}
					
					
				})
				
				
				`
                )(this._target, this._calls[id], this._globals)
				
				
				//*/
            } //end if
			
            if (func !== undefined) {
                this._calls[id].push(func)
            }
        },
        remove(id, func) {
            if (this._calls[id] !== undefined) {
                var a = this._calls[id]
                var l = a.length
                for (var i = 0; i < l; i++) {
                    if (a[i] === func) {
                        this._calls[id].splice(i, 1)
                        break
                    }
                }
            }
        },
		setValues(o) {
			for(var i in o) {
				if(this._properties[i]==undefined) {
					this.add(i)
				} 
				this._target[i]=o[i]	
			}
		},
		addGlobal(func) {
            this._globals.push(func)
        },
        removeGlobal(func) {
            var a = this._globala
            var l = a.length
            for (var i = 0; i < l; i++) {
                if (a[i] === func) {
                    this._globals.splice(i, 1)
                    break
                }
            }
        }
		
    }
})
//*/
var B = mclass({
    prototype: {
        _events: undefined,
		get events() {
            return this._events
        },
        _properties: undefined,
		get properties() {
			return this._properties
		},
		_backerProps:{
			title:"",
			x:0,
			y:123
			
		},
        
        init() {
            this._events = new EventObservers({
                eventTarget: this,
                eventWatchers: {
                    onClick(v) {
                        console.log('bla ' + v)
                    }
                }
            })
            this._properties= new PropertyObservers({
				propertyTarget:this,
				propertyValues: this._backerProps,
				propertyGlobalWatcher(id, v) {
					console.log(id+" property has changed to "+v)
				}
				
			})
			
			this._properties.add("x", (v)=> {
				console.log("x: "+ v)
			})
        }
    }
})

var b = new B()

b.onClick(123)

b.x=5555
console.log('done')

/*
const PropertyObserversProxy = {
    construct(target, argumentsList, newTarget) {}
}

function PropertyObservers(p) {
    p = p ? p : {}
    calls = {}
    var retFunc = {
        add(id, func) {
            //console.log("here1")
            if (calls[id] == undefined) {
                calls[id] = []
            }
            calls[id].push(func)
        },
        remove(id, func) {
            if (calls[id] !== undefined) {
                var a = calls[id]
                var l = a.length
                for (var i = 0; i < l; i++) {
                    if (a[i] === func) {
                        calls[id].splice(i, 1)
                        break
                    }
                }
            }
        }
    }

    var getAddRemove = function () {
        return retFunc
    }
    getAddRemove.o = p

    return new Proxy(getAddRemove, {
        get(obj, key) {
            return obj.o[key]
        },
        set(obj, key, v, recv) {
            //console.log("here2 "+ key)
			
            obj.o[key] = v
            var a = calls[key]
            if (a !== undefined) {
                var l = a.length
                for (var i = 0; i < l; i++) {
                    a[i](v)
                }
            }
        }
    })
}


function EventObservers(p) {
    p = p ? p : {}
    var calls = {}
	var funcListCall ={}
    var retFunc = {
        add(id, func) {
            //console.log("here1")
            if (calls[id] == undefined) {
                calls[id] = []
				funcListCall[id] = function() {
					var a = calls[id]
					var l=a.length
					for(var i= 0;i<l;i++) {
						a[i](...arguments)
					}
				}
            }
            calls[id].push(func)
			
        },
        remove(id, func) {
            if (calls[id] !== undefined) {
                var a = calls[id]
                var l = a.length
                for (var i = 0; i < l; i++) {
                    if (a[i] === func) {
                        calls[id].splice(i, 1)
                        break
                    }
                }
            }
        }
    }

    var getAddRemove = function () {
        return retFunc
    }
    getAddRemove.o = p

    return new Proxy(getAddRemove, {
        get(obj, key) {
			
            return funcListCall[key]
        }/*,
        set(obj, key, v, recv) {
            //console.log("here2 "+ key)
			
            obj.o[key] = v
            var a = calls[key]
            if (a !== undefined) {
                var l = a.length
                for (var i = 0; i < l; i++) {
                    a[i](v)
                }
            }
        }
    })
}



var b = EventObservers()

b().add("onClick", (v)=>{
	console.log("hee "+ v)
})



b.onClick(123)

*/
