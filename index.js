/*const fetchData = async(searchTerm) => {
    const response = await axios.get('http://www.omdbapi.com/', {
        params: {
            apikey: 'f779295c',
            s: searchTerm,
        },
    });

    //handling error responses
    if (response.data.Error) {
        return [];
    }

    return response.data.Search; //vrace resultat Search tj to je krajnja vrednost sto dobijemo return
};*/

const autoCompletConfig = {
    async fetchData(searchTerm) {
        const response = await axios.get('http://www.omdbapi.com/', {
            params: {
                apikey: 'f779295c',
                s: searchTerm,
            },
        });

        //handling error responses
        if (response.data.Error) {
            return [];
        }

        return response.data.Search; //vrace resultat Search tj to je krajnja vrednost sto dobijemo return
    },
    renderOption(film) {
        const imgSrc = film.Poster === 'N/A' ? '' : film.Poster; //if imgSrc je moviePoster i ako je moviePoster source jednako 'N/A' return empty string

        return `<img  src="${imgSrc}" /> 
        ${film.Title}  (${film.Year})`;
    },

    onOptionSelect(film) {
        onMovieSelect(film, el, side);
    },

    onInputValue(film) {
        return film.Title;
    },
};

createAutoComplete({
    ...autoCompletConfig,
    root: document.querySelector('#left-autocomplete'),
    /**uzmemo onOptionSelect i izmjenimo ga za ovaj root gdje definisemo onMovieSelect da mu se prosledjuje element querySelector */
    onOptionSelect(film) {
        //Kad se dosava ovo onOptionSelect doda se klasi is-hidden sto kad se doda onoj klasi sakrije je tj. nestane
        //Koristim bulma.css gotove forme
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(film, document.querySelector('#left-summary'), 'left');
    },
});
createAutoComplete({
    ...autoCompletConfig,
    root: document.querySelector('#right-autocomplete'),
    onOptionSelect(film) {
        document.querySelector('.tutorial').classList.add('is-hidden');
        onMovieSelect(film, document.querySelector('#right-summary'), 'right');
    },
});

//ovdje je moglo bilo sta umjesto movie, jer je ovdje movie ono sto mu prosledimo kao sve elemente, a sto je gore
// u for petlji movie je sve posebnoo izdvojeno iz movies = await fetchData(event.target.value)

let leftMovie;
let rightMovie; //leva i desna strana
const onMovieSelect = async(mov, el, side) => {
    const response = await axios.get('http://www.omdbapi.com/', {
        params: {
            apikey: 'f779295c',
            i: mov.imdbID,
        },
    });

    // dodaj <div id="summary"> html kod iskuckan u movietemplate sa argumentom koji sadrzi sve specifikacije, a to je bas response.data
    // Ili ovakav slucaj, prosledjujemo callback el, i da se koriscenjem onMovieSelect mora i prosledit u koji dio html elemnta se dodaje
    el.innerHTML = movieTemplate(response.data);
    console.log(response.data);

    if (side === 'left') {
        leftMovie = response.data;
    } else {
        rightMovie = response.data;
    } //samo proslijedi response.data dodijeli im i u ovoj drugoj donjoj if kad su oba pozvana desava se uporedjivanje
    /*i u pozivanju onMovieSelect kao treci property je ili 'right' ili 'left'*/
    if (leftMovie && rightMovie) {
        runComparasion(); //ova se funkcija poziva i radi kada suu oba side aktivna
    }
};

//updating style i uporedjivanje dve kolonee

const runComparasion = () => {
    const leftSideStats = document.querySelectorAll(
        '#left-summary .notification'
    ); //notification je gdje su vrednosti prosledjene, sa All svaki element te klase uzima
    const rightSideStats = document.querySelectorAll(
        '#right-summary .notification'
    );

    leftSideStats.forEach((leftStat, index) => {
        const rightStat = rightSideStats[index]; //rightStat je sve iz rightSideStats a leftStat za leftSideStats

        const leftStatValue = parseInt(leftStat.dataset.value); //uzima property value iz  data-value=${awards}, i ostalo
        const rightStatValue = parseInt(rightStat.dataset.value);
        //ako je vrijednot desnog veca od lijevog ukloni is-primary a dodaj mu is-warn
        if (rightStatValue > leftStatValue) {
            leftStat.classList.remove('is-primary');
            leftStat.classList.add('is-warn'); //Moglo automatski sa is-warning a moze i ovako pa mi u nasem css promjenimo
        } else {
            rightStat.classList.remove('is-primary');
            rightStat.classList.add('is-warn');
        }
    });
};

//movieDetail is the real big object with all the specific properties of a movie
const movieTemplate = (movieDetail) => {
    //ispis '6290000' da ne bude oznaka dolara i zareza da se more uporedjivat
    const dollars = parseInt(
        movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, '')
    );

    const metascore = parseInt(movieDetail.Metascore);
    const imdbRating = parseFloat(movieDetail.imdbRating);
    const imdbvotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));

    //Parsing number of Awards
    const awards = movieDetail.Awards.split(' ').forEach((prev, word) => {
        //ukini sve space, i value je samo brojevi
        const value = parseInt(word); //value je samo brojevi, pomocu parseInt integer

        if (isNaN(value)) {
            //ako je value isNaN, a ako nije onda dodaj vrednost countu
            return prev;
        } else {
            return prev + value; //prev kao prethodna vrednost (vrednost trenutna plus nova), stavimo je na nulu
        }
    }, 0);

    /**data-value je Parsed Properties definisanih gore */
    return `
        <article class="media">
            <figure class = "media-left">
               <p class = "image">
                   <img src = "${movieDetail.Poster}"/>
               </p>
             </figure>
          <div class="media-content">
           <div class = "content">
              <h1> ${movieDetail.Title} </h1>
              <h4>${movieDetail.Genre} </h4>
              <p> ${movieDetail.Plot} </p>
           </div>
          </div>    
         </article>
         <article data-value=${awards} class="notification is-primary">
              <p class = "title"> ${movieDetail.Awards} </p>
              <p class = "subtitle"> Awards </p>
         </article>
         <article data-value=${dollars} class="notification is-primary">
              <p class = "title"> ${movieDetail.BoxOffice} </p>
              <p class = "subtitle"> Box Office </p>
         </article>
         <article data-value=${metascore} class="notification is-primary">
              <p class = "title"> ${movieDetail.Metascore} </p>
              <p class = "subtitle"> Metascore </p>
        </article>
        <article data-value=${imdbRating} class="notification is-primary">
              <p class = "title"> ${movieDetail.imdbRating} </p>
              <p class = "subtitle"> IMDB Rating </p>
         </article>
         <article data-value=${imdbvotes} class="notification is-primary">
              <p class = "title"> ${movieDetail.imdbVotes} </p>
              <p class = "subtitle"> IMDB Votes </p>
         </article>
     `;
};