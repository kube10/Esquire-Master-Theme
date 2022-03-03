const esqMiniCartBtn = document.querySelector(".esq-mini-cart-btn");
const esqMiniCart = document.querySelector(".esq-mini-cart");
const cartItemsContainers = document.querySelectorAll(".cartItemsContainer");
const cardItemTemplate = document.querySelector(".cart__item.hidden");
const cartEmptyStates = document.querySelectorAll(".cartEmptyState");
const cartDefault = document.querySelectorAll(".cartDefault");
const mobileMenu = document.querySelector(".mobile-menu");
const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
const cartBubble = document.querySelector(".esq-cart-bubble");

function handleMobileMenuBtnClick() {
  if (!mobileMenuBtn.classList.contains("open")) {
    openMobileMenu(mobileMenuBtn);
  } else {
    closeMobileMenu(mobileMenuBtn);
  }
}

function handleCartButtonClick() {
  if (!esqMiniCartBtn.classList.contains("open")) {
    openEsqMiniCart(esqMiniCartBtn);
  } else {
    closeEsqMiniCart(esqMiniCartBtn);
  }
}

function openMobileMenu(mobileMenuBtn) {
  mobileMenu.classList.add("open");
  mobileMenuBtn.classList.add("open");
  document.querySelector("html").classList.add("esq-mobile-menu-open");
  closeEsqMiniCart(esqMiniCartBtn);
}

function closeMobileMenu(mobileMenuBtn) {
  mobileMenu.classList.remove("open");
  mobileMenuBtn.classList.remove("open");
  document.querySelector("html").classList.remove("esq-mobile-menu-open");
}

//also fetches & renders line items using renderCartItems()
function openEsqMiniCart(esqMiniCartBtn) {
  esqMiniCart.classList.add("open");
  const cartItems = fetch("/cart.js")
    .then((response) => response.json())
    .then((data) => {
      renderCartItems(data);
    });
  document.querySelector("html").classList.add("esq-mini-cart-open");
  closeMobileMenu(mobileMenuBtn);
  esqMiniCartBtn.classList.add("open");
}

function closeEsqMiniCart(esqMiniCartBtn) {
  esqMiniCartBtn.classList.remove("open");
  esqMiniCart.classList.remove("open");
  document.querySelector("html").classList.remove("esq-mini-cart-open");
}

//cartData should be the full data response when running fetch /cart.js
function renderCartItems(cartData) {
  //Show empty state
  //Looks for both the cart panel & elements on the cart page
  if (cartData.items.length === 0) {
    cartDefault.forEach((cartTotal, i) => {
      cartTotal.classList.add("hidden");
    });
    cartEmptyStates.forEach((cartEmptyState, i) => {
      cartEmptyState.classList.remove("hidden");
    });
    cartBubble.classList.add("hidden");
  }
  //Cart is not empty
  else {
    //hide empty states if previously visibile
    cartEmptyStates.forEach((cartEmptyState, i) => {
      if (!cartEmptyState.classList.contains("hidden")) {
        cartEmptyState.classList.add("hidden");
      }
    });

    //shows default states
    cartDefault.forEach((cartTotal, i) => {
      cartTotal.classList.remove("hidden");
    });

    cartBubble.classList.remove("hidden");
  }

  //looks for itemcontainers on panel cart & cart page
  cartItemsContainers.forEach((cartItemsContainer, i) => {
    cartItemsContainer.classList.add("loading");

    cartItemsContainer.innerHTML = "";

    const itemsArray = cartData.items;

    /*
      Cart items are rendered by cloning the template DOMnode
      and removing the hidden class. Then data from the JSON array is used to fill in the template item.
    */
    itemsArray.forEach((item, i) => {
      const cartItem = cardItemTemplate.cloneNode(true);
      cartItem.querySelector(".cart__item-title").innerHTML =
        item.product_title;
      //data-id is used for updating the line item
      cartItem.dataset.id = item.variant_id;
      cartItem.classList.remove("hidden");
      cartItem
        .querySelector(".cart__item-img")
        .setAttribute("src", item.featured_image.url);
      const options = item.options_with_values;
      if (options.length > 0) {
        options.forEach((option, i) => {
          if (option.name != "Title") {
            const optionHtml = `
                  <span class="p-small">${option.name}</span>
                  <div class="option-badge">${option.value}</div>`;
            cartItem.querySelector(
              ".cart__item-options"
            ).innerHTML += optionHtml;
          }
        });
      }

      cartItem.querySelector(
        ".cart__item-quantity-input-btn.quantity-badge"
      ).value = item.quantity;

      const singlePriceWrap = cartItem.querySelector(
        ".cart__item-single-price"
      );

      if (item.original_price > item.discounted_price) {
        const discountedPriceHtml = `<span class="p-small">Price:</span>
        <span class="p-small price-old">${shopifyPriceToCurrency(
          item.original_price,
          "de-DE",
          cartData.currency
        )}</span>
        <span class="p-small price-new">${shopifyPriceToCurrency(
          item.discounted_price,
          "de-DE",
          cartData.currency
        )}</span>`;
        singlePriceWrap.innerHTML = discountedPriceHtml;
      } else {
        const regularPriceHtml = `<span class="p-small">Price:</span>
        <span class="p-small color-heading">${shopifyPriceToCurrency(
          item.price,
          "de-DE",
          cartData.currency
        )}</span>`;
        singlePriceWrap.innerHTML = regularPriceHtml;
      }

      cartItem.querySelector(
        ".cart__item-line-price"
      ).innerHTML = shopifyPriceToCurrency(
        item.line_price,
        "de-DE",
        cartData.currency
      );

      const itemStock = cartItem.querySelector(".cart__item-stock");
      const inStock = variantIsAvailable(item.handle, item.id);
      if (inStock) {
        itemStock.classList.add("cart__item-in-stock");
        itemStock.innerHTML = "In stock";
      } else {
        itemStock.classList.add("cart__item-out-stock");
        itemStock.innerHTML = "Out of stock";
      }

      cartItemsContainer.appendChild(cartItem);
    });

    //set the subtotal after rendering the line items;
    const subTotalWrappers = document.querySelectorAll(".cart__subtotal");

    subTotalWrappers.forEach((subTotal, i) => {
      subTotal.innerHTML = shopifyPriceToCurrency(
        cartData.total_price,
        "de-DE",
        cartData.currency
      );
    });

    cartBubble.innerHTML = cartData.item_count;
    cartItemsContainer.classList.remove("loading");
  });
}

function clearCart() {
  fetch("/cart/clear.js", {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      renderCartItems(data);
    });
}

//helper function: price should be in cents e.g. 4000
function shopifyPriceToCurrency(price, localeCode, currency) {
  return new Intl.NumberFormat(localeCode, {
    style: "currency",
    currency: currency,
  }).format(price / 100);
}

async function variantIsAvailable(productHandle, variant_id) {
  const product = fetch(`/products/${productHandle}.js`)
    .then((response) => response.json())
    .then((product) => {
      const variant = product.variants.find(
        (variant) => variant.id === variant_id
      );
      if (variant.available) {
        return true;
      } else {
        return false;
      }
    });
}

function getScreenSize(width) {
  if (width > 1536) {
    return "desktop-l";
  } else if (width > 1366) {
    return "desktop";
  } else if (width > 1024) {
    return "desktop-s";
  } else if (width > 768) {
    return "tablet";
  } else {
    return "phone";
  }
}
