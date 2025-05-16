///////

export function hi() {
    alert('hi')
}

var PXPMM = 5 //  5 pixel per mm

export function pxpmm() {
    return PXPMM
}

export function px2ar(d) {
    return d / (PXPMM * 1000.0)
}
export function ar2px(d) {
    return d * (PXPMM * 1000.0)
}

export function px2mm(d) {
    return d / PXPMM
}
export function mm2px(d) {
    return d * PXPMM
}

export function px2cm(d) {
    return d / (PXPMM * 10)
}
export function cm2px(d) {
    return d * (PXPMM * 10)
}

export function px2dm(d) {
    return d / (PXPMM * 100)
}
export function dm2px(d) {
    return d * (PXPMM * 100)
}

export function px2m(d) {
    return d / (PXPMM * 1000)
}
export function m2px(d) {
    return d * (PXPMM * 1000)
}

export function px2in(d) {
    return d / (PXPMM * 25.4)
}
export function in2px(d) {
    return d * (PXPMM * 25.4)
}

export function px2ft(d) {
    return d / (PXPMM * 25.4 * 12)
}
export function ft2px(d) {
    return d * (PXPMM * 25.4 * 12)
}

export function px2yd(d) {
    return d / (PXPMM * 25.4 * 36)
}
export function yd2px(d) {
    return d * (PXPMM * 25.4 * 36)
}

export function px2pt(d) {
    //0.3528 mm per pt
    return d / (PXPMM * 0.3528)
}
export function pt2px(d) {
    //0.3528 mm per pt
    return d * (PXPMM * 0.3528)
}

