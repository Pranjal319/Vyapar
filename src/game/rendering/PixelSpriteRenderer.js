/**
 * PixelSpriteRenderer.js - Dedicated 2D Pixel-Art Character & NPC Renderer
 * 
 * Renders detailed historical Indian RPG characters with 4-directional facing
 * (down, up, left, right), smooth walking cycles, authentic attire (kurtas, dhotis,
 * turbans/pagris, sarees, angavastrams), facial features, and cast shadows.
 */

export class PixelSpriteRenderer {
  /**
   * Draw an RPG character sprite with pixel-art styling
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} x - World X position (center feet)
   * @param {number} y - World Y position (center feet)
   * @param {Object} options
   */
  static drawCharacter(ctx, x, y, {
    facing = 'down',
    isMoving = false,
    walkTimer = 0,
    time = 0,
    colors = {},
    type = 'player', // 'player' | 'elder_merchant' | 'artisan' | 'guard' | 'citizen' | 'merchant'
    skinTone = '#d49b6a',
    scale = 1.0
  } = {}) {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    if (scale !== 1.0) ctx.scale(scale, scale);

    // 1. Soft Pixel Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 11, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Walking animation phase
    const walkStep = isMoving ? Math.sin(walkTimer) : 0;
    const walkBob = isMoving ? Math.abs(Math.sin(walkTimer)) * 2 : Math.sin(time * 2.5) * 0.6;
    const armSwing = isMoving ? Math.sin(walkTimer) * 3 : 0;

    // Palette defaults
    const robeColor = colors.robe || (type === 'player' ? '#c84b31' : '#2a9d8f');
    const turbanColor = colors.turban || (type === 'elder_merchant' ? '#ffb703' : '#e76f51');
    const sashColor = colors.sash || '#ffd166';
    const accentColor = colors.accent || '#1d3557';

    // 2. Legs & Footwear (Sandals / Juttis)
    const footColor = '#3a2012';
    const leftLegY = (isMoving && walkStep > 0) ? -2 : 0;
    const rightLegY = (isMoving && walkStep < 0) ? -2 : 0;

    if (facing === 'left' || facing === 'right') {
      const dirMul = facing === 'right' ? 1 : -1;
      // Walking profile legs
      ctx.fillStyle = footColor;
      ctx.fillRect(-4 + walkStep * 3, 0 + leftLegY, 4, 4);
      ctx.fillRect(1 - walkStep * 3, 0 + rightLegY, 4, 4);
    } else {
      ctx.fillStyle = footColor;
      ctx.fillRect(-6, 0 + leftLegY, 4, 4);
      ctx.fillRect(2, 0 + rightLegY, 4, 4);
    }

    // 3. Lower Garment (Dhoti / Saree skirt / Pants)
    ctx.fillStyle = robeColor;
    if (type === 'citizen') {
      // Saree skirt with pleats
      ctx.beginPath();
      ctx.moveTo(-7, -8 - walkBob);
      ctx.lineTo(7, -8 - walkBob);
      ctx.lineTo(8, 1);
      ctx.lineTo(-8, 1);
      ctx.closePath();
      ctx.fill();

      // Golden hem
      ctx.fillStyle = sashColor;
      ctx.fillRect(-8, 0, 16, 2);
    } else {
      // Traditional Dhoti / Kurta hem
      ctx.beginPath();
      ctx.moveTo(-7, -10 - walkBob);
      ctx.lineTo(7, -10 - walkBob);
      ctx.lineTo(6, 0);
      ctx.lineTo(-6, 0);
      ctx.closePath();
      ctx.fill();

      // Center pleat
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(-1, -8 - walkBob, 2, 8);
    }

    // 4. Torso / Kurta / Angavastram
    ctx.fillStyle = robeColor;
    ctx.fillRect(-6, -18 - walkBob, 12, 10);

    // Decorative Waist Sash (Kamarbandh)
    ctx.fillStyle = sashColor;
    ctx.fillRect(-7, -11 - walkBob, 14, 3);
    // Hanging sash knot
    if (facing !== 'up') {
      ctx.fillStyle = sashColor;
      ctx.fillRect(facing === 'left' ? -5 : (facing === 'right' ? 3 : 1), -9 - walkBob, 3, 6);
    }

    // Angavastram (Draped historical shoulder shawl)
    if (type === 'elder_merchant' || type === 'player') {
      ctx.fillStyle = type === 'elder_merchant' ? '#ffd166' : '#e9c46a';
      if (facing === 'down') {
        ctx.fillRect(-6, -18 - walkBob, 4, 10);
        ctx.fillRect(-2, -12 - walkBob, 8, 3);
      } else if (facing === 'right') {
        ctx.fillRect(-2, -18 - walkBob, 5, 10);
      } else if (facing === 'left') {
        ctx.fillRect(-5, -18 - walkBob, 5, 10);
      }
    }

    // 5. Arms & Hands
    ctx.fillStyle = skinTone;
    if (facing === 'left') {
      ctx.fillRect(-7 + armSwing, -16 - walkBob, 3, 7);
      ctx.fillRect(-7 + armSwing, -9 - walkBob, 3, 3);
    } else if (facing === 'right') {
      ctx.fillRect(4 - armSwing, -16 - walkBob, 3, 7);
      ctx.fillRect(4 - armSwing, -9 - walkBob, 3, 3);
    } else {
      ctx.fillRect(-8 - armSwing, -16 - walkBob, 3, 7);
      ctx.fillRect(5 + armSwing, -16 - walkBob, 3, 7);
    }

    // Guard armor/weapon accessory
    if (type === 'guard') {
      ctx.fillStyle = '#94d2bd';
      ctx.fillRect(-8, -14 - walkBob, 2, 8); // Steel plate
      ctx.fillStyle = '#6c757d';
      ctx.fillRect(facing === 'right' ? 6 : -9, -12 - walkBob, 2, 10); // Sword hilt
    }

    // Merchant leather pouch
    if (type === 'player' || type === 'elder_merchant') {
      ctx.fillStyle = '#5c3a21';
      const pouchX = facing === 'left' ? -7 : (facing === 'right' ? 5 : 4);
      ctx.fillRect(pouchX, -10 - walkBob, 4, 4);
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(pouchX + 1, -9 - walkBob, 2, 1);
    }

    // 6. Head & Facial Features
    ctx.fillStyle = skinTone;
    ctx.fillRect(-4, -26 - walkBob, 8, 8);

    // Facial details based on facing direction
    if (facing === 'down') {
      // Eyes
      ctx.fillStyle = '#22150d';
      ctx.fillRect(-3, -24 - walkBob, 2, 2);
      ctx.fillRect(1, -24 - walkBob, 2, 2);

      // Tilak / Bindi
      ctx.fillStyle = '#e76f51';
      ctx.fillRect(-0.5, -26 - walkBob, 1.5, 2);

      // Elder Merchant White Beard
      if (type === 'elder_merchant') {
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(-3, -21 - walkBob, 6, 4);
        ctx.fillRect(-2, -17 - walkBob, 4, 2);
      } else if (type === 'guard' || type === 'merchant') {
        // Mustache
        ctx.fillStyle = '#3a2012';
        ctx.fillRect(-3, -21 - walkBob, 6, 1.5);
      }
    } else if (facing === 'left') {
      ctx.fillStyle = '#22150d';
      ctx.fillRect(-4, -24 - walkBob, 2, 2);
      if (type === 'elder_merchant') {
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(-4, -21 - walkBob, 4, 4);
      }
    } else if (facing === 'right') {
      ctx.fillStyle = '#22150d';
      ctx.fillRect(2, -24 - walkBob, 2, 2);
      if (type === 'elder_merchant') {
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, -21 - walkBob, 4, 4);
      }
    }

    // 7. Traditional Headwear / Royal Pagri (Turban) / Hair
    if (type === 'citizen') {
      // Woman's Traditional Braided Hair & Dupatta
      ctx.fillStyle = '#22150d';
      ctx.fillRect(-5, -28 - walkBob, 10, 4);
      ctx.fillRect(facing === 'left' ? 2 : -4, -24 - walkBob, 3, 10); // Braid
      ctx.fillStyle = turbanColor;
      ctx.fillRect(-5, -29 - walkBob, 10, 2); // Saree veil fold
    } else {
      // Royal Indian Turban (Tiered Pagri)
      ctx.fillStyle = turbanColor;
      ctx.fillRect(-6, -30 - walkBob, 12, 6);
      ctx.fillRect(-4, -32 - walkBob, 8, 3);

      // Turban cloth fold highlights
      ctx.fillStyle = sashColor;
      ctx.fillRect(-5, -28 - walkBob, 10, 1.5);

      // Turban Royal Crest (Kalgi / Sarpech with Ruby/Emerald jewel)
      if (type === 'player' || type === 'elder_merchant') {
        const crestX = facing === 'left' ? -3 : (facing === 'right' ? 3 : 0);
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(crestX - 1, -34 - walkBob, 3, 3);
        ctx.fillStyle = type === 'elder_merchant' ? '#d90429' : '#2a9d8f'; // Ruby / Emerald
        ctx.fillRect(crestX, -33 - walkBob, 1.5, 1.5);
      }
    }

    ctx.restore();
  }
}
