const { spawnSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const root = path.resolve(__dirname, "..")
const appDir = path.resolve(process.argv[2] || path.join(root, "app"))
const modernPatchPath = path.join(root, "patches", "pinokio-modern.patch")

let failed = false

function rel(target) {
  return path.relative(appDir, target).replace(/\\/g, "/")
}

function checkFile(relativePath, label) {
  const target = path.join(appDir, relativePath)
  if (fs.existsSync(target)) {
    console.log(`ok: ${label || relativePath}`)
    return true
  }
  console.error(`missing: ${label || relativePath} (${rel(target)})`)
  failed = true
  return false
}

function checkIndexScript(indexHtml, scriptPath) {
  const needle = `src="${scriptPath}`
  if (indexHtml.includes(needle)) {
    console.log(`ok: index.html loads ${scriptPath}`)
    return
  }
  console.error(`missing: index.html script tag for ${scriptPath}`)
  failed = true
}

function runGitApply(args) {
  return spawnSync("git", ["apply", ...args, modernPatchPath], {
    cwd: appDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  })
}

if (!fs.existsSync(appDir)) {
  console.error(`Cannot check Llama GUI compatibility: ${appDir} does not exist.`)
  process.exit(1)
}

console.log(`Checking Llama GUI app at ${appDir}`)

checkFile("server.py", "server.py compatibility entrypoint")
const hasModernBackend = checkFile("backend/services/lifecycle.py", "modern backend lifecycle service")
checkFile("backend/routes/lifecycle.py", "modern backend lifecycle routes")
checkFile("ui/index.html", "frontend entrypoint")
checkFile("ui/js/flag-core.js", "frontend flag core")
checkFile("ui/js/config-flags-ui.js", "Configure flag renderer")
checkFile("ui/js/flag-validation.js", "flag definition validator")
checkFile("ui/js/app-data.js", "shared app data module")
checkFile("ui/js/flags/categories.js", "flag categories module")
checkFile("ui/js/flags/options.js", "flag options module")
checkFile("ui/js/flags/chat-templates.js", "chat template module")
checkFile("ui/js/flags/definitions.js", "flag definitions module")
checkFile("ui/js/flags/helpers.js", "flag helpers module")

const indexPath = path.join(appDir, "ui", "index.html")
if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, "utf8")
  checkIndexScript(indexHtml, "/js/flags/categories.js")
  checkIndexScript(indexHtml, "/js/flags/options.js")
  checkIndexScript(indexHtml, "/js/flags/chat-templates.js")
  checkIndexScript(indexHtml, "/js/flags/definitions.js")
  checkIndexScript(indexHtml, "/js/flags/helpers.js")
  checkIndexScript(indexHtml, "/js/flag-validation.js")
  checkIndexScript(indexHtml, "/js/flag-core.js")
  checkIndexScript(indexHtml, "/js/config-flags-ui.js")
  checkIndexScript(indexHtml, "/js/app-data.js")
}

if (hasModernBackend) {
  const forward = runGitApply(["--check"])
  if (forward.status === 0) {
    console.log("ok: pinokio-modern.patch applies cleanly")
  } else {
    const reverse = runGitApply(["--reverse", "--check"])
    if (reverse.status === 0) {
      console.log("ok: pinokio-modern.patch is already applied")
    } else {
      console.error("failed: pinokio-modern.patch does not apply cleanly")
      if (forward.stderr) process.stderr.write(forward.stderr)
      failed = true
    }
  }
}

if (failed) {
  process.exit(1)
}

console.log("Compatibility check passed.")
