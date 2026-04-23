const DEFAULT_SELECTOR = 'div[data-mg-cp="YzCcne"]';

// always active selectors (guaranteed)
let activeSelectors = [DEFAULT_SELECTOR];

function removeElements(selectors) {
  selectors.forEach((selector) => {
    try {
      document.querySelectorAll(selector).forEach((el) => el.remove());
    } catch (e) {}
  });
}

function loadRulesAndApply() {
  chrome.storage.sync.get(["rules"], (data) => {
    const rules = data.rules || {};
    const domain = window.location.hostname;

    const config = rules[domain];

    // if user added selectors → merge with default
    if (config?.selectors?.length) {
      activeSelectors = [...config.selectors, DEFAULT_SELECTOR];
    } else {
      // IMPORTANT: always fallback to default
      activeSelectors = [DEFAULT_SELECTOR];
    }

    // if disabled → empty
    if (config?.enabled === false) {
      activeSelectors = [];
    }

    apply();
  });
}

function apply() {
  if (!activeSelectors.length) return;
  removeElements(activeSelectors);
}

function observeDOM() {
  const observer = new MutationObserver(() => {
    apply();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
}

// run immediately (critical fix)
loadRulesAndApply();
observeDOM();

// update when storage changes
chrome.storage.onChanged.addListener(() => {
  loadRulesAndApply();
});