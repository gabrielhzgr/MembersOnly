const {body, validationResult } = require('express-validator')
const pool = require('../db/pool')
const bcrypt = require('bcryptjs')
const {isAuth, isAdmin, isMember}= require('./authMiddleware')
const { errorMonitor } = require('pg/lib/client')

async function getIndex(req,res,next){
    try {
        const messages =await pool.query('SELECT messages.id, title, created_at, message, username, first_name, last_name FROM messages JOIN users ON user_id=users.id')
        
        
        let flashError = req.flash('error') //become admin or member authentication error
        if(flashError.length>0){ 
            flashError = {type: 'flash error', messages: flashError}
        }else{
            flashError = null
        }

        let flashSuccess = req.flash('success') // login or member authentication success
        if(flashSuccess.length>0){ 
            flashSuccess = {type: 'flash success', messages: flashSuccess}
        }else{
            flashSuccess = null
        }
        res.render('index',{title: 'Members Only | Messages', messages: messages.rows, user: req.user, flashError, flashSuccess})
    } catch (err) {
        next(err)
    }
}
   
function getSignUpForm(req,res,next){
    res.render('signUp',{title: 'Sign Up'})
}

const validateUser = [
    body('username').trim()
        .isLength({min:1, max: 255}).withMessage('username must be 1 to 255 characters')
        .custom(async value=>{
            const {rows} = await pool.query('SELECT username FROM users WHERE username=$1',[value])
            return rows.length == 0
        }).withMessage('username already in use'),
    body('firstName').trim()
        .isLength({min:1, max: 255}).withMessage('First name must be 1 to 255 characters'),
    body('lastName').trim()
        .isLength({min:1, max: 255}).withMessage('username must be 1 to 255 characters'),
    body('password')
        .isLength({min: 1, max: 255}).withMessage('username must be 1 to 255 characters'),
    body('confirm-password')
        .custom((value, {req})=>{
            return value == req.body.password
        })
        .withMessage('Password and confirm password must match')          
]
const createUser = [validateUser, async (req,res,next)=>{
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            res.status(400).render('signUp',{title: 'Sign Up', errors: errors.array()})
            return
        }
        let {username, firstName, lastName, password} = req.body
        password = await bcrypt.hash(password, 10)
        await pool.query('INSERT INTO users(username, first_name, last_name, password, membership_status, is_admin) VALUES($1,$2,$3,$4,FALSE,FALSE)',
            [username, firstName, lastName, password]
        )
        res.redirect('/login')
    }catch(err){
        next(err)
    }
}]

function getLoginForm(req,res,next){
    // if done(null, false) was called because pf wrong credentials 
    //req.flash('error') will be an array
    let flashError = req.flash('error') //login authentication error
    if(flashError.length>0){ 
        flashError = {type: 'flash error', messages: flashError}
    }else{
        flashError = null
    }
    res.render('login', {title: 'Login', flashError})
}

const getBecomeMemberForm = (req,res,next)=>{
    let flashError = req.flash('error') //incorrect answer
    if(flashError.length>0){ 
        flashError = {type: 'flash error', messages: flashError}
    }else{
        flashError = null
    }
    res.render('becomeMember',{title: 'Become a member', user: req.user, flashError})
}

const  updateMemberStatus = [isAuth, async (req,res,next)=>{
    try {
        let { answer, userId}  = req.body
        userId = Number(userId)
        if(answer.trim().toLowerCase().includes('wrong')){ //correct answer
            await pool.query('UPDATE users SET membership_status=TRUE WHERE id=$1',
                [userId])
            req.flash('success', 'You became a member of the club!')
            res.redirect('/')
            return
        }

        req.flash('error','Your answer is incorrect') //incorrect answer
        res.status(400).render('becomeMember', {title: 'Become a member', user: req.user})
    } catch (err) {
        next(err)
    }
}]

const getBecomeAdminForm = (req,res,next)=>{
    let flashError = req.flash('error') //incorrect answer
    if(flashError.length>0){ 
        flashError = {type: 'flash error', messages: flashError}
    }else{
        flashError = null
    }
    res.render('becomeAdmin', {title: 'Become an admin', user: req.user, flashError})
}

const updateAdminStatus = [isAuth, isMember, async(req,res,next)=>{
    try {
        let { answer, userId}  = req.body
        userId = Number(userId)
        if(answer.trim().toLowerCase().includes('towel')){
            await pool.query('UPDATE users SET is_admin=TRUE WHERE id=$1',
                [userId])
            req.flash('success', 'You became an admin of the club!')
            res.redirect('/')
            return
        }
        req.flash('error','Your answer is incorrect') //incorrect answers
        res.status(400).render('becomeAdmin', {title: 'Become an admin', user: req.user})
    } catch (err) {
        next(err)
    }
}]

const getNewMessageForm = [isAuth, (req,res,next)=>{
    res.render('newMessage',{title: 'New Message'})
}]

const validateMessage = [
    body('title').trim()
        .isLength({min: 1, max: 255}).withMessage('Title must be between 1 and 255 characters')
]

const createMessage = [isAuth, validateMessage, async (req,res,next)=>{
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            res.render('newMessage',{title: 'New Message', errors: errors.array()})
            return
        }
        const {title, message} = req.body
        await pool.query('INSERT INTO messages(title, message, created_at, user_id) VALUES ($1, $2, $3, $4)',
        [title, message, new Date(), req.user.id])
        res.redirect('/')
    } catch (err) {
        next(err)
    } 
}]

const deleteMessage = [isAdmin, async(req,res,next)=>{
    try {
        let { messageId } = req.params
        messageId = Number(messageId)
        await pool.query('DELETE FROM messages WHERE id=$1', [messageId])
        res.redirect('/')
    } catch (err) {
        next(err)
    }
}]

function logout(req,res,next){
    req.logout()
    res.redirect('/')
}

module.exports = {
    getSignUpForm, 
    createUser,
    getLoginForm,
    getBecomeMemberForm,
    updateMemberStatus,
    getBecomeAdminForm,
    updateAdminStatus,
    getIndex,
    getNewMessageForm,
    createMessage,
    deleteMessage,
    logout
}