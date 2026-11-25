/* Participant-facing collection. No partner ratings, drafts or background answers. */
(() => {
  const style=document.createElement('style');
  style.textContent='.study-strip{margin:0 0 20px}.study-strip .row{flex-wrap:wrap}.study-badge{font-size:12px;color:var(--muted)}.study-private{margin-top:20px}.study-private h2{margin-bottom:8px}.study-private textarea{min-height:72px}.study-private select{margin-bottom:14px}.study-actions{display:flex;gap:10px;flex-wrap:wrap}.study-actions .danger{color:#ffd6ce;border-color:#a66f60}.study-heading{display:flex;justify-content:space-between;gap:15px;align-items:center}.record-status{font-size:12px;line-height:1.7;color:var(--muted)}';
  document.head.append(style);
  const strip=document.createElement('section');strip.id='studyStrip';strip.className='panel study-strip';strip.hidden=true;
  strip.innerHTML='<div class="study-heading"><div><div class="eyebrow">共同游玩 · 实验进度</div><h2 id="studyHeading"></h2><div id="studyStage" class="subtle"></div></div><span id="studyCohort" class="study-badge"></span></div><div class="row"><button id="studyPause" class="secondary">暂停</button><button id="studyStop" class="secondary danger">结束本次游玩</button><span id="studySafetyStatus" class="hint"></span></div>';
  document.querySelector('.grid').before(strip);
  const endedNotice=document.createElement('div');endedNotice.id='studyEndedNotice';endedNotice.className='callout';endedNotice.hidden=true;
  const endedReason=document.createElement('p');endedReason.id='studyEndedReason';
  const snapshotNote=document.createElement('p');snapshotNote.textContent='此房间保留创建时的故事和参考图。主持台后来保存的修改，只会用于新建房间。';
  const newPreview=document.createElement('a');newPreview.id='newStoryPreview';newPreview.textContent='选择最新故事，新建试玩房间 →';
  endedNotice.append(endedReason,snapshotNote,newPreview);strip.append(endedNotice);
  const aside=document.querySelector('aside');
  const panel=document.createElement('section');panel.id='studyPrivate';panel.className='panel study-private';panel.hidden=true;
  panel.innerHTML='<h2>我的实验记录</h2><p class="hint">背景题、评分和回顾说明仅本人及研究者可见，不展示给搭档。可以跳过任何题目。</p>'+
    '<details id="backgroundPanel"><summary>开始前 · 背景问题</summary><label for="bgGm">以往担任游戏主持人／GM 的次数</label><select id="bgGm"><option value="">跳过／暂不回答</option><option value="none">没有</option><option value="1-5">1–5 次</option><option value="6-20">6–20 次</option><option value="20+">超过 20 次</option></select><label for="bgGame">平时每周玩游戏的时间</label><select id="bgGame"><option value="">跳过／暂不回答</option><option value="none">基本不玩</option><option value="under_2h">少于 2 小时</option><option value="2-7h">2–7 小时</option><option value="over_7h">超过 7 小时</option></select><label for="bgFamiliar">实验前与搭档的熟悉程度</label><select id="bgFamiliar"><option value="">跳过／暂不回答</option><option value="strangers">此前不认识</option><option value="acquaintances">认识，但不熟悉</option><option value="friends">朋友／比较熟悉</option><option value="close">非常熟悉</option></select><button id="backgroundSave" class="secondary">保存背景回答（可全跳过）</button><p id="backgroundStatus" class="hint"></p></details>'+
    '<details id="recallPanel" hidden><summary>本块结束后 · 私密回顾</summary><p id="recallPrompt" class="hint"></p><label for="recallRound">对应轮次（可留空）</label><input id="recallRound" type="number" min="1"><label for="recallMoment">一个具体时刻</label><textarea id="recallMoment" maxlength="1500"></textarea><label for="recallReason">当时的想法、原因或希望实现什么</label><textarea id="recallReason" maxlength="1500"></textarea><label for="recallCounter">有没有与上述感受相反的时刻？（可留空）</label><textarea id="recallCounter" maxlength="1500"></textarea><button id="recallSave" class="secondary">保存回顾</button><p id="recallStatus" class="hint"></p></details>'+
    '<details id="recordPanel" hidden><summary>自愿录制本实验页面</summary><p class="hint">只选择当前实验标签页，不选择整个屏幕。停止后上传至实验后台，由主持人管理。录音需要单独同意；没有单独同意时仅录页面画面。</p><div class="study-actions"><button id="recordStart" class="secondary">选择实验标签页并开始</button><button id="recordStop" class="secondary" disabled>停止并保存</button></div><p id="recordStatus" class="record-status"></p></details>';
  aside.append(panel);
  const bgFields=document.createElement('div');bgFields.id='backgroundFields';
  const oldBackground=$('backgroundPanel');
  for(const e of Array.from(oldBackground.children)){if(!['SUMMARY','BUTTON','P'].includes(e.tagName))e.remove();}
  oldBackground.insertBefore(bgFields,$('backgroundSave'));
  const finalPanel=document.createElement('details');finalPanel.id='finalInterviewPanel';finalPanel.hidden=true;
  finalPanel.innerHTML='<summary>全场结束 · 个人回顾访谈</summary><p class="hint">两块都结束后，各自回顾，先不与搭档讨论。可自行填写，也可在个别访谈时记录；可跳过任何题目。网页文字记录不等于已经完成口头访谈。</p><label for="finalInterviewMode">本次记录方式</label><select id="finalInterviewMode"><option value="written">本人书面回顾</option><option value="interview_notes">个别访谈记录（已实际访谈）</option></select><div id="finalInterviewFields"></div><button id="finalInterviewSave" class="secondary">保存全场回顾（可全跳过）</button><p id="finalInterviewStatus" class="hint"></p>';
  panel.append(finalPanel);
  function collectionForms(s){
    bgFields.replaceChildren();
    for(const q of s.background_questions||[]){
      const label=document.createElement('label');label.htmlFor='background-'+q.key;label.textContent=q.label;
      const select=document.createElement('select');select.id=label.htmlFor;select.append(new Option('跳过／暂不回答',''));
      for(const [value,text] of q.choices)select.append(new Option(text,value));bgFields.append(label,select);
    }
    $('finalInterviewFields').replaceChildren();
    for(const q of s.final_interview_questions||[]){
      const label=document.createElement('label');label.htmlFor='final-'+q.key;label.textContent=q.label;
      const input=document.createElement('textarea');input.id=label.htmlFor;input.maxLength=1500;input.value=s.own_final_interview?.answers?.[q.key]||'';
      $('finalInterviewFields').append(label,input);
    }
    $('finalInterviewMode').value=s.own_final_interview?.mode||'written';
    $('finalInterviewStatus').textContent=s.own_final_interview?'已保存，可修改后再保存（保留修订记录）':'';
  }
  const access=document.createElement('div');access.id='accessCheck';access.hidden=true;
  access.innerHTML='<label for="informationAccess">决策窗口中，你实际能够看到玩家的什么信息？（可跳过）</label><select id="informationAccess"><option value="">跳过</option><option value="action_text">锁定行动的具体文字</option><option value="submission_notice">仅看到已经提交的提示</option><option value="other">其他信息／曾有场外交流</option><option value="unsure">不确定</option></select>';
  $('questions').after(access);
  const host=document.createElement('p');host.innerHTML='<a href="/study-admin" target="_blank" rel="noopener">打开实验主持台：方案、场次、编码与导出 →</a>';$('adminPanel').append(host);
  let formKey='',backgroundLoaded=false,visibilityKey='',lastClock=0,recorder=null,recordStream=null,recordChunks=[],recordContext=null,recordTimer=null;
  const baseApi=api;api=async function(path,body){
    if(body!==undefined)body={...body,client_ui_version:window.PAGE_UI_VERSION};
    if(body&&path.endsWith('/playback'))body.playback_context=reviewing?'review':'live';
    return baseApi(path,body);
  };
  const baseSetRole=setRole;setRole=function(next){
    if(recorder&&recorder.state==='recording'&&next!==role){msg('请先停止录制，再切换调试角色。',true);return;}
    if(next!==role){formKey='';$('studyPrivate').hidden=true;['recallMoment','recallReason','recallCounter','recallRound'].forEach(id=>$(id).value='');}
    baseSetRole(next);
  };
  const baseChangeRole=changeRole;changeRole=async function(next){
    if(recorder?.state==='recording'&&next!==role){msg('请先停止录制，再切换调试角色。',true);return;}
    return baseChangeRole(next);
  };
  const basePlay=play;play=async function(part){if(state?.study?.paused)return;return basePlay(part);};
  function event(kind,more={}){if(!token||!state?.study)return;api('/rooms/'+rid+'/client-event',{event:kind,round:roundNo,client_epoch_ms:Date.now(),client_elapsed_ms:performance.now(),clock_offset_ms:clockOffset,clock_rtt_ms:Number.isFinite(clockRTT)?clockRTT:null,measurement_id:measurementId,ui_version:window.PAGE_UI_VERSION,...more}).catch(()=>{});}
  function renderStudy(){
    const s=state?.study;$('studyStrip').hidden=!s;$('studyPrivate').hidden=!s;
    const story=state?.story;
    const scene=$('sceneImage');if(scene&&state?.assets?.length){const a=state.assets.find(a=>a.kind==='place'&&a.current)||state.assets.find(a=>a.control==='user');if(a){const key=rid+':'+role+':'+a.id+':'+(state.story?.revision||'');if(scene.dataset.assetKey!==key){scene.src=hciApiURL(a.image_url)+'?token='+encodeURIComponent(token);scene.alt=a.name+'的开场参考图';scene.dataset.assetKey=key;}scene.hidden=false;}}
    if(!s){
      if($('studyOutline'))$('studyOutline').hidden=true;
      if(story){
        if(role==='player')$('roleHelp').textContent='你扮演'+story.protagonist+'。描述其尝试、观察或选择，结果由世界回应。';
        $('directorCards').hidden=true;

      }
      return;
    }
    const names={setup:'等待主持人开始准备',preparation:'阅读材料与独立准备',playing:'共同游玩',rating:'本块已结束，行动输入已锁定；请独立填写反馈',closed:'本块已结束，行动输入已锁定',stopped:'已停止，行动输入已锁定'};
    $('studyHeading').textContent=(s.block===0?'练习故事':'第 '+s.block+' 块')+' · '+state.title;
    $('studyCohort').textContent=({debug:'调试记录 · 非参与者数据',replay:'回放验收 · 非新生成',capability:'系统能力检查',pilot:'预试',main:'正式场次'}[s.cohort]||s.cohort);
    let remaining=s.deadline_epoch?Math.max(0,s.deadline_epoch-Date.now()/1000-clockOffset/1000):null;
    $('studyStage').textContent=(s.paused?'已暂停；请联系主持人。':names[s.stage]||s.stage)+(s.stage==='playing'&&remaining!==null?' · 剩余 '+Math.ceil(remaining/60)+' 分钟 · 最多 '+s.max_rounds+' 轮':'');
    $('roomLabel').textContent='房间 '+rid+' · '+(s.block===0?'练习':'第 '+s.block+' 块')+' · '+directorWindowLabel();
    if(role==='player')$('roleHelp').textContent='你扮演'+s.protagonist+'。描述其尝试、观察或选择，结果由世界回应。';
    const playing=s.stage==='playing'&&!s.paused&&!state.maintenance;
    const prepDraft=s.stage==='preparation'&&role==='director'&&!s.paused&&!state.maintenance&&state.round.phase==='preparing';
    if(!playing){$('input').disabled=!prepDraft;$('submit').disabled=true;$('pass').disabled=true;$('next').hidden=true;}
    if(s.stage==='setup'||s.stage==='preparation'){
      $('status').textContent=s.stage==='setup'?'等待主持人点击“开始准备”。':'正在阅读材料与独立准备；游玩计时尚未开始。';
      if(role==='director')$('visibility').textContent=prepDraft?'现在可以编辑并保存导演草稿。主持人开始游玩、玩家锁定行动后，才能提交介入或不介入。':s.paused?'已暂停；恢复后可以继续编辑。':'等待主持人点击“开始准备”后开放导演草稿。';
      $('rule').textContent='准备阶段只保存草稿，不提交生成，也不启动导演决策倒计时。';
    }
    if(s.paused)videos.forEach(v=>v.pause());
    const post=['rating','closed','stopped'].includes(s.stage);
    endedNotice.hidden=!post;
    if(post){
      const reason={time_limit:'本块已达到预设时长上限',round_limit:'本块已达到预设轮数上限'}[s.stop_reason]||'本块已结束';
      endedReason.textContent=reason+'，因此不能继续输入行动。已有记录保留。';
      newPreview.hidden=!local;newPreview.href='/?setup=1&story='+encodeURIComponent(s.story_id);
    }
    if(post)$('status').textContent=state.round.segments.length?'本块已结束。可回看已有视频，并独立填写反馈。':'本块已结束；本轮没有生成视频，请独立填写或跳过反馈。';
    if(!online&&s.stage!=='playing')$('offline').textContent='视频生成服务未连接。仍可准备实验材料、填写表单和查看已有记录。';
    $('studyPause').disabled=post;$('studyStop').disabled=post;
    $('surveyPanel').hidden=!post;$('recallPanel').hidden=!post;$('accessCheck').hidden=role!=='director';
    $('recordPanel').hidden=!s.recording_permission?.screen;
    if(s.recording_permission?.screen&&!navigator.mediaDevices?.getDisplayMedia){$('recordStart').disabled=true;$('recordStatus').textContent='当前网址不支持浏览器录屏。主持人需使用经过同意的应用窗口录制方式，并在主持台关联文件编号。';}
    $('directorCards').hidden=true;
    finalPanel.hidden=!(post&&s.block===2&&s.final_interview_questions?.length);
    if(s.no_new_rounds&&s.stage==='playing')$('studyStage').textContent='本块时限已到；完成当前轮观看并双方确认后进入反馈，不再开启新轮。';
    const key=[rid,role,s.instrument_version,s.collection_version].join(':');
    if(formKey!==key){
      formKey=key;backgroundLoaded=false;
      collectionForms(s);
      buildSurvey();
      s.questions.forEach((q,i)=>{const l=document.querySelector('label[for="rating'+i+'"]');if(l)l.textContent=q;$('rating'+i).options[0].textContent='跳过／暂不回答';$('rating'+i).value=s.own_survey?.ratings?.[i]??'';});
      $('comment').value=s.own_survey?.comment||'';$('informationAccess').value=s.own_survey?.information_access||'';
      $('surveyStatus').textContent=s.own_survey?'已保存，可修改后再保存（保留修订记录）':'';
      $('recallMoment').value=s.own_interview?.moment||'';$('recallReason').value=s.own_interview?.reason||'';$('recallCounter').value=s.own_interview?.contradictory_example||'';$('recallRound').value=s.own_interview?.round||'';
      $('recallStatus').textContent='';$('backgroundStatus').textContent='';
      $('recallPrompt').textContent=role==='player'?'请回想一个世界回应或没有回应你具体行动的时刻。':'请回想一次改变计划、选择不介入，或感到自己的想法受到支持／限制的时刻。';
    }
    if(!backgroundLoaded){backgroundLoaded=true;const a=s.own_background?.answers||{};for(const q of s.background_questions||[])$('background-'+q.key).value=a[q.key]||'';$('backgroundPanel').open=!s.background_complete;$('backgroundStatus').textContent=s.background_complete?'背景回答已保存':'';}
    if(state.round.phase==='window'&&role==='director'){
      const key=rid+':'+roundNo+':'+role;
      if(visibilityKey!==key){visibilityKey=key;event('visibility_shown',{information:state.round.visible_action===null?'submission_notice':'action_text'});}
    }
    if(Date.now()-lastClock>30000){lastClock=Date.now();event('clock_sync');}
  }
  const baseRender=render;render=function(){baseRender();renderStudy();};
  $('backgroundSave').onclick=async()=>{try{const answers={};for(const q of state.study.background_questions||[])answers[q.key]=$('background-'+q.key).value||null;await api('/rooms/'+rid+'/background',answers);$('backgroundStatus').textContent='已保存；未回答的题目保留为空';}catch(e){$('backgroundStatus').textContent=e.message;}};
  $('finalInterviewSave').onclick=async()=>{try{const answers={};for(const q of state.study.final_interview_questions||[])answers[q.key]=$('final-'+q.key).value||null;await api('/rooms/'+rid+'/final-interview',{answers,mode:$('finalInterviewMode').value});$('finalInterviewStatus').textContent='已私密保存；跳答保留为空';}catch(e){$('finalInterviewStatus').textContent=e.message;}};
  $('surveySave').onclick=async()=>{try{await api('/rooms/'+rid+'/survey',{ratings:[0,1,2].map(i=>$('rating'+i).value?Number($('rating'+i).value):null),comment:$('comment').value,information_access:$('informationAccess').value||null});$('surveyStatus').textContent='已私密保存；跳答不会被补成中间分数';}catch(e){$('surveyStatus').textContent=typeof e.message==='string'?e.message:'保存失败';}};
  $('recallSave').onclick=async()=>{try{await api('/rooms/'+rid+'/interview',{round:$('recallRound').value?Number($('recallRound').value):null,moment:$('recallMoment').value,reason:$('recallReason').value,contradictory_example:$('recallCounter').value});$('recallStatus').textContent='已私密保存';}catch(e){$('recallStatus').textContent=e.message;}};
  for(const [id,action] of [['studyPause','pause'],['studyStop','stop']])$(id).onclick=async()=>{
    if(action==='stop'&&!$('studyStop').dataset.confirm){$('studyStop').dataset.confirm='1';$('studyStop').textContent='确认结束本块';$('studySafetyStatus').textContent='再次点击确认，进入反馈；已有记录保留。';return;}
    videos.forEach(v=>v.pause());$('review').pause();if(recorder?.state==='recording')recorder.stop();
    try{const value=await api('/rooms/'+rid+'/study-safety',{action});$('studySafetyStatus').textContent=value.note;await poll();}catch(e){$('studySafetyStatus').textContent=e.message;}
  };
  document.addEventListener('visibilitychange',()=>event('page_visibility',{visible:!document.hidden}));
  $('recordStart').onclick=async()=>{
    try{
      if(!state?.study?.recording_permission?.screen)throw Error('尚未记录屏幕录制同意');
      const audio=!!state.study.recording_permission.audio;
      const stream=await navigator.mediaDevices.getDisplayMedia({video:{displaySurface:'browser'},audio,preferCurrentTab:true});
      if(stream.getVideoTracks()[0].getSettings().displaySurface!=='browser'){stream.getTracks().forEach(t=>t.stop());throw Error('只可录制实验标签页，请重新选择当前页面。');}
      if(!audio)stream.getAudioTracks().forEach(t=>{t.stop();stream.removeTrack(t);});
      recordStream=stream;recordChunks=[];recordContext={rid,role,token,started:Date.now(),audio:stream.getAudioTracks().length>0};
      recorder=new MediaRecorder(stream);let bytes=0;
      recorder.ondataavailable=e=>{if(e.data.size){recordChunks.push(e.data);bytes+=e.data.size;if(bytes>220*1024*1024&&recorder.state==='recording')recorder.stop();}};
      recorder.onstop=async()=>{
        clearTimeout(recordTimer);stream.getTracks().forEach(t=>t.stop());$('recordStop').disabled=true;$('recordStart').disabled=false;
        const blob=new Blob(recordChunks,{type:recorder.mimeType});const context=recordContext;
        try{const response=await fetch(hciApiURL('/rooms/'+context.rid+'/recording'),{method:'POST',headers:{Authorization:'Bearer '+context.token,'Content-Type':blob.type,'X-Recording-Audio':String(context.audio),'X-Recording-Started':String(context.started)},body:blob});if(!response.ok)throw Error((await response.json()).detail||'上传失败');$('recordStatus').textContent='本段录制已保存到实验后台';event('recording_stopped');}
        catch(e){const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='study-recording.webm';link.textContent='下载本段录制，交给主持人保存';$('recordStatus').textContent='上传失败：'+e.message+' ';$('recordStatus').append(link);}
      };
      stream.getVideoTracks()[0].onended=()=>{if(recorder.state==='recording')recorder.stop();};
      recorder.start(1000);recordTimer=setTimeout(()=>{if(recorder.state==='recording')recorder.stop();},25*60*1000);
      $('recordStart').disabled=true;$('recordStop').disabled=false;$('recordStatus').textContent='正在录制当前标签页'+(recordContext.audio?'（含标签页声音）':'（无声音）')+'；可随时停止。';event('recording_started');
    }catch(e){$('recordStatus').textContent=e.message;}
  };
  $('recordStop').onclick=()=>{if(recorder?.state==='recording')recorder.stop();};
  renderStudy();
})();
