function cloneFunction(func) {
    if (typeof func !== 'function') {
        throw new Error('Input must be a function.')
    }

    // Get the source code of the function
    const funcSource = func.toString()

    // Create a new function from the source code.
    // Note: This new function runs in the global scope and does not preserve closures.
    let clonedFunc
    try {
        // Extract parameter names and body for the Function constructor
        const match = funcSource.match(
            /^function(?:\s+\w+)?\s*\(([^)]*)\)\s*\{([\s\S]*)\}$/
        )
        if (match) {
            const params = match[1]
                .split(',')
                .map((p) => p.trim())
                .filter((p) => p)
            const body = match[2].trim()
            clonedFunc = new Function(...params, body)
        } else {
            // Handle arrow functions or other syntaxes if necessary, or throw an error
            // For simplicity, this example primarily targets standard function declarations/expressions
            // A more robust solution would require more sophisticated parsing.
            console.warn(
                'Could not parse function source. Cloning might be incomplete.'
            )
            clonedFunc = new Function(funcSource)
        }
    } catch (e) {
        console.error('Error creating new function from source:', e)
        // Fallback or error handling
        return null
    }

    // Copy own properties (enumerable and non-enumerable) from the original function
    const ownPropertyNames = Object.getOwnPropertyNames(func)

    ownPropertyNames.forEach((name) => {
        if (name !== 'prototype' && name !== 'length' && name !== 'name') {
            // Avoid copying intrinsic properties that are automatically set or managed
            // by the Function constructor or function definition.
            const descriptor = Object.getOwnPropertyDescriptor(func, name)
            if (descriptor) {
                Object.defineProperty(clonedFunc, name, descriptor)
            }
        }
    })

    // Manually copy 'name' and 'length' as they might not be correctly
    // set by the Function constructor for all function types.
    // However, be aware that 'name' might be standardized differently
    // for functions created via new Function().
    try {
        Object.defineProperty(clonedFunc, 'name', {
            value: func.name,
            writable: false,
            enumerable: false,
            configurable: true
        })
    } catch (e) {
        // Ignore errors if name is not configurable
    }

    try {
        Object.defineProperty(clonedFunc, 'length', {
            value: func.length,
            writable: false,
            enumerable: false,
            configurable: true
        })
    } catch (e) {
        // Ignore errors if length is not configurable
    }

    return clonedFunc
}

// --- Example Usage ---

// Original function with a custom property
function originalFunction(a, b) {
    return a + b
}
originalFunction.description = 'This is the original function'
Object.defineProperty(originalFunction, 'internalId', {
    value: 123,
    enumerable: false,
    writable: false,
    configurable: false
})

const clonedFunction = cloneFunction(originalFunction)

console.log('Original Function:', originalFunction.toString())
console.log('Cloned Function:', clonedFunction.toString())

console.log('Original Function Result:', originalFunction(2, 3))
console.log('Cloned Function Result:', clonedFunction(2, 3))

console.log('Original Function Description:', originalFunction.description)
console.log('Cloned Function Description:', clonedFunction.description)

console.log('Original Function internalId:', originalFunction.internalId)
console.log('Cloned Function internalId:', clonedFunction.internalId)

console.log('Original Function name:', originalFunction.name)
console.log('Cloned Function name:', clonedFunction.name) // Note: Might be 'anonymous' depending on how new Function is used

console.log('Original Function length:', originalFunction.length)
console.log('Cloned Function length:', clonedFunction.length)

// Example with a function that relies on closure (will not work as expected in clone)
function outer() {
    let outerVar = "I'm from the outer scope"
    return function inner() {
        return outerVar
    }
}

const originalClosureFunc = outer()
const clonedClosureFunc = cloneFunction(originalClosureFunc)

console.log('\n--- Closure Example ---')
console.log('Original Closure Function Result:', originalClosureFunc())
try {
    console.log('Cloned Closure Function Result:', clonedClosureFunc()) // This will likely throw an error or return undefined
} catch (e) {
    console.log('Cloned Closure Function Result: Error -', e.message)
}
