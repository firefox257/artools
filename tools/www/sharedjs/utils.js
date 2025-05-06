globalThis.getAllKeys = function (source, ignore) {
    var stringKeys = Object.getOwnPropertyNames(source)
    var symbolKeys = Object.getOwnPropertySymbols(source)
    var allKeys = [...stringKeys, ...symbolKeys]

    var retKeys = {}
    var l = allKeys.length
    for (var i = 0; i < l; i++) {
        var key = allKeys[i]
        if (!ignore[key]) {
            retKeys[key] = true
        }
    }
    return retKeys
}

globalThis.deepSet = function (allKeys, target, source, ignore) {
    for (var key in allKeys) {
        const descriptor = Object.getOwnPropertyDescriptor(source, key)
        // If a descriptor exists (which it should for own properties), define the property on the copy
        if (descriptor) {
            Object.defineProperty(target, key, descriptor)
        }
    }
}

globalThis.dclass = function (dc, sources, def) {
    //check overrides
    var funcr = {}

    for (var skey in sources) {
        //check overrides
        var source = sources[skey]
        var allKeys = getAllKeys(source.prototype, { constructor: true })
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

        var sname = skey + 'Super'

        dc.prototype[sname] = source
        deepSet(allKeys, dc.prototype, source.prototype)
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
}






//////======

globalThis.deepClone = function (source, visited = new WeakMap()) {
    if (source === undefined || typeof source !== 'object') {
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

///////////
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

globalThis.isInt = function (value) {
    return typeof value === 'number' && Number.isInteger(value)
}

globalThis.isFloat = function (value) {
    return (
        typeof value === 'number' &&
        !Number.isInteger(value) &&
        Number.isFinite(value)
    )
}

globalThis.isBool = function (value) {
    return typeof value === 'boolean'
}

globalThis.isString = function (value) {
    return typeof value === 'string'
}

globalThis.isChar = function (value) {
    return typeof value === 'string' && value.length === 1
}

globalThis.setArray = function (a1, a2) {
    var l = a1.length
    for (var i = 0; i < l; i++) {
        if (a2[i] != undefined) {
            a1[i] = a2[i]
        }
    }
}
