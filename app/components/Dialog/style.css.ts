import { style } from "@vanilla-extract/css";

export const dialogMainStyle = style({
    padding: 8,
});

export const dialogDiv = style({
    display: "flex",
    flexDirection: "column",
});

export const titleDiv = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
});

export const title = style({ marginLeft: 8 });
export const buttonClass = style({
    width: "fit-content",
    height: "fit-content",
    alignSelf: "center",
    cursor: "pointer",
});
