// общие функции для всех страниц

document.addEventListener('DOMContentLoaded', function() {
    updateAuthButtons();

    if (document.getElementById('recipesContainer')) {
        loadRecipes();
    }

    if (document.getElementById('authorsContainer')) {
        loadAuthors();
    }

    if (document.getElementById('bloggerName')) {
        loadBlogger();
    }

    if (document.getElementById('featuredRecipes')) {
        loadHomePage();
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
function loadRecipes() {
    const container = document.getElementById('recipesContainer');
    if (!container) return;

    const recipes = getAllRecipes();
    container.innerHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
}

// создание HTML-карточки рецепта
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
function loadAuthors() {
    const container = document.getElementById('authorsContainer');
    if (!container) return;

    const authors = getAllAuthors();
    container.innerHTML = authors.map(author => `
        <div class="col-md-4">
            <div class="card">
                <div class="card-body text-center">
                    <img src="${author.avatar}" class="rounded-circle mb-3" width="80" height="80">
                    <h5>${author.name}</h5>
                    <p>${author.bio || ''}</p>
                    <p>Подписчиков: ${author.followers || 0}</p>
                    <a href="blog.html?authorId=${author.id}" class="btn btn-outline-primary">Профиль</a>
                </div>
            </div>
        </div>
    `).join('');
}

// загрузка данных блогера (для blog.html)
function loadBlogger() {
    const params = new URLSearchParams(window.location.search);
    const authorId = params.get('authorId');
    if (!authorId) return;

    const authors = getAllAuthors();
    const author = authors.find(a => a.id == authorId);
    if (!author) return;

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

    function updateSubscribeButton() {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            subscribeBtn.disabled = true;
            subscribeBtn.textContent = 'Войдите, чтобы подписаться';
            return;
        }
        const isSubscribed = isUserSubscribedToAuthor(currentUser, author.id);
        subscribeBtn.disabled = false;
        subscribeBtn.textContent = isSubscribed ? 'Отписаться' : 'Подписаться';
        subscribeBtn.classList.toggle('btn-primary', !isSubscribed);
        subscribeBtn.classList.toggle('btn-outline-primary', isSubscribed);
    }

    if (user) {
        updateSubscribeButton();

        subscribeBtn.onclick = function() {
            const currentUser = getCurrentUser();
            const isSubscribed = isUserSubscribedToAuthor(currentUser, author.id);

            if (isSubscribed) {
                unsubscribe(author.id);           // убран второй аргумент
                author.followers = (author.followers || 0) - 1;
            } else {
                subscribe(author.id);              // убран второй аргумент
                author.followers = (author.followers || 0) + 1;
            }

            followersSpan.textContent = author.followers || 0;
            updateSubscribeButton();
        };
    } else {
        subscribeBtn.disabled = true;
        subscribeBtn.textContent = 'Войдите, чтобы подписаться';
    }

    const recipes = getAllRecipes().filter(r => r.authorId == authorId);
    const recipesContainer = document.getElementById('bloggerRecipes');
    if (recipesContainer) {
        recipesContainer.innerHTML = recipes.map(recipe => createRecipeCard(recipe)).join('');
    }
}

// обработка формы входа
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const user = login(email, password);
        if (user) {
            window.location.href = 'profile.html';
        }
    });
}

// обработка формы регистрации
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const bio = document.getElementById('bio').value;
        const user = register(name, email, password, bio);
        if (user) {
            window.location.href = 'profile.html';
        }
    });
}

// загрузка главной страницы с первыми тремя рецептами и первыми тремя кулинарами
function loadHomePage() {
    loadFeaturedRecipes();
    loadTopAuthors();
}

// загрузка первых трех рецептов
function loadFeaturedRecipes() {
    const container = document.getElementById('featuredRecipes');
    if (!container) return;

    const recipes = getAllRecipes();
    const featured = recipes.slice(0, 3);

    container.innerHTML = featured.map(recipe => createRecipeCard(recipe)).join('');
}

// загрузка первых трех кулинаров
function loadTopAuthors() {
    const container = document.getElementById('topAuthors');
    if (!container) return;

    const authors = getAllAuthors();
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