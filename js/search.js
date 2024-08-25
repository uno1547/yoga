/*
1. 입력하고 submit 
2. 스켈레톤 표시
3. 불러온 값 표시
*/

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';
const app = initializeApp({
  apiKey: "AIzaSyBykm-oqoMvIAjLFWHPnVi_OQ86Iis_NVs",
  authDomain: "yoga-663cb.firebaseapp.com",
  projectId: "yoga-663cb",
  storageBucket: "yoga-663cb.appspot.com",
  messagingSenderId: "256248240983",
  appId: "1:256248240983:web:07dcebbcb04debc34b3c12"
})
const db = getFirestore(app)

// 1. 리스너 추가
const form = document.querySelector("main div.input-area form")
form.addEventListener("submit", function(evt) {
  evt.preventDefault()
  const nameInput = document.querySelector("input#name")
  const name = nameInput.value
  console.log('submit이벤트 발생');
  resetTable()
  getUser(name)
  // 리스너로 화살표함수 vs 익명/선언 들어가는거에따라 this 존재여부에 차이가난다
})

// table 초기화
function resetTable() {
  console.log('table초기화');
  const tableEl = document.querySelector("table")
  tableEl.innerHTML = `<tr id="table-key">
            <th>회원번호</th>
            <th>그룹</th>
            <th>이름</th>
            <th>연락처</th>
          </tr>`
  // 텍스트도 초기화
  const text = document.querySelector("#center-text")
  text.innerHTML = ''
}



// 2. submit 시, 해당이름으로 쿼리
async function getUser(name) {
  console.log('쿼리!!');
  const users = []
  if(name == "") {
    const q = query(collection(db, "members"))  
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      users.push(doc.data())
    })
  } else {
    const q = query(collection(db, "members"), where("name", "==", name))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach(doc => {
      users.push(doc.data())
      // console.log(doc.data());
    });
  }
  showUsers(users)
}

//3. 쿼리한 데이터 표시
function showUsers(users) {
  if(users.length == 0) {
    // inner.innerHTML += 로 문구를 추가했는데 이렇게 되면 inner내부의 모든요소가 다시쓰여지면서
    // 기존에 input검색버튼의 리스너가 없어진다.
    const innerDiv = document.querySelector("main div#center-text")
    innerDiv.textContent += `회원정보가 존재하지않습니다`
    return
  }
  const tableEl = document.querySelector("table")
  const userStrings = toUserStrings(users)
  userStrings.forEach((string) => {
    tableEl.innerHTML += string
  })
}

//4. 데이터 문자열로 변환
function toUserStrings(users) {
  const strings = users.map((user) => {
    const [userId, userName, userGroup, userPhoneNum] = [user.user_id, user.name, user.group == "group" ?"그룹레슨" :"개인레슨", user.phone_number]
    return `<tr class="table-val">
            <td>${userId}</td>
            <td>${userGroup}</td>
            <td>${userName}</td>
            <td>${userPhoneNum}</td>
          </tr>`
  })
  return strings
}