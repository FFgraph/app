import { style } from "@vanilla-extract/css";

export const dialogDiv = style({
    display: "flex",
    flexDirection: "column",
});

export const dialogMainStyle = style({
    padding: 0,
    flex: 1,
});

export const buttonClass = style({
    alignSelf: "flex-end",
    cursor: "pointer",
});
