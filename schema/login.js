const LoginTypeObj = (response) => {
    return {
        otp: "1234",
        auth_token: response.auth_token,
        contact_id: response.id
    }
}

module.exports = {
    LoginTypeObj
};