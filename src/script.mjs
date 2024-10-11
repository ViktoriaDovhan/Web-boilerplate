import { randomUserMock } from './FE4U-Lab2-mock.mjs';

const additionalUsers = [
    {
        gender: "female",
        name: { title: "Ms", first: "Anna", last: "Smith" },
        location: {
            city: "Berlin",
            state: "Berlin",
            country: "Germany",
            postcode: 10115,
            coordinates: { latitude: "52.5309", longitude: "13.3847" }
        },
        email: "anna.smith@example.com",
        dob: { date: "1985-05-15T19:09:19.602Z", age: 39 },
        phone: "(030)-123-4567"
    },
];

const courses = [
    "Mathematics", "Physics", "English", "Computer Science",
    "Dancing", "Chess", "Biology", "Chemistry",
    "Law", "Art", "Medicine", "Statistics"
];

function getRandomCourse() {
    const randomIndex = Math.floor(Math.random() * courses.length);
    return courses[randomIndex];
}

let idCounter = 1;

function generateId() {
    return idCounter++;
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
//завдання 2
function validateUser(user) {
    const errors = [];

    function isCapitalized(str) {
        return typeof str === 'string' && /^[A-Z]/.test(str);
    }

    const stringFields = ['full_name', 'gender', 'state', 'city', 'country', 'note'];
    stringFields.forEach(field => {
        if (user[field] && !isCapitalized(user[field])) {
            errors.push(`${field} має починатися з великої літери.`);
        }
    });

    if (typeof user.age !== 'number') {
        errors.push('Поле age має бути числовим.');
    }

    function validatePhone(phone) {
        const phoneRegex = /^[\d\s()-]+$/;
        return phoneRegex.test(phone);
    }

    if (!validatePhone(user.phone)) {
        errors.push('Невірний формат телефону.');
    }

    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    if (!validateEmail(user.email)) {
        errors.push('Невірний формат email.');
    }

    if (errors.length > 0) {
        console.log(`Користувач ${user.full_name} не пройшов валідацію:`, errors);
    }

    return errors.length === 0;
}

function validateUsers(users) {
    return users.filter(user => validateUser(user));
}
//завдання 1
function formatUserData(users, additional) {
    const uniqueUsers = new Map();

    users.forEach(user => {
        const id = generateId();
        uniqueUsers.set(id, {
            gender: capitalizeFirstLetter(user.gender),
            title: user.name.title,
            full_name: `${(user.name.first)} ${(user.name.last)}`,
            city: (user.location.city),
            state: (user.location.state),
            country: (user.location.country),
            postcode: user.location.postcode,
            coordinates: user.location.coordinates,
            timezone: { offset: "+0:00", description: "UTC" },
            email: user.email,
            b_date: user.dob.date,
            age: user.dob.age,
            phone: user.phone,
            id: id,
            favorite: false,
            course: getRandomCourse(),
            bg_color: '#ffffff',
            note: '',
        });
    });

    additional.forEach(user => {
        const id = generateId();
        if (!uniqueUsers.has(id)) {
            uniqueUsers.set(id, {
                gender: capitalizeFirstLetter(user.gender),
                title: user.name.title,
                full_name: `${(user.name.first)} ${(user.name.last)}`,
                city: (user.location.city),
                state: (user.location.state),
                country: (user.location.country),
                postcode: user.location.postcode,
                coordinates: user.location.coordinates,
                timezone: { offset: "+0:00", description: "UTC" },
                email: user.email,
                b_date: user.dob.date,
                age: user.dob.age,
                phone: user.phone,
                id: id,
                favorite: false,
                course: getRandomCourse(),
                bg_color: '#ffffff',
                note: '',
            });
        }
    });

    return validateUsers(Array.from(uniqueUsers.values()));
}
//завдання 3
function filterUsers(users, filters) {
    return users.filter(user => {
        return Object.keys(filters).every(key => {
            if (filters[key] === undefined || filters[key] === null) {
                return true; // Ігноруємо не задані критерії
            }
            if (typeof filters[key] === 'string') {
                return user[key]?.toLowerCase() === filters[key].toLowerCase();
            }
            if (typeof filters[key] === 'number') {
                return user[key] === filters[key];
            }
            if (typeof filters[key] === 'boolean') {
                return user[key] === filters[key];
            }
            return false;
        });
    });
}
//завдання 4
function sortUsers(users, sortBy, order = 'asc') {
    return users.sort((a, b) => {
        let fieldA = a[sortBy];
        let fieldB = b[sortBy];

        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
            fieldA = fieldA.toLowerCase();
            fieldB = fieldB.toLowerCase();
            if (fieldA < fieldB) return order === 'asc' ? -1 : 1;
            if (fieldA > fieldB) return order === 'asc' ? 1 : -1;
            return 0;
        }

        if (sortBy === 'b_date') {
            fieldA = new Date(fieldA);
            fieldB = new Date(fieldB);
        }

        if (typeof fieldA === 'number' && typeof fieldB === 'number') {
            return order === 'asc' ? fieldA - fieldB : fieldB - fieldA;
        }

        return 0;
    });
}
//завдання 5
function findUsers(users, searchKey, searchValue) {
    return users.filter(user => {
        if (typeof searchValue === 'string') {
            return user[searchKey]?.toLowerCase() === searchValue.toLowerCase();
        }
        if (typeof searchValue === 'number') {
            return user[searchKey] === searchValue;
        }
        return false;
    });
}

//завдання 6
function calculatePercentage(users, key, value, operator = null) {
    const totalCount = users.length;
    const matchingCount = users.filter(user => {
        if (key === 'age' && operator) {
            switch (operator) {
                case '>':
                    return user.age > value; // Вік більше
                case '<':
                    return user.age < value; // Вік менше
                case '=':
                    return user.age === value; // Вік дорівнює
                default:
                    return false; // Невідомий оператор
            }
        } else if (typeof value === 'string') {
            return user[key]?.toLowerCase().includes(value.toLowerCase());
        }
        return false;
    }).length; // Кількість користувачів, що відповідають критерію

    // Розрахунок відсотка
    return totalCount > 0 ? (matchingCount / totalCount) * 100 : 0;
}

// Отримуємо відформатований список користувачів
const formattedUsers = formatUserData(randomUserMock, additionalUsers);
console.log('Початковий список:', formattedUsers);

// завдання 3
const filters = { country: 'Germany', gender: 'male', favorite: false };
const filteredUsers = filterUsers(formattedUsers, filters);
console.log('Відфільтровані викладачі:', filteredUsers);

// завдання 4
const sortedByName = sortUsers(formattedUsers, 'full_name', 'asc');
console.log('Сортування за ім\'ям:', sortedByName);

const sortedByAge = sortUsers(formattedUsers, 'age', 'desc');
console.log('Сортування за віком:', sortedByAge);

const sortedByDate = sortUsers(formattedUsers, 'b_date', 'asc');
console.log('Сортування за датою народження:', sortedByDate);

const sortedByCountry = sortUsers(formattedUsers, 'country', 'asc');
console.log('Сортування за країною:', sortedByCountry);

//завдання 5
const foundUserByName = findUsers(formattedUsers, 'full_name', 'Anna Smith');
console.log('Знайдений користувач за ім\'ям:', foundUserByName);

const foundUserByNote = findUsers(formattedUsers, 'note', ''); // Пошук за порожнім полем note
console.log('Знайдений користувач за note:', foundUserByNote);

const foundUserByAge = findUsers(formattedUsers, 'age', 39); // Пошук користувача за віком
console.log('Знайдений користувач за віком:', foundUserByAge);

//завдання 6
const agePercentageMoreThan30 = calculatePercentage(formattedUsers, 'age', 30, '>');
console.log(`Відсоток користувачів старше 30 років: ${agePercentageMoreThan30.toFixed(2)}%`);

// Відсоток користувачів молодше 30 років
const agePercentageLessThan30 = calculatePercentage(formattedUsers, 'age', 30, '<');
console.log(`Відсоток користувачів молодше 30 років: ${agePercentageLessThan30.toFixed(2)}%`);

// Відсоток користувачів віком 30 років
const agePercentageEqual30 = calculatePercentage(formattedUsers, 'age', 30, '=');
console.log(`Відсоток користувачів віком 30 років: ${agePercentageEqual30.toFixed(2)}%`);

// Відсоток користувачів з ім'ям, що містить "Anna"
const namePercentage = calculatePercentage(formattedUsers, 'full_name', 'Anna');
console.log(`Відсоток користувачів з ім'ям 'Anna': ${namePercentage.toFixed(2)}%`);

// Відсоток користувачів з країною, що містить "Germany"
const countryPercentage = calculatePercentage(formattedUsers, 'country', 'Germany');
console.log(`Відсоток користувачів з країною 'Germany': ${countryPercentage.toFixed(2)}%`);

// Відсоток користувачів з нотаткою, що містить "example"
const notePercentage = calculatePercentage(formattedUsers, 'note', 'example');
console.log(`Відсоток користувачів з нотаткою, що містить 'example': ${notePercentage.toFixed(2)}%`);
