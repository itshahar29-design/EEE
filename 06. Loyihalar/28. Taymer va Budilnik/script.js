
    let alarmTarget = null;
    setInterval(() => {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        document.getElementById('alarm-clock').textContent = timeStr;
        if (alarmTarget && timeStr.startsWith(alarmTarget)) {
            alert("⏰ BUDILNIK JIRINGLADI! VAQT BO'LDI!");
            alarmTarget = null;
            document.getElementById('alarm-status').textContent = "Budilnik o'chiq";
        }
    }, 1000);
    window.setAlarm = () => {
        const val = document.getElementById('alarm-time').value;
        if (!val) return alert('Vaqtni belgilang!');
        alarmTarget = val;
        document.getElementById('alarm-status').textContent = 'Budilnik ' + val + " ga qo'yildi!";
    };
  