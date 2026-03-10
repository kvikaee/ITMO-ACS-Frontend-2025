// profile.js

document.addEventListener('DOMContentLoaded', async function() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    displayProfileInfo(user);
    try {
        await loadSavedRecipes(user);
        await loadUserSubscriptions(user);
    } catch (error) {
        console.error('Ошибка загрузки данных профиля:', error);
        alert('Не удалось загрузить данные профиля.');
    }

    document.getElementById('editProfileBtn')?.addEventListener('click', function() {
        document.getElementById('editName').value = user.name;
        document.getElementById('editBio').value = user.bio || '';
    });

    document.getElementById('saveProfileBtn')?.addEventListener('click', async function() {
        const newName = document.getElementById('editName').value.trim();
        const newBio = document.getElementById('editBio').value.trim();
        if (!newName) {
            alert('Имя не может быть пустым');
            return;
        }
        const updatedUser = await updateUserProfile({ name: newName, bio: newBio });
        if (updatedUser) {
            displayProfileInfo(updatedUser);
            bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
        }
    });
});

function displayProfileInfo(user) {
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profileBio').textContent = user.bio || 'Пока ничего не рассказано о себе.';
}

async function loadSavedRecipes(user) {
    const savedContainer = document.getElementById('savedRecipes');
    if (!savedContainer) return;

    const allRecipes = await getAllRecipes();
    const saved = allRecipes.filter(recipe => user.likedRecipes && user.likedRecipes.includes(recipe.id));

    if (saved.length === 0) {
        savedContainer.innerHTML = '<p class="text-muted">У вас пока нет сохранённых рецептов.</p>';
    } else {
        savedContainer.innerHTML = saved.map(recipe => createHorizontalRecipeCard(recipe)).join('');
    }
}

async function loadUserSubscriptions(user) {
    const subsContainer = document.getElementById('subscriptionsList');
    if (!subsContainer) return;

    if (!user.subscriptions || user.subscriptions.length === 0) {
        subsContainer.innerHTML = '<p class="text-muted">Вы пока ни на кого не подписаны.</p>';
        return;
    }

    const allAuthors = await getAllAuthors();
    const subscribedAuthors = allAuthors.filter(author => user.subscriptions.includes(author.id));

    if (subscribedAuthors.length === 0) {
        subsContainer.innerHTML = '<p class="text-muted">Авторы, на которых вы подписаны, не найдены.</p>';
        return;
    }

    subsContainer.innerHTML = subscribedAuthors.map(author => `
        <div class="col-md-6 mb-3">
            <div class="card h-100">
                <div class="card-body d-flex align-items-center">
                    <img src="${author.avatar || 'images/avatars/default.jpg'}" 
                         alt="${author.name}" 
                         class="rounded-circle me-3" 
                         width="60" 
                         height="60"
                         style="object-fit: cover;">
                    <div class="flex-grow-1">
                        <h5 class="card-title mb-1">${author.name}</h5>
                        <p class="card-text small text-muted mb-2">${author.bio || ''}</p>
                        <p class="card-text small">Подписчиков: ${author.followers || 0}</p>
                    </div>
                    <a href="blog.html?authorId=${author.id}" class="btn btn-sm btn-outline-primary">Профиль</a>
                </div>
            </div>
        </div>
    `).join('');
}

function createHorizontalRecipeCard(recipe) {
    return `
        <div class="col-md-6 mb-3">
            <div class="card h-100">
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="${recipe.image || 'images/recipes/placeholder.jpg'}" 
                             class="img-fluid rounded-start h-100" 
                             alt="${recipe.title}"
                             style="object-fit: cover; height: 100%; width: 100%;">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${recipe.title}</h5>
                            <p class="card-text">
                                <span class="badge bg-secondary">${recipe.type}</span>
                                <span class="badge bg-secondary">${recipe.difficulty}</span>
                            </p>
                            <a href="recipe.html?id=${recipe.id}" class="btn btn-sm btn-primary">Посмотреть</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}