require('./utils.js')

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

b.properties.add(["x","y","title","window"], ()=>{
	console.log("something here")
})

b.y="hhhh"
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
