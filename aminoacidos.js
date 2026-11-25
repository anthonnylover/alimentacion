/* =========================================================
   AMINOÁCIDOS · En El Músculo
   Perfil de aminoácidos de cada alimento, en miligramos de aminoácido
   por cada gramo de proteína del alimento (mg/g).
   Fuente: USDA FoodData Central (SR Legacy), alimento equivalente más
   cercano. Los alimentos parecidos comparten perfil (por ejemplo, todos
   los cortes de res usan el perfil "res").

   Patrón de referencia: FAO 2013 (informe de calidad proteica DIAAS),
   niños mayores, adolescentes y adultos (mg por g de proteína).
   No se descuenta digestibilidad: se compara el aporte bruto.
   La metionina y la cisteína se evalúan en pareja (azufrados), igual que
   la fenilalanina y la tirosina (aromáticos), porque el cuerpo fabrica
   cisteína a partir de metionina y tirosina a partir de fenilalanina.
   ========================================================= */
(function (global) {
  "use strict";

  // Orden de los 11 aminoácidos
  const AA = [
    ["his", "Histidina"], ["ile", "Isoleucina"], ["leu", "Leucina"], ["lys", "Lisina"],
    ["met", "Metionina"], ["cys", "Cisteína"], ["phe", "Fenilalanina"], ["tyr", "Tirosina"],
    ["thr", "Treonina"], ["trp", "Triptófano"], ["val", "Valina"]
  ];

  // Requerimiento FAO 2013 (mg por g de proteína). Grupos que deciden si la proteína es completa.
  const REF = { his: 16, ile: 30, leu: 61, lys: 48, saa: 23, aaa: 41, thr: 25, trp: 6.6, val: 40 };
  const GRUPO_NOMBRE = { his: "histidina", ile: "isoleucina", leu: "leucina", lys: "lisina", saa: "metionina + cisteína",
    aaa: "fenilalanina + tirosina", thr: "treonina", trp: "triptófano", val: "valina" };
  // A qué grupo pertenece cada aminoácido
  const GRUPO_DE = { his: "his", ile: "ile", leu: "leu", lys: "lys", met: "saa", cys: "saa", phe: "aaa", tyr: "aaa", thr: "thr", trp: "trp", val: "val" };

  //            his  ile  leu  lys  met  cys  phe  tyr  thr  trp  val
  const P = {
    whey:     [ 18,  62, 106,  92,  21,  24,  32,  30,  70,  18,  58],
    caseina:  [ 29,  51,  95,  80,  28,   4,  50,  55,  43,  13,  65],
    leche:    [ 27,  48,  98,  79,  25,   9,  48,  48,  45,  14,  64],
    queso:    [ 35,  49,  94,  84,  26,   6,  52,  50,  36,  13,  63],
    huevo:    [ 24,  53,  86,  72,  30,  22,  54,  40,  44,  13,  68],
    clara:    [ 23,  60,  88,  74,  37,  27,  62,  40,  45,  12,  66],
    pollo:    [ 31,  53,  81,  89,  28,  13,  40,  34,  42,  12,  50],
    res:      [ 32,  46,  80,  85,  26,  11,  40,  32,  40,   7,  50],
    cerdo:    [ 39,  46,  80,  87,  26,  11,  40,  35,  44,  12,  50],
    higado:   [ 27,  46,  92,  78,  26,  13,  52,  39,  42,  13,  62],
    pescado:  [ 29,  46,  81,  92,  30,  11,  39,  34,  44,  11,  52],
    marisco:  [ 20,  48,  79,  87,  28,  11,  42,  34,  40,  14,  47],
    embutido: [ 32,  45,  78,  82,  25,  11,  39,  32,  40,  10,  49],
    carne_aislada: [15, 20, 45, 50, 12,   5,  25,  10,  22,   2,  30], // proteína de carne hidrolizada (rica en colágeno)
    eaa:      [ 60, 100, 300, 150,  50,   0,  80,   0, 100,  20, 100], // mezcla típica de 9 EAA
    soya:     [ 27,  46,  78,  62,  13,  15,  50,  36,  39,  13,  48],
    lenteja:  [ 28,  43,  73,  70,   9,  13,  49,  27,  36,   9,  50],
    caraota:  [ 28,  44,  80,  69,  15,  11,  54,  28,  42,  12,  52],
    garbanzo: [ 28,  43,  71,  67,  13,  13,  54,  25,  37,  10,  42],
    arveja:   [ 25,  41,  72,  72,  10,  15,  47,  29,  35,  11,  47],
    haba:     [ 26,  40,  74,  64,   8,  13,  43,  32,  35,  10,  44],
    quinchoncho:[36, 36,  71,  70,  11,  12,  86,  25,  35,  10,  43],
    arroz:    [ 24,  43,  82,  36,  24,  20,  53,  33,  36,  12,  61],
    arroz_int:[ 25,  42,  83,  38,  22,  12,  52,  38,  37,  13,  59],
    arroz_salv:[26,  42,  70,  43,  30,  12,  49,  43,  32,  12,  59],
    avena:    [ 24,  41,  76,  42,  18,  24,  53,  34,  34,  14,  55],
    trigo:    [ 23,  35,  69,  25,  16,  23,  49,  26,  28,  12,  42],
    trigo_int:[ 24,  36,  68,  28,  16,  22,  47,  29,  29,  13,  44],
    gluten:   [ 20,  34,  68,  16,  16,  20,  50,  30,  25,  10,  40],
    germen:   [ 26,  36,  66,  64,  19,  20,  40,  30,  41,  11,  52],
    salvado:  [ 28,  31,  61,  39,  15,  23,  40,  28,  32,  18,  46],
    maiz:     [ 30,  36, 123,  28,  21,  18,  49,  41,  38,   7,  51],
    cebada:   [ 22,  36,  68,  37,  19,  22,  56,  29,  34,  17,  49],
    mijo:     [ 21,  42, 125,  19,  20,  19,  53,  31,  32,  11,  53],
    quinoa:   [ 29,  36,  59,  54,  22,  14,  42,  19,  30,  12,  42],
    amaranto: [ 28,  40,  58,  55,  17,  14,  40,  24,  41,  13,  48],
    alforfon: [ 23,  38,  63,  51,  13,  17,  39,  18,  38,  15,  51],
    mani:     [ 25,  34,  65,  36,  12,  13,  52,  41,  34,  10,  42],
    almendra: [ 27,  36,  70,  27,   7,   9,  54,  21,  28,  10,  41],
    nuez:     [ 25,  40,  76,  28,  15,  13,  46,  26,  39,  11,  49],
    sesamo:   [ 29,  43,  77,  32,  30,  20,  53,  42,  41,  22,  56],
    auyama_sem:[25,  40,  81,  41,  20,  11,  53,  36,  33,  19,  51],
    girasol:  [ 26,  44,  66,  36,  24,  22,  47,  32,  37,  17,  52],
    chia:     [ 32,  49,  83,  59,  36,  25,  62,  34,  43,  26,  58],
    linaza:   [ 26,  49,  67,  47,  20,  19,  52,  27,  42,  16,  59],
    coco:     [ 23,  38,  74,  44,  19,  20,  51,  31,  36,  12,  61],
    cacao:    [ 16,  38,  61,  49,  11,  18,  47,  37,  39,  15,  59],
    tuberculo:[ 21,  40,  60,  59,  16,  12,  44,  37,  36,  11,  53],
    vegetal:  [ 20,  38,  60,  55,  15,  10,  40,  28,  38,  12,  48],
    fruta:    [ 18,  30,  50,  45,  10,  10,  30,  20,  30,  10,  40]
  };
  const PERFILES = {};
  for (const k in P){ const o = {}; AA.forEach(([a], i) => { o[a] = P[k][i]; }); PERFILES[k] = o; }

  // Alimento (código) -> perfil
  const MAPA = {
    // Lácteos
    L001:"leche", L002:"leche", L003:"leche", P013:"leche", L004:"leche", L005:"leche", L006:"leche", D001:"leche",
    P014:"queso", L007:"queso", L010:"queso", P015:"queso", P015B:"queso", P015C:"queso", L008:"queso", L009:"queso",
    G020:"leche", G021:"leche",
    // Huevos
    P011:"clara", P012:"huevo", P012A:"huevo", P012B:"huevo", P012C:"huevo", P022:"huevo",
    // Carnes
    P001:"pollo", P002:"pollo", P020:"pollo", P021:"pollo", P016:"embutido",
    P003:"res", P004:"res", P018:"res", P019:"higado",
    P005:"cerdo", P030:"embutido", P031:"embutido", P032:"embutido", P033:"embutido", P034:"embutido",
    // Pescados y mariscos
    P006:"pescado", P007:"pescado", P008:"pescado", P009:"pescado", P023:"pescado", P024:"pescado", P025:"pescado",
    P026:"pescado", P027:"pescado", P028:"pescado", P035:"pescado", P010:"marisco",
    // Soya y legumbres
    PV005:"soya", PV006:"soya", PV014:"soya", PV015:"soya",
    PV001:"lenteja", PV012:"lenteja", PV002:"caraota", PV004:"caraota", PV013:"caraota",
    PV003:"garbanzo", PV010:"arveja", PV011:"haba", PV009:"quinchoncho",
    P029:"gluten",
    // Cereales
    C001:"arroz", C034:"arroz", C044:"arroz", C045:"arroz", C020:"arroz", C021:"arroz_int", C019:"arroz_int",
    C002:"arroz_int", C033:"arroz_salv",
    C011:"avena", C036:"avena", C023:"avena", C038:"avena", C022:"trigo",
    C003:"trigo", C018:"trigo", C039:"trigo", C040:"trigo", C041:"trigo", C028:"trigo", C029:"trigo",
    C012:"trigo_int", C013:"trigo_int", C027:"trigo_int", C035:"trigo_int", C042:"trigo_int",
    C025:"germen", C024:"salvado",
    C015:"maiz", C017:"maiz", C037:"maiz", C043:"maiz", V016:"maiz",
    C026:"cebada", C030:"mijo", C014:"quinoa", C031:"amaranto", C032:"alforfon",
    // Tubérculos y plátanos
    C004:"tuberculo", C005:"tuberculo", C006:"tuberculo", C007:"tuberculo", C008:"tuberculo", C009:"tuberculo",
    C010:"tuberculo", C016:"tuberculo", V014:"tuberculo", V015:"tuberculo", V013:"tuberculo",
    // Grasas, frutos secos y semillas
    G004:"mani", G006:"mani", P036:"mani", G003:"almendra", G005:"nuez", G013:"sesamo", G012:"auyama_sem",
    G011:"girasol", G007:"chia", G008:"linaza", F023:"coco", G015:"coco", G014:"cacao",
    // Suplementos
    S002:"eaa",
    // Proteínas de la tienda
    SP01:"whey", SP02:"whey", SP03:"whey", SP04:"whey", SP05:"whey", SP06:"whey", SP08:"whey",
    SP07:"caseina", SP09:"carne_aislada", SP10:"leche", SP11:"leche"
  };

  // Perfil por grupo cuando un alimento no está en el mapa (alimentos nuevos)
  function perfilPorGrupo(f){
    if (!f) return null;
    const g = f.g || "", s = (f.s || "").toLowerCase();
    if (g === "Proteína en polvo") return "whey";
    if (g === "Ganador de peso") return "leche";
    if (s.includes("legumbre")) return "caraota";
    if (s.includes("lacteo")) return "leche";
    if (s.includes("pescado")) return "pescado";
    if (s.includes("carne")) return "res";
    if (s.includes("huevo")) return "huevo";
    if (s.includes("fruta")) return "fruta";
    if (g === "Vegetal" || g === "Condimento" || g === "Funcional" || g === "Bebida") return "vegetal";
    if (g.startsWith("Carbohidrato")) return s.includes("tuberculo") || s.includes("platano") ? "tuberculo" : "trigo";
    if (g.startsWith("Grasa")) return "nuez";
    return "vegetal";
  }
  function perfilDe(f){
    if (!f) return null;
    const k = MAPA[f.c] || perfilPorGrupo(f);
    return { clave: k, aa: PERFILES[k] };
  }

  // Suma aminoácidos de una lista de {food, p} (p = gramos de proteína del alimento en esa cantidad)
  function calcular(lista){
    const aa = {}; AA.forEach(([a]) => { aa[a] = 0; });
    let prot = 0;
    for (const x of lista){
      if (!x || !x.food || !(x.p > 0)) continue;
      const pf = perfilDe(x.food); if (!pf) continue;
      prot += x.p;
      for (const [a] of AA) aa[a] += x.p * pf.aa[a];
    }
    const grupos = { his: aa.his, ile: aa.ile, leu: aa.leu, lys: aa.lys, saa: aa.met + aa.cys, aaa: aa.phe + aa.tyr, thr: aa.thr, trp: aa.trp, val: aa.val };
    let lim = null, minG = Infinity;
    for (const k in REF){ const g = grupos[k] / REF[k]; if (g < minG){ minG = g; lim = k; } }
    const completa = prot > 0 ? Math.min(prot, minG) : 0;
    const cobertura = {}; // % del requerimiento por grupo, relativo a la proteína total
    for (const k in REF) cobertura[k] = prot > 0 ? grupos[k] / (REF[k] * prot) : 0;
    return { prot, aa, grupos, completa, score: prot > 0 ? completa / prot : 0, limitante: prot > 0 ? lim : null, cobertura };
  }

  // Puntaje propio de un alimento (qué tan completa es su proteína sola)
  function puntajeAlimento(f){
    const pf = perfilDe(f); if (!pf) return null;
    let min = Infinity, lim = null;
    const g = { his: pf.aa.his, ile: pf.aa.ile, leu: pf.aa.leu, lys: pf.aa.lys, saa: pf.aa.met + pf.aa.cys, aaa: pf.aa.phe + pf.aa.tyr, thr: pf.aa.thr, trp: pf.aa.trp, val: pf.aa.val };
    for (const k in REF){ const r = g[k] / REF[k]; if (r < min){ min = r; lim = k; } }
    return { score: Math.min(1, min), limitante: min < 1 ? lim : null, grupos: g };
  }

  global.AMINO = { AA, REF, GRUPO_NOMBRE, GRUPO_DE, PERFILES, MAPA, perfilDe, calcular, puntajeAlimento };
})(window);
