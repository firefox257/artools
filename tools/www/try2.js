// The target object that the proxy wraps.
// You can store the actual data here, or generate data dynamically in the traps.
const targetObject = {}

const handler = {
    // The 'get' trap intercepts property access (e.g., obj[key])
    get(target, property, receiver) {
        console.log(
            `Intercepting GET request for property: ${String(property)}`
        )

        // You can add custom logic here based on the property key
        if (property === 'special') {
            return 'This is a value from the getter logic!'
        }

        // Default behavior: retrieve the property from the target object
        // Using Reflect.get is the recommended way to forward the operation
        return Reflect.get(target, property, receiver)
    },

    // The 'set' trap intercepts property assignment (e.g., obj[key] = value)
    set(target, property, value, receiver) {
        console.log(
            `Intercepting SET request for property: ${String(
                property
            )} with value: ${value}`
        )

        // You can add custom logic here (e.g., validation, side effects)
        if (typeof value !== 'number') {
            console.warn(
                `Warning: Property "${String(
                    property
                )}" should ideally be a number. Setting anyway.`
            )
            // You could also throw an error or prevent the assignment: return false;
        }

        // Default behavior: set the property on the target object
        // Using Reflect.set is the recommended way to forward the operation
        return Reflect.set(target, property, value, receiver) // Must return true to indicate success
    }
}

const proxiedObject = new Proxy(targetObject, handler)

// Now, accessing or setting properties using [] brackets will trigger the proxy traps:

console.log(proxiedObject['someKey']) // Triggers the 'get' trap

proxiedObject['anotherKey'] = 123 // Triggers the 'set' trap

console.log(proxiedObject['anotherKey']) // Triggers the 'get' trap

console.log(proxiedObject['special']) // Triggers the 'get' trap and returns custom value

proxiedObject['numericValue'] = 42 // Triggers the 'set' trap (passes validation warning)
proxiedObject['nonNumericValue'] = 'hello' // Triggers the 'set' trap (with warning)

console.log(proxiedObject['numericValue'])
console.log(proxiedObject['nonNumericValue'])
