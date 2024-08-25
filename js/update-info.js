import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, deleteDoc, writeBatch} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBykm-oqoMvIAjLFWHPnVi_OQ86Iis_NVs",
  authDomain: "yoga-663cb.firebaseapp.com",
  projectId: "yoga-663cb",
  storageBucket: "yoga-663cb.appspot.com",
  messagingSenderId: "256248240983",
  appId: "1:256248240983:web:07dcebbcb04debc34b3c12"
})
// 연락처 input checker
const telInput = document.querySelector("input#tel")
telInput.addEventListener("input", function(evt) {
  const curInput = telInput.value
  const length = curInput.length
  const inputVal = Number(evt.data)
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
// url로 받아온 querystring 받아서 사용
const searchParams = new URLSearchParams(window.location.search)
const receivedId = Number(searchParams.get('user_id'))
// console.log(receivedId)

const db = getFirestore(app)
getMemInfo(receivedId)
console.log(3);
async function getMemInfo(id) {
  const q = query(collection(db, "members"), where("user_id", "==", id))
  const memberQuery = await getDocs(q)
  const currentMemberArr = []
  memberQuery.forEach(element => {
    currentMemberArr.push(element.data())
  });
  const currentMember = currentMemberArr[0]
  console.log(currentMember)
  showLastInfo(currentMember)
}
function showLastInfo(info) { //해당회원의 지난 입력을 표시
  for(let key in info) {
    // console.log(key, info[key]);
    const keyInfoWrap = document.querySelectorAll(`[name = ${key}]`)
    console.log(keyInfoWrap);
    if (!keyInfoWrap) { // sign-in-date, user-id 등등
      continue
    } else {
      if (keyInfoWrap.length == 1) { //라디오 제외 input들
        keyInfoWrap[0].value = info[key]
      } else { //라디오라면 현재 info[key]의 라디오에 체크표시
        keyInfoWrap.forEach(input => {
          input.value == info[key] ? input.checked = 'true' : 0
        })
      }
    }
  }
}
const formEl = document.querySelector('form').addEventListener("submit", function(e){
  e.preventDefault()
  console.log('submit!!')
  const formData = new FormData(e.target)
  const memberObj = Object.fromEntries(formData)
  console.log(memberObj);
  updateMember(memberObj)
})
async function updateMember(obj) { // 여기서 firestore추가할때 doc이름이 무작위 id로 들어가는데 따로 지정해줘야하나?
  const docRef = doc(db, "members", `member-${receivedId}`)
  await updateDoc(docRef, obj)
  console.log('수정함!!')
  alert("정보가 수정되었습니다!!")
  location.href = "/src/member-manage.html"
}
const deleteBtn = document.querySelector('form input[type = "button"]')
deleteBtn.addEventListener("click", function() {
  deleteMember(receivedId)
})
async function deleteMember(id) {
  console.log(id);
  const docRef = doc(db, "members", `member-${id}`)
  await deleteDoc(docRef)
  alert("멤버가 삭제되었습니다!!!")
  await deleteDocs("attendance", id)
  await deleteDocs("payments", id)
  // await deleteMemberAttendence(id)
  // await deleteMemberPayments(id)
  //해당멤버의 결제, 출석 정보도 모두 삭제해야할듯 그러네???
  location.href = "/src/member-manage.html"
}
async function deleteDocs(type, id) {
  const collectionRef = (type == "payments") ? collection(db, `payments`) : collection(db, `attendances`)
  const q = query(collectionRef, where("user_id", "==", Number(id)))
  const batch = writeBatch(db)
  const querySnapshots = await getDocs(q)
  querySnapshots.forEach((doc) => {
    batch.delete(doc.ref)
  })
  await batch.commit()
  console.log(`모든 ${type} 삭제`);
}
