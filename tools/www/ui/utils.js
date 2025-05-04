/*

globalThis.deepSet = function (target, source, def, ignore) {
    if (target === source) {
        return
    }

    // Get all own property keys, including non-enumerable and Symbols
    const keys = Reflect.ownKeys(source)

    for (const key of keys) {
        if (target[key] == undefined && ignore[key] == undefined) {
            
            const descriptor = Object.getOwnPropertyDescriptor(source, key)

            // If the property has a getter or setter, define it on the target
            if (descriptor && (descriptor.get || descriptor.set)) {
                Object.defineProperty(target, key, descriptor)
            } else if (descriptor && descriptor.hasOwnProperty('value')) {
                // If it's a data property (including functions)

                const sourceValue = descriptor.value
                const targetValue = target[key]
                var defValue
                if (def) defValue = def[key]
                // Check if both source and target values are objects (but not null)
                if (
                    typeof sourceValue === 'object' &&
                    sourceValue !== null &&
                    typeof targetValue === 'object' &&
                    targetValue !== null
                ) {
                    // Check if both are arrays or both are plain objects
                    if (
                        Array.isArray(sourceValue) ===
                        Array.isArray(targetValue)
                    ) {
                        // Recursively call deepSet for nested objects/arrays

                        deepSet(targetValue, sourceValue, defValue, ignore)
                    } else {
                        if (defValue != undefined) {
                            //alert("found " +key)
                            continue
                        }
                        try {
                            target[key] = sourceValue
                        } catch (e) {
                            // Handle potential errors if the target property is not writable
                            console.error(
                                `Could not set property ${String(
                                    key
                                )} on target:`,
                                e
                            )
                        }
                    }
                } else {
                    // Otherwise, directly assign the value
                    if (defValue != undefined) {
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
        } else {
			throw new Error(" Clobering on "+ key + ".")

		}
        // Note: Properties without a value or getter/setter (should be rare for own properties) are ignored.
    }
    return target
}

globalThis.shallowCopy = function (obj, ignore) {
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
        if (ignore[key] == undefined) {
            // Get the property descriptor for the current key from the original object
            const descriptor = Object.getOwnPropertyDescriptor(obj, key)

            // If a descriptor exists (which it should for own properties), define the property on the copy
            if (descriptor) {
                Object.defineProperty(copy, key, descriptor)
            }
        }
    })

    // Return the newly created shallow copy
    return copy
}
//*/

/*
globalThis.deepSet = function(target, source) {
  // If source is not an object or is null, there's nothing to copy deeply.
  // We return the target as is.
  if (source === null || typeof source !== 'object') {
    return target;
  }

  // Get all own property keys from the source, including symbols.
  const keys = Object.getOwnPropertyNames(source).concat(Object.getOwnPropertySymbols(source));

  keys.forEach(key => {
	  
	
    // Get the property descriptor to check if it's a data property or an accessor property.
    const descriptor = Object.getOwnPropertyDescriptor(source, key);

    // Check if it's a data descriptor (has a value)
    if (descriptor.hasOwnProperty('value')) {
      const value = descriptor.value;

      // If the value is an object or an array (and not null), recurse.
      if (value !== null && typeof value === 'object') {

        if (Array.isArray(value)) {
          // If the source property is an array, replace the target property
          // with a new array and deep copy its elements.
          target[key] = [];
          value.forEach((item, index) => {
            if (item !== null && typeof item === 'object') {
              // Determine if the array element is an object or array and create accordingly
              target[key][index] = Array.isArray(item) ? [] : {};
              // Recurse into the array element
              deepSet(target[key][index], item);
            } else {
              // Copy primitive array elements directly
              target[key][index] = item;
            }
          });
        } else {
          // If the source property is an object (but not an array or null),
          // ensure the corresponding target property is also an object before recursing.
          // If it doesn't exist, is not an object, is null, or is an array, create a new object.
          if (!target.hasOwnProperty(key) || typeof target[key] !== 'object' || target[key] === null || Array.isArray(target[key])) {
             target[key] = {};
          }
          // Recurse into the nested object
          deepSet(target[key], value);
        }
      } else {
        // If the value is a primitive or a function (method), copy it directly
        // using defineProperty to preserve its attributes (writable, enumerable, configurable).
        // This also handles methods correctly.
        Object.defineProperty(target, key, descriptor);
      }
    } else if (descriptor.hasOwnProperty('get') || descriptor.hasOwnProperty('set')) {
      // If it's an accessor descriptor (getter or setter), copy it directly
      // using defineProperty to preserve the get/set functions.
      Object.defineProperty(target, key, descriptor);
    }
  });

  // Return the modified target object.
  return target;
}

//*/

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

        var sname = source.name + 'Super'

        dc.prototype[sname] = source
        deepSet(allKeys, dc.prototype, source.prototype)
    }

    {
        var allKeys = getAllKeys(def.prototype, { constructor: true })

        for (var key in allKeys) {
            if (funcr[key] !== undefined && !funcr[key]) {
                throw new Error(`Clobber on ${key} is not overrideable`)
            }

            //if(def.override[key]) funcr[key] = true
            //else funcr[key] = false
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

globalThis.$$ = (0, eval)

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
