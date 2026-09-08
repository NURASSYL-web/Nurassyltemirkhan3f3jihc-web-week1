var storageName = 'users';


function getUsers() {
  try {
    var users = localStorage.getItem(storageName);

    // Сохранить регистрации
    if (users === null) {
      users = localStorage.getItem('campfireUsers');
      if (users !== null) {
        localStorage.setItem(storageName, users);
      }
    }

    if (!users) {
      return [];
    }

    users = JSON.parse(users);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    return [];
  }
}

// Превратить массив в строку JSON и сохранить его.
function saveUsers(users) {
  try {
    localStorage.setItem(storageName, JSON.stringify(users));
    return true;
  } catch (error) {
    return false;
  }
}

// Общий поиск для регистрации и входа.
function findUser(users, email) {
  var i;
  for (i = 0; i < users.length; i++) {
    if (users[i].email.trim().toLowerCase() === email) {
      return users[i];
    }
  }
  return null;
}

function showFormMessage(form, message, isError) {
  var output = form.querySelector('[data-form-message]');
  output.textContent = message;
  output.hidden = message === '';
  output.classList.toggle('error', Boolean(isError));
}

// Нативный dialog удерживает фокус внутри и закрывается клавишей Escape.
function openModal() {
  var modal = document.querySelector('[data-modal]');
  if (modal !== null && !modal.open) {
    modal.showModal();
  }
}

function closeModal() {
  var modal = document.querySelector('[data-modal]');
  if (modal !== null) {
    modal.close();
  }
}

function closeModalOnBackdrop(event) {
  if (event.target === event.currentTarget) {
    closeModal();
  }
}

// Зарегистрировать нового пользователя.
function registerUser(event) {
  event.preventDefault();
  var form = event.target;
  var users = getUsers();
  var name = form.elements.name.value.trim();
  var email = form.elements.email.value.trim().toLowerCase();
  var password = form.elements.password.value;

  showFormMessage(form, '');

  if (name.length < 2) {
    showFormMessage(form, 'Please enter a name with at least 2 characters.', true);
    return;
  }

  // Проверить, не зарегистрирован ли такой email.
  if (findUser(users, email) !== null) {
    showFormMessage(form, 'This email is already registered.', true);
    return;
  }

  users.push({
    name: name,
    email: email,
    password: password,
    joined: new Date().toLocaleDateString()
  });
  if (!saveUsers(users)) {
    showFormMessage(form, 'Could not save your account. Allow browser storage and try again.', true);
    return;
  }

  form.reset();
  showFormMessage(form, 'Registration successful! You can now log in.');
  openModal();
}

// Найти пользователя с совпадающими email и паролем.
function loginUser(event) {
  event.preventDefault();
  var form = event.target;
  var email = form.elements.email.value.trim().toLowerCase();
  var password = form.elements.password.value;
  var users = getUsers();
  var user = findUser(users, email);

  if (user !== null && user.password === password) {
    form.reset();
    showFormMessage(form, 'Login successful! Welcome, ' + user.name + '.');
  } else {
    showFormMessage(form, 'Wrong email or password.', true);
  }
}

// Скопировать готовую строку из HTML и заполнить её данными.
function showMembers() {
  var tableBody = document.querySelector('[data-members]');
  var counter = document.querySelector('[data-member-count]');
  if (tableBody === null) {
    return;
  }

  var users = getUsers();
  var template = document.querySelector('[data-member-template]');
  var emptyMessage = document.querySelector('[data-empty-members]');
  tableBody.textContent = '';

  users.forEach(function (user, index) {
    var row = template.content.cloneNode(true);
    row.querySelector('[data-number]').textContent = index + 1;
    row.querySelector('[data-name]').textContent = user.name;
    row.querySelector('[data-email]').textContent = user.email;
    row.querySelector('[data-joined]').textContent = user.joined || '—';
    tableBody.appendChild(row);
  });

  if (emptyMessage !== null) {
    emptyMessage.hidden = users.length > 0;
  }
  if (counter) {
    counter.textContent = users.length + (users.length === 1 ? ' registered member' : ' registered members');
  }
}

// Подключить функции к кнопкам и формам из HTML.
function initializePage() {
  var closeButtons = document.querySelectorAll('[data-close-modal]');
  var registrationForm = document.querySelector('[data-registration]');
  var loginForm = document.querySelector('[data-login]');
  var modal = document.querySelector('[data-modal]');

  closeButtons.forEach(function (button) {
    button.addEventListener('click', closeModal);
  });

  if (registrationForm !== null) {
    registrationForm.addEventListener('submit', registerUser);
  }
  if (loginForm !== null) {
    loginForm.addEventListener('submit', loginUser);
  }

  // Закрыть окно при нажатии на фон вокруг него.
  if (modal !== null) {
    modal.addEventListener('click', closeModalOnBackdrop);
  }

  showMembers();
}

document.addEventListener('DOMContentLoaded', initializePage);
// Обновить таблицу после регистрации в другой вкладке или возврата назад.
window.addEventListener('storage', showMembers);
window.addEventListener('pageshow', showMembers);
