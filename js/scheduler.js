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
    let remainingDailyMinutes = 0;

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

        // 新しい作業可能日に入ったら
        // 当日の活動分数を設定
        if (remainingDailyMinutes === 0) {

            remainingDailyMinutes =
                getActivityMinutesForDate(
                    currentDate,
                    activityMinutes
                );
        }

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
                remainingDailyMinutes
            );

        // スケジュールに追加
        schedule.push({

            date: new Date(currentDate),

            processName: process.name,

            minutes: workMinutes

        });

        remainingMinutes -= workMinutes;
        remainingDailyMinutes -= workMinutes;

        // 工程完了
        if (remainingMinutes === 0) {

            processIndex++;

            // 当日の活動時間が残っていれば
            // 次の工程へそのまま進む
            if (
                processIndex < processes.length &&
                remainingDailyMinutes > 0
            ) {
                continue;
            }
        }

        // 次の日へ
        currentDate.setDate(
            currentDate.getDate() + 1
        );

        // 翌日に入ったら
        // 活動分数を再取得する
        remainingDailyMinutes = 0;
    }

    return schedule;
}


// ========================================
// Step.3
// 締切判定
// ========================================


// 最終作業終了日と締切日を比較
function isDeadlineMet(finalEndDate, deadline) {

    return finalEndDate <= deadline;
}


// ========================================
// Step.4
// 自動調整
// ========================================


// ----------------------------------------
// Step.4-①
// 調整対象を決定
// ----------------------------------------

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


// 全工程を調整対象にする
function enableAllAutoAdjust(
    productionProcesses,
    finishingProcesses
) {

    return {

        productionSettings:
            productionProcesses.map(
                () => true
            ),

        finishingSettings:
            finishingProcesses.map(
                () => true
            )

    };
}


// ----------------------------------------
// Step.4-②
// 調整対象・調整対象外の作業分数を算出
// ----------------------------------------

function calculateWorkMinutes(
    productionProcesses,
    finishingProcesses,
    adjustmentTargets
) {

    let adjustableMinutes = 0;
    let fixedMinutes = 0;


    // 制作工程
    productionProcesses.forEach(
        (process, index) => {

            const target =
                adjustmentTargets.find(
                    target =>
                        target.type === "production" &&
                        target.index === index
                );


            if (target) {

                adjustableMinutes +=
                    process.minutes;

            } else {

                fixedMinutes +=
                    process.minutes;

            }

        }
    );


    // 仕立て工程
    finishingProcesses.forEach(
        (process, index) => {

            const target =
                adjustmentTargets.find(
                    target =>
                        target.type === "finishing" &&
                        target.index === index
                );


            if (target) {

                adjustableMinutes +=
                    process.minutes;

            } else {

                fixedMinutes +=
                    process.minutes;

            }

        }
    );


    return {

        adjustableMinutes:
            adjustableMinutes,

        fixedMinutes:
            fixedMinutes

    };
}


// ----------------------------------------
// Step.4-③
// 全体の活動分数を算出
// ----------------------------------------

function calculateTotalActivityMinutes(
    startDate,
    deadline,
    activityMinutes,
    holidays
) {

    if (
        !startDate ||
        !deadline
    ) {
        return 0;
    }


    let totalMinutes = 0;

    let currentDate =
        new Date(startDate);


    while (currentDate <= deadline) {

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
// Step.4-④
// 調整対象の活動分数を算出
// ----------------------------------------

function calculateMaxActivityMinutes(
    activityMinutes,
    hasFinishing
) {

    if (!hasFinishing) {
        return 0;
    }


    const workableMinutes =
        activityMinutes.filter(
            minutes => minutes > 0
        );


    if (workableMinutes.length === 0) {
        return 0;
    }


    return Math.max(
        ...workableMinutes
    );
}


function calculateAdjustableActivityMinutes(
    totalActivityMinutes,
    fixedMinutes,
    maxActivityMinutes
) {

    return (
        totalActivityMinutes -
        fixedMinutes -
        maxActivityMinutes
    );
}


// ----------------------------------------
// Step.4-⑤
// 調整率を算出
// ----------------------------------------

function calculateAdjustmentRate(
    adjustableActivityMinutes,
    adjustableWorkMinutes
) {

    if (adjustableWorkMinutes <= 0) {
        return 1;
    }


    return(
        (adjustableActivityMinutes /
            adjustableWorkMinutes)
    )
}


// ----------------------------------------
// Step.4-⑥
// 調整作業分数を算出
// ----------------------------------------

function calculateAdjustmentMinutes(
    targets,
    adjustmentRate
) {

    return targets.map(
        target => {

            const adjustmentMinutes =
                Math.floor(
                    target.minutes *
                    adjustmentRate
                );


            return {

                ...target,

                adjustmentMinutes:
                    adjustmentMinutes

            };

        }
    );
}


// ----------------------------------------
// Step.4-⑦
// 再スケジューリング
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


            // 調整対象外
            if (!target) {

                return {
                    ...process
                };

            }


            // 調整対象
            return {

                ...process,

                minutes:
                    target.adjustmentMinutes

            };

        }
    );
}


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

        const completionDate =
            productionSchedule.length > 0
                ? productionSchedule[
                    productionSchedule.length - 1
                ].date
                : null;


        const finishingStartDate =
            completionDate
                ? new Date(completionDate)
                : new Date(startDate);


        if (completionDate) {

            finishingStartDate.setDate(
                finishingStartDate.getDate() + 1
            );

        }


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

        productionSchedule:
            productionSchedule,

        finishingSchedule:
            finishingSchedule,

        schedule: [
            ...productionSchedule,
            ...finishingSchedule
        ]

    };
}


// ----------------------------------------
// Step.4-⑧
// 締切判定
// ----------------------------------------

function checkAdjustedDeadline(
    adjustedSchedule,
    deadline
) {

    if (
        adjustedSchedule.length === 0
    ) {

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

        finalEndDate:
            finalEndDate

    };
}


// ----------------------------------------
// 自動調整を1回実行
// ----------------------------------------

function runAutoAdjustment(
    productionProcesses,
    finishingProcesses,
    activityMinutes,
    holidays,
    startDate,
    deadline,
    hasFinishing,
    adjustAll
) {

    // ----------------------------------------
    // Step.4-①
    // 調整対象を決定
    // ----------------------------------------

    let productionSettings =
        productionProcesses.map(
            process =>
                adjustAll
                    ? true
                    : process.autoAdjust
        );


    let finishingSettings =
        finishingProcesses.map(
            process =>
                adjustAll
                    ? true
                    : process.autoAdjust
        );


    const adjustmentTargets =
        getAdjustmentTargets(
            productionProcesses,
            finishingProcesses,
            productionSettings,
            finishingSettings
        );


    // ----------------------------------------
    // Step.4-②
    // 調整対象・対象外の作業分数
    // ----------------------------------------

    const workMinutes =
        calculateWorkMinutes(
            productionProcesses,
            finishingProcesses,
            adjustmentTargets
        );


    // ----------------------------------------
    // Step.4-③
    // 全体の活動分数
    // ----------------------------------------

    const totalActivityMinutes =
        calculateTotalActivityMinutes(
            startDate,
            deadline,
            activityMinutes,
            holidays
        );


    // ----------------------------------------
    // Step.4-④
    // 調整対象の活動分数
    // ----------------------------------------

    const maxActivityMinutes =
        calculateMaxActivityMinutes(
            activityMinutes,
            hasFinishing
        );


    const adjustableActivityMinutes =
        calculateAdjustableActivityMinutes(
            totalActivityMinutes,
            workMinutes.fixedMinutes,
            maxActivityMinutes
        );


    // ----------------------------------------
    // Step.4-⑤
    // 調整率
    // ----------------------------------------

    const adjustmentRate =
        calculateAdjustmentRate(
            adjustableActivityMinutes,
            workMinutes.adjustableMinutes
        );


    // ----------------------------------------
    // Step.4-⑥
    // 調整作業分数
    // ----------------------------------------

    const adjustedTargets =
        calculateAdjustmentMinutes(
            adjustmentTargets,
            adjustmentRate
        );


    // ----------------------------------------
    // Step.4-⑦
    // 再スケジューリング
    // ----------------------------------------

    const adjustedSchedule =
        createAdjustedSchedule(
            productionProcesses,
            finishingProcesses,
            adjustedTargets,
            activityMinutes,
            holidays,
            startDate
        );


    // ----------------------------------------
    // Step.4-⑧
    // 締切判定
    // ----------------------------------------

    const adjustedDeadline =
        checkAdjustedDeadline(
            adjustedSchedule.schedule,
            deadline
        );


    return {

        adjustAll:

            adjustAll,

        productionSettings:

            productionSettings,

        finishingSettings:

            finishingSettings,

        adjustmentTargets:

            adjustmentTargets,

        workMinutes:

            workMinutes,

        totalActivityMinutes:

            totalActivityMinutes,

        maxActivityMinutes:

            maxActivityMinutes,

        adjustableActivityMinutes:

            adjustableActivityMinutes,

        adjustmentRate:

            adjustmentRate,

        adjustedTargets:

            adjustedTargets,

        adjustedSchedule:

            adjustedSchedule,

        adjustedDeadline:

            adjustedDeadline

    };
}


// ----------------------------------------
// 自動調整全体
// ----------------------------------------

function calculateAutoAdjustment(
    productionProcesses,
    finishingProcesses,
    activityMinutes,
    holidays,
    startDate,
    deadline,
    hasFinishing
) {

    // ----------------------------------------
    // まず一部調整
    // adjustAll = false
    // ----------------------------------------

    let result =
        runAutoAdjustment(
            productionProcesses,
            finishingProcesses,
            activityMinutes,
            holidays,
            startDate,
            deadline,
            hasFinishing,
            false
        );


    // ----------------------------------------
    // Step.4-⑧
    // 締切判定
    // ----------------------------------------

    if (
        result.adjustedDeadline.isMet
    ) {

        return {

            ...result,

            autoAdjustmentResult:
                "一部",

            nextStep:
                "Step.5へ"

        };

    }


    // ----------------------------------------
    // 全行程調整へ切り替え
    // ----------------------------------------

    result =
        runAutoAdjustment(
            productionProcesses,
            finishingProcesses,
            activityMinutes,
            holidays,
            startDate,
            deadline,
            hasFinishing,
            true
        );


    // ----------------------------------------
    // 全行程調整後の締切判定
    // ----------------------------------------

    if (
        result.adjustedDeadline.isMet
    ) {

        return {

            ...result,

            autoAdjustmentResult:
                "全て",

            nextStep:
                "Step.5へ"

        };

    }


    // ----------------------------------------
    // 成立不能
    // ----------------------------------------

    return {

        ...result,

        autoAdjustmentResult:
            "全て",

        nextStep:
            "成立不能"

    };
}


// ========================================
// Step.5
// スケジュール確定用データを作成
// ========================================


// ----------------------------------------
// 作業分数 → 時間・分へ変換
// ----------------------------------------

function minutesToTime(
    minutes,
    unit,
    pageCount
) {

    let displayMinutes = minutes;

    // ページ毎
    if (
        unit === "page" &&
        pageCount > 0
    ) {

        displayMinutes =
            Math.floor(
                minutes / pageCount
            );

    }

    const hours =
        Math.floor(
            displayMinutes / 60
        );

    const remainingMinutes =
        displayMinutes % 60;

    return {
        hours: hours,
        minutes: remainingMinutes
    };
}


// ----------------------------------------
// 作業時間を表示用データへ変換
// ----------------------------------------

function createDisplayWorkTime(
    process,
    minutes,
    pageCount
) {

    const time =
        minutesToTime(
            minutes,
            process.unit,
            pageCount
        );

    return {

        unit:
            process.unit,

        hours:
            time.hours,

        minutes:
            time.minutes

    };
}


// ----------------------------------------
// 工程リストを表示用データへ変換
// ----------------------------------------

function createDisplayProcessList(
    processes,
    adjustedTargets,
    type,
    pageCount
) {

    return processes.map(
        (process, index) => {

            const target =
                adjustedTargets.find(
                    target =>
                        target.type === type &&
                        target.index === index
                );

            const adjustedMinutes =
                target
                    ? target.adjustmentMinutes
                    : process.minutes;

            return {

                name:
                    process.name,

                workTime:
                    createDisplayWorkTime(
                        process,
                        process.minutes,
                        pageCount
                    ),

                adjustedWorkTime:
                    createDisplayWorkTime(
                        process,
                        adjustedMinutes,
                        pageCount
                    )

            };

        }
    );
}


// ----------------------------------------
// スケジュールを行程ごとにまとめる
// ----------------------------------------

function createDisplaySchedule(
    schedule
) {

    const result = [];

    let currentProcess = null;

    schedule.forEach(
        item => {

            if (
                !currentProcess ||
                currentProcess.name !== item.processName
            ) {

                if (currentProcess) {
                    result.push(currentProcess);
                }

                currentProcess = {

                    name:
                        item.processName,

                    startDate:
                        new Date(item.date),

                    endDate:
                        new Date(item.date)

                };

                return;
            }

            currentProcess.endDate =
                new Date(item.date);

        }
    );

    if (currentProcess) {
        result.push(currentProcess);
    }

    return result;
}


// ----------------------------------------
// 空き日数を算出
// ----------------------------------------

function calculateEmptyDays(
    finalEndDate,
    deadline
) {

    if (
        !finalEndDate ||
        !deadline
    ) {
        return 0;
    }

    const millisecondsPerDay =
        1000 * 60 * 60 * 24;

    return Math.max(
        0,
        Math.floor(
            (
                deadline -
                finalEndDate
            ) / millisecondsPerDay
        )
    );
}


// ----------------------------------------
// 自動調整結果を判定
// ----------------------------------------

function getAutoAdjustmentResult(
    step4Data
) {

    if (!step4Data) {
        return "なし";
    }

    return step4Data.autoAdjustmentResult || "なし";
}


// ----------------------------------------
// 調整率を表示用％へ変換
// ----------------------------------------

function formatAdjustmentRate(
    adjustmentRate
) {

    if (
        typeof adjustmentRate !== "number"
    ) {
        return null;
    }

    return adjustmentRate * 100;
}


// ----------------------------------------
// Step.5 表示用データを作成
// ----------------------------------------

function createFinalDisplayData(
    data,
    step1Data,
    step2Data,
    step4Data
) {

    // Step.4で再調整した場合
    const finalSchedule =
        step4Data &&
        step4Data.adjustedDeadline &&
        step4Data.adjustedDeadline.isMet

            ? step4Data.adjustedSchedule

            : step2Data;


    const finalProductionSchedule =
        finalSchedule.productionSchedule || [];

    const finalFinishingSchedule =
        finalSchedule.finishingSchedule || [];

    const finalFullSchedule =
        finalSchedule.schedule ||
        [
            ...finalProductionSchedule,
            ...finalFinishingSchedule
        ];


    // ----------------------------------------
    // 最終日
    // ----------------------------------------

    const finalCompletionDate =
        finalProductionSchedule.length > 0

            ? finalProductionSchedule[
                finalProductionSchedule.length - 1
            ].date

            : null;

    const finalEndDate =
        finalFullSchedule.length > 0

            ? finalFullSchedule[
                finalFullSchedule.length - 1
            ].date

            : null;


    // ----------------------------------------
    // 自動調整結果
    // ----------------------------------------

    const autoAdjustmentResult =
        getAutoAdjustmentResult(
            step4Data
        );


    // ----------------------------------------
    // 調整率
    // ----------------------------------------

    const adjustmentRate =
        step4Data &&
        typeof step4Data.adjustmentRate === "number"

            ? formatAdjustmentRate(
                step4Data.adjustmentRate
            )

            : null;


    // ----------------------------------------
    // 工程リスト
    // ----------------------------------------

    const productionProcessList =
        createDisplayProcessList(
            step1Data.productionProcesses,
            step4Data
                ? step4Data.adjustedTargets
                : [],
            "production",
            data.pageCount
        );

    const finishingProcessList =
        createDisplayProcessList(
            step1Data.finishingProcesses,
            step4Data
                ? step4Data.adjustedTargets
                : [],
            "finishing",
            data.pageCount
        );


    // ----------------------------------------
    // スケジュール
    // ----------------------------------------

    const productionSchedule =
        createDisplaySchedule(
            finalProductionSchedule
        );

    const finishingSchedule =
        createDisplaySchedule(
            finalFinishingSchedule
        );


    // ----------------------------------------
    // 最終結果
    // ----------------------------------------

    return {

        emptyDays:
            calculateEmptyDays(
                finalEndDate,
                data.deadline
            ),

        autoAdjustmentResult:
            autoAdjustmentResult,

        adjustmentRate:
            adjustmentRate,

        startDate:
            data.startDate,

        productionSchedule:
            productionSchedule,

        completionDate:
            finalCompletionDate,

        finishingSchedule:
            finishingSchedule,

        deadline:
            data.deadline,

        holidays:
            data.holidays,

        finalEndDate:
            finalEndDate,

        productionProcessList:
            productionProcessList,

        finishingProcessList:
            finishingProcessList

    };
}