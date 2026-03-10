(function() {
    const STORAGE_KEY = 'theme';
    const DARK_CLASS = 'dark-theme';

    function getSavedTheme() {
        return localStorage.getItem(STORAGE_KEY);
    }

    function setSavedTheme(theme) {
        localStorage.setItem(STORAGE_KEY, theme);
    }

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add(DARK_CLASS);
        } else {
            document.body.classList.remove(DARK_CLASS);
        }
    }

    function updateButtonIcon(theme) {
        const btn = document.getElementById('themeSwitcher');
        if (!btn) return;
        btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    function toggleTheme() {
        const isDark = document.body.classList.contains(DARK_CLASS);
        const newTheme = isDark ? 'light' : 'dark';
        applyTheme(newTheme);
        setSavedTheme(newTheme);
        updateButtonIcon(newTheme);
    }

    // Инициализация
    const savedTheme = getSavedTheme();
    if (savedTheme) {
        applyTheme(savedTheme);
        updateButtonIcon(savedTheme);
    } else {
        updateButtonIcon('light');
    }

    // Обработчик клика
    const switcher = document.getElementById('themeSwitcher');
    if (switcher) {
        switcher.addEventListener('click', toggleTheme);
    }
})();