import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import { getFirestore, collection, query, where, getDocs, doc, setDoc} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';

const app = initializeApp({
  apiKey: "AIzaSyBykm-oqoMvIAjLFWHPnVi_OQ86Iis_NVs",
  authDomain: "yoga-663cb.firebaseapp.com",
  projectId: "yoga-663cb",
  storageBucket: "yoga-663cb.appspot.com",
  messagingSenderId: "256248240983",
  appId: "1:256248240983:web:07dcebbcb04debc34b3c12"
})
const db = getFirestore(app)

// submit시 input 값들로 객체 생성
const formEl = document.querySelector("form").addEventListener("submit", function(e) {
  e.preventDefault() //새로고침 방지
  const formData = new FormData(e.target)
  const memberObj = Object.fromEntries(formData)
  setSignDate(memberObj)
  setUserId(memberObj)
})
// '회원가입일' 추가
function setSignDate(obj) {
  const signInDate = new Date()
  const signInYear = signInDate.getFullYear()
  const signInMonth = (String(signInDate.getMonth() + 1)).padStart(2, "0")
  const signInDay = (String(signInDate.getDate())).padStart(2, "0")
  let dateStr = `${signInYear}-${signInMonth}-${signInDay}`
  obj["sign_in_date"] = dateStr
}
// member중 중복되지않는 random ID 생성
async function setUserId(obj) {
  let valid = false
  let randId = 0
  while(!valid) {
    const dupMems = []
    randId = Math.floor(Math.random() * (9999 - 1000) + 1000);
    // console.log(randId);
    const q = query(collection(db, "members"), where("user_id", "==", randId))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((el) => dupMems.push(el.data()))
    dupMems.length == 0 ? valid = true : 0
  }
  obj["user_id"] = randId
  createNewMember(obj)
}
// 받은 member obj를 DB에 추가
async function createNewMember(obj) {
  const name = obj.name
  const id = obj.user_id
  // console.log(name, id);
  await setDoc(doc(db, "members", `member-${id}`), obj);
  alert("새멤버가 추가되었습니다")
  location.href = "/src/member-manage.html"
}

// 전번입력 input 자동완성
const telInput = document.querySelector("input#tel")
telInput.addEventListener("input", function(evt) {
  const curInput = telInput.value
  const length = curInput.length
  const inputVal = Number(evt.data)
  console.log(inputVal);
  const isNotNumber = isNaN(inputVal)
  if (isNotNumber) {
    console.log('enter a number please');
  } else {
    if (length === 3 || length === 8) {
      evt.data !== null ? telInput.value += "-" : 0
    }
  }
  telPopUpHandler()
})
function telPopUpHandler() {
  let haveChar = false
  const curTel = telInput.value
  for (let i = 0; i < curTel.length; i++) {
    if (isNaN(Number(curTel[i]))) { //중간에 문자가 포함되있을경우
      if (curTel[i] == "-") {
        continue
      } else {
        haveChar = true
        break
      }
    }
  }
  const telPopUp = document.querySelector("#tel-pop-up")
  if (haveChar) { // 문자가포함된경우
    if (telPopUp) { //이미 telpopup이있으면 유지
      return
    } else { //telpopup이 없다면 생성후 추가
      const popUpEl = document.createElement('div')
      const telDiv = document.querySelector(".wrap.tel")
      popUpEl.id = "tel-pop-up"
      popUpEl.textContent = "숫자를입력해주세요!"
      telDiv.appendChild(popUpEl)
    }
  } else { //문자가 포함되지않은경우
    telPopUp ? telPopUp.remove() : 0
  }
}