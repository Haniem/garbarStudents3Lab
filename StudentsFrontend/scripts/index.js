const studentsTable__tbody = document.querySelector(".studentsTable__tbody");
const addStudent__form = document.querySelector(".addStudent__form");
const addStudent__form__button = document.querySelector(".addStudent__form__button");
const studentsTable__thead = document.querySelector(".studentsTable__thead");

// Функция для рендеринга студентов в таблицу
function renderStudents(students) {
    studentsTable__tbody.innerHTML = ''; // Очищаем таблицу

    students.forEach((student) => {
        let tr = document.createElement("tr");
        tr.className = "studentsTable__tr";

        let tdFirstName = document.createElement("td");
        tdFirstName.className = "studentsTable__td";
        tdFirstName.innerHTML = student.firstName;
        tr.appendChild(tdFirstName);

        let tdLastName = document.createElement("td");
        tdLastName.className = "studentsTable__td";
        tdLastName.innerHTML = student.lastName;
        tr.appendChild(tdLastName);

        let tdMiddleName = document.createElement("td");
        tdMiddleName.className = "studentsTable__td";
        tdMiddleName.innerHTML = student.middleName;
        tr.appendChild(tdMiddleName);

        let tdDateOfBirth = document.createElement("td");
        tdDateOfBirth.className = "studentsTable__td";
        const date = new Date(student.dateOfBirth);
        const formattedDate = date.getDate().toString().padStart(2, '0') + '.' +
                            (date.getMonth() + 1).toString().padStart(2, '0') + '.' +
                            date.getFullYear();
        tdDateOfBirth.innerHTML = formattedDate;
        tr.appendChild(tdDateOfBirth);

        let tdGroup = document.createElement("td");
        tdGroup.className = "studentsTable__td";
        tdGroup.innerHTML = student.group;
        tr.appendChild(tdGroup);

        let delTd = document.createElement("td");
        delTd.className = "studentsTable__td";
        let delBtn = document.createElement("button");
        delBtn.className = "delBtn";
        delBtn.innerHTML = "Удалить";

        delBtn.addEventListener("click", () => {
            tr.remove();
            postData(`https://localhost:7147/api/Students/${student.id}`);
        });

        delTd.appendChild(delBtn);
        tr.appendChild(delTd);

        studentsTable__tbody.appendChild(tr);
    });
}

// Сортировка данных по указанному полю
function sortStudents(students, field, direction) {
    return students.sort((a, b) => {
        if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

// Функция для сброса подсветки с заголовков
function clearSortingHighlights() {
    const headers = studentsTable__thead.querySelectorAll("th");
    headers.forEach(header => header.classList.remove("sorted"));
}

// Добавляем обработчики сортировки для заголовков таблицы
studentsTable__thead.addEventListener('click', (event) => {
    if (event.target.tagName === 'TH') {
        const column = event.target.innerText.toLowerCase();
        let field = '';

        // Определяем, по какому полю сортировать
        switch (column) {
            case 'имя':
                field = 'firstName';
                break;
            case 'фамилия':
                field = 'lastName';
                break;
            case 'отчество':
                field = 'middleName';
                break;
            case 'дата рождения':
                field = 'dateOfBirth';
                break;
            case 'группа':
                field = 'group';
                break;
            default:
                return; // Не сортируем по столбцу "Удалить"
        }

        // Определяем направление сортировки (asc/desc)
        let direction = event.target.getAttribute('data-direction') === 'asc' ? 'desc' : 'asc';
        event.target.setAttribute('data-direction', direction);

        // Сортируем и рендерим отсортированных студентов
        students = sortStudents(students, field, direction);
        renderStudents(students);

        // Убираем подсветку с других заголовков и подсвечиваем активный
        clearSortingHighlights();
        event.target.classList.add("sorted");
    }
});

let students = [];

fetch('https://localhost:7147/api/Students')
    .then((response) => response.json())
    .then((data) => {
        students = data;
        renderStudents(students);
    })
    .catch((error) => {
        console.error('Error:', error);
    });

async function postData(url = "") {
    try {
        const response = await fetch(url, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Ошибка при удалении студента");
        }

        alert("Студент успешно удален");
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

addStudent__form__button.addEventListener('click', async function (event) {
    event.preventDefault();

    let formData = new FormData(addStudent__form);

    if (!formData.get('FirstName') || !formData.get('LastName') || !formData.get('MiddleName') || !formData.get('DateOfBirth') || !formData.get('Group')) {
        alert('Заполните все поля');
        return;
    }

    let dateOfBirth = new Date(formData.get('DateOfBirth'));
    let student = {
        firstName: formData.get('FirstName'),
        lastName: formData.get('LastName'),
        middleName: formData.get('MiddleName'),
        dateOfBirth: dateOfBirth.toISOString(),
        group: formData.get('Group')
    };

    try {
        const response = await fetch("https://localhost:7147/api/Students", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(student)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Ошибка при создании студента: ${response.status} - ${errorData}`);
        }
        alert("Студент успешно создан");

    } catch (error) {
        console.error('Ошибка:', error);
    }

    location.reload();
});
