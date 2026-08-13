// ========================================
// セクション切り替え
// ========================================
const sections = document.querySelectorAll(".form-section");
const progressItems = document.querySelectorAll(".progress-indicator span");
const createStatus = document.querySelector(".create-status");

let currentSection = 0;

// 初期状態では現在のセクション以外を非表示
sections.forEach(
    (section, index) => {
        if (index !== currentSection) {
            section.classList.add("hidden-section");
        }
    }
);

// ----------------------------------------
// セクション表示
// ----------------------------------------
function showSection(nextIndex) {

    if (nextIndex < 0 || nextIndex >= sections.length) {
        return;
    }

    const current = sections[currentSection];
    const next = sections[nextIndex];

    if (currentSection === nextIndex) {
        return;
    }

    // 次のセクションを表示できる状態にする
    next.classList.remove("hidden-section");

    // 現在のセクションを退出
    current.classList.remove("active-section");
    current.classList.add("exit-section");

    currentSection = nextIndex;

    updateProgress();
    updateNextButton();

    // セクション表示時にスクロールリセット
    window.scrollTo({top: 0,behavior: "instant"});

    // ブラウザに一度「opacity: 0」の状態を描画させてから
    // active-sectionを追加してフェードインさせる
    requestAnimationFrame(
        () => {
            next.classList.add("active-section");
        }
    );

    // アニメーション終了後、前のセクションを完全に非表示
    setTimeout(
        () => {
            current.classList.remove("exit-section");
            current.classList.add("hidden-section");
        },
        500
    );
}

// ----------------------------------------
// 進捗 ▶ / ▷ の切り替え
// ----------------------------------------
function updateProgress() {
    progressItems.forEach(
        (item, index) => {
            /* ①～⑤ 現在表示中のセクションだけ ▶ にする */
            if (index < 5) {
                item.classList.toggle("active",index === currentSection);
            }
        }
    );
}

// ----------------------------------------
// ヘッダーから各セクションへ移動
// ----------------------------------------
progressItems
.forEach(
    (item, index) => {
        item.addEventListener("click",
            () => {
                /* ①～⑤だけセクション移動可能 */
                if (index < 5) {
                    showSection(index);
                }
            }
        );
    }
);

// ----------------------------------------
// 作業期間
// ----------------------------------------
let startDate = null;
let completionDate = null;
let deadlineDate = null;

// ----------------------------------------
// セクションごとの入力チェック
// ----------------------------------------

function validateSection(index) {

    // ① ページ数
    if (index === 0) {

        const pageCount =
            document.getElementById("page-count").value;

        if (pageCount === "") {
            alert("ページ数を入力してください。");
            return false;
        }

    }


    // ② 工程リスト
    if (index === 1) {

        // 後でここに工程のチェックを追加

    }


    // ③ 活動時間
    if (index === 2) {

        // 後でここに作業時間のチェックを追加

    }


    // ④ 休日
    if (index === 3) {

        // ここは必要になったらチェック

    }


    // ⑤ 作業期間
    if (index === 4) {

        if (!startDate) {
            alert("作業開始日を選択してください。");
            return false;
        }

        if (!deadlineDate) {
            alert("締切日を選択してください。");
            return false;
        }

    }


    return true;
}

// ----------------------------------------
// 「次へ」ボタンの表示
// ----------------------------------------
const nextButton = document.querySelector(".next-button");
const nextButtonText = nextButton.querySelector(".next-button-text");

function updateNextButton() {

    if (currentSection === sections.length - 1) {
        nextButtonText.textContent = "スケジュール作成";
    } else {
        nextButtonText.textContent = "次へ";
    }

}

// ----------------------------------------
// 「次へ」ボタン
// ----------------------------------------
document
.querySelectorAll(".next-button")
.forEach(button => {
    button.addEventListener("click",
        () => {
            if (currentSection < sections.length - 1) {
                // 現在のセクションをチェック
                if (!validateSection(currentSection)) {
                    return;
                }
                showSection(currentSection + 1);
            } else {
                // 最後のセクションをチェック
                if (!validateSection(currentSection)) {
                   return;
                }
                createSchedule();
            }
        }
    );
});

// ----------------------------------------
// 「次へ」ボタン初期表示
// ----------------------------------------
updateNextButton();


// ========================================
// 作業期間カレンダー
// ========================================
let periodDate = new Date();

function renderPeriodCalendar() {
    const year = periodDate.getFullYear();
    const month = periodDate.getMonth();

    document.getElementById("period-month").textContent = `${year}年 ${month + 1}月`;

    const calendar = document.getElementById("period-calendar");

    calendar.innerHTML = "";

    const firstDay = new Date(year,month,1).getDay();

    const daysInMonth = new Date(year,month + 1,0).getDate();

    // 月初までの空白
    for (let i = 0;i < firstDay;i++) {
        const empty = document.createElement("div");

        empty.className = "calendar-day empty";

        calendar.appendChild(empty);
    }

    // 日付
    for (let day = 1;day <= daysInMonth;day++) {
        const cell = document.createElement("div");

        cell.className = "calendar-day";

        const date = new Date(year,month,day);

        // 日付表示
        const dateNumber = document.createElement("div");
        dateNumber.className = "day-number";
        dateNumber.textContent = day;

        if (date.getDay() === 0) {
            cell.classList.add("sunday");
        }

        if (date.getDay() === 6) {
            cell.classList.add("saturday");
        }

        cell.appendChild(dateNumber);

        // アイコン表示エリア
        const dayIcon = document.createElement("div");
        dayIcon.className = "day-icon";

        cell.appendChild(dayIcon);

        // 作業開始日
        if (startDate && isSameDate(date,startDate)) {
            cell.classList.add("selected-start");

            const icon = document.createElement("img");

            icon.src = "icon/cal1_start.png";
            icon.alt = "作業開始日";

            dayIcon.appendChild(icon);
        }

        // 締切日
        if (deadlineDate && isSameDate(date,deadlineDate)) {
            cell.classList.add("selected-end");

            const icon = document.createElement("img");

            icon.src = "icon/cal3_deadline.png";
            icon.alt = "締切日";

            dayIcon.appendChild(icon);
        }

        // 期間内
        if (startDate && deadlineDate && date > startDate && date < deadlineDate) {
            cell.classList.add("period");
        }

        // 日付クリック
        cell.addEventListener("click",
            () => {
                selectPeriodDate(date);
            }
        );

        calendar.appendChild(cell);
    }
}

function selectPeriodDate(date) {

    /* まだ開始日がない、または期間選択済みで新しい期間を選び直す */
    if (!startDate || (startDate && deadlineDate)) {
        startDate = new Date(date);
        deadlineDate = null;
    } else {
        /* 開始日より前を選択した場合は自動的に日付を入れ替える */
        if (date < startDate) {
            deadlineDate = startDate;
            startDate = new Date(date);
        } else {
            deadlineDate = new Date(date);
        }
    }

    renderPeriodCalendar();
}

function isSameDate(a, b) {
    return (
        a.getFullYear() === b.getFullYear()
        &&
        a.getMonth() === b.getMonth()
        &&
        a.getDate() === b.getDate()
    );

}

// ----------------------------------------
// 前月
// ----------------------------------------
document
.getElementById("period-prev")
.addEventListener("click",
    () => {
        periodDate.setMonth(periodDate.getMonth() - 1);
        renderPeriodCalendar();
    }
);

// ----------------------------------------
// 次月
// ----------------------------------------
document
.getElementById("period-next")
.addEventListener("click",
    () => {
        periodDate.setMonth(periodDate.getMonth() + 1);
        renderPeriodCalendar();
    }
);

renderPeriodCalendar();


// ========================================
// 初期工程
// ========================================
const defaultProcesses = [
    {
        name: "プロット",
        unit: "total",
        hours: 40,
        minutes: 0,
        autoAdjust: false
    },

    {
        name: "ネーム",
        unit: "page",
        hours: 2,
        minutes: 0,
        autoAdjust: false
    },

    {
        name: "下描き",
        unit: "page",
        hours: 4,
        minutes: 0,
        autoAdjust: false
    },

    {
        name: "ペン入れ",
        unit: "page",
        hours: 2,
        minutes: 0,
        autoAdjust: false
    },

    {
        name: "ベタ・トーン",
        unit: "page",
        hours: 3,
        minutes: 0,
        autoAdjust: false
    },

    {
        name: "仕上げ",
        unit: "page",
        hours: 2,
        minutes: 0,
        autoAdjust: false
    },

    {
        name: "表紙",
        unit: "total",
        hours: 20,
        minutes: 0,
        autoAdjust: false
    }
];

// ========================================
// 初期工程 - 完成後作業
// ========================================
const defaultPostProcesses = [
    {
        name: "入稿チェック",
        unit: "total",
        hours: 2,
        minutes: 0,
        autoAdjust: false
    },

    {
        name: "入稿手続き",
        unit: "total",
        hours: 1,
        minutes: 0,
        autoAdjust: false
    }
];


// ========================================
// 作品完成後の作業 する or しない
// ========================================
const postWorkYes = document.getElementById("post-work-yes");
const postWorkNo = document.getElementById("post-work-no");
const postWorkArea = document.getElementById("post-work-area");
const postWorkBottomArrow = document.getElementById("post-work-bottom-arrow");

function updatePostWorkDisplay(shouldSchedule) {

    postWorkYes.classList.toggle(
        "selected",
        shouldSchedule
    );

    postWorkNo.classList.toggle(
        "selected",
        !shouldSchedule
    );

    postWorkArea.hidden = !shouldSchedule;

    postWorkBottomArrow.hidden =
        !shouldSchedule;
}

postWorkYes.addEventListener("click",
    () => {
        updatePostWorkDisplay(true);
    }
);

postWorkNo.addEventListener("click",
    () => {
        updatePostWorkDisplay(false);
    }
);

updatePostWorkDisplay(true);


// ========================================
// 工程追加 カード生成
// ========================================

function createProcessItem(process) {

    // 工程カード＋▼をまとめる親
    const item = document.createElement("div");

    item.className = "process-item";

    // ----------------------------------------
    // 工程カード
    // ----------------------------------------
    const row = document.createElement("div");

    row.className = "process-row";

    row.innerHTML = `
        <span class="drag-handle">＝</span>

        <div class="process-main">

            <input type="text" class="process-name" value="${process.name}" placeholder="工程名">

            <div class="process-settings">

                <select class="process-unit">
                    <option value="total" ${process.unit === "total" ? "selected" : ""}>全体</option>
                    <option value="page" ${process.unit === "page" ? "selected" : ""}>ページ毎</option>
                </select>

                <div class="time-input">
                    <input type="number" class="process-hours" min="0" value="${process.hours}">
                    <span>時間</span>
                    <input type="number" class="process-minutes" min="0" max="59" value="${process.minutes}">
                    <span>分</span>
                </div>

                <button
                    type="button"
                    class="auto-adjust-btn ${process.autoAdjust ? "on" : "off"}"
                    data-auto-adjust="${process.autoAdjust}"
                >
                    自動調整
                    <span>${process.autoAdjust ? "ON" : "OFF"}</span>
                </button>

            </div>

        </div>

        <button type="button" class="delete-btn" aria-label="工程を削除">×</button>
    `;

    // ----------------------------------------
    // ▼
    // ----------------------------------------
    const arrow = document.createElement("div");

    arrow.className = "process-arrow";

    // ----------------------------------------
    // 工程カード＋▼をセットにする
    // ----------------------------------------
    item.appendChild(row);
    item.appendChild(arrow);

    return item;
}


// ========================================
// 工程追加 - 作品制作
// ========================================

document
.getElementById("add-process")
.addEventListener("click",
    () => {
        const newProcess = {
            name: "",
            unit: "page",
            hours: 0,
            minutes: 0,
            autoAdjust: false
        };

        processList.appendChild(createProcessItem(newProcess));
    }
);


// ========================================
// 工程追加 - 作品完成後
// ========================================

document
.getElementById("add-post-process")
.addEventListener("click",
    () => {
        const newProcess = {
            name: "",
            unit: "page",
            hours: 0,
            minutes: 0,
            autoAdjust: false
        };

        postProcessList.appendChild(createProcessItem(newProcess));
    }
);


// ========================================
// 初期工程を表示
// ========================================

const processList = document.getElementById("process-list");
const postProcessList = document.getElementById("post-process-list");

// 本編工程
defaultProcesses.forEach(
    process => {
        processList.appendChild(createProcessItem(process));
    }
);

// 作品完成後の工程
defaultPostProcesses.forEach(
    process => {
        postProcessList.appendChild(createProcessItem(process));
    }
);


// ========================================
// 自動調整 ON / OFF
// ========================================

document.addEventListener("click",
    event => {
        const button = event.target.closest(".auto-adjust-btn");

        if (!button) {
            return;
        }

        const isOn = button.dataset.autoAdjust === "true";
        const newState = !isOn;

        button.dataset.autoAdjust = newState;
        button.classList.toggle("on",newState);
        button.classList.toggle("off",!newState);
        button.querySelector("span").textContent = newState ? "ON" : "OFF";
    }
);


// ========================================
// 工程削除
// ========================================

document
.addEventListener("click",
    event => {
        if (event.target.classList.contains("delete-btn")) {
            event.target.closest(".process-item").remove();
        }
    }
);


// ========================================
// 工程並び替え
// ========================================

let draggingItem = null;
let placeholder = null;
let dragPointerId = null;
let draggingList = null;

// ドラッグ開始位置のズレ
let dragOffsetX = 0;
let dragOffsetY = 0;


// ----------------------------------------
// ＝を押したとき
// ----------------------------------------
document.addEventListener(
    "pointerdown",
    event => {

        const handle = event.target.closest(".drag-handle");

        if (!handle) {
            return;
        }

        // 工程カード＋▼をまとめた process-item
        draggingItem = handle.closest(".process-item");

        if (!draggingItem) {
            return;
        }

        // この工程が入っているリストだけを対象にする
        draggingList = draggingItem.parentNode;

        dragPointerId = event.pointerId;


        // ----------------------------------------
        // ドラッグ開始位置を記録
        // ----------------------------------------

        const rect = draggingItem.getBoundingClientRect();

        dragOffsetX = event.clientX - rect.left;
        dragOffsetY = event.clientY - rect.top;


        // ----------------------------------------
        // 半透明にする
        // ----------------------------------------

        draggingItem
            .querySelector(".process-row")
            .classList.add("dragging");


        // ----------------------------------------
        // プレースホルダー
        // ----------------------------------------

        placeholder = document.createElement("div");

        placeholder.className = "process-placeholder";

        // 工程カード＋▼と同じ高さ
        placeholder.style.height =
            `${draggingItem.offsetHeight}px`;


        // 元の位置に置く
        draggingList.insertBefore(
            placeholder,
            draggingItem
        );


        // ----------------------------------------
        // ドラッグ対象を固定
        // ----------------------------------------

        draggingItem.style.position = "fixed";

        draggingItem.style.width =
            `${rect.width}px`;

        draggingItem.style.zIndex = "1000";

        draggingItem.style.pointerEvents = "none";


        // 最初の位置を維持
        draggingItem.style.left =
            `${event.clientX - dragOffsetX}px`;

        draggingItem.style.top =
            `${event.clientY - dragOffsetY}px`;


        // タッチ操作をブラウザに奪われない
        handle.setPointerCapture(event.pointerId);
    }
);


// ----------------------------------------
// ＝を押したまま動かしているとき
// ----------------------------------------
document.addEventListener(
    "pointermove",
    event => {

        if (
            !draggingItem ||
            event.pointerId !== dragPointerId
        ) {
            return;
        }


        // ----------------------------------------
        // ドラッグ中のカードを追従
        // ----------------------------------------

        draggingItem.style.left =
            `${event.clientX - dragOffsetX}px`;

        draggingItem.style.top =
            `${event.clientY - dragOffsetY}px`;


        // ----------------------------------------
        // 画面端で自動スクロール
        // ----------------------------------------

        const edgeSize = 70;
        const scrollSpeed = 12;

        if (event.clientY < edgeSize) {

            window.scrollBy({
                top: -scrollSpeed,
                behavior: "auto"
            });

        } else if (
            event.clientY >
            window.innerHeight - edgeSize
        ) {

            window.scrollBy({
                top: scrollSpeed,
                behavior: "auto"
            });
        }


        // ----------------------------------------
        // 同じリスト内の工程だけ取得
        // ----------------------------------------

        const items =
            [
                ...draggingList.querySelectorAll(
                    ".process-item"
                )
            ].filter(
                item => item !== draggingItem
            );


        let target = null;


        // ----------------------------------------
        // 挿入位置を探す
        // ----------------------------------------

        for (const item of items) {

            const rect =
                item.getBoundingClientRect();

            const middle =
                rect.top + rect.height / 2;

            if (event.clientY < middle) {

                target = item;

                break;
            }
        }


        // ----------------------------------------
        // プレースホルダーを移動
        // ----------------------------------------

        if (target) {

            draggingList.insertBefore(
                placeholder,
                target
            );

        } else {

            draggingList.appendChild(
                placeholder
            );
        }
    }
);


// ----------------------------------------
// 指・マウスを離したとき
// ----------------------------------------
document.addEventListener(
    "pointerup",
    event => {

        if (
            !draggingItem ||
            event.pointerId !== dragPointerId
        ) {
            return;
        }


        // ----------------------------------------
        // プレースホルダーの位置へ戻す
        // ----------------------------------------

        placeholder.parentNode.insertBefore(
            draggingItem,
            placeholder
        );


        // ----------------------------------------
        // スタイル解除
        // ----------------------------------------

        draggingItem.style.position = "";
        draggingItem.style.width = "";
        draggingItem.style.zIndex = "";
        draggingItem.style.pointerEvents = "";
        draggingItem.style.left = "";
        draggingItem.style.top = "";


        draggingItem
            .querySelector(".process-row")
            .classList.remove("dragging");


        placeholder.remove();


        // ----------------------------------------
        // リセット
        // ----------------------------------------

        draggingItem = null;
        placeholder = null;
        dragPointerId = null;
        draggingList = null;

        dragOffsetX = 0;
        dragOffsetY = 0;
    }
);


// ----------------------------------------
// 操作キャンセル
// ----------------------------------------
document.addEventListener(
    "pointercancel",
    () => {

        if (!draggingItem) {
            return;
        }


        if (placeholder) {

            placeholder.parentNode.insertBefore(
                draggingItem,
                placeholder
            );

            placeholder.remove();
        }


        draggingItem.style.position = "";
        draggingItem.style.width = "";
        draggingItem.style.zIndex = "";
        draggingItem.style.pointerEvents = "";
        draggingItem.style.left = "";
        draggingItem.style.top = "";


        draggingItem
            .querySelector(".process-row")
            .classList.remove("dragging");


        draggingItem = null;
        placeholder = null;
        dragPointerId = null;
        draggingList = null;

        dragOffsetX = 0;
        dragOffsetY = 0;
    }
);


// ========================================
// 作業可能時間
// ========================================
const weekdays = ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"];
const weekdayList = document.getElementById("weekday-list");

// 選択バーの色替え
function updateHourRangeColor(number, range) {
    const value = Number(range.value);

    range.classList.toggle("normal", value <= 12);
    range.classList.toggle("overwork", value > 12);
}

weekdays
.forEach(
    day => {
        const row = document.createElement("div");
        row.className = "day-row";
        row.innerHTML = `
            <span>${day}</span>
            <input type="number" class="hour-input" min="0" max="24" value="0">
            <span>時間</span>
            <input type="range" class="hour-range" min="0" max="24" value="0">
        `;

        const number = row.querySelector(".hour-input");
        const range = row.querySelector(".hour-range");

        number.addEventListener("input",
            () => {
                // 空欄の途中は何もしない
                if (number.value === "") {
                    return;
                }

                const value = Number(number.value);

                // 0～24の範囲ならバーと同期
                if (value >= 0 && value <= 24) {
                    range.value = value;
                    updateHourRangeColor(number, range);
                }
            }
        );

        number.addEventListener("blur",
            () => {
                let value = Number(number.value);

                if (number.value === "" || Number.isNaN(value)) {
                    value = 0;
                }

                if (value < 0) {
                    value = 0;
                }

                if (value > 24) {
                    value = 24;
                }

                number.value = value;
                range.value = value;

                updateHourRangeColor(number, range);
            }
        );        

        range.addEventListener("input",
            () => {
                number.value = range.value;

                updateHourRangeColor(number, range);
            }
        );

        // 初期状態の色を設定
        updateHourRangeColor(number, range);

        weekdayList.appendChild(row);
    }
);


// ========================================
// 休日カレンダー
// ========================================
let holidayDate = new Date();

const holidays = new Set();

function 
renderHolidayCalendar() {
    const year = holidayDate.getFullYear();
    const month = holidayDate.getMonth();

    document.getElementById("holiday-month").textContent = `${year}年 ${month + 1}月`;

    const calendar = document.getElementById("holiday-calendar");

    calendar.innerHTML = "";

    const firstDay = new Date(year,month,1).getDay();
    const daysInMonth = new Date(year,month + 1,0).getDate();

    // 月初までの空白
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");

        empty.className = "calendar-day empty";
        calendar.appendChild(empty);
    }

    // 日付
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day";

        const date = new Date(year, month, day);

        // 日付表示
        const dateNumber = document.createElement("div");
        dateNumber.className = "day-number";
        dateNumber.textContent = day;

        if (date.getDay() === 0) {
            cell.classList.add("sunday");
        }

        if (date.getDay() === 6) {
            cell.classList.add("saturday");
        }

        cell.appendChild(dateNumber);

        // アイコン表示エリア
        const dayIcon = document.createElement("div");
        dayIcon.className = "day-icon";

        cell.appendChild(dayIcon);

        const key = `${year}-${month + 1}-${day}`;
        
        // 休日判定
        if (holidays.has(key)) {
            cell.classList.add("holiday");

            const icon = document.createElement("img");

            icon.src = "icon/cal4_holiday.png";
            icon.alt = "休日";

            dayIcon.appendChild(icon);
        }
        
        // 日付クリック
        cell.addEventListener("click",
            () => {
                if (holidays.has(key)) {
                    holidays.delete(key);
                } else {
                    holidays.add(key);
                }
                renderHolidayCalendar();
            }
        );

        calendar.appendChild(cell);
    }
}

document
.getElementById("holiday-prev")
.addEventListener("click",
    () => {
        holidayDate.setMonth(holidayDate.getMonth() - 1);
        renderHolidayCalendar();
    }
);

document
.getElementById("holiday-next")
.addEventListener("click",
    () => {
        holidayDate.setMonth(holidayDate.getMonth() + 1);
        renderHolidayCalendar();
    }
);

renderHolidayCalendar();


// ========================================
// 入力チェック
// ========================================
function validateScheduleInput() {
    // -----------------------------
    // ① ページ数
    // -----------------------------
    const pageCount = Number(document.getElementById("page-count").value);

    if (!pageCount || pageCount < 1) {
        alert("ページ数を入力してください。");
        showSection(0);
        return false;
    }

    // -----------------------------
    // ② 作業期間
    // -----------------------------
    if (!startDate || !deadlineDate) {
        alert("作業期間を選択してください。");
        showSection(1);
        return false;
    }

    if (deadlineDate < startDate) {
        alert("締切日は作業開始日より後の日付にしてください。");
        showSection(1);
        return false;
    }

    // -----------------------------
    // ③ 作業工程
    // -----------------------------
    const processRows = document.querySelectorAll(".process-row");

    if (processRows.length === 0) {
        alert("作業工程を1つ以上追加してください。");
        showSection(2);
        return false;
    }

    let hasValidProcess = false;

    processRows.forEach(
        row => {
            const hours = Number(row.querySelector(".process-hours").value);
            const minutes = Number(row.querySelector(".process-minutes").value);

            if (hours > 0 || minutes > 0) {
                return;
            }

            hasInvalidProcess = true;
        }
    );

    if (!hasValidProcess) {
        alert("作業時間を入力してください。");
        showSection(2);
        return false;
    }

    // -----------------------------
    // ④ 作業可能時間
    // -----------------------------
    const hourInputs = document.querySelectorAll(".hour-input");
    const hasWorkingTime = [...hourInputs].some(
        input =>
            Number(input.value) >= 1
    );

    if (!hasWorkingTime) {
        alert("作業可能時間を1時間以上設定してください。");
        showSection(3);
        return false;
    }

    // -----------------------------
    // ⑤ 休日
    // -----------------------------
    // 任意なのでチェック不要

    return true;
}


// ========================================
// スケジュール作成
// ========================================
function 
createSchedule() {
    const pageCount = document.getElementById("page-count").value;

    console.log("ページ数:",pageCount);

    console.log("開始日:",startDate);

    console.log("締切日:",deadlineDate);

    console.log("休日:",[...holidays]);

    // --------------------------------
    // スケジュール作成完了
    // --------------------------------
    progressItems.forEach(
        (item, index) => {
            if (index < 5) {
                item.textContent = "▷";
                item.classList.remove("active");
            }
        }
    );

    createStatus.textContent = "作成";
    createStatus.classList.add("active");

    alert("スケジュール作成処理は次の段階で実装します！");
}