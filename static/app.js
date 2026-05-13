async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const data = await res.json();
      if (data && data.description) msg = data.description;
    } catch {}
    throw new Error(msg);
  }
  return await res.json();
}

function el(id) {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element: ${id}`);
  return node;
}

function setMeta(text) {
  el("meta").textContent = text;
}

function setOutput(obj) {
  el("output").textContent = JSON.stringify(obj, null, 2);
}

async function refreshFiles() {
  setMeta("Loading file list…");
  const data = await fetchJson("/api/files");
  const select = el("fileSelect");
  select.innerHTML = "";

  if (!data.files || data.files.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "(no CSV files found in dataset/data/)";
    select.appendChild(opt);
    setMeta("No CSV files found.");
    return;
  }

  for (const f of data.files) {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    select.appendChild(opt);
  }
  setMeta(`Found ${data.files.length} CSV file(s).`);
}

async function loadSelected() {
  const filename = el("fileSelect").value;
  if (!filename) return;
  const limit = Number(el("limitInput").value || 5000);
  setMeta(`Loading ${filename}…`);
  const data = await fetchJson(`/api/data/${encodeURIComponent(filename)}?limit=${encodeURIComponent(limit)}`);
  setMeta(`${data.file}: ${data.rowCount} row(s) loaded (limit ${limit}).`);
  setOutput(data.rows.slice(0, 50));
}

async function main() {
  el("refreshBtn").addEventListener("click", () => refreshFiles().catch((e) => setMeta(e.message)));
  el("loadBtn").addEventListener("click", () => loadSelected().catch((e) => setMeta(e.message)));
  el("fileSelect").addEventListener("change", () => loadSelected().catch((e) => setMeta(e.message)));

  try {
    await refreshFiles();
  } catch (e) {
    setMeta(e.message);
    return;
  }

  try {
    await loadSelected();
  } catch (e) {
    setMeta(e.message);
  }
}

main();
