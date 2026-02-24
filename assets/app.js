const seed = {
  users: [
    {id:'e1', role:'employee', name:'اپراتور مرکزی', phone:'09120000001', password:'123456'},
    {id:'c1', role:'customer', name:'آرین استیل', phone:'09120000002', password:'123456'}
  ],
  shipments: [
    {id:'L-4001', customer:'آرین استیل', product:'میلگرد 8 A3', factory:'یاسوج', weight:10, plate:'65ب234', waybill:'WB-9901', date:'2026-02-15', status:'خروج از کارخانه'},
    {id:'L-4002', customer:'آرین استیل', product:'میلگرد 10 A3', factory:'سبزوار', weight:10, plate:'11ج812', waybill:'WB-9902', date:'2026-02-16', status:'در مسیر'},
    {id:'L-4003', customer:'پارس متال', product:'شمش 150 3SP', factory:'پرمان', weight:20, plate:'41د190', waybill:'WB-9903', date:'2026-02-16', status:'تحویل شده'}
  ],
  prices: [
    {date:'2026-01-08', category:'میلگرد', size:'8', model:'A3', factory:'یاسوج', city:'یاسوج', price:20000},
    {date:'2026-02-08', category:'میلگرد', size:'8', model:'A3', factory:'یاسوج', city:'یاسوج', price:30000},
    {date:'2026-02-15', category:'میلگرد', size:'8', model:'A3', factory:'یاسوج', city:'یاسوج', price:31000},
    {date:'2026-02-16', category:'میلگرد', size:'8', model:'A3', factory:'یاسوج', city:'یاسوج', price:35000},
    {date:'2026-02-16', category:'میلگرد', size:'10', model:'A3', factory:'سبزوار', city:'سبزوار', price:32700},
    {date:'2026-02-16', category:'میلگرد', size:'12', model:'A3', factory:'پرمان', city:'پرمان', price:32950},
    {date:'2026-02-16', category:'شمش', size:'120', model:'5SP', factory:'اهواز', city:'اهواز', price:28900},
    {date:'2026-02-16', category:'شمش', size:'150', model:'3SP', factory:'یزد', city:'یزد', price:29100},
    {date:'2026-02-16', category:'ضایعات', size:'سنگین', model:'درجه1', factory:'بازار', city:'یاسوج', price:18600}
  ]
};

const db = {
  key: 'fooladman-v2',
  load() {
    const raw = localStorage.getItem(this.key);
    if (!raw) {
      localStorage.setItem(this.key, JSON.stringify(seed));
      return structuredClone(seed);
    }
    return JSON.parse(raw);
  },
  save(data) { localStorage.setItem(this.key, JSON.stringify(data)); }
};

const cls = (s) => s.includes('تحویل') ? 'success' : s.includes('مسیر') || s.includes('خروج') ? 'warning' : s.includes('تاخیر') ? 'danger' : 'warning';

function toast(msg){ const el=document.querySelector('#toast'); if(el){el.textContent=msg;} }

function renderAdmin(data){
  const tbody = document.querySelector('#adminShipments');
  if (!tbody) return;
  tbody.innerHTML = data.shipments.map(s => `<tr>
    <td>${s.id}</td><td>${s.customer}</td><td>${s.product}</td><td>${s.factory}</td><td>${s.weight} تن</td><td>${s.plate}</td><td>${s.waybill}</td><td>${s.date}</td>
    <td><select data-id="${s.id}" class="status-select">${['بارگیری','خروج از کارخانه','در مسیر','تحویل شده','تاخیر'].map(st=>`<option ${st===s.status?'selected':''}>${st}</option>`).join('')}</select></td>
  </tr>`).join('');

  document.querySelectorAll('.status-select').forEach(s => s.addEventListener('change', e => {
    const row = data.shipments.find(x => x.id === e.target.dataset.id);
    row.status = e.target.value;
    db.save(data);
    toast(`وضعیت بار ${row.id} بروزرسانی شد و در پنل مشتری قابل مشاهده است.`);
  }));

  const form = document.querySelector('#shipmentForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const entry = {
      id: `L-${Math.floor(5000 + Math.random() * 4000)}`,
      customer: f.get('customer'),
      product: `${f.get('category')} ${f.get('size')} ${f.get('model')}`,
      factory: f.get('factory'),
      weight: Number(f.get('weight')),
      plate: f.get('plate'),
      waybill: f.get('waybill'),
      date: f.get('date'),
      status: 'بارگیری'
    };
    data.shipments.unshift(entry);
    db.save(data);
    renderAdmin(data);
    form.reset();
    toast(`بار جدید ${entry.id} ثبت شد.`);
  });

  const priceForm = document.querySelector('#priceForm');
  priceForm?.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(priceForm);
    const entry = {
      date: f.get('date'), category: f.get('category'), size: f.get('size'), model: f.get('model'),
      factory: f.get('factory'), city: f.get('city'), price: Number(f.get('price'))
    };
    data.prices.push(entry);
    db.save(data);
    toast('قیمت روزانه ثبت و بایگانی شد.');
    priceForm.reset();
  });
}

function renderCustomer(data){
  const selector = document.querySelector('#customerName');
  const name = selector?.value || 'آرین استیل';
  const rows = data.shipments.filter(s => s.customer === name);
  const tbody = document.querySelector('#customerShipments');
  if (tbody) tbody.innerHTML = rows.map(s => `<tr><td>${s.id}</td><td>${s.product}</td><td>${s.factory}</td><td>${s.weight} تن</td><td>${s.plate}</td><td>${s.waybill}</td><td>${s.date}</td><td><span class="badge ${cls(s.status)}">${s.status}</span></td></tr>`).join('');
  const total = rows.reduce((a,b)=>a+b.weight,0);
  const t = document.querySelector('#totalWeight');
  if (t) t.textContent = `${total} تن`;
  selector?.addEventListener('change', ()=>renderCustomer(data));
}

function renderPricing(data){
  const c = document.querySelector('#filterCategory')?.value || 'همه';
  const s = document.querySelector('#filterSize')?.value || 'همه';
  const f = document.querySelector('#filterFactory')?.value || 'همه';
  let rows = data.prices;
  if (c !== 'همه') rows = rows.filter(x => x.category === c);
  if (s !== 'همه') rows = rows.filter(x => x.size === s);
  if (f !== 'همه') rows = rows.filter(x => x.factory === f);
  rows = rows.sort((a,b)=>a.date.localeCompare(b.date));

  const tbody = document.querySelector('#priceRows');
  if (tbody) tbody.innerHTML = rows.map(r => `<tr><td>${r.date}</td><td>${r.category}</td><td>${r.size}</td><td>${r.model}</td><td>${r.factory}</td><td>${r.city}</td><td>${r.price.toLocaleString('fa-IR')}</td></tr>`).join('');

  const last = rows.slice(-10);
  if (!last.length) return;
  const max = Math.max(...last.map(x=>x.price));
  const min = Math.min(...last.map(x=>x.price));
  const points = last.map((r,i)=>{
    const x = i * (680/(Math.max(1,last.length-1)));
    const y = 250 - ((r.price-min)/(Math.max(1,max-min))*180 + 30);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const avg = last.map((_,i)=>{
    const sub = last.slice(Math.max(0,i-2),i+1);
    const mean = sub.reduce((a,b)=>a+b.price,0)/sub.length;
    const x = i * (680/(Math.max(1,last.length-1)));
    const y = 250 - ((mean-min)/(Math.max(1,max-min))*180 + 30);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  document.querySelector('#priceLine')?.setAttribute('points', points);
  document.querySelector('#priceArea')?.setAttribute('points', `${points} 680,290 0,290`);
  document.querySelector('#avgLine')?.setAttribute('points', avg);
  document.querySelector('#priceRange')?.textContent = `بازه قیمت: ${min.toLocaleString('fa-IR')} تا ${max.toLocaleString('fa-IR')} تومان`;

  ['#filterCategory','#filterSize','#filterFactory'].forEach(sel=>document.querySelector(sel)?.addEventListener('change',()=>renderPricing(data),{once:true}));
}

function registerFlow(data){
  const form = document.querySelector('#registerForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const user = {id:`u${Date.now()}`, role:f.get('role'), name:f.get('name'), phone:f.get('phone'), password:f.get('password')};
    data.users.push(user);
    db.save(data);
    toast('حساب کاربری با موفقیت ساخته شد.');
    form.reset();
  });
}

function loginFlow(data){
  const form = document.querySelector('#loginForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(form);
    const role = f.get('role');
    const user = data.users.find(u => u.phone === f.get('phone') && u.password === f.get('password') && u.role === role);
    if (!user) return toast('اطلاعات ورود اشتباه است.');
    localStorage.setItem('fooladman-session', JSON.stringify({role:user.role,name:user.name}));
    window.location.href = user.role === 'employee' ? 'pages/admin.html' : 'pages/customer.html';
  });
}

function init(){
  const data = db.load();
  const page = document.body.dataset.page;
  if (page === 'admin') renderAdmin(data);
  if (page === 'customer') renderCustomer(data);
  if (page === 'pricing') renderPricing(data);
  if (page === 'login') loginFlow(data);
  if (page === 'register') registerFlow(data);
}

document.addEventListener('DOMContentLoaded', init);
