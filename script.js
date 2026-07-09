/* ============ DATA LAYER (localStorage) ============ */
const DB = {
  init(){
    if(!localStorage.getItem('zk_courses')){
      localStorage.setItem('zk_courses', JSON.stringify(DEFAULT_COURSES));
    }
    if(!localStorage.getItem('zk_users')) localStorage.setItem('zk_users','[]');
    if(!localStorage.getItem('zk_requests')) localStorage.setItem('zk_requests','[]');
    if(!localStorage.getItem('zk_submissions')) localStorage.setItem('zk_submissions','[]');
    if(!localStorage.getItem('zk_admin_pass')) localStorage.setItem('zk_admin_pass','7070');
    if(!localStorage.getItem('zk_vf_number')) localStorage.setItem('zk_vf_number', VODAFONE_CASH_NUMBER_DEFAULT);
    this._migrate();
  },
  /* keeps old data (saved in the browser before this update) working with the new fields */
  _migrate(){
    let changed = false;
    const courses = this.getCourses();
    courses.forEach(c=>{ if(!Array.isArray(c.homeworks)){ c.homeworks = []; changed = true; } });
    if(changed) this.setCourses(courses);

    changed = false;
    const users = this.getUsers();
    users.forEach(u=>{
      if(!u.status){ u.status = 'approved'; changed = true; } // old accounts stay usable as-is
      if(u.grade===undefined){ u.grade = ''; changed = true; }
      if(u.parentPhone===undefined){ u.parentPhone = ''; changed = true; }
      if(!Array.isArray(u.courses)){ u.courses = []; changed = true; }
    });
    if(changed) this.setUsers(users);
  },
  getCourses(){ return JSON.parse(localStorage.getItem('zk_courses')||'[]'); },
  setCourses(c){ localStorage.setItem('zk_courses', JSON.stringify(c)); },
  getUsers(){ return JSON.parse(localStorage.getItem('zk_users')||'[]'); },
  setUsers(u){ localStorage.setItem('zk_users', JSON.stringify(u)); },
  getRequests(){ return JSON.parse(localStorage.getItem('zk_requests')||'[]'); },
  setRequests(r){ localStorage.setItem('zk_requests', JSON.stringify(r)); },
  getSubmissions(){ return JSON.parse(localStorage.getItem('zk_submissions')||'[]'); },
  setSubmissions(s){ localStorage.setItem('zk_submissions', JSON.stringify(s)); },
  getSession(){ return JSON.parse(localStorage.getItem('zk_session')||'null'); },
  setSession(s){ localStorage.setItem('zk_session', JSON.stringify(s)); },
  clearSession(){ localStorage.removeItem('zk_session'); },
  isAdmin(){ return sessionStorage.getItem('zk_admin')==='1'; },
  setAdmin(v){ v? sessionStorage.setItem('zk_admin','1') : sessionStorage.removeItem('zk_admin'); },
  getVfNumber(){ return localStorage.getItem('zk_vf_number') || VODAFONE_CASH_NUMBER_DEFAULT; },
  setVfNumber(n){ localStorage.setItem('zk_vf_number', n); },
  getAdminPass(){ return localStorage.getItem('zk_admin_pass'); },
  setAdminPass(p){ localStorage.setItem('zk_admin_pass', p); }
};

const VODAFONE_CASH_NUMBER_DEFAULT = '01068349082';
const GRADES = ['أولى ثانوي','تانية ثانوي','تالتة ثانوي'];

const DEFAULT_COURSES = [
  {id:'c1', title:'الميكانيكا من الصفر', subject:'فيزياء', grade:'تالتة ثانوي', teacher:'أ. محمد سامي', duration:'ترم كامل', price:450, videoLink:'https://drive.google.com/file/d/FILE_ID_HERE/view', desc:'شرح كامل لباب الميكانيكا مع حل أسئلة الامتحانات السابقة خطوة بخطوة — كورس الترم كامل.', homeworks:[]},
  {id:'c2', title:'مراجعة الكيمياء العضوية', subject:'كيمياء', grade:'تالتة ثانوي', teacher:'أ. سارة عادل', duration:'شهر', price:130, videoLink:'https://drive.google.com/file/d/FILE_ID_HERE/view', desc:'مراجعة مكثفة لمدة شهر لتفاعلات الكيمياء العضوية.', homeworks:[]},
  {id:'c3', title:'الوراثة والتطور', subject:'أحياء', grade:'تالتة ثانوي', teacher:'أ. أحمد فاروق', duration:'شهر', price:120, videoLink:'https://drive.google.com/file/d/FILE_ID_HERE/view', desc:'مراجعة شاملة لباب الوراثة مع حل مسائل الكروموسومات.', homeworks:[]},
  {id:'c4', title:'التفاضل والتكامل — ترم كامل', subject:'رياضيات', grade:'تالتة ثانوي', teacher:'أ. كريم حسن', duration:'ترم كامل', price:420, videoLink:'https://drive.google.com/file/d/FILE_ID_HERE/view', desc:'أساسيات وتطبيقات التفاضل والتكامل بأسلوب سهل وسريع طول الترم.', homeworks:[]},
  {id:'c5', title:'قواعد النحو المتقدم', subject:'لغة عربية', grade:'تانية ثانوي', teacher:'أ. منى إبراهيم', duration:'شهر', price:90, videoLink:'https://drive.google.com/file/d/FILE_ID_HERE/view', desc:'كل أبواب النحو من الإعراب للتمييز في جلسات مبسطة.', homeworks:[]},
  {id:'c6', title:'أساسيات الجبر — ترم كامل', subject:'رياضيات', grade:'أولى ثانوي', teacher:'أ. كريم حسن', duration:'ترم كامل', price:380, videoLink:'https://drive.google.com/file/d/FILE_ID_HERE/view', desc:'بداية قوية في الجبر لأولى ثانوي بأمثلة تطبيقية طول الترم.', homeworks:[]},
];

/* Turns whatever link the teacher pastes into something playable inline */
function buildVideoEmbed(link){
  if(!link) return '<div class="pending-note">مفيش فيديو مضاف للكورس ده لسه.</div>';
  const driveMatch = link.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if(driveMatch){
    return `<div class="video-wrap"><iframe src="https://drive.google.com/file/d/${driveMatch[1]}/preview" allow="autoplay" allowfullscreen></iframe></div>`;
  }
  const ytMatch = link.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]{11})/);
  if(ytMatch){
    return `<div class="video-wrap"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" allowfullscreen></iframe></div>`;
  }
  if(/\.(mp4|webm|ogg)(\?.*)?$/i.test(link)){
    return `<div class="video-wrap" style="padding-top:0; height:auto;"><video src="${link}" controls style="width:100%; border-radius:12px;"></video></div>`;
  }
  return `<div class="video-wrap"><iframe src="${link}" allowfullscreen></iframe></div>`;
}

DB.init();

/* ============ HELPERS ============ */
function openModal(id){ document.getElementById(id).classList.add('show'); }
function closeModal(id){ document.getElementById(id).classList.remove('show'); }
function switchModal(from,to){ closeModal(from); openModal(to); }
document.querySelectorAll('.overlay').forEach(o=>{
  o.addEventListener('click', e=>{ if(e.target===o) o.classList.remove('show'); });
});
function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str==null ? '' : String(str);
  return div.innerHTML;
}

function currentUser(){
  const s = DB.getSession();
  if(!s) return null;
  return DB.getUsers().find(u=>u.id===s.userId) || null;
}

/* ============ NAV RENDER ============ */
function renderNav(){
  const area = document.getElementById('navAuthArea');
  const u = currentUser();
  if(u){
    area.innerHTML = `
      <div class="user-chip" onclick="handleLogout()">
        <div class="avatar">${escapeHtml(u.name.trim()[0]||'ط')}</div>
        <span style="font-weight:700; font-size:.9rem;">${escapeHtml(u.name.split(' ')[0])}</span>
        <span style="color:var(--muted); font-size:.75rem;">خروج</span>
      </div>`;
  } else {
    area.innerHTML = `
      <div style="display:flex; gap:10px;">
        <a href="javascript:void(0)" class="btn btn-ghost btn-sm" onclick="openModal('loginModal')">دخول</a>
        <a href="javascript:void(0)" class="btn btn-amber btn-sm" onclick="openModal('registerModal')">اعمل حساب</a>
      </div>`;
  }
}

function handleLogout(){
  if(confirm('هتسجل خروج؟')){
    DB.clearSession();
    renderNav();
    renderCourses();
  }
}

/* ============ AUTH ============ */
function handleRegister(e){
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const pass = document.getElementById('regPass').value;
  const grade = document.getElementById('regGrade').value;
  const parentPhone = document.getElementById('regParentPhone').value.trim();
  const msg = document.getElementById('regMsg');
  const users = DB.getUsers();
  if(users.find(u=>u.phone===phone)){
    msg.className='form-msg error'; msg.textContent='الرقم ده مسجل قبل كده، جرب تدخل بدل ما تعمل حساب جديد.';
    return false;
  }
  const user = {id:'u_'+Date.now(), name, phone, pass, grade, parentPhone, status:'pending', courses:[]};
  users.push(user);
  DB.setUsers(users);
  msg.className='form-msg success';
  msg.textContent='تم استلام طلب التسجيل! حسابك هيتفعل بعد ما الأدمن يوافق عليه، وبعدين تقدر تسجل دخول.';
  e.target.reset();
  setTimeout(()=>{ switchModal('registerModal','loginModal'); msg.className='form-msg'; msg.textContent=''; }, 2400);
  return false;
}

function handleLogin(e){
  e.preventDefault();
  const phone = document.getElementById('loginPhone').value.trim();
  const pass = document.getElementById('loginPass').value;
  const msg = document.getElementById('loginMsg');
  const user = DB.getUsers().find(u=>u.phone===phone && u.pass===pass);
  if(!user){
    msg.className='form-msg error'; msg.textContent='رقم الموبايل أو كلمة السر غلط.';
    return false;
  }
  if(user.status==='pending'){
    msg.className='form-msg error'; msg.textContent='حسابك لسه تحت مراجعة الأدمن، هيتفعل قريب.';
    return false;
  }
  if(user.status==='rejected'){
    msg.className='form-msg error'; msg.textContent='للأسف تم رفض طلب التسجيل بتاعك.';
    return false;
  }
  if(user.status==='banned'){
    msg.className='form-msg error'; msg.textContent='تم حظر حسابك من المنصة.';
    return false;
  }
  DB.setSession({userId:user.id});
  closeModal('loginModal');
  renderNav(); renderCourses();
  msg.className='form-msg';
  e.target.reset();
  return false;
}

/* ============ COURSES RENDER ============ */
function courseStatus(course){
  const u = currentUser();
  if(!u) return 'locked';
  const enrolled = u.courses.find(c=>c.courseId===course.id);
  if(enrolled) return enrolled.status; // pending | approved
  return 'locked';
}

function renderFilters(){
  const courses = DB.getCourses();
  const grades = [...new Set(courses.map(c=>c.grade))];
  const wrap = document.getElementById('gradeFilters');
  wrap.innerHTML = `<div class="filter-btn active" data-grade="all" onclick="filterGrade('all',this)">كل المراحل</div>` +
    grades.map(g=>`<div class="filter-btn" data-grade="${g}" onclick="filterGrade('${g}',this)">${g}</div>`).join('');
}
let activeGrade = 'all';
function filterGrade(g, el){
  activeGrade = g;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
  renderCourses();
}

function renderCourses(){
  const courses = DB.getCourses().filter(c=> activeGrade==='all' || c.grade===activeGrade);
  const grid = document.getElementById('coursesGrid');
  if(courses.length===0){ grid.innerHTML = '<div class="empty-state">لسه مفيش كورسات في القسم ده.</div>'; return; }
  grid.innerHTML = courses.map(c=>{
    const st = courseStatus(c);
    const tag = st==='approved' ? '<div class="lock-tag unlocked">✓ متاح</div>'
              : st==='pending' ? '<div class="lock-tag pending">⏳ قيد المراجعة</div>'
              : '<div class="lock-tag locked">🔒 مقفول</div>';
    return `
    <div class="card" onclick="openCourse('${c.id}')">
      <div class="card-top">
        <div class="grade-badge">${c.grade}</div>
      </div>
      <div class="card-body">
        <div class="card-subject">${c.subject} · ${c.duration||'شهر'}</div>
        <div class="card-title">${c.title}</div>
        <div class="card-teacher">${c.teacher}</div>
        <div class="card-foot">
          <div class="price">${c.price} ج.م</div>
          ${tag}
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ============ HOMEWORK — STUDENT SIDE ============ */
function renderHomeworkSection(course, u){
  if(!course.homeworks || course.homeworks.length===0){
    return `<div class="hw-section"><h4 style="margin-bottom:10px;">📝 الواجبات</h4><div class="pending-note">مفيش واجبات مضافة للكورس ده لسه.</div></div>`;
  }
  const subs = DB.getSubmissions();
  const blocks = course.homeworks.map(hw=>{
    const mySub = subs.find(s=>s.homeworkId===hw.id && s.userId===u.id);
    let inner;
    if(mySub){
      const statusLabel = mySub.status==='reviewed' ? 'اتراجعت ✓' : 'اتسلمت، مستنية المراجعة ⏳';
      const statusClass = mySub.status==='reviewed' ? 'reviewed' : 'submitted';
      inner = `
        <div class="hw-status ${statusClass}">${statusLabel}</div>
        <div style="color:var(--muted); font-size:.85rem; margin-bottom:6px;"><strong>إجابتك:</strong> ${escapeHtml(mySub.answer)}</div>
        ${mySub.feedback ? `<div class="hw-feedback"><strong>ملاحظة المدرّس:</strong> ${escapeHtml(mySub.feedback)}</div>` : ''}
      `;
    } else {
      inner = `
        <form onsubmit="return handleHomeworkSubmit(event,'${course.id}','${hw.id}')">
          <div class="field"><textarea id="hwAns_${hw.id}" placeholder="اكتب إجابتك هنا..." required></textarea></div>
          <button class="btn btn-teal btn-sm" style="width:100%; justify-content:center;">تسليم الواجب</button>
        </form>
      `;
    }
    return `<div class="hw-block"><h4>${escapeHtml(hw.title)}</h4><div class="q">${escapeHtml(hw.question)}</div>${inner}</div>`;
  }).join('');
  return `<div class="hw-section"><h4 style="margin-bottom:14px;">📝 الواجبات</h4>${blocks}</div>`;
}

function handleHomeworkSubmit(e, courseId, hwId){
  e.preventDefault();
  const u = currentUser();
  const answerEl = document.getElementById('hwAns_'+hwId);
  const answer = answerEl.value.trim();
  const course = DB.getCourses().find(c=>c.id===courseId);
  const hw = course.homeworks.find(h=>h.id===hwId);
  const subs = DB.getSubmissions();
  subs.push({
    id:'s_'+Date.now(), userId:u.id, userName:u.name, userPhone:u.phone,
    courseId, homeworkId:hwId, homeworkTitle:hw.title, answer,
    date:new Date().toLocaleString('ar-EG'), status:'submitted', feedback:''
  });
  DB.setSubmissions(subs);
  openCourse(courseId); // refresh the modal so it shows the "submitted" state
  return false;
}

/* ============ COURSE MODAL ============ */
function openCourse(id){
  const course = DB.getCourses().find(c=>c.id===id);
  const u = currentUser();
  const body = document.getElementById('courseModalBody');

  if(!u){
    body.innerHTML = `
      <h3>${course.title}</h3>
      <div class="sub">${course.subject} — ${course.grade} — ${course.teacher}</div>
      <p style="color:var(--muted); margin-bottom:20px;">${course.desc}</p>
      <div class="pending-note">🔒 لازم تسجل دخول الأول عشان تقدر تشترك في الكورس ده.</div>
      <button class="btn btn-amber" style="width:100%; justify-content:center; margin-top:16px;" onclick="closeModal('courseModal'); openModal('loginModal')">تسجيل الدخول</button>
    `;
    openModal('courseModal');
    return;
  }

  const status = courseStatus(course);

  if(status==='approved'){
    body.innerHTML = `
      <h3>${course.title}</h3>
      <div class="sub">${course.subject} — ${course.grade} — ${course.teacher}</div>
      ${buildVideoEmbed(course.videoLink)}
      <p style="color:var(--muted); margin-bottom:20px;">${course.desc}</p>
      ${renderHomeworkSection(course, u)}
    `;
  } else if(status==='pending'){
    body.innerHTML = `
      <h3>${course.title}</h3>
      <div class="sub">${course.subject} — ${course.grade} — ${course.teacher}</div>
      <div class="pending-note">⏳ طلبك واصل وقيد المراجعة. هيتفعل الكورس خلال ساعات قليلة بعد ما نتأكد من عملية التحويل.</div>
    `;
  } else {
    body.innerHTML = `
      <h3>${course.title}</h3>
      <div class="sub">${course.subject} — ${course.grade} — ${course.teacher}</div>
      <p style="color:var(--muted); margin-bottom:18px;">${course.desc}</p>
      <div class="pay-box">
        <div class="amt">كورس ${course.duration||'شهر'} — حوّل مبلغ ${course.price} ج.م على فودافون كاش للرقم:</div>
        <div class="num">${DB.getVfNumber()}</div>
        <ul class="pay-steps">
          <li><span class="n">1</span> افتح تطبيق فودافون كاش وحوّل المبلغ للرقم اللي فوق.</li>
          <li><span class="n">2</span> هتوصلك رسالة فيها رقم العملية (reference number).</li>
          <li><span class="n">3</span> اكتب رقم العملية ورقم الموبايل اللي حولت منه تحت وابعت الطلب.</li>
        </ul>
      </div>
      <div class="form-msg" id="payMsg"></div>
      <form onsubmit="return handlePayment(event, '${course.id}')">
        <div class="field"><label>رقم الموبايل اللي حولت منه</label><input type="tel" class="mono" id="paySenderPhone" required></div>
        <div class="field"><label>رقم عملية التحويل</label><input type="text" class="mono" id="payRef" required></div>
        <button class="btn btn-amber" style="width:100%; justify-content:center;">إرسال طلب التفعيل</button>
      </form>
    `;
  }
  openModal('courseModal');
}

function handlePayment(e, courseId){
  e.preventDefault();
  const senderPhone = document.getElementById('paySenderPhone').value.trim();
  const ref = document.getElementById('payRef').value.trim();
  const u = currentUser();

  const requests = DB.getRequests();
  requests.push({
    id:'r_'+Date.now(), userId:u.id, userName:u.name, userPhone:u.phone,
    courseId, senderPhone, ref, status:'pending', date:new Date().toLocaleString('ar-EG')
  });
  DB.setRequests(requests);

  const users = DB.getUsers();
  const userObj = users.find(x=>x.id===u.id);
  userObj.courses.push({courseId, status:'pending'});
  DB.setUsers(users);

  closeModal('courseModal');
  renderCourses();
  alert('تم إرسال طلبك! هيتفعل الكورس خلال ساعات بعد المراجعة.');
  return false;
}

/* ============ ADMIN — LOGIN ============ */
function handleAdminLogin(e){
  e.preventDefault();
  const pass = document.getElementById('adminPass').value;
  const msg = document.getElementById('adminLoginMsg');
  if(pass === DB.getAdminPass()){
    DB.setAdmin(true);
    closeModal('adminLoginModal');
    openModal('adminPanelModal');
    showAdminTab('requests');
    e.target.reset();
  } else {
    msg.className='form-msg error'; msg.textContent='الباسورد غلط.';
  }
  return false;
}

function showAdminTab(tab){
  document.querySelectorAll('.admin-tab').forEach(t=>t.classList.remove('active'));
  const tabEl = document.getElementById('tab'+tab.charAt(0).toUpperCase()+tab.slice(1));
  if(tabEl) tabEl.classList.add('active');
  const content = document.getElementById('adminContent');

  if(tab==='requests') renderRequestsAdmin(content);
  else if(tab==='members') renderMembersAdmin(content);
  else if(tab==='courses') renderCoursesAdmin(content);
  else if(tab==='addCourse') renderAddCourseForm(content);
  else if(tab==='settings') renderSettingsAdmin(content);
}

/* ---- payment requests tab ---- */
function renderRequestsAdmin(content){
  const requests = DB.getRequests().slice().reverse();
  const courses = DB.getCourses();
  if(requests.length===0){ content.innerHTML = '<div class="empty-state">مفيش طلبات دفع لسه.</div>'; return; }
  content.innerHTML = `
    <table>
      <thead><tr><th>الطالب</th><th>الموبايل</th><th>الكورس</th><th>رقم العملية</th><th>الحالة</th><th>إجراء</th></tr></thead>
      <tbody>
        ${requests.map(r=>{
          const course = courses.find(c=>c.id===r.courseId);
          return `<tr>
            <td>${escapeHtml(r.userName)}</td>
            <td class="mono">${escapeHtml(r.userPhone)}</td>
            <td>${course? escapeHtml(course.title) : '—'}</td>
            <td class="mono">${escapeHtml(r.ref)}</td>
            <td><span class="badge ${r.status}">${r.status==='pending'?'قيد المراجعة':r.status==='approved'?'مفعّل':'مرفوض'}</span></td>
            <td class="row-actions">
              ${r.status==='pending' ? `
                <button class="btn btn-teal btn-sm" onclick="approveRequest('${r.id}')">تفعيل</button>
                <button class="btn btn-coral btn-sm" onclick="rejectRequest('${r.id}')">رفض</button>
              ` : '—'}
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
}

function approveRequest(id){
  const requests = DB.getRequests();
  const req = requests.find(r=>r.id===id);
  req.status = 'approved';
  DB.setRequests(requests);

  const users = DB.getUsers();
  const user = users.find(u=>u.id===req.userId);
  const enrollment = user.courses.find(c=>c.courseId===req.courseId);
  if(enrollment) enrollment.status = 'approved';
  DB.setUsers(users);

  showAdminTab('requests');
  renderCourses();
}

function rejectRequest(id){
  const requests = DB.getRequests();
  const req = requests.find(r=>r.id===id);
  req.status = 'rejected';
  DB.setRequests(requests);

  const users = DB.getUsers();
  const user = users.find(u=>u.id===req.userId);
  user.courses = user.courses.filter(c=>c.courseId!==req.courseId);
  DB.setUsers(users);

  showAdminTab('requests');
  renderCourses();
}

/* ---- members tab: approve / reject / ban / unban ---- */
function renderMembersAdmin(content){
  const users = DB.getUsers().slice().reverse();
  if(users.length===0){ content.innerHTML = '<div class="empty-state">لسه مفيش أعضاء متسجلين.</div>'; return; }
  const labels = {pending:'قيد المراجعة', approved:'مفعّل', rejected:'مرفوض', banned:'محظور'};
  const classes = {pending:'pending', approved:'approved', rejected:'rejected', banned:'rejected'};
  content.innerHTML = `
    <table>
      <thead><tr><th>الاسم</th><th>الموبايل</th><th>موبايل ولي الأمر</th><th>الصف</th><th>الحالة</th><th>إجراء</th></tr></thead>
      <tbody>
        ${users.map(u=>{
          let actions = '';
          if(u.status==='pending'){
            actions = `<button class="btn btn-teal btn-sm" onclick="approveMember('${u.id}')">قبول</button>
                       <button class="btn btn-coral btn-sm" onclick="rejectMember('${u.id}')">رفض</button>`;
          } else if(u.status==='approved'){
            actions = `<button class="btn btn-coral btn-sm" onclick="banMember('${u.id}')">حظر</button>`;
          } else if(u.status==='banned'){
            actions = `<button class="btn btn-teal btn-sm" onclick="unbanMember('${u.id}')">إلغاء الحظر</button>`;
          } else if(u.status==='rejected'){
            actions = `<button class="btn btn-teal btn-sm" onclick="approveMember('${u.id}')">قبول</button>`;
          }
          return `<tr>
            <td>${escapeHtml(u.name)}</td>
            <td class="mono">${escapeHtml(u.phone)}</td>
            <td class="mono">${escapeHtml(u.parentPhone||'—')}</td>
            <td>${escapeHtml(u.grade||'—')}</td>
            <td><span class="badge ${classes[u.status]||'pending'}">${labels[u.status]||u.status}</span></td>
            <td class="row-actions">${actions}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
}

function approveMember(id){
  const users = DB.getUsers();
  users.find(x=>x.id===id).status = 'approved';
  DB.setUsers(users);
  renderMembersAdmin(document.getElementById('adminContent'));
}
function rejectMember(id){
  if(!confirm('متأكد إنك عايز ترفض العضو ده؟')) return;
  const users = DB.getUsers();
  users.find(x=>x.id===id).status = 'rejected';
  DB.setUsers(users);
  renderMembersAdmin(document.getElementById('adminContent'));
}
function banMember(id){
  if(!confirm('متأكد إنك عايز تحظر العضو ده؟')) return;
  const users = DB.getUsers();
  users.find(x=>x.id===id).status = 'banned';
  DB.setUsers(users);
  const s = DB.getSession();
  if(s && s.userId===id){ DB.clearSession(); } // kick them out if logged in right now
  renderMembersAdmin(document.getElementById('adminContent'));
}
function unbanMember(id){
  const users = DB.getUsers();
  users.find(x=>x.id===id).status = 'approved';
  DB.setUsers(users);
  renderMembersAdmin(document.getElementById('adminContent'));
}

/* ---- courses tab: edit / delete / manage homework ---- */
function renderCoursesAdmin(content){
  const courses = DB.getCourses();
  if(courses.length===0){ content.innerHTML = '<div class="empty-state">لسه مفيش كورسات.</div>'; return; }
  content.innerHTML = `
    <table>
      <thead><tr><th>الكورس</th><th>المادة</th><th>المرحلة</th><th>السعر</th><th>إجراءات</th></tr></thead>
      <tbody>
        ${courses.map(c=>`<tr>
          <td>${escapeHtml(c.title)}</td><td>${escapeHtml(c.subject)}</td><td>${escapeHtml(c.grade)}</td><td>${c.price} ج.م</td>
          <td class="row-actions">
            <button class="btn btn-ghost btn-sm" onclick="showEditCourse('${c.id}')">تعديل</button>
            <button class="btn btn-teal btn-sm" onclick="showCourseHomeworkAdmin('${c.id}')">الواجبات</button>
            <button class="btn btn-coral btn-sm" onclick="deleteCourse('${c.id}')">حذف</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  `;
}

function showEditCourse(id){
  const course = DB.getCourses().find(c=>c.id===id);
  const content = document.getElementById('adminContent');
  content.innerHTML = `
    <button class="btn btn-ghost btn-sm" style="margin-bottom:16px;" onclick="showAdminTab('courses')">→ رجوع</button>
    <form onsubmit="return handleEditCourse(event,'${course.id}')">
      <div class="field"><label>اسم الكورس</label><input type="text" id="ecTitle" value="${escapeHtml(course.title)}" required></div>
      <div class="field"><label>المادة</label><input type="text" id="ecSubject" value="${escapeHtml(course.subject)}" required></div>
      <div class="field"><label>المرحلة</label>
        <select id="ecGrade" required>${GRADES.map(g=>`<option ${g===course.grade?'selected':''}>${g}</option>`).join('')}</select>
      </div>
      <div class="field"><label>اسم المدرس</label><input type="text" id="ecTeacher" value="${escapeHtml(course.teacher)}" required></div>
      <div class="field"><label>مدة الكورس</label>
        <select id="ecDuration" required>
          <option value="شهر" ${course.duration==='شهر'?'selected':''}>شهر</option>
          <option value="ترم كامل" ${course.duration==='ترم كامل'?'selected':''}>ترم كامل</option>
        </select>
      </div>
      <div class="field"><label>السعر (ج.م)</label><input type="number" id="ecPrice" value="${course.price}" required></div>
      <div class="field"><label>لينك الفيديو</label><input type="text" id="ecVideoLink" value="${escapeHtml(course.videoLink||'')}" required></div>
      <div class="field"><label>وصف قصير</label><textarea id="ecDesc" required>${escapeHtml(course.desc||'')}</textarea></div>
      <button class="btn btn-amber" style="width:100%; justify-content:center;">حفظ التعديلات</button>
    </form>
  `;
}

function handleEditCourse(e, id){
  e.preventDefault();
  const courses = DB.getCourses();
  const course = courses.find(c=>c.id===id);
  course.title = document.getElementById('ecTitle').value;
  course.subject = document.getElementById('ecSubject').value;
  course.grade = document.getElementById('ecGrade').value;
  course.teacher = document.getElementById('ecTeacher').value;
  course.duration = document.getElementById('ecDuration').value;
  course.price = Number(document.getElementById('ecPrice').value);
  course.videoLink = document.getElementById('ecVideoLink').value;
  course.desc = document.getElementById('ecDesc').value;
  DB.setCourses(courses);
  renderFilters();
  renderCourses();
  showAdminTab('courses');
  return false;
}

function deleteCourse(id){
  if(!confirm('متأكد إنك عايز تحذف الكورس ده؟')) return;
  DB.setCourses(DB.getCourses().filter(c=>c.id!==id));
  DB.setSubmissions(DB.getSubmissions().filter(s=>s.courseId!==id));
  renderFilters();
  renderCourses();
  showAdminTab('courses');
}

/* ---- homework management (per course) ---- */
function showCourseHomeworkAdmin(courseId){
  const course = DB.getCourses().find(c=>c.id===courseId);
  const content = document.getElementById('adminContent');
  const subs = DB.getSubmissions().filter(s=>s.courseId===courseId);

  const hwListHtml = (course.homeworks||[]).length===0
    ? '<div class="empty-state">لسه مفيش واجبات للكورس ده.</div>'
    : course.homeworks.map(hw=>{
        const hwSubs = subs.filter(s=>s.homeworkId===hw.id);
        const subsHtml = hwSubs.length===0
          ? '<div style="color:var(--muted); font-size:.85rem; padding:8px 0;">لسه محدش سلّم.</div>'
          : hwSubs.map(s=>`
              <div style="border-top:1px dashed rgba(139,146,181,0.2); padding:10px 0;">
                <div style="font-weight:700; font-size:.85rem;">${escapeHtml(s.userName)} <span class="mono" style="color:var(--muted); font-weight:400;">${escapeHtml(s.userPhone)}</span></div>
                <div style="color:var(--muted); font-size:.85rem; margin:6px 0;">${escapeHtml(s.answer)}</div>
                <div class="field" style="margin-bottom:8px;"><textarea id="fb_${s.id}" placeholder="اكتب ملاحظتك على الإجابة...">${escapeHtml(s.feedback||'')}</textarea></div>
                <button class="btn btn-teal btn-sm" onclick="saveHomeworkFeedback('${s.id}','${courseId}')">حفظ الملاحظة</button>
              </div>
            `).join('');
        return `
          <div class="hw-block">
            <h4>${escapeHtml(hw.title)}</h4>
            <div class="q">${escapeHtml(hw.question)}</div>
            <div style="font-size:.8rem; color:var(--muted); margin-bottom:6px;">${hwSubs.length} تسليم</div>
            ${subsHtml}
            <button class="btn btn-coral btn-sm" style="margin-top:10px;" onclick="deleteHomework('${courseId}','${hw.id}')">حذف الواجب</button>
          </div>
        `;
      }).join('');

  content.innerHTML = `
    <button class="btn btn-ghost btn-sm" style="margin-bottom:16px;" onclick="showAdminTab('courses')">→ رجوع للكورسات</button>
    <h4 style="margin-bottom:12px;">إضافة واجب جديد — ${escapeHtml(course.title)}</h4>
    <form onsubmit="return handleAddHomework(event,'${courseId}')" style="margin-bottom:24px;">
      <div class="field"><label>عنوان الواجب</label><input type="text" id="hwTitle" required></div>
      <div class="field"><label>نص الواجب / الأسئلة</label><textarea id="hwQuestion" required></textarea></div>
      <button class="btn btn-amber" style="width:100%; justify-content:center;">إضافة الواجب</button>
    </form>
    <h4 style="margin-bottom:12px;">الواجبات الحالية</h4>
    ${hwListHtml}
  `;
}

function handleAddHomework(e, courseId){
  e.preventDefault();
  const courses = DB.getCourses();
  const course = courses.find(c=>c.id===courseId);
  if(!Array.isArray(course.homeworks)) course.homeworks = [];
  course.homeworks.push({
    id:'hw_'+Date.now(),
    title:document.getElementById('hwTitle').value,
    question:document.getElementById('hwQuestion').value,
    date:new Date().toLocaleString('ar-EG')
  });
  DB.setCourses(courses);
  showCourseHomeworkAdmin(courseId);
  return false;
}

function deleteHomework(courseId, hwId){
  if(!confirm('متأكد إنك عايز تحذف الواجب ده؟')) return;
  const courses = DB.getCourses();
  const course = courses.find(c=>c.id===courseId);
  course.homeworks = course.homeworks.filter(h=>h.id!==hwId);
  DB.setCourses(courses);
  DB.setSubmissions(DB.getSubmissions().filter(s=>s.homeworkId!==hwId));
  showCourseHomeworkAdmin(courseId);
}

function saveHomeworkFeedback(subId, courseId){
  const subs = DB.getSubmissions();
  const s = subs.find(x=>x.id===subId);
  s.feedback = document.getElementById('fb_'+subId).value.trim();
  s.status = 'reviewed';
  DB.setSubmissions(subs);
  showCourseHomeworkAdmin(courseId);
}

/* ---- add course tab ---- */
function renderAddCourseForm(content){
  content.innerHTML = `
    <form onsubmit="return handleAddCourse(event)">
      <div class="field"><label>اسم الكورس</label><input type="text" id="acTitle" required></div>
      <div class="field"><label>المادة</label><input type="text" id="acSubject" required></div>
      <div class="field"><label>المرحلة</label>
        <select id="acGrade" required>${GRADES.map(g=>`<option>${g}</option>`).join('')}</select>
      </div>
      <div class="field"><label>اسم المدرس</label><input type="text" id="acTeacher" required></div>
      <div class="field"><label>مدة الكورس</label>
        <select id="acDuration" required>
          <option value="شهر">شهر</option>
          <option value="ترم كامل">ترم كامل</option>
        </select>
      </div>
      <div class="field"><label>السعر (ج.م)</label><input type="number" id="acPrice" required></div>
      <div class="field"><label>لينك الفيديو (Google Drive / يوتيوب / أي استضافة مجانية)</label><input type="text" id="acVideoLink" placeholder="https://drive.google.com/file/d/....../view" required></div>
      <div class="field"><label>وصف قصير</label><textarea id="acDesc" required></textarea></div>
      <button class="btn btn-amber" style="width:100%; justify-content:center;">إضافة الكورس</button>
    </form>
  `;
}

function handleAddCourse(e){
  e.preventDefault();
  const courses = DB.getCourses();
  courses.push({
    id:'c_'+Date.now(),
    title:document.getElementById('acTitle').value,
    subject:document.getElementById('acSubject').value,
    grade:document.getElementById('acGrade').value,
    teacher:document.getElementById('acTeacher').value,
    duration:document.getElementById('acDuration').value,
    price:Number(document.getElementById('acPrice').value),
    videoLink:document.getElementById('acVideoLink').value,
    desc:document.getElementById('acDesc').value,
    homeworks:[]
  });
  DB.setCourses(courses);
  renderFilters();
  renderCourses();
  e.target.reset();
  showAdminTab('courses');
  return false;
}

/* ---- settings tab: vodafone number + admin password ---- */
function renderSettingsAdmin(content){
  content.innerHTML = `
    <div class="form-msg" id="settingsMsg"></div>
    <form onsubmit="return handleSaveSettings(event)">
      <div class="field"><label>رقم فودافون كاش (اللي بيستقبل التحويلات)</label><input type="tel" class="mono" id="stVfNumber" value="${escapeHtml(DB.getVfNumber())}" required></div>
      <div class="field"><label>كلمة سر الأدمن الجديدة (اسيبها فاضية لو مش عايز تغيّرها)</label><input type="password" id="stAdminPass" placeholder="••••••"></div>
      <button class="btn btn-amber" style="width:100%; justify-content:center;">حفظ الإعدادات</button>
    </form>
  `;
}

function handleSaveSettings(e){
  e.preventDefault();
  const vf = document.getElementById('stVfNumber').value.trim();
  const newPass = document.getElementById('stAdminPass').value.trim();
  DB.setVfNumber(vf);
  if(newPass) DB.setAdminPass(newPass);
  const msg = document.getElementById('settingsMsg');
  msg.className='form-msg success';
  msg.textContent='تم حفظ الإعدادات بنجاح.';
  document.getElementById('stAdminPass').value='';
  return false;
}

/* ============ INIT ============ */
renderNav();
renderFilters();
renderCourses();
