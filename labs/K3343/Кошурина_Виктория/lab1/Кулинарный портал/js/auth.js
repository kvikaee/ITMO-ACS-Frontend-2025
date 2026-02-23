// управление пользователями через localStorage

// ключи для localStorage
const STORAGE_KEYS = {
    CURRENT_USER: 'currentUser',
    USERS: 'users',
    AUTHORS: 'authors', // для авторов рецептов
    RECIPES: 'recipes',
    COMMENTS: 'comments',
    LIKES: 'likes'
};

// инициализация хранилища (если пусто)
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.RECIPES)) {
        if (window.RECIPES_DATA) {
            localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(window.RECIPES_DATA));
        } else {
            localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify([]));
        }
    }

    if (!localStorage.getItem(STORAGE_KEYS.AUTHORS)) {
        if (window.AUTHORS_DATA) {
            localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(window.AUTHORS_DATA));
        } else {
            localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify([]));
        }
    }

    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
        localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify({}));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LIKES)) {
        localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify({}));
    }
}

// получить всех авторов (блогеров)
function getAllAuthors() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUTHORS)) || [];
}

// получить автора по ID
function getAuthorById(id) {
    const authors = getAllAuthors();
    return authors.find(a => a.id == id);
}
// обновить счетчик
function updateAuthorFollowers(authorId, delta) {
    const authors = getAllAuthors();
    const author = authors.find(a => a.id == authorId);
    if (author) {
        author.followers = (author.followers || 0) + delta;
        localStorage.setItem(STORAGE_KEYS.AUTHORS, JSON.stringify(authors));
    }
}

// получить текущего пользователя
function getCurrentUser() {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
}

// сохранить текущего пользователя
function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

// выход
function logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.location.href = 'index.html';
}

// регистрация
function register(name, email, password, bio) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        bio: bio || '',
        avatar: 'images/avatars/default.jpg',
        likedRecipes: [],
        subscriptions: []
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    setCurrentUser(newUser);
    return newUser;
}

// вход (имитация - принимаем любые данные, создаём пользователя если нет)
function login(email, password) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    let user = users.find(u => u.email === email);
    if (!user) {
        user = {
            id: Date.now(),
            name: 'Виктория Кулинар',
            email: email,
            password: password,
            bio: '',
            avatar: 'images/avatars/default.jpg',
            likedRecipes: [],
            subscriptions: []
        };
        users.push(user);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    setCurrentUser(user);
    return user;
}

// обновление данных пользователя
function updateUserProfile(updatedData) {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    Object.assign(currentUser, updatedData);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
        users[index] = currentUser;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    setCurrentUser(currentUser);
    return currentUser;
}

// получить рецепты
function getAllRecipes() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECIPES)) || [];
}

// получить рецепт по ID
function getRecipeById(id) {
    const recipes = getAllRecipes();
    return recipes.find(r => r.id == id);
}

// лайк рецепта (возвращает новое количество лайков)
function likeRecipe(recipeId, userId) {
    const likes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES)) || {};
    const currentLikes = likes[recipeId] || 0;
    likes[recipeId] = currentLikes + 1;
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));

    const user = getCurrentUser();
    if (user) {
        if (!user.likedRecipes.includes(recipeId)) {
            user.likedRecipes.push(recipeId);
            updateUserProfile({ likedRecipes: user.likedRecipes });
        }
    }
    return likes[recipeId];
}

// убрать лайк
function unlikeRecipe(recipeId, userId) {
    const likes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES)) || {};
    const currentLikes = likes[recipeId] || 0;
    if (currentLikes > 0) {
        likes[recipeId] = currentLikes - 1;
        localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));
    }

    const user = getCurrentUser();
    if (user) {
        const index = user.likedRecipes.indexOf(recipeId);
        if (index !== -1) {
            user.likedRecipes.splice(index, 1);
            updateUserProfile({ likedRecipes: user.likedRecipes });
        }
    }
    return likes[recipeId] || 0;
}

// получить количество лайков рецепта
function getLikesCount(recipeId) {
    const likes = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES)) || {};
    return likes[recipeId] || 0;
}

// получить комментарии
function getComments(recipeId) {
    const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS)) || {};
    return comments[recipeId] || [];
}
// добавление комментария
function addComment(recipeId, userId, userName, text) {
    const comments = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS)) || {};
    if (!comments[recipeId]) comments[recipeId] = [];
    const newComment = {
        id: Date.now(),
        userId: userId,
        userName: userName,
        text: text,
        date: new Date().toLocaleString()
    };
    comments[recipeId].push(newComment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    return newComment;
}

// подписка на автора
function subscribe(authorId) {
    const user = getCurrentUser();
    if (user && !user.subscriptions.includes(parseInt(authorId))) {
        user.subscriptions.push(parseInt(authorId));
        updateUserProfile({ subscriptions: user.subscriptions });
        updateAuthorFollowers(authorId, 1);
    }
}

function unsubscribe(authorId) {
    const user = getCurrentUser();
    if (user) {
        const index = user.subscriptions.indexOf(parseInt(authorId));
        if (index !== -1) {
            user.subscriptions.splice(index, 1);
            updateUserProfile({ subscriptions: user.subscriptions });
            updateAuthorFollowers(authorId, -1);
        }
    }
}

// проверка, подписан ли пользователь на автора
function isUserSubscribedToAuthor(user, authorId) {
    if (!user || !user.subscriptions) return false;
    return user.subscriptions.includes(parseInt(authorId));
}

// Инициализация при загрузке
initStorage();