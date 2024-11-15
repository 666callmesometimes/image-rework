const imageInput = document.getElementById('image-input');
const imageList = document.getElementById('image-list');
const applyToAllBtn = document.getElementById('apply-to-all');
const processAllBtn = document.getElementById('process-all');
const globalWidthInput = document.getElementById('global-width');
const globalHeightInput = document.getElementById('global-height');
const globalAspectRatioCheckbox = document.getElementById('global-aspect-ratio');
const canvas = document.getElementById('canvas');

let images = []; // Lista obrazów

// Funkcja aktualizująca listę obrazów
const updateImageList = () => {
  imageList.innerHTML = ''; // Czyszczenie listy

  images.forEach((image, index) => {
    const item = document.createElement('div');
    item.classList.add('image-item');

    // Miniatura obrazu
    const thumbnail = document.createElement('img');
    thumbnail.src = image.dataUrl;
    thumbnail.alt = `Miniatura ${image.file.name}`;
    thumbnail.style.width = 'auto';
    thumbnail.style.height = '100px';
    item.appendChild(thumbnail);

    // Informacje o obrazie
    const info = document.createElement('div');
    const name = document.createElement('p');
    // name.textContent = `Zdjęcie ${index + 1}: ${image.file.name}`;
    name.textContent = `${image.file.name}`;

    const originalSize = document.createElement('p');
    originalSize.textContent = `Original size: ${image.originalWidth}x${image.originalHeight}`;
    originalSize.style.color = 'gray';
    originalSize.style.fontSize = '0.7em';
    info.appendChild(name);
    info.appendChild(originalSize);
    item.appendChild(info);

    // Pola do ustawienia wymiarów
    const widthInput = document.createElement('input');
    widthInput.type = 'number';
    widthInput.placeholder = 'Width';
    widthInput.value = image.width || '';
    widthInput.addEventListener('input', (e) => {
      image.width = parseInt(e.target.value) || null;

      if (image.aspectRatioCheckbox && image.width) {
        image.height = Math.round(image.width / image.aspectRatio);
        heightInput.value = image.height;
      }
    });
    item.appendChild(widthInput);

    const heightInput = document.createElement('input');
    heightInput.type = 'number';
    heightInput.placeholder = 'Height';
    heightInput.value = image.height || '';
    heightInput.addEventListener('input', (e) => {
      image.height = parseInt(e.target.value) || null;

      if (image.aspectRatioCheckbox && image.height) {
        image.width = Math.round(image.height * image.aspectRatio);
        widthInput.value = image.width;
      }
    });
    item.appendChild(heightInput);

    const aspectRatioCheckbox = document.createElement('input');
    aspectRatioCheckbox.type = 'checkbox';
    aspectRatioCheckbox.checked = image.aspectRatioCheckbox;
    aspectRatioCheckbox.addEventListener('change', (e) => {
      image.aspectRatioCheckbox = e.target.checked;
    });
    const aspectLabel = document.createElement('label');
    aspectLabel.textContent = ' Keep Aspect Ratio';
    aspectLabel.prepend(aspectRatioCheckbox);
    item.appendChild(aspectLabel);

    // Przycisk pobierania pojedynczego obrazu
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download';
    downloadBtn.addEventListener('click', () => downloadImageWithBackground(image));
    item.appendChild(downloadBtn);

    // Przycisk usuwania obrazu
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Delete';
    removeBtn.style.marginLeft = '10px';
    removeBtn.style.backgroundColor = 'white';
    removeBtn.style.border = '2px solid #d4d4d4';
    removeBtn.style.color = '#c7c7c7';

    removeBtn.addEventListener('click', () => {
      images.splice(index, 1); // Usunięcie obrazu z listy
      updateImageList(); // Aktualizacja listy
    });
    item.appendChild(removeBtn);

    imageList.appendChild(item);
  });
};

// Dodawanie obrazów
imageInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        images.push({
          file,
          dataUrl: reader.result,
          width: null,
          height: null,
          aspectRatio: img.width / img.height,
          aspectRatioCheckbox: true,
          originalWidth: img.width,
          originalHeight: img.height,
        });
        updateImageList();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
});

// Pobieranie obrazu z białym tłem
const downloadImageWithBackground = async (image) => {
  const img = new Image();
  img.src = image.dataUrl;

  await new Promise((resolve) => {
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      canvas.width = image.width || img.width;
      canvas.height = image.height || img.height;

      // Wypełnianie canvas białym tłem
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Rysowanie obrazu
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Eksport do JPEG
      canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${image.file.name.replace(/\.[^/.]+$/, '')}_reworked.jpg`;
        link.click();
        resolve();
      }, 'image/jpeg');
    };
  });
};

// Zastosowanie globalnych ustawień
applyToAllBtn.addEventListener('click', () => {
  const globalWidth = parseInt(globalWidthInput.value) || null;
  const globalHeight = parseInt(globalHeightInput.value) || null;
  const globalAspectRatio = globalAspectRatioCheckbox.checked;

  images.forEach((image) => {
    image.width = globalWidth;
    image.height = globalHeight;
    image.aspectRatioCheckbox = globalAspectRatio;

    if (globalAspectRatio && globalWidth) {
      image.height = Math.round(globalWidth / image.aspectRatio);
    } else if (globalAspectRatio && globalHeight) {
      image.width = Math.round(globalHeight * image.aspectRatio);
    }
  });

  updateImageList();
});

// Pobieranie wszystkich obrazów
processAllBtn.addEventListener('click', async () => {
  for (const image of images) {
    await downloadImageWithBackground(image);
  }
});
