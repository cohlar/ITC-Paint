// Try to make the hover functionality

"use strict";

const start = function () {
    myCanvas.createHTMLSkeleton();
    myToolkit.createHTMLSkeleton();
    myCanvas.init();
    myToolkit.init();
    addEventListeners();
};

const addEventListeners = function () {
    myCanvas.htmlCanvas.addEventListener("contextmenu", e => e.preventDefault());

    myCanvas.htmlCanvas.addEventListener("mousemove", hoverBrush);
    myCanvas.htmlCanvas.addEventListener("mouseleave", removePriorHoverBrush);

    myCanvas.htmlCanvas.addEventListener("mousedown", startDrawing);
    myCanvas.htmlCanvas.addEventListener("mousedown", draw);
    myCanvas.htmlCanvas.addEventListener("mousemove", draw);
    document.body.addEventListener("mouseup", stopDrawing);

    myCanvas.htmlCanvas.addEventListener("mousedown", startErasing);
    myCanvas.htmlCanvas.addEventListener("mousedown", erase);
    myCanvas.htmlCanvas.addEventListener("mousemove", erase);
    document.body.addEventListener("mouseup", stopErasing);

    myToolkit.colorPalette.htmlColors.forEach(colorElement => colorElement.addEventListener("click", changeColor));

    myToolkit.canvasSize.htmlInputWidth.addEventListener("input", changeCanvasWidth);
    myToolkit.canvasSize.htmlInputHeight.addEventListener("input", changeCanvasHeight);
    myToolkit.canvasSize.maximizeButton.addEventListener("click", maximizeCanvas);
    myToolkit.canvasSize.defaultSizeButton.addEventListener("click", myCanvas.setToDefault.bind(myCanvas));
    myToolkit.canvasSize.defaultSizeButton.addEventListener("click", myCanvas.removeDrawOutsideCanvas.bind(myCanvas));

    myToolkit.brush.htmlSizes.forEach(element => element.addEventListener("click", changeBrushSize));
    myToolkit.brush.htmlShapes.forEach(element => element.addEventListener("click", changeBrushShape));

    myToolkit.moreFunctionality.htmlClearScreenButton.addEventListener("click", clearScreen);
    myToolkit.moreFunctionality.htmlFlipCanvas.addEventListener("click", myToolkit.moreFunctionality.flipCanvas);
};

let myCanvas = {
    htmlCanvas: document.getElementById("canvas"),
    defaultWidth: 500,  // in px
    defaultHeight: 500, // in px
    currentWidth: undefined,
    currentHeight: undefined,
    margin: 10,  // in px

    isDrawing: false,
    isErasing: false,
    rotationAngle: 0,   // in deg

    createHTMLSkeleton: function () {
        this.htmlCanvas = document.createElement("div");
        this.htmlCanvas.id = "canvas";
        document.body.append(this.htmlCanvas);
    },

    setCanvasSize: function () {
        myToolkit.canvasSize.htmlInputWidth.value = this.currentWidth;
        myToolkit.canvasSize.htmlInputHeight.value = this.currentHeight;
        this.htmlCanvas.style.width = this.currentWidth + "px";
        this.htmlCanvas.style.height = this.currentHeight + "px";
    },

    setToDefault: function () {
        this.currentWidth = this.defaultWidth;
        this.currentHeight = this.defaultHeight;
        this.setCanvasSize();
    },

    init: function () {
        this.setToDefault();
        this.htmlCanvas.style.margin = this.margin + "px";
    },

    getMaxCanvas: function () {
        return {
            width: document.body.clientWidth - 2 * this.margin - myToolkit.width,
            height: document.body.clientHeight - 2 * this.margin,
        };
    },

    isInsideCanvas: function (x, y) {
        return (x <= this.currentWidth + this.margin - myToolkit.brush.activeSize * myToolkit.brush.widthHeightRatio / 2
            && y <= this.currentHeight + this.margin - myToolkit.brush.activeSize / 2
            && x >= this.margin + myToolkit.brush.activeSize * myToolkit.brush.widthHeightRatio / 2
            && y >= this.margin + myToolkit.brush.activeSize / 2);
    },

    removeDrawOutsideCanvas: function () {
        let ink = document.querySelectorAll("#canvas > div");
        for (let n = ink.length - 1; n >= 0; n--) {
            if (!this.isInsideCanvas(ink[n].getAttribute("pagex"), ink[n].getAttribute("pagey"))) ink[n].remove();
        }
    },
};

let myToolkit = {
    htmlToolkit: undefined,
    width: 175, // in px

    colorPalette: {
        htmlSection: undefined,
        htmlBox: undefined,
        htmlColors: undefined,
        colors: [],
        defaultColorIndex: 0,
        activeColor: undefined,

        createHTMLSkeleton: function () {
            this.htmlSection = document.createElement("div");
            this.htmlSection.id = "color-palette-section";
            this.htmlSection.className = "toolkit-section";
            myToolkit.htmlToolkit.append(this.htmlSection);
            const colorPaletteHeading = document.createElement("div");
            colorPaletteHeading.className = "toolkit-section-heading";
            colorPaletteHeading.innerHTML = "Color Palette";
            this.htmlSection.append(colorPaletteHeading);
            this.htmlBox = document.createElement("div");
            this.htmlBox.id = "color-palette";
            this.htmlSection.append(this.htmlBox);
        },

        createColors: function () {
            // Uncomment the three lines below if you'd like to add black, gray and white colors:
            // for (let n=0 ; n<=100 ; n++) {   
            //     this.colors.push("hsl(0, 0%," + n + "%)");
            // }
            for (let n = 0; n <= 360; n++) {
                this.colors.push("hsl(" + n + ", 90%, 50%)");
            }
        },

        init: function () {
            this.createColors();
            this.activeColor = this.colors[this.defaultColorIndex];
            this.colors.forEach(function (color) {
                let colorElement = document.createElement("div");
                colorElement.id = color;
                colorElement.className = "color func";
                colorElement.style.backgroundColor = color;
                myToolkit.colorPalette.htmlBox.append(colorElement);
            });
            let eraseInstructions = document.createElement("p");
            eraseInstructions.innerHTML = "Erase by clicking right";
            myToolkit.colorPalette.htmlSection.append(eraseInstructions);
        },
    },

    canvasSize: {
        htmlSection: undefined,
        htmlInputWidthSection: undefined,
        htmlInputHeightSection: undefined,
        htmlInputWidth: undefined,
        htmlInputHeight: undefined,
        maximizeButton: undefined,
        defaultSizeButton: undefined,

        createHTMLSkeleton: function () {
            this.htmlSection = document.createElement("div");
            this.htmlSection.id = "canvas-size";
            this.htmlSection.className = "toolkit-section";
            myToolkit.htmlToolkit.append(this.htmlSection);
            const canvasSizeHeading = document.createElement("div");
            canvasSizeHeading.className = "toolkit-section-heading";
            canvasSizeHeading.innerHTML = "Canvas Size (in px)";
            this.htmlSection.append(canvasSizeHeading);
            this.htmlInputWidthSection = document.createElement("div");
            this.htmlInputWidthSection.className = "canvas-input-section";
            this.htmlSection.append(this.htmlInputWidthSection);
            this.htmlInputWidth = document.createElement("input");
            this.htmlInputWidth.id = "canvas-width";
            this.htmlInputWidth.name = "canvas-width";
            this.htmlInputWidth.type = "number";
            this.htmlInputWidth.className = "size-input func";
            const canvasWidthLabel = document.createElement("label");
            canvasWidthLabel.htmlFor = "canvas-width";
            canvasWidthLabel.innerHTML = "Width:";
            this.htmlInputWidthSection.append(canvasWidthLabel);
            this.htmlInputWidthSection.append(this.htmlInputWidth);
            this.htmlInputHeightSection = document.createElement("div");
            this.htmlInputHeightSection.className = "canvas-input-section";
            this.htmlSection.append(this.htmlInputHeightSection);
            this.htmlInputHeight = document.createElement("input");
            this.htmlInputHeight.id = "canvas-height";
            this.htmlInputHeight.name = "canvas-height";
            this.htmlInputHeight.type = "number";
            this.htmlInputHeight.className = "size-input func";
            const canvasHeightLabel = document.createElement("label");
            canvasHeightLabel.htmlFor = "canvas-height";
            canvasHeightLabel.innerHTML = "Height:";
            this.htmlInputHeightSection.append(canvasHeightLabel);
            this.htmlInputHeightSection.append(this.htmlInputHeight);
            this.maximizeButton = document.createElement("button");
            this.maximizeButton.id = "maximize";
            this.maximizeButton.className = "button func";
            this.maximizeButton.innerHTML = "Maximize";
            this.htmlSection.append(this.maximizeButton);
            this.defaultSizeButton = document.createElement("button");
            this.defaultSizeButton.id = "default-size";
            this.defaultSizeButton.className = "button func";
            this.defaultSizeButton.innerHTML = "Reset to Default Size";
            this.htmlSection.append(this.defaultSizeButton);
        },
    },

    brush: {
        htmlSection: undefined,
        htmlSizes: undefined,
        htmlShapes: undefined,
        sizeList: [5, 10, 15, 20],  // in px
        defaultSizeIndex: 1,
        activeSize: undefined,
        shapeList: ["square", "circle", "ellipse"],
        defaultShapeIndex: 0,
        activeShape: undefined,
        widthHeightRatio: undefined,

        createHTMLSkeleton: function () {
            this.htmlSection = document.createElement("div");
            this.htmlSection.id = "brush";
            this.htmlSection.className = "toolkit-section";
            myToolkit.htmlToolkit.append(this.htmlSection);
            const brushHeading = document.createElement("div");
            brushHeading.className = "toolkit-section-heading";
            brushHeading.innerHTML = "Brush properties";
            this.htmlSection.append(brushHeading);
        },

        createHTMLDrawElement: function () {
            let element = document.createElement("div");
            element.style.width = this.activeSize * this.widthHeightRatio + "px";
            element.style.height = this.activeSize + "px";
            if (this.activeShape === "circle") element.style.borderRadius = "50%";
            if (this.activeShape === "ellipse") element.style.borderRadius = "100%";
            return element;
        },

        drawHTMLElement: function () {
            let drawElement = this.createHTMLDrawElement();
            drawElement.style.display = "inline-block";
            drawElement.style.position = "absolute";
            drawElement.style.backgroundColor = myToolkit.colorPalette.activeColor;
            drawElement.style.left = (event.pageX - myToolkit.brush.activeSize * myToolkit.brush.widthHeightRatio / 2) + "px";
            drawElement.style.top = (event.pageY - myToolkit.brush.activeSize / 2) + "px";
            drawElement.setAttribute("pagex", event.pageX);  // Useful for erasing
            drawElement.setAttribute("pagey", event.pageY);
            return drawElement;
        },

        initHTMLBrushSizes: function () {
            let dummyBrush = {
                sizeList: this.sizeList,
                activeSize: undefined,
                activeShape: "circle",
                widthHeightRatio: 1,
            };
            let sizeSubtitle = document.createElement("p");
            sizeSubtitle.innerHTML = "Size:";
            myToolkit.brush.htmlSection.append(sizeSubtitle);
            let createHTMLBrushElement = this.createHTMLDrawElement.bind(dummyBrush);
            dummyBrush.sizeList.forEach(function (size) {
                dummyBrush.activeSize = size;
                let circle = createHTMLBrushElement();
                circle.id = size;
                circle.className = "brush-property size circle";
                myToolkit.brush.htmlSection.append(circle);
            });
        },

        initHTMLBrushShapes: function () {
            let dummyShape = {
                shapeList: this.shapeList,
                activeSize: "15",
                activeShape: undefined,
                widthHeightRatio: undefined,
                brush: { activeShape: undefined, },
            };
            let shapeSubtitle = document.createElement("p");
            shapeSubtitle.innerHTML = "Shape:";
            myToolkit.brush.htmlSection.append(shapeSubtitle);
            let createHTMLShapeElement = this.createHTMLDrawElement.bind(dummyShape);
            let dummyWidthHeightRatio = myToolkit.brush.setWidthHeightRatio.bind(dummyShape);
            dummyShape.shapeList.forEach(function (shape) {
                dummyShape.activeShape = shape;
                dummyShape.brush.activeShape = shape;
                dummyShape.widthHeightRatio = dummyWidthHeightRatio();
                let shapeElement = createHTMLShapeElement();
                shapeElement.id = shape;
                shapeElement.className = "brush-property shape";
                myToolkit.brush.htmlSection.append(shapeElement);
            });
        },

        setWidthHeightRatio: function () {
            (this.activeShape === "ellipse") ? this.widthHeightRatio = 1.5 : this.widthHeightRatio = 1;
        },
    },

    moreFunctionality: {
        htmlSection: undefined,
        htmlClearScreenButton: undefined,
        htmlFlipCanvas: undefined,

        createHTMLSkeleton: function () {
            this.htmlSection = document.createElement("div");
            this.htmlSection.id = "more-functionality";
            this.htmlSection.className = "toolkit-section";
            myToolkit.htmlToolkit.append(this.htmlSection);
            const moreFunctionalityHeading = document.createElement("div");
            moreFunctionalityHeading.className = "toolkit-section-heading";
            moreFunctionalityHeading.innerHTML = "More functionality";
            this.htmlSection.append(moreFunctionalityHeading);
            this.htmlClearScreenButton = document.createElement("button");
            this.htmlClearScreenButton.id = "clear-screen";
            this.htmlClearScreenButton.className = "button func";
            this.htmlClearScreenButton.innerHTML = "Clear Screen";
            this.htmlSection.append(this.htmlClearScreenButton);
            this.htmlFlipCanvas = document.createElement("button");
            this.htmlFlipCanvas.id = "flip-canvas";
            this.htmlFlipCanvas.className = "button func";
            this.htmlFlipCanvas.innerHTML = "Flip Canvas 90° (Beta)";
            this.htmlSection.append(this.htmlFlipCanvas);
        },

        flipCanvas: function () {   // Beta - currently unable to draw once flipped, and flip of unsquare rectangle is misplaced
            myCanvas.rotationAngle += 90;
            myCanvas.htmlCanvas.style.transform = "rotate(" + myCanvas.rotationAngle + "deg)";
            // Replac code above with commented code below if you want a very special transformation effect instead of a 90deg flip
            // let ink = document.querySelectorAll("#canvas > div");
            // for (let n=0 ; n<ink.length ; n++) {
            //     let newLeft = ink[n].style.top;
            //     ink[n].style.top = ink[n].style.left;
            //     ink[n].style.left = newLeft;
            //     let newPageX = ink[n].getAttribute("pagey");
            //     ink[n].setAttribute("pagey", ink[n].getAttribute("pagex"));
            //     ink[n].getAttribute("pagex", newPageX);
            // }
        },
    },

    setActive: function (nodeList, activeId) {
        for (let n = 0; n < nodeList.length; n++) {
            (nodeList[n].id == activeId) ? nodeList[n].classList.add("active") : nodeList[n].classList.remove("active");    // loose inequality to cover 10 == "10" situations
        }
    },

    createHTMLSkeleton: function () {
        this.htmlToolkit = document.createElement("div");
        this.htmlToolkit.id = "toolkit";
        document.body.append(this.htmlToolkit);

        this.colorPalette.createHTMLSkeleton();
        this.canvasSize.createHTMLSkeleton();
        this.brush.createHTMLSkeleton();
        this.moreFunctionality.createHTMLSkeleton();
    },

    init: function () {
        this.colorPalette.init();
        this.brush.activeSize = this.brush.sizeList[this.brush.defaultSizeIndex];
        this.brush.activeShape = this.brush.shapeList[this.brush.defaultShapeIndex];
        this.brush.setWidthHeightRatio();
        this.htmlToolkit.style.width = this.width + "px";
        this.htmlToolkit.style.minWidth = this.width + "px"; // so it does never shrink
        this.colorPalette.htmlColors = document.querySelectorAll(".color");
        this.setActive(this.colorPalette.htmlColors, this.colorPalette.activeColor);
        this.canvasSize.htmlInputWidth.value = myCanvas.currentWidth;
        this.canvasSize.htmlInputHeight.value = myCanvas.currentHeight;
        this.brush.initHTMLBrushSizes();
        this.brush.htmlSizes = document.querySelectorAll(".brush-property.size");
        this.setActive(this.brush.htmlSizes, this.brush.activeSize);
        this.brush.initHTMLBrushShapes();
        this.brush.htmlShapes = document.querySelectorAll(".brush-property.shape");
        this.setActive(this.brush.htmlShapes, this.brush.activeShape);
    },
};

// Functions defined for events
const startDrawing = (e) => { if (e.button === 0) myCanvas.isDrawing = true };
const stopDrawing = (e) => { if (e.button === 0) myCanvas.isDrawing = false };
const startErasing = (e) => { if (e.button === 2) myCanvas.isErasing = true };
const stopErasing = (e) => { if (e.button === 2) myCanvas.isErasing = false };

const draw = function (event) {
    if (myCanvas.isDrawing && myCanvas.isInsideCanvas(event.pageX, event.pageY)) {
        let drawElement = myToolkit.brush.drawHTMLElement();
        myCanvas.htmlCanvas.append(drawElement);
    }
}

const changeColor = function (event) {
    myToolkit.colorPalette.activeColor = this.id;
    myToolkit.setActive(myToolkit.colorPalette.htmlColors, myToolkit.colorPalette.activeColor);
};

const changeCanvasWidth = function () {
    let inputWidth = parseInt(myToolkit.canvasSize.htmlInputWidth.value);
    if (isNaN(inputWidth)) {
        alert("Please enter a valid width pixel number");
    } else if (inputWidth < 1) {
        myCanvas.currentWidth = 1;
        alert("Width cannot be below 1px.");
    } else if (inputWidth > myCanvas.getMaxCanvas().width) {
        myCanvas.currentWidth = myCanvas.getMaxCanvas().width;
        alert("The width you have entered is too large. We have set the width to " + myCanvas.currentWidth + "px, which is the maximum adapted to your current window width.");
    }
    else myCanvas.currentWidth = inputWidth;
    myCanvas.setCanvasSize();
    myCanvas.removeDrawOutsideCanvas();
};

const changeCanvasHeight = function () {
    let inputHeight = parseInt(myToolkit.canvasSize.htmlInputHeight.value);
    if (isNaN(inputHeight)) {
        alert("Please enter a valid height pixel number");
    } else if (inputHeight < 1) {
        myCanvas.currentHeight = 1;
        alert("Height cannot be below 1px.");
    } else if (inputHeight > myCanvas.getMaxCanvas().height) {
        myCanvas.currentHeight = myCanvas.getMaxCanvas().height;
        alert("The width you have entered is too large. We have set the height to " + myCanvas.currentHeight + "px, which is the maximum adapted to your current window height.");
    }
    else myCanvas.currentHeight = inputHeight;
    myCanvas.setCanvasSize();
    myCanvas.removeDrawOutsideCanvas();
};

const maximizeCanvas = function () {
    myCanvas.currentWidth = myCanvas.getMaxCanvas().width;
    myCanvas.currentHeight = myCanvas.getMaxCanvas().height;
    myCanvas.setCanvasSize();
}

const changeBrushSize = function () {
    let newSize = this.id;
    myToolkit.brush.activeSize = newSize;
    myToolkit.setActive(myToolkit.brush.htmlSizes, myToolkit.brush.activeSize);
};

const changeBrushShape = function () {
    let newShape = this.id;
    myToolkit.brush.activeShape = newShape;
    myToolkit.brush.setWidthHeightRatio();
    myToolkit.setActive(myToolkit.brush.htmlShapes, myToolkit.brush.activeShape);
};

const erase = function (event) {
    if (myCanvas.isErasing === true) {
        let eraserX = event.pageX;
        let eraserY = event.pageY;
        for (let x = eraserX - 10; x <= eraserX + 10; x++) {
            for (let y = eraserY - 10; y <= eraserY + 10; y++) {
                document.querySelectorAll("[pagex = '" + x + "'][pagey = '" + y + "']").forEach(e => e.remove());
            }
        }
    }
};

const clearScreen = function () {
    let ink = document.querySelectorAll("#canvas > div");
    ink.forEach(element => element.remove());
};

const removePriorHoverBrush = function () {
    let priorHoverElement = document.querySelector("[temp = 'true']");
    if (priorHoverElement !== null) priorHoverElement.remove();
};

const hoverBrush = function () {
    removePriorHoverBrush();
    if (myCanvas.isInsideCanvas(event.pageX, event.pageY)) {
        let drawElement = myToolkit.brush.drawHTMLElement();
        drawElement.setAttribute("temp", "true");
        myCanvas.htmlCanvas.append(drawElement);
        return drawElement;
    }
};

// Here's is where all the magic happens :)
start();