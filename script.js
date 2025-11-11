document.addEventListener('DOMContentLoaded', () => {
  
  const carritoBody = document.querySelector('#lista-carrito tbody') || document.getElementById('carrito-body');
  const carritoTotal = document.getElementById('carrito-total') || document.getElementById('carrito-total');
  const vaciarBtn = document.getElementById('vaciar-carrito');

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  function save() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function calcularTotal() {
    return cart.reduce((s, it) => s + (it.price * it.qty), 0);
  }

  function render() {
    if (!carritoBody) return;
    carritoBody.innerHTML = '';

    if (cart.length === 0) {
      // fila vacía
      carritoBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:8px;color:#555">Carrito vacío</td></tr>';
      if (carritoTotal) carritoTotal.textContent = 'Total: 0.00€';
      return;
    }

    cart.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${item.img}" alt="${item.name}" style="width:48px;height:48px;object-fit:cover;border-radius:6px"></td>
        <td>${item.name}</td>
        <td style="white-space:nowrap;">
          <button class="decrease" data-id="${item.id}">-</button>
          <span style="margin:0 8px">x${item.qty}</span>
          <button class="increase" data-id="${item.id}">+</button>
        </td>
        <td>${(item.price * item.qty).toFixed(2)}€</td>
        <td><button class="remove-item borrar" data-id="${item.id}">Eliminar</button></td>
      `;
      carritoBody.appendChild(tr);
    });

    if (carritoTotal) carritoTotal.textContent = 'Total: ' + calcularTotal().toFixed(2) + '€';
  }

  function parsePrice(text) {
    if (!text) return 0;
    const m = text.replace(',', '.').match(/[\d]+(?:\.[\d]+)?/);
    return m ? parseFloat(m[0]) : 0;
  }

  function getProductData(btn) {
    const card = btn.closest('.ofert-1, .product');
    if (!card) return null;
    const img = card.querySelector('img')?.getAttribute('src') || '';
    const name = card.querySelector('h3')?.textContent?.trim() || card.querySelector('img')?.getAttribute('alt') || 'Producto';
    const priceEl = card.querySelector('.precio-descuento') || card.querySelector('.precio');
    const priceText = priceEl ? priceEl.textContent : (btn.dataset.price || '');
    const price = parsePrice(priceText);
    const idFromData = btn.dataset.id;
    const id = idFromData || (card.dataset.id) || name.toLowerCase().replace(/\s+/g, '-');
    return { id, img, name, price };
  }

  function addItem(data) {
    const existing = cart.find(i => i.id === data.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: data.id, img: data.img, name: data.name, price: Number(data.price || 0), qty: 1 });
    }
    save();
    render();
  }

  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    save();
    render();
  }

  function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    save();
    render();
  }

  document.addEventListener('click', (e) => {
    const t = e.target;

    if (t.matches('.agregar-carrito')) {
      e.preventDefault();
      const data = getProductData(t);
      if (!data) return;
      addItem(data);
      return;
    }

    if (t.matches('.increase')) {
      const id = t.dataset.id;
      changeQty(id, +1);
      return;
    }

    if (t.matches('.decrease')) {
      const id = t.dataset.id;
      changeQty(id, -1);
      return;
    }

    if (t.matches('.remove-item')) {
      const id = t.dataset.id;
      removeItem(id);
      return;
    }

    if (t.matches('#vaciar-carrito')) {
      e.preventDefault();
      cart = [];
      save();
      render();
      return;
    }
  });
  
  render();
});
