import { style } from "@vanilla-extract/css";

export const topDiv = style({ height: "100%", width: "100%" });

export const nonGraphElementParent = style({
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
});
