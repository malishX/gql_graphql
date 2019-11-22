const GuardianTypeObj = (response) => {
    return {
        id: response.id,
        contact_id: response.contact_id,
        name: response.name,
        email: response.email,
        mobile: response.mobile,
    }
}

module.exports = {
    GuardianTypeObj
};