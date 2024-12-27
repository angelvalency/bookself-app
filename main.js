// Array untuk menyimpan semua buku
let books = [];

// Konstanta untuk nama event
const RENDER_BOOKS = 'RENDER_BOOKS';
let editingBookId = null;

// Fungsi untuk menyimpan data ke localStorage
function saveToLocalStorage() {
  localStorage.setItem('books', JSON.stringify(books)); // Menyimpan array books sebagai string JSON ke localStorage
}

// Fungsi untuk memuat data dari localStorage
function loadFromLocalStorage() {
  const savedBooks = localStorage.getItem('books');
  if (savedBooks) {
    books = JSON.parse(savedBooks); // Mengubah string JSON kembali menjadi array books
  }
  document.dispatchEvent(new Event(RENDER_BOOKS)); // Memicu event untuk render ulang buku
}

// Inisialisasi aplikasi saat DOM telah dimuat
document.addEventListener('DOMContentLoaded', () => {
  const bookForm = document.getElementById('bookForm');

  // Memuat data buku dari localStorage saat halaman dimuat
  loadFromLocalStorage();

  // Event listener untuk form penambahan/edit buku
  bookForm.addEventListener('submit', function(event) {
    event.preventDefault();
    if (editingBookId !== null) {
      // Jika sedang mengedit buku, panggil fungsi updateBook
      updateBook(editingBookId);
    } else {
      // Jika tidak, panggil fungsi addBookToList
      addBookToList();
    }
  });

  // Event listener untuk form pencarian buku
  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const searchTitle = document.getElementById('searchBookTitle').value;
    searchBook(searchTitle); // Panggil fungsi pencarian buku
  });

  // Event listener untuk checkbox status selesai/belum selesai
  const completeCheckbox = document.getElementById('bookFormIsComplete');
  const submitButton = document.getElementById('bookFormSubmit');

  completeCheckbox.addEventListener('change', function() {
    const buttonSpan = submitButton.querySelector('span');
    buttonSpan.textContent = this.checked ? 'Selesai dibaca' : 'Belum selesai dibaca'; // Ubah teks button berdasarkan status checkbox
  });
});

// Fungsi untuk menghasilkan ID unik
function generateBookId() {
  return +new Date(); // Menggunakan waktu saat ini sebagai ID unik
}

// Fungsi untuk membuat objek buku
function createBookData(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  };
}

// Fungsi untuk menambah buku baru
function addBookToList() {
  const title = document.getElementById('bookFormTitle').value.trim();
  const author = document.getElementById('bookFormAuthor').value.trim();
  const year = parseInt(document.getElementById('bookFormYear').value);
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const id = generateBookId(); // Membuat ID buku baru
  const bookData = createBookData(id, title, author, year, isComplete); // Membuat objek buku
  books.push(bookData); // Menambahkan buku baru ke array books

  document.getElementById('bookForm').reset(); // Mereset form setelah menambah buku
  document.dispatchEvent(new Event(RENDER_BOOKS)); // Memicu event render untuk memperbarui tampilan
  saveToLocalStorage(); // Menyimpan data buku ke localStorage
}

// Fungsi untuk mengedit buku
function editBook(bookId) {
  const bookIndex = books.findIndex(book => book.id === parseInt(bookId));
  if (bookIndex !== -1) {
    const book = books[bookIndex];

    // Mengisi form dengan data buku yang ingin diedit
    document.getElementById('bookFormTitle').value = book.title;
    document.getElementById('bookFormAuthor').value = book.author;
    document.getElementById('bookFormYear').value = book.year;
    document.getElementById('bookFormIsComplete').checked = book.isComplete;

    const submitButton = document.getElementById('bookFormSubmit');
    submitButton.querySelector('span').textContent = book.isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
    submitButton.innerHTML = 'Update Buku'; // Mengubah teks button menjadi "Update Buku"

    editingBookId = parseInt(bookId); // Menandai bahwa sedang mengedit buku dengan ID ini
    document.getElementById('bookForm').scrollIntoView({ behavior: 'smooth' }); // Meng-scroll form agar terlihat
  }
}

// Fungsi untuk memperbarui buku
function updateBook(bookId) {
  const bookIndex = books.findIndex(book => book.id === bookId);
  if (bookIndex !== -1) {
    const title = document.getElementById('bookFormTitle').value.trim();
    const author = document.getElementById('bookFormAuthor').value.trim();
    const year = parseInt(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    // Memperbarui data buku dengan nilai baru
    books[bookIndex] = {
      ...books[bookIndex],
      title,
      author,
      year,
      isComplete
    };

    document.getElementById('bookForm').reset(); // Mereset form setelah memperbarui
    const submitButton = document.getElementById('bookFormSubmit');
    submitButton.innerHTML = 'Masukkan Buku ke rak <span>Belum selesai dibaca</span>';
    editingBookId = null; // Mengatur ulang ID buku yang sedang diedit

    document.dispatchEvent(new Event(RENDER_BOOKS)); // Memicu event render untuk memperbarui tampilan
    saveToLocalStorage(); // Menyimpan data buku ke localStorage setelah update
  }
}

// Event listener untuk aksi pada buku
document.addEventListener('click', function(event) {
  const bookId = event.target.getAttribute('data-bookid');
  if (!bookId) return;

  // Memeriksa tombol yang diklik dan menanggapi sesuai dengan aksi
  if (event.target.classList.contains('complete-button')) {
    toggleBookComplete(bookId); // Menyelesaikan/tidak menyelesaikan buku
  } else if (event.target.classList.contains('delete-button')) {
    if (confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      deleteBook(bookId); // Menghapus buku
    }
  } else if (event.target.classList.contains('edit-button')) {
    editBook(bookId); // Mengedit buku
  }
});

// Event listener untuk render dan simpan ke localStorage
document.addEventListener(RENDER_BOOKS, function() {
  renderBooks(); // Merender buku
  saveToLocalStorage(); // Menyimpan buku ke localStorage setelah render
});

// Fungsi untuk toggle status buku (selesai/belum selesai dibaca)
function toggleBookComplete(bookId) {
  const bookIndex = books.findIndex(book => book.id === parseInt(bookId));
  if (bookIndex !== -1) {
    books[bookIndex].isComplete = !books[bookIndex].isComplete; // Mengubah status isComplete
    document.dispatchEvent(new Event(RENDER_BOOKS)); // Memicu render ulang buku
    saveToLocalStorage(); // Menyimpan perubahan ke localStorage
  }
}

// Fungsi untuk menghapus buku
function deleteBook(bookId) {
  const bookIndex = books.findIndex(book => book.id === parseInt(bookId));
  if (bookIndex !== -1) {
    books.splice(bookIndex, 1); // Menghapus buku dari array
    document.dispatchEvent(new Event(RENDER_BOOKS)); // Memicu render ulang buku
    saveToLocalStorage(); // Menyimpan perubahan ke localStorage
  }
}

// Fungsi untuk mencari buku berdasarkan judul
function searchBook(searchTitle) {
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTitle.toLowerCase()) // Filter buku berdasarkan judul
  );
  renderBooks(filteredBooks); // Menampilkan hasil pencarian
}

// Fungsi untuk merender buku
function renderBooks(bookList = books) {
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  incompleteBookList.innerHTML = ''; // Menghapus daftar buku yang belum selesai
  completeBookList.innerHTML = ''; // Menghapus daftar buku yang sudah selesai

  // Menampilkan buku di daftar yang sesuai
  for (const book of bookList) {
    const bookElement = createBookElement(book);
    if (book.isComplete) {
      completeBookList.append(bookElement); // Menambahkan buku ke daftar selesai
    } else {
      incompleteBookList.append(bookElement); // Menambahkan buku ke daftar belum selesai
    }
  }
}

// Fungsi untuk membuat elemen buku
function createBookElement(book) {
  const bookElement = document.createElement('div');
  bookElement.classList.add('book-item');
  bookElement.setAttribute('data-bookid', book.id);

  const bookTitle = document.createElement('h3');
  bookTitle.classList.add('book-title');
  bookTitle.textContent = book.title;

  const bookAuthor = document.createElement('p');
  bookAuthor.classList.add('book-info');
  bookAuthor.textContent = `Penulis: ${book.author}`;

  const bookYear = document.createElement('p');
  bookYear.classList.add('book-info');
  bookYear.textContent = `Tahun: ${book.year}`;

  const buttonGroup = document.createElement('div');
  buttonGroup.classList.add('button-group');

  // Membuat tombol aksi (selesai, edit, hapus)
  const toggleButton = document.createElement('button');
  toggleButton.classList.add('complete-button');
  toggleButton.textContent = book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
  toggleButton.setAttribute('data-bookid', book.id);

  const editButton = document.createElement('button');
  editButton.classList.add('edit-button');
  editButton.textContent = 'Edit';
  editButton.setAttribute('data-bookid', book.id);

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-button');
  deleteButton.textContent = 'Hapus';
  deleteButton.setAttribute('data-bookid', book.id);

  buttonGroup.appendChild(toggleButton);
  buttonGroup.appendChild(editButton);
  buttonGroup.appendChild(deleteButton);

  bookElement.appendChild(bookTitle);
  bookElement.appendChild(bookAuthor);
  bookElement.appendChild(bookYear);
  bookElement.appendChild(buttonGroup);

  return bookElement;
}
