'use client'
import { useState, useEffect } from "react";

export default function Home() {

  const [inputValue, setInputValue] = useState("");
  const [message, setMessage] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  useEffect(() => {
    fetch(`/api/greeting?name=${inputValue}`).then(res => res.json()).then(data => setMessage(data.message));
  }, [inputValue]);


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">

      <main className="flex flex-col gap-[8px] row-start-2 items-center sm:items-start">
        <h1>Enter your text</h1>
        <input type="text" className="border-2 border-gray-300 rounded-md p-2" value={inputValue} onChange={handleChange} />
        <p>{message || 'Hello Anonymous'}</p>
      </main>
      
    </div>
  );

}
