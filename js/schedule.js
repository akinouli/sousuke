// ----------------------------------------
// セクション切り替え
// ----------------------------------------
const inputSections =
    document.querySelectorAll(".form-section");

const resultSection =
    document.querySelector(".result-section");

const progressItems =
    document.querySelectorAll(
        ".progress-indicator span:not(.start-status):not(.create-status)"
    );

const resultStatus =
    document.querySelector(".result-status");

let currentSection = 0;

// 入力セクションと結果セクションの分離
const allSections = [
    ...inputSections,
    resultSection
];

// 初期状態では現在のセクション以外を非表示
allSections.forEach(
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

    if (nextIndex < 0 || nextIndex >= allSections.length) {
        return;
    }

    const current = allSections[currentSection];
    const next = allSections[nextIndex];

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
            /* ①～⑤ 現在表示中のセクションだけ見た目変化 */
            if (index < inputSections.length) {

                if (index === currentSection) {
                    item.classList.add("active");
                } else {
                    item.classList.remove("active");
                }

            }
        }
    );

    /* 結果画面表示中だけ見た目変化 */
    resultStatus.classList.toggle(
        "active",
        currentSection === inputSections.length
    );
}

// ----------------------------------------
// 進捗ナビ - 入力セクションへ移動
// ----------------------------------------
progressItems.forEach(
    (item, index) => {
        item.addEventListener("click",
            () => {

                /* ①～⑤だけセクション移動可能 */
                if (index < inputSections.length) {

                    /* 現在のセクションをクリックした場合は何もしない */
                    if (index === currentSection) {
                        return;
                    }

                    /* 現在のセクションをチェック */
                    if (!validateSection(currentSection)) {
                        return;
                    }

                    /* エラーがなければ移動 */
                    showSection(index);

                }
            }
        );
    }
);


// ----------------------------------------
// 進捗ナビ - 結果セクションへ移動
// ----------------------------------------
resultStatus.addEventListener(
    "click",
    () => {

        // 全セクションをチェック
        if (!validateAllSections()) {
            return;
        }

        // エラーがなければスケジュール作成
        createSchedule();

    }
);


// ----------------------------------------
// 作業期間
// ----------------------------------------
let startDate = null;
let completionDate = null;
let deadlineDate = null;


// ----------------------------------------
// エラーチェック - セクション毎
// ----------------------------------------

function validateSection(index) {

    // ① ページ数 ----------------------------------------
    if (index === 0) {

        const pageCount =
            Number(
                document.getElementById("page-count").value
            );

        if (!pageCount || pageCount < 1) {
            alert("ページ数を入力してください");
            return false;
        }

    }

    // ② 作業工程 ----------------------------------------
    if (index === 1) {

        // 作品制作行程 ----------------------------------------
        const processRows =
            processList.querySelectorAll(".process-row");

        // 行程が1個もない
        if (processRows.length === 0) {
            alert("行程を1個以上作成してください");
            return false;
        }

        // 作品制作の各行程をチェック
        for (const row of processRows) {

            const name =
                row.querySelector(".process-name").value.trim();

            const hours =
                Number(row.querySelector(".process-hours").value);

            const minutes =
                Number(row.querySelector(".process-minutes").value);

            const hasTime =
                hours > 0 || minutes > 0;

            // 行程名・作業時間ともに未入力
            if (!name && !hasTime) {
                alert("行程名・作業時間を入力してください");
                return false;
            }

            // 行程名のみ未入力
            if (!name) {
                alert("行程名を入力してください");
                return false;
            }

            // 作業時間のみ未入力
            if (!hasTime) {
                alert("作業時間を入力してください");
                return false;
            }
        }

        // 仕立て行程 ----------------------------------------
        // 【しない】ならチェックしない
        if (postWorkYes.classList.contains("selected")) {

            const postProcessRows =
                postProcessList.querySelectorAll(".process-row");

            // 行程が1個もない
            if (postProcessRows.length === 0) {
                alert("行程を1個以上作成してください");
                return false;
            }

            // 完成後の各行程をチェック
            for (const row of postProcessRows) {

                const name =
                    row.querySelector(".process-name").value.trim();

                const hours =
                    Number(row.querySelector(".process-hours").value);

                const minutes =
                    Number(row.querySelector(".process-minutes").value);

                const hasTime =
                    hours > 0 || minutes > 0;

                // 行程名・作業時間ともに未入力
                if (!name && !hasTime) {
                    alert("行程名・作業時間を入力してください");
                    return false;
                }

                // 行程名のみ未入力
                if (!name) {
                    alert("行程名を入力してください");
                    return false;
                }

                // 作業時間のみ未入力
                if (!hasTime) {
                    alert("作業時間を入力してください");
                    return false;
                }
            }
        }
    }

    // ③ 活動時間 ----------------------------------------
    if (index === 2) {

        const hourInputs =
            document.querySelectorAll(".hour-input");

        const hasWorkingTime =
            [...hourInputs].some(
                input =>
                    Number(input.value) >= 1
            );

        if (!hasWorkingTime) {
            alert("活動時間を設定してください");
            return false;
        }

    }

    // ④ 休日 ----------------------------------------
    if (index === 3) {
        // 休日は任意なのでチェックなし
    }

    // ⑤ 作業期間 ----------------------------------------
    if (index === 4) {

        if (!startDate && !deadlineDate) {
            alert("作業開始日・締切日を選択してください");
            return false;
        }

        if (!deadlineDate) {
            alert("締切日を選択してください");
            return false;
        }

    }

    return true;
}


// ----------------------------------------
// エラーチェック - 全セクション
// ----------------------------------------
function validateAllSections() {

    for (
        let index = 0;
        index < inputSections.length;
        index++
    ) {

        if (!validateSection(index)) {

            showSection(index);

            return false;
        }

    }

    return true;
}


// ----------------------------------------
// 「次へ」/「スケジュール作成」の表示
// ----------------------------------------
const nextButton = document.querySelector(".next-button");
const nextButtonText = nextButton.querySelector(".next-button-text");

function updateNextButton() {

    if (currentSection === inputSections.length - 1) {
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

            // 現在のセクションを保存
            const sectionBeforeMove = currentSection;

            // 現在のセクションをチェック
            if (!validateSection(sectionBeforeMove)) {
                return;
            }

            // ⑤なら全セクションをチェックしてスケジュール作成
            if (sectionBeforeMove === inputSections.length - 1) {

                if (!validateAllSections()) {
                    return;
                }

                createSchedule();

                return;
            }

            // ①～④なら次のセクションへ移動
            showSection(sectionBeforeMove + 1);

        }
    );
});

// ----------------------------------------
// 「次へ」ボタン初期表示
// ----------------------------------------
updateProgress();
updateNextButton();


// ----------------------------------------
// 作業期間カレンダー
// ----------------------------------------
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


// ----------------------------------------
// 初期工程 - 作品制作
// ----------------------------------------
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

// ----------------------------------------
// 初期工程 - 完成後作業
// ----------------------------------------
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


// ----------------------------------------
// 作品完成後の作業 する or しない
// ----------------------------------------
const postWorkYes = document.getElementById("post-work-yes");
const postWorkNo = document.getElementById("post-work-no");
const postWorkArea = document.getElementById("post-work-area");
const postWorkBottomArrow = document.getElementById("post-work-bottom-arrow");

function updatePostWorkDisplay(shouldSchedule) {
    // する
    postWorkYes.classList.toggle("selected", shouldSchedule);
    // しない
    postWorkNo.classList.toggle("selected", !shouldSchedule);
    // しない - 行程リスト非表示エリア
    postWorkArea.hidden = !shouldSchedule;
    // しない - ▼非表示エリア
    postWorkBottomArrow.hidden = !shouldSchedule;
}

// する
postWorkYes.addEventListener("click",
    () => {
        updatePostWorkDisplay(true);
    }
);

// しない
postWorkNo.addEventListener("click",
    () => {
        updatePostWorkDisplay(false);
    }
);

updatePostWorkDisplay(true);


// ----------------------------------------
// 工程追加 カード生成
// ----------------------------------------

function createProcessItem(process) {

    // 工程カード＋▼をまとめる親
    const item = document.createElement("div");

    item.className = "process-item";

    // 工程カード ----------------------------------------
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

    // ▼ ----------------------------------------
    const arrow = document.createElement("div");

    arrow.className = "process-arrow";

    // 工程カード＋▼をセットにする ----------------------------------------
    item.appendChild(row);
    item.appendChild(arrow);

    return item;
}


// ----------------------------------------
// 工程追加 - 作品制作
// ----------------------------------------

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


// ----------------------------------------
// 工程追加 - 作品完成後
// ----------------------------------------

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


// ----------------------------------------
// 初期工程を表示
// ----------------------------------------

const processList = document.getElementById("process-list");
const postProcessList = document.getElementById("post-process-list");

// 作品制作
defaultProcesses.forEach(
    process => {
        processList.appendChild(createProcessItem(process));
    }
);

// 作品完成後
defaultPostProcesses.forEach(
    process => {
        postProcessList.appendChild(createProcessItem(process));
    }
);


// ----------------------------------------
// 自動調整 ON / OFF
// ----------------------------------------

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


// ----------------------------------------
// 工程削除
// ----------------------------------------

document.addEventListener("click",
    event => {
        if (event.target.classList.contains("delete-btn")) {
            event.target.closest(".process-item").remove();
        }
    }
);


// ----------------------------------------
// 工程カード移動後アニメーション
// ----------------------------------------

function animateMovedProcess(item) {

    item.classList.remove("process-shake");

    // アニメーションを再スタートさせる
    void item.offsetWidth;

    item.classList.add("process-shake");
    item.addEventListener("animationend",
        () => {
            item.classList.remove("process-shake");
        },
        {once: true}
    );
}


// ----------------------------------------
// 工程リスト並び替え
// ----------------------------------------

let draggingItem = null;
let dragPointerId = null;
let draggingList = null;
let lastPointerY = 0;

// ドラッグ開始時の位置
let originalIndex = null;

// 自動スクロール用
const topScrollZone = 160;
const bottomScrollZone = 180;
const maxScrollSpeed = 10;


// ----------------------------------------
// 工程リスト並び替え - 自動スクロール開始
// ----------------------------------------

let autoScrollFrame = null;

function startAutoScroll() {

    if (autoScrollFrame) {
        return;
    }

    function scrollLoop() {

        if (!draggingItem) {
            autoScrollFrame = null;
            return;
        }

        const viewportHeight = window.innerHeight;

        // 上端 ----------------------------------------
        if (lastPointerY < topScrollZone) {

            const distance = topScrollZone - lastPointerY;
            const ratio = Math.min(distance / topScrollZone, 1);
            const scrollSpeed = maxScrollSpeed * ratio * ratio;

            window.scrollBy(0, -scrollSpeed);
        }

        // 下端 ----------------------------------------
        else if (lastPointerY > viewportHeight - bottomScrollZone) {

            const distance = lastPointerY - (viewportHeight - bottomScrollZone);
            const ratio = Math.min(distance / bottomScrollZone, 1);
            const scrollSpeed = maxScrollSpeed * ratio * ratio;

            window.scrollBy(0, scrollSpeed);
        }

        // 次のフレーム
        autoScrollFrame = requestAnimationFrame(scrollLoop);
    }

    autoScrollFrame = requestAnimationFrame(scrollLoop);
}


// ----------------------------------------
// 工程リスト並び替え - 自動スクロール停止
// ----------------------------------------

function stopAutoScroll() {

    if (autoScrollFrame) {
        cancelAnimationFrame(autoScrollFrame);
        autoScrollFrame = null;
    }

}


// ----------------------------------------
// 行程リスト並び替え - ドラッグ開始
// ----------------------------------------

document.addEventListener("pointerdown",
    event => {

        const handle = event.target.closest(".drag-handle");

        if (!handle) {
            return;
        }

        draggingItem = handle.closest(".process-item");

        if (!draggingItem) {
            return;
        }

        draggingList = draggingItem.parentNode;

        // ドラッグ開始時の位置を記録
        originalIndex = Array.from(draggingList.children).indexOf(draggingItem);

        dragPointerId = event.pointerId;

        lastPointerY = event.clientY;

        draggingItem
        .querySelector(".process-row")
        .classList.add("dragging");

        handle.setPointerCapture(event.pointerId);

        // 自動スクロール開始
        startAutoScroll();
    }
);


// ----------------------------------------
// 行程リスト並び替え - ドラッグ中
// ----------------------------------------

document.addEventListener("pointermove",
    event => {

        if (!draggingItem || event.pointerId !== dragPointerId) {
            return;
        }

        const currentY = event.clientY;

        // 上方向へ移動 ----------------------------------------
        if (currentY < lastPointerY) {
            const previousItem = draggingItem.previousElementSibling;

            if (previousItem) {
                const rect = previousItem.getBoundingClientRect();
                const middle = rect.top + rect.height * 0.6;

                if (currentY < middle) {
                    draggingList.insertBefore(draggingItem,previousItem);
                }
            }
        }


        // 下方向へ移動 ----------------------------------------
        if (currentY > lastPointerY) {
            const nextItem = draggingItem.nextElementSibling;

            if (nextItem) {
                const rect = nextItem.getBoundingClientRect();
                const middle = rect.top + rect.height * 0.2;

                if (currentY > middle) {
                    draggingList.insertBefore(nextItem,draggingItem);
                }
            }
        }


        // 現在の指・マウス位置を記録
        lastPointerY = currentY;
    }
);


// ----------------------------------------
// 行程リスト並び替え - ドラッグ終了
// ----------------------------------------

document.addEventListener("pointerup",
    event => {

        if (!draggingItem || event.pointerId !== dragPointerId) {
            return;
        }

        stopAutoScroll();

        // ドラッグ開始時と現在の位置を比較
        const currentIndex = Array.from(draggingList.children).indexOf(draggingItem);
        const hasMoved = currentIndex !== originalIndex;

        draggingItem
        .querySelector(".process-row")
        .classList.remove("dragging");

        // 実際に位置が変わっていたら掴んでいたカードだけアニメーション
        if (hasMoved) {
            animateMovedProcess(draggingItem.querySelector(".process-row"));
        }

        draggingItem = null;
        dragPointerId = null;
        draggingList = null;
        lastPointerY = 0;
        originalIndex = null;
    }
);


// ----------------------------------------
// 行程リスト並び替え - 操作キャンセル
// ----------------------------------------

document.addEventListener("pointercancel",
    event => {

        if (!draggingItem || event.pointerId !== dragPointerId) {
            return;
        }

        stopAutoScroll();

        draggingItem
        .querySelector(".process-row")
        .classList.remove("dragging");

        draggingItem = null;
        dragPointerId = null;
        draggingList = null;
        lastPointerY = 0;
        originalIndex = null;
    }
);


// ----------------------------------------
// 活動時間
// ----------------------------------------
const weekdays = ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"];
const weekdayList = document.getElementById("weekday-list");

// 選択バーの色替え
function updateHourRangeColor(number, range) {
    const value = Number(range.value);

    range.classList.toggle("normal", value <= 12);
    range.classList.toggle("overwork", value > 12);
}

weekdays.forEach(
    day => {
        const row = document.createElement("div");
        row.className = "day-row";
        row.innerHTML = `
            <span>${day}</span>
            <input type="number" class="hour-input" min="0" max="24" value="1">
            <span>時間</span>
            <input type="range" class="hour-range" min="0" max="24" value="1">
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


// ----------------------------------------
// 休日カレンダー
// ----------------------------------------
let holidayDate = new Date();

const holidays = new Set();

function renderHolidayCalendar() {
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


// ----------------------------------------
// 入力チェック
// ----------------------------------------
function validateScheduleInput() {

    // 1.ページ数 -----------------------------
    const pageCount = Number(document.getElementById("page-count").value);

    if (!pageCount || pageCount < 1) {
        alert("ページ数を入力してください。");
        showSection(0);
        return false;
    }

    // 2.工程リスト -----------------------------
    const processRows = document.querySelectorAll(".process-row");

    if (processRows.length === 0) {
        alert("作業工程を1つ以上追加してください。");
        showSection(2);
        return false;
    }

    const hasInvalidProcess = [...processRows].some(
        row => {
            const hours =
                Number(row.querySelector(".process-hours").value);

            const minutes =
                Number(row.querySelector(".process-minutes").value);

            return hours === 0 && minutes === 0;
        }
    );

    if (hasInvalidProcess) {
        alert("すべての作業工程に作業時間を入力してください。");
        showSection(2);
        return false;
    }

    // 3.活動時間 -----------------------------
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

    // 4.休日 -----------------------------
    // 任意なのでチェック不要

    // 5.作業期間 -----------------------------
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

    return true;
}


// ----------------------------------------
// スケジュール作成
// ----------------------------------------
function createSchedule() {

    const pageCount =
        document.getElementById("page-count").value;

    console.log("ページ数:",pageCount);
    console.log("開始日:",startDate);
    console.log("締切日:",deadlineDate);
    console.log("休日:",[...holidays]);

    // 結果画面へ移動
    showSection(inputSections.length);

}