import express from 'express';
import {register,login,oauthcallback, logout} from '../controllers/authcontroller.js';
const router = express.Router();
import supabase from    '../config/supabase.js';


// -------------------- REGISTER --------------------
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


// -------------------- GOOGLE OAUTH CALLBACK(FOR REGISTRATION) --------------------
router.route('/register/google')
    .get(async (req,res)=>{
        try{
            const{data,error} = await supabase.auth.signInWithOAuth({
                provider:'google',
                options:{
                    redirectTo:'http://localhost:5000'
                }
            })
        }catch(error){
            console.log(error);
            res.status(500).send('error registering through google', error);
        }
    })




// -------------------- LOGIN --------------------
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



    // -------------------- GOOGLE OAUTH CALLBACK(FOR LOGIN) --------------------
router.route('/login/google')
    .get(async (req,res)=>{
        try{
            const{data,error}=await supabase.auth.signInWithOAuth({
                provider:'google',
                options:{
                    redirectTo:'http://localhost:5000'
                }
            });
           return res.redirect(data.url);
        }catch(error){
            console.log(error);
            res.status(500).send('Error logging in with Google');
        }
    })

router.get('/oauth/callback', oauthcallback);

// allow GET logout because navbar uses an <a href="/logout"> link
router.get('/logout', logout);

export default router;