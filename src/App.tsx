import { useState, useEffect, useRef } from "react";
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
  const [codexChild, setCodexChild] = useState<any>(null);
  const [dataDirectory, setDataDirectory] = useState<string>("");
  const [isDirectorySet, setIsDirectorySet] = useState(false);
  const isMountedRef = useRef(true);
  const processCheckIntervalRef = useRef<number | null>(null);

  // Initialize and load saved data directory
  useEffect(() => {
    const savedDir = localStorage.getItem('codexDataDirectory');
    if (savedDir) {
      setDataDirectory(savedDir);
      setIsDirectorySet(true);
    }
  }, []);

  const handleSelectDirectory = async () => {
    try {
      const selected = await open({
        multiple: false,
        directory: true,
        title: 'Select Codex Data Directory'
      });
      
      if (selected && typeof selected === 'string') {
        setDataDirectory(selected);
        setIsDirectorySet(true);
        
        // Save to localStorage
        localStorage.setItem('codexDataDirectory', selected);
        
        setCodexOutput(`Data directory set to: ${selected}`);
      }
    } catch (error) {
      setCodexOutput(`Error selecting directory: ${error}`);
    }
  };

  const handleChangeDirectory = async () => {
    setIsDirectorySet(false);
    setDataDirectory("");
    localStorage.removeItem('codexDataDirectory');
    setCodexOutput("Please select a new data directory.");
  };

  const killExistingCodexProcesses = async () => {
    try {
      setCodexOutput("Killing existing Codex processes...");
      
      // Use Tauri invoke to run system commands
      try {
        await invoke('execute_command', { 
          command: 'pkill', 
          args: ['-f', 'codexdesktop'] 
        });
      } catch (error) {
        // pkill might not be available, try killall
        try {
          await invoke('execute_command', { 
            command: 'killall', 
            args: ['codexdesktop'] 
          });
        } catch (killallError) {
          // Both failed, that's okay
          console.log("No existing Codex processes found or already killed");
        }
      }
      
      setCodexOutput("Existing Codex processes killed successfully.");
      
      // Wait a moment for processes to fully terminate
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      // It's okay if no processes were found to kill
      console.log("No existing Codex processes found or already killed");
    }
  };

  const checkProcessStatus = async () => {
    if (codexChild) {
      try {
        // Try to kill the process with signal 0 (just check if it's alive)
        await codexChild.kill(0);
        // If we get here, process is still running
      } catch (error) {
        // Process is no longer running
        if (isMountedRef.current) {
          setCodexChild(null);
          setCodexOutput("Codex process is no longer running");
        }
      }
    }
  };

  const handleRunCodex = async () => {
    if (!isDirectorySet || !dataDirectory) {
      setCodexOutput("Please select a data directory first.");
      return;
    }

    setIsCodexRunning(true);
    setCodexOutput("Starting Codex...");

    try {
      // First kill any existing processes
      await killExistingCodexProcesses();

      const args = [
        `--data-dir=${dataDirectory}`,
        "--disc-port=8090",
        "--listen-addrs=/ip4/0.0.0.0/tcp/8070",
        "--nat=any",
        "--api-cors-origin=*",
        "--bootstrap-node=spr:CiUIAhIhAiJvIcA_ZwPZ9ugVKDbmqwhJZaig5zKyLiuaicRcCGqLEgIDARo8CicAJQgCEiECIm8hwD9nA9n26BUoNuarCEllqKDnMrIuK5qJxFwIaosQ3d6esAYaCwoJBJ_f8zKRAnU6KkYwRAIgM0MvWNJL296kJ9gWvfatfmVvT-A7O2s8Mxp8l9c8EW0CIC-h-H-jBVSgFjg3Eny2u33qF7BDnWFzo7fGfZ7_qc9P"
      ];

      setCodexOutput(`Starting: codexdesktop ${args.join(' ')}`);

      const command = Command.sidecar('binaries/codexdesktop', args);
      
      // Try to execute first to see if there are any immediate errors
      try {
        const result = await command.execute();
        setCodexOutput(`Codex executed and exited:\nExit code: ${result.code}\nOutput: ${result.stdout}\nError: ${result.stderr}`);
        setIsCodexRunning(false);
        return;
      } catch (executeError) {
        // If execute fails, try spawn instead
        setCodexOutput(`Execute failed, trying spawn: ${executeError}`);
      }
      
      const child = await command.spawn();
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setCodexChild(child);
        setCodexOutput("Codex started successfully and running in background...");
        
        // Start periodic process status check
        processCheckIntervalRef.current = setInterval(checkProcessStatus, 5000); // Check every 5 seconds
      } else {
        // Component was unmounted, kill the process
        await child.kill();
      }
    } catch (error) {
      if (isMountedRef.current) {
        setCodexOutput(`Error starting Codex: ${error}`);
      }
    } finally {
      if (isMountedRef.current) {
        setIsCodexRunning(false);
      }
    }
  };

  const handleKillCodex = async () => {
    try {
      setCodexOutput("Killing Codex process...");
      await killExistingCodexProcesses();
      
      // Also kill the current child process if it exists
      if (codexChild) {
        await codexChild.kill();
        setCodexChild(null);
        
        // Clear the process check interval
        if (processCheckIntervalRef.current) {
          clearInterval(processCheckIntervalRef.current);
          processCheckIntervalRef.current = null;
        }
      }
      
      setCodexOutput("Codex process killed successfully.");
    } catch (error) {
      setCodexOutput(`Error killing Codex process: ${error}`);
    }
  };

  const checkExistingProcesses = async () => {
    try {
      setCodexOutput("Checking for existing Codex processes...");
      
      // Use ps to check for existing codexdesktop processes
      const result = await invoke('execute_command', { 
        command: 'ps', 
        args: ['aux'] 
      }) as string;
      
      if (result.includes('codexdesktop')) {
        setCodexOutput("Found existing Codex processes. Use 'Kill Codex' to stop them.");
      } else {
        setCodexOutput("No existing Codex processes found.");
      }
    } catch (error) {
      setCodexOutput(`Error checking for existing processes: ${error}`);
    }
  };

  // Auto-start codex when app loads
  useEffect(() => {
    checkExistingProcesses();
    // Only auto-start if data directory is already set
    if (isDirectorySet && dataDirectory) {
      handleRunCodex();
    }
  }, [isDirectorySet, dataDirectory]);

  // Cleanup when app is closed
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (codexChild) {
        try {
          await codexChild.kill();
          console.log('Codex process terminated');
        } catch (error) {
          console.error('Error terminating codex process:', error);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      isMountedRef.current = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Clear the process check interval
      if (processCheckIntervalRef.current) {
        clearInterval(processCheckIntervalRef.current);
        processCheckIntervalRef.current = null;
      }
      
      // Also try to kill the process when component unmounts
      if (codexChild) {
        codexChild.kill().catch(console.error);
      }
    };
  }, [codexChild]);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

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
        
        <div className="directory-section">
          <h3>Data Directory</h3>
          {!isDirectorySet ? (
            <div className="directory-setup">
              <p>Please select a directory to store Codex data:</p>
              <button 
                onClick={handleSelectDirectory}
                className="select-dir-button"
              >
                Select Data Directory
              </button>
            </div>
          ) : (
            <div className="directory-info">
              <div className="selected-dir">
                <strong>Current Directory:</strong>
                <p>{dataDirectory}</p>
              </div>
              <button 
                onClick={handleChangeDirectory}
                className="change-dir-button"
              >
                Change Directory
              </button>
            </div>
          )}
        </div>
        
        <div className="status-indicator">
          <span className={`status-dot ${codexChild ? 'running' : 'stopped'}`}></span>
          <span className="status-text">
            {codexChild ? 'Codex is running' : 'Codex is stopped'}
          </span>
        </div>
        
        <div className="row">
          <button 
            onClick={handleRunCodex}
            disabled={isCodexRunning || codexChild !== null || !isDirectorySet}
            className="codex-button"
          >
            {isCodexRunning ? 'Starting Codex...' : 'Start Codex'}
          </button>
          
          <button 
            onClick={handleKillCodex}
            className="codex-button kill"
          >
            Kill Codex
          </button>
        </div>
      </div>

      {codexOutput && (
        <div className="codex-output">
          <h3>Codex Status:</h3>
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
