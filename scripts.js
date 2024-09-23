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

// create more info buttons

const toggleInfoButton = (button) => {
    const info = button.parentElement.children[0];

    if (button.innerHTML === "more info") {
        info.style.display = "inline";
        button.innerHTML = "less info";
    }
    else {
        info.style.display = "none";
        button.innerHTML = "more info";
    }
}

const moreInfoButtons = document.getElementsByClassName("info-button");

for (const button of moreInfoButtons) {
    button.onclick = () => toggleInfoButton(button);
}