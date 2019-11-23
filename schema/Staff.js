const StaffTypeObj = (response) => {
    return {
        id: response.id,
        contact_id: response.contact_id,
        name: response.name,
        email: response.email,
        mobile: response.mobile,
        in_multiple_schools: response.multiple_school
    }
}

module.exports = {
    StaffTypeObj
};