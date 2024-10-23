let currentPageTeachers = 1; // Поточна сторінка для API-запитів
let totalTeachersFetched = 0; // Лічильник загальної кількості завантажених викладачів
const maxTeachersFromAPI = 50; // Максимальна кількість викладачів з API
let allTeachers = []; // Масив для зберігання всіх викладачів
let filteredTeachers = []; // Масив для зберігання відфільтрованих викладачів
let currentPageStats = 1; // Поточна сторінка статистики
localStorage.clear()
function fetchTeachersFromAPI(page = 1, clear = false) {
    const remainingTeachers = maxTeachersFromAPI - totalTeachersFetched;

    if (remainingTeachers <= 0) {
        console.log('Досягнуто ліміту в 50 викладачів з API');
        return; // Якщо вже завантажено 50 викладачів, не робимо запит до API
    }

    const teachersToFetch = Math.min(10, remainingTeachers);

    const API_URL = `https://randomuser.me/api/?results=${teachersToFetch}&page=${page}`;
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            if (data.results) {
                const teachersData = data.results.map(teacher => ({
                    name: {
                        first: teacher.name.first,
                        last: teacher.name.last
                    },
                    subject: getRandomCourse(),
                    location: {
                        country: teacher.location.country,
                        city: teacher.location.city
                    },
                    email: teacher.email,
                    phone: teacher.phone,
                    dob: teacher.dob,
                    picture: teacher.picture,
                    login: {
                        uuid: teacher.login?.uuid || generateUUID()  // Якщо UUID не існує, генеруємо його
                    },
                    gender: teacher.gender
                }));

                totalTeachersFetched += teachersData.length;

                allTeachers = allTeachers.concat(teachersData); // Додаємо викладачів до глобального масиву

                appendTeachers(teachersData, clear); // Додаємо нових викладачів в Top Teachers
                renderTeachersInStatistics(allTeachers); // Оновлюємо статистику після додавання нових викладачів
                updateStatisticsPagination(allTeachers.length); // Оновлюємо статистику після додавання нових викладачів
            } else {
                console.error("No 'results' in the response");
            }
        })
        .catch(error => {
            console.error('Error fetching data from API:', error);
        });
}

// Функція для рендерингу викладачів в розділі Top Teachers
function appendTeachers(teachers, clear = false) {
    const teachersContainer = document.getElementById('teachers-container');

    if (clear) {
        teachersContainer.innerHTML = ''; // Очищуємо контейнер, якщо потрібно
    }

    teachers.forEach(teacher => {
        const teacherCard = document.createElement('div');
        teacherCard.classList.add('teacher-card');

        let teacherImage = teacher.picture && teacher.picture.medium ?
            `<img src="${teacher.picture.medium}" alt="Teacher Photo">` :
            `<div class="teacher-initials">${teacher.name.first[0]}${teacher.name.last[0]}</div>`;

        teacherCard.innerHTML = `
            <div class="teacher-photo-container">
                ${teacherImage}
            </div>
            <h3>${teacher.name.first} ${teacher.name.last}</h3>
            <p class="subject">${teacher.subject}</p>
            <p class="country">${teacher.location.country}</p>
            <button data-id="${teacher.login?.uuid || teacher.email}" class="details-btn">Details</button>
        `;

        // Додаємо обробник події для кнопки "Details"
        const detailsButton = teacherCard.querySelector('.details-btn');
        detailsButton.addEventListener('click', () => {
            openDetailsPopup(teacher);
        });

        teachersContainer.appendChild(teacherCard);
    });
}

// Кнопка "More"
document.getElementById('next-teachers-btn').addEventListener('click', () => {
    currentPageTeachers += 1; // Збільшуємо номер сторінки
    fetchTeachersFromAPI(currentPageTeachers, false); // Завантажуємо нових викладачів
});


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
    subjectDropdown.innerHTML = '<option value="">Select Subject</option>'; // Очистити та додати перший варіант
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

function saveTeachersToLocalStorage(teachers) {
    localStorage.setItem('teachers', JSON.stringify(teachers));
}
// Функція для збереження улюблених викладачів у LocalStorage
function saveFavoritesToLocalStorage(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function loadFavoritesFromLocalStorage() {
    const storedFavorites = localStorage.getItem('favorites');
    return storedFavorites ? JSON.parse(storedFavorites) : [];
}

function loadTeachersFromLocalStorage() {
    const storedTeachers = localStorage.getItem('teachers');
    if (storedTeachers) {
        return JSON.parse(storedTeachers); // Якщо викладачі є в LocalStorage, повертаємо їх
    } else {
        // Якщо немає викладачів у LocalStorage, повертаємо порожній масив
        return [];
    }
}

let sortState = {
    name: null,
    subject: null,
    age: null,
    gender: null,
    country: null
};
let originalTeachers = []; // Зберігаємо оригінальний порядок викладачів

let currentPage = 1;

function renderTeachers(teachers) {
    appendTeachers(teachers, true); // Очистити контейнер перед рендерингом
}



function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function openDetailsPopup(teacher) {
    const modal = document.getElementById('teacher-modal');
    const teacherPhoto = document.getElementById('teacher-photo');
    const teacherName = document.getElementById('teacher-name');
    const teacherSubject = document.getElementById('teacher-subject');
    const teacherLocation = document.getElementById('teacher-location');
    const teacherEmail = document.getElementById('teacher-email');
    const teacherPhone = document.getElementById('teacher-phone');
    const favoriteStar = document.getElementById('favorite-star');

    // Fill modal with teacher info
    teacherPhoto.src = teacher.picture.large || '';
    teacherName.textContent = `${teacher.name.first} ${teacher.name.last}`;
    teacherSubject.textContent = teacher.subject;
    teacherLocation.textContent = `${teacher.location.city}, ${teacher.location.country}`;
    teacherEmail.href = `mailto:${teacher.email}`;
    teacherEmail.textContent = teacher.email;
    teacherPhone.textContent = teacher.phone;

    // Check if the teacher is in the favorites
    const favorites = loadFavoritesFromLocalStorage();
    const isFavorite = favorites.some(fav => fav.login.uuid === teacher.login.uuid);

    // Update star status in the modal
    favoriteStar.innerHTML = isFavorite ? '&#9733;' : '&#9734;';

    // Show the modal
    modal.style.display = 'block';

    // Add event listener for closing the modal
    document.getElementById('close-modal').onclick = () => {
        modal.style.display = 'none';
    };

    // Add event listener for toggling favorite status
    favoriteStar.onclick = () => {
        toggleFavorite(teacher);
        renderFavorites(); // Update the favorites section immediately
        updateStarDisplay(teacher); // Update the star on the main page
    };
}

function updatePopupStar(teacher) {
    const favorites = loadFavoritesFromLocalStorage();
    const isFavorite = favorites.some(fav => fav.login?.uuid === teacher.login?.uuid);

    const popupStarElement = document.querySelector('.favorite-btn'); // Зірочка у попапі

    // Оновлюємо зірочку у попапі
    if (isFavorite) {
        popupStarElement.innerHTML = '&#9733;'; // Зафарбована зірочка
        popupStarElement.classList.add('starred');
    } else {
        popupStarElement.innerHTML = '&#9734;'; // Порожня зірочка
        popupStarElement.classList.remove('starred');
    }
}

function toggleFavorite(teacher) {
    const favorites = loadFavoritesFromLocalStorage();
    const isFavorite = favorites.some(fav => fav.login.uuid === teacher.login.uuid);

    if (isFavorite) {
        // Remove from favorites
        const updatedFavorites = favorites.filter(fav => fav.login.uuid !== teacher.login.uuid);
        saveFavoritesToLocalStorage(updatedFavorites);
    } else {
        // Add to favorites
        favorites.push(teacher);
        saveFavoritesToLocalStorage(favorites);
    }
    // Update the star in the modal popup
    updatePopupStar(teacher);
    // Update the star on the main page
    updateStarDisplay(teacher);
    // Refresh the favorites section
    renderFavorites();
}


function updateStarDisplay(teacher) {
    const teacherCard = document.querySelector(`[data-id="${teacher.login.uuid}"]`).closest('.teacher-card');
    const favorites = loadFavoritesFromLocalStorage();
    const isFavorite = favorites.some(fav => fav.login.uuid === teacher.login.uuid);

    let starHTML = isFavorite ? '<span class="star">&#9733;</span>' : ''; // Filled star or empty

    const starElement = teacherCard.querySelector('.star');
    if (!starElement) {
        // If there's no star, add it
        teacherCard.querySelector('.teacher-photo-container').innerHTML += starHTML;
    } else {
        // Update the existing star
        teacherCard.querySelector('.star').innerHTML = starHTML;
    }
}


// Вибір елементів DOM для каруселі
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

function renderFavorites() {
    const favorites = loadFavoritesFromLocalStorage();
    const favoritesContainer = document.getElementById('favorites-container');
    favoritesContainer.innerHTML = ''; // Clear the container

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

    updateCarousel(favorites); // Update the favorites carousel (if applicable)
}

function filterTeachers(teachers, filters, favorites) {
    const filtered = teachers.filter(teacher => {
        const matchesCountry = !filters.country || teacher.location.country.toLowerCase() === filters.country.toLowerCase();
        let matchesAge = true;
        if (filters.age) {
            const [minAge, maxAge] = filters.age.split('-').map(Number);
            matchesAge = teacher.dob.age >= minAge && teacher.dob.age <= maxAge;
        }
        const matchesGender = !filters.gender || teacher.gender === filters.gender.toLowerCase();
        const isFavorite = favorites.some(fav => fav.login?.uuid === teacher.login?.uuid);
        const matchesFavorites = !filters.onlyFavorites || isFavorite;
        return matchesCountry && matchesAge && matchesGender && matchesFavorites;
    });

    console.log('Filtered Teachers:', filtered); // Лог для перевірки

    return filtered;
}

// Функція для оновлення списку викладачів на основній сторінці з фільтрацією
function updateTeacherList() {
    const filters = {
        country: document.querySelector('select[name="country"]').value, // Вибір країни
        age: document.querySelector('select[name="age"]').value, // Вибір віку
        gender: document.querySelector('select[name="gender"]').value, // Вибір статі
        onlyFavorites: document.getElementById('favorites-checkbox').checked, // Фільтр "тільки улюблені"
    };

    const teachers = allTeachers.length > 0 ? allTeachers : loadTeachersFromLocalStorage();
    const favorites = loadFavoritesFromLocalStorage();

    const filteredTeachers = filterTeachers(teachers, filters, favorites); // Оновлюємо глобальну змінну filteredTeachers

    console.log('Filtered Teachers:', filteredTeachers);

    currentPage = 1;

    renderTeachers(filteredTeachers);
    renderTeachersInStatistics(filteredTeachers); // Передаємо фільтрованих викладачів
    renderStatisticsPagination(filteredTeachers.length);
}


let teachersPerPageStats = 10; // Скільки викладачів показувати на сторінці статистики

function renderTeachersInStatistics(teachers = allTeachers) {
    const statisticsContainer = document.getElementById('statistics-container');
    statisticsContainer.innerHTML = ''; // Очищаємо контейнер

    if (teachers.length === 0) {
        console.log('No teachers to display in statistics');
        statisticsContainer.innerHTML = '<p>No teachers to display.</p>';
        return; // Якщо немає викладачів, не рендеримо таблицю
    }

    console.log('Teachers for statistics:', teachers); // Лог для перевірки викладачів

    const startIndex = (currentPageStats - 1) * teachersPerPageStats;
    const endIndex = Math.min(startIndex + teachersPerPageStats, teachers.length);
    const teachersToDisplay = teachers.slice(startIndex, endIndex);

    const table = document.createElement('table');
    table.classList.add('statistics-table');

    const header = document.createElement('thead');
    header.innerHTML = `
        <tr>
            <th data-sort="name">Name</th>
            <th data-sort="subject">Subject</th>
            <th data-sort="age">Age</th>
            <th data-sort="gender">Gender</th>
            <th data-sort="country">Country</th>
        </tr>
    `;
    table.appendChild(header);

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

    renderStatisticsPagination(teachers.length); // Оновлюємо пагінацію


    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
        header.style.cursor = 'pointer'; // Курсор "рука" для наочності
        header.addEventListener('click', () => {
            const sortKey = header.getAttribute('data-sort');
            updateSortAndRender(sortKey); // Викликаємо функцію сортування та рендерингу
        });
    });
}

function updateStatisticsPagination(totalTeachers) {
    const paginationContainer = document.getElementById('statistics-pagination');
    paginationContainer.innerHTML = ''; // Очищаємо попередні кнопки

    const totalPages = Math.ceil(totalTeachers / teachersPerPageStats);

    for (let page = 1; page <= totalPages; page++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = page;

        if (page === currentPageStats) {
            pageLink.classList.add('active');
        }

        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentPageStats = page;
            renderTeachersInStatistics(allTeachers); // Оновлюємо статистику на основі поточної сторінки
        });

        paginationContainer.appendChild(pageLink);
    }

    renderTeachersInStatistics(allTeachers); // Рендеримо викладачів на поточній сторінці
}



let currentSortKey = 'name'; // за замовчуванням сортуємо за іменем
let currentSortDirection = 'asc'; // за замовчуванням сортуємо по зростанню

function sortTeachers(teachers, sortKey) {
    const currentSort = sortState[sortKey];

    // Створюємо новий масив для сортування, щоб не змінювати оригінальний
    let sortedTeachers = [...teachers];

    if (currentSort === 'asc') {
        // Другий клік: сортуємо по спаданню
        sortedTeachers.sort((a, b) => compare(b, a, sortKey));
        sortState[sortKey] = 'desc';
    } else {
        // Перший клік: сортуємо по зростанню
        sortedTeachers.sort((a, b) => compare(a, b, sortKey));
        sortState[sortKey] = 'asc';
    }

    return sortedTeachers; // Повертаємо відсортований масив
}
function updateSortAndRender(sortKey) {
    const teachersToSort = filteredTeachers.length ? filteredTeachers : allTeachers; // Використовуємо фільтрований масив або весь список

    const sortedTeachers = sortTeachers(teachersToSort, sortKey); // Сортуємо викладачів

    // Оновлюємо глобальний масив після сортування
    if (filteredTeachers.length) {
        filteredTeachers = sortedTeachers;
    } else {
        allTeachers = sortedTeachers;
    }

    renderTeachersInStatistics(sortedTeachers); // Оновлюємо статистику з відсортованими даними
    renderTeachers(sortedTeachers); // Оновлюємо основний список викладачів
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


function updateSortIndicators(activeHeader, sortKey) {
    const headers = activeHeader.parentElement.querySelectorAll('th');
    headers.forEach(header => {
        // Видаляємо існуючі стрілочки
        header.innerHTML = header.textContent.replace(/[\u2191\u2193]/g, '').trim();

        // Додаємо нову стрілку для активного заголовка
        if (header.getAttribute('data-sort') === sortKey) {
            const state = sortState[sortKey];
            if (state === 'asc') {
                header.innerHTML += ' &#2191;'; // Стрілка вгору
            } else if (state === 'desc') {
                header.innerHTML += ' &#2193;'; // Стрілка вниз
            }
        }
    });
}

function renderStatisticsPagination(totalTeachers) {
    const paginationContainer = document.getElementById('statistics-pagination');
    paginationContainer.innerHTML = ''; // Очищаємо попередні кнопки

    const totalPages = Math.ceil(totalTeachers / teachersPerPageStats);

    if (totalPages <= 1) {
        return; // Якщо лише одна сторінка, не потрібно відображати пагінацію
    }

    for (let page = 1; page <= totalPages; page++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = page;

        if (page === currentPageStats) {
            pageLink.classList.add('active');
        }

        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentPageStats = page;
            const teachersToRender = filteredTeachers.length ? filteredTeachers : allTeachers;
            renderTeachersInStatistics(teachersToRender); // Рендеримо відповідну сторінку викладачів
        });

        paginationContainer.appendChild(pageLink);
    }
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

    // Відображаємо відфільтрованих викладачів у статистиці з підтримкою пагінації
    renderTeachersInStatistics(filteredTeachers);
}

// Функція для пошуку викладачів за ім'ям, нотатками або віком
function searchTeachers() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const favorites = loadFavoritesFromLocalStorage();

    // Якщо вже є викладачі в allTeachers, використаємо їх
    const teachers = allTeachers.length > 0 ? allTeachers : loadTeachersFromLocalStorage();

    // Фільтруємо викладачів на основі пошукового запиту
    const filteredTeachers = teachers.filter(teacher => {
        const nameMatch = (teacher.name.first + ' ' + teacher.name.last).toLowerCase().includes(searchQuery);
        const noteMatch = teacher.note && teacher.note.toLowerCase().includes(searchQuery); // Пошук по нотатках
        const ageMatch = teacher.dob.age.toString().includes(searchQuery); // Пошук по віку

        // Пошук відбувається, якщо є збіг хоча б в одному з полів
        return nameMatch || noteMatch || ageMatch;
    });
    console.log('Filtered Teachers after search:', filteredTeachers); // Лог для перевірки

    // Оновлюємо інтерфейс з результатами пошуку
    renderTeachersInStatistics(filteredTeachers); // Оновлюємо таблицю в статистиці
    renderStatisticsPagination(filteredTeachers.length);
    renderTeachers(filteredTeachers);  // Оновлюємо основний список викладачів

}

// Додаємо обробник для пошуку при кліку на кнопку пошуку
document.getElementById('search-button').addEventListener('click', searchTeachers);

// Обробка події при натисканні клавіші Enter
document.getElementById('search-input').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        searchTeachers();
    }
});

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
    errorContainer.innerHTML = ''; // Очищаємо попередні помилки

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
    event.preventDefault();

    const name = document.querySelector('#teacher-name-add').value;
    const subject = document.querySelector('#subject').value;
    const country = document.querySelector('#country').value;
    const city = document.querySelector('#city').value;
    const email = document.querySelector('#email').value;
    const phone = document.querySelector('#phone').value;
    const birthdate = document.querySelector('#birthdate').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const note = document.querySelector('#notes').value;

    const newTeacher = {
        name: {first: name.split(' ')[0], last: name.split(' ')[1] || ''},
        subject,
        location: {country, city},
        email,
        phone,
        dob: {date: birthdate, age: new Date().getFullYear() - new Date(birthdate).getFullYear()},
        gender,
        note,
        picture: {medium: '', large: ''}
    };
    newTeacher.login = {uuid: generateUUID()};

    const validationErrors = validateTeacherData(newTeacher);
    if (validationErrors.length > 0) {
        showErrorMessages(validationErrors);
        return; // Якщо є помилки, не додаємо викладача
    }

    allTeachers.push(newTeacher);
    saveTeachersToLocalStorage(allTeachers);


    // Оновлюємо інтерфейс після додавання
    const favorites = loadFavoritesFromLocalStorage();
    renderTeachers(allTeachers, favorites);      // Оновлення списку в Top Teachers
    renderTeachersInStatistics(allTeachers);     // Оновлення списку в Statistics
    closeWindow();
}

// Додаємо обробник для форми додавання викладача
document.querySelector('.add-teacher-btn').addEventListener('click', addTeacher);
document.querySelector('.add-teacher-form').addEventListener('submit', function(event) {
    event.preventDefault();
    console.log("Submit button clicked");
    addTeacher(event);
});

document.addEventListener('DOMContentLoaded', () => {
    const storedTeachers = localStorage.getItem('teachers');
    const favorites = loadFavoritesFromLocalStorage();

    if (!storedTeachers) {
        // Якщо викладачі не збережені в LocalStorage, робимо запит до API і відображаємо їх одразу
        fetchTeachersFromAPI(currentPageTeachers, true); // Очищуємо контейнер при першому завантаженні
    } else {
        // Якщо викладачі вже збережені в LocalStorage, використовуємо їх
        const teachers = JSON.parse(storedTeachers);
        allTeachers = teachers; // Оновлюємо глобальний масив allTeachers
        originalTeachers = [...allTeachers];

        // Відображаємо перші 10 викладачів
        renderTeachers(teachers, favorites);  // Показуємо всіх викладачів у Top Teachers
        filteredTeachers = [...teachers]; // Ініціалізуємо filteredTeachers
        renderTeachersInStatistics(teachers);  // Для статистики
        renderFavorites();
    }

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
            // Видаляємо додатковий виклик updateStatistics, оскільки updateTeacherList вже оновлює статистику
        }
    });

    // Пошук за ім'ям, коментарем та віком
    document.getElementById('search-button').addEventListener('click', searchTeachers);
    document.getElementById('search-input').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            searchTeachers();
        }
    });
});

