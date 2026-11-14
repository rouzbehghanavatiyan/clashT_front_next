import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const standalone = path.join(root, ".next", "standalone");

function copy(src, dest) {
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    console.log(`Copied ${src} -> ${dest}`);
  }
}

copy(path.join(root, "public"), path.join(standalone, "public"));
copy(
  path.join(root, ".next", "static"),
  path.join(standalone, ".next", "static"),
);
copy(
  path.join(root, "ecosystem.config.js"),
  path.join(standalone, "ecosystem.config.js"),
);
