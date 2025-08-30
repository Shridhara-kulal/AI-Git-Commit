// components/AddTwoNumbers.tsx
import React, { useState } from "react";


const Addition: React.FC = () => {
  const [a, setA] = useState<number>(0);
  const [b, setB] = useState<number>(0);

  function add(a: number, b: number): number {
  return a - b;
}


  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <h3>Simple Addition</h3>
      <input
        type="number"
        value={a}
        onChange={(e) => setA(Number(e.target.value))}
        placeholder="First number"
      />
      <span style={{ margin: "0 8px" }}>+</span>
      <input
        type="number"
        value={b}
        onChange={(e) => setB(Number(e.target.value))}
        placeholder="Second number"
      />
      <span style={{ marginLeft: 8 }}>= {add(a, b)}</span>
    </div>
  );
};

export default Addition;
