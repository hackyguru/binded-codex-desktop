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
  const [selectedDataDir, setSelectedDataDir] = useState<string | null>(null);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  const handleSelectDataDir = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Codex Data Directory'
      });
      
      if (selected) {
        setSelectedDataDir(selected as string);
        setCodexOutput(`Selected data directory: ${selected}`);
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
      setCodexOutput(`Error selecting directory: ${error}`);
    }
  };

  const handleRunCodex = async () => {
    if (!selectedDataDir) {
      setCodexOutput("Please select a data directory first!");
      return;
    }

    setIsCodexRunning(true);
    setCodexOutput("Starting Codex...");
    
    try {
      // Configuration object for Codex
      const config = {
        dataDir: selectedDataDir, // Use the user-selected directory
        storageQuota: "11811160064",
        ports: {
          discPort: 8090, // Changed to match your specification
          listenPort: 8070, // Changed to match your specification
          apiPort: 9002
        }
      };
      
      const logFilePath = "/tmp/codex.log";
      const nat = "any"; // Changed from "auto" to "any" as per the example
      
      const args = [
        `--data-dir=${config.dataDir}`,
        `--disc-port=${config.ports.discPort}`,
        `--listen-addrs=/ip4/0.0.0.0/tcp/${config.ports.listenPort}`,
        `--nat=${nat}`,
        `--api-cors-origin="*"`,
        `--data-dir=${config.dataDir}`,
        `--bootstrap-node=spr:CiUIAhIhAiJvIcA_ZwPZ9ugVKDbmqwhJZaig5zKyLiuaicRcCGqLEgIDARo8CicAJQgCEiECIm8hwD9nA9n26BUoNuarCEllqKDnMrIuK5qJxFwIaosQ3d6esAYaCwoJBJ_f8zKRAnU6KkYwRAIgM0MvWNJL296kJ9gWvfatfmVvT-A7O2s8Mxp8l9c8EW0CIC-h-H-jBVSgFjg3Eny2u33qF7BDnWFzo7fGfZ7_qc9P`,
        `--bootstrap-node=spr:CiUIAhIhAyUvcPkKoGE7-gh84RmKIPHJPdsX5Ugm_IHVJgF-Mmu_EgIDARo8CicAJQgCEiEDJS9w-QqgYTv6CHzhGYog8ck92xflSCb8gdUmAX4ya78QoemesAYaCwoJBES39Q2RAnVOKkYwRAIgLi3rouyaZFS_Uilx8k99ySdQCP1tsmLR21tDb9p8LcgCIG30o5YnEooQ1n6tgm9fCT7s53k6XlxyeSkD_uIO9mb3`,
        `--bootstrap-node=spr:CiUIAhIhA7E4DEMer8nUOIUSaNPA4z6x0n9Xaknd28Cfw9S2-cCeEgIDARo8CicAJQgCEiEDsTgMQx6vydQ4hRJo08DjPrHSf1dqSd3bwJ_D1Lb5wJ4Qt_CesAYaCwoJBEDhWZORAnVYKkYwRAIgFNzhnftocLlVHJl1onuhbSUM7MysXPV6dawHAA0DZNsCIDRVu9gnPTH5UkcRXLtt7MLHCo4-DL-RCMyTcMxYBXL0`,
        `--bootstrap-node=spr:CiUIAhIhAzZn3JmJab46BNjadVnLNQKbhnN3eYxwqpteKYY32SbOEgIDARo8CicAJQgCEiEDNmfcmYlpvjoE2Np1Wcs1ApuGc3d5jHCqm14phjfZJs4QrvWesAYaCwoJBKpA-TaRAnViKkcwRQIhANuMmZDD2c25xzTbKSirEpkZYoxbq-FU_lpI0K0e4mIVAiBfQX4yR47h1LCnHznXgDs6xx5DLO5q3lUcicqUeaqGeg`,
        `--bootstrap-node=spr:CiUIAhIhAgybmRwboqDdUJjeZrzh43sn5mp8jt6ENIb08tLn4x01EgIDARo8CicAJQgCEiECDJuZHBuioN1QmN5mvOHjeyfmanyO3oQ0hvTy0ufjHTUQh4ifsAYaCwoJBI_0zSiRAnVsKkcwRQIhAJCb_z0E3RsnQrEePdJzMSQrmn_ooHv6mbw1DOh5IbVNAiBbBJrWR8eBV6ftzMd6ofa5khNA2h88OBhMqHCIzSjCeA`,
        `--bootstrap-node=spr:CiUIAhIhAntGLadpfuBCD9XXfiN_43-V3L5VWgFCXxg4a8uhDdnYEgIDARo8CicAJQgCEiECe0Ytp2l-4EIP1dd-I3_jf5XcvlVaAUJfGDhry6EN2dgQsIufsAYaCwoJBNEmoCiRAnV2KkYwRAIgXO3bzd5VF8jLZG8r7dcLJ_FnQBYp1BcxrOvovEa40acCIDhQ14eJRoPwJ6GKgqOkXdaFAsoszl-HIRzYcXKeb7D9`,
        `--storage-quota=${config.storageQuota}`,
        `--log-level=DEBUG`,
        `--log-file=${logFilePath}`,
        `--api-port=${config.ports.apiPort}`,
        `--bootstrap-node=spr:CiUIAhIhAiJvIcA_ZwPZ9ugVKDbmqwhJZaig5zKyLiuaicRcCGqLEgIDARo8CicAJQgCEiECIm8hwD9nA9n26BUoNuarCEllqKDnMrIuK5qJxFwIaosQ3d6esAYaCwoJBJ_f8zKRAnU6KkYwRAIgM0MvWNJL296kJ9gWvfatfmVvT-A7O2s8Mxp8l9c8EW0CIC-h-H-jBVSgFjg3Eny2u33qF7BDnWFzo7fGfZ7_qc9P`
      ];

      console.log('Selected data directory:', selectedDataDir);
      console.log('Arguments being passed to Codex:', args);
      console.log('Full command would be:', `codexdesktop ${args.join(' ')}`);
      
      setCodexOutput(`Selected data directory: ${selectedDataDir}\n\nArguments being passed to Codex:\n${args.join('\n')}\n\nFull command: codexdesktop ${args.join(' ')}\n\nExecuting...`);

      // First, let's test if the binary exists and is executable
      const testCommand = Command.sidecar('binaries/codexdesktop', ['--help']);
      const testOutput = await testCommand.execute();
      
      console.log('Binary test output:', testOutput);
      setCodexOutput(`Binary test:\nExit code: ${testOutput.code}\nOutput: ${testOutput.stdout}\nError: ${testOutput.stderr}\n\nNow running with data directory...`);

      const command = Command.sidecar('binaries/codexdesktop', args, {
        cwd: '/tmp',
        env: {
          PATH: '/usr/bin:/bin:/usr/sbin:/sbin', // Minimal PATH
          HOME: '/tmp', // Force HOME to /tmp to avoid user directory issues
          USER: 'root' // Run as root to avoid permission issues
        }
      });
      
      const output = await command.execute();
      
      console.log('Codex output:', output);
      setCodexOutput(`Codex executed successfully!\nExit code: ${output.code}\nOutput: ${output.stdout}\nError: ${output.stderr}\n\nIf there are permission errors, the binary might still be trying to use the default data directory.`);
    } catch (error) {
      console.error('Error running Codex:', error);
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
            onClick={handleSelectDataDir}
            className="select-dir-button"
          >
            Select Data Directory
          </button>
        </div>

        {selectedDataDir && (
          <div className="selected-dir">
            <p><strong>Selected Directory:</strong> {selectedDataDir}</p>
          </div>
        )}

        <div className="row">
          <button 
            onClick={handleRunCodex}
            disabled={isCodexRunning || !selectedDataDir}
            className="codex-button"
          >
            {isCodexRunning ? 'Running Codex...' : 'Run Codex'}
          </button>
        </div>

        {!selectedDataDir && (
          <p className="warning">Please select a data directory before running Codex.</p>
        )}
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
