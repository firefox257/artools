/**
 * Merges multiple class prototypes into a new class prototype and chains their constructors.
 * Note: This is a simplified implementation and has limitations compared to true multiple inheritance
 * or mixin patterns provided by libraries or future JavaScript features.
 * Property conflicts on the prototype are resolved by the order of classes provided (last one wins).
 * Constructor arguments are passed to all merged constructors.
 *
 * @param {...Function} classes - The class constructors to merge.
 * @returns {Function} A new class constructor with merged prototypes and chained constructors.
 */
function mergeClasses(...classes) {
    // Create a dummy class
    class MergedClass {
        constructor(...args) {
            // Run each argument class constructor
            classes.forEach((Class) => {
                // Ensure it's a function before calling (should be a class/constructor)
                if (typeof Class === 'function') {
                    // Call the constructor with the current instance ('this') and arguments
                    Class.apply(this, args)
                }
            })
        }
    }

    // Copy properties from each argument class prototype into the dummy class prototype
    classes.forEach((Class) => {
        // Ensure it's a function and has a prototype
        if (typeof Class === 'function' && Class.prototype) {
            const propertyNames = Object.getOwnPropertyNames(Class.prototype)

            propertyNames.forEach((name) => {
                // Avoid copying the constructor itself, as we handle it separately
                if (name === 'constructor') {
                    return
                }

                // Get the property descriptor to copy getters, setters, writability, etc.
                const descriptor = Object.getOwnPropertyDescriptor(
                    Class.prototype,
                    name
                )

                if (descriptor) {
                    // Define the property on the MergedClass prototype
                    // This correctly copies data properties, accessors (getters/setters)
                    Object.defineProperty(
                        MergedClass.prototype,
                        name,
                        descriptor
                    )
                }
            })
        }
    })

    return MergedClass
}

// --- Dummy Classes for Demonstration ---

class ClassA {
    constructor(name) {
        console.log('ClassA constructor called')
        this.nameA = name || 'defaultA'
    }

    methodA() {
        console.log(`MethodA called. NameA: ${this.nameA}`)
    }

    get greetingA() {
        return `Hello from A, ${this.nameA}`
    }
}

class ClassB {
    constructor(value) {
        console.log('ClassB constructor called')
        this.valueB = value || 0
    }

    methodB() {
        console.log(`MethodB called. ValueB: ${this.valueB}`)
    }

    get greetingB() {
        return `Greetings from B, value ${this.valueB}`
    }
}

class ClassC {
    constructor(tag) {
        console.log('ClassC constructor called')
        this.tagC = tag || 'C'
    }

    methodC() {
        console.log(`MethodC called. TagC: ${this.tagC}`)
    }

    // This method has the same name as one in ClassA - ClassC's version should win
    methodA() {
        console.log(`MethodA called from ClassC. TagC: ${this.tagC}`)
    }
}

// --- Example Usage ---

const MergedClassAB = mergeClasses(ClassA, ClassB)
const instanceAB = new MergedClassAB('testName', 100)

console.log('\n--- Testing MergedClassAB ---')
console.log('Instance properties:', instanceAB) // Should have nameA and valueB
instanceAB.methodA() // Should call ClassA's methodA
instanceAB.methodB() // Should call ClassB's methodB
console.log(instanceAB.greetingA) // Should call ClassA's getter
console.log(instanceAB.greetingB) // Should call ClassB's getter

const MergedClassABC = mergeClasses(ClassA, ClassB, ClassC)
const instanceABC = new MergedClassABC('anotherName', 200, 'TAGGED')

console.log('\n--- Testing MergedClassABC ---')
console.log('Instance properties:', instanceABC) // Should have nameA, valueB, and tagC
instanceABC.methodA() // Should call ClassC's methodA because ClassC was last
instanceABC.methodB() // Should call ClassB's methodB
instanceABC.methodC() // Should call ClassC's methodC
console.log(instanceABC.greetingA) // Should still call ClassA's getter (getters/setters are copied by descriptor)
console.log(instanceABC.greetingB) // Should still call ClassB's getter

// Demonstrate merging classes where later classes overwrite methods
const MergedClassCAB = mergeClasses(ClassC, ClassA, ClassB) // ClassB and ClassA now come later
const instanceCAB = new MergedClassCAB('xyz', 999, 'C_FIRST')

console.log('\n--- Testing MergedClassCAB (Order Changed) ---')
console.log('Instance properties:', instanceCAB) // Should have nameA, valueB, and tagC
instanceCAB.methodA() // Should call ClassA's methodA because ClassA was last among those with methodA
instanceCAB.methodB() // Should call ClassB's methodB
instanceCAB.methodC() // Should call ClassC's methodC
