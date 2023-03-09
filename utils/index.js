const path = require("path")

module.exports.getBasenameFormUrl = (urlStr) => {
    const url = new URL(urlStr)
    return path.basename(url.pathname)
}