import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getDatabase, ref, push, set, get, child, remove } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import { showWarning } from './warning-popup.js';


const firebaseConfig = {
    apiKey: "AIzaSyDXbXmc7SbpmM2LdtVdAocGF-Yv5wNyWfQ",
    authDomain: "eyes-system.firebaseapp.com",
    databaseURL: "https://eyes-system-default-rtdb.firebaseio.com",
    projectId: "eyes-system",
    storageBucket: "eyes-system.firebasestorage.app",
    messagingSenderId: "1077739216939",
    appId: "1:1077739216939:web:1f797d480d180812ee8a6e",
    measurementId: "G-MQSVY5MR6W"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const btnView = document.getElementById("btnView");
const btnAdd = document.getElementById("btnAdd");
const btnList = document.getElementById("btnList");

const viewWidget = document.getElementById("viewWidget");
const addWidget = document.getElementById("addWidget");
const listWidget = document.getElementById("ListWidget");

const addName = document.getElementById("addName");
const addPhone = document.getElementById("addPhone");
const addAddress = document.getElementById("addAddress");
const addMap = document.getElementById("addMap");
const addBtn = document.getElementById("addCustomer");

const searchName = document.getElementById("name");
const searchPhone = document.getElementById("phone");

const resName = document.getElementById("resName");
const resPhone = document.getElementById("resPhone");
const resAddress = document.getElementById("resAddress");
const resMap = document.getElementById("resMap");

let selectedCustomerId = null; // Lưu ID khách hàng đang mở modal

function showWidget(widget) {
    viewWidget.classList.remove("show");
    addWidget.classList.remove("show");
    listWidget.classList.remove("show");

    btnView.classList.remove("active");
    btnAdd.classList.remove("active");
    btnList.classList.remove("active");

    if (widget === "view") {
        viewWidget.classList.add("show");
        btnView.classList.add("active");
    } else if (widget === "add") {
        addWidget.classList.add("show");
        btnAdd.classList.add("active");
    } else if (widget === "list") {
        listWidget.classList.add("show");
        btnList.classList.add("active");
        loadCustomerList();
    }
}

showWidget("view");
btnView.addEventListener("click", () => showWidget("view"));
btnAdd.addEventListener("click", () => showWidget("add"));
btnList.addEventListener("click", () => showWidget("list"));

// Thêm khách hàng
addBtn.addEventListener("click", () => {
    const name = addName.value.trim();
    const phone = addPhone.value.trim();
    const address = addAddress.value.trim();
    const mapUrl = addMap.value.trim();

    if (!name) {
        alert("Vui lòng nhập tên khách hàng");
        return;
    }

    const customersRef = ref(db, "customers");
    const newCustomerRef = push(customersRef);

    set(newCustomerRef, {
        name,
        phone,
        address,
        mapUrl,
        createdAt: new Date().toISOString()
    })
        .then(() => {
            showWarning("Đã thêm khách hàng!");
            addName.value = "";
            addPhone.value = "";
            addAddress.value = "";
            addMap.value = "";
        })
        .catch((error) => {
            showWarning("Lỗi khi thêm khách hàng!");
        });
});

// Tìm kiếm khách hàng
function searchCustomer() {
    const nameVal = searchName.value.trim().toLowerCase();
    const phoneVal = searchPhone.value.trim();
    const dbRef = ref(db);

    get(child(dbRef, "customers"))
        .then((snapshot) => {
            if (snapshot.exists()) {
                let found = null;
                snapshot.forEach((childSnapshot) => {
                    const data = childSnapshot.val();
                    if (
                        (nameVal && data.name.toLowerCase() === nameVal) ||
                        (phoneVal && data.phone === phoneVal)
                    ) {
                        found = data;
                    }
                });

                if (found) {
                    resName.textContent = found.name || "---";
                    resPhone.textContent = found.phone || "---";
                    resAddress.textContent = found.address || "---";
                    resMap.href = found.mapUrl || "#";
                } else {
                    resName.textContent = "KHÔNG CÓ KHÁCH HÀNG";
                    resPhone.textContent = "---";
                    resAddress.textContent = "---";
                    resMap.href = "#";
                }
            } else {
                resName.textContent = "KHÔNG CÓ KHÁCH HÀNG";
                resPhone.textContent = "---";
                resAddress.textContent = "---";
                resMap.href = "#";
            }
        })
        .catch(console.error);
}

searchName.addEventListener("keyup", (e) => e.key === "Enter" && searchCustomer());
searchPhone.addEventListener("keyup", (e) => e.key === "Enter" && searchCustomer());
searchName.addEventListener("blur", searchCustomer);
searchPhone.addEventListener("blur", searchCustomer);
document.getElementById("searchBtn").addEventListener("click", searchCustomer);

// Lấy vị trí
function getCurrentLocation(callback) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                callback(null, `https://www.google.com/maps?q=${lat},${lng}`);
            },
            (err) => callback("Không thể lấy vị trí: " + err.message)
        );
    } else {
        callback("Trình duyệt không hỗ trợ GPS.");
    }
}

// Xóa khách hàng
function deleteCustomer(customerId) {
    if (!customerId) {
        showWarning("Không tìm thấy ID khách hàng.");
        return;
    }
    if (confirm("Bạn có chắc muốn xóa khách hàng này?")) {
        remove(ref(db, "customers/" + customerId))
            .then(() => {
                showWarning("Đã xóa khách hàng!");
                document.getElementById("customerModal").style.display = "none";
                loadCustomerList();
            })
            .catch(console.error);
    }
}

// Load danh sách
function loadCustomerList() {
    const dbRef = ref(db);
    const customerList = document.getElementById("customerList");

    get(child(dbRef, "customers"))
        .then((snapshot) => {
            customerList.innerHTML = "";
            customerList.style.flexDirection = "column";
            customerList.style.width = "100%";
            customerList.style.gap = "16px";

            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const data = childSnapshot.val();
                    const customerId = childSnapshot.key; 
                    const card = document.createElement("div");
                    card.style.border = "1px solid #ccc";
                    card.style.borderRadius = "8px";
                    card.style.padding = "10px";
                    card.style.cursor = "pointer";
                    card.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";

                    card.innerHTML = `<h3>Khách hàng: ${data.name || "Không tên"}</h3>`;

                    card.addEventListener("click", () => {
                        selectedCustomerId = customerId;
                        document.getElementById("modalName").textContent = data.name || "---";
                        document.getElementById("modalPhone").textContent = data.phone || "---";
                        document.getElementById("modalAddress").textContent = data.address || "---";
                        document.getElementById("modalMap").href = data.mapUrl || "#";
                        document.getElementById("customerModal").style.display = "flex";
                    });

                    customerList.appendChild(card);
                });
            } else {
                customerList.innerHTML = "<p>Không có khách hàng nào.</p>";
            }
        })
        .catch(console.error);
}

// Đóng modal
document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("customerModal").style.display = "none";
});

document.getElementById("customerModal").addEventListener("click", (e) => {
    if (e.target.id === "customerModal") {
        document.getElementById("customerModal").style.display = "none";
    }
});

document.getElementById("getLocation").addEventListener("click", () => {
    getCurrentLocation((err, url) => {
        if (err) alert(err);
        else document.getElementById("addMap").value = url;
    });
});

document.getElementById("deleteCustomer").addEventListener("click", () => {
    deleteCustomer(selectedCustomerId);
});
