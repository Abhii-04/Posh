const API_BASE = '';

let currentAction = null;
let currentId = null;

const tabButtons = document.querySelectorAll('.menu-item:not(.logout)');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const tabName = button.getAttribute('data-tab');
    
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    button.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    if (tabName === 'dashboard') loadStats();
    if (tabName === 'users') loadUsers();
    if (tabName === 'products') loadProducts();
    if (tabName === 'orders') loadOrders();
  });
});

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
}

function openModal(modalId) {
  document.getElementById(modalId).classList.add('show');
}

document.querySelectorAll('.close-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    closeModal(e.target.closest('.modal').id);
  });
});

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal.id);
    }
  });
});

document.getElementById('user-modal-close').addEventListener('click', () => closeModal('user-modal'));
document.getElementById('product-modal-close').addEventListener('click', () => closeModal('product-modal'));
document.getElementById('order-modal-close').addEventListener('click', () => closeModal('order-modal'));
document.getElementById('confirm-cancel').addEventListener('click', () => closeModal('confirm-modal'));

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/stats`);
    const stats = await res.json();
    
    document.getElementById('total-users').textContent = stats.total_users || 0;
    document.getElementById('total-products').textContent = stats.total_products || 0;
    document.getElementById('active-products').textContent = stats.active_products || 0;
    document.getElementById('total-orders').textContent = stats.total_orders || 0;
    document.getElementById('total-revenue').textContent = '$' + (stats.total_revenue || 0);
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

async function loadUsers() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/users`);
    const users = await res.json();
    
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = users.map(user => `
      <tr>
        <td>${user.id.substring(0, 8)}</td>
        <td>${user.name || '-'}</td>
        <td>${user.email}</td>
        <td>${user.phone || '-'}</td>
        <td>${user.address || '-'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-primary btn-small" onclick="editUser('${user.id}')">Edit</button>
            <button class="btn btn-danger btn-small" onclick="deleteUser('${user.id}', '${user.name}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    document.getElementById('user-search').addEventListener('input', (e) => {
      const search = e.target.value.toLowerCase();
      document.querySelectorAll('#users-table tbody tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
      });
    });
  } catch (err) {
    console.error('Error loading users:', err);
  }
}

async function editUser(userId) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}`);
    const user = await res.json();
    
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-name').value = user.name || '';
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-phone').value = user.phone || '';
    document.getElementById('user-address').value = user.address || '';
    document.getElementById('user-role').value = user.role || 'user';
    
    openModal('user-modal');
  } catch (err) {
    console.error('Error loading user:', err);
    alert('Error loading user details');
  }
}

document.getElementById('user-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const userId = document.getElementById('user-id').value;
  const data = {
    name: document.getElementById('user-name').value,
    email: document.getElementById('user-email').value,
    phone: document.getElementById('user-phone').value,
    address: document.getElementById('user-address').value,
    role: document.getElementById('user-role').value,
  };
  
  try {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (res.ok) {
      closeModal('user-modal');
      loadUsers();
      alert('User updated successfully');
    } else {
      alert('Error updating user');
    }
  } catch (err) {
    console.error('Error updating user:', err);
    alert('Error updating user');
  }
});

function deleteUser(userId, userName) {
  currentAction = () => confirmDelete(`/api/admin/users/${userId}`, 'user', () => loadUsers());
  document.getElementById('confirm-message').textContent = `Are you sure you want to delete user "${userName}"?`;
  openModal('confirm-modal');
}

async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/products`);
    const products = await res.json();
    
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = products.map(product => `
      <tr>
        <td>${product.id.substring(0, 8)}</td>
        <td>${product.name}</td>
        <td>$${parseFloat(product.price).toFixed(2)}</td>
        <td>${product.stock || 0}</td>
        <td><span class="status-${product.is_active ? 'good' : 'bad'}">${product.is_active ? '✓ Active' : '✗ Inactive'}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-primary btn-small" onclick="editProduct('${product.id}')">Edit</button>
            <button class="btn btn-danger btn-small" onclick="deleteProduct('${product.id}', '${product.name}')">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');

    document.getElementById('product-search').addEventListener('input', (e) => {
      const search = e.target.value.toLowerCase();
      document.querySelectorAll('#products-table tbody tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
      });
    });
  } catch (err) {
    console.error('Error loading products:', err);
  }
}

document.getElementById('add-product-btn').addEventListener('click', () => {
  document.getElementById('product-id').value = '';
  document.getElementById('product-form').reset();
  document.querySelector('#product-modal .modal-header h2').textContent = 'Add Product';
  openModal('product-modal');
});

async function editProduct(productId) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/products/${productId}`);
    if (!res.ok) {
      alert('Error loading product');
      return;
    }
    const product = await res.json();
    
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock || 0;
    document.getElementById('product-active').checked = product.is_active;
    
    document.querySelector('#product-modal .modal-header h2').textContent = 'Edit Product';
    openModal('product-modal');
  } catch (err) {
    console.error('Error loading product:', err);
    alert('Error loading product');
  }
}

document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const productId = document.getElementById('product-id').value;
  const data = {
    name: document.getElementById('product-name').value,
    description: document.getElementById('product-description').value,
    price: parseFloat(document.getElementById('product-price').value),
    stock: parseInt(document.getElementById('product-stock').value),
    is_active: document.getElementById('product-active').checked,
  };
  
  try {
    const url = productId 
      ? `${API_BASE}/api/admin/products/${productId}` 
      : `${API_BASE}/api/admin/products`;
    
    const method = productId ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (res.ok) {
      closeModal('product-modal');
      loadProducts();
      alert(productId ? 'Product updated successfully' : 'Product created successfully');
    } else {
      alert('Error saving product');
    }
  } catch (err) {
    console.error('Error saving product:', err);
    alert('Error saving product');
  }
});

function deleteProduct(productId, productName) {
  currentAction = () => confirmDelete(`/api/admin/products/${productId}`, 'product', () => loadProducts());
  document.getElementById('confirm-message').textContent = `Are you sure you want to delete product "${productName}"?`;
  openModal('confirm-modal');
}

async function loadOrders() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/orders`);
    const orders = await res.json();
    
    const tbody = document.querySelector('#orders-table tbody');
    tbody.innerHTML = orders.map(order => `
      <tr>
        <td>${order.id.substring(0, 8)}</td>
        <td>${order.user_id?.substring(0, 8) || 'Unknown'}</td>
        <td>$${parseFloat(order.total_price).toFixed(2)}</td>
        <td>
          <span class="status-${getStatusClass(order.status)}">${order.status}</span>
        </td>
        <td>${new Date(order.created_at).toLocaleDateString()}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-primary btn-small" onclick="editOrderStatus('${order.id}', '${order.status}')">Update</button>
          </div>
        </td>
      </tr>
    `).join('');

    document.getElementById('order-search').addEventListener('input', (e) => {
      const search = e.target.value.toLowerCase();
      document.querySelectorAll('#orders-table tbody tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(search) ? '' : 'none';
      });
    });
  } catch (err) {
    console.error('Error loading orders:', err);
  }
}

function getStatusClass(status) {
  if (status === 'delivered') return 'good';
  if (status === 'cancelled') return 'bad';
  if (status === 'processing' || status === 'shipped') return 'pending';
  return 'pending';
}

function editOrderStatus(orderId, currentStatus) {
  document.getElementById('order-id').value = orderId;
  document.getElementById('order-status').value = currentStatus;
  openModal('order-modal');
}

document.getElementById('order-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const orderId = document.getElementById('order-id').value;
  const status = document.getElementById('order-status').value;
  
  try {
    const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    
    if (res.ok) {
      closeModal('order-modal');
      loadOrders();
      alert('Order updated successfully');
    } else {
      alert('Error updating order');
    }
  } catch (err) {
    console.error('Error updating order:', err);
    alert('Error updating order');
  }
});

async function confirmDelete(url, type, callback) {
  try {
    const res = await fetch(`${API_BASE}${url}`, { method: 'DELETE' });
    
    if (res.ok) {
      closeModal('confirm-modal');
      callback();
      alert(type.charAt(0).toUpperCase() + type.slice(1) + ' deleted successfully');
    } else {
      alert('Error deleting ' + type);
    }
  } catch (err) {
    console.error('Error deleting:', err);
    alert('Error deleting ' + type);
  }
}

document.getElementById('confirm-yes').addEventListener('click', () => {
  if (currentAction) {
    currentAction();
  }
});

window.addEventListener('load', () => {
  loadStats();
});
