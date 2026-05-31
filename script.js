let size, puzzle, timer, moveCounter, time, moves, interval;
let movies = [];

document.addEventListener("DOMContentLoaded", function() {
    const themeToggle = document.getElementById("theme-toggle");
    const currentTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    themeToggle.checked = currentTheme === "dark";

    themeToggle.addEventListener("change", () => {
        const theme = themeToggle.checked ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    });

    document.querySelectorAll('.nav-links a, .hero-actions a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                closeMobileNav();
            }
        });
    });

    document.querySelectorAll('.dropdown-btn').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = this.getAttribute('data-target');
            const container = document.getElementById(projectId);
            const isHidden = container.classList.contains('hidden');
            container.classList.toggle('hidden');
            this.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
        });
    });

    document.getElementById('play-button').addEventListener('click', openSlidingPuzzle);
    document.getElementById('backToTop').addEventListener('click', scrollToTop);
    document.getElementById('recommendBtn').addEventListener('click', recommendMovies);

    const navToggle = document.getElementById('nav-toggle');
    navToggle.addEventListener('click', () => {
        const navLinks = document.getElementById('nav-links');
        const isOpen = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    window.addEventListener('scroll', () => {
        const backToTop = document.getElementById('backToTop');
        backToTop.classList.toggle('visible', window.scrollY > 400);
        updateActiveNavLink();
    });

    fetch('data/movie_dataset.json')
        .then(response => response.json())
        .then(data => {
            movies = data.map(movie => ({
                title: movie.title.trim(),
                features: vectorize(extractFeatures(movie))
            }));
        })
        .catch(error => console.error('Error loading the movie dataset:', error));
});

function closeMobileNav() {
    document.getElementById('nav-links').classList.remove('open');
    document.getElementById('nav-toggle').setAttribute('aria-expanded', 'false');
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    let current = '';

    sections.forEach(section => {
        const top = section.offsetTop - 100;
        if (window.scrollY >= top) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openSlidingPuzzle() {
    document.getElementById('popup').style.display = 'flex';
}

function closeSlidingPuzzle() {
    document.getElementById('popup').style.display = 'none';
    clearInterval(interval);
}

function startGame() {
    size = parseInt(document.getElementById('size').value);
    puzzle = generatePuzzle(size);
    time = 0;
    moves = 0;
    updateTimerDisplay();
    document.getElementById('moveCounter').textContent = moves;
    document.getElementById('congratulationsMessage').classList.add('hidden');
    clearInterval(interval);
    interval = setInterval(() => {
        time++;
        updateTimerDisplay();
    }, 1000);
    renderPuzzle();
}

function updateTimerDisplay() {
    const hours = Math.floor(time / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds}`;
}

function generatePuzzle(size) {
    const tiles = Array.from({ length: size * size }, (_, i) => i + 1);
    tiles[size * size - 1] = 0;
    do {
        shuffleArray(tiles);
    } while (!isSolvable(tiles) || isSolved(tiles));
    return tiles;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function isSolvable(tiles) {
    let inversions = 0;
    for (let i = 0; i < tiles.length - 1; i++) {
        for (let j = i + 1; j < tiles.length; j++) {
            if (tiles[i] && tiles[j] && tiles[i] > tiles[j]) {
                inversions++;
            }
        }
    }
    const blankRow = Math.floor(tiles.indexOf(0) / size);
    return (size % 2 === 1 && inversions % 2 === 0) || (size % 2 === 0 && (inversions + blankRow) % 2 === 1);
}

function isSolved(tiles) {
    for (let i = 0; i < tiles.length - 1; i++) {
        if (tiles[i] !== i + 1) return false;
    }
    return true;
}

function renderPuzzle() {
    const container = document.getElementById('puzzleContainer');
    container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    container.innerHTML = '';
    puzzle.forEach((tile, index) => {
        const tileElement = document.createElement('div');
        tileElement.classList.add('tile');
        if (tile === 0) {
            tileElement.style.visibility = 'hidden';
        } else {
            tileElement.textContent = tile;
            tileElement.addEventListener('click', () => moveTile(index));
        }
        if (tile === index + 1) {
            tileElement.classList.add('correct');
        }
        container.appendChild(tileElement);
    });
}

function moveTile(index) {
    const blankIndex = puzzle.indexOf(0);
    const validMoves = [blankIndex - size, blankIndex + size];
    if (blankIndex % size !== 0) validMoves.push(blankIndex - 1);
    if (blankIndex % size !== size - 1) validMoves.push(blankIndex + 1);
    if (validMoves.includes(index)) {
        [puzzle[blankIndex], puzzle[index]] = [puzzle[index], puzzle[blankIndex]];
        moves++;
        document.getElementById('moveCounter').textContent = moves;
        renderPuzzle();
        checkWin();
    }
}

function checkWin() {
    if (isSolved(puzzle)) {
        clearInterval(interval);
        document.querySelectorAll('.tile').forEach(tile => tile.classList.add('finished'));
        document.getElementById('congratulationsMessage').classList.remove('hidden');
    }
}

function extractFeatures(movie) {
    const keywords = movie.keywords ? movie.keywords : "";
    const cast = movie.cast ? movie.cast : "";
    const genres = movie.genres ? movie.genres : "";
    return (keywords + " " + cast + " " + genres).toLowerCase();
}

function vectorize(text) {
    const words = text.split(" ");
    const wordCount = {};
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });
    return wordCount;
}

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    const allWords = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
    allWords.forEach(word => {
        const a = vecA[word] || 0;
        const b = vecB[word] || 0;
        dotProduct += a * b;
        normA += a * a;
        normB += b * b;
    });
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function getIndexFromTitle(title) {
    return movies.findIndex(movie => movie.title.toLowerCase() === title.trim().toLowerCase());
}

function recommendMovies() {
    const inputTitle = document.getElementById('movieTitle').value.trim();
    const movieIndex = getIndexFromTitle(inputTitle);

    if (movieIndex === -1) {
        alert('Movie not found!');
        return;
    }

    const inputMovie = movies[movieIndex];
    const similarities = movies.map((movie, index) => {
        if (index === movieIndex) return 0;
        return { title: movie.title, score: cosineSimilarity(inputMovie.features, movie.features) * 100 };
    });

    similarities.sort((a, b) => b.score - a.score);
    const topMovies = similarities.slice(0, 10);

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    topMovies.forEach((movie, index) => {
        const resultItem = document.createElement('p');
        resultItem.textContent = `${index + 1}. ${movie.title} (${movie.score.toFixed(2)}%)`;
        resultsDiv.appendChild(resultItem);
    });
}

function openMovieRecommender() {
    document.getElementById('moviePopup').style.display = 'flex';
}

function closeMovieRecommender() {
    document.getElementById('moviePopup').style.display = 'none';
}
