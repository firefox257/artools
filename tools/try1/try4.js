class MyClass {
    constructor(name) {
        this.name = name
    }
}

const handler = {
    construct(target, argumentsList, newTarget) {
        console.log(
            `Intercepting construction of ${target.name} with arguments:`,
            argumentsList
        )

        // You can perform actions here before creating the instance

        // Create the actual instance using the original constructor
        const instance = Reflect.construct(target, argumentsList, newTarget)
		console.log("name "+instance.name)
        // You can modify the instance or perform actions after creation
        instance.createdAt = new Date()

        console.log('Instance created:', instance)

        return instance // Must return an object
    }
}

const MyProxiedClass = new Proxy(MyClass, handler)

const myInstance = new MyProxiedClass('Alice')
// Output:
// Intercepting construction of MyClass with arguments: [ 'Alice' ]
// Instance created: MyClass { name: 'Alice', createdAt: ... }

console.log(myInstance.name) // Alice
console.log(myInstance.createdAt) // Date object
