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
        path: "app",
        message: "git pull"
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
