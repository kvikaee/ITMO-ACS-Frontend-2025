
document.addEventListener('DOMContentLoaded', async function() {
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('id');
    if (!recipeId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const recipe = await getRecipeById(recipeId);
        if (!recipe) {
            alert('Рецепт не найден');
            window.location.href = 'index.html';
            return;
        }

        await displayRecipe(recipe);
        setupLikeButton(recipe.id);
        await loadComments(recipe.id);
        setupCommentForm(recipe.id);
    } catch (error) {
        console.error('Ошибка загрузки страницы рецепта:', error);
        alert('Не удалось загрузить рецепт. Попробуйте позже.');
        window.location.href = 'index.html';
    }
});

async function displayRecipe(recipe) {
    document.getElementById('recipeTitle').textContent = recipe.title;

    const descEl = document.getElementById('recipeDescription');
    if (descEl) descEl.textContent = recipe.description || '';

    document.getElementById('recipeImage').src = recipe.image || 'images/recipes/placeholder.jpg';
    document.getElementById('recipeImage').alt = recipe.title;
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

    const author = await getAuthorById(recipe.authorId) || { 
        name: 'Неизвестный автор', 
        id: '0', 
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
        authorAvatarEl.alt = author.name || 'authorAvatar';
    }

    const user = getCurrentUser();
    const followBtn = document.getElementById('followBtn');
    const followersSpan = document.getElementById('followersCount');

    // Функция обновления кнопки подписки
    function updateBtn(isSubscribed) {
        followBtn.disabled = false;
        followBtn.textContent = isSubscribed ? 'Отписаться' : 'Подписаться';
        followBtn.classList.toggle('btn-primary', !isSubscribed);
        followBtn.classList.toggle('btn-outline-primary', isSubscribed);
    }

    if (user) {
        const isSubscribed = isUserSubscribedToAuthor(user, author.id);
        updateBtn(isSubscribed);

        followBtn.onclick = async function() {
            await handleSubscription(author.id, followersSpan, updateBtn);
        };
    } else {
        followBtn.disabled = true;
        followBtn.textContent = 'Войдите, чтобы подписаться';
    }
}

function setupLikeButton(recipeId) {
    const likeBtn = document.getElementById('likeBtn');
    const likeCountSpan = document.getElementById('likeCount');
    if (!likeBtn) return;

    const user = getCurrentUser();
    
    let isLiked = user ? user.likedRecipes && user.likedRecipes.includes(recipeId) : false;

    async function initLikeCount() {
        const count = await getLikesCount(recipeId);
        likeCountSpan.textContent = count;
        likeBtn.innerHTML = isLiked 
            ? `<i class="bi bi-heart-fill"></i> ${count}` 
            : `<i class="bi bi-heart"></i> ${count}`;
    }

    initLikeCount();

    likeBtn.addEventListener('click', async () => {
        if (!user) {
            alert('Войдите, чтобы ставить лайки');
            return;
        }

        let newCount;
        if (isLiked) {
            newCount = await unlikeRecipe(recipeId, user.id);
            isLiked = false;
        } else {
            newCount = await likeRecipe(recipeId, user.id);
            isLiked = true;
        }

        likeCountSpan.textContent = newCount;
        likeBtn.innerHTML = isLiked 
            ? `<i class="bi bi-heart-fill"></i> ${newCount}` 
            : `<i class="bi bi-heart"></i> ${newCount}`;
    });
}

// Функция для получения комментариев
async function getComments(recipeId) {
    try {
        // Получаем ВСЕ комментарии
        const response = await fetch(`${API_BASE_URL}/comments`);
        const allComments = await response.json();
        
        // Фильтруем по recipeId, сравнивая как строки
        const recipeComments = allComments.filter(comment => 
            String(comment.recipeId) === String(recipeId)
        );
        
        // Сортируем по дате (новые сверху или снизу - как вам удобнее)
        recipeComments.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        console.log('Найденные комментарии:', recipeComments);
        return recipeComments;
        
    } catch (error) {
        console.error('Ошибка при получении комментариев:', error);
        return [];
    }
}

// Функция для добавления комментария
async function addComment(recipeId, userId, userName, text) {
    try {
        const comment = {
            recipeId: String(recipeId),  // Важно: сохраняем как строку
            userId: String(userId),      // Важно: сохраняем как строку
            userName: userName,
            text: text,
            date: new Date().toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        };

        const response = await fetch(`${API_BASE_URL}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(comment)
        });

        if (!response.ok) {
            throw new Error('Ошибка при добавлении комментария');
        }

        const newComment = await response.json();
        console.log('Комментарий добавлен:', newComment);
        return newComment;
        
    } catch (error) {
        console.error('Ошибка при добавлении комментария:', error);
        throw error;
    }
}

// Обновленная функция loadComments с отладкой
async function loadComments(recipeId) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    
    try {
        console.log('Загружаем комментарии для recipeId:', recipeId);
        const comments = await getComments(recipeId);
        console.log('Получены комментарии:', comments);
        
        if (comments.length === 0) {
            commentsList.innerHTML = '<p class="text-muted">Пока нет комментариев. Будьте первым!</p>';
        } else {
            commentsList.innerHTML = comments.map(c => `
    <div class="comment" style="border-bottom: 1px solid #eee; padding: 10px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong class="comment-author" style="color: #b1453a;">${c.userName}</strong>
            <span class="comment-date" style="color: #4d4d4d; font-size: 0.9em;">${c.date}</span>
        </div>
        <p style="margin: 5px 0 0 0;">${c.text}</p>
    </div>
`).join('');
        }
    } catch (error) {
        console.error('Ошибка в loadComments:', error);
        commentsList.innerHTML = '<p class="text-danger">Ошибка загрузки комментариев.</p>';
    }
}

// с дополнительной проверкой
function setupCommentForm(recipeId) {
    const form = document.getElementById('commentForm');
    if (!form) {
        console.log('Форма комментариев не найдена');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = getCurrentUser();
        if (!user) {
            alert('Войдите, чтобы комментировать');
            return;
        }

        const textInput = document.getElementById('commentText');
        const text = textInput.value.trim();
        
        if (!text) {
            alert('Введите текст комментария');
            return;
        }

        try {
            console.log('Добавляем комментарий:', {
                recipeId,
                userId: user.id,
                userName: user.name,
                text
            });

            await addComment(recipeId, user.id, user.name, text);
            textInput.value = ''; // очистка поля
            
            // Перезагружаем комментарии
            await loadComments(recipeId);
            
        } catch (error) {
            console.error('Ошибка при добавлении комментария:', error);
            alert('Не удалось добавить комментарий. Попробуйте еще раз.');
        }
    });
}