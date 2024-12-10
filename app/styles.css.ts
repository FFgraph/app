import { style } from "@vanilla-extract/css";

export const mainDiv = style({
    height: "100vh",
    width: "100vw",
    background: "#212121",
});

export const errorDiv = style({
    display: "flex",
    flexDirection: "column",
    padding: 16,
});

export const errorsButton = style({
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "#000000",
});
