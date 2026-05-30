function isAuth(req,res,next){
    if(req.isAuthenticated()){
        next()
    }else{

        res.status(401).render('401',{title:'Unauthorized', message: 'You cannot access this resource becuase you are not authenticated' })
    }
}

function isMember(req,res,next){
    if(req,isAuthenticated() && req.user.membership_status){
        next()
    }else{
        res.status(401).render('401',{title: 'Unauthorized', message:'You cannot access this resource because you are not a member'})
    }
}
function isAdmin(req,res,next){
    if(req.isAuthenticated() && req.user.is_admin){
        next()
    }else{
        res.status(401).json('401',{title: 'Unauthorized', message:'You cannot access this resource because you are not an admin'})
    }
}

module.exports = { isAuth, isAdmin, isMember }