/**
 * GameWorld.js - Core 2D Historical Indian RPG World System
 * 
 * Modularly manages:
 * - 5 Playable Cities: Ujjain, Bharuch, Pataliputra, Madurai, Muziris
 * - Player movement physics & AABB collision resolution
 * - Regional NPCs & Dialogue interaction
 * - Camera following & dynamic city environment loading
 */

import statesData from '../../data/states.json';
import { InputManager } from '../../game/input';
import { InteractionManager } from './Interaction';
import { LocationMarker } from './LocationMarker';
import { TradeRoute } from './TradeRoute';
import { Player } from './Player';
import { Narrator } from './Narrator';
import { MerchantManager } from '../../game/npc/MerchantManager';
import { globalDialogueManager } from '../Dialogue/DialogueManager';
import { globalQuestionManager } from '../Question/QuestionManager';
import { globalProgressManager } from '../../game/progression/ProgressManager';
import { globalTradeManager } from '../../game/trading/TradeManager';
import { WORLD_WIDTH, WORLD_HEIGHT, DEBUG_COLLISION } from '../../game/constants';

// 5 Playable City Environments
import { UjjainEnvironment } from '../../game/rendering/cities/UjjainEnvironment';
import { BharuchEnvironment } from '../../game/rendering/cities/BharuchEnvironment';
import { PataliputraEnvironment } from '../../game/rendering/cities/PataliputraEnvironment';
import { MaduraiEnvironment } from '../../game/rendering/cities/MaduraiEnvironment';
import { MuzirisEnvironment } from '../../game/rendering/cities/MuzirisEnvironment';

export class GameWorld {
  constructor(canvasWidth, canvasHeight) {
    this.worldWidth = WORLD_WIDTH;
    this.worldHeight = WORLD_HEIGHT;

    this.viewportWidth = canvasWidth;
    this.viewportHeight = canvasHeight;

    this.time = 0;
    this.currentCityId = globalProgressManager.currentLocation || 'ujjain';

    // Input manager
    this.input = new InputManager();
    this.input.attach();

    // Interaction manager (75px proximity threshold)
    this.interaction = new InteractionManager(75);
    this.isNarratorNear = false;
    this.nearMerchantId = null;
    this.activeNearNpc = null;

    // Initialize locations & routes
    this.locations = statesData.map(loc => new LocationMarker(loc));
    const locMap = {};
    this.locations.forEach(l => { locMap[l.id] = l; });
    this.routes = [
      new TradeRoute(locMap['ujjain'] || locMap['pataliputra'], locMap['bharuch'] || locMap['ujjain'], 'land')
    ];

    // Load initial city
    this.player = new Player(960, 720);
    this.narrator = new Narrator(1000, 680);
    this.merchantManager = new MerchantManager();

    this.loadCity(this.currentCityId);

    // Subscribe to progress manager location changes
    this.unsubLocation = globalProgressManager.onLocationChange?.((newLoc) => {
      if (newLoc && newLoc !== this.currentCityId) {
        this.loadCity(newLoc);
      }
    });

    // Key listener for in-world interactions (E key)
    this.handleKeyDown = (e) => {
      if (e.code === 'KeyE') {
        const isUIOpen = (
          globalDialogueManager.isOpen ||
          globalQuestionManager.isOpen ||
          globalProgressManager.hasNotification ||
          globalTradeManager.isOpen
        );
        if (isUIOpen) return;

        if (this.nearMerchantId) {
          const npc = this.merchantManager.getMerchants().find(m => m.id === this.nearMerchantId);
          if (npc) {
            const isGuide = (npc.role === 'guide' || npc.role === 'elder' || npc.id === 'merchant_dev' || npc.id === 'merchant_meera' || npc.id === 'merchant_kalyan' || npc.id === 'merchant_sundaram' || npc.id === 'merchant_sutradhar' || (npc.id && npc.id.startsWith('narrator_')));
            const guideSeq = this.currentCityId === 'pataliputra' ? 'narrator_pataliputra' : (this.currentCityId === 'bharuch' ? 'narrator_bharuch' : (this.currentCityId === 'madurai' ? 'narrator_madurai' : (this.currentCityId === 'muziris' ? 'narrator_muziris' : 'elder_merchant')));
            const dialogueKey = npc.dialogueId || (isGuide ? guideSeq : null);

            if (dialogueKey) {
              globalDialogueManager.startSequence(dialogueKey);
            } else if (npc.role === 'trader' || npc.role === 'artisan') {
              globalTradeManager.openMarket(npc.name, npc.title);
            } else {
              globalDialogueManager.startSequence('npc_townsperson');
            }
          }
        } else if (this.isNarratorNear) {
          const narratorDialogue = this.currentCityId === 'pataliputra' ? 'narrator_pataliputra' : 'elder_merchant';
          globalDialogueManager.startSequence(narratorDialogue);
        }
      }
    };
    window.addEventListener('keydown', this.handleKeyDown);
  }

  loadCity(cityId) {
    this.currentCityId = cityId;

    let env = UjjainEnvironment;
    if (cityId === 'bharuch') env = BharuchEnvironment;
    else if (cityId === 'pataliputra') env = PataliputraEnvironment;
    else if (cityId === 'madurai') env = MaduraiEnvironment;
    else if (cityId === 'muziris') env = MuzirisEnvironment;

    this.activeEnv = env;
    this.colliders = env.getColliders();

    const spawnPt = env.getSpawnPoint();
    this.player.x = spawnPt.x;
    this.player.y = spawnPt.y;
    this.player.isMoving = false;
    this.player.walkTimer = 0;
    this.player.currentLocation = cityId;

    if (this.input) {
      this.input.reset();
      this.input.setEnabled(true);
    }

    // Load city-specific merchants
    const cityMerchants = env.getMerchants();
    this.merchantManager.loadMerchants(cityMerchants);
  }

  resize(w, h) {
    this.viewportWidth = w;
    this.viewportHeight = h;
  }

  cleanup() {
    window.removeEventListener('keydown', this.handleKeyDown);
    if (this.unsubLocation) this.unsubLocation();
    if (this.input) this.input.detach();
  }

  /**
   * Update world physics, NPC paths, and entities with delta-time
   * @param {number} dt - delta time in seconds
   */
  update(dt = 1 / 60) {
    this.time += dt * 1.5;

    // Check if progress manager current location changed externally
    if (globalProgressManager.currentLocation !== this.currentCityId) {
      this.loadCity(globalProgressManager.currentLocation);
    }

    // Disable movement input when UI modal is open
    const isUIOpen = (
      globalDialogueManager.isOpen ||
      globalQuestionManager.isOpen ||
      globalProgressManager.hasNotification ||
      globalTradeManager.isOpen ||
      (globalThis.globalStoryManager && (
        globalThis.globalStoryManager.showChapterIntro ||
        globalThis.globalStoryManager.showChapterComplete ||
        globalThis.globalStoryManager.showFinalSummary
      ))
    );
    this.input.setEnabled(!isUIOpen);

    // Update player movement physics and collision resolution
    const inputVector = this.input.getMovementVector();
    this.player.update(dt, inputVector, this.colliders, this.worldWidth, this.worldHeight);

    // Update all moving NPCs
    this.merchantManager.update(dt);

    // Check proximity to interactive NPCs
    const allTargets = this.merchantManager.getMerchants();
    const proximity = this.interaction.update(this.player, allTargets);

    if (proximity && proximity.target) {
      this.isNarratorNear = false;
      this.nearMerchantId = proximity.target.id;
      this.activeNearNpc = proximity.target;
    } else {
      this.isNarratorNear = false;
      this.nearMerchantId = null;
      this.activeNearNpc = null;
    }
  }

  /**
   * Render the entire 2D Top-Down Historical RPG World
   * @param {CanvasRenderingContext2D} ctx 
   * @param {Camera} camera 
   */
  render(ctx, camera) {
    const time = this.time;
    const w = this.worldWidth;
    const h = this.worldHeight;

    ctx.save();

    // 0. Apply Camera Follow Transformation
    if (camera) {
      ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
    }

    // 1. Render Active City Environment (Ground, Buildings, Stalls, Props, Vegetation, Water)
    if (this.activeEnv) {
      this.activeEnv.render(ctx, w, h, time);
    } else {
      UjjainEnvironment.render(ctx, w, h, time);
    }

    // 2. Moving Merchant & Citizen NPCs
    this.merchantManager.draw(ctx, time, this.nearMerchantId);

    // 3. Controllable Merchant Player Character
    this.player.draw(ctx, time);

    // 4. Debug Colliders Overlay
    if (DEBUG_COLLISION) {
      this.drawDebugColliders(ctx);
    }

    ctx.restore();
  }

  drawDebugColliders(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 80, 0.7)';
    ctx.lineWidth = 1.5;
    this.colliders.forEach(c => {
      ctx.strokeRect(c.x, c.y, c.width, c.height);
      ctx.fillStyle = 'rgba(255, 0, 80, 0.8)';
      ctx.font = '8px monospace';
      ctx.fillText(c.id, c.x + 2, c.y + 10);
    });
    ctx.restore();
  }
}
