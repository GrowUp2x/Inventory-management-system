let isLoggedIn = false;

function toggleLogin() {
  if (isLoggedIn) {
    isLoggedIn = false;
    alert('Logged out successfully!');
    document.getElementById('loginBtn').innerText = 'Login';
  } else {
    isLoggedIn = true;
    alert('Logged in successfully!');
    document.getElementById('loginBtn').innerText = 'Logout';
  }
}

function loadProducts() {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const productTable = document.getElementById('productTable');
  productTable.innerHTML = '';
  let outOfStock = 0;
  let totalValue = 0;

  products.forEach((product, index) => {
    if (product.quantity === 0) outOfStock++;
    totalValue += product.price * product.quantity;
    
    const row = `
      <tr class="${product.quantity < 5 ? 'low-stock' : ''}">
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${product.quantity}</td>
        <td>$${product.price}</td>
        <td>$${(product.quantity * product.price).toFixed(2)}</td>
        <td><img src="${product.imageUrl}" alt="Product Image"></td>
        <td>
          <button class="action-button edit-button" onclick="editProduct(${index})">Edit</button>
          <button class="action-button delete-button" onclick="deleteProduct(${index})">Delete</button>
        </td>
      </tr>
    `;
    productTable.innerHTML += row;
  });

  document.getElementById('totalProducts').innerText = products.length;
  document.getElementById('outOfStock').innerText = outOfStock;
  document.getElementById('totalValue').innerText = totalValue.toFixed(2);
}

function addProduct() {
  if (!isLoggedIn) {
    alert('You must be logged in to add products!');
    return;
  }

  const name = document.getElementById('productName').value;
  const quantity = parseInt(document.getElementById('productQuantity').value);
  const price = parseFloat(document.getElementById('productPrice').value);
  const image = document.getElementById('productImage').files[0];
  const category = document.getElementById('productCategory').value;

  // Form validation
  if (!name || isNaN(quantity) || isNaN(price) || !category) {
    alert('Please fill in all fields correctly!');
    return;
  }

  // Validate quantity and price
  if (quantity < 0 || price < 0) {
    alert('Quantity and Price must be greater than or equal to 0!');
    return;
  }

  // Check if image file exists and read it
  let imageUrl = '';
  if (image) {
    const reader = new FileReader();
    reader.onloadend = function () {
      imageUrl = reader.result;

      // Add product to local storage
      const products = JSON.parse(localStorage.getItem('products')) || [];
      const newProduct = {
        name,
        quantity,
        price,
        category,
        imageUrl
      };

      products.push(newProduct);
      localStorage.setItem('products', JSON.stringify(products));
      loadProducts();

      // Reset form
      document.getElementById('productName').value = '';
      document.getElementById('productQuantity').value = '';
      document.getElementById('productPrice').value = '';
      document.getElementById('productImage').value = '';

      showNotification('Product added successfully!', 'success');
    };

    reader.readAsDataURL(image);
  } else {
    // If no image is selected, add product without image
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const newProduct = {
      name,
      quantity,
      price,
      category,
      imageUrl: '' // No image
    };

    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();

    // Reset form
    document.getElementById('productName').value = '';
    document.getElementById('productQuantity').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productImage').value = '';

    showNotification('Product added successfully!', 'success');
  }
}

function deleteProduct(index) {
  if (!isLoggedIn) {
    alert('You must be logged in to delete products!');
    return;
  }

  const products = JSON.parse(localStorage.getItem('products')) || [];
  products.splice(index, 1);
  localStorage.setItem('products', JSON.stringify(products));
  loadProducts();
}

function editProduct(index) {
  if (!isLoggedIn) {
    alert('You must be logged in to edit products!');
    return;
  }

  const products = JSON.parse(localStorage.getItem('products')) || [];
  const product = products[index];
  document.getElementById('productName').value = product.name;
  document.getElementById('productQuantity').value = product.quantity;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productCategory').value = product.category;
}

function searchProducts() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const filtered = products.filter(product => product.name.toLowerCase().includes(query));
  updateTable(filtered);
}

function filterProducts() {
  const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
  const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
  const category = document.getElementById('categoryFilter').value;

  const products = JSON.parse(localStorage.getItem('products')) || [];
  const filtered = products.filter(product => 
    product.price >= minPrice &&
    product.price <= maxPrice &&
    (category ? product.category === category : true)
  );

  updateTable(filtered);
}

function updateTable(products) {
  const productTable = document.getElementById('productTable');
  productTable.innerHTML = '';
  products.forEach((product, index) => {
    const row = `
      <tr class="${product.quantity < 5 ? 'low-stock' : ''}">
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${product.quantity}</td>
        <td>$${product.price}</td>
        <td>$${(product.quantity * product.price).toFixed(2)}</td>
        <td><img src="${product.imageUrl}" alt="Product Image"></td>
        <td>
          <button class="action-button edit-button" onclick="editProduct(${index})">Edit</button>
          <button class="action-button delete-button" onclick="deleteProduct(${index})">Delete</button>
        </td>
      </tr>
    `;
    productTable.innerHTML += row;
  });
}

function showNotification(message, type) {
  const notification = document.getElementById('notification');
  notification.innerText = message;
  notification.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
  notification.style.display = 'block';

  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// CSV Export Function
function exportToCSV() {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const headers = ['Product Name', 'Category', 'Quantity', 'Price', 'Total Value', 'Image URL'];

  const rows = products.map(product => [
    product.name,
    product.category,
    product.quantity,
    product.price,
    (product.quantity * product.price).toFixed(2),
    product.imageUrl
  ]);

  const csvContent = [
    headers.join(','), // Add headers to the CSV
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', 'inventory.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

window.onload = loadProducts;
