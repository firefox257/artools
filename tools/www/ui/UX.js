///////

export function hi() {
    alert('hi')
}

var PXPMM = 1 //  1 pixel per mm

export function pxpmm() {
    return PXPMM
}

export function px2ar(d) {
    return d / (PXPMM * 1000.0)
}
export function ar2px(d) {
    return d * (PXPMM * 1000.0)
}

export function px2mm(d) {
    return d / PXPMM
}
export function mm2px(d) {
    return d * PXPMM
}

export function px2cm(d) {
    return d / (PXPMM * 10)
}
export function cm2px(d) {
    return d * (PXPMM * 10)
}

export function px2dm(d) {
    return d / (PXPMM * 100)
}
export function dm2px(d) {
    return d * (PXPMM * 100)
}

export function px2m(d) {
    return d / (PXPMM * 1000)
}
export function m2px(d) {
    return d * (PXPMM * 1000)
}

export function px2in(d) {
    return d / (PXPMM * 25.4)
}
export function in2px(d) {
    return d * (PXPMM * 25.4)
}

export function px2ft(d) {
    return d / (PXPMM * 25.4 * 12)
}
export function ft2px(d) {
    return d * (PXPMM * 25.4 * 12)
}

export function px2yd(d) {
    return d / (PXPMM * 25.4 * 36)
}
export function yd2px(d) {
    return d * (PXPMM * 25.4 * 36)
}

export function px2pt(d) {
    //0.3528 mm per pt
    return d / (PXPMM * 0.3528)
}
export function pt2px(d) {
    //0.3528 mm per pt
    return d * (PXPMM * 0.3528)
}

export function EventTemplate(name) {
	
	
    return new Function(`
	
		function On${name}Event() {}
		dclass(On${name}Event, {}, {
			override:{},
			prototype:{}
		})
		
		
		dclass(On${name}Event, {}, {
    		prototype: {
        		_on${name}Observer: [],
        		subscribeOn${name}: function (f) {
            		this._on${name}Observer.push(f)
        		},
        		triggerOn${name}: function (...args) {
            		var c = this._on${name}Observer
            		for (var i = 0; i < c.length; i++) {
                		c[i](...args)
            		}
        		}
    		}
		})
		
		return On${name}Event
	`)()
	
}

export const OnStyleChangeEvent = EventTemplate('StyleChange')


export function StyleTemplate(name, items) {
    var st = []

    function listitems() {
        var l = []
        for (var i in items) {
            l.push(`${i}: ${JSON.stringify(items[i])}`)
        }
        return l.join(',')
    }
    function getterssetters() {
        var l = []
        for (var i in items) {
            //l.push(`${i}: ${JSON.stringify(items[i])}`)

            var at = items[i]
            if (Array.isArray(at)) {
                l.push(`
				get ${i}() {
                    return this._style.${i}.slice()
                },
				set ${i}(d) {
                    var changed = false
                    for (var i = 0; i < 4; i++) {
                        if (d[i] != undefined) {
                            if (this._style.${i}[i] != d[i]) {
                                this._style.${i}[i] = d[i]
                                changed = true
                            }
                        }
                    }
                    if (changed) {
                        this.triggerOnStyleChange()
                    }
                }
				
				
				`)
            } else {
                l.push(`
				
				get ${i}() {
                    return this._style.${i}
                },
				set ${i}(d) {
                    
                    if (this._style.${i} != d) {
						this._style.${i} = d
                        this.triggerOnStyleChange()
                    }
                }
				
				`)
            }
        }
        return l.join(',')
    }

    st = `
	function ${name}() {
	}
	dclass(${name},{},{
		override:{},
		prototype:{
			
		}
	})	
	
	return ${name}
	
	`
}






export const OnAnimateStartEvent = EventTemplate('AnimateStart')
export const OnAnimateEvent = EventTemplate('Animate')
export const OnAnimateStopEvent = EventTemplate('AnimateStop')

export function OnAnimationsEvent() {}
dclass(OnAnimationsEvent,{
	OnAnimateStartEvent:OnAnimateStartEvent,
	OnAnimateEvent:OnAnimateEvent,
	OnAnimateStopEvent:OnAnimateStopEvent}, {
	prototype:{}
})

//*/
