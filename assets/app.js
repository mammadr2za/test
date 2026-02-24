const seed = {
  shipments: [
    {id:'L-3001', customer:'آرین استیل', product:'میلگرد 8 A3', factory:'یاسوج', weight:10, plate:'65ب234', waybill:'WB-9031', date:'2026-02-15', status:'خروج از کارخانه'},
    {id:'L-3002', customer:'آرین استیل', product:'میلگرد 10 A3', factory:'سبزوار', weight:10, plate:'11ج812', waybill:'WB-9032', date:'2026-02-16', status:'در مسیر'},
    {id:'L-3003', customer:'پارس متال', product:'شمش 150', factory:'پرمان', weight:20, plate:'41د190', waybill:'WB-9033', date:'2026-02-16', status:'تحویل شده'},
    {id:'L-3004', customer:'تجارت شرق', product:'ضایعات سنگین', factory:'یاسوج', weight:9, plate:'90د344', waybill:'WB-9034', date:'2026-02-17', status:'بارگیری'}
  ],
  prices: [
    {date:'2026-02-15', category:'میلگرد', size:'8', model:'A3', factory:'یاسوج', city:'یاسوج', price:30000},
    {date:'2026-02-16', category:'میلگرد', size:'8', model:'A3', factory:'یاسوج', city:'یاسوج', price:35000},
    {date:'2026-01-15', category:'میلگرد', size:'8', model:'A3', factory:'یاسوج', city:'یاسوج', price:20000},
    {date:'2026-02-15', category:'میلگرد', size:'10', model:'A3', factory:'سبزوار', city:'سبزوار', price:32700},
    {date:'2026-02-16', category:'میلگرد', size:'12', model:'A3', factory:'پرمان', city:'پرمان', price:32950},
    {date:'2026-02-16', category:'شمش', size:'120', model:'5SP', factory:'اهواز', city:'اهواز', price:28900},
    {date:'2026-02-16', category:'شمش', size:'150', model:'3SP', factory:'یزد', city:'یزد', price:29100},
    {date:'2026-02-16', category:'ضایعات', size:'سنگین', model:'درجه1', factory:'بازار', city:'یاسوج', price:18600},
    {date:'2026-02-10', category:'ضایعات', size:'سنگین', model:'درجه1', factory:'بازار', city:'یاسوج', price:17100}
  ]
};

const store = {
  load() {
    const raw = localStorage.getItem('fooladman-data');
    if (!raw) {
      localStorage.setItem('fooladman-data', JSON.stringify(seed));
      return structuredClone(seed);
    }
    return JSON.parse(raw);
  },
  save(data){ localStorage.setItem('fooladman-data', JSON.stringify(data)); }
};

const statusCls = s => s.includes('تحویل') ? 'success' : s.includes('مسیر') || s.includes('خروج') ? 'warning' : s.includes('تاخیر') ? 'danger' : 'warning';

function renderAdmin(data){
  const tbody = document.querySelector('#adminShipments');
  if (!tbody) return;
  tbody.innerHTML = data.shipments.map(s => `
    <tr>
      <td>${s.id}</td><td>${s.customer}</td><td>${s.product}</td><td>${s.factory}</td><td>${s.weight} تن</td><td>${s.plate}</td><td>${s.waybill}</td>
      <td><select data-id="${s.id}" class="status-select">
        ${['بارگیری','خروج از کارخانه','در مسیر','تحویل شده','تاخیر'].map(st=>`<option ${st===s.status?'selected':''}>${st}</option>`).join('')}
      </select></td>
    </tr>`).join('');

  document.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', e => {
      const id = e.target.getAttribute('data-id');
      const item = data.shipments.find(x => x.id === id);
      item.status = e.target.value;
      store.save(data);
      const hint = document.querySelector('#syncHint');
      if (hint) hint.textContent = `وضعیت ${id} ذخیره شد؛ مشتری در پنل خود همین لحظه می‌بیند.`;
    });
  });
}

function renderCustomer(data){
  const user = document.querySelector('#customerName')?.value || 'آرین استیل';
  const rows = data.shipments.filter(s => s.customer === user);
  const tbody = document.querySelector('#customerShipments');
  if (tbody) {
    tbody.innerHTML = rows.map(s=>`<tr><td>${s.id}</td><td>${s.product}</td><td>${s.factory}</td><td>${s.weight} تن</td><td>${s.plate}</td><td>${s.date}</td><td><span class="badge ${statusCls(s.status)}">${s.status}</span></td></tr>`).join('');
  }
  const total = rows.reduce((a,b)=>a+b.weight,0);
  const totalEl = document.querySelector('#totalWeight');
  if (totalEl) totalEl.textContent = `${total} تن`;
}

function renderPricing(data){
  const c = document.querySelector('#filterCategory')?.value || 'همه';
  const size = document.querySelector('#filterSize')?.value || 'همه';
  const f = document.querySelector('#filterFactory')?.value || 'همه';
  let rows = data.prices;
  if (c !== 'همه') rows = rows.filter(r=>r.category===c);
  if (size !== 'همه') rows = rows.filter(r=>r.size===size);
  if (f !== 'همه') rows = rows.filter(r=>r.factory===f);
  rows = rows.sort((a,b)=>a.date.localeCompare(b.date));

  const tbody = document.querySelector('#priceRows');
  if (tbody) tbody.innerHTML = rows.map(r=>`<tr><td>${r.date}</td><td>${r.category}</td><td>${r.size}</td><td>${r.model}</td><td>${r.factory}</td><td>${r.city}</td><td>${r.price.toLocaleString('fa-IR')}</td></tr>`).join('');

  const points = rows.slice(-8).map((r,i)=>`${i*85},${220-Math.min(180,Math.round(r.price/230))}`).join(' ');
  const line = document.querySelector('#priceLine');
  const area = document.querySelector('#priceArea');
  if (line && area && points) {
    line.setAttribute('points', points);
    area.setAttribute('points', `${points} 680,240 0,240`);
  }
}

function init(){
  const data = store.load();
  const page = document.body.dataset.page;

  if (page === 'admin') renderAdmin(data);
  if (page === 'customer') renderCustomer(data);
  if (page === 'pricing') {
    renderPricing(data);
    ['#filterCategory','#filterSize','#filterFactory'].forEach(sel => {
      document.querySelector(sel)?.addEventListener('change',()=>renderPricing(data));
    });
  }

  document.querySelector('#customerName')?.addEventListener('change',()=>renderCustomer(data));
}

document.addEventListener('DOMContentLoaded', init);
