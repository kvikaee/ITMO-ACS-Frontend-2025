// js/auth.js
console.log('auth.js загружен'); // можно оставить для отладки, но лучше убрать перед сдачей

// ================== Работа с текущим пользователем (синхронно, localStorage) ==================

const STORAGE_KEYS = {
    CURRENT_USER: 'currentUser'
};

function getCurrentUser() {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
}

function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.location.href = 'index.html';
}

// ================== Вспомогательная функция для обработки ответов fetch ==================

async function handleResponse(response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Ошибка HTTP: ${response.status}`);
    }
    return response.json();
}

//  Функции для работы с рецептами 

async function getAllRecipes() {
    try {
        const response = await fetch(`${API_BASE_URL}/recipes`);
        return await handleResponse(response);
    } catch (error) {
        console.error('Ошибка загрузки рецептов:', error);
        alert('Не удалось загрузить рецепты. Проверьте подключение к серверу.');
        return [];
    }
}

async function getRecipeById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/recipes/${id}`);
        return await handleResponse(response);
    } catch (error) {
        console.error('Ошибка загрузки рецепта:', error);
        alert('Не удалось загрузить рецепт.');
        return null;
    }
}

// Функции для работы с авторами

async function getAllAuthors() {
    try {
        const response = await fetch(`${API_BASE_URL}/authors`);
        return await handleResponse(response);
    } catch (error) {
        console.error('Ошибка загрузки авторов:', error);
        alert('Не удалось загрузить список авторов.');
        return [];
    }
}

async function getAuthorById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/authors/${id}`);
        return await handleResponse(response);
    } catch (error) {
        console.error('Ошибка загрузки автора:', error);
        alert('Не удалось загрузить информацию об авторе.');
        return null;
    }
}

// Обновление количества подписчиков у автора (используется при подписке/отписке)
async function updateAuthorFollowers(authorId, delta) {
    try {
        const author = await getAuthorById(authorId);
        if (!author) return;
        const newFollowers = (author.followers || 0) + delta;
        const response = await fetch(`${API_BASE_URL}/authors/${authorId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ followers: newFollowers })
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Ошибка обновления подписчиков автора:', error);
        alert('Не удалось обновить количество подписчиков.');
    }
}

// Функции для работы с пользователями

async function register(name, email, password, bio) {
    try {
        // Проверим, нет ли уже пользователя с таким email
        const checkResponse = await fetch(`${API_BASE_URL}/users?email=${email}`);
        const existing = await checkResponse.json();
        if (existing.length > 0) {
            alert('Пользователь с таким email уже существует');
            return null;
        }

        const newUser = {
            name,
            email,
            password,
            bio: bio || '',
            avatar: 'images/avatars/default.jpg',
            likedRecipes: [],
            subscriptions: []
        };

        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        const createdUser = await handleResponse(response);
        setCurrentUser(createdUser);
        return createdUser;
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        alert('Ошибка при регистрации. Проверьте подключение к серверу.');
        return null;
    }
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/users?email=${email}`);
        const users = await response.json();
        if (users.length === 0) {
            alert('Пользователь не найден');
            return null;
        }
        const user = users[0];
        if (user.password !== password) {
            alert('Неверный пароль');
            return null;
        }
        setCurrentUser(user);
        return user;
    } catch (error) {
        console.error('Ошибка входа:', error);
        alert('Ошибка при входе. Проверьте подключение к серверу.');
        return null;
    }
}

async function updateUserProfile(updatedData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });

        const updatedUser = await handleResponse(response);
        setCurrentUser(updatedUser);
        return updatedUser;
    } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        alert('Не удалось обновить профиль.');
        return null;
    }
}

// Функции для работы с лайками

async function likeRecipe(recipeId, userId) {
    try {
        // 1. Проверяем существующие лайки (получаем все и фильтруем)
        const response = await fetch(`${API_BASE_URL}/likes`);
        const allLikes = await response.json();
        
        const existingLikes = allLikes.filter(like => 
            String(like.recipeId) === String(recipeId) && 
            String(like.userId) === String(userId)
        );
        
        // Удаляем существующие лайки (если есть дубли)
        for (let like of existingLikes) {
            await fetch(`${API_BASE_URL}/likes/${like.id}`, { method: 'DELETE' });
        }

        // 2. Создаём новый лайк
        await fetch(`${API_BASE_URL}/likes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                recipeId: String(recipeId), 
                userId: String(userId) 
            })
        });

        // 3. Обновляем пользователя
        const user = getCurrentUser();
        if (user) {
            if (!user.likedRecipes.includes(String(recipeId))) {
                user.likedRecipes.push(String(recipeId));
                await updateUserProfile({ likedRecipes: user.likedRecipes });
            }
        }

        // 4. Возвращаем актуальное количество лайков
        return await getLikesCount(recipeId);
        
    } catch (error) {
        console.error('Ошибка при добавлении лайка:', error);
        alert('Не удалось поставить лайк.');
        return 0;
    }
}

async function unlikeRecipe(recipeId, userId) {
    try {
        // Получаем все лайки
        const response = await fetch(`${API_BASE_URL}/likes`);
        const allLikes = await response.json();
        
        // Фильтруем лайки для этого рецепта и пользователя (сравниваем как строки)
        const userLikes = allLikes.filter(like => 
            String(like.recipeId) === String(recipeId) && 
            String(like.userId) === String(userId)
        );
        
        console.log('Найденные лайки для удаления:', userLikes);
        
        // Удаляем все найденные лайки
        for (let like of userLikes) {
            console.log('Удаляем лайк с id:', like.id);
            const deleteResponse = await fetch(`${API_BASE_URL}/likes/${like.id}`, { 
                method: 'DELETE' 
            });
            
            if (!deleteResponse.ok) {
                console.error('Ошибка при удалении лайка:', like.id);
            }
        }

        // Обновляем пользователя
        const user = getCurrentUser();
        if (user) {
            const index = user.likedRecipes.indexOf(String(recipeId)); // Сравниваем как строки
            if (index !== -1) {
                user.likedRecipes.splice(index, 1);
                await updateUserProfile({ likedRecipes: user.likedRecipes });
            }
        }

        // Возвращаем актуальное количество лайков
        const newCount = await getLikesCount(recipeId);
        return newCount;
        
    } catch (error) {
        console.error('Ошибка при удалении лайка:', error);
        alert('Не удалось убрать лайк.');
        return 0;
    }
}

async function getLikesCount(recipeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/likes`);
        const allLikes = await response.json();
        
        // Фильтруем, сравнивая как строки
        const recipeLikes = allLikes.filter(like => String(like.recipeId) === String(recipeId));
        
        console.log('Отфильтрованные лайки:', recipeLikes);
        return recipeLikes.length;
    } catch (error) {
        console.error('Ошибка при получении количества лайков:', error);
        return 0;
    }
}

// Функции для работы с комментариями

async function getComments(recipeId) {
    try {
        const response = await fetch(`${API_BASE_URL}/comments?recipeId=${recipeId}`);
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки комментариев:', error);
        alert('Не удалось загрузить комментарии.');
        return [];
    }
}

async function addComment(recipeId, userId, userName, text) {
    try {
        const newComment = {
            recipeId,
            userId,
            userName,
            text,
            date: new Date().toLocaleString()
        };
        const response = await fetch(`${API_BASE_URL}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newComment)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Ошибка добавления комментария:', error);
        alert('Не удалось добавить комментарий.');
    }
}

// Функции для работы с подписками

async function subscribe(authorId) {
    const user = getCurrentUser();
    if (!user) return;

    const authorIdStr = String(authorId);
    if (user.subscriptions.includes(authorIdStr)) return;

    try {
        // Добавляем подписку в массив пользователя
        user.subscriptions.push(authorIdStr);
        await updateUserProfile({ subscriptions: user.subscriptions });

        // Увеличиваем счётчик подписчиков у автора
        await updateAuthorFollowers(authorIdStr, 1);
    } catch (error) {
        console.error('Ошибка подписки:', error);
        alert('Не удалось подписаться.');
    }
}

async function unsubscribe(authorId) {
    const user = getCurrentUser();
    if (!user) return;

    const authorIdStr = String(authorId);
    const index = user.subscriptions.indexOf(authorIdStr);
    if (index === -1) return;

    try {
        // Удаляем подписку из массива пользователя
        user.subscriptions.splice(index, 1);
        await updateUserProfile({ subscriptions: user.subscriptions });

        // Уменьшаем счётчик подписчиков у автора
        await updateAuthorFollowers(authorIdStr, -1);
    } catch (error) {
        console.error('Ошибка отписки:', error);
        alert('Не удалось отписаться.');
    }
}

function isUserSubscribedToAuthor(user, authorId) {
    return user.subscriptions.includes(String(authorId));
}

// Универсальная функция для управления подпиской (для кнопок)

async function handleSubscription(authorId, authorFollowersElement, updateButtonCallback) {
    const user = getCurrentUser();
    if (!user) {
        alert('Войдите, чтобы подписаться');
        return;
    }

    const isSubscribed = isUserSubscribedToAuthor(user, authorId);
    let newFollowers;

    if (isSubscribed) {
        await unsubscribe(authorId);
        newFollowers = (parseInt(authorFollowersElement.textContent) || 0) - 1;
    } else {
        await subscribe(authorId);
        newFollowers = (parseInt(authorFollowersElement.textContent) || 0) + 1;
    }

    authorFollowersElement.textContent = newFollowers;
    if (updateButtonCallback) updateButtonCallback(!isSubscribed);
}

// Обновление UI кнопки подписки

function updateSubscriptionButton(button, isSubscribed) {
    button.disabled = false;
    button.textContent = isSubscribed ? 'Отписаться' : 'Подписаться';
    button.classList.toggle('btn-primary', !isSubscribed);
    button.classList.toggle('btn-outline-primary', isSubscribed);
}