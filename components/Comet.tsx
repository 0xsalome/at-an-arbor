import React from 'react';

const Comet: React.FC = () => {
  const morseCode = "- .... . / .-- .- -.-- / .. ... / .. -. / . -- .--. - .. -. . ... ..."; // "The way is in emptiness"

  return (
    <div 
      id="comet-layer" 
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      <div className="comet-container absolute w-full h-full">
        <div className="comet-content text-xs text-text-main/40 font-mono tracking-widest whitespace-nowrap">
          <span className="text-lg mr-2">☄︎</span>
          <span>{morseCode}</span>
        </div>
      </div>
      <style>{`
        .comet-container {
          /* Start off-screen top-left */
          top: 10%;
          left: -20%;
          width: 150vw; /* Wide enough to arc across */
          animation: flyAcross 20s linear infinite;
          opacity: 0;
        }

        .comet-content {
           /* Rotate slightly to follow the arc tangent broadly */
           transform: rotate(15deg);
        }

        @keyframes flyAcross {
          0% {
            transform: translate(0, 0) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          20% {
             /* Visible arc start */
          }
          80% {
             /* Visible arc end */
          }
          90% {
            opacity: 0;
          }
          100% {
            /* End off-screen top-right/middle-right */
            transform: translate(80vw, 30vh) scale(1.1);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .comet-container {
            animation: none;
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Comet;