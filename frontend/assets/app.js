// ================= BASE URL =================
const BASE_URL = "http://127.0.0.1:5000";


// ================= REGISTER =================
async function registerUser() {

    let name =
        document.getElementById("name").value;

    let email =
        document.getElementById("email").value;

    let password =
        document.getElementById("password").value;

    if (!name || !email || !password) {

        alert("Please fill all fields");

        return;
    }

    try {

        let res = await fetch(
            `${BASE_URL}/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            }
        );

        let data = await res.json();

        if (res.ok) {

            alert("Registration successful!");

            window.location.href =
                "login.html";
        }

        else {

            alert(
                data.message ||
                "Registration failed"
            );
        }

    }

    catch (err) {

        console.log(err);

        alert("Server error during registration");
    }
}


// ================= LOGIN =================
async function loginUser() {

    let email =
        document.getElementById("email").value;

    let password =
        document.getElementById("password").value;

    if (!email || !password) {

        alert("Please fill all fields");

        return;
    }

    try {

        let res = await fetch(
            `${BASE_URL}/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        let data = await res.json();

        if (res.ok && data.token) {

            // SAVE TOKEN
            localStorage.setItem(
                "token",
                data.token
            );

            // SAVE USER
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            alert("Login successful!");

            // REDIRECT
            window.location.href =
                "index.html";
        }

        else {

            alert(
                data.message ||
                "Login failed"
            );
        }

    }

    catch (err) {

        console.log(err);

        alert("Server not reachable");
    }
}


// ================= ADMIN CHECK =================
async function checkAdmin() {

    try {

        let res = await fetch(
            `${BASE_URL}/admin/dashboard`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        "Bearer " +
                        localStorage.getItem("token")
                }
            }
        );

        let data = await res.json();

        document.getElementById("result")
            .innerText = data.message;

    }

    catch (err) {

        console.log(err);

        alert("Admin check failed");
    }
}


// ================= ADD TO CART =================
function addToCart(foodId, name, price) {

    let token =
        localStorage.getItem("token");

    // LOGIN CHECK
    if (!token) {

        alert("Please login first!");

        window.location.href =
            "login.html";

        return;
    }

    let cart =
        JSON.parse(localStorage.getItem("cart")) || [];

    let existing =
        cart.find(item => item.id === foodId);

    // EXISTING ITEM
    if (existing) {

        existing.quantity += 1;
    }

    // NEW ITEM
    else {

        cart.push({
            id: foodId,
            name: name,
            price: price,
            quantity: 1
        });
    }

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    alert(name + " added to cart!");
}


// ================= GET CART =================
function getCart() {

    return JSON.parse(
        localStorage.getItem("cart")
    ) || [];
}


// ================= PLACE ORDER =================
async function placeOrder() {

    let cart = getCart();

    // EMPTY CART
    if (cart.length === 0) {

        alert("Cart is empty!");

        return;
    }

    let token =
        localStorage.getItem("token");

    // LOGIN CHECK
    if (!token) {

        alert("Please login first!");

        window.location.href =
            "login.html";

        return;
    }

    try {

        let res = await fetch(
            `${BASE_URL}/api/order`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({
                    cart
                })
            }
        );

        let data = await res.json();

        if (res.ok) {

            alert(
                data.message ||
                "Order placed successfully!"
            );

            // CLEAR CART
            localStorage.removeItem("cart");

            // REDIRECT
            window.location.href =
                "orders.html";
        }

        else {

            alert(
                data.message ||
                "Order failed"
            );
        }

    }

    catch (err) {

        console.log(err);

        alert("Server error");
    }
}


// ================= CHECK LOGIN =================
function checkLogin() {

    let token =
        localStorage.getItem("token");

    if (!token) {

        alert("Please login first!");

        window.location.href =
            "login.html";
    }
}


// ================= LOGOUT =================
function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");

    alert("Logged out successfully");

    window.location.href =
        "login.html";
}