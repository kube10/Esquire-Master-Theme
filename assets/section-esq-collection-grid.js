window.onload = setLinkOnCard;
window.onresize = setLinkOnCard;

function setLinkOnCard() {
  console.log("triggered");
  const width = window.innerWidth;
  const productCards = document.querySelectorAll(".product-card-minimal");
  if (getScreenSize(width) === "phone" || getScreenSize(width) === "tablet") {
    productCards.forEach((card, i) => {
      card.onclick = () => {
        console.log("clicked");
        const url = card.dataset.url;
        window.location.href = url;
      };
    });
  } else {
    productCards.forEach((card, i) => {
      card.onclick = () => {
        return false;
      };
    });
  }
}
