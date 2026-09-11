// ========================================
// Step.6
// 結果表示
// ========================================

// ----------------------------------------
// ① 結果コメント
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
