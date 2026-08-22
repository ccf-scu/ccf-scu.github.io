const dialogs = [...document.querySelectorAll<HTMLDialogElement>("[data-member-dialog]")];
let memberTrigger: HTMLElement | null = null;

document.querySelectorAll<HTMLButtonElement>("[data-member-open]").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const memberId = trigger.dataset.memberOpen;
    const dialog = dialogs.find((item) => item.dataset.memberDialog === memberId);
    if (!dialog || typeof dialog.showModal !== "function") return;
    memberTrigger = trigger;
    dialog.showModal();
    document.body.classList.add("member-dialog-locked");
    requestAnimationFrame(() => dialog.querySelector<HTMLButtonElement>("[data-member-close]")?.focus());
  });
});

dialogs.forEach((dialog) => {
  dialog.querySelector("[data-member-close]")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    document.body.classList.remove("member-dialog-locked");
    memberTrigger?.focus();
    memberTrigger = null;
  });
});
