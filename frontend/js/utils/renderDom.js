export const renderDom = (
  el,
  domData,
  msgForNoContent = "",
  typeForRendering = "htmlRendering"
) => {
  if ((domData || domData == 0) && domData != ``) {
    const dev = document.createElement("dev");
    dev.innerHTML = domData;
    if (typeForRendering == "htmlRendering") el.innerHTML = dev.innerHTML;
    else if (typeForRendering == "textRendering")
      el.textContent = dev.innerHTML;
    else if (typeForRendering == "imgRendering") el.src = dev.innerHTML;
  } else {
    el.innerHTML = `
      <h2 class="no-content">
      لا يوجد محتوى للعرض
      
      <p style="font-size=15px" class="no-content-p">${msgForNoContent}</p>
      </h2>
  `;
  }
  document.body.style.overflowY = "auto";
};
