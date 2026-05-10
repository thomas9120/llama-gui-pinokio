module.exports = {
  requires: {
    bundle: "ai"
  },
  run: [
    {
      method: "shell.run",
      params: {
        message: [
          "git clone https://github.com/thomas9120/LLama-GUI.git app"
        ]
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
        venv: "../env",
        path: "app",
        message: [
          "uv pip install -r requirements.txt"
        ]
      }
    }
  ]
}
