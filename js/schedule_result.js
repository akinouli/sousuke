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

function parseScheduleDate(dateValue) {

    if (!dateValue) {
        return null;
    }


    // Dateオブジェクトの場合
    if (
        dateValue instanceof Date
    ) {
        return new Date(dateValue);
    }


    // 文字列の場合
    if (
        typeof dateValue === "string"
    ) {

        const [year, month, day] =
            dateValue.split("-").map(Number);

        return new Date(
            year,
            month - 1,
            day
        );
    }


    return null;
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
// カレンダーの週を作成
// ----------------------------------------

function createScheduleWeeks(
    startDate,
    deadline
) {

    const weeks = [];

    // 作業開始日を含む週の日曜日
    const firstWeekStart =
        new Date(startDate);

    firstWeekStart.setDate(
        firstWeekStart.getDate() -
        firstWeekStart.getDay()
    );


    // 締切日を含む週の土曜日
    const lastWeekEnd =
        new Date(deadline);

    lastWeekEnd.setDate(
        lastWeekEnd.getDate() +
        (6 - lastWeekEnd.getDay())
    );


    let weekStart =
        new Date(firstWeekStart);


    while (
        weekStart <= lastWeekEnd
    ) {

        const week = [];


        // 1週間 = 7日
        for (
            let i = 0;
            i < 7;
            i++
        ) {

            const date =
                new Date(weekStart);

            date.setDate(
                weekStart.getDate() + i
            );

            week.push(date);
        }


        weeks.push(week);


        // 次の週へ
        weekStart.setDate(
            weekStart.getDate() + 7
        );
    }


    return weeks;
}


// ----------------------------------------
// 曜日ヘッダーを作成
// ----------------------------------------

function createScheduleWeekdayHeader() {

    const header =
        document.createElement("div");

    header.className =
        "schedule-week-header";


    const weekdays = [
        "日",
        "月",
        "火",
        "水",
        "木",
        "金",
        "土"
    ];


    weekdays.forEach(
        weekday => {

            const day =
                document.createElement("span");

            day.textContent =
                weekday;

            header.appendChild(day);
        }
    );


    return header;
}


// ----------------------------------------
// カレンダーアイコンを作成
// ----------------------------------------

function createScheduleIcon(
    src,
    alt
) {

    const icon =
        document.createElement("img");

    icon.src = src;
    icon.alt = alt;

    icon.className =
        "schedule-day-icon";

    return icon;
}


// ----------------------------------------
// カレンダーアイコンを追加
// ----------------------------------------

function addScheduleIcons(
    dayElement,
    date,
    data
) {

    const dateString =
        formatScheduleDate(date);

    const startDate =
        parseScheduleDate(
            data.startDate
        );

    const completionDate =
        parseScheduleDate(
            data.completionDate
        );

    const deadline =
        parseScheduleDate(
            data.deadline
        );


    // アイコンエリア
    const iconArea =
        document.createElement("div");

    iconArea.className =
        "schedule-day-icons";


    // 作業開始日
    if (
        startDate &&
        date.getTime() === startDate.getTime()
    ) {

        iconArea.appendChild(
            createScheduleIcon(
                "icon/cal1_start.png",
                "作業開始日"
            )
        );
    }


    // 作品完成日
    if (
        completionDate &&
        date.getTime() === completionDate.getTime()
    ) {

        iconArea.appendChild(
            createScheduleIcon(
                "icon/cal2_completed.png",
                "作品完成日"
            )
        );
    }


    // 締切日
    if (
        deadline &&
        date.getTime() === deadline.getTime()
    ) {

        iconArea.appendChild(
            createScheduleIcon(
                "icon/cal3_deadline.png",
                "締切日"
            )
        );
    }


    // 休日
    if (
        isScheduleHoliday(
            dateString,
            data.holidays
        )
    ) {

        iconArea.appendChild(
            createScheduleIcon(
                "icon/cal4_holiday.png",
                "休日"
            )
        );
    }


    // アイコンが1つ以上ある場合だけ追加
    if (
        iconArea.children.length > 0
    ) {

        dayElement.appendChild(
            iconArea
        );
    }
}






// ----------------------------------------
// 日付マスを作成
// ----------------------------------------

function createScheduleDayElement(
    date,
    data,
    displayStartDate
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
        parseScheduleDate(
            data.startDate
        );

    const deadline =
        parseScheduleDate(
            data.deadline
        );


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


    const isDisplayStart =
        displayStartDate &&
        date.getTime() ===
        displayStartDate.getTime();

    const isMonthStart =
        date.getDate() === 1;


    if (
        isDisplayStart ||
        isMonthStart
    ) {

        dayNumber.textContent =
            `${date.getMonth() + 1}/${date.getDate()}`;

    } else {

        dayNumber.textContent =
            date.getDate();
    }


    // 月初の情報
    if (
        isMonthStart
    ) {

        dayElement.classList.add(
            "month-start"
        );
    }


    dayElement.appendChild(
        dayNumber
    );


    // カレンダーアイコン
    addScheduleIcons(
        dayElement,
        date,
        data
    );


    return dayElement;
}


// ----------------------------------------
// 行程一覧を取得
// ----------------------------------------

function getScheduleProcessList(data) {

    return [
        ...(data.productionSchedule || []),
        ...(data.finishingSchedule || [])
    ];
}


// ----------------------------------------
// 週内の行程を取得
// ----------------------------------------

function getScheduleWeekProcesses(
    week,
    data
) {

    const weekStart = week[0];
    const weekEnd = week[6];

    return getScheduleProcessList(data).filter(
        process => {

            const startDate =
                parseScheduleDate(
                    process.startDate
                );

            const endDate =
                parseScheduleDate(
                    process.endDate
                );

            if (
                !startDate ||
                !endDate
            ) {
                return false;
            }

            return (
                endDate >= weekStart &&
                startDate <= weekEnd
            );
        }
    );
}


// ----------------------------------------
// 行程をレーンに振り分け
// ----------------------------------------
//
// 必要な数だけレーンを自動追加
//

function assignScheduleProcessLanes(
    processes
) {

    const laneEndDates = [];


    return processes.map(
        process => {

            const startDate =
                parseScheduleDate(
                    process.startDate
                );

            const endDate =
                parseScheduleDate(
                    process.endDate
                );


            // --------------------------------
            // 空いているレーンを探す
            // --------------------------------

            let lane = -1;


            for (
                let i = 0;
                i < laneEndDates.length;
                i++
            ) {

                // 同じ終了日から始まる工程は
                // 重なるものとして扱う
                if (
                    startDate > laneEndDates[i]
                ) {

                    lane = i;

                    break;
                }
            }


            // --------------------------------
            // 空きレーンがなければ新規追加
            // --------------------------------

            if (
                lane === -1
            ) {

                lane =
                    laneEndDates.length;

                laneEndDates.push(
                    endDate
                );

            } else {

                laneEndDates[lane] =
                    endDate;
            }


            return lane;
        }
    );
}


// ----------------------------------------
// 行程表示を作成
// ----------------------------------------

function createScheduleProcessRow(
    week,
    process,
    lane
) {

    const startDate =
        parseScheduleDate(
            process.startDate
        );

    const endDate =
        parseScheduleDate(
            process.endDate
        );

    if (
        !startDate ||
        !endDate
    ) {
        return null;
    }


    const weekStart = week[0];
    const weekEnd = week[6];


    // ------------------------------------
    // この週に存在しない行程
    // ------------------------------------

    if (
        endDate < weekStart ||
        startDate > weekEnd
    ) {
        return null;
    }


    // ------------------------------------
    // この週での表示開始日
    // ------------------------------------
    //
    // 最初の週
    // → 実際の開始日
    //
    // 週を跨いだ続き
    // → 日曜日
    //

    const displayStart =
        startDate > weekStart
            ? startDate
            : weekStart;


    // ------------------------------------
    // この週での表示終了日
    // ------------------------------------
    //
    // 最終週
    // → 実際の終了日
    //
    // それ以前の週
    // → 土曜日
    //

    const displayEnd =
        endDate < weekEnd
            ? endDate
            : weekEnd;


    // ------------------------------------
    // 工程名の開始曜日
    // ------------------------------------

    const nameColumn =
        displayStart.getDay();


    // ------------------------------------
    // → の終了曜日
    // ------------------------------------

    const arrowColumn =
        displayEnd.getDay();


    // ------------------------------------
    // 行程表示
    // ------------------------------------

    const row =
        document.createElement("div");

    row.className =
        "schedule-process-row";


    // ------------------------------------
    // 作業期間内だけを表示範囲にする
    // ------------------------------------

    row.style.gridColumn =
        `${nameColumn + 1} / ${arrowColumn + 2}`;


    // ------------------------------------
    // 2レーン
    // ------------------------------------

    row.style.gridRow =
        `${lane + 1}`;


    // ------------------------------------
    // 工程名
    // ------------------------------------

    const name =
        document.createElement("span");

    name.className =
        "schedule-process-name";

    name.textContent =
        process.name;


    // ------------------------------------
    // 一本線
    // ------------------------------------

    const line =
        document.createElement("span");

    line.className =
        "schedule-process-line";


    // ------------------------------------
    // CSS三角の矢印
    // ------------------------------------

    const arrow =
        document.createElement("span");

    arrow.className =
        "schedule-process-arrow";


    row.appendChild(name);
    row.appendChild(line);
    row.appendChild(arrow);


    return row;
}


// ----------------------------------------
// 週をカレンダーへ追加
// ----------------------------------------

function appendScheduleWeek(
    container,
    week,
    data,
    displayStartDate
) {

    // ------------------------------------
    // 週全体
    // ------------------------------------

    const weekGrid =
        document.createElement("div");

    weekGrid.className =
        "schedule-week-grid";


    // ------------------------------------
    // 日付マス
    // ------------------------------------

    week.forEach(
        date => {

            const dayElement =
                createScheduleDayElement(
                    date,
                    data,
                    displayStartDate
                );

            weekGrid.appendChild(
                dayElement
            );
        }
    );


    // ------------------------------------
    // この週の行程
    // ------------------------------------

    const processes =
        getScheduleWeekProcesses(
            week,
            data
        );


    // ------------------------------------
    // 2レーンへ振り分け
    // ------------------------------------

    const lanes =
        assignScheduleProcessLanes(
            processes
        );


    // ------------------------------------
    // 行程表示レイヤー
    // ------------------------------------

    const processLayer =
        document.createElement("div");

    processLayer.className =
        "schedule-process-layer";


    processes.forEach(
        (process, index) => {

            const processRow =
                createScheduleProcessRow(
                    week,
                    process,
                    lanes[index]
                );

            if (
                processRow
            ) {
                processLayer.appendChild(
                    processRow
                );
            }
        }
    );


    weekGrid.appendChild(
        processLayer
    );


    // ------------------------------------
    // カレンダーへ追加
    // ------------------------------------

    container.appendChild(
        weekGrid
    );
}


// ----------------------------------------
// 横型カレンダー描画
// ----------------------------------------

function renderHorizontalScheduleCalendar() {

    const view =
        document.getElementById(
            "schedule-calendar-horizontal"
        );

    const grid =
        document.getElementById(
            "schedule-calendar-grid"
        );

    const monthLabel =
        document.getElementById(
            "schedule-month"
        );


    if (
        !view ||
        !grid ||
        !monthLabel ||
        !scheduleCalendarData ||
        !scheduleCalendarMonth
    ) {

        return;
    }


    // 曜日ヘッダーを作り直す
    const oldHeader =
        view.querySelector(
            ".schedule-week-header"
        );

    if (oldHeader) {
        oldHeader.remove();
    }


    const weekdayHeader =
        createScheduleWeekdayHeader();

    view.insertBefore(
        weekdayHeader,
        grid
    );


    grid.innerHTML = "";








    const year =
        scheduleCalendarMonth.getFullYear();

    const month =
        scheduleCalendarMonth.getMonth();


    monthLabel.textContent =
        `${year}年${month + 1}月`;


    const weeks =
        createScheduleWeeks(
            parseScheduleDate(
                scheduleCalendarData.startDate
            ),
            parseScheduleDate(
                scheduleCalendarData.deadline
            )
        );

    
    

    // 現在の月に関係する週だけ表示
    let isFirstDisplayedWeek = true;

    weeks.forEach(
        week => {

            const includesCurrentMonth =
                week.some(
                    date =>
                        date.getFullYear() === year &&
                        date.getMonth() === month
                );


            if (
                includesCurrentMonth
            ) {

                appendScheduleWeek(
                    grid,
                    week,
                    scheduleCalendarData,
                    isFirstDisplayedWeek
                        ? week[0]
                        : null
                );

                isFirstDisplayedWeek = false;
            }
        }
    );
}


// ----------------------------------------
// 縦型カレンダー描画
// ----------------------------------------

function renderVerticalScheduleCalendar() {

    const view =
        document.getElementById(
            "schedule-calendar-vertical"
        );

    const list =
        document.getElementById(
            "schedule-calendar-list"
        );


    if (
        !view ||
        !list ||
        !scheduleCalendarData
    ) {

        return;
    }


    // 曜日ヘッダーを作り直す
    const oldHeader =
        view.querySelector(
            ".schedule-week-header"
        );

    if (oldHeader) {
        oldHeader.remove();
    }


    const weekdayHeader =
        createScheduleWeekdayHeader();

    view.insertBefore(
        weekdayHeader,
        list
    );


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


    const weeks =
        createScheduleWeeks(
            startDate,
            deadline
        );


    // 作業期間に関係する週をすべて表示
    weeks.forEach(
        (week, index) => {

            appendScheduleWeek(
                list,
                week,
                scheduleCalendarData,
                index === 0
                    ? week[0]
                    : null
            );
        }
    );
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


    if (
        !startDate
    ) {

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
        !scheduleCalendarMonth ||
        !scheduleCalendarData
    ) {

        return;
    }


    const startDate =
        parseScheduleDate(
            scheduleCalendarData.startDate
        );

    const deadline =
        parseScheduleDate(
            scheduleCalendarData.deadline
        );


    const previousMonth =
        new Date(
            scheduleCalendarMonth.getFullYear(),
            scheduleCalendarMonth.getMonth() - 1,
            1
        );


    // 作業開始月より前には移動しない
    if (
        previousMonth <
        new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            1
        )
    ) {

        return;
    }


    scheduleCalendarMonth =
        previousMonth;

    renderHorizontalScheduleCalendar();
}


// ----------------------------------------
// 次月
// ----------------------------------------

function showNextScheduleMonth() {

    if (
        !scheduleCalendarMonth ||
        !scheduleCalendarData
    ) {

        return;
    }


    const startDate =
        parseScheduleDate(
            scheduleCalendarData.startDate
        );

    const deadline =
        parseScheduleDate(
            scheduleCalendarData.deadline
        );


    const nextMonth =
        new Date(
            scheduleCalendarMonth.getFullYear(),
            scheduleCalendarMonth.getMonth() + 1,
            1
        );


    // 締切月より後には移動しない
    if (
        nextMonth >
        new Date(
            deadline.getFullYear(),
            deadline.getMonth(),
            1
        )
    ) {

        return;
    }


    scheduleCalendarMonth =
        nextMonth;

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
