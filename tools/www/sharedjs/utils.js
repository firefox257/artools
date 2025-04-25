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
