let currentArcher = 1;
let currentEditingArcher = null;
const GOOGLE_FORM_URL = 'https://forms.gle/u9D7inN4H9L2GTjk6';

const keyboardLayout = [
  ['X', '10', '9', '8', '7'],
  ['6', '5', '4', '3'],
  ['2', '1', 'M', 'Del']
];

const colors = {
  "X": { background: "#FFD700", text: "#000000" },
  "10": { background: "#FFD700", text: "#000000" },
  "9": { background: "#FFD700", text: "#000000" },
  "8": { background: "#FF6347", text: "#FFFFFF" },
  "7": { background: "#FF6347", text: "#FFFFFF" },
  "6": { background: "#1E90FF", text: "#FFFFFF" },
  "5": { background: "#1E90FF", text: "#FFFFFF" },
  "4": { background: "#333333", text: "#FFFFFF" },
  "3": { background: "#333333", text: "#FFFFFF" },
  "2": { background: "#ffffff", text: "#000000" },
  "1": { background: "#ffffff", text: "#000000" },
  "M": { background: "#ffffff", text: "#000000" }
};

function toggleMenu() {
  const menu = document.getElementById('menuItems');
  menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
}

function openArchers() {
  toggleMenu();
  openArchersEditModal();
}

function exportToGoogleSheet() {
  toggleMenu();
  alert('Export to Google Sheets not implemented yet!');
  // Later: actual Google Sheets export code
}

function resetAll() {
  toggleMenu();
  if (confirm('Êtes-vous sûr de vouloir tout réinitialiser?')) {
    resetScores();
  }
}

window.onload = function() {
  createArcherForms(4);
  buildKeyboard();
  loadAllArchers();
  showArcher(1);
  updateSumsAndCumul();
  updateSummary();
};


function createArcherForms(numArchers = 4) {
  const container = document.getElementById('archersContainer');
  for (let i = 1; i <= numArchers; i++) {
    const archerDiv = document.createElement('div');
    archerDiv.className = 'archer-info';
    archerDiv.id = `archerInfo${i}`;
    archerDiv.innerHTML = `
      <div class="archer-header" id="archerHeader${i}"></div>
      <div id="table${i}"></div>
    `;
    container.appendChild(archerDiv);
    buildArcherTable(`table${i}`);
  }
}

function buildArcherTable(containerId) {
  const container = document.getElementById(containerId);
  const table = document.createElement('table');
  
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th class="spacer-cell";></th>
      <th colspan="3">3 flèches</th>
      <th>Tot.</th>
      <th>Cum.</th>
      <th class="spacer-cell";"></th>
      <th class="spacer-cell";></th>
      <th colspan="3">3 flèches</th>
      <th>Tot.</th>
      <th>Cum.</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  let arrowNumber = 1;
  let arrowNumberRight = 31;
  
  for (let line = 1; line <= 10; line++) {
    const tr = document.createElement('tr');

    // LEFT SIDE
    tr.appendChild(makeLineCell(line));
    for (let i = 0; i < 3; i++) {
      tr.appendChild(makeArrowCell('arrow_' + arrowNumber));
      arrowNumber++;
    }
    tr.appendChild(makeSumCell('sum_left_' + line));
    tr.appendChild(makeCumulCell('cumul_left_' + line));

    // SPACER
    const spacer = document.createElement('td');
    spacer.style.minWidth = "2px";
    spacer.style.border = "none";
    tr.appendChild(spacer);

    // RIGHT SIDE
    tr.appendChild(makeLineCell(line + 10));
    for (let i = 0; i < 3; i++) {
      tr.appendChild(makeArrowCell('arrow_' + arrowNumberRight));
      arrowNumberRight++;
    }
    tr.appendChild(makeSumCell('sum_right_' + line));
    tr.appendChild(makeCumulCell('cumul_right_' + line));

    tbody.appendChild(tr);
  }

  container.appendChild(table);
}

function makeLineCell(text) {
  const td = document.createElement('td');
  td.style.minWidth = "20px";
  td.style.fontSize = "12px";
  td.innerText = text;
  return td;
}

function makeArrowCell(id) {
  const td = document.createElement('td');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'score-input';
  input.id = id;
  input.readOnly = true;
  input.addEventListener('focus', () => setActiveInput(input));
  td.appendChild(input);
  return td;
}

function makeSumCell(id) {
  const td = document.createElement('td');
  td.id = id;
  return td;
}

function makeCumulCell(id) {
  const td = document.createElement('td');
  td.id = id;
  return td;
}

let activeInput = null;
function setActiveInput(input) {
  if (activeInput) activeInput.classList.remove('active-input');
  activeInput = input;
  activeInput.classList.add('active-input');
}

function buildKeyboard() {
  const keyboard = document.getElementById('keyboard');
  ['X', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'M'].forEach(val => {
	const key = document.createElement('div');
	key.className = 'key';
	key.innerText = val;
	key.style.background = colors[val]?.background || '#ddd';
	key.style.color = colors[val]?.text || '#000000';
	key.onclick = () => {
	  if (activeInput) {
		activeInput.value = val;
		activeInput.style.background = colors[val]?.background || '#fff';
		activeInput.style.color = colors[val]?.text || '#000000';
		moveNextInput();
		updateSumsAndCumul();
		updateSummary();
		saveAllArchers();
	  }
	};
	keyboard.appendChild(key);
  });
}

document.getElementById('deleteBar').onclick = function() {
  if (!activeInput) return;
  
  activeInput.value = '';
  activeInput.style.background = '';
  activeInput.style.color = '';
  moveNextInput();
  updateSumsAndCumul();
  updateSummary();
  saveAllArchers();
};

function saveAllArchers() {
  const archers = {};
  for (let i = 1; i <= 4; i++) {
    const name = document.getElementById('archerHeader' + i).dataset.name || '';
    const uniqueID = document.getElementById('archerHeader' + i).dataset.id || '';
    const target = document.getElementById('archerHeader' + i).dataset.target || '';
    const position = document.getElementById('archerHeader' + i).dataset.position || '';
    const scores = Array.from(document.querySelectorAll(`#archerInfo${i} .score-input`)).map(input => input.value);
    archers[i] = { name, uniqueID, target, position, scores };
  }
  localStorage.setItem('archersData', JSON.stringify(archers));
}

function loadAllArchers() {
  const data = JSON.parse(localStorage.getItem('archersData'));
  if (!data) return;
  for (let i = 1; i <= 4; i++) {
    const archer = data[i];
    if (!archer) continue;
    const header = document.getElementById('archerHeader' + i);
    header.dataset.name = archer.name || '';
    header.dataset.id = archer.uniqueID || '';
    header.dataset.target = archer.target || '';
    header.dataset.position = archer.position || '';
    //header.innerText = formatHeader(archer.target, archer.position, archer.name);
    const inputs = document.querySelectorAll(`#archerInfo${i} .score-input`);
	(archer.scores || []).forEach((score, idx) => {
	  if (inputs[idx]) {
		inputs[idx].value = score;
		inputs[idx].style.background = colors[score]?.background || '#fff';
		inputs[idx].style.color = colors[score]?.text || '#000000';
	  }
	});
  }
}

function resetScores() {
  localStorage.removeItem('archersData');
  location.reload();
}

function previousArcher() {
  currentArcher--;
  if (currentArcher < 1) currentArcher = 4;
  showArcher(currentArcher);
}

function nextArcher() {
  currentArcher++;
  if (currentArcher > 4) currentArcher = 1;
  showArcher(currentArcher);
}

function showArcher(index) {
  for (let i = 1; i <= 4; i++) {
    document.getElementById('archerInfo' + i).style.display = (i === index) ? 'block' : 'none';
  }
  updateArcherInfoDisplay();
  updateSumsAndCumul();
  updateSummary();
  focusFirstEmptyInput();
}

function updateArcherInfoDisplay() {
  const index = currentArcher;
  
  const header = document.getElementById('archerHeader' + index);
  const name     = header.dataset.name || '';
  const uniqueID = header.dataset.id || '';
  const target   = header.dataset.target || '';
  const position = header.dataset.position || '';

  const display = document.getElementById('archerInfoDisplay');
  if (currentArcher) {
    display.innerText = `${target || "-"}${position || "-"} ${name || "-"} `;
  } else {
	display.innerText = "Assigner un Archer";
  }
}

function moveNextInput() {
  const currentArcher = document.querySelector('.archer-info[style*="block"]'); 
  if (!currentArcher) return; // Safety: no visible archer

  const inputs = [
    ...Array.from({length: 30}, (_, i) => currentArcher.querySelector('#arrow_' + (i + 1))),
    ...Array.from({length: 30}, (_, i) => currentArcher.querySelector('#arrow_' + (i + 31)))
  ];
  
  const idx = inputs.indexOf(activeInput);
  if (idx >= 0 && idx < inputs.length - 1) {
    inputs[idx + 1].focus();
  }
}

function updateSumsAndCumul() {
  let cumulativeLeft = 0;
  let cumulativeRight = 0;
  
  const currentArcher = document.querySelector('.archer-info[style*="block"]'); 
  if (!currentArcher) return; // Safety: no visible archer

  for (let line = 1; line <= 10; line++) {
    // Left Side
    let el1 = currentArcher.querySelector('#arrow_' + (3 * (line - 1) + 1));
    let el2 = currentArcher.querySelector('#arrow_' + (3 * (line - 1) + 2));
    let el3 = currentArcher.querySelector('#arrow_' + (3 * (line - 1) + 3));

    let val1 = parseScore(el1?.value || "");
    let val2 = parseScore(el2?.value || "");
    let val3 = parseScore(el3?.value || "");
    let sumLeft = val1 + val2 + val3;

    const anyInputLeft = el1?.value !== "" || el2?.value !== "" || el3?.value !== "";

    const sumLeftCell = currentArcher.querySelector('#sum_left_' + line);
    const cumulLeftCell = currentArcher.querySelector('#cumul_left_' + line);

    if (sumLeftCell) sumLeftCell.innerText = anyInputLeft ? sumLeft : "";

    if (anyInputLeft) {
      cumulativeLeft += sumLeft;
      if (line === 1) {
        cumulLeftCell.innerText = "";
        cumulLeftCell.classList.add('diagonal-cell');
      } else {
        cumulLeftCell.innerText = cumulativeLeft;
        cumulLeftCell.classList.remove('diagonal-cell');
      }
    } else {
      cumulLeftCell.innerText = "";
      cumulLeftCell.classList.remove('diagonal-cell');
    }

    // Right Side (same logic)
    let elR1 = currentArcher.querySelector('#arrow_' + (30 + 3 * (line - 1) + 1));
    let elR2 = currentArcher.querySelector('#arrow_' + (30 + 3 * (line - 1) + 2));
    let elR3 = currentArcher.querySelector('#arrow_' + (30 + 3 * (line - 1) + 3));

    let valR1 = parseScore(elR1?.value || "");
    let valR2 = parseScore(elR2?.value || "");
    let valR3 = parseScore(elR3?.value || "");
    let sumRight = valR1 + valR2 + valR3;

    const anyInputRight = elR1?.value !== "" || elR2?.value !== "" || elR3?.value !== "";

    const sumRightCell = currentArcher.querySelector('#sum_right_' + line);
    const cumulRightCell = currentArcher.querySelector('#cumul_right_' + line);

    if (sumRightCell) sumRightCell.innerText = anyInputRight ? sumRight : "";

    if (anyInputRight) {
      cumulativeRight += sumRight;
      if (line === 1) {
        cumulRightCell.innerText = "";
        cumulRightCell.classList.add('diagonal-cell');
      } else {
        cumulRightCell.innerText = cumulativeRight;
        cumulRightCell.classList.remove('diagonal-cell');
      }
    } else {
      cumulRightCell.innerText = "";
      cumulRightCell.classList.remove('diagonal-cell');
    }
  }
}

function updateSummary() {
  const currentArcher = document.querySelector('.archer-info[style*="block"]');
  if (!currentArcher) return;

  let count10 = 0;
  let count9 = 0;
  let totalPoints = 0;

  for (let i = 1; i <= 60; i++) {
    const input = currentArcher.querySelector('#arrow_' + i);
    const val = input?.value;
    if (val === "X" || val === "10") count10++;
    else if (val === "9") count9++;
    const points = parseScore(val);
    totalPoints += points;
  }

  document.getElementById('count10').innerText = count10;
  document.getElementById('count9').innerText = count9;
  document.getElementById('total60').innerText = totalPoints;
}


function parseScore(val) {
  if (val === "X") return 10;
  if (val === "M" || val === "") return 0;
  const num = parseInt(val);
  return isNaN(num) ? 0 : num;
}

function focusFirstEmptyInput() {
  const currentArcher = document.querySelector('.archer-info[style*="block"]');
  if (!currentArcher) return; // no archer visible

  const inputs = [];

  // First left side arrows (1 to 30)
  for (let i = 1; i <= 30; i++) {
    const input = currentArcher.querySelector(`#arrow_${i}`);
    if (input) inputs.push(input);
  }
  // Then right side arrows (31 to 60)
  for (let i = 31; i <= 60; i++) {
    const input = currentArcher.querySelector(`#arrow_${i}`);
    if (input) inputs.push(input);
  }

  for (let input of inputs) {
    if (!input.value) {
      setActiveInput(input);
      input.focus();
      return;
    }
  }

  // If all filled, stay on last
  const lastInput = inputs[inputs.length - 1];
  if (lastInput) {
    setActiveInput(lastInput);
    lastInput.focus();
  }
}

function openArchersEditModal() {
  const tbody = document.querySelector('#archersEditTable tbody');
  tbody.innerHTML = ''; // Clear existing rows

  for (let i = 1; i <= 4; i++) {
    const header = document.getElementById('archerHeader' + i);

    const row = document.createElement('tr');

    row.innerHTML = `
      <td><strong>${i}</strong></td>
      <td><input type="text" id="archerName${i}" value="${header.dataset.name || ''}"></td>
      <td><input type="text" id="archerId${i}" value="${header.dataset.id || ''}"></td>
      <td><input type="text" id="archerTarget${i}" value="${header.dataset.target || ''}"></td>
      <td><input type="text" id="archerPosition${i}" value="${header.dataset.position || ''}"></td>
    `;

    tbody.appendChild(row);
  }

  document.getElementById('archersEditModal').style.display = 'block';
}

function closeArchersEditModal() {
  document.getElementById('archersEditModal').style.display = 'none';
}

function saveAllArchersInfo() {
  for (let i = 1; i <= 4; i++) {
    const header = document.getElementById('archerHeader' + i);

    header.dataset.name = document.getElementById('archerName' + i).value.trim();
    header.dataset.id = document.getElementById('archerId' + i).value.trim();
    header.dataset.target = document.getElementById('archerTarget' + i).value.trim();
    header.dataset.position = document.getElementById('archerPosition' + i).value.trim();
  }

  updateArcherInfoDisplay();
  saveAllArchers();
  closeArchersEditModal();
}

function submitToGoogleForm() {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].substring(0,5);


  for (let i = 1; i <= 4; i++) {
    selectArcher(i);
    updateSumsAndCumul();
    updateSummary();

    const currentArcher = document.getElementById('archerHeader' + i);

    const archerName = currentArcher.querySelector('#archerName' + i).value.trim();
    const archerId = currentArcher.querySelector('#archerId' + i).value.trim();

    const cumulative1to10 = currentArcher.querySelector('#cumul_left_10').innerText.trim();
    const cumulative11to20 = currentArcher.querySelector('#cumul_right_20').innerText.trim();

    const count10s = currentArcher.querySelector('#count10').innerText.trim();
    const count9s = currentArcher.querySelector('#count9').innerText.trim();

    const formData = new FormData();
    formData.append('entry.1495486367', date);
    formData.append('entry.300170305', time);
    formData.append('entry.1544667290', archerId);
    formData.append('entry.1134450', archerName);
    formData.append('entry.204468612', cumulative1to10);
    formData.append('entry.710538689', cumulative11to20);
    formData.append('entry.1983848050', count10s);
    formData.append('entry.709843835', count9s);
  }

  fetch(GOOGLE_FORM_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  });
}
