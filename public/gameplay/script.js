// Constantes y configuración de la IA enemiga
const ENEMY_AI = {
  DIFFICULTY_LEVELS: [
    { name: "Pasivo", evolutionRate: 0.1, attackChance: 0.1, upgradeChance: 0.1 },
    { name: "Agresivo", evolutionRate: 0.1, attackChance: 0.1, upgradeChance: 0.1 },
    { name: "Estratégico", evolutionRate: 0.2, attackChance: 0.2, upgradeChance: 0.2 },
    { name: "Implacable", evolutionRate: 0.2, attackChance: 0.3, upgradeChance: 0.3 }
  ],
  EVOLUTION_THRESHOLDS: [0, 25, 50, 75],
  ATTACK_TYPES: {
    RESOURCE_STEAL: "resource_steal",
    BUILDING_SABOTAGE: "building_sabotage",
    UNIT_ATTACK: "unit_attack",
    HACKING: "hacking"
  }
};

const LEVEL_BONUSES={1:1,2:1.6,3:2,4:2.4,5:2.8};
const audioContext=new (window.AudioContext||window.webkitAudioContext)();
function playExplosionSound(){try{const oscillator=audioContext.createOscillator();const gainNode=audioContext.createGain();oscillator.type='sawtooth';oscillator.frequency.setValueAtTime(100,audioContext.currentTime);oscillator.frequency.exponentialRampToValueAtTime(0.01,audioContext.currentTime+0.5);gainNode.gain.setValueAtTime(0.5,audioContext.currentTime);gainNode.gain.exponentialRampToValueAtTime(0.01,audioContext.currentTime+0.5);oscillator.connect(gainNode);gainNode.connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+0.5);}catch(e){console.log("Error playing explosion sound:",e);}}
function playBuildingSound(){try{const oscillator=audioContext.createOscillator();const gainNode=audioContext.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(523.25,audioContext.currentTime);gainNode.gain.setValueAtTime(0.3,audioContext.currentTime);gainNode.gain.exponentialRampToValueAtTime(0.01,audioContext.currentTime+0.3);oscillator.connect(gainNode);gainNode.connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+0.3);}catch(e){console.log("Error playing building sound:",e);}}
function playLaserSound(){try{const oscillator=audioContext.createOscillator();const gainNode=audioContext.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(880,audioContext.currentTime);oscillator.frequency.exponentialRampToValueAtTime(440,audioContext.currentTime+0.1);gainNode.gain.setValueAtTime(0.2,audioContext.currentTime);gainNode.gain.exponentialRampToValueAtTime(0.01,audioContext.currentTime+0.1);oscillator.connect(gainNode);gainNode.connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+0.1);}catch(e){console.log("Error playing laser sound:",e);}}
function playMiningSound(){try{const oscillator=audioContext.createOscillator();const gainNode=audioContext.createGain();oscillator.type='triangle';oscillator.frequency.setValueAtTime(196,audioContext.currentTime);gainNode.gain.setValueAtTime(0.2,audioContext.currentTime);gainNode.gain.exponentialRampToValueAtTime(0.01,audioContext.currentTime+0.2);oscillator.connect(gainNode);gainNode.connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+0.2);}catch(e){console.log("Error playing mining sound:",e);}}
function playTurretSound(){try{const oscillator=audioContext.createOscillator();const gainNode=audioContext.createGain();oscillator.type='square';oscillator.frequency.setValueAtTime(220,audioContext.currentTime);oscillator.frequency.exponentialRampToValueAtTime(110,audioContext.currentTime+0.1);gainNode.gain.setValueAtTime(0.2,audioContext.currentTime);gainNode.gain.exponentialRampToValueAtTime(0.01,audioContext.currentTime+0.1);oscillator.connect(gainNode);gainNode.connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+0.1);}catch(e){console.log("Error playing turret sound:",e);}}
function playElectricSound(){try{const oscillator=audioContext.createOscillator();const gainNode=audioContext.createGain();oscillator.type='sawtooth';oscillator.frequency.setValueAtTime(880,audioContext.currentTime);oscillator.frequency.exponentialRampToValueAtTime(1760,audioContext.currentTime+0.2);gainNode.gain.setValueAtTime(0.1,audioContext.currentTime);gainNode.gain.exponentialRampToValueAtTime(0.01,audioContext.currentTime+0.2);oscillator.connect(gainNode);gainNode.connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+0.2);}catch(e){console.log("Error playing electric sound:",e);}}
function playRocketSound(){try{const oscillator=audioContext.createOscillator();const gainNode=audioContext.createGain();oscillator.type='sawtooth';oscillator.frequency.setValueAtTime(110,audioContext.currentTime);oscillator.frequency.exponentialRampToValueAtTime(55,audioContext.currentTime+0.5);gainNode.gain.setValueAtTime(0.3,audioContext.currentTime);gainNode.gain.exponentialRampToValueAtTime(0.01,audioContext.currentTime+0.5);oscillator.connect(gainNode);gainNode.connect(audioContext.destination);oscillator.start();oscillator.stop(audioContext.currentTime+0.5);}catch(e){console.log("Error playing rocket sound:",e);}}

class EnemyAI {
  constructor(game) {
    this.game = game;
    this.difficulty = 0;
    this.evolution = 0;
    this.evolutionRate = ENEMY_AI.DIFFICULTY_LEVELS[this.difficulty].evolutionRate;
    this.attackCooldown = 0;
    this.upgradeCooldown = 0;
    this.eventCooldown = 0;
    this.unlockedAttacks = [ENEMY_AI.ATTACK_TYPES.RESOURCE_STEAL];
  }

  update(deltaTime) {
    // Actualizar evolución
    this.evolution += this.evolutionRate * deltaTime / 1000;
    this.evolution = Math.min(this.evolution, 100);
    
    // Actualizar dificultad según la evolución
    this.updateDifficulty();
    
    // Actualizar indicadores UI
    this.updateUI();
    
    // Enfriamientos
    this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
    this.upgradeCooldown = Math.max(0, this.upgradeCooldown - deltaTime);
    this.eventCooldown = Math.max(0, this.eventCooldown - deltaTime);
    
    // Posibilidad de ataque
    if (this.attackCooldown <= 0 && Math.random() < ENEMY_AI.DIFFICULTY_LEVELS[this.difficulty].attackChance) {
      this.executeAttack();
      this.attackCooldown = 30000 - (this.difficulty * 5000); // 30s - (nivel * 5s)
    }
    
    // Posibilidad de mejora
    if (this.upgradeCooldown <= 0 && Math.random() < ENEMY_AI.DIFFICULTY_LEVELS[this.difficulty].upgradeChance) {
      this.upgradeRandomBuilding();
      this.upgradeCooldown = 45000 - (this.difficulty * 5000); // 45s - (nivel * 5s)
    }
    
    // Eventos especiales cada 60-90 segundos
    if (this.eventCooldown <= 0) {
      this.triggerSpecialEvent();
      this.eventCooldown = 60000 + Math.random() * 30000;
    }
  }

  updateDifficulty() {
    for (let i = ENEMY_AI.EVOLUTION_THRESHOLDS.length - 1; i >= 0; i--) {
      if (this.evolution >= ENEMY_AI.EVOLUTION_THRESHOLDS[i]) {
        this.difficulty = i;
        this.evolutionRate = ENEMY_AI.DIFFICULTY_LEVELS[this.difficulty].evolutionRate;
        
        // Desbloquear nuevos tipos de ataque según la dificultad
        if (this.difficulty >= 1 && !this.unlockedAttacks.includes(ENEMY_AI.ATTACK_TYPES.BUILDING_SABOTAGE)) {
          this.unlockedAttacks.push(ENEMY_AI.ATTACK_TYPES.BUILDING_SABOTAGE);
        }
        if (this.difficulty >= 2 && !this.unlockedAttacks.includes(ENEMY_AI.ATTACK_TYPES.UNIT_ATTACK)) {
          this.unlockedAttacks.push(ENEMY_AI.ATTACK_TYPES.UNIT_ATTACK);
        }
        if (this.difficulty >= 3 && !this.unlockedAttacks.includes(ENEMY_AI.ATTACK_TYPES.HACKING)) {
          this.unlockedAttacks.push(ENEMY_AI.ATTACK_TYPES.HACKING);
        }
        
        break;
      }
    }
  }

  updateUI() {
    const difficultyElement = document.getElementById('ai-difficulty');
    const evolutionBar = document.getElementById('enemy-evolution-progress');
    
    if (difficultyElement) {
      difficultyElement.textContent = `IA: Nivel ${this.difficulty + 1} - ${ENEMY_AI.DIFFICULTY_LEVELS[this.difficulty].name}`;
    }
    
    if (evolutionBar) {
      evolutionBar.style.width = `${this.evolution}%`;
    }
  }

  executeAttack() {
    if (this.unlockedAttacks.length === 0) return;
    
    const attackType = this.unlockedAttacks[Math.floor(Math.random() * this.unlockedAttacks.length)];
    
    switch (attackType) {
      case ENEMY_AI.ATTACK_TYPES.RESOURCE_STEAL:
        this.stealResources();
        break;
      case ENEMY_AI.ATTACK_TYPES.BUILDING_SABOTAGE:
        this.sabotageBuilding();
        break;
      case ENEMY_AI.ATTACK_TYPES.UNIT_ATTACK:
        this.attackWithUnits();
        break;
      case ENEMY_AI.ATTACK_TYPES.HACKING:
        this.hackPlayer();
        break;
    }
  }

  stealResources() {
    const resources = ['btc', 'hash', 'gold'];
    const resourceType = resources[Math.floor(Math.random() * resources.length)];
    const stealAmount = this.game.resources[resourceType] * (0.05 + 0.05 * this.difficulty);
    
    if (stealAmount > 0) {
      this.game.resources[resourceType] -= stealAmount;
      
      // Efecto visual
      this.showEnemyEvent(`¡ATAQUE ENEMIGO! Robaron ${stealAmount.toFixed(resourceType === 'btc' ? 8 : 0)} ${resourceType.toUpperCase()}`);
      this.createResourceStealEffect(stealAmount, resourceType);
      
      playLaserSound();
    }
  }

  sabotageBuilding() {
    if (this.game.gameData.buildings.size === 0) return;
    
    const buildingEntries = Array.from(this.game.gameData.buildings.entries());
    const [index, building] = buildingEntries[Math.floor(Math.random() * buildingEntries.length)];
    
    // Reducir producción temporalmente
    const buildingElement = document.querySelector(`[data-index="${index}"] .building`);
    if (buildingElement) {
      buildingElement.classList.add('enemy-attack-indicator');
      
      // Aplicar penalización
      const originalProduction = JSON.parse(JSON.stringify(this.game.buildingProduction[building.type]));
      Object.keys(this.game.buildingProduction[building.type]).forEach(resource => {
        if (this.game.buildingProduction[building.type][resource].base > 0) {
          this.game.buildingProduction[building.type][resource].base *= 0.5;
        }
      });
      
      this.showEnemyEvent(`¡SABOTAJE! ${this.game.getBuildingName(building.type)} reduce su producción`);
      
      // Restaurar después de 30 segundos
      setTimeout(() => {
        if (this.game.gameData.buildings.has(index)) {
          Object.assign(this.game.buildingProduction[building.type], originalProduction);
          buildingElement.classList.remove('enemy-attack-indicator');
          this.game.showNotification(`${this.game.getBuildingName(building.type)} recuperó su producción`);
        }
      }, 30000);
      
      playExplosionSound();
    }
  }

  attackWithUnits() {
    if (this.game.enemyBuildings.size === 0) return;
    
    // Crear unidades enemigas temporales
    const unitTypes = ['soldier', 'bazooka', 'sniper'];
    const numUnits = 1 + this.difficulty;
    
    for (let i = 0; i < numUnits; i++) {
      const unitType = unitTypes[Math.floor(Math.random() * unitTypes.length)];
      this.createEnemyUnit(unitType);
    }
    
    this.showEnemyEvent(`¡ATAQUE ENEMIGO! ${numUnits} unidades se acercan`);
    playTurretSound();
  }

  hackPlayer() {
    // Desactivar aleatoriamente edificios del jugador
    const affectedBuildings = [];
    const buildingEntries = Array.from(this.game.gameData.buildings.entries());
    
    for (let i = 0; i < Math.min(1 + this.difficulty, buildingEntries.length); i++) {
      const [index, building] = buildingEntries[Math.floor(Math.random() * buildingEntries.length)];
      if (!affectedBuildings.includes(index)) {
        affectedBuildings.push(index);
        
        const buildingElement = document.querySelector(`[data-index="${index}"] .building`);
        if (buildingElement) {
          // Añadir efecto visual de hackeo
          const hackEffect = document.createElement('div');
          hackEffect.className = 'enemy-hack-effect';
          buildingElement.appendChild(hackEffect);
          
          // Desactivar el edificio temporalmente
          const originalEnergyConsumption = this.game.buildingProduction[building.type].energy.base;
          this.game.buildingProduction[building.type].energy.base = 0;
          
          this.showEnemyEvent(`¡HACKEO! ${this.game.getBuildingName(building.type)} desactivado`);
          
          // Restaurar después de 20 segundos
          setTimeout(() => {
            if (this.game.gameData.buildings.has(index)) {
              this.game.buildingProduction[building.type].energy.base = originalEnergyConsumption;
              if (buildingElement.contains(hackEffect)) {
                buildingElement.removeChild(hackEffect);
              }
              this.game.showNotification(`${this.game.getBuildingName(building.type)} recuperó el control`);
            }
          }, 20000);
        }
      }
    }
    
    playElectricSound();
  }

  upgradeRandomBuilding() {
    if (this.game.enemyBuildings.size === 0) return;
    
    const enemyBuildingEntries = Array.from(this.game.enemyBuildings.entries());
    const [index, building] = enemyBuildingEntries[Math.floor(Math.random() * enemyBuildingEntries.length)];
    
    if (building.level < 5) {
      building.level++;
      
      // Actualizar visualmente
      const buildingElement = document.querySelector(`[data-index="${index}"] .building`);
      if (buildingElement) {
        buildingElement.dataset.level = building.level;
        buildingElement.querySelector('.level-indicator').textContent = `L${building.level}`;
        buildingElement.querySelector('.level-indicator').style.color = '#ff4444';
      }
      
      this.showEnemyEvent(`El enemigo mejoró su ${this.game.getBuildingName(building.type)} a nivel ${building.level}`);
      playBuildingSound();
    }
  }

  triggerSpecialEvent() {
    const events = [
      () => {
        // Tormenta solar - reduce producción de energía
        this.game.showNotification('¡TORMENTA SOLAR! Producción de energía reducida un 30%');
        const originalEnergyProduction = this.game.energyProduction;
        this.game.energyProduction *= 0.7;
        
        setTimeout(() => {
          this.game.energyProduction = originalEnergyProduction;
          this.game.showNotification('La tormenta solar ha terminado');
        }, 30000);
      },
      () => {
        // Boom de criptomonedas - aumenta ganancias pero también ataque enemigo
        this.game.showNotification('¡BOOM DE CRIPTO! Ganancias +50% pero el enemigo se fortalece');
        this.evolution += 10;
        
        setTimeout(() => {
          this.game.showNotification('El boom de cripto ha terminado');
        }, 45000);
      },
      () => {
        // Ataque coordinado - múltiples ataques a la vez
        this.showEnemyEvent('¡ATAQUE COORDINADO ENEMIGO!');
        this.executeAttack();
        setTimeout(() => this.executeAttack(), 5000);
        setTimeout(() => this.executeAttack(), 10000);
      }
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    randomEvent();
  }

  createEnemyUnit(unitType) {
    const unitId = 'enemy-' + Date.now() + Math.random().toString(36).substr(2, 9);
    const unit = document.createElement('div');
    unit.className = `unit ${unitType} enemy-unit`;
    unit.dataset.unitId = unitId;
    unit.dataset.unitType = unitType;
    
    // Posicionar cerca de la base enemiga
    const enemyZone = [36, 37, 38, 39, 46, 47, 48, 49];
    const pos = enemyZone[Math.floor(Math.random() * enemyZone.length)];
    const cell = document.querySelector(`[data-index="${pos}"]`);
    
    if (cell) {
      const cellRect = cell.getBoundingClientRect();
      const gameAreaRect = document.querySelector('.game-area').getBoundingClientRect();
      const x = cellRect.left - gameAreaRect.left + Math.random() * 80 - 40;
      const y = cellRect.top - gameAreaRect.top + Math.random() * 80 - 40;
      
      unit.style.left = `${x}px`;
      unit.style.top = `${y}px`;
      document.querySelector('.game-area').appendChild(unit);
      
      // Mover la unidad hacia el jugador
      this.moveUnitToPlayerBase(unit, unitType);
    }
  }

  moveUnitToPlayerBase(unit, unitType) {
    const playerBuildings = Array.from(this.game.gameData.buildings.keys());
    if (playerBuildings.length === 0) return;
    
    const targetIndex = playerBuildings[Math.floor(Math.random() * playerBuildings.length)];
    const targetCell = document.querySelector(`[data-index="${targetIndex}"]`);
    
    if (targetCell) {
      const targetRect = targetCell.getBoundingClientRect();
      const gameAreaRect = document.querySelector('.game-area').getBoundingClientRect();
      const targetX = targetRect.left - gameAreaRect.left + targetRect.width / 2 - 15;
      const targetY = targetRect.top - gameAreaRect.top + targetRect.height / 2 - 15;
      
      // Animación de movimiento
      unit.style.transition = `left 5s linear, top 5s linear`;
      unit.style.left = `${targetX}px`;
      unit.style.top = `${targetY}px`;
      
      // Al llegar, causar daño y desaparecer
      setTimeout(() => {
        if (unit.parentNode) {
          // Causar daño al edificio
          const building = this.game.gameData.buildings.get(targetIndex);
          if (building) {
            // Reducir eficiencia temporalmente
            const originalLevelBonus = LEVEL_BONUSES[building.level];
            building.level = Math.max(1, building.level - 1);
            
            this.game.showNotification(`¡Unidad enemiga dañó tu ${this.game.getBuildingName(building.type)}!`);
            
            // Restaurar después de 20 segundos
            setTimeout(() => {
              if (this.game.gameData.buildings.has(targetIndex)) {
                building.level = Math.min(5, building.level + 1);
                this.game.showNotification(`Tu ${this.game.getBuildingName(building.type)} se ha reparado`);
              }
            }, 20000);
          }
          
          // Efecto de explosión
          const explosion = document.createElement('div');
          explosion.className = 'explosion';
          unit.appendChild(explosion);
          
          playExplosionSound();
          
          // Eliminar unidad después de la explosión
          setTimeout(() => {
            if (unit.parentNode) {
              unit.parentNode.removeChild(unit);
            }
          }, 500);
        }
      }, 5000);
    }
  }

  createResourceStealEffect(amount, resourceType) {
    const effect = document.createElement('div');
    effect.className = 'enemy-resource-steal';
    effect.textContent = `-${amount.toFixed(resourceType === 'btc' ? 8 : 0)} ${resourceType.toUpperCase()}`;
    effect.style.left = `${Math.random() * window.innerWidth * 0.6 + window.innerWidth * 0.2}px`;
    effect.style.top = `${window.innerHeight * 0.5}px`;
    
    document.body.appendChild(effect);
    
    setTimeout(() => {
      if (effect.parentNode) {
        effect.parentNode.removeChild(effect);
      }
    }, 2000);
  }

  showEnemyEvent(message) {
    const notification = document.createElement('div');
    notification.className = 'enemy-event-notification';
    notification.textContent = message;
    
    document.querySelector('.game-container').appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
    
    this.game.showNotification(message);
  }
}

class HashwarGame {
  constructor() {
    this.setupLoadingScreen();
  }

  setupLoadingScreen() {
    const loadingSteps = [
      {text: 'Inicializando sistemas...', progress: 20},
      {text: 'Cargando recursos...', progress: 40},
      {text: 'Configurando IA...', progress: 60},
      {text: 'Preparando interfaz...', progress: 80},
      {text: 'Iniciando juego...', progress: 100}
    ];

    let currentStep = 0;
    
    const loadNextStep = () => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        document.getElementById('loading-text').textContent = step.text;
        document.getElementById('loading-bar').style.width = step.progress + '%';
        
        setTimeout(() => {
          currentStep++;
          loadNextStep();
        }, 500);
      } else {
        this.finishLoading();
      }
    };

    loadNextStep();
  }

  finishLoading() {
    try {
      // Ocultar pantalla de carga
      document.getElementById('loading-screen').style.display = 'none';
      
      // Inicializar el juego
      this.initializeGame();
      
      // Iniciar directamente sin registro
      this.startGame();
      
    } catch (error) {
      console.error('Error en finishLoading:', error);
      this.showErrorScreen('Error al cargar el juego: ' + error.message);
    }
  }

  initializeGame() {
    // Inicialización del juego
    this.grid = document.getElementById('game-grid');
    this.selectedBuilding = null;
    this.buildings = new Map;
    this.resources = {
      btc: 0.001, 
      hash: parseInt(localStorage.getItem('userHash')) || 3200, 
      gold: 100, 
      energy: 100
    };
    this.playerLevel = 1;
    this.playerXP = 0;
    this.xpToNextLevel = 100;
    
    // Mapeo de bloqueos por academia
    this.academyRequirements = {
      'mining-farm': 'mining',
      'barracks': 'cryptocurrency',
      'hacker-academy': 'scams',
      'defense-tower': 'pyramids'
    };

    this.buildingLevelRequirements = {'base':1,'power-plant':1,'mining-farm':2,'barracks':3,'vehicle-depot':4,'aircraft-hangar':5,'research-lab':6,'hacker-academy':7,'defense-tower':8};
    this.unitBuildingRequirements = {'soldier':'barracks','bazooka':'barracks','sniper':'barracks','tank':'vehicle-depot','drone':'aircraft-hangar','robot':'research-lab','exoskeleton':'vehicle-depot','hacker':'hacker-academy'};
    this.maxEnergy = 200;
    this.gameData = {buildings: new Map};
    this.tutorialStep = 0;
    this.tutorialActive = true;
    this.enemyBuildings = new Map;
    this.battleActive = false;
    this.defenseTowers = new Map;
    this.units = new Map;
    this.selectedUnit = null;
    this.unitMode = null;
    this.buildingCosts = {'base':[0.0000365,0.000042,0.000052,0.000062,0.0000725],'power-plant':[0.000028,0.000038,0.000048,0.000058,0.000068],'mining-farm':[0.000026,0.000036,0.000046,0.000056,0.000066],'barracks':[0.000025,0.000035,0.000045,0.000055,0.000065],'vehicle-depot':[0.000038,0.000048,0.000058,0.000068,0.000068],'aircraft-hangar':[0.000058,0.000068,0.000078,0.000088,0.000088],'research-lab':[0.000035,0.000045,0.000055,0.000065,0.000075],'hacker-academy':[0.000045,0.000055,0.000065,0.000075,0.000085],'defense-tower':[0.000032,0.000042,0.000052,0.000062,0.000072]};
    this.playerUnits = {soldier:0,bazooka:0,sniper:0,tank:0,drone:0,robot:0,exoskeleton:0,hacker:0};
    this.unitCosts = {'soldier':{hash:100,energy:2},'bazooka':{hash:200,energy:4},'sniper':{hash:300,energy:3},'tank':{hash:800,energy:10},'drone':{hash:500,energy:6},'robot':{hash:1000,energy:12},'exoskeleton':{hash:600,energy:8},'hacker':{hash:750,energy:5}};
    this.buildingProduction = {'base':{btc:{base:0,interval:0},hash:{base:0,interval:0},gold:{base:0,interval:0},energy:{base:-10,interval:2000}},'power-plant':{btc:{base:0,interval:0},hash:{base:0,interval:0},gold:{base:0,interval:0},energy:{base:35,interval:2000}},'mining-farm':{btc:{base:0.00000118,interval:6e4},hash:{base:10,interval:45000},gold:{base:0,interval:0},energy:{base:-15,interval:2000}},'barracks':{btc:{base:0,interval:0},hash:{base:0,interval:0},gold:{base:0,interval:0},energy:{base:-8,interval:2000}},'vehicle-depot':{btc:{base:0,interval:0},hash:{base:0,interval:0},gold:{base:1,interval:18e4},energy:{base:-12,interval:2000}},'aircraft-hangar':{btc:{base:0,interval:0},hash:{base:0,interval:0},gold:{base:0,interval:0},energy:{base:-10,interval:2000}},'research-lab':{btc:{base:0,interval:0},hash:{base:5,interval:3e4},gold:{base:0,interval:0},energy:{base:-10,interval:2000}},'hacker-academy':{btc:{base:0.000005,interval:12e4},hash:{base:0,interval:0},gold:{base:0,interval:0},energy:{base:-12,interval:2000}},'defense-tower':{btc:{base:0,interval:0},hash:{base:0,interval:0},gold:{base:0,interval:0},energy:{base:-6,interval:2000}}};
    this.gpuMiningEnabled = false;
    this.btcPrice = 108459.87;
    this.rtx3060DailyEarnings = 0.25;
    this.gameTimeMinutes = 60;
    this.gameTimeSeconds = 0;
    this.timerInterval = null;
    this.energyProduction = 0;
    this.energyConsumption = 0;
    this.energyNet = 0;
    this.lowEnergyWarningShown = false;
    this.energyDeficit = false;
    this.btcInvested = 0;
    this.totalHashProduced = 0;
    this.miningFarms = 0;
    this.totalMiningLevel = 0;
    this.miningEfficiency = 0;
    this.nftItems = {'gpu-miner':{owned:false,btcBoost:0.15,cost:0.001},'asic-miner':{owned:false,btcBoost:0.3,cost:0.0035},'hash-boost':{owned:false,hashBoost:0.25,costHash:5000},'energy-core':{owned:false,energyBonus:50,cost:0.0015},'defense-matrix':{owned:false,defenseBoost:0.2,costHash:8000},'quantum-chip':{owned:false,speedBoost:0.1,cost:0.005}};
    this.researchProjects = {'mining-optimization':{researched:false,progress:0,cost:2000,btcBoost:0.1},'energy-efficiency':{researched:false,progress:0,cost:3500,energyReduction:0.15},'cyber-defense':{researched:false,progress:0,cost:5000,defenseBoost:0.25},'quantum-computing':{researched:false,progress:0,cost:0.001,speedBoost:0.2},'ai-assistant':{researched:false,progress:0,cost:0.0025,automation:true}};
    this.lastBTC = this.resources.btc;
    this.lastHash = this.resources.hash;
    this.lastGold = this.resources.gold;
    this.lastEnergy = this.resources.energy;
    
    // Inicializar IA enemiga
    this.enemyAI = new EnemyAI(this);
    this.lastUpdateTime = Date.now();
    
    // Inicializar sistema de contratos
    this.contracts = [];
    this.contractIdCounter = 1;
    
    // Inicializar componentes del juego
    this.initializeGrid();
    this.setupEventListeners();
    this.updateBuildingAvailability();
    this.updateUnitButtons();
    this.calculateEnergyStats();
    this.updateStats();
    this.updateEnergyVisuals();
    
    // Iniciar el bucle de actualización de la IA
    this.startAIUpdateLoop();
  }

  loadGame() {
    try {
      const saveData = localStorage.getItem('hashwar_save');
      if (!saveData) return false;

      const data = JSON.parse(saveData);
      
      // Validar versión
      if (data.version !== "1.0.0") {
        console.log('Versión de guardado incompatible');
        return false;
      }

      // Cargar datos básicos
      this.resources = data.resources;
      this.playerLevel = data.playerLevel;
      this.playerXP = data.playerXP;
      this.xpToNextLevel = data.xpToNextLevel;
      this.playerUnits = data.units || this.playerUnits;
      
      // Cargar IA enemiga
      if (data.enemyAI) {
        this.enemyAI.difficulty = data.enemyAI.difficulty;
        this.enemyAI.evolution = data.enemyAI.evolution;
      }
      
      // Cargar estado del juego
      if (data.gameState) {
        this.btcInvested = data.gameState.btcInvested;
        this.totalHashProduced = data.gameState.totalHashProduced;
      }
      
      // Cargar contratos
      if (data.contracts) {
        this.contracts = data.contracts;
        this.contractIdCounter = data.contractIdCounter || 1;
      }
      
      // Reconstruir edificios
      this.gameData.buildings = new Map(data.buildings);
      this.rebuildGameState();
      
      this.showNotification('Partida cargada correctamente');
      return true;
      
    } catch (error) {
      console.error('Error cargando partida:', error);
      return false;
    }
  }

  rebuildGameState() {
    // Reconstruir la UI desde los datos guardados
    this.gameData.buildings.forEach((building, index) => {
      const cell = document.querySelector(`[data-index="${index}"]`);
      if (cell) {
        const buildingElement = document.createElement('div');
        buildingElement.className = `building ${building.type} glow-effect`;
        buildingElement.dataset.type = building.type;
        buildingElement.dataset.level = building.level;
        buildingElement.dataset.index = index;

        const levelIndicator = document.createElement('div');
        levelIndicator.className = 'level-indicator';
        levelIndicator.textContent = `L${building.level}`;
        buildingElement.appendChild(levelIndicator);

        const buildingName = document.createElement('div');
        buildingName.className = 'building-name';
        buildingName.textContent = this.getBuildingLabel(building.type);
        buildingElement.appendChild(buildingName);

        cell.appendChild(buildingElement);
      }
    });

    this.updateResourceDisplay();
    this.updateBuildingAvailability();
    this.updateUnitsPanel();
    this.updateEnergyStats();
    this.updateContractsPanel();
  }

  showErrorScreen(message) {
    document.getElementById('loading-screen').innerHTML = `
      <div style="text-align:center;color:#ff4444;">
        <h2>ERROR</h2>
        <p>${message}</p>
        <button onclick="location.reload()" style="padding:10px 20px;margin:20px;background:#ff4444;color:white;border:none;border-radius:5px;cursor:pointer;">
          Reintentar
        </button>
      </div>
    `;
  }

  startGame() {
    this.startGameTimer();
    this.startGameLoop();
    this.showNotification('¡Juego iniciado!');
    this.showTutorial();
  }

  updateUnitsPanel() {
    Object.keys(this.playerUnits).forEach(unitType => {
      const countElement = document.getElementById(`${unitType}-count`);
      if (countElement) {
        countElement.textContent = this.playerUnits[unitType];
      }
    });
  }

  // Resto de métodos del juego
  startAIUpdateLoop() {
    setInterval(() => {
      const now = Date.now();
      const deltaTime = now - this.lastUpdateTime;
      this.lastUpdateTime = now;
      
      this.enemyAI.update(deltaTime);
    }, 1000);
  }

  initializeGrid() {
    for (let i = 0; i < 80; i++) {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.index = i;
      this.grid.appendChild(cell);
    }
  }

  updateBuildingAvailability() {
    const completedModules = JSON.parse(localStorage.getItem('modulesCompleted')) || [];
    
    document.querySelectorAll('.building-btn').forEach(btn => {
      const buildingType = btn.dataset.building;
      const requiredLevel = this.buildingLevelRequirements[buildingType];
      const academyReq = this.academyRequirements[buildingType];
      
      let isLocked = this.playerLevel < requiredLevel;
      let lockReason = "";

      if (isLocked) lockReason = `Nvl. ${requiredLevel}`;
      
      // Validar si requiere un módulo de la academia
      if (academyReq && !completedModules.includes(academyReq)) {
        isLocked = true;
        lockReason = "Academia";
      }

      const reqEl = btn.querySelector('.level-requirement');
      if (!isLocked) {
        btn.classList.remove('building-locked');
        btn.disabled = false;
        if(reqEl) reqEl.textContent = `Nvl. ${requiredLevel}`;
      } else {
        btn.classList.add('building-locked');
        btn.disabled = true;
        if(reqEl) reqEl.textContent = lockReason;
      }
    });
  }

  updateUnitButtons() {
    for (const [unitType, requiredBuilding] of Object.entries(this.unitBuildingRequirements)) {
      const button = document.getElementById(`${unitType}-btn`);
      if (button) {
        const hasBuilding = Array.from(this.gameData.buildings.values()).some(b => b.type === requiredBuilding);
        button.disabled = !hasBuilding;
      }
    }
  }

  gainXP(amount) {
    this.playerXP += amount;
    if (this.playerXP >= this.xpToNextLevel) {
      this.playerLevel++;
      this.playerXP -= this.xpToNextLevel;
      this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);
      this.showNotification(`¡Subiste al nivel ${this.playerLevel}!`);
      this.updateBuildingAvailability();
      this.updateLevelDisplay();
    }
    this.updateLevelDisplay();
  }

  updateLevelDisplay() {
    document.getElementById('player-level').textContent = `Nvl. ${this.playerLevel}`;
    const xpPercentage = this.playerXP / this.xpToNextLevel * 100;
    document.getElementById('xp-progress').style.width = `${xpPercentage}%`;
  }

  startGameTimer() {
    this.gameTimeMinutes = 15;
    this.gameTimeSeconds = 0;
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.updateGameTimer();
    }, 1000);
  }

  updateGameTimer() {
    this.gameTimeSeconds--;
    if (this.gameTimeSeconds < 0) {
      this.gameTimeMinutes--;
      this.gameTimeSeconds = 59;
      if (this.gameTimeMinutes <= 5) {
        document.getElementById('timer-container').classList.add('timer-warning');
      }
    }
    this.updateTimerDisplay();
    if (this.gameTimeMinutes <= 0 && this.gameTimeSeconds <= 0) {
      this.handleTimeUp();
    }
  }

  updateTimerDisplay() {
    const minutesStr = this.gameTimeMinutes.toString().padStart(2, '0');
    const secondsStr = this.gameTimeSeconds.toString().padStart(2, '0');
    document.getElementById('game-timer').textContent = `${minutesStr}:${secondsStr}`;
  }

  handleTimeUp() {
    clearInterval(this.timerInterval);
    this.showNotification("¡TIEMPO AGOTADO! La partida ha terminado.");
    document.querySelectorAll('.building-btn').forEach(btn => {
      btn.disabled = true;
    });
    document.getElementById('attack-btn').disabled = true;
    document.querySelectorAll('.create-unit-btn').forEach(btn => {
      btn.disabled = true;
    });
  }

  setupEnergyEvents() {
    const energyDisplay = document.getElementById('energy-display');
    const energyDetails = document.getElementById('energy-details');
    energyDisplay.addEventListener('click', () => {
      energyDetails.style.display = energyDetails.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', e => {
      if (!energyDisplay.contains(e.target) && !energyDetails.contains(e.target)) {
        energyDetails.style.display = 'none';
      }
    });
  }

  calculateEnergyStats() {
    this.energyProduction = 0;
    this.energyConsumption = 0;
    this.gameData.buildings.forEach(building => {
      const production = this.buildingProduction[building.type].energy;
      const levelBonus = LEVEL_BONUSES[building.level];
      if (production.base > 0) {
        this.energyProduction += production.base * levelBonus;
      } else if (production.base < 0) {
        this.energyConsumption += Math.abs(production.base) * levelBonus;
      }
    });
    this.energyNet = this.energyProduction - this.energyConsumption;
    this.updateEnergyDisplay();
  }

  updateEnergyDisplay() {
    const energyBar = document.getElementById('energy-bar');
    const energyCount = document.getElementById('energy-count');
    const energyMax = document.getElementById('energy-max');
    const energyNet = document.getElementById('energy-net');
    const energyProduction = document.getElementById('energy-production');
    const energyConsumption = document.getElementById('energy-consumption');
    const energyBalance = document.getElementById('energy-balance');
    const energyStatus = document.getElementById('energy-status');
    const energyPercentage = this.resources.energy / this.maxEnergy * 100;
    energyBar.style.width = `${energyPercentage}%`;
    energyBar.classList.remove('warning', 'critical');
    if (energyPercentage <= 20) {
      energyBar.classList.add('critical');
    } else if (energyPercentage <= 50) {
      energyBar.classList.add('warning');
    }
    energyCount.textContent = this.resources.energy;
    energyMax.textContent = this.maxEnergy;
    energyNet.textContent = `(${this.energyNet >= 0 ? '+' : ''}${this.energyNet})`;
    energyNet.className = `energy-net ${this.energyNet >= 0 ? 'positive' : 'negative'}`;
    energyProduction.textContent = `+${this.energyProduction}`;
    energyConsumption.textContent = `-${this.energyConsumption}`;
    energyBalance.textContent = `${this.energyNet >= 0 ? '+' : ''}${this.energyNet}`;
    energyBalance.className = `energy-details-value ${this.energyNet >= 0 ? 'positive' : 'negative'}`;
    if (this.energyNet < 0) {
      energyStatus.textContent = "Déficit";
      energyStatus.className = "energy-details-value negative";
      this.energyDeficit = true;
      if (!this.lowEnergyWarningShown) {
        this.showEnergyAlert();
        this.lowEnergyWarningShown = true;
      }
    } else if (this.energyNet === 0) {
      energyStatus.textContent = "Equilibrado";
      energyStatus.className = "energy-details-value";
      this.lowEnergyWarningShown = false;
      this.energyDeficit = false;
    } else {
      energyStatus.textContent = "Excedente";
      energyStatus.className = "energy-details-value positive";
      this.lowEnergyWarningShown = false;
      this.energyDeficit = false;
    }
  }

  showEnergyAlert() {
    const alert = document.getElementById('energy-alert');
    alert.style.display = 'block';
    setTimeout(() => {
      alert.style.display = 'none';
    }, 5000);
  }

  updateEnergyVisuals() {
    const energyCritical = this.resources.energy / this.maxEnergy < 0.2;
    this.gameData.buildings.forEach((building, index) => {
      const buildingElement = document.querySelector(`[data-index="${index}"] .building`);
      if (buildingElement) {
        if (energyCritical) {
          buildingElement.classList.add('energy-critical');
          buildingElement.classList.remove('energy-low');
        } else if (this.energyDeficit) {
          buildingElement.classList.add('energy-low');
          buildingElement.classList.remove('energy-critical');
        } else {
          buildingElement.classList.remove('energy-critical', 'energy-low');
        }
      }
    });
    setTimeout(() => this.updateEnergyVisuals(), 1000);
  }

  updateStats() {
    const btcProductionPerHour = this.calculateBTCProductionPerHour();
    const hashProductionPerHour = this.calculateHashProductionPerHour();
    document.getElementById('stats-btc-invested').textContent = this.btcInvested.toFixed(8);
    document.getElementById('stats-btc-production').textContent = `+${btcProductionPerHour.toFixed(8)}/h`;
    document.getElementById('stats-hash-total').textContent = this.totalHashProduced.toLocaleString();
    document.getElementById('stats-hash-production').textContent = `+${hashProductionPerHour.toLocaleString()}/h`;
    const energyPercentage = this.resources.energy / this.maxEnergy * 100;
    document.getElementById('stats-energy').textContent = `${this.resources.energy}/${this.maxEnergy}`;
    document.getElementById('stats-energy-bar').style.width = `${energyPercentage}%`;
    document.getElementById('stats-energy-production').textContent = `+${this.energyProduction}`;
    document.getElementById('stats-energy-consumption').textContent = `-${this.energyConsumption}`;
    document.getElementById('stats-miners-count').textContent = this.miningFarms;
    document.getElementById('stats-farms-count').textContent = this.miningFarms;
    document.getElementById('stats-farms-level').textContent = this.totalMiningLevel;
    document.getElementById('stats-mining-efficiency').textContent = `${this.miningEfficiency}%`;
    setTimeout(() => this.updateStats(), 1000);
  }

  calculateBTCProductionPerHour() {
    let btcPerHour = 0;
    let totalBTCBoost = 1;
    if (this.nftItems['gpu-miner'].owned) totalBTCBoost += 0.15;
    if (this.nftItems['asic-miner'].owned) totalBTCBoost += 0.3;
    if (this.researchProjects['mining-optimization'].researched) totalBTCBoost += 0.1;
    this.gameData.buildings.forEach(building => {
      if (building.type === 'mining-farm') {
        const production = this.buildingProduction[building.type].btc;
        const levelBonus = LEVEL_BONUSES[building.level];
        const baseProduction = production.base * levelBonus * totalBTCBoost;
        const productionPerHour = baseProduction * (3600 / (production.interval / 1000));
        btcPerHour += productionPerHour;
      }
      if (building.type === 'hacker-academy') {
        const production = this.buildingProduction[building.type].btc;
        const levelBonus = LEVEL_BONUSES[building.level];
        const baseProduction = production.base * levelBonus * totalBTCBoost;
        const productionPerHour = baseProduction * (3600 / (production.interval / 1000));
        btcPerHour += productionPerHour;
      }
    });
    return btcPerHour;
  }

  calculateHashProductionPerHour() {
    let hashPerHour = 0;
    let totalHASHBoost = 1;
    if (this.nftItems['hash-boost'].owned) totalHASHBoost += 0.25;
    this.gameData.buildings.forEach(building => {
      if (building.type === 'mining-farm') {
        const production = this.buildingProduction[building.type].hash;
        const levelBonus = LEVEL_BONUSES[building.level];
        const baseProduction = production.base * levelBonus * totalHASHBoost;
        const productionPerHour = baseProduction * (3600 / (production.interval / 1000));
        hashPerHour += productionPerHour;
      }
      if (building.type === 'research-lab') {
        const production = this.buildingProduction[building.type].hash;
        const levelBonus = LEVEL_BONUSES[building.level];
        const baseProduction = production.base * levelBonus * totalHASHBoost;
        const productionPerHour = baseProduction * (3600 / (production.interval / 1000));
        hashPerHour += productionPerHour;
      }
    });
    return hashPerHour;
  }

  calculateMiningEfficiency() {
    if (this.miningFarms > 0) {
      this.miningEfficiency = Math.round(this.totalMiningLevel / this.miningFarms * 100 / 5 * 100);
    } else {
      this.miningEfficiency = 0;
    }
  }

  setupEventListeners() {
    document.getElementById('tutorial-next').addEventListener('click', () => {
      this.advanceTutorial();
    });
    document.getElementById('attack-btn').addEventListener('click', () => {
      this.startBattle();
      playLaserSound();
    });
    document.querySelectorAll('.building-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        if (btn.disabled) return;
        document.querySelectorAll('.building-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedBuilding = btn.dataset.building;
        if (this.tutorialActive) {
          this.checkTutorialProgress(btn.dataset.building);
        }
      });
    });
    document.querySelectorAll('.create-unit-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        if (btn.disabled) return;
        this.createUnit(btn.dataset.unit);
        playLaserSound();
      });
    });
    this.grid.addEventListener('click', e => {
      if (e.target.classList.contains('grid-cell') && this.selectedBuilding) {
        this.placeBuilding(parseInt(e.target.dataset.index));
        playBuildingSound();
      } else if (this.unitMode === 'move' && this.selectedUnit) {
        this.moveUnitToCell(parseInt(e.target.dataset.index));
      } else if (this.unitMode === 'attack' && this.selectedUnit) {
        this.attackWithUnit(parseInt(e.target.dataset.index));
      }
    });
    this.grid.addEventListener('click', e => {
      if (e.target.classList.contains('building')) {
        this.showUpgradePanel(e.target);
      }
    });
    this.grid.addEventListener('contextmenu', e => {
      e.preventDefault();
      if (e.target.classList.contains('building')) {
        this.destroyBuilding(e.target);
      } else if (e.target.classList.contains('grid-cell')) {
        const building = e.target.querySelector('.building');
        if (building) {
          this.destroyBuilding(building);
        }
      }
    });
    document.getElementById('upgrade-btn').addEventListener('click', () => {
      this.upgradeBuilding();
      playBuildingSound();
    });
    document.getElementById('destroy-btn').addEventListener('click', () => {
      if (this.currentUpgrade) {
        this.destroyBuilding(this.currentUpgrade.element);
        document.getElementById('upgrade-panel').style.display = 'none';
      }
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.bottom-hud, .units-tab, .nft-store-tab, .research-tab, .contracts-tab').forEach(tab => {
          tab.style.display = 'none';
        });
        const tabName = btn.dataset.tab;
        if (tabName === 'buildings') {
          document.getElementById('buildings-tab').style.display = 'flex';
        } else if (tabName === 'units') {
          document.getElementById('units-tab').style.display = 'flex';
        } else if (tabName === 'nft-store') {
          document.getElementById('nft-store-tab').style.display = 'flex';
        } else if (tabName === 'research') {
          document.getElementById('research-tab').style.display = 'flex';
        } else if (tabName === 'contracts') {
          document.getElementById('contracts-tab').style.display = 'flex';
          this.showContractsPanel();
        }
      });
    });
    document.getElementById('move-unit-btn').addEventListener('click', () => {
      this.setUnitMode('move');
    });
    document.getElementById('attack-unit-btn').addEventListener('click', () => {
      this.setUnitMode('attack');
    });
    document.getElementById('stop-unit-btn').addEventListener('click', () => {
      this.setUnitMode(null);
      if (this.selectedUnit) {
        this.selectedUnit.element.classList.remove('attacking', 'moving');
      }
    });
    document.querySelector('.game-area').addEventListener('click', e => {
      if (e.target.classList.contains('unit')) {
        this.selectUnit(e.target);
      } else if (!e.target.closest('.units-control-panel') && !e.target.closest('.units-panel') && !e.target.closest('.upgrade-panel')) {
        this.deselectUnit();
      }
    });
    this.setupEnergyEvents();
    document.getElementById('stats-btn').addEventListener('click', () => {
      const statsPanel = document.getElementById('stats-panel');
      statsPanel.style.display = statsPanel.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', e => {
      const statsPanel = document.getElementById('stats-panel');
      const statsBtn = document.getElementById('stats-btn');
      if (!statsPanel.contains(e.target) && !statsBtn.contains(e.target) && statsPanel.style.display === 'block') {
        statsPanel.style.display = 'none';
      }
    });
    document.querySelectorAll('.nft-item').forEach(item => {
      item.addEventListener('click', () => {
        this.purchaseNFT(item.dataset.nft);
      });
    });
    document.querySelectorAll('.research-item').forEach(item => {
      item.addEventListener('click', () => {
        this.startResearch(item.dataset.research);
      });
    });
    
    // Event listeners para contratos
    document.getElementById('clear-contracts-btn').addEventListener('click', () => {
      this.clearContracts();
    });
    document.getElementById('export-contracts-btn').addEventListener('click', () => {
      this.exportContracts();
    });
    document.getElementById('close-contract-detail').addEventListener('click', () => {
      document.getElementById('contract-detail-panel').style.display = 'none';
    });
  }

  purchaseNFT(nftId) {
    const nft = this.nftItems[nftId];
    if (nft.owned) {
      this.showNotification('¡Ya posees este NFT!');
      return;
    }
    if (nft.costHash) {
      if (this.resources.hash >= nft.costHash) {
        this.resources.hash -= nft.costHash;
        nft.owned = true;
        this.applyNFTBenefits(nftId);
        this.showNotification(`¡Has comprado ${nftId.toUpperCase()}!`);
        this.updateResourceDisplay();
        
        // Registrar contrato
        this.logContract('nft', {
          nftId: nftId,
          cost: nft.costHash,
          costType: 'HASH',
          owner: 'player'
        });
      } else {
        this.showNotification('¡HASH insuficiente para comprar este NFT!');
      }
    } else {
      if (this.resources.btc >= nft.cost) {
        this.resources.btc -= nft.cost;
        nft.owned = true;
        this.applyNFTBenefits(nftId);
        this.showNotification(`¡Has comprado ${nftId.toUpperCase()}!`);
        this.updateResourceDisplay();
        
        // Registrar contrato
        this.logContract('nft', {
          nftId: nftId,
          cost: nft.cost,
          costType: 'BTC',
          owner: 'player'
        });
      } else {
        this.showNotification('¡BTC insuficientes para comprar este NFT!');
      }
    }
  }

  applyNFTBenefits(nftId) {
    const nft = this.nftItems[nftId];
    if (nft.energyBonus) {
      this.maxEnergy += nft.energyBonus;
      this.updateEnergyDisplay();
    }
    this.showNotification(`¡Beneficios de ${nftId.toUpperCase()} aplicados!`);
  }

  startResearch(researchId) {
    const research = this.researchProjects[researchId];
    if (research.researched) {
      this.showNotification('¡Esta investigación ya está completada!');
      return;
    }
    if (research.progress > 0) {
      this.showNotification('¡Investigación en progreso!');
      return;
    }
    if (research.costHash) {
      if (this.resources.hash >= research.costHash) {
        this.resources.hash -= research.costHash;
        research.progress = 1;
        this.showNotification(`¡Investigación ${researchId.toUpperCase()} iniciada!`);
        this.updateResearchProgress(researchId);
        this.updateResourceDisplay();
        
        // Registrar contrato
        this.logContract('research', {
          researchId: researchId,
          cost: research.costHash,
          progress: research.progress,
          status: 'in_progress'
        });
      } else {
        this.showNotification('¡HASH insuficiente para esta investigación!');
      }
    } else {
      if (this.resources.btc >= research.cost) {
        this.resources.btc -= research.cost;
        research.progress = 1;
        this.showNotification(`¡Investigación ${researchId.toUpperCase()} iniciada!`);
        this.updateResearchProgress(researchId);
        this.updateResourceDisplay();
        
        // Registrar contrato
        this.logContract('research', {
          researchId: researchId,
          cost: research.cost,
          progress: research.progress,
          status: 'in_progress'
        });
      } else {
        this.showNotification('¡BTC insuficientes para esta investigación!');
      }
    }
  }

  updateResearchProgress(researchId) {
    const research = this.researchProjects[researchId];
    const progressBar = document.querySelector(`[data-research="${researchId}"] .research-progress-bar`);
    const interval = setInterval(() => {
      research.progress += 2;
      if (progressBar) progressBar.style.width = `${research.progress}%`;
      if (research.progress >= 100) {
        clearInterval(interval);
        research.researched = true;
        research.progress = 100;
        this.applyResearchBenefits(researchId);
        this.showNotification(`¡Investigación ${researchId.toUpperCase()} completada!`);
      }
    }, 1000);
  }

  applyResearchBenefits(researchId) {
    const research = this.researchProjects[researchId];
    if (research.energyReduction) {
      for (const bType in this.buildingProduction) {
        if (this.buildingProduction[bType].energy.base < 0) {
          this.buildingProduction[bType].energy.base *= (1 - research.energyReduction);
        }
      }
      this.calculateEnergyStats();
    }
    this.showNotification(`¡Beneficios de ${researchId.toUpperCase()} aplicados!`);
  }

  placeBuilding(index) {
    if (this.gameData.buildings.has(index)) {
      this.showNotification('¡Ya hay un edificio aquí!');
      return;
    }
    const cost = this.buildingCosts[this.selectedBuilding][0];
    if (this.resources.btc >= cost) {
      this.resources.btc -= cost;
      this.btcInvested += cost;
      const building = {type: this.selectedBuilding, level: 1, lastProduction: Date.now()};
      this.gameData.buildings.set(index, building);
      const cell = document.querySelector(`[data-index="${index}"]`);
      const buildingElement = document.createElement('div');
      buildingElement.className = `building ${this.selectedBuilding} glow-effect`;
      buildingElement.dataset.type = this.selectedBuilding;
      buildingElement.dataset.level = 1;
      buildingElement.dataset.index = index;
      const levelIndicator = document.createElement('div');
      levelIndicator.className = 'level-indicator';
      levelIndicator.textContent = 'L1';
      buildingElement.appendChild(levelIndicator);
      const buildingName = document.createElement('div');
      buildingName.className = 'building-name';
      buildingName.textContent = this.getBuildingLabel(this.selectedBuilding);
      buildingElement.appendChild(buildingName);
      cell.appendChild(buildingElement);
      this.updateResourceDisplay();
      this.updateUnitButtons();
      this.calculateEnergyStats();
      this.gainXP(20);
      if (this.selectedBuilding === 'mining-farm') {
        this.miningFarms++;
        this.totalMiningLevel += 1;
        this.calculateMiningEfficiency();
      }
      
      // Registrar contrato
      this.logContract('building', {
        buildingType: this.selectedBuilding,
        index: index,
        cost: cost,
        level: 1
      });
    } else {
      this.showNotification('¡BTC insuficientes!');
    }
  }

  getBuildingLabel(type) {
    const labels = {'base':'BASE','power-plant':'ENERGÍA','mining-farm':'MINERÍA','barracks':'BARRACAS','vehicle-depot':'TALLER','aircraft-hangar':'HANGAR','research-lab':'LAB','hacker-academy':'HACKERS','defense-tower':'DEFENSA'};
    return labels[type] || type.toUpperCase();
  }

  destroyBuilding(element) {
    const index = parseInt(element.dataset.index);
    const building = this.gameData.buildings.get(index);
    if (building) {
      if (building.type === 'mining-farm') {
        this.miningFarms--;
        this.totalMiningLevel -= building.level;
        this.calculateMiningEfficiency();
      }
      this.gameData.buildings.delete(index);
      element.remove();
      this.calculateEnergyStats();
      this.updateUnitButtons();
      this.showNotification(`Edificio destruido.`);
      playExplosionSound();
      
      // Registrar contrato
      this.logContract('destroy', {
        buildingType: building.type,
        index: index,
        level: building.level
      });
    }
  }

  showUpgradePanel(element) {
    const index = parseInt(element.dataset.index);
    const building = this.gameData.buildings.get(index);
    this.currentUpgrade = {element, index, building};
    const panel = document.getElementById('upgrade-panel');
    document.getElementById('upgrade-building-name').textContent = this.getBuildingName(building.type);
    const upgradeCosts = this.buildingCosts[building.type];
    const nextLevel = building.level + 1;
    const upgradeBtn = document.getElementById('upgrade-btn');
    if (nextLevel <= 5) {
      const cost = upgradeCosts[nextLevel - 1];
      upgradeBtn.textContent = `MEJORAR A L${nextLevel} (${cost.toFixed(8)} BTC)`;
      upgradeBtn.disabled = this.resources.btc < cost;
    } else {
      upgradeBtn.textContent = 'NIVEL MÁXIMO';
      upgradeBtn.disabled = true;
    }
    panel.style.display = 'block';
  }

  getBuildingName(type) {
    const names = {'base':'Base Central','power-plant':'Planta de Energía','mining-farm':'Granja de Minería','barracks':'Barracas','vehicle-depot':'Depósito de Vehículos','aircraft-hangar':'Hangar de Aviones','research-lab':'Laboratorio de Investigación','hacker-academy':'Academia de Hackers','defense-tower':'Torre de Defensa'};
    return names[type] || type;
  }

  upgradeBuilding() {
    if (!this.currentUpgrade) return;
    const {building, element} = this.currentUpgrade;
    const upgradeCosts = this.buildingCosts[building.type];
    const nextLevel = building.level + 1;
    if (nextLevel <= 5) {
      const cost = upgradeCosts[nextLevel - 1];
      if (this.resources.btc >= cost) {
        this.resources.btc -= cost;
        this.btcInvested += cost;
        building.level = nextLevel;
        element.dataset.level = nextLevel;
        element.querySelector('.level-indicator').textContent = `L${nextLevel}`;
        this.updateResourceDisplay();
        this.showUpgradePanel(element);
        this.calculateEnergyStats();
        this.gainXP(30);
        if (building.type === 'mining-farm') {
          this.totalMiningLevel += 1;
          this.calculateMiningEfficiency();
        }
        this.showNotification(`¡${this.getBuildingName(building.type)} mejorado al nivel ${nextLevel}!`);
        
        // Registrar contrato
        this.logContract('upgrade', {
          buildingType: building.type,
          index: this.currentUpgrade.index,
          cost: cost,
          level: nextLevel
        });
      } else {
        this.showNotification('¡BTC insuficientes!');
      }
    }
  }

  createUnit(unitType) {
    const cost = this.unitCosts[unitType];
    if (this.resources.hash >= cost.hash && this.resources.energy >= cost.energy) {
      this.resources.hash -= cost.hash;
      this.resources.energy -= cost.energy;
      this.playerUnits[unitType]++;
      this.updateResourceDisplay();
      this.updateUnitsPanel();
      this.showNotification(`¡${unitType.toUpperCase()} creado!`);
      this.spawnUnitOnGrid(unitType);
      
      // Registrar contrato
      this.logContract('unit', {
        unitType: unitType,
        cost: cost.hash,
        costType: 'HASH',
        energyCost: cost.energy
      });
    } else {
      if (this.resources.hash < cost.hash) this.showNotification('¡HASH insuficiente!');
      else this.showNotification('¡Energía insuficiente!');
    }
  }

  spawnUnitOnGrid(unitType) {
    const unitId = Date.now() + Math.random().toString(36).substr(2, 9);
    const unit = document.createElement('div');
    unit.className = `unit ${unitType}`;
    unit.dataset.unitId = unitId;
    unit.dataset.unitType = unitType;
    const baseBuilding = Array.from(this.gameData.buildings.entries()).find(([idx, b]) => b.type === 'base' || b.type === this.unitBuildingRequirements[unitType]);
    const pos = baseBuilding ? baseBuilding[0] : 0;
    const cell = document.querySelector(`[data-index="${pos}"]`);
    const cellRect = cell.getBoundingClientRect();
    const gameAreaRect = document.querySelector('.game-area').getBoundingClientRect();
    const x = cellRect.left - gameAreaRect.left + Math.random() * 60 - 30;
    const y = cellRect.top - gameAreaRect.top + Math.random() * 60 - 30;
    unit.style.left = `${x}px`;
    unit.style.top = `${y}px`;
    document.querySelector('.game-area').appendChild(unit);
    this.units.set(unitId, {id: unitId, type: unitType, element: unit, x, y, health: 100, target: null});
  }

  selectUnit(element) {
    this.deselectUnit();
    const unitId = element.dataset.unitId;
    this.selectedUnit = this.units.get(unitId);
    this.selectedUnit.element.classList.add('selected');
    document.getElementById('units-control-panel').style.display = 'flex';
  }

  deselectUnit() {
    if (this.selectedUnit) {
      this.selectedUnit.element.classList.remove('selected');
    }
    this.selectedUnit = null;
    this.unitMode = null;
    document.getElementById('units-control-panel').style.display = 'none';
    document.querySelectorAll('.move-indicator, .attack-indicator').forEach(el => el.remove());
  }

  setUnitMode(mode) {
    this.unitMode = mode;
    document.querySelectorAll('.move-indicator, .attack-indicator').forEach(el => el.remove());
    this.showNotification(`Modo: ${mode === 'move' ? 'MOVIMIENTO' : mode === 'attack' ? 'ATAQUE' : 'NORMAL'}`);
  }

  moveUnitToCell(index) {
    if (!this.selectedUnit) return;
    const cell = document.querySelector(`[data-index="${index}"]`);
    const cellRect = cell.getBoundingClientRect();
    const gameAreaRect = document.querySelector('.game-area').getBoundingClientRect();
    const targetX = cellRect.left - gameAreaRect.left + cellRect.width / 2 - 15;
    const targetY = cellRect.top - gameAreaRect.top + cellRect.height / 2 - 15;
    this.selectedUnit.element.style.transition = 'left 2s ease, top 2s ease';
    this.selectedUnit.element.style.left = `${targetX}px`;
    this.selectedUnit.element.style.top = `${targetY}px`;
    this.selectedUnit.x = targetX;
    this.selectedUnit.y = targetY;
    this.selectedUnit.element.classList.add('moving');
    setTimeout(() => {
      this.selectedUnit.element.classList.remove('moving');
    }, 2000);
    this.setUnitMode(null);
  }

  attackWithUnit(index) {
    if (!this.selectedUnit) return;
    const cell = document.querySelector(`[data-index="${index}"]`);
    this.selectedUnit.element.classList.add('attacking');
    const indicator = document.createElement('div');
    indicator.className = 'attack-indicator';
    cell.appendChild(indicator);
    this.showNotification(`¡${this.selectedUnit.type.toUpperCase()} atacando posición ${index}!`);
    playTurretSound();
    setTimeout(() => {
      indicator.remove();
      this.selectedUnit.element.classList.remove('attacking');
    }, 3000);
    this.setUnitMode(null);
  }

  startBattle() {
    if (this.battleActive) return;
    this.battleActive = true;
    this.showNotification("¡INICIANDO ATAQUE A BASE ENEMIGA!");
    const enemyPositions = [36, 37, 38, 39, 46, 47, 48, 49, 56, 57, 58, 59];
    enemyPositions.forEach(pos => {
      const cell = document.querySelector(`[data-index="${pos}"]`);
      if (cell) {
        const indicator = document.createElement('div');
        indicator.className = 'battle-indicator';
        indicator.textContent = 'ATAQUE';
        cell.appendChild(indicator);
      }
    });
    
    // Registrar contrato
    this.logContract('battle', {
      type: 'attack',
      target: 'enemy_base',
      status: 'initiated'
    });
    
    setTimeout(() => {
      this.battleActive = false;
      document.querySelectorAll('.battle-indicator').forEach(el => el.remove());
      this.showNotification("Ataque finalizado. Botín: 0.00005 BTC, 500 $HASH");
      this.resources.btc += 0.00005;
      this.resources.hash += 500;
      this.updateResourceDisplay();
      this.gainXP(100);
    }, 10000);
  }

  startGameLoop() {
    setInterval(() => {
      this.gameData.buildings.forEach((building, index) => {
        const production = this.buildingProduction[building.type];
        const now = Date.now();
        const levelBonus = LEVEL_BONUSES[building.level];
        const energyMultiplier = this.energyDeficit ? 0.3 : 1.0;
        if (production.btc.base > 0 && now - building.lastProduction >= production.btc.interval) {
          let btcBoost = 1;
          if (this.nftItems['gpu-miner'].owned) btcBoost += 0.15;
          if (this.nftItems['asic-miner'].owned) btcBoost += 0.3;
          if (this.researchProjects['mining-optimization'].researched) btcBoost += 0.1;
          const amount = production.btc.base * levelBonus * energyMultiplier * btcBoost;
          this.resources.btc += amount;
          building.lastProduction = now;
          this.showFloatingResource(index, `+${amount.toFixed(8)} BTC`, 'btc');
          playMiningSound();
        }
        if (production.hash.base > 0 && now - building.lastProduction >= production.hash.interval) {
          let hashBoost = 1;
          if (this.nftItems['hash-boost'].owned) hashBoost += 0.25;
          const amount = Math.floor(production.hash.base * levelBonus * energyMultiplier * hashBoost);
          this.resources.hash += amount;
          this.totalHashProduced += amount;
          building.lastProduction = now;
          this.showFloatingResource(index, `+${amount} $HASH`, 'hash');
        }
        if (production.gold.base > 0 && now - building.lastProduction >= production.gold.interval) {
          const amount = Math.floor(production.gold.base * levelBonus * energyMultiplier);
          this.resources.gold += amount;
          building.lastProduction = now;
          this.showFloatingResource(index, `+${amount} GOLD`, 'gold');
        }
      });
      this.updateResourceDisplay();
    }, 1000);
  }

  showFloatingResource(index, text, type) {
    const cell = document.querySelector(`[data-index="${index}"]`);
    const floating = document.createElement('div');
    floating.className = `production-indicator ${type}-text`;
    floating.textContent = text;
    floating.style.position = 'absolute';
    floating.style.bottom = '20px';
    floating.style.left = '50%';
    floating.style.transform = 'translateX(-50%)';
    floating.style.animation = 'slideIn 1s forwards';
    cell.appendChild(floating);
    setTimeout(() => floating.remove(), 1000);
  }

  saveGlobalHash() {
    localStorage.setItem('userHash', Math.floor(this.resources.hash));
  }

  updateResourceDisplay() {
    const btcEl = document.getElementById('btc-count');
    const hashEl = document.getElementById('hash-count');
    const goldEl = document.getElementById('gold-count');
    
    if(btcEl) btcEl.textContent = this.resources.btc.toFixed(8);
    if(hashEl) hashEl.textContent = Math.floor(this.resources.hash).toLocaleString();
    if(goldEl) goldEl.textContent = Math.floor(this.resources.gold);
    
    this.saveGlobalHash(); // Guardar en Academia
    this.updateBuildingAvailability();
  }

  showNotification(message) {
    const container = document.querySelector('.game-area');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    container.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  showTutorial() {
    document.getElementById('tutorial-overlay').style.display = 'flex';
  }

  advanceTutorial() {
    this.tutorialStep++;
    const tutorialText = document.getElementById('tutorial-text');
    const tutorialNext = document.getElementById('tutorial-next');
    
    // Solo dos mensajes más después de la bienvenida inicial
    if (this.tutorialStep === 1) {
      tutorialText.innerHTML = `
        <h3 style="color:#00d4ff; margin-bottom:10px;">PASO 1: MINERÍA ESTRATÉGICA</h3>
        <p>Construye <strong>Plantas de Energía</strong> y <strong>Granjas de Minería</strong> para generar recursos virtuales ($HASH y BTC SIM).</p>
        <p style="margin-top:10px;">Sin energía, tu producción se detendrá. ¡Gestiona tus recursos con inteligencia!</p>
      `;
      tutorialNext.textContent = "SIGUIENTE";
    } 
    else if (this.tutorialStep === 2) {
      tutorialText.innerHTML = `
        <h3 style="color:#ff0066; margin-bottom:10px;">PASO 2: CONQUISTA LA RED</h3>
        <p>Entrena unidades en las <strong>Barracas</strong> y utiliza el botón <strong>ATACAR</strong> para saquear la base enemiga.</p>
        <p style="margin-top:10px;">¡El enemigo también evolucionará, así que no bajes la guardia!</p>
      `;
      tutorialNext.textContent = "¡ENTENDIDO, A LA BATALLA!";
    } 
    else {
      // Fin del tutorial (solo 2 ventanas adicionales)
      document.getElementById('tutorial-overlay').style.display = 'none';
      this.tutorialActive = false;
      this.showNotification("¡Sistemas online! Inicia la conquista virtual.");
    }
  }

  checkTutorialProgress(buildingType) {
    if (this.tutorialStep === 1 && buildingType === 'power-plant') this.advanceTutorial();
    else if (this.tutorialStep === 2 && buildingType === 'mining-farm') this.advanceTutorial();
    else if (this.tutorialStep === 3 && buildingType === 'barracks') this.advanceTutorial();
  }

  // Métodos del sistema de contratos
  logContract(type, details) {
    const timestamp = new Date().toISOString();
    const contractId = this.contractIdCounter++;
    const hash = this.generateHash(type + timestamp + JSON.stringify(details));
    
    const contract = {
      id: contractId,
      type: type,
      timestamp: timestamp,
      details: details,
      hash: '0x' + hash
    };
    
    this.contracts.unshift(contract); // Añadir al principio
    if (this.contracts.length > 50) this.contracts.pop(); // Limitar a 50
    
    this.updateContractsPanel();
  }

  generateHash(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(40, '0');
  }

  updateContractsPanel() {
    const countElement = document.getElementById('contracts-count');
    const listElement = document.getElementById('contracts-list');
    
    if (countElement) {
      countElement.textContent = `(${this.contracts.length})`;
    }
    
    if (listElement) {
      if (this.contracts.length === 0) {
        listElement.innerHTML = '<div class="contracts-empty">No hay transacciones registradas</div>';
        return;
      }
      
      listElement.innerHTML = '';
      this.contracts.forEach(contract => {
        const item = document.createElement('div');
        item.className = 'contract-item';
        item.innerHTML = `
          <div class="contract-header">
            <span>Contrato #${contract.id}</span>
            <span class="contract-type ${contract.type}">${contract.type.toUpperCase()}</span>
          </div>
          <div class="contract-details">
            <span class="contract-label">Fecha:</span>
            <span class="contract-value">${new Date(contract.timestamp).toLocaleTimeString()}</span>
          </div>
          <div class="contract-hash">${contract.hash.substring(0, 20)}...</div>
        `;
        item.addEventListener('click', () => this.showContractDetails(contract));
        listElement.appendChild(item);
      });
    }
  }

  showContractDetails(contract) {
    const panel = document.getElementById('contract-detail-panel');
    const content = document.getElementById('contract-detail-content');
    
    panel.style.display = 'block';
    
    let detailsHtml = `
      <div class="contract-detail-section">
        <div class="contract-detail-section-title">METADATOS</div>
        <div class="contract-detail-item">
          <span class="contract-detail-label">ID del Contrato:</span>
          <span class="contract-detail-value">#${contract.id}</span>
        </div>
        <div class="contract-detail-item">
          <span class="contract-detail-label">Tipo:</span>
          <span class="contract-detail-value">${contract.type.toUpperCase()}</span>
        </div>
        <div class="contract-detail-item">
          <span class="contract-detail-label">Timestamp:</span>
          <span class="contract-detail-value">${contract.timestamp}</span>
        </div>
      </div>
      
      <div class="contract-detail-section">
        <div class="contract-detail-section-title">DETALLES DE LA TRANSACCIÓN</div>
    `;
    
    for (const [key, value] of Object.entries(contract.details)) {
      detailsHtml += `
        <div class="contract-detail-item">
          <span class="contract-detail-label">${key}:</span>
          <span class="contract-detail-value">${typeof value === 'number' && key.includes('cost') ? value.toFixed(8) : value}</span>
        </div>
      `;
    }
    
    detailsHtml += `
      </div>
      <div class="contract-detail-section">
        <div class="contract-detail-section-title">CÓDIGO HASH (SHA-256 SIM)</div>
        <div class="contract-code">${contract.hash}</div>
      </div>
      <div class="contract-timestamp">Validado por HASHWAR Node Cluster</div>
    `;
    
    content.innerHTML = detailsHtml;
  }

  showContractsPanel() {
    const panel = document.getElementById('contracts-panel');
    panel.style.display = 'flex';
  }

  clearContracts() {
    this.contracts = [];
    this.updateContractsPanel();
    this.showNotification('Historial de contratos limpiado');
  }

  exportContracts() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.contracts, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "hashwar_contracts.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    this.showNotification('Exportando contratos...');
  }
}

// Iniciar el juego
window.onload = () => {
  new HashwarGame();
};
