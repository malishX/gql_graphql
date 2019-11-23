const FileTypeObj = (response)=>{
    return {
        name: "", //call the function of getFileName() here which will get the name from the url.
        url: response.link,
        type: response.type,
    }
}

module.exports = {
    FileTypeObj
}