import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import { getFirestore, collection, query, where, getDocs, doc, getDoc, setDoc, addDoc} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBykm-oqoMvIAjLFWHPnVi_OQ86Iis_NVs",
  authDomain: "yoga-663cb.firebaseapp.com",
  projectId: "yoga-663cb",
  storageBucket: "yoga-663cb.appspot.com",
  messagingSenderId: "256248240983",
  appId: "1:256248240983:web:07dcebbcb04debc34b3c12"
})

// 회원 탐색 버튼에 리스너 추가
const buttons = document.querySelector("#personal-data .buttons")
const prevBtn = buttons.querySelector("#prevMember")
const nextBtn = buttons.querySelector("#nextMember")
const toUpdateBtn = buttons.querySelector("#update-info")
// 이전 회원 조회
prevBtn.addEventListener('click', function () {
  if (currentMemberIndex == 0) {
    currentMemberIndex = members.length - 1
  } else {
    currentMemberIndex -= 1
  }
  currentMember = members[currentMemberIndex]
  currentMemberID = currentMember.user_id
  getQueries(currentMemberID)
})
// 다음 회원 조회
nextBtn.addEventListener('click', function () {
  currentMemberIndex = Math.abs((currentMemberIndex + 1) % members.length)
  currentMember = members[currentMemberIndex]
  currentMemberID = currentMember.user_id
  getQueries(currentMemberID)
})
// 정보 수정 페이지로 이동(with user_id)
toUpdateBtn.addEventListener('click', function () {
  location.href = `/src/update-info.html?user_id=${currentMemberID}`
})
// 페이지 이동 버튼 추가
const signUpBtn = document.querySelector(".update #sign-up")
const newPayBtn = document.querySelector(".update #new-pay")
const atdBtn = document.querySelector(".update #attendance-update")
const expireBtn = document.querySelector(".update #show-expire")
signUpBtn.addEventListener('click', function() {
  location.href = "/src/new-member.html"
})
newPayBtn.addEventListener('click', function() {
  location.href = `/src/new-payment.html?user_id=${currentMemberID}`
})
atdBtn.addEventListener('click', function() {
  location.href = `/src/live-attendance.html`
})
expireBtn.addEventListener('click', function() {
  window.open('/src/expire-members.html', 'expire-popup' ,'popup, width=1000, height=1000, top=200, left=200')

})

// 전체 member불러옴 
const db = getFirestore(app)
const memberQueries = await getDocs(collection(db, "members"))
const members = [] 
memberQueries.forEach(doc => members.push(doc.data()))
members.sort((a, b) => a.name.localeCompare(b.name))

//먼저 첫번째 회원담고 기본정보,출결현황,결제내역을 표시!!
let currentMember = members[0] 
let currentMemberIndex = members.indexOf(currentMember) // 0?  
let currentMemberID = currentMember.user_id 
getQueries(currentMemberID)

// userId로 pay, attend 조회
async function getQueries(userid) {
  const currentMemberPayments = []
  const currentMemberAttendance = []
  const payQueries = query(collection(db, "payments"), where("user_id", "==", userid))
  const attendQueries = query(collection(db, "attendances"), where("user_id", "==", userid))
  const payDocs = await getDocs(payQueries)
  payDocs.forEach((doc) => currentMemberPayments.push(doc.data()))
  const attendDocs = await getDocs(attendQueries)
  attendDocs.forEach((doc) => currentMemberAttendance.push(doc.data()))
  // console.log('현재멤버의 결제', currentMemberPayments);
  // console.log('현재맴베의 출결', currentMemberAttendance);
  viewer(currentMember, currentMemberPayments, currentMemberAttendance)
}

// 회원 정보, 결제 목록, 출결 목록을 표시
function viewer(member, payments, attendances) {
  showMemberInfo(member)
  showMemberClass(payments)
  showMemberPayments(payments)
  showMemberAttendance(attendances)
}

// member의 수강정보를 제외한 기본정보 표시
function showMemberInfo(member) {
  for (let prop in member) {
    let tdEl = document.querySelector(`td.${prop}`)
    if (prop == "gender") {
      document.querySelector(".gender-span").textContent = `[${member[prop]}]`
    } else if (prop == "name"){
      document.querySelector(".name-span").textContent = member[prop]
    } else if(prop == "group") {
      switch(member[prop]) {
        case "group":
          tdEl.textContent = "그룹레슨"
          break
        case "misole":
          tdEl.textContent = "마이솔"
          break
        case "pt":
          tdEl.textContent = "개인레슨"
          break
      }
    } else {
      tdEl.textContent = member[prop]
    }
  }
}

// member의 수강정보 표시(by 결제내역의 pay_class)
function showMemberClass(payments) {
  payments.sort(function(a, b) { // 만기일 기준 내림차순 정렬(제일최근결제선택)
    if(a.pay_date < b.pay_date) {
      return 1
    } else if(a.pay_date > b.pay_date) {
      return -1
    } else {
      return 0
    }
  })
  let recentPay = payments[0]
  // console.log('제일최근결제', recentPay)
  const classTd = document.querySelector("table.info td.class")
  if (recentPay) {
    let typeStr
    if (recentPay.pay_class.class_type == "group") {
      typeStr = "요가"
    } else { 
      typeStr = "개인레슨"
    }
    let payDate = getDateString(recentPay.pay_date)
    let expireDate = getDateString(recentPay.expire_date)
    // console.log(payDate, expireDate);
    const term = getTermToday(recentPay)
    // console.log(term);
    if((term <= 15) && (term >= 0)) { //만기일이 15일 이내라면
      classTd.innerHTML = `${typeStr} 주 ${recentPay.pay_class.times_a_week}회 [${recentPay.pay_class.class_term}개월] <br> <span class = "small-date alert">${payDate} ~ ${expireDate} [만료 ${term}일전]</span>`
    } else { //여유있을경우
      classTd.innerHTML = `${typeStr} 주 ${recentPay.pay_class.times_a_week}회 [${recentPay.pay_class.class_term}개월] <br> <span class = "small-date">${payDate} ~ ${expireDate}</span>`
    }
  } else {
    classTd.innerHTML = `등록된 수업이없습니다<br><span class = "small-date">수업을 등록해주세요</span>`
  }
}

// "YYYYMMDD" > "YYYY. MM. DD"
function getDateString(date) {
  const year = date.slice(0, 4)
  const month = date.slice(4, 6)
  const day = date.slice(6)
  return `${year}. ${month}. ${day}`
}

// 현재 날짜, 만료일 사이의 날짜차이를 반환해줌
function getTermToday(pay) {
  const today = new Date()
  // console.log('오늘 날짜객체', today.toLocaleDateString()); 
  const [year, month, day] = [pay.expire_date.slice(0,4), pay.expire_date.slice(4, 6), pay.expire_date.slice(6)]
  const expDate = new Date(year, month-1, day)
  // console.log('만료 날짜객체', expDate.toLocaleDateString()); 
  expDate.setHours(23)
  expDate.setMinutes(59)
  expDate.setSeconds(59)
  // 24/8/16 00 시 - 24/8/15 20시 시간간격에 4시간 밖에 안되니 당연히 1일로 인식못하는 건가 
  const diffSec = expDate.getTime() - today.getTime()
  const diffTerm = Math.floor(diffSec / (1000 * 60 * 60 * 24))
  // console.log(diffTerm);
  return diffTerm
}

//해당회원의 모든결제정보로 결제내역 목록 표시
function showMemberPayments(payments) {
  let tableArea = document.querySelector('table.val')
  tableArea.innerHTML = ""
  // 없다면 종료
  if(payments.length == 0) {
    tableArea.innerHTML += `<span id = "empty">결제내역이 없습니다</span>`
    return
  }
  for (let i = 0; i < payments.length; i++) {
    //모든 결제에 대하여 순회하면서 정보 표시후 추가
    let payment = payments[i]
    let [classType, classPerWeek, classTerm] = [payment.pay_class.class_type, payment.pay_class.times_a_week, payment.pay_class.class_term]
    if (classType == 'group') {
      classType = '요가'
    } else {
      classType = '개인레슨'
    }

    let payDate = getDateString(payment.pay_date)
    let expireDate = getDateString(payment.expire_date)
    let fee = String(payment.pay_fee)
    let commaFormattedFee = getCommaFormattedNumbers(fee)
    let status 
    let trEls
    const leftDays = getTermToday(payment)
    //제일 최근의 결제에 대해서만 만기 검사 실행후 빨강표시
    if(i == 0 && (leftDays <= 15) && (leftDays >= 0)) { 
      status = `만료임박`
      trEls = `
      <tr class = "alert">
        <td>${i + 1}</td>
        <td>${payDate}</td>
        <td>${classType} 주 ${classPerWeek}회 [${classTerm}개월]</td>
        <td>${payDate} ~ ${expireDate}</td>
        <td>${status}</td>
        <td>${commaFormattedFee} 원</td>
      </tr>
      `
      tableArea.innerHTML += trEls
      continue
    }
     // 만료된 결제(수업)에 대해서 폐기 줄그음 처리
    if(leftDays < 0) {
      status = '만료'
      trEls = `
      <tr class ='expire'>
        <td>${i + 1}</td>
        <td>${payDate}</td>
        <td>${classType} 주 ${classPerWeek}회 [${classTerm}개월]</td>
        <td>${payDate} ~ ${expireDate}</td>
        <td>${status}</td>
        <td>${commaFormattedFee} 원</td>
      </tr>
      `
      tableArea.innerHTML += trEls
      continue
    }
    // 나머지 일반결제
    status = "유효"
    trEls = `
    <tr>
      <td>${i + 1}</td>
      <td>${payDate}</td>
      <td>${classType} 주 ${classPerWeek}회 [${classTerm}개월]</td>
      <td>${payDate} ~ ${expireDate}</td>
      <td>${status}</td>
      <td>${commaFormattedFee} 원</td>
    </tr>
    `
    tableArea.innerHTML += trEls
    /*
    if(condition A) {
      do A
    } else if(condition B) {
      do B 
    } else {
      do C 
    }
    
    if(condition A) {
      do A  
      continue
    } 
    if(condition B) {
      do B
      continue
    }
    do C
    위 두가지는 같은 동작을 하지않을까
    */
  }
}
// 해다회원의 출석정보로 달력에 출석 표시
function showMemberAttendance(attendances) { 
  let attendEvents = []
  attendances.forEach((attendance) => {
    let event = {}
    const [year, month, day] = [attendance.attend_date.slice(0, 4), attendance.attend_date.slice(4, 6), attendance.attend_date.slice(6)]
    let date = `${year}-${month}-${day}`
    event.start = date
    event.end = date
    event.display = 'background'
    event.color = '#8fdf82'
    attendEvents.push(event)
  })
  const calendarEl = document.querySelector('#attend-calender')
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView : 'dayGridMonth',
    buttonText : {
      today : '오늘'
    },
    headerToolbar : {
      start : 'today',
      center : 'title',
      end : 'prev,next'
    },
    events : attendEvents,
  })
  calendar.render()
}
// 세자리단위 , 표시
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
