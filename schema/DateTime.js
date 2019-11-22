const DateTimeTypeObj = (DateTime)=>{
    DateTime = DateTime.split(" ");
    let time = DateTime[0];
    let date = DateTime[1];
    return {
        date,
        time 
    };
}

module.exports = {
    DateTimeTypeObj
}