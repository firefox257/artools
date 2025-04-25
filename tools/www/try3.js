require('./sharedjs/utils.js')



/**
 * Adds a property with a getter and a setter to the global object (globalThis).
 *
 * @param {string} propertyName The name of the property to add.
 * @param {function(): any} getterFunction The function to serve as the getter for the property.
 * @param {function(any): void} setterFunction The function to serve as the setter for the property.
 */
function addGlobalGetterSetter(propertyName, getterFunction, setterFunction) {
    if (typeof propertyName !== 'string' || propertyName.length === 0) {
        console.error('Invalid property name provided.')
        return
    }

    if (typeof getterFunction !== 'function') {
        console.error('Invalid getter function provided.')
        return
    }

    if (typeof setterFunction !== 'function') {
        console.error('Invalid setter function provided.')
        return
    }

    Object.defineProperty(globalThis, propertyName, {
        get: getterFunction,
        set: setterFunction,
        // Optional: configure the property's writability, enumerable, and configurable attributes
        enumerable: true, // Set to true if you want the property to be enumerable
        configurable: true // Set to true if you want the property to be configurable
    })
}


const EventTemplate =(name)=>`
function On${name}Event() {}
dclass(On${name}Event, [], {
    prototype: {
        _on${name}Observer: [],
        subscribeOn${name}: function (f) {
            this._on${name}Observer.push(f)
        },
        triggerOn${name}: function () {
            var c = this._on${name}Observer
            for (var i = 0; i < c.length; i++) {
                c[i]()
            }
        }
    }
})

`;


$$(EventTemplate('Change'))

console.log(OnChangeEvent.name)




function try1() {}
dclass(try1, [], {
    prototype: {
        x: 123,
        func: function () {
            console.log(this.x)
        }
    } //end prototype
}) //end try1

function try2() {}
dclass(try2, [try1], {
    prototype: {
        func: function () {
            console.log('try2 ' + this.x)
            this.try1Super.prototype.func.apply(this)
        }
    } //end prototype
}) //end try1

var t1 = new try2()
t1.func()

console.log('done')
