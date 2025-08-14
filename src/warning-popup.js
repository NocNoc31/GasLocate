// warning-popup.js
export function showWarning(message) {
    let popup = document.getElementById("warningPopup");

    if (!popup) {
        fetch("warning-popup.html")
            .then(res => res.text())
            .then(html => {
                document.body.insertAdjacentHTML("beforeend", html);
                popup = document.getElementById("warningPopup");
                document.getElementById("closeWarning").addEventListener("click", () => {
                    popup.style.display = "none";
                });
                document.getElementById("warningMessage").textContent = message;
                popup.style.display = "flex";
            });
    } else {
        document.getElementById("warningMessage").textContent = message;
        popup.style.display = "flex";
    }
}
