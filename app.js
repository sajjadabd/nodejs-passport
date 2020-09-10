require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const passport = require('passport');

const flash = require('express-flash');
const session = require('express-session');

const methodOverride = require('method-override');

// const { users , getUserByEmail } = require('./users');
const users = [];

let getUserByEmail = (email) => {
    return users.find( (user) => {
        return user.email == email;
    })
}

let getUserById = (id) => {
    return users.find( (user) => {
        return user.id == id;
    })
}

const initializePassport = require('./passport-config');
initializePassport(passport , getUserByEmail, getUserById);

const port = 3000;
const app = express();


app.set('view-engine','ejs');
app.use(express.urlencoded({ extended : false }));
app.use(methodOverride('_method'));

/* 
requirements for passport to work correctly
*/

app.use(flash());
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false
}))

app.use(passport.initialize());
app.use(passport.session());


//------------------------------
// MIDDLEWARE


let checkAuthenticated = (req,res,next) => {
    if(req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/login');
    }
}

let checkNotAuthenticated = (req,res,next) => {
    if(!req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }
}


//-------------------------

app.get('/', checkAuthenticated ,  (req, res) => {
    return res.render('index.ejs', { username : req.user.username } );
});

app.get('/login', checkNotAuthenticated , (req, res) => {
    return res.render('login.ejs');
});

app.post('/login', checkNotAuthenticated , passport.authenticate('local' , {
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash : true
}));

app.get('/register', checkNotAuthenticated , (req, res) => {
    return res.render('register.ejs');
});

app.post('/register', checkNotAuthenticated , async (req, res) => {
    try {
        let hashedPassword = await bcrypt.hash(req.body.password , 10);
        let newUser = {
            id : uuidv4(),
            username : req.body.username,
            email : req.body.email,
            password : hashedPassword
        }
        users.push(newUser);
        console.log(users);
        res.redirect('/login');
    } catch (error) {
        res.redirect('/register');
    }
    
    /* console.log(req.body);
    return res.json(req.body); */
});

app.delete('/logout' , (req, res) => {
    req.logOut();
    res.redirect('/login');
})



app.listen(port , () => {
    console.log(`listening at port ${port}`);
});