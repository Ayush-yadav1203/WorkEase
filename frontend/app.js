// ================= DOM ELEMENTS =================

// Signup
const signupBtn = document.getElementById("signupBtn");
const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPass = document.getElementById("signupPass");

// Login
const loginBtn = document.getElementById("loginBtn");
const loginEmail = document.getElementById("loginEmail");
const loginPass = document.getElementById("loginPass");

// Booking
const bookingForm = document.getElementById("bookingForm");
const name = document.getElementById("name");
const phone = document.getElementById("phone");
const service = document.getElementById("service");
const date = document.getElementById("date");
const time = document.getElementById("time");

// ================= BACKEND =================
const API = "http://localhost:5001";

// ================= SIGNUP =================
if(signupBtn){
 signupBtn.addEventListener("click", async ()=>{

  const res = await fetch(`${API}/api/auth/signup`,{
   method:"POST",
   headers:{ "Content-Type":"application/json"},
   body:JSON.stringify({
    name: signupName.value,
    email: signupEmail.value,
    password: signupPass.value
   })
  });

  alert(await res.text());
  if(res.ok) location.href="login.html";
 });
}


console.log("APP JS LOADED");

// ================= LOGIN =================


if (loginBtn) {
  console.log("LOGIN SCRIPT READY");

  loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    console.log("LOGIN BUTTON CLICKED");

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPass").value;

    console.log("EMAIL:", email);

    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log("SERVER RESPONSE:", data);

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        alert("✅ Login Success");
        console.log("LOGIN SUCCESS — REDIRECTING...");

        // 🔥 THIS WAS MISSING
        window.location.href = "index.html";
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alert("Server error");
    }
  });
}



// ================= BOOKING =================
if(bookingForm){
 bookingForm.addEventListener("submit", async e=>{
  e.preventDefault();

  await fetch(`${API}/api/bookings`,{
   method:"POST",
   headers:{ "Content-Type":"application/json","Authorization": "Bearer " + localStorage.getItem("token")},
   body:JSON.stringify({
    name: name.value,
    phone: phone.value,
    service: service.value,
    date: date.value,
    time: time.value
   })
  });

  alert("Booking Saved!");
  bookingForm.reset();
 });
}

// ================= SERVICES =================
fetch(`${API}/api/services`)
.then(r=>r.json())
.then(data=>{
 if(service){
  data.forEach(s=>{
   const opt = document.createElement("option");
   opt.textContent = s;
   service.appendChild(opt);
  });
 }
})
.catch(()=>{});

// ================= AUTH UI =================
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "{}");
const navBtn = document.getElementById("loginBtn");

if(navBtn){

 if(token){
  navBtn.innerText = user.name || "My Profile";
  navBtn.onclick = ()=>location.href="profile.html";
 } else {
  navBtn.onclick = ()=>location.href="login.html";
 }

}

// ================= LOGOUT =================
function logout(){
 localStorage.clear();
 location.href="index.html";
}
