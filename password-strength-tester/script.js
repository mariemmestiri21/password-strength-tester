let breachedPasswords = [];

fetch('breach_list.txt')
  .then(response => response.text())
  .then(data => {
    breachedPasswords = data.split('\n');
  });

function calculateEntropy(password) {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/\d/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;

  const entropy = password.length * Math.log2(charsetSize);
  return entropy.toFixed(2);
}

function checkPassword() {
  const password = document.getElementById("password").value;
  const result = document.getElementById("result");
  const bar = document.getElementById("barFill");
  const suggestion = document.getElementById("suggestion");

  if (!password) {
    result.innerHTML = "";
    bar.style.width = "0%";
    suggestion.innerHTML = "";
    return;
  }

  let feedback = "";
  const entropy = calculateEntropy(password);
  const longEnough = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const breached = breachedPasswords.includes(password);

  if (breached) {
    feedback += "⚠️ This password was found in breach lists.<br>";
  }

  if (!longEnough) feedback += "❌ Too short. Use at least 8–12 characters.<br>";
  if (!(hasLower && hasUpper && hasDigit && hasSpecial)) {
    feedback += "❌ Use upper/lowercase, numbers, and symbols.<br>";
  }

  feedback += `🔐 Entropy: ${entropy} bits<br>`;

  const entropyNum = parseFloat(entropy);
  let strengthText = "";
  let color = "red", width = "20%";

  if (entropyNum < 28) {
    strengthText = "🟥 Very Weak";
    color = "red"; width = "20%";
  } else if (entropyNum < 36) {
    strengthText = "🟧 Weak";
    color = "orange"; width = "40%";
  } else if (entropyNum < 60) {
    strengthText = "🟨 Reasonable";
    color = "yellow"; width = "60%";
  } else if (entropyNum < 80) {
    strengthText = "🟩 Strong";
    color = "limegreen"; width = "80%";
  } else {
    strengthText = "🟦 Very Strong";
    color = "dodgerblue"; width = "100%";
  }

  bar.style.backgroundColor = color;
  bar.style.width = width;

  result.innerHTML = feedback + strengthText;
  suggestion.innerHTML = password.length < 12 ? "💡 Try a longer passphrase like 'Ocean*Blue3!Sky'" : "";
}

function validatePassword() {
  const password = document.getElementById("password").value;
  const entropy = parseFloat(calculateEntropy(password));
  const breached = breachedPasswords.includes(password);

  if (entropy >= 60 && !breached) {
    fetch('http://127.0.0.1:5000/save_password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: password })
    })
    .then(response => response.json())
    .then(data => {
      alert(" " + data.message);
    })
    .catch(error => {
      alert(" Failed to save password: " + error);
    });
  } else {
    alert(" Password is weak or found in breaches. Please try again.");
  }
}

function generatePassword() {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < 16; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  document.getElementById("password").value = password;
  checkPassword();
}