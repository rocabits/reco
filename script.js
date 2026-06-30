// ========== CONSTANTS ==========
var APP_ID = 'reco';
var STORAGE_KEY = 'reco-quantities';
var RECETAS_CACHE_KEY = 'reco-recetas-cache';
var ADMIN_EMAIL = 'roca.jlr@gmail.com';

var DEFAULT_RECETAS = [
  { id: 1, nombre: 'Ensaladilla rusa', icono: '\u{1F957}', ingredientes: [
    { nombre: 'Bolsa ensaladilla congelada', cantidad: 1 }, { nombre: 'Huevos cocidos', cantidad: 2 },
    { nombre: 'Bolsa aceitunas sin hueso', cantidad: 1 }, { nombre: 'Bote mayonesa', cantidad: 1 }]},
  { id: 2, nombre: 'Pollo estilo asi\u00E1tico', icono: '\u{1F357}', ingredientes: [
    { nombre: 'Bandeja contra muslos pollo', cantidad: 1 }, { nombre: 'Pimiento rojo', cantidad: 1 },
    { nombre: 'Calabac\u00EDn', cantidad: 1 }, { nombre: 'Cebolla', cantidad: 1 }]},
  { id: 3, nombre: 'Pollo al curry', icono: '\u{1F357}', ingredientes: [
    { nombre: 'Bandeja contra muslos pollo', cantidad: 1 }, { nombre: 'Lata leche coco', cantidad: 1 },
    { nombre: 'Zanahoria', cantidad: 4 }, { nombre: 'Cebolla', cantidad: 1 }]},
  { id: 4, nombre: 'Pasta con calabac\u00EDn y puerro', icono: '\u{1F35D}', ingredientes: [
    { nombre: 'Bolsa pasta', cantidad: 1 }, { nombre: 'Calabac\u00EDn', cantidad: 2 },
    { nombre: 'Puerro', cantidad: 1 }, { nombre: 'Lim\u00F3n', cantidad: 1 }]},
  { id: 5, nombre: 'Pasta bolo\u00F1esa', icono: '\u{1F35D}', ingredientes: [
    { nombre: 'Bolsa pasta', cantidad: 1 }, { nombre: 'Carne picada', cantidad: 1 },
    { nombre: 'Pimiento rojo', cantidad: 1 }, { nombre: 'Zanahoria', cantidad: 2 },
    { nombre: 'Cebolla', cantidad: 1 }, { nombre: 'Lata tomate frito', cantidad: 2 }]},
  { id: 6, nombre: 'Lomo en salsa', icono: '\u{1F969}', ingredientes: [
    { nombre: 'Trozo lomo', cantidad: 1 }, { nombre: 'Brick caldo verduras', cantidad: 1 },
    { nombre: 'Zanahoria', cantidad: 2 }, { nombre: 'Cebolla', cantidad: 1 }]},
  { id: 7, nombre: 'Pimientos rellenos', icono: '\u{1F372}', ingredientes: [
    { nombre: 'Bote pimientos piquillo', cantidad: 2 }, { nombre: 'Brick leche entera', cantidad: 1 },
    { nombre: 'Cebolla', cantidad: 1 }, { nombre: 'Carne picada', cantidad: 1 },
    { nombre: 'Brick nata para cocinar', cantidad: 1 }]},
  { id: 8, nombre: 'Ensalada garbanzos', icono: '\u{1F957}', ingredientes: [
    { nombre: 'Bote grande garbanzos', cantidad: 1 }, { nombre: 'Cebolla tierna', cantidad: 1 },
    { nombre: 'Bolsa aceitunas sin hueso', cantidad: 1 }, { nombre: 'Huevos cocidos', cantidad: 2 },
    { nombre: 'Lata at\u00FAn', cantidad: 2 }]},
  { id: 9, nombre: 'Ensalada patata', icono: '\u{1F954}', ingredientes: [
    { nombre: 'Patata', cantidad: 3 }, { nombre: 'Pepino', cantidad: 1 },
    { nombre: 'Tomates cherry', cantidad: 1 }]},
  { id: 10, nombre: 'Ensalada pimientos asados', icono: '\u{1F957}', ingredientes: [
    { nombre: 'Bote pimientos asados', cantidad: 1 }, { nombre: 'Bote esp\u00E1rragos blancos', cantidad: 1 },
    { nombre: 'Lata migas bonito', cantidad: 1 }, { nombre: 'Queso feta', cantidad: 1 },
    { nombre: 'Bolsa aceitunas sin hueso', cantidad: 1 }]},
  { id: 11, nombre: 'Ensalada lentejas', icono: '\u{1F957}', ingredientes: [
    { nombre: 'Bote lentejas', cantidad: 1 }, { nombre: 'Tomates cherry', cantidad: 1 },
    { nombre: 'Pepino', cantidad: 1 }, { nombre: 'Pimiento verde', cantidad: 1 },
    { nombre: 'Queso feta', cantidad: 1 }, { nombre: 'Bolsa aceitunas sin hueso', cantidad: 1 }]},
  { id: 12, nombre: 'Ensalada pulpo', icono: '\u{1F41F}', ingredientes: [
    { nombre: 'Pulpo cocido', cantidad: 1 }, { nombre: 'Tomate', cantidad: 1 },
    { nombre: 'Huevo cocido', cantidad: 1 }, { nombre: 'Patata cocida', cantidad: 2 }]}
];

// ========== STATE ==========
var supabaseClient = null;
var currentUserEmail = null;
var recetas = [];
var nextRecipeId = 100;
var quantities = loadQuantities();
var expanded = {};
var scrollState = { selection: 0, list: 0 };
var editingRecipeId = null;

// ========== STORAGE ==========
function loadQuantities() {
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

function saveQuantities() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quantities));
}

function cacheRecetas(data) {
  try {
    localStorage.setItem(RECETAS_CACHE_KEY, JSON.stringify(data));
  } catch (e) {}
}

function loadCachedRecetas() {
  try {
    var saved = localStorage.getItem(RECETAS_CACHE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

// ========== SUPABASE ==========
function initSupabase() {
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
}

function handleGoogleLogin() {
  if (!supabaseClient) return;
  var btn = document.getElementById('btnGoogleLogin');
  btn.disabled = true;
  btn.innerHTML =
    '<svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2v4"/></svg>' +
    ' Iniciando sesi\u00F3n\u2026';
  supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  });
}

function checkSession() {
  if (!supabaseClient) return Promise.resolve(null);
  return supabaseClient.auth.getSession().then(function (result) {
    var session = result.data ? result.data.session : null;
    if (!session) return null;
    return supabaseClient.from('allowed_emails')
      .select('email').in('app_id', [APP_ID, 'all'])
      .eq('email', session.user.email).maybeSingle()
      .then(function (res) {
        if (res.data) {
          currentUserEmail = session.user.email;
          return session.user.email;
        }
        supabaseClient.auth.signOut();
        showToast('No tienes permiso para acceder');
        return null;
      }).catch(function () {
        currentUserEmail = session.user.email;
        return session.user.email;
      });
  }).catch(function () { return null; });
}

function supabaseSave(data) {
  if (!supabaseClient || !currentUserEmail) return Promise.resolve();
  return supabaseClient.from('app_data').upsert({
    app_id: APP_ID,
    data: data,
    updated_at: new Date().toISOString()
  }).then(function (res) {
    if (res.error) throw res.error;
  });
}

function supabaseLoad() {
  if (!supabaseClient || !currentUserEmail) return Promise.resolve(null);
  return supabaseClient.from('app_data')
    .select('data').eq('app_id', APP_ID).maybeSingle()
    .then(function (res) {
      if (res.data && res.data.data) return res.data.data;
      return null;
    }).catch(function () { return null; });
}

// ========== AUTH UI ==========
function showLogin() {
  document.getElementById('viewLogin').classList.remove('hidden');
  document.getElementById('viewApp').classList.add('hidden');
  document.getElementById('fabAdd').style.display = 'none';
}

function hideLogin() {
  document.getElementById('viewLogin').classList.add('hidden');
  document.getElementById('viewApp').classList.remove('hidden');
}

// ========== DATA LOADING ==========
function loadRecipes() {
  return supabaseLoad().then(function (data) {
    if (data && data.recetas && data.recetas.length > 0) {
      recetas = data.recetas;
      calcNextId();
      cacheRecetas(recetas);
      return true;
    }
    var cached = loadCachedRecetas();
    if (cached && cached.length > 0) {
      recetas = cached;
      calcNextId();
      return true;
    }
    // Auto-seed on first run
    recetas = JSON.parse(JSON.stringify(DEFAULT_RECETAS));
    calcNextId();
    return supabaseSave({ recetas: recetas }).then(function () {
      cacheRecetas(recetas);
      return true;
    }).catch(function () {
      cacheRecetas(recetas);
      return true;
    });
  });
}

function calcNextId() {
  var max = 0;
  for (var i = 0; i < recetas.length; i++) {
    if (recetas[i].id > max) max = recetas[i].id;
  }
  nextRecipeId = max + 1;
}

function saveRecipesToSupabase() {
  cacheRecetas(recetas);
  return supabaseSave({ recetas: recetas });
}

// ========== RECIPE CRUD ==========
var EMOJIS = [
  '\u{1F957}', '\u{1F357}', '\u{1F35B}', '\u{1F35D}', '\u{1F969}', '\u{1F372}',
  '\u{1F41F}', '\u{1FAD8}', '\u{1F955}', '\u{1F954}', '\u{1F419}', '\u{1F966}',
  '\u{1F96C}', '\u{1F9C5}', '\u{1FAD6}', '\u{1F951}', '\u{1F345}', '\u{1F34E}',
  '\u{1F34C}', '\u{1F349}', '\u{1F347}', '\u{1F350}', '\u{1F96D}', '\u{1F33E}',
  '\u{1F36B}', '\u{1F35E}', '\u{1F382}', '\u{1F370}', '\u{1F371}', '\u{1F35C}'
];

function buildEmojiGrid(selected) {
  var grid = document.getElementById('emojiGrid');
  grid.innerHTML = '';
  for (var i = 0; i < EMOJIS.length; i++) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'emoji-option';
    if (EMOJIS[i] === selected) btn.classList.add('selected');
    btn.textContent = EMOJIS[i];
    btn.dataset.emoji = EMOJIS[i];
    btn.addEventListener('click', function () {
      grid.querySelectorAll('.emoji-option').forEach(function (el) { el.classList.remove('selected'); });
      this.classList.add('selected');
    });
    grid.appendChild(btn);
  }
}

function addIngredientRow(nombre, cantidad) {
  var list = document.getElementById('ingredientesList');
  var row = document.createElement('div');
  row.className = 'ingrediente-row';
  row.innerHTML =
    '<input type="text" placeholder="Ingrediente" value="' + (nombre || '') + '" required>' +
    '<input type="number" class="ingrediente-qty" min="1" value="' + (cantidad || 1) + '" required>' +
    '<button type="button" class="ingrediente-remove" aria-label="Eliminar ingrediente">' +
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>';
  row.querySelector('.ingrediente-remove').addEventListener('click', function () {
    row.remove();
  });
  list.appendChild(row);
}

function showRecipeModal(id) {
  editingRecipeId = id || null;
  var modal = document.getElementById('recipeModal');
  document.getElementById('modalTitle').textContent = id ? 'Editar receta' : 'Nueva receta';

  document.getElementById('inputNombre').value = '';
  document.getElementById('ingredientesList').innerHTML = '';

  if (id) {
    var receta = null;
    for (var i = 0; i < recetas.length; i++) {
      if (recetas[i].id === id) { receta = recetas[i]; break; }
    }
    if (receta) {
      document.getElementById('inputNombre').value = receta.nombre;
      buildEmojiGrid(receta.icono);
      for (var j = 0; j < receta.ingredientes.length; j++) {
        addIngredientRow(receta.ingredientes[j].nombre, receta.ingredientes[j].cantidad);
      }
    }
  } else {
    buildEmojiGrid(null);
    addIngredientRow('', 1);
  }

  modal.classList.add('open');
  document.getElementById('fabAdd').style.display = 'none';
}

function hideRecipeModal() {
  document.getElementById('recipeModal').classList.remove('open');
  document.getElementById('fabAdd').style.display = '';
  editingRecipeId = null;
}

function handleSaveRecipe(e) {
  e.preventDefault();
  var nombre = document.getElementById('inputNombre').value.trim();
  if (!nombre) return showToast('El nombre es obligatorio');

  var selectedEmoji = document.querySelector('#emojiGrid .emoji-option.selected');
  var icono = selectedEmoji ? selectedEmoji.dataset.emoji : EMOJIS[0];

  var rows = document.querySelectorAll('#ingredientesList .ingrediente-row');
  var ingredientes = [];
  var valid = true;
  for (var i = 0; i < rows.length; i++) {
    var inputs = rows[i].querySelectorAll('input[type="text"], input[type="number"]');
    var ingNombre = inputs[0].value.trim();
    var ingCantidad = parseInt(inputs[1].value) || 1;
    if (!ingNombre) { valid = false; continue; }
    ingredientes.push({ nombre: ingNombre, cantidad: ingCantidad });
  }
  if (!valid) return showToast('Completa todos los ingredientes');
  if (ingredientes.length === 0) return showToast('A\u00F1ade al menos un ingrediente');

  if (editingRecipeId) {
    for (var k = 0; k < recetas.length; k++) {
      if (recetas[k].id === editingRecipeId) {
        recetas[k].nombre = nombre;
        recetas[k].icono = icono;
        recetas[k].ingredientes = ingredientes;
        break;
      }
    }
  } else {
    recetas.push({ id: nextRecipeId++, nombre: nombre, icono: icono, ingredientes: ingredientes });
  }

  hideRecipeModal();
  refreshCards();
  updateSummary();
  updateRecipeCount();
  saveRecipesToSupabase().catch(function () { showToast('Error al guardar'); });
}

function deleteRecipe(id) {
  showConfirm('\u00BFEliminar esta receta?', function () {
    var newRecetas = [];
    for (var i = 0; i < recetas.length; i++) {
      if (recetas[i].id !== id) newRecetas.push(recetas[i]);
    }
    recetas = newRecetas;
    delete quantities[id];
    saveQuantities();
    refreshCards();
    updateSummary();
    updateRecipeCount();
    saveRecipesToSupabase().catch(function () { showToast('Error al guardar'); });
  });
}

// ========== RENDER ==========
function refreshCards() {
  var grid = document.getElementById('recipe-grid');
  grid.innerHTML = '';
  expanded = {};
  renderCards();
}

function renderCards() {
  var grid = document.getElementById('recipe-grid');
  var emptyState = document.getElementById('empty-state');

  if (recetas.length === 0) {
    emptyState.classList.remove('hidden');
    document.getElementById('selection-view').classList.add('hidden');
    document.getElementById('bottom-bar').classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  document.getElementById('selection-view').classList.remove('hidden');

  for (var i = 0; i < recetas.length; i++) {
    grid.appendChild(createCard(recetas[i]));
  }
}

function createCard(receta) {
  var card = document.createElement('div');
  card.className = 'recipe-card';
  card.dataset.id = receta.id;

  var qty = quantities[receta.id] || 0;
  if (qty > 0) card.classList.add('selected');

  var ingCount = receta.ingredientes.length;
  var ingHtml = '';
  for (var i = 0; i < ingCount; i++) {
    ingHtml += '<li>' + receta.ingredientes[i].nombre + ' x' + receta.ingredientes[i].cantidad + '</li>';
  }

  card.innerHTML =
    '<div class="card-header">' +
      '<span class="card-icon">' + receta.icono + '</span>' +
      '<span class="card-name">' + receta.nombre + '</span>' +
      '<div class="card-actions">' +
        '<button class="card-action-btn edit-btn" title="Editar">\u270F\uFE0F</button>' +
        '<button class="card-action-btn delete-btn" title="Eliminar">\u{1F5D1}\uFE0F</button>' +
      '</div>' +
    '</div>' +
    '<div class="card-quantity">' +
      '<button class="qty-btn qty-minus">\u2212</button>' +
      '<span class="qty-value">' + qty + '</span>' +
      '<button class="qty-btn qty-plus">+</button>' +
    '</div>' +
    '<div class="card-toggle">' +
      '<button class="toggle-btn">\u25BC Ver ingredientes (' + ingCount + ')</button>' +
    '</div>' +
    '<div class="card-ingredients">' +
      '<ul>' + ingHtml + '</ul>' +
    '</div>';

  card.querySelector('.qty-minus').addEventListener('click', function (e) {
    e.stopPropagation();
    updateQuantity(receta.id, -1);
  });

  card.querySelector('.qty-plus').addEventListener('click', function (e) {
    e.stopPropagation();
    updateQuantity(receta.id, 1);
  });

  card.querySelector('.toggle-btn').addEventListener('click', function (e) {
    e.stopPropagation();
    toggleIngredients(receta.id);
  });

  card.querySelector('.edit-btn').addEventListener('click', function (e) {
    e.stopPropagation();
    showRecipeModal(receta.id);
  });

  card.querySelector('.delete-btn').addEventListener('click', function (e) {
    e.stopPropagation();
    deleteRecipe(receta.id);
  });

  return card;
}

// ========== QUANTITY / SUMMARY ==========
function updateQuantity(id, delta) {
  var current = quantities[id] || 0;
  var newQty = Math.max(0, current + delta);
  if (newQty === 0) { delete quantities[id]; }
  else { quantities[id] = newQty; }
  saveQuantities();

  var card = document.querySelector('.recipe-card[data-id="' + id + '"]');
  if (card) {
    card.querySelector('.qty-value').textContent = newQty;
    if (newQty > 0) { card.classList.add('selected'); }
    else { card.classList.remove('selected'); }
  }
  updateSummary();
}

function toggleIngredients(id) {
  var isOpen = expanded[id] || false;
  expanded[id] = !isOpen;
  var card = document.querySelector('.recipe-card[data-id="' + id + '"]');
  if (!card) return;
  var ingredients = card.querySelector('.card-ingredients');
  var btn = card.querySelector('.toggle-btn');
  var receta = null;
  for (var i = 0; i < recetas.length; i++) {
    if (recetas[i].id === id) { receta = recetas[i]; break; }
  }
  var count = receta ? receta.ingredientes.length : 0;
  if (expanded[id]) {
    ingredients.style.maxHeight = ingredients.scrollHeight + 'px';
    btn.textContent = '\u25B2 Ocultar ingredientes (' + count + ')';
  } else {
    ingredients.style.maxHeight = '0';
    btn.textContent = '\u25BC Ver ingredientes (' + count + ')';
  }
}

function updateSummary() {
  var selectedCount = 0;
  var totalDishes = 0;
  var totalIngredients = 0;
  for (var i = 0; i < recetas.length; i++) {
    var receta = recetas[i];
    var qty = quantities[receta.id] || 0;
    if (qty > 0) {
      selectedCount++;
      totalDishes += qty;
      for (var j = 0; j < receta.ingredientes.length; j++) {
        totalIngredients += receta.ingredientes[j].cantidad * qty;
      }
    }
  }
  var el = document.getElementById('summary-text');
  if (el) {
    el.textContent = selectedCount + ' recetas \u00B7 ' + totalDishes + ' platos \u00B7 ' + totalIngredients + ' ingredientes';
  }
}

function updateRecipeCount() {
  var el = document.getElementById('headerTitle');
  if (el) {
    var n = recetas.length;
    el.textContent = 'RECO: Recetas (' + n + ')';
  }
}

// ========== LIST VIEW ==========
function showList() {
  var hasSelection = false;
  for (var i = 0; i < recetas.length; i++) {
    if ((quantities[recetas[i].id] || 0) > 0) { hasSelection = true; break; }
  }
  if (!hasSelection) {
    showToast('Selecciona al menos una receta');
    return;
  }

  saveScroll('selection');

  var items = aggregateIngredients();
  var listEl = document.getElementById('shopping-list');
  var listHtml = '';
  for (var i = 0; i < items.length; i++) {
    listHtml += '<li class="list-item" style="animation-delay:' + (i * 0.03) + 's">' + items[i][0] + ' x' + items[i][1] + '</li>';
  }
  listEl.innerHTML = listHtml;
  document.getElementById('list-stats').textContent = items.length + ' ingredientes distintos';

  document.getElementById('selection-view').classList.add('hidden');
  document.getElementById('empty-state').classList.add('hidden');
  document.getElementById('list-view').classList.remove('hidden');
  document.getElementById('bottom-bar').classList.add('hidden');
  document.getElementById('fabAdd').style.display = 'none';

  restoreScroll('list');
}

function showSelection() {
  saveScroll('list');
  document.getElementById('list-view').classList.add('hidden');
  document.getElementById('selection-view').classList.remove('hidden');
  document.getElementById('bottom-bar').classList.remove('hidden');
  document.getElementById('fabAdd').style.display = '';
  restoreScroll('selection');
}

function aggregateIngredients() {
  var map = new Map();
  for (var i = 0; i < recetas.length; i++) {
    var receta = recetas[i];
    var qty = quantities[receta.id] || 0;
    if (qty === 0) continue;
    for (var j = 0; j < receta.ingredientes.length; j++) {
      var ing = receta.ingredientes[j];
      map.set(ing.nombre, (map.get(ing.nombre) || 0) + ing.cantidad * qty);
    }
  }
  return [...map.entries()].sort(function (a, b) { return a[0].localeCompare(b[0]); });
}

function copyList() {
  var items = aggregateIngredients();
  if (items.length === 0) { showToast('No hay ingredientes para copiar'); return; }
  var text = '\u{1F6D2} Lista de la compra\n\n';
  for (var i = 0; i < items.length; i++) {
    text += '- ' + items[i][0] + ' x' + items[i][1] + '\n';
  }
  text = text.trimEnd();
  navigator.clipboard.writeText(text)
    .then(function () { showToast('\u2705 Lista copiada al portapapeles'); })
    .catch(function () { showToast('Error al copiar la lista'); });
}

function resetAll() {
  Object.keys(quantities).forEach(function (k) { delete quantities[k]; });
  saveQuantities();
  var qtyEls = document.querySelectorAll('.qty-value');
  for (var i = 0; i < qtyEls.length; i++) { qtyEls[i].textContent = '0'; }
  var cards = document.querySelectorAll('.recipe-card');
  for (var i = 0; i < cards.length; i++) { cards[i].classList.remove('selected'); }
  Object.keys(expanded).forEach(function (id) {
    delete expanded[id];
    var card = document.querySelector('.recipe-card[data-id="' + id + '"]');
    if (card) {
      card.querySelector('.card-ingredients').style.maxHeight = '0';
      for (var j = 0; j < recetas.length; j++) {
        if (recetas[j].id === parseInt(id)) {
          var count = recetas[j].ingredientes.length;
          var btn = card.querySelector('.toggle-btn');
          if (btn) btn.textContent = '\u25BC Ver ingredientes (' + count + ')';
          break;
        }
      }
    }
  });
  updateSummary();
}

// ========== SCROLL ==========
function saveScroll(view) {
  var el = document.getElementById('main-content');
  if (el) scrollState[view] = el.scrollTop;
}

function restoreScroll(view) {
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      var el = document.getElementById('main-content');
      if (el) el.scrollTop = scrollState[view];
    });
  });
}

// ========== TOAST ==========
var toastTimeout;
function showToast(msg) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(function () { toast.classList.remove('show'); }, 2000);
}

// ========== HELPERS ==========
function escapeHtml(str) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

var confirmCallback = null;

function showConfirm(message, onConfirm, buttonText) {
  confirmCallback = onConfirm;
  document.getElementById('confirmText').textContent = message;
  document.getElementById('btnConfirmOk').textContent = buttonText || 'Eliminar';
  if (buttonText === 'Crear') {
    document.getElementById('confirmIcon').innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
  } else {
    document.getElementById('confirmIcon').innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  }
  document.getElementById('modalConfirm').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeConfirm() {
  confirmCallback = null;
  document.getElementById('modalConfirm').classList.remove('open');
  document.body.style.overflow = '';
}

// ========== VIEWS ==========
function hideAllViews() {
  document.getElementById('viewUsuarios').classList.remove('active');
}

// ========== ADMIN: USER MANAGEMENT ==========
function showUsuarios() {
  hideAllViews();
  document.getElementById('empty-state').classList.add('hidden');
  document.getElementById('selection-view').classList.add('hidden');
  document.getElementById('list-view').classList.add('hidden');
  document.getElementById('bottom-bar').classList.add('hidden');
  document.getElementById('summary-bar').classList.add('hidden');
  document.getElementById('viewUsuarios').classList.add('active');
  document.getElementById('fabAdd').style.display = '';
  document.getElementById('btnBack').classList.add('visible');
  document.getElementById('headerTitle').textContent = 'RECO: Usuarios';
  renderUsuarios();
}

function hideUsuarios() {
  document.getElementById('viewUsuarios').classList.remove('active');
  document.getElementById('summary-bar').classList.remove('hidden');
  document.getElementById('bottom-bar').classList.remove('hidden');
  document.getElementById('btnBack').classList.remove('visible');
  document.getElementById('headerTitle').textContent = 'RECO';
  if (document.getElementById('list-view').classList.contains('hidden')) {
    document.getElementById('selection-view').classList.remove('hidden');
    document.getElementById('fabAdd').style.display = '';
  } else {
    document.getElementById('fabAdd').style.display = 'none';
  }
}

function renderUsuarios() {
  if (!supabaseClient) return;
  supabaseClient.from('allowed_emails').select('email').eq('app_id', APP_ID).then(function (res) {
    var html = '';
    if (res.data) {
      var filtered = res.data.filter(function (r) { return r.email !== currentUserEmail; });
      for (var i = 0; i < filtered.length; i++) {
        html += '<div class="player-card" style="cursor:default">' +
          '<div class="player-info"><div class="player-name" style="font-size:14px;text-transform:none">' + escapeHtml(filtered[i].email) + '</div></div>' +
          '<button class="btn-edit" data-email="' + escapeHtml(filtered[i].email) + '" aria-label="Editar usuario">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
          '</button>' +
          '<button class="btn-delete" data-email="' + escapeHtml(filtered[i].email) + '" aria-label="Eliminar usuario">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>' +
          '</button></div>';
      }
    }
    document.getElementById('usuariosList').innerHTML = html || '<div class="empty-state"><p class="empty-title">No hay usuarios</p><p class="empty-sub">A\u00F1ade el primer email</p></div>';
  });
}

function openUsuarioModal(email) {
  document.getElementById('inviteEmail').value = email || '';
  document.getElementById('editUsuarioEmail').value = email || '';
  document.getElementById('usuarioModalTitle').textContent = email ? 'Editar usuario' : 'Nuevo usuario';
  document.getElementById('modalUsuario').classList.add('open');
  setTimeout(function () { document.getElementById('inviteEmail').focus(); }, 350);
}

function closeUsuarioModal() {
  document.getElementById('modalUsuario').classList.remove('open');
  document.getElementById('editUsuarioEmail').value = '';
}

function saveUsuario() {
  var input = document.getElementById('inviteEmail');
  var email = input.value.trim();
  if (!email || email.indexOf('@') === -1) {
    showToast('Email no v\u00E1lido');
    return;
  }
  if (!supabaseClient) return;
  var oldEmail = document.getElementById('editUsuarioEmail').value;
  var doInsert = function () {
    supabaseClient.from('allowed_emails').insert({ app_id: APP_ID, email: email }).then(function (res) {
      if (res.error) {
        showToast('Error al guardar: ' + res.error.message);
      } else {
        closeUsuarioModal();
        renderUsuarios();
        showToast(oldEmail ? 'Usuario actualizado' : 'Usuario a\u00F1adido');
      }
    });
  };
  if (oldEmail && oldEmail !== email) {
    supabaseClient.from('allowed_emails').delete().eq('app_id', APP_ID).eq('email', oldEmail).then(function (res) {
      if (res.error) {
        showToast('Error al actualizar');
      } else {
        doInsert();
      }
    });
  } else {
    doInsert();
  }
}

function removeUsuario(email) {
  showConfirm('\u00BF Eliminar a ' + email + '?', function () {
    supabaseClient.from('allowed_emails').delete().eq('app_id', APP_ID).eq('email', email).then(function (res) {
      if (res.error) {
        showToast('Error al eliminar');
      } else {
        renderUsuarios();
        showToast('Usuario eliminado');
      }
    });
  });
}

function logout() {
  if (supabaseClient) {
    supabaseClient.auth.signOut();
  }
  currentUserEmail = null;
  recetas = [];
  quantities = {};
  expanded = {};
  saveQuantities();
  hideUsuarios();
  document.getElementById('fabAdd').style.display = 'none';
  showLogin();
}

// ========== SERVICE WORKER ==========
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

// ========== INIT ==========
function init() {
  initSupabase();
  document.getElementById('fabAdd').style.display = 'none';

  checkSession().then(function (email) {
    if (email) {
      currentUserEmail = email;

      loadRecipes().then(function () {
        hideLogin();
        renderCards();
        updateSummary();
        updateRecipeCount();
        document.getElementById('fabAdd').style.display = '';

        // Event listeners
        document.getElementById('btn-generate').addEventListener('click', showList);
        document.getElementById('btn-reset').addEventListener('click', resetAll);
        document.getElementById('btn-copy').addEventListener('click', copyList);
        document.getElementById('btn-back').addEventListener('click', showSelection);
        document.getElementById('fabAdd').addEventListener('click', function () {
          if (document.getElementById('viewUsuarios').classList.contains('active')) {
            openUsuarioModal();
          } else {
            showRecipeModal(null);
          }
        });
        document.getElementById('btnAddIngrediente').addEventListener('click', function () { addIngredientRow('', 1); });
        document.getElementById('btnCancelModal').addEventListener('click', hideRecipeModal);
        document.getElementById('btnCancelModal2').addEventListener('click', hideRecipeModal);
        document.getElementById('recipeForm').addEventListener('submit', handleSaveRecipe);
        document.getElementById('modalBackdrop').addEventListener('click', hideRecipeModal);

        // Back button
        document.getElementById('btnBack').addEventListener('click', function () {
          if (document.getElementById('viewUsuarios').classList.contains('active')) {
            hideUsuarios();
          }
        });

        // Admin
        document.getElementById('btnLogo').addEventListener('click', function () {
          if (email !== ADMIN_EMAIL) return;
          if (document.getElementById('viewUsuarios').classList.contains('active')) {
            hideUsuarios();
          } else {
            showUsuarios();
          }
        });
        document.getElementById('modalUsuarioClose').addEventListener('click', closeUsuarioModal);
        document.getElementById('modalUsuarioOverlay').addEventListener('click', closeUsuarioModal);
        document.getElementById('usuariosList').addEventListener('click', function (e) {
          if (e.target.closest('.btn-delete')) {
            removeUsuario(e.target.closest('.btn-delete').dataset.email);
          } else if (e.target.closest('.btn-edit')) {
            openUsuarioModal(e.target.closest('.btn-edit').dataset.email);
          }
        });
        document.getElementById('usuarioForm').addEventListener('submit', function (e) {
          e.preventDefault();
          saveUsuario();
        });

        // Confirm modal
        document.getElementById('btnConfirmOk').addEventListener('click', function () {
          if (confirmCallback) confirmCallback();
          closeConfirm();
        });
        document.getElementById('btnConfirmCancel').addEventListener('click', closeConfirm);
        document.getElementById('modalConfirmOverlay').addEventListener('click', closeConfirm);
      });
    } else {
      showLogin();
      document.getElementById('btnGoogleLogin').addEventListener('click', handleGoogleLogin);
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
