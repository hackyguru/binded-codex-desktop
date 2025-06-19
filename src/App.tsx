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
  const [discoveryPort, setDiscoveryPort] = useState<string>("8090");
  const [listeningPort, setListeningPort] = useState<string>("8070");
  const [apiPort, setApiPort] = useState<string>("8080");
  const isMountedRef = useRef(true);
  const processCheckIntervalRef = useRef<number | null>(null);

  // Initialize and load saved data directory and ports
  useEffect(() => {
    const savedDir = localStorage.getItem('codexDataDirectory');
    const savedDiscoveryPort = localStorage.getItem('codexDiscoveryPort');
    const savedListeningPort = localStorage.getItem('codexListeningPort');
    const savedApiPort = localStorage.getItem('codexApiPort');
    
    if (savedDir) {
      setDataDirectory(savedDir);
      setIsDirectorySet(true);
    }
    
    if (savedDiscoveryPort) {
      setDiscoveryPort(savedDiscoveryPort);
    }
    
    if (savedListeningPort) {
      setListeningPort(savedListeningPort);
    }
    
    if (savedApiPort) {
      setApiPort(savedApiPort);
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

  const handleDiscoveryPortChange = (value: string) => {
    const port = value.trim();
    if (port && !isNaN(Number(port)) && Number(port) > 0 && Number(port) <= 65535) {
      setDiscoveryPort(port);
      localStorage.setItem('codexDiscoveryPort', port);
      setCodexOutput(`Discovery port updated to: ${port}`);
    }
  };

  const handleListeningPortChange = (value: string) => {
    const port = value.trim();
    if (port && !isNaN(Number(port)) && Number(port) > 0 && Number(port) <= 65535) {
      setListeningPort(port);
      localStorage.setItem('codexListeningPort', port);
      setCodexOutput(`Listening port updated to: ${port}`);
    }
  };

  const handleApiPortChange = (value: string) => {
    const port = value.trim();
    if (port && !isNaN(Number(port)) && Number(port) > 0 && Number(port) <= 65535) {
      setApiPort(port);
      localStorage.setItem('codexApiPort', port);
      setCodexOutput(`API port updated to: ${port}`);
    }
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
        `--disc-port=${discoveryPort}`,
        `--listen-addrs=/ip4/0.0.0.0/tcp/${listeningPort}`,
        "--nat=any",
        "--api-cors-origin=*",
        `--api-port=${apiPort}`,
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            Codex Desktop
          </h1>
          <p className="text-gray-400 text-lg">
            Decentralized storage network client
          </p>
        </div>

        {/* Main Configuration Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
            Configuration
          </h2>

          <div className="codex-section">
            <h2>Codex Configuration</h2>
            
            {/* Data Directory Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                </svg>
                Data Directory
              </h3>
              
              {!isDirectorySet ? (
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-6">
                  <p className="text-gray-300 mb-4">Please select a directory to store Codex data:</p>
                  <button 
                    onClick={handleSelectDirectory}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Select Data Directory
                  </button>
                </div>
              ) : (
                <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6">
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <strong className="text-green-400">Current Directory:</strong>
                    </div>
                    <p className="text-gray-200 font-mono text-sm bg-gray-800/50 p-3 rounded-lg break-all">{dataDirectory}</p>
                  </div>
                  <button 
                    onClick={handleChangeDirectory}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                  >
                    Change Directory
                  </button>
                </div>
              )}
            </div>
            
            {/* Port Configuration Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
                Port Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="discovery-port" className="block text-sm font-medium text-gray-300">
                    Discovery Port
                  </label>
                  <input
                    id="discovery-port"
                    type="number"
                    min="1"
                    max="65535"
                    value={discoveryPort}
                    onChange={(e) => handleDiscoveryPortChange(e.target.value)}
                    placeholder="8090"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="listening-port" className="block text-sm font-medium text-gray-300">
                    Listening Port
                  </label>
                  <input
                    id="listening-port"
                    type="number"
                    min="1"
                    max="65535"
                    value={listeningPort}
                    onChange={(e) => handleListeningPortChange(e.target.value)}
                    placeholder="8070"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="api-port" className="block text-sm font-medium text-gray-300">
                    API Port
                  </label>
                  <input
                    id="api-port"
                    type="number"
                    min="1"
                    max="65535"
                    value={apiPort}
                    onChange={(e) => handleApiPortChange(e.target.value)}
                    placeholder="8080"
                    className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>
            
            {/* Status Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center bg-gray-700/30 border border-gray-600 rounded-xl p-4">
                <div className={`w-4 h-4 rounded-full mr-3 ${codexChild ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-lg font-medium text-white">
                  {codexChild ? 'Codex is running' : 'Codex is stopped'}
                </span>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleRunCodex}
                disabled={isCodexRunning || codexChild !== null || !isDirectorySet}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:transform-none disabled:shadow-none"
              >
                {isCodexRunning ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting Codex...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Codex
                  </div>
                )}
              </button>
              
              <button 
                onClick={handleKillCodex}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Kill Codex
                </div>
              </button>
            </div>
          </div>

          {codexOutput && (
            <div className="codex-output">
              <h3>Codex Status:</h3>
              <pre>{codexOutput}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Status Output */}
      {codexOutput && (
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Status Log
            </h3>
            <pre className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-sm text-gray-200 font-mono overflow-x-auto whitespace-pre-wrap">{codexOutput}</pre>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
