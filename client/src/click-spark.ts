import React, { useRef, useEffect } from 'react';

interface ClickSparkProps {
  activeOn: string;
}

const ClickSpark: React.FC<ClickSparkProps> = ({ activeOn }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    const animateSpark = () => {
      const sparks = [...(svgRef.current?.children ?? []) as HTMLCollectionOf<SVGLineElement>];
      const size = parseInt(sparks[0]?.getAttribute('y1') || '0', 10);
      const offset = size / 2 + 'px';

      const keyframes = (i: number) => {
        const deg = `calc(${i} * (360deg / ${sparks.length}))`;

        return [
          {
            strokeDashoffset: size * 3,
            transform: `rotate(${deg}) translateY(${offset})`,
          },
          {
            strokeDashoffset: size,
            transform: `rotate(${deg}) translateY(0)`,
          },
        ];
      };

      const options = {
        duration: 660,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
        fill: 'forwards',
      } as KeyframeAnimationOptions;

      sparks.forEach((spark, i) => spark.animate(keyframes(i), options));
    };

    const setSparkPosition = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();

      if (svgRef.current) {
        svgRef.current.style.left = e.clientX - rect.left - (svgRef.current.clientWidth / 2) + 'px';
        svgRef.current.style.top = e.clientY - rect.top - (svgRef.current.clientHeight / 2) + 'px';
      }
    };

    const handleRootClick = (e: MouseEvent) => {
      if (activeOn && !e.target?.matches(activeOn)) return;

      setSparkPosition(e);
      animateSpark();
    };

    root.addEventListener('click', handleRootClick);

    return () => {
      root.removeEventListener('click', handleRootClick);
    };
  }, [activeOn]);

  return (
    <svg ref={svgRef} width="30" height="30" viewBox="0 0 100 100" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1="50" y1="30" x2="50" y2="4" />
      ))}
    </svg>
  );
};

export default ClickSpark;
