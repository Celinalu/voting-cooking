// Load existing images from localStorage
window.onload = function () {
    if (localStorage.getItem('pictures')) {
        const pictures = JSON.parse(localStorage.getItem('pictures'));
        
        // Sort pictures by average rating
        pictures.sort((a, b) => getAverageRating(b.id) - getAverageRating(a.id));

        pictures.forEach(pic => {
            addPicture(pic.url, pic.id);
        });
    }
};

const ratings = {}; // Store ratings

document.getElementById('imageUpload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const id = 'pic' + Date.now();
        savePicture(e.target.result, id);
        addPicture(e.target.result, id);
    };
    reader.readAsDataURL(file);
});

// Save picture to localStorage
function savePicture(url, id) {
    let pictures = JSON.parse(localStorage.getItem('pictures')) || [];
    pictures.push({ url, id });
    localStorage.setItem('pictures', JSON.stringify(pictures));
}

// Add picture to the page
function addPicture(url, id) {
    const gallery = document.getElementById('gallery');
    const pictureDiv = document.createElement('div');
    pictureDiv.classList.add('picture');
    pictureDiv.setAttribute('data-id', id);

    pictureDiv.innerHTML = `
        <img src="${url}" alt="Uploaded Image">
        <div class="stars" data-picture="${id}"></div>
        <p class="average" id="${id}-rating">No ratings yet</p>
        <button onclick="deletePicture('${id}')">Delete</button>
    `;

    gallery.appendChild(pictureDiv);

    // Create stars dynamically with hover and click
    const starDiv = pictureDiv.querySelector('.stars');
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.classList.add('star');
        star.innerHTML = '★';
        star.dataset.value = i;

        // When clicked, rate the picture
        star.addEventListener('click', () => ratePicture(id, i));

        // Hover effect
        star.addEventListener('mouseover', () => {
            const stars = starDiv.querySelectorAll('.star');
            stars.forEach(s => {
                s.classList.remove('hovered');
                if (s.dataset.value <= star.dataset.value) {
                    s.classList.add('hovered');
                }
            });
        });

        star.addEventListener('mouseout', () => {
            const stars = starDiv.querySelectorAll('.star');
            stars.forEach(s => s.classList.remove('hovered'));
        });

        starDiv.appendChild(star);
    }
}

// Handle rating
function ratePicture(pictureId, value) {
    if (!ratings[pictureId]) {
        ratings[pictureId] = [];
    }
    ratings[pictureId].push(value);
    updateRating(pictureId);
    sortGallery();
}

// Update stars and average
function updateRating(pictureId) {
    const avg = getAverageRating(pictureId);
    const rounded = Math.round(avg);

    const starDiv = document.querySelector(`.stars[data-picture="${pictureId}"]`);
    const stars = starDiv.querySelectorAll('.star');

    stars.forEach(star => {
        star.classList.remove('selected');
        if (star.dataset.value <= rounded) {
            star.classList.add('selected');
        }
    });

    const avgText = document.getElementById(`${pictureId}-rating`);
    avgText.textContent = `Average rating: ${avg.toFixed(2)} stars (${ratings[pictureId].length} votes)`;
}

// Get average rating for a picture
function getAverageRating(pictureId) {
    if (!ratings[pictureId]) return 0;
    const avg = ratings[pictureId].reduce((a, b) => a + b, 0) / ratings[pictureId].length;
    return avg;
}

// Sort gallery by ratings (highest to lowest)
function sortGallery() {
    const gallery = document.getElementById('gallery');
    const pictures = Array.from(gallery.children);
    pictures.sort((a, b) => {
        const idA = a.getAttribute('data-id');
        const idB = b.getAttribute('data-id');
        return getAverageRating(idB) - getAverageRating(idA); // Sort in descending order
    });

    // Reorder the pictures in the DOM
    pictures.forEach(picture => {
        gallery.appendChild(picture);
    });
}

// Delete picture
function deletePicture(id) {
    const picture = document.querySelector(`.picture[data-id="${id}"]`);
    picture.remove();

    // Remove from localStorage
    let pictures = JSON.parse(localStorage.getItem('pictures')) || [];
    pictures = pictures.filter(pic => pic.id !== id);
    localStorage.setItem('pictures', JSON.stringify(pictures));

    // Remove ratings too
    delete ratings[id];
    sortGallery(); // Re-sort after deletion
}

