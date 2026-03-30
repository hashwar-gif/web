// --- REINICIO TOTAL Y LÓGICA CONSOLIDADA (VERSIÓN FINAL VALIDADA 10X) ---
if (!localStorage.getItem('v5_final_validation_done')) {
    localStorage.removeItem('userHash');
    localStorage.removeItem('modulesCompleted');
    localStorage.removeItem('moduleStats');
    localStorage.removeItem('examPointsEarned');
    localStorage.removeItem('curQ');
    localStorage.removeItem('totalExamHashSession');
    localStorage.removeItem('examFinished');
    localStorage.setItem('v5_final_validation_done', 'true');
    location.reload();
}

let userHash = parseInt(localStorage.getItem('userHash')) || 0;
let modulesCompleted = JSON.parse(localStorage.getItem('modulesCompleted')) || [];
let moduleStats = JSON.parse(localStorage.getItem('moduleStats')) || {
    blockchain: { correct: 0, total: 6, pointsEarned: [false, false, false, false, false, false] },
    cryptocurrency: { correct: 0, total: 6, pointsEarned: [false, false, false, false, false, false] },
    mining: { correct: 0, total: 6, pointsEarned: [false, false, false, false, false, false] },
    usdt: { correct: 0, total: 6, pointsEarned: [false, false, false, false, false, false] },
    scams: { correct: 0, total: 6, pointsEarned: [false, false, false, false, false, false] },
    pyramids: { correct: 0, total: 6, pointsEarned: [false, false, false, false, false, false] }
};

const moduleOrder = ['blockchain', 'cryptocurrency', 'mining', 'usdt', 'scams', 'pyramids'];
const MODULE_REWARD = 500;
let currentSession = { id: null, score: 0, answeredQuestions: [] };

let examPointsEarned = JSON.parse(localStorage.getItem('examPointsEarned')) || new Array(30).fill(false);
let curQ = parseInt(localStorage.getItem('curQ')) || 0;
let totalExamHashSession = parseInt(localStorage.getItem('totalExamHashSession')) || 0;
let examFinished = localStorage.getItem('examFinished') === 'true';

let globalRanking = JSON.parse(localStorage.getItem('hashwar_ranking')) || [
    { name: "Satoshi_01", score: 45000, status: "LEYENDA" }
];

function saveData() {
    localStorage.setItem('userHash', userHash);
    localStorage.setItem('modulesCompleted', JSON.stringify(modulesCompleted));
    localStorage.setItem('moduleStats', JSON.stringify(moduleStats));
    localStorage.setItem('examPointsEarned', JSON.stringify(examPointsEarned));
    localStorage.setItem('curQ', curQ);
    localStorage.setItem('totalExamHashSession', totalExamHashSession);
    localStorage.setItem('examFinished', examFinished);
}

function resetPersonalProgress() {
    userHash = 0; modulesCompleted = [];
    moduleStats = {
        blockchain: { correct: 0, total: 6, pointsEarned: [false, false, false, false, false, false] },
        cryptocurrency: { correct: 0, total: 6, pointsEarned: [false, false, false, false, false, false] },
        mining: { correct: 0, total: 6, pointsEarned: [false, false, false, false, false, false] },
        usdt: { correct: 0, total: 6, pointsEarned: [false, false, false, false, false, false] },
        scams: { correct: 0, total: 6, pointsEarned: [false, false, false, false, false, false] },
        pyramids: { correct: 0, total: 6, pointsEarned: [false, false, false, false, false, false] }
    };
    examPointsEarned = new Array(30).fill(false);
    curQ = 0; totalExamHashSession = 0; examFinished = false;
    saveData();
}

// --- CORE FUNCTIONS ---
function isModuleLocked(id) {
    const index = moduleOrder.indexOf(id);
    if (index === 0) return false;
    const prevModuleId = moduleOrder[index - 1];
    return moduleStats[prevModuleId].correct < 5;
}

function canAccessElite() {
    return moduleOrder.every(id => modulesCompleted.includes(id));
}

function showEliteInvitation() {
    const overlay = document.getElementById('elite-unlock-invitation');
    if(overlay) {
        overlay.querySelector('h2').innerText = "¡MAESTRÍA TOTAL ALCANZADA!";
        overlay.querySelector('p').innerHTML = "Has completado los 6 terminales de conocimiento. <br><br> El sistema de <strong>Gameplay Final</strong> y la <strong>Prueba de Élite</strong> han sido desbloqueados. Demuestra lo aprendido para entrar al Hall of Fame.";
        overlay.style.display = 'flex';
    }
}

function closeEliteInvitation() {
    const overlay = document.getElementById('elite-unlock-invitation');
    if(overlay) overlay.style.display = 'none';
    scrollToAcademy();
}

function updateModuleCards() {
    document.getElementById('global-hash').innerText = userHash.toLocaleString();
    moduleOrder.forEach(id => {
        const stats = moduleStats[id];
        const statusTag = document.getElementById(`status-${id}`);
        const card = document.querySelector(`.academy-card[data-module="${id}"]`);
        if (!card) return;
        if (isModuleLocked(id)) {
            card.classList.add('locked');
            statusTag.innerText = "BLOQUEADO";
        } else {
            card.classList.remove('locked');
            if (modulesCompleted.includes(id)) {
                statusTag.innerText = `RÉCORD: ${stats.correct}/6`;
                statusTag.className = stats.correct >= 5 ? 'status-tag perfect' : 'status-tag warning';
            } else { statusTag.innerText = "DISPONIBLE"; }
        }
    });

    const eliteBtn = document.getElementById('start-evaluation-hero');
    if (canAccessElite()) {
        eliteBtn.classList.remove('locked');
        eliteBtn.style.opacity = "1";
        eliteBtn.innerText = examFinished ? "RESULTADOS ÉLITE" : "Prueba de Elite (+10k $HASH)";
    } else {
        eliteBtn.classList.add('locked');
        eliteBtn.style.opacity = "0.5";
        eliteBtn.innerText = "🔒 ÉLITE BLOQUEADO";
    }
}

function showModule(id) {
    if (isModuleLocked(id)) return alert("TERMINAL BLOQUEADO.");
    document.getElementById('academy-grid').style.display = 'none';
    document.querySelectorAll('.module-content').forEach(m => m.style.display = 'none');
    const moduleDiv = document.getElementById(`module-${id}`);
    moduleDiv.style.display = 'block';
    currentSession = { id: id, score: 0, answeredQuestions: [] };
    moduleDiv.querySelectorAll('.module-step').forEach((s, i) => {
        s.classList.remove('active');
        if(i === 0) s.classList.add('active');
        const resultDiv = s.querySelector('.step-result');
        if(resultDiv) resultDiv.innerHTML = '';
        const nextBtn = s.querySelector('.btn-next-step');
        if(nextBtn) nextBtn.style.display = 'none';
        const options = s.querySelectorAll('.quiz-option');
        options.forEach(opt => {
            opt.style.pointerEvents = 'auto';
            opt.style.background = '';
            opt.style.border = '';
        });
    });
}

function checkModuleAnswer(moduleId, stepIdx, selected, correct) {
    if (currentSession.answeredQuestions.includes(stepIdx)) return;
    currentSession.answeredQuestions.push(stepIdx);
    const stepDiv = document.getElementById(`step-${moduleId}-${stepIdx}`);
    const options = stepDiv.querySelectorAll('.quiz-option');
    const resultDiv = stepDiv.querySelector('.step-result');
    options.forEach(opt => opt.style.pointerEvents = 'none');

    if (selected === correct) {
        options[selected].style.background = 'rgba(0, 255, 136, 0.4)';
        currentSession.score++;
        if (!moduleStats[moduleId].pointsEarned[stepIdx - 1]) {
            moduleStats[moduleId].pointsEarned[stepIdx - 1] = true;
            userHash += MODULE_REWARD;
            showRewardPopup(MODULE_REWARD);
        }
        if(resultDiv) resultDiv.innerHTML = `<p style="color: var(--success); margin-top: 15px;">CORRECTO.</p>`;
    } else {
        options[selected].style.background = 'rgba(255, 68, 68, 0.4)';
        if(resultDiv) resultDiv.innerHTML = `<p style="color: var(--danger); margin-top: 15px;">INCORRECTO.</p>`;
    }
    stepDiv.querySelector('.btn-next-step')?.style.setProperty('display', 'inline-block');
    stepDiv.querySelector('.btn-success')?.style.setProperty('display', 'inline-block');
    saveData();
}

function showRewardPopup(amount) {
    document.getElementById('global-hash').innerText = userHash.toLocaleString();
    const popup = document.getElementById('reward-popup');
    document.getElementById('reward-amount').innerText = amount.toLocaleString();
    popup.style.display = 'block';
    setTimeout(() => popup.style.display = 'none', 2000);
}

function finishModule(moduleId) {
    if (currentSession.score > moduleStats[moduleId].correct) moduleStats[moduleId].correct = currentSession.score;
    if (!modulesCompleted.includes(moduleId)) modulesCompleted.push(moduleId);
    saveData();
    
    backToAcademy();
    if (canAccessElite()) {
        showEliteInvitation();
    }
}

function backToAcademy() {
    document.querySelectorAll('.module-content').forEach(m => m.style.display = 'none');
    document.getElementById('academy-grid').style.display = 'grid';
    updateModuleCards();
}

function nextStep(moduleId) {
    const moduleDiv = document.getElementById(`module-${moduleId}`);
    const steps = moduleDiv.querySelectorAll('.module-step');
    let activeIdx = -1;
    steps.forEach((s, i) => { if(s.classList.contains('active')) activeIdx = i; });
    if(activeIdx < steps.length - 1) {
        steps[activeIdx].classList.remove('active');
        steps[activeIdx+1].classList.add('active');
    }
}

// --- EXAMEN ELITE (VALIDADO 10X) ---
const evalQuestions = [
    { q: "¿Qué es el Hash en un bloque de Blockchain?", a: ["Huella digital única del bloque", "El precio del bloque"], c: 0 },
    { q: "¿Quién es el creador anónimo de Bitcoin?", a: ["Satoshi Nakamoto", "Vitalik Buterin"], c: 0 },
    { q: "¿Qué significa que la Blockchain es inmutable?", a: ["No se puede modificar la info", "El precio es estable"], c: 0 },
    { q: "¿Qué función cumple un Nodo?", a: ["Validar y guardar transacciones", "Generar electricidad"], c: 0 },
    { q: "¿Cuál es el límite máximo de Bitcoin?", a: ["21 Millones", "Es ilimitado"], c: 0 },
    { q: "¿Qué es una Altcoin?", a: ["Moneda que no es Bitcoin", "Moneda de valor estable"], c: 0 },
    { q: "¿Qué es un Smart Contract?", a: ["Código auto-ejecutable", "Contrato físico"], c: 0 },
    { q: "¿Qué significa HODL?", a: ["Mantener a largo plazo", "Vender rápido"], c: 0 },
    { q: "¿Qué es el Halving?", a: ["Reducción de recompensa a mitad", "Aumento de precio"], c: 0 },
    { q: "¿Qué es un equipo ASIC?", a: ["Hardware especializado minería", "Software de trading"], c: 0 },
    { q: "¿Qué mide el Hashrate?", a: ["Potencia de cómputo de la red", "Velocidad de internet"], c: 0 },
    { q: "¿Qué algoritmo usa Bitcoin?", a: ["Proof of Work (PoW)", "Proof of Stake (PoS)"], c: 0 },
    { q: "¿A qué activo está vinculado el USDT?", a: ["Dólar Americano", "Oro"], c: 0 },
    { q: "¿Qué es el proceso KYC?", a: ["Verificación de identidad", "Minería en la nube"], c: 0 },
    { q: "¿Qué significa P2P?", a: ["Persona a Persona", "Pago bancario"], c: 0 },
    { q: "¿Qué red es mejor para USDT (bajo costo)?", a: ["TRC-20 (Tron)", "ERC-20 (Ethereum)"], c: 0 },
    { q: "¿Qué es la Frase Semilla?", a: ["Las 12/24 palabras de acceso", "Tu clave de WiFi"], c: 0 },
    { q: "¿Qué es el 2FA?", a: ["Doble factor autenticación", "Billetera secundaria"], c: 0 },
    { q: "¿Qué es el Phishing?", a: ["Robo de claves mediante engaño", "Técnica de compra barata"], c: 0 },
    { q: "¿Qué es el FOMO?", a: ["Miedo a perderse algo", "Fallo de la red"], c: 0 },
    { q: "¿Cuál es el motor de una pirámide?", a: ["Reclutamiento constante", "Venta de productos"], c: 0 },
    { q: "¿Qué define a un esquema Ponzi?", a: ["Pagar viejos con dinero de nuevos", "Inversión en bolsa"], c: 0 },
    { q: "[ÉLITE] ¿Qué es el Impermanent Loss?", a: ["Pérdida por volatilidad en pools", "Pérdida de frase semilla"], c: 0 },
    { q: "[ÉLITE] ¿Qué es un Flash Loan?", a: ["Préstamo instantáneo sin aval", "Crédito bancario rápido"], c: 0 },
    { q: "[ÉLITE] ¿Qué es una DAO?", a: ["Org. Autónoma Descentralizada", "Distribución de activos"], c: 0 },
    { q: "[ÉLITE] ¿Qué función tiene un Oracle?", a: ["Conectar datos externos a BC", "Predice el precio"], c: 0 },
    { q: "[ÉLITE] ¿Qué es una Cold Wallet?", a: ["Billetera física sin internet", "Billetera en mantenimiento"], c: 0 },
    { q: "[ÉLITE] ¿Qué es el Slippage?", a: ["Diferencia de precio en ejecución", "Error de código"], c: 0 },
    { q: "[ÉLITE] ¿Qué es la Web3?", a: ["Internet basado en propiedad", "Nueva versión de Google"], c: 0 },
    { q: "[ÉLITE] ¿Qué es el TVL?", a: ["Valor total bloqueado en DeFi", "Tiempo de validación"], c: 0 }
];

function getExamReward(idx) {
    if (idx < 4) return 250; if (idx < 8) return 500; if (idx < 12) return 750;
    if (idx < 16) return 1000; if (idx < 20) return 1250; if (idx < 25) return 1500;
    return 1800;
}

function startEliteExam() {
    if (!canAccessElite()) return alert("BLOQUEADO.");
    if (examFinished) return finishExam(true);
    document.getElementById('hero').style.display = 'none';
    document.getElementById('academy').style.display = 'none';
    document.getElementById('evaluation').style.display = 'block';
    loadEval();
}

function loadEval() {
    const q = evalQuestions[curQ];
    document.getElementById('eval-progress').innerText = `PREGUNTA ${curQ + 1} / ${evalQuestions.length}`;
    document.getElementById('eval-question-area').innerHTML = `<h2 style="margin-bottom: 40px; font-size: 1.8rem; line-height: 1.4;">${q.q}</h2><div style="display: flex; flex-direction: column; gap: 15px;">${q.a.map((opt, i) => `<div class="quiz-option" onclick="processEval(${i})"><span style="color: var(--primary); font-weight: 900;">[ ${i===0?'A':'B'} ]</span> ${opt}</div>`).join('')}</div>`;
}

function processEval(idx) {
    const currentReward = getExamReward(curQ);
    if (idx === evalQuestions[curQ].c) {
        totalExamHashSession += currentReward;
        if (!examPointsEarned[curQ]) {
            examPointsEarned[curQ] = true;
            userHash += currentReward;
            showRewardPopup(currentReward);
        }
    }
    if (curQ < evalQuestions.length - 1) {
        curQ++; saveData(); loadEval();
    } else {
        examFinished = true; saveData(); finishExam();
    }
}

function finishExam(alreadyFinished = false) {
    const container = document.getElementById('final-results');
    document.getElementById('evaluation').style.display = 'none';
    container.style.display = 'flex';
    
    // Capturar puntaje antes de cualquier reset
    const sessionScore = totalExamHashSession;
    const approved = sessionScore >= 18000;
    
    if(!alreadyFinished) {
        const playerName = prompt("¡EXAMEN FINALIZADO! CODENAME:");
        if(playerName) {
            localStorage.setItem('last_agent_name', playerName);
            localStorage.setItem('last_agent_score', sessionScore);
            localStorage.setItem('is_certified', approved ? 'true' : 'false');
            
            globalRanking.push({ name: playerName, score: userHash, status: "ELITE" });
            localStorage.setItem('hashwar_ranking', JSON.stringify(globalRanking));
        }
        resetPersonalProgress();
    }

    document.getElementById('res-title').innerText = approved ? "¡MAESTRO DE LA RED!" : "ACCESO DENEGADO";
    document.getElementById('res-total').innerText = sessionScore.toLocaleString();
    
    // El botón de certificado aparece si aprobó en esta sesión o si ya estaba certificado
    if(approved || localStorage.getItem('is_certified') === 'true') {
        document.getElementById('cert-btn').style.display = 'inline-block';
    }
}

// --- LÓGICA DEL CERTIFICADO ---
function showCertificate() {
    const name = localStorage.getItem('last_agent_name') || "AGENTE ÉLITE";
    const hash = (localStorage.getItem('last_agent_score') || 0);
    const date = new Date().toLocaleDateString();

    document.getElementById('cert-user-name').innerText = name;
    document.getElementById('cert-hash-value').innerText = parseInt(hash).toLocaleString() + " $HASH";
    document.getElementById('cert-date').innerText = date;

    document.getElementById('certificate-modal').style.display = 'flex';
}

function closeCertificate() {
    document.getElementById('certificate-modal').style.display = 'none';
}

function printCertificate() {
    window.print();
}

function showRanking() {
    document.getElementById('hero').style.display = 'none';
    document.getElementById('academy').style.display = 'none';
    document.getElementById('ranking-section').style.display = 'block';
    const body = document.getElementById('ranking-body');
    body.innerHTML = '';
    globalRanking.sort((a, b) => b.score - a.score);
    globalRanking.forEach((p, i) => {
        body.innerHTML += `<tr><td>#${i + 1}</td><td style="color:var(--primary); font-weight:900;">${p.name}</td><td>${p.score.toLocaleString()} $HASH</td><td><span class="status-tag perfect">ELITE</span></td></tr>`;
    });
}

function hideRanking() {
    document.getElementById('ranking-section').style.display = 'none';
    document.getElementById('hero').style.display = 'flex';
    document.getElementById('academy').style.display = 'block';
}

function scrollToAcademy() { document.getElementById('academy').scrollIntoView({ behavior: 'smooth' }); }

// --- SISTEMA DE VISUALIZACIÓN DE IMÁGENES (ZOOM) ---
function setupImageZoom() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('module-step-img')) {
            const viewer = document.getElementById('image-viewer');
            const viewerImg = document.getElementById('viewer-img');
            viewerImg.src = e.target.src;
            viewer.classList.add('active');
            document.body.style.overflow = 'hidden'; // Bloquear scroll
        }
    });
}

function closeImageViewer() {
    const viewer = document.getElementById('image-viewer');
    viewer.classList.remove('active');
    document.body.style.overflow = ''; // Restaurar scroll
}

// Cerrar con tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeImageViewer();
});

document.addEventListener('DOMContentLoaded', () => {
    const startEvalBtn = document.getElementById('start-evaluation-hero');
    if(startEvalBtn) startEvalBtn.onclick = startEliteExam;
    updateModuleCards();
    setupImageZoom(); // Activar nuevo sistema de zoom
});
