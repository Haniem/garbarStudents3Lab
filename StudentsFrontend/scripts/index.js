const container = document.querySelector(".container");
const studentsTable__tbody = document.querySelector(".studentsTable__tbody");
const addStudent__form = document.querySelector(".addStudent__form"); 
const addStudent__form__button = document.querySelector(".addStudent__form__button");
const studentsTable__thead = document.querySelector(".studentsTable__thead");
const pageSizeInput = document.querySelector("#pageSize");
const prevPageButton = document.querySelector("#prevPage");
const nextPageButton = document.querySelector("#nextPage");
const paginationContainer = document.querySelector("#pagination");  

let students = [];
let currentPage = 1;
let pageSize = parseInt(pageSizeInput.value);

function renderStudents(studentsPage) {
    studentsTable__tbody.innerHTML = '';

    studentsPage.forEach((student) => {
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
        delBtn.className = "btn btn-danger delBtn";
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

function paginateStudents(students) {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = currentPage * pageSize;
    return students.slice(startIndex, endIndex);
}

function renderPaginationControls() {
    const totalPages = Math.ceil(students.length / pageSize);
    paginationContainer.innerHTML = '';  

    const paginationList = document.createElement("ul");
    paginationList.className = "pagination justify-content-center";

    const prevButton = document.createElement("li");
    prevButton.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
    const prevLink = document.createElement("a");
    prevLink.className = "page-link";
    prevLink.href = "#";
    prevLink.innerText = "Предыдущая";
    prevButton.appendChild(prevLink);
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
        }
    });
    paginationList.appendChild(prevButton);

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement("li");
        pageItem.className = `page-item ${i === currentPage ? "active" : ""}`;
        const pageLink = document.createElement("a");
        pageLink.className = "page-link";
        pageLink.href = "#";
        pageLink.innerText = i;
        pageLink.addEventListener("click", () => {
            currentPage = i;
            updatePagination();
        });
        pageItem.appendChild(pageLink);
        paginationList.appendChild(pageItem);
    }

    const nextButton = document.createElement("li");
    nextButton.className = `page-item ${currentPage === totalPages ? "disabled" : ""}`;
    const nextLink = document.createElement("a");
    nextLink.className = "page-link";
    nextLink.href = "#";
    nextLink.innerText = "Следующая";
    nextButton.appendChild(nextLink);
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
        }
    });
    paginationList.appendChild(nextButton);

    paginationContainer.appendChild(paginationList);
}

function updatePagination() {
    const studentsPage = paginateStudents(students);
    renderStudents(studentsPage);
    renderPaginationControls();
}

async function fetchStudents() {
    try {
        const response = await fetch('https://localhost:7147/api/Students');
        if (!response.ok) throw new Error(`Ошибка загрузки студентов: ${response.status}`);
        
        students = await response.json();
        updatePagination();
        checkStudents();
    } catch (error) {
        console.error('Ошибка при получении данных студентов:', error);
    }
}

pageSizeInput.addEventListener('input', (event) => {
    pageSize = parseInt(event.target.value);
    currentPage = 1;  
    updatePagination();
});

async function postData(url = "") {
    try {
        const response = await fetch(url, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Ошибка при удалении студента");
        }

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

function checkStudents() {
    const noStudentsElement = document.querySelector('.alert__noStudents');
    const paginationContainer = document.querySelector('#pagination');  // Элемент пагинации

    if (students.length > 0) {
        if (noStudentsElement) {
            noStudentsElement.remove();
        }
    } else {
        if (!noStudentsElement) { 
            let noStudents = document.createElement("h1");
            noStudents.className = "alert__noStudents";
            noStudents.innerHTML = "Ни одного студента не найдено"; 

            // Вставляем перед пагинацией
            container.insertBefore(noStudents, paginationContainer);
        }
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

    } catch (error) {
        console.error('Ошибка:', error);
    }
});

setInterval(fetchStudents, 1000);
