async function loadComponent(id, file) {
    try {
        const res = await fetch(file);

        if (!res.ok) {
            throw new Error(`Erreur de chargement: ${file}`);
        }

        const html = await res.text();

        const element = document.getElementById(id);

        if (!element) {
            throw new Error(`Element #${id} introuvable`);
        }

        element.innerHTML = html;

    } catch (error) {
        console.error(error);
    }
}

const components = [
    { id: "header", file: "partials/header.html" },
    { id: "footer", file: "partials/footer.html" }
];


function updatePageTitle() {
    const baseTitle = "Dynasty 8 Agency";

    const pageNames = {
        "index.html": "Accueil",
        "catalogue.html": "Catalogue",
        "about.html": "À propos",
        "contact.html": "Contact",
        "se-connecter.html": "Se connecter"
    };

    const currentPage = window.location.pathname.split("/").pop();

    if (pageNames[currentPage]) {
        document.title = `${baseTitle} | ${pageNames[currentPage]}`;
    } else {
        document.title = baseTitle;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updatePageTitle();
    components.forEach(c => loadComponent(c.id, c.file));
});

function highlightCurrentNavLink() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    document.querySelectorAll(".nav a").forEach(link => {
        const linkHref = link.getAttribute("href").split("/").pop();

        if (linkHref === currentPage) {
            link.classList.add("active");
        }
    });
}


function filterItems() {
    const category = document.getElementById("categoryFilter").value;
    const maxBudget = document.getElementById("maxBudget").value;
    const type = document.getElementById("sortOptions").value;
    const search = document.getElementById("searchInput").value.toLowerCase();

    let items = Array.from(document.querySelectorAll(".card"));

    items.forEach(item => {
        const itemCategory = item.dataset.category;
        const itemPrice = parseInt(item.dataset.price);
        const itemType = item.dataset.type;
        const itemText = item.textContent.toLowerCase();

        let isVisible = true;

        // Catégorie (Une ou plusieure)
        if (category && !itemCategory.includes(category)) {
            isVisible = false;
        }

        // Budget max
        if (maxBudget && itemPrice > parseInt(maxBudget)) {
            isVisible = false;
        }

        // Type (Achat et/ou Location)
        if (type && !itemType.includes(type)) {
            isVisible = false;
        }

        // Recherche texte
        if (search && !itemText.includes(search)) {
            isVisible = false;
        }

        item.style.display = isVisible ? "block" : "none";
    });
    updateVisiblePrices();
}

const filters = document.querySelectorAll(
    "#categoryFilter, #maxBudget, #sortOptions, #searchInput"
);

if (filters.length > 0) {
    filters.forEach(el => {
        el.addEventListener("input", filterItems);
        el.addEventListener("change", filterItems);
    });
}

function sortItemsByPrice() {
    const sortValue = document.getElementById("sortPrice").value;
    const container = document.querySelector(".catalogue");
    const items = Array.from(document.querySelectorAll(".card"));

    items.sort((a, b) => {
        const priceA = parseInt(a.dataset.price);
        const priceB = parseInt(b.dataset.price);

        return sortValue === "ASC" ? priceA - priceB : priceB - priceA;
    });

    items.forEach(item => container.appendChild(item));
}

const sortPrice = document.getElementById("sortPrice");

if (sortPrice) {
    sortPrice.addEventListener("change", () => {
        sortItemsByPrice();
        filterItems();
    });
}

function updateVisiblePrices() {
    const type = document.getElementById("sortOptions").value;
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const purchasePrice = card.querySelector(".purchase-price");
        const rentalPrice = card.querySelector(".rental-price");

        // reset de base
        if (purchasePrice) purchasePrice.style.display = "block";
        if (rentalPrice) rentalPrice.style.display = "block";

        // filtre Achat
        if (type === "Achat") {
            if (rentalPrice) rentalPrice.style.display = "none";
        }

        // filtre Location
        if (type === "Location") {
            if (purchasePrice) purchasePrice.style.display = "none";
        }
    });
}

function setupCardModal() {
    const modal = document.getElementById("propertyModal");
    const modalContent = document.getElementById("modalContent");
    const cards = document.querySelectorAll(".card");

    if (!modal || !modalContent || cards.length === 0) return;

    cards.forEach(card => {
        card.addEventListener("click", () => {

            const images = card.dataset.images
                ? card.dataset.images.split(",")
                : [card.querySelector("img").src];

            let currentIndex = 0;
            const hasMultipleImages = images.length > 1;

            modalContent.innerHTML = `
                <div class="card modal-card">
                    <div class="carousel">
                        ${
                            hasMultipleImages
                            ? `<button class="prev">❮</button>`
                            : ""
                        }

                        <img src="${images[0]}" class="carousel-image">

                        ${
                            hasMultipleImages
                            ? `<button class="next">❯</button>`
                            : ""
                        }
                    </div>

                    ${card.querySelector(".card-content").outerHTML}
                </div>
            `;

            modal.style.display = "flex";

            if (hasMultipleImages) {
                const img = modalContent.querySelector(".carousel-image");
                const nextBtn = modalContent.querySelector(".next");
                const prevBtn = modalContent.querySelector(".prev");

                nextBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    currentIndex = (currentIndex + 1) % images.length;
                    img.src = images[currentIndex];
                });

                prevBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    currentIndex = (currentIndex - 1 + images.length) % images.length;
                    img.src = images[currentIndex];
                });
            }
        });
    });

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
            modalContent.innerHTML = "";
        }
    });
}

function renderProperties(items = properties) {
    
    const catalogue = document.querySelector(".catalogue");

    catalogue.innerHTML = items.map(property => {

        return `
            <div 
                class="card"
                data-category="${property.category.join(",")}"
                data-price="${property.price}"
                data-type="${property.type.join(",")}"
                ${property.images ? `data-images="${property.images.join(",")}"` : ""}
            >

                <img src="${property.image}" alt="${property.title}">

                <div class="card-content">

                    <h3>${property.title}</h3>

                    ${property.purchasePrice ? `
                        <p class="price purchase-price">
                            Prix d'achat: $${property.purchasePrice}
                        </p>
                    ` : ""}

                    ${property.rentalPrice ? `
                        <p class="price rental-price">
                            Prix à la location: $${property.rentalPrice} par semaine
                        </p>
                    ` : ""}

                    ${(property.storage || property.vip) ? `
                        <div class="card-extra">

                            ${property.storage ? `
                                <span>📦 Coffre de ${property.storage}</span>
                            ` : ""}

                            ${property.vip ? `
                                <span>💎 Achat réservé au ${property.vip}</span>
                            ` : ""}

                        </div>
                    ` : ""}

                </div>

            </div>
        `;

    }).join("");
}


document.addEventListener("DOMContentLoaded", async () => {
    updatePageTitle();

    await Promise.all(
        components.map(c => loadComponent(c.id, c.file))
    );

    highlightCurrentNavLink();

    if (document.querySelector(".catalogue")) {
        renderProperties();
        sortItemsByPrice();

        setupCardModal();
        updateVisiblePrices();
    }
});