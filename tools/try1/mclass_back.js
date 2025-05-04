function shallowCopy(obj) {
    // Create a new empty object to hold the shallow copy
    const copy = {}

    // Get all own property names of the original object, including non-enumerable ones
    const stringKeys = Object.getOwnPropertyNames(obj)

    // Get all own symbol properties of the original object
    const symbolKeys = Object.getOwnPropertySymbols(obj)

    // Combine all the keys (string and symbol)
    const allKeys = [...stringKeys, ...symbolKeys]

    // Iterate over each key
    allKeys.forEach((key) => {
        // Get the property descriptor for the current key from the original object
        const descriptor = Object.getOwnPropertyDescriptor(obj, key)

        // If a descriptor exists (which it should for own properties), define the property on the copy
        if (descriptor) {
            Object.defineProperty(copy, key, descriptor)
        }
    })

    // Return the newly created shallow copy
    return copy
}






const publicPrivateMclassHandler = {
    get(target, property, receiver) {
        //console.log('public private get ' + property)
        if (property[0] == '$' || property[1] == '$') return target[property]
        return target.____properties[property]
    },
    set(target, property, value, receiver) {
		//console.log('public private set ' + property)
        if (property[0] == '$' || property[1] == '$') return
        if (target.____properties[property] !== undefined) {
            target.____properties[property] = value
        }
    }
}

const publicMclassHandler = {
    get(target, property, receiver) {
        //console.log('public get ' + property)
        var t = property[0]
        if (t == '_') return undefined
        else if (t == '$') return target[property]
        return target.properties[property]
    },
    set(target, property, value, receiver) {
        var t = property[0]
        if (t == '_' || t == '$') return
        if (target[property] !== undefined) target[property] = value
    }
}



const constructorMclassHandler = {
    construct(target, argumentsList, newTarget) {
        var copy = {}
        var methods = {}
        var properties = {}

        {
            const stringKeys = Object.getOwnPropertyNames(target.prototype)

            const symbolKeys = Object.getOwnPropertySymbols(target.prototype)
            const allKeys = [...stringKeys, ...symbolKeys]

            allKeys.forEach((key) => {
                // Get the property descriptor for the current key from the original object
                const descriptor = Object.getOwnPropertyDescriptor(
                    target.prototype,
                    key
                )

                // If a descriptor exists (which it should for own properties), define the property on the copy

                if (descriptor) {
                    console.log('key: ' + key)
                    var c1 = key[0]

                    if (c1 == '_') {
                        var c2 = key[1]
                        if (c2 == '$') {
                            Object.defineProperty(methods, key, descriptor)
                        } else {
                            Object.defineProperty(properties, key, descriptor)
                        }
                    } else if (c1 == '$') {
                        //console.log(key + ' public')
                        Object.defineProperty(methods, key, descriptor)
                        if (descriptor.get) {
                            Object.defineProperty(copy, key, {
                                get: function () {
                                    return this.methods[key]
                                }
                            })
                        } else if (descriptor.set) {
                            Object.defineProperty(copy, key, {
                                set: function (v) {
                                    this.methods[key] = v
                                }
                            })
                        } else {
                            copy[key] = function (...args) {
                                return this.methods[key](...args)
                            }
                        }
                    } else {
                        Object.defineProperty(properties, key, descriptor)
                    }
                    //Object.defineProperty(copy, key, descriptor)
                }
            }) //end foreach keys
        } //end hiding scopes
		methods.____properties=properties
        copy.methods = new Proxy(methods, publicPrivateMclassHandler)
		
        copy.properties = new Proxy(properties, publicMclassHandler)
		copy.$constructor(...argumentsList)
        return copy
    } //end constructor proxy
}




function mclass(o, extenders) {
    function f(...args) {
    }
    f.prototype = o
    return new Proxy(f, constructorMclassHandler)
}

const try1 = mclass({
    x: 0,
    _y: 123,
	$constructor:function(msg) {
		console.log("constructor try1" + msg)
	},
    $func: function () {
        this._$hfunc()
		console.log(this._y)
    },
    _$hfunc: function () {
        console.log('hi')
    }
})

var t1 = new try1(" message here")
t1.$func()
console.log("_y " + t1._y)
