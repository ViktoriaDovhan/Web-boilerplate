import { randomUserMock } from './FE4U-Lab2-mock.js';

const courses = [
    "Mathematics", "Physics", "English", "Computer Science",
    "Dancing", "Chess", "Biology", "Chemistry",
    "Law", "Art", "Medicine", "Statistics"
];

function openAddTeacherWindow() {
    const modal = document.querySelector('.add-teacher-window');
    modal.style.display = 'block';
    populateSubjectDropdown(); // Заповнюємо список спеціальностей під час відкриття вікна
}


function populateSubjectDropdown() {
    const subjectDropdown = document.getElementById('subject');
    courses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        subjectDropdown.appendChild(option);
    });
}

// Функція для закриття вікна
function closeWindow() {
    const modal = document.querySelector('.add-teacher-window');
    modal.style.display = 'none';
}

document.querySelectorAll('.add-teacher-btn').forEach(button => {
    button.addEventListener('click', openAddTeacherWindow);
});

// Додаємо обробник події для кнопки закриття попапу
document.querySelector('.add-teacher-close-button').addEventListener('click', closeWindow);



function getRandomCourse() {
    const randomIndex = Math.floor(Math.random() * courses.length);
    return courses[randomIndex];
}

// Функція для збереження улюблених викладачів у LocalStorage
function saveFavoritesToLocalStorage(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Функція для завантаження улюблених викладачів з LocalStorage
function loadFavoritesFromLocalStorage() {
    const storedFavorites = localStorage.getItem('favorites');
    return storedFavorites ? JSON.parse(storedFavorites) : [];
}

// Функція для завантаження списку викладачів з LocalStorage
function loadTeachersFromLocalStorage() {
    const storedTeachers = localStorage.getItem('teachers');
    if (storedTeachers) {
        return JSON.parse(storedTeachers);
    }
    const teachersWithSubjects = randomUserMock.map(teacher => ({
        ...teacher,
        subject: getRandomCourse()
    }));
    localStorage.setItem('teachers', JSON.stringify(teachersWithSubjects));
    return teachersWithSubjects;
}

// Об'єкт для збереження початкового порядку викладачів
let originalTeachers = [];

// Об'єкт для відстеження стану сортування кожного стовпця
let sortState = {
    name: null,
    subject: null,
    age: null,
    gender: null,
    country: null
};

// Параметри пагінації
const teachersPerPage = 10;
let currentPage = 1;
let totalPages = 1;

function renderTeachers(teachers, favorites) {
    const teachersContainer = document.getElementById('teachers-container');
    teachersContainer.innerHTML = ''; // очищаємо контейнер

    teachers.forEach(teacher => {
        const teacherCard = document.createElement('div');
        teacherCard.classList.add('teacher-card');
        const isFavorite = favorites.some(fav => fav.login && fav.login.uuid === teacher.login?.uuid);

        // Перевіряємо, чи є зображення. Якщо немає, використовуємо ініціали
        let teacherImage = teacher.picture && teacher.picture.medium ?
            `<img src="${teacher.picture.medium}" alt="Teacher Photo">` :
            `<div class="teacher-initials">${teacher.name.first[0]}${teacher.name.last[0]}</div>`;

        // Додаємо зафарбовану зірочку для улюблених
        let starHTML = isFavorite ? `<span class="star">&#9733;</span>` : '';

        // Використовуємо email або login.uuid як унікальний ідентифікатор
        teacherCard.innerHTML = `
            <div class="teacher-photo-container">
                ${teacherImage}
                ${starHTML}
            </div>
            <h3>${teacher.name.first} ${teacher.name.last}</h3>
            <p class="subject">${teacher.subject}</p>
            <p class="country">${teacher.location.country}</p>
            <button data-id="${teacher.login?.uuid || teacher.email}" class="details-btn">Details</button>
        `;

        // Додаємо обробник події для кнопки "Details" безпосередньо тут
        teacherCard.querySelector('.details-btn').addEventListener('click', () => {
            openDetailsPopup(teacher, favorites);
        });

        teachersContainer.appendChild(teacherCard);
    });
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function openDetailsPopup(teacher, favorites) {
    const modal = document.getElementById('teacher-modal');
    const teacherPhoto = document.getElementById('teacher-photo');
    const teacherName = document.getElementById('teacher-name');
    const teacherSubject = document.getElementById('teacher-subject');
    const teacherLocation = document.getElementById('teacher-location');
    const teacherEmail = document.getElementById('teacher-email');
    const teacherPhone = document.getElementById('teacher-phone');
    const favoriteStar = document.querySelector('.favorite-btn');

    // Заповнюємо інформацію про викладача
    teacherPhoto.src = teacher.picture.large || '';
    teacherName.textContent = `${teacher.name.first} ${teacher.name.last}`;
    teacherSubject.textContent = teacher.subject;
    teacherLocation.textContent = `${teacher.location.country}, ${teacher.location.city}`;
    teacherEmail.textContent = teacher.email;
    teacherEmail.href = `mailto:${teacher.email}`;
    teacherPhone.textContent = teacher.phone;

    // Перевіряємо, чи є викладач у списку улюблених
    const isFavorite = favorites.some(fav => fav.login?.uuid === teacher.login?.uuid || fav.email === teacher.email);

    // Оновлюємо стан зірочки в попапі
    if (isFavorite) {
        favoriteStar.innerHTML = '&#9733;'; // Зафарбована зірочка
        favoriteStar.classList.add('starred');
    } else {
        favoriteStar.innerHTML = '&#9734;'; // Незафарбована зірочка
        favoriteStar.classList.remove('starred');
    }

    // Показуємо модальне вікно
    modal.style.display = 'block';

    // Обробник для зірочки в попапі
    favoriteStar.removeEventListener('click', togglePopupFavorite);
    favoriteStar.addEventListener('click', togglePopupFavorite);
}

function togglePopupFavorite() {
    const teacherName = document.getElementById('teacher-name').textContent;
    const favorites = loadFavoritesFromLocalStorage();
    const teachers = loadTeachersFromLocalStorage();

    const teacher = teachers.find(t => `${t.name.first} ${t.name.last}` === teacherName);

    if (teacher) {
        toggleFavorite(teacher); // змінюємо статус улюбленого
        updateStarDisplay(teacher); // Оновлюємо зірочку на основній сторінці
        updatePopupStar(teacher);   // Оновлюємо зірочку в попапі одразу після зміни
    }
}



function updatePopupStar(teacher) {
    const favorites = loadFavoritesFromLocalStorage();
    const isFavorite = favorites.some(fav => fav.login?.uuid === teacher.login?.uuid || fav.email === teacher.email);

    const popupStarElement = document.querySelector('.favorite-btn'); // Зірочка в попапі

    if (isFavorite) {
        popupStarElement.innerHTML = '&#9733;'; // Зафарбована зірочка
        popupStarElement.classList.add('starred'); // Додаємо клас для стилю
    } else {
        popupStarElement.innerHTML = '&#9734;'; // Незафарбована зірочка
        popupStarElement.classList.remove('starred'); // Видаляємо клас
    }
}

function toggleFavorite(teacher) {
    const favorites = loadFavoritesFromLocalStorage();
    const isFavorite = favorites.some(fav => fav.login?.uuid === teacher.login?.uuid || fav.email === teacher.email);

    if (isFavorite) {
        // Видаляємо викладача з улюблених
        const updatedFavorites = favorites.filter(fav => fav.login?.uuid !== teacher.login?.uuid && fav.email !== teacher.email);
        saveFavoritesToLocalStorage(updatedFavorites);
    } else {
        // Додаємо викладача до улюблених
        favorites.push(teacher);
        saveFavoritesToLocalStorage(favorites);
    }

    // Оновлюємо відображення улюблених
    renderFavorites();
}

function updateStarDisplay(teacher) {
    const teacherCard = document.querySelector(`[data-id="${teacher.login?.uuid || teacher.email}"]`).closest('.teacher-card');
    const favorites = loadFavoritesFromLocalStorage();
    const isFavorite = favorites.some(fav => fav.login?.uuid === teacher.login?.uuid || fav.email === teacher.email);

    let starHTML = '';
    if (isFavorite) {
        starHTML = '<span class="star">&#9733;</span>'; // Зафарбована зірочка
    } else {
        const starElement = teacherCard.querySelector('.star');
        if (starElement) {
            starElement.remove(); // Видаляємо зірочку, якщо викладача видалено зі списку улюблених
        }
        return; // Виходимо, якщо потрібно видалити зірочку
    }

    // Оновлюємо або додаємо зірочку до викладача на основній сторінці
    if (!teacherCard.querySelector('.star')) {
        teacherCard.querySelector('.teacher-photo-container').innerHTML += starHTML; // Додаємо зірочку, якщо її немає
    } else {
        teacherCard.querySelector('.star').innerHTML = starHTML; // Оновлюємо зірочку
    }
}


// Вибір елементів DOM для каруселі
const carouselSlide = document.getElementById('favorites-container');
const leftArrow = document.querySelector('.arrow.left');
const rightArrow = document.querySelector('.arrow.right');

let currentSlideIndex = 0; // Індекс поточного слайду
const teachersPerSlide = 5; // Кількість викладачів на одному слайді

// Функція для оновлення каруселі
function updateCarousel(favorites) {
    const totalSlides = Math.ceil(favorites.length / teachersPerSlide); // Кількість слайдів

    const favoritesContainer = document.getElementById('favorites-container');
    favoritesContainer.innerHTML = ''; // Очищаємо контейнер

    if (favorites.length === 0) {
        leftArrow.style.display = 'none';
        rightArrow.style.display = 'none';
        return;
    }

    // Перевіряємо, чи currentSlideIndex виходить за межі слайдів, і скидаємо його
    if (currentSlideIndex >= totalSlides) {
        currentSlideIndex = totalSlides - 1;
    }

    if (currentSlideIndex < 0) {
        currentSlideIndex = 0;
    }

    // Визначаємо викладачів для поточного слайду
    const startIndex = currentSlideIndex * teachersPerSlide;
    const endIndex = Math.min(startIndex + teachersPerSlide, favorites.length);
    const currentFavorites = favorites.slice(startIndex, endIndex);

    // Додаємо викладачів до контейнера
    currentFavorites.forEach(teacher => {
        const slideItem = document.createElement('div');
        slideItem.classList.add('favorite');

        slideItem.innerHTML = `
      <img src="${teacher.picture.medium || ''}" alt="${teacher.name.first}">
      <div class="info">
        <p class="name">${teacher.name.first} ${teacher.name.last}</p>
        <p class="country">${teacher.location.country}</p>
      </div>
    `;

        favoritesContainer.appendChild(slideItem);
    });

    // Показуємо або ховаємо стрілки
    if (totalSlides <= 1) {
        leftArrow.style.display = 'none';
        rightArrow.style.display = 'none';
    } else {
        leftArrow.style.display = 'flex';
        rightArrow.style.display = 'flex';
    }
}

// Обробники для стрілок
leftArrow.addEventListener('click', () => {
    const favorites = loadFavoritesFromLocalStorage(); // Отримуємо улюблених викладачів знову
    const totalSlides = Math.ceil(favorites.length / teachersPerSlide);

    if (totalSlides > 0) {
        currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides; // Логіка для руху назад
        updateCarousel(favorites); // Оновлюємо відображення каруселі
    }
});

rightArrow.addEventListener('click', () => {
    const favorites = loadFavoritesFromLocalStorage(); // Отримуємо улюблених викладачів знову
    const totalSlides = Math.ceil(favorites.length / teachersPerSlide);

    if (totalSlides > 0) {
        currentSlideIndex = (currentSlideIndex + 1) % totalSlides; // Логіка для руху вперед
        updateCarousel(favorites); // Оновлюємо відображення каруселі
    }
});

// Функція для ініціалізації каруселі при завантаженні сторінки
function initCarousel() {
    const favorites = loadFavoritesFromLocalStorage(); // Отримуємо улюблених викладачів
    updateCarousel(favorites); // Оновлюємо карусель
}

document.addEventListener('DOMContentLoaded', initCarousel);

// Функція для рендерингу улюблених викладачів
function renderFavorites() {
    const favorites = loadFavoritesFromLocalStorage();
    const favoritesContainer = document.getElementById('favorites-container');
    favoritesContainer.innerHTML = ''; // очищаємо контейнер

    favorites.forEach(teacher => {
        const favoriteCard = document.createElement('div');
        favoriteCard.classList.add('teacher-card');

        favoriteCard.innerHTML = `
            <img src="${teacher.picture.medium}" alt="Teacher Photo">
            <h3>${teacher.name.first} ${teacher.name.last}</h3>
            <p>${teacher.subject}</p>
            <p>${teacher.location.country}</p>
        `;

        favoritesContainer.appendChild(favoriteCard);
    });
    updateCarousel(favorites); // Оновлення каруселі
}

// Функція для фільтрації викладачів за країною, віком, статтю та списком вибраних
function filterTeachers(teachers, filters, favorites) {
    return teachers.filter(teacher => {
        // Фільтрація за країною
        const matchesCountry = !filters.country || teacher.location.country.toLowerCase() === filters.country.toLowerCase();

        // Фільтрація за віком (діапазон)
        let matchesAge = true;
        if (filters.age) {
            const [minAge, maxAge] = filters.age.split('-').map(Number); // Отримуємо мінімальний і максимальний вік з діапазону
            matchesAge = teacher.dob.age >= minAge && teacher.dob.age <= maxAge;
        }

        // Фільтрація за статтю
        const matchesGender = !filters.gender || teacher.gender === filters.gender;

        // Фільтрація за улюбленими
        const isFavorite = favorites.some(fav => fav.login?.uuid === teacher.login?.uuid);
        const matchesFavorites = !filters.onlyFavorites || isFavorite;

        return matchesCountry && matchesAge && matchesGender && matchesFavorites;
    });
}

// Функція для оновлення списку викладачів на основній сторінці з фільтрацією
function updateTeacherList() {
    const filters = {
        country: document.querySelector('select[name="country"]').value, // Вибір країни
        age: document.querySelector('select[name="age"]').value, // Вибір віку
        gender: document.querySelector('select[name="gender"]').value, // Вибір статі
        onlyFavorites: document.getElementById('favorites-checkbox').checked, // Фільтр "тільки улюблені"
    };

    const teachers = loadTeachersFromLocalStorage();
    const favorites = loadFavoritesFromLocalStorage();

    // Фільтруємо викладачів на основі фільтрів
    const filteredTeachers = filterTeachers(teachers, filters, favorites);

    // Оновлюємо заголовки сторінок
    currentPage = 1; // Скидаємо до першої сторінки при новій фільтрації

    // Оновлюємо статистику та рендеримо викладачів
    renderTeachersInStatistics(filteredTeachers);
    renderTeachers(filteredTeachers, favorites);
    renderFavorites();
}

function renderTeachersInStatistics(teachers) {
    const statisticsContainer = document.getElementById('statistics-container');
    statisticsContainer.innerHTML = ''; // очищаємо контейнер

    // Визначаємо загальну кількість сторінок
    totalPages = Math.ceil(teachers.length / teachersPerPage);
    if (totalPages === 0) totalPages = 1; // Щоб уникнути нульової сторінки

    // Перевіряємо, щоб поточна сторінка не перевищувала загальну кількість сторінок
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    // Сортуємо перед відображенням на основі збережених ключа і напрямку
    const sortedTeachers = sortTeachersByDirection(teachers, currentSortKey, currentSortDirection);

    // Отримуємо викладачів для поточної сторінки
    const startIndex = (currentPage - 1) * teachersPerPage;
    const endIndex = startIndex + teachersPerPage;
    const teachersToDisplay = sortedTeachers.slice(startIndex, endIndex);

    const table = document.createElement('table');
    table.classList.add('statistics-table');

    // Заголовок таблиці
    const header = document.createElement('thead');
    header.innerHTML = `
        <tr>
            <th data-sort="name">Name</th>
            <th data-sort="subject">Speciality</th>
            <th data-sort="age">Age</th>
            <th data-sort="gender">Gender</th>
            <th data-sort="country">Country</th>
        </tr>
    `;
    table.appendChild(header);

    // Вміст таблиці
    const tbody = document.createElement('tbody');
    teachersToDisplay.forEach(teacher => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${teacher.name.first} ${teacher.name.last}</td>
            <td>${teacher.subject}</td>
            <td>${teacher.dob.age}</td> 
            <td>${teacher.gender}</td>
            <td>${teacher.location.country}</td>
        `;

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    statisticsContainer.appendChild(table);

    // Додаємо обробник події для заголовків таблиці
    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
        header.style.cursor = 'pointer'; // Вказуємо, що заголовки клікабельні
        header.addEventListener('click', () => {
            const sortKey = header.getAttribute('data-sort');
            const sortedTeachers = sortTeachers(teachers, sortKey);
            renderTeachersInStatistics(sortedTeachers);  // Оновлюємо таблицю після сортування
            updateSortIndicators(header, sortKey);
        });
    });

    // Рендеримо пагінацію
    renderPagination(teachers); // Передаємо список викладачів для пагінації
}


let currentSortKey = 'name'; // за замовчуванням сортуємо за іменем
let currentSortDirection = 'asc'; // за замовчуванням сортуємо по зростанню

function sortTeachers(teachers, sortKey) {
    const currentSort = sortState[sortKey];
    let sortedTeachers = [...teachers];

    if (currentSort === 'asc') {
        sortedTeachers.sort((a, b) => compare(a, b, sortKey));
        sortState[sortKey] = 'desc';
        currentSortDirection = 'desc'; // Зберігаємо напрямок сортування
    } else if (currentSort === 'desc') {
        sortedTeachers.sort((a, b) => compare(b, a, sortKey));
        sortState[sortKey] = 'asc';
        currentSortDirection = 'asc'; // Зберігаємо напрямок сортування
    } else {
        // Якщо не сортували, сортуємо спочатку по зростанню
        sortedTeachers.sort((a, b) => compare(a, b, sortKey));
        sortState[sortKey] = 'asc';
        currentSortDirection = 'asc'; // Зберігаємо напрямок сортування
    }

    // Зберігаємо поточний ключ сортування
    currentSortKey = sortKey;

    return sortedTeachers;
}

function sortTeachersByDirection(teachers, sortKey, direction) {
    let sortedTeachers = [...teachers];
    if (direction === 'asc') {
        sortedTeachers.sort((a, b) => compare(a, b, sortKey));
    } else if (direction === 'desc') {
        sortedTeachers.sort((a, b) => compare(b, a, sortKey));
    }
    return sortedTeachers;
}

// Допоміжна функція для порівняння значень
function compare(a, b, sortKey) {
    let aValue, bValue;

    switch (sortKey) {
        case 'name':
            aValue = a.name.first + ' ' + a.name.last;
            bValue = b.name.first + ' ' + b.name.last;
            break;
        case 'subject':
            aValue = a.subject;
            bValue = b.subject;
            break;
        case 'age':
            aValue = a.dob.age;
            bValue = b.dob.age;
            break;
        case 'gender':
            aValue = a.gender;
            bValue = b.gender;
            break;
        case 'country':
            aValue = a.location.country;
            bValue = b.location.country;
            break;
        default:
            aValue = '';
            bValue = '';
    }

    if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue);
    } else {
        return aValue - bValue;
    }
}

function renderPagination() {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = ''; // Очищаємо попередні посилання

    // Функція для створення посилання
    function createPageLink(page, text = page) {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = text;
        if (page === currentPage) {
            link.classList.add('active'); // Активна сторінка
        }
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (page !== currentPage) {
                currentPage = page;
                const filters = {
                    country: document.querySelector('select[name="country"]').value,
                    age: document.querySelector('select[name="age"]').value,
                    gender: document.querySelector('select[name="gender"]').value,
                    onlyFavorites: document.getElementById('favorites-checkbox').checked,
                };
                const teachers = loadTeachersFromLocalStorage();
                const favorites = loadFavoritesFromLocalStorage();
                const filteredTeachers = filterTeachers(teachers, filters, favorites);
                renderTeachersInStatistics(filteredTeachers); // застосовуємо сортування
            }
        });
        return link;
    }

    // Відображаємо тільки необхідні сторінки (наприклад, поточна, попередня, наступна, перша та остання)
    // Можна покращити логіку для великих кількостей сторінок
    if (totalPages <= 1) {
        return; // Не показуємо пагінацію, якщо лише одна сторінка
    }

    // Додаємо першу сторінку
    paginationContainer.appendChild(createPageLink(1));

    // Додаємо "..." якщо потрібно
    if (currentPage > 3 && totalPages > 5) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        paginationContainer.appendChild(dots);
    }

    // Відображаємо сторінки навколо поточної сторінки
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
        paginationContainer.appendChild(createPageLink(i));
    }

    // Додаємо "..." якщо потрібно
    if (currentPage < totalPages - 2 && totalPages > 5) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        paginationContainer.appendChild(dots);
    }

    // Додаємо останню сторінку
    paginationContainer.appendChild(createPageLink(totalPages));
}


// Функція для оновлення індикаторів сортування
function updateSortIndicators(activeHeader, sortKey) {
    const headers = activeHeader.parentElement.querySelectorAll('th');
    headers.forEach(header => {
        if (header === activeHeader) {
            const state = sortState[sortKey];
            header.innerHTML = header.textContent.replace(/[\u2191\u2193]/g, '').trim(); // Видаляємо існуючі стрілочки
            if (state === 'asc') {
                header.innerHTML += ' &#2191;'; // Стрілочка вгору
            } else if (state === 'desc') {
                header.innerHTML += ' &#2193;'; // Стрілочка вниз
            }
        } else {
            // Видаляємо стрілочки з інших заголовків
            header.innerHTML = header.textContent.replace(/[\u2191\u2193]/g, '').trim();
        }
    });
}

// Оновлення статистики з урахуванням фільтрів
function updateStatistics() {
    const filters = {
        country: document.querySelector('select[name="country"]').value,
        age: document.querySelector('select[name="age"]').value,
        gender: document.querySelector('select[name="gender"]').value,
        onlyFavorites: document.getElementById('favorites-checkbox').checked,
    };

    const teachers = loadTeachersFromLocalStorage();
    const favorites = loadFavoritesFromLocalStorage();

    // Фільтруємо викладачів
    const filteredTeachers = filterTeachers(teachers, filters, favorites);

    // Зберігаємо початковий порядок при першому завантаженні
    if (originalTeachers.length === 0) {
        originalTeachers = [...filteredTeachers];
    }

    // Відображаємо відфільтрованих викладачів у статистиці
    renderTeachersInStatistics(filteredTeachers);
}

// Функція для пошуку викладачів за ім'ям, коментарем або віком
function searchTeachers() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const teachers = loadTeachersFromLocalStorage();
    const favorites = loadFavoritesFromLocalStorage();

    // Фільтруємо викладачів на основі пошукового запиту
    const filteredTeachers = teachers.filter(teacher => {
        const nameMatch = (teacher.name.first + ' ' + teacher.name.last).toLowerCase().includes(searchQuery);
        const noteMatch = teacher.note && teacher.note.toLowerCase().includes(searchQuery);
        const ageMatch = teacher.dob.age.toString().includes(searchQuery);

        return nameMatch || noteMatch || ageMatch;
    });

    // Оновлюємо інтерфейс з результатами пошуку
    renderTeachers(filteredTeachers, favorites);
}
document.getElementById('search-button').addEventListener('click', searchTeachers);

// Додаємо також обробку події на натискання клавіші Enter
document.getElementById('search-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        searchTeachers();
    }
});
const teachersWithSubjects = randomUserMock.map(teacher => ({
    ...teacher,
    subject: getRandomCourse(),
    note: "Great teacher" // додайте коментар
}));

function validateTeacherData(teacher) {
    const errors = [];

    // Перевірка імені, прізвища, країни та міста на велику літеру
    if (!/^[A-ZА-Я][a-zа-я]+$/.test(teacher.name.first)) {
        errors.push("First name must start with a capital letter.");
    }
    if (!/^[A-ZА-Я][a-zа-я]+$/.test(teacher.name.last)) {
        errors.push("Last name must start with a capital letter.");
    }
    if (!/^[A-ZА-Я][a-zа-я]+$/.test(teacher.location.country)) {
        errors.push("Country name must start with a capital letter.");
    }
    if (!/^[A-ZА-Я][a-zа-я]+$/.test(teacher.location.city)) {
        errors.push("City name must start with a capital letter.");
    }

    // Перевірка наявності символа @ у пошті
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacher.email)) {
        errors.push("Email must contain @ and be in a valid format.");
    }

    // Перевірка довжини номера телефону (до 12 символів)
    if (teacher.phone.length > 12) {
        errors.push("Phone number must not exceed 12 characters.");
    }

    return errors;
}

function showErrorMessages(errors) {
    const errorContainer = document.getElementById('error-messages');
    errorContainer.innerHTML = ''; // Очищуємо попередні помилки

    errors.forEach(error => {
        const errorElement = document.createElement('div');
        errorElement.classList.add('error-message');
        errorElement.textContent = error;
        errorContainer.appendChild(errorElement);
    });
}

function clearInvalidFields(teacher, errors) {
    if (errors.includes("First name must start with a capital letter.")) {
        document.querySelector('#teacher-name-add').value = '';
    }
    if (errors.includes("Last name must start with a capital letter.")) {
        document.querySelector('#teacher-name-add').value = '';
    }
    if (errors.includes("Country name must start with a capital letter.")) {
        document.querySelector('#country').value = '';
    }
    if (errors.includes("City name must start with a capital letter.")) {
        document.querySelector('#city').value = '';
    }
    if (errors.includes("Email must contain @ and be in a valid format.")) {
        document.querySelector('#email').value = '';
    }
    if (errors.includes("Phone number must not exceed 12 characters.")) {
        document.querySelector('#phone').value = '';
    }
}

function addTeacher(event) {
    event.preventDefault(); // Запобігаємо перезавантаженню сторінки

    const name = document.querySelector('#teacher-name-add').value;
    const subject = document.querySelector('#subject').value;
    const country = document.querySelector('#country').value;
    const city = document.querySelector('#city').value;
    const email = document.querySelector('#email').value;
    const phone = document.querySelector('#phone').value;
    const birthdate = document.querySelector('#birthdate').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const backgroundColor = document.querySelector('#bg-color').value;
    const note = document.querySelector('#notes').value;

    // Створення об'єкта викладача для валідації
    const newTeacher = {
        name: { first: name.split(' ')[0], last: name.split(' ')[1] || '' },
        subject,
        location: { country, city },
        email,
        phone,
        dob: { date: birthdate, age: new Date().getFullYear() - new Date(birthdate).getFullYear() },
        gender,
        picture: { medium: '', large: '' }, // Можна додати URL зображення
        note,
        backgroundColor
    };

    // Виклик функції валідації
    const validationErrors = validateTeacherData(newTeacher);
    if (validationErrors.length > 0) {
        // Показуємо помилки і очищаємо поля
        showErrorMessages(validationErrors);
        clearInvalidFields(newTeacher, validationErrors);
        return; // Зупиняємо додавання викладача, якщо є помилки
    }

    // Генерація унікального uuid для кожного нового викладача
    const uuid = generateUUID();  // Генеруємо новий UUID для кожного викладача
    newTeacher.login = { uuid };  // Призначаємо унікальний uuid

    // Додаємо нового викладача до LocalStorage
    const teachers = loadTeachersFromLocalStorage();
    teachers.push(newTeacher);
    localStorage.setItem('teachers', JSON.stringify(teachers));

    // Очищуємо попередні повідомлення про помилки
    document.getElementById('error-messages').innerHTML = '';

    // Оновлюємо інтерфейс після додавання
    const favorites = loadFavoritesFromLocalStorage();
    renderTeachers(teachers, favorites);      // Оновлення списку в Top Teachers
    renderTeachersInStatistics(teachers);     // Оновлення списку в Statistics
    closeWindow();                            // Закриваємо вікно після додавання
}




// Додаємо обробник для форми додавання викладача
document.querySelector('.add-teacher-form').addEventListener('submit', addTeacher);






document.addEventListener('DOMContentLoaded', () => {
    const teachers = loadTeachersFromLocalStorage();
    const favorites = loadFavoritesFromLocalStorage();

    // Зберігаємо початковий порядок викладачів
    originalTeachers = [...teachers];

    // Відображаємо викладачів при завантаженні сторінки
    renderTeachersInStatistics(teachers);  // Для статистики
    renderTeachers(teachers, favorites);    // Для основного списку
    renderFavorites();

    const modal = document.getElementById('teacher-modal');
    const closeModalBtn = document.getElementById('close-modal');
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Додаємо обробники подій для фільтрів
    const filterElements = [
        'select[name="age"]',
        'select[name="country"]',
        'select[name="gender"]',
        '#favorites-checkbox'
    ];

    filterElements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener('change', updateTeacherList);
            element.addEventListener('change', updateStatistics);
        }
    });

    // Пошук за ім'ям, коментарем та віком
    document.getElementById('search-button').addEventListener('click', searchTeachers);
    document.getElementById('search-input').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            searchTeachers();
        }
    });
});
