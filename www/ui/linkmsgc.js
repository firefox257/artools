var fs = require('fs')
var path = require('path')

var loaded = {}
var maps = {}
var mapnames = ['']

var linkmsgc = (name) => {
    var atpath = maps[name]

    if (!loaded[name]) {
        loaded[name] = new Function(fs.readFileSync(atpath, 'utf8'))()
    }

    return loaded[name]
}

linkmsgc.map = (jsonfile) => {
    var startdir = path.dirname(jsonfile)
    var obj = JSON.parse(fs.readFileSync(jsonfile, 'utf8'))

    for (var i in obj) {
        var fn = mapnames[mapnames.length - 1] + i
        var filenames = obj[i]

        for (var ii = 0; ii < filenames.length; ii++) {
            var filename = filenames[ii]

            if (filename.endsWith('.json')) {
                mapnames.push(fn + '.')
                DI.map(path.join(startdir, filename))
                mapnames.pop()
            } else {
                maps[fn] = path.join(startdir, filename)
            }
        }
    }
}

globalThis.linkmagc = linkmagc
