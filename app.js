require('dotenv').config()
const express = require('express')
const path = require('node:path')

const session = require('express-session')
const psqlStore = require('connect-pg-simple')(session)
const pgPool = require('./db/pool')

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

const indexRouter = require('./routes/indexRouter')
const pool = require('./db/pool')

const flash = require('connect-flash')
//CREA EXPRESS APP
const app = express()
const PORT = 3000
app.listen(PORT,(error)=>{
    if(error){
        throw error
    }
    console.log(`EXPRESS APP. LISTENING ON PORT: ${PORT}`);
})


//SET NECESSARY MIDDLEWARE
const assetsPath = path.join(__dirname, 'public')
app.use(express.static(assetsPath))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

//SET SESSION STORAGE

const sessionStore = new psqlStore({
    pool: pgPool,
    tableName: 'session'
})

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 48 
    }
}))



//PASSPORT AUTHENTICATION
passport.use(
    new LocalStrategy(async (username, password, done)=>{
        try {
            const {rows} = await pool.query('SELECT * FROM users WHERE username = $1', [username])
            const user = rows[0]

            if(!user){
                return done(null, false, {message: 'Incorrect username'})
            }
            let match = await bcrypt.compare(password,user.password)
            if(!match){
                return done(null, false, {message: 'Incorrect password'})
            }
            return done(null, user, {message: 'Logged in successfully'})
        } catch (err) {
            return done(err)
        }
    })
)

passport.serializeUser((user,done)=>{
    done(null, user.id)
})

passport.deserializeUser(async (id, done)=>{
    try {
        const {rows} = await pool.query('SELECT * FROM users WHERE id=$1',[id])
        const user = rows[0]
        
        done(null,user)
    } catch (err) {
        done(err)
    }
})

app.use(passport.session())
app.use(flash())



//SET ROUTERS

app.use('/',indexRouter)

app.use((err, req, res, next)=>{
    console.log(err.message);
    res.status(err.statusCode || 500).render('errorPage', {title: 'Error', errorMessage: err.message})
})