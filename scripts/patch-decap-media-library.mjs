import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const corePackagePath = resolve("node_modules/decap-cms-core/package.json");
const mediaLibraryPath = resolve("node_modules/decap-cms-core/dist/esm/components/MediaLibrary/MediaLibraryTop.js");
const editorInterfacePath = resolve("node_modules/decap-cms-core/dist/esm/components/Editor/EditorInterface.js");
const bootstrapPath = resolve("node_modules/decap-cms-core/dist/esm/bootstrap.js");
const expectedVersion = "3.17.1";
const original = `          path: selectedFile.path,
          name: selectedFile.name,
          draft: selectedFile.draft,`;
const patched = `          path: selectedFile?.path,
          name: selectedFile?.name,
          draft: selectedFile?.draft,`;

const corePackage = JSON.parse(await readFile(corePackagePath, "utf8"));
if (corePackage.version !== expectedVersion) {
  throw new Error(`Review the Decap media patch before using decap-cms-core ${corePackage.version}; expected ${expectedVersion}.`);
}

const mediaSource = await readFile(mediaLibraryPath, "utf8");
if (mediaSource.includes(patched)) {
  console.log("Decap media library null-selection patch is already applied.");
} else if (mediaSource.includes(original)) {
  await writeFile(mediaLibraryPath, mediaSource.replace(original, patched));
  console.log("Applied Decap media library null-selection patch.");
} else {
  throw new Error("Decap MediaLibraryTop no longer matches the reviewed patch target.");
}

const scrollSyncOriginalState = `    scrollSyncEnabled: localStorage.getItem(SCROLL_SYNC_ENABLED) !== 'false',`;
const scrollSyncPatchedState = `    scrollSyncEnabled: false,`;
const scrollSyncOriginalToggle = `, scrollSyncVisible && !collection.getIn(['editor', 'visualEditing']) && _jsx(EditorToggle, {
            isActive: scrollSyncEnabled,
            onClick: this.handleToggleScrollSync,
            size: "large",
            type: "scroll",
            title: t('editor.editorInterface.toggleScrollSync')
          })`;
const scrollSyncPatchedToggle = ` /* CCF: scroll sync is intentionally unavailable; panes scroll independently. */`;

let editorSource = await readFile(editorInterfacePath, "utf8");
if (editorSource.includes(scrollSyncOriginalState)) {
  editorSource = editorSource.replace(scrollSyncOriginalState, scrollSyncPatchedState);
} else if (!editorSource.includes(scrollSyncPatchedState)) {
  throw new Error("Decap EditorInterface scroll-sync state no longer matches the reviewed patch target.");
}

if (editorSource.includes(scrollSyncOriginalToggle)) {
  editorSource = editorSource.replace(scrollSyncOriginalToggle, scrollSyncPatchedToggle);
} else if (!editorSource.includes(scrollSyncPatchedToggle)) {
  throw new Error("Decap EditorInterface scroll-sync toggle no longer matches the reviewed patch target.");
}

await writeFile(editorInterfacePath, editorSource);
console.log("Applied Decap independent editor scrolling patch.");

const authEventOriginal = `  const root = createRoot(getRoot());
  root.render(_jsx(Root, {}));`;
const authEventPatched = `  const root = createRoot(getRoot());
  root.render(_jsx(Root, {}));

  // CCF: let the companion shell follow Decap's authoritative auth state
  // without reading tokens or importing a second copy of the Redux runtime.
  let lastAuthenticated;
  const notifyAuthentication = () => {
    const authenticated = Boolean(store.getState().auth.user);
    if (authenticated === lastAuthenticated) return;
    lastAuthenticated = authenticated;
    window.dispatchEvent(new CustomEvent('ccf:decap-auth-change', {
      detail: { authenticated }
    }));
  };
  store.subscribe(notifyAuthentication);
  notifyAuthentication();`;

const bootstrapSource = await readFile(bootstrapPath, "utf8");
if (bootstrapSource.includes(authEventPatched)) {
  console.log("Decap authentication event patch is already applied.");
} else if (bootstrapSource.includes(authEventOriginal)) {
  await writeFile(bootstrapPath, bootstrapSource.replace(authEventOriginal, authEventPatched));
  console.log("Applied Decap authentication event patch.");
} else {
  throw new Error("Decap bootstrap no longer matches the reviewed authentication event patch target.");
}
