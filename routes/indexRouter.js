const express = require('express')
const indexRouter = express.Router()
const indexController = require('../controllers/indexControllers')
const passport = require('passport')


indexRouter.get('/', indexController.getIndex)
indexRouter.get('/sign-up',indexController.getSignUpForm)
indexRouter.get('/become-member',indexController.getBecomeMemberForm)
indexRouter.post('/update-member-status', indexController.updateMemberStatus)
indexRouter.get('/become-admin',indexController.getBecomeAdminForm)
indexRouter.post('/update-admin-status', indexController.updateAdminStatus)
indexRouter.post('/sign-up', indexController.createUser)
indexRouter.get('/login',indexController.getLoginForm)
indexRouter.post('/login', function (req,res,next){
    passport.authenticate('local', {failureFlash: true, successFlash: true, failureRedirect: '/login', successRedirect: '/'})(req,res,next)
})
indexRouter.get('/new-message', indexController.getNewMessageForm)
indexRouter.post('/new-message', indexController.createMessage)
indexRouter.get('/logout', indexController.logout)
indexRouter.get('/delete/:messageId', indexController.deleteMessage)

module.exports = indexRouter
