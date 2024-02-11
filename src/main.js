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

  // Масив для збереження данних введених в Imput форми
  let arr = [];

  // Обробник події для форми пошуку
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Отримання терміну пошуку та пушимо в масив
    const searchTerm = searchInput.value.trim();
    arr = [];
    arr.push(searchTerm);

    if (searchTerm === "") {
      // Виведення помилки, якщо термін пошуку порожній
      iziToast.error({
        title: "Error",
        messageColor: '#fff',
        messageSize: '20px',
        backgroundColor: '#EF4040',
        position: "topRight",
        message: "Please enter a search term.",
      });
      return;
    }

    // Показати лоадер та очистити галерею та приховати кнопку "Load More"
    loader.classList.remove("hidden");
    gallery.innerHTML = "";
    loadButton.classList.add("hidden");
    currentPage = 1;

    try {
      // Отримання та відображення даних
      await fetchData(searchTerm, currentPage);

    } catch (error) {
      // Обробка помилок під час отримання даних
      console.error(error);
      iziToast.error({
        title: "Error",
        messageColor: '#fff',
        messageSize: '20px',
        backgroundColor: '#EF4040',
        position: "topRight",
        message: "An error occurred while fetching data. Please try again.",
      });
    } finally {
      // Приховати лоадер після завершення операції
      loader.classList.add("hidden");
    }

    // Очищаємо Imput форми
    form.reset();
  });

  // Обробник події для кнопки "Load More"
  loadButton.addEventListener("click", () => {
    // Показати лоадер та приховати кнопку "Load More"
    loader.classList.remove("hidden");
    loadButton.classList.add("hidden");
    // Збільшити поточну сторінку та отримати додаткові дані
    currentPage++;
    fetchData(arr, currentPage);
  });

  // Функція для отримання та відображення даних
  async function fetchData(searchTerm, page = 1) {
    try {
      // Отримання даних з API Pixabay
      const params = new URLSearchParams({
        key: apiKey,
        q: searchTerm,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: PER_PAGE,
      });
      const response = await axios.get(`${apiUrl}?${params}`);
            
      if (response.status !== 200) {
        // Якщо отримано неочікуваний HTTP-відповідь, вивести помилку
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = response.data;

      if (data.hits.length === 0) {
        // Якщо немає зображень, приховати кнопку "Load More" та вивести інформаційне повідомлення
        loadButton.classList.add("hidden");
        iziToast.show({
          title: '',
          messageColor: '#fff',
          messageSize: '20px',
          backgroundColor: '#EF4040',
          message: "Sorry, there are no images matching your search query. Please try again!",
          position: 'topRight',
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
          iziToast.show({
          title: 'End of Collection',
          messageColor: '#fff',
          messageSize: '20px',
          backgroundColor: '#EF4040',
          message: "We're sorry, but you've reached the end of search results.",
          position: 'bottomCenter',
        });
        }
      }
    } catch (error) {
      // Обробка помилок, які можуть виникнути під час отримання даних
      console.error(error);
      iziToast.error({
        title: "Error",
        messageColor: '#fff',
        messageSize: '20px',
        backgroundColor: '#EF4040',
        position: "topRight",
        message: "Sorry, there are no images matching your search query. Please try again!",
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
      smoothScrollBy(cardHeight * images.length, 5000);
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
