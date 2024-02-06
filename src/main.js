// Підключення необхідних бібліотек
import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// Очікування завантаження сторінки
document.addEventListener("DOMContentLoaded", () => {

  // Отримання елементів DOM
  const form = document.querySelector(".searchForm");
  const searchInput = document.querySelector(".searchInput");
  const loader = document.querySelector(".loader");
  const gallery = document.querySelector(".gallery");
  const loadButton = document.querySelector(".load-more-button");

  // Ключ та URL API Pixabay
  const apiKey = "42055816-5ec499474650eadfc6b07a02f";
  const apiUrl = "https://pixabay.com/api/";

  // Кількість зображень на сторінці
  const PER_PAGE = 15;

  // Ініціалізація lightbox для перегляду зображень
  const lightbox = new SimpleLightbox('.gallery a', {
    captionDelay: 250,
    captionsData: 'alt',
  });

  // Поточна сторінка для пагінації
  let currentPage = 1;

  // Обробник події для форми пошуку
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Отримання терміну пошуку
    const searchTerm = searchInput.value.trim();

    if (searchTerm === "") {
      // Виведення помилки, якщо термін пошуку порожній
      iziToast.error({
        title: "Error",
        position: "topRight",
        message: "Please enter a search term.",
      });
      return;
    }

    // Показати лоадер та очистити галерею та приховати кнопку "Load More"
    loader.classList.remove("hidden");
    gallery.innerHTML = "";
    loadButton.classList.add("hidden");

    try {
      // Отримання та відображення даних
      await fetchData(searchTerm, currentPage);

    } catch (error) {
      // Обробка помилок під час отримання даних
      console.error("Error fetching data:", error);
      iziToast.error({
        title: "Error",
        position: "topRight",
        message: "An error occurred while fetching data. Please try again.",
      });
    } finally {
      // Приховати лоадер після завершення операції
      loader.classList.add("hidden");
    }
  });

  // Обробник події для кнопки "Load More"
  loadButton.addEventListener("click", () => {
    // Показати лоадер та приховати кнопку "Load More"
    loader.classList.remove("hidden");
    loadButton.classList.add("hidden");
    // Збільшити поточну сторінку та отримати додаткові дані
    currentPage++;
    fetchData(searchInput.value.trim(), currentPage);
  });

  // Функція для отримання та відображення даних
  async function fetchData(searchTerm, page) {
    try {
      // Отримання даних з API Pixabay
      const response = await axios.get(`${apiUrl}?key=${apiKey}&q=${searchTerm}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${PER_PAGE}`);

      if (response.status !== 200) {
        // Якщо отримано неочікуваний HTTP-відповідь, вивести помилку
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = response.data;

      if (data.hits.length === 0) {
        // Якщо немає зображень, приховати кнопку "Load More" та вивести інформаційне повідомлення
        loadButton.classList.add("hidden");
        iziToast.info({
          title: "End of Collection",
          position: "topRight",
          message: "We're sorry, but you've reached the end of search results.",
        });
      } else {
        // Якщо є зображення, відобразити їх та показати/приховати кнопку "Load More"
        const images = data.hits.map((hit) => ({
          webformatURL: hit.webformatURL,
          largeImageURL: hit.largeImageURL,
          tags: hit.tags,
          likes: hit.likes,
          views: hit.views,
          comments: hit.comments,
          downloads: hit.downloads,
        }));

        displayImages(images);

        if (data.totalHits > page * PER_PAGE) {
          loadButton.classList.remove("hidden");
        } else {
          loadButton.classList.add("hidden");
        }
      }
    } catch (error) {
      // Обробка помилок, які можуть виникнути під час отримання даних
      console.error("Error fetching data:", error);
      iziToast.error({
        title: "Error",
        position: "topRight",
        message: "An error occurred while fetching data. Please try again.",
      });
    } finally {
      // Приховати лоадер після завершення операції
      loader.classList.add("hidden");
    }
  }

  // Функція для відображення зображень на сторінці
  function displayImages(images) {
    const galleryHTML = images
      .map(
        (image) => `
          <div class="gallery-item">
            <a href="${image.largeImageURL}" data-lightbox="gallery" data-title="${image.tags}">
              <img src="${image.webformatURL}" alt="${image.tags}" class="image-thumbnail">
            </a>
            <div class="image-details">
              <p><b>Likes:</b> ${image.likes}</p>
              <p><b>Views:</b> ${image.views}</p>
              <p><b>Comments:</b> ${image.comments}</p>
              <p><b>Downloads:</b> ${image.downloads}</p>
            </div>
          </div>
        `
      )
      .join("");

    // Додати HTML для зображень в галерею
    gallery.innerHTML += galleryHTML;

    // Оновити lightbox після додавання нових зображень
    lightbox.refresh();

    // Прокрутити сторінку так, щоб користувач міг побачити нові зображення
    const cardHeight = document.querySelector('.gallery-item')?.getBoundingClientRect().height;
    if (cardHeight) {
      smoothScrollBy(cardHeight * images.length, 300);
    }
  }

  // Функція для плавної прокрутки сторінки
  function smoothScrollBy(distance, duration) {
    const initialY = window.scrollY;
    const targetY = initialY + distance;

    let startTime = null;

    function scrollAnimation(currentTime) {
      if (!startTime) {
        startTime = currentTime;
      }

      const progress = currentTime - startTime;
      const elapsedTime = Math.min(progress, duration);

      const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      window.scrollTo(0, initialY + easeInOutQuad(elapsedTime / duration) * distance);

      if (progress < duration) {
        requestAnimationFrame(scrollAnimation);
      }
    }

    requestAnimationFrame(scrollAnimation);
  }
});
