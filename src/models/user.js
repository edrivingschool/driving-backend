class User {
    constructor(id, firstName, lastName, email, phoneNumber, password = null, universityId = null, profilePicture = null) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.profilePicture = profilePicture;
    }
}

module.exports = User;
