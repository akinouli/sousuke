// ========================================
// Step.1
// 作業時間・活動時間を分数へ変換
// ========================================


// 時間・分 → 分数
function timeToMinutes(hours, minutes) {

    return hours * 60 + minutes;
}


// ----------------------------------------
// 制作工程 → 作業分数
// ----------------------------------------

function convertProductionWorkMinutes(processes, pageCount) {

    return processes.map(process => {

        const baseMinutes = timeToMinutes(
            process.hours,
            process.minutes
        );

        // ページ毎
        if (process.unit === "page") {
            return baseMinutes * pageCount;
        }

        // 全体
        return baseMinutes;
    });
}


// ----------------------------------------
// 仕立て工程 → 作業分数
// ----------------------------------------

function convertFinishingWorkMinutes(processes, pageCount) {

    return processes.map(process => {

        const baseMinutes = timeToMinutes(
            process.hours,
            process.minutes
        );

        // ページ毎
        if (process.unit === "page") {
            return baseMinutes * pageCount;
        }

        // 全体
        return baseMinutes;
    });
}


// ----------------------------------------
// 曜日別活動時間 → 活動分数
// ----------------------------------------

function convertActivityMinutes(activityTimes) {

    return activityTimes.map(day => {

        return timeToMinutes(
            day.hours,
            day.minutes
        );
    });
}


// ========================================
// Step.2
// 仮スケジュール作成
// ========================================


// 曜日の活動分数を取得
function getActivityMinutesForDate(date, activityMinutes) {

    const day = date.getDay();

    return activityMinutes[day];
}

// 日付比較
function isSameDate(dateA, dateB) {

    return (
        dateA.getFullYear() === dateB.getFullYear() &&
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getDate() === dateB.getDate()
    );
}

// 休日判定
function isHoliday(date, holidays) {

    return holidays.some(
        holiday => isSameDate(date, holiday)
    );
}

// 作業可能日判定
function isWorkableDate(date, activityMinutes, holidays) {

    const dailyMinutes =
        getActivityMinutesForDate(
            date,
            activityMinutes
        );

    if (dailyMinutes <= 0) {
        return false;
    }

    if (isHoliday(date, holidays)) {
        return false;
    }

    return true;
}

// スケジュール作成
function createDraftSchedule(
    processes,
    activityMinutes,
    holidays,
    startDate
) {

    const schedule = [];

    let currentDate = new Date(startDate);
    let remainingMinutes = 0;
    let processIndex = 0;

    while (processIndex < processes.length) {

        // 作業可能日まで進める
        while (
            !isWorkableDate(
                currentDate,
                activityMinutes,
                holidays
            )
        ) {

            currentDate.setDate(
                currentDate.getDate() + 1
            );
        }

        // 当日の活動分数
        const dailyMinutes =
            getActivityMinutesForDate(
                currentDate,
                activityMinutes
            );

        // 現在の工程
        const process = processes[processIndex];

        // 工程の残り作業分数
        if (remainingMinutes === 0) {
            remainingMinutes = process.minutes;
        }

        // 今日作業できる分数
        const workMinutes =
            Math.min(
                remainingMinutes,
                dailyMinutes
            );

        // スケジュールに追加
        schedule.push({

            date: new Date(currentDate),

            processName: process.name,

            minutes: workMinutes

        });

        remainingMinutes -= workMinutes;

        // 工程完了
        if (remainingMinutes === 0) {
            processIndex++;
        }

        // 次の日へ
        currentDate.setDate(
            currentDate.getDate() + 1
        );
    }

    return schedule;
}


// ========================================
// Step.3
// 自動調整チェック
// ========================================


// 最終作業終了日と締切日を比較
function isDeadlineMet(finalEndDate, deadline) {

    return finalEndDate <= deadline;
}


// ========================================
// Step.4
// 自動調整
// ========================================


// 調整対象の工程を取得
function getAdjustmentTargets(
    productionProcesses,
    finishingProcesses,
    productionSettings,
    finishingSettings
) {

    const targets = [];


    // 制作工程
    productionProcesses.forEach(
        (process, index) => {

            if (productionSettings[index]) {

                targets.push({
                    type: "production",
                    index: index,
                    name: process.name,
                    minutes: process.minutes,
                    autoAdjust: true
                });

            }

        }
    );


    // 仕立て工程
    finishingProcesses.forEach(
        (process, index) => {

            if (finishingSettings[index]) {

                targets.push({
                    type: "finishing",
                    index: index,
                    name: process.name,
                    minutes: process.minutes,
                    autoAdjust: true
                });

            }

        }
    );


    return targets;
}


// ----------------------------------------
// 全体の活動分数を取得
// ----------------------------------------

function calculateTotalActivityMinutes(
    schedule,
    activityMinutes,
    holidays
) {

    if (schedule.length === 0) {
        return 0;
    }


    const startDate =
        schedule[0].date;

    const endDate =
        schedule[
            schedule.length - 1
        ].date;


    let totalMinutes = 0;

    let currentDate =
        new Date(startDate);


    while (currentDate <= endDate) {

        if (
            isWorkableDate(
                currentDate,
                activityMinutes,
                holidays
            )
        ) {

            totalMinutes +=
                getActivityMinutesForDate(
                    currentDate,
                    activityMinutes
                );

        }


        currentDate.setDate(
            currentDate.getDate() + 1
        );

    }


    return totalMinutes;
}


// ----------------------------------------
// 全行程の作業分数を取得
// ----------------------------------------

function calculateTotalWorkMinutes(
    productionProcesses,
    finishingProcesses
) {

    const productionMinutes =
        productionProcesses.reduce(
            (total, process) => {

                return total + process.minutes;

            },
            0
        );


    const finishingMinutes =
        finishingProcesses.reduce(
            (total, process) => {

                return total + process.minutes;

            },
            0
        );


    return {

        productionMinutes: productionMinutes,

        finishingMinutes: finishingMinutes,

        totalMinutes:
            productionMinutes +
            finishingMinutes

    };
}