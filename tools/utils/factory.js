
//do not use
var factoryaAbstractNames = []
var factoryImplementations = []

var factory = (n) => {
    var o = factoryImplementations[n]
    if (o === undefined) {
        throw new Error('No factory name ' + n + ' could be found.')
    }
    return o
}

factory.abstract = (n, o) => {
    factoryaAbstractNames[n] = o
}

factory.implement = (a, o) => {
    var ao = factoryaAbstractNames[a]
    for (var i in ao) {
        if (o[i] === undefined) {
            throw new Error(
                'Must implement function ' +
                    i +
                    ' for abstract factory ' +
                    a +
                    '.'
            )
        }
    }
    factoryImplementations[a] = o
}

console.log("factory");
module.exports = factory;




