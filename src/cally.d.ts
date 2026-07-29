import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "calendar-date": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      "calendar-month": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}