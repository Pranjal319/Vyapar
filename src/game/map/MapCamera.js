/**
 * MapCamera.js - Strategic India Map Camera with Pan & Zoom
 * 
 * Supports mouse drag panning, mouse wheel zooming, and zoom level clamping.
 * Virtual Map Size: 3000 x 2400 pixels.
 */

export class MapCamera {
  constructor(viewportWidth, viewportHeight, mapWidth = 3000, mapHeight = 2400) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;

    this.zoom = 0.85; // Default zoom level
    this.minZoom = 0.5;
    this.maxZoom = 2.0;

    this.x = 1000;
    this.y = 800;

    this.isMouseDown = false;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.cameraStartX = 0;
    this.cameraStartY = 0;
  }

  resize(w, h) {
    this.viewportWidth = w;
    this.viewportHeight = h;
    this.clamp();
  }

  setZoom(newZoom, centerX = this.viewportWidth / 2, centerY = this.viewportHeight / 2) {
    const prevZoom = this.zoom;
    this.zoom = Math.max(this.minZoom, Math.min(newZoom, this.maxZoom));

    // Keep center of zoom stable
    const zoomRatio = this.zoom / prevZoom;
    this.x = (this.x + centerX) * zoomRatio - centerX;
    this.y = (this.y + centerY) * zoomRatio - centerY;

    this.clamp();
  }

  zoomIn() {
    this.setZoom(this.zoom * 1.2);
  }

  zoomOut() {
    this.setZoom(this.zoom / 1.2);
  }

  centerOn(mapX, mapY) {
    this.x = mapX * this.zoom - this.viewportWidth / 2;
    this.y = mapY * this.zoom - this.viewportHeight / 2;
    this.clamp();
  }

  startDrag(screenX, screenY) {
    this.isMouseDown = true;
    this.isDragging = false;
    this.dragStartX = screenX;
    this.dragStartY = screenY;
    this.cameraStartX = this.x;
    this.cameraStartY = this.y;
  }

  drag(screenX, screenY) {
    if (!this.isMouseDown) return;
    const dx = screenX - this.dragStartX;
    const dy = screenY - this.dragStartY;
    if (Math.hypot(dx, dy) > 5) {
      this.isDragging = true;
    }
    if (this.isDragging) {
      this.x = this.cameraStartX - dx;
      this.y = this.cameraStartY - dy;
      this.clamp();
    }
  }

  endDrag() {
    this.isMouseDown = false;
    setTimeout(() => {
      this.isDragging = false;
    }, 50);
  }

  clamp() {
    const maxCameraX = Math.max(0, this.mapWidth * this.zoom - this.viewportWidth);
    const maxCameraY = Math.max(0, this.mapHeight * this.zoom - this.viewportHeight);

    this.x = Math.max(0, Math.min(this.x, maxCameraX));
    this.y = Math.max(0, Math.min(this.y, maxCameraY));
  }

  screenToMap(screenX, screenY) {
    return {
      x: (screenX + this.x) / this.zoom,
      y: (screenY + this.y) / this.zoom
    };
  }

  screenToWorld(screenX, screenY) {
    return this.screenToMap(screenX, screenY);
  }

  mapToScreen(mapX, mapY) {
    return {
      x: mapX * this.zoom - this.x,
      y: mapY * this.zoom - this.y
    };
  }
}
