# Llama GUI Pinokio Launcher

This is a Pinokio launcher for [Llama GUI](https://github.com/thomas9120/LLama-GUI), a lightweight local control panel for installing and running `llama.cpp`.

The launcher keeps Pinokio scripts at this repository root and clones the Llama GUI application into `app/`. Llama GUI itself remains responsible for installing `llama.cpp` backends, managing local models, saving presets, and launching `llama-server`.

## Use

1. Open this launcher in Pinokio.
2. Click **Install** to clone Llama GUI and install Python dependencies.
3. Click **Start** to run the local web UI.
4. Click **Open Web UI** after the server starts.
5. In Llama GUI, use the **Install** tab to download a `llama.cpp` backend.
6. Add `.gguf` models through the app's `models/` folder or the built-in Hugging Face downloader.

The Llama GUI web app runs at:

```text
http://127.0.0.1:5240
```

## Menu Actions

- **Install** clones `https://github.com/thomas9120/LLama-GUI.git` into `app/` and installs `requirements.txt` into the Pinokio-managed `env/` virtual environment.
- **Start** runs `python server.py` from `app/` and captures the local URL for the Pinokio menu.
- **Update** pulls this launcher repository, pulls the Llama GUI app repository inside `app/`, and reinstalls Python dependencies.
- **Reset** removes `app/` and `env/`.

Reset is intentionally a full launcher reset. It removes any Llama GUI data stored under `app/`, including downloaded `llama.cpp` files, models, presets, and local config.

## API

Llama GUI exposes its own local HTTP API through the web server on port `5240`. The app also launches `llama-server`, which provides OpenAI-compatible endpoints when a model is running.

### cURL

```bash
curl http://127.0.0.1:5240/api/status
```

When `llama-server` is running, use its OpenAI-compatible endpoint:

```bash
curl http://127.0.0.1:8080/v1/models
```

### Python

```python
import urllib.request

with urllib.request.urlopen("http://127.0.0.1:5240/api/status") as response:
    print(response.read().decode("utf-8"))
```

### JavaScript

```javascript
const response = await fetch("http://127.0.0.1:5240/api/status")
console.log(await response.json())
```

## Notes

- The launcher does not duplicate `llama.cpp` install logic.
- The Llama GUI **Install** tab is the source of truth for backend selection and binary downloads.
- Llama GUI currently binds to fixed port `5240`; stop any existing Llama GUI process before starting this launcher.
