/**
 * The AssignChanger class handles automatic user assignment in Backlog.
 * It observes DOM mutations and listens for specific keyboard shortcuts to trigger assignment.
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
  handleLoadPage = () => {
    const comment = this.document.getElementById("leftCommentContent");
    if (comment) {
      comment.addEventListener("keydown", this.handleKeydownEvent);
      this.document.addEventListener("keydown", this.handleKeydownEvent);
    }
  };

  /**
   * Handles the keydown event to detect specific keyboard shortcuts.
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
  handleAutoAssign = () => {
    // Get the user ID from the mention
    const userIdElement = this.document.querySelector(
      "#leftCommentContent .at-mention-node",
    );
    const userId = userIdElement ? userIdElement.getAttribute("data-id") : null;
    if (userId === null) {
      return;
    }

    // Get the ID of the assignee list
    const divElement = this.document.querySelector(
      "div.change-statuses-properties-item.-assigner div div",
    );
    const divId = divElement ? divElement.getAttribute("id") : null;

    // Get the current focus
    const activeElement = this.document.activeElement;

    // Click the assignee field to show options
    if (divId) {
      const chznContainer = this.document.querySelector(
        `#${divId} > div.chzn-container button`,
      );
      if (chznContainer) {
        chznContainer.click();

        /**
         * Clicks the assignee in the dropdown list based on the user ID.
         * @param {string} userId - The ID of the user to assign.
         * @param {string} divId - The ID of the dropdown container.
         */
        const clickAssigner = (userId, divId) => {
          const listItem = this.document.querySelector(
            `#${divId}_list-${userId}`,
          );
          if (listItem) {
            listItem.click();
          }
          activeElement.focus();
        };
        setTimeout(() => clickAssigner(userId, divId), 10);
      }
    }
  };
}

function main() {
  new AssignChanger(document).observe();

  window.addEventListener("load", () => {
    // When displayed in a modal iframe, set up observer separately
    const iframe = document.getElementById("issue-dialog-iframe");
    if (iframe) {
      iframe.addEventListener("load", () => {
        const iframeDocument = iframe.contentWindow.document;
        new AssignChanger(iframeDocument).observe();
      });
    }
  });
}

main();
