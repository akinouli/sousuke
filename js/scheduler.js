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


// ----------------------------------------
// 調整対象の作業分数を取得
// ----------------------------------------

function calculateAdjustableWorkMinutes(
    adjustmentTargets
) {

    return adjustmentTargets.reduce(
        (total, target) => {

            return total + target.minutes;

        },
        0
    );
}


// ----------------------------------------
// 調整用の活動分数を取得
// ----------------------------------------

function calculateAdjustableActivityMinutes(
    totalActivityMinutes,
    activityMinutes,
    hasFinishing,
    fixedWorkMinutes
) {

    let adjustableActivityMinutes =
        totalActivityMinutes;


    // 固定工程の作業時間を差し引く
    adjustableActivityMinutes -=
        fixedWorkMinutes;


    // 仕立てなし
    if (!hasFinishing) {
        return adjustableActivityMinutes;
    }


    // 作業可能日の最大活動分数を取得
    const maxDailyMinutes =
        Math.max(
            ...activityMinutes.filter(
                minutes => minutes > 0
            )
        );


    // 最大1日分を差し引く
    adjustableActivityMinutes -=
        maxDailyMinutes;


    return adjustableActivityMinutes;
}


// ----------------------------------------
// 調整率を取得
// ----------------------------------------

function calculateAdjustmentRate(
    adjustableActivityMinutes,
    adjustableWorkMinutes
) {

    if (adjustableWorkMinutes <= 0) {
        return 1;
    }


    return (
        adjustableActivityMinutes /
        adjustableWorkMinutes
    );
}


// ----------------------------------------
// 工程の作業分数を調整
// ----------------------------------------

function calculateAdjustmentMinutes(
    targets,
    adjustmentRate
) {

    return targets.map(target => {

        const adjustmentMinutes =
            target.autoAdjust
                ? Math.floor(
                    target.minutes *
                    adjustmentRate
                )
                : target.minutes;

        return {
            ...target,
            adjustmentMinutes: adjustmentMinutes
        };

    });
}


// ----------------------------------------
// 調整後の工程データを作成
// ----------------------------------------

function applyAdjustmentMinutes(
    processes,
    targets,
    type
) {

    return processes.map(
        (process, index) => {

            const target =
                targets.find(
                    target =>
                        target.type === type &&
                        target.index === index
                );


            // 調整対象ではない工程
            if (!target) {

                return {
                    ...process
                };

            }


            // 調整対象の工程
            return {
                ...process,
                minutes: target.adjustmentMinutes
            };

        }
    );
}


// ----------------------------------------
// 調整後のスケジュールを作成
// ----------------------------------------

function createAdjustedSchedule(
    productionProcesses,
    finishingProcesses,
    adjustedTargets,
    activityMinutes,
    holidays,
    startDate
) {

    // ----------------------------------------
    // 制作工程
    // ----------------------------------------

    const adjustedProductionProcesses =
        applyAdjustmentMinutes(
            productionProcesses,
            adjustedTargets,
            "production"
        );


    const productionSchedule =
        createDraftSchedule(
            adjustedProductionProcesses,
            activityMinutes,
            holidays,
            startDate
        );


    // ----------------------------------------
    // 仕立て工程
    // ----------------------------------------

    let finishingSchedule = [];


    if (finishingProcesses.length > 0) {

        const finishingStartDate =
            new Date(
                productionSchedule[
                    productionSchedule.length - 1
                ].date
            );


        finishingStartDate.setDate(
            finishingStartDate.getDate() + 1
        );


        const adjustedFinishingProcesses =
            applyAdjustmentMinutes(
                finishingProcesses,
                adjustedTargets,
                "finishing"
            );


        finishingSchedule =
            createDraftSchedule(
                adjustedFinishingProcesses,
                activityMinutes,
                holidays,
                finishingStartDate
            );

    }


    return {
        productionSchedule: productionSchedule,
        finishingSchedule: finishingSchedule,

        schedule: [
            ...productionSchedule,
            ...finishingSchedule
        ]
    };
}


// ----------------------------------------
// 自動調整後の締切判定
// ----------------------------------------

function checkAdjustedDeadline(
    adjustedSchedule,
    deadline
) {

    if (adjustedSchedule.length === 0) {

        return {
            isMet: false,
            finalEndDate: null
        };

    }


    const finalEndDate =
        adjustedSchedule[
            adjustedSchedule.length - 1
        ].date;


    return {

        isMet:
            isDeadlineMet(
                finalEndDate,
                deadline
            ),

        finalEndDate: finalEndDate

    };
}


// ----------------------------------------
// 自動調整設定を全てONにする
// ----------------------------------------

function enableAllAutoAdjust(
    productionProcesses,
    finishingProcesses
) {

    const productionSettings =
        productionProcesses.map(() => true);


    const finishingSettings =
        finishingProcesses.map(() => true);


    return {
        productionSettings:
            productionSettings,

        finishingSettings:
            finishingSettings
    };
}


// ----------------------------------------
// 自動調整設定が全てONか判定
// ----------------------------------------

function areAllAutoAdjustEnabled(
    productionSettings,
    finishingSettings
) {

    const allSettings = [
        ...productionSettings,
        ...finishingSettings
    ];


    return (
        allSettings.length > 0 &&
        allSettings.every(
            setting => setting === true
        )
    );
}


// ----------------------------------------
// 自動調整設定が全てOFFか判定
// ----------------------------------------

function areAllAutoAdjustDisabled(
    productionSettings,
    finishingSettings
) {

    const allSettings = [
        ...productionSettings,
        ...finishingSettings
    ];


    return (
        allSettings.length > 0 &&
        allSettings.every(
            setting => setting === false
        )
    );
}