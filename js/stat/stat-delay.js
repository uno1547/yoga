import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import { getFirestore, addDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';
const app = initializeApp({
  apiKey: "AIzaSyBykm-oqoMvIAjLFWHPnVi_OQ86Iis_NVs",
  authDomain: "yoga-663cb.firebaseapp.com",
  projectId: "yoga-663cb",
  storageBucket: "yoga-663cb.appspot.com",
  messagingSenderId: "256248240983",
  appId: "1:256248240983:web:07dcebbcb04debc34b3c12"
})
const db = getFirestore(app)
function getTodayDateString() {
  const todayDate = new Date()
  const [year, month, date] = [todayDate.getFullYear(), String(todayDate.getMonth() + 1).padStart(2, '0'), String(todayDate.getDate()).padStart(2, '0')]
  console.log(`${year}${month}${date}`);
  return `${year}${month}${date}`
}
// 쿼리에쓰이는 문자열반환함수
function getPrevDateString() {
  const prevDate = new Date()
  prevDate.setDate(prevDate.getDate() - 30)
  const [year, month, date] = [prevDate.getFullYear(), String(prevDate.getMonth() + 1).padStart(2, '0'), String(prevDate.getDate()).padStart(2, '0')]
  console.log(`${year}${month}${date}`);
  return `${year}${month}${date}`
}




const start = new Date()
const startTime = start.getTime()
let end


getQueries()
// 2. 오늘부터 15일 이전까지의 pay_date들을 불러온다!
async function getQueries() {
  const queriedPayments = []
  const q = query(collection(db, "payments"), where("pay_date", "<=", getTodayDateString()), where("pay_date", ">=", getPrevDateString()))
  const querySnapshot = await getDocs(q) //************************************************************************************ */
  querySnapshot.forEach((doc) => {
    queriedPayments.push(doc.data())
  })

  end = new Date()
  const endTime = end.getTime()
  console.log('payments 쿼리에 걸리는시간', endTime - startTime); // 40 ~ 60 둘다 동일함


  showPaymentList(queriedPayments)
}
//5. 해당 결제의 user_id로 담당강사, 휴대폰번호 불러와야함
async function getInfo(userId) {
  const q = query(collection(db, "members"), where("user_id", "==", userId))
  const querySnapshot = await getDocs(q)
  const info = {}
  querySnapshot.forEach((doc) => {
    info.teacher = doc.data().teacher
    info.phoneNumber = doc.data().phone_number
  })
  return info
}
//5. 기본 날짜구간 리스트에 표시
async function showPaymentList(payments) {
  const start = new Date()
  const startTime = start.getTime()

  for(let i = 0; i < payments.length; i++) {
    const payUserInfo = await getInfo(payments[i].user_id) // payment 각 요소마다 await로 인한 딜레이 발생
    payments[i].info = payUserInfo
  }

  const end = new Date()
  const endTime = end.getTime()
  console.log('member의 정보로 추가갱신', endTime - startTime);


  console.log(payments); // info 추가 된 payments로 
  // 이하 동일
  const entire = payments.map((payment) => {
    return `<tr>
            <td>${payment.pay_date}</td>
            <td>${payment.user_name}</td>
            <td>${payment.info.teacher}</td>
            <td>${payment.pay_teacher}</td>
            <td>${payment.info.phoneNumber}</td>
            <td>요가 주${payment.pay_class.times_a_week}회 [${payment.pay_class.class_term}개월] [주 ${payment.pay_class.times_a_week}회권]</td>
            <td>${payment.pay_date}</td>
            <td>${payment.expire_date}</td>
            <td>${payment.pay_fee}</td>
          </tr>`
  })
  const listValDiv = document.querySelector("div#table-list table#list-val")
  listValDiv.innerHTML = ''
  entire.forEach((el) => {
    listValDiv.innerHTML += el
  })
}