globalThis.deepSet = function (target, source, def) {
    if (target === source) {
        return
    }

    // Get all own property keys, including non-enumerable and Symbols
    const keys = Reflect.ownKeys(source)

    for (const key of keys) {
        
        const descriptor = Object.getOwnPropertyDescriptor(source, key)

        // If the property has a getter or setter, define it on the target
        if (descriptor && (descriptor.get || descriptor.set)) {
            Object.defineProperty(target, key, descriptor)
        } else if (descriptor && descriptor.hasOwnProperty('value')) {
            // If it's a data property (including functions)
            const sourceValue = descriptor.value
            const targetValue = target[key]
			var defValue;
			if(def) defValue=def[key]
            // Check if both source and target values are objects (but not null)
            if (
                typeof sourceValue === 'object' &&
                sourceValue !== null &&
                typeof targetValue === 'object' &&
                targetValue !== null
            ) {
                // Check if both are arrays or both are plain objects
                if (Array.isArray(sourceValue) === Array.isArray(targetValue)) {
                    // Recursively call deepSet for nested objects/arrays
					
                    deepSet(targetValue, sourceValue, defValue)
                } else {
					if(defValue!=undefined) {
						//alert("found " +key)
						continue;
					}
                    try {
                        target[key] = sourceValue
                    } catch (e) {
                        // Handle potential errors if the target property is not writable
                        console.error(
                            `Could not set property ${String(key)} on target:`,
                            e
                        )
                    }
                }
            } else {
                // Otherwise, directly assign the value
                if(defValue != undefined) {
					//alert("found " +key)
					continue
				}
				try {
                    target[key] = sourceValue
                } catch (e) {
                    // Handle potential errors if the target property is not writable
                    console.error(
                        `Could not set property ${String(key)} on target:`,
                        e
                    )
                }
            }
        }
        // Note: Properties without a value or getter/setter (should be rare for own properties) are ignored.
    }
    return target
}

globalThis.dclass = function (dc, sources, def) {
    sources.forEach((source) => {
        dc.prototype[source.name + 'Super'] = source
        deepSet(dc, source, def)
    })
    deepSet(dc, def)
}

globalThis.$$ =(0,eval)

//////======

globalThis.$msgc = (() => {
    var calls = {}
    var o = (id, ...args) => {
        if (calls[id]) {
            var a = calls[id]
            var l = a.length
            for (var i = 0; i < l; i++) {
                a[i].apply(null, args)
            }
        }
    }
    o.add = (id, func) => {
        if (!calls[id]) calls[id] = []
        calls[id].push(func)
    }
    o.remove = (id, func) => {
        var a = calls[id]
        var l = a.length
        for (var i = 0; i < l; i++) {
            if (a[i] === func) {
                calls[id].splice(i, 1)
                break
            }
        }
    }
    o.run = (text) => {
        var a = text
            .split('\n')
            .filter((n) => n.trim() !== '')
            .map((t) => t.trim())
        var l = a.length
        for (var i = 0; i < l; i++) {
            //alert("|"+a[i]+"|");
            eval(`$msgc(${a[i]});`)
        }
    }
    o.func = (id) => {
        //todo add function wrapper
        return calls[id]
    }

    return o
})()

globalThis.deepClone = (source, visited = new WeakMap()) => {
    if (source === null || typeof source !== 'object') {
        return source
    }

    if (visited.has(source)) {
        return visited.get(source)
    }

    if (source instanceof Date) {
        const copy = new Date(source.getTime())
        visited.set(source, copy) // Register before returning
        return copy
    }

    if (source instanceof RegExp) {
        const copy = new RegExp(source.source, source.flags)
        visited.set(source, copy) // Register before returning
        return copy
    }

    if (source instanceof Map) {
        const copy = new Map()
        visited.set(source, copy) // Register before recursing into entries
        // Recursively clone keys and values
        source.forEach((value, key) => {
            copy.set(deepClone(key, visited), deepClone(value, visited))
        })
        return copy
    }

    if (source instanceof Set) {
        const copy = new Set()
        visited.set(source, copy) // Register before recursing into values
        // Recursively clone values
        source.forEach((value) => {
            copy.add(deepClone(value, visited))
        })
        return copy
    }

    const copy = Array.isArray(source)
        ? []
        : Object.create(Object.getPrototypeOf(source))

    visited.set(source, copy)

    Reflect.ownKeys(source).forEach((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(source, key)

        if (descriptor) {
            if (descriptor.hasOwnProperty('value')) {
                descriptor.value = deepClone(descriptor.value, visited)
            }

            Object.defineProperty(copy, key, descriptor)
        }
    })

    return copy
}

function funcrtID() {
    return funcrtID.atid++
}
funcrtID.atid = -1
globalThis.rtID = funcrtID


globalThis.isInt =function (value) {
    return typeof value === 'number' && Number.isInteger(value)
}



globalThis.isFloat = function (value) {
    return (
        typeof value === 'number' &&
        !Number.isInteger(value) &&
        Number.isFinite(value)
    )
}


globalThis.isBool = function(value) {
    return typeof value === 'boolean'
}


globalThis.isString = function(value) {
    return typeof value === 'string'
}


globalThis.isChar =function(value) {
    return typeof value === 'string' && value.length === 1
}