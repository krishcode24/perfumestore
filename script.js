document.addEventListener('DOMContentLoaded', function () {

  const PRODUCTS = [
  { id: 'p1', name: 'Midnight Oud', price: 125.00, desc: 'Warm oud with amber & vanilla.', image: 'images/midnight-oud.jpg' },
  { id: 'p2', name: 'Citrus Bloom', price: 78.50, desc: 'Fresh citrus & floral top notes.', image: 'images/citrus-bloom.jpg' },
  { id: 'p3', name: 'Velvet Rose', price: 95.00, desc: 'Classic rose with musk.', image: 'images/velvet-rose.jpg' },
  { id: 'p4', name: 'Ocean Mist', price: 65.00, desc: 'Cool aquatic scent for day use.', image: 'images/ocean-mist.jpg' },
  { id: 'p5', name: 'Amber Spice', price: 150.00, desc: 'Rich amber, spice & wood.', image: 'images/amber-spice.jpg' },
  { id: 'p6', name: 'Vanilla Sky', price: 45.00, desc: 'Sweet gourmand vanilla.', image: 'images/vanilla-sky.jpg' }
  ];

  

    /***********
     * CART STORAGE
     ***********/
    function saveCart(cart){ localStorage.setItem('ps_cart', JSON.stringify(cart)); }
    function loadCartFromStorage(){ try{ return JSON.parse(localStorage.getItem('ps_cart')) || []; }catch(e){ return []; } }

    function cartItems(){ return loadCartFromStorage(); }

    function addToCart(productId, qty=1){
      const cart = cartItems();
      const p = PRODUCTS.find(x=>x.id===productId);
      if(!p) return;
      const found = cart.find(i=>i.product.id===productId);
      if(found) found.qty += qty; else cart.push({product: p, qty});
      saveCart(cart); renderCart();
    }

    function clearCart(){ saveCart([]); renderCart(); }

    function removeFromCart(productId){ const cart = cartItems().filter(i=>i.product.id!==productId); saveCart(cart); renderCart(); }

    function updateQty(productId, qty){ const cart = cartItems(); const it = cart.find(x=>x.product.id===productId); if(!it) return; it.qty = Math.max(1, Math.floor(qty)||1); saveCart(cart); renderCart(); }

    /***********
     * RENDER
     ***********/
    function formatRM(n){ return 'RM' + Number(n).toFixed(2); }

    function renderProducts(){
      const el = document.getElementById('products');
      el.innerHTML = '';
      for(const p of PRODUCTS){
        const div = document.createElement('div'); div.className='card';
        div.innerHTML = `
          <div class="prod-img"><img src="${p.image}" alt="${escapeHtml(p.name)}" style="max-width:100%; max-height:100%"/></div>
          <div class="prod-title">${escapeHtml(p.name)}</div>
          <div class="prod-desc">${escapeHtml(p.desc)}</div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div class="price">${formatRM(p.price)}</div>
            <div class="add">
              <button class="btn-outline add-btn" data-id="${p.id}">Add</button>
            </div>
          </div>
        `;
        el.appendChild(div);
      }
      // attach add handlers
      setTimeout(()=>{
        document.querySelectorAll('.add-btn').forEach(b=> b.onclick = ()=> addToCart(b.dataset.id));
      }, 50);
    }

    function calcTotals(cart){
      const subtotal = cart.reduce((s,i)=> s + i.product.price * i.qty, 0);
      const totalItems = cart.reduce((s,i)=> s + i.qty, 0);
      let shipping = 0.00;
      if(totalItems === 1) shipping = 8.00;
      else if(totalItems > 1) shipping = 10.00;
      const total = +(subtotal + shipping).toFixed(2);
      return { subtotal, shipping, total };
    }

    function renderCart(){
      const el = document.getElementById('cart-items');
      const cart = cartItems();
      el.innerHTML = '';
      if(cart.length===0){ el.innerHTML = '<div class="small">Your cart is empty.</div>'; }
      for(const it of cart){
        const row = document.createElement('div'); row.className='cart-item';
        row.innerHTML = `
          <img src="${it.product.image}" style="width:56px;height:56px;border-radius:8px;object-fit:cover" alt="" />
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between"><div>${escapeHtml(it.product.name)}</div><div class="small">${formatRM(it.product.price)}</div></div>
            <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
              <input type="number" min="1" value="${it.qty}" data-id="${it.product.id}" style="width:68px;padding:6px;border-radius:8px;background:transparent;border:1px solid rgba(255,255,255,0.04)" />
              <button class="btn-outline" data-remove="${it.product.id}">Remove</button>
            </div>
          </div>
        `;
        el.appendChild(row);
      }

      // totals
      const {subtotal, shipping, total} = calcTotals(cart);
      document.getElementById('subtotal').textContent = formatRM(subtotal);
      document.getElementById('shipping').textContent = formatRM(shipping);
      document.getElementById('total').textContent = formatRM(total);
      document.getElementById('cart-count').textContent = cart.reduce((s,i)=>s+i.qty,0);

      // attach qty change and remove handlers
      setTimeout(()=>{
        document.querySelectorAll('#cart-items input[type=number]').forEach(inp => inp.onchange = ()=> updateQty(inp.dataset.id, Number(inp.value)));
        document.querySelectorAll('#cart-items [data-remove]').forEach(b=> b.onclick = ()=> removeFromCart(b.getAttribute('data-remove')));
      }, 50);
    }

    /***********
     * MODALS & EVENTS
     ***********/

    function toggleModal(id, show){ 
      const m = document.getElementById(id); 
      if(!m) return; 
      if(show) m.classList.add('show'); 
      else m.classList.remove('show'); 
    }
    window.toggleModal = toggleModal;

    function initEvents(){
      document.getElementById('checkout-btn').onclick = ()=> toggleModal('checkout-modal', true);
      document.getElementById('checkout-btn-2').onclick = ()=> toggleModal('checkout-modal', true);
      document.getElementById('view-cart').onclick = ()=> window.scrollTo({top: document.querySelector('.cart').offsetTop - 20, behavior:'smooth'});
      document.getElementById('clear-cart').onclick = ()=> { if(confirm('Clear cart?')) clearCart(); };
      document.getElementById('submit-order').onclick = submitOrder;
    }

    function submitOrder(){
      const name = document.getElementById('c-name').value.trim();
      const email = document.getElementById('c-email').value.trim();
      const method = document.getElementById('c-method').value;
      const items = cartItems();
      if(!name || !email){ alert('Please enter name and email.'); return; }
      if(items.length===0){ alert('Cart is empty. Add some perfumes first.'); return; }

      const {subtotal, shipping, total} = calcTotals(items);
      const order = { id: 'ORD-' + Date.now(), name, email, method, items, subtotal, shipping, total, createdAt: new Date().toISOString() };

      toggleModal('checkout-modal', false);

      if(method === 'online_banking'){
        const inst = `
          <div style="margin-top:8px">
            <div style="font-weight:700">Bank transfer instructions</div>
            <div style="margin-top:8px" class="small">
              <div><strong>Bank:</strong> BigBank Malaysia (FPX simulated)</div>
              <div><strong>Account:</strong> 123-456-789 (PerfumeShop Sdn Bhd)</div>
              <div><strong>Amount:</strong> <strong>${formatRM(total)}</strong></div>
              <div><strong>Reference:</strong> <strong>${order.id}</strong></div>
              <div style="margin-top:6px">Please transfer the exact amount and include the reference code in the transfer note. Your order will be processed after payment confirmation.</div>
            </div>
            <div style="margin-top:12px" class="small">
              After transfer, forward your slip to support@perfumeshop.example (simulated) or paste your transaction reference here to mark as paid.
            </div>
            <div style="margin-top:12px;display:flex;gap:8px">
              <button class="btn" id="mark-paid">I have paid (simulate)</button>
              <button class="btn-outline" id="download-inv">Download invoice (HTML)</button>
            </div>
          </div>
        `;
        document.getElementById('os-body').innerHTML = `<div><strong>Order ${order.id}</strong></div>` + inst;
        toggleModal('order-success', true);

        setTimeout(()=>{
          const mp = document.getElementById('mark-paid');
          if(mp) mp.onclick = ()=>{
            alert('Payment confirmed (simulated). Thank you!');
            clearCart();
            toggleModal('order-success', false);
          };
          const dl = document.getElementById('download-inv');
          if(dl) dl.onclick = ()=> downloadInvoice(order);
        }, 50);

      } else if(method === 'card'){
        document.getElementById('os-body').innerHTML = `
          <div><strong>Order ${order.id}</strong></div>
          <div style="margin-top:8px" class="small">Payment successful (simulated). Your order will be prepared for shipping.</div>
          <div style="margin-top:12px;display:flex;gap:8px">
            <button class="btn" id="os-close-ok">OK</button>
            <button class="btn-outline" id="download-inv-2">Download invoice (HTML)</button>
          </div>
        `;
        toggleModal('order-success', true);
        setTimeout(()=>{
          const ok = document.getElementById('os-close-ok');
          if(ok) ok.onclick = ()=>{ clearCart(); toggleModal('order-success', false); };
          const dl = document.getElementById('download-inv-2'); if(dl) dl.onclick = ()=> downloadInvoice(order);
        },50);

      } else if(method === 'cod'){
        document.getElementById('os-body').innerHTML = `
          <div><strong>Order ${order.id}</strong></div>
          <div style="margin-top:8px" class="small">Order placed. Pay on delivery.</div>
          <div style="margin-top:12px;display:flex;gap:8px">
            <button class="btn" id="os-close-cod">OK</button>
            <button class="btn-outline" id="download-inv-3">Download invoice (HTML)</button>
          </div>
        `;
        toggleModal('order-success', true);
        setTimeout(()=>{
          const ok = document.getElementById('os-close-cod'); if(ok) ok.onclick = ()=>{ clearCart(); toggleModal('order-success', false); };
          const dl = document.getElementById('download-inv-3'); if(dl) dl.onclick = ()=> downloadInvoice(order);
        },50);
      }
    }

    /***********
     * UTIL
     ***********/
    function escapeHtml(unsafe){ return String(unsafe).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

    function downloadInvoice(order){
      // create a simple HTML invoice and force download
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${order.id}</title>
        <style>body{font-family:Arial,Helvetica,sans-serif;color:#111;padding:20px} .inv{max-width:700px;margin:0 auto;border:1px solid #eee;padding:18px;border-radius:8px} h2{margin-top:0}</style>
      </head><body>
      <div class="inv">
        <h2>PerfumeShop — Invoice</h2>
        <p><strong>Order ID:</strong> ${order.id}<br><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Name:</strong> ${escapeHtml(order.name)}<br><strong>Email:</strong> ${escapeHtml(order.email)}</p>
        <hr>
        <h3>Items</h3>
        <ul>
          ${order.items.map(it => `<li>${escapeHtml(it.product.name)} × ${it.qty} @ ${formatRM(it.product.price)} = ${formatRM(it.product.price*it.qty)}</li>`).join('')}
        </ul>
        <p><strong>Subtotal:</strong> ${formatRM(order.subtotal)}<br><strong>Shipping:</strong> ${formatRM(order.shipping)}<br><strong>Total:</strong> ${formatRM(order.total)}</p>
        <p>Thank you for shopping with PerfumeShop (demo).</p>
      </div>
      </body></html>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `invoice_${order.id}.html`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }

    /***********
     * INIT
     ***********/
    (function init(){ renderProducts(); renderCart(); initEvents(); })();

});
