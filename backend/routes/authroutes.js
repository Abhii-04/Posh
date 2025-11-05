import express from 'express';
import {register,login,oauthcallback, logout} from '../controllers/authcontroller.js';
const router = express.Router();

router.route('/register')
    .get((req,res)=>{
        try{
            res.render('register',{
                user: req.session?.user||null,
                currentPage: 'register'

            });
        }catch(err){
            console.log(err);
            res.status(500).send('Error loading registration page');
        }
    })
    .post(register);

router.route('/login')
    .get((req,res)=>{
        try{
            res.render('login',{
                user: req.session?.user||null,
                currentPage: 'login'
            });
        }catch(err){
            console.log(err);
            res.status(500).send('Error loading login page');
        }
    })
    .post(login);

router.get('/oauth/callback', oauthcallback);

// allow GET logout because navbar uses an <a href="/logout"> link
router.get('/logout', logout);

export default router;