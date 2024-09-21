function main() {
  const config = {
    subtree: true,
    characterData: true,
  };

  const callback = function (mutationsList, _) {
    for (const mutation of mutationsList) {
      if (mutation.type === "characterData") {
        handleLoadPage();
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(document.body, config);
}

function handleLoadPage() {
  let comment = document.getElementById("leftCommentContent");
  if (comment) {
    comment.addEventListener("keydown", handleKeydownEvent);
    document.addEventListener("keydown", handleKeydownEvent);
  }
}

function handleKeydownEvent(event) {
  if (event.metaKey && event.shiftKey && event.code === "KeyA") {
    event.preventDefault();
    handleAutoAssign();
  }
}

function handleAutoAssign() {
  // メンション先のユーザーIDを取得
  let userIdElement = document.querySelector(
    "#leftCommentContent .at-mention-node"
  );
  let userId = userIdElement ? userIdElement.getAttribute("data-id") : null;

  // 担当者リストのIDを取得
  let divElement = document.querySelector(
    "div.change-statuses-properties-item.-assigner div div"
  );
  let divId = divElement ? divElement.getAttribute("id") : null;

  // 担当者項目をクリックして選択肢を表示
  if (divId) {
    let chznContainer = document.querySelector(
      `#${divId} > div.chzn-container`
    );
    if (chznContainer) {
      chznContainer.click();

      // メンション先の担当者をクリックして選択
      setTimeout(function () {
        let listItem = document.querySelector(`#${divId}_list-${userId}`);
        if (listItem) {
          listItem.click();
        }
      }, 10);
    }
  }
}

main();
