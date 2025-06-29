const apiKey = '54ec6f5fbceccca3be287f96d205e371'; // Replace with your API key
    let isCelsius = true;

    document.getElementById('darkToggle').addEventListener('click', () => {
      const app = document.getElementById('app');
      const currentTheme = app.getAttribute("data-theme");
      if (currentTheme === "light") {
        app.setAttribute("data-theme", "dark");
        app.classList.remove("bg-blue-100", "text-gray-900");
        app.classList.add("bg-gray-900", "text-white");
        document.getElementById('darkToggle').textContent = "☀️ Light Mode";
      } else {
        app.setAttribute("data-theme", "light");
        app.classList.remove("bg-gray-900", "text-white");
        app.classList.add("bg-blue-100", "text-gray-900");
        document.getElementById('darkToggle').textContent = "🌙 Dark Mode";
      }
    });

    document.getElementById('unitToggle').addEventListener('click', () => {
      isCelsius = !isCelsius;
      const city = document.getElementById('cityName').textContent;
      if (city) {
        getWeatherByCity(city);
      }
    });

    window.onload = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          getWeatherByCoords(position.coords.latitude, position.coords.longitude);
        });
      }
    };

    function showLoader(show) {
      document.getElementById('loader').classList.toggle('hidden', !show);
    }

    async function getWeatherByCity(cityName = null) {
      const city = cityName || document.getElementById('cityInput').value.trim();
      if (city === "") return;
      showLoader(true);
      try {
        const unit = isCelsius ? 'metric' : 'imperial';
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`);
        const data = await res.json();
        if (data.cod !== 200) throw new Error(data.message);
        updateWeatherUI(data);
        getForecast(data.coord.lat, data.coord.lon);
        document.getElementById('errorBox').textContent = "";
      } catch (err) {
        document.getElementById('errorBox').textContent = `❌ ${err.message}`;
        document.getElementById('weatherResult').classList.add('hidden');
        document.getElementById('forecast').classList.add('hidden');
      }
      showLoader(false);
    }

    async function getWeatherByCoords(lat, lon) {
      showLoader(true);
      try {
        const unit = isCelsius ? 'metric' : 'imperial';
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`);
        const data = await res.json();
        updateWeatherUI(data);
        getForecast(lat, lon);
      } catch {}
      showLoader(false);
    }

    async function getForecast(lat, lon) {
      const unit = isCelsius ? 'metric' : 'imperial';
      const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`);
      const data = await res.json();

      const forecastContainer = document.getElementById('forecast');
      forecastContainer.innerHTML = '';
      const nextDays = data.list.filter((item, index) => index % 8 === 0).slice(0, 5);

      nextDays.forEach(day => {
        const card = document.createElement('div');
        card.className = "bg-blue-100 dark:bg-gray-800 p-2 rounded text-center text-sm";
        const date = new Date(day.dt_txt).toLocaleDateString(undefined, { weekday: 'short' });
        card.innerHTML = `
          <div>${date}</div>
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" class="mx-auto">
          <div>${day.main.temp}°${isCelsius ? 'C' : 'F'}</div>
        `;
        forecastContainer.appendChild(card);
      });
      forecastContainer.classList.remove('hidden');
    }

    function updateWeatherUI(data) {
      document.getElementById('cityName').textContent = data.name;
      document.getElementById('temp').textContent = `🌡️ ${data.main.temp}°${isCelsius ? 'C' : 'F'}`;
      document.getElementById('desc').textContent = data.weather[0].description;
      document.getElementById('humidity').textContent = `💧 Humidity: ${data.main.humidity}%`;
      document.getElementById('wind').textContent = `🌬️ Wind: ${data.wind.speed} m/s`;
      document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      document.getElementById('weatherResult').classList.remove('hidden');
    }