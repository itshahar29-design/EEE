
    document.getElementById('pw-in').oninput = (e) => {
        const val = e.target.value;
        let score = 0;
        if (val.length >= 8) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;
        const bar = document.getElementById('pw-bar');
        const st = document.getElementById('pw-status');
        const pct = (score / 4) * 100;
        bar.style.width = pct + '%';
        if (score <= 1) { bar.style.background = '#ef4444'; st.textContent = 'Zaif parol'; }
        else if (score <= 3) { bar.style.background = '#f59e0b'; st.textContent = "O'rtacha parol"; }
        else { bar.style.background = '#10b981'; st.textContent = 'Juda kuchli parol!'; }
    };
  