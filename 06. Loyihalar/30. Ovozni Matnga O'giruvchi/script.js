
    let rec = null;
    let isRec = false;
    const btn = document.getElementById('rec-btn');
    const out = document.getElementById('stt-output');

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (e) => {
            let res = '';
            for (let i = 0; i < e.results.length; i++) res += e.results[i][0].transcript;
            out.value = res;
        };
    }

    window.toggleRec = () => {
        if (!rec) return alert("Kechirasiz, brauzeringiz SpeechRecognition ni qo'llab-quvvatlamaydi.");
        if (!isRec) {
            rec.start();
            isRec = true;
            btn.innerHTML = '<i class="fa-solid fa-stop"></i> Yozishni To\'xtatish';
            btn.classList.add('btn-danger');
            btn.classList.remove('btn-success');
        } else {
            rec.stop();
            isRec = false;
            btn.innerHTML = '<i class="fa-solid fa-microphone"></i> Ovozni Yozishni Boshlash';
            btn.classList.add('btn-success');
            btn.classList.remove('btn-danger');
        }
    };
  