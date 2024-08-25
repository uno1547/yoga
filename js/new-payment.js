import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import { getFirestore, collection, addDoc, query, getDocs, where} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';
const app = initializeApp({
  apiKey: "AIzaSyBykm-oqoMvIAjLFWHPnVi_OQ86Iis_NVs",
  authDomain: "yoga-663cb.firebaseapp.com",
  projectId: "yoga-663cb",
  storageBucket: "yoga-663cb.appspot.com",
  messagingSenderId: "256248240983",
  appId: "1:256248240983:web:07dcebbcb04debc34b3c12"
})
const db = getFirestore(app)
//URL로 넘어온 user_id접근
const searchParams = new URLSearchParams(window.location.search)
const receivedId = Number(searchParams.get('user_id'))
// console.log(receivedId)
class Class {
  constructor(type, perWeek, term, cashPrice, creditPrice) {
    this.class_type = type,  
    this.times_a_week = perWeek,  
    this.class_term = term,  
    this.cash_price = cashPrice,
    this.card_price = creditPrice  
  }
}
// ㅋㅋㅋㅋ 내가짰던건지 기억이안남 수업목록
const classDic = {
  pt : new Class('pt', 10, 3, 600000, 600000),
  group_try : new Class('group', 30, 3, 0, 0),
  group_coupon : new Class('group', 10, 3, 230000, 250000),
  group_two_one : new Class('group', 2, 1, 129000, 143000),
  group_two_three1 : new Class('group', 2, 3, 330000, 367000),
  group_two_three2 : new Class('group', 2, 3, 347000, 386000),
  group_three_one : new Class('group', 3, 1, 149000, 165000),
  group_three_three1 : new Class('group', 3, 3, 360000, 400000),
  group_three_three2 : new Class('group', 3, 3, 378000, 420000),
  group_three_six1 : new Class('group', 3, 6, 677000, 752000),
  group_three_six2 : new Class('group', 3, 6, 713000, 792000),
  group_three_twelve1 : new Class('group', 3, 12, 1190000, 1320000),
  group_three_twelve2 : new Class('group', 3, 12, 1250000, 1390000),
  group_four_twelve : new Class('group', 4, 12, 1150000, 0),
  group_five_one : new Class('group', 5, 1, 168000, 187000),
  group_five_three1 : new Class('group', 5, 3, 408000, 453000),
  group_five_three2 : new Class('group', 5, 3, 429000, 477000),
  group_five_six1 : new Class('group', 5, 6, 768000, 853000),
  group_five_six2 : new Class('group', 5, 6, 810000, 898000),
  group_five_twelve1 : new Class('group', 5, 12, 1340000, 1490000),
  group_five_twelve2 : new Class('group', 5, 12, 1410000, 1570000),
}

// table 및 하위요소에서 click 발생 > 해당줄의 radio활성화
const table = document.querySelector("table#drop-down")
table.addEventListener("click", function(evt) {
  const target = evt.target
  // console.log(target);
  let radio
  if (target.parentElement.tagName == "TR") { //td일때
    radio = target.parentElement.querySelector("input[type='radio']")
  } else if (target.parentElement.tagName == "TBODY"){ //tr일때
    radio = target.querySelector("input[type='radio']")
  } else { //input일때는 change알아서 발생, 위 두경우만 change이벤트로 propagation해주면된다.
    return
  }
  radio.checked = "true" //이건 change이벤트 발생안하는듯 
  const event = new Event("change", {bubbles : true}) 
  // 'click'이벤트를 form에서 'change'로 인식되게 하기위함인듯
  //bubbles : true를 줘야 동작하는건 
  // 아마도 radio(input) 이 "change" 이벤트를 발생한거라서 form에달린 change 이벤트를 트리거하려면 버블시켜야함
  radio.dispatchEvent(event)
})
// 드롭다운밖으로 마우스 이동시 top 아니면 선택요소로 스크롤
table.addEventListener("mouseleave", function() {
  const isRadioChecked = table.querySelector("input[type='radio']:checked")
  if (isRadioChecked) { //체크된요소가존재
    const checkedRow = isRadioChecked.closest('tr')
    const checkedRowIndex = Array.from(table.querySelectorAll('tr')).indexOf(checkedRow)
    // const rowHeight = checkedRow.offsetHeight 
    //이걸로하면 56.53 이 올려져서 57이할당됨
    // 이렇게 되면 조금씩 오차가 커져서 나중에 스크롤된 위치가 안맞게됨
    const rowHeight = 56.57000006
    const rowScrollVal = rowHeight * checkedRowIndex
    table.scrollTo({
      top : rowScrollVal,
      behavior : 'smooth'
    })
  } else { // 체크된요소존재안하면 맨위로 스크롤
    table.scrollTo({
      top : 0,
      behavior : 'smooth'
    })
  }
})

const form = document.querySelector('form')
//form의 input이벤트 발생시, 3개의 radio다선택했다면 결제정보를띄움(!null ? 추가 : 텍스트만바꿈)
form.addEventListener("change", function(evt) {
  const radios = form.querySelectorAll('input[type = "radio"]:checked')
  if(radios.length == 3) {
    showPaymentDiv()
  }
})
// memberObj 받아서 user_id, pay_year, pay_month, pay_day 처리 pay_teacher, pay_method도
function showPaymentDiv() {
  const formData = new FormData(document.querySelector('form'))
  const memberObj = Object.fromEntries(formData)
  let [classKey, payMethod, payTeacher] = [memberObj.class, memberObj.method, memberObj.teacher]
  let [type, timesaweek, term] = [classDic[classKey].class_type, classDic[classKey].times_a_week, classDic[classKey].class_term]
  type = (type == 'group') ? '요가' : '개인레슨'
  let payDate = new Date()
  let expireDate = payDate
  payDate = payDate.toLocaleDateString().slice(0, -1)
  expireDate.setMonth(expireDate.getMonth() + term)
  expireDate = expireDate.toLocaleDateString().slice(0, -1)
  const fee = classDic[classKey][`${payMethod}_price`]
  payMethod = (payMethod == 'card' ? '카드' : '현금')
  const commaFormattedFee = getCommaFormattedNumbers(String(fee))

  const paymentDiv = document.querySelector('#payment-info')
  if (paymentDiv) { //있다면 텍스트만 교체
    paymentDiv.querySelector("#text-class-info").textContent = `${type} 주${timesaweek}회 ${term}개월반`
    paymentDiv.querySelector("#text-class-term").textContent = `${payDate} ~ ${expireDate}`
    paymentDiv.querySelector("#text-pay-date").textContent = payDate
    paymentDiv.querySelector("#text-pay-teacher").textContent = payTeacher 
    paymentDiv.querySelector("#text-pay-fee").textContent = `${commaFormattedFee}원 [${payMethod}]`
  } else { //없다면 추가
    const paymentDiv = `
    <div id="payment-info">
    <hr>
    <!-- 스크립트로 추가!! -->
    <div class="head-text-wrap">
      <span class="head-text">결제정보</span>
    </div>
    <div id="payment-content">
      <div class="wrap">
        <div class="text">수강항목</div>
        <div class="val"><span id="text-class-info">${type} 주${timesaweek}회 ${term}개월반</span></div>
      </div>
      <div class="wrap">
        <div class="text">수강기한</div>
        <div class="val"><span id="text-class-term">${payDate} ~ ${expireDate}</span></div>
      </div>
      <div class="wrap">
        <div class="text">결제날짜</div>
        <div class="val"><span id="text-pay-date">${payDate}</span></div>
      </div>
      <div class="wrap">
        <div class="text">결제강사</div>
        <div class="val"><span id="text-pay-teacher">${payTeacher}</span></div>
      </div>
      <div class="wrap">
        <div class="text">결제금액</div>
        <div class="val"><span id="text-pay-fee">${commaFormattedFee}원 [${payMethod}]</span></div>
      </div>
    </div>
    <button type="submit">결제등록</button>
  </div>`
  const form = document.querySelector('#info')
  form.innerHTML += paymentDiv
  }
}
//입력후 '결제등록'누르면 formData로 객체데이터 생성
form.addEventListener("submit", function(evt) {
  evt.preventDefault()
  const formData = new FormData(evt.target)
  const memberObj = Object.fromEntries(formData)
  // console.log(memberObj);
  setPaymentObj(memberObj) 
})

function getCommaFormattedNumbers(fee) {
  const characters = []
  for (let i = 0; i < fee.length; i++) {
    const curIndex = fee.length - 1 - i
    const remainder = i % 3
    if (remainder === 0) {
      if (i !== 0) {
        characters.push(",")
      }
    }
    characters.push(fee[curIndex])
  }
  return characters.reverse().join('')
}
async function setPaymentObj(obj) {
  const payment = {}
  payment.user_id = receivedId
  const q = query(collection(db, "members"), where("user_id", "==", receivedId))
  const result = await getDocs(q)
  let name 
  result.forEach(element => {
    name = element.data().name
  })
  payment.user_name = name
  const payDate = new Date()
  const payYear = payDate.getFullYear()
  const payMonth = String(payDate.getMonth() + 1).padStart(2, '0')
  const payDay = String(payDate.getDate()).padStart(2, '0')
  payment.pay_date = `${payYear}${payMonth}${payDay}`
  // console.log(payment.pay_date);
  payment.pay_teacher = obj.teacher
  payment.pay_method = obj.method
  const payKey = obj.class
  setPaymentClassInfo(payment, payKey)
}
function setPaymentClassInfo(obj, key) {
  const payClass = {
    class_type : classDic[key].class_type,
    times_a_week : classDic[key].times_a_week,
    class_term : classDic[key].class_term,
  }
  obj.pay_class = payClass

  obj.pay_fee = classDic[key][`${obj.pay_method}_price`]
  uploadPayment(obj)
}

// setpaymentclassinfo에서 넘어온 obj를 DB에 등록
async function uploadPayment(obj) {
  const docRef = await addDoc(collection(db, "payments"), obj)
  alert("새결제가 등록되었습니다")
  location.href = "/src/member-manage.html"
}
