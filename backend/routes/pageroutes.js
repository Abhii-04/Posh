import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../frontend/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile_' + req.session.user.id + '_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    
    if (mime && ext) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

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

// Admin guard using Express session
function requireAdmin(req, res, next) {
  if (!req.session?.user) {
    return res.redirect('/login');
  }
  if (!req.session.user.is_admin) {
    return res.status(403).render('index', { 
      user: req.session.user,
      currentPage: 'home',
      error: 'Access denied. Admin privileges required.' 
    });
  }
  next();
}

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

router.get('/admin', requireAdmin, (req, res) => {
  try {
    res.render('admin/dashboard', {
      user: req.session.user,
      currentPage: 'admin',
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error loading admin dashboard');
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

router.post('/update-profile', requireAuth, upload.single('profile_image'), (req, res) => {
  try {
    const { username, email, address, phone, design_style, remove_profile_image } = req.body;

    if (remove_profile_image === '1' && req.session.user.profile_image) {
      const oldImagePath = path.join(uploadsDir, req.session.user.profile_image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      req.session.user.profile_image = null;
    }

    if (req.file) {
      if (req.session.user.profile_image) {
        const oldImagePath = path.join(uploadsDir, req.session.user.profile_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      req.session.user.profile_image = req.file.filename;
    }

    req.session.user.name = username || req.session.user.name;
    req.session.user.email = email || req.session.user.email;
    req.session.user.address = address || req.session.user.address;
    req.session.user.phone = phone || req.session.user.phone;
    req.session.user.design_style = design_style || null;

    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to save session' });
      }
      res.json({ message: 'Profile updated successfully' });
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
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

router.get('/collection', (req, res) => {
  try {
    res.render('collection', {
      user: req.session?.user || null,
      currentPage: 'collection',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading collection page');
  }
});

router.get('/api/products', async (req, res) => {
  try {
    const supabase = (await import('../config/supabase.js')).default;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      return res.json([]);
    }
    
    res.json(data || []);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.json([]);
  }
});

router.get('/api/products/:id', async (req, res) => {
  try {
    const supabase = (await import('../config/supabase.js')).default;
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error || !data) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(data);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Error fetching product' });
  }
});

export default router;
