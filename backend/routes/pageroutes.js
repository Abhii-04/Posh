import express from 'express';

const router = express.Router();

// Simple auth guard using Express session
function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.redirect('/login');
  }
  next();
}

router.get('/', (req, res) => {
  try {
    res.render('index', {
      user: req.session?.user || null,
      currentPage: 'home',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading homepage');
  }
});

router.get('/about', (req, res) => {
  try {
    res.render('about', {
      user: req.session?.user || null,
      currentPage: 'about',
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error loading about page');
  }
});

router.get('/contact', (req, res) => {
  try {
    res.render('contact', {
      user: req.session?.user || null,
      currentPage: 'contact',
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error loading contact page');
  }
});

router.get('/product', (req, res) => {
  try {
    res.render('product', {
      user: req.session?.user || null,
      currentPage: 'product',
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error loading product page');
  }
});

// -------------------- PROTECTED PAGES --------------------
router.get('/profile', requireAuth, (req, res) => {
  try {
    res.render('profile', {
      user: req.session.user, // guaranteed by requireAuth
      currentPage: 'Profile',
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error loading profile page');
  }
});

router.get('/edit_profile', requireAuth, (req, res) => {
  try {
    res.render('edit_profile', {
      user: req.session.user,
      currentPage: 'edit_profile',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading edit profile page');
  }
});

router.get('/cart', requireAuth, (req, res) => {
  try {
    res.render('cart', {
      user: req.session.user,
      currentPage: 'cart',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading cart page');
  }
});

export default router;
