import type { SearchIndexEntry } from "../lib/search";

function parseIndex(root: HTMLElement): SearchIndexEntry[] {
  const source = root.querySelector<HTMLScriptElement>("[data-search-index]");
  if (!source?.textContent) return [];
  try {
    return JSON.parse(source.textContent) as SearchIndexEntry[];
  } catch {
    return [];
  }
}

function initializeRoot(root: HTMLElement) {
  if (root.dataset.searchReady === "true") return;
  root.dataset.searchReady = "true";
  const index = parseIndex(root);
  const form = root.querySelector<HTMLFormElement>("[data-search-form]");
  const input = root.querySelector<HTMLInputElement>("[data-search-input]");
  const count = root.querySelector<HTMLElement>("[data-search-count]");
  const results = root.querySelector<HTMLElement>("[data-search-results]");
  if (!form || !input || !count || !results) return;

  const run = () => {
    const query = input.value.trim().toLocaleLowerCase("zh-CN");
    const matches = query
      ? index.filter((entry) => entry.keywords.toLocaleLowerCase("zh-CN").includes(query)).slice(0, 30)
      : [];
    count.textContent = query ? `找到 ${matches.length} 条结果` : "输入关键词开始搜索。";
    results.replaceChildren(...matches.map((entry) => {
      const article = document.createElement("article");
      article.className = "search-result";
      const heading = document.createElement("h2");
      const link = document.createElement("a");
      link.href = entry.url;
      link.textContent = entry.title;
      heading.append(link);
      const summary = document.createElement("p");
      summary.textContent = entry.summary;
      article.append(heading, summary);
      return article;
    }));
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run();
  });
  input.addEventListener("input", run);
  if (root.dataset.searchInitialQuery === "url") {
    const initial = new URLSearchParams(location.search).get("q");
    if (initial) {
      input.value = initial;
      run();
    }
  }
}

document.querySelectorAll<HTMLElement>("[data-search-root]").forEach(initializeRoot);

const dialog = document.querySelector<HTMLDialogElement>("[data-search-dialog]");
let searchTrigger: HTMLElement | null = null;
document.querySelectorAll<HTMLAnchorElement>("[data-search-open]").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    if (!dialog || typeof dialog.showModal !== "function") return;
    event.preventDefault();
    searchTrigger = trigger;
    dialog.showModal();
    document.body.classList.add("search-locked");
    requestAnimationFrame(() => dialog.querySelector<HTMLInputElement>("[data-search-input]")?.focus());
  });
});
dialog?.querySelector("[data-search-close]")?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("close", () => {
  document.body.classList.remove("search-locked");
  searchTrigger?.focus();
  searchTrigger = null;
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && dialog?.open) dialog.close();
});
