const SchoolTypeObj = (response) => {
    return {
        id: response.id,
        name: response.name,
        code: response.code,
        about: response.about,
        address: response.address,
        phone: response.phone,
        fax: response.fax,
        email: response.email,
        website: response.website,
        profile_img: response.image,
        profile_background: response.school_pic,
        status: response.status,
        curriculum: response.curriculum,
        country_code: response.country_code,
        country_id: response.country,
        language: response.language,
        longitude: response.longitude,
        latitude: response.latittude,
        created: response.created,
        created_by: response.created_by
    }
}

module.exports = {
    SchoolTypeObj
};