const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const statusMessage = document.querySelector("#status-message");
const bookList = document.querySelector("#book-list");
const bookDetail = document.querySelector("#book-detail");
const bookForm = document.querySelector("#book-form");
const formMessage = document.querySelector("#form-message");

const SEARCH_API_URL = "https://openlibrary.org/search.json";
const POST_API_URL = "https://jsonplaceholder.typicode.com/posts";

let books = [];

async function searchBooks(keyword) {
  const url =
    `${SEARCH_API_URL}?q=${encodeURIComponent(keyword)}&limit=10&fields=key,title,author_name,first_publish_year`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`도서 검색 실패: ${response.status}`);
  }

  const data = await response.json();
  return data.docs;
}

async function createBookRequest(book) {
  const response = await fetch(POST_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    throw new Error(`도서 등록 요청 실패: ${response.status}`);
  }

  return response.json();
}

function renderLoading() {
  statusMessage.textContent = "도서를 검색하는 중입니다...";
  bookList.replaceChildren();
  bookDetail.textContent = "도서를 선택하세요.";
}

function renderError(message) {
  statusMessage.textContent = message;
  bookList.replaceChildren();
  bookDetail.textContent = "도서를 선택하세요.";
}

function renderEmpty() {
  statusMessage.textContent = "검색 결과가 없습니다.";
  bookList.replaceChildren();
  bookDetail.textContent = "도서를 선택하세요.";
}

function renderBooks() {
  bookList.replaceChildren();

  if (books.length === 0) {
    renderEmpty();
    return;
  }

  statusMessage.textContent = `검색 결과 ${books.length}권`;

  books.forEach((book) => {
    const author =
      Array.isArray(book.author_name) && book.author_name.length > 0
        ? book.author_name.join(", ")
        : "저자 정보 없음";

    const title = book.title || "-";
    const year = book.first_publish_year ?? "-";

    const listItem = document.createElement("li");
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = `${title} / ${author} / ${year}`;

    button.addEventListener("click", () => {
      renderBookDetail(book);
    });

    listItem.append(button);
    bookList.append(listItem);
  });
}

function renderBookDetail(book) {
  bookDetail.replaceChildren();

  const author =
    Array.isArray(book.author_name) && book.author_name.length > 0
      ? book.author_name.join(", ")
      : "저자 정보 없음";

  const details = [
    ["제목", book.title || "-"],
    ["저자", author],
    ["최초 출판연도", book.first_publish_year || "-"],
    ["Open Library key", book.key || "-"],
  ];

  const list = document.createElement("dl");

  details.forEach(([label, value]) => {
    const term = document.createElement("dt");
    const description = document.createElement("dd");

    term.textContent = label;
    description.textContent = value;

    list.append(term, description);
  });

  bookDetail.append(list);
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const keyword = searchInput.value.trim();

  if (!keyword) {
    statusMessage.textContent = "검색어를 입력하세요.";
    return;
  }

  renderLoading();

  try {
    books = await searchBooks(keyword);
    renderBooks();
  } catch (error) {
    console.error(error);
    renderError("도서를 불러오지 못했습니다.");
  }
});

bookForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(bookForm);
  const title = formData.get("title").trim();
  const author = formData.get("author").trim();

  if (!title || !author) {
    formMessage.textContent = "제목과 저자를 입력하세요.";
    return;
  }

  const bookRequest = { title, author };
  formMessage.textContent = "등록 요청 중...";

  try {
    const responseData = await createBookRequest(bookRequest);

    formMessage.textContent = "등록 요청이 성공했습니다.";
    console.log("POST Response:", responseData);
    bookForm.reset();
  } catch (error) {
    console.error(error);
    formMessage.textContent = "등록 요청에 실패했습니다.";
  }
});