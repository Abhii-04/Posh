import express from 'express';
const router=express.Router();
router.get('/',(req,res)=>{
    try{
        res.render('index',{
            user: req.session?.user || null,
            currentPage: 'home'
        });
    }catch(err){
        console.error(err);
        res.status(500).send('Error loading homepage');
    }
});


router.get('/about',(req,res)=>{
    try{
        res.render('about',{
            user:req.session?.user||null,
            currentPage: 'about'
        });
    }catch(err){
        console.log(err);
        res.status(500).send('Error loading about page');
    }
});

router.get('/contact',(req,res)=>{
    try{
        res.render('contact',{
            user:req.session?.user||null,
            currentPage: 'contact'
        });
    }catch(err){
        console.log(err);
        res.status(500).send('Error loading contact page');
    }
});

router.get('/collection',(req,res)=>{
    try{
        res.render('collection',{
            user:req.session?.user||null,
            currentPage:'collection'
        });
    }catch(err){
        console.log(err);
        res.status(500).send('Error loading products');
    }
});

router.route('/profile')
    .get((req,res)=>{
        try{
            res.render('profile',{
                user:req.session?.user||null,
                currentPage:'Profile'
            })
        }catch(err){
            console.log(err);
            res.status(500).send('Error loading profile page');
        }
    })

router.route('/edit_profile')
    .get((req,res)=>{
        try{
            res.render('edit_profile',{
                user:req.session?.user||null,
                currentPage:'edit_profile'
            })
        }catch(err){
            console.error(err);
            res.status(500).send('error loading edit profile page');
        }
    })

router.route('/cart')
    .get((req,res)=>{
        try{
            res.render('cart',{
                user:req.session?.user||null,
                currentPage:'cart'
            })
        }catch(err){
            console.error(err);
            res.status(500).send('error loading cart page');
        }
    })
export default router;