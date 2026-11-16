/**
 * ARQUIVO ZERO — módulo de campanha original, Foundry V13–V14 / Delta Green.
 * Os documentos são importados APENAS quando o GM confirma; nenhum conteúdo
 * restrito ao Handler é publicado por padrão. Não altera fichas do sistema.
 */
const ID = "arquivo-zero";
const VERSION = "1.1.0";
const BASE = `modules/${ID}`;
const DialogV2 = () => foundry.applications.api.DialogV2;
const escapeText = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const mark = (key) => ({ [ID]: { key, version: VERSION, managed: true } });
const gmOnly = () => Boolean(game.user?.isGM);
const notify = (msg) => ui.notifications.info(`Arquivo Zero: ${msg}`);

async function readData(filename) {
  const response = await fetch(`${BASE}/data/${filename}`, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Falha ao carregar ${filename} (HTTP ${response.status})`);
  return response.json();
}

async function folderFor(type, name, cache) {
  const key = `${type}/${name}`;
  if (cache.has(key)) return cache.get(key);
  const folderName = `AZ | ${name}`;
  let folder = game.folders.find(f => f.type === type && f.name === folderName);
  if (!folder) folder = await Folder.create({ name: folderName, type, color: name.includes("Jogador") ? "#46524b" : "#26332d" });
  cache.set(key, folder.id);
  return folder.id;
}

function already(collection, key) {
  return collection.some(doc => doc.getFlag?.(ID, "key") === key);
}

async function importJournals(cache, tally) {
  const data = await readData("journals.json");
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (already(game.journal, row.key)) { tally.skipped++; continue; }
    const folder = await folderFor("JournalEntry", row.collection, cache);
    const ownership = { default: row.access === "player" ? 2 : 0 };
    const pages = row.pages.map((p, n) => ({
      name: p.name, type: "text", sort: n * 100000,
      text: { format: 1, content: p.html }
    }));
    try {
      await JournalEntry.create({ name: row.name, folder, ownership, pages, flags: mark(row.key) });
      tally.journals++;
    } catch (err) { tally.errors.push(`Diário ${row.name}: ${err.message}`); console.error("Arquivo Zero", row.key, err); }
    if (i && i % 25 === 0) ui.notifications.info(`Arquivo Zero: ${i}/${data.length} diários processados`);
  }
}

async function importActors(cache, tally) {
  const data = await readData("actors.json");
  const folder = await folderFor("Actor", "Handler / NPCs", cache);
  for (const row of data) {
    if (already(game.actors, row.key)) { tally.skipped++; continue; }
    try {
      await Actor.create({
        name: row.name, type: "npc", folder, img: row.img,
        ownership: { default: 0 }, flags: mark(row.key),
        system: { notes: row.notes },
        prototypeToken: { actorLink: true, disposition: 0, texture: { src: row.img } }
      });
      tally.actors++;
    } catch (err) { tally.errors.push(`NPC ${row.name}: ${err.message}`); console.error("Arquivo Zero", row.key, err); }
  }
}

async function importItems(cache, tally) {
  const data = await readData("items.json");
  const folder = await folderFor("Item", "Jogador / Equipamentos", cache);
  for (const row of data) {
    if (already(game.items, row.key)) { tally.skipped++; continue; }
    try {
      await Item.create({
        name: row.name, type: "gear", folder,
        ownership: { default: 2 }, system: { description: row.description }, flags: mark(row.key)
      });
      tally.items++;
    } catch (err) { tally.errors.push(`Item ${row.name}: ${err.message}`); console.error("Arquivo Zero", row.key, err); }
  }
}

async function importScenes(cache, tally) {
  const data = await readData("scenes.json");
  const folder = await folderFor("Scene", "Handler / Linha de Fratura", cache);
  for (const row of data) {
    if (already(game.scenes, row.key)) { tally.skipped++; continue; }
    try {
      await Scene.create({
        name: row.name, folder, navigation: false, active: false,
        width: row.width, height: row.height, padding: 0,
        background: { src: row.background },
        grid: { type: 1, size: row.gridSize ?? 128, distance: row.battleMap ? 1.5 : 2, units: "m" },
        tokenVision: true, fog: { exploration: true, overlay: null },
        environment: { darknessLevel: 0, globalLight: { enabled: true } },
        walls: row.walls,
        flags: mark(row.key)
      });
      tally.scenes++;
    } catch (err) { tally.errors.push(`Cena ${row.name}: ${err.message}`); console.error("Arquivo Zero", row.key, err); }
  }
}

const macroDefinitions = [
  ["Painel de operações", "painel", "game.modules.get('arquivo-zero').api.openPanel();"],
  ["Revelar evidência", "revelar", "game.modules.get('arquivo-zero').api.revealHandout();"],
  ["Avançar relógio", "relogio", "game.modules.get('arquivo-zero').api.advanceClock();"],
  ["Importar conteúdo faltante", "importar", "game.modules.get('arquivo-zero').api.install();"]
];
async function importMacros(cache, tally) {
  const folder = await folderFor("Macro", "Handler / Operações", cache);
  for (const [name, key, command] of macroDefinitions) {
    const id = `macro-${key}`;
    if (already(game.macros, id)) { tally.skipped++; continue; }
    try {
      await Macro.create({ name: `AZ | ${name}`, type: "script", command, folder, ownership: { default: 0 }, flags: mark(id) });
      tally.macros++;
    } catch (err) { tally.errors.push(`Macro ${name}: ${err.message}`); console.error("Arquivo Zero", id, err); }
  }
}

let installing = false;
export async function install() {
  if (!gmOnly()) return ui.notifications.warn("Somente o Handler pode importar o material de campanha.");
  if (game.system.id !== "deltagreen") return ui.notifications.error("Abra um mundo criado com o sistema Delta Green.");
  if (installing) return notify("Importação em andamento");
  const yes = await DialogV2().confirm({
    window: { title: "Arquivo Zero | Importação controlada" },
    content: `<p>Serão criados diários, NPCs, equipamentos, cenas com paredes e macros no <strong>mundo atual</strong>.</p>
       <p><strong>Sigilo:</strong> livros do Handler, dossiês, evidências e NPCs permanecem ocultos aos jogadores. Somente o manual do agente e os equipamentos serão visíveis.</p>
       <p>Objetos já importados pelo módulo não serão substituídos. É recomendável fazer backup do mundo antes da importação.</p>`,
    rejectClose: false, modal: true
  });
  if (!yes) return;
  installing = true;
  const tally = { journals: 0, actors: 0, items: 0, scenes: 0, macros: 0, skipped: 0, errors: [] };
  const folders = new Map();
  notify("Iniciando importação. Não feche o mundo durante a operação.");
  try {
    await importJournals(folders, tally);
    await importActors(folders, tally);
    await importItems(folders, tally);
    await importScenes(folders, tally);
    await importMacros(folders, tally);
    await game.settings.set(ID, "onboarded", true);
    const summary = `Diários: ${tally.journals}; NPCs: ${tally.actors}; itens: ${tally.items}; cenas: ${tally.scenes}; macros: ${tally.macros}; já existentes: ${tally.skipped}.`;
    if (tally.errors.length) {
      ui.notifications.warn(`Arquivo Zero: importação parcial (${tally.errors.length} erros). Consulte o console F12.`);
      console.warn("Arquivo Zero | Falhas", tally.errors);
    } else notify(`Importação concluída. ${summary}`);
    return tally;
  } catch (err) {
    console.error("Arquivo Zero | Erro na importação", err);
    ui.notifications.error(`Arquivo Zero: importação interrompida. ${err.message}`);
    return tally;
  } finally { installing = false; }
}

function clocks() {
  return game.settings.get(ID, "clocks") || { publico: 0, anomalia: 0 };
}
function dots(value, max) { return "▮".repeat(value) + "▯".repeat(max - value); }
export async function advanceClock() {
  if (!gmOnly()) return;
  const current = clocks();
  const choice = await DialogV2().prompt({
    window: { title: "AZ | Relógios operacionais" },
    content: `<p><b>Exposição pública</b> ${dots(current.publico, 4)} (${current.publico}/4)</p>
      <p><b>Escalada anômala</b> ${dots(current.anomalia, 6)} (${current.anomalia}/6)</p>
      <select name="track"><option value="publico">Exposição pública (máximo 4)</option><option value="anomalia">Escalada anômala (máximo 6)</option></select>
      <select name="direction"><option value="1">Avançar +1</option><option value="-1">Recuar -1</option><option value="reset">Zerar ambos</option></select>`,
    ok: { label: "Aplicar", callback: (_event, button) => ({
      track: button.form.elements.track.value,
      direction: button.form.elements.direction.value
    }) },
    rejectClose: false
  });
  if (!choice) return;
  const next = { ...current };
  if (choice.direction === "reset") { next.publico = 0; next.anomalia = 0; }
  else {
    const max = choice.track === "publico" ? 4 : 6;
    next[choice.track] = Math.min(max, Math.max(0, next[choice.track] + Number(choice.direction)));
  }
  await game.settings.set(ID, "clocks", next);
  notify(`Relógios: público ${next.publico}/4; anomalia ${next.anomalia}/6`);
  return next;
}

export async function revealHandout() {
  if (!gmOnly()) return;
  const docs = game.journal.filter(j => String(j.getFlag(ID, "key") ?? "").startsWith("handout-"));
  if (!docs.length) return ui.notifications.warn("Importe primeiro as evidências do módulo.");
  const options = docs.map(d => `<option value="${escapeText(d.id)}">${escapeText(d.name)}</option>`).join("");
  const selected = await DialogV2().prompt({
    window: { title: "AZ | Revelar handout aos jogadores" },
    content: `<p>O documento escolhido ficará acessível a <strong>todos os jogadores</strong> até que o Handler altere sua permissão.</p>
      <select name="handout" style="width:100%">${options}</select>`,
    ok: { label: "Revelar", callback: (_event, button) => button.form.elements.handout.value },
    rejectClose: false
  });
  if (!selected) return;
  const entry = game.journal.get(selected);
  if (!entry) return;
  await entry.update({ "ownership.default": 2 });
  // Permissões de páginas são herdadas da entrada; não remove outros controles.
  await ChatMessage.create({ content: `<p><strong>DCA | EVIDÊNCIA DESCLASSIFICADA</strong></p><p>@UUID[${entry.uuid}]{${escapeText(entry.name)}}</p>` });
  notify(`${entry.name} liberada no diário e no chat`);
}

export async function openPanel() {
  if (!gmOnly()) return ui.notifications.warn("Painel reservado ao Handler.");
  const c = clocks();
  const imported = game.journal.some(j => j.getFlag?.(ID, "key") === "painel-guia");
  const choice = await DialogV2().wait({
    window: { title: "ARQUIVO ZERO | CENTRAL DE OPERAÇÕES" },
    content: `<section class="az-panel"><p class="az-ident">DCA / ÂNCORA-6 · EDIÇÃO ${VERSION}</p>
      <h2>Central de Operações</h2>
      <p>${imported ? "Conteúdo importado. Reimportar apenas cria documentos ausentes." : "O conteúdo ainda não foi importado neste mundo."}</p>
      <p>EXPOSIÇÃO PÚBLICA &nbsp; ${dots(c.publico,4)} <strong>${c.publico}/4</strong></p>
      <p>ESCALADA ANÔMALA &nbsp; ${dots(c.anomalia,6)} <strong>${c.anomalia}/6</strong></p>
      <p class="az-warning">Os dossiês e as evidências iniciam restritos ao Handler.</p></section>`,
    buttons: [
      { action: "import", label: "Importar / completar", callback: () => "import" },
      { action: "clock", label: "Relógios", callback: () => "clock" },
      { action: "handout", label: "Revelar evidência", callback: () => "handout" },
      { action: "close", label: "Fechar", default: true, callback: () => "close" }
    ],
    rejectClose: false
  });
  if (choice === "import") return install();
  if (choice === "clock") return advanceClock();
  if (choice === "handout") return revealHandout();
}

Hooks.once("init", () => {
  game.settings.register(ID, "onboarded", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register(ID, "clocks", { scope: "world", config: false, type: Object, default: { publico: 0, anomalia: 0 } });
  game.keybindings.register(ID, "openPanel", {
    name: "Arquivo Zero | Abrir painel do Handler",
    hint: "Abrir central de operações (apenas GM).",
    editable: [{ key: "KeyZ", modifiers: ["ALT", "SHIFT"] }],
    onDown: () => { if (!gmOnly()) return false; void openPanel(); return true; },
    restricted: true
  });
});
Hooks.on("getSceneControlButtons", controls => {
  if (!gmOnly()) return;
  const target = controls.notes?.tools ? controls.notes : controls.tokens?.tools ? controls.tokens : null;
  if (!target) return;
  target.tools[ID] = {
    name: ID,
    title: "Arquivo Zero — Central de Operações",
    icon: "fa-solid fa-folder-closed",
    order: Object.keys(target.tools).length + 10,
    visible: true,
    button: true,
    onChange: () => { void openPanel(); }
  };
});
Hooks.once("ready", async () => {
  const mod = game.modules.get(ID);
  if (mod) mod.api = { install, openPanel, revealHandout, advanceClock, version: VERSION };
  if (game.system.id !== "deltagreen") return;
  if (gmOnly() && !game.settings.get(ID, "onboarded")) {
    const start = await DialogV2().confirm({
      window: { title: "Arquivo Zero | Bem-vindo, Handler" },
      content: `<p>Este módulo disponibiliza livros, oito operações, handouts, atores e mapas para Delta Green.</p>
        <p>Deseja iniciar a importação orientada neste mundo?</p>
        <p>Você poderá abrir novamente pelo botão de pasta nas ferramentas da cena ou <strong>Alt+Shift+Z</strong>.</p>`,
      rejectClose: false
    });
    await game.settings.set(ID, "onboarded", true);
    if (start) void install();
  }
});
