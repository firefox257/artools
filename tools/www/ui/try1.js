

globalThis.Msgc = (() => {
    var calls = {}
    var o = (id, ...args) => {
        if (calls[id]) {
            var a = calls[id]
            var l = a.length
			var reta=[]
            for (var i = 0; i < l; i++) {
                var ret = a[i].apply(null, args)
				if(ret!==undefined) reta.push(ret)
            }
			return reta
        }
    }
    o.add = (id, func) => {
        if (!calls[id]) calls[id] = []
        calls[id].push(func)
    }
    o.remove = (id, func) => {
        var a = calls[id]
        var l = a.length
        for (var i = 0; i < l; i++) {
            if (a[i] === func) {
                calls[id].splice(i, 1)
                break
            }
        }
    }
    o.runScript = (text) => {
        var a = text
            .split('\n')
            .filter((n) => n.trim() !== '')
            .map((t) => t.trim())
        var l = a.length
        for (var i = 0; i < l; i++) {
            //alert("|"+a[i]+"|");
            eval(`o(${a[i]});`)
        }
    }
    o.func = (id) => {
        //todo add function wrapper
        return calls[id]
    }
	

    return o
})




