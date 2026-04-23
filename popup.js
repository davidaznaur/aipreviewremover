async function getCurrentDomain() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return new URL(tab.url).hostname;
}

function renderList(selectors) {
  const list = document.getElementById("list");
  list.innerHTML = "";

  selectors.forEach((sel, index) => {
    const li = document.createElement("li");
    li.textContent = sel;

    li.onclick = () => removeSelector(index);

    list.appendChild(li);
  });
}

async function load() {
  const domain = await getCurrentDomain();

  chrome.storage.sync.get(["rules"], (data) => {
    const rules = data.rules || {};
    const config = rules[domain] || { enabled: false, selectors: [] };

    document.getElementById("toggle").checked = config.enabled;
    renderList(config.selectors);
  });
}

async function save(updateFn) {
  const domain = await getCurrentDomain();

  chrome.storage.sync.get(["rules"], (data) => {
    const rules = data.rules || {};
    const config = rules[domain] || { enabled: false, selectors: [] };

    updateFn(config);

    rules[domain] = config;

    chrome.storage.sync.set({ rules }, load);
  });
}

function addSelector() {
  const input = document.getElementById("selector");
  const value = input.value.trim();

  if (!value) return;

  save(config => {
    config.selectors.push(value);
  });

  input.value = "";
}

function removeSelector(index) {
  save(config => {
    config.selectors.splice(index, 1);
  });
}

document.getElementById("add").onclick = addSelector;

document.getElementById("toggle").onchange = (e) => {
  save(config => {
    config.enabled = e.target.checked;
  });
};

load();