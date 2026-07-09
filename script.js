let size, puzzle, time, moves, interval, previouslyFocusedElement;

document.addEventListener("DOMContentLoaded", function() {
    const themeToggle = document.getElementById("theme-toggle");
    const storedTheme = getStoredTheme();
    const currentTheme = storedTheme || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    themeToggle.checked = currentTheme === "dark";

    themeToggle.addEventListener("change", () => {
        const theme = themeToggle.checked ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        setStoredTheme(theme);
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
            if (!container) return;
            const isHidden = container.classList.contains('hidden');
            container.classList.toggle('hidden');
            this.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
            this.closest('.project')?.classList.toggle('open', isHidden);
        });
    });

    document.getElementById('play-button').addEventListener('click', openSlidingPuzzle);
    document.getElementById('close-puzzle').addEventListener('click', closeSlidingPuzzle);
    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('backToTop').addEventListener('click', scrollToTop);

    const navToggle = document.getElementById('nav-toggle');
    navToggle.addEventListener('click', () => {
        const navLinks = document.getElementById('nav-links');
        const isOpen = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (event) => {
        const navLinks = document.getElementById('nav-links');
        if (!navLinks.classList.contains('open')) return;
        if (event.target.closest('.nav-bar')) return;
        closeMobileNav();
    });

    const popup = document.getElementById('popup');
    popup.addEventListener('click', (event) => {
        if (event.target === popup) {
            closeSlidingPuzzle();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && popup.style.display === 'flex') {
            closeSlidingPuzzle();
        }
    });

    window.addEventListener('scroll', () => {
        const backToTop = document.getElementById('backToTop');
        backToTop.classList.toggle('visible', window.scrollY > 400);
        updateActiveNavLink();
    });

    updateActiveNavLink();
});

function getStoredTheme() {
    try {
        return localStorage.getItem("theme");
    } catch {
        return null;
    }
}

function setStoredTheme(theme) {
    try {
        localStorage.setItem("theme", theme);
    } catch {
        // The selected theme still applies for the current page view.
    }
}

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
    previouslyFocusedElement = document.activeElement;
    document.getElementById('popup').style.display = 'flex';
    document.body.classList.add('modal-open');
    document.getElementById('close-puzzle').focus();
}

function closeSlidingPuzzle() {
    document.getElementById('popup').style.display = 'none';
    document.body.classList.remove('modal-open');
    clearInterval(interval);
    if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
        previouslyFocusedElement.focus();
    }
}

function startGame() {
    size = parseInt(document.getElementById('size').value, 10);
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

    if (size % 2 === 1) {
        return inversions % 2 === 0;
    }

    const blankRowFromTop = Math.floor(tiles.indexOf(0) / size);
    return (inversions + blankRowFromTop) % 2 === 1;
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
