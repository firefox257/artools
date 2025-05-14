require('./utils.js')
/*
const EventsBus = mclass({
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
//*/
/*
const PropertyObservers = mclass({
    prototype: {
        _target: undefined,
        _calls: {},
        _properties: undefined,
        _globals: [],
        init(o) {
            if (o.propertyValues !== undefined) {
                this._properties = o.propertyValues
            } else {
                this._properties = {}
            }

            if (o.propertyTarget == undefined) {
                this._target = this
            } else {
                this._target = o.propertyTarget
            }

            for (var i in o.propertyValues) {
                if (typeof o.propertyValues[i] == 'object') {
                    throw new Error(
                        'property obsevers do not support objects or arrays. use function replacers.'
                    )
                }
                this.add(i)
            }

            if (o.propertyWatchers !== undefined) {
                for (var i in o.propertyWatchers) {
                    this.add(i, o.propertyWatchers[i])
                }
            }
            if (o.propertyGlobalWatcher !== undefined) {
                this.addGlobal(o.propertyGlobalWatcher)
            }
        },
        add(id, func, v) {
            if (typeof v == 'object') {
                throw new Error(
                    'property obsevers do not support objects or arrays. use function replacers.'
                )
            }

            if (this._calls[id] == undefined) {
                this._calls[id] = []
				
                new Function(
                    ['target', 'properties', 'calls', 'globals'],
                    `
				Object.defineProperty(target, "${id}", {
					
					get() {
						//todo change
						if(typeof properties.${id} =="function") {
							return properties.${id}(properties)
						}
						
						return properties.${id}
					}, 
					set(v) {
						
						if(typeof properties.${id} =="function") {
							return properties.${id}(properties, v)
						} else {
							properties.${id}=v
						}
						
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
                )(
                    this._target,
                    this._properties,
                    this._calls[id],
                    this._globals
                )
            } //end if

            if (func !== undefined) {
                this._calls[id].push(func)
            }
            if (v !== undefined) {
                this._target = v
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
            for (var i in o) {
                if (this._properties[i] == undefined) {
                    this.add(i)
                }
                this._target[i] = o[i]
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
        _backerProps: {
            title: 'title',
            x: 0,
            y: 123,
            window(p, v) {
                if (v == undefined) {
                    return [p.x, p.y, p.title]
                }
                p.x = v[0]
                p.y = v[1]
                p.title = v[2]
            }
        },

        init() {
            this._events = new EventsBus({
                eventTarget: this,
                eventWatchers: {
                    onClick(v) {
                        console.log('bla ' + v)
                    }
                }
            })
            this._properties = new PropertyObservers({
                propertyTarget: this,
                propertyValues: this._backerProps,
                propertyGlobalWatcher(id, v) {
                    console.log(id + ' property has changed to ' + v)
                }
            })
        }
    }
})

var b = new B()

console.log(b.window)
b.window = [0, 0, 'hi there']
console.log(b.window)
console.log(b.title)
//*/

/*
var b={}


Object.defineProperty(b, "x", {
	get(){
		console.log("get")
		return 123
	},
	set(v){
		console.log("set")
	}
	
})
//*/
