/* Base address for the Pokemon endpoints. Add the endpoint name and parameters onto this */
const ENDPOINT_BASE_URL = "https://sporadic.nz/pokesignment/";

window.addEventListener("load", function() {

    if (localStorage.getItem("pokemonDetails") === null) {
        populatePokemonDetails();
    } else {
        document.querySelector("#pokemonDetails").innerHTML = localStorage.getItem("pokemonDetails");
        document.querySelector("#pokemonDetails").classList.add(localStorage.getItem("addClass"));
        document.querySelector("#pokemonDetails").classList.remove(localStorage.getItem("removeClass"));
    }

    let time = new Date();

    if (localStorage.getItem("time") === null) {
        localStorage.setItem("time", "" + time.getTime() + (4 * 60 * 60 * 1000));
    }

    if (localStorage.getItem("time").valueOf() - time.getTime() >= (4 * 60 * 60 * 1000)) {
        localStorage.setItem("randomPokemon", null);
    }

    if ((localStorage.getItem("randomPokemon") === null)) {
        loadRandomPokemonOfTheDay();
    } else {
        document.querySelector("#pokemonOfTheDay").innerHTML = localStorage.getItem("randomPokemon");
    }


    async function fetchRandomPokemonObj() {

        let randomPokemonResponseObj = await fetch(ENDPOINT_BASE_URL + "pokemon?random=random");
        return await randomPokemonResponseObj.json();
    }

    async function loadRandomPokemonOfTheDay() {

        let randomPokemonJson = await fetchRandomPokemonObj();

        document.querySelector("#pokemonOfTheDay").innerHTML = "";

        let img = document.createElement("img");
        img.src = "https://sporadic.nz/pokesignment/img/" + randomPokemonJson.image;
        img.alt = randomPokemonJson.name;
        img.addEventListener("click", loadRandomPokemonOfTheDay);
        document.querySelector("#pokemonOfTheDay").appendChild(img);

        let h2 = document.createElement("h2");
        h2.innerText = randomPokemonJson.name;
        document.querySelector("#pokemonOfTheDay").appendChild(h2);

        let p = document.createElement("p");
        p.innerText = randomPokemonJson.description;
        document.querySelector("#pokemonOfTheDay").appendChild(p);

        localStorage.setItem("randomPokemon", document.querySelector("#pokemonOfTheDay").innerHTML);
        localStorage.setItem("time", time.getTime().toString());
    }

    async function populatePokemonDetails() {

        let pokemonArrayResponseObj = await fetch(ENDPOINT_BASE_URL + "pokemon");
        let pokemonArray = await pokemonArrayResponseObj.json();

        for (let i = 0; i < pokemonArray.length; i++) {
            let pokemon = await generatePokemonObject(pokemonArray[i]);
            let div = createPokemonBox(pokemon);
            document.querySelector("#pokemonDetails").appendChild(div);
        }

        localStorage.setItem("pokemonDetails", document.querySelector("#pokemonDetails").innerHTML);
        localStorage.setItem("addClass", "pokemonList");
        localStorage.setItem("removeClass", "chosenPokemon");
    }

    function createPokemonBox(pokemon) {

        let div = document.createElement("div");
        div.classList.add("pokemon");
        div.addEventListener("click", selectPokemonFromList);

        let img = document.createElement("img");
        img.src = "https://sporadic.nz/pokesignment/img/" + pokemon.image;
        img.alt = pokemon.name;
        div.appendChild(img);

        let h2 = document.createElement("h2");
        h2.innerText = pokemon.name;
        div.appendChild(h2);
        return div;
    }

    async function generatePokemonObject(pokemon) {

        let pokemonResponseObj = await fetch(ENDPOINT_BASE_URL + "pokemon?pokemon=" + pokemon);
        return await pokemonResponseObj.json();
    }

    async function createMatchUpDivs(text, pokemonArray) {

        let div = document.createElement("div");
        let h2 = document.createElement("h2");
        h2.innerText = text;
        div.appendChild(h2);

        for (let i = 0; i < pokemonArray.length; i++) {
            let pokemonObj = await generatePokemonObject(pokemonArray[i]);
            let pokemonBox = createPokemonBox(pokemonObj);
            div.appendChild(pokemonBox);
        }
        return div
    }

    async function changeMainImage(pokemonObj) {

        let pokemonDetails = document.querySelector("#pokemonDetails");
        pokemonDetails.innerHTML = "";
        pokemonDetails.classList.remove("pokemonList");
        pokemonDetails.classList.add("chosenPokemon");

        let leftDiv = await createMatchUpDivs("Weak Against", pokemonObj.opponents.weak_against);
        pokemonDetails.appendChild(leftDiv);

        let middleDiv = document.createElement("div");
        let h1 = document.createElement("h1");
        h1.innerText = pokemonObj.name;
        middleDiv.appendChild(h1);

        let img = document.createElement("img");
        img.src = "https://sporadic.nz/pokesignment/img/" + pokemonObj.image;
        img.alt = pokemonObj.name;
        img.id = "mainPokemon";
        middleDiv.appendChild(img);

        let p = document.createElement("p");
        p.innerText = pokemonObj.description;
        middleDiv.appendChild(p);

        let extraInfoDiv = document.createElement("div");
        extraInfoDiv.id = "extraInfo";
        let classesDiv = createExtraInfoDiv(pokemonObj.classes, "Class List");
        let skillsDiv = createExtraInfoDiv(pokemonObj.signature_skills, "Signature moves");
        extraInfoDiv.appendChild(classesDiv);
        extraInfoDiv.appendChild(skillsDiv);
        middleDiv.appendChild(extraInfoDiv);
        pokemonDetails.appendChild(middleDiv);

        let rightDiv = await createMatchUpDivs("Strong Against", pokemonObj.opponents.strong_against);
        pokemonDetails.appendChild(rightDiv);
        await applyClassColouring(pokemonObj.classes);

        localStorage.setItem("pokemonDetails", document.querySelector("#pokemonDetails").innerHTML);
        localStorage.setItem("addClass", "chosenPokemon");
        localStorage.setItem("removeClass", "pokemonList");
    }

    async function selectPokemonFromList(pokemon) {

        let pokemonObj = await generatePokemonObject(pokemon.target.alt);
        await changeMainImage(pokemonObj);
    }

    async function selectPokemonByName(pokemon) {

        let pokemonObj = await generatePokemonObject(pokemon);
        await changeMainImage(pokemonObj);
    }

    function createExtraInfoDiv(array, text) {

        let div = document.createElement("div");
        let h2 = document.createElement("h2");
        h2.innerText = text;
        div.appendChild(h2);
        for (let i = 0; i < array.length; i++) {
            let p = document.createElement("p");
            p.innerText = array[i];
            if (text === "Class List") {
                p.id = "class" + i;
                p.classList.add("classes");
            }
            div.appendChild(p);
        }
        div.classList.add("extraInfoDivs");
        return div;
    }

    async function applyClassColouring(classArray) {

        for (let i = 0; i < classArray.length; i++) {
            let keywordResponseObj = await fetch(ENDPOINT_BASE_URL + "keyword?keyword=" + classArray[i]);
            let keywordObj = await keywordResponseObj.json();
            console.log(document.querySelector(`#class${i}`));
            document.querySelector(`#class${i}`).style.backgroundColor = keywordObj.background;
            document.querySelector(`#class${i}`).style.color = keywordObj.foreground;
        }
    }

    async function loadRandomPokemon() {

        let randomPokemonJson = await fetchRandomPokemonObj();
        await selectPokemonByName(randomPokemonJson.name);
    }

    function showPokemonList() {

        document.querySelector("#pokemonDetails").classList.add("pokemonList");
        document.querySelector("#pokemonDetails").classList.remove("chosenPokemon");
        document.querySelector("#pokemonDetails").innerHTML = "";
        populatePokemonDetails();
    }

    function selectPokemonOfDay() {

        let pokemonName = document.querySelector("#pokemonOfTheDay > img").alt;
        selectPokemonByName(pokemonName);
    }


    document.querySelectorAll(".pokemon").forEach(pokemon => pokemon.addEventListener("click", selectPokemonFromList));
    document.querySelector("#pokemonOfTheDay > img").addEventListener("click", loadRandomPokemonOfTheDay);
    document.querySelector("#random").addEventListener("click", loadRandomPokemon);
    document.querySelector("#navRandom").addEventListener("click", loadRandomPokemon);
    document.querySelector("#showList").addEventListener("click", showPokemonList);
    document.querySelector("#navShowList").addEventListener("click", showPokemonList);
    document.querySelector("#showDetails").addEventListener("click", selectPokemonOfDay);
    document.querySelector("#navDay").addEventListener("click", selectPokemonOfDay);
});