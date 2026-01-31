// scripts/list-routes.mjs
import fs from "fs";
import path from "path";

const root = process.cwd();
const appDir = path.join(root, "app");

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

function walk(dir) {
  const out = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function toUnix(p) {
  return p.split(path.sep).join("/");
}

function normalizeRoute(p) {
  // app/api/contact/route.ts => /api/contact
  // app/portfolio/page.tsx   => /portfolio
  const rel = toUnix(path.relative(appDir, p));

  if (rel.startsWith("api/") && rel.endsWith("/route.ts")) {
    return "/api/" + rel.replace(/^api\//, "").replace(/\/route\.ts$/, "");
  }
  if (rel.startsWith("api/") && rel.endsWith("/route.js")) {
    return "/api/" + rel.replace(/^api\//, "").replace(/\/route\.js$/, "");
  }

  if (rel.endsWith("/page.tsx")) {
    const r = "/" + rel.replace(/\/page\.tsx$/, "");
    return r === "/page" ? "/" : r;
  }
  if (rel.endsWith("/page.ts")) {
    const r = "/" + rel.replace(/\/page\.ts$/, "");
    return r === "/page" ? "/" : r;
  }
  if (rel.endsWith("/page.jsx")) {
    const r = "/" + rel.replace(/\/page\.jsx$/, "");
    return r === "/page" ? "/" : r;
  }
  if (rel.endsWith("/page.js")) {
    const r = "/" + rel.replace(/\/page\.js$/, "");
    return r === "/page" ? "/" : r;
  }

  return null;
}

function main() {
  if (!fs.existsSync(appDir)) {
    console.error("❌ app folder not found:", appDir);
    process.exit(1);
  }

  const all = walk(appDir);

  const api = [];
  const pages = [];

  for (const file of all) {
    const unix = toUnix(file);

    // API route files
    if (unix.includes("/app/api/") && (unix.endsWith("/route.ts") || unix.endsWith("/route.js"))) {
      api.push(file);
      continue;
    }

    // pages
    if (unix.endsWith("/page.tsx") || unix.endsWith("/page.ts") || unix.endsWith("/page.jsx") || unix.endsWith("/page.js")) {
      pages.push(file);
    }
  }

  console.log("\n=== API ROUTES (app/api/**/route.*) ===");
  const apiRoutes = api
    .map((p) => ({ file: p, route: normalizeRoute(p) }))
    .filter((x) => x.route)
    .sort((a, b) => a.route.localeCompare(b.route));

  for (const r of apiRoutes) {
    console.log(`- ${r.route}   =>   ${toUnix(path.relative(root, r.file))}`);
  }

  console.log("\n=== PAGES (app/**/page.*) ===");
  const pageRoutes = pages
    .map((p) => ({ file: p, route: normalizeRoute(p) }))
    .filter((x) => x.route)
    .sort((a, b) => a.route.localeCompare(b.route));

  for (const r of pageRoutes) {
    console.log(`- ${r.route}   =>   ${toUnix(path.relative(root, r.file))}`);
  }

  console.log("\n✅ Done.");
}

main();
