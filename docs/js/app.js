const APIController =(function () {
  const client_id = "1543434416aa4805b4e631273ed0cc1e";
  const client_secret = "d4d4bbb423324d9ba591a84a56e1c39c";

  const _getToken = async () => {
    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        'Authorization': "Basic " + btoa(client_id + ":" + client_secret),
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
        headers: { 'Authorization': "Bearer " + token },
      }
    );

    const data = await result.json();
    console.log(data.categories.items);
    return data.categories.items;
  };

  const _getPLaylistByGenre = async (token, genreId) => {

    console.log(genreId);
    const limit = 10;
    const result = await fetch(
      `https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`,
      {
        method: "GET",
        headers: { 'Authorization': "Bearer " + token },
      }
    );

    const data = await result.json();
    console.log(data.playlists.items);
    return data.playlists.items;
  };

  // getToken().then((token_get) => {
  //   const headers = {
  //     "Content-Type": "application/json",
  //     Accept: "application/json",
  //     Authorization: `Bearer ${token_get}`,
  //   };

  //   const params = {
  //     q: "daddy yankee",
  //     type: "artist",
  //     limit: 50,
  //   };

  //   fetch("https://api.spotify.com/v1/search?" + new URLSearchParams(params), {
  //     headers,
  //   })
  //     .then((response) => response.json())
  //     .then((data1) => console.log(data1.artists))
  //     .catch((error) => console.error(error));
  // });

  
  return {
    getToken(){
      return _getToken();
    },
    getGenres(token){
      return _getGenres(token);
    },
    getPlaylistByGenre(token, genreId){
      return _getPLaylistByGenre (token, genreId);
    },
    getTracks(token, tracksEndPoint){
      return _getTracks(token, tracksEndPoint);
    },
    getTrack(token, trackEndPoint){
      return _getTrack(token,trackEndPoint);
    }
  }
})();

const UIController = (function(){

  const DOMElements = {
    selectGenre: '#select_genre',
    selectPlayList: '#select_playlist',
    buttomSubmit: '#btn_submit',
    divSongDetail: '#song-detail',
    hfToken: '#hidden_token',
    divSongList: '.song-list'
  }

  return{
    inputField(){
      return {
        genre: document.querySelector(DOMElements.selectGenre),
        playlist: document.querySelector(DOMElements.selectPlayList),
        tracks: document.querySelector(DOMElements.divSongList),
        submit: document.querySelector(DOMElements.buttomSubmit),
        songDetail: document.querySelector(DOMElements.divSongDetail)
      }
    },

    createGenre(text, value){
      const html = `<option value="${value}">${text}</option>`;
      document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend',html);
    },

    createPlayList(text, value){
      const html = `<option value="${value}">${text}</option>`;
      document.querySelector(DOMElements.selectPlayList).insertAdjacentHTML('beforeend',html);
    },

    createTrack(id, name){
      const html = `<a href="#" id="${id}">${name}</a>`;
      document.querySelector(DOMElements.divSongList).insertAdjacentHTML('beforeend',html);
    },

    createTrackDetail(img, title, artist){
      const detailDiv =  document.querySelector(DOMElements.divSongDetail);

      detailDiv.innerHTML = '';
      const html = `
      
      <div>
        <img src="${img}" alt="">
      </div>
      <div>
        <label for="Genre">${title}:</label>
      </div>
      <div>
       <label for="artist"> By ${artist}:</label>
      </div> 
      `;

      detailDiv.insertAdjacentHTML('beforeend',html)
    },

    resetTrackDetail(){
      this.inputField().songDetail.innerHTML = " ";
    },

    resetTracks(){
      this.inputField().tracks.innerHTML = " ";
    },

    resetPlaylist(){
      this.inputField().playlist.innerHTML = " ";
    },

    storeToken(token){
      this.hfToken = token;
    },

    getStoredToken(){
      return {
        token: this.hfToken
      }
    }


  }
})();

const APPController = (function(UICtrl,APICtrl){

  const DOMInputs = UICtrl.inputField();

  const loadGenres = async () => {
    const token = await APICtrl.getToken();
    UICtrl.storeToken(token);
    const genres = await APICtrl.getGenres(token);
    genres.forEach(element => UICtrl.createGenre(element.name, element.id));
      
  }

  DOMInputs.genre.addEventListener('change', async () =>{
    UICtrl.resetPlaylist();
    const token = UICtrl.getStoredToken().token;
    const genreSelect = UICtrl.inputField().genre;
    const genreId = genreSelect.options[genreSelect.selectedIndex].value;
    const playlist = await APICtrl.getPlaylistByGenre(token, genreId);
    playlist.forEach(p => UICtrl.createPlayList(p.name, p.tracks.href));
  });

  DOMInputs.submit.addEventListener('click', async (e) =>{
    e.predentDefault();
    UICtrl.resetTracks();
    const token = UICtrl.getStoredToken().token;
    const playlistSelect = UICtrl.inputField().playlist;
    const tracksEndPoint = playlistSelect.option(playlistSelect.selectedIndex).value;
    const tracks = await APICtrl.getTracks(token, tracksEndPoint);
    tracks.forEach(el => UICtrl.createTrack(el.track.href,el.track.name))
  });


  DOMInputs.tracks.addEventListener('click', async (e) =>{
    e.predentDefault();
    UICtrl.resetTrackDetail();
    const token = UICtrl.getStoredToken().token;

    const tracksEndPoint = e.target.id;
    const track = await APICtrl.getTrack(token, tracksEndPoint);
    UICtrl.createTrackDetail(track.album.images[2].url, track.name, track.artist[0].name);
  });

  return{
    init(){
      console.log('Strating');
      loadGenres();
    }
  }

})(UIController,APIController);

APPController.init();


