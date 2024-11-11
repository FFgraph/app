import { style } from "@vanilla-extract/css";

export const mainDiv = style({
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#171717",
    color: "#ffffff",
});

export const centered = style({
    justifyContent: "center",
    alignItems: "center",
});

export const titleDiv = style({
    display: "flex",
    flexDirection: "row",
    minHeight: 16,
    height: "5vh",
    maxHeight: 32,
    justifyItems: "center",
    alignItems: "center",
});

export const titleItem = style({
    flex: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
});

export const titleItemSelected = style({
    border: "1px solid blue",
});

export const nodeGraph = style({
    flex: 1,
});
