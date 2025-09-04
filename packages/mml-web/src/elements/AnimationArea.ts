import { AnimatedAttributeHelper } from "../attribute-animation";
import { AttributeHandler, parseBoolAttribute, parseFloatAttribute } from "../attributes";
import { OrientedBoundingBox } from "../bounding-box";
import { AnimationAreaGraphics, GraphicsAdapter } from "../graphics";
import { Vect3 } from "../math";
import { IMMLScene } from "../scene";
import { AnimationType } from "./AttributeAnimation";
import { MElement } from "./MElement";
import { TransformableElement } from "./TransformableElement";

const defaultAnimationAreaRange = 5;
const defaultAnimationSrc = null;
const defaultAnimationLoop = true;
const defaultAnimationSpeed = 1.0;
const defaultPriority = 1;
const defaultDebug = false;

export type MAnimationAreaProps = {
  range: number;
  animationSrc: string | null;
  loop: boolean;
  speed: number;
  priority: number;
  debug: boolean;
};

export class AnimationArea<
  G extends GraphicsAdapter = GraphicsAdapter,
> extends TransformableElement<G> {
  static tagName = "m-animation-area";
  private animationAreaGraphics: AnimationAreaGraphics<G> | null;

  public props: MAnimationAreaProps = {
    range: defaultAnimationAreaRange,
    animationSrc: defaultAnimationSrc,
    loop: defaultAnimationLoop,
    speed: defaultAnimationSpeed,
    priority: defaultPriority,
    debug: defaultDebug,
  };

  private interactionAnimatedAttributeHelper = new AnimatedAttributeHelper(this, {
    range: [
      AnimationType.Number,
      defaultAnimationAreaRange,
      (newValue: number) => {
        this.props.range = newValue;
        this.applyBounds();
        this.animationAreaGraphics?.setRange(newValue, this.props);
      },
    ],
  });

  private static attributeHandler = new AttributeHandler<AnimationArea<GraphicsAdapter>>({
    range: (instance, newValue) => {
      instance.interactionAnimatedAttributeHelper.elementSetAttribute(
        "range",
        parseFloatAttribute(newValue, defaultAnimationAreaRange),
      );
    },
    animationSrc: (instance, newValue) => {
      instance.props.animationSrc = newValue;
    },
    loop: (instance, newValue) => {
      instance.props.loop = parseBoolAttribute(newValue, defaultAnimationLoop);
    },
    speed: (instance, newValue) => {
      instance.props.speed = parseFloatAttribute(newValue, defaultAnimationSpeed);
    },
    priority: (instance, newValue) => {
      instance.props.priority = parseFloatAttribute(newValue, defaultPriority);
      instance.animationAreaGraphics?.setPriority(instance.props.priority, instance.props);
    },
    debug: (instance, newValue) => {
      instance.props.debug = parseBoolAttribute(newValue, defaultDebug);
      instance.animationAreaGraphics?.setDebug(instance.props.debug, instance.props);
    },
  });
  static get observedAttributes(): Array<string> {
    return [
      ...TransformableElement.observedAttributes,
      ...AnimationArea.attributeHandler.getAttributes(),
    ];
  }

  private registeredScene: IMMLScene<G> | null = null;

  constructor() {
    super();
  }

  protected enable() {
    // TODO
  }

  protected disable() {
    // TODO
  }

  public getContentBounds(): OrientedBoundingBox | null {
    if (!this.transformableElementGraphics) {
      return null;
    }
    return OrientedBoundingBox.fromSizeAndMatrixWorld(
      new Vect3(this.props.range * 2, this.props.range * 2, this.props.range * 2),
      this.transformableElementGraphics.getWorldMatrix(),
    );
  }

  public addSideEffectChild(child: MElement<G>): void {
    this.interactionAnimatedAttributeHelper.addSideEffectChild(child);
    super.addSideEffectChild(child);
  }

  public removeSideEffectChild(child: MElement<G>): void {
    this.interactionAnimatedAttributeHelper.removeSideEffectChild(child);
    super.removeSideEffectChild(child);
  }

  public parentTransformed(): void {
    // this.id = this.registeredScene?.updateAnimationArea?.(this.props.animationSrc?.at.);
  }

  public isClickable(): boolean {
    return false;
  }

  public connectedCallback(): void {
    super.connectedCallback();

    if (!this.getScene().hasGraphicsAdapter() || this.animationAreaGraphics) {
      return;
    }
    const graphicsAdapter = this.getScene().getGraphicsAdapter();

    this.animationAreaGraphics = graphicsAdapter
      .getGraphicsAdapterFactory()
      .MMLAnimationAreaGraphicsInterface(this);

    for (const name of AnimationArea.observedAttributes) {
      const value = this.getAttribute(name);
      console.log("Attribute on connect:", name, value);
      if (value !== null) {
        this.attributeChangedCallback(name, null, value);
      }
    }

    this.registerAnimationArea();
  }

  public disconnectedCallback(): void {
    this.unregisterAnimationArea();
    this.interactionAnimatedAttributeHelper.reset();
    super.disconnectedCallback();
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (AnimationArea.attributeHandler.handle(this, name, newValue)) {
      if (this.registeredScene !== null) {
        this.registeredScene.updateAnimationArea?.(this);
      }
    }
  }

  private registerAnimationArea() {
    const scene = this.getScene();
    this.registeredScene = scene;
    scene.addAnimationArea?.(this);
  }

  private unregisterAnimationArea() {
    if (this.registeredScene !== null) {
      this.registeredScene.removeAnimationArea?.(this);
      this.registeredScene = null;
    }
  }
}
