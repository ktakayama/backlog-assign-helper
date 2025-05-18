/**
 * The `AssignChanger` class is responsible for handling automatic assignment
 * of users in a web application. It observes DOM mutations and listens for
 * specific keyboard shortcuts to trigger the assignment process.
 */
class AssignChanger {
  /**
   * Creates an instance of AssignChanger.
   * @param {Document} document - The document object of the web page.
   */
  constructor(document) {
    this.document = document;
    /**
     * Configuration for the MutationObserver to observe changes in the DOM.
     * @type {Object}
     * @property {boolean} subtree - Whether to observe changes in the entire subtree.
     * @property {boolean} characterData - Whether to observe changes in character data.
     */
    this.config = {
      subtree: true,
      characterData: true,
    };
  }

  /**
   * Starts observing the DOM for mutations using a MutationObserver.
   */
  observe() {
    const observer = new MutationObserver(this.callback);
    observer.observe(this.document.body, this.config);
  }

  /**
   * Callback function for the MutationObserver. Handles mutations in the DOM.
   * @param {MutationRecord[]} mutationsList - List of mutations observed.
   * @param {MutationObserver} _ - The MutationObserver instance (unused).
   */
  callback = (mutationsList, _) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "characterData") {
        this.handleLoadPage();
      }
    }
  };

  /**
   * Handles the loading of the page by attaching event listeners to the comment input field.
   */
  handleLoadPage() {
    let comment = this.document.getElementById("leftCommentContent");
    if (comment) {
      comment.addEventListener("keydown", this.handleKeydownEvent);
      this.document.addEventListener("keydown", this.handleKeydownEvent);
    }
  }

  /**
   * Handles the `keydown` event to detect specific keyboard shortcuts.
   * @param {KeyboardEvent} event - The keyboard event object.
   */
  handleKeydownEvent = (event) => {
    if (
      (event.metaKey || event.ctrlKey) &&
      event.shiftKey &&
      event.code === "KeyA"
    ) {
      event.preventDefault();
      this.handleAutoAssign();
    }
  };

  /**
   * Automatically assigns a user based on the mention in the comment field.
   * Retrieves the user ID from the mention and assigns them as the responsible user.
   */
  handleAutoAssign() {
    // メンション先のユーザーIDを取得
    let userIdElement = this.document.querySelector(
      "#leftCommentContent .at-mention-node"
    );
    let userId = userIdElement ? userIdElement.getAttribute("data-id") : null;
    if (userId === null) {
      return;
    }

    // 担当者リストのIDを取得
    let divElement = this.document.querySelector(
      "div.change-statuses-properties-item.-assigner div div"
    );
    let divId = divElement ? divElement.getAttribute("id") : null;

    // フォーカスを取得
    let activeElement = this.document.activeElement;

    // 担当者項目をクリックして選択肢を表示
    if (divId) {
      let chznContainer = this.document.querySelector(
        `#${divId} > div.chzn-container button`
      );
      if (chznContainer) {
        chznContainer.click();

        /**
         * Clicks the assigner in the dropdown list based on the user ID.
         * @param {string} userId - The ID of the user to assign.
         * @param {string} divId - The ID of the dropdown container.
         */
        const clickAssigner = (userId, divId) => {
          const listItem = this.document.querySelector(
            `#${divId}_list-${userId}`
          );
          if (listItem) {
            listItem.click();
          }
          activeElement.focus();
        };
        setTimeout(() => clickAssigner(userId, divId), 10);
      }
    }
  }
}

function main() {
  new AssignChanger(document).observe();

  window.addEventListener("load", function () {
    // モーダルで表示される場合、iframeで表示されるため別途observerを設定する
    const iframe = document.getElementById("issue-dialog-iframe");
    if (iframe) {
      iframe.addEventListener("load", function () {
        const iframeDocument = this.contentWindow.document;
        new AssignChanger(iframeDocument).observe();
      });
    }
  });
}

main();
