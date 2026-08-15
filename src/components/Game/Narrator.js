import { PixelSpriteRenderer } from '../../game/rendering/PixelSpriteRenderer';

export class Narrator {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.id = 'narrator_ujjain';
    this.name = 'Elder Merchant';
    this.title = 'Crossroads Guild Master';
    this.isPlayerNear = false;
  }

  draw(ctx, time = 0, isPlayerNear = false) {
    this.isPlayerNear = isPlayerNear;
    const x = this.x;
    const y = this.y;

    // 1. Subtle Golden Wisdom Ring on Proximity
    if (isPlayerNear) {
      ctx.save();
      const auraGlow = 14 + Math.sin(time * 3) * 2;
      ctx.strokeStyle = 'rgba(255, 209, 102, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(x, y + 4, auraGlow, auraGlow * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 2. Draw 2D Pixel-Art Elder Merchant Sprite
    PixelSpriteRenderer.drawCharacter(ctx, x, y, {
      facing: 'down',
      isMoving: false,
      walkTimer: 0,
      time: time,
      type: 'elder_merchant',
      colors: {
        robe: '#c84b31',
        turban: '#ffb703',
        sash: '#ffd166'
      },
      scale: 1.15
    });

    // 3. Temporary In-World Proximity Prompt
    if (isPlayerNear) {
      ctx.save();
      const promptY = y - 48 + Math.sin(time * 4) * 2;
      const promptText = '[E] Talk (Elder Merchant)';

      ctx.font = 'bold 9.5px "Outfit", sans-serif';
      const textWidth = ctx.measureText(promptText).width;
      const boxWidth = textWidth + 20;

      ctx.fillStyle = 'rgba(12, 17, 26, 0.94)';
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x - boxWidth / 2, promptY - 10, boxWidth, 20, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffd166';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(promptText, x, promptY);
      ctx.restore();
    }
  }
}

