from __future__ import annotations

import csv
import os
from pathlib import Path
from typing import Any

from flask import Flask, abort, jsonify, render_template, request



APP_DIR = Path(__file__).resolve().parent
DATA_DIR = APP_DIR / "data"


def create_app() -> Flask:
    app = Flask(__name__, template_folder=str(APP_DIR / "templates"), static_folder=str(APP_DIR / "static"))

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.get("/api/files")
    def list_files():
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        files = sorted(
            [p.name for p in DATA_DIR.iterdir() if p.is_file() and p.suffix.lower() in {".csv"}],
            key=str.lower,
        )
        return jsonify({"files": files})

    def _safe_csv_path(filename: str) -> Path:
        if not filename:
            abort(400, description="Missing filename")
        if "/" in filename or "\\" in filename:
            abort(400, description="Invalid filename")
        p = (DATA_DIR / filename).resolve()
        if DATA_DIR.resolve() not in p.parents:
            abort(400, description="Invalid filename")
        if p.suffix.lower() != ".csv":
            abort(400, description="Only .csv files are supported")
        if not p.exists() or not p.is_file():
            abort(404, description="File not found")
        return p

    @app.get("/api/data/<path:filename>")
    def read_csv(filename: str):
        p = _safe_csv_path(filename)

        limit = request.args.get("limit", default="5000")
        try:
            limit_i = max(1, min(50_000, int(limit)))
        except ValueError:
            abort(400, description="Invalid limit")

        rows: list[dict[str, Any]] = []
        with p.open("r", newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if i >= limit_i:
                    break
                rows.append(row)

        return jsonify({"file": p.name, "rows": rows, "rowCount": len(rows)})

    @app.get("/health")
    def health():
        return jsonify({"ok": True})

    return app


# Expose a top-level Flask instance for WSGI servers and `flask run`-style discovery.
app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)