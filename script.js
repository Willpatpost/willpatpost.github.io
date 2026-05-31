let size, puzzle, timer, moveCounter, time, moves, interval;

document.addEventListener("DOMContentLoaded", function() {
    // Theme toggle functionality
    const themeToggle = document.getElementById("theme-toggle");
    const currentTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    themeToggle.checked = currentTheme === "dark";

    themeToggle.addEventListener("change", () => {
        const theme = themeToggle.checked ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    });

    // Smooth scrolling for navigation links
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector(link.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Smooth scrolling for the "Learn More" button
    const learnMoreButton = document.querySelector('.cta-button');
    learnMoreButton.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('#about').scrollIntoView({
            behavior: 'smooth'
        });
    });

    // Dropdown toggle for project details
    document.querySelectorAll('.dropdown-btn').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = this.getAttribute('data-target');
            const container = document.getElementById(projectId);
            container.classList.toggle('hidden');
        });
    });

    // Attach event listener for the play button, ensuring no puzzle opens on load
    document.getElementById('play-button').addEventListener('click', openSlidingPuzzle);

    // Scroll to Top Button
    document.getElementById('backToTop').addEventListener('click', scrollToTop);
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Open and close the sliding puzzle pop-up
function openSlidingPuzzle() {
    const popup = document.getElementById('popup');
    popup.style.display = 'flex'; // Ensure it's centered by using flex display
    popup.scrollIntoView({ behavior: 'smooth' }); // Ensure the pop-up scrolls into view smoothly
}

function closeSlidingPuzzle() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none'; // Close the pop-up
    clearInterval(interval); // Stop the timer when the popup is closed
}

// Start the sliding puzzle game
function startGame() {
    size = parseInt(document.getElementById('size').value);
    puzzle = generatePuzzle(size);
    time = 0;
    moves = 0;
    updateTimerDisplay();
    document.getElementById('moveCounter').textContent = moves;
    document.getElementById('congratulationsMessage').style.display = 'none';
    clearInterval(interval);
    interval = setInterval(() => {
        time++;
        updateTimerDisplay();
    }, 1000);
    renderPuzzle();
}

// Update the timer display
function updateTimerDisplay() {
    const hours = Math.floor(time / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds}`;
}

// Generate the puzzle tiles
function generatePuzzle(size) {
    const tiles = Array.from({ length: size * size }, (_, i) => i + 1);
    tiles[size * size - 1] = 0; // Blank tile
    do {
        shuffleArray(tiles);
    } while (!isSolvable(tiles) || isSolved(tiles));
    return tiles;
}

// Shuffle the puzzle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Check if the puzzle is solvable
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

// Check if the puzzle is already solved
function isSolved(tiles) {
    for (let i = 0; i < tiles.length - 1; i++) {
        if (tiles[i] !== i + 1) return false;
    }
    return true;
}

// Render the puzzle on the screen
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

// Move the tile when clicked
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

// Check if the player has won the game
function checkWin() {
    if (isSolved(puzzle)) {
        clearInterval(interval);
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => tile.classList.add('finished'));
        document.getElementById('congratulationsMessage').style.display = 'block';
    }
}

// New movie recommender code
let movies = [];  // This will hold the data once loaded

// Helper function to extract relevant features from each movie
function extractFeatures(movie) {
    const keywords = movie.keywords ? movie.keywords : "";
    const cast = movie.cast ? movie.cast : "";
    const genres = movie.genres ? movie.genres : "";
    return (keywords + " " + cast + " " + genres).toLowerCase();
}

// Function to vectorize text features (simple word count)
function vectorize(text) {
    const words = text.split(" ");
    const wordCount = {};
    
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return wordCount;
}

// Function to compute cosine similarity between two word count vectors
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

// Load the dataset and extract features
fetch('Data/movie_dataset.json')
    .then(response => response.json())
    .then(data => {
        movies = data.map(movie => ({
            title: movie.title.trim(),  // Keep original title case
            features: vectorize(extractFeatures(movie))  // Vectorize the features
        }));
        console.log('Movies loaded and processed:', movies.map(movie => movie.title));
    })
    .catch(error => console.error('Error loading the movie dataset:', error));

// Helper function to find a movie index by title
function getIndexFromTitle(title) {
    const normalizedTitle = title.trim();
    return movies.findIndex(movie => movie.title.toLowerCase() === normalizedTitle.toLowerCase());
}

// Function to recommend movies
function recommendMovies() {
    const inputTitle = document.getElementById('movieTitle').value.trim();
    const movieIndex = getIndexFromTitle(inputTitle);

    if (movieIndex === -1) {
        alert('Movie not found!');
        return;
    }

    const inputMovie = movies[movieIndex];
    const similarities = movies.map((movie, index) => {
        if (index === movieIndex) return 0;  // Ignore the same movie
        return { title: movie.title, score: cosineSimilarity(inputMovie.features, movie.features) * 100 };  // Convert to percentage
    });

    similarities.sort((a, b) => b.score - a.score);
    const topMovies = similarities.slice(0, 10);  // Top 10

    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';  // Clear previous results
    topMovies.forEach((movie, index) => {
        const resultItem = document.createElement('p');
        resultItem.textContent = `${index + 1}. ${movie.title} (Score: ${movie.score.toFixed(2)}%)`;
        resultsDiv.appendChild(resultItem);
    });
}

// Function to open and close the movie recommender popup
function openMovieRecommender() {
    const popup = document.getElementById('moviePopup');
    popup.style.display = 'flex';  // Open popup
}

function closeMovieRecommender() {
    const popup = document.getElementById('moviePopup');
    popup.style.display = 'none';  // Close popup
}

document.getElementById('recommendBtn').addEventListener('click', recommendMovies);
