//create title

const title = document.getElementById("title");

const titleText = title.innerHTML;

const titleList = titleText.split("");

title.innerHTML = "";

titleList.forEach((char, index) => {
    const span = document.createElement("span");
    span.innerHTML = char;
    span.classList.add("title-character");
    span.style.animationDelay = `-${index / 2}s`;
    span.style.animationDuration = "20s";
    title.appendChild(span);
})

// turn on event passed text if event has passed

const eventStamps = document.getElementsByClassName("event-passed");

const now = new Date();

for (const event of eventStamps) {
    const eventDate = new Date(event.id.replace("event-passed-", ""));

    if (now > eventDate) {
        event.style.display = "block";
        const button = event.previousElementSibling;
        button.classList.add("ticket-button-down");
    }
}




