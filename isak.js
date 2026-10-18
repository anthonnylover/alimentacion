/* Lector de informes ISAKMetry (perfil restringido).
   Uso: const datos = await ISAK.leerPDF(archivo)  ->  objeto con los valores actuales del informe.
   Requiere pdf.js (window.pdfjsLib). */
(function (global) {
  "use strict";
  const NUM = "(-?\\d+(?:[.,]\\d+)?)";
  const toNum = s => (s == null ? null : parseFloat(String(s).replace(",", ".")));
  const strip = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Etiqueta del informe -> [grupo, clave]
  const CAMPOS = [
    ["Masa corporal (kg)", null, "peso"],
    ["Talla sentado (cm)", null, "tallaSentado"],
    ["Talla (cm)", null, "talla"],
    ["Envergadura de brazos (cm)", null, "envergadura"],
    ["Triceps (mm)", "pliegues", "tri"],
    ["Subescapular (mm)", "pliegues", "sub"],
    ["Biceps (mm)", "pliegues", "bic"],
    ["Cresta iliaca (mm)", "pliegues", "cre"],
    ["Supraespinal (mm)", "pliegues", "sup"],
    ["Abdominal (mm)", "pliegues", "abd"],
    ["Muslo (mm)", "pliegues", "mus"],
    ["Pierna (mm)", "pliegues", "pan"],
    ["Brazo relajado (cm)", "perimetros", "brazoR"],
    ["Brazo flexionado y contraido (cm)", "perimetros", "brazoF"],
    ["Cintura (cm)", "perimetros", "cintura"],
    ["Caderas (cm)", "perimetros", "cadera"],
    ["Muslo medio (cm)", "perimetros", "musloM"],
    ["Pierna (cm)", "perimetros", "pantorrilla"],
    ["Humero (cm)", "diametros", "humero"],
    ["Biestiloideo (cm)", "diametros", "muneca"],
    ["Femur (cm)", "diametros", "femur"],
    ["Masa libre de grasa (kg)", null, "masaLibre"],
    ["Tejido adiposo (Kerr, 1991) (kg)", null, "tejAdiposo"],
    ["Tejido muscular (Lee, 2000) (kg)", null, "masaMusc"],
    ["Tejido oseo (Rocha, 1974) (kg)", null, "masaOsea"],
    ["Sumatorio de 6 pliegues (mm)", null, "sum6"],
    ["Sumatorio de 8 pliegues (mm)", null, "sum8"],
    ["Endomorfia", null, "endo"],
    ["Mesomorfia", null, "meso"],
    ["Ectomorfia", null, "ecto"],
    ["Indice adiposo muscular", null, "iam"],
    ["Indice musculo/oseo", null, "imo"],
    ["Indice cintura cadera", null, "icc"],
    ["Indice cintura talla", null, "ict"],
    ["IMC (kg/m2)", null, "imc"],
    ["Brazo corregido (cm)", null, "brazoCorr"],
    ["Muslo corregido (cm)", null, "musloCorr"],
    ["Pierna corregida (cm)", null, "piernaCorr"],
  ];

  function parsearTexto(lineas) {
    const L = lineas.map(l => strip(l).replace(/²/g, "2").replace(/\s+/g, " ").trim()).filter(Boolean);
    const texto = L.join("\n");
    const r = { pliegues: {}, perimetros: {}, diametros: {}, origen: "ISAKMetry" };
    const lineaDe = etiqueta => {
      const re = new RegExp("^" + escRe(etiqueta) + "\\s+" + NUM, "i");
      for (const l of L) { const m = l.match(re); if (m) return toNum(m[1]); }
      return null;
    };
    for (const [et, grupo, clave] of CAMPOS) {
      const v = lineaDe(et);
      if (v == null) continue;
      if (grupo) r[grupo][clave] = v; else r[clave] = v;
    }
    // Masa grasa: la etiqueta ocupa varias líneas (Durnin-Womersley)
    const mg = texto.match(new RegExp("Masa grasa \\(kg\\)[^\\n]*\\n?\\s*" + NUM));
    const mg2 = texto.match(new RegExp("Masa grasa \\(kg\\)[\\s\\S]{0,40}?" + NUM + "(?![\\d,])"));
    const masaGrasa = mg ? toNum(mg[1]) : mg2 ? toNum(mg2[1]) : null;
    if (masaGrasa != null && masaGrasa < 200) r.masaGrasa = masaGrasa;
    // Cabecera
    const cab = (et) => { const m = texto.match(new RegExp(escRe(et) + ":?\\s+([^\\n]+?)(?:\\s{2,}|\\s+Evaluado|\\s+Certificacion|\\s+Evaluacion|\\s+Fecha|$)", "im")); return m ? m[1].trim() : null; };
    r.nombre = cab("Nombre");
    const ed = texto.match(/Edad:?\s+(\d{1,3})/i); if (ed) r.edad = +ed[1];
    const ge = texto.match(/Genero:?\s+(Femenino|Masculino)/i); if (ge) r.sexo = ge[1][0].toUpperCase() + ge[1].slice(1).toLowerCase();
    const fe = texto.match(/Fecha:?\s+(\d{2})[-\/](\d{2})[-\/](\d{4})/i); if (fe) r.fecha = `${fe[3]}-${fe[2]}-${fe[1]}`;
    const ev = texto.match(/Evaluado por:?\s+([^\n]+?)(?:\s{2,}|$)/im); if (ev) r.evaluador = ev[1].trim();
    // Derivados
    if (r.masaGrasa != null && r.peso) r.grasaPct = Math.round(r.masaGrasa / r.peso * 1000) / 10;
    if (r.masaMusc != null && r.peso) r.masaMuscPct = Math.round(r.masaMusc / r.peso * 1000) / 10;
    const n = Object.keys(r.pliegues).length + Object.keys(r.perimetros).length + (r.peso ? 1 : 0);
    r.valido = !!(r.peso && n >= 6);
    return r;
  }

  async function lineasPDF(buffer) {
    const pdfjs = global.pdfjsLib;
    if (!pdfjs) throw new Error("pdfjs no cargado");
    const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
    const out = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const tc = await page.getTextContent();
      const filas = [];
      for (const it of tc.items) {
        if (!it.str || !it.str.trim()) continue;
        const y = it.transform[5], x = it.transform[4];
        let f = filas.find(f => Math.abs(f.y - y) < 2.5);
        if (!f) { f = { y, items: [] }; filas.push(f); }
        f.items.push({ x, s: it.str });
      }
      filas.sort((a, b) => b.y - a.y);
      for (const f of filas) out.push(f.items.sort((a, b) => a.x - b.x).map(i => i.s).join("  "));
    }
    return out;
  }

  async function leerPDF(fileOrBuffer) {
    const buf = fileOrBuffer instanceof ArrayBuffer ? fileOrBuffer : await fileOrBuffer.arrayBuffer();
    const lineas = await lineasPDF(buf);
    return parsearTexto(lineas);
  }

  global.ISAK = { leerPDF, parsearTexto, lineasPDF };
})(typeof window !== "undefined" ? window : globalThis);
