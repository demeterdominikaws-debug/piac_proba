import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, addDoc, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFF_l_nppAsMafX7nYu5ru6bPxGQsv73Y",
  authDomain: "marketplacekopi1.firebaseapp.com",
  projectId: "marketplacekopi1",
  storageBucket: "marketplacekopi1.firebasestorage.app",
  messagingSenderId: "662597167475",
  appId: "1:662597167475:web:c88b042553761d6db67d06"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

const grid = document.getElementById("grid");
const fallbackImage = "https://via.placeholder.com/300x150?text=No+Image";

let currentCategory = "all";
let searchText = "";

// 🔍 KERESÉS
document.getElementById("search").addEventListener("input", (e) => {
  searchText = e.target.value.toLowerCase();
  loadProducts();
});

// 📦 TERMÉKEK BETÖLTÉSE
async function loadProducts() {
  grid.innerHTML = "<div class='loading'>Betöltés...</div>";

  const querySnapshot = await getDocs(collection(db, "products"));
  grid.innerHTML = "";

  querySnapshot.forEach(docSnap => {
    const p = docSnap.data();
    const isOwner = auth.currentUser && auth.currentUser.uid === p.uid;

    if (
      (currentCategory === "all" || p.category === currentCategory) &&
      p.name.toLowerCase().includes(searchText)
    ) {
      grid.innerHTML += `
        <div class="card">
          <img src="${p.img}" onerror="this.src='${fallbackImage}'">
          <div class="card-content">
            <div class="title">${p.name}</div>
            <div class="price">${p.price} Ft</div>
            <div class="category-label">${p.category}</div>
            ${isOwner ? `<button onclick="deleteProduct('${docSnap.id}')">Törlés</button>` : ""}
          </div>
        </div>
      `;
    }
  });

  if (grid.innerHTML === "") {
    grid.innerHTML = "<p>Nincs találat 😢</p>";
  }
}

// 📂 KATEGÓRIA
window.filterCategory = function(category, event) {
  currentCategory = category;

  document.querySelectorAll(".category").forEach(el => {
    el.classList.remove("active");
  });

  event.target.classList.add("active");

  loadProducts();
};

// ➕ TERMÉK HOZZÁADÁS
window.addProduct = async function() {
  const user = auth.currentUser;
  if (!user) return alert("Be kell jelentkezned!");

  const name = document.getElementById("name").value.trim();
  const price = document.getElementById("price").value.trim();
  const img = document.getElementById("img").value.trim();
  const category = document.getElementById("category").value;

  if (!name || !price || !img) {
    alert("Tölts ki mindent!");
    return;
  }

  if (isNaN(price)) {
    alert("Az ár szám legyen!");
    return;
  }

  await addDoc(collection(db, "products"), {
    name,
    price: Number(price),
    img,
    category,
    uid: user.uid
  });

  document.getElementById("name").value = "";
  document.getElementById("price").value = "";
  document.getElementById("img").value = "";

  loadProducts();
};

// ❌ TÖRLÉS
window.deleteProduct = async function(id) {
  if (confirm("Törlöd?")) {
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  }
};

// 🔓 MODAL KEZELÉS
window.openLogin = function() {
  document.getElementById("loginModal").style.display = "block";
};

window.closeLogin = function() {
  document.getElementById("loginModal").style.display = "none";
};

// 🔐 AUTH (JAVÍTVA)
window.register = async function() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Sikeres regisztráció!");
    closeLogin();
  } catch (error) {
    alert(error.message);
  }
};

window.login = async function() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Sikeres bejelentkezés!");
    closeLogin();
  } catch (error) {
    alert(error.message);
  }
};

window.logout = async function() {
  await signOut(auth);
};

// 👤 AUTH FIGYELÉS (EZ A KULCS!)
onAuthStateChanged(auth, user => {
  const uploadForm = document.getElementById("uploadForm");
  const uploadMessage = document.getElementById("uploadMessage");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (user) {
    uploadForm.style.display = "block";
    uploadMessage.style.display = "none";
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    uploadForm.style.display = "none";
    uploadMessage.style.display = "block";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }

  loadProducts();
});

loadProducts();
