import 'react'

declare global {
  namespace JSX {
    type Element = React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>>;
    type ElementClass = React.Component<unknown>;
    interface ElementAttributesProperty { 
      props: Record<string, unknown>; 
    }
    interface ElementChildrenAttribute { 
      children: React.ReactNode; 
    }
    interface IntrinsicElements {
      [elemName: string]: Record<string, unknown>;
    }
  }
}