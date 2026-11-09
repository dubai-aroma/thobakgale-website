(function(){
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var today=new Date();today.setHours(0,0,0,0);

  /* notes toggle */
  var nt=$('#ntog');if(nt)nt.addEventListener('click',function(){var on=nt.getAttribute('aria-pressed')!=='true';nt.setAttribute('aria-pressed',on);document.body.classList.toggle('notes-on',on)});

  /* header + drawer */
  var bw=$('#barwrap');function sc(){if(bw)bw.classList.toggle('solid',window.scrollY>30)}window.addEventListener('scroll',sc,{passive:true});sc();
  var bg=$('#burger'),dr=$('#drawer');
  function setMenu(o){if(!bg)return;bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Close menu':'Open menu');dr.classList.toggle('open',o);dr.setAttribute('aria-hidden',!o);document.body.style.overflow=o?'hidden':''}
  if(bg){bg.addEventListener('click',function(){setMenu(bg.getAttribute('aria-expanded')!=='true')});$$('#drawer a').forEach(function(a){a.addEventListener('click',function(){setMenu(false)})})}
  document.addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});

  /* reveals */
  var rv=$$('.rv');
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.08,rootMargin:'0px 0px -4% 0px'});rv.forEach(function(el){io.observe(el)})}else rv.forEach(function(el){el.classList.add('in')});

  /* mobile bar after hero */
  var mbar=$('#mbar'),hero=$('.ihero');
  if(mbar&&hero){if('IntersectionObserver' in window)new IntersectionObserver(function(e){mbar.classList.toggle('visible',!e[0].isIntersecting)},{threshold:.05}).observe(hero);else mbar.classList.add('visible')}

  /* audience switch */
  var audBtns=$$('.aud button[data-a]');
  var audListeners=[];
  function setAud(a,push){
    audBtns.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.a===a?'true':'false')});
    $$('[data-aud]').forEach(function(el){el.hidden=el.dataset.aud!==a});
    if(push){var b=audBtns.filter(function(x){return x.dataset.a===a})[0];if(b&&b.dataset.hash){try{history.replaceState(null,'','#'+b.dataset.hash)}catch(e){}}}
    audListeners.forEach(function(f){f(a)});
  }
  if(audBtns.length){
    var start=audBtns[0].dataset.a,h=(location.hash||'').slice(1);
    audBtns.forEach(function(b){if(b.dataset.hash===h)start=b.dataset.a;b.addEventListener('click',function(){setAud(b.dataset.a,true)})});
    setAud(start,false);
  }

  /* lead form */
  var sheet=$('[data-form]');
  if(sheet){
    var form=$('form',sheet),stps=$$('.stp',sheet),pips=$$('.pips i',sheet),nextBtn=$('.next',sheet),backBtn=$('.back',sheet);
    var arrow=nextBtn.querySelector('svg')?nextBtn.querySelector('svg').outerHTML:'';
    var ref='TA/'+String(today.getFullYear()).slice(2)+'/'+String(Math.floor(1000+Math.random()*9000));
    var refEl=$('.ref',sheet);if(refEl)refEl.textContent='Ref '+ref;
    var st={step:1,v1:'',v2:''};
    var finalLabel=nextBtn.dataset.final||'Send to a director';
    function show(n){st.step=n;stps.forEach(function(s){s.classList.toggle('active',Number(s.dataset.step)===n)});pips.forEach(function(p,i){p.classList.toggle('on',i<n)});backBtn.hidden=n===1;nextBtn.innerHTML=(n===3?finalLabel+' ':'Continue ')+arrow}
    $$('.chips',sheet).forEach(function(g){g.addEventListener('click',function(e){var c=e.target.closest('.chip');if(!c)return;$$('.chip',g).forEach(function(x){x.setAttribute('aria-pressed',x===c?'true':'false')});st['v'+g.dataset.grp]=c.dataset.v;var er=$('[data-err="'+g.dataset.grp+'"]',sheet);if(er)er.textContent=''})});
    audListeners.push(function(){st.v1='';st.v2='';$$('.chip',sheet).forEach(function(x){x.setAttribute('aria-pressed','false')});show(1)});
    function bad(el,msg){el.setAttribute('aria-invalid',msg?'true':'false');var e=$('#'+el.getAttribute('aria-describedby'));if(e)e.textContent=msg||''}
    nextBtn.addEventListener('click',function(){
      if(st.step===1){if(!st.v1){$('[data-err="1"]',sheet).textContent='Choose the closest fit to continue.';return}show(2);return}
      if(st.step===2){if(!st.v2){$('[data-err="2"]',sheet).textContent='Choose one so we can route you to the right director.';return}show(3);return}
      var n=$('.f-name',sheet),p=$('.f-phone',sheet),m=$('.f-email',sheet);
      var eN=n.value.trim().length>1?'':'Enter your name.';
      var eP=p.value.replace(/\D/g,'').length>=9?'':'Enter a mobile number we can call.';
      var eM=(m.value.trim()===''||/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m.value.trim()))?'':'Check the email address. It should look like name@company.co.za.';
      bad(n,eN);bad(p,eP);bad(m,eM);if(eN||eP||eM)return;
      var urgent=$('.f-urgent',sheet);urgent=urgent&&urgent.checked;
      form.hidden=true;$('.pips',sheet).hidden=true;$('.skel',sheet).hidden=false;
      setTimeout(function(){
        $('.skel',sheet).hidden=true;var d=$('.done',sheet);d.hidden=false;
        $('.d-title',sheet).textContent='Thank you, '+n.value.trim().split(' ')[0]+'. '+(sheet.dataset.doneTitle||'A director will call you.');
        $('.d-text',sheet).textContent=urgent?'You marked this as urgent, so it goes to the front of the queue. If your deadline is within 48 hours, please also phone +27 11 100 4730.':(sheet.dataset.doneText||'A director will review your enquiry and call you back. Have any documents ready.');
        $('.d-ref',sheet).textContent=ref;$('.d-1',sheet).textContent=st.v1;$('.d-2',sheet).textContent=st.v2+(urgent?', urgent':'');
      },reduce?0:900);
    });
    backBtn.addEventListener('click',function(){show(Math.max(1,st.step-1))});
    $$('[data-goform]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();sheet.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});var f=$('.stp.active .chip',sheet);if(f)setTimeout(function(){f.focus({preventScroll:true})},500)})});
  }

  /* deadline calculators */
  var HOL={};['2026-01-01','2026-03-21','2026-04-03','2026-04-06','2026-04-27','2026-05-01','2026-06-16','2026-08-09','2026-08-10','2026-09-24','2026-12-16','2026-12-25','2026-12-26','2027-01-01','2027-03-21','2027-03-22','2027-03-26','2027-03-29','2027-04-27','2027-05-01','2027-06-16','2027-08-09','2027-09-24','2027-12-16','2027-12-25','2027-12-26','2027-12-27','2028-01-01','2028-03-21','2028-04-14','2028-04-17','2028-04-27','2028-05-01','2028-06-16','2028-08-09','2028-09-24','2028-09-25','2028-12-16','2028-12-25','2028-12-26'].forEach(function(d){HOL[d]=1});
  function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
  function addCourt(d,n){var x=new Date(d);while(n>0){x.setDate(x.getDate()+1);var w=x.getDay();if(w!==0&&w!==6&&!HOL[iso(x)])n--}return x}
  function addCalc(d,n,u){var x=new Date(d);if(u==='court')return addCourt(x,n);if(u==='cal')x.setDate(x.getDate()+n);if(u==='weeks')x.setDate(x.getDate()+7*n);if(u==='months')x.setMonth(x.getMonth()+n);if(u==='years')x.setFullYear(x.getFullYear()+n);return x}
  function fmt(d){return d.toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
  $$('.calc[data-n]').forEach(function(c){
    var inp=$('input',c),L=$('.res b',c),S=$('.res span',c),n=+c.dataset.n,u=c.dataset.u;
    inp.value=iso(today);inp.max=iso(today);
    function run(){
      var v=inp.value;if(!v){L.textContent='Enter a date';S.textContent='';return}
      var p=v.split('-'),due=addCalc(new Date(+p[0],+p[1]-1,+p[2]),n,u),left=Math.round((due-today)/864e5);
      L.className='';
      if(left<0){L.textContent='This date may have passed';L.className='hot';S.innerHTML='Estimated last day was <strong>'+fmt(due)+'</strong>. Late steps are sometimes possible. Speak to a director now.'}
      else if(left===0){L.textContent='Today is the last day';L.className='hot';S.innerHTML='Estimated last day: <strong>'+fmt(due)+'</strong>. Call now.'}
      else{L.textContent=left+(left===1?' day left':' days left');if(left<=14)L.className='hot';S.innerHTML='Estimated last day: <strong>'+fmt(due)+'</strong>'}
    }
    inp.addEventListener('input',run);inp.addEventListener('change',run);run();
  });

  var y=$('#year');if(y)y.textContent=today.getFullYear();
})();
