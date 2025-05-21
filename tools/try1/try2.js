const proto = {
    greet() {
        return `Hello, ${this.name}!`
    }
}

const target = {
    name: 'Target'
}

// Set the prototype of the target
Object.setPrototypeOf(target, proto)

const handler = {
    get(target, property, receiver) {
        console.log(
            `Getting property "${String(property)}" on receiver`,
            receiver
        )
        // Use Reflect.get to correctly handle inheritance and 'this' binding
        return Reflect.get(target, property, receiver)
    }
}

const proxy = new Proxy(target, handler)

const inheritingObj = Object.create(proxy)
inheritingObj.name = 'Inheritor'

console.log(proxy.name) // Output: Getting property "name" on receiver Proxy {...} \n Target
console.log(proxy.greet()) // Output: Getting property "greet" on receiver Proxy {...} \n Hello, Target!

console.log(inheritingObj.name) // Output: Getting property "name" on receiver { name: 'Inheritor' } \n Inheritor
console.log(inheritingObj.greet()) // Output: Getting property "greet" on receiver { name: 'Inheritor' } \n Hello, Inheritor!



