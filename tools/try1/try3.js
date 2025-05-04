const targetObject = []

const handler = {
    // The get trap intercepts property access (including obj[...] and obj.prop)
    get(target, property, receiver) {
		
		
		return target[property]
		//return Reflect.get(target, property, receiver)
    },

    // The set trap intercepts property assignment (including obj[...] = value and obj.prop = value)
    set(target, property, value, receiver) {
        
		console.log(typeof property)
		console.log("name: " + property)
		/*console.log(
            `Attempting to SET property: ${String(property)} to value: ${value}`
        )

        // You can add your custom logic here.
        // For example, validate the value:
        if (typeof value !== 'string' && typeof value !== 'number') {
            console.log(
                `Cannot set property "${String(
                    property
                )}". Only strings or numbers are allowed.`
            )
            return false // Indicate that the assignment failed
        }

        // Or modify the value before setting:
        if (typeof value === 'string') {
            value = value.trim()
        }

        // Use Reflect.set to forward the assignment to the target object
        // this is the default behavior if no trap is defined.*/
        //return Reflect.set(target, property, value, receiver)
		target[property] = value
    }
}

const p = new Proxy(targetObject, handler)

p["1"]= "hi"
console.log(p[1])




