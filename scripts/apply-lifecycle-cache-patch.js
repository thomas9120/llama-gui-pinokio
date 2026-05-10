const { spawnSync } = require("child_process")
const fs = require("fs")
const path = require("path")

const root = path.resolve(__dirname, "..")
const appDir = path.join(root, "app")
const patchPath = path.join(root, "patches", "lifecycle-cache.patch")

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

if (!fs.existsSync(appDir)) {
  console.error("Cannot apply lifecycle/cache patch: app/ does not exist.")
  process.exit(1)
}

if (!fs.existsSync(patchPath)) {
  console.error("Cannot apply lifecycle/cache patch: patches/lifecycle-cache.patch does not exist.")
  process.exit(1)
}

let result = runGit(["apply", "--check", patchPath])
if (result.status === 0) {
  result = runGit(["apply", "--whitespace=nowarn", patchPath])
  printResult(result)
  if (result.status !== 0) process.exit(result.status || 1)
  console.log("Applied lifecycle/cache patch.")
  process.exit(0)
}

const reverseCheck = runGit(["apply", "--reverse", "--check", patchPath])
if (reverseCheck.status === 0) {
  console.log("Lifecycle/cache patch is already applied.")
  process.exit(0)
}

printResult(result)
process.exit(result.status || 1)
