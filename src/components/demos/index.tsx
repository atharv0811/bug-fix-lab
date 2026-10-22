import type { ComponentType } from "react";
import ResponsiveOverflowDemo from "@/components/bug-cases/responsive-overflow-demo";
import { ApiStatesDemo } from "@/components/demos/api-states-demo";
import { FormValidationDemo } from "@/components/demos/form-validation-demo";
import { RerenderDemo } from "@/components/demos/rerender-demo";
import { RoutingDemo } from "@/components/demos/routing-demo";
import { StateUpdateDemo } from "@/components/demos/state-update-demo";

/** Maps each case slug to its interactive (client) demonstration. */
export const caseDemos: Record<string, ComponentType> = {
  "responsive-layout-overflow": ResponsiveOverflowDemo,
  "react-state-update": StateUpdateDemo,
  "api-loading-and-errors": ApiStatesDemo,
  "form-validation": FormValidationDemo,
  "nextjs-routing-rendering": RoutingDemo,
  "unnecessary-rerenders": RerenderDemo,
};
