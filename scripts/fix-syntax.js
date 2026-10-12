// scripts/fix-syntax.js
const fs = require('fs');
const path = require('path');
const dir = path.resolve(__dirname, '..', '06. Loyihalar');

function fix(folder, from, to) {
  const p = path.join(dir, folder, 'script.js');
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(from, to);
  fs.writeFileSync(p, c, 'utf8');
  console.log('Fixed', folder);
}

fix('03. Ob-havo Ilovasi', "desc: 'Yomg'irli'", "desc: \"Yomg'irli\"");
fix('17. BMI Tana Vazni Kalkulyatori', "alert('Iltimos, ma'lumotlarni kiriting!');", "alert(\"Iltimos, ma'lumotlarni kiriting!\");");
fix('28. Taymer va Budilnik', "alert('⏰ BUDILNIK JIRINGLADI! VAQT BO'LDI!');", "alert(\"⏰ BUDILNIK JIRINGLADI! VAQT BO'LDI!\");");
fix('28. Taymer va Budilnik', "textContent = 'Budilnik o'chiq';", "textContent = \"Budilnik o'chiq\";");
fix('28. Taymer va Budilnik', "textContent = 'Budilnik ' + val + ' ga qo'yildi!';", "textContent = 'Budilnik ' + val + \" ga qo'yildi!\";");
fix("30. Ovozni Matnga O'giruvchi", "alert('Kechirasiz, brauzeringiz SpeechRecognition ni qo'llab-quvvatlamaydi.');", "alert(\"Kechirasiz, brauzeringiz SpeechRecognition ni qo'llab-quvvatlamaydi.\");");
fix('31. Tic-Tac-Toe', "textContent = '🎉 ' + board[w[0]] + ' G'OLIB BO'LDI!';", "textContent = '🎉 ' + board[w[0]] + \" G'OLIB BO'LDI!\";");
fix('31. Tic-Tac-Toe', "textContent = 'X o'yinchining navbati';", "textContent = \"X o'yinchining navbati\";");
fix('69. Parol Kuchini Tekshiruvchi', "st.textContent = 'O'rtacha parol';", "st.textContent = \"O'rtacha parol\";");
fix('86. JSON Formatlagich va Validator', "textContent = '✅ To'g'ri JSON!';", "textContent = \"✅ To'g'ri JSON!\";");
