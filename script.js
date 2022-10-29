const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const movies = []; //電影總清單
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
let currentPage = "";
let currentLayoutStyle = 1;
//將取得的資料印出的函式
function renderMovieList(data, layoutStyle) {
  let rawHTML = "";
  //   // title, image, id
  //卡片模式渲染且為預設
  if (layoutStyle === 1) {
    data.forEach((item) => {
      rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button 
            class="btn btn-primary 
            btn-show-movie" 
            data-bs-toggle="modal" 
            data-bs-target="#movie-modal" 
            data-id="${item.id}"
          >
            More
          </button>
          <button 
            class="btn btn-info btn-add-favorite" 
            data-id="${item.id}"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </div>`;
    });
  } else if (layoutStyle === 2) {
    //列表模式渲染
    rawHTML = `<ul class="list-group list-group-flush mb-4">`;
    data.forEach((item) => {
      rawHTML += `
  <li class="list-group-item d-flex justify-content-between align-items-center ">
  <div class="list-style">
    ${item.title}
    <div class="function-button">
              <button 
            class="btn btn-primary 
            btn-show-movie" 
            data-bs-toggle="modal" 
            data-bs-target="#movie-modal" 
            data-id="${item.id}"
          >
            More
          </button>
          <button 
            class="btn btn-info btn-add-favorite" 
            data-id="${item.id}"
          >
            +
          </button>
    </div>
    </div>
  </li>
    `;
    });
    rawHTML += `</ul>`;
  }
  dataPanel.innerHTML = rawHTML;
}
function showMovieModal(id) {
  // get elements
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");
  // send request to show api
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    // insert data into modal ui
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }

  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

//監聽More與Favorite功能函式
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});
//搜尋功能函式
let filteredMovies = []; //搜尋清單 (為了好達成分頁搜尋的功能)
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(1), currentLayoutStyle);
});
//ajax從資料庫取得所有資料並印出
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderMovieList(getMoviesByPage(1), currentLayoutStyle);

    //pagination (沒有要一次全部顯示出來)
    renderPaginator(movies.length);
  })
  .catch((err) => console.log(err));

//分頁器pagination
const MOVIES_PER_PAGE = 12; //設定變數一頁要幾個結果
//page function (在點擊某一頁之後，會顯示哪些電影要顯示)
function getMoviesByPage(page) {
  currentPage = page;
  const data = filteredMovies.length ? filteredMovies : movies; //搜尋結果如果說filtermovies有東西，就執行。如果沒有就執行movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE; //設定開始與結束
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE); //於原來陣列中切割
}
const paginator = document.querySelector("#paginator");
//3.自動產生該有的頁數
function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (i = 1; i <= numberOfPages; i++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${i}">${i}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

//4.點選page換頁
paginator.addEventListener("click", function onPaginator(event) {
  const target = event.target;
  if (target.tagName !== "A") return;
  const page = Number(target.dataset.page);
  renderMovieList(getMoviesByPage(page), currentLayoutStyle);
});

//排列功能
const layoutShift = document.querySelector("#layout-shift");
layoutShift.addEventListener("click", function layoutShifer(event) {
  if (event.target.tagName === "I") {
    //如果點擊的tagName是 <i></i>才執行
    //卡片模式
    if (event.target.matches(".card-layout")) {
      currentLayoutStyle = 1;
      renderMovieList(getMoviesByPage(currentPage), currentLayoutStyle);
    }
    //列表模式
    if (event.target.matches(".list-layout")) {
      currentLayoutStyle = 2;
      renderMovieList(getMoviesByPage(currentPage), currentLayoutStyle);
    }
  }
});
