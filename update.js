module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        message: "git remote get-url origin && git pull || echo Skipping launcher pull because no launcher remote is configured."
      }
    },
    {
      method: "shell.run",
      params: {
        message: "node scripts/apply-lifecycle-cache-patch.js --reverse"
      }
    },
    {
      method: "shell.run",
      params: {
        path: "app",
        message: "git stash push -u -m pinokio-user-changes"
      }
    },
    {
      method: "shell.run",
      params: {
        path: "app",
        message: "git pull origin main"
      }
    },
    {
      method: "script.start",
      params: {
        uri: "patch.js"
      }
    },
    {
      method: "shell.run",
      params: {
        message: "node scripts/check-app-compat.js"
      }
    },
    {
      method: "shell.run",
      params: {
        path: "app",
        message: "git stash pop || echo 'Stash pop had conflicts. Run: cd app && git stash pop to resolve.'"
      }
    },
    {
      method: "shell.run",
      params: {
        venv: "../env",
        path: "app",
        message: [
          "uv pip install -r requirements.txt"
        ]
      }
    }
  ]
}
