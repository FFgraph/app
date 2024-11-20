import { style } from "@vanilla-extract/css";

export const topDiv = style({
    display: "flex",
    flexDirection: "column",
    border: "4px solid #DD1100",
    padding: 16,
});

export const errorsButton = style({
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "#000000",
});
