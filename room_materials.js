/* Room-scoped materials; host administration remains behind the private tunnel. */
(() => {
  const hostButton=document.createElement('button');hostButton.id='hostEntry';hostButton.className='secondary';hostButton.textContent='主持人设置';
  document.querySelector('header').append(hostButton);
  const hostPanel=document.createElement('section');hostPanel.id='hostEntryPanel';hostPanel.className='panel';hostPanel.hidden=true;
  hostPanel.innerHTML='<h2>实验主持台</h2><p class="subtle">设置故事和参考图、创建场次，并在“场次进度”里选定每间房间的故事、开始准备和游玩。</p><p><a id="privateHostLink" target="_blank" rel="noopener">打开本机实验主持台</a></p><p class="hint">这是主持电脑的私有入口。参与者只需使用当前网页和房间码。</p><details><summary>本机主持台打不开？</summary><p class="subtle">在已配置 SSH 的主持电脑上运行下面的 PowerShell 命令，保留终端窗口，再打开上方链接。</p><pre class="host-command">ssh -N -T -L 127.0.0.1:8091:127.0.0.1:8091 lab-yongluoli</pre></details>';
  document.querySelector('.intro').after(hostPanel);
  $('privateHostLink').href=local?'/study-admin':'http://127.0.0.1:8091/study-admin';
  hostButton.setAttribute('aria-controls',hostPanel.id);hostButton.setAttribute('aria-expanded','false');
  hostButton.onclick=()=>{hostPanel.hidden=!hostPanel.hidden;hostButton.setAttribute('aria-expanded',String(!hostPanel.hidden));};

  const materialsButton=document.createElement('button');materialsButton.id='materialsButton';materialsButton.className='secondary';materialsButton.textContent='故事与素材';materialsButton.hidden=true;
  document.querySelector('.intro').append(materialsButton);
  const dialog=document.createElement('dialog');dialog.id='materialsDialog';dialog.className='materials-dialog';dialog.setAttribute('aria-labelledby','materialsTitle');
  dialog.innerHTML='<div class="materials-heading"><div><div class="eyebrow">本房间的故事材料</div><h2 id="materialsTitle"></h2></div><button id="closeMaterials" class="secondary">关闭故事与素材</button></div><p id="materialsRole" class="hint"></p><div class="materials-copy"><section><h3>共同开场</h3><p id="materialsOpening"></p></section><section id="directorMaterial" hidden><h3>导演提纲 · 仅导演可见</h3><p id="materialsOutline"></p><h3>叙事方向／可能性</h3><p id="materialsMainline"></p><h3>场景设定</h3><p id="materialsSetting"></p></section></div><h3 id="materialsAssetsTitle">参考素材</h3><p class="hint">点击参考图放大；游玩阶段可引用到本轮输入。也可在输入框键入 @ 查找。</p><div id="materialsAssets" class="asset-grid"></div>';
  document.body.append(dialog);materialsButton.onclick=()=>dialog.showModal();$('closeMaterials').onclick=()=>dialog.close();
  dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
  let materialKey='';
  function renderMaterials(){
    const joined=!!state&&!!token;
    materialsButton.hidden=!joined;$('gameArea').hidden=!joined;
    if(!joined){$('input').disabled=true;return;}
    const story=state.story||{},assets=state.assets||[];
    const key=JSON.stringify([rid,role,state.title,state.opening,story,assets]);
    if(key!==materialKey){
      materialKey=key;$('materialsTitle').textContent=state.title;
      $('materialsOpening').textContent=state.opening||'主持人尚未填写共同开场。';
      $('materialsRole').textContent=role==='director'?'你负责安排外界事件与回应。下方提纲只展示给导演；它是叙事参考，故事会随双方的决定推进。':'你扮演'+(story.protagonist||state.study?.protagonist||'本故事的主角')+'。下方是你与导演共享的开场和参考素材。';
      $('directorMaterial').hidden=role!=='director';
      $('materialsOutline').textContent=role==='director'?(story.director_outline||state.study?.director_outline||'主持人尚未填写导演提纲。'):'';
      $('materialsMainline').textContent=role==='director'?(story.mainline||'由导演根据世界状态安排。'):'';
      $('materialsSetting').textContent=role==='director'?(story.setting||'请参考共同开场和场景参考图。'):'';
      $('materialsAssetsTitle').textContent='参考素材 · '+assets.length+' 项';
      const grid=$('materialsAssets');grid.replaceChildren();
      for(const a of assets){
        const card=document.createElement('article');card.className='asset-card';
        const img=document.createElement('img');img.src=hciApiURL(a.image_url)+'?token='+encodeURIComponent(token);img.alt=a.name+'的参考图';img.loading='lazy';
        const preview=document.createElement('button');preview.className='material-preview';preview.type='button';preview.setAttribute('aria-label','放大参考图：'+a.name);preview.append(img);
        preview.onclick=()=>{const d=document.createElement('dialog');d.className='asset-lightbox';const full=img.cloneNode();full.loading='eager';const close=document.createElement('button');close.textContent='关闭预览';close.onclick=()=>d.close();d.append(full,close);d.onclose=()=>d.remove();document.body.append(d);d.showModal();};
        const meta=document.createElement('div');meta.className='asset-meta';const name=document.createElement('strong');name.textContent=a.name;const description=document.createElement('small');description.textContent=a.description||({place:'场景',subject:a.subject_kind||'人物／物品'}[a.kind]);
        const reference=document.createElement('button');reference.className='secondary';reference.type='button';reference.textContent='引用 @'+a.name;reference.dataset.referenceId=a.id;
        reference.onclick=()=>{if($('input').disabled)return;dialog.close();window.insertAssetMention?.(a.id);};
        meta.append(name,description,reference);card.append(preview,meta);grid.append(card);
      }
    }
    dialog.querySelectorAll('[data-reference-id]').forEach(b=>{b.disabled=$('input').disabled;b.title=b.disabled?'游玩阶段输入开放后可引用':'';});
  }
  const oldRender=render;render=function(){oldRender();renderMaterials();};
  const oldRole=setRole;setRole=function(next){oldRole(next);if(dialog.open)dialog.close();materialKey='';if(next==='player'){['materialsOutline','materialsMainline','materialsSetting'].forEach(id=>$(id).textContent='');$('directorMaterial').hidden=true;}};
  renderMaterials();
})();
