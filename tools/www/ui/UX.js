///////

export function hi() {
    alert('hi')
}

var PXPMM = 5 //  5 pixel per mm

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

export const StyleProxy = mclass({
    proxy: {
        get(obj, key) {
            return obj._style[key]
        },
        set(obj, key, v) {
            var s = obj._style[key]
            if (s !== undefined) {
                var changed = false
                if (Array.isArray(s)) {
                    var l = s.length
                    if (v.length < l) {
                        l = v.length
                    }
                    for (var i = 0; i < l; i++) {
                        if (v[i] !== undefined) {
                            if (s[i] !== v[i]) {
                                changed = true
                                s[i] = v[i]
                            }
                        }
                    }
                } else {
                    if (s !== v) {
                        changed = true
                        s = v
                    }
                }
                if (changed) {
                    obj._style[key] = s
                    obj._events.onStyleChange()
                }
            } //end if
        } //end set
    },
    prototype: {
        _style: undefined,
        _events: undefined,
        init(argobj) {
            if (
                argobj == undefined ||
                argobj.style == undefined ||
                argobj.events == undefined
            ) {
                throw new Error(
                    'need to define an argument object that has style defaults and events object defined'
                )
            }
            this._style = argobj.style
            this._events = argobj.events
        }
    }
}) //end style proxy
export const StyleOverlay = mclass({
    needed: {
        _style: 'Need to implement _style object for styles to work',
        _events: 'Need to implement _events object'
    },
    prototype: {
        _styleProxy: undefined,
        init(obj) {
            this._styleProxy = new StyleProxy({
                style: this._style,
                events: this._events
            })

            if (obj !== undefined && obj.style !== undefined) {
                this.style = obj.style
            }
        },
        get style() {
            return this._styleProxy //deepClone(this._style)
        },
        set style(value) {
            var style = this._style
            for (var i in value) {
                var s = style[i]
                var v = value[i]

                if (s !== undefined && v !== undefined) {
                    var changed = false
                    if (Array.isArray(s)) {
                        var l = s.length
                        if (v.length < l) {
                            l = v.length
                        }
                        for (var i = 0; i < l; i++) {
                            if (v[i] !== undefined) {
                                if (s[i] !== v[i]) {
                                    changed = true
                                    s[i] = v[i]
                                }
                            }
                        }
                    } else {
                        if (s !== v) {
                            changed = true
                            s = v
                        }
                    }

                    if (changed) {
                        this._style[i] = s
                        this._events.onStyleChange()
                    }
                } //end if
            }
        } //end set,
    }//end prototype
})//end style overlay

//*/
