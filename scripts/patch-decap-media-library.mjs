import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const corePackagePath = resolve("node_modules/decap-cms-core/package.json");
const targetPath = resolve("node_modules/decap-cms-core/dist/esm/components/MediaLibrary/MediaLibraryTop.js");
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

const source = await readFile(targetPath, "utf8");
if (source.includes(patched)) {
  console.log("Decap media library null-selection patch is already applied.");
} else if (source.includes(original)) {
  await writeFile(targetPath, source.replace(original, patched));
  console.log("Applied Decap media library null-selection patch.");
} else {
  throw new Error("Decap MediaLibraryTop no longer matches the reviewed patch target.");
}
