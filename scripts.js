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