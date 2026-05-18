const { spawnSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const root = path.resolve(__dirname, "..")
const appDir = path.join(root, "app")
const legacyPatchPath = path.join(root, "patches", "lifecycle-cache.patch")
const modernPatchPath = path.join(root, "patches", "pinokio-modern.patch")

function runGit(args) {
  return spawnSync("git", args, {
    cwd: appDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  })
}

function printResult(result) {
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
}

function applyPatch(patchPath, label) {
  if (!fs.existsSync(patchPath)) {
    console.error(`Cannot apply ${label} patch: ${path.relative(root, patchPath)} does not exist.`)
    process.exit(1)
  }

  let result = runGit(["apply", "--check", patchPath])
  if (result.status === 0) {
    result = runGit(["apply", "--whitespace=nowarn", patchPath])
    printResult(result)
    if (result.status !== 0) process.exit(result.status || 1)
    console.log(`Applied ${label} patch.`)
    process.exit(0)
  }

  const reverseCheck = runGit(["apply", "--reverse", "--check", patchPath])
  if (reverseCheck.status === 0) {
    console.log(`${label} patch is already applied.`)
    process.exit(0)
  }

  printResult(result)
  process.exit(result.status || 1)
}

function reversePatch(patchPath, label) {
  if (!fs.existsSync(patchPath)) {
    console.error(`Cannot reverse ${label} patch: ${path.relative(root, patchPath)} does not exist.`)
    process.exit(1)
  }

  let result = runGit(["apply", "--reverse", "--check", patchPath])
  if (result.status === 0) {
    result = runGit(["apply", "--reverse", "--whitespace=nowarn", patchPath])
    printResult(result)
    if (result.status !== 0) process.exit(result.status || 1)
    console.log(`Reverted ${label} patch.`)
    process.exit(0)
  }

  const forwardCheck = runGit(["apply", "--check", patchPath])
  if (forwardCheck.status === 0) {
    console.log(`${label} patch is not applied.`)
    process.exit(0)
  }

  printResult(result)
  process.exit(result.status || 1)
}

if (!fs.existsSync(appDir)) {
  console.error("Cannot apply Pinokio compatibility patch: app/ does not exist.")
  process.exit(1)
}

if (fs.existsSync(path.join(appDir, "backend", "services", "lifecycle.py"))) {
  if (process.argv.includes("--reverse")) {
    reversePatch(modernPatchPath, "Pinokio modern lifecycle")
  }
  applyPatch(modernPatchPath, "Pinokio modern lifecycle")
}

if (process.argv.includes("--reverse")) {
  reversePatch(legacyPatchPath, "legacy lifecycle/cache")
}

applyPatch(legacyPatchPath, "legacy lifecycle/cache")
