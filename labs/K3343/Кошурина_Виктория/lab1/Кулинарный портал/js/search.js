// страница поиска с фильтрацией

document.addEventListener('DOMContentLoaded', function() {
    loadAllRecipes();

    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('addIngredientBtn').addEventListener('click', addIngredient);
});

let selectedIngredients = [];
// загрузка всех рецептов
function loadAllRecipes() {
    const recipes = getAllRecipes();
    displaySearchResults(recipes);
}

// показ результатов
function displaySearchResults(recipes) {
    const container = document.getElementById('searchResults');
    if (!container) return;

    if (recipes.length === 0) {
        container.innerHTML = '<p class="text-muted">Ничего не найдено</p>';
        return;
    }

    container.innerHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
}

// применение фильтров 
function applyFilters() {
    let recipes = getAllRecipes();

    // поиск по названию
    const searchTerm = document.getElementById('searchByName').value.trim().toLowerCase();
    if (searchTerm !== '') {
        recipes = recipes.filter(r => r.title.toLowerCase().includes(searchTerm));
    }

    // фильтр по типу блюда
    const checkedTypes = [];
    document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        checkedTypes.push(cb.value);
    });
    if (checkedTypes.length > 0) {
        recipes = recipes.filter(r => checkedTypes.includes(r.type));
    }

    // фильтр по сложности
    const difficultyRadios = document.getElementsByName('difficulty');
    let selectedDifficulty = null;
    for (let radio of difficultyRadios) {
        if (radio.checked) {
            selectedDifficulty = radio.value;
            break;
        }
    }
    if (selectedDifficulty) {
        recipes = recipes.filter(r => r.difficulty === selectedDifficulty);
    }

    // фильтр по ингредиентам
    if (selectedIngredients.length > 0) {
        recipes = recipes.filter(r => {
            return selectedIngredients.every(ing => r.ingredients.includes(ing));
        });
    }

    displaySearchResults(recipes);
}

// добавление ингредиента для фильтра по ингредиентам
function addIngredient() {
    const input = document.getElementById('ingredientInput');
    const ingredient = input.value.trim().toLowerCase();
    if (!ingredient) return;

    if (!selectedIngredients.includes(ingredient)) {
        selectedIngredients.push(ingredient);
        updateIngredientsList();
    }
    input.value = '';
}

// обновление списка ингедиентов
function updateIngredientsList() {
    const list = document.getElementById('ingredientsList');
    list.innerHTML = selectedIngredients.map(ing => `
        <span class="badge bg-secondary me-1" style="font-size: 1rem; padding: 0.5rem;">
            ${ing} 
            <span style="cursor:pointer; margin-left:5px;" onclick="removeIngredient('${ing}')">✕</span>
        </span>
    `).join('');
}

// удаление ингредиента из поиска (фильтра)
function removeIngredient(ingredient) {
    selectedIngredients = selectedIngredients.filter(i => i !== ingredient);
    updateIngredientsList();
}