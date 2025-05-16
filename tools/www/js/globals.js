///////


globalThis.$q = (path) => {
    return document.querySelector(path)
}

globalThis.$qa = (path) => {
    return document.querySelectorAll(path)
}
