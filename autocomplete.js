/** root je property koji se mora u sustini definisati ili dodjeliti vrednost
 * u .js fajlu gdje se ova funkcija createAutoComplet koristi, root is the first element what wee need to define
 * if we had a three property as root and dropdown, and one more, we must to define all three element u .js fajlu gdje se
 * koristi createAutocomplet
 */

const createAutoComplete = ({
    root,
    renderOption,
    onOptionSelect,
    onInputValue,
    fetchData,
}) => {
    root.innerHTML = `<label><b>Search for a Movie </b></label>
 <input class = "input"/>
 <div class = "dropdown">
    <div class = "dropdown-menu">
       <div class = "dropdown-content results">
        </div>
     </div>
  </div>      
`;

    const input = root.querySelector('input');
    const dropdown = root.querySelector('.dropdown');
    const resultsWrapper = root.querySelector('.results'); //za "dropdown-content results"

    const onInput = async(event) => {
        //how get some data and get access to the response, we need to work with async function
        const movies = await fetchData(event.target.value); //uzima tu vrednost sto se ukuca event.target.value

        //Handling Empty Response
        //Kada nema ukucanih filmove -> close dropdown / odradicemo kada nema filmova kao !movies.length
        if (!movies.length) {
            dropdown.classList.remove('is-active');
            return;
        }

        //da ne pamti stare vrednost sa novim ukucanim vec da samo prikaziva trenutnu pretragu
        //update text
        resultsWrapper.innerHTML = '';

        //Kada se izvrsava funkcija onInput tada se izvrsavaju aktivno i dodate klase unutar ove funkcije za dropdown classu
        dropdown.classList.add('is-active');

        for (let movie of movies) {
            const option = document.createElement('a');

            option.classList.add('dropdown-item');
            /**uzima movie od movies pri unosu u search i return img i title (da prikazuje title i img def u index.js)
             * u funkciji renderOption
             */
            option.innerHTML = renderOption(movie);

            option.addEventListener('click', () => {
                dropdown.classList.remove('is-active');
                input.value = onInputValue(movie);
                /** Klikom na opcije pretrage jednog od filmova, desava se da se gubi is-active i da je value od inputa jedna Title od kliknutog filma */
                /**klikom izvrsava se funkcija onMovieSelect */
                onOptionSelect(movie);
            });

            resultsWrapper.appendChild(option);
        }
    };

    //2 way
    // const onInput = debounce((event) => {
    //   fetchData(event.target.value);
    // });  / nema poziva dole debounce(onInput) vec samo onInput

    input.addEventListener(
        'input',
        debounce(onInput)
    ); /**Kada se unosi nesto tj izvrsava se input desava se funkcija debounce i u njoj prosledjena funkcija onInput je originalna funkcija */

    //zelimo da zatvorimo dropdown kada kliknemo bilo gdjee, i ako input na kliku ne sadrzi tu vrijednost kliknutu
    // ide remove iz klase dropdown 'is-active', tj. closing  dropdown
    //jer se gore dodalo is-active, kada se vrsi pratraga da prikazuje slike i title, i ta klasa vazi za to
    //i sada ukljanjanjem is-active iz klase nema prikaza slike i title(jer nije u funkciji prethodna klasa gore) ako kliknuti element nije value za pretragu

    document.addEventListener('click', (event) => {
        if (!root.contains(event.target)) {
            //ako ne sadrzi kliknuto
            dropdown.classList.remove('is-active');
        }
    });
};