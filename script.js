import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, addDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

const grid = document.getElementById("grid");

// Helyettesítő kép URL (például via.placeholder)
const fallbackImage = "https://via.placeholder.com/300x150?text=No+Image";

async function loadProducts() {
  grid.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "products"));

  querySnapshot.forEach(doc => {
    const p = doc.data();

    grid.innerHTML += `
      <div class="card">
        <img src="${p.img}" alt="${p.name}" onerror="this.onerror=null;this.src='${fallbackImage}';">
        <div class="card-content">
          <div class="price">${p.price}</div>
          <div>${p.name}</div>
        </div>
      </div>
    `;
  });
}

window.addProduct = async function() {
  const name = document.getElementById("name").value.trim();
  const price = document.getElementById("price").value.trim();
  const img = document.getElementById("img").value.trim();

  if (!name || !price || !img) {
    alert("Kérlek, tölts ki minden mezőt!");
    return;
  }

  try {
    await addDoc(collection(db, "products"), {
      name,
      price,
      img
    });

    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("img").value = "";

    loadProducts();
  } catch (error) {
    alert("Hiba történt a feltöltés során: " + error.message);
  }
};

loadProducts();