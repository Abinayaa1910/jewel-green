// ✅ MAIN SCRIPT HANDLER
document.addEventListener("DOMContentLoaded", function () {
  // ---------------- LOAD NAVBAR & FOOTER ----------------
  fetch("component/navbar.html")
    .then(response => {
      if (!response.ok) throw new Error("Navbar not found");
      return response.text();
    })
    .then(data => {
      document.getElementById("navbar-placeholder").innerHTML = data;

      // ✅ Now DOM elements exist → setup dark mode and search
      setupDarkMode();
      setupSearchDropdown();
    })
    .catch(error => console.error("Error loading navbar:", error));

  fetch("component/footer.html")
    .then(res => res.text())
    .then(data => {
      const footerPlaceholder = document.getElementById("footer-placeholder");
      if (footerPlaceholder) footerPlaceholder.innerHTML = data;
    });

  // ---------------- TICKET TYPE LISTENER ----------------
  const typeSelect = document.getElementById("ticket-type");
  if (typeSelect) {
    typeSelect.addEventListener("change", updatePrices);
    updatePrices(); // Initial call
  }
});

function setupDarkMode() {
  const body = document.body;
  const toggleBtn = document.getElementById("toggle-dark");

  function setMode(mode) {
    body.classList.remove("manual-light", "manual-dark");

    const iconSun = toggleBtn?.querySelector(".icon-sun");
    const iconMoon = toggleBtn?.querySelector(".icon-moon");

    if (mode === "dark") {
      body.classList.add("dark-mode", "manual-dark");
    } else {
      body.classList.remove("dark-mode");
      body.classList.add("manual-light");
    }

    localStorage.setItem("theme", mode);
  }

  const savedMode = localStorage.getItem("theme");
  if (savedMode) {
    setMode(savedMode);
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setMode(prefersDark ? "dark" : "light");
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const isDark = body.classList.contains("dark-mode");
      setMode(isDark ? "light" : "dark");
    });
  }
}



function setupSearchDropdown() {
  const attractions = [
    "Canopy Park",
    "Changi Experience Studio",
    "Hedge Maze",
    "HSBC Rain Vortex",
    "Jewel-rassic Quest",
    "Mirror Maze",
    "Shiseido Forest Valley",
    "Walking Net"
  ].sort(); // must be sorted for binary search

  const links = {
    "canopy park": "canopy-park.html"
  };

  const searchIcon = document.querySelector(".search-icon");
  const dropdown = document.getElementById("search-dropdown");
  const dropdownInput = document.getElementById("dropdown-search-input");
  const dropdownResults = document.getElementById("dropdown-search-results");

  if (searchIcon && dropdown && dropdownInput && dropdownResults) {
    searchIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.style.display = "block";
      dropdownInput.value = "";
      dropdownResults.innerHTML = "";
      dropdownInput.focus();
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && e.target !== searchIcon) {
        dropdown.style.display = "none";
      }
    });

    dropdownInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const query = dropdownInput.value.trim().toLowerCase();
        if (links[query]) {
          window.location.href = links[query];
        }
      }
      if (e.key === "Escape") dropdown.style.display = "none";
    });

    dropdownInput.addEventListener("input", throttle(renderDropdownResults, 120));
    
    function renderDropdownResults() {
      const query = dropdownInput.value.trim().toLowerCase();
      dropdownResults.innerHTML = "";
      if (!query) return;

      let found = false;
      const results = attractions.filter(item => item.toLowerCase().includes(query));

      results.forEach((item) => {
        found = true;
        const itemLower = item.toLowerCase();
        const idx = itemLower.indexOf(query);
        const before = item.slice(0, idx);
        const match = item.slice(idx, idx + query.length);
        const after = item.slice(idx + query.length);

        const li = document.createElement("li");
        li.innerHTML = `${before}<strong>${match}</strong>${after}`;
        li.style.cursor = "pointer";

        li.addEventListener("click", () => {
          if (itemLower === "canopy park") {
            window.location.href = "canopy-park.html";
          } else {
            dropdownInput.value = item; // Optional: fill input with clicked value
          }
        });

        dropdownResults.appendChild(li);
      });

      if (!found) {
        const li = document.createElement("li");
        li.textContent = "No results found";
        li.className = "no-results";
        dropdownResults.appendChild(li);
      }
    }


    function throttle(fn, wait) {
      let timeout = null;
      return function (...args) {
        if (!timeout) {
          timeout = setTimeout(() => {
            fn.apply(this, args);
            timeout = null;
          }, wait);
        }
      };
    }

    function binarySearchMatch(arr, query) {
      let matches = [];
      let left = 0, right = arr.length - 1;

      while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        let value = arr[mid].toLowerCase();

        if (value.includes(query)) {
          // search neighbors too
          let i = mid;
          while (i >= 0 && arr[i].toLowerCase().includes(query)) {
            matches.unshift(arr[i--]);
          }
          i = mid + 1;
          while (i < arr.length && arr[i].toLowerCase().includes(query)) {
            matches.push(arr[i++]);
          }
          break;
        } else if (value < query) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      return matches;
    }
  }
}


// ---------------- CART LOGIC ----------------
const cart = [];

function goToStep2() {
  document.querySelector(".step-1").style.display = "none";
  document.querySelector(".step-2").style.display = "block";

  const form = document.getElementById("bundle2-form");
  if (!form) return;

  const date = form.querySelector("[name='visit-date']")?.value || "";
  const time = form.querySelector("[name='visit-time']")?.value || "";
  const adults = parseInt(form.querySelector("[name='adultQty']")?.value || "0");
  const children = parseInt(form.querySelector("[name='childQty']")?.value || "0");
  const seniors = parseInt(form.querySelector("[name='seniorQty']")?.value || "0");

  let type = document.getElementById("ticket-type")?.value || "";
  if (type === "local") type = "resident"; // normalize

  const prices = {
    standard: { adult: 54, child: 39, senior: 0 },
    resident: { adult: 11.9, child: 8.9, senior: 8.9 },
  };

  const selectedPrices = prices[type];
  if (!selectedPrices) return;

  const price =
    adults * selectedPrices.adult +
    children * selectedPrices.child +
    seniors * selectedPrices.senior;

  cart.push({
    attraction: "Canopy Park",
    bundle: "Bundle 2",
    date,
    time,
    qty: `${adults} Adult(s), ${children} Child(ren), ${seniors} Senior(s)`,
    price,
  });

  updateCart();
}

function updateCart() {
  const list = document.getElementById("cart-list");
  if (!list) return;

  list.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.qty} × ${item.bundle} @ ${item.attraction} – ${item.time}`;
    list.appendChild(li);
    total += item.price;
  });

  const totalText = document.getElementById("total-price");
  if (totalText) {
    totalText.textContent = `Total: SGD ${total.toFixed(2)}`;
  }
}

function checkoutCart() {
  alert("Proceeding to payment with " + cart.length + " item(s).");
}

function adjustQtyBuy(id, change) {
  const el = document.getElementById(id);
  let val = parseInt(el.innerText);
  val = Math.max(0, val + change);
  el.innerText = val;

  const parentId = id.substring(0, id.lastIndexOf("-"));
  validate(parentId);
}

function updatePrices() {
  const typeRaw = document.getElementById("ticket-type")?.value;
  const type = typeRaw === "local" ? "resident" : typeRaw;

  const adult = document.getElementById("adult-price");
  const child = document.getElementById("child-price");

  if (!type || !adult || !child) return;

  if (type === "standard") {
    adult.textContent = "SGD 54.00";
    child.textContent = "SGD 39.00";
  } else if (type === "resident") {
    adult.textContent = "SGD 13.90";
    child.textContent = "SGD 11.90";
  } else {
    adult.textContent = "SGD -";
    child.textContent = "SGD -";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // ✅ Step 1: Restrict past dates
  const today = new Date().toISOString().split("T")[0];
  document.querySelectorAll("input[type='date']").forEach(input => {
    input.setAttribute("min", today);
  });

  // ✅ Step 2 & 3: Only run this block if we're on the add-ons.html page
  if (document.getElementById("addons-container")) {
    renderAll();

    const storedTicket = localStorage.getItem("buyTicketSelection");
    if (storedTicket) {
      const ticket = JSON.parse(storedTicket);
      const type = ticket.ticketType === "local" ? "resident" : ticket.ticketType;
      const prices = priceMap[type]?.[ticket.bundle];

      if (prices) {
        const totalPrice = (
          ticket.adultQty * prices.adult +
          ticket.childQty * prices.child +
          ticket.seniorQty * (prices.senior || 0)
        ).toFixed(2);


        const parts = [];
        if (ticket.adultQty > 0) parts.push(`<strong>${ticket.adultQty} Adult</strong>`);
        if (ticket.childQty > 0) parts.push(`<strong>${ticket.childQty} Child</strong>`);
        if (ticket.seniorQty > 0) parts.push(`<strong>${ticket.seniorQty} Senior</strong>`);

        const [yyyy, mm, dd] = ticket.visitDate.split("-");
        const formattedDate = `${dd}-${mm}-${yyyy}`;

        const li = document.createElement("li");
        li.innerHTML = `<strong>${ticket.bundle}</strong> – ${parts.join(', ')} – ${formattedDate} @ ${ticket.visitTime} – <strong>SGD ${totalPrice}</strong>`;

        document.getElementById("cart-items").appendChild(li);

        count++;
        total += parseFloat(totalPrice);
        document.getElementById("cart-count").innerText = count;
        document.getElementById("cart-total").innerText = `SGD ${total}`;
      }

      localStorage.removeItem("buyTicketSelection");
    }
  }

  // ✅ Step 4: Update price when ticket type is selected
  const typeSelect = document.getElementById("ticket-type");
  if (typeSelect) {
    typeSelect.addEventListener("change", updatePrices);
    updatePrices();
  }
});


const priceMap = {
  standard: {
    "Bundle Deal 1": { adult: 39, child: 29 },
    "Bundle Deal 2": { adult: 54, child: 39 },
    "Bundle Deal 3": { adult: 56, child: 40 },
    "Bundle Deal 4": { adult: 71, child: 50 },
    "Mirror Maze": { adult: 12, child: 10 },
    "Hedge Maze": { adult: 10, child: 8 },
    "Jewel-rassic Quest": { adult: 20, child: 15 },
    "Canopy Bridge": { adult: 8, child: 5 },
    "Walking Net": { adult: 10, child: 8 },
    "Bouncing Net": { adult: 14, child: 12 }
  },
  resident: {
    "Bundle Deal 1": { adult: 32, child: 22 },
    "Bundle Deal 2": { adult: 46, child: 31 },
    "Bundle Deal 3": { adult: 49, child: 33 },
    "Bundle Deal 4": { adult: 63, child: 43 },
    "Mirror Maze": { adult: 10, child: 8 },
    "Hedge Maze": { adult: 8, child: 6 },
    "Jewel-rassic Quest": { adult: 18, child: 15 },
    "Canopy Bridge": { adult: 6, child: 5 },
    "Walking Net": { adult: 8, child: 5 },
    "Bouncing Net": { adult: 12, child: 10 }
  }
};

const bundles = [
  {
    name: "Bundle Deal 1",
    description: `
      <ul>
        <li>Canopy Park (Incl. Discovery Slides#, Foggy Bowls, Petal Garden, Topiary Walk)</li>
        <li>Mastercard® Canopy Bridge</li>
        <li>Hedge Maze</li>
        <li>Mirror Maze</li>
        <li>Walking Net#</li>
      </ul>
      <p><strong>Standard Rate:</strong> Adult SGD 39 | Child SGD 29<br>
      Child: 3 - 12 years old. All child ticket holders must be accompanied by a paying adult.<br>
      # Minimum height requirement is 110cm.<br>
      <strong>**Applicable to both local student and senior.</strong></p>
    `
  },
  {
    name: "Bundle Deal 2",
    description: `
      <ul>
        <li>Canopy Park (Incl. Discovery Slides#, Foggy Bowls, Petal Garden, Topiary Walk)</li>
        <li>Mastercard® Canopy Bridge</li>
        <li>Hedge Maze</li>
        <li>Mirror Maze</li>
        <li>Walking Net#</li>
        <li>Bouncing Net^#</li>
      </ul>
      <p><strong>Standard Rate:</strong> Adult SGD 54 | Child SGD 39<br>
      ^ Rates are valid for one 45-min session inclusive of a compulsory safety briefing of estimated 10 mins.<br>
      Child: 3 - 12 years old. All child ticket holders must be accompanied by a paying adult.<br>
      # Minimum height requirement is 110cm.<br>
      <strong>**Applicable to both local student and senior.</strong></p>
    `
  },
  {
    name: "Bundle Deal 3",
    description: `
      <ul>
        <li>Changi Experience Studio+</li>
        <li>Canopy Park (Incl. Discovery Slides#, Foggy Bowls, Petal Garden, Topiary Walk)</li>
        <li>Mastercard® Canopy Bridge</li>
        <li>Hedge Maze</li>
        <li>Mirror Maze</li>
        <li>Walking Net#</li>
      </ul>
      <p><strong>Standard Rate:</strong> Adult SGD 56 | Child SGD 40<br>
      + Attraction is suitable for children aged 6 and above.<br>
      Changi Experience Studio opens from 11am to 8pm with last admission at 7pm.<br>
      Child: 3 - 12 years old. All child ticket holders must be accompanied by a paying adult.<br>
      # Minimum height requirement is 110cm.<br>
      <strong>**Applicable to both local student and senior.</strong></p>
    `
  },
  {
    name: "Bundle Deal 4",
    description: `
      <ul>
        <li>Changi Experience Studio+</li>
        <li>Canopy Park (Incl. Discovery Slides#, Foggy Bowls, Petal Garden, Topiary Walk)</li>
        <li>Mastercard® Canopy Bridge</li>
        <li>Hedge Maze</li>
        <li>Mirror Maze</li>
        <li>Walking Net#</li>
        <li>Bouncing Net^#</li>
      </ul>
      <p><strong>Standard Rate:</strong> Adult SGD 71 | Child SGD 50<br>
      + Attraction is suitable for children aged 6 and above.<br>
      ^ Rates are valid for one 45-min session inclusive of a compulsory safety briefing of estimated 10 mins.<br>
      Changi Experience Studio opens from 11am to 8pm with last admission at 7pm.<br>
      Child: 3 - 12 years old. All child ticket holders must be accompanied by a paying adult.<br>
      # Minimum height requirement is 110cm.<br>
      <strong>**Applicable to both local student and senior.</strong></p>
    `
  }
];

const alaCarte = [
  { name: "Mirror Maze", desc: "Single entry to the maze of illusions." },
  { name: "Hedge Maze", desc: "Classic greenery maze experience." },
  { name: "Jewel-rassic Quest", desc: "AR Dino Quest with 90-min playtime and refundable deposit." },
  { name: "Canopy Bridge", desc: "Suspended bridge with glass flooring and mist effects." },
  { name: "Walking Net", desc: "Suspended net walking experience above Canopy Park." },
  { name: "Bouncing Net", desc: "High-bounce sky net adventure with safety rules." }
];

let total = 0;
let count = 0;

function renderAll() {
  const container = document.getElementById("addons-container");
  let html = "";
  bundles.forEach((b, i) => html += generateCard(b, i, true));
  alaCarte.forEach((a, i) => html += generateCard(a, i, false));
  if (container) container.innerHTML = html;
  
  // ✅ Apply today's date as min after rendering
  const today = new Date().toISOString().split("T")[0];
  document.querySelectorAll("input[type='date']").forEach(input => {
    input.setAttribute("min", today);
  });
}

function generateCard(item, i, isBundle) {
  const id = (isBundle ? "bundle" : "ala") + i;
  const name = item.name;

  return `
  <div class="card" id="${id}-card">
    <div class="card-header">
      <h3>${name}</h3>
      <button class="select-btn" onclick="showForm('${id}')">Select</button>
    </div>
    <p class="view-toggle" onclick="toggleDetails('${id}-desc')">View Details & Inclusions <i class="fa fa-chevron-down"></i></p>
    <div class="description-box" id="${id}-desc" style="display:none;">${item.description || `<p>${item.desc}</p>`}</div>

    <div class="ticket-form" id="${id}-form" style="display:none;">
      <label>Ticket Type
        <select id="${id}-type" onchange="updatePricesAddOn('${name}', '${id}')">
          <option value="">-- Select Ticket Type --</option>
          <option value="standard">Standard</option>
          <option value="resident">Singapore Resident</option>
        </select>
      </label>

      <label>Date <input type="date" id="${id}-date" onchange="validate('${id}')"></label>

      <label>Time
        <select id="${id}-time" onchange="validate('${id}')">
          <option value="">-- Choose Time --</option>
          <option>10:00 AM</option><option>11:00 AM</option><option>12:00 PM</option>
          <option>01:00 PM</option><option>02:00 PM</option><option>03:00 PM</option>
        </select>
      </label>

      <div class="quantity">
        <div>
          <label>Adult <span id="${id}-adult-price">SGD -</span></label>
          <div class="quantity-input">
            <button onclick="adjustQtyAddOn('${id}-adult', -1)">–</button>
            <span id="${id}-adult">1</span>
            <button onclick="adjustQtyAddOn('${id}-adult', 1)">+</button>
          </div>
        </div>
        <div>
          <label>Child <span id="${id}-child-price">SGD -</span></label>
          <div class="quantity-input">
            <button onclick="adjustQtyAddOn('${id}-child', -1)">–</button>
            <span id="${id}-child">0</span>
            <button onclick="adjustQtyAddOn('${id}-child', 1)">+</button>
          </div>
        </div>
      </div>

      <button class="confirm-btn" id="${id}-confirm" onclick="addToCart('${name}', '${id}')" disabled>Confirm</button>
    </div>
  </div>`;
}

function showForm(id) {
  const form = document.getElementById(`${id}-form`);
  form.style.display = form.style.display === "none" ? "block" : "none";
}

function toggleDetails(id) {
  const el = document.getElementById(id);
  el.style.display = el.style.display === "none" ? "block" : "none";
}

function addToCart(name, id) {
  const typeRaw = document.getElementById(`${id}-type`).value;
  const type = typeRaw === "local" ? "resident" : typeRaw;
  const prices = priceMap[type]?.[name];
  const adult = parseInt(document.getElementById(`${id}-adult`).innerText);
  const child = parseInt(document.getElementById(`${id}-child`).innerText);
  const totalPrice = (adult * prices.adult + child * prices.child).toFixed(2);

  const dateRaw = document.getElementById(`${id}-date`).value;
  const timeRaw = document.getElementById(`${id}-time`).value;
  const [yyyy, mm, dd] = dateRaw.split("-");
  const formattedDate = `${dd}-${mm}-${yyyy}`;

  const li = document.createElement("li");
  const parts = [];
  if (adult > 0) parts.push(`<strong>${adult} Adult</strong>`);
  if (child > 0) parts.push(`<strong>${child} Child</strong>`);

  li.innerHTML = `<strong>${name}</strong> – ${parts.join(', ')} – ${formattedDate} @ ${timeRaw} – <strong>SGD ${totalPrice}</strong>`;

  document.getElementById("cart-items").appendChild(li);

  count++;
  total += parseFloat(totalPrice);
  document.getElementById("cart-count").innerText = count;
  document.getElementById("cart-total").innerText = `SGD ${total.toFixed(2)}`;
}

function validate(id) {
  const type = document.getElementById(`${id}-type`)?.value;
  const date = document.getElementById(`${id}-date`)?.value;
  const time = document.getElementById(`${id}-time`)?.value;

  const confirmBtn = document.getElementById(`${id}-confirm`);
  if (!confirmBtn) return;

  if (type && date && time) {
    confirmBtn.disabled = false;
  } else {
    confirmBtn.disabled = true;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("bundle-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const ticketType = document.getElementById("ticket-type").value;
      const visitDate = document.getElementById("visit-date").value;
      const visitTime = document.getElementById("visit-time").value;
      const heightChecked = document.getElementById("height-check").checked;

      const errorMsg = document.getElementById("form-error");
      if (!ticketType || !visitDate || !visitTime || !heightChecked) {
        errorMsg.textContent = "❌ Please fill in all required fields before continuing.";
      } else {
        errorMsg.textContent = "";
        window.location.href = "add-ons.html";

        const ticketSelection = {
          attraction: "Canopy Park",
          bundle: "Bundle Deal 2",
          ticketType: ticketType,
          visitDate: visitDate,
          visitTime: visitTime,
          adultQty: parseInt(document.getElementById("adultQty").value),
          childQty: parseInt(document.getElementById("childQty").value),
          seniorQty: parseInt(document.getElementById("seniorQty")?.value || "0")
        };
        localStorage.setItem("buyTicketSelection", JSON.stringify(ticketSelection));        
      }
    });
  }

})

function adjustQtyBuy(id, change) {
  const el = document.getElementById(id);
  let val = parseInt(el.value);
  val = isNaN(val) ? 0 : Math.max(0, val + change);
  el.value = val;

  const parentId = id.substring(0, id.lastIndexOf("-"));
  validate(parentId);
}


function updatePricesAddOn(name, id) {
  const typeRaw = document.getElementById(`${id}-type`)?.value;
  const type = typeRaw === "local" ? "resident" : typeRaw;

  const priceData = priceMap[type]?.[name];
  if (!priceData) return;

  const adultSpan = document.getElementById(`${id}-adult-price`);
  const childSpan = document.getElementById(`${id}-child-price`);

  if (adultSpan) adultSpan.textContent = `SGD ${priceData.adult.toFixed(2)}`;
  if (childSpan) childSpan.textContent = `SGD ${priceData.child.toFixed(2)}`;
}
function adjustQtyAddOn(id, change) {
  const el = document.getElementById(id);
  let val = parseInt(el.innerText);
  val = isNaN(val) ? 0 : Math.max(0, val + change);
  el.innerText = val;

  const parentId = id.substring(0, id.lastIndexOf("-"));
  validate(parentId);
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => {
        console.log('✅ Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.error('❌ Service Worker registration failed:', err);
      });
  });
}
