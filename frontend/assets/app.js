// ================= BASE URL =================
const BASE_URL = "http://YOUR_SUBDOMAIN.duckdns.org";


// ================= REGISTER =================
async function registerUser() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Registration successful!");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Registration failed");
        }
    } catch (err) {
        console.error(err);
        alert("Server error during registration");
    }
}


// ================= LOGIN =================
async function loginUser() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok && data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            alert("Login successful!");
            window.location.href = "index.html";
        } else {
            alert(data.message || "Login failed");
        }
    } catch (err) {
        console.error(err);
        alert("Server not reachable");
    }
}


// ================= ADMIN CHECK =================
async function checkAdmin() {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/admin/dashboard`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        const result = document.getElementById("result");
        if (result) {
            result.innerText = data.message;
        }
    } catch (err) {
        console.error(err);
        alert("Admin check failed");
    }
}


// ================= LOAD FOODS =================
async function loadFoods() {
    const foodList = document.getElementById("food-list");

    if (!foodList) return;

    try {
        const res = await fetch(`${BASE_URL}/api/foods`);
        const foods = await res.json();

        foodList.innerHTML = "";

        foods.forEach(food => {
            const col = document.createElement("div");
            col.className = "col-md-4 mb-4";

            col.innerHTML = `
                <div class="card shadow h-100">
                    <img src="${food.image}" class="card-img-top" style="height:220px; object-fit:cover;">
                    <div class="card-body text-center">
                        <h5>${food.name}</h5>
                        <p class="text-success fw-bold">₹${food.price}</p>
                        <button class="btn btn-primary w-100">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;

            col.querySelector("button").addEventListener("click", () => {
                addToCart(food.id, food.name, food.price);
            });

            foodList.appendChild(col);
        });
    } catch (err) {
        console.error(err);
        foodList.innerHTML = `<p class="text-danger text-center">Failed to load foods</p>`;
    }
}


// ================= ADD TO CART =================
function addToCart(foodId, name, price) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(item => item.id === foodId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: foodId,
            name,
            price,
            quantity: 1
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    alert(name + " added to cart!");
}


// ================= GET CART =================
function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}


// ================= DISPLAY CART =================
function displayCart() {
    const cartContainer = document.getElementById("cart-items");
    const totalContainer = document.getElementById("cart-total");

    if (!cartContainer) return;

    const cart = getCart();

    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = `<p class="text-muted">Your cart is empty.</p>`;
        if (totalContainer) totalContainer.innerText = "₹0";
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;

        const div = document.createElement("div");
        div.className = "d-flex justify-content-between align-items-center border-bottom py-2";

        div.innerHTML = `
            <div>
                <h6 class="mb-1">${item.name}</h6>
                <small>₹${item.price} × ${item.quantity}</small>
            </div>
            <div>
                <button class="btn btn-sm btn-danger">Remove</button>
            </div>
        `;

        div.querySelector("button").addEventListener("click", () => {
            removeCartItem(index);
        });

        cartContainer.appendChild(div);
    });

    if (totalContainer) {
        totalContainer.innerText = "₹" + total;
    }
}


// ================= REMOVE CART ITEM =================
function removeCartItem(index) {
    let cart = getCart();

    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
}


// ================= PLACE ORDER =================
async function placeOrder() {
    const cart = getCart();

    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ cart })
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message || "Order placed successfully!");
            localStorage.removeItem("cart");
            window.location.href = "orders.html";
        } else {
            alert(data.message || "Order failed");
        }
    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}


// ================= LOAD ORDERS =================
async function loadOrders() {
    const orderContainer = document.getElementById("orders-list");

    if (!orderContainer) return;

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/api/orders`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const orders = await res.json();

        orderContainer.innerHTML = "";

        if (!orders.length) {
            orderContainer.innerHTML = `<p class="text-muted">No orders yet.</p>`;
            return;
        }

        orders.forEach(order => {
            const div = document.createElement("div");
            div.className = "card shadow-sm p-3 mb-3";

            div.innerHTML = `
                <h6>Order #${order.id}</h6>
                <p class="mb-1">Total: ₹${order.total}</p>
                <small>${order.created_at}</small>
            `;

            orderContainer.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        orderContainer.innerHTML = `<p class="text-danger">Failed to load orders</p>`;
    }
}


// ================= CHECK LOGIN =================
function checkLogin() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first!");
        window.location.href = "login.html";
    }
}


// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");

    alert("Logged out successfully");
    window.location.href = "login.html";
}


// ================= AUTO LOAD BASED ON PAGE =================
document.addEventListener("DOMContentLoaded", () => {
    loadFoods();
    displayCart();
    loadOrders();
});