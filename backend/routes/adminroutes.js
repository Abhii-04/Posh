import express from 'express';
import supabase from '../config/supabase.js';
import { supabaseAdmin } from '../config/supabase.js';
import { randomUUID } from 'crypto';

const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (!req.session.user.is_admin) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
}

router.use(requireAdmin);

router.get('/api/admin/stats', async (req, res) => {
  try {
    const { data: users } = await supabase
      .from('User')
      .select('id', { count: 'exact' });

    const { data: products } = await supabase
      .from('products')
      .select('*');

    const { data: orders } = await supabase
      .from('orders')
      .select('*');

    const stats = {
      total_users: users?.length || 0,
      total_products: products?.length || 0,
      active_products: products?.filter(p => p.is_active)?.length || 0,
      total_orders: orders?.length || 0,
      total_revenue: orders?.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0).toFixed(2) || 0,
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/api/admin/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/api/admin/users/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.put('/api/admin/users/:id', async (req, res) => {
  try {
    const { name, email, phone, address, role } = req.body;
    
    const { data, error } = await supabaseAdmin
      .from('User')
      .update({ name, email, phone, address, role })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'User updated successfully', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/api/admin/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.session.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const { error } = await supabaseAdmin
      .from('User')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

router.get('/api/admin/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/api/admin/products', async (req, res) => {
  try {
    const { name, description, price, stock, is_active } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([{
        id: randomUUID(),
        name,
        description: description || null,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        is_active: is_active !== false,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Product created successfully', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/api/admin/products/:id', async (req, res) => {
  try {
    const { name, description, price, stock, is_active } = req.body;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        stock: stock ? parseInt(stock) : undefined,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Product updated successfully', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

router.get('/api/admin/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.get('/api/admin/orders/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

router.put('/api/admin/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Order updated successfully', data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
