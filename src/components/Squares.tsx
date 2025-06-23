import React, { useRef, useEffect } from "react";

type CanvasStrokeStyle = string | CanvasGradient | CanvasPattern;

interface GridOffset {
  x: number;
  y: number;
}

interface SquaresProps {
  direction?: "diagonal" | "up" | "right" | "down" | "left";
  speed?: number;
  borderColor?: CanvasStrokeStyle;
  squareSize?: number;
  hoverFillColor?: CanvasStrokeStyle;
}

const Squares: React.FC<SquaresProps> = ({
  direction = "right",
  speed = 1,
  borderColor = "#999",
  squareSize = 40,
  hoverFillColor = "#222",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const numSquaresX = useRef<number>(0);
  const numSquaresY = useRef<number>(0);
  const gridOffset = useRef<GridOffset>({ x: 0, y: 0 });
  const hoveredSquareRef = useRef<GridOffset | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const hexRadius = squareSize / 3;
      const hexHeight = hexRadius * Math.sqrt(3);
      const verticalSpacing = hexHeight * 0.75;
      const horizontalSpacing = hexRadius * 1.5;
      numSquaresX.current = Math.ceil(canvas.width / horizontalSpacing) + 2;
      numSquaresY.current = Math.ceil(canvas.height / verticalSpacing) + 2;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Hexagon dimensions for proper honeycomb pattern
      const hexRadius = squareSize / 3;
      const hexWidth = hexRadius * 2;
      const hexHeight = hexRadius * Math.sqrt(3);
      const verticalSpacing = hexHeight * 0.75;
      const horizontalSpacing = hexWidth * 0.75;

      // Calculate the grid starting point based on current offset
      // This creates an infinite grid by calculating which hexagons should be visible
      // Extended buffer to ensure no gaps at edges
      const startCol = Math.floor((gridOffset.current.x - hexWidth * 2) / horizontalSpacing) - 4;
      const endCol = Math.ceil((gridOffset.current.x + canvas.width + hexWidth * 2) / horizontalSpacing) + 4;
      const startRow = Math.floor((gridOffset.current.y - hexHeight * 2) / verticalSpacing) - 4;
      const endRow = Math.ceil((gridOffset.current.y + canvas.height + hexHeight * 2) / verticalSpacing) + 4;

      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          // Calculate hexagon position in world space
          const rowOffset = (row % 2) * (horizontalSpacing / 2);
          const worldX = col * horizontalSpacing + rowOffset;
          const worldY = row * verticalSpacing;
          
          // Convert to screen space
          const centerX = worldX - gridOffset.current.x;
          const centerY = worldY - gridOffset.current.y;

          // Skip if completely outside visible area (with extended buffer)
          if (centerX < -hexRadius * 2 || centerX > canvas.width + hexRadius * 2 ||
              centerY < -hexRadius * 2 || centerY > canvas.height + hexRadius * 2) {
            continue;
          }

          // Check if this hexagon is hovered
          const isHovered = hoveredSquareRef.current &&
            col === hoveredSquareRef.current.x &&
            row === hoveredSquareRef.current.y;

          // Draw hexagon
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2; // Start from top
            const hexX = centerX + hexRadius * Math.cos(angle);
            const hexY = centerY + hexRadius * Math.sin(angle);
            if (i === 0) {
              ctx.moveTo(hexX, hexY);
            } else {
              ctx.lineTo(hexX, hexY);
            }
          }
          ctx.closePath();
          
          // Fill hexagon if hovered
          if (isHovered) {
            ctx.fillStyle = hoverFillColor;
            ctx.fill();
          }
          
          ctx.stroke();
        }
      }

      // Removed radial gradient overlay to keep background transparent
    };

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1);
      
      switch (direction) {
        case "right":
          gridOffset.current.x -= effectiveSpeed;
          break;
        case "left":
          gridOffset.current.x += effectiveSpeed;
          break;
        case "up":
          gridOffset.current.y += effectiveSpeed;
          break;
        case "down":
          gridOffset.current.y -= effectiveSpeed;
          break;
        case "diagonal":
          gridOffset.current.x -= effectiveSpeed;
          gridOffset.current.y -= effectiveSpeed;
          break;
        default:
          break;
      }

      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Hexagon dimensions for hover detection
      const hexRadius = squareSize / 3;
      const hexWidth = hexRadius * 2;
      const hexHeight = hexRadius * Math.sqrt(3);
      const verticalSpacing = hexHeight * 0.75;
      const horizontalSpacing = hexWidth * 0.75;

      // Convert mouse position to world coordinates
      const worldX = mouseX + gridOffset.current.x;
      const worldY = mouseY + gridOffset.current.y;

      // Find which hexagon the mouse is over
      const row = Math.round(worldY / verticalSpacing);
      const rowOffset = (row % 2) * (horizontalSpacing / 2);
      const col = Math.round((worldX - rowOffset) / horizontalSpacing);

      if (
        !hoveredSquareRef.current ||
        hoveredSquareRef.current.x !== col ||
        hoveredSquareRef.current.y !== row
      ) {
        hoveredSquareRef.current = { x: col, y: row };
      }
    };

    const handleMouseLeave = () => {
      hoveredSquareRef.current = null;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full border-none block m-0 p-0"
      style={{ display: 'block', margin: 0, padding: 0 }}
    ></canvas>
  );
};

export default Squares;
