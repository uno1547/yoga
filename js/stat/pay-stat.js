
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
/*
await addDoc(collection(db, "test_payments_string"), {
  user_id : 4429,
  user_name : '네이버',
  pay_date : "20240723",
  expire_date : "20240823",
  pay_fee : 10000, 
  pay_method : "card", 
  pay_teacher : "김예림", 
  pay_class : { 
    class_type : "group", 
    times_a_week : 2, 
    class_term : 1, 
    }
    });
    */
   
class Pagination {
  constructor(paymentArr, userDic) {
    this.elNum = paymentArr.length
    this.maxElNum = 10
    this.pageNum = (this.elNum % this.maxElNum == 0) ? Math.floor(this.elNum / this.maxElNum) : Math.floor(this.elNum / this.maxElNum) + 1
    this.curPageNum = 1
    this.paymentArr = paymentArr
    this.userDic = userDic
  }
  // #pagitaion 초기화하고, pageNum만큼 indicator추가
  initPaginationBar() {
    const paginationDiv = document.querySelector(".inner div#pagination")
    // paginationDiv.innerHTML = 'hi'
    if(this.elNum == 0) {
      const listDiv = document.querySelector("div#table-list table#list-val")
      listDiv.innerHTML = "해당날짜에 만료예정 결제가 없습니다."
      return
    }
    // pagination 컴포넌트 추가
    console.log('hi');
    paginationDiv.innerHTML = `<button id="prev"><</button>
    <div id="page-indicator"></div>
    <button id = "next">></button>
    `
    const pageIndicatorDiv = document.querySelector("#pagination #page-indicator")
    for(let i = 0; i < this.pageNum; i++) {
      pageIndicatorDiv.innerHTML += `<div class="page-btn">
        <span class ="page-num">${i + 1}</span>
      </div>
      `
    }
    
    // 각indicator에 클릭 리스너추가 (클릭시 해당페이지로이동)
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
    // 맨처음
    this.styleCurpageBtn()
    this.showCurrentPageItems()
    
    
    const prevBtn = document.querySelector('#pagination button#prev')
    const nextBtn = document.querySelector('#pagination button#next')
    
    // nextBtn, prevBtn 에 클릭 리스너추가
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
  async showCurrentPageItems() {
    // 현재 구간에 대해서 slice해서 보여주면됌
    const startIdx = this.maxElNum * (this.curPageNum - 1)
    const endIdx = this.maxElNum * this.curPageNum
    // console.log(`startIdx : ${startIdx} endIdx : ${endIdx}`)
    // 위치!! 여기뭔가 이상할지도 너무빨리 없애서?
    // console.log(this.elNum);
    // 위치
    
    
    // start 부터 index 까지 info프로퍼티 추가해줌
    for(let i = startIdx; i < endIdx; i++) {
      const payment = this.paymentArr[i]
      if(!payment) break
      // console.log(payment);
      payment.info = {}
      const id = payment.user_id
      const infoPromise = this.userDic[id]
      await infoPromise.then((response) => response.forEach((snapshot) => {
        payment.info.teacher = snapshot.data().teacher
        payment.info.phoneNum = snapshot.data().phone_number
      }))
    }
    
    // 결제일 최신순으로 정렬
    // this.paymentArr.sort((a, b) => {
      //   if(a.pay_date < b.pay_date) { // 2023 2024
      //     return 1
      //   } else if(a.pay_date > b.pay_date){
        //     return -1
        //   } else {
          //     return 0
          //   }
          // })
          
          // info프로퍼티 추가된 start부터 index까지 html문자열화 
          const slicedPayments = this.paymentArr.slice(startIdx, endIdx)
          const paymentsInnerHTML = slicedPayments.map((payment) => {
            const payDate = payment.pay_date
            const [payYear, payMonth, payDay] = [payDate.slice(0, 4), payDate.slice(4, 6), payDate.slice(6)]
            const expireDate = payment.expire_date
            const [expireYear, expireMonth, expireDay] = [expireDate.slice(0, 4), expireDate.slice(4, 6), expireDate.slice(6)]
            return `<tr>
            <td>${payYear}-${payMonth}-${payDay}</td>
            <td>${payment.user_name}</td>
            <td>${payment.info.teacher}</td>
            <td>${payment.pay_teacher}</td>
            <td>${payment.info.phoneNum}</td>
            <td>요가 주${payment.pay_class.times_a_week}회 [${payment.pay_class.class_term}개월] [주 ${payment.pay_class.times_a_week}회권]</td>
            <td>${payYear}-${payMonth}-${payDay}</td>
            <td>${expireYear}-${expireMonth}-${expireDay}</td>
            <td>${getFormattedNum(payment.pay_fee)}원</td>
            </tr>`
          })
          // 기존 10개 다비움
          const tableDiv = document.querySelector("div.inner table#list-val")
          tableDiv.innerHTML = ""
          // 받은 데이터 개수만큼 채움
          for(let i = 0; i < paymentsInnerHTML.length; i++) {
            tableDiv.innerHTML += paymentsInnerHTML[i]
          } 
          // 나머지 개수는 빈줄로 채움
          for(let i = paymentsInnerHTML.length; i < 10; i++) {
            tableDiv.innerHTML += `          <tr class = "skeleton-line">
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            </tr>`
          }
    // paymentsInnerHTML.forEach((el) => {
    //   tableDiv.innerHTML += el
    // })
  }

}

// 전체결제, 월별결제, 일별결제 버튼에 각 리스너 추가

const allPayBtn = document.querySelector("main ul#term-select li:nth-child(1)")
const monthPayBtn = document.querySelector("main ul#term-select li:nth-child(2)")
const dayPayBtn = document.querySelector("main ul#term-select li:nth-child(3)")

allPayBtn.addEventListener("click", function() {
  styleCurPayBtn(this)
  showAllView()
  window.scrollTo(0, 0)
})

monthPayBtn.addEventListener("click", function() {
  styleCurPayBtn(this)
  showMonthView() 
  window.scrollTo(0, 0)
})
dayPayBtn.addEventListener("click", function() {
  styleCurPayBtn(this)
  showDayView()
  window.scrollTo(0, 0)
})

// 1. 처음로딩시 전체결제 보기
// styleCurPayBtn(allPayBtn)
showAllView() 
// window.scrollTo(0, 0)

// 현재 결제(전체, 월별, 일별) 스타일추가 by classList
function styleCurPayBtn(el) {
  // 기존의 span.current의 .current제거후
  // 매개변수로 받은 el에 cur추가
  const prevBtn = document.querySelector("main ul#term-select span.current")
  if(prevBtn) { // 처음아닐때
    prevBtn.classList.remove("current")
    const cur = el.querySelector("span")
    cur.classList.add("current")
  } else { // 처음일때
    const firstSpan = document.querySelector("main ul#term-select li:nth-child(1) span")
    firstSpan.classList.add("current")
  }
}

// 전체결제 view보여주는 함수
function showAllView() {
  resetToAllView()
  getAllQueries()
}

// 전체결제 DOM 초기화 
function resetToAllView() {
  // short-view에 스켈레톤추가
  const shortViewValEl = document.querySelector("main table#short-view-val")
  shortViewValEl.innerHTML = `<tr class = "skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
        </tr>`

  // 검색창 초기화
  const dateInputEl = document.querySelector("main div#date-input")
  dateInputEl.innerHTML = ""
  dateInputEl.innerHTML = `검색기간
        <input type="date" id="start-date"> ~
        <input type="date" id="end-date">
        <input type="button" id='search' value="검색">`
  initInput() // 초기값 설정

  // 리스너 추가
  const searchBtn = dateInputEl.querySelector("input#search")
  searchBtn.addEventListener("click", () => {
    const startDate = dateInputEl.querySelector("input#start-date").value
    const endDate = dateInputEl.querySelector("input#end-date").value
    getAllQueries(startDate, endDate)
  })

  // 리스트 table 키 값
  const tableListKey = document.querySelector("main #table-list table#list-key")
  const tableKeyClass = tableListKey.classList[0]
  tableListKey.classList.remove(tableKeyClass)

  tableListKey.classList.add("all-list")
  tableListKey.innerHTML = ""
  tableListKey.innerHTML = `<tr>
            <th>결제일</th>
            <th>회원이름</th>
            <th>담당강사</th>
            <th>결제강사</th>
            <th>휴대폰번호</th>
            <th>결제항목</th>
            <th>시작일</th>
            <th>만료일</th>
            <th>결제금액</th>
          </tr>`
  // 리스트 table-val 에 스켈레톤 추가
  const tableListVal = document.querySelector("main #table-list table#list-val")
  const tableValClass = tableListVal.classList[0]
  tableListVal.classList.remove(tableValClass)

  tableListVal.classList.add("all-list")
  tableListVal.innerHTML = ""
  tableListVal.innerHTML += `          <tr class = "skeleton-line">
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
          </tr>
          <tr class = "skeleton-line">
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
          </tr>
          <tr class = "skeleton-line">
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
          </tr>
          <tr class = "skeleton-line">
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
          </tr>
          <tr class = "skeleton-line">
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
          </tr>
          <tr class = "skeleton-line">
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
          </tr>
          <tr class = "skeleton-line">
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
          </tr>
          <tr class = "skeleton-line">
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
          </tr>
          <tr class = "skeleton-line">
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
          </tr>
          <tr class = "skeleton-line">
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
            <td><span></span></td>
          </tr>`

  // const paginationEl = document.querySelector("div#pagination")
  // paginationEl.innerHTML = ""
}
// 전체결제 데이터 쿼리
async function getAllQueries(start, end) {
  const queriedPayments = [] // 불러온 payments 담을 배열
  const userDic = {} // 해당구간의 날짜에 속하는 pay_date의 userinfo를 

  let q
  if(start && end) { // 매개변수로 날짜 구간들어왔을때
    const startStr = start.split('-').join('')
    const endStr = end.split('-').join('')
    console.log(startStr, endStr);
    q = query(collection(db, "payments"), where("pay_date", "<=", endStr), where("pay_date", ">=", startStr))
  } else { // 맨처음 입력 날짜가 없을때 한달치의 결제 불러옴
    console.log('처음!!');
    q = query(collection(db, "payments"), where("pay_date", "<=", getTodayDateString()), where("pay_date", ">=", getPrevDateString()))
  }

  const querySnapshot = await getDocs(q) // payments 컬랙션에 결제를 요청 (id로 쿼리날리는건 최소한 이라인 이후부터 실행해야할듯)
   // 개선된 코드
  querySnapshot.forEach((doc) => {
    // 받은 결제데이터들을 받음과 동시에, 결제의 user_id로 member컬렉션에 미리 요청날려놓음 await는 안함. promise로 받아서 아래가서쓸거임
    const id = doc.data().user_id
    const idQuery = query(collection(db, "members"), where("user_id", "==", id))
    userDic[id] = getDocs(idQuery) // {1100 : promise, 2212 : promise}
    queriedPayments.push(doc.data()) // 받은 결제 담음
  })
  console.log(queriedPayments);
  queriedPayments.sort((a, b) => {
    if(a.pay_date < b.pay_date) { // 2023 2024
      return 1
    } else if(a.pay_date > b.pay_date){
      return -1
    } else {
      return 0
    }
  })
  showInOverview(queriedPayments)
  const page = new Pagination(queriedPayments, userDic)
  page.initPaginationBar() // 새 데이터에 대해 갱신되어야함
}

// 월별결제 view보여주는 함수
function showMonthView() {
  resetToMonthView() 
  getMonthQueries()
}

// 월별결제를 위해 DOM 수정 이거 의미가 없음 왜 표시가 안되는거지 await시간이 짧아서 그런가
function resetToMonthView() {
  // short-view에 스켈레톤추가
  const shortViewValEl = document.querySelector("main table#short-view-val")
  shortViewValEl.innerHTML = `<tr class = "skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
        </tr>`
  // 검색창 변경
  const dateInputEl = document.querySelector("main #date-input")
  dateInputEl.innerHTML = ""
  const today = new Date()
  const year = today.getFullYear()
  dateInputEl.innerHTML = `결제년도 <input type = "" id = "input-year" value ="${year}">
  <input type = "button" id = "search" value = "검색">`
  const searchBtn = document.querySelector("#date-input input#search")
  searchBtn.addEventListener("click", () => {
    const inputYear = document.querySelector("input#input-year").value
    console.log(inputYear);
    getMonthQueries(inputYear)
  })
  // 리스트 키 table-key el > tr#month-list-key로 변경
  const tableListKey = document.querySelector("main #table-list table#list-key")
  const tableKeyClass = tableListKey.classList[0]
  tableListKey.classList.remove(tableKeyClass)

  tableListKey.classList.add("month-list")
  tableListKey.innerHTML = ""
  tableListKey.innerHTML = `<tr>
            <th>결제월</th>
            <th>구분</th>
            <th>합계</th>
          </tr>`
  // 리스트 값 table-val에 스켈레톤 추가
  const tableListVal = document.querySelector("main #table-list table#list-val")
  const tableValClass = tableListVal.classList[0]
  tableListVal.classList.remove(tableValClass)

  tableListVal.classList.add("month-list")
  tableListVal.innerHTML = ""
  tableListVal.innerHTML = `<tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>`
  const paginationEl = document.querySelector("div#pagination")
  paginationEl.innerHTML = ""
}

// 월별결제 데이터 쿼리
async function getMonthQueries(year = 2024) {
  const queriedPayments = [] // 불러온 payments 담을 배열
  const q = query(collection(db, "payments"), where("pay_date", ">=", `${year}0101`), where("pay_date", "<=", `${year}1231`))
  // 1. 데이터 쿼리 (promise or await)
  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((snapshot) => {
    queriedPayments.push(snapshot.data())
  })
  queriedPayments.sort((a, b) => {
    if(a.pay_date < b.pay_date) { // 2023 2024
      return 1
    } else if(a.pay_date > b.pay_date){
      return -1
    } else {
      return 0
    }
  })
  // 2. DOM 갱신 # short-view-val
  showInOverview(queriedPayments)

  const monthlySumArr = filterMonthList(queriedPayments)
  // 3. DOM 갱신 #list-val 갱신
  showMonthList(monthlySumArr)
}

function filterMonthList(payments) {
  /*
  pay_date : "20240723",
  pay_fee : 10000, 
  pay_method : "card", 

  pay_date : "20240723",
  pay_fee : 20000, 
  pay_method : "cash", 

  나와야하는 배열, dictionary
  * payments를 순회하면서 알맞게초기화한뒤
  자료를 순회하면서list-val을 채우는 과정이 효율적인것을 선택해야함 > 1월 카드 : x, 현금 : y, 합계 : x + y

  1. [{card : 0, cash : 0}, {card : 0, cash : 0}, {card : 0, cash : 0}, {card : 0, cash : 0}, {}, {}, {}, {}, {}, {}, {}, {}] 
  얘는 처음부터 0 ~ 11까지 다 차있어야하긴함

  2. {1 : {card : 0, cash : 0}, 2 : {card : 0, cash : 0}, 3 : {card : 0, cash : 0}}

  3. {}
  출현한 결제에 대해서만 추가할수도있을듯

  자료가 초기화가 완료됐다고 생각하면
  이제 순회하면서 DOM초기화도 해야함 배열이면 for 문쓰고, 2,3번의 경우면 for in 쓰면 될듯
  정말 거기서 거기인것같은디 배열 메소드 reduce를 쓰기위해서 1번 방법으로 배열에 담겠다.
  */
  const initDicArr = new Array(12).fill(0).map(() => ({card : 0, cash : 0, total : 0}))
  const monthlySumArr = payments.reduce((dic, payment) => {
    const month = Number(payment.pay_date.slice(4, 6)) - 1
    // console.log(month);
    const method = payment.pay_method
    dic[month][method] += payment.pay_fee
    dic[month].total += payment.pay_fee
    return dic
  }, initDicArr)
  console.log(monthlySumArr);
  return monthlySumArr
}

function showMonthList(monthlySumArr) {
  // 받은 자료를 가지고
  /*
  0:{card: 0, cash: 0, total: 0}
  1:{card: 0, cash: 0, total: 0}
  2:{card: 0, cash: 0, total: 0}
  3:{card: 0, cash: 0, total: 0}
  4:{card: 0, cash: 0, total: 0}
  5:{card: 0, cash: 10100, total: 10100}
  6:{card: 90000, cash: 40000, total: 130000}
  7:{card: 0, cash: 0, total: 0}
  8:{card: 0, cash: 0, total: 0}
  9:{card: 0, cash: 0, total: 0}
  10:{card: 0, cash: 0, total: 0}
  11:{card: 0, cash: 0, total: 0}
  */
  /*
  아래가 1달치의 합계
  <tr class = "skeleton-line">
    <td rowspan="3" class = "th"><span></span></td>
    <td class = "key card"><span></span></td>
    <td class = "val card"><span></span></td>
  </tr>
    <tr class = "skeleton-line">
    <td class = "key cash"><span></span></td>
    <td class = "val cash"><span></span></td>
  </tr>
    <tr class = "skeleton-line">
    <td class = "key total"><span></span></td>
    <td class = "val total"><span></span></td>
  </tr>
*/
  for(let i = 0; i < monthlySumArr.length; i++) {
    const monthSpan = document.querySelectorAll(".th")[i]
    const cardKeySpan = document.querySelectorAll(".card.key")[i]
    const cashKeySpan = document.querySelectorAll(".cash.key")[i]
    const totalKeySpan = document.querySelectorAll(".total.key")[i]

    const cardValSpan = document.querySelectorAll(".card.val")[i]
    const cashValSpan = document.querySelectorAll(".cash.val")[i]
    const totalValSpan = document.querySelectorAll(".total.val")[i]
    // 결제가 존재하지않는경우
    monthSpan.innerHTML = `${i+1}월`
    cardKeySpan.innerHTML = `카드`
    cashKeySpan.innerHTML = `현금`
    totalKeySpan.innerHTML = `총계`
    if(monthlySumArr[i].total == 0) {
      cardValSpan.innerHTML = '0 원'
      cashValSpan.innerHTML = '0 원'
      totalValSpan.innerHTML = '0 원'
      continue
    } else {
      cardValSpan.innerHTML = `${getFormattedNum(monthlySumArr[i].card)} 원`
      cashValSpan.innerHTML = `${getFormattedNum(monthlySumArr[i].cash)} 원`
      totalValSpan.innerHTML = `${getFormattedNum(monthlySumArr[i].total)} 원`
    }
  }
}

// 일별결제 view보여주는 함수
function showDayView() {
  resetToDayView()
  getDayQueries()
}
// 일별결제 DOM 초기화
function resetToDayView() {
  // short-view-val 에 스켈레톤추가
  const shortViewValEl = document.querySelector("main table#short-view-val")
  shortViewValEl.innerHTML = `<tr class = "skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
        </tr>`
  // 검색창 초기화
  const dateInputEl = document.querySelector("main #date-input")
  dateInputEl.innerHTML = ""
  /*
  결제월 < --- > 검색 추가하고 
  각 < > 버튼에 클릭리스너로 날짜값 변경하면서 input값안의 value도 바꿔저야할듯
  */
  // dateInputEl.innerHTML = `결제월 <input type = "" id = "input-year-month">
  // <input type = "button" id = "search" value = "검색">`

  dateInputEl.innerHTML = `결제월 <span id = "prev-month" class = "control"><</span>
  <input type = "" id = "input-year-month">
  <span id = "next-month" class = "control">></span>
  <input type = "button" id = "search" value = "검색">`

  const prevBtn = document.querySelector("#date-input span.control#prev-month")
  const nextBtn = document.querySelector("#date-input span.control#next-month")
  const inputEl = document.querySelector("#date-input input#input-year-month")
  // 초기값표시및 설정
  const date = new Date()
  const [year, month] = [String(date.getFullYear()), String(date.getMonth() + 1).padStart(2, '0')]
  // console.log(year, month);
  inputEl.value = `${year}-${month}`
  // 리스너추가
  prevBtn.addEventListener("click", () => {
    date.setMonth(date.getMonth() - 1)
    const [year, month] = [String(date.getFullYear()), String(date.getMonth() + 1).padStart(2, '0')]
    inputEl.value = `${year}-${month}`
  })
  nextBtn.addEventListener("click", () => {
    date.setMonth(date.getMonth() + 1)
    const [year, month] = [String(date.getFullYear()), String(date.getMonth() + 1).padStart(2, '0')]
    inputEl.value = `${year}-${month}`
  })
  const searchBtn = document.querySelector("#date-input input#search")
  searchBtn.addEventListener("click", () => {
    // 1. 이전월의 데이터 쿼리
    // 2. inputEl에 표시 변경
    const inputYearMonth = document.querySelector("input#input-year-month").value
    // console.log(inputYearMonth)
    getDayQueries(inputYearMonth)
  })
  // 일별결제 table key 초기화
  const tableListKey = document.querySelector("main div#table-list table#list-key")
  const tableKeyClass = tableListKey.classList[0]
  tableListKey.classList.remove(tableKeyClass)

  tableListKey.classList.add("day-list")
  tableListKey.innerHTML = ""
  tableListKey.innerHTML = `<tr>
            <th>결제일</th>
            <th>구분</th>
            <th>합계</th>
          </tr>`
  // 일별결제 table val 스켈레톤 추가
  const tableListVal = document.querySelector("main #table-list table#list-val")
  const tableValClass = tableListVal.classList[0]
  tableListVal.classList.remove(tableValClass)

  tableListVal.classList.add("day-list")
  tableListVal.innerHTML = ""
  tableListVal.innerHTML = `<tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td rowspan="3" class = "th"><span></span></td>
      <td class = "key card"><span></span></td>
      <td class = "val card"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key cash"><span></span></td>
      <td class = "val cash"><span></span></td>
    </tr>
    <tr class = "skeleton-line">
      <td class = "key total"><span></span></td>
      <td class = "val total"><span></span></td>
    </tr>
    `
  const paginationEl = document.querySelector("div#pagination")
  paginationEl.innerHTML = ""
}
// 일별결제 데이터 쿼리
async function getDayQueries(value) {
  const queriedPayments = []

  let year, month
  if(value == undefined) { //최초쿼리의 경우 현재 날짜로 ㄱ
    const date = new Date()
    year = String(date.getFullYear()).padStart(2, '0')
    month = String(date.getMonth() + 1).padStart(2, '0')
  } else { // 이후에 추가적인 쿼리(클릭시)  
    [year, month] = value.split('-')
  }
  console.log(year, month);
  const q = query(collection(db, "payments"), where("pay_date", ">=", `${year}${month}01`), where("pay_date", "<=", `${year}${month}31`)) //2월같은 경우도 29일이 최대긴하지만 31보다 작은건맞으니깐 괜찮을듯
  const querySnapshot = await getDocs(q)
  querySnapshot.forEach((doc) => {
    queriedPayments.push(doc.data())
  })

  showInOverview(queriedPayments)
  const dailySumArr = filterDayList(queriedPayments)
  showDayList(dailySumArr)
}

function filterDayList(payments) {
  const initDicArr = new Array(31).fill(0).map(() => ({card : 0, cash : 0, total : 0}))
  console.log(initDicArr);
  const dailySumArr = payments.reduce((dic, payment) => {
    const day = Number(payment.pay_date.slice(6)) - 1
    console.log(day);
    const method = payment.pay_method
    dic[day][method] += payment.pay_fee
    dic[day].total += payment.pay_fee
    return dic
  }, initDicArr)
  console.log(dailySumArr);
  return dailySumArr

}

function showDayList(dailySumArr) {
  for(let i = 0; i < dailySumArr.length; i++) {
    const daySpan = document.querySelectorAll(".th")[i]
    const cardKeySpan = document.querySelectorAll(".card.key")[i]
    const cashKeySpan = document.querySelectorAll(".cash.key")[i]
    const totalKeySpan = document.querySelectorAll(".total.key")[i]

    const cardValSpan = document.querySelectorAll(".card.val")[i]
    const cashValSpan = document.querySelectorAll(".cash.val")[i]
    const totalValSpan = document.querySelectorAll(".total.val")[i]
    // 결제가 존재하지않는경우
    daySpan.innerHTML = `${i+1}일`
    cardKeySpan.innerHTML = `카드`
    cashKeySpan.innerHTML = `현금`
    totalKeySpan.innerHTML = `총계`
    if(dailySumArr[i].total == 0) {
      cardValSpan.innerHTML = '0 원'
      cashValSpan.innerHTML = '0 원'
      totalValSpan.innerHTML = '0 원'
      continue
    } else {
      cardValSpan.innerHTML = `${getFormattedNum(dailySumArr[i].card)} 원`
      cashValSpan.innerHTML = `${getFormattedNum(dailySumArr[i].cash)} 원`
      totalValSpan.innerHTML = `${getFormattedNum(dailySumArr[i].total)} 원`
    }
  }
}

// 기본날짜구간 (오늘 - 15일 ~ 오늘) input에 표시
function initInput() {
  const startInput = document.querySelector("input#start-date")
  const endInput = document.querySelector("input#end-date")
  const startDate = new Date()
  const [startYear, startMonth, startDay] = [startDate.getFullYear(), String(startDate.getMonth() + 1).padStart(2, '0'), String(startDate.getDate()).padStart(2, '0')]
  const prevDate = new Date()
  prevDate.setDate(prevDate.getDate() - 30)
  const [endYear, endMonth, endDay] = [prevDate.getFullYear(), String(prevDate.getMonth() + 1).padStart(2, '0'), String(prevDate.getDate()).padStart(2, '0')]
  endInput.value = `${startYear}-${startMonth}-${startDay}`
  startInput.value = `${endYear}-${endMonth}-${endDay}`
  console.log('초기값설정완료');
}

// 불러온 결제를 shortview 에 표시(전체, 월, 일 동일)
function showInOverview(payments) {
  const overViewDiv = document.querySelector('table#short-view-val')
  overViewDiv.innerHTML = ''

  const payNum = payments.length
  const result = payments.reduce((price, payment) => {
    const fee = payment.pay_fee
    if(payment.pay_method == 'cash') {
      price.cash += fee
    } else {
      price.card += fee
    }
    price.total += fee
    return price
  }, {card : 0, cash : 0, total : 0})
  // console.log(result);
  const cardPrice = getFormattedNum(result.card)
  const cashPrice = getFormattedNum(result.cash)
  const totalPrice = getFormattedNum(result.total)
  overViewDiv.innerHTML = `<tr>
          <td>${payNum}</td>
          <td>${cardPrice}원</td>
          <td>${cashPrice}원</td>
          <td>0원</td>
          <td>${totalPrice}원</td>
        </tr>`
}

// 쿼리에쓰이는 문자열반환함수
function getTodayDateString() {
  const todayDate = new Date()
  // console.log(date);
  const [year, month, date] = [todayDate.getFullYear(), String(todayDate.getMonth() + 1).padStart(2, '0'), String(todayDate.getDate()).padStart(2, '0')]
  // console.log(`${year}${month}${date}`);
  return `${year}${month}${date}`
}
// 쿼리에쓰이는 문자열반환함수
function getPrevDateString() {
  const prevDate = new Date()
  prevDate.setDate(prevDate.getDate() - 30)
  const [year, month, date] = [prevDate.getFullYear(), String(prevDate.getMonth() + 1).padStart(2, '0'), String(prevDate.getDate()).padStart(2, '0')]
  // console.log(`${year}${month}${date}`);
  return `${year}${month}${date}`
}
// 숫자 세자리단위 포맷문자열로볂환
function getFormattedNum(number) {
  const strNum = String(number)
  let result = ''
  for(let i = 0; i < strNum.length; i++) {
    result += strNum[i]
    if(((strNum.length - i) % 3 == 1) && i != strNum.length - 1) {
      result += ','
    }
  }
  return result
}




/*
//5. 기본 날짜구간 리스트에 표시
async function showPaymentList(payments, userInfo) {
  const listValDiv = document.querySelector("div#table-list table#list-val")
  listValDiv.innerHTML = ''
  for(let i = 0; i < payments.length; i++) {
    // 여기서 user_id로 접근가능한상황임 미리 전역에 담아두었던 프로미스 배열에서 꺼내서 프로퍼티 추가해줌
    payments[i]["info"] = {}
    const id = payments[i].user_id
    const promise = userInfo[id]
    await promise.then((snapshot) => snapshot.forEach((snapshot) => {
      payments[i]["info"].teacher = snapshot.data().teacher
      payments[i]["info"].phoneNum = snapshot.data().phone_number
    }))
    // console.log(payments[i]);
    // console.log(payments[i].info);
  }
  // 위에서 추가한 최종payment object들 출력
  const skelton = document.querySelector("div#is-loading")
  // skelton.remove()

  // payments.forEach(payment => {
  //   console.log(payment);
  // });
  // 결제일 최신순으로 정렬
  payments.sort((a, b) => {
    if(a.pay_date < b.pay_date) { // 2023 2024
      return 1
    } else if(a.pay_date > b.pay_date){
      return -1
    } else {
      return 0
    }
  })
  // 정렬완료된걸 형식에 맞게 출력
  const paymentStrs = payments.map((payment) => {
    const payDate = payment.pay_date
    const [payYear, payMonth, payDay] = [payDate.slice(0, 4), payDate.slice(4, 6), payDate.slice(6)]
    const expireDate = payment.expire_date
    const [expireYear, expireMonth, expireDay] = [expireDate.slice(0, 4), expireDate.slice(4, 6), expireDate.slice(6)]
    return `<tr>
            <td><span>${payYear}-${payMonth}-${payDay}</span></td>
            <td><span>${payment.user_name}</span></td>
            <td><span>${payment.info.teacher}</span></td>
            <td><span>${payment.pay_teacher}</span></td>
            <td><span>${payment.info.phoneNum}</span></td>
            <td>요가 주${payment.pay_class.times_a_week}회 [${payment.pay_class.class_term}개월] [주 ${payment.pay_class.times_a_week}회권]</td>
            <td>${payYear}-${payMonth}-${payDay}</td>
            <td>${expireYear}-${expireMonth}-${expireDay}</td>
            <td>${100000}</td>
          </tr>`
  })
  paymentStrs.forEach((el) => {
    listValDiv.innerHTML += el
  })
}

// 개수만큼 틀넣음
function showSkeletonLoading(num) {
  // const shortViewSkeletonDiv = document.querySelector()
  const skeletonDiv = document.querySelector("#table-list table#list-val")
  console.log(skeletonDiv);
  for(let i = 0; i < num; i++) {
    // console.log(i);
    skeletonDiv.innerHTML += `<tr class = "skeleton-line">
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>`
  }

}*/


// ***********************************************************
// 검색버튼클릭시 날짜 구간에 대해 새로운 쿼리 데이터 요청
// 얘 함수안에 넣어야할지도 나중에 다시 부를수도있으니까 showAllView 안에 showonOverview 처럼 다시 전체결제로 돌아갈경우에도 DOM#date-input 이 수정되고나서 호출하도록

/*
const submitDateBtn = document.querySelector("#date-input input#search")
submitDateBtn.addEventListener("click", () => {
  console.log('click');
  const startDate = document.querySelector('#date-input input#start-date').value
  const endDate = document.querySelector('#date-input input#end-date').value
  console.log(startDate, endDate);
  showAllView(startDate, endDate)
})
*/
// 1. 오늘부터 15일 이전까지의 pay_date들을 불러온다! ('전체결제' 에 대한 쿼리)


/*
async function showAllView(start, end) {    
  console.log('전체결제 쿼리!!');  
                                                                                                                                                                                                                                                         
  const queriedPayments = [] // 불러온 payments 담을 배열
  const userDic = {} // 해당구간의 날짜에 속하는 pay_date의 userinfo를 

  let q
  if(start && end) { // 매개변수로 날짜 구간들어왔을때
    console.log('날짜들어옴');
    const startStr = start.split('-').join('')
    const endStr = end.split('-').join('')
    console.log(startStr, endStr);
    q = query(collection(db, "test_payments_string"), where("pay_date", "<=", endStr), where("pay_date", ">=", startStr))
  } else { // 맨처음 입력 날짜가 없을때 한달치의 결제 불러옴
    console.log('처음!!');
    q = query(collection(db, "test_payments_string"), where("pay_date", "<=", getTodayDateString()), where("pay_date", ">=", getPrevDateString()))
  }

  const querySnapshot = await getDocs(q) // payments 컬랙션에 결제를 요청 (id로 쿼리날리는건 최소한 이라인 이후부터 실행해야할듯)
  querySnapshot.forEach((doc) => {
    // 받은 결제데이터들을 받음과 동시에, 결제의 user_id로 member컬렉션에 미리 요청날려놓음 await는 안함. promise로 받아서 아래가서쓸거임
    const id = doc.data().user_id
    const idQuery = query(collection(db, "test_members"), where("user_id", "==", id))
    userDic[id] = getDocs(idQuery) // {1100 : promise, 2212 : promise}
    queriedPayments.push(doc.data()) // 받은 결제 담음
  })
  console.log(userDic);
  console.log(queriedPayments);

  // 결제일 최신순으로 정렬
  queriedPayments.sort((a, b) => {
    if(a.pay_date < b.pay_date) { // 2023 2024
      return 1
    } else if(a.pay_date > b.pay_date){
      return -1
    } else {
      return 0
    }
  })
  showInOverview(queriedPayments)
  if(start == undefined && end == undefined) { // 처음에만 기본값초기화하면됌
    initInput()
  }
  const page = new Pagination(queriedPayments, userDic)
  // 6. 불러온 데이터로 표시
  page.initPaginationBar()
}
*/
