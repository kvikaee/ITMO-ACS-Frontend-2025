// main.js

document.addEventListener('DOMContentLoaded', async function() {
    updateAuthButtons();

    if (document.getElementById('recipesContainer')) {
        await loadRecipes();
    }

    if (document.getElementById('authorsContainer')) {
        await loadAuthors();
    }

    if (document.getElementById('bloggerName')) {
        await loadBlogger();
    }

    if (document.getElementById('featuredRecipes')) {
        await loadHomePage();
    }
});

// обновление кнопок входа/профиля в шапке
function updateAuthButtons() {
    const authDiv = document.getElementById('authButtons');
    if (!authDiv) return;

    const user = getCurrentUser();
    if (user) {
        authDiv.innerHTML = `
            <a href="profile.html" class="btn btn-outline-primary me-2">${user.name}</a>
            <button class="btn btn-outline-danger" id="logoutBtn">Выйти</button>
        `;
        document.getElementById('logoutBtn')?.addEventListener('click', logout);
    } else {
        authDiv.innerHTML = `
            <a href="login.html" class="btn btn-outline-primary me-2">Вход</a>
            <a href="register.html" class="btn btn-primary">Регистрация</a>
        `;
    }
}

// загрузка рецептов на главную
async function loadRecipes() {
    const container = document.getElementById('recipesContainer');
    if (!container) return;

    try {
        const recipes = await getAllRecipes();
        container.innerHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
    } catch (error) {
        container.innerHTML = '<p class="text-danger">Ошибка загрузки рецептов.</p>';
    }
}

// создание HTML-карточки рецепта (синхронная)
function createRecipeCard(recipe) {
    return `
        <div class="col-md-4 mb-4">
            <div class="card recipe-card h-100">
                <img src="${recipe.image || 'images/recipes/placeholder.jpg'}" 
                     class="card-img-top" 
                     alt="${recipe.title}"
                     style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${recipe.title}</h5>
                    <p class="card-text flex-grow-1">
                        <span class="badge bg-secondary">${recipe.type}</span>
                        <span class="badge bg-secondary">${recipe.difficulty}</span>
                    </p>
                    <a href="recipe.html?id=${recipe.id}" class="btn btn-primary mt-2">Посмотреть</a>
                </div>
            </div>
        </div>
    `;
}

// загрузка списка авторов
async function loadAuthors() {
    const container = document.getElementById('authorsContainer');
    if (!container) return;

    try {
        const authors = await getAllAuthors();
        container.innerHTML = authors.map(author => `
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body text-center">
                        <img src="${author.avatar || 'images/avatars/default.jpg'}" class="rounded-circle mb-3" width="80" height="80">
                        <h5>${author.name}</h5>
                        <p>${author.bio || ''}</p>
                        <p>Подписчиков: ${author.followers || 0}</p>
                        <a href="blog.html?authorId=${author.id}" class="btn btn-outline-primary">Профиль</a>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        container.innerHTML = '<p class="text-danger">Ошибка загрузки авторов.</p>';
    }
}

// загрузка данных блогера (для blog.html)
async function loadBlogger() {
    const params = new URLSearchParams(window.location.search);
    const authorId = params.get('authorId');
    if (!authorId) return;

    try {
        const authors = await getAllAuthors();
        const author = authors.find(a => a.id === authorId);
        if (!author) {
            document.querySelector('main').innerHTML = '<p class="text-danger">Автор не найден</p>';
            return;
        }

        document.getElementById('bloggerName').textContent = author.name;
        document.getElementById('bloggerBio').textContent = author.bio || '';
        document.getElementById('bloggerFollowers').textContent = author.followers || 0;

        const avatarEl = document.getElementById('bloggerAvatar');
        if (avatarEl) {
            let avatarSrc = author.avatar || 'images/avatars/default.jpg';
            avatarSrc += '?t=' + new Date().getTime();
            avatarEl.src = avatarSrc;
        }

        const user = getCurrentUser();
        const subscribeBtn = document.getElementById('subscribeBtn');
        const followersSpan = document.getElementById('bloggerFollowers');

        // Функция обновления кнопки
        function updateBtn(isSubscribed) {
            subscribeBtn.disabled = false;
            subscribeBtn.textContent = isSubscribed ? 'Отписаться' : 'Подписаться';
            subscribeBtn.classList.toggle('btn-primary', !isSubscribed);
            subscribeBtn.classList.toggle('btn-outline-primary', isSubscribed);
        }

        if (user) {
            const isSubscribed = isUserSubscribedToAuthor(user, author.id);
            updateBtn(isSubscribed);

            subscribeBtn.onclick = async function() {
                await handleSubscription(author.id, followersSpan, updateBtn);
            };
        } else {
            subscribeBtn.disabled = true;
            subscribeBtn.textContent = 'Войдите, чтобы подписаться';
        }

        const recipes = await getAllRecipes();
        const authorRecipes = recipes.filter(r => String(r.authorId) === authorId);
        const recipesContainer = document.getElementById('bloggerRecipes');
        if (recipesContainer) {
            recipesContainer.innerHTML = authorRecipes.map(recipe => createRecipeCard(recipe)).join('');
        }
    } catch (error) {
        console.error('Ошибка загрузки блогера:', error);
        document.querySelector('main').innerHTML = '<p class="text-danger">Ошибка загрузки данных блогера.</p>';
    }
}

// обработка формы входа
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Простейшая валидация
        if (!email || !password) {
            alert('Заполните все поля');
            return;
        }

        const user = await login(email, password);
        if (user) {
            window.location.href = 'profile.html';
        }
    });
}

// обработка формы регистрации
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const bio = document.getElementById('bio').value.trim();

        // Валидация
        if (!name || !email || !password) {
            alert('Заполните имя, email и пароль');
            return;
        }
        if (password.length < 6) {
            alert('Пароль должен быть не менее 6 символов');
            return;
        }
        // Простейшая проверка email
        if (!email.includes('@') || !email.includes('.')) {
            alert('Введите корректный email');
            return;
        }

        const user = await register(name, email, password, bio);
        if (user) {
            window.location.href = 'profile.html';
        }
    });
}

// загрузка главной страницы с первыми тремя рецептами и первыми тремя кулинарами
async function loadHomePage() {
    try {
        await loadFeaturedRecipes();
        await loadTopAuthors();
    } catch (error) {
        console.error('Ошибка загрузки главной страницы:', error);
        document.getElementById('featuredRecipes').innerHTML = '<p class="text-danger">Не удалось загрузить рецепты.</p>';
        document.getElementById('topAuthors').innerHTML = '<p class="text-danger">Не удалось загрузить авторов.</p>';
    }
}

// загрузка первых трех рецептов
async function loadFeaturedRecipes() {
    const container = document.getElementById('featuredRecipes');
    if (!container) return;

    const recipes = await getAllRecipes();
    const featured = recipes.slice(0, 3);
    container.innerHTML = featured.map(recipe => createRecipeCard(recipe)).join('');
}

// загрузка первых трех кулинаров
async function loadTopAuthors() {
    const container = document.getElementById('topAuthors');
    if (!container) return;

    const authors = await getAllAuthors();
    const topAuthors = authors.slice(0, 3);
    container.innerHTML = topAuthors.map(author => `
        <div class="col-md-4 mb-4">
            <div class="card h-100 text-center">
                <div class="card-body d-flex flex-column">
                    <img src="${author.avatar || 'images/avatars/default.jpg'}" 
                         alt="${author.name}" 
                         class="rounded-circle mx-auto mb-3" 
                         width="120" 
                         height="120"
                         style="object-fit: cover;">
                    <h5 class="card-title">${author.name}</h5>
                    <p class="card-text flex-grow-1">${author.bio || ''}</p>
                    <p class="text-muted">Подписчиков: ${author.followers || 0}</p>
                    <a href="blog.html?authorId=${author.id}" class="btn btn-outline-primary mt-2">Профиль</a>
                </div>
            </div>
        </div>
    `).join('');
}