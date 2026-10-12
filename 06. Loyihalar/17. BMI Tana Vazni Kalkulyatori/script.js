
    window.calcBMI = () => {
        const h = parseFloat(document.getElementById('bmi-height').value) / 100;
        const w = parseFloat(document.getElementById('bmi-weight').value);
        if (!h || !w) return alert("Iltimos, ma'lumotlarni kiriting!");
        const bmi = (w / (h * h)).toFixed(1);
        document.getElementById('bmi-val').textContent = bmi;
        let status = 'Normal vazn', color = '#10b981';
        if (bmi < 18.5) { status = 'Vazn yetishmasligi'; color = '#38bdf8'; }
        else if (bmi >= 25 && bmi < 29.9) { status = 'Ortiqcha vazn'; color = '#f59e0b'; }
        else if (bmi >= 30) { status = 'Semizlik'; color = '#ef4444'; }
        const stEl = document.getElementById('bmi-status');
        stEl.textContent = status;
        stEl.style.color = color;
        document.getElementById('bmi-result').style.display = 'block';
    };
  