import { AnimationArea, AnimationAreaGraphics } from "@mml-io/mml-web";
import * as THREE from "three";

import { ThreeJSGraphicsAdapter } from "../ThreeJSGraphicsAdapter";

export class ThreeJSAnimationArea extends AnimationAreaGraphics<ThreeJSGraphicsAdapter> {
  private static DebugGeometry = new THREE.SphereGeometry(1, 16, 16, 1);
  private static DebugMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
    transparent: true,
    opacity: 0.3,
  });

  private debugMesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null = null;

  constructor(private positionProbe: AnimationArea<ThreeJSGraphicsAdapter>) {
    super(positionProbe);
  }

  disable(): void {}

  enable(): void {}

  setRange(): void {
    this.updateDebugVisualisation();
  }

  setPriority(): void {
    // no-op
  }

  setDebug() {
    this.updateDebugVisualisation();
  }

  private clearDebugVisualisation() {
    if (this.debugMesh) {
      this.debugMesh.removeFromParent();
      this.debugMesh = null;
    }
  }

  private updateDebugVisualisation() {
    if (!this.positionProbe.props.debug) {
      this.clearDebugVisualisation();
    } else {
      if (this.positionProbe.isConnected && !this.debugMesh) {
        const mesh = new THREE.Mesh(
          ThreeJSAnimationArea.DebugGeometry,
          ThreeJSAnimationArea.DebugMaterial,
        );
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        this.debugMesh = mesh;
        this.positionProbe.getContainer().add(this.debugMesh);
      }

      if (this.debugMesh) {
        this.debugMesh.scale.set(
          this.positionProbe.props.range,
          this.positionProbe.props.range,
          this.positionProbe.props.range,
        );
      }
    }
  }

  dispose() {
    this.clearDebugVisualisation();
  }
}
