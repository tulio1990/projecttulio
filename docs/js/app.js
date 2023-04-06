const APIController = (function () {
  const client_id = "1543434416aa4805b4e631273ed0cc1e";
  const client_secret = "d4d4bbb423324d9ba591a84a56e1c39c";

  const _getToken = async () => {
    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(client_id + ":" + client_secret),
      },
      body: "grant_type=client_credentials",
    });
    const data = await result.json();
    return data.access_token;
  };

  const _getGenres = async (token) => {
    console.log(token);
    const result = await fetch(
      "https://api.spotify.com/v1/browse/categories?locale=sv_US",
      {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      }
    );

    const data = await result.json();
    return data.categories.items;
  };

  const _getPLaylistByGenre = async (token, genreId) => {
    const limit = 10;
    const result = await fetch(
      `https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`,
      {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      }
    );

    const data = await result.json();
    return data.playlists.items;
  };

  const _getTracks = async (token, tracksEndPoint) => {
    const limit = 10;
    const result = await fetch(tracksEndPoint +`?limit=${limit}`, 
    // const result = await fetch(`https://api.spotify.com/v1/playlists/37i9dQZF1DX3WvGXE8FqYX/tracks`, 
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });

    const data = await result.json();
    console.log(data.items);
    return data.items;
  };

  const _getTrack = async (token, tracksEndPoint) => {
    const result = await fetch(tracksEndPoint, 
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });

    const data = await result.json();
    console.log(data);
    return data;
  };

  const _getTrackStore = async (token, name) => {
    const result = await fetch(`https://api.spotify.com/v1/tracks/` + name, 
    {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    });

    const data = await result.json();
    console.log(data);
    return data;
  };

  return {
    getToken() {
      // return 'BQAxeZ-XxI1RV3xXqS_-OkBfWhFK6PRrlhOOJadalUbWS86Mdm67XFPowRbbklBbaXhrqjXVKpKaaUChtjPU2SQjAUCywWpYS_CVOGklzdDkV1-RfQRb';
      return _getToken();
    },
    getGenres(token) {
      return _getGenres(token);
    },
    getPlaylistByGenre(token, genreId) {
      return _getPLaylistByGenre(token, genreId);
    },
    getTracks(token, tracksEndPoint) {
      return _getTracks(token, tracksEndPoint);
    },
    getTrack(token, trackEndPoint) {
      return _getTrack(token, trackEndPoint);
    },

    getTrackStore(token, name) {
      return _getTrackStore(token, name);
    },

  };
})();

const UIController = (function () {
  const DOMElements = {
    selectGenre: "#select_genre",
    selectPlayList: "#select_playlist",
    buttomSubmit: "#btn_submit",
    divSongDetail: "#song-detail",
    hfToken: "#hidden_token",
    divSongList: ".song-list",
    buttomAdd: "#btn_add",
  };

  return {
    inputField() {
      return {
        genre: document.querySelector(DOMElements.selectGenre),
        playlist: document.querySelector(DOMElements.selectPlayList),
        tracks: document.querySelector(DOMElements.divSongList),
        submit: document.querySelector(DOMElements.buttomSubmit),
        songDetail: document.querySelector(DOMElements.divSongDetail),
        adding: document.querySelector(DOMElements.buttomAdd),
      };
    },

    createGenre(text, value) {
      const html = `<option value="${value}">${text}</option>`;
      document
        .querySelector(DOMElements.selectGenre)
        .insertAdjacentHTML("beforeend", html);
    },

    createPlayList(text, value) {
      const html = `<option value="${value}">${text}</option>`;
      document
        .querySelector(DOMElements.selectPlayList)
        .insertAdjacentHTML("beforeend", html);
    },

    createTrack(id, name) {
      const html = `<a href="#" id="${id}">${name}</a><br>`;
      document
        .querySelector(DOMElements.divSongList)
        .insertAdjacentHTML("beforeend", html);
    },

    createTrackDetail(img, title, artist, id) {
      console.log(id);
      const detailDiv = document.querySelector(DOMElements.divSongDetail);
      const btn_add = document.querySelector(DOMElements.buttomAdd);
      detailDiv.innerHTML = "";
      const html = `
      
      <div>
        <img id="img-song" src="${img}" alt="">
      </div><br>
      <div>
        <label for="Genre">${title} By ${artist}</label>
      </div><br>

      `;

      detailDiv.insertAdjacentHTML("beforeend", html);
      
      
      btn_add.style.display = 'inline-block';
      btn_add.name = id;
      
      
    },

    resetTrackDetail() {
      this.inputField().songDetail.innerHTML = " ";
    },

    resetTracks() {
      this.inputField().tracks.innerHTML = " ";
    },

    resetPlaylist() {
      this.inputField().playlist.innerHTML = " ";
    },

    storeToken(token) {
      this.hfToken = token;
    },

    getStoredToken() {
      return {
        token: this.hfToken,
      };
    },
  };
})();

const APPController = (function (UICtrl, APICtrl) {
  const DOMInputs = UICtrl.inputField();

  const loadGenres = async () => {
    const token = await APICtrl.getToken();
    UICtrl.storeToken(token);
    const genres = await APICtrl.getGenres(token);
    genres.forEach((element) => UICtrl.createGenre(element.name, element.id));
  };

  DOMInputs.genre.addEventListener("change", async () => {
    UICtrl.resetPlaylist();
    const token = UICtrl.getStoredToken().token;
    const genreSelect = UICtrl.inputField().genre;
    const genreId = genreSelect.options[genreSelect.selectedIndex].value;
    const playlist = await APICtrl.getPlaylistByGenre(token, genreId);
    playlist.forEach((p) => UICtrl.createPlayList(p.name, p.tracks.href));
  });

  DOMInputs.submit.addEventListener("click", async () => {
    // e.predentDefault();
    UICtrl.resetTracks();
    UICtrl.resetTrackDetail();
    UICtrl.inputField().adding.style.display = 'none';
    const token = UICtrl.getStoredToken().token;
    const playlistSelect = UICtrl.inputField().playlist;
    const tracksEndPoint = playlistSelect.options[
      playlistSelect.selectedIndex
    ].value;
    const tracks = await APICtrl.getTracks(token, tracksEndPoint);
    console.log(tracks);
    tracks.forEach(el => UICtrl.createTrack(el.track.href,el.track.name))
  });

  DOMInputs.tracks.addEventListener("click", async (e) => {
    // e.predentDefault();
    UICtrl.resetTrackDetail();
    const token = UICtrl.getStoredToken().token;
    const tracksEndPoint = e.target.id;
    const track = await APICtrl.getTrack(token, tracksEndPoint);
    UICtrl.createTrackDetail(
      track.album.images[1].url,
      track.name,
      track.artists[0].name,
      track.id,
    );
  });


  DOMInputs.adding.addEventListener("click", async () => {
    // e.predentDefault();
    let cartCon = JSON.parse(localStorage.getItem("car-add"));
    const token = UICtrl.getStoredToken().token;
    const name = DOMInputs.adding.name;
    const track = await APICtrl.getTrackStore(token, name);
    console.log("Entrando");

  
    if (!cartCon) {
      cartCon = [];
    }
    cartCon.push(track);
    localStorage.setItem('car-add', JSON.stringify(cartCon));
    alert("Great! Your song has been added to the cart");
   
  });


  return {
    init() {
      console.log("Strating");
      loadGenres();
    },
  };
})(UIController, APIController);

APPController.init();