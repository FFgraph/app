import { style } from "@vanilla-extract/css";

export const topDiv = style({ height: "100%", width: "100%" });

export const mainBackground = style({ backgroundColor: "#242424" });

export const controlsButton = style({
    vars: {
        "--xy-controls-button-background-color-default": "#171717",
        "--xy-controls-button-background-color-hover-default": "#303030",
    },
});
