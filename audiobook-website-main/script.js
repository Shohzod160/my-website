// --- Глобальные переменные и состояние ---
let currentUser = null; // Хранит информацию о вошедшем пользователе

// --- Функции для работы с API ---
async function apiRequest(url, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            // Попытка прочитать тело ошибки, если оно есть
            let errorBody;
            try {
                errorBody = await response.json();
            } catch (e) {
                // Если тело не JSON или пустое
                errorBody = { message: response.statusText };
            }
            throw new Error(errorBody.message || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API request to ${url} failed:`, error);
        throw error; // Перебрасываем ошибку для обработки вызывающей функцией
    }
}

// --- Основные функции рендеринга (из предыдущего ответа, почти без изменений) ---
async function fetchAudiobooks() {
    try {
        const response = await fetch('data.php'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, ${response.statusText} when fetching data.php`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            console.error('Data fetched is not an array:', data);
            throw new Error('Полученные данные не являются массивом аудиокниг.');
        }
        return data;
    } catch (error) {
        console.error('Error fetching audiobooks:', error);
        alert(`Не удалось загрузить список аудиокниг. Ошибка: ${error.message}. Проверьте data.php и его доступность.`);
        return [];
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

async function renderCategories() {
    const audiobooks = await fetchAudiobooks();
    if (!audiobooks || audiobooks.length === 0) {
        console.log('No audiobooks data to render categories.');
        return; 
    }
    const categoriesSet = new Set(audiobooks.map(book => book.category).filter(Boolean));
    const categories = ['All', ...categoriesSet];
    const container = document.getElementById('categories');
    if (!container) { console.error('Categories container not found'); return; }
    container.innerHTML = categories.map(category => `
        <button class="${category === 'All' ? 'active' : ''}" data-category="${category}">${category}</button>
    `).join('');
    container.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            const currentActive = container.querySelector('.active');
            if (currentActive) currentActive.classList.remove('active');
            button.classList.add('active');
            renderLibrary(button.dataset.category, audiobooks);
        });
    });
}

function renderAudiobookCard(book, featured = false) {
    return `
        <div class="audiobook-card ${featured ? 'featured' : ''}" data-id="${book.id}">
            <img src="${book.coverImage || 'placeholder-cover.jpg'}" alt="${book.title || 'Audiobook'}" onerror="this.onerror=null;this.src='placeholder-cover.jpg';">
            <div class="gradient"></div>
            <div class="content">
                <h3>${book.title || 'Без названия'}</h3>
                <p>${book.author || 'Неизвестный автор'}</p>
                <div class="meta">
                    <span>${book.duration || 'N/A'}</span>
                    <span class="play-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1">
                            <path d="M5 3v18l15-9L5 3z"/>
                        </svg>
                    </span>
                </div>
            </div>
            ${book.featured ? '<div class="featured-badge">Featured</div>' : ''}
        </div>
    `;
}

async function renderFeatured(audiobooksData) {
    const container = document.getElementById('featured-audiobooks');
    if (!container) { console.error('Featured audiobooks container not found'); return; }
    if (!audiobooksData || audiobooksData.length === 0) { container.innerHTML = '<p>Нет избранных аудиокниг.</p>'; return; }
    const featured = audiobooksData.filter(book => book.featured);
    if (featured.length === 0) { container.innerHTML = '<p>Нет избранных аудиокниг.</p>'; } 
    else {
        container.innerHTML = featured.map(book => renderAudiobookCard(book, true)).join('');
        addCardListeners(container, audiobooksData);
    }
}

async function renderLibrary(category = 'All', audiobooksData) {
    const container = document.getElementById('library-audiobooks');
    if (!container) { console.error('Library audiobooks container not found'); return; }
    if (!audiobooksData || audiobooksData.length === 0) { container.innerHTML = '<p>Аудиокниги не найдены.</p>'; return; }
    const filtered = category === 'All' ? audiobooksData : audiobooksData.filter(book => book.category === category);
    if (filtered.length === 0) { container.innerHTML = `<p>Нет аудиокниг в категории "${category}".</p>`; }
    else {
        container.innerHTML = filtered.map(book => renderAudiobookCard(book)).join('');
        addCardListeners(container, audiobooksData);
    }
}

function addCardListeners(container, audiobooksData) { 
    container.querySelectorAll('.audiobook-card').forEach(card => {
        card.addEventListener('click', () => { 
            const id = card.dataset.id;
            const book = audiobooksData.find(b => b.id.toString() === id.toString()); 
            if (book) initAudioPlayer(book);
            else { console.error(`Audiobook with ID ${id} not found.`); alert('Информация об аудиокниге не найдена.'); }
        });
    });
}

let currentAudioBookData = null; 

function initAudioPlayer(book) {
    currentAudioBookData = book; 
    const player = document.getElementById('audio-player');
    const audio = document.getElementById('audio-element');
    const cover = document.getElementById('player-cover');
    const title = document.getElementById('player-title');
    const author = document.getElementById('player-author');
    const playPause = document.getElementById('play-pause');
    const playIcon = playPause.querySelector('.play-icon');
    const pauseIcon = playPause.querySelector('.pause-icon');
    const seekBar = document.getElementById('seek-bar');
    const currentTimeEl = document.getElementById('current-time'); 
    const durationEl = document.getElementById('duration'); 
    const volumeBar = document.getElementById('volume-bar');
    const skipBack = player.querySelector('.skip-back'); 
    const skipForward = player.querySelector('.skip-forward'); 
    const downloadBtn = document.getElementById('download-audio-btn');

    if (!player || !audio || !cover || !title || !author || !playPause || !playIcon || !pauseIcon || !seekBar || !currentTimeEl || !durationEl || !volumeBar || !skipBack || !skipForward || !downloadBtn) {
        console.error('One or more audio player elements not found.'); return;
    }
    player.style.display = 'block';
    cover.src = book.coverImage || 'placeholder-cover.jpg'; cover.alt = book.title || 'Обложка';
    title.textContent = book.title || 'Без названия'; author.textContent = book.author || 'Неизвестный автор';
    if (!audio.paused) audio.pause();
    audio.currentTime = 0; audio.src = book.audioUrl;
    if (!book.audioUrl) {
        console.error('Audio URL is missing for the book:', book.title);
        alert('Аудиофайл для этой книги не найден.'); player.style.display = 'none'; return;
    }
    audio.volume = parseFloat(volumeBar.value);
    const updatePlayPauseIcons = () => {
        if (audio.paused || audio.ended) { playIcon.style.display = 'block'; pauseIcon.style.display = 'none'; } 
        else { playIcon.style.display = 'none'; pauseIcon.style.display = 'block'; }
    };
    audio.onloadedmetadata = () => { seekBar.max = audio.duration; durationEl.textContent = formatTime(audio.duration); updatePlayPauseIcons(); };
    audio.ontimeupdate = () => { seekBar.value = audio.currentTime; currentTimeEl.textContent = formatTime(audio.currentTime); };
    audio.onended = () => { updatePlayPauseIcons(); seekBar.value = audio.duration; };
    audio.onplay = updatePlayPauseIcons; audio.onpause = updatePlayPauseIcons;
    audio.onerror = (e) => {
        console.error('Ошибка воспроизведения аудио:', audio.error, e);
        let errorMessage = 'Не удалось воспроизвести аудио.';
        if (audio.error) {
            switch (audio.error.code) {
                case MediaError.MEDIA_ERR_ABORTED: errorMessage += ' Загрузка прервана.'; break;
                case MediaError.MEDIA_ERR_NETWORK: errorMessage += ' Проблема с сетью.'; break;
                case MediaError.MEDIA_ERR_DECODE: errorMessage += ' Ошибка декодирования.'; break;
                case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: errorMessage += ' Формат файла не поддерживается или URL некорректен.'; break;
                default: errorMessage += ' Неизвестная ошибка.';
            }
        }
        alert(errorMessage); updatePlayPauseIcons();
    };
    playPause.onclick = () => {
        if (!audio.src) { alert('Аудиофайл не загружен. Пожалуйста, выберите книгу.'); return; }
        if (audio.paused || audio.ended) {
            audio.play().catch(err => {
                console.error('Ошибка воспроизведения:', err);
                alert('Не удалось начать воспроизведение. ' + (err.message || '')); updatePlayPauseIcons();
            });
        } else { audio.pause(); }
    };
    seekBar.oninput = () => { if (audio.readyState > 0) { audio.currentTime = parseFloat(seekBar.value); currentTimeEl.textContent = formatTime(audio.currentTime); } };
    volumeBar.oninput = () => { audio.volume = parseFloat(volumeBar.value); };
    skipBack.onclick = () => { if (audio.readyState > 0) audio.currentTime = Math.max(0, audio.currentTime - 10); };
    skipForward.onclick = () => { if (audio.readyState > 0) audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); };
    downloadBtn.onclick = () => { 
        if (!currentAudioBookData || !currentAudioBookData.audioUrl) {
            console.error('Audio book data or audioUrl is missing for download.'); alert('Не удалось получить информацию для скачивания аудио.'); return;
        }
        const link = document.createElement('a'); link.href = currentAudioBookData.audioUrl;
        let filename = 'audiobook';
        const bookTitle = currentAudioBookData.title ? currentAudioBookData.title.replace(/[^\w\s.-]/gi, '_').replace(/\s+/g, '_') : 'untitled';
        let extension = '.mp3'; 
        try {
            const url = new URL(currentAudioBookData.audioUrl, window.location.origin); const urlPath = url.pathname;
            const lastDot = urlPath.lastIndexOf('.');
            if (lastDot > -1 && lastDot < urlPath.length - 1) {
                const extCandidate = urlPath.substring(lastDot + 1).toLowerCase();
                if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(extCandidate)) extension = '.' + extCandidate;
            }
        } catch (e) {
            const urlPathSimple = currentAudioBookData.audioUrl.split('?')[0]; const lastDotSimple = urlPathSimple.lastIndexOf('.');
            if (lastDotSimple > -1 && lastDotSimple < urlPathSimple.length - 1) {
                const extCandidateSimple = urlPathSimple.substring(lastDotSimple + 1).toLowerCase();
                 if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(extCandidateSimple)) extension = '.' + extCandidateSimple;
            } else { console.warn('Could not parse audioUrl to determine extension, defaulting to .mp3. URL:', currentAudioBookData.audioUrl, 'Error:', e); }
        }
        filename = `${bookTitle}${extension}`; link.download = filename; 
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };
    updatePlayPauseIcons();
}

// --- Обновление UI в зависимости от статуса пользователя ---
function updateUserUI() {
    const authButtonsDiv = document.querySelector('.auth-buttons');
    const logoSpan = document.querySelector('.logo span'); // "NightReader"

    if (currentUser) {
        // Пользователь вошел
        authButtonsDiv.innerHTML = `
            <span style="margin-right: 15px; color: var(--muted-foreground);">Привет, ${currentUser.name}!</span>
            <button class="sign-out-btn">Sign Out</button>
        `;
        const signOutBtn = authButtonsDiv.querySelector('.sign-out-btn');
        signOutBtn.style.background = 'var(--secondary)'; // Стили как у "How It Works"
        signOutBtn.style.color = 'var(--muted-foreground)';
        signOutBtn.addEventListener('mouseover', () => { signOutBtn.style.background = '#334155'; });
        signOutBtn.addEventListener('mouseout', () => { signOutBtn.style.background = 'var(--secondary)'; });

        signOutBtn.addEventListener('click', handleSignOut);
        if (logoSpan) logoSpan.textContent = `NightReader | ${currentUser.name}`;

    } else {
        // Пользователь не вошел
        authButtonsDiv.innerHTML = `
            <button class="sign-in">Sign In</button>
            <button class="sign-up">Sign Up</button>
        `;
        authButtonsDiv.querySelector('.sign-in').addEventListener('click', () => openModal('sign-in-modal'));
        authButtonsDiv.querySelector('.sign-up').addEventListener('click', () => openModal('sign-up-modal'));
        if (logoSpan) logoSpan.textContent = `NightReader`;
    }
}


// --- Обработчики событий для аутентификации и форм ---
async function handleSignUp(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const result = await apiRequest('api/signup.php', 'POST', data);
        alert(result.message);
        if (result.success) {
            currentUser = result.user; // Сохраняем данные пользователя
            updateUserUI();
            closeModal('sign-up-modal');
            form.reset();
        }
    } catch (error) {
        alert(`Ошибка регистрации: ${error.message}`);
    }
}

async function handleSignIn(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const result = await apiRequest('api/signin.php', 'POST', data);
        alert(result.message);
        if (result.success) {
            currentUser = result.user; // Сохраняем данные пользователя
            updateUserUI();
            closeModal('sign-in-modal');
            form.reset();
        }
    } catch (error) {
        alert(`Ошибка входа: ${error.message}`);
    }
}

async function handleSignOut() {
    try {
        const result = await apiRequest('api/signout.php', 'POST');
        alert(result.message);
        if (result.success) {
            currentUser = null;
            updateUserUI();
            // Можно добавить перезагрузку страницы или другие действия
        }
    } catch (error) {
        alert(`Ошибка выхода: ${error.message}`);
    }
}

async function handleContactForm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const result = await apiRequest('api/contact.php', 'POST', data);
        alert(result.message);
        if (result.success) {
            form.reset();
        }
    } catch (error) {
        alert(`Ошибка отправки сообщения: ${error.message}`);
    }
}

// --- Модальные окна ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// --- Инициализация приложения ---
document.addEventListener('DOMContentLoaded', async () => {
    // Проверка статуса пользователя при загрузке
    try {
        const status = await apiRequest('api/get_user_status.php');
        if (status.loggedIn) {
            currentUser = status.user;
        }
    } catch (error) {
        console.warn('Не удалось проверить статус пользователя:', error.message);
        // Продолжаем работу, пользователь будет считаться неавторизованным
    }
    updateUserUI(); // Обновляем UI на основе статуса

    // Рендеринг контента
    const allAudiobooks = await fetchAudiobooks(); 
    await renderCategories(); // renderCategories вызовет fetchAudiobooks внутри себя,
                              // можно оптимизировать, передавая allAudiobooks, если это необходимо.
    await renderFeatured(allAudiobooks);   
    await renderLibrary('All', allAudiobooks);

    // Навешивание обработчиков на статические элементы (модалки, формы)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) targetElement.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Кнопки Sign In/Sign Up создаются динамически в updateUserUI,
    // поэтому слушатели для них тоже там.
    // Если они изначально есть в HTML, то можно здесь:
    // const signInOpenBtn = document.querySelector('.auth-buttons .sign-in');
    // const signUpOpenBtn = document.querySelector('.auth-buttons .sign-up');
    // if(signInOpenBtn) signInOpenBtn.addEventListener('click', () => openModal('sign-in-modal'));
    // if(signUpOpenBtn) signUpOpenBtn.addEventListener('click', () => openModal('sign-up-modal'));


    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            if (modal) closeModal(modal.id);
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal(modal.id);
        });
    });

    const signUpFormEl = document.getElementById('sign-up-form');
    if (signUpFormEl) signUpFormEl.addEventListener('submit', handleSignUp);

    const signInFormEl = document.getElementById('sign-in-form');
    if (signInFormEl) signInFormEl.addEventListener('submit', handleSignIn);
    
    const contactFormEl = document.querySelector('.contact-form');
    if (contactFormEl) contactFormEl.addEventListener('submit', handleContactForm);
});