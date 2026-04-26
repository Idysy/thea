/* ============================================
   Théa Aloe Care & Wellness | Main JavaScript
   ============================================ */

const WHATSAPP_NUMBER = '221773823973';

const WHATSAPP_PRESET_MESSAGE =
  "Bonjour Théa, je vous contacte au sujet de Théa Aloe Care & Wellness (produits Aloe Vera et bien-être). Merci de me revenir.";

function initWhatsAppPresetLinks() {
  const encoded = encodeURIComponent(WHATSAPP_PRESET_MESSAGE);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
  document.querySelectorAll('[data-wa-preset]').forEach((el) => {
    el.setAttribute('href', url);
    if (el.tagName === 'A') el.setAttribute('target', '_blank');
    if (el.tagName === 'A') el.setAttribute('rel', 'noopener noreferrer');
  });
}

// ============================================
// CART
// ============================================

const CART_KEY = 'thea_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  updateCartBadge();
  showToast(`${product.name} a été ajouté au panier.`);
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  updateCartBadge();
  renderCart();
}

function updateQty(productId, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === productId);
  if (item) {
    item.qty = Math.max(1, (item.qty || 1) + delta);
    saveCart(cart);
    renderCart();
    updateCartBadge();
  }
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + (item.qty || 1), 0);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge) {
    const count = getCartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const emptyMsg = document.getElementById('cart-empty');
  const summarySection = document.getElementById('cart-summary');
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = '';
    if (emptyMsg) emptyMsg.style.display = 'block';
    if (summarySection) summarySection.style.display = 'none';
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';
  if (summarySection) summarySection.style.display = 'block';

  container.innerHTML = cart
    .map((item) => {
      const img = item.image
        ? `<img src="${escapeHtml(item.image)}" alt="" class="cart-item-img" width="72" height="72" loading="lazy" />`
        : `<div class="cart-item-img d-flex align-items-center justify-content-center bg-light"><i class="bi bi-image text-muted"></i></div>`;
      return `
    <div class="cart-item fade-in-up" id="cart-item-${escapeHtml(item.id)}">
      ${img}
      <div class="flex-grow-1" style="min-width:0">
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        <div class="cart-item-price">${(item.price * (item.qty || 1)).toLocaleString('fr-SN')} FCFA</div>
        <div class="qty-control">
          <button type="button" class="qty-btn" aria-label="Diminuer" onclick="updateQty('${escapeHtml(item.id)}', -1)">−</button>
          <span class="qty-val">${item.qty || 1}</span>
          <button type="button" class="qty-btn" aria-label="Augmenter" onclick="updateQty('${escapeHtml(item.id)}', +1)">+</button>
        </div>
      </div>
      <button type="button" class="cart-remove-btn" onclick="removeFromCart('${escapeHtml(item.id)}')" aria-label="Retirer du panier"><i class="bi bi-trash3"></i></button>
    </div>`;
    })
    .join('');

  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = `${getCartTotal().toLocaleString('fr-SN')} FCFA`;

  const itemsCountEl = document.getElementById('cart-items-count');
  if (itemsCountEl) itemsCountEl.textContent = `${getCartCount()} article(s)`;
}

function renderCheckoutSummary() {
  const container = document.getElementById('checkout-summary');
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = "<p class='text-muted mb-0'>Votre panier est vide.</p>";
    return;
  }

  container.innerHTML =
    cart
      .map(
        (item) => `
    <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
      <div>
        <span>${escapeHtml(item.name)}</span>
        <small class="text-muted d-block">Qté : ${item.qty || 1}</small>
      </div>
      <strong>${(item.price * (item.qty || 1)).toLocaleString('fr-SN')} FCFA</strong>
    </div>`
      )
      .join('') +
    `
    <div class="d-flex justify-content-between mt-3 pt-2">
      <strong style="font-size:1.05rem">Total</strong>
      <strong style="color:var(--green-dark);font-size:1.2rem">${getCartTotal().toLocaleString('fr-SN')} FCFA</strong>
    </div>`;
}

// ============================================
// WHATSAPP MESSAGES
// ============================================

function generateOrderMessage() {
  const cart = getCart();
  if (cart.length === 0) return '';

  const name = document.getElementById('customer-name')?.value.trim() || 'Client';
  const address = document.getElementById('customer-address')?.value.trim() || 'À définir';
  const phone = document.getElementById('customer-phone')?.value.trim() || '';

  let msg = `Commande — Théa Aloe Care & Wellness\n\n`;
  msg += `Nom : ${name}\n`;
  msg += `Téléphone : ${phone}\n`;
  msg += `Adresse de livraison : ${address}\n\n`;
  msg += `Produits :\n`;

  cart.forEach((item) => {
    msg += `• ${item.name} × ${item.qty || 1} — ${(item.price * (item.qty || 1)).toLocaleString('fr-SN')} FCFA\n`;
  });

  msg += `\nTotal : ${getCartTotal().toLocaleString('fr-SN')} FCFA\n`;
  msg += `\nMerci pour votre confiance.`;

  return encodeURIComponent(msg);
}

function generateJoinMessage() {
  const level = document.getElementById('interest-level')?.value || 'non précisé';
  const name = document.getElementById('sponsor-name')?.value?.trim() || 'Futur revendeur';

  let msg = `Opportunité Théa Aloe Care & Wellness\n\n`;
  msg += `Nom : ${name}\n`;
  msg += `Niveau d'intérêt : ${level}\n\n`;
  msg += `Je souhaite en savoir plus sur l'activité de revente et l'accompagnement proposé. Merci de me recontacter.`;

  return encodeURIComponent(msg);
}

function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

// ============================================
// PRODUCTS
// ============================================

const PRODUCTS = [
  // ==================== SOINS DE LA PEAU (SKINCARE) ====================
  {
    id: 'aloe-vera-gelly',
    name: 'Aloe Vera Gelly',
    price: 8500,
    image: 'https://static.wixstatic.com/media/ad0cb5_406bd3833d8f4d9ab2314a0a30aaea70~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg',
    category: 'Soins de la peau (Skincare)',
    desc: 'Gel d\'Aloe Vera pur, apaise, hydrate et répare la peau.',
    benefits: ['Hydratation', 'Apaisant', 'Réparation cutanée'],
  },
  {
    id: 'aloe-moisturizing-lotion',
    name: 'Aloe Moisturizing Lotion',
    price: 12000,
    image: 'https://images-cdn.ubuy.co.in/640ddf36dcfc303a351cb965-forever-living-aloe-moisturizing-lotion.jpg',
    category: 'Soins de la peau (Skincare)',
    desc: 'Lotion hydratante quotidienne pour une peau douce et souple.',
    benefits: ['Hydratation longue durée', 'Non grasse', 'Tous types de peau'],
  },
  {
    id: 'aloe-lips',
    name: 'Aloe Lips',
    price: 3500,
    image: 'https://tienda-aloevera.es/wp-content/webpc-passthru.php?src=https://tienda-aloevera.es/wp-content/uploads/2021/12/aloe-lips-forever-380x329.jpg&nocache=1',
    category: 'Soins de la peau (Skincare)',
    desc: 'Baume à lèvres à l\'Aloe Vera, répare et protège des gerçures.',
    benefits: ['Réparation', 'Protection', 'Hydratation'],
  },
  {
    id: 'aloe-ever-shield',
    name: 'Aloe Ever-Shield',
    price: 14500,
    image: 'https://sunushopping.com/wp-content/uploads/2025/09/9e710bc322e965208aec4d20fed9f765.webp',
    category: 'Soins de la peau (Skincare)',
    desc: 'Protection solaire naturelle à l\'Aloe Vera, SPF 30.',
    benefits: ['Protection UV', 'Naturel', 'Hydratant'],
  },
  {
    id: 'aloe-propolis-creme',
    name: 'Aloe Propolis Creme',
    price: 16000,
    image: 'https://aloeverabeauty.ma/imgs/aloe-propolis-creme-pour-une-peau-douce-et-eclatante.webp',
    category: 'Soins de la peau (Skincare)',
    desc: 'Crème aux propriétés antibactériennes, idéale pour peaux à problèmes.',
    benefits: ['Antibactérien', 'Cicatrisant', 'Peaux mixtes à grasses'],
  },
  {
    id: 'aloe-body-lotion',
    name: 'Aloe Body Lotion',
    price: 11000,
    image: 'https://static.wixstatic.com/media/ad0cb5_1af626e935a84259ab9709ad87ff230b~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg',
    category: 'Soins de la peau (Skincare)',
    desc: 'Lotion corporelle légère pour tout le corps, pénètre rapidement.',
    benefits: ['Absorption rapide', 'Senteur fraîche', 'Hydratation quotidienne'],
  },
  {
    id: 'smoothing-exfoliator',
    name: 'Smoothing Exfoliator',
    price: 12500,
    image: 'https://aloevera-centar.com/wp-content/uploads/2022/06/Smoothing-Exfoliator.webp',
    category: 'Soins de la peau (Skincare)',
    desc: 'Gommage doux aux micro-particules naturelles pour un teint lisse.',
    benefits: ['Exfoliation douce', 'Éclat', 'Renouvellement cellulaire'],
  },
  {
    id: 'awakening-eye-cream',
    name: 'Awakening Eye Cream',
    price: 15000,
    image: 'https://www.tiendaiglesias.com/2229-large_default/forever-living-awakening-eye-cream-contorno-de-ojos-aloe-vera-.jpg',
    category: 'Soins de la peau (Skincare)',
    desc: 'Crème contour des yeux anti-cernes et anti-poches.',
    benefits: ['Anti-cernes', 'Défatigant', 'Lissant'],
  },
  {
    id: 'balancing-toner',
    name: 'Balancing Toner',
    price: 10500,
    image: 'https://i0.wp.com/jachete.ci/wp-content/uploads/2025/12/Fraicheur_Botanique_1x1-1.jpg?fit=1024%2C1024&ssl=1',
    category: 'Soins de la peau (Skincare)',
    desc: 'Tonique équilibrant pour resserrer les pores et préparer la peau.',
    benefits: ['Resserre les pores', 'Équilibrant', 'Fraîcheur'],
  },
  {
    id: 'protecting-day-lotion',
    name: 'Protecting Day Lotion',
    price: 13500,
    image: 'https://www.foreverliving.fr/storage/products/albums/protecting-day-lotion-spf-20//protecting-day-lotion-spf-20-2023-05-19-6467310eeccf2.webp',
    category: 'Soins de la peau (Skincare)',
    desc: 'Lotion de jour protectrice anti-pollution et anti-UV.',
    benefits: ['Anti-pollution', 'Protection UV', 'Hydratation'],
  },
  {
    id: 'aloe-activator',
    name: 'Aloe Activator',
    price: 14500,
    image: 'https://foreverliving.gr/media/CACHE/images/catalog/product/photo/4a/4a7d/4a7d7a1e/4a7d7a1ed5e348f8/9bef647cf2c53df76890499c3558aa9d.png',
    category: 'Soins de la peau (Skincare)',
    desc: 'Gel activateur qui pénètre profondément pour une hydratation intense.',
    benefits: ['Hydratation intense', 'Pénétration profonde', 'Raffermissant'],
  },

  // ==================== SOINS CAPILLAIRES (HAIRCARE) ====================
  {
    id: 'aloe-jojoba-shampoo',
    name: 'Aloe-Jojoba Shampoo',
    price: 8000,
    image: 'https://www.aloeprevention.fr/blog/wp-content/uploads/2025/09/shampoing-aloe-jojoba-aloe-jojoba-shampoo-02.jpg',
    category: 'Soins capillaires (Haircare)',
    desc: 'Shampooing doux à l\'Aloe Vera et Jojoba, fortifiant et nourrissant.',
    benefits: ['Fortifiant', 'Doux', 'Brillance'],
  },
  {
    id: 'aloe-jojoba-conditioning-rinse',
    name: 'Aloe-Jojoba Conditioning Rinse',
    price: 8500,
    image: 'https://5.imimg.com/data5/CX/GI/MY-31478483/forever-aloe-jojoba-conditioning-rinse-500x500.jpg',
    category: 'Soins capillaires (Haircare)',
    desc: 'Après-shampooing démêlant et nourrissant pour cheveux soyeux.',
    benefits: ['Démêlant', 'Nourrissant', 'Légèreté'],
  },
  {
    id: 'aloe-first',
    name: 'Aloe First',
    price: 7500,
    image: 'https://aloevera-centar.com/wp-content/uploads/2023/11/Forever-Aloe-First.webp',
    category: 'Soins capillaires (Haircare)',
    desc: 'Soin capillaire pré-shampooing pour préparer et protéger le cheveu.',
    benefits: ['Protection', 'Préparation', 'Hydratation'],
  },

  // ==================== HYGIÈNE PERSONNELLE ====================
  {
    id: 'aloe-avocado-face-body-soap',
    name: 'Aloe Avocado Face & Body Soap',
    price: 6000,
    image: 'https://cdn.foreverliving.com/content/products/images/aloe_avocado_face___body_soap_pd_main_512_X_512_1697016955311.jpg',
    category: 'Hygiène personnelle',
    desc: 'Savon visage et corps à l\'Aloe Vera et Avocat, hydratant et doux.',
    benefits: ['Hydratant', 'Doux', 'Naturel'],
  },
  {
    id: 'aloe-liquid-soap',
    name: 'Aloe Liquid Soap',
    price: 7000,
    image: 'https://www.naturlex.de/out/pictures/generated/product/3/380_340_85/forever-aloe-vera-liquid-soap-flp-633.jpg',
    category: 'Hygiène personnelle',
    desc: 'Savon liquide doux pour les mains, au pH neutre et à l\'Aloe Vera.',
    benefits: ['Doux pour les mains', 'pH neutre', 'Hydratant'],
  },
  {
    id: 'forever-bright-aloe-vera-toothgel',
    name: 'Forever Bright Aloe Vera Toothgel',
    price: 5500,
    image: 'https://sunushopping.com/wp-content/uploads/2023/12/l3fJmflJE0BvCDpFbMeCsqISukxbFJZFNxFXFyIx.jpg',
    category: 'Hygiène personnelle',
    desc: 'Dentifrice gel à l\'Aloe Vera, nettoie en douceur et rafraîchit.',
    benefits: ['Blanchissant', 'Sans fluor', 'Frais'],
  },

  // ==================== BIEN-ÊTRE & RÉCUPÉRATION ====================
  {
    id: 'aloe-heat-lotion',
    name: 'Aloe Heat Lotion',
    price: 11500,
    image: 'https://m.media-amazon.com/images/I/51MmKBwfOWL._AC_UF1000,1000_QL80_.jpg',
    category: 'Bien-être & récupération',
    desc: 'Lotion chauffante pour soulager les douleurs musculaires et articulaires.',
    benefits: ['Chauffant', 'Douleurs musculaires', 'Récupération'],
  },

  // ==================== GESTION DU POIDS (WEIGHT MANAGEMENT) ====================
  {
    id: 'c9',
    name: 'C9',
    price: 99000,
    image: 'https://cdn.foreverliving.com/content/products/images/c9__-_forever_aloe_vera_gel-canada_pd_main_512_X_512_1699052183897.jpg',
    category: 'Gestion du poids',
    desc: 'Programme minceur complet de 9 jours pour une perte de poids efficace.',
    benefits: ['Perte de poids', 'Détox', 'Programme complet'],
  },
  {
    id: 'forever-lite-ultra',
    name: 'Forever Lite Ultra',
    price: 32000,
    image: 'https://cdn.foreverliving.com/content/products/images/forever_lite_ultra_vanilla_pd_main_512_X_512_1701357086586.jpg',
    category: 'Gestion du poids',
    desc: 'Substitut de repas protéiné pour une gestion du poids saine.',
    benefits: ['Substitut de repas', 'Riche en protéines', 'Peu calorique'],
  },

  // ==================== ÉNERGIE & PERFORMANCE ====================
  {
    id: 'vitolize-men',
    name: 'Vitolize Men',
    price: 22000,
    image: 'https://www.aloevera-bienetre-beaute.fr/_media/img/small/vitolize-hommes-2.jpg',
    category: 'Énergie & performance',
    desc: 'Complément énergétique pour hommes, boost de vitalité et performance.',
    benefits: ['Vitalité', 'Performance masculine', 'Énergie'],
  },
  {
    id: 'f15',
    name: 'F15',
    price: 28500,
    image: 'https://static.wixstatic.com/media/ad0cb5_fee4bec51c5945d48db64ee7692acc34~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg',
    category: 'Énergie & performance',
    desc: 'Complément alimentaire anti-fatigue pour une énergie durable.',
    benefits: ['Anti-fatigue', 'Énergie durable', 'Concentration'],
  },

  // ==================== PACKS & PROGRAMMES ====================
  {
    id: 'forever-active-ha',
    name: 'Forever Active HA',
    price: 45000,
    image: 'https://images-cdn.ubuy.co.in/63b80e6554e04e08df454f35-forever-living-active-ha-60-softgel.jpg',
    category: 'Packs & programmes',
    desc: 'Pack santé complet avec gel, jus et compléments pour une cure globale.',
    benefits: ['Programme complet', 'Détox', 'Bien-être quotidien'],
  },
  {
    id: 'forever-freedom',
    name: 'Forever Freedom',
    price: 38000,
    image: 'https://sunushopping.com/wp-content/uploads/2023/12/196-600x400.jpg',
    category: 'Packs & programmes',
    desc: 'Pack mobilité articulaire, combinant Aloe Vera et glucosamine.',
    benefits: ['Mobilité articulaire', 'Confort', 'Programme ciblé'],
  },

  // ==================== NUTRITION & COMPLÉMENTS ALIMENTAIRES ====================
  {
    id: 'forever-marine-collagen',
    name: 'Forever Marine Collagen',
    price: 28000,
    image: 'https://cdn.foreverliving.com/content/products/images/forever_marine_collagen__pd_main_512_X_512_1704881637693.jpg',
    category: 'Nutrition & compléments alimentaires',
    desc: 'Collagène marin hydrolysé pour la peau, les cheveux et les articulations.',
    benefits: ['Collagène', 'Peau élastique', 'Articulations'],
  },
  {
    id: 'forever-alpha-e-factor',
    name: 'Forever Alpha-E Factor',
    price: 21000,
    image: 'https://cdn.foreverliving.com/content/products/images/alpha_e_factor_pd_main_512_X_512_1701369065662.jpg',
    category: 'Nutrition & compléments alimentaires',
    desc: 'Complément à base de vitamine E et d\'huile de germe de blé.',
    benefits: ['Antioxydant', 'Vitamine E', 'Protection cellulaire'],
  },
  {
    id: 'absorbent-c',
    name: 'Absorbent-C',
    price: 18500,
    image: 'https://cdn.foreverliving.com/content/products/images/absorbent_c_pd_category_256_X_256_1701448911494.jpg',
    category: 'Nutrition & compléments alimentaires',
    desc: 'Vitamine C à libération prolongée avec extraits d\'acérola.',
    benefits: ['Vitamine C', 'Immunité', 'Antioxydant'],
  },
  {
    id: 'forever-aloe-bits-n-peaches',
    name: 'Forever Aloe Bits N\' Peaches',
    price: 16500,
    image: 'https://cdn.foreverliving.com/content/products/images/Aloe_Bits_n__Peaches_pd_main_512_X_512_1736436903865.jpg',
    category: 'Nutrition & compléments alimentaires',
    desc: 'Gel d\'Aloe Vera aromatisé à la pêche, agréable à boire.',
    benefits: ['Digestion', 'Détox', 'Goût fruité'],
  },
  {
    id: 'forever-bee-honey',
    name: 'Forever Bee Honey',
    price: 14500,
    image: 'https://static.wixstatic.com/media/ad0cb5_807878c604bc40c387dd6dee0640df38~mv2.jpg/v1/fit/w_500,h_500,q_90/file.jpg',
    category: 'Nutrition & compléments alimentaires',
    desc: 'Miel pur 100% naturel, énergie et bien-être au quotidien.',
    benefits: ['Naturel', 'Énergie', 'Adoucissant'],
  },
  {
    id: 'forever-multi-maca',
    name: 'Forever Multi-Maca',
    price: 19500,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZkR-ir3PBf1KocihlOodqxftcOtb04JVvmw&s',
    category: 'Nutrition & compléments alimentaires',
    desc: 'Complément à base de maca, pour la vitalité et l\'équilibre hormonal.',
    benefits: ['Vitalité', 'Équilibre hormonal', 'Énergie naturelle'],
  },
  {
    id: 'forever-bee-propolis',
    name: 'Forever Bee Propolis',
    price: 17800,
    image: 'https://cdn.foreverliving.com/content/products/images/forever_bee_propolis__pd_main_512_X_512_1649800658701.jpg',
    category: 'Nutrition & compléments alimentaires',
    desc: 'Propolis naturelle pour renforcer les défenses immunitaires.',
    benefits: ['Immunité', 'Antibactérien naturel', 'Défenses'],
  },
  {
    id: 'forever-daily',
    name: 'Forever Daily',
    price: 22500,
    image: 'https://cdn.foreverliving.com/content/products/images/forever_daily_pd_main_512_X_512_1701276120307.jpg',
    category: 'Nutrition & compléments alimentaires',
    desc: 'Multivitamines et minéraux pour la forme au quotidien.',
    benefits: ['Multivitamines', 'Énergie', 'Bien-être'],
  },
  {
    id: 'forever-ivision',
    name: 'Forever iVision',
    price: 24000,
    image: 'https://cdn.foreverliving.com/content/products/images/forever_ivision_pd_main_512_X_512_1709129047915.png',
    category: 'Nutrition & compléments alimentaires',
    desc: 'Complément pour la santé visuelle, riche en lutéine et myrtille.',
    benefits: ['Vision', 'Lutéine', 'Protection oculaire'],
  },
  {
    id: 'aloe-vera-gel',
    name: 'Aloe Vera Gel',
    price: 15800,
    image: 'https://sunushopping.com/wp-content/uploads/2021/06/FOREVER-aloes-vera-gel.jpg',
    category: 'Nutrition & compléments alimentaires',
    desc: 'Jus d\'Aloe Vera pur à boire, digestion et immunité.',
    benefits: ['Digestion', 'Immunité', 'Détox'],
  },
  {
    id: 'forever-lycium-plus',
    name: 'Forever Lycium Plus',
    price: 19800,
    image: 'https://cdn.foreverliving.com/content/products/images/lycium_plus_pd_main_512_X_512_1701448991760.jpg',
    category: 'Nutrition & compléments alimentaires',
    desc: 'Baies de goji et lycium pour l\'énergie et l\'antioxydation.',
    benefits: ['Antioxydant', 'Baies de goji', 'Vitalité'],
  },
  {
    id: 'forever-royal-jelly',
    name: 'Forever Royal Jelly',
    price: 26500,
    image: 'https://cdn.foreverliving.com/content/products/images/forever_royal_jelly__pd_main_512_X_512_1709128447723.png',
    category: 'Nutrition & compléments alimentaires',
    desc: 'Gelée royale pure pour l\'énergie et la régénération cellulaire.',
    benefits: ['Gelée royale', 'Régénération', 'Vitalité'],
  },
  {
    id: 'forever-nature-min',
    name: 'Forever Nature-Min',
    price: 18800,
    image: 'https://cdn.foreverliving.com/content/products/images/forever_nature-min__pd_main_512_X_512_1709131226977.png',
    category: 'Nutrition & compléments alimentaires',
    desc: 'Complément minéral riche en calcium et magnésium marins.',
    benefits: ['Minéraux', 'Os solides', 'Magnésium'],
  },

  // ==================== PRODUITS SPÉCIFIQUES CIBLÉS ====================
  {
    id: 'forever-active-pro-b',
    name: 'Forever Active Pro-B',
    price: 25500,
    image: 'https://bonkax.com/wp-content/uploads/2023/06/Forever-ProB-000610-m3_500x750.jpg',
    category: 'Produits spécifiques ciblés',
    desc: 'Probiotiques pour la santé digestive et le confort intestinal.',
    benefits: ['Digestion', 'Flore intestinale', 'Probiotiques'],
  },
];

// Utilisé pour l'index (section "Produits mis en avant").
// Important : uniquement des IDs existants dans PRODUCTS.
const FEATURED_PRODUCT_IDS = [
  'aloe-vera-gelly',
  'aloe-jojoba-shampoo',
  'forever-aloe-bits-n-peaches',
  'c9',
];

function uniq(arr) {
  return [...new Set(arr)];
}

function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function getCategoriesFromProducts() {
  return uniq(PRODUCTS.map((p) => (p.category || '').trim()).filter(Boolean)).sort((a, b) =>
    a.localeCompare(b, 'fr', { sensitivity: 'base' })
  );
}

function renderShopFilterUI() {
  const tabsContainer = document.querySelector('.filter-tabs-desktop');
  const catSel = document.getElementById('shop-category-select');
  if (!tabsContainer && !catSel) return;

  const categories = getCategoriesFromProducts();

  if (tabsContainer) {
    tabsContainer.innerHTML = `
      <button type="button" class="filter-tab btn-secondary-thea active" data-filter="all" style="padding:0.55rem 1.25rem;font-size:0.92rem">Tous</button>
      ${categories
        .map(
          (c) => `
        <button type="button" class="filter-tab btn-secondary-thea" data-filter="${escapeHtml(c)}" style="padding:0.55rem 1.25rem;font-size:0.92rem">
          ${escapeHtml(c)}
        </button>`
        )
        .join('')}
    `;
  }

  if (catSel) {
    catSel.innerHTML =
      `<option value="all">Tous les produits</option>` +
      categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
    catSel.value = catSel.value || 'all';
  }
}

function setTunnelStickyNavActive() {
  const nav = document.querySelector('.tunnel-sticky-nav');
  if (!nav) return;

  const page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  nav.querySelectorAll('a[href]').forEach((a) => {
    const href = (a.getAttribute('href') || '').toLowerCase();
    const isActive = href !== '' && page.endsWith(href);
    a.classList.toggle('active', isActive);
    if (isActive) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function getShopSortValue() {
  const sel = document.getElementById('shop-sort-select');
  if (sel && sel.value) return sel.value;
  return 'default';
}

function applySortedProducts(list, sort) {
  const arr = [...list];
  if (sort === 'price-asc') arr.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') arr.sort((a, b) => b.price - a.price);
  return arr;
}

function renderProducts(filter = 'all', sort) {
  const container = document.getElementById('products-grid');
  if (!container) return;

  // Petite transition (sans reflow lourd) pour rendre le filtrage plus fluide.
  container.style.opacity = '0';

  const sortMode = sort ?? getShopSortValue();
  const filterClean = (filter || 'all').trim();
  let filtered =
    filterClean === 'all'
      ? [...PRODUCTS]
      : PRODUCTS.filter((p) => (p.category || '').trim() === filterClean);
  filtered = applySortedProducts(filtered, sortMode);

  container.innerHTML = filtered
    .map(
      (p, i) => `
    <div class="col-sm-6 col-lg-4 fade-in-up" style="animation-delay: ${i * 0.08}s">
      <div class="product-card">
        <div class="product-card-img-wrap">
          <img class="product-card-img" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" width="800" height="600" loading="lazy" />
        </div>
        <div class="product-card-body">
          <span class="product-card-badge">${escapeHtml(p.category)}</span>
          <h5 class="product-card-title">${escapeHtml(p.name)}</h5>
          <p class="product-card-desc">${escapeHtml(p.desc)}</p>
          <div class="product-card-price">${p.price.toLocaleString('fr-SN')} <span>FCFA</span></div>
          <div class="d-flex flex-column flex-sm-row gap-2 mt-auto">
            <a href="produit-detail.html?id=${escapeHtml(p.id)}" class="btn-primary-thea flex-grow-1 text-center">Voir le détail</a>
            <button type="button" class="btn-secondary-thea px-3 justify-content-center js-add-cart" style="min-width:52px" data-product-id="${escapeHtml(p.id)}" aria-label="Ajouter au panier"><i class="bi bi-cart2"></i></button>
          </div>
          <a href="${buildWhatsAppUrl(encodeURIComponent(`Bonjour Théa, je souhaite commander : ${p.name} (Théa Aloe Care & Wellness). Merci.`))}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp w-100 justify-content-center mt-2" style="font-size:0.9rem;padding:0.65rem 1rem">
            <i class="bi bi-whatsapp"></i> WhatsApp
          </a>
        </div>
      </div>
    </div>`
    )
    .join('');

  container.querySelectorAll('.js-add-cart').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-product-id');
      const p = PRODUCTS.find((x) => x.id === id);
      if (p) addToCart({ id: p.id, name: p.name, price: p.price, image: p.image });
    });
  });

  requestAnimationFrame(() => {
    container.style.opacity = '1';
  });
}

function renderFeaturedProducts() {
  const container = document.getElementById('featured-products-grid');
  if (!container) return;

  const picked = FEATURED_PRODUCT_IDS.map((id) => getProductById(id)).filter(Boolean);
  const list = picked.length ? picked : PRODUCTS.slice(0, 4);

  container.innerHTML = list
    .map(
      (p, i) => `
    <div class="col-sm-6 col-lg-3 fade-in-up" style="animation-delay:${i * 0.08}s">
      <div class="product-card">
        <div class="product-card-img-wrap">
          <img class="product-card-img" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" width="800" height="600" loading="lazy" />
        </div>
        <div class="product-card-body">
          <span class="product-card-badge">${escapeHtml(p.category)}</span>
          <h5 class="product-card-title">${escapeHtml(p.name)}</h5>
          <div class="product-card-price">${p.price.toLocaleString('fr-SN')} <span>FCFA</span></div>
          <a href="produit-detail.html?id=${escapeHtml(p.id)}" class="btn-primary-thea w-100 justify-content-center">Voir le détail</a>
        </div>
      </div>
    </div>`
    )
    .join('');
}

function renderRelatedProducts(currentProduct, limit = 4) {
  const container = document.getElementById('related-products-grid');
  if (!container) return;
  if (!currentProduct) return;

  const sameCategory = PRODUCTS.filter(
    (p) => p.id !== currentProduct.id && (p.category || '').trim() === (currentProduct.category || '').trim()
  );
  const fallback = PRODUCTS.filter((p) => p.id !== currentProduct.id);

  const picked = (sameCategory.length ? sameCategory : fallback).slice(0, limit);

  container.innerHTML = picked
    .map(
      (p, i) => `
    <div class="col-6 col-md-3 fade-in-up" style="animation-delay:${i * 0.08}s">
      <div class="product-card">
        <div class="product-card-img-wrap">
          <img class="product-card-img" src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" width="800" height="600" loading="lazy" />
        </div>
        <div class="product-card-body">
          <div class="product-card-title" style="font-size:1rem">${escapeHtml(p.name)}</div>
          <div class="product-card-price" style="font-size:1.05rem">${p.price.toLocaleString('fr-SN')} <span>FCFA</span></div>
          <a href="produit-detail.html?id=${escapeHtml(p.id)}" class="btn-primary-thea w-100 justify-content-center" style="padding:0.55rem;font-size:0.92rem">Voir</a>
        </div>
      </div>
    </div>`
    )
    .join('');
}

function renderProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const product = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];

  const container = document.getElementById('product-detail');
  if (!container) return;

  document.title = `${product.name} — Théa Aloe Care & Wellness`;

  const waProduct = buildWhatsAppUrl(
    encodeURIComponent(
      `Bonjour Théa, je souhaite commander : ${product.name} (Théa Aloe Care & Wellness). Merci de me confirmer disponibilité et modalités.`
    )
  );

  container.innerHTML = `
    <div class="row align-items-center g-4">
      <div class="col-lg-5">
        <div class="product-card-img-wrap product-detail-img-wrap rounded-thea shadow-thea">
          <img class="product-card-img w-100" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" width="800" height="600" />
        </div>
      </div>
      <div class="col-lg-7">
        <span class="section-label">${escapeHtml(product.category)}</span>
        <h1 class="section-title">${escapeHtml(product.name)}</h1>
        <p class="text-muted mb-3">${escapeHtml(product.desc)}</p>
        ${product.details ? `<p style="line-height:1.75">${escapeHtml(product.details)}</p>` : ''}
        <ul class="list-unstyled mb-3">
          ${product.benefits.map((b) => `<li class="mb-2 d-flex align-items-start gap-2"><i class="bi bi-check-circle-fill text-success mt-1"></i><span>${escapeHtml(b)}</span></li>`).join('')}
        </ul>
        <div class="product-card-price mb-3" style="font-size:1.75rem">${product.price.toLocaleString('fr-SN')} <span>FCFA</span></div>
        <div class="d-flex flex-column flex-sm-row flex-wrap gap-3">
          <button type="button" class="btn-primary-thea" id="detail-add-cart">
            <i class="bi bi-cart2"></i> Ajouter au panier
          </button>
          <a class="btn-whatsapp" href="${waProduct}" target="_blank" rel="noopener noreferrer">
            <i class="bi bi-whatsapp"></i> Commander sur WhatsApp
          </a>
        </div>
      </div>
    </div>`;

  const addBtn = document.getElementById('detail-add-cart');
  if (addBtn) {
    addBtn.addEventListener('click', () =>
      addToCart({ id: product.id, name: product.name, price: product.price, image: product.image })
    );
  }

  renderRelatedProducts(product, 4);
}

// ============================================
// TOAST
// ============================================

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast-thea toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position:fixed;bottom:92px;right:20px;
    background:${type === 'success' ? 'var(--green-dark)' : '#c0392b'};
    color:white;padding:0.85rem 1.35rem;border-radius:50px;
    font-size:0.9rem;font-weight:600;z-index:9999;
    box-shadow:0 4px 22px rgba(0,0,0,0.2);
    animation:fadeInUp 0.35s ease;
    max-width:min(92vw, 360px);
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = '0.35s';
  }, 2600);
  setTimeout(() => toast.remove(), 3000);
}

// ============================================
// SCROLL
// ============================================

function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.fade-in-up').forEach((el) => {
    if (!el.style.animationDelay) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    }
    observer.observe(el);
  });
}

// ============================================
// FILTERS (boutique)
// ============================================

function syncShopCategoryUI(filter) {
  const catSel = document.getElementById('shop-category-select');
  if (catSel) catSel.value = filter;

  document.querySelectorAll('.filter-tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.filter === filter);
  });
}

function initShopFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  const catSel = document.getElementById('shop-category-select');
  const sortSel = document.getElementById('shop-sort-select');

  const run = () => {
    const filter =
      document.querySelector('.filter-tab.active')?.dataset.filter ||
      catSel?.value ||
      'all';
    renderProducts(filter, getShopSortValue());
    initScrollAnimations();
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', function () {
      tabs.forEach((t) => t.classList.remove('active'));
      this.classList.add('active');
      if (catSel) catSel.value = this.dataset.filter;
      renderProducts(this.dataset.filter, getShopSortValue());
      initScrollAnimations();
    });
  });

  if (catSel) {
    catSel.addEventListener('change', () => {
      const v = catSel.value;
      syncShopCategoryUI(v);
      renderProducts(v, getShopSortValue());
      initScrollAnimations();
    });
  }

  if (sortSel) {
    sortSel.addEventListener('change', run);
  }
}

// ============================================
// NAVBAR — fermer au clic extérieur (mobile)
// ============================================

function initNavbarCloseOnOutsideClick() {
  const navbar = document.getElementById('navMain');
  const toggle = document.querySelector('.navbar-thea .navbar-toggler');
  if (!navbar || !toggle || typeof bootstrap === 'undefined' || !bootstrap.Collapse) return;

  const hideMenu = () => {
    const inst = bootstrap.Collapse.getInstance(navbar);
    if (inst && navbar.classList.contains('show')) inst.hide();
  };

  document.addEventListener(
    'click',
    (e) => {
      if (!navbar.classList.contains('show')) return;
      if (navbar.contains(e.target) || toggle.contains(e.target)) return;
      hideMenu();
    },
    true
  );

  navbar.querySelectorAll('a.nav-link-thea, a.btn-nav-cta, a.btn-cart-nav').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 767.98px)').matches) hideMenu();
    });
  });
}

// ============================================
// CHECKOUT & JOIN
// ============================================

function initCheckoutButton() {
  const btn = document.getElementById('checkout-whatsapp-btn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    const name = document.getElementById('customer-name')?.value.trim();
    const address = document.getElementById('customer-address')?.value.trim();
    const phone = document.getElementById('customer-phone')?.value.trim();

    if (!name || !address || !phone) {
      showToast('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    const msg = generateOrderMessage();
    window.open(buildWhatsAppUrl(decodeURIComponent(msg)), '_blank', 'noopener,noreferrer');
  });
}

function initJoinButton() {
  const btn = document.getElementById('join-whatsapp-btn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    const msg = generateJoinMessage();
    window.open(buildWhatsAppUrl(decodeURIComponent(msg)), '_blank', 'noopener,noreferrer');
  });
}

// ============================================
// INIT
// ============================================

document.addEventListener('DOMContentLoaded', function () {
  initWhatsAppPresetLinks();
  initNavbarCloseOnOutsideClick();
  updateCartBadge();
  initScrollAnimations();
  setTunnelStickyNavActive();

  const page = window.location.pathname.split('/').pop() || '';

  if (page === '' || page === 'index.html') {
    renderFeaturedProducts();
    initScrollAnimations();
  }

  if (page === 'produits.html') {
    renderProducts('all', getShopSortValue());
    initShopFilters();
  }

  if (page === 'produit-detail.html') {
    renderProductDetail();
  }

  if (page === 'panier.html') {
    renderCart();
  }

  if (page === 'checkout.html') {
    renderCheckoutSummary();
    initCheckoutButton();
  }

  if (page === 'rejoindre.html') {
    initJoinButton();
  }

  document
    .querySelectorAll('.btn-primary-thea, .btn-secondary-thea, .btn-gold-thea, .btn-next-thea, .btn-whatsapp, .btn-nav-cta')
    .forEach((btn) => {
      btn.addEventListener('click', function () {
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
          this.style.transform = '';
        }, 140);
      });
    });
});
