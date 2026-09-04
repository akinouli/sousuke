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