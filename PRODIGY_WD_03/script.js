const products = [
    {
        id: 1,
        name: "Organic Honey Jar",
        category: "groceries",
        price: 14.99,
        description: "Small-batch raw honey from local wildflowers.",
        image: "images/honey-jar.svg",
        rating: 4.9,
        reviewsCount: 128
    },
    {
        id: 2,
        name: "Sourdough Loaf",
        category: "groceries",
        price: 7.99,
        description: "Fresh artisan sourdough baked every morning.",
        image: "images/sourdough-loaf.svg",
        rating: 4.8,
        reviewsCount: 74
    },
    {
        id: 3,
        name: "Lavender Hand Soap",
        category: "home",
        price: 12.5,
        description: "Gentle hand soap made with locally sourced lavender.",
        image: "images/lavender-hand-soap.svg",
        rating: 4.7,
        reviewsCount: 56
    },
    {
        id: 4,
        name: "Ceramic Planter",
        category: "home",
        price: 24.0,
        description: "Minimal planter for indoor herbs and succulents.",
        image: "images/ceramic-planter.svg",
        rating: 4.6,
        reviewsCount: 42
    },
    {
        id: 5,
        name: "Bluetooth Speaker",
        category: "electronics",
        price: 59.99,
        description: "Compact speaker with crystal audio for any room.",
        image: "images/bluetooth-speaker.svg",
        rating: 4.5,
        reviewsCount: 89
    },
    {
        id: 6,
        name: "Wireless Earbuds",
        category: "electronics",
        price: 79.99,
        description: "Noise-reducing earbuds built for music on the move.",
        image: "images/wireless-earbuds.svg",
        rating: 4.6,
        reviewsCount: 103
    },
    {
        id: 7,
        name: "Denim Jacket",
        category: "clothing",
        price: 69.99,
        description: "Classic denim jacket for everyday wear.",
        image: "images/denim-jacket.svg",
        rating: 4.8,
        reviewsCount: 64
    },
    {
        id: 8,
        name: "Running Sneakers",
        category: "clothing",
        price: 89.0,
        description: "Lightweight sneakers with breathable mesh.",
        image: "images/running-sneakers.svg",
        rating: 4.7,
        reviewsCount: 78
    },
    {
        id: 9,
        name: "Herbal Tea Set",
        category: "groceries",
        price: 18.5,
        description: "Three calming tea blends made with garden herbs.",
        image: "images/herbal-tea-set.svg",
        rating: 4.9,
        reviewsCount: 91
    },
    {
        id: 10,
        name: "Cookbook: Local Recipes",
        category: "books",
        price: 26.0,
        description: "A collection of recipes inspired by our neighborhood chefs.",
        image: "images/cookbook-local-recipes.svg",
        rating: 4.8,
        reviewsCount: 38
    },
    {
        id: 11,
        name: "Cozy Knit Scarf",
        category: "clothing",
        price: 34.99,
        description: "Soft scarf made from local wool in seasonal colors.",
        image: "images/cozy-knit-scarf.svg",
        rating: 4.7,
        reviewsCount: 51
    },
    {
        id: 12,
        name: "Desk Lamp",
        category: "home",
        price: 42.0,
        description: "Adjustable LED lamp with warm light for work or reading.",
        image: "images/desk-lamp.svg",
        rating: 4.6,
        reviewsCount: 67
    }
];

const reviews = [
    {
        name: "Maya R.",
        rating: 5,
        comment: "Fast delivery and the honey jar was so fresh. I love supporting a local business!"
    },
    {
        name: "James L.",
        rating: 5,
        comment: "The sourdough loaf arrived warm and the customer service answered my questions quickly."
    },
    {
        name: "Aisha K.",
        rating: 4,
        comment: "Great selection of home products. The planter looks perfect on my desk."
    }
];

const storageKey = 'sunnyCreekCart';
const lastOrderKey = 'sunnyCreekLastOrder';
let cart = [];
let currentCategory = 'all';

const productsGrid = document.getElementById('productsGrid');
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeModal = document.querySelector('.close');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const filterButtons = document.querySelectorAll('.filter-btn');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const productCount = document.getElementById('productCount');
const orderNumberInput = document.getElementById('orderNumberInput');
const trackOrderBtn = document.getElementById('trackOrderBtn');
const orderStatus = document.getElementById('orderStatus');
const reviewsList = document.getElementById('reviewsList');
const supportForm = document.getElementById('supportForm');
const supportName = document.getElementById('supportName');
const supportEmail = document.getElementById('supportEmail');
const supportMessage = document.getElementById('supportMessage');

function loadCart() {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
        try {
            cart = JSON.parse(stored);
        } catch (error) {
            cart = [];
        }
    }
}

function saveCart() {
    localStorage.setItem(storageKey, JSON.stringify(cart));
}

function getLastOrder() {
    const stored = localStorage.getItem(lastOrderKey);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
}

function getFallbackImage(productName) {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="640" height="480">
            <rect width="100%" height="100%" fill="#e2e8f0" />
            <text x="50%" y="42%" dominant-baseline="middle" text-anchor="middle" fill="#475569" font-family="Segoe UI, sans-serif" font-size="28">Image unavailable</text>
            <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="#334155" font-family="Segoe UI, sans-serif" font-size="22">${productName}</text>
        </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function renderProducts() {
    const query = searchInput.value.trim().toLowerCase();
    let filteredProducts = products.filter((product) => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesQuery = [product.name, product.description, product.category]
            .join(' ')
            .toLowerCase()
            .includes(query);
        return matchesCategory && matchesQuery;
    });

    const sortValue = sortSelect.value;
    if (sortValue === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortValue === 'rating') {
        filteredProducts.sort((a, b) => b.rating - a.rating);
    } else if (sortValue === 'name') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    productsGrid.innerHTML = '';
    filteredProducts.forEach((product) => {
        productsGrid.appendChild(createProductCard(product));
    });

    productCount.textContent = filteredProducts.length;
}

function createProductCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
        <div class="product-image"></div>
        <div class="product-info">
            <div class="product-category">${product.category}</div>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-meta">
                <div class="product-rating">⭐ ${product.rating.toFixed(1)} · ${product.reviewsCount} reviews</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
            </div>
            <div class="product-footer">
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to cart</button>
            </div>
        </div>
    `;

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    img.loading = 'lazy';
    img.onerror = function () {
        this.onerror = null;
        this.src = getFallbackImage(product.name);
    };
    card.querySelector('.product-image').appendChild(img);

    return card;
}

function addToCart(productId) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    const existing = cart.find((item) => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    showNotification(`${product.name} added to cart.`);
}

function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = cart.find((product) => product.id === productId);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        saveCart();
        updateCartUI();
    }
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty.</p>
                <p>Pick a few favorites to begin.</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart
            .map(
                (item) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                    <div class="cart-item-subtotal">Subtotal: $${(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        `
            )
            .join('');
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = total.toFixed(2);
}

function openCart() {
    cartModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartModal.classList.remove('show');
    document.body.style.overflow = '';
}

function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty. Add products before checkout.', 'error');
        return;
    }

    const orderId = `SCK-${Math.floor(100000 + Math.random() * 900000)}`;
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    localStorage.setItem(
        lastOrderKey,
        JSON.stringify({ id: orderId, status: 'Confirmed', total: total.toFixed(2), date: new Date().toISOString() })
    );

    cart = [];
    saveCart();
    updateCartUI();
    closeCart();
    showNotification(`Order placed! Your order number is ${orderId}.`);
    orderStatus.innerHTML = `
        <p>Your order <strong>${orderId}</strong> is confirmed. Use this number to track delivery updates.</p>
    `;
}

function trackOrder() {
    const orderNumber = orderNumberInput.value.trim();
    if (!orderNumber) {
        showNotification('Please enter an order number to track.', 'error');
        return;
    }

    const statusOptions = [
        'Order received',
        'Processing',
        'Preparing for pickup',
        'Out for delivery',
        'Delivered'
    ];

    const lastDigit = parseInt(orderNumber.slice(-1), 10);
    const index = Number.isNaN(lastDigit) ? 0 : lastDigit % statusOptions.length;
    const status = statusOptions[index];

    orderStatus.innerHTML = `
        <p>Order <strong>${orderNumber}</strong> status:</p>
        <p class="status-detail">${status}</p>
    `;
}

function renderReviews() {
    reviewsList.innerHTML = reviews
        .map(
            (review) => `
            <article class="review-card">
                <div class="review-header">
                    <div class="review-name">${review.name}</div>
                    <div class="review-rating">${'⭐'.repeat(review.rating)}${review.rating < 5 ? '✩'.repeat(5 - review.rating) : ''}</div>
                </div>
                <p class="review-comment">${review.comment}</p>
            </article>
        `
        )
        .join('');
}

function handleSupportSubmit(event) {
    event.preventDefault();

    const name = supportName.value.trim();
    const email = supportEmail.value.trim();
    const message = supportMessage.value.trim();

    if (!name || !email || !message) {
        showNotification('Please complete the support form before sending.', 'error');
        return;
    }

    supportForm.reset();
    showNotification('Thanks! Our team will reach out soon.');
}

function showNotification(text, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'error' : ''}`;
    notification.textContent = text;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3200);
}

function init() {
    loadCart();
    renderProducts();
    renderReviews();
    updateCartUI();

    cartBtn.addEventListener('click', openCart);
    closeModal.addEventListener('click', closeCart);
    checkoutBtn.addEventListener('click', checkout);
    trackOrderBtn.addEventListener('click', trackOrder);
    supportForm.addEventListener('submit', handleSupportSubmit);
    searchInput.addEventListener('input', renderProducts);
    sortSelect.addEventListener('change', renderProducts);

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            filterButtons.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = button.dataset.category;
            renderProducts();
        });
    });

    cartModal.addEventListener('click', (event) => {
        if (event.target === cartModal) {
            closeCart();
        }
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (event) {
            event.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const lastOrder = getLastOrder();
    if (lastOrder) {
        orderStatus.innerHTML = `
            <p>Last order <strong>${lastOrder.id}</strong> is currently <strong>${lastOrder.status}</strong>.</p>
            <p>Track it above with the order number.</p>
        `;
    }
}

window.addEventListener('DOMContentLoaded', init);
