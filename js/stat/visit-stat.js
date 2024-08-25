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
await addDoc(collection(db, "new1-attendances"), {
  user_id : 8842,
  attend_date : "20240831",
  attend_time : "10:15:55"
})
*/

/* 흐름

일자별 버튼에 각각 showDayView, showMonthView 리스너 설정

showDayView()
> resetToDayView() 헤더, 검색창초기화 및 skeleton추가
> getDayQueries() 일별방문쿼리
'검색' 버튼에서 getDayQueries() 호출하는 리스너 설정

getDayQueries()
> initpagination

initpagination()
> this.showCur()
'indicator' 각각에 style, showcurpage  리스너 설정

########## 24 / 08 / 12
1. (변경된 날짜에 대한 쿼리) 사이사이에 스켈레톤 보이게 (이게 목적임 현재는 최초 한번만 표시되고 맘)
2. 방문통계 페이지완성하기!!!!



 */









class Pagination {
  constructor(attendArr, userDic) {
    this.elNum = attendArr.length
    this.maxElNum = 10
    this.pageNum = (this.elNum % this.maxElNum == 0) ? Math.floor(this.elNum / this.maxElNum) : Math.floor(this.elNum / this.maxElNum) + 1
    this.curPageNum = 1
    this.attendArr = attendArr
    this.userDic = userDic
  }
  // #pagitaion 초기화하고, pageNum만큼 indicator추가
  initPaginationBar() { // pagination 컴포넌트 '일별보기' 기준으로 초기화
    // console.log(this.pageNum);
    const paginationDiv = document.querySelector(".inner div#pagination")
    paginationDiv.innerHTML = ""
    if(this.elNum == 0) {
      // 0일경우 showCure까지 안넘어가기에 skeleton을 지울수없음 > 따로 지움처리
      // const skeletons = document.querySelectorAll("tr.skeleton-line")
      // skeletons.forEach((skeleton) => {
      //   skeleton.remove()
      // })
      // 기존에 표시되던게 스켈레톤이 아닐수있음(값이있는줄들) > table#list-table 을 키남기고 다비워야함
      const listDiv = document.querySelector("table#list-table")
      listDiv.innerHTML = `
          <tr id="table-key">
          <th>회원번호</th>
          <th>이름</th>
          <th>수강그룹</th>
          <th>담당강사</th>
          <th>휴대폰번호</th>
          <th>등록구분</th>
          <th>시작시간</th>
          <th>종료시간</th>
        </tr>`
      paginationDiv.innerHTML += `<span>해당날짜에 방문기록이 없습니다.</span>` // 이후에 새로운 쿼리로 갱신되어야함
      return
    }
    // pagination 컴포넌트 추가
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
        // console.log(`curPageNum : ${this.curPageNum}`);
        this.styleCurpageBtn()
        this.showCurrentPageItems()
      })
    })
    this.styleCurpageBtn()
    this.showCurrentPageItems()
 
 
    const prevBtn = document.querySelector('#pagination button#prev')
    const nextBtn = document.querySelector('#pagination button#next')
 
    // nextBtn, prevBtn 에 클릭 리스너추가
    prevBtn.addEventListener('click', () => {
      const changedCurPageNum = this.curPageNum - 1  
      if(changedCurPageNum > 0) {
        this.curPageNum -= 1
        // console.log(`curPageNum : ${this.curPageNum}`);
        this.styleCurpageBtn()
        this.showCurrentPageItems()
      }
    })
 
    nextBtn.addEventListener('click', () => {
      const changedCurPageNum = this.curPageNum + 1  
      // 여기서 이 this는 nextBtn을 가르키지않네??? 
      if(changedCurPageNum <= this.pageNum) {
        this.curPageNum += 1
        // console.log(`curPageNum : ${this.curPageNum}`);
        this.styleCurpageBtn()
        this.showCurrentPageItems()
      }
    })
  }

  initMonthPaginationBar() { // pagination 컴포넌트 '월별보기' 기준으로 초기화
    const paginationDiv = document.querySelector(".inner div#pagination")
    paginationDiv.innerHTML = ""
    if(this.elNum == 0) {
      const listDiv = document.querySelector("table#list-table")
      listDiv.innerHTML = `<tr id="table-key">
          <th>회원번호</th>
          <th>이름</th>
          <th>휴대폰번호</th>
          <th class="day-cell">1</th>
          <th class="day-cell">2</th>
          <th class="day-cell">3</th>
          <th class="day-cell">4</th>
          <th class="day-cell">5</th>
          <th class="day-cell">6</th>
          <th class="day-cell">7</th>
          <th class="day-cell">8</th>
          <th class="day-cell">9</th>
          <th class="day-cell">10</th>
          <th class="day-cell">11</th>
          <th class="day-cell">12</th>
          <th class="day-cell">13</th>
          <th class="day-cell">14</th>
          <th class="day-cell">15</th>
          <th class="day-cell">16</th>
          <th class="day-cell">17</th>
          <th class="day-cell">18</th>
          <th class="day-cell">19</th>
          <th class="day-cell">20</th>
          <th class="day-cell">21</th>
          <th class="day-cell">22</th>
          <th class="day-cell">23</th>
          <th class="day-cell">24</th>
          <th class="day-cell">25</th>
          <th class="day-cell">26</th>
          <th class="day-cell">27</th>
          <th class="day-cell">28</th>
          <th class="day-cell">29</th>
          <th class="day-cell">30</th>
          <th class="day-cell">31</th>
          <th>출석횟수</th>
        </tr>`
      paginationDiv.innerHTML += `<span>해당월에 방문기록이 없습니다.</span>` // 이후에 새로운 쿼리로 갱신되어야함
      return
    }
    // pagination 컴포넌트 추가
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
        // console.log(`curPageNum : ${this.curPageNum}`);
        this.styleCurpageBtn()
        this.showMonthCurrentPageItems()
      })
    })
    this.styleCurpageBtn()
    this.showMonthCurrentPageItems()
 
 
    const prevBtn = document.querySelector('#pagination button#prev')
    const nextBtn = document.querySelector('#pagination button#next')
 
    // nextBtn, prevBtn 에 클릭 리스너추가
    prevBtn.addEventListener('click', () => {
      const changedCurPageNum = this.curPageNum - 1  
      if(changedCurPageNum > 0) {
        this.curPageNum -= 1
        // console.log(`curPageNum : ${this.curPageNum}`);
        this.styleCurpageBtn()
        this.showMonthCurrentPageItems()
      }
    })
 
    nextBtn.addEventListener('click', () => {
      const changedCurPageNum = this.curPageNum + 1  
      // 여기서 이 this는 nextBtn을 가르키지않네??? 
      if(changedCurPageNum <= this.pageNum) {
        this.curPageNum += 1
        // console.log(`curPageNum : ${this.curPageNum}`);
        this.styleCurpageBtn()
        this.showMonthCurrentPageItems()
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
      const attend = this.attendArr[i]
      if(!attend) break //슬라이싱했을때 없는 원소까지 index
      // console.log(payment);
      attend.info = {}
      const id = attend.user_id
      const infoPromise = this.userDic[id]
      // attendance의 user_id를 통해서 이름, 수강그룹, 담당강사, 휴대폰번호, 등록구분 접근해야함
      await infoPromise.then((result) => {
        result.forEach((doc) => {
          // console.log(doc.data());
          attend.info.name = doc.data().name // 이름
          attend.info.group = doc.data().group // 그룹
          attend.info.gender = doc.data().gender // 성별
          attend.info.teacher = doc.data().teacher // 담당강사
          attend.info.phoneNum = doc.data().phone_number //전번
        })
      })
    }
    // console.log(this.attendArr);
    // info프로퍼티 추가된 start부터 index까지 html문자열화 
    const slicedAttendance = this.attendArr.slice(startIdx, endIdx)
    const attendancesInnerHTML = slicedAttendance.map((attendance) => {
      const attendDate = attendance.attend_date
      const [attendYear, attendMonth, attendDay] = [attendDate.slice(0, 4), attendDate.slice(4, 6), attendDate.slice(6)]
      return `<tr class="table-val">
        <td>${attendance.user_id}</td>
        <td><span>${attendance.info.name}</span> <span>[${attendance.info.gender}]</span></td>
        <td>${attendance.info.group == "group" ? "그룹레슨" : "마이솔"}</td>
        <td>${attendance.info.teacher}</td>
        <td>${attendance.info.phoneNum}</td>
        <td>재등록</td>
        <td>
          <span>${attendYear}-${attendMonth}-${attendDay}</span>
          <span>${attendance.attend_time}</span>
        </td>
        <td>
          <span>${attendYear}-${attendMonth}-${attendDay}</span>
          <span>${attendance.attend_time}</span>
        </td>
        </tr>`
    })
    // console.log(attendancesInnerHTML);
    // 테이블 값 skeleton 삭제(초기화)
    const tableDiv = document.querySelector("div.inner table#list-table")
    // 이거 필요한건가????? 헤더를 다시 초기화하는게?? ㅇㅇ 이건 initpagination의 초기화 이후에 매 쿼리마다 갱신해야하는거임
    // ???????? 왜 table이 들어가있지?
    tableDiv.innerHTML = `
        <tr id="table-key">
          <th>회원번호</th>
          <th>이름</th>
          <th>수강그룹</th>
          <th>담당강사</th>
          <th>휴대폰번호</th>
          <th>등록구분</th>
          <th>시작시간</th>
          <th>종료시간</th>
        </tr>`
    // 얘도 처음만 스켈레톤이지 이후꺼는 아니지않나
    // const skeletons = tableDiv.querySelectorAll("tr.skeleton-line")
    // skeletons.forEach((skeleton) => {
    //   skeleton.remove()
    // })
    // // innerHTML추가 
    for(let i = 0; i < attendancesInnerHTML.length; i++) {
      tableDiv.innerHTML += attendancesInnerHTML[i]
    } 
    // // 
    for(let i = attendancesInnerHTML.length; i < this.maxElNum; i++) {
      tableDiv.innerHTML += `<tr class="table-val">
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>

        </td>
        <td>

        </td>
        </tr>`
    }
  }

  async showMonthCurrentPageItems() {
    // 현재 구간에 대해서 slice해서 보여주면됌
    const startIdx = this.maxElNum * (this.curPageNum - 1)
    const endIdx = this.maxElNum * this.curPageNum
    console.log(`startIdx : ${startIdx} endIdx : ${endIdx}`)
    // 위치!! 여기뭔가 이상할지도 너무빨리 없애서?
    // console.log(this.elNum);
    for(let i = startIdx; i < endIdx; i++) {
      const attend = this.attendArr[i]
      // console.log(attend);
      if(!attend) break

      const id = attend.user_id
      const infoPromise = this.userDic[id]
      console.log(infoPromise);

      await infoPromise.then((result) => {
        result.forEach((doc) => {
          attend.name = doc.data().name
          attend.phoneNum = doc.data().phone_number
        })
      })
    }
    console.log(this.attendArr);
    this.attendArr.sort((a, b) => {
      if(a.name < b.name) {
        return -1
      } else if(a.name > b.name) {
        return 1
      } else {
        return 0 
      }
    })
    const slicedAttendance = this.attendArr.slice(startIdx, endIdx)
    const attendancesInnerHTML = slicedAttendance.map((attendance) => {
      return `        <tr class="table-val">
          <td>${attendance.user_id}</td>
          <td>${attendance.name}</td>
          <td>${attendance.phoneNum}</td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td>${attendance.dates.length}</td>
        </tr>`
    })

    const tableDiv = document.querySelector("div.inner table#list-table")
    // 이거 필요한건가????? 헤더를 다시 초기화하는게?? ㅇㅇ 이건 initpagination의 초기화 이후에 매 쿼리마다 갱신해야하는거임
    tableDiv.innerHTML = `<tr id="table-key">
          <th>회원번호</th>
          <th>이름</th>
          <th>휴대폰번호</th>
          <th class="day-cell">1</th>
          <th class="day-cell">2</th>
          <th class="day-cell">3</th>
          <th class="day-cell">4</th>
          <th class="day-cell">5</th>
          <th class="day-cell">6</th>
          <th class="day-cell">7</th>
          <th class="day-cell">8</th>
          <th class="day-cell">9</th>
          <th class="day-cell">10</th>
          <th class="day-cell">11</th>
          <th class="day-cell">12</th>
          <th class="day-cell">13</th>
          <th class="day-cell">14</th>
          <th class="day-cell">15</th>
          <th class="day-cell">16</th>
          <th class="day-cell">17</th>
          <th class="day-cell">18</th>
          <th class="day-cell">19</th>
          <th class="day-cell">20</th>
          <th class="day-cell">21</th>
          <th class="day-cell">22</th>
          <th class="day-cell">23</th>
          <th class="day-cell">24</th>
          <th class="day-cell">25</th>
          <th class="day-cell">26</th>
          <th class="day-cell">27</th>
          <th class="day-cell">28</th>
          <th class="day-cell">29</th>
          <th class="day-cell">30</th>
          <th class="day-cell">31</th>
          <th>출석횟수</th>
        </tr>`


    // 사람별 출석 줄 추가
    for(let i = 0; i < attendancesInnerHTML.length; i++) {
      tableDiv.innerHTML += attendancesInnerHTML[i]
    }    

    console.log(slicedAttendance);
    // 추가된 줄에서 출석한 날짜 표시
    for(let i = 0; i < slicedAttendance.length; i++) {
      const line = tableDiv.querySelectorAll("tr.table-val")[i]
      const cells = line.querySelectorAll("td.day-cell")
      const dates = slicedAttendance[i].dates
      dates.forEach((date) => {
        cells[date-1].textContent = "O"
      })
    }    

    // 나머지 줄 빈줄로 채움
    for(let i = slicedAttendance.length; i < this.maxElNum; i++) {
      tableDiv.innerHTML += `        <tr class="table-val">
          <td></td>
          <td></td>
          <td></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td class="day-cell"></td>
          <td></td>
        </tr>`
    }





  }
}

// 일일방문, 월별방문 클릭 리스너 추가
const dayAttendBtn = document.querySelector("main ul#term-select li:nth-child(1)")
const monthAttendBtn = document.querySelector("main ul#term-select li:nth-child(2)")

dayAttendBtn.addEventListener("click", function() {
  styleCurAttendBtn(this)
  showDayView()
  window.scrollTo(0, 0)
})

monthAttendBtn.addEventListener("click", function() {
  styleCurAttendBtn(this)
  showMonthView()
  window.scrollTo(0, 0)
})

function styleCurAttendBtn(el) {
  const prevBtn = document.querySelector("main ul#term-select span.current")
    prevBtn.classList.remove("current")
    const cur = el.querySelector("span")
    cur.classList.add("current")
}

showDayView()

// 일별방문
function showDayView() {
  resetToDayView()
  getDayQueries()
}


// 일별방문 DOM초기화
function resetToDayView() {
  // initpagination안의 table key 초기화하는 코드가 여기있어야맞는거 아닌가싶다.
  const dateInputEl = document.querySelector("main div#date-input")
  dateInputEl.innerHTML = ""
  dateInputEl.innerHTML = `
        방문조회일
        <input type="date" id="start-date"> ~
        <input type="date" id="end-date">
        <input type="button" id='search' value="검색"> 
      `
  initInput() // 초기값 설정
  // 검색버튼에 리스너추가
  const searchBtn = dateInputEl.querySelector("input#search")
  searchBtn.addEventListener("click", () => {
    const startDate = dateInputEl.querySelector("input#start-date").value
    const endDate = dateInputEl.querySelector("input#end-date").value
    // getAllQueries(startDate, endDate)
    getDayQueries(startDate, endDate)
  })
  // 리스트 키 헤더 추가
  const tableListEl = document.querySelector("main table#list-table")
  const curKeyClass = tableListEl.classList[0]
  tableListEl.classList.remove(curKeyClass)
  tableListEl.classList.add("day-list")
  // 리스트 키 헤더 추가
  tableListEl.innerHTML = ''
  // ????????????????????? 왜 두번 추가함? initpagination에서 추가예정인데
  // initpagination에 있는게 아닌듯 여기 있는건 정상같음 다시생각해보자 허허허허ㅓㅓㅓㅓ
  tableListEl.innerHTML += `
          <tr id="table-key">
          <th>회원번호</th>
          <th>이름</th>
          <th>수강그룹</th>
          <th>담당강사</th>
          <th>휴대폰번호</th>
          <th>등록구분</th>
          <th>시작시간</th>
          <th>종료시간</th>
        </tr>`
  // 리스트 값 스켈레톤 추가
  tableListEl.innerHTML += `
          <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td>
            <span></span>
            <span></span>
          </td>
          <td>
            <span></span>
            <span></span>
          </td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td>
            <span></span>
            <span></span>
          </td>
          <td>
            <span></span>
            <span></span>
          </td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td>
            <span></span>
            <span></span>
          </td>
          <td>
            <span></span>
            <span></span>
          </td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td>
            <span></span>
            <span></span>
          </td>
          <td>
            <span></span>
            <span></span>
          </td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td>
            <span></span>
            <span></span>
          </td>
          <td>
            <span></span>
            <span></span>
          </td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td>
            <span></span>
            <span></span>
          </td>
          <td>
            <span></span>
            <span></span>
          </td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td>
            <span></span>
            <span></span>
          </td>
          <td>
            <span></span>
            <span></span>
          </td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td>
            <span></span>
            <span></span>
          </td>
          <td>
            <span></span>
            <span></span>
          </td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td>
            <span></span>
            <span></span>
          </td>
          <td>
            <span></span>
            <span></span>
          </td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td>
            <span></span>
            <span></span>
          </td>
          <td>
            <span></span>
            <span></span>
          </td>
        </tr>`
  const paginationDiv = document.querySelector(".inner div#pagination")
  paginationDiv.innerHTML = ""
}
// inputEl의 값을 현재날짜로 초기화
function initInput() {
    const startInput = document.querySelector("input#start-date")
  const endInput = document.querySelector("input#end-date")
  const startDate = new Date()
  const [startYear, startMonth, startDay] = [startDate.getFullYear(), String(startDate.getMonth() + 1).padStart(2, '0'), String(startDate.getDate()).padStart(2, '0')]
  endInput.value = `${startYear}-${startMonth}-${startDay}`
  startInput.value = `${startYear}-${startMonth}-${startDay}`
  // console.log('초기값설정완료');
}

// 일별방문 데이터쿼리
// attendance의 user_id를 통해서 이름, 수강그룹, 담당강사, 휴대폰번호, 등록구분 접근해야함
async function getDayQueries(start, end) {
  // console.log(start, end);
  const queriedAttendances = []
  const userInfoDic = {}
  /*
  매개변수 존재하지않는경우, 현재날짜 하루만 쿼리
  매개변수 존재시, 시작 ~ 끝까지의 범위 쿼리
  */

  // { user_id : 5040, attend_date : "20240610", attend_time : "10:15:55" }

  let q 
  if(start && end) { // 버튼 클릭에의한 호출은 매개변수 들어옴
    const startStr = start.split('-').join('')
    const endStr = end.split('-').join('')
    q = query(collection(db, "attendances"), where("attend_date", ">=", startStr), where("attend_date", "<=", endStr))
    console.log(`${startStr}부터 ${endStr}까지`);
  } else {
    q = query(collection(db, "attendances"), where("attend_date", ">=", getTodayDateString()), where("attend_date", "<=", getTodayDateString()))
    console.log(`${getTodayDateString()}부터 ${getTodayDateString()}까지`);
  }

  const querySnapShot = await getDocs(q)
  querySnapShot.forEach(doc => {
    const id = doc.data().user_id
    const idq = query(collection(db, "members"), where("user_id", "==", id))
    userInfoDic[id] = getDocs(idq)
    queriedAttendances.push(doc.data())
  });
  // 최신 방문순으로 정렬
  queriedAttendances.sort((a, b) => {
    if(a.attend_date < b.attend_date) {
      return 1
    } else if(a.attend_date > b.attend_date) {
      return -1
    } else {
      return 0
    }
  })
  //
  queriedAttendances.forEach((attend) => {
    // console.log(attend.attend_date);
  })
  console.log(queriedAttendances);
  // console.log(userInfoDic);
  const allView = new Pagination(queriedAttendances, userInfoDic)
  allView.initPaginationBar()
}

// 월별방문
function showMonthView() {
  resetToMonthView()
  getMonthQueries()
}

// 월별방문 DOM초기화
function resetToMonthView() {
  const dateInputEl = document.querySelector("main div#date-input")
  dateInputEl.innerHTML = ""
  dateInputEl.innerHTML = `
    <div id="date-input">
      방문월 <span id = "prev-month" class = "control"><</span>
      <input type = "" id = "input-year-month">
      <span id = "next-month" class = "control">></span>
      <input type = "button" id = "search" value = "검색">
    </div>
      `

  const prevBtn = document.querySelector("#date-input span.control#prev-month")
  const nextBtn = document.querySelector("#date-input span.control#next-month")
  const inputEl = document.querySelector("#date-input input#input-year-month")
  // 검색창 초기화
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
    getMonthQueries(inputYearMonth)
  })
  // 월별방문 table key 초기화
  const tableListEl = document.querySelector("main table#list-table")
  const curKeyClass = tableListEl.classList[0]
  // console.log(curKeyClass);
  tableListEl.classList.remove(curKeyClass)
  tableListEl.classList.add("month-list")
  tableListEl.innerHTML = ''
  tableListEl.innerHTML += `<tr id="table-key">
          <th>회원번호</th>
          <th>이름</th>
          <th>휴대폰번호</th>
          <th class="day-cell">1</th>
          <th class="day-cell">2</th>
          <th class="day-cell">3</th>
          <th class="day-cell">4</th>
          <th class="day-cell">5</th>
          <th class="day-cell">6</th>
          <th class="day-cell">7</th>
          <th class="day-cell">8</th>
          <th class="day-cell">9</th>
          <th class="day-cell">10</th>
          <th class="day-cell">11</th>
          <th class="day-cell">12</th>
          <th class="day-cell">13</th>
          <th class="day-cell">14</th>
          <th class="day-cell">15</th>
          <th class="day-cell">16</th>
          <th class="day-cell">17</th>
          <th class="day-cell">18</th>
          <th class="day-cell">19</th>
          <th class="day-cell">20</th>
          <th class="day-cell">21</th>
          <th class="day-cell">22</th>
          <th class="day-cell">23</th>
          <th class="day-cell">24</th>
          <th class="day-cell">25</th>
          <th class="day-cell">26</th>
          <th class="day-cell">27</th>
          <th class="day-cell">28</th>
          <th class="day-cell">29</th>
          <th class="day-cell">30</th>
          <th class="day-cell">31</th>
          <th>출석횟수</th>
        </tr>`
  // 리스트 값 스켈레톤 추가
  tableListEl.innerHTML += `
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td><span></span></td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td><span></span></td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td><span></span></td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td><span></span></td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td><span></span></td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td><span></span></td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td><span></span></td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td><span></span></td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td><span></span></td>
        </tr>
        <tr class="table-val skeleton-line">
          <td><span></span></td>
          <td><span></span></td>
          <td><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td class="day-cell"><span></span></td>
          <td><span></span></td>
        </tr>`

  // 이거 없애는거 괜찮겟지 괜찮은게 아니라 없애야함(일별 > 월별 전환때에 초기화시키는거니깐)
  // initpagination 안에서 초기화하면 안되는게, 쿼리 데이터가 없다면, initpagi가 호출되지않음 > 잔상이남게된다.
  // 따라서 resetToView에서 일단 없애는게 맞는듯함
  const paginationDiv = document.querySelector(".inner div#pagination")
  paginationDiv.innerHTML = ""
}

//월별방문 데이터쿼리
async function getMonthQueries(value) {
  // console.log(value);
  let year, month
  if(value == undefined) { //최초쿼리의 경우 현재 날짜로 ㄱ
    const date = new Date()
    year = String(date.getFullYear()).padStart(2, '0')
    month = String(date.getMonth() + 1).padStart(2, '0')
  } else { // 이후에 추가적인 쿼리(클릭시)  
    [year, month] = value.split('-')
  }
  // console.log(year, month);

  const queriedAttendances = []
  const userInfo = {}

  const q = query(collection(db, "attendances"), where("attend_date", ">=", `${year}${month}01`), where("attend_date", "<=", `${year}${month}31`)) //2월같은 경우도 29일이 최대긴하지만 31보다 작은건맞으니깐 괜찮을듯
  const querySnapShot = await getDocs(q)
  // 쿼리한걸로 user_id를 키값으로 promise dictionary 생성하자
  querySnapShot.forEach((doc) => {
    const id = doc.data().user_id
    const idQuery = query(collection(db, "members"), where("user_id", "==", id))
    userInfo[id] = getDocs(idQuery)
    queriedAttendances.push(doc.data())
  })
  console.log('쿼리결과', queriedAttendances);
  // 쿼리한 데이터들을 reduce 연산후 객체배열 얻음
  const reducedMonthList = reduceMonthList(queriedAttendances)
  console.log(reducedMonthList);
  console.log(userInfo);
  const monthView = new Pagination(reducedMonthList, userInfo)
  monthView.initMonthPaginationBar()
  
/* attendances배열 돌면서 나중에쓸 id별 promise담아둠
[
  {user_id: 1326, attend_time: '09:10:21', attend_date: '20240801'},
  {user_id: 2212, attend_date: '20240805', attend_time: '18:30:11'},
  {user_id: 4429, attend_time: '23:08:14',  attend_date: '20240809'},
  {user_id: 1100, attend_time: '10:30:21', attend_date: '20240809'},
  {user_id: 1100, attend_date: '20240809', attend_time: '20:08:15', }
]
>> {1326 : promise, 2212 : promise, 4429 : promise, 1100 : promise}
이제 reduce로 순회하면서
1. 시작값 : {} >> 
>> reduce로 순회하면서 {
1326 : {name : 김윤오, dates : [1, 5, 9]}, 
2212 : {name : 김윤오, dates : [9]}, 
4429 : {name : 김윤오, dates : [9]},
1100 : {name : 김윤오, dates : [9]},
}
(여기서 attend_date의 앞부분만 필요함)
2. 시작값 : [] >> 
순회하면서 [
{user_id : 1326, name : 김윤오, dates : []}, 
{user_id : 1100, name : 이지영, dates : []},
{user_id : 1100, name : 이지영, dates : []}] 
꼴의 dictionary 배열

완성한 객체던, 객체배열 이던 가지고 표시를하면된다.
어떤걸로 하는게 나으려나 나중에 가나다 순 정렬해서 표시하려면 배열쓰는 두번째가 나을지도


*/

/*
  결국에 {user_id : 1100, name : "김윤오", phone-num : "010-9928-1547", attend : []}
  이런형식의 객체 배열을 얻어내야하는듯
  
  쿼리해서 나온 데이터의 개수랑, reduce를 거친 데이터의 개수가 다를 수있다. 
  pagination 은 reduce 거친 데이터의 개수가 나와야 결정됨.
  따라서 순서가 쿼리(프로미스던지기) > reduce >
*/

}

function reduceMonthList(attendances) {
  const reducedAttendaces = attendances.reduce((acc, attend) => {
    const curMember = acc.find((member) => member.user_id == attend.user_id)
    const time = Number(attend.attend_date.slice(6))
    if(curMember == undefined) { // 처음 등장한 사람이면
      acc.push({user_id : attend.user_id , dates : [time]})
      // 허허 이거 reduce콜백 안이어서 await 못하네 이런
    } else { // 이미 있던 사람이면
      curMember.dates.push(time)
    }
    return acc  
  }, [])
  return reducedAttendaces
}




function showMonthList(monthList) {

}







function getTodayDateString() {
  const todayDate = new Date()
  // console.log(date);
  const [year, month, date] = [todayDate.getFullYear(), String(todayDate.getMonth() + 1).padStart(2, '0'), String(todayDate.getDate()).padStart(2, '0')]
  // console.log(`${year}${month}${date}`);
  return `${year}${month}${date}`
}