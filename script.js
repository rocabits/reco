const STORAGE_KEY = 'reco-quantities';

const recetas = [
  {
    id: 1,
    nombre: 'Ensaladilla rusa',
    icono: '\u{1F957}',
    ingredientes: [
      { nombre: 'Bolsa ensaladilla congelada', cantidad: 1 },
      { nombre: 'Huevos cocidos', cantidad: 2 },
      { nombre: 'Bolsa aceitunas sin hueso', cantidad: 1 },
      { nombre: 'Bote mayonesa', cantidad: 1 }
    ]
  },
  {
    id: 2,
    nombre: 'Pollo estilo asi\u00E1tico',
    icono: '\u{1F357}',
    ingredientes: [
      { nombre: 'Bandeja contra muslos pollo', cantidad: 1 },
      { nombre: 'Pimiento rojo', cantidad: 1 },
      { nombre: 'Calabac\u00EDn', cantidad: 1 },
      { nombre: 'Cebolla', cantidad: 1 }
    ]
  },
  {
    id: 3,
    nombre: 'Pollo al curry',
    icono: '\u{1F357}',
    ingredientes: [
      { nombre: 'Bandeja contra muslos pollo', cantidad: 1 },
      { nombre: 'Lata leche coco', cantidad: 1 },
      { nombre: 'Zanahoria', cantidad: 4 },
      { nombre: 'Cebolla', cantidad: 1 }
    ]
  },
  {
    id: 4,
    nombre: 'Pasta con calabac\u00EDn y puerro',
    icono: '\u{1F35D}',
    ingredientes: [
      { nombre: 'Bolsa pasta', cantidad: 1 },
      { nombre: 'Calabac\u00EDn', cantidad: 2 },
      { nombre: 'Puerro', cantidad: 1 },
      { nombre: 'Lim\u00F3n', cantidad: 1 }
    ]
  },
  {
    id: 5,
    nombre: 'Pasta bolo\u00F1esa',
    icono: '\u{1F35D}',
    ingredientes: [
      { nombre: 'Bolsa pasta', cantidad: 1 },
      { nombre: 'Carne picada', cantidad: 1 },
      { nombre: 'Pimiento rojo', cantidad: 1 },
      { nombre: 'Zanahoria', cantidad: 2 },
      { nombre: 'Cebolla', cantidad: 1 },
      { nombre: 'Lata tomate frito', cantidad: 2 }
    ]
  },
  {
    id: 6,
    nombre: 'Lomo en salsa',
    icono: '\u{1F969}',
    ingredientes: [
      { nombre: 'Trozo lomo', cantidad: 1 },
      { nombre: 'Brick caldo verduras', cantidad: 1 },
      { nombre: 'Zanahoria', cantidad: 2 },
      { nombre: 'Cebolla', cantidad: 1 }
    ]
  },
  {
    id: 7,
    nombre: 'Pimientos rellenos',
    icono: '\u{1F372}',
    ingredientes: [
      { nombre: 'Bote pimientos piquillo', cantidad: 2 },
      { nombre: 'Brick leche entera', cantidad: 1 },
      { nombre: 'Cebolla', cantidad: 1 },
      { nombre: 'Carne picada', cantidad: 1 },
      { nombre: 'Brick nata para cocinar', cantidad: 1 }
    ]
  },
  {
    id: 8,
    nombre: 'Ensalada garbanzos',
    icono: '\u{1F957}',
    ingredientes: [
      { nombre: 'Bote grande garbanzos', cantidad: 1 },
      { nombre: 'Cebolla tierna', cantidad: 1 },
      { nombre: 'Bolsa aceitunas sin hueso', cantidad: 1 },
      { nombre: 'Huevos cocidos', cantidad: 2 },
      { nombre: 'Lata at\u00FAn', cantidad: 2 }
    ]
  },
  {
    id: 9,
    nombre: 'Ensalada patata',
    icono: '\u{1F954}',
    ingredientes: [
      { nombre: 'Patata', cantidad: 3 },
      { nombre: 'Pepino', cantidad: 1 },
      { nombre: 'Tomates cherry', cantidad: 1 }
    ]
  },
  {
    id: 10,
    nombre: 'Ensalada pimientos asados',
    icono: '\u{1F957}',
    ingredientes: [
      { nombre: 'Bote pimientos asados', cantidad: 1 },
      { nombre: 'Bote esp\u00E1rragos blancos', cantidad: 1 },
      { nombre: 'Lata migas bonito', cantidad: 1 },
      { nombre: 'Queso feta', cantidad: 1 },
      { nombre: 'Bolsa aceitunas sin hueso', cantidad: 1 }
    ]
  },
  {
    id: 11,
    nombre: 'Ensalada lentejas',
    icono: '\u{1F957}',
    ingredientes: [
      { nombre: 'Bote lentejas', cantidad: 1 },
      { nombre: 'Tomates cherry', cantidad: 1 },
      { nombre: 'Pepino', cantidad: 1 },
      { nombre: 'Pimiento verde', cantidad: 1 },
      { nombre: 'Queso feta', cantidad: 1 },
      { nombre: 'Bolsa aceitunas sin hueso', cantidad: 1 }
    ]
  },
  {
    id: 12,
    nombre: 'Ensalada pulpo',
    icono: '\u{1F41F}',
    ingredientes: [
      { nombre: 'Pulpo cocido', cantidad: 1 },
      { nombre: 'Tomate', cantidad: 1 },
      { nombre: 'Huevo cocido', cantidad: 1 },
      { nombre: 'Patata cocida', cantidad: 2 }
    ]
  }
];

const quantities = loadFromStorage();
const expanded = {};
const scrollState = { selection: 0, list: 0 };

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quantities));
}

function saveScroll(view) {
  const el = document.getElementById('main-content');
  if (el) scrollState[view] = el.scrollTop;
}

function restoreScroll(view) {
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      const el = document.getElementById('main-content');
      if (el) el.scrollTop = scrollState[view];
    });
  });
}

function showToast(msg) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(function () {
    toast.classList.remove('show');
  }, 2000);
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

  var el = document.getElementById('summary-bar');
  if (el) {
    el.textContent = selectedCount + ' recetas \u00B7 ' + totalDishes + ' platos \u00B7 ' + totalIngredients + ' ingredientes totales';
  }
}

function updateQuantity(id, delta) {
  var current = quantities[id] || 0;
  var newQty = Math.max(0, current + delta);

  if (newQty === 0) {
    delete quantities[id];
  } else {
    quantities[id] = newQty;
  }

  saveToStorage();

  var card = document.querySelector('.recipe-card[data-id="' + id + '"]');
  if (card) {
    card.querySelector('.qty-value').textContent = newQty;
    if (newQty > 0) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
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
    if (recetas[i].id === id) {
      receta = recetas[i];
      break;
    }
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

function createCard(receta) {
  var card = document.createElement('div');
  card.className = 'recipe-card';
  card.dataset.id = receta.id;

  var qty = quantities[receta.id] || 0;
  if (qty > 0) card.classList.add('selected');

  var ingCount = receta.ingredientes.length;
  var ingHtml = '';
  for (var i = 0; i < receta.ingredientes.length; i++) {
    ingHtml += '<li>' + receta.ingredientes[i].nombre + ' x' + receta.ingredientes[i].cantidad + '</li>';
  }

  card.innerHTML =
    '<div class="card-header">' +
      '<span class="card-icon">' + receta.icono + '</span>' +
      '<span class="card-name">' + receta.nombre + '</span>' +
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

  return card;
}

function renderCards() {
  var grid = document.getElementById('recipe-grid');
  if (!grid) return;
  for (var i = 0; i < recetas.length; i++) {
    grid.appendChild(createCard(recetas[i]));
  }
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
  return [...map.entries()].sort(function (a, b) {
    return a[0].localeCompare(b[0]);
  });
}

function showList() {
  var hasSelection = false;
  for (var i = 0; i < recetas.length; i++) {
    if ((quantities[recetas[i].id] || 0) > 0) {
      hasSelection = true;
      break;
    }
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
  document.getElementById('list-view').classList.remove('hidden');
  document.getElementById('bottom-bar').classList.add('hidden');

  restoreScroll('list');
}

function showSelection() {
  saveScroll('list');

  document.getElementById('list-view').classList.add('hidden');
  document.getElementById('selection-view').classList.remove('hidden');
  document.getElementById('bottom-bar').classList.remove('hidden');

  restoreScroll('selection');
}

function copyList() {
  var items = aggregateIngredients();
  if (items.length === 0) {
    showToast('No hay ingredientes para copiar');
    return;
  }

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
  saveToStorage();

  var qtyEls = document.querySelectorAll('.qty-value');
  for (var i = 0; i < qtyEls.length; i++) {
    qtyEls[i].textContent = '0';
  }

  var cards = document.querySelectorAll('.recipe-card');
  for (var i = 0; i < cards.length; i++) {
    cards[i].classList.remove('selected');
  }

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

function init() {
  renderCards();
  updateSummary();

  document.getElementById('btn-generate').addEventListener('click', showList);
  document.getElementById('btn-reset').addEventListener('click', resetAll);
  document.getElementById('btn-copy').addEventListener('click', copyList);
  document.getElementById('btn-back').addEventListener('click', showSelection);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}

document.addEventListener('DOMContentLoaded', init);
