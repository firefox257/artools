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
		dclass(On${name}Event, [], {
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
	
	function ${name}(style) {
		if(style!=undefined) {
			for(var i in ${name}.prototype) {
				if(style[i] != undefined) {
					this[i] = style[i]
				}
			}
		}
	}
	dclass(${name},[], {
		prototype: {
			${listitems()}
		}
	
	})
	
	function ${name}Extender(style) {
		
		
		
		if(style != undefined) {
			this._style = new ${name}(style)
		} else {
			this._style = new ${name}()
		}
		this._setUpEvents()
	}
	dclass(${name}Extender,[OnStyleChangeEvent], {
		prototype: {
			
			_requestRedraw: false,
            get requestRedraw() {
				return this._requestRedraw
            },
			
			_setUpEvents:function() {
				var self = this 
				this.subscribeOnStyleChange(function(){
					
					self._requestRedraw = true
					})
		
			},
			 
            _style: undefined,
			
            //get style() {
				//return this._style.slice()
            //},
			
            set style(style) {
				var changed = false
				for(var i in ${name}.prototype) {
					if(style[i] != undefined) {
						this._style[i] = style[i]
						changed = true
					}
				}
				if(changed) {
					this.triggerOnStyleChange()
				}
            },
			
			${getterssetters()}
			
		}
	})
	
	
	return {${name}, ${name}Extender}
	`
    return new Function(['OnStyleChangeEvent'], st)(OnStyleChangeEvent)
}

export const OnStyleChangeEvent = EventTemplate('StyleChange')

export const { Style, StyleExtender } = StyleTemplate('Style', {
    padding: [0, 0, 0, 0],
    expand: [0, 0, 0, 0], // percentages
    size: [null, null],
    maxSize: [null, null],
    minSize: [null, null]
})



export const OnAnimateEvent = EventTemplate('Animate')


/*
const OnWindowSizeChangeEvent = EventTemplate('WindowSizeChange'))
export OnWindowSizeChangeEvent

const OnAnimateEvent = EventTemplate('Animate'))
export OnAnimateEvent

//*/
