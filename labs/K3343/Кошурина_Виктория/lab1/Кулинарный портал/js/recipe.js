// страница рецепта

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('id');
    if (!recipeId) {
        window.location.href = 'index.html';
        return;
    }

    const recipe = getRecipeById(parseInt(recipeId));
    if (!recipe) {
        alert('Рецепт не найден');
        window.location.href = 'index.html';
        return;
    }

    displayRecipe(recipe);
    setupLikeButton(recipe.id);
    loadComments(recipe.id);
    setupCommentForm(recipe.id);
});

// отображение рецепта
function displayRecipe(recipe) {
    document.getElementById('recipeTitle').textContent = recipe.title;

    const descEl = document.getElementById('recipeDescription');
    if (descEl) descEl.textContent = recipe.description || '';

    document.getElementById('recipeImage').src = recipe.image || 'images/recipes/placeholder.jpg';
    document.getElementById('recipeType').textContent = recipe.type;
    document.getElementById('recipeDifficulty').textContent = recipe.difficulty;

    const ingList = document.getElementById('ingredientsList');
    ingList.innerHTML = recipe.ingredients.map(ing => `<li>${ing}</li>`).join('');

    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = recipe.steps.map(step => `<li>${step}</li>`).join('');

    const videoContainer = document.getElementById('videoContainer');
    if (videoContainer) {
        if (recipe.videoUrl) {
            videoContainer.innerHTML = `
                <div class="ratio ratio-16x9">
                    <iframe src="${recipe.videoUrl}" title="YouTube video" allowfullscreen></iframe>
                </div>
            `;
        } else {
            videoContainer.innerHTML = '<p>Видео отсутствует</p>';
        }
    }

    const author = getAuthorById(recipe.authorId) || { 
        name: 'Неизвестный автор', 
        id: 0, 
        avatar: 'images/avatars/default.jpg',
        followers: 0 
    };

    const authorNameEl = document.getElementById('authorName');
    if (authorNameEl) {
        authorNameEl.textContent = author.name;
        authorNameEl.href = `blog.html?authorId=${author.id}`;
    }

    const followersEl = document.getElementById('followersCount');
    if (followersEl) {
        followersEl.textContent = author.followers || 0;
    }

    const authorAvatarEl = document.getElementById('authorAvatar');
    if (authorAvatarEl) {
        authorAvatarEl.src = author.avatar || 'images/avatars/default.jpg';
    }

    const user = getCurrentUser();
    const followBtn = document.getElementById('followBtn');
    const followersSpan = document.getElementById('followersCount');

    function updateFollowButton() {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            followBtn.disabled = true;
            followBtn.textContent = 'Войдите, чтобы подписаться';
            return;
        }
        const isSubscribed = isUserSubscribedToAuthor(currentUser, author.id);
        followBtn.disabled = false;
        followBtn.textContent = isSubscribed ? 'Отписаться' : 'Подписаться';
        followBtn.classList.toggle('btn-primary', !isSubscribed);
        followBtn.classList.toggle('btn-outline-primary', isSubscribed);
    }

    if (user) {
        updateFollowButton();
        followBtn.onclick = function() {
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
            updateFollowButton();
        };
    } else {
        followBtn.disabled = true;
        followBtn.textContent = 'Войдите, чтобы подписаться';
    }
}

// кнопка лайка
function setupLikeButton(recipeId) {
    const likeBtn = document.getElementById('likeBtn');
    const likeCountSpan = document.getElementById('likeCount');
    if (!likeBtn) return;

    const user = getCurrentUser();
    let isLiked = user ? user.likedRecipes && user.likedRecipes.includes(recipeId) : false;

    function updateLikeDisplay() {
        const count = getLikesCount(recipeId);
        likeCountSpan.textContent = count;
        if (isLiked) {
            likeBtn.innerHTML = `<i class="bi bi-heart-fill"></i> ${count}`;
        } else {
            likeBtn.innerHTML = `<i class="bi bi-heart"></i> ${count}`;
        }
    }

    updateLikeDisplay();

    likeBtn.addEventListener('click', () => {
        if (!user) {
            alert('Войдите, чтобы ставить лайки');
            return;
        }
        if (isLiked) {
            unlikeRecipe(recipeId, user.id);
            isLiked = false;
        } else {
            likeRecipe(recipeId, user.id);
            isLiked = true;
        }
        updateLikeDisplay();
    });
}

// отображение комментариев
function loadComments(recipeId) {
    const commentsList = document.getElementById('commentsList');
    const comments = getComments(recipeId);
    if (comments.length === 0) {
        commentsList.innerHTML = '<p class="text-muted">Пока нет комментариев. Будьте первым!</p>';
    } else {
        commentsList.innerHTML = comments.map(c => `
            <div class="comment">
                <span class="comment-author">${c.userName}</span>
                <span class="comment-date">${c.date}</span>
                <p>${c.text}</p>
            </div>
        `).join('');
    }
}

// ввод комментария
function setupCommentForm(recipeId) {
    const form = document.getElementById('commentForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = getCurrentUser();
        if (!user) {
            alert('Войдите, чтобы комментировать');
            return;
        }

        const text = document.getElementById('commentText').value.trim();
        if (!text) return;

        addComment(recipeId, user.id, user.name, text);
        document.getElementById('commentText').value = '';
        loadComments(recipeId);
    });
}