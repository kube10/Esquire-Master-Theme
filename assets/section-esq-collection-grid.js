window.onload = setLinkOnCard;
window.onresize = setLinkOnCard;

function setLinkOnCard() {
  const width = window.innerWidth;
  const productCards = document.querySelectorAll(
    ".esq-product-card__image-wrap"
  );
  if (getScreenSize(width) === "phone" || getScreenSize(width) === "tablet") {
    productCards.forEach((card, i) => {
      card.onclick = () => {
        const url = card.dataset.url;
        window.location.href = url;
      };
    });
  } else {
    productCards.forEach((card, i) => {
      card.onclick = () => {
        console.log("card click");
        return false;
      };
    });
  }
}
