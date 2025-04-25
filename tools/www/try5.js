/**
 * Creates a new class that mixes in properties and methods from multiple source classes,
 * calling each mixin's constructor when an instance is created, without using Object.assign.
 *
 * Inherited properties and methods from the prototype chains of the source classes
 * are included. Property descriptors are preserved.
 *
 * @param {...Function} sourceClasses - The classes to mix in.
 * @returns {Function} A new class with the mixed-in properties and methods.
 */
function mixin(...sourceClasses) {
    class MixedClass {
        constructor(...args) {
            // Call the constructors of all source classes in the context of the new instance
            sourceClasses.forEach((sourceClass) => {
                // Check if the sourceClass has its own constructor or inherits one
                // that is not the base Object constructor.
                // A simpler approach that works for typical class constructors:
                if (sourceClass.prototype.constructor) {
                     //sourceClass.prototype.constructor.call(this, ...args)
					 this.___constructor = sourceClass.prototype.constructor
					 new this.___constructor(...args)
                }
                // A more robust check could involve traversing the prototype chain for a constructor
                // but for standard class mixins, the above is usually sufficient.
            })
        }
    }

    sourceClasses.forEach((sourceClass) => {
        let currentPrototype = sourceClass.prototype

        // Traverse the prototype chain up to (but not including) Object.prototype
        while (currentPrototype && currentPrototype !== Object.prototype) {
            const propertyNames = Object.getOwnPropertyNames(currentPrototype)

            propertyNames.forEach((name) => {
                // Avoid copying the constructor property from source prototypes
                if (name !== 'constructor') {
                    const descriptor = Object.getOwnPropertyDescriptor(
                        currentPrototype,
                        name
                    )
                    if (descriptor) {
                        // Define the property on the target class's prototype
                        Object.defineProperty(
                            MixedClass.prototype,
                            name,
                            descriptor
                        )
                    }
                }
            })

            currentPrototype = Object.getPrototypeOf(currentPrototype)
        }
    })

    return MixedClass
}

// Example Usage:

class try1 {
	x = 123
	constructor(){
		console.log("ctey1")
	}
	func1(){
		console.log("try1")
		console.log(this.x)
	}
}

class try2 {
	y = 4444
	
	constructor(){
		console.log("ctey2")
	}
	func2(){
		console.log("try2")
		console.log(this.y)
	}
}


const m = mixin(try1,try2)

var c = new m()
c.func1()
c.func2()
    