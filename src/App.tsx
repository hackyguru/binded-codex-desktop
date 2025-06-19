import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { open } from '@tauri-apps/plugin-dialog';
import "./App.css";
import { Command } from '@tauri-apps/plugin-shell';

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [codexOutput, setCodexOutput] = useState("");
  const [isCodexRunning, setIsCodexRunning] = useState(false);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  const handleRunCodex = async () => {
    setIsCodexRunning(true);
    setCodexOutput("Starting Codex...");

    try {
      const args = [
        "--data-dir=/Users/guru/Desktop/datadirectory",
        "--disc-port=8090",
        "--listen-addrs=/ip4/0.0.0.0/tcp/8070",
        "--nat=any",
        "--api-cors-origin=*",
        "--bootstrap-node=spr:CiUIAhIhAiJvIcA_ZwPZ9ugVKDbmqwhJZaig5zKyLiuaicRcCGqLEgIDARo8CicAJQgCEiECIm8hwD9nA9n26BUoNuarCEllqKDnMrIuK5qJxFwIaosQ3d6esAYaCwoJBJ_f8zKRAnU6KkYwRAIgM0MvWNJL296kJ9gWvfatfmVvT-A7O2s8Mxp8l9c8EW0CIC-h-H-jBVSgFjg3Eny2u33qF7BDnWFzo7fGfZ7_qc9P"
      ];

      setCodexOutput(`Running: codexdesktop ${args.join(' ')}`);

      const command = Command.sidecar('binaries/codexdesktop', args);
      const output = await command.execute();

      setCodexOutput(
        `Codex executed!\nExit code: ${output.code}\nOutput: ${output.stdout}\nError: ${output.stderr}`
      );
    } catch (error) {
      setCodexOutput(`Error running Codex: ${error}`);
    } finally {
      setIsCodexRunning(false);
    }
  };

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <div className="codex-section">
        <h2>Codex Configuration</h2>
        
        <div className="row">
          <button 
            onClick={handleRunCodex}
            disabled={isCodexRunning}
            className="codex-button"
          >
            {isCodexRunning ? 'Running Codex...' : 'Run Codex'}
          </button>
        </div>
      </div>

      {codexOutput && (
        <div className="codex-output">
          <h3>Codex Output:</h3>
          <pre>{codexOutput}</pre>
        </div>
      )}

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
