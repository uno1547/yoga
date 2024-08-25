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
class Pagination {
  constructor(expireArr) {
    this.elNum = expireArr.length 
    this.maxElNum = 5
    this.pageNum = (this.elNum % this.maxElNum == 0) ? Math.floor(this.elNum / this.maxElNum) : Math.floor(this.elNum / this.maxElNum) + 1
    this.curPageNum = 1
    this.expireArr = expireArr
  }
  initPaginationBar() {
    const paginationDiv = document.querySelector("#pagination")
    paginationDiv.innerHTML = ''
    if(this.elNum == 0) {
      const listDiv = document.querySelector("div#table-div table.list-val")
      listDiv.innerHTML = "해당날짜에 만료예정 결제가 없습니다."
      return
    }
    // pagination div생성
    paginationDiv.innerHTML = `<button id="prev"><</button>
    <div id="page-indicator"></div>
    <button id = "next">></button>
    `
    // 계산된 pageNum을 통해 indicator개수세팅
    const pageIndicatorDiv = document.querySelector("#pagination #page-indicator")
    for(let i = 0; i < this.pageNum; i++) {
      pageIndicatorDiv.innerHTML += `<div class="page-btn">
        <span class ="page-num">${i + 1}</span>
      </div>
      `
    }
    // indicator 직접클릭시 페이지 이동 가능하게 리스너 추가
    const pageBtnElements = pageIndicatorDiv.querySelectorAll(".page-btn")
    pageBtnElements.forEach((btnNode) => {
      btnNode.addEventListener('click', () => {
        // 이 리스너도 사실 중첩등록의 여지가 있지만, 매번 #pagination을 비우고시작하기에 상관없음
        this.curPageNum = Number(btnNode.textContent)
        console.log(`curPageNum : ${this.curPageNum}`);
        this.styleCurpageBtn()
        this.showCurrentPageItems()
      })
    })

    // 최초 current 페이지 스타일적용 및 해당 page item 표시
    this.styleCurpageBtn()
    this.showCurrentPageItems()

    const prevBtn = document.querySelector('#pagination button#prev')
    const nextBtn = document.querySelector('#pagination button#next')

    prevBtn.addEventListener('click', () => {
      const changedCurPageNum = this.curPageNum - 1  
      if(changedCurPageNum > 0) {
        this.curPageNum -= 1
        console.log(`curPageNum : ${this.curPageNum}`);
        this.styleCurpageBtn()
        this.showCurrentPageItems()
      }
    })
    
    nextBtn.addEventListener('click', () => {
      const changedCurPageNum = this.curPageNum + 1  
      // 여기서 이 this는 nextBtn을 가르키지않네??? 
      if(changedCurPageNum <= this.pageNum) {
        this.curPageNum += 1
        console.log(`curPageNum : ${this.curPageNum}`);
        this.styleCurpageBtn()
        this.showCurrentPageItems()
      }
    })
  }
  // .current 에 스타일 추가
  styleCurpageBtn() {
    const pageIndicatorDiv = document.querySelector("#pagination #page-indicator")
    const prevCurBtnEl = pageIndicatorDiv.querySelector(".current")
    // 맨처음에는 선택된 버튼없으므로 초기화
    if(!prevCurBtnEl) {
      const firstPageBtn = document.querySelector(".page-btn:first-child")
      firstPageBtn.classList.add("current")
      return
    }
    // 갱신된 curPageNum에 대해 스타일  
    prevCurBtnEl.classList.remove("current")
    const btnEls = Array.from(pageIndicatorDiv.querySelectorAll("div.page-btn"))
    const curBtnEl = btnEls.filter((node) => node.textContent == this.curPageNum)[0]  
    curBtnEl.classList.add("current")
  }
  // curPageNum에 대해 item추가
  showCurrentPageItems() {
    const startIdx = this.maxElNum * (this.curPageNum - 1)
    const endIdx = this.maxElNum * this.curPageNum
    console.log(`startIdx : ${startIdx} endIdx : ${endIdx}`)
    const tableDiv = document.querySelector("div.inner table.list-val")
    tableDiv.innerHTML = ""

    for(let i = startIdx; i < endIdx; i++) {
      const curPayment = this.expireArr[i]
      if(curPayment == undefined) break
      const classType = (curPayment.pay_class.class_type == 'group') ? "요가" : "개인레슨"
      const perWeek = curPayment.pay_class.times_a_week
      const classTerm = curPayment.pay_class.class_term

      // const [startYear, startMonth, startDay] = [...curPayment.pay_date].map((val) => String(val).padStart(2, '0'))
      const startDateStr = curPayment.pay_date
      const [startYear, startMonth, startDay] = [startDateStr.slice(0, 4), startDateStr.slice(4, 6), startDateStr.slice(6)]
      // const [endYear, endMonth, endDay] = [...curPayment.expire_date].map((val) => String(val).padStart(2, '0'))
      const expireDateStr = curPayment.expire_date
      const [endYear, endMonth, endDay] = [expireDateStr.slice(0, 4), expireDateStr.slice(4, 6), expireDateStr.slice(6)]


      const leftDays = getDiffDaysToday(curPayment)
      let tableElStr
      if(leftDays < 0) {
        tableElStr =  `<tr class = 'exp'>
        <td>${i + 1}</td>
        <td>${curPayment.user_name} (${curPayment.user_id})</td>
        <td>${classType} 주${perWeek}회 [${classTerm}개월]</td>
        <td>${startYear}.${startMonth}.${startDay} ~ ${endYear}.${endMonth}.${endDay} ( ${leftDays}일 )</td>
      </tr>`
      } else {
        tableElStr = `<tr>
          <td>${i + 1}</td>
          <td>${curPayment.user_name} (${curPayment.user_id})</td>
          <td>${classType} 주${perWeek}회 [${classTerm}개월]</td>
          <td>${startYear}.${startMonth}.${startDay} ~ ${endYear}.${endMonth}.${endDay} ( ${leftDays}일 )</td>
        </tr>`
      }
      tableDiv.innerHTML += tableElStr
    }
  }
}

const allPayments = []
const q = query(collection(db, "payments"))
const querySnapshot = await getDocs(q)
querySnapshot.forEach(doc => {
  allPayments.push(doc.data())
});
console.log(allPayments);

const viewToggleBtn = document.querySelector("button#toggle-view-scale")
let view = "day"

viewToggleBtn.addEventListener("click", function() {
  if(view == "day") {
    prevBtn.removeEventListener("click", prevDateListener)
    nextBtn.removeEventListener("click", nextDateListener)
    viewToggleBtn.textContent = "일별보기"
    view = "month"
    showMonthView()
  } else {
    prevBtn.removeEventListener("click", prevMonthListener)
    nextBtn.removeEventListener("click", nextMonthListener)
    viewToggleBtn.textContent = "월별보기"
    view = "day"
    showDayView()
  }
})

const dateDiv = document.querySelector("#date-nav")
const dateText = dateDiv.querySelector("h2")

const prevBtn = document.querySelector("#date-nav button#prev")
const nextBtn = document.querySelector("#date-nav button#next")

const day = new Date()
showDayView()

function showDayView() {
 showDay()
 setDateNavigator()
 dataManage()
}

function showDay() {
  let [year, month, date] = [day.getFullYear(), day.getMonth() + 1, day.getDate()]
  // console.log(`${year}년 ${month}월 ${date}일`);
  month = String(month).padStart(2, '0')
  date = String(date).padStart(2, '0')
  dateText.innerHTML = `${year}년 ${month}월 ${date}일`
}

function setDateNavigator() {
  prevBtn.addEventListener("click", prevDateListener)
  nextBtn.addEventListener("click", nextDateListener)
}

function prevDateListener() {
  day.setDate(day.getDate() - 1)
  console.log('prevDay');
  showDay()
  dataManage()
}
function nextDateListener() {
  day.setDate(day.getDate() + 1)
  console.log('nextDay');
  showDay()
  dataManage()
}


function showMonthView() {
  showMonth()
  setMonthNavigator()
  dataManage()
}

function showMonth() {
  let [year, month] = [day.getFullYear(), day.getMonth() + 1]
  month = String(month).padStart(2, '0')
  dateText.innerHTML = `${year}년 ${month}월`
}
function setMonthNavigator() {
  prevBtn.addEventListener("click", prevMonthListener)
  nextBtn.addEventListener("click", nextMonthListener)
}

function prevMonthListener() {
  day.setMonth(day.getMonth() - 1)
  console.log('prevMonth');
  showMonth()
  dataManage()
}

function nextMonthListener() {
  day.setMonth(day.getMonth() + 1)
  console.log('nextMonth');
  showMonth()
  dataManage()
}


function dataManage() {
  let filteredPayments
  let sortedPayments
  if(view == "day") { // 일별보기면 기준날짜 15일범위에 있는 결제들 필터
    filteredPayments = getDayViewPayments()
    console.log('일별보기 필터');
    filteredPayments.forEach((pay) => console.log(pay.user_id, pay.user_name, pay.expire_date))
  } else { // 월별보기면 기준날짜 있는 월의 모든결제 불러옴
    filteredPayments = getMonthViewPayments()
    console.log('월별보기 필터');
    filteredPayments.forEach((pay) => console.log(pay.user_id, pay.user_name, pay.expire_date))
  }  
  // 만료일 오름차순으로 정렬
  sortedPayments = filteredPayments.sort((prevPay, nextPay) => {
    const prevDiff = getDiffDays(prevPay)
    const nextDiff = getDiffDays(nextPay)
    return prevDiff - nextDiff
  })
  console.log('정렬된', view, '결제');
  sortedPayments.forEach((pay) => console.log(pay.user_id, pay.user_name, pay.expire_date))
  // 출력함수에 넘겨줌
  showPayments(sortedPayments)
}
// 기준날짜 ~ 기준날짜 + 15일 사이에 만료되는 결제들 불러오기
function getDayViewPayments() {
  const filteredPayments = allPayments.filter((payment) => {
    return (getDiffDays(payment) >= 0) && (getDiffDays(payment) <= 15)
  })
  console.log('일별보기로 필터링된 결제들', filteredPayments);
  return filteredPayments
}
// 기준날짜 속한 '월'의 모든결제 불러오기
function getMonthViewPayments() {
  const [dayYear, dayMonth] = [String(day.getFullYear()), String(day.getMonth() + 1).padStart(2, '0')]
  const monthViewPayments = allPayments.filter((payment) => {
    return (payment.expire_date.slice(0, 4) == dayYear) && (payment.expire_date.slice(4, 6) == dayMonth)
  })
  console.log('월별보기로 필터링된 결제들', monthViewPayments);
  return monthViewPayments
}


function getDiffDays(pay) { // 기준 날짜와 결제 만료일이 몇일차이나는지 구하기위함
  // 기준날짜 day는 전역에 있는상태
  // console.log(pay.expire_date);
  const [expYear, expMonth, expDay] = [Number(pay.expire_date.slice(0, 4)), Number(pay.expire_date.slice(4, 6)) - 1 , Number(pay.expire_date.slice(6))]
  const expDate = new Date(expYear, expMonth, expDay) // 결제 일의객체
  expDate.setHours(23)
  expDate.setMinutes(59)
  expDate.setMinutes(59)
  // console.log('만료날짜객체', expDate.toLocaleDateString());
  // console.log('현재날짜객체', day.toLocaleDateString());
  const diffSec = expDate.getTime() - day.getTime()
  const diffDate = Math.floor(diffSec / (1000 * 60 * 60 * 24))
  // console.log('오늘과 만료날짜 차이기간', diffDate);
  return diffDate
}




function showPayments(payments) {
  const tableDiv = document.querySelector("#table-div table.list-val")
  tableDiv.innerHTML = ''

  const paginationObj = new Pagination(payments)
  paginationObj.initPaginationBar()
}

function getDiffDaysToday(pay) { // 현재 날짜기준 결제만료일이몇일 남았는지 구하기위함
  const today = new Date()
  // const [expYear, expMonth, expDay] = [pay.expire_date[0], pay.expire_date[1] - 1 , pay.expire_date[2]]
  const [expYear, expMonth, expDay] = [Number(pay.expire_date.slice(0, 4)), Number(pay.expire_date.slice(4, 6)) - 1 , Number(pay.expire_date.slice(6))]
  const expDate = new Date(expYear, expMonth, expDay) //만기일 객체
  expDate.setHours(23)
  expDate.setMinutes(59)
  expDate.setMinutes(59)
  const diffSec = expDate.getTime() - today.getTime()
  const diffDate = Math.floor(diffSec / (1000 * 60 * 60 * 24))
  return diffDate
}










// const prevBtn = document.querySelector('#pagination button#prev')
// const nextBtn = document.querySelector('#pagination button#next')
/*
const allPaymentsFirestore = []
const q1 = query(collection(db, "open_payments"))
const querySnapshot1 = await getDocs(q1)
querySnapshot1.forEach(doc => {
  allPaymentsFirestore.push(doc.data())
});
const parsedDatas = allPaymentsFirestore.map((pay) => {
  return {name : pay.user_id, payDay : `${pay.pay_year} / ${pay.pay_month} / ${pay.pay_day}`, expDay : `${pay.pay_year} / ${pay.pay_month + pay.pay_class.class_term} / ${pay.pay_day}`}
})
console.log(parsedDatas);
*/
// 최초의 기준날짜는 현재날짜(금일)





/*
const prevDateBtn = document.querySelector("#date-nav #prev")
const nextDateBtn = document.querySelector("#date-nav #next")

prevDateBtn.addEventListener('click', function() {
  day.setDate(day.getDate() - 1) 
  showDate()
  filterExpireee()
})
nextDateBtn.addEventListener('click', function() {
  day.setDate(day.getDate() + 1)
  showDate()
  filterExpireee()
})
const allPayments = []
const q = query(collection(db, "open_payments"))
const querySnapshot = await getDocs(q)
querySnapshot.forEach(doc => {
  allPayments.push(doc.data())
});
filterExpireee()
*/
// console.log('hi');

// 순서 : 필터링(기준날짜15일) > 정렬 > 결제별 정보(회원) > 




// 현재 날짜 기준으로 만료일이 15일 이후까지인 결제들 filter
function filterExpireee() {
  // allPayments.forEach((pay) => {getTerm(pay)})
  // console.log('hi');
  const soonExpire = allPayments.filter((pay) => {
    // console.log('filtering');
    return ((pay.pay_fee <= 100) &&(getTerm(pay) <= 15)) && (getTerm(pay) >= 0) //평가하니깐 당연히 출력됨
    // return ((pay.pay_fee < 50) && (getTerm(pay) <= 15) && (getTerm(pay) >= 0))
  })
  // console.log(soonExpire);
  sortExpires(soonExpire)
}

function sortExpires(expires) {
  expires.sort((a, b) => {
    const aDiff = getTerm(a)
    const bDiff = getTerm(b)
    
    if(aDiff < bDiff) return -1
    else if(aDiff > bDiff) return 1
    else return 0
  })
  // showExpires(expires)
  getExpireInfo(expires)
  // console.log(expires);
}
async function getExpireInfo(expires) {
  const userArr = []
  for(let i = 0; i < expires.length; i++) {
    const payUser = await getInfo(expires[i].user_id)
    userArr.push(payUser)
  }
    // return userArr
  showExpires(userArr, expires)
}
  
function showExpires(userArr, expires) {
  // console.log(userArr)
  console.log(expires);
  const tableDiv = document.querySelector("#table-div table.list-val")
  tableDiv.innerHTML = ''
    
  const paginationObj = new Pagination(userArr, expires) // 날짜 이동시마다 showExpire가 호출되는데, 이호출로 인해 initbar가 호출되면서 리스너가 중첩등록 되는듯함
  // 날짜변경시마다 pagination이 새로 생성되어, #pagination button#prev에 리스너가 중첩으로 등록된다. 이건 익명함수써서 생긴 중첩이 아닌듯,기존에 붙여놓은게 달려있으니깐
  paginationObj.initPaginationBar()
    
    /*
    for(let i = 0; i < expires.length; i++) {
      const curPayment = expires[i]
      const payUser = userArr[i]

      // const payUser = await getInfo(curExpire.user_id) // 이상태면 undefined로 감싸진 프로미스 올듯함
      // {user_id: 2212, name: '김윤오' .... }
      console.log(payUser)
      // const classInfo = getClassInfo(curExpire)
      const classType = (curExpire.pay_class.class_type == 'group') ? "요가" : "개인레슨"
      const perWeek = curExpire.pay_class.times_a_week
      const classTerm = curExpire.pay_class.class_term
      const endArr = getEnd(curExpire)
      const [startYear, startMonth, startDay] = [curExpire.pay_year, String(curExpire.pay_month).padStart(2, '0'), String(curExpire.pay_day).padStart(2, '0')]
      const [endYear, endMonth, endDay] = [endArr[0], String(endArr[1]).padStart(2, '0'), String(endArr[2]).padStart(2, '0')]
      const leftDays = getTermToday(curExpire)
    let tableElStr
    if(leftDays < 0) {
      tableElStr = `<tr class = 'exp'>
      <td>${i + 1}</td>
      <td>${payUser.name} (${payUser.user_id}) [${payUser.gender}]</td>
      <td>${classType} 주${perWeek}회 [${classTerm}개월]</td>
      <td>${startYear}.${startMonth}.${startDay} ~ ${endYear}.${endMonth}.${endDay} ( ${leftDays}일 )</td>
      </tr>`
    } else {
      tableElStr = `<tr>
      <td>${i + 1}</td>
      <td>${payUser.name} (${payUser.user_id}) [${payUser.gender}]</td>
      <td>${classType} 주${perWeek}회 [${classTerm}개월]</td>
      <td>${startYear}.${startMonth}.${startDay} ~ ${endYear}.${endMonth}.${endDay} ( ${leftDays}일 )</td>
      </tr>`
    }
    tableDiv.innerHTML += tableElStr
  }
  */  
}

async function getInfo(userId) { //userId로 이름, 성별 불러옴
  // const userInfo = {}
  let user
  const q = query(collection(db, "members"), where("user_id", "==", userId))
  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    // console.log(doc.data())
    user = doc.data()
    // userInfo.name = doc.data().name
    // userInfo.gender = doc.data().gender
  })
  return user // Fulfilled된 프로미스(result : user객체)가 반환되야하는거아님??
}

function getEnd(pay) {
  // const start = {year : pay.pay_year, month : pay.pay_month, day : pay.pay_day}
  const term = pay.pay_class.class_term
  const endDate = new Date(pay.pay_year, pay.pay_month - 1, pay.pay_day)
  endDate.setMonth(endDate.getMonth() + term)
  // console.log(endDate);
  const endDateArr = [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()]
  return endDateArr
  // const end = 
}
function getTermToday(pay) { // 현재 날짜기준 결제만료일이몇일 남았는지 구하기위함
  // const payDate = new Date(pay.pay_year, pay.pay_month - 1, pay.pay_day)
  // console.log('결제날짜객체', payDate);
  // const expDate = new Date(2024, 5, 26) // 결제 일의객체
  const today = new Date()
  const expDate = new Date(pay.pay_year, pay.pay_month - 1, pay.pay_day) // 결제 일의객체
  expDate.setMonth(expDate.getMonth() + pay.pay_class.class_term)
  ///
  expDate.setHours(23)
  expDate.setMinutes(59)
  expDate.setMinutes(59)
  // console.log('만료날짜객체', expDate);
  // console.log('현재날짜객체', day);
  ///
  // const withParDate = new Date(2024,5,25)
  // console.log('현재날짜 2024,5,25', withParDate);
  // console.log(`결제일 ${payDate.toLocaleDateString()}만료일 ${expDate.toLocaleDateString()} Date() ${day.toLocaleDateString()}`);
  // const expOfPay = new Date(2024, 6, 25)
  const diffSec = expDate.getTime() - today.getTime()
  const diffDate = Math.floor(diffSec / (1000 * 60 * 60 * 24))
  // const diffDate = (diffSec > 0) ? Math.floor(diffSec / (1000 * 60 * 60 * 24)) + 1 : parseInt(diffSec / (1000 * 60 * 60 * 24))
  // const diffDate = Math.floor(Math.abs(diffSec / (1000 * 60 * 60 * 24)))
  // const diffDate = Math.floor((diffSec / (1000 * 60 * 60 * 24)))
  // const diffDate = (diffSec / (1000 * 60 * 60 * 24))
  // console.log(diffDate,'일');
  return diffDate
}

// 기준날짜와 pay의 만료일사이의 날짜차이를 계산 > 결제 데이터에 expiredate의 멤버를 넣으면 날짜 비교를 더 편하게 할수있으려나
function getTerm(pay) { // 기준 날짜와 결제 만료일이 몇일차이나는지 구하기위함
  const expDate = new Date(pay.pay_year, pay.pay_month - 1, pay.pay_day)
  expDate.setMonth(expDate.getMonth() + pay.pay_class.class_term)
  expDate.setHours(23)
  expDate.setMinutes(59)
  expDate.setMinutes(59)
  const diffSec = expDate.getTime() - day.getTime()
  const diffDate = Math.floor(diffSec / (1000 * 60 * 60 * 24))
  return diffDate
}

