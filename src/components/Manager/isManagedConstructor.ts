type ConstructorLike = {
  prototype?: unknown;
};

type ClassConstructor = abstract new (...args: never[]) => object;

export function isManagedConstructor<TConstructor extends ClassConstructor>(
  candidate: unknown,
  baseConstructor: TConstructor,
): candidate is TConstructor {
  if (typeof candidate !== 'function') {
    return false;
  }

  const constructorWithPrototype = candidate as ConstructorLike;
  const { prototype } = constructorWithPrototype;

  if (!prototype || typeof prototype !== 'object') {
    return false;
  }

  return (
    candidate === (baseConstructor as unknown) ||
    Object.prototype.isPrototypeOf.call(baseConstructor.prototype, prototype)
  );
}
