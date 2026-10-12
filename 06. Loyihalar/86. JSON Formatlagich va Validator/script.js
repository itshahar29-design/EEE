
    window.formatJSON = () => {
        try {
            const parsed = JSON.parse(document.getElementById('json-in').value);
            document.getElementById('json-out').value = JSON.stringify(parsed, null, 2);
            document.getElementById('json-status').textContent = "✅ To'g'ri JSON!";
            document.getElementById('json-status').style.color = '#10b981';
        } catch (e) {
            document.getElementById('json-out').value = e.message;
            document.getElementById('json-status').textContent = '❌ Xatolik mavjud!';
            document.getElementById('json-status').style.color = '#ef4444';
        }
    };
    window.minifyJSON = () => {
        try {
            const parsed = JSON.parse(document.getElementById('json-in').value);
            document.getElementById('json-out').value = JSON.stringify(parsed);
        } catch (e) {
            alert('Xatolik: ' + e.message);
        }
    };
    formatJSON();
  