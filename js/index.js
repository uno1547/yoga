import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import { getFirestore, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';
//firebase app객체 만들고 실행
const app = initializeApp({
  apiKey: "AIzaSyBykm-oqoMvIAjLFWHPnVi_OQ86Iis_NVs",
  authDomain: "yoga-663cb.firebaseapp.com",
  projectId: "yoga-663cb",
  storageBucket: "yoga-663cb.appspot.com",
  messagingSenderId: "256248240983",
  appId: "1:256248240983:web:07dcebbcb04debc34b3c12"
})
// 전체결제 불러옴
const db = getFirestore(app)
const q = query(collection(db, "payments"))
const snapShots = await getDocs(q)
const paymentsArr = getPaymentsArr(snapShots)
console.log(paymentsArr);

const reducedPayments = getReducedPayments(paymentsArr)
console.log(reducedPayments);

const reducedEvents = getReducedEvents(reducedPayments)
console.log(reducedEvents);

const calendarEl = document.querySelector('.calender')
const calendar = new FullCalendar.Calendar(calendarEl, {
  initialView : 'dayGridMonth',
  buttonText : {
    today : '오늘'
  },
  headerToolbar : {
    start : '',
    center : 'title'
  },
  events : reducedEvents,
  eventColor : 'transparent',
  eventColor : 'rgb(256, 256, 256)',
  eventTextColor : 'rgb(0, 0, 0)'
})
calendar.render()

// snapshot에서 얻은data 결제배열초기화
function getPaymentsArr(snapShots) {
  const paymentsArr = []
  snapShots.forEach((snapshot) => {
    paymentsArr.push(snapshot.data())
  })
  // console.log(paymentsArr);
  return paymentsArr
}

// 결제배열 순회하면서, 날짜별 누적매출 계산후 반환
function getReducedPayments(arr) {
  const reducedPayments = []
  for (let payment of arr) {
    // console.log(payment.pay_date);
    const prevSale = reducedPayments.find((sale) => {
      return sale.pay_date == payment.pay_date
    })
    // console.log(prevSale);

    if (prevSale) { //동일한 날짜에 해당하는 결제 존재!!
      prevSale[`${payment.pay_method}`] += payment.pay_fee
    } else { //존재하지않는다면 추가
      const sortedPay = {
        pay_date : payment.pay_date,
        card : 0,
        cash : 0
      }
      sortedPay[`${payment.pay_method}`] += payment.pay_fee
      reducedPayments.push(sortedPay)
    }

  }
  // console.log(reducedPayments);
  return reducedPayments
}

// 날짜별 누적매출을 달력에 표시할 event로 변환
function getReducedEvents(arr) {
  const reducedEvents = []
  for (let pay of arr) {
    const year = pay.pay_date.slice(0,4)
    const month = pay.pay_date.slice(4,6)
    const day = pay.pay_date.slice(6)
    const creditEvt = {
      title : `카드: ${getCommaFormattedNumbers(String(pay.card))}원`,
      start : `${year}-${month}-${day}`,
      end : `${year}-${month}-${day}`,
    }
    const cashEvt = {
      title : `현금: ${getCommaFormattedNumbers(String(pay.cash))}원`,
      start : `${year}-${month}-${day}`,
      end : `${year}-${month}-${day}`,
    }
    const totalEvt = {
      title : `합계: ${getCommaFormattedNumbers(String(pay.card+pay.cash))}원`,
      start : `${year}-${month}-${day}`,
      end : `${year}-${month}-${day}`,
    }
    reducedEvents.push(creditEvt)
    reducedEvents.push(cashEvt)
    reducedEvents.push(totalEvt)
  }
  return reducedEvents
}

//3자리단위로 , 표시
function getCommaFormattedNumbers(feeStr) {
  const characters = []
  for (let i = 0; i < feeStr.length; i++) {
    const curIndex = feeStr.length - 1 - i
    const remainder = i % 3
    if (remainder === 0) {
      if (i !== 0) {
        characters.push(",")
      }
    }
    characters.push(feeStr[curIndex])
  }
  return characters.reverse().join('')
}
