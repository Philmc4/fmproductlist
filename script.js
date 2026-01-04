const dessertGrid = document.getElementById("dessert-grid-container");
const cartItemsContainer = document.getElementById("cart-container");
const cartNumber = document.getElementById("cart-number-items");
const emptyCartImage = document.getElementById("empty-cart-image");
const emptyCartText = document.getElementById("empty-cart-text");
const cartContent = document.getElementById("cart-content");
const orderConfirmContainer = document.getElementById("order-confirm-cont");
const cartTotalAmount = document.getElementById("total-amount");
const confirmOrderContainer = document.getElementById(
  "confirm-order-container"
);
const confirmOrderBtn = document.getElementById("confirm-btn");

const confirmationItems = document.getElementById(
  "confirmation-items-container"
);

let cart = [];
let productsData = [];

const fetchData = async () => {
  try {
    const response = await fetch("./data.json");
    if (!response.ok) {
      throw new Error("Network response was not OK");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};

const renderProducts = (data) => {
  productsData = data;

  data.forEach((item) => {
    const productCard = document.createElement("div");
    productCard.className = "dessert-item-container";
    productCard.innerHTML = `
      <div class="dessert-image-container">
        <img
          src="${item.image.desktop}"
          alt="${item.name}"
          class="dessert-image-desktop product-image"     
          height="240"
          width="250"
        />
        <img
          src="${item.image.tablet}"                 
          alt="${item.name}"
          class="dessert-image-tablet product-image"
          height="212"
          width="213"
          />
        <img
          src="${item.image.mobile}"
          alt="${item.name}"
          class="dessert-image-mobile product-image"
          height="212"
          width="327"
        />
        <button class="btn-1 text-4-bold add-to-cart-button">
        <img
          src="./images/icon-add-to-cart.svg"
          alt=""
          class="btn-image"
          height="20"
          width="20"
        />
        Add to Cart               
        </button>
        <button class="btn-2 text-4-bold quantity-button hidden">
          <ion-icon name="remove-circle-outline" class="minus-icon"></ion-icon>
          <p class="text-4-bold-quantity-btn item-quantity-total"></p>
          <ion-icon
          name="add-circle-outline"
          class="plus-icon"></ion-icon>
        </button>
        </div>
        <div class="dessert-content-container">
          <p class="text-4-regular">${item.category}</p>
          <p class="text-3 product-name">${item.name}</p>
          <p class="text-3-price">$${item.price.toFixed(2)}</p>
        </div>
    `;

    const addToCartButton = productCard.querySelector(".add-to-cart-button");
    const incrementBtn = productCard.querySelector(".plus-icon");
    const decrementBtn = productCard.querySelector(".minus-icon");

    addToCartButton.addEventListener("click", () => {
      addToCart(item);
      orderConfirmContainer.classList.remove("hidden");
    });

    incrementBtn.addEventListener("click", () => {
      addToCart(item);
    });
    decrementBtn.addEventListener("click", () => {
      removeFromCart(item.name);
    });

    dessertGrid.appendChild(productCard);
  });
};

const addToCart = (product) => {
  cart.push(product);
  updateCartUI();
  updateProductButton(product.name);
};

const removeFromCart = (productName) => {
  const index = cart.findIndex((item) => item.name === productName);
  if (index !== -1) {
    cart.splice(index, 1);
    updateCartUI();
    updateProductButton(productName);
  }
};

const removeAllFromCart = (productName) => {
  cart = cart.filter((item) => item.name !== productName);
  updateCartUI();
  updateProductButton(productName);
};

const updateProductButton = (productName) => {
  // find the product card
  const productCard = Array.from(
    document.querySelectorAll(".dessert-item-container")
  ).find(
    (card) => card.querySelector(".product-name").textContent === productName
  );

  if (!productCard) return;

  // get button elements
  const addBtn = productCard.querySelector(".add-to-cart-button");
  const addedBtn = productCard.querySelector(".quantity-button");
  const quantityDisplay = addedBtn.querySelector(".item-quantity-total");
  // const productImage = productCard.querySelector(".product-image");

  const quantity = cart.filter((item) => item.name === productName).length;

  // update button on display based on quantity
  if (quantity > 0) {
    addBtn.style.display = "none";
    addedBtn.classList.remove("hidden");
    quantityDisplay.textContent = quantity;
  } else {
    addedBtn.classList.add("hidden");
    addBtn.style.display = "flex";
  }
};

const updateCartUI = () => {
  cartContent.innerHTML = "";
  const totalItems = cart.length;
  cartNumber.textContent = totalItems;

  // Show empty state if cart is empty
  if (cart.length === 0) {
    orderConfirmContainer.classList.add("hidden");
    cartContent.innerHTML = `
          <img
            src="./images/illustration-empty-cart.svg"
            alt=""
            class="empty-cart-img"
            id="empty-cart-image"
          />
          <p class="text-4-bold" id="empty-cart-text">
            Your added items will appear here
          </p>`;
    return;
  }

  let total = 0;

  const groupedItems = cart.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = {
        ...item,
        quantity: 0,
      };
    }
    acc[item.name].quantity++;
    return acc;
  }, {});

  Object.values(groupedItems).forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
    <div class="cart-item-info">
      <div class="cart-item-price-container">
        <h3 class="text-4-bold">${item.name}</h3>
        <div class="cart-number-information">
          <p class="text-4-bold-quantity">${item.quantity}x</p>
          <p class="text-4-regular">@ $${item.price.toFixed(2)}</p>
          <p class="text-4-bold">$${itemTotal.toFixed(2)}</p>
        </div>
      </div>
      <ion-icon
        name="close-circle-outline"
        class="cart-icon-circle remove-btn"
      ></ion-icon>
    </div>
    `;
    const removeButton = cartItem.querySelector(".remove-btn");
    removeButton.addEventListener("click", () => {
      removeAllFromCart(item.name);
    });

    cartContent.appendChild(cartItem);
  });

  cartTotalAmount.textContent = `$${total.toFixed(2)}`;
};

// order confirmation modal
const showConfirmationModal = () => {
  // Check if cart is empty
  if (cart.length === 0) {
    alert(
      "Your cart is empty. Please add some products before confirming your order."
    );
    return;
  }

  let total = 0;

  // Group items by name
  const groupedItems = cart.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = {
        ...item,
        quantity: 0,
      };
    }
    acc[item.name].quantity++;
    return acc;
  }, {});

  // Build items HTML
  let itemsHTML = "";
  Object.values(groupedItems).forEach((item) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    itemsHTML += `
    <div class="confirmed-items-list-container">
        <div class="confirmed-items-ordered">
          <div class="confirmed-order-left">
            <img
              src="${item.image.thumbnail}"
              alt=""
              class="confirm-order-item-image"
            />
            <div class="confirm-order-item-details">
              <p class="text-4-bold">${item.name}</p>
              <div class="confirm-order-item-price">
                <p class="text-4-bold-quantity">${item.quantity}x</p>
                <p class="text-4-regular">@ $${item.price.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <p class="text-3">$${itemTotal.toFixed(2)}</p>
        </div>
    </div>
        `;
  });

  // Create modal content
  confirmationItems.innerHTML = `
        <div class="confirmation-message">
          <img
            src="./images/icon-order-confirmed.svg"
            alt=""
            class="confirmed"
          />
          <div class="confirmation-message-confirmed">
            <p class="text-1">Order Confirmed</p>
            <p class="text-4-regular">We hope you enjoy your food!</p>
          </div>
        </div>
        <div class="confirm-items">
          ${itemsHTML}
          <div class="confirmed-order-total">
            <p class="text-4-total">Order Total</p>
            <p class="text-2-total">$${total.toFixed(2)}</p>
          </div>
        </div>
        <button class="btn-3" id="new-order-btn">Start New Order</button>
    `;

  confirmOrderContainer.classList.remove("hidden");

  const newOrderBtn = document.getElementById("new-order-btn");
  newOrderBtn.addEventListener("click", () => {
    closeConfirmationModal();
    resetCart();
  });
};

const closeConfirmationModal = () => {
  confirmOrderContainer.classList.add("hidden");
};

const resetCart = () => {
  cart = [];
  updateCartUI();
  productsData.forEach((product) => {
    updateProductButton(product.name);
  });
};

confirmOrderBtn.addEventListener("click", showConfirmationModal);

confirmOrderContainer.addEventListener("click", (e) => {
  if (e.target === confirmOrderContainer) {
    closeConfirmationModal();
  }
});

fetchData().then((data) => {
  if (data.length > 0) {
    renderProducts(data);
  }
});
