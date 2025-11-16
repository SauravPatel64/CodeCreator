
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Select from 'react-select';
import { BsStars } from 'react-icons/bs';
import { HiOutlineCode } from 'react-icons/hi';
import Editor from '@monaco-editor/react';
import { IoCloseSharp, IoCopy } from 'react-icons/io5';
import { PiExportBold } from 'react-icons/pi';
import { ImNewTab } from 'react-icons/im';
import { FiRefreshCcw } from 'react-icons/fi';
import { GoogleGenAI } from "@google/genai";
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';

const Home = () => {

  const options = [
    { value: "html-css", label: "HTML + CSS" },
    { value: "html-tailwind", label: "HTML + Tailwind CSS" },
    { value: "html-bootstrap", label: "HTML + Bootstrap" },

    // ⭐ requested
    { value: "html-css-js", label: "HTML + CSS + JS" },

    // ⭐ requested
    { value: "html-bootstrap-js", label: "HTML + Bootstrap + JS" },

    // ⭐ requested
    { value: "react-component", label: "React Component" },
  ];

  const [outputScreen, setOutputScreen] = useState(false);
  const [tab, setTab] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [frameWork, setFrameWork] = useState(options[0]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewTabOpen, setIsNewTabOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const ai = new GoogleGenAI({
    apiKey: "AIzaSyBY4xRSraRuUGEzrtjeWtlfYQVQe1L2si8",
  });

  // Extract code from markdown
  function extractCode(response) {
    const match = response.match(/```(?:\w+)?\n?([\s\S]*?)```/);
    return match ? match[1].trim() : response.trim();
  }

  // ⭐ FRAMEWORK-WISE LOGIC
 function getFrameworkRules() {
  switch (frameWork.value) {
    case "html-css":
      return `
Generate a single .html file with:
- Complete HTML boilerplate (<!DOCTYPE html>, <html>, <head>, <body>)
- Internal CSS using <style> tag within <head>
- All CSS must be inside <style>, no external stylesheet
- Create a responsive and modern layout using media queries
- The UI should be visually appealing and work on desktop & mobile
`;

    case "html-tailwind":
      return `
Generate an HTML file with:
- Tailwind CSS included via official CDN in <head>
- Use ONLY Tailwind utility classes for styling (no custom CSS or <style>)
- Design must be fully responsive for all device sizes
- Avoid any external or custom styling
`;

    case "html-bootstrap":
      return `
Generate an HTML file with:
- Bootstrap 5 included via CDN (CSS & JS both) in <head>
- Use ONLY Bootstrap classes for layout and styling; no custom CSS
- Design must be responsive and clean
- No explanations, only raw code
`;

    case "html-css-js":
      return `
Generate a single HTML file with:
- Full HTML boilerplate structure
- Internal CSS within a <style> tag
- Internal JavaScript within a <script> tag
- All code should be self-contained
- UI must be modern, interactive, and responsive for mobile & desktop
`;

    case "html-bootstrap-js":
      return `
Generate an HTML file with:
- Bootstrap 5 included via CDN (CSS & JS)
- JavaScript functionality handled in a <script> tag inside the file
- Use ONLY Bootstrap classes and native JS (no jQuery or external scripts)
- Design should be clean and fully responsive
`;

    case "react-component":
      return `
Generate ONLY a React functional component:
- Use JSX syntax
- Use Tailwind CSS utility classes for styling (no custom CSS)
- Do not include explanations, boilerplate, or external CDN imports
- Export the component as default (e.g., export default function ComponentName)
`;

    default:
      return "";
  }
}


  // GEMINI FIX: Proper response extraction
  async function getResponse() {
    if (!prompt.trim()) return toast.error("Please describe your component first");

    try {
      setLoading(true);

      const rule = getFrameworkRules();

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
Generate code based on the following:

Component Description:
${prompt}

Framework Option:
${frameWork.value}

Rules:
${rule}

IMPORTANT:
- Output ONLY code in a fenced markdown block
- No extra explanation
- No comments unless necessary
        `,
      });

      const aiText =
        response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!aiText) {
        toast.error("Empty response from AI");
        return;
      }

      setCode(extractCode(aiText));
      setOutputScreen(true);

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const copyCode = async () => {
    if (!code.trim()) return toast.error("No code to copy");

    try {
      await navigator.clipboard.writeText(code);
      toast.success("Code Copied!");
    } catch (err) {
      toast.error("Copy failed");
    }
  };

  const downnloadFile = () => {
    if (!code.trim()) return toast.error("No code to download");

    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "GeneratedComponent.html";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-6 lg:px-16">
        {/* LEFT SIDE */}
        <div className="w-full py-6 rounded-xl bg-[#141319] mt-5 p-5">
          <h3 className='text-[25px] font-semibold sp-text'>AI Component Generator</h3>
          <p className='text-gray-400 mt-2 text-[16px]'>Describe your component and let AI generate it.</p>
          <br />
          <p className='text-[15px] font-[1000] mt-4'>Framework</p>
        
          <Select
            className='mt-2'
            options={options}
            value={frameWork}
            onChange={setFrameWork}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: "#111",
                borderColor: "#333",
                color: "#fff",
                boxShadow: "none",
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: "#111",
              }),
              singleValue: (base) => ({ ...base, color: "#fff" }),
            }}
          />
<br />
          <p className='text-[15px]  mt-5'>Describe your component</p>
          <textarea
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
            className='w-full min-h-[200px] rounded-xl bg-[#09090B] mt-3 p-3 text-white outline-none'
            placeholder="Describe your component in detail..."
          ></textarea>

          <div className="flex items-center justify-between mt-3">
            <p className='text-gray-400 text-sm'>Click generate to get AI code</p>

            <button
              onClick={getResponse}
              className="flex items-center p-3 rounded-lg bg-gradient-to-r from-purple-400 to-purple-600 px-5 gap-2 hover:opacity-80 hover:scale-105 transition-all"
            >
              {loading ? <ClipLoader color='white' size={18} /> : <BsStars />}
              Generate
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative mt-2 w-full h-[80vh] bg-[#141319] rounded-xl overflow-hidden">
          {!outputScreen ? (
            <div className="w-full h-full flex items-center flex-col justify-center">
              <div className="p-5 w-[70px] h-[70px] rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center text-[30px]">
                <HiOutlineCode />
              </div>
              <p className='text-[16px] text-gray-400 mt-3'>Your code will appear here</p>
            </div>
          ) : (
            <>
              {/* TABS */}
              <div className="bg-[#17171C] w-full h-[50px] flex items-center gap-3 px-3">
                <button
                  onClick={() => setTab(1)}
                  className={`w-1/2 py-2 rounded-lg ${tab === 1 ? "bg-purple-600 text-white" : "bg-zinc-800 text-gray-300"}`}
                >
                  Code
                </button>
                <button
                  onClick={() => setTab(2)}
                  className={`w-1/2 py-2 rounded-lg ${tab === 2 ? "bg-purple-600 text-white" : "bg-zinc-800 text-gray-300"}`}
                >
                  Preview
                </button>
              </div>

              {/* Toolbar */}
              <div className="bg-[#17171C] w-full h-[50px] flex items-center justify-between px-4">
                <p className='font-bold text-gray-200'>Code Editor</p>

                <div className="flex items-center gap-2">
                  {tab === 1 ? (
                    <>
                      <button onClick={copyCode} className="tool-btn"><IoCopy /></button>
                      <button onClick={downnloadFile} className="tool-btn"><PiExportBold /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setIsNewTabOpen(true)} className="tool-btn"><ImNewTab /></button>
                      <button onClick={() => setRefreshKey(prev => prev + 1)} className="tool-btn"><FiRefreshCcw /></button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="h-full">
                {tab === 1 ? (
                  <Editor value={code} height="100%" theme="vs-dark" language="html" />
                ) : (
                  <iframe key={refreshKey} srcDoc={code} className="w-full h-full bg-white"></iframe>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* FULL SCREEN PREVIEW */}
      {isNewTabOpen && (
        <div className="absolute inset-0 bg-white w-screen h-screen overflow-auto">
          <div className="text-black w-full h-[60px] flex items-center justify-between px-5 bg-gray-100">
            <p className='font-bold'>Preview</p>
            <button onClick={() => setIsNewTabOpen(false)} className="w-10 h-10 rounded-xl border border-zinc-300 flex items-center justify-center hover:bg-gray-200">
              <IoCloseSharp />
            </button>
          </div>
          <iframe srcDoc={code} className="w-full h-[calc(100vh-60px)]"></iframe>
        </div>
      )}
    </>
  );
};

export default Home;

