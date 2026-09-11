// ========================================
// Step.6
// 結果表示
// ========================================

// ----------------------------------------
// 結果① 結果コメント
// ----------------------------------------

function getResultCommentImage(
    emptyDays,
    autoAdjustmentResult,
    adjustmentRate
) {

    // 成立不能 ----------------------------------------

    if (
        autoAdjustmentResult === "全て" && adjustmentRate >= 90
    ) {
        return "img/result/failed.png";
    }


    // 全て自動調整 ----------------------------------------

    if (
        autoAdjustmentResult === "全て"
    ) {
        if (
            adjustmentRate >= 10
        ) {
            return "img/result/all_10%over.png";
        }
    }


    // 一部自動調整 ----------------------------------------

    if (
        autoAdjustmentResult === "一部"
    ) {
        if (
            adjustmentRate >= 10
        ) {
            return "img/result/pert_10%over.png";
        }
    }


    // 自動調整なし ----------------------------------------

    if (
        autoAdjustmentResult === "なし"
    ) {
        if (
            emptyDays >= 30
        ) {
            return "img/result/30DaysLeft_0%.png";
        }

        if (
            emptyDays >= 7
        ) {
            return "img/result/7DaysLeft_0%.png";
        }

        return "img/result/0DaysLeft_0%.png";
    }


    return null;
}


// 結果コメントを表示 ----------------------------------------

function displayResultComment(
    resultData
) {
    if (
        !resultData
    ) {
        return;
    }

    const resultComment = document.getElementById("result-comment");

    if (
        !resultComment
    ) {
        return;
    }

    const imagePath = getResultCommentImage(
        resultData.emptyDays,
        resultData.autoAdjustmentResult,
        resultData.adjustmentRate
    );

    resultComment.innerHTML = "";

    if (
        !imagePath
    ) {
        return;
    }

    const image = document.createElement("img");
        
    image.src = imagePath;
    image.alt = "スケジュール結果";

    resultComment.appendChild(image);
}




// ========================================
// 結果② スケジュールカレンダー
// ========================================

let scheduleCalendarData = null;

let scheduleCalendarView = "horizontal";

let scheduleCalendarMonth = null;


// ----------------------------------------
// 日付をDateへ変換
// ----------------------------------------

function parseScheduleDate(dateString) {

    if (!dateString) {
        return null;
    }

    const [year, month, day] =
        dateString.split("-").map(Number);

    return new Date(
        year,
        month - 1,
        day
    );
}


// ----------------------------------------
// DateをYYYY-MM-DDへ変換
// ----------------------------------------

function formatScheduleDate(date) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ----------------------------------------
// 日付を1日進める
// ----------------------------------------

function addScheduleDay(date) {

    const nextDate =
        new Date(date);

    nextDate.setDate(
        nextDate.getDate() + 1
    );

    return nextDate;
}


// ----------------------------------------
// 日付が休日か判定
// ----------------------------------------

function isScheduleHoliday(
    dateString,
    holidays
) {

    if (!holidays) {
        return false;
    }

    return holidays.includes(
        dateString
    );
}


// ----------------------------------------
// 曜日
// ----------------------------------------

function getScheduleWeekday(date) {

    return date.getDay();

}


// ----------------------------------------
// 日付マスを作成
// ----------------------------------------

function createScheduleDayElement(
    date,
    data
) {

    const dateString =
        formatScheduleDate(date);

    const dayElement =
        document.createElement("div");

    dayElement.className =
        "schedule-day";


    // ------------------------------------
    // 作業期間外
    // ------------------------------------

    const startDate =
        parseScheduleDate(data.startDate);

    const deadline =
        parseScheduleDate(data.deadline);


    if (
        date < startDate ||
        date > deadline
    ) {
        dayElement.classList.add(
            "outside-period"
        );
    }


    // ------------------------------------
    // 休日
    // ------------------------------------

    if (
        isScheduleHoliday(
            dateString,
            data.holidays
        )
    ) {
        dayElement.classList.add(
            "holiday"
        );
    }


    // ------------------------------------
    // 日付
    // ------------------------------------

    const dayNumber =
        document.createElement("div");

    dayNumber.className =
        "schedule-day-number";

    dayNumber.textContent =
        date.getDate();


    // ------------------------------------
    // 月初
    // ------------------------------------

    if (
        date.getDate() === 1
    ) {

        dayElement.classList.add(
            "month-start"
        );

        // 月初の月表示用データ
        dayNumber.dataset.month =
            date.getMonth() + 1;
    }


    dayElement.appendChild(
        dayNumber
    );

    return dayElement;
}


// ----------------------------------------
// 横型カレンダー描画
// ----------------------------------------

function renderHorizontalScheduleCalendar() {

    const grid =
        document.getElementById(
            "schedule-calendar-grid"
        );

    const monthLabel =
        document.getElementById(
            "schedule-month"
        );


    if (
        !grid ||
        !monthLabel ||
        !scheduleCalendarData ||
        !scheduleCalendarMonth
    ) {
        return;
    }


    grid.innerHTML = "";


    const year =
        scheduleCalendarMonth.getFullYear();

    const month =
        scheduleCalendarMonth.getMonth();


    monthLabel.textContent =
        `${year}年${month + 1}月`;


    // 月初の日曜日

    const firstDay =
        new Date(
            year,
            month,
            1
        );

    const firstCalendarDate =
        new Date(firstDay);

    firstCalendarDate.setDate(
        firstDay.getDate() -
        firstDay.getDay()
    );


    // 月末の土曜日

    const lastDay =
        new Date(
            year,
            month + 1,
            0
        );

    const lastCalendarDate =
        new Date(lastDay);

    lastCalendarDate.setDate(
        lastDay.getDate() +
        (6 - lastDay.getDay())
    );


    let currentDate =
        new Date(firstCalendarDate);


    while (
        currentDate <= lastCalendarDate
    ) {

        const dayElement =
            createScheduleDayElement(
                currentDate,
                scheduleCalendarData
            );

        grid.appendChild(
            dayElement
        );

        currentDate =
            addScheduleDay(currentDate);
    }

}


// ----------------------------------------
// 縦型カレンダー描画
// ----------------------------------------

function renderVerticalScheduleCalendar() {

    const list =
        document.getElementById(
            "schedule-calendar-list"
        );


    if (
        !list ||
        !scheduleCalendarData
    ) {
        return;
    }


    list.innerHTML = "";


    const startDate =
        parseScheduleDate(
            scheduleCalendarData.startDate
        );

    const deadline =
        parseScheduleDate(
            scheduleCalendarData.deadline
        );


    if (
        !startDate ||
        !deadline
    ) {
        return;
    }


    let currentDate =
        new Date(startDate);


    // 開始日より前の曜日を埋める

    for (
        let i = 0;
        i < currentDate.getDay();
        i++
    ) {

        const emptyDay =
            document.createElement("div");

        emptyDay.className =
            "schedule-day outside-period";

        list.appendChild(
            emptyDay
        );
    }


    while (
        currentDate <= deadline
    ) {

        const dayElement =
            createScheduleDayElement(
                currentDate,
                scheduleCalendarData
            );

        list.appendChild(
            dayElement
        );

        currentDate =
            addScheduleDay(currentDate);
    }


    // 最終週を土曜日まで埋める

    const finalWeekday =
        deadline.getDay();

    if (
        finalWeekday < 6
    ) {

        for (
            let i = finalWeekday + 1;
            i <= 6;
            i++
        ) {

            const emptyDay =
                document.createElement("div");

            emptyDay.className =
                "schedule-day outside-period";

            list.appendChild(
                emptyDay
            );
        }
    }

}


// ----------------------------------------
// カレンダー表示
// ----------------------------------------

function renderScheduleCalendar() {

    if (
        scheduleCalendarView === "horizontal"
    ) {

        renderHorizontalScheduleCalendar();

        return;
    }


    renderVerticalScheduleCalendar();

}


// ----------------------------------------
// カレンダーデータを受け取る
// ----------------------------------------

function displayScheduleCalendar(
    resultData
) {

    if (
        !resultData
    ) {
        return;
    }


    scheduleCalendarData =
        resultData;


    const startDate =
        parseScheduleDate(
            resultData.startDate
        );


    if (!startDate) {
        return;
    }


    scheduleCalendarMonth =
        new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            1
        );


    renderScheduleCalendar();

}


// ----------------------------------------
// 横型 ↔ 縦型
// ----------------------------------------

function changeScheduleCalendar() {

    const horizontal =
        document.getElementById(
            "schedule-calendar-horizontal"
        );

    const vertical =
        document.getElementById(
            "schedule-calendar-vertical"
        );


    if (
        !horizontal ||
        !vertical
    ) {
        return;
    }


    if (
        scheduleCalendarView === "horizontal"
    ) {

        scheduleCalendarView =
            "vertical";

        horizontal.hidden =
            true;

        vertical.hidden =
            false;

    } else {

        scheduleCalendarView =
            "horizontal";

        horizontal.hidden =
            false;

        vertical.hidden =
            true;
    }


    renderScheduleCalendar();

}


// ----------------------------------------
// 前月
// ----------------------------------------

function showPreviousScheduleMonth() {

    if (
        !scheduleCalendarMonth
    ) {
        return;
    }


    scheduleCalendarMonth =
        new Date(
            scheduleCalendarMonth.getFullYear(),
            scheduleCalendarMonth.getMonth() - 1,
            1
        );


    renderHorizontalScheduleCalendar();

}


// ----------------------------------------
// 次月
// ----------------------------------------

function showNextScheduleMonth() {

    if (
        !scheduleCalendarMonth
    ) {
        return;
    }


    scheduleCalendarMonth =
        new Date(
            scheduleCalendarMonth.getFullYear(),
            scheduleCalendarMonth.getMonth() + 1,
            1
        );


    renderHorizontalScheduleCalendar();

}


// ----------------------------------------
// ボタン設定
// ----------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const changeButton =
            document.getElementById(
                "calendar-change"
            );

        const previousButton =
            document.getElementById(
                "schedule-prev"
            );

        const nextButton =
            document.getElementById(
                "schedule-next"
            );


        if (changeButton) {

            changeButton.addEventListener(
                "click",
                changeScheduleCalendar
            );

        }


        if (previousButton) {

            previousButton.addEventListener(
                "click",
                showPreviousScheduleMonth
            );

        }


        if (nextButton) {

            nextButton.addEventListener(
                "click",
                showNextScheduleMonth
            );

        }

    }
);
