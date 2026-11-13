(function(){
  'use strict';

  var audio=document.getElementById('bgMusic');
  var trigger=document.getElementById('musicBtn');
  if(!audio||!trigger)return;

  var overlay=document.createElement('div');
  overlay.className='music-modal-overlay';
  overlay.setAttribute('aria-hidden','true');

  var modal=document.createElement('section');
  modal.className='music-modal';
  modal.setAttribute('role','dialog');
  modal.setAttribute('aria-modal','true');
  modal.setAttribute('aria-labelledby','musicModalTitle');
  modal.innerHTML='<div class="music-modal-top"><div class="music-modal-cover"><img alt=""></div><div class="music-modal-info"><div class="music-modal-title" id="musicModalTitle"></div><div class="music-modal-artist">PRECIOUS MESS · BACKGROUND MUSIC</div></div><button class="music-modal-play" type="button" aria-label="播放">▶</button></div><div class="music-modal-bottom"><span class="music-modal-current">00:00</span><div class="music-modal-progress"><div class="music-modal-progress-fill"></div></div><span class="music-modal-duration">00:00</span></div>';
  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  var title=modal.querySelector('.music-modal-title');
  var cover=modal.querySelector('.music-modal-cover img');
  var playButton=modal.querySelector('.music-modal-play');
  var currentTime=modal.querySelector('.music-modal-current');
  var duration=modal.querySelector('.music-modal-duration');
  var progress=modal.querySelector('.music-modal-progress-fill');
  var wasNoScroll=false;
  var isOpen=false;

  var source=audio.querySelector('source');
  if(source){
    var fileName=decodeURIComponent(new URL(source.getAttribute('src'),document.baseURI).pathname.split('/').pop()||'');
    var trackName=fileName.replace(/\.[^.]+$/,'');
    title.textContent=trackName||'Background Music';
    cover.src='post/'+encodeURIComponent(trackName)+'.jpg';
    cover.onerror=function(){cover.onerror=null;cover.src='photo/touxiang1.jpg';};
    cover.alt=trackName?trackName+' 封面':'音乐封面';
  }else{
    title.textContent='Background Music';
    cover.src='photo/touxiang1.jpg';
    cover.alt='音乐封面';
  }

  trigger.setAttribute('aria-haspopup','dialog');
  trigger.setAttribute('aria-expanded','false');
  trigger.setAttribute('aria-label','打开音乐播放器');

  function formatTime(seconds){
    if(!isFinite(seconds)||seconds<0)seconds=0;
    seconds=Math.floor(seconds);
    return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');
  }

  function paint(){
    var playing=!audio.paused;
    trigger.classList.toggle('playing',playing);
    modal.classList.toggle('is-playing',playing);
    playButton.textContent=playing?'❚❚':'▶';
    playButton.setAttribute('aria-label',playing?'暂停':'播放');
    currentTime.textContent=formatTime(audio.currentTime);
    duration.textContent=formatTime(audio.duration);
    progress.style.width=isFinite(audio.duration)&&audio.duration>0?(audio.currentTime/audio.duration*100)+'%':'0%';
  }

  function setOpen(open){
    if(isOpen===open)return;
    isOpen=open;
    overlay.classList.toggle('active',open);
    modal.classList.toggle('active',open);
    overlay.setAttribute('aria-hidden',String(!open));
    trigger.setAttribute('aria-expanded',String(open));
    if(open){
      wasNoScroll=document.body.classList.contains('no-scroll');
      document.body.classList.add('no-scroll');
      playButton.focus();
    }else{
      if(!wasNoScroll)document.body.classList.remove('no-scroll');
      trigger.focus();
    }
  }

  trigger.addEventListener('click',function(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    setOpen(!isOpen);
    if(audio.paused){
      var request=audio.play();
      if(request&&typeof request.catch==='function')request.catch(function(error){
        if(error.name!=='NotAllowedError'&&error.name!=='AbortError')console.error('背景音乐播放失败:',error);
      });
    }
  },true);
  overlay.addEventListener('click',function(){setOpen(false);});
  playButton.addEventListener('click',function(){
    if(audio.paused){
      var request=audio.play();
      if(request&&typeof request.catch==='function')request.catch(function(error){
        if(error.name!=='NotAllowedError'&&error.name!=='AbortError')console.error('背景音乐播放失败:',error);
      });
    }else audio.pause();
  });
  document.addEventListener('keydown',function(event){
    if(event.key==='Escape'&&isOpen)setOpen(false);
  });
  ['play','pause','timeupdate','durationchange','loadedmetadata','ended'].forEach(function(type){
    audio.addEventListener(type,paint);
  });
  paint();
})();
