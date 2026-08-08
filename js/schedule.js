const currentYear =
new Date().getFullYear();


// =====================
// 日付セレクト作成
// =====================


function setupDate(prefix){


const year =
document.getElementById(prefix+"-year");


const month =
document.getElementById(prefix+"-month");


const day =
document.getElementById(prefix+"-day");



for(
let i=currentYear;
i<=currentYear+5;
i++
){

let option=document.createElement("option");

option.value=i;

option.textContent=i+"年";

year.appendChild(option);

}



for(
let i=1;
i<=12;
i++
){

let option=document.createElement("option");

option.value=i;

option.textContent=i+"月";

month.appendChild(option);

}



function updateDay(){


day.innerHTML="";


let max =
new Date(
year.value,
month.value,
0
).getDate();



for(
let i=1;
i<=max;
i++
){

let option=document.createElement("option");

option.value=i;

option.textContent=i+"日";

day.appendChild(option);

}


}



month.addEventListener(
"change",
updateDay
);


updateDay();


}



setupDate("start");

setupDate("deadline");




// =====================
// 工程追加
// =====================


document
.getElementById("add-process")
.addEventListener(
"click",
()=>{


const div =
document.createElement("div");


div.className="process-row";


div.innerHTML=`

<input type="text" placeholder="工程名">

<input type="number" placeholder="時間">


<select>

<option>ページ毎</option>

<option>全体</option>

</select>


<button class="delete-btn">
削除
</button>

`;



document
.getElementById("process-list")
.appendChild(div);


});





document.addEventListener(
"click",
(e)=>{


if(
e.target.classList.contains("delete-btn")
){

e.target.parentElement.remove();

}


});





// =====================
// 曜日時間
// =====================


const weekdays=[

"月曜日",
"火曜日",
"水曜日",
"木曜日",
"金曜日",
"土曜日",
"日曜日"

];



const weekdayList =
document.getElementById(
"weekday-list"
);



weekdays.forEach(day=>{


const div =
document.createElement("div");


div.className="day-row";


div.innerHTML=`

${day}

<input type="number"
min="0"
max="24"
value="0">

時間


<input type="range"
min="0"
max="24"
value="0">


`;



const number =
div.querySelector(
"input[type=number]"
);


const range =
div.querySelector(
"input[type=range]"
);



number.addEventListener(
"input",
()=>range.value=number.value
);



range.addEventListener(
"input",
()=>number.value=range.value
);



weekdayList.appendChild(div);


});





document
.getElementById("create-button")
.addEventListener(
"click",
()=>{

alert(
"スケジュール作成準備OK！"
);

});