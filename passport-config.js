const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

let initialize = (passport , getUserByEmail , getUserById) => {

    let authenticateUser = async (email , password , done) => {
        const user = getUserByEmail(email);
        console.log({user});
        if ( user == null ) {
            return done(null , false , { message : 'no user with that email' } );
        }
    
        try {
            const result = await bcrypt.compare(password , user.password);
            console.log( { result });
            if ( result ) {
                return done(null , user )
            } else {
                return done(null, false , { message : 'incorrect password'});
            }
        } catch (error) {
            return done(error);
        }
    }

    passport.use(new LocalStrategy({
        usernameField : 'email'
    }, authenticateUser));
    passport.serializeUser( (user,done) => done( null, user.id) );
    passport.deserializeUser( (id,done) => done( null, getUserById(id) ) );
}

module.exports = initialize;