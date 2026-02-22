// ================= AUTH UI HANDLER =================

// Check login status
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "{}");

const loginBtn = document.getElementById("loginBtn");

if(token && loginBtn){

  // User logged in
  loginBtn.innerText = user.name || "My Profile";

  loginBtn.onclick = () => {
    window.location.href = "profile.html";
  };

}

// Logout helper (optional)
function logout(){
  localStorage.clear();
  location.href = "index.html";
}
// ================= LOGIN =================

const loginEmail = document.getElementById("loginEmail");
const loginPass = document.getElementById("loginPass");
const loginBtn2 = document.getElementById("loginSubmit");

if(loginBtn2){

loginBtn2.addEventListener("click", async ()=>{

  const email = loginEmail.value;
  const password = loginPass.value;

  const res = await fetch("http://localhost:5001/api/login",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body: JSON.stringify({email,password})
  });

  const data = await res.json();

  if(res.ok){

    // 👇 SAVE TOKEN HERE
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    alert("Login successful");
    window.location.href="index.html";

  }else{
    alert(data);
  }

});

}
