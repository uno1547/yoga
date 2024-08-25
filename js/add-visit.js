import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import { getFirestore, collection, addDoc} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';
const app = initializeApp({
  apiKey: "AIzaSyBykm-oqoMvIAjLFWHPnVi_OQ86Iis_NVs",
  authDomain: "yoga-663cb.firebaseapp.com",
  projectId: "yoga-663cb",
  storageBucket: "yoga-663cb.appspot.com",
  messagingSenderId: "256248240983",
  appId: "1:256248240983:web:07dcebbcb04debc34b3c12"
})
const db = getFirestore(app)

const formEl = document.querySelector('form')
const numEl = formEl.querySelector('input[type = "number"]')
numEl.addEventListener("input", function(e) {
  if (this.value.length > 4) { //현재 input의 길이
    this.value = this.value.slice(0, this.maxLength)
  }
})
// 
formEl.addEventListener("submit", async function(e) {
  e.preventDefault()
  const userId = Number(formEl.querySelector('input#user-id').value)
  if (userId) {
    await addVisit(userId)
    alert('출석완료!!')
  }
})
async function addVisit(userId) {
  console.log(userId);
  const today = new Date()
  console.log(today.getMonth());
  const [year, month, day] = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0') , String(today.getDate()).padStart(2, '0')]
  const [hour, minute, second] = [String(today.getHours()).padStart(2, '0'), String(today.getMinutes()).padStart(2, '0') , String(today.getSeconds()).padStart(2, '0')]
  await addDoc(collection(db, "attendances"), {
    user_id : userId,
    attend_date : `${year}${month}${day}`,
    attend_time : `${hour}:${minute}:${second}`
  });
  /*
  */
}