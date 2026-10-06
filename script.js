const API_KEY = "3b4477f700c75d5365f77651d52c4cee";
const BASE_URL = "https://api.themoviedb.org/3/movie/now_playing";
const POSTER_URL = "https://image.tmdb.org/t/p/w500";
const BACKDROP_URL = "https://image.tmdb.org/t/p/original";

const grid = document.getElementById("movie-grid");
const hero = document.getElementById("hero");
const statusEl = document.getElementById("status");
const moreBtn = document.getElementById("more-btn");
const navbar = document.getElementById("navbar");

let page = 1;
let totalPages = 1;

async function fetchMovies() {
  const url = `${BASE_URL}?api_key=${API_KEY}&language=ko-KR&region=KR&page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`요청 실패 (${res.status})`);
  return res.json();
}

function renderHero(movie) {
  if (!movie.backdrop_path) return;
  hero.style.backgroundImage = `url(${BACKDROP_URL}${movie.backdrop_path})`;
  hero.innerHTML = `
    <div class="hero-content">
      <h2></h2>
      <p></p>
    </div>`;
  hero.querySelector("h2").textContent = movie.title;
  hero.querySelector("p").textContent = movie.overview || "";
}

const tooltip = document.createElement("div");
tooltip.className = "tooltip";
document.body.appendChild(tooltip);

function moveTooltip(e) {
  const gap = 16;
  const { offsetWidth: w, offsetHeight: h } = tooltip;
  let x = e.clientX + gap;
  let y = e.clientY + gap;
  if (x + w > window.innerWidth) x = e.clientX - w - gap;
  if (y + h > window.innerHeight) y = e.clientY - h - gap;
  tooltip.style.left = `${Math.max(0, x)}px`;
  tooltip.style.top = `${Math.max(0, y)}px`;
}

function renderMovies(movies) {
  const fragment = document.createDocumentFragment();

  movies.forEach((movie) => {
    if (!movie.poster_path) return;

    const card = document.createElement("div");
    card.className = "movie-card";

    const img = document.createElement("img");
    img.src = POSTER_URL + movie.poster_path;
    img.alt = movie.title;
    img.loading = "lazy";

    const info = document.createElement("div");
    info.className = "info";

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = movie.title;

    const rating = document.createElement("div");
    rating.className = "rating";
    rating.textContent = `★ ${movie.vote_average.toFixed(1)}`;

    const date = document.createElement("div");
    date.className = "release-date";
    date.textContent = movie.release_date
      ? `개봉일 ${movie.release_date}`
      : "개봉일 미정";

    info.append(title, rating, date);
    card.append(img, info);

    card.addEventListener("mouseenter", () => {
      tooltip.innerHTML = '<span class="tooltip-label">줄거리</span><span class="tooltip-text"></span>';
      tooltip.querySelector(".tooltip-text").textContent =
        movie.overview || "줄거리 정보가 없습니다.";
      tooltip.classList.add("visible");
    });
    card.addEventListener("mousemove", moveTooltip);
    card.addEventListener("mouseleave", () => {
      tooltip.classList.remove("visible");
    });

    if (movie.adult) {
      const badge = document.createElement("span");
      badge.className = "adult-badge";
      badge.textContent = "19+";
      card.appendChild(badge);
    }
    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

async function loadPage() {
  statusEl.textContent = "불러오는 중...";
  statusEl.hidden = false;
  moreBtn.hidden = true;

  try {
    const data = await fetchMovies();
    totalPages = data.total_pages;

    if (page === 1 && data.results.length) renderHero(data.results[0]);
    renderMovies(data.results);

    statusEl.hidden = true;
    moreBtn.hidden = page >= totalPages;
  } catch (err) {
    statusEl.textContent = `영화를 불러오지 못했습니다. ${err.message}`;
  }
}

moreBtn.addEventListener("click", () => {
  page++;
  loadPage();
});

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

loadPage();
