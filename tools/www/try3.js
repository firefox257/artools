/**
 * Deeply sets properties and their descriptors (including getters and setters)
 * from a source object onto a target object without creating new objects or arrays.
 * The target object is expected to have a compatible structure for nested assignments.
 *
 * @param {object} target The target object to set properties on.
 * @param {object} source The source object to copy properties from.
 */
function deepSet(target, source) {
    if (target === source) {
        return
    }

    // Get all own property keys, including non-enumerable and Symbols
    const keys = Reflect.ownKeys(source)

    for (const key of keys) {
        if (key === 'constructors') continue
        const descriptor = Object.getOwnPropertyDescriptor(source, key)

        // If the property has a getter or setter, define it on the target
        if (descriptor && (descriptor.get || descriptor.set)) {
            Object.defineProperty(target, key, descriptor)
        } else if (descriptor && descriptor.hasOwnProperty('value')) {
            // If it's a data property (including functions)
            const sourceValue = descriptor.value
            const targetValue = target[key]

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
                    deepSet(targetValue, sourceValue)
                } else {
                    // If types are incompatible (e.g., source is array, target is object),
                    // we cannot deeply set without creating a new object/array,
                    // so we fall back to direct assignment if possible, acknowledging
                    // this might not be the desired outcome depending on the exact
                    // incompatible types and target structure.
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

function dclass(dc, def, ...sources) {
    deepSet(dc, def)
    sources.forEach((source) => {
        dc.prototype[source.name + 'Super'] = source
        deepSet(dc, source)
    })
}



function try1 (id) {
	console.log("try1 d "+ id)
}
dclass(try1, {  all: 999999,
    prototype: {
        x: 123,
        func1() {
            console.log('x ' + this.x)
        }
    }
})


function try2(id) {
	console.log("try2 d "+ id)
}
dclass(try2, {
    prototype: {
        y: 444,
        func2() {
            console.log('y ' + this.y)
        }
    }
})


function d (id) {
	console.log(d.all)
	console.log("d "+ id)
	this.try2Super(id)
	this.try1Super(id)
}
dclass(d, {
        prototype: {
			_x:1,
			get x() {
				return this._x
			},
		}
    },
    try2,
    try1
)


var t1 = new try1("more") 
t1.func1()

var c = new d("msgc")
c.func1()
c.func2()
console.log(c.x)
//*/
