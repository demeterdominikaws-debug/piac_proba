import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, addDoc, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBFF_l_nppAsMafX7nYu5ru6bPxGQsv73Y",
  authDomain: "marketplacekopi1.firebaseapp.com",
  projectId: "marketplacekopi1",
  storageBucket: "marketplacekopi1.firebasestorage.app",
  messagingSenderId: "662597167475",
  appId: "1:662597167475:web:3204f26a497856c4b67d06",
  measurementId: "G-R4D23WFJP0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

const grid = document.getElementById("grid");
const fallbackImage = "https://via.placeholder.com/300x150?text=No+Image";
let currentCategory = 'all';

// Feltöltő űrlap mezők
const uploadInputs = [
  document.getElementById("name"),
  document.getElementById("price"),
  document.getElementById("img"),
  document.getElementById("category"),
  document.getElementById("uploadBtn")
];
const uploadWarning = document.getElementById("uploadWarning");

// Termékek betöltése
async function loadProducts() {
  grid.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "products"));
  
  querySnapshot.forEach(doc => {
    const p = doc.data();
    const isOwner = auth.currentUser && auth.currentUser.uid === p.uid;

    if (currentCategory === 'all' || p.category === currentCategory) {
      grid.innerHTML += `
        <div class="card" data-id="${doc.id}">
          <img src="${p.img}" alt="${p.name}" onerror="this.onerror=null;this.src='${fallbackImage}';">
          <div class="card-content">
            <div class="price">${p.price}</div>
            <div>${p.name}</div>
            ${isOwner ? `<button onclick="deleteProduct('${doc.id}')">Törlés</button>` : ''}
          </div>
        </div>
      `;
    }
  });
}

// Kategória szűrő
window.filterCategory = function(category) {
  currentCategory = category;
  loadProducts();
}

// Új termék hozzáadása
window.addProduct = async function() {
  const user = auth.currentUser;
  if (!user) {
    alert("Be kell jelentkezned a feltöltéshez!");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const price = document.getElementById("price").value.trim();
  const img = document.getElementById("img").value.trim();
  const category = document.getElementById("category").value;

  if (!name || !price || !img || !category) {
    alert("Kérlek, tölts ki minden mezőt!");
    return;
  }

  try {
    await addDoc(collection(db, "products"), {
      name,
      price,
      img,
      category,
      uid: user.uid
    });

    // Űrlap törlése
    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("img").value = "";
    document.getElementById("category").value = "tech";

    loadProducts();
  } catch (error) {
    alert("Hiba történt a feltöltés során: " + error.message);
  }
};

// Termék törlése
window.deleteProduct = async function(id) {
  if (confirm("Biztosan törlöd a terméket?")) {
    try {
      await deleteDoc(doc(db, "products", id));
      loadProducts();
    } catch (error) {
      alert("Hiba történt a törlés során: " + error.message);
    }
  }
};

// Firebase Authentication
window.register = async function() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Sikeres regisztráció!");
  } catch (error) {
    alert("Hiba a regisztráció során: " + error.message);
  }
}

window.login = async function() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Sikeres bejelentkezés!");
  } catch (error) {
    alert("Hiba a bejelentkezés során: " + error.message);
  }
}

window.logout = async function() {
  await signOut(auth);
  alert("Kijelentkeztél.");
}

// Bejelentkezés állapot figyelése
onAuthStateChanged(auth, user => {
  if (user) {
    uploadInputs.forEach(el => el.disabled = false);
    uploadWarning.style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";
  } else {
    uploadInputs.forEach(el => el.disabled = true);
    uploadWarning.style.display = "block";
    document.getElementById("logoutBtn").style.display = "none";
  }

  loadProducts(); // Frissítés (törlés gomb, jogosultságok miatt)
});

// Oldal betöltésekor termékek betöltése
loadProducts();
