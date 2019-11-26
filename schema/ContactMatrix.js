// returns contact type in a true and false flags object
const ContactMatrixObj = (guardian, staff, student)=>{
    return {
        guardian,
        staff,
        student
    }
}

module.exports = {
    ContactMatrixObj
}