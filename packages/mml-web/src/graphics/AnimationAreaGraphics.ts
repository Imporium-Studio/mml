import { AnimationArea, MAnimationAreaProps } from "../elements";
import { GraphicsAdapter } from "./GraphicsAdapter";

export abstract class AnimationAreaGraphics<G extends GraphicsAdapter = GraphicsAdapter> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(element: AnimationArea<G>) {}

  abstract enable(): void;

  abstract disable(): void;

  abstract setRange(range: number, mInteractionProps: MAnimationAreaProps): void;

  abstract setPriority(priority: number, mInteractionProps: MAnimationAreaProps): void;

  abstract setDebug(debug: boolean, mInteractionProps: MAnimationAreaProps): void;

  abstract dispose(): void;
}
