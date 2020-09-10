const users = [];

let getUserByEmail = (email) => {
    return users.find( (user) => {
        user.email === email
    })
}

module.exports = {
    users ,
    getUserByEmail ,
}