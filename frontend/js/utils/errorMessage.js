export const errorMessageHandler = (message, state = "on") => {
  let errEl = document.getElementById("errorMsg");
  if (errEl) {
    errEl.textContent = message;
    errEl.classList.add("errored");
  } else {
    errEl = document.createElement("p");
    errEl.id = "errorMsg";
    errEl.textContent = message;
    document.body.appendChild(errEl);
  }

  setTimeout(() => {
    errEl.classList.remove("errored");
  }, 3000);
  if (state === "on") errEl.classList.add("errored");
  else if (state === "of") errEl.classList.remove("errored");
};
