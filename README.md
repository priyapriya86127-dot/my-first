# Dataset Flask app (simple)

This folder contains a tiny Flask app to preview CSV datasets.

## Folder structure

- `dataset/app.py`: Flask app
- `dataset/data/`: put your `.csv` files here
- `dataset/templates/`: HTML template
- `dataset/static/`: JS + CSS

## Run

From the project root:

```powershell
.\covidenv\Scripts\Activate.ps1
pip install -r .\dataset\requirements.txt
python .\dataset\app.py
```

Then open `http://127.0.0.1:5000/`.

## API

- `GET /api/files` → list CSV files in `dataset/data/`
- `GET /api/data/<filename>.csv?limit=5000` → returns rows as JSON (up to limit)
