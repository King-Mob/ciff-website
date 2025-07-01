async function buildPage() {
    const eventResponse = await fetch("./event.json");
    const event = await eventResponse.json();
    console.log(event);
    const title = document.getElementById("event-title");
    const image = document.getElementById("event-image");
    const date = document.getElementById("date");
    const description = document.getElementById("description");
    const runtime = document.getElementById("runtime");
    const ticketLinks = document.getElementsByClassName("ticket-link");
    const films = document.getElementById("films-container");

    title.innerHTML = event.title;
    image.src = event.image;
    date.innerHTML = event.date;
    description.innerHTML = event.description;
    runtime.innerHTML = `Runtime: ${event.runtime} minutes`;
    for (let link of ticketLinks) link.href = event.link;

    event.films.forEach((film) => {
        const filmContainer = document.createElement("div");
        const filmTitle = document.createElement("h2");
        const filmImage = document.createElement("img");
        const synopsis = document.createElement("p");
        const director = document.createElement("p");

        filmTitle.innerHTML = film.title;
        filmImage.src = film.image;
        filmImage.classList.add("event-image");
        synopsis.innerHTML = film.synopsis;
        director.innerHTML = film.director;

        filmContainer.append(filmTitle);
        filmContainer.append(filmImage);
        filmContainer.append(synopsis);
        filmContainer.append(director);

        films.append(filmContainer);
    });
}

buildPage();
