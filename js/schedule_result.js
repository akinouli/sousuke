// ========================================
// Step.6
// 結果表示
// ========================================

// ========================================
// 1.結果コメント
// ========================================

function getResultCommentImage(emptyDays, autoAdjustmentResult, adjustmentRate, isImpossible) {
	// 成立不能 ----------------------------------------
	if (isImpossible) {
		return "img/result/failed.png";
	}

	// 全て自動調整 ----------------------------------------
	if (autoAdjustmentResult === "全て") {
		// 調整率50％以下（魔王降臨）
		if (adjustmentRate <= 50) {
			return "img/result/all_t_50p.png";
		}
		// ↑の条件以外
		return "img/result/all_t_90p.png";
	}

	// 一部自動調整 ----------------------------------------
	if (autoAdjustmentResult === "一部") {
		return "img/result/all_f_90p.png";
	}

	// 自動調整なし ----------------------------------------
	if (autoAdjustmentResult === "なし") {
		// 空き日数30日以上
		if (emptyDays >= 30) {
			return "img/result/0p_30dl.png";
		}
		// 空き日数7日以上
		if (emptyDays >= 7) {
			return "img/result/0p_7dl.png";
		}
		// ↑の条件以外
		return "img/result/0p_0dl.png";
	}
	return null;
}

// 結果コメントを表示 ----------------------------------------

function displayResultComment(resultData) {
	if (!resultData) {
		return;
	}

	const resultComment = document.getElementById("result-comment");

	if (!resultComment) {
		return;
	}

	const imagePath = getResultCommentImage(
		resultData.emptyDays,
		resultData.autoAdjustmentResult,
		resultData.adjustmentRate,
		resultData.isImpossible,
	);

	resultComment.innerHTML = "";

	if (!imagePath) {
		return;
	}

	const image = document.createElement("img");

	image.src = encodeURI(imagePath);
	image.alt = "スケジュール結果";

	resultComment.appendChild(image);
}

// ========================================
// 2.スケジュールカレンダー
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
	if (dateValue instanceof Date) {
		return new Date(dateValue);
	}

	// 文字列の場合
	if (typeof dateValue === "string") {
		const [year, month, day] = dateValue.split("-").map(Number);

		return new Date(year, month - 1, day);
	}

	return null;
}

// ----------------------------------------
// DateをYYYY-MM-DDへ変換
// ----------------------------------------

function formatScheduleDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

// ----------------------------------------
// 日付を1日進める
// ----------------------------------------

function addScheduleDay(date) {
	const nextDate = new Date(date);

	nextDate.setDate(nextDate.getDate() + 1);

	return nextDate;
}

// ----------------------------------------
// 日付が休日か判定
// ----------------------------------------

function isScheduleHoliday(dateString, holidays) {
	if (!holidays) {
		return false;
	}

	return holidays.some((holiday) => {
		const holidayDate = parseScheduleDate(holiday);

		if (!holidayDate) {
			return false;
		}

		return formatScheduleDate(holidayDate) === dateString;
	});
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

function createScheduleWeeks(startDate, deadline) {
	const weeks = [];

	// 作業開始日を含む週の日曜日
	const firstWeekStart = new Date(startDate);

	firstWeekStart.setDate(firstWeekStart.getDate() - firstWeekStart.getDay());

	// 締切日を含む週の土曜日
	const lastWeekEnd = new Date(deadline);

	lastWeekEnd.setDate(lastWeekEnd.getDate() + (6 - lastWeekEnd.getDay()));

	let weekStart = new Date(firstWeekStart);

	while (weekStart <= lastWeekEnd) {
		const week = [];

		// 1週間 = 7日
		for (let i = 0; i < 7; i++) {
			const date = new Date(weekStart);

			date.setDate(weekStart.getDate() + i);

			week.push(date);
		}

		weeks.push(week);

		// 次の週へ
		weekStart.setDate(weekStart.getDate() + 7);
	}

	return weeks;
}

// ----------------------------------------
// 曜日ヘッダーを作成
// ----------------------------------------

function createScheduleWeekdayHeader() {
	const header = document.createElement("div");

	header.className = "schedule-week-header";

	const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

	weekdays.forEach((weekday) => {
		const day = document.createElement("span");

		day.textContent = weekday;

		header.appendChild(day);
	});

	return header;
}

// ----------------------------------------
// カレンダーアイコンを作成
// ----------------------------------------

function createScheduleIcon(src, alt) {
	const icon = document.createElement("img");

	icon.src = src;
	icon.alt = alt;

	icon.className = "schedule-day-icon";

	return icon;
}

// ----------------------------------------
// カレンダーアイコンを追加
// ----------------------------------------

function addScheduleIcons(dayElement, date, data) {
	const dateString = formatScheduleDate(date);
	const startDate = parseScheduleDate(data.startDate);
	const completionDate = parseScheduleDate(data.completionDate);
	const deadline = parseScheduleDate(data.deadline);

	// アイコンエリア
	const iconArea = document.createElement("div");

	iconArea.className = "schedule-day-icons";

	// 作業開始日
	if (startDate && date.getTime() === startDate.getTime()) {
		iconArea.appendChild(createScheduleIcon("icon/cal1_start.png", "作業開始日"));
	}

	// 作品完成日
	if (completionDate && date.getTime() === completionDate.getTime()) {
		iconArea.appendChild(createScheduleIcon("icon/cal2_completed.png", "作品完成日"));
	}

	// 締切日
	if (deadline && date.getTime() === deadline.getTime()) {
		iconArea.appendChild(createScheduleIcon("icon/cal3_deadline.png", "締切日"));
	}

	// 休日
	if (isScheduleHoliday(dateString, data.holidays)) {
		iconArea.appendChild(createScheduleIcon("icon/cal4_holiday.png", "休日"));
	}

	// アイコンが1つ以上ある場合だけ追加
	if (iconArea.children.length > 0) {
		dayElement.appendChild(iconArea);
	}
}

// ----------------------------------------
// 日付マスを作成
// ----------------------------------------

function createScheduleDayElement(date, data, displayStartDate) {
	const dateString = formatScheduleDate(date);
	const dayElement = document.createElement("div");

	dayElement.className = "schedule-day";

	// ------------------------------------
	// 作業期間外
	// ------------------------------------

	const startDate = parseScheduleDate(data.startDate);
	const deadline = parseScheduleDate(data.deadline);

	if (date < startDate || date > deadline) {
		dayElement.classList.add("outside-period");
	}

	// ------------------------------------
	// 日付
	// ------------------------------------

	const dayNumber = document.createElement("div");

	dayNumber.className = "schedule-day-number";

	const isDisplayStart = displayStartDate && date.getTime() === displayStartDate.getTime();
	const isMonthStart = date.getDate() === 1;

	if (isDisplayStart || isMonthStart) {
		dayNumber.textContent = `${date.getMonth() + 1}/${date.getDate()}`;
	} else {
		dayNumber.textContent = date.getDate();
	}

	// 月初の情報
	if (isMonthStart) {
		dayElement.classList.add("month-start");
	}

	dayElement.appendChild(dayNumber);

	// カレンダーアイコン
	addScheduleIcons(dayElement, date, data);

	return dayElement;
}

// ----------------------------------------
// 行程一覧を取得
// ----------------------------------------

function getScheduleProcessList(data) {
	return [...(data.productionSchedule || []), ...(data.finishingSchedule || [])];
}

// ----------------------------------------
// 週内の行程を取得
// ----------------------------------------

function getScheduleWeekProcesses(week, data) {
	const weekStart = week[0];
	const weekEnd = week[6];

	return getScheduleProcessList(data).filter((process) => {
		const startDate = parseScheduleDate(process.startDate);
		const endDate = parseScheduleDate(process.endDate);

		if (!startDate || !endDate) {
			return false;
		}

		return endDate >= weekStart && startDate <= weekEnd;
	});
}

// ----------------------------------------
// 行程をレーンに振り分け
// ----------------------------------------
//
// 必要な数だけレーンを自動追加
//

function assignScheduleProcessLanes(processes) {
	const laneEndDates = [];

	return processes.map((process) => {
		const startDate = parseScheduleDate(process.startDate);
		const endDate = parseScheduleDate(process.endDate);

		// --------------------------------
		// 空いているレーンを探す
		// --------------------------------

		let lane = -1;

		for (let i = 0; i < laneEndDates.length; i++) {
			// 同じ終了日から始まる工程は
			// 重なるものとして扱う
			if (startDate > laneEndDates[i]) {
				lane = i;

				break;
			}
		}

		// --------------------------------
		// 空きレーンがなければ新規追加
		// --------------------------------

		if (lane === -1) {
			lane = laneEndDates.length;

			laneEndDates.push(endDate);
		} else {
			laneEndDates[lane] = endDate;
		}

		return lane;
	});
}

// ----------------------------------------
// 行程の虹色を取得
// ----------------------------------------

function getScheduleProcessColor(processIndex, processCount) {
	// 色相の基準点
	const colorStops = [
		{ position: 0, hue: 360 }, // 赤
		{ position: 1, hue: 30 }, // オレンジ
	];

	// 工程が1つだけの場合
	const position = processCount <= 1 ? 0 : processIndex / (processCount - 1);

	// 該当する色区間を探す
	let start = colorStops[0];
	let end = colorStops[colorStops.length - 1];

	for (let i = 0; i < colorStops.length - 1; i++) {
		if (position >= colorStops[i].position && position <= colorStops[i + 1].position) {
			start = colorStops[i];
			end = colorStops[i + 1];

			break;
		}
	}

	// 区間内の位置
	const range = end.position - start.position;

	const localPosition = range === 0 ? 0 : (position - start.position) / range;

	// 色相を補間
	const hue = start.hue + (end.hue - start.hue) * localPosition;

	return hue;
}

// ----------------------------------------
// 行程表示を作成
// ----------------------------------------

function createScheduleProcessRow(week, process, lane, processIndex, processCount) {
	const startDate = parseScheduleDate(process.startDate);
	const endDate = parseScheduleDate(process.endDate);

	if (!startDate || !endDate) {
		return null;
	}

	const weekStart = week[0];
	const weekEnd = week[6];

	// ------------------------------------
	// 週に存在しない行程を非表示
	// ------------------------------------

	if (endDate < weekStart || startDate > weekEnd) {
		return null;
	}

	// ------------------------------------
	// 週の表示開始日
	// ------------------------------------

	// 最初の週 → 行程開始日 ・ 続きの週 → 日曜日
	const displayStart = startDate > weekStart ? startDate : weekStart;

	// ------------------------------------
	// 週の表示終了日
	// ------------------------------------

	// 続きの週 → 土曜日 ・ 最後の週 → 行程終了日
	const displayEnd = endDate < weekEnd ? endDate : weekEnd;

	// ------------------------------------
	// 工程名の開始曜日
	// ------------------------------------

	const nameColumn = displayStart.getDay();

	// ------------------------------------
	// 矢印の終了曜日
	// ------------------------------------

	const arrowColumn = displayEnd.getDay();

	// ------------------------------------
	// 行程表示
	// ------------------------------------

	const row = document.createElement("div");

	row.className = "schedule-process-row";

	// ------------------------------------
	// 作業期間内だけを表示範囲にする
	// ------------------------------------

	row.style.gridColumn = `${nameColumn + 1} / ${arrowColumn + 2}`;

	// ------------------------------------
	// 行程のレーン構成
	// ------------------------------------

	row.style.gridRow = `${lane + 1}`;

	// ------------------------------------
	// 工程の色
	// ------------------------------------

	const hue = getScheduleProcessColor(processIndex, processCount);

	// 工程名カラー（色相・彩度・明度）
	const nameColor = `hsl(${hue}, 60%, 30%)`;

	// 線・矢印カラー
	const accentColor = `hsl(${hue}, 60%, 70%)`;

	// ------------------------------------
	// 工程名
	// ------------------------------------

	const name = document.createElement("span");

	name.className = "schedule-process-name";

	name.textContent = process.name;

	// 濃い色
	name.style.color = nameColor;

	// ------------------------------------
	// 一本線
	// ------------------------------------

	const line = document.createElement("span");

	line.className = "schedule-process-line";

	line.style.color = accentColor;

	// ------------------------------------
	// CSS三角の矢印
	// ------------------------------------

	const arrow = document.createElement("span");

	arrow.className = "schedule-process-arrow";

	arrow.style.color = accentColor;

	row.appendChild(name);
	row.appendChild(line);
	row.appendChild(arrow);

	return row;
}

// ----------------------------------------
// 週をカレンダーへ追加
// ----------------------------------------

function appendScheduleWeek(container, week, data, displayStartDate) {
	// ------------------------------------
	// 週全体
	// ------------------------------------

	const weekGrid = document.createElement("div");

	weekGrid.className = "schedule-week-grid";

	// ------------------------------------
	// 日付マス
	// ------------------------------------

	week.forEach((date) => {
		const dayElement = createScheduleDayElement(date, data, displayStartDate);

		weekGrid.appendChild(dayElement);
	});

	// ------------------------------------
	// この週の行程
	// ------------------------------------

	const processes = getScheduleWeekProcesses(week, data);

	const allProcesses = getScheduleProcessList(data);

	// ------------------------------------
	// 2レーンへ振り分け
	// ------------------------------------

	const lanes = assignScheduleProcessLanes(processes);

	// ------------------------------------
	// 行程表示レイヤー
	// ------------------------------------

	const processLayer = document.createElement("div");

	processLayer.className = "schedule-process-layer";

	// ------------------------------------
	// 行程レーン数に応じて週の高さを調整
	// ------------------------------------

	const laneCount = lanes.length > 0 ? Math.max(...lanes) + 1 : 0;

	processLayer.style.setProperty("--schedule-process-lanes", laneCount);

	processes.forEach((process, index) => {
		const processIndex = allProcesses.indexOf(process);

		const processRow = createScheduleProcessRow(week, process, lanes[index], processIndex, allProcesses.length);

		if (processRow) {
			processLayer.appendChild(processRow);
		}
	});

	weekGrid.appendChild(processLayer);

	// ------------------------------------
	// カレンダーへ追加
	// ------------------------------------

	container.appendChild(weekGrid);
}

// ----------------------------------------
// 横型カレンダー描画
// ----------------------------------------

function renderHorizontalScheduleCalendar() {
	const view = document.getElementById("schedule-calendar-horizontal");
	const grid = document.getElementById("schedule-calendar-grid");
	const monthLabel = document.getElementById("schedule-month");

	if (!view || !grid || !monthLabel || !scheduleCalendarData || !scheduleCalendarMonth) {
		return;
	}

	// 曜日ヘッダーを作り直す
	const oldHeader = view.querySelector(".schedule-week-header");

	if (oldHeader) {
		oldHeader.remove();
	}

	const weekdayHeader = createScheduleWeekdayHeader();

	view.insertBefore(weekdayHeader, grid);

	grid.innerHTML = "";

	const year = scheduleCalendarMonth.getFullYear();

	const month = scheduleCalendarMonth.getMonth();

	monthLabel.innerHTML = `
    <span class="schedule-month-year">${year}年</span>
    <span class="schedule-month-number">${month + 1}月</span>
  `;

	const weeks = createScheduleWeeks(
		parseScheduleDate(scheduleCalendarData.startDate),
		parseScheduleDate(scheduleCalendarData.deadline),
	);

	// 現在の月に関係する週だけ表示
	let isFirstDisplayedWeek = true;

	weeks.forEach((week) => {
		const includesCurrentMonth = week.some((date) => date.getFullYear() === year && date.getMonth() === month);

		if (includesCurrentMonth) {
			appendScheduleWeek(grid, week, scheduleCalendarData, isFirstDisplayedWeek ? week[0] : null);

			isFirstDisplayedWeek = false;
		}
	});
}

// ----------------------------------------
// 縦型カレンダー描画
// ----------------------------------------

function renderVerticalScheduleCalendar() {
	const view = document.getElementById("schedule-calendar-vertical");
	const list = document.getElementById("schedule-calendar-list");

	if (!view || !list || !scheduleCalendarData) {
		return;
	}

	// 曜日ヘッダーを作り直す
	const oldHeader = view.querySelector(".schedule-week-header");

	if (oldHeader) {
		oldHeader.remove();
	}

	const weekdayHeader = createScheduleWeekdayHeader();

	view.insertBefore(weekdayHeader, list);

	list.innerHTML = "";

	const startDate = parseScheduleDate(scheduleCalendarData.startDate);
	const deadline = parseScheduleDate(scheduleCalendarData.deadline);

	if (!startDate || !deadline) {
		return;
	}

	const weeks = createScheduleWeeks(startDate, deadline);

	// 作業期間に関係する週をすべて表示
	weeks.forEach((week, index) => {
		appendScheduleWeek(list, week, scheduleCalendarData, index === 0 ? week[0] : null);
	});
}

// ----------------------------------------
// カレンダー表示
// ----------------------------------------

function renderScheduleCalendar() {
	if (scheduleCalendarView === "horizontal") {
		renderHorizontalScheduleCalendar();

		return;
	}

	renderVerticalScheduleCalendar();
}

// ----------------------------------------
// カレンダーデータを受け取る
// ----------------------------------------

function displayScheduleCalendar(resultData) {
	if (!resultData) {
		return;
	}

	// 成立不能の場合はカレンダーを表示しない
	if (resultData.isImpossible) {
		return;
	}

	scheduleCalendarData = resultData;

	const startDate = parseScheduleDate(resultData.startDate);

	if (!startDate) {
		return;
	}

	scheduleCalendarMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

	renderScheduleCalendar();
}

// ----------------------------------------
// 横型 ↔ 縦型
// ----------------------------------------

function changeScheduleCalendar() {
	const horizontal = document.getElementById("schedule-calendar-horizontal");
	const vertical = document.getElementById("schedule-calendar-vertical");

	if (!horizontal || !vertical) {
		return;
	}

	if (scheduleCalendarView === "horizontal") {
		scheduleCalendarView = "vertical";

		horizontal.hidden = true;

		vertical.hidden = false;
	} else {
		scheduleCalendarView = "horizontal";

		horizontal.hidden = false;

		vertical.hidden = true;
	}

	renderScheduleCalendar();
}

// ----------------------------------------
// 前月
// ----------------------------------------

function showPreviousScheduleMonth() {
	if (!scheduleCalendarMonth || !scheduleCalendarData) {
		return;
	}

	const startDate = parseScheduleDate(scheduleCalendarData.startDate);
	const deadline = parseScheduleDate(scheduleCalendarData.deadline);

	const previousMonth = new Date(scheduleCalendarMonth.getFullYear(), scheduleCalendarMonth.getMonth() - 1, 1);

	// 作業開始月より前には移動しない
	if (previousMonth < new Date(startDate.getFullYear(), startDate.getMonth(), 1)) {
		return;
	}

	scheduleCalendarMonth = previousMonth;

	renderHorizontalScheduleCalendar();
}

// ----------------------------------------
// 次月
// ----------------------------------------

function showNextScheduleMonth() {
	if (!scheduleCalendarMonth || !scheduleCalendarData) {
		return;
	}

	const startDate = parseScheduleDate(scheduleCalendarData.startDate);
	const deadline = parseScheduleDate(scheduleCalendarData.deadline);

	const nextMonth = new Date(scheduleCalendarMonth.getFullYear(), scheduleCalendarMonth.getMonth() + 1, 1);

	// 締切月より後には移動しない
	if (nextMonth > new Date(deadline.getFullYear(), deadline.getMonth(), 1)) {
		return;
	}

	scheduleCalendarMonth = nextMonth;

	renderHorizontalScheduleCalendar();
}

// ----------------------------------------
// ボタン設定
// ----------------------------------------

document.addEventListener("DOMContentLoaded", function () {
	const changeButton = document.getElementById("calendar-change");
	const previousButton = document.getElementById("schedule-prev");
	const nextButton = document.getElementById("schedule-next");

	if (changeButton) {
		changeButton.addEventListener("click", changeScheduleCalendar);
	}

	if (previousButton) {
		previousButton.addEventListener("click", showPreviousScheduleMonth);
	}

	if (nextButton) {
		nextButton.addEventListener("click", showNextScheduleMonth);
	}

	const editProcessListButton = document.getElementById("edit-process-list");

	if (editProcessListButton) {
		editProcessListButton.addEventListener("click", editFinalProcessList);
	}
});

// ========================================
// 3.作業終了予定日
// ========================================

// 作業終了予定日を表示 ----------------------------------------

function displayResultEndDate(resultData) {
	if (!resultData) {
		return;
	}

	const endDate = document.getElementById("schedule-end-date-value");

	if (!endDate) {
		return;
	}

	const finalEndDate = parseScheduleDate(resultData.finalEndDate);

	if (!finalEndDate) {
		endDate.textContent = "";
		return;
	}

	const year = finalEndDate.getFullYear();
	const month = finalEndDate.getMonth() + 1;
	const day = finalEndDate.getDate();

	endDate.textContent = `${year}年${month}月${day}日`;
}

// ========================================
// 4.自動調整結果
// ========================================

// 自動調整結果を表示 ----------------------------------------

function displayResultAutoAdjustment(resultData) {
	if (!resultData) {
		return;
	}

	const adjustmentElement = document.getElementById("schedule-auto-adjustment");

	const adjustmentValueElement = document.getElementById("schedule-auto-adjustment-value");

	if (!adjustmentElement || !adjustmentValueElement) {
		return;
	}

	// 自動調整なしの場合は何も表示しない
	if (resultData.autoAdjustmentResult === "なし") {
		adjustmentElement.style.display = "none";

		return;
	}

	// 「一部」または「全て」を表示
	adjustmentValueElement.textContent = resultData.autoAdjustmentResult;

	adjustmentElement.style.display = "";
}

// ========================================
// 5.最終行程リスト
// ========================================

// 作業時間を表示用文字列へ変換
function formatFinalProcessWorkTime(workTime) {
	if (!workTime) {
		return "";
	}

	const unitText = workTime.unit === "page" ? "ページ毎" : "全体";

	const timeText = `${workTime.hours}時間${workTime.minutes}分`;

	return {
		unitText: unitText,
		timeText: timeText,
	};
}

// 行程カードを作成
function createFinalProcessCard(process) {
	const card = document.createElement("div");

	card.className = "final-process-card";

	// ------------------------------------
	// 行程名
	// ------------------------------------

	const name = document.createElement("div");

	name.className = "final-process-name";

	name.textContent = process.name;

	// ------------------------------------
	// 作業時間
	// ------------------------------------

	const time = document.createElement("div");

	time.className = "final-process-time";

	const workTime = formatFinalProcessWorkTime(process.workTime);

	// 全体 / ページ毎
	const unit = document.createElement("span");

	unit.className = "final-process-unit";

	unit.textContent = workTime.unitText;

	// 入力時の作業時間
	const originalTime = document.createElement("span");

	originalTime.textContent = `${workTime.timeText}`;

	time.appendChild(unit);
	time.appendChild(originalTime);

	// ------------------------------------
	// 調整後作業時間
	// ------------------------------------

	const adjustedTime = formatFinalProcessWorkTime(process.adjustedWorkTime);

	const isAdjusted =
		process.workTime.hours !== process.adjustedWorkTime.hours ||
		process.workTime.minutes !== process.adjustedWorkTime.minutes;

	if (isAdjusted) {
		const adjustment = document.createElement("span");

		adjustment.className = "final-process-adjustment";

		adjustment.textContent = ` → ${adjustedTime.timeText}`;

		time.appendChild(adjustment);
	}

	// ------------------------------------
	// 作業期間
	// ------------------------------------

	const period = document.createElement("div");

	period.className = "final-process-period";

	const startDate = parseScheduleDate(process.startDate);
	const endDate = parseScheduleDate(process.endDate);

	if (startDate && endDate) {
		const startText = `${startDate.getMonth() + 1}月${startDate.getDate()}日`;

		const endText = `${endDate.getMonth() + 1}月${endDate.getDate()}日`;

		period.textContent = `${startText}〜${endText}（${process.workDays}日間）`;
	}

	// 結果表示
	card.appendChild(name);
	card.appendChild(time);
	card.appendChild(period);

	return card;
}

function displayFinalProcessList(resultData) {
	if (!resultData) {
		return;
	}

	const productionList = document.getElementById("final-production-list");

	const finishingList = document.getElementById("final-finishing-list");

	const finishingArea = document.getElementById("final-finishing-area");

	if (!productionList || !finishingList || !finishingArea) {
		return;
	}

	// ------------------------------------
	// 制作工程
	// ------------------------------------

	productionList.innerHTML = "";

	(resultData.productionProcessList || []).forEach((process) => {
		const item = document.createElement("div");

		item.className = "flow-item";

		const arrow = document.createElement("div");

		arrow.className = "flow-arrow";

		const card = createFinalProcessCard(process);

		item.appendChild(arrow);
		item.appendChild(card);

		productionList.appendChild(item);
	});

	// ------------------------------------
	// 仕立て工程
	// ------------------------------------

	const finishingProcesses = resultData.finishingProcessList || [];

	if (finishingProcesses.length === 0) {
		finishingArea.hidden = true;

		return;
	}

	finishingArea.hidden = false;

	finishingList.innerHTML = "";

	finishingProcesses.forEach((process) => {
		const item = document.createElement("div");

		item.className = "flow-item";

		const arrow = document.createElement("div");

		arrow.className = "flow-arrow";

		const card = createFinalProcessCard(process);

		item.appendChild(arrow);
		item.appendChild(card);

		finishingList.appendChild(item);
	});
}

// ----------------------------------------
// 行程リスト編集ボタン
// ----------------------------------------

function editFinalProcessList() {
	const processSectionIndex = 1;

	showSection(processSectionIndex);
}
